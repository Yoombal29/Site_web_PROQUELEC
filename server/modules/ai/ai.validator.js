const z = require('zod');

const codeAssistantSchema = z.object({
    prompt: z.string().min(1, 'Prompt requis'),
    currentCode: z.string().min(1, 'Code actuel requis'),
    pageId: z.string().uuid().optional(),
    userId: z.string().optional(),
    provider: z.string().optional(),
});

const aiGenerateSchema = z.object({
    prompt: z.string().min(1, 'Prompt requis'),
    context: z.string().optional(),
    tone: z.string().optional(),
    task: z.string().optional(),
});

const contentGenerationSchema = z.object({
    prompt: z.string().min(1, 'Prompt requis'),
    messages: z.array(z.any()).optional(),
    system_prompt: z.string().optional(),
    model: z.string().optional(),
});

const pingProviderSchema = z.object({
    providerId: z.string().min(1, 'Provider requis'),
    apiKey: z.string().optional(),
});

const diagnosticSchema = z.object({
    providerId: z.string().min(1, 'Provider requis'),
    apiKey: z.string().optional(),
});

const complianceScanSchema = z.object({
    imageBase64: z.string().min(1, 'Image requise'),
});

const seoAnalyzeSchema = z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    slug: z.string().optional(),
});

const createChatSchema = z.object({
    title: z.string().optional(),
});

const updateChatSchema = z.object({
    title: z.string().optional(),
});

const createMessageSchema = z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1, 'Contenu requis'),
    metadata: z.any().optional(),
});

const exportSchema = z.object({
    blocks: z.array(z.any()).min(1, 'Au moins un bloc requis'),
    format: z.enum(['react', 'html', 'json']),
    enhance: z.boolean().optional().default(false),
});

const layoutGenerateSchema = z.object({
    prompt: z.string().min(3, 'Prompt requis (min 3 caractères)'),
    context: z.string().optional(),
    tone: z.enum(['professionnelle', 'moderne', 'technique', 'commerciale', 'pédagogique']).optional(),
    mode: z.enum(['new', 'add', 'transform']).optional().default('new'),
    existingBlocks: z.array(z.any()).optional(),
    pageTitle: z.string().optional(),
});

module.exports = {
    codeAssistantSchema, aiGenerateSchema, contentGenerationSchema,
    pingProviderSchema, diagnosticSchema, complianceScanSchema,
    seoAnalyzeSchema, createChatSchema, updateChatSchema,
    createMessageSchema,
    layoutGenerateSchema,
    exportSchema,
};
