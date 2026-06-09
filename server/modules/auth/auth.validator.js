const z = require('zod');

const loginSchema = z.object({
    email: z.string().email('Email invalide').transform(e => e.trim().toLowerCase()),
    password: z.string().min(1, 'Mot de passe requis'),
});

const registerSchema = z.object({
    email: z.string().email('Email invalide').transform(e => e.trim().toLowerCase()),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    full_name: z.string().optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    role: z.enum(['electricien', 'entreprise', 'membre', 'partner']).optional(),
});

const ALLOWED_ROLES = ['electricien', 'entreprise', 'membre', 'partner'];

module.exports = { loginSchema, registerSchema, ALLOWED_ROLES };
