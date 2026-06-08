const bcrypt = require('bcrypt');
const repository = require('./users.repository');

function parseUserActive(value, fallback = true) {
    if (typeof value === 'undefined') return fallback;
    if (value === 'active') return true;
    if (value === 'inactive') return false;
    if (typeof value === 'string') return value.toLowerCase() === 'true' || value === '1';
    return value === true || value === 1;
}

async function listAll() {
    return repository.findAll();
}

async function listAllAdmin() {
    return repository.findAllAdmin();
}

async function createUser({ email, password, role, is_active, status }) {
    if (!email || !password) {
        throw Object.assign(new Error('Email and password required'), { status: 400 });
    }
    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await repository.findByEmail(normalizedEmail);
    if (existing) {
        throw Object.assign(new Error('User already exists'), { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    return repository.create({
        email: normalizedEmail,
        passwordHash,
        role,
        isActive: parseUserActive(typeof is_active !== 'undefined' ? is_active : status),
    });
}

async function updateUser(id, fields) {
    const updates = {};
    if (fields.email) updates.email = fields.email;
    if (fields.role) updates.role = fields.role;
    if (fields.password) {
        updates.passwordHash = await bcrypt.hash(fields.password, 10);
    }
    const activeInput = typeof fields.is_active !== 'undefined' ? fields.is_active : fields.status;
    if (typeof activeInput !== 'undefined') updates.is_active = parseUserActive(activeInput);
    updates.id = id;

    const result = await repository.update(id, updates);
    if (!result) {
        throw Object.assign(new Error('No updates provided'), { status: 400 });
    }
    return result;
}

async function deleteUser(id) {
    await repository.remove(id);
}

async function toggleStatus(id, isActive) {
    return repository.updateStatus(id, parseUserActive(isActive));
}

async function getUserPermissions(id) {
    const permissions = await repository.getDirectPermissions(id);
    if (!permissions) {
        throw Object.assign(new Error('Utilisateur non trouvé'), { status: 404 });
    }
    return permissions;
}

async function setUserPermissions(id, permissions, grantedBy) {
    if (!Array.isArray(permissions)) {
        throw Object.assign(new Error('permissions doit être un tableau'), { status: 400 });
    }

    const result = await repository.setDirectPermissions(id, permissions, grantedBy);
    if (!result) {
        throw Object.assign(new Error('Utilisateur non trouvé'), { status: 404 });
    }
    return result;
}

module.exports = {
    listAll,
    listAllAdmin,
    createUser,
    updateUser,
    deleteUser,
    toggleStatus,
    getUserPermissions,
    setUserPermissions,
};
