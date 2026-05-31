const { Router } = require('express');
const controller = require('./auth.controller');
const { authenticateToken, requireAdmin, validate } = require('../../core/middleware');
const { loginSchema, registerSchema } = require('./auth.validator');

const router = Router();

router.post('/auth/login', validate(loginSchema), controller.login);
router.post('/auth/register', validate(registerSchema), controller.register);
router.get('/auth/me', authenticateToken, controller.me);

router.get('/user/permissions', authenticateToken, controller.getUserPermissions);
router.get('/admin/permissions', authenticateToken, requireAdmin, controller.getAllPermissions);
router.get('/admin/role-permissions', authenticateToken, requireAdmin, controller.getRolePermissions);

module.exports = { router, basePath: '/api' };
