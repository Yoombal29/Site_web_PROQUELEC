const z = require('zod');

const createUserSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Mot de passe trop court'),
    role: z.string().optional(),
    is_active: z.boolean().optional(),
});

const updateUserSchema = z.object({
    email: z.string().email('Email invalide').optional(),
    password: z.string().min(6, 'Mot de passe trop court').optional(),
    role: z.string().optional(),
    is_active: z.boolean().optional(),
});

module.exports = { createUserSchema, updateUserSchema };
