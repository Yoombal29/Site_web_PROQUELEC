const pool = require('../../core/database');

async function listFiles() {
    const result = await pool.query('SELECT * FROM public.media_files ORDER BY uploaded_at DESC');
    return result.rows;
}

async function getFile(id) {
    const result = await pool.query('SELECT * FROM public.media_files WHERE id = $1', [id]);
    return result.rows[0] || null;
}

async function createFile({ originalname, filename, mimetype, size, projectId, category, uploadedBy, folderPath, status, fileType, altText, metadata }) {
    // Store category inside the JSONB `metadata` column to match current schema
    const meta = metadata || { category: category };
    const result = await pool.query(
        `INSERT INTO public.media_files 
         (file_name, file_path, file_type, file_size, mime_type, uploaded_at, uploaded_by, project_id, status, metadata) 
         VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8, $9::jsonb) RETURNING *`,
        [originalname, filename, fileType || category || 'other', size, mimetype, uploadedBy, projectId, status || 'draft', JSON.stringify(meta)]
    );
    return result.rows[0];
}

async function deleteFile(id) {
    const result = await pool.query('DELETE FROM public.media_files WHERE id = $1 RETURNING *', [id]);
    return result.rows[0] || null;
}

async function updateFileName(id, newFilename, newName) {
    const result = await pool.query(
        'UPDATE public.media_files SET file_path = $1, file_name = $2 WHERE id = $3 RETURNING *',
        [newFilename, newName, id]
    );
    return result.rows[0] || null;
}

async function insertMediaFile({ file_name, file_path, file_type, file_size, mime_type, alt_text, uploaded_by, project_id, folder_path, status, metadata }) {
    const result = await pool.query(
        `INSERT INTO public.media_files 
         (file_name, file_path, file_type, file_size, mime_type, alt_text, updated_at, uploaded_by, project_id, folder_path, status, metadata) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7, $8, $9, $10, $11) RETURNING *`,
        [file_name, file_path, file_type, file_size, mime_type, alt_text, uploaded_by, project_id, folder_path || '/', status || 'draft', metadata || {}]
    );
    return result.rows[0];
}

async function deleteMediaFile(id) {
    await pool.query('DELETE FROM public.media_files WHERE id = $1', [id]);
}

module.exports = {
    listFiles, getFile, createFile, deleteFile, updateFileName,
    insertMediaFile, deleteMediaFile
};
