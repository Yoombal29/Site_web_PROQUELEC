const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { pool } = require('../db');
const { authenticateToken, requirePermission } = require('../middleware/auth');

router.get('/projects', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM public.projects ORDER BY updated_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error('[PROJECTS] List Error:', err);
        res.status(500).json({ error: 'Failed to list projects' });
    }
});

router.post('/projects', authenticateToken, requirePermission('projects.create'), async (req, res) => {
    try {
        const { title, client_info, location, status } = req.body;
        const ref = `PQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const result = await pool.query(
            `INSERT INTO public.projects (title, reference, client_info, location, status, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [title, ref, client_info || {}, location || {}, status || 'etude', req.user.id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('[PROJECTS] Create Error:', err);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

router.get('/projects/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM public.projects WHERE id=$1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ error: 'Project not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('[PROJECTS] Get Error:', err);
        res.status(500).json({ error: 'Failed to get project' });
    }
});

router.get('/projects/:id/documents', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT * FROM public.media_files WHERE project_id=$1 ORDER BY uploaded_at DESC`,
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('[PROJECTS] Get Docs Error:', err);
        res.status(500).json({ error: 'Failed to get project documents' });
    }
});

router.put('/projects/:id', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        const { title, status, compliance_score, location, technical_info, regulatory_status } = req.body;
        const userId = req.user.id;

        const oldRes = await client.query('SELECT * FROM public.projects WHERE id=$1', [id]);
        if (oldRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Project not found' });
        }
        const oldData = oldRes.rows[0];

        const result = await client.query(
            `UPDATE public.projects 
             SET title=COALESCE($1, title), status=COALESCE($2, status),
                 compliance_score=COALESCE($3, compliance_score),
                 location=COALESCE($4, location),
                 technical_info=COALESCE($5, technical_info),
                 regulatory_status=COALESCE($6, regulatory_status),
                 updated_at=NOW()
             WHERE id=$7 RETURNING *`,
            [title, status, compliance_score, location, technical_info, regulatory_status, id]
        );
        const newData = result.rows[0];

        const changes = {};
        if (JSON.stringify(oldData.technical_info) !== JSON.stringify(newData.technical_info)) {
            changes.technical_info = { from: oldData.technical_info, to: newData.technical_info };
        }
        if (oldData.status !== newData.status) changes.status = { from: oldData.status, to: newData.status };
        if (oldData.regulatory_status !== newData.regulatory_status) changes.regulatory_status = { from: oldData.regulatory_status, to: newData.regulatory_status };

        if (Object.keys(changes).length > 0) {
            const action = 'UPDATE_PROJECT';
            const timestamp = new Date().toISOString();
            const signaturePayload = `${id}:${action}:${timestamp}:${JSON.stringify(changes)}:${userId}`;
            const signatureHash = crypto.createHash('sha256').update(signaturePayload).digest('hex');

            await client.query(
                `INSERT INTO public.audit_logs (entity_type, entity_id, action, changes, performed_by, signature_hash)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                ['project', id, action, JSON.stringify(changes), userId, signatureHash]
            );
        }

        await client.query('COMMIT');
        res.json(newData);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[PROJECTS] Update Authority Error:', err);
        res.status(500).json({ error: 'Failed to update project with audit' });
    } finally {
        client.release();
    }
});

router.get('/projects/:id/audit', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT a.*, u.email as performed_by_email, u.role as performed_by_role
             FROM public.audit_logs a
             LEFT JOIN public.users u ON a.performed_by = u.id
             WHERE (a.entity_type='project' AND a.entity_id=$1)
             ORDER BY a.performed_at DESC`,
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('[PROJECTS] Get Audit Error:', err);
        res.status(500).json({ error: 'Failed to fetch audit trail' });
    }
});

router.post('/projects/:id/transition', authenticateToken, requirePermission('projects.transition'), async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;
        const { new_status, reason } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        const projectRes = await client.query('SELECT * FROM public.projects WHERE id=$1', [id]);
        if (projectRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Project not found' });
        }
        const project = projectRes.rows[0];
        const currentStatus = project.regulatory_status || 'draft';

        const STATE_MACHINE = {
            draft: { allowed_next: ['submitted'], required_roles: ['installer', 'admin'] },
            submitted: { allowed_next: ['under_review', 'draft'], required_roles: ['admin', 'authority'] },
            under_review: { allowed_next: ['validated', 'rejected'], required_roles: ['admin', 'authority'] },
            validated: { allowed_next: ['archived'], required_roles: ['admin'] },
            rejected: { allowed_next: ['draft'], required_roles: ['installer', 'admin'] },
            archived: { allowed_next: [], required_roles: [] }
        };

        const currentState = STATE_MACHINE[currentStatus];
        if (!currentState) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Invalid current state', current: currentStatus });
        }
        if (!currentState.allowed_next.includes(new_status)) {
            await client.query('ROLLBACK');
            return res.status(403).json({
                error: 'Transition not allowed', current: currentStatus,
                requested: new_status, allowed: currentState.allowed_next
            });
        }
        if (!currentState.required_roles.includes(userRole) && userRole !== 'admin') {
            await client.query('ROLLBACK');
            return res.status(403).json({
                error: 'Insufficient permissions for this transition',
                required_roles: currentState.required_roles, your_role: userRole
            });
        }

        const updateRes = await client.query(
            `UPDATE public.projects SET regulatory_status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
            [new_status, id]
        );
        const updatedProject = updateRes.rows[0];

        const action = 'STATE_TRANSITION';
        const timestamp = new Date().toISOString();
        const changes = {
            regulatory_status: { from: currentStatus, to: new_status },
            reason: reason || 'No reason provided'
        };
        const signaturePayload = `${id}:${action}:${timestamp}:${JSON.stringify(changes)}:${userId}`;
        const signatureHash = crypto.createHash('sha256').update(signaturePayload).digest('hex');

        await client.query(
            `INSERT INTO public.audit_logs (entity_type, entity_id, action, changes, performed_by, signature_hash)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            ['project', id, action, JSON.stringify(changes), userId, signatureHash]
        );

        await client.query('COMMIT');
        res.json({
            success: true, project: updatedProject,
            transition: { from: currentStatus, to: new_status },
            message: `Project transitioned from ${currentStatus} to ${new_status}`
        });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[STATE MACHINE] Transition Error:', err);
        res.status(500).json({ error: 'Failed to transition project state' });
    } finally {
        client.release();
    }
});

module.exports = router;
