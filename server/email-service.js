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
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08),0 1px 2px rgba(0,0,0,0.04)">
      <div style="background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);padding:32px 24px;text-align:center">
        <div style="font-size:32px;margin-bottom:8px">⚡</div>
        <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.3px">PROQUELEC</h1>
        <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px">Sécurité &middot; Qualité &middot; Formation</p>
      </div>
      <div style="padding:32px 24px">
        <h2 style="color:#111827;font-size:18px;font-weight:600;margin:0 0 4px">${title}</h2>
        <p style="color:#6b7280;font-size:14px;margin:0 0 24px;border-bottom:1px solid #f3f4f6;padding-bottom:16px">Notification depuis le site proquelec.sn</p>
        ${content}
      </div>
      <div style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #f3f4f6">
        <p style="color:#9ca3af;font-size:11px;margin:0">PROQUELEC &mdash; Promotion de la Qualité des Installations Électriques au Sénégal</p>
        <p style="color:#d1d5db;font-size:10px;margin:4px 0 0">© ${new Date().getFullYear()} PROQUELEC &bull; contact@proquelec.sn</p>
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

module.exports = {
  sendEmail,
  sendContactNotification,
  sendNewUserNotification,
  sendGroupNotification,
};
