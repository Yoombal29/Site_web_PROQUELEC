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
    tls: { rejectUnauthorized: false }
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
      replyTo: replyTo || from
    });
    console.log('[EMAIL] Envoyé:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EMAIL] Erreur:', error.message);
    return { success: false, error: error.message };
  }
}

// Envoyer une notification pour un nouveau contact
async function sendContactNotification({ nom, email, telephone, sujet, message }) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
      <div style="background:linear-gradient(to right,#1e3a5f,#2563eb);padding:24px;text-align:center">
        <h1 style="color:white;margin:0;font-size:20px">Nouveau message de contact</h1>
      </div>
      <div style="padding:24px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px;font-weight:bold;color:#374151;width:120px">Nom</td><td style="padding:8px;color:#374151">${nom || 'Non renseigné'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#374151">Email</td><td style="padding:8px;color:#374151">${email || 'Non renseigné'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#374151">Téléphone</td><td style="padding:8px;color:#374151">${telephone || 'Non renseigné'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#374151">Sujet</td><td style="padding:8px;color:#374151">${sujet || 'Non renseigné'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;color:#374151;vertical-align:top">Message</td><td style="padding:8px;color:#374151">${message || 'Non renseigné'}</td></tr>
        </table>
        <p style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px">
          Message envoyé depuis le formulaire de contact de proquelec.sn
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    subject: `[PROQUELEC] Nouveau message de ${nom || 'visiteur'}`,
    html,
    text: `Nouveau message de ${nom}\nEmail: ${email}\nTéléphone: ${telephone}\nSujet: ${sujet}\nMessage: ${message}`,
    replyTo: email
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
    text: `Nouvel utilisateur: ${nom}\nEmail: ${email}\nTéléphone: ${telephone}\nRôle: ${role}`
  });
}

module.exports = { sendEmail, sendContactNotification, sendNewUserNotification };
