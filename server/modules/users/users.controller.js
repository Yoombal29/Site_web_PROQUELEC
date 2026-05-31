const service = require('./users.service');

async function listUsers(req, res) {
    try {
        const users = await service.listAll();
        res.json(users);
    } catch (err) {
        console.error('[API-USERS] Error:', err);
        res.status(500).json({ error: err.message });
    }
}

async function listAdminUsers(req, res) {
    try {
        const users = await service.listAllAdmin();
        res.json(users);
    } catch (err) {
        console.error('[API-ADMIN-USERS] Error:', err);
        res.status(500).json({ error: err.message });
    }
}

async function createUser(req, res) {
    try {
        const user = await service.createUser(req.body);
        res.status(201).json(user);
    } catch (err) {
        console.error('[API-ADMIN-USERS] Create error:', err);
        res.status(err.status || 500).json({ error: err.message });
    }
}

async function updateUser(req, res) {
    try {
        const user = await service.updateUser(req.params.id, req.body);
        res.json(user);
    } catch (err) {
        console.error('[API-ADMIN-USERS] Update error:', err);
        res.status(err.status || 500).json({ error: err.message });
    }
}

async function deleteUser(req, res) {
    try {
        await service.deleteUser(req.params.id);
        res.sendStatus(204);
    } catch (err) {
        console.error('[API-ADMIN-USERS] Delete error:', err);
        res.status(500).json({ error: err.message });
    }
}

async function toggleStatus(req, res) {
    try {
        const { is_active } = req.body;
        if (typeof is_active === 'undefined') {
            return res.status(400).json({ error: 'is_active required' });
        }
        const user = await service.toggleStatus(req.params.id, is_active);
        res.json(user);
    } catch (err) {
        console.error('[API-ADMIN-USERS] Status error:', err);
        res.status(500).json({ error: err.message });
    }
}

module.exports = { listUsers, listAdminUsers, createUser, updateUser, deleteUser, toggleStatus };
