const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

router.get('/checklists', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM public.checklists WHERE is_active=true');
        res.json(result.rows);
    } catch (err) {
        console.error('[INSPECTION] List Checklists Error:', err);
        res.status(500).json({ error: 'Failed to list checklists' });
    }
});

router.get('/checklists/:id/items', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM public.checklist_items WHERE checklist_id=$1 ORDER BY order_index ASC', [id]);
        res.json(result.rows);
    } catch (err) {
        console.error('[INSPECTION] Get Items Error:', err);
        res.status(500).json({ error: 'Failed to get checklist items' });
    }
});

router.get('/projects/:id/inspections', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT i.*, u.email as inspector_name, c.title as checklist_title 
             FROM public.inspections i
             LEFT JOIN public.users u ON i.inspector_id = u.id
             LEFT JOIN public.checklists c ON i.checklist_id = c.id
             WHERE i.project_id=$1 ORDER BY i.created_at DESC`,
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('[INSPECTION] List Error:', err);
        res.status(500).json({ error: 'Failed to list inspections' });
    }
});

router.post('/inspections', authenticateToken, async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { project_id, checklist_id, location_gps, results } = req.body;
        const validChecklistId = (checklist_id === 'suggested' || checklist_id === 'default') ? null : checklist_id;

        const inspRes = await client.query(
            `INSERT INTO public.inspections (project_id, checklist_id, inspector_id, status, location_gps) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [project_id, validChecklistId, req.user.id, results ? 'submitted' : 'draft', location_gps || {}]
        );
        const inspectionId = inspRes.rows[0].id;

        if (results && Array.isArray(results)) {
            let compliantCount = 0;
            if (checklist_id === 'suggested') {
                const checklistData = {
                    type: 'suggested',
                    items: results.map(r => ({
                        id: r.item_id, value: r.value,
                        is_compliant: r.is_compliant, comment: r.comment || ''
                    }))
                };
                await client.query(
                    `UPDATE public.inspections SET checklist = $1 WHERE id = $2`,
                    [JSON.stringify(checklistData), inspectionId]
                );
                compliantCount = results.filter(r => r.is_compliant).length;
            } else {
                for (const r of results) {
                    if (r.is_compliant) compliantCount++;
                    await client.query(
                        `INSERT INTO public.inspection_results (inspection_id, checklist_item_id, value, is_compliant, inspector_comment)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [inspectionId, r.item_id, r.value, r.is_compliant, r.comment]
                    );
                }
            }
            if (results.length > 0) {
                const score = Math.round((compliantCount / results.length) * 100);
                await client.query(`UPDATE public.inspections SET overall_score=$1 WHERE id=$2`, [score, inspectionId]);

                if (checklist_id !== 'suggested') {
                    const breakdownRes = await client.query(
                        `SELECT ci.section, COUNT(*) as total_checks,
                                ROUND(AVG(CASE WHEN r.is_compliant THEN 100 ELSE 0 END), 0) as score
                         FROM public.inspections i
                         JOIN public.inspection_results r ON i.id = r.inspection_id
                         JOIN public.checklist_items ci ON r.checklist_item_id = ci.id
                         WHERE i.project_id = $1 GROUP BY ci.section`,
                        [project_id]
                    );
                    const breakdown = breakdownRes.rows.map(row => ({
                        domain: row.section || 'Général', score: Number(row.score), weight: 1
                    }));
                    const avgRes = await client.query(
                        `SELECT AVG(overall_score) as avg_score FROM public.inspections WHERE project_id=$1`,
                        [project_id]
                    );
                    const newProjectScore = Math.round(Number(avgRes.rows[0].avg_score) || score);
                    const complianceDetails = {
                        overall_score: newProjectScore, breakdown: breakdown,
                        last_evaluated_at: new Date().toISOString(),
                        ai_model_version: "NS-01-001-v3.2"
                    };
                    await client.query(
                        `UPDATE public.projects SET compliance_score=$1, compliance_details=$2 WHERE id=$3`,
                        [newProjectScore, JSON.stringify(complianceDetails), project_id]
                    );
                }
            }
        }

        await client.query('COMMIT');
        res.status(201).json(inspRes.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[INSPECTION] Create Error:', err);
        res.status(500).json({ error: 'Failed to create inspection' });
    } finally {
        client.release();
    }
});

router.get('/inspections/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const inspectionRes = await pool.query(
            `SELECT i.*, u.email as inspector_name, c.title as checklist_title
             FROM public.inspections i
             LEFT JOIN public.users u ON i.inspector_id = u.id
             LEFT JOIN public.checklists c ON i.checklist_id = c.id
             WHERE i.id=$1`,
            [id]
        );
        if (inspectionRes.rows.length === 0) {
            return res.status(404).json({ error: 'Inspection not found' });
        }
        const inspection = inspectionRes.rows[0];
        if (inspection.checklist && inspection.checklist.items) {
            inspection.results = inspection.checklist.items.map(item => ({
                id: item.id, is_compliant: item.is_compliant,
                inspector_comment: item.comment,
                checkpoint_label: item.id || item.label || item.question,
                checkpoint_category: inspection.checklist.type || 'Suggéré',
                checkpoint_description: ''
            }));
        } else {
            const resultsRes = await pool.query(
                `SELECT r.*, ci.section as checkpoint_category,
                        ci.question as checkpoint_label, ci.description as checkpoint_description,
                        ci.criticality_weight as checkpoint_weight
                 FROM public.inspection_results r
                 JOIN public.checklist_items ci ON r.checklist_item_id = ci.id
                 WHERE r.inspection_id=$1 ORDER BY ci.order_index ASC`,
                [id]
            );
            inspection.results = resultsRes.rows;
        }
        res.json(inspection);
    } catch (err) {
        console.error('[INSPECTION] Get Detail Error:', err);
        res.status(500).json({ error: 'Failed to fetch inspection details', details: err.message });
    }
});

router.delete('/inspections/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM public.inspection_results WHERE inspection_id = $1', [id]);
        await pool.query('DELETE FROM public.inspections WHERE id = $1', [id]);
        res.json({ message: 'Diagnostic supprimé avec succès' });
    } catch (err) {
        console.error('[INSPECTION] Delete Error:', err);
        res.status(500).json({ error: 'Échec de la suppression du diagnostic' });
    }
});

router.delete('/audit-logs/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM public.audit_logs WHERE id = $1', [id]);
        res.json({ message: 'Entrée journal supprimée' });
    } catch (err) {
        console.error('[AUDIT] Delete Error:', err);
        res.status(500).json({ error: 'Échec de la suppression du log' });
    }
});

router.post('/inspections/:id/results', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { results } = req.body;
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const r of results) {
                await client.query(
                    `INSERT INTO public.inspection_results (inspection_id, checklist_item_id, value, is_compliant, inspector_comment)
                     VALUES ($1, $2, $3, $4, $5)
                     ON CONFLICT (inspection_id, checklist_item_id) DO UPDATE SET
                        value = EXCLUDED.value, is_compliant = EXCLUDED.is_compliant,
                        inspector_comment = EXCLUDED.inspector_comment`,
                    [id, r.item_id, r.value, r.is_compliant, r.comment]
                );
            }
            await client.query('COMMIT');
            res.json({ success: true });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('[INSPECTION] Save Results Error:', err);
        res.status(500).json({ error: 'Failed to save results' });
    }
});

module.exports = router;
