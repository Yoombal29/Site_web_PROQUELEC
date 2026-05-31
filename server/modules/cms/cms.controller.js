const service = require('./cms.service');

// Events
async function listEvents(req, res) {
    try { res.json(await service.listEvents()); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function createEvent(req, res) {
    try { const r = await service.createEvent({ ...req.body, organizer_id: req.user.id }); res.status(201).json(r); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function updateEvent(req, res) {
    try { res.json(await service.updateEvent(req.params.id, req.body)); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function deleteEvent(req, res) {
    try { await service.deleteEvent(req.params.id); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
}

// Documents
async function listDocuments(req, res) {
    try { res.json(await service.listDocuments()); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function createDocument(req, res) {
    try { const r = await service.createDocument({ ...req.body, uploader_id: req.user.id }); res.status(201).json(r); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function deleteDocument(req, res) {
    try { await service.deleteDocument(req.params.id); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
}

// Partners
async function listPartners(req, res) {
    try { res.json(await service.listPartners()); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function createPartner(req, res) {
    try { res.status(201).json(await service.createPartner(req.body)); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function updatePartner(req, res) {
    try { res.json(await service.updatePartner(req.params.id, req.body)); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function deletePartner(req, res) {
    try { await service.deletePartner(req.params.id); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
}

// Quick Links
async function listQuickLinks(req, res) {
    try { res.json(await service.listQuickLinks()); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function createQuickLink(req, res) {
    try { res.status(201).json(await service.createQuickLink(req.body)); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function updateQuickLink(req, res) {
    try { res.json(await service.updateQuickLink(req.params.id, req.body)); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function deleteQuickLink(req, res) {
    try { await service.deleteQuickLink(req.params.id); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
}

// Site Assets
async function listAssets(req, res) {
    try { res.json(await service.listAssets(req.query.category)); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function createAsset(req, res) {
    try { res.status(201).json(await service.createAsset(req.body)); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function updateAsset(req, res) {
    try { res.json(await service.updateAsset(req.params.id, req.body)); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function deleteAsset(req, res) {
    try { await service.deleteAsset(req.params.id); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function trackDownload(req, res) {
    try { res.json(await service.trackDownload(req.params.id)); }
    catch (err) { res.status(500).json({ error: err.message }); }
}

// Gallery
async function listGallery(req, res) {
    try { res.json(await service.listGallery(false)); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function listAdminGallery(req, res) {
    try { res.json(await service.listGallery(true)); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function createGalleryItem(req, res) {
    try { res.status(201).json(await service.createGalleryItem(req.body)); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function updateGalleryItem(req, res) {
    try { res.json(await service.updateGalleryItem(req.params.id, req.body)); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function deleteGalleryItem(req, res) {
    try { await service.deleteGalleryItem(req.params.id); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
}

// Newsletter
async function listSubscribers(req, res) {
    try { res.json(await service.listSubscribers()); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function subscribe(req, res) {
    try { res.status(201).json(await service.subscribe(req.body)); }
    catch (err) { res.status(500).json({ error: err.message }); }
}

// Contacts
async function listContacts(req, res) {
    try { res.json(await service.listContacts()); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function createContact(req, res) {
    try { res.status(201).json(await service.createContact(req.body)); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function deleteContact(req, res) {
    try { await service.deleteContact(req.params.id); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
}

// Training Registrations
async function listRegistrations(req, res) {
    try { res.json(await service.listRegistrations()); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function createRegistration(req, res) {
    try { const r = await service.createRegistration({ ...req.body, user_id: req.user.id }); res.status(201).json(r); }
    catch (err) { res.status(500).json({ error: err.message }); }
}

// Homepage Slides
async function listHomeSlides(req, res) {
    try { res.json(await service.listHomeSlides()); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function createHomeSlide(req, res) {
    try { res.status(201).json(await service.createHomeSlide(req.body)); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function updateHomeSlide(req, res) {
    try { res.json(await service.updateHomeSlide(req.params.id, req.body)); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function deleteHomeSlide(req, res) {
    try { await service.deleteHomeSlide(req.params.id); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
}

// Home Hero
async function getHomeHero(req, res) {
    try { res.json(await service.getHomeHero()); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function upsertHomeHero(req, res) {
    try { res.json(await service.upsertHomeHero(req.body)); }
    catch (err) { res.status(500).json({ error: err.message }); }
}

// Home Stats
async function listHomeStats(req, res) {
    try { res.json(await service.listHomeStats()); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function createHomeStat(req, res) {
    try { res.status(201).json(await service.createHomeStat(req.body)); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function updateHomeStat(req, res) {
    try { res.json(await service.updateHomeStat(req.params.id, req.body)); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function deleteHomeStat(req, res) {
    try { await service.deleteHomeStat(req.params.id); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
}

// Home Services
async function listHomeServices(req, res) {
    try { res.json(await service.listHomeServices()); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function createHomeService(req, res) {
    try { res.status(201).json(await service.createHomeService(req.body)); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function updateHomeService(req, res) {
    try { res.json(await service.updateHomeService(req.params.id, req.body)); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function deleteHomeService(req, res) {
    try { await service.deleteHomeService(req.params.id); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
}

// Testimonials
async function listTestimonials(req, res) {
    try { res.json(await service.listTestimonials()); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function createTestimonial(req, res) {
    try { res.status(201).json(await service.createTestimonial(req.body)); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function updateTestimonial(req, res) {
    try { res.json(await service.updateTestimonial(req.params.id, req.body)); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function deleteTestimonial(req, res) {
    try { await service.deleteTestimonial(req.params.id); res.json({ success: true }); }
    catch (err) { res.status(500).json({ error: err.message }); }
}

// Forms
async function listForms(req, res) {
    try { res.json(await service.listForms()); }
    catch (err) { res.status(500).json({ error: err.message }); }
}
async function submitForm(req, res) {
    try { const r = await service.submitForm(req.body); res.status(201).json(r); }
    catch (err) { res.status(500).json({ error: err.message }); }
}

// --- Plugins & Themes ---
async function listPlugins(req, res) {
    try { res.json(await service.listPlugins()); }
    catch (err) { console.error('[CMS] listPlugins error:', err); res.status(500).json({ error: err.message }); }
}
async function listThemes(req, res) {
    try { res.json(await service.listThemes()); }
    catch (err) { console.error('[CMS] listThemes error:', err); res.status(500).json({ error: err.message }); }
}

// --- Email ---
const { sendEmail, emailTemplates } = require('../../email-service');

async function sendWelcomeEmail(req, res) {
    try {
        const { email, name } = req.body;
        const template = emailTemplates.welcome(name || 'Utilisateur');
        const result = await sendEmail({ to: email, ...template });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: "Erreur d'envoi d'email", details: err.message });
    }
}
async function sendFormationConfirmation(req, res) {
    try {
        const { email, formationName, name } = req.body;
        const template = emailTemplates.formationConfirmation(formationName, name || 'Utilisateur');
        const result = await sendEmail({ to: email, ...template });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: "Erreur d'envoi d'email", details: err.message });
    }
}
async function sendCertificationNotification(req, res) {
    try {
        const { email, certificationName, name } = req.body;
        const template = emailTemplates.certificationNotification(certificationName, name || 'Utilisateur');
        const result = await sendEmail({ to: email, ...template });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: "Erreur d'envoi d'email", details: err.message });
    }
}

module.exports = {
    listEvents, createEvent, updateEvent, deleteEvent,
    listDocuments, createDocument, deleteDocument,
    listPartners, createPartner, updatePartner, deletePartner,
    listQuickLinks, createQuickLink, updateQuickLink, deleteQuickLink,
    listAssets, createAsset, updateAsset, deleteAsset, trackDownload,
    listGallery, listAdminGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem,
    listSubscribers, subscribe,
    listContacts, createContact, deleteContact,
    listRegistrations, createRegistration,
    listHomeSlides, createHomeSlide, updateHomeSlide, deleteHomeSlide,
    getHomeHero, upsertHomeHero,
    listHomeStats, createHomeStat, updateHomeStat, deleteHomeStat,
    listHomeServices, createHomeService, updateHomeService, deleteHomeService,
    listTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
    listForms, submitForm,
    listPlugins, listThemes,
    sendWelcomeEmail, sendFormationConfirmation, sendCertificationNotification,
};
