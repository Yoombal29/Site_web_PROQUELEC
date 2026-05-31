const repo = require('./cms.repository');
const { sendSseEvent } = require('../../core/sse');

async function listEvents() { return repo.findAllEvents(); }
async function createEvent(data) { return repo.createEvent(data); }
async function updateEvent(id, data) { return repo.updateEvent(id, data); }
async function deleteEvent(id) { await repo.deleteEvent(id); }

async function listDocuments() { return repo.findAllDocuments(); }
async function createDocument(data) { return repo.createDocument(data); }
async function deleteDocument(id) { await repo.deleteDocument(id); }

async function listPartners() { return repo.findAllPartners(); }
async function createPartner(data) { return repo.createPartner(data); }
async function updatePartner(id, data) { return repo.updatePartner(id, data); }
async function deletePartner(id) { await repo.deletePartner(id); }

async function listQuickLinks() { return repo.findAllQuickLinks(); }
async function createQuickLink(data) { return repo.createQuickLink(data); }
async function updateQuickLink(id, data) { return repo.updateQuickLink(id, data); }
async function deleteQuickLink(id) { await repo.deleteQuickLink(id); }

async function listAssets(category) { return repo.findAllAssets(category); }
async function createAsset(data) { return repo.createAsset(data); }
async function updateAsset(id, data) { return repo.updateAsset(id, data); }
async function deleteAsset(id) { await repo.deleteAsset(id); }
async function trackDownload(id) { await repo.incrementDownload(id); return { success: true }; }

async function listGallery(isAdmin) { return repo.findAllGallery(isAdmin); }
async function createGalleryItem(data) { return repo.createGalleryItem(data); }
async function updateGalleryItem(id, data) { return repo.updateGalleryItem(id, data); }
async function deleteGalleryItem(id) { await repo.deleteGalleryItem(id); }

async function listSubscribers() { return repo.findAllSubscribers(); }
async function subscribe(data) { return repo.subscribe(data); }

async function listContacts() { return repo.findAllContacts(); }
async function createContact(data) { return repo.createContact(data); }
async function deleteContact(id) { await repo.deleteContact(id); }

async function listRegistrations() { return repo.findAllRegistrations(); }
async function createRegistration(data) { return repo.createRegistration(data); }

async function listHomeSlides() { return repo.findHomeSlides(); }
async function createHomeSlide(data) { return repo.createHomeSlide(data); }
async function updateHomeSlide(id, data) { return repo.updateHomeSlide(id, data); }
async function deleteHomeSlide(id) { await repo.deleteHomeSlide(id); }

async function getHomeHero() { return repo.findHomeHero(); }
async function upsertHomeHero(data) { return repo.upsertHomeHero(data); }

async function listHomeStats() { return repo.findHomeStats(); }
async function createHomeStat(data) { return repo.createHomeStat(data); }
async function updateHomeStat(id, data) { return repo.updateHomeStat(id, data); }
async function deleteHomeStat(id) { await repo.deleteHomeStat(id); }

async function listHomeServices() { return repo.findHomeServices(); }
async function createHomeService(data) { return repo.createHomeService(data); }
async function updateHomeService(id, data) { return repo.updateHomeService(id, data); }
async function deleteHomeService(id) { await repo.deleteHomeService(id); }

async function listTestimonials() { return repo.findTestimonials(); }
async function createTestimonial(data) { return repo.createTestimonial(data); }
async function updateTestimonial(id, data) { return repo.updateTestimonial(id, data); }
async function deleteTestimonial(id) { await repo.deleteTestimonial(id); }

async function listForms() { return repo.findForms(); }
async function submitForm(data) { return repo.submitForm(data); }

// --- Plugins & Themes ---
async function listPlugins() { return repo.findAllPlugins(); }
async function listThemes() { return repo.findAllThemes(); }

module.exports = {
    listEvents, createEvent, updateEvent, deleteEvent,
    listDocuments, createDocument, deleteDocument,
    listPartners, createPartner, updatePartner, deletePartner,
    listQuickLinks, createQuickLink, updateQuickLink, deleteQuickLink,
    listAssets, createAsset, updateAsset, deleteAsset, trackDownload,
    listGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem,
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
};
