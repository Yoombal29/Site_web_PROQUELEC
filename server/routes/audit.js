const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Audit
 *   description: Traçabilité et historique des actions utilisateur
 */

/**
 * @swagger
 * /api/audit/document/{documentId}:
 *   get:
 *     summary: Récupère l'historique d'audit pour un document spécifique
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historique récupéré
 *       500:
 *         description: Erreur serveur
 */
// ============================================
// AUDIT LOGS
// ============================================

/**
 * GET /api/audit/document/:documentId
 * Get audit trail for a specific document
 */
router.get('/document/:documentId', authenticateToken, async (req, res) => {
    const { documentId } = req.params;

    try {
        const result = await pool.query(`
      SELECT * FROM get_document_audit_trail($1)
    `, [documentId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching audit trail:', error);
        res.status(500).json({ error: 'Failed to fetch audit trail' });
    }
});

/**
 * @swagger
 * /api/audit/recent:
 *   get:
 *     summary: Récupère les logs d'audit récents
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *     responses:
 *       200:
 *         description: Logs récupérés
 *       500:
 *         description: Erreur serveur
 */
/**
 * GET /api/audit/recent
 * Get recent audit logs (global or for current user)
 */
router.get('/recent', authenticateToken, async (req, res) => {
    const { limit = 100 } = req.query;
    const userId = req.user.id;

    try {
        const result = await pool.query(`
      SELECT 
        al.id,
        al.action,
        u.email as username,
        al.created_at,
        al.metadata,
        al.ip_address
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT $1
    `, [limit]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching recent audit logs:', error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

/**
 * @swagger
 * /api/audit/user/{userId}:
 *   get:
 *     summary: Récupère l'activité pour un utilisateur spécifique
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Activité récupérée
 *       500:
 *         description: Erreur serveur
 */
/**
 * GET /api/audit/user/:userId
 * Get activity for a specific user
 */
router.get('/user/:userId', authenticateToken, async (req, res) => {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    try {
        const result = await pool.query(`
      SELECT * FROM get_user_activity($1, $2)
    `, [userId, limit]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching user activity:', error);
        res.status(500).json({ error: 'Failed to fetch user activity' });
    }
});

/**
 * @swagger
 * /api/audit/log:
 *   post:
 *     summary: Enregistre manuellement un événement d'audit
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action, resourceType]
 *             properties:
 *               action:
 *                 type: string
 *               resourceType:
 *                 type: string
 *               resourceId:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Événement enregistré
 *       500:
 *         description: Erreur serveur
 */
/**
 * POST /api/audit/log
 * Manually log an audit event (for client-side actions)
 */
router.post('/log', authenticateToken, async (req, res) => {
    const { action, resourceType, resourceId, metadata } = req.body;
    const userId = req.user.id;
    const ipAddress = req.ip;
    const userAgent = req.get('user-agent');

    try {
        const result = await pool.query(`
      SELECT log_audit($1, $2, $3, $4, $5, $6, $7) as audit_id
    `, [userId, action, resourceType, resourceId, metadata ? JSON.stringify(metadata) : null, ipAddress, userAgent]);

        res.json({ auditId: result.rows[0].audit_id });
    } catch (error) {
        console.error('Error logging audit event:', error);
        res.status(500).json({ error: 'Failed to log audit event' });
    }
});

module.exports = router;
