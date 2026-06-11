const repo = require('./cms.repository');
const { sendSseEvent } = require('../../core/sse');
const {
  sendContactNotification,
  sendEventRegistrationConfirmation,
  sendEventRegistrationNotification,
  sendEventReviewNotification,
} = require('../../email-service');
const {
  normalizeContactRequestPayload,
  buildEmailNotificationPayload,
} = require('../../contact-request-utils');

async function listEvents() {
  return repo.findAllEvents();
}
async function createEvent(data) {
  return repo.createEvent(data);
}
async function updateEvent(id, data) {
  // Récupérer l'événement AVANT modification pour détecter le changement de statut
  const previous = await repo.findEventWithOrganizer(id);
  const result = await repo.updateEvent(id, data);

  // Si le statut a changé depuis/vers pending_review, notifier le partenaire
  if (
    previous &&
    data.status &&
    previous.status !== data.status &&
    previous.organizer_type === 'partner' &&
    previous.organizer_email
  ) {
    try {
      await sendEventReviewNotification({
        name: previous.organizer_name || 'Cher partenaire',
        email: previous.organizer_email,
        eventTitle: previous.title,
        status: data.status,
        comment: data.review_comment || '',
      });
    } catch (emailError) {
      console.warn('[CMS] Email de validation non envoyé:', emailError.message);
    }
  }

  return result;
}
async function deleteEvent(id) {
  await repo.deleteEvent(id);
}

