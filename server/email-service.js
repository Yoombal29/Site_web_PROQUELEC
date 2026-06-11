const nodemailer = require('nodemailer');

let transporter = null;
let transporterKey = null;

function isFalseFlag(value) {
  return ['0', 'false', 'no', 'off'].includes(
    String(value || '')
      .trim()
      .toLowerCase(),
  );
}

function getEmailConfig() {
  const enableFlag = process.env.ENABLE_EMAIL;
  const disabled = isFalseFlag(enableFlag);
  const host = process.env.SMTP_HOST || 'mail.proquelec.sn';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const user = process.env.SMTP_USER || 'proquelec@proquelec.sn';
  const pass = process.env.SMTP_PASS || '';
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || user;
  const to = process.env.SMTP_TO || user;
  const configured = !disabled && Boolean(host && user && pass);

  return {
    host,
    port,
    user,
    pass,
    from,
    to,
    secure: port === 465,
    configured,
    disabled,
    reason: disabled ? 'EMAIL_DISABLED' : !pass ? 'SMTP_PASSWORD_MISSING' : null,
    cacheKey: `${host}:${port}:${user}:${from}:${to}:${configured}`,
  };
}

function getPublicEmailConfig() {
  const config = getEmailConfig();
  return {
    host: config.host,
    port: config.port,
    user: config.user,
    from: config.from,
    to: config.to,
    secure: config.secure,
    configured: config.configured,
    disabled: config.disabled,
    reason: config.reason,
  };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeEmailHeader(value, fallback = 'Notification PROQUELEC') {
  const safeValue = String(value || fallback)
    .replace(/[\r\n]+/g, ' ')
    .trim();
  return safeValue || fallback;
}

function sanitizeReplyTo(value) {
  const replyTo = String(value || '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyTo) ? replyTo : undefined;
}

function getTransporter() {
  const config = getEmailConfig();
  if (!config.configured) return { ...config, transporter: null };
  if (transporter && transporterKey === config.cacheKey) return { ...config, transporter };

  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    tls: { rejectUnauthorized: false },
  });
  transporterKey = config.cacheKey;

  return { ...config, transporter };
}

async function sendEmail({ subject, html, text, replyTo, to: recipient }) {
  try {
    const { transporter, from, to: defaultTo, configured, reason } = getTransporter();
    const target = recipient || defaultTo;

    if (!configured || !transporter) {
      console.warn(
        `[EMAIL] Envoi simulé: SMTP non actif (${reason || 'SMTP_NOT_CONFIGURED'}) vers ${target}`,
      );
      return {
        success: true,
        simulated: true,
        reason: reason || 'SMTP_NOT_CONFIGURED',
        to: target,
      };
    }

    const info = await transporter.sendMail({
      from: `"PROQUELEC" <${from}>`,
      to: target,
      subject: sanitizeEmailHeader(subject),
      html,
      text,
      replyTo: sanitizeReplyTo(replyTo) || from,
    });
    console.log('[EMAIL] Envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EMAIL] Erreur:', error.message);
    return { success: false, error: error.message };
  }
}

