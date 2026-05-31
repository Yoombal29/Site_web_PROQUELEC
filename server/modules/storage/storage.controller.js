const path = require('path');
const fs = require('fs');
const multer = require('multer');
const pool = require('../../core/database');
const { sendSseEvent } = require('../../core/sse');
const repo = require('./storage.repository');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});

const upload = multer({ storage: diskStorage, limits: { fileSize: 500 * 1024 * 1024 } });

function uploadMiddleware(req, res, next) {
    upload.single('file')(req, res, next);
}

async function uploadFile(req, res) {
    console.log('[STORAGE-CTRL-UPLOAD] uploadFile invoked');
    upload.single('file')(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            console.error('[STORAGE] Multer Error:', err);
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'Fichier trop volumineux', message: "Le fichier dépasse la limite autorisée de 500 Mo." });
            }
            return res.status(400).json({ error: 'Upload Error', details: err.message });
        } else if (err) {
            console.error('[STORAGE] Unknown Error:', err);
            return res.status(500).json({ error: 'Server Error', details: err.message });
        }
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const projectId = req.body.project_id || null;
        const docCategory = req.body.category || 'general';

        try {
            const file = await repo.createFile({
                originalname: req.file.originalname,
                filename: req.file.filename,
                mimetype: req.file.mimetype,
                size: req.file.size,
                projectId,
                category: docCategory,
                uploadedBy: req.user.id
            });
            res.json({
                message: 'File uploaded successfully',
                id: file.id,
                file_path: `/uploads/${req.file.filename}`,
                filename: req.file.filename,
                original_name: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                project_id: projectId,
                category: docCategory
            });
            try { sendSseEvent('media:uploaded', file); } catch (e) { }
        } catch (dbErr) {
            console.error('[STORAGE] DB Insert Failed:', dbErr && dbErr.message ? dbErr.message : dbErr, dbErr && dbErr.stack ? dbErr.stack : 'no-stack');
            // Fallback: try a direct insert that aligns with current media_files schema
            try {
                const meta = { category: docCategory };
                const result = await pool.query(
                    `INSERT INTO public.media_files (file_name,file_path,file_type,file_size,mime_type,uploaded_at,uploaded_by,project_id,status,metadata)
                     VALUES ($1,$2,$3,$4,$5,NOW(),$6,$7,$8,$9::jsonb) RETURNING *`,
                    [req.file.originalname, req.file.filename, docCategory || 'other', req.file.size, req.file.mimetype, req.user && req.user.id ? req.user.id : null, projectId, 'draft', JSON.stringify(meta)]
                );
                res.json({
                    message: 'File uploaded (DB tracking fallback)',
                    id: result.rows[0].id,
                    file_path: `/uploads/${req.file.filename}`,
                    filename: req.file.filename,
                    original_name: req.file.originalname,
                    mimetype: req.file.mimetype,
                    size: req.file.size,
                    project_id: projectId,
                    metadata: result.rows[0].metadata || meta
                });
                try { sendSseEvent('media:uploaded', result.rows[0]); } catch (e) { }
                return;
            } catch (fallbackErr) {
                console.error('[STORAGE] Fallback DB Insert Failed:', fallbackErr);
                res.json({
                    message: 'File uploaded (DB tracking failed)',
                    file_path: `/uploads/${req.file.filename}`,
                    filename: req.file.filename,
                    original_name: req.file.originalname,
                    size: req.file.size,
                    error: "DB tracking failed",
                    debug: dbErr && dbErr.message ? dbErr.message : String(dbErr)
                });
            }
        }
    });
}

async function listFiles(req, res) {
    try {
        const files = await repo.listFiles();
        res.json(files);
    } catch (err) {
        console.error('[STORAGE-ERROR] List files failed:', err);
        res.status(500).json({ error: 'Failed to list files' });
    }
}

async function deleteFile(req, res) {
    try {
        const { id } = req.params;
        const file = await repo.getFile(id);
        if (!file) return res.status(404).json({ error: 'Fichier non trouvé' });

        const filePath = path.join(__dirname, '../../uploads', file.file_path);
        fs.unlink(filePath, (err) => {
            if (err) console.error('[STORAGE] Warning: Could not delete file logically:', filePath);
        });

        await repo.deleteFile(id);
        res.json({ message: 'Fichier supprimé', id });
    } catch (err) {
        console.error('[STORAGE] Delete DB Error:', err);
        res.status(500).json({ error: err.message });
    }
}

