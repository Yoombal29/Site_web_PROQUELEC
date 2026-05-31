const service = require('./auth.service');

async function login(req, res) {
    try {
        const { email, password } = req.body;
        const result = await service.login(email, password);
        res.json(result);
    } catch (err) {
        console.error('[AUTH] Login error:', err.message);
        res.status(err.status || 500).json({ error: err.message });
    }
}

async function register(req, res) {
    try {
        const result = await service.register(req.body);
        res.status(201).json(result);
    } catch (err) {
        console.error('[AUTH] Registration error:', err.message);
        res.status(err.status || 500).json({ error: err.message });
    }
}

async function me(req, res) {
    try {
        console.log(`[AUTH-ME] Fetching user profile for ID: ${req.user.id}`);
        const user = await service.getProfile(req.user.id);
        res.json(user);
    } catch (err) {
        console.error('[AUTH-ME] Error:', err);
        res.status(err.status || 500).json({ error: err.message });
    }
}

async function getUserPermissions(req, res) {
    try {
        const result = await service.getPermissions(req.user.id, req.user.role);
        res.json(result);
    } catch (err) {
        console.error('[RBAC] Erreur récupération permissions:', err);
        res.status(500).json({ error: 'Impossible de récupérer les permissions' });
    }
}

async function getAllPermissions(req, res) {
    try {
        const permissions = await service.getAllPermissions();
        res.json(permissions);
    } catch (err) {
        console.error('[ADMIN] Erreur récupération permissions:', err);
        res.status(500).json({ error: 'Impossible de récupérer les permissions' });
    }
}

async function getRolePermissions(req, res) {
    try {
        const rolePerms = await service.getRolePermissions();
        res.json(rolePerms);
    } catch (err) {
        console.error('[ADMIN] Erreur récupération mapping rôles:', err);
        res.status(500).json({ error: 'Impossible de récupérer le mapping des rôles' });
    }
}

module.exports = { login, register, me, getUserPermissions, getAllPermissions, getRolePermissions };
