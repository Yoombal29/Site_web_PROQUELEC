const bcrypt = require('bcrypt');
const repository = require('./users.repository');

async function listAll() {
    return repository.findAll();
}

async function listAllAdmin() {
    return repository.findAllAdmin();
}

async function createUser({ email, password, role, is_active }) {
    if (!email || !password) {
        throw Object.assign(new Error('Email and password required'), { status: 400 });
    }
    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await repository.findByEmail(normalizedEmail);
    if (existing) {
        throw Object.assign(new Error('User already exists'), { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    return repository.create({ email: normalizedEmail, passwordHash, role, isActive: is_active });
}

async function updateUser(id, fields) {
    const updates = {};
    if (fields.email) updates.email = fields.email;
    if (fields.role) updates.role = fields.role;
    if (fields.password) {
        updates.passwordHash = await bcrypt.hash(fields.password, 10);
    }
    if (typeof fields.is_active !== 'undefined') updates.is_active = fields.is_active;
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
    return repository.updateStatus(id, isActive);
}

module.exports = { listAll, listAllAdmin, createUser, updateUser, deleteUser, toggleStatus };
