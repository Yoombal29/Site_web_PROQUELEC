const path = require('path');
const fs = require('fs');
const { authenticateToken, requireAdmin } = require('../../core/middleware');
const { sendSseEvent } = require('../../core/sse');

function mountStorageRoutes(app, pool) {
  app.post('/api/storage/upload', authenticateToken, async (req, res) => {
    console.log('[INDEX-UPLOAD] /api/storage/upload handler invoked');
    try {
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
      const file = req.file;
      const dbRes = await pool.query(
        `INSERT INTO public.media_files (file_name, file_path, file_type, file_size, mime_type, uploaded_at, uploaded_by, status, metadata)
         VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8) RETURNING *`,
        [file.originalname, file.path, file.mimetype.split('/')[0] || 'other', file.size, file.mimetype, req.user.id, 'active', JSON.stringify({})],
      );
      res.status(201).json(dbRes.rows[0]);
    } catch (err) {
      console.error('[STORAGE-ERROR] Upload failed:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/storage/files', authenticateToken, async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM public.media_files ORDER BY uploaded_at DESC');
      res.json(result.rows);
    } catch (err) {
      console.error('[STORAGE-ERROR] List files failed:', err);
      res.status(500).json({ error: 'Failed to list files' });
    }
  });

  app.delete('/api/storage/files/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('DELETE FROM public.media_files WHERE id=$1 RETURNING *', [id]);
      if (result.rowCount === 0) return res.status(404).json({ error: 'Fichier non trouvé' });
      const filePath = path.join(__dirname, '../../uploads', result.rows[0].file_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      res.json({ success: true, message: 'Fichier supprimé' });
    } catch (err) {
      console.error('[STORAGE-ERROR] Delete failed:', err);
      res.status(500).json({ error: 'Delete failed', details: err.message });
    }
  });

  app.put('/api/storage/files/:id/rename', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { newName } = req.body;
      if (!newName || typeof newName !== 'string' || !newName.trim()) return res.status(400).json({ error: 'newName invalide ou manquant' });
      console.log(`[STORAGE] Renaming file ${id} to ${newName}`);
      const file = await pool.query('SELECT * FROM public.media_files WHERE id = $1', [id]);
      if (file.rows.length === 0) return res.status(404).json({ error: 'Fichier non trouvé' });
      const oldPath = file.rows[0].file_path;
      const ext = path.extname(oldPath);
      const safeBaseName = newName.replace(/[^a-zA-Z0-9_-\s]/g, '').trim();
      const cleanBaseName = safeBaseName.replace(/\s+/g, '_');
      const newFilename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${cleanBaseName}${ext}`;
      const newPath = path.join(path.dirname(oldPath), newFilename);
      let renamed = false;
      let lastError = null;
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (fs.existsSync(path.join(uploadsDir, oldPath))) {
        try {
          fs.renameSync(path.join(uploadsDir, oldPath), path.join(uploadsDir, newPath));
          renamed = true;
        } catch (e) {
          lastError = e.message;
          const tempPath = path.join(uploadsDir, newFilename);
          if (fs.existsSync(path.join(uploadsDir, oldPath))) {
            try {
              fs.copyFileSync(path.join(uploadsDir, oldPath), tempPath);
              fs.unlinkSync(path.join(uploadsDir, oldPath));
              renamed = true;
            } catch (e2) { lastError = e2.message; }
          }
        }
      }
      const updateResult = await pool.query(
        'UPDATE public.media_files SET file_name = $1, file_path = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
        [cleanBaseName, renamed ? newPath : oldPath, id],
      );
      res.json({ ...updateResult.rows[0], fileRenamed: renamed, renameError: lastError });
    } catch (err) {
      console.error('[STORAGE-ERROR] Rename failed:', err);
      res.status(500).json({ error: err.message, details: err.message, code: err.code });
    }
  });

  // Note: The second app.delete('/api/storage/files/:id') near line 1478 is a DUPLICATE - skipping it
}

module.exports = { mountStorageRoutes };