function emailLayout(title, content) {
  const safeTitle = escapeHtml(title);
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(30,58,95,0.08),0 1px 4px rgba(30,58,95,0.04)">
      <!-- Header avec logo PROQUELEC -->
      <div style="background:linear-gradient(135deg,#0f2a4a 0%,#1e3a5f 40%,#2563eb 100%);padding:36px 24px;text-align:center;position:relative">
        <div style="position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(to right,#f59e0b,#2563eb)"></div>
        <img src="https://proquelec.sn/logo.png" alt="PROQUELEC" style="width:auto;height:48px;margin-bottom:10px" onerror="this.style.display='none'">
        <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;letter-spacing:-0.3px">PROQUELEC</h1>
        <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:12px;font-weight:500;letter-spacing:0.5px;text-transform:uppercase">Sécurité &middot; Qualité &middot; Formation</p>
      </div>

      <!-- Corps du message -->
      <div style="padding:36px 28px">
        <div style="width:40px;height:4px;background:linear-gradient(to right,#2563eb,#f59e0b);border-radius:2px;margin-bottom:20px"></div>
        <h2 style="color:#0f2a4a;font-size:20px;font-weight:700;margin:0 0 4px;line-height:1.3">${safeTitle}</h2>
        <p style="color:#6b7280;font-size:13px;margin:0 0 24px;padding-bottom:16px;border-bottom:1px solid #e5e7eb">Notification du site proquelec.sn</p>
        ${content}
      </div>

      <!-- Footer -->
      <div style="background:#f8fafc;padding:24px 28px;text-align:center;border-top:1px solid #e5e7eb">
        <p style="color:#94a3b8;font-size:11px;margin:0 0 8px;line-height:1.5">
          <strong style="color:#1e3a5f">PROQUELEC</strong><br>
          Promotion de la Qualité des Installations Électriques au Sénégal
        </p>
        <p style="color:#cbd5e1;font-size:10px;margin:0">
          Route de l'Aéroport, Lotissement Mermoz &bull; BP 1234 Dakar<br>
          <a href="tel:+221330000000" style="color:#2563eb;text-decoration:none">+221 33 000 00 00</a>
          &nbsp;&bull;&nbsp;
          <a href="mailto:proquelec@proquelec.sn" style="color:#2563eb;text-decoration:none">proquelec@proquelec.sn</a>
        </p>
        <p style="color:#e2e8f0;font-size:9px;margin:12px 0 0;padding-top:12px;border-top:1px solid #e2e8f0">&copy; ${new Date().getFullYear()} PROQUELEC &mdash; Tous droits réservés</p>
      </div>
    </div>
  `;
}

function fieldRow(label, value) {
  const safeLabel = escapeHtml(label);
  const safeValue = value ? escapeHtml(value) : '<span style="color:#9ca3af">Non renseigné</span>';
  return `<tr><td style="padding:10px 12px;font-weight:600;color:#374151;font-size:13px;width:100px;vertical-align:top;white-space:nowrap">${safeLabel}</td><td style="padding:10px 12px;color:#111827;font-size:14px;word-break:break-word">${safeValue}</td></tr>`;
}

// Envoyer une notification pour un nouveau contact
async function sendContactNotification({ nom, email, telephone, sujet, message }) {
  const content = `
    <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:12px;overflow:hidden">
      ${fieldRow('Nom', nom)}
      ${fieldRow('Email', email)}
      ${fieldRow('Téléphone', telephone)}
      ${fieldRow('Sujet', sujet)}
      ${fieldRow('Message', message)}
    </table>
  `;
  return sendEmail({
    subject: `[PROQUELEC] Nouveau message de ${nom || 'visiteur'}`,
    html: emailLayout('Nouveau message de contact', content),
    text: `Nouveau message de ${nom}\nEmail: ${email}\nTéléphone: ${telephone}\nSujet: ${sujet}\nMessage: ${message}`,
    replyTo: email,
  });
}

// Notification pour un nouvel utilisateur inscrit
async function sendNewUserNotification({ email, nom, telephone, role }) {
  const content = `
    <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:12px;overflow:hidden">
      ${fieldRow('Nom', nom)}
      ${fieldRow('Email', email)}
      ${fieldRow('Téléphone', telephone)}
      ${fieldRow('Rôle', role)}
    </table>
  `;
  return sendEmail({
    subject: `[PROQUELEC] Nouvel inscrit : ${email}`,
    html: emailLayout('Nouvel utilisateur inscrit', content),
    text: `Nouvel utilisateur inscrit\nNom: ${nom}\nEmail: ${email}\nTéléphone: ${telephone}\nRôle: ${role}`,
  });
}

// Notification email groupée (utilisé par le système de notifications)
async function sendGroupNotification({ to, title, message }) {
  const content = `<div style="background:#f9fafb;border-radius:12px;padding:16px;font-size:14px;color:#374151;line-height:1.6">${escapeHtml(message)}</div>`;
  return sendEmail({
    to,
    subject: `[PROQUELEC] ${title}`,
    html: emailLayout(title, content),
    text: `${title}\n\n${message}`,
  });
}

function welcomeTemplate(name) {
  const subject = `Bienvenue sur PROQUELEC, ${name}`;
  const html = emailLayout(
    `Bienvenue ${name}`,
    `<p>Merci de vous être inscrit sur PROQUELEC. Nous sommes ravis de vous compter parmi nos membres engagés pour la sécurité électrique.</p>`,
  );
  const text = `Bienvenue ${name} !\nMerci de vous être inscrit sur PROQUELEC.`;
  return { subject, html, text };
}

function formationConfirmationTemplate(formationName, name) {
  const safeName = escapeHtml(name);
  const safeFormationName = escapeHtml(formationName);
  const subject = `Confirmation d'inscription à ${formationName}`;
  const html = emailLayout(
    `Confirmation de formation`,
    `<p>Bonjour ${safeName},</p><p>Votre inscription à la formation <strong>${safeFormationName}</strong> a bien été prise en compte.</p>`,
  );
  const text = `Bonjour ${name},\nVotre inscription à la formation ${formationName} a bien été prise en compte.`;
  return { subject, html, text };
}

function certificationNotificationTemplate(certificationName, name) {
  const safeName = escapeHtml(name);
  const safeCertificationName = escapeHtml(certificationName);
  const subject = `Notification de certification : ${certificationName}`;
  const html = emailLayout(
    `Certification enregistrée`,
    `<p>Bonjour ${safeName},</p><p>Votre certification <strong>${safeCertificationName}</strong> a été enregistrée avec succès.</p>`,
  );
  const text = `Bonjour ${name},\nVotre certification ${certificationName} a été enregistrée avec succès.`;
  return { subject, html, text };
}

