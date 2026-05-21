const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// ============================================
// GROUP MANAGEMENT
// ============================================

/**
 * GET /api/permissions/groups
 * Get all user groups
 */
router.get('/groups', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT g.*, 
             COUNT(DISTINCT ugm.user_id) as member_count,
             u.email as created_by_name
      FROM user_groups g
      LEFT JOIN user_group_members ugm ON g.id = ugm.group_id
      LEFT JOIN users u ON g.created_by = u.id
      GROUP BY g.id, u.email
      ORDER BY g.name
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
});

/**
 * POST /api/permissions/groups
 * Create a new user group
 */
router.post('/groups', authenticateToken, async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user.id;

    if (!name) {
        return res.status(400).json({ error: 'Group name is required' });
    }

    try {
        const result = await pool.query(`
      INSERT INTO user_groups (name, description, created_by)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [name, description, userId]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({ error: 'Group name already exists' });
        }
        console.error('Error creating group:', error);
        res.status(500).json({ error: 'Failed to create group' });
    }
});

/**
 * POST /api/permissions/groups/:groupId/members
 * Add user to group
 */
router.post('/groups/:groupId/members', authenticateToken, async (req, res) => {
    const { groupId } = req.params;
    const { userId } = req.body;
    const addedBy = req.user.id;

    try {
        await pool.query(`
      INSERT INTO user_group_members (user_id, group_id, added_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, group_id) DO NOTHING
    `, [userId, groupId, addedBy]);

        res.status(201).json({ message: 'User added to group' });
    } catch (error) {
        console.error('Error adding user to group:', error);
        res.status(500).json({ error: 'Failed to add user to group' });
    }
});

/**
 * DELETE /api/permissions/groups/:groupId/members/:userId
 * Remove user from group
 */
router.delete('/groups/:groupId/members/:userId', authenticateToken, async (req, res) => {
    const { groupId, userId } = req.params;

    try {
        await pool.query(`
      DELETE FROM user_group_members
      WHERE user_id = $1 AND group_id = $2
    `, [userId, groupId]);

        res.json({ message: 'User removed from group' });
    } catch (error) {
        console.error('Error removing user from group:', error);
        res.status(500).json({ error: 'Failed to remove user from group' });
    }
});

// ============================================
// DOCUMENT PERMISSIONS
// ============================================

/**
 * GET /api/permissions/document/:documentId
 * Get all permissions for a document
 */
router.get('/document/:documentId', authenticateToken, async (req, res) => {
    const { documentId } = req.params;

    try {
        const result = await pool.query(`
      SELECT 
        dp.*,
        CASE 
          WHEN dp.permission_type = 'user' THEN u.email
          WHEN dp.permission_type = 'group' THEN g.name
        END as target_name
      FROM document_permissions dp
      LEFT JOIN users u ON dp.permission_type = 'user' AND dp.permission_target = u.id
      LEFT JOIN user_groups g ON dp.permission_type = 'group' AND dp.permission_target = g.id
      WHERE dp.document_id = $1
      ORDER BY dp.granted_at DESC
    `, [documentId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching document permissions:', error);
        res.status(500).json({ error: 'Failed to fetch permissions' });
    }
});

/**
 * POST /api/permissions/grant
 * Grant permission on a document
 */
router.post('/grant', authenticateToken, async (req, res) => {
    const { documentId, targetType, targetId, accessLevel } = req.body;
    const grantedBy = req.user.id;

    // Validate input
    if (!documentId || !targetType || !targetId || !accessLevel) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['user', 'group'].includes(targetType)) {
        return res.status(400).json({ error: 'Invalid target type' });
    }

    if (!['read', 'write', 'delete', 'admin'].includes(accessLevel)) {
        return res.status(400).json({ error: 'Invalid access level' });
    }

    try {
        const result = await pool.query(`
      INSERT INTO document_permissions 
        (document_id, permission_type, permission_target, access_level, granted_by)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (document_id, permission_type, permission_target) 
      DO UPDATE SET access_level = $4, granted_at = NOW()
      RETURNING *
    `, [documentId, targetType, targetId, accessLevel, grantedBy]);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error granting permission:', error);
        res.status(500).json({ error: 'Failed to grant permission' });
    }
});

/**
 * DELETE /api/permissions/revoke/:permissionId
 * Revoke a permission
 */
router.delete('/revoke/:permissionId', authenticateToken, async (req, res) => {
    const { permissionId } = req.params;

    try {
        await pool.query(`
      DELETE FROM document_permissions
      WHERE id = $1
    `, [permissionId]);

        res.json({ message: 'Permission revoked' });
    } catch (error) {
        console.error('Error revoking permission:', error);
        res.status(500).json({ error: 'Failed to revoke permission' });
    }
});

/**
 * GET /api/permissions/check/:documentId
 * Check if current user has specific permission on document
 */
router.get('/check/:documentId', authenticateToken, async (req, res) => {
    const { documentId } = req.params;
    const { level } = req.query; // read, write, delete, admin
    const userId = req.user.id;

    try {
        const result = await pool.query(`
      SELECT user_has_permission($1, $2, $3) as has_permission
    `, [userId, documentId, level || 'read']);

        res.json({ hasPermission: result.rows[0].has_permission });
    } catch (error) {
        console.error('Error checking permission:', error);
        res.status(500).json({ error: 'Failed to check permission' });
    }
});

module.exports = router;
