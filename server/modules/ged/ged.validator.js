const z = require('zod');

const createDocumentSchema = z.object({
    title: z.string().min(1, 'Titre requis'),
    description: z.string().optional(),
    file_url: z.string().optional(),
});

const transitionSchema = z.object({
    to_state: z.string().min(1, 'État requis'),
    comment: z.string().optional(),
});

module.exports = { createDocumentSchema, transitionSchema };
