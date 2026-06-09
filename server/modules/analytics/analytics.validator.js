const z = require('zod');

const performanceMetricSchema = z.object({
    page_url: z.string().min(1, 'URL requise'),
    load_time: z.number(),
    dom_content_loaded: z.number(),
    first_contentful_paint: z.number(),
    time_to_interactive: z.number(),
    connection_type: z.string().optional(),
});

const analyticsEventSchema = z.object({
    event_type: z.string().min(1, "Type d'événement requis"),
    page_url: z.string().min(1, 'URL requise'),
    device_type: z.string().optional(),
    country: z.string().optional(),
    metadata: z.any().optional(),
});

module.exports = { performanceMetricSchema, analyticsEventSchema };
