const z = require('zod');

const createPageSchema = z.object({
    title: z.string().min(1, 'Titre requis'),
    slug: z.string().min(1, 'Slug requis'),
    content: z.string().optional().default(''),
    is_published: z.boolean().optional(),
    meta_description: z.string().optional(),
    meta_keywords: z.string().optional(),
});

const updatePageSchema = z.object({
    title: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    content: z.string().optional(),
    is_published: z.boolean().optional(),
    meta_description: z.string().optional(),
    meta_keywords: z.string().optional(),
});

const adminUpdatePageSchema = z.object({
    content_raw: z.string().optional(),
    content: z.string().optional(),
    content_blocks: z.any().optional(),
    structure_json: z.any().optional(),
    design_options: z.any().optional(),
    security_level: z.string().optional(),
    immutable: z.boolean().optional(),
    title: z.string().optional(),
    slug: z.string().optional(),
    meta_description: z.string().optional(),
    meta_keywords: z.string().optional(),
    is_published: z.boolean().optional(),
    categories: z.any().optional(),
    tags: z.any().optional(),
    author: z.string().optional(),
    excerpt: z.string().optional(),
    meta_robots: z.string().optional(),
    featured_image: z.string().optional(),
    template: z.string().optional(),
    show_hero: z.boolean().optional(),
    show_footer: z.boolean().optional(),
    custom_css: z.string().optional(),
    custom_js: z.string().optional(),
    header_html: z.string().optional(),
    footer_html: z.string().optional(),
    hero_title: z.string().optional(),
    hero_subtitle: z.string().optional(),
    hero_background_image: z.string().optional(),
    hero_cta_text: z.string().optional(),
    hero_cta_link: z.string().optional(),
    workflow_status: z.string().optional(),
    publish_date: z.string().optional(),
    unpublish_date: z.string().optional(),
    reading_time: z.number().optional(),
});

const createMenuItemSchema = z.object({
    title: z.string().min(1, 'Titre requis'),
    url: z.string().min(1, 'URL requise'),
    menu_order: z.number().optional(),
    parent_id: z.string().uuid().nullable().optional(),
    is_active: z.boolean().optional(),
    menu_type: z.string().optional(),
    target: z.string().optional(),
    icon: z.string().optional(),
    label: z.string().optional(),
    linked_page_id: z.string().uuid().nullable().optional(),
});

const updateMenuItemSchema = createMenuItemSchema.partial();

const constructionModeSchema = z.object({
    is_enabled: z.boolean(),
});

module.exports = {
    createPageSchema, updatePageSchema, adminUpdatePageSchema,
    createMenuItemSchema, updateMenuItemSchema,
    constructionModeSchema
};