function contactTemplate(nom, email, sujet, message) {
  const subject = `[PROQUELEC] Nouveau message : ${sujet}`;
  const content = `
    <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:12px;overflow:hidden">
      ${fieldRow('Nom', nom)}
      ${fieldRow('Email', email)}
      ${fieldRow('Sujet', sujet)}
      ${fieldRow('Message', message)}
    </table>
  `;
  const html = emailLayout('Nouveau contact', content);
  const text = `Nouveau message de contact\nNom: ${nom}\nEmail: ${email}\nSujet: ${sujet}\nMessage: ${message}`;
  return { subject, html, text };
}

// Envoyer une confirmation d'inscription à un événement
async function sendEventRegistrationConfirmation({
  name,
  email,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
}) {
  const content = `
    <div style="background:#f0fdf4;border:2px solid #86efac;border-radius:12px;padding:24px;margin-bottom:20px;text-align:center">
      <div style="font-size:40px;margin-bottom:12px">🎉</div>
      <h3 style="color:#166534;margin:0 0 8px;font-size:18px">Inscription confirmée !</h3>
      <p style="color:#374151;font-size:14px;margin:0">Vous êtes bien inscrit à l'événement ci-dessous.</p>
    </div>
    <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:12px;overflow:hidden">
      ${fieldRow('Événement', eventTitle)}
      ${fieldRow('Date', eventDate)}
      ${fieldRow('Horaire', eventTime)}
      ${fieldRow('Lieu', eventLocation)}
    </table>
    <p style="color:#6b7280;font-size:13px;margin-top:20px;padding-top:16px;border-top:1px solid #e5e7eb">
      Un membre de l'équipe PROQUELEC pourra vous contacter pour finaliser votre participation.
    </p>
  `;
  const html = emailLayout("Confirmation d'inscription", content);
  const text = `Confirmation d'inscription à : ${eventTitle}\nDate: ${eventDate}\nLieu: ${eventLocation}`;
  return sendEmail({
    to: email,
    subject: `[PROQUELEC] Confirmation - ${eventTitle}`,
    html,
    text,
    replyTo: 'proquelec@proquelec.sn',
  });
}

// Notifier l'admin PROQUELEC d'une nouvelle inscription
async function sendEventRegistrationNotification({
  name,
  email,
  phone,
  company,
  message,
  eventTitle,
}) {
  const content = `
    <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:12px;overflow:hidden">
      ${fieldRow('Événement', eventTitle)}
      ${fieldRow('Participant', name)}
      ${fieldRow('Email', email)}
      ${fieldRow('Téléphone', phone || 'Non renseigné')}
      ${fieldRow('Entreprise', company || 'Non renseigné')}
      ${fieldRow('Message', message || 'Non renseigné')}
    </table>
  `;
  const html = emailLayout('Nouvelle inscription à un événement', content);
  const text = `Nouvelle inscription de ${name} à ${eventTitle}`;
  return sendEmail({
    subject: `[PROQUELEC] Nouvelle inscription : ${name} → ${eventTitle}`,
    html,
    text,
  });
}

// Notifier le partenaire que son événement a été validé ou refusé
async function sendEventReviewNotification({ name, email, eventTitle, status, comment }) {
  const isApproved = status === 'published';
  const emoji = isApproved ? '✅' : '❌';
  const title = isApproved ? 'Événement approuvé' : 'Événement refusé';
  const message = isApproved
    ? `Votre événement <strong>${eventTitle}</strong> a été approuvé et est désormais visible sur le calendrier public.`
    : `Votre événement <strong>${eventTitle}</strong> n'a pas été retenu. ${comment ? `Motif : ${comment}` : ''}`;

  const content = `
    <div style="background:${isApproved ? '#f0fdf4' : '#fef2f2'};border:2px solid ${isApproved ? '#86efac' : '#fca5a5'};border-radius:12px;padding:24px;margin-bottom:20px;text-align:center">
      <div style="font-size:40px;margin-bottom:12px">${emoji}</div>
      <h3 style="color:${isApproved ? '#166534' : '#991b1b'};margin:0 0 8px;font-size:18px">${title}</h3>
      <p style="color:#374151;font-size:14px;margin:0">${message}</p>
    </div>
  `;
  const html = emailLayout(title, content);
  return sendEmail({
    to: email,
    subject: `[PROQUELEC] ${title} : ${eventTitle}`,
    html,
    text: message.replace(/<[^>]*>/g, ''),
  });
}

const emailTemplates = {
  welcome: welcomeTemplate,
  formationConfirmation: formationConfirmationTemplate,
  certificationNotification: certificationNotificationTemplate,
  contact: contactTemplate,
};

module.exports = {
  sendEmail,
  sendContactNotification,
  sendNewUserNotification,
  sendGroupNotification,
  sendEventRegistrationConfirmation,
  sendEventRegistrationNotification,
  sendEventReviewNotification,
  getEmailConfig: getPublicEmailConfig,
  emailTemplates,
};
