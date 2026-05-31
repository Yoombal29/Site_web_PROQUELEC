const z = require('zod');

const siteSettingsSchema = z.object({
    site_name: z.string().optional(),
    slogan: z.string().optional(),
    logo_url: z.string().optional(),
    favicon_url: z.string().optional(),
    contact_email: z.string().email().nullable().optional(),
    phone_number: z.string().optional(),
    address: z.string().optional(),
    copyright_text: z.string().optional(),
    facebook_url: z.string().optional(),
    linkedin_url: z.string().optional(),
    twitter_url: z.string().optional(),
    logo_height: z.number().optional(),
    logo_scale: z.number().optional(),
    logo_brightness: z.number().optional(),
    logo_contrast: z.number().optional(),
    cta_primary_text: z.string().optional(),
    cta_primary_url: z.string().optional(),
    cta_secondary_text: z.string().optional(),
    cta_secondary_url: z.string().optional(),
    page_sections: z.any().optional(),
    audience_section_title: z.string().optional(),
    audience_section_subtitle: z.string().optional(),
    audience_title_electrician: z.string().optional(),
    audience_subtitle_electrician: z.string().optional(),
    audience_desc_electrician: z.string().optional(),
    audience_title_company: z.string().optional(),
    audience_subtitle_company: z.string().optional(),
    audience_desc_company: z.string().optional(),
    audience_title_member: z.string().optional(),
    audience_subtitle_member: z.string().optional(),
    audience_desc_member: z.string().optional(),
});

const themeSettingsSchema = z.object({
    primary_color: z.string().optional(),
    secondary_color: z.string().optional(),
    accent_color: z.string().optional(),
    background_color: z.string().optional(),
    text_color: z.string().optional(),
    font_family: z.string().optional(),
    footer_background_url: z.string().optional(),
});

const siteConfigSchema = z.object({
    schema: z.object({
        theme: z.object({
            primary: z.string().optional(),
            secondary: z.string().optional(),
            accent: z.string().optional(),
            font: z.string().optional(),
        }).optional(),
        globals: z.object({
            header: z.object({
                site_name: z.string().optional(),
                logo_url: z.string().optional(),
            }).optional(),
        }).optional(),
        pages: z.array(z.object({
            id: z.string(),
            layout: z.any(),
        })).optional(),
    }),
});

const auditLogSchema = z.object({
    action: z.string().min(1, 'Action requise'),
    entity_type: z.string().min(1, "Type d'entité requis"),
    entity_id: z.string().min(1, "ID d'entité requis"),
    details: z.any().optional(),
});

module.exports = {
    siteSettingsSchema, themeSettingsSchema,
    siteConfigSchema, auditLogSchema
};
