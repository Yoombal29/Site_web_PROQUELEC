const pool = require('../../core/database');

let mediaColumnsCache = null;

async function getMediaColumns() {
    if (mediaColumnsCache) return mediaColumnsCache;
    const result = await pool.query(
        `SELECT column_name FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'media_files'`
    );
    mediaColumnsCache = new Set(result.rows.map((row) => row.column_name));
    return mediaColumnsCache;
}

async function listFiles() {
    const columns = await getMediaColumns();
    const where = columns.has('is_deleted') ? 'WHERE COALESCE(is_deleted, false) = false' : '';
    const result = await pool.query(`SELECT * FROM public.media_files ${where} ORDER BY uploaded_at DESC`);
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

async function updateMediaFile(id, updates) {
    const columns = await getMediaColumns();
    const sets = [];
    const params = [];

    const add = (column, value) => {
        if (!columns.has(column) || value === undefined) return;
        params.push(value);
        sets.push(`${column} = $${params.length}`);
    };

    add('file_name', updates.file_name);
    add('file_type', updates.file_type);
    add('alt_text', updates.alt_text);
    add('folder_path', updates.folder_path);
    add('status', updates.status);

    if (columns.has('metadata') && updates.metadata !== undefined) {
        params.push(JSON.stringify(updates.metadata || {}));
        sets.push(`metadata = COALESCE(metadata, '{}'::jsonb) || $${params.length}::jsonb`);
    }

    if (columns.has('updated_at')) {
        sets.push('updated_at = NOW()');
    }

    if (sets.length === 0) {
        return getFile(id);
    }

    params.push(id);
    const result = await pool.query(
        `UPDATE public.media_files SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
        params
    );
    return result.rows[0] || null;
}

async function replaceMediaFile(id, { originalname, filename, mimetype, size, fileType, metadata }) {
    const columns = await getMediaColumns();
    const sets = [];
    const params = [];

    const add = (column, value) => {
        if (!columns.has(column) || value === undefined) return;
        params.push(value);
        sets.push(`${column} = $${params.length}`);
    };

    add('file_name', originalname);
    add('file_path', filename);
    add('file_type', fileType);
    add('file_size', size);
    add('mime_type', mimetype);

    if (columns.has('metadata')) {
        params.push(JSON.stringify(metadata || {}));
        sets.push(`metadata = COALESCE(metadata, '{}'::jsonb) || $${params.length}::jsonb`);
    }

    if (columns.has('version')) {
        sets.push('version = COALESCE(version, 1) + 1');
    }
    if (columns.has('updated_at')) {
        sets.push('updated_at = NOW()');
    }

    params.push(id);
    const result = await pool.query(
        `UPDATE public.media_files SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`,
        params
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
    updateMediaFile, replaceMediaFile,
    insertMediaFile, deleteMediaFile
};
