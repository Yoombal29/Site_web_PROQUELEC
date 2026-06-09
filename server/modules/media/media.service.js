const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { pool } = require('../../core/database');
const { AppError } = require('../../core/errors');
const { sendSseEvent } = require('../../core/sse');

// ──────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────

const UPLOAD_BASE = path.resolve(__dirname, '..', '..', '..', 'public', 'uploads');

const ALLOWED_MIME_TYPES = {
  image: [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'image/svg+xml', 'image/bmp', 'image/tiff', 'image/avif',
  ],
  video: [
    'video/mp4', 'video/mpeg', 'video/ogg', 'video/webm',
    'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
  ],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv', 'text/html',
    'application/json', 'application/xml',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/zip', 'application/x-rar-compressed',
  ],
};

const CATEGORY_MAP = Object.entries(ALLOWED_MIME_TYPES).reduce(
  (acc, [cat, mimes]) => {
    for (const mime of mimes) acc[mime] = cat;
    return acc;
  },
  {},
);

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB
const THUMB_MAX_WIDTH = 300;
const THUMB_QUALITY = 80;

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function detectCategory(mimeType) {
  return CATEGORY_MAP[mimeType] || 'document';
}

function isValidMime(mimeType, category) {
  const allowed = ALLOWED_MIME_TYPES[category];
  if (!allowed) return false;
  return allowed.includes(mimeType);
}

/**
 * Build the date-based subdirectory path relative to UPLOAD_BASE.
 * Example: images/2026/06
 */
function dateSubPath(category) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return path.join(category, String(year), month);
}

/**
 * Generate a safe unique filename while preserving the original extension.
 */
function generateFileName(originalName) {
  const ext = path.extname(originalName) || '';
  const safeBase = path
    .basename(originalName, ext)
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .slice(0, 80);
  const hash = crypto.randomBytes(4).toString('hex');
  const ts = Date.now();
  return `${ts}-${hash}-${safeBase}${ext}`;
}

/**
 * Try to load sharp for thumbnail generation. Gracefully fall back if missing.
 */
let sharp;
try {
  sharp = require('sharp');
} catch {
  sharp = null;
}

/**
 * Generate a thumbnail for an image file.
 * Returns the relative path from UPLOAD_BASE or null on failure / unsupported format.
 */
async function generateThumbnail(filePath, category) {
  if (!sharp || category !== 'image') return null;
  try {
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const base = path.basename(filePath, ext);
    const thumbDir = path.join(dir, '_thumbnails');
    if (!fs.existsSync(thumbDir)) {
      fs.mkdirSync(thumbDir, { recursive: true });
    }
    const thumbName = `${base}_thumb.webp`;
    const thumbPath = path.join(thumbDir, thumbName);

    await sharp(filePath)
      .resize({ width: THUMB_MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: THUMB_QUALITY })
      .toFile(thumbPath);

    // Return relative path from upload base (without leading slash)
    const rel = path.relative(UPLOAD_BASE, thumbPath);
    return rel.split(path.sep).join('/');
  } catch (err) {
    console.warn('[MEDIA] Thumbnail generation skipped:', err.message);
    return null;
  }
}

/**
 * Ensure a directory exists (recursive).
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// ──────────────────────────────────────────────
// Core service functions
// ──────────────────────────────────────────────

/**
 * Upload a file to public/uploads/{category}/YYYY/MM/{file}
 * and persist metadata in the database.
 *
 * @param {Object}  file       - multer file object
 * @param {string}  category   - one of: image, video, document
 * @param {number}  userId     - uploader user ID
 * @param {Object}  [options]
 * @param {string}  [options.projectId]
 * @param {string}  [options.altText]
 * @param {string}  [options.status='published']
 * @returns {Promise<Object>}  saved file row
 */
async function uploadFile(file, category, userId, options = {}) {
  // 1. Detect / validate category
  const cat = category || detectCategory(file.mimetype);
  if (!['image', 'video', 'document'].includes(cat)) {
    throw new AppError('VALIDATION_ERROR', 'Catégorie invalide. Utilisez image, video ou document.');
  }

  // 2. Validate MIME type against the declared category
  if (!isValidMime(file.mimetype, cat)) {
    throw new AppError(
      'VALIDATION_ERROR',
      `Le type de fichier "${file.mimetype}" n'est pas autorisé dans la catégorie "${cat}".`,
    );
  }

  // 3. Build target directory
  const subDir = dateSubPath(cat);
  const targetDir = path.join(UPLOAD_BASE, subDir);
  ensureDir(targetDir);

  // 4. Generate unique filename and move file
  const safeName = generateFileName(file.originalname);
  const targetPath = path.join(targetDir, safeName);

  // If multer already saved the file somewhere, move it; otherwise write buffer
  if (file.path) {
    await fs.promises.rename(file.path, targetPath);
  } else if (file.buffer) {
    await fs.promises.writeFile(targetPath, file.buffer);
  } else {
    throw new AppError('FATAL_STRIKE', 'Aucune donnée fichier disponible');
  }

  // 5. Generate thumbnail for images
  const thumbnailRel = await generateThumbnail(targetPath, cat);
  const thumbnailUrl = thumbnailRel ? `/uploads/${thumbnailRel}` : null;

  // 6. Relative web path (used as file_path in DB)
  const webPath = `uploads/${subDir}/${safeName}`.split(path.sep).join('/');

  // 7. Persist to database
  const meta = {
    category: cat,
    originalName: file.originalname,
    thumbnail: thumbnailRel,
    ...(options.projectId ? { projectId: options.projectId } : {}),
    ...(options.altText ? { altText: options.altText } : {}),
  };

  const result = await pool.query(
    `INSERT INTO public.media_files
       (file_name, file_path, file_type, file_size, mime_type, uploaded_by, status, metadata, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, true)
     RETURNING *`,
    [
      file.originalname,
      webPath,
      cat,
      file.size,
      file.mimetype,
      userId,
      options.status || 'published',
      JSON.stringify(meta),
    ],
  );

  const saved = result.rows[0];

  // 8. Broadcast event
  try {
    sendSseEvent('media:uploaded', saved);
  } catch (_) {
    // SSE broadcast is best-effort
  }

  return saved;
}