async function renameFile(req, res) {
    try {
        const { id } = req.params;
        const { newName } = req.body;

        if (!newName || typeof newName !== 'string' || !newName.trim()) {
            return res.status(400).json({ error: 'newName invalide ou manquant' });
        }

        console.log(`[STORAGE] Renaming file ${id} to ${newName}`);

        const file = await repo.getFile(id);
        if (!file) return res.status(404).json({ error: 'Fichier non trouvé' });
        if (!file.file_path || typeof file.file_path !== 'string') {
            return res.status(500).json({ error: 'Incohérence base de données : Nom de fichier manquant (file_path)' });
        }

        let oldPath = path.join(__dirname, '../../uploads', file.file_path);
        const ext = path.extname(file.file_path);
        const safeBaseName = path.basename(newName, path.extname(newName));
        const cleanBaseName = safeBaseName.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
        const newFilename = cleanBaseName + ext;
        const newPath = path.join(__dirname, '../../uploads', newFilename);

        console.log('[DEBUG-RENAME] OldPath:', oldPath);
        console.log('[DEBUG-RENAME] NewPath:', newPath);
        console.log('[DEBUG-RENAME] fs exists?', fs.existsSync(oldPath));

        if (oldPath === newPath) {
            console.log('[STORAGE] Rename skipping: Source and destination are the same.');
        } else if (fs.existsSync(oldPath)) {
            let renamed = false;
            let lastError = null;

            if (fs.existsSync(newPath)) {
                if (oldPath.toLowerCase() === newPath.toLowerCase()) {
                    const tempPath = oldPath + '.tmp-' + Date.now();
                    try {
                        fs.renameSync(oldPath, tempPath);
                        oldPath = tempPath;
                    } catch (e) {
                        throw new Error("Impossible de renommer (verrouillage temporaire)");
                    }
                } else {
                    throw new Error(`Le fichier destination existe déjà: ${newFilename}`);
                }
            }

            for (let i = 0; i < 5; i++) {
                try {
                    fs.renameSync(oldPath, newPath);
                    renamed = true;
                    break;
                } catch (err) {
                    lastError = err;
                    console.log(`[STORAGE] Rename attempt ${i + 1} failed (${err.code}), retrying...`);
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }
            if (!renamed) {
                try {
                    fs.copyFileSync(oldPath, newPath);
                    await new Promise(resolve => setTimeout(resolve, 100));
                    fs.unlinkSync(oldPath);
                    renamed = true;
                } catch (fallbackErr) {
                    console.error('[STORAGE] Fallback copy/delete failed:', fallbackErr);
                    throw lastError || fallbackErr;
                }
            }
        } else {
            console.warn(`[STORAGE] File not found on disk: ${oldPath}, updating DB only.`);
        }

        const updated = await repo.updateFileName(id, newFilename, newName);
        res.json(updated);
        try { sendSseEvent('media:renamed', updated); } catch (e) { console.warn('SSE broadcast failed (media:renamed)', e); }
    } catch (err) {
        console.error('[STORAGE-ERROR] Rename failed:', err);
        res.status(500).json({ error: 'Rename failed', details: err.message, code: err.code });
    }
}

async function deleteFileV2(req, res) {
    try {
        const { id } = req.params;
        const file = await repo.getFile(id);
        if (!file) return res.status(404).json({ error: 'Fichier non trouvé' });

        const filePath = path.join(__dirname, '../../uploads', file.file_path);
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
                console.log(`[STORAGE] Deleted file on disk: ${filePath}`);
            } catch (err) {
                console.error(`[STORAGE] Failed to delete file on disk: ${err.message}`);
            }
        } else {
            console.warn(`[STORAGE] File not found on disk for deletion: ${filePath}`);
        }

        await repo.deleteMediaFile(id);
        res.json({ success: true, message: 'Fichier supprimé' });
        try { sendSseEvent('media:deleted', { id, file_name: file.file_name }); } catch (e) { console.warn('SSE broadcast failed (media:deleted)', e); }
    } catch (err) {
        console.error('[STORAGE-ERROR] Delete failed:', err);
        res.status(500).json({ error: err.message });
    }
}

async function listMediaFiles(req, res) {
    try {
        const files = await repo.listFiles();
        res.json(files);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function createMediaFile(req, res) {
    const { file_name, file_path, file_type, file_size, mime_type, alt_text, project_id, folder_path, status, metadata } = req.body;
    try {
        const file = await repo.insertMediaFile({ file_name, file_path, file_type, file_size, mime_type, alt_text, uploaded_by: req.user.id, project_id, folder_path, status, metadata });
        res.json(file);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function uploadBinary(req, res) {
    try {
        if (!req.file) return res.status(400).json({ error: 'Aucun fichier fourni' });

        const filePath = req.file.filename;
        const publicUrl = `/uploads/${filePath}`;
        const { project_id, folder_path, status } = req.body || {};
        const category = req.body.category || 'other';

        const result = await pool.query(
            `INSERT INTO public.media_files (file_name, file_path, file_type, file_size, mime_type, uploaded_at, uploaded_by, project_id, folder_path, status, is_active) 
             VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8, $9, true) RETURNING *`,
            [req.file.originalname, filePath, category, req.file.size, req.file.mimetype, req.user.id, project_id, folder_path || '/', status || 'draft']
        );

        res.json({ success: true, file: result.rows[0], url: publicUrl, path: filePath });
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ error: err.message });
    }
}

async function deleteMediaFileEntry(req, res) {
    try {
        await repo.deleteMediaFile(req.params.id);
        res.json({ success: true, message: 'Fichier supprimé' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    uploadFile, listFiles, deleteFile, renameFile, deleteFileV2,
    uploadMiddleware, uploadBinary,
    listMediaFiles, createMediaFile, deleteMediaFileEntry
};
