const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../core/middleware');
const repository = require('./auth.repository');

async function login(email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
        throw Object.assign(new Error('Email et mot de passe requis'), { status: 400 });
    }

    const user = await repository.findByEmail(normalizedEmail);
    if (!user) {
        throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
        throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    }

    if (user.is_active === false) {
        throw Object.assign(new Error('Account disabled'), { status: 403 });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    return {
        access_token: token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            is_active: user.is_active
        }
    };
}

async function register({ email, password, full_name, phone, company, role }) {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
        throw Object.assign(new Error('Email et mot de passe requis'), { status: 400 });
    }
    if (password.length < 6) {
        throw Object.assign(new Error('Le mot de passe doit contenir au moins 6 caractères'), { status: 400 });
    }

    const existing = await repository.findByEmail(normalizedEmail);
    if (existing) {
        throw Object.assign(new Error('Un compte avec cet email existe déjà'), { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'membre';

    const user = await repository.create({
        email: normalizedEmail,
        passwordHash: hashedPassword,
        role: userRole,
        fullName: full_name,
        phone,
        company
    });

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    return {
        access_token: token,
        user: { id: user.id, email: user.email, role: user.role, is_active: user.is_active }
    };
}

async function getProfile(userId) {
    const user = await repository.findById(userId);
    if (!user) {
        throw Object.assign(new Error('User not found'), { status: 404 });
    }
    return user;
}

async function getPermissions(userId, userRole) {
    const permissions = await repository.getUserPermissions(userId, userRole);
    return { permissions, role: userRole, count: permissions.length };
}

async function getAllPermissions() {
    return repository.getAllPermissions();
}

async function getRolePermissions() {
    return repository.getRolePermissions();
}

module.exports = { login, register, getProfile, getPermissions, getAllPermissions, getRolePermissions };
