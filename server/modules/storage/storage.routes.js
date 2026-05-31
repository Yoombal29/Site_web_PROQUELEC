const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken, requireAdmin, validate } = require('../../core/middleware');
const { renameFileSchema, createMediaFileSchema } = require('./storage.validator');
const ctrl = require('./storage.controller');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});

const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

router.post('/storage/upload', authenticateToken, ctrl.uploadFile);
router.get('/storage/files', authenticateToken, ctrl.listFiles);
router.delete('/storage/files/:id', authenticateToken, requireAdmin, ctrl.deleteFile);
router.put('/storage/files/:id/rename', authenticateToken, validate(renameFileSchema), ctrl.renameFile);
router.delete('/storage/files/:id', authenticateToken, ctrl.deleteFileV2);

router.get('/media-files', authenticateToken, ctrl.listMediaFiles);
router.post('/media-files', authenticateToken, validate(createMediaFileSchema), ctrl.createMediaFile);
router.post('/upload', authenticateToken, upload.single('file'), ctrl.uploadBinary);
router.delete('/media-files/:id', authenticateToken, ctrl.deleteMediaFileEntry);

module.exports = { router, basePath: '/api' };
