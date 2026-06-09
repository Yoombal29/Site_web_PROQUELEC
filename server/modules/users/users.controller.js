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
        const activeInput = typeof req.body.is_active !== 'undefined'
            ? req.body.is_active
            : req.body.status;
        if (typeof activeInput === 'undefined') {
            return res.status(400).json({ error: 'is_active required' });
        }
        const user = await service.toggleStatus(req.params.id, activeInput);
        res.json(user);
    } catch (err) {
        console.error('[API-ADMIN-USERS] Status error:', err);
        res.status(500).json({ error: err.message });
    }
}

async function getUserPermissions(req, res) {
    try {
        const permissions = await service.getUserPermissions(req.params.id);
        res.json(permissions);
    } catch (err) {
        console.error('[API-ADMIN-USERS] Permissions error:', err);
        res.status(err.status || 500).json({ error: err.message });
    }
}

async function setUserPermissions(req, res) {
    try {
        const result = await service.setUserPermissions(
            req.params.id,
            req.body.permissions,
            req.user.id
        );
        res.json(result);
    } catch (err) {
        console.error('[API-ADMIN-USERS] Permissions save error:', err);
        res.status(err.status || 500).json({ error: err.message });
    }
}

module.exports = {
    listUsers,
    listAdminUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleStatus,
    getUserPermissions,
    setUserPermissions,
};
