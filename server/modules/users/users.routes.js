const { Router } = require('express');
const controller = require('./users.controller');
const { authenticateToken, requireAdmin, validate } = require('../../core/middleware');
const { createUserSchema, updateUserSchema } = require('./users.validator');

const router = Router();

router.get('/users', authenticateToken, controller.listUsers);
router.get('/admin/users', authenticateToken, requireAdmin, controller.listAdminUsers);
router.post('/admin/users', authenticateToken, requireAdmin, validate(createUserSchema), controller.createUser);
router.put('/admin/users/:id', authenticateToken, requireAdmin, validate(updateUserSchema), controller.updateUser);
router.delete('/admin/users/:id', authenticateToken, requireAdmin, controller.deleteUser);
router.patch('/admin/users/:id/status', authenticateToken, requireAdmin, controller.toggleStatus);

module.exports = { router, basePath: '/api' };
