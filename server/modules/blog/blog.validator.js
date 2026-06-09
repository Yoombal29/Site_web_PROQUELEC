const z = require('zod');

const createPostSchema = z.object({
    title: z.string().min(1, 'Titre requis'),
    content: z.string().optional().default(''),
    excerpt: z.string().optional(),
    slug: z.string().min(1, 'Slug requis'),
    cover_image_url: z.string().optional(),
    category_id: z.string().uuid().nullable().optional(),
    published_at: z.string().nullable().optional(),
});

const updatePostSchema = z.object({
    title: z.string().min(1),
    content: z.string(),
    excerpt: z.string().optional(),
    slug: z.string().min(1),
    cover_image_url: z.string().optional(),
    category_id: z.string().uuid().nullable().optional(),
    published_at: z.string().nullable().optional(),
});

const createCategorySchema = z.object({
    name: z.string().min(1, 'Nom requis'),
});

const updateCategorySchema = z.object({
    name: z.string().min(1, 'Nom requis'),
});

module.exports = {
    createPostSchema, updatePostSchema,
    createCategorySchema, updateCategorySchema
};