/**
 * List media files with pagination, search, and type filter.
 *
 * @param {Object} opts
 * @param {number} [opts.page=1]
 * @param {number} [opts.limit=20]
 * @param {string} [opts.search]       - search in file_name
 * @param {string} [opts.type]         - filter by file_type (image|video|document)
 * @param {string} [opts.sortBy='uploaded_at']
 * @param {string} [opts.sortOrder='DESC']
 * @returns {Promise<{rows:Array, total:number, page:number, limit:number, totalPages:number}>}
 */
async function listFiles(opts = {}) {
  const page = Math.max(1, parseInt(opts.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(opts.limit, 10) || 20));
  const offset = (page - 1) * limit;
  const sortBy = ['file_name', 'file_size', 'mime_type', 'uploaded_at', 'file_type'].includes(opts.sortBy)
    ? opts.sortBy
    : 'uploaded_at';
  const sortOrder = opts.sortOrder === 'ASC' ? 'ASC' : 'DESC';

  const conditions = ['is_deleted = false OR is_deleted IS NULL'];
  const params = [];
  let paramIdx = 1;

  // Search filter
  if (opts.search) {
    conditions.push(`file_name ILIKE $${paramIdx++}`);
    params.push(`%${opts.search}%`);
  }

  // Type filter
  if (opts.type && ['image', 'video', 'document'].includes(opts.type)) {
    conditions.push(`file_type = $${paramIdx++}`);
    params.push(opts.type);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM public.media_files ${whereClause}`,
    params,
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const dataResult = await pool.query(
    `SELECT * FROM public.media_files ${whereClause}
     ORDER BY ${sortBy} ${sortOrder}
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    [...params, limit, offset],
  );

  return {
    rows: dataResult.rows,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Get a single file by its ID.
 */
async function getFileById(id) {
  const result = await pool.query(
    `SELECT * FROM public.media_files WHERE id = $1 AND (is_deleted = false OR is_deleted IS NULL)`,
    [id],
  );
  const file = result.rows[0];
  if (!file) {
    throw new AppError('DB_NOT_FOUND', `Fichier ${id} introuvable.`);
  }
  return file;
}

/**
 * Delete a media file.
 *
 * @param {string}  id        - file UUID
 * @param {boolean} [hard=false] - if true, physically delete file + DB row
 * @returns {Promise<Object>} deleted file row
 */
async function deleteFile(id, hard = false) {
  const file = await getFileById(id);

  // Physical file path
  const relPath = file.file_path.replace(/^uploads\//, '');
  const filePath = path.join(UPLOAD_BASE, relPath);

  // Helper to remove a file silently
  const removeFile = (fp) => {
    try {
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    } catch (_) {
      // best-effort
    }
  };

  // Remove thumbnail if it exists
  if (file.metadata && file.metadata.thumbnail) {
    const thumbPath = path.join(UPLOAD_BASE, file.metadata.thumbnail);
    removeFile(thumbPath);
  }

  if (hard) {
    // Physical deletion: remove file + DB row
    removeFile(filePath);

    await pool.query('DELETE FROM public.media_files WHERE id = $1', [id]);
  } else {
    // Logical deletion: mark as deleted
    removeFile(filePath);

    await pool.query(
      `UPDATE public.media_files
       SET is_deleted = true, is_active = false, updated_at = NOW()
       WHERE id = $1`,
      [id],
    );
  }

  try {
    sendSseEvent('media:deleted', { id, file_name: file.file_name, hard });
  } catch (_) {
    // best-effort
  }

  return { ...file, is_deleted: true };
}

/**
 * Build a public URL / path object for a given file DB row.
 */
function buildFileResponse(file) {
  return {
    id: file.id,
    fileName: file.file_name,
    filePath: file.file_path,
    fileType: file.file_type,
    fileSize: file.file_size,
    mimeType: file.mime_type,
    altText: file.alt_text,
    uploadedAt: file.uploaded_at,
    uploadedBy: file.uploaded_by,
    status: file.status,
    metadata: file.metadata,
    isActive: file.is_active,
    url: `/${file.file_path}`,
    thumbnailUrl:
      file.metadata && file.metadata.thumbnail
        ? `/uploads/${file.metadata.thumbnail}`
        : null,
  };
}

module.exports = {
  uploadFile,
  listFiles,
  getFileById,
  deleteFile,
  buildFileResponse,
  UPLOAD_BASE,
  ALLOWED_MIME_TYPES,
  detectCategory,
  isValidMime,
  dateSubPath,
  generateFileName,
};