// --- Event Registrations ---
async function listRegistrationsByEvent(eventId) {
  return repo.findRegistrationsByEvent(eventId);
}
async function registerForEvent(data) {
  const { event_id, name, email, phone, company, message } = data;
  const registration = await repo.createEventRegistration(data);

  // Envoyer les notifications par email (en arrière-plan, non-bloquant)
  try {
    const events = await repo.findAllEvents();
    const event = events.find((e) => e.id === event_id);
    if (event) {
      const eventDate = new Date(event.date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      let eventTime = '';
      let eventLocation = event.location || 'Lieu à confirmer';
      try {
        const details =
          typeof event.details === 'string' ? JSON.parse(event.details) : event.details || {};
        eventTime = details.time
          ? `${details.time}${details.endTime ? ` - ${details.endTime}` : ''}`
          : '';
      } catch {
        /* ignore */
      }

      // Email de confirmation au participant
      await sendEventRegistrationConfirmation({
        name,
        email,
        eventTitle: event.title,
        eventDate,
        eventTime: eventTime || 'Horaire à confirmer',
        eventLocation,
      });

      // Notification à l'admin PROQUELEC
      await sendEventRegistrationNotification({
        name,
        email,
        phone,
        company,
        message,
        eventTitle: event.title,
      });
    }
  } catch (emailError) {
    console.warn('[CMS] Notification email non envoyée (SMTP non configuré?)', emailError.message);
  }

  return registration;
}
async function changeRegistrationStatus(id, status) {
  return repo.updateRegistrationStatus(id, status);
}
async function getRegistrationCounts(eventId) {
  return repo.countRegistrationsByEvent(eventId);
}

async function listDocuments() {
  return repo.findAllDocuments();
}
async function createDocument(data) {
  return repo.createDocument(data);
}
async function deleteDocument(id) {
  await repo.deleteDocument(id);
}

async function listPartners() {
  return repo.findAllPartners();
}
async function createPartner(data) {
  return repo.createPartner(data);
}
async function updatePartner(id, data) {
  return repo.updatePartner(id, data);
}
async function deletePartner(id) {
  await repo.deletePartner(id);
}

async function listQuickLinks() {
  return repo.findAllQuickLinks();
}
async function createQuickLink(data) {
  return repo.createQuickLink(data);
}
async function updateQuickLink(id, data) {
  return repo.updateQuickLink(id, data);
}
async function deleteQuickLink(id) {
  await repo.deleteQuickLink(id);
}

async function listAssets(category) {
  return repo.findAllAssets(category);
}
async function createAsset(data) {
  return repo.createAsset(data);
}
async function updateAsset(id, data) {
  return repo.updateAsset(id, data);
}
async function deleteAsset(id) {
  await repo.deleteAsset(id);
}
async function trackDownload(id) {
  await repo.incrementDownload(id);
  return { success: true };
}

async function listGallery(isAdmin) {
  return repo.findAllGallery(isAdmin);
}
async function createGalleryItem(data) {
  return repo.createGalleryItem(data);
}
async function updateGalleryItem(id, data) {
  return repo.updateGalleryItem(id, data);
}
async function deleteGalleryItem(id) {
  await repo.deleteGalleryItem(id);
}

async function listSubscribers() {
  return repo.findAllSubscribers();
}
async function subscribe(data) {
  return repo.subscribe(data);
}

async function listContacts() {
  return repo.findAllContacts();
}
async function createContact(data) {
  const payload = normalizeContactRequestPayload(data);
  const contact = await repo.createContact(payload);
  const emailResult = await sendContactNotification(payload);
  const emailNotification = buildEmailNotificationPayload(emailResult);

  if (!emailResult.success) {
    const error = new Error(
      'Votre demande a été enregistrée, mais la notification email PROQUELEC n’a pas pu être envoyée.',
    );
    error.statusCode = 502;
    error.contact = contact;
    error.emailNotification = {
      ...emailNotification,
      error: emailResult.error || 'Erreur SMTP inconnue',
    };
    throw error;
  }

  return { ...contact, email_notification: emailNotification };
}
async function deleteContact(id) {
  await repo.deleteContact(id);
}

async function listRegistrations() {
  return repo.findAllRegistrations();
}
async function createRegistration(data) {
  return repo.createRegistration(data);
}

async function listHomeSlides() {
  return repo.findHomeSlides();
}
async function createHomeSlide(data) {
  return repo.createHomeSlide(data);
}
async function updateHomeSlide(id, data) {
  return repo.updateHomeSlide(id, data);
}
async function deleteHomeSlide(id) {
  await repo.deleteHomeSlide(id);
}

async function getHomeHero() {
  return repo.findHomeHero();
}
async function upsertHomeHero(data) {
  return repo.upsertHomeHero(data);
}

async function listHomeStats() {
  return repo.findHomeStats();
}
async function createHomeStat(data) {
  return repo.createHomeStat(data);
}
async function updateHomeStat(id, data) {
  return repo.updateHomeStat(id, data);
}
async function deleteHomeStat(id) {
  await repo.deleteHomeStat(id);
}

async function listHomeServices() {
  return repo.findHomeServices();
}
async function createHomeService(data) {
  return repo.createHomeService(data);
}
async function updateHomeService(id, data) {
  return repo.updateHomeService(id, data);
}
async function deleteHomeService(id) {
  await repo.deleteHomeService(id);
}

async function listTestimonials() {
  return repo.findTestimonials();
}
async function createTestimonial(data) {
  return repo.createTestimonial(data);
}
async function updateTestimonial(id, data) {
  return repo.updateTestimonial(id, data);
}
async function deleteTestimonial(id) {
  await repo.deleteTestimonial(id);
}

async function listForms() {
  return repo.findForms();
}
async function submitForm(data) {
  return repo.submitForm(data);
}

// --- Plugins & Themes ---
async function listPlugins() {
  return repo.findAllPlugins();
}
async function listThemes() {
  return repo.findAllThemes();
}

module.exports = {
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  listRegistrationsByEvent,
  registerForEvent,
  changeRegistrationStatus,
  getRegistrationCounts,
  listDocuments,
  createDocument,
  deleteDocument,
  listPartners,
  createPartner,
  updatePartner,
  deletePartner,
  listQuickLinks,
  createQuickLink,
  updateQuickLink,
  deleteQuickLink,
  listAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  trackDownload,
  listGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  listSubscribers,
  subscribe,
  listContacts,
  createContact,
  deleteContact,
  listRegistrations,
  createRegistration,
  listHomeSlides,
  createHomeSlide,
  updateHomeSlide,
  deleteHomeSlide,
  getHomeHero,
  upsertHomeHero,
  listHomeStats,
  createHomeStat,
  updateHomeStat,
  deleteHomeStat,
  listHomeServices,
  createHomeService,
  updateHomeService,
  deleteHomeService,
  listTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  listForms,
  submitForm,
  listPlugins,
  listThemes,
};
