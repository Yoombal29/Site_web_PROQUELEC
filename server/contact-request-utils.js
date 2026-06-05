const CONTACT_FIELD_LIMITS = {
  nom: 160,
  email: 254,
  telephone: 60,
  sujet: 180,
  message: 4000,
};

function normalizeContactField(value, maxLength) {
  return String(value || '')
    .trim()
    .slice(0, maxLength);
}

function normalizeContactRequestPayload(body = {}) {
  return {
    nom: normalizeContactField(body.nom, CONTACT_FIELD_LIMITS.nom),
    email: normalizeContactField(body.email, CONTACT_FIELD_LIMITS.email).toLowerCase(),
    telephone: normalizeContactField(body.telephone, CONTACT_FIELD_LIMITS.telephone),
    sujet:
      normalizeContactField(body.sujet, CONTACT_FIELD_LIMITS.sujet) || 'Demande depuis le site',
    message: normalizeContactField(body.message, CONTACT_FIELD_LIMITS.message),
  };
}

function validateContactRequestPayload(body = {}) {
  const payload = normalizeContactRequestPayload(body);
  const errors = {};

  if (!payload.nom) errors.nom = 'Nom requis';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) errors.email = 'Email invalide';
  if (!payload.message) errors.message = 'Message requis';

  return { payload, errors };
}

function buildEmailNotificationPayload(emailResult = {}) {
  return {
    sent: Boolean(emailResult.success && !emailResult.simulated),
    simulated: Boolean(emailResult.simulated),
    messageId: emailResult.messageId || null,
    reason: emailResult.reason || null,
  };
}

module.exports = {
  CONTACT_FIELD_LIMITS,
  normalizeContactRequestPayload,
  validateContactRequestPayload,
  buildEmailNotificationPayload,
};
