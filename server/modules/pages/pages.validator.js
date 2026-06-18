const z = require('zod');

const createPageSchema = z.object({
    title: z.string().min(1, 'Titre requis'),
    slug: z.string().min(1, 'Slug requis'),
    content: z.string().optional().default(''),
    is_published: z.boolean().optional(),
    meta_description: z.string().optional(),
    meta_keywords: z.string().optional(),
});

const jsonDataSchema = z.union([z.string(), z.record(z.any()), z.array(z.any())]);

const updatePageSchema = z.object({
    title: z.string().min(1).optional(),
    slug: z.string().min(1).optional(),
    content: z.string().optional(),
    is_published: z.boolean().optional(),
    meta_description: z.string().optional(),
    meta_keywords: z.string().optional(),
});

const themeConfigValuesSchema = z.object({
    primaryColor: z.string().optional(),
    secondaryColor: z.string().optional(),
    fontFamily: z.string().optional(),
    borderRadius: z.string().optional(),
    spacingScale: z.string().optional(),
}).passthrough();

const themeConfigSchema = z.object({
    theme_config: themeConfigValuesSchema,
});

const adminUpdatePageSchema = z.object({
    content_raw: z.string().optional(),
    content: z.string().optional(),
    content_blocks: z.array(z.any()).optional(),
    structure_json: jsonDataSchema.optional(),
    design_options: z.record(z.any()).optional(),
    security_level: z.string().optional(),
    immutable: z.boolean().optional(),
    title: z.string().optional(),
    slug: z.string().optional(),
    meta_description: z.string().optional(),
    meta_keywords: z.string().optional(),
    is_published: z.boolean().optional(),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
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
    theme_config: themeConfigValuesSchema.optional(),
});

const draftPageSchema = z.object({
    draft_json: jsonDataSchema,
});

const namedVersionSchema = z.object({
    version_name: z.string().min(1, 'Nom de version requis'),
    structure_json: jsonDataSchema,
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

const releasePackageSchema = z.union([z.string(), z.record(z.any())]);

const releaseAnalyzeSchema = z.object({
    package: releasePackageSchema,
});

const releaseImportSchema = z.object({
    package: releasePackageSchema,
    mode: z.enum(['stage', 'safe-apply']).optional().default('stage'),
});

const releasePublishSchema = z.object({
    force: z.boolean().optional().default(false),
    reason: z.string().optional(),
});

const releaseRejectSchema = z.object({
    reason: z.string().optional(),
});

const releaseRollbackSchema = z.object({
    reason: z.string().min(8, 'Raison de rollback requise'),
});

const releasePurgeHistorySchema = z.object({
    statuses: z.array(z.enum(['published', 'rejected', 'invalid', 'quarantined', 'rolled_back'])).optional(),
    older_than_days: z.number().int().min(0).optional().default(0),
    dry_run: z.boolean().optional().default(false),
});

const optionalUrlSchema = z.string().url().optional().or(z.literal(''));

const deployPagesSchema = z.object({
    page: z.string().trim().min(1).max(160).optional().or(z.literal('')),
    all_pages: z.boolean().optional().default(false),
    mode: z.enum(['stage', 'safe-apply']).optional().default('stage'),
    source_base_url: optionalUrlSchema,
    target_base_url: optionalUrlSchema,
    source_token: z.string().trim().max(4000).optional().or(z.literal('')),
    target_token: z.string().trim().max(4000).optional().or(z.literal('')),
}).refine((value) => value.all_pages || Boolean(value.page), {
    message: 'Choisir une page ou all_pages=true',
    path: ['page'],
});

const deployCodeSchema = z.object({
    branch: z.string().trim().regex(/^[A-Za-z0-9._/-]{1,120}$/, 'Branche invalide').optional().default('chore/remove-unused-docker-services'),
    strategy: z.enum(['auto', 'native', 'script']).optional().default('auto'),
    skip_build: z.boolean().optional().default(false),
    run_install: z.boolean().optional().default(true),
    run_migrations: z.boolean().optional().default(true),
    restart_pm2: z.boolean().optional().default(true),
    pm2_app: z.string().trim().regex(/^[A-Za-z0-9._-]{1,80}$/, 'Nom PM2 invalide').optional().default('proquelec-api'),
});

const atomicSaveSchema = z.object({
    structure_json: jsonDataSchema.optional(),
    draft_json: jsonDataSchema.optional(),
    theme_config: themeConfigValuesSchema.optional(),
}).refine(data => data.structure_json !== undefined || data.draft_json !== undefined || data.theme_config !== undefined, {
    message: 'Au moins un champ (structure_json, draft_json, theme_config) requis',
});

const purgeVersionsSchema = z.object({
    keep_last: z.number().int().min(0).optional(),
    older_than_days: z.number().int().min(1).optional(),
    dry_run: z.boolean().optional().default(false),
});

module.exports = {
    createPageSchema, updatePageSchema, adminUpdatePageSchema,
    atomicSaveSchema, purgeVersionsSchema,
    draftPageSchema, namedVersionSchema, themeConfigSchema, themeConfigValuesSchema,
    createMenuItemSchema, updateMenuItemSchema,
    constructionModeSchema,
    releaseAnalyzeSchema, releaseImportSchema, releasePublishSchema,
    releaseRejectSchema, releaseRollbackSchema, releasePurgeHistorySchema,
    deployPagesSchema, deployCodeSchema
};
