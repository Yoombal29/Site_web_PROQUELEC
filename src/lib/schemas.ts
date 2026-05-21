import { z } from 'zod';

// Schéma pour une page du CMS
export const pageSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(3, "Le titre doit faire au moins 3 caractères").max(100),
    slug: z.string().min(1, "Le slug est requis").regex(/^[a-z0-9-]+$/, "Le slug ne doit contenir que des lettres minuscules, chiffres et tirets"),
    content: z.string().optional().default(''),
    excerpt: z.string().optional().default(''),
    meta_description: z.string().max(160, "La meta description ne doit pas dépasser 160 caractères").optional().default(''),
    meta_keywords: z.string().optional().default(''),
    meta_robots: z.string().optional().default('index,follow'),
    featured_image: z.string().optional().default(''),
    template: z.string().optional().default('default'),
    is_published: z.boolean().default(false),
    workflow_status: z.enum(['draft', 'review', 'approved', 'published']).default('draft'),
    reading_time: z.number().int().nonnegative().default(0),
    menu_order: z.number().int().default(0),
    author: z.string().optional().default(''),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    publish_date: z.string().nullable().optional(),
    unpublish_date: z.string().nullable().optional(),
    content_blocks: z.array(z.any()).default([]),
    design_options: z.record(z.any()).default({}),
    seo_options: z.record(z.any()).default({}),
    show_hero: z.boolean().default(true),
    show_footer: z.boolean().default(true),
    custom_css: z.string().optional().default(''),
    custom_js: z.string().optional().default(''),
    header_html: z.string().optional().default(''),
    footer_html: z.string().optional().default(''),
    hero_title: z.string().optional().default(''),
    hero_subtitle: z.string().optional().default(''),
    hero_background_image: z.string().optional().default(''),
    hero_cta_text: z.string().optional().default(''),
    hero_cta_link: z.string().optional().default(''),
});

export type PageSchema = z.infer<typeof pageSchema>;

// Schéma pour les paramètres système
export const systemConfigSchema = z.object({
    siteName: z.string().min(1),
    contactEmail: z.string().email(),
    maintenanceMode: z.boolean().default(false),
    enableRegistration: z.boolean().default(true),
});

export type SystemConfig = z.infer<typeof systemConfigSchema>;
