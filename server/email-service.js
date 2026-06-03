const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'mail.proquelec.sn';
  const port = parseInt(process.env.SMTP_PORT || '465');
  const user = process.env.SMTP_USER || 'proquelec@proquelec.sn';
  const pass = process.env.SMTP_PASS || '';
  const from = process.env.SMTP_FROM || user;
  const to = process.env.SMTP_TO || user;

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });

  return { transporter, from, to };
}

async function sendEmail({ subject, html, text, replyTo, to: recipient }) {
  try {
    const { transporter, from, to: defaultTo } = getTransporter();
    const info = await transporter.sendMail({
      from: `"PROQUELEC" <${from}>`,
      to: recipient || defaultTo,
      subject,
      html,
      text,
      replyTo: replyTo || from,
    });
    console.log('[EMAIL] Envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EMAIL] Erreur:', error.message);
    return { success: false, error: error.message };
  }
}

function emailLayout(title, content) {
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
        <h2 style="color:#0f2a4a;font-size:20px;font-weight:700;margin:0 0 4px;line-height:1.3">${title}</h2>
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
          <a href="mailto:contact@proquelec.sn" style="color:#2563eb;text-decoration:none">contact@proquelec.sn</a>
        </p>
        <p style="color:#e2e8f0;font-size:9px;margin:12px 0 0;padding-top:12px;border-top:1px solid #e2e8f0">&copy; ${new Date().getFullYear()} PROQUELEC &mdash; Tous droits réservés</p>
      </div>
    </div>
  `;
}

function fieldRow(label, value) {
  return `<tr><td style="padding:10px 12px;font-weight:600;color:#374151;font-size:13px;width:100px;vertical-align:top;white-space:nowrap">${label}</td><td style="padding:10px 12px;color:#111827;font-size:14px;word-break:break-word">${value || '<span style="color:#9ca3af">Non renseigné</span>'}</td></tr>`;
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
  const content = `<div style="background:#f9fafb;border-radius:12px;padding:16px;font-size:14px;color:#374151;line-height:1.6">${message}</div>`;
  return sendEmail({
    to,
    subject: `[PROQUELEC] ${title}`,
    html: emailLayout(title, content),
    text: `${title}\n\n${message}`,
  });
}

// Notification pour un nouvel utilisateur inscrit
async function sendNewUserNotification({ email, nom, telephone, role }) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(to right,#1e3a5f,#2563eb);padding:24px;text-align:center">
        <h1 style="color:white;margin:0;font-size:20px">Nouvel utilisateur inscrit</h1>
      </div>
      <div style="padding:24px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;font-weight:bold;color:#374151;width:120px">Nom</td><td style="padding:8px;color:#374151">${nom || 'Non renseigné'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#374151">Email</td><td style="padding:8px;color:#374151">${email}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#374151">Téléphone</td><td style="padding:8px;color:#374151">${telephone || 'Non renseigné'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#374151">Rôle</td><td style="padding:8px;color:#374151"><strong>${role || 'membre'}</strong></td></tr>
        </table>
        <p style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px">
          Inscription depuis le site proquelec.sn
        </p>
      </div>
    </div>
  `;
  return sendEmail({
    subject: `[PROQUELEC] Nouvel utilisateur inscrit : ${email}`,
    html,
    text: `Nouvel utilisateur: ${nom}\nEmail: ${email}\nTéléphone: ${telephone}\nRôle: ${role}`,
  });
}

function welcomeTemplate(name) {
  const subject = `Bienvenue sur PROQUELEC, ${name}`;
  const html = emailLayout(`Bienvenue ${name}`, `<p>Merci de vous être inscrit sur PROQUELEC. Nous sommes ravis de vous compter parmi nos membres engagés pour la sécurité électrique.</p>`);
  const text = `Bienvenue ${name} !\nMerci de vous être inscrit sur PROQUELEC.`;
  return { subject, html, text };
}

function formationConfirmationTemplate(formationName, name) {
  const subject = `Confirmation d'inscription à ${formationName}`;
  const html = emailLayout(`Confirmation de formation`, `<p>Bonjour ${name},</p><p>Votre inscription à la formation <strong>${formationName}</strong> a bien été prise en compte.</p>`);
  const text = `Bonjour ${name},\nVotre inscription à la formation ${formationName} a bien été prise en compte.`;
  return { subject, html, text };
}

function certificationNotificationTemplate(certificationName, name) {
  const subject = `Notification de certification : ${certificationName}`;
  const html = emailLayout(`Certification enregistrée`, `<p>Bonjour ${name},</p><p>Votre certification <strong>${certificationName}</strong> a été enregistrée avec succès.</p>`);
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
  emailTemplates,
};
