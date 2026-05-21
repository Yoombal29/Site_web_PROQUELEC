const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// ============================================
// VERSION MANAGEMENT
// ============================================

/**
 * GET /api/versions/document/:documentId
 * Get version history for a document
 */
router.get('/document/:documentId', authenticateToken, async (req, res) => {
    const { documentId } = req.params;

    try {
        const result = await pool.query(`
      SELECT * FROM get_document_versions($1)
    `, [documentId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching versions:', error);
        res.status(500).json({ error: 'Failed to fetch versions' });
    }
});

/**
 * POST /api/versions/restore/:documentId/:versionId
 * Restore a previous version (creates a new version)
 */
router.post('/restore/:documentId/:versionId', authenticateToken, async (req, res) => {
    const { documentId, versionId } = req.params;
    const userId = req.user.id;

    try {
        // Get the version to restore
        const versionData = await pool.query(`
      SELECT * FROM media_files WHERE id = $1
    `, [versionId]);

        if (versionData.rows.length === 0) {
            return res.status(404).json({ error: 'Version not found' });
        }

        const oldVersion = versionData.rows[0];

        // Get current latest version number
        const latestVersion = await pool.query(`
      SELECT version FROM media_files 
      WHERE (id = $1 OR parent_version_id = $1) AND is_latest = true
      LIMIT 1
    `, [documentId]);

        const newVersionNumber = latestVersion.rows.length > 0
            ? await pool.query('SELECT increment_version($1) as version', [latestVersion.rows[0].version])
            : { rows: [{ version: '1.1' }] };

        // Create new version entry (copy of the old version)
        const result = await pool.query(`
      INSERT INTO media_files 
        (file_name, file_path, file_size, file_type, uploaded_by, version, parent_version_id, is_latest, version_comment, version_created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, $9)
      RETURNING *
    `, [
            oldVersion.file_name,
            oldVersion.file_path,
            oldVersion.file_size,
            oldVersion.file_type,
            oldVersion.uploaded_by,
            newVersionNumber.rows[0].version,
            documentId,
            `Restored from version ${oldVersion.version}`,
            userId
        ]);

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error restoring version:', error);
        res.status(500).json({ error: 'Failed to restore version' });
    }
});

module.exports = router;
