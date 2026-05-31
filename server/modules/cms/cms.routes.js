const { Router } = require('express');
const ctrl = require('./cms.controller');
const { authenticateToken, validate } = require('../../core/middleware');
const {
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
} = require('./cms.validator');

const router = Router();

router.get('/events', ctrl.listEvents);
router.post('/events', authenticateToken, validate(eventSchema), ctrl.createEvent);
router.put('/events/:id', authenticateToken, validate(eventUpdateSchema), ctrl.updateEvent);
router.delete('/events/:id', authenticateToken, ctrl.deleteEvent);

router.get('/documents', ctrl.listDocuments);
router.post('/documents', authenticateToken, validate(cmsDocumentSchema), ctrl.createDocument);
router.delete('/documents/:id', authenticateToken, ctrl.deleteDocument);

router.get('/partners', ctrl.listPartners);
router.post('/partners', authenticateToken, validate(partnerSchema), ctrl.createPartner);
router.put('/partners/:id', authenticateToken, validate(partnerUpdateSchema), ctrl.updatePartner);
router.delete('/partners/:id', authenticateToken, ctrl.deletePartner);

router.get('/quick-links', ctrl.listQuickLinks);
router.post('/quick-links', authenticateToken, validate(quickLinkSchema), ctrl.createQuickLink);
router.put('/quick-links/:id', authenticateToken, validate(quickLinkUpdateSchema), ctrl.updateQuickLink);
router.delete('/quick-links/:id', authenticateToken, ctrl.deleteQuickLink);

router.get('/site-assets', ctrl.listAssets);
router.post('/site-assets', authenticateToken, validate(siteAssetSchema), ctrl.createAsset);
router.put('/site-assets/:id', authenticateToken, validate(siteAssetUpdateSchema), ctrl.updateAsset);
router.delete('/site-assets/:id', authenticateToken, ctrl.deleteAsset);
router.post('/assets/:id/download', ctrl.trackDownload);

router.get('/gallery-items', ctrl.listGallery);
router.get('/admin/gallery-items', authenticateToken, ctrl.listAdminGallery);
router.post('/gallery-items', authenticateToken, validate(galleryItemSchema), ctrl.createGalleryItem);
router.put('/gallery-items/:id', authenticateToken, validate(galleryItemUpdateSchema), ctrl.updateGalleryItem);
router.delete('/gallery-items/:id', authenticateToken, ctrl.deleteGalleryItem);

router.get('/newsletter-subscribers', authenticateToken, ctrl.listSubscribers);
router.post('/newsletter-subscribers', validate(newsletterSchema), ctrl.subscribe);

router.get('/contact-requests', authenticateToken, ctrl.listContacts);
router.post('/contact-requests', validate(contactRequestSchema), ctrl.createContact);
router.delete('/contact-requests/:id', authenticateToken, ctrl.deleteContact);

router.get('/training-registrations', authenticateToken, ctrl.listRegistrations);
router.post('/training-registrations', authenticateToken, validate(trainingRegistrationSchema), ctrl.createRegistration);

router.get('/home-slides', ctrl.listHomeSlides);
router.post('/home-slides', authenticateToken, validate(homeSlideSchema), ctrl.createHomeSlide);
router.put('/home-slides/:id', authenticateToken, validate(homeSlideUpdateSchema), ctrl.updateHomeSlide);
router.delete('/home-slides/:id', authenticateToken, ctrl.deleteHomeSlide);

router.get('/home-hero', ctrl.getHomeHero);
router.post('/home-hero', authenticateToken, validate(homeHeroSchema), ctrl.upsertHomeHero);

router.get('/home-stats', ctrl.listHomeStats);
router.post('/home-stats', authenticateToken, validate(homeStatSchema), ctrl.createHomeStat);
router.put('/home-stats/:id', authenticateToken, validate(homeStatUpdateSchema), ctrl.updateHomeStat);
router.delete('/home-stats/:id', authenticateToken, ctrl.deleteHomeStat);

router.get('/home-services', ctrl.listHomeServices);
router.post('/home-services', authenticateToken, validate(homeServiceSchema), ctrl.createHomeService);
router.put('/home-services/:id', authenticateToken, validate(homeServiceUpdateSchema), ctrl.updateHomeService);
router.delete('/home-services/:id', authenticateToken, ctrl.deleteHomeService);

router.get('/testimonials', ctrl.listTestimonials);
router.post('/testimonials', authenticateToken, validate(testimonialSchema), ctrl.createTestimonial);
router.put('/testimonials/:id', authenticateToken, validate(testimonialUpdateSchema), ctrl.updateTestimonial);
router.delete('/testimonials/:id', authenticateToken, ctrl.deleteTestimonial);

router.get('/forms', ctrl.listForms);
router.post('/form-submissions', validate(formSubmissionSchema), ctrl.submitForm);

router.get('/cms/plugins', ctrl.listPlugins);
router.get('/cms/themes', ctrl.listThemes);

router.post('/email/welcome', authenticateToken, validate(emailSchema), ctrl.sendWelcomeEmail);
router.post('/email/formation-confirmation', authenticateToken, validate(emailSchema), ctrl.sendFormationConfirmation);
router.post('/email/certification-notification', authenticateToken, validate(emailSchema), ctrl.sendCertificationNotification);

module.exports = { router, basePath: '/api' };
