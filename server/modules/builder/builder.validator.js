const { z } = require('zod');

const snapshotTypeEnum = z.enum(['manual', 'auto', 'publish', 'ai_generated', 'collaboration_merge']);

const createSnapshotSchema = z.object({
    label: z.string().min(1, 'Label requis').max(255),
    snapshot: z.any(),
    snapshot_type: snapshotTypeEnum.optional().default('manual'),
    metadata: z.record(z.any()).optional().default({}),
});

const createTemplateSchema = z.object({
    name: z.string().min(1, 'Nom requis').max(255),
    category: z.string().min(1, 'Catégorie requise').max(100),
    description: z.string().optional(),
    preview_image: z.string().url('URL invalide').optional().or(z.literal('')),
    blocks: z.array(z.any()).optional().default([]),
    layout_tree: z.array(z.any()).optional().default([]),
    theme_config: z.record(z.any()).optional().default({}),
    animation_config: z.record(z.any()).optional().default({}),
    tags: z.array(z.string()).optional().default([]),
    is_system: z.boolean().optional().default(false),
});

const updateTemplateSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    category: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    preview_image: z.string().optional(),
    blocks: z.array(z.any()).optional(),
    layout_tree: z.array(z.any()).optional(),
    theme_config: z.record(z.any()).optional(),
    animation_config: z.record(z.any()).optional(),
    tags: z.array(z.string()).optional(),
});

const createComponentSchema = z.object({
    name: z.string().min(1, 'Nom requis').max(255),
    category: z.string().max(100).optional().default('custom'),
    schema: z.array(z.any()).optional().default([]),
    preview_image: z.string().optional(),
    is_global: z.boolean().optional().default(false),
    tags: z.array(z.string()).optional().default([]),
});

const updateComponentSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    category: z.string().max(100).optional(),
    schema: z.array(z.any()).optional(),
    preview_image: z.string().optional(),
    is_global: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
});

const sourceTypeEnum = z.enum(['api', 'query', 'static', 'context', 'store']);

const createBindingSchema = z.object({
    page_id: z.string().uuid().optional(),
    node_id: z.string().min(1, 'node_id requis'),
    source_type: sourceTypeEnum,
    source_config: z.record(z.any()).optional().default({}),
    mapping: z.record(z.any()).optional().default({}),
    refresh_interval: z.number().int().min(0).optional().default(0),
});

const updateBindingSchema = z.object({
    source_config: z.record(z.any()).optional(),
    mapping: z.record(z.any()).optional(),
    refresh_interval: z.number().int().min(0).optional(),
    is_active: z.boolean().optional(),
});

const registerPluginSchema = z.object({
    name: z.string().min(1, 'Nom requis').max(255),
    display_name: z.string().optional(),
    description: z.string().optional(),
    version: z.string().optional().default('1.0.0'),
    enabled: z.boolean().optional().default(false),
    config: z.record(z.any()).optional().default({}),
    dependencies: z.array(z.string()).optional().default([]),
    load_order: z.number().int().optional().default(0),
    author: z.string().optional(),
    homepage: z.string().optional(),
});

const togglePluginSchema = z.object({
    enabled: z.boolean(),
});

const createExportSchema = z.object({
    page_id: z.string().uuid().optional(),
    snapshot_id: z.string().uuid().optional(),
    format: z.enum(['react', 'html', 'json', 'pdf']),
    output_path: z.string().optional(),
    output_size: z.number().int().optional(),
    content_hash: z.string().optional(),
    metadata: z.record(z.any()).optional().default({}),
});

const updateCollaborationSchema = z.object({
    ydoc_state: z.any().optional(),
    awareness: z.record(z.any()).optional(),
});

const updatePageBuilderSchema = z.object({
    layout_tree: z.array(z.any()).optional(),
    theme_config: z.record(z.any()).optional(),
    bindings: z.array(z.any()).optional(),
    animation_config: z.record(z.any()).optional(),
    published_snapshot_id: z.string().uuid().optional(),
});

module.exports = {
    createSnapshotSchema,
    createTemplateSchema,
    updateTemplateSchema,
    createComponentSchema,
    updateComponentSchema,
    createBindingSchema,
    updateBindingSchema,
    registerPluginSchema,
    togglePluginSchema,
    createExportSchema,
    updateCollaborationSchema,
    updatePageBuilderSchema,
};
