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
    <div style="font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#fafafa;padding:40px 20px;color:#333333;line-height:1.6;">
      <div style="max-width:600px;margin:0 auto;background-color:#ffffff;border:1px solid #eaeaea;border-radius:8px;overflow:hidden;">
        <!-- Header minimaliste -->
        <div style="padding:40px 40px 20px;text-align:center;border-bottom:1px solid #f5f5f5;">
          <img src="https://proquelec.sn/logo.png" alt="PROQUELEC" width="180" style="width:180px; max-width:100%; height:auto; display:block; margin:0 auto 20px;" onerror="this.style.display='none'">
          <h1 style="margin:0;font-size:24px;font-weight:400;color:#111111;letter-spacing:-0.5px;">${safeTitle}</h1>
        </div>

        <!-- Corps du message -->
        <div style="padding:40px;">
          ${content}
        </div>

        <!-- Footer épuré -->
        <div style="padding:30px 40px;background-color:#fafafa;border-top:1px solid #eaeaea;text-align:center;">
          <p style="margin:0;font-size:12px;color:#888888;text-transform:uppercase;letter-spacing:1px;font-weight:600;">PROQUELEC</p>
          <p style="margin:8px 0 0;font-size:12px;color:#999999;">Promotion de la Qualité des Installations Électriques au Sénégal</p>
          <div style="margin-top:16px;padding-top:16px;border-top:1px solid #eeeeee;">
            <a href="mailto:proquelec@proquelec.sn" style="color:#666666;text-decoration:none;font-size:11px;">proquelec@proquelec.sn</a>
            <span style="color:#cccccc;margin:0 8px;">|</span>
            <a href="tel:+221330000000" style="color:#666666;text-decoration:none;font-size:11px;">+221 33 000 00 00</a>
          </div>
        </div>
      </div>
      <div style="max-width:600px;margin:20px auto 0;text-align:center;">
         <p style="font-size:11px;color:#aaaaaa;">Ceci est une notification automatique. Merci de ne pas répondre directement à cet email sauf indication contraire.</p>
      </div>
    </div>
  `;
}

function fieldRow(label, value) {
  const safeLabel = escapeHtml(label);
  const safeValue = value ? escapeHtml(value) : '<span style="color:#bbbbbb;font-style:italic;">Non renseigné</span>';
  return `
    <div style="margin-bottom:24px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888888;font-weight:600;margin-bottom:6px;">${safeLabel}</div>
      <div style="font-size:15px;color:#222222;white-space:pre-wrap;">${safeValue}</div>
    </div>
  `;
}

// Envoyer une notification pour un nouveau contact
async function sendContactNotification({ nom, email, telephone, sujet, message }) {
  const content = `
    <div style="padding-top:10px;">
      ${fieldRow('Nom', nom)}
      ${fieldRow('Email', email)}
      ${fieldRow('Téléphone', telephone)}
      ${fieldRow('Sujet', sujet)}
      ${fieldRow('Message', message)}
    </div>
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
    <div style="padding-top:10px;">
      ${fieldRow('Nom', nom)}
      ${fieldRow('Email', email)}
      ${fieldRow('Téléphone', telephone)}
      ${fieldRow('Rôle', role)}
    </div>
  `;
  return sendEmail({
    subject: `[PROQUELEC] Nouvel inscrit : ${email}`,
    html: emailLayout('Nouvel utilisateur inscrit', content),
    text: `Nouvel utilisateur inscrit\nNom: ${nom}\nEmail: ${email}\nTéléphone: ${telephone}\nRôle: ${role}`,
  });
}

// Notification email groupée (utilisé par le système de notifications)
async function sendGroupNotification({ to, title, message }) {
  const content = `<div style="padding:24px;background:#fafafa;border:1px solid #eaeaea;border-radius:8px;font-size:15px;color:#333333;line-height:1.6">${escapeHtml(message)}</div>`;
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
    <div style="padding-top:10px;">
      ${fieldRow('Nom', nom)}
      ${fieldRow('Email', email)}
      ${fieldRow('Sujet', sujet)}
      ${fieldRow('Message', message)}
    </div>
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
    <div style="background:#fafafa;border:1px solid #eaeaea;border-radius:8px;padding:24px;margin-bottom:30px;text-align:center">
      <div style="font-size:32px;margin-bottom:12px">🎉</div>
      <h3 style="color:#111111;margin:0 0 8px;font-size:18px;font-weight:400">Inscription confirmée !</h3>
      <p style="color:#666666;font-size:14px;margin:0">Vous êtes bien inscrit à l'événement ci-dessous.</p>
    </div>
    <div style="padding-top:10px;">
      ${fieldRow('Événement', eventTitle)}
      ${fieldRow('Date', eventDate)}
      ${fieldRow('Horaire', eventTime)}
      ${fieldRow('Lieu', eventLocation)}
    </div>
    <p style="color:#888888;font-size:13px;margin-top:20px;padding-top:20px;border-top:1px solid #eaeaea;font-style:italic;">
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
    <div style="padding-top:10px;">
      ${fieldRow('Événement', eventTitle)}
      ${fieldRow('Participant', name)}
      ${fieldRow('Email', email)}
      ${fieldRow('Téléphone', phone || 'Non renseigné')}
      ${fieldRow('Entreprise', company || 'Non renseigné')}
      ${fieldRow('Message', message || 'Non renseigné')}
    </div>
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
