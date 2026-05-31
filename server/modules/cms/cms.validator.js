const z = require('zod');

const eventSchema = z.object({
    title: z.string().min(1, 'Titre requis'),
    date: z.string().min(1, 'Date requise'),
    location: z.string().optional(),
    details: z.string().optional(),
});

const eventUpdateSchema = eventSchema.partial();

const cmsDocumentSchema = z.object({
    title: z.string().min(1, 'Titre requis'),
    description: z.string().optional(),
    file_url: z.string().optional(),
});

const partnerSchema = z.object({
    name: z.string().min(1, 'Nom requis'),
    logo_url: z.string().optional(),
    category: z.string().optional(),
    display_order: z.number().optional(),
    is_active: z.boolean().optional(),
});

const partnerUpdateSchema = partnerSchema.partial();

const quickLinkSchema = z.object({
    title: z.string().min(1, 'Titre requis'),
    description: z.string().optional(),
    url: z.string().min(1, 'URL requise'),
    icon_name: z.string().optional(),
    display_order: z.number().optional(),
    is_active: z.boolean().optional(),
});

const quickLinkUpdateSchema = quickLinkSchema.partial();

const siteAssetSchema = z.object({
    title: z.string().min(1, 'Titre requis'),
    description: z.string().optional(),
    category: z.string().optional(),
    asset_type: z.string().optional(),
    file_size: z.number().optional(),
    file_url: z.string().optional(),
    preview_url: z.string().optional(),
    is_premium: z.boolean().optional(),
    price_fcfy: z.number().optional(),
    monetization_active: z.boolean().optional(),
    metadata: z.any().optional(),
});

const siteAssetUpdateSchema = siteAssetSchema.partial();

const galleryItemSchema = z.object({
    title: z.string().min(1, 'Titre requis'),
    description: z.string().optional(),
    url: z.string().min(1, 'URL requise'),
    type: z.string().optional(),
    category: z.string().optional(),
    tags: z.any().optional(),
    hotspots: z.any().optional(),
    display_order: z.number().optional(),
    is_active: z.boolean().optional(),
});

const galleryItemUpdateSchema = galleryItemSchema.partial();

const newsletterSchema = z.object({
    email: z.string().email('Email invalide'),
    source: z.string().optional(),
});

const contactRequestSchema = z.object({
    nom: z.string().min(1, 'Nom requis'),
    email: z.string().email('Email invalide'),
    telephone: z.string().optional(),
    sujet: z.string().optional(),
    message: z.string().min(1, 'Message requis'),
});

const trainingRegistrationSchema = z.object({
    training_id: z.string().uuid('ID formation invalide'),
    participant_name: z.string().min(1, 'Nom requis'),
    participant_email: z.string().email('Email invalide'),
    participant_phone: z.string().optional(),
    company_name: z.string().optional(),
    special_requirements: z.string().optional(),
});

const homeSlideSchema = z.object({
    badge: z.string().optional(),
    title: z.string().min(1, 'Titre requis'),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    background_url: z.string().optional(),
    cta_text: z.string().optional(),
    cta_link: z.string().optional(),
    secondary_cta_text: z.string().optional(),
    secondary_cta_link: z.string().optional(),
    display_order: z.number().optional(),
});

const homeSlideUpdateSchema = homeSlideSchema.partial();

const homeHeroSchema = z.object({
    title: z.string().min(1, 'Titre requis'),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    cta_text: z.string().optional(),
    cta_link: z.string().optional(),
    background_url: z.string().optional(),
});

const homeStatSchema = z.object({
    label: z.string().min(1, 'Label requis'),
    value: z.string().min(1, 'Valeur requise'),
    icon_name: z.string().optional(),
    description: z.string().optional(),
    is_warning: z.boolean().optional(),
    display_order: z.number().optional(),
});

const homeStatUpdateSchema = homeStatSchema.partial();

const homeServiceSchema = z.object({
    title: z.string().min(1, 'Titre requis'),
    description: z.string().optional(),
    icon_name: z.string().optional(),
    link: z.string().optional(),
    features: z.any().optional(),
    display_order: z.number().optional(),
});

const homeServiceUpdateSchema = homeServiceSchema.partial();

const testimonialSchema = z.object({
    name: z.string().min(1, 'Nom requis'),
    role: z.string().optional(),
    content: z.string().min(1, 'Contenu requis'),
    rating: z.number().min(0).max(5).optional(),
    avatar_url: z.string().optional(),
});

const testimonialUpdateSchema = testimonialSchema.partial();

const formSubmissionSchema = z.object({
    form_name: z.string().min(1, 'Nom du formulaire requis'),
    form_data: z.record(z.any()),
    submitted_at: z.string().optional(),
});

const emailSchema = z.object({
    email: z.string().email('Email invalide'),
    name: z.string().optional(),
    formationName: z.string().optional(),
    certificationName: z.string().optional(),
});

module.exports = {
    eventSchema, eventUpdateSchema,
    cmsDocumentSchema,
    partnerSchema, partnerUpdateSchema,
    quickLinkSchema, quickLinkUpdateSchema,
    siteAssetSchema, siteAssetUpdateSchema,
    galleryItemSchema, galleryItemUpdateSchema,
    newsletterSchema,
    contactRequestSchema,
    trainingRegistrationSchema,
    homeSlideSchema, homeSlideUpdateSchema,
    homeHeroSchema,
    homeStatSchema, homeStatUpdateSchema,
    homeServiceSchema, homeServiceUpdateSchema,
    testimonialSchema, testimonialUpdateSchema,
    formSubmissionSchema,
    emailSchema,
};
