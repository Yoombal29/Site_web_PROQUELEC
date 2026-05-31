const nodemailer = require('nodemailer');
const { getCapability } = require('./core/runtime/capabilities');

let transporter = null;

function getTransporter() {
    if (transporter) return transporter;

    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        const cap = getCapability('email');
        if (!cap.available && cap.mode !== 'mock') {
            console.error('[EMAIL] SMTP non configuré et email non disponible.');
            return null;
        }
        console.warn('[EMAIL] SMTP non configuré — mode mock, emails loggés uniquement.');
        return null;
    }

    transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
    });

    return transporter;
}

async function sendEmail({ to, subject, html, text }) {
    const from = process.env.SMTP_FROM || 'noreply@proquelec.com';
    const transport = getTransporter();

    if (!transport) {
        console.log(`[EMAIL SIMULÉ] À: ${to}, Sujet: ${subject}`);
        return { success: true, simulated: true };
    }

    try {
        const info = await transport.sendMail({ from, to, subject, html, text });
        console.log(`[EMAIL] Envoyé à ${to} (id: ${info.messageId})`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error(`[EMAIL] Erreur envoi à ${to}:`, err.message);
        throw err;
    }
}

const emailTemplates = {
    welcome: (name) => ({
        subject: 'Bienvenue sur PROQUELEC',
        html: `<h1>Bienvenue ${name} !</h1><p>Merci de votre inscription sur la plateforme PROQUELEC.</p>`
    }),
    formationConfirmation: (formationName, name) => ({
        subject: `Confirmation d'inscription - ${formationName}`,
        html: `<h1>Inscription confirmée</h1><p>Bonjour ${name},<br>Votre inscription à la formation <strong>${formationName}</strong> est confirmée.</p>`
    }),
    certificationNotification: (certificationName, name) => ({
        subject: `Notification certification - ${certificationName}`,
        html: `<h1>Mise à jour certification</h1><p>Bonjour ${name},<br>La certification <strong>${certificationName}</strong> a été mise à jour.</p>`
    }),
    contact: (nom, email, sujet, message) => ({
        subject: `Nouveau contact: ${sujet}`,
        html: `<h1>Message de ${nom}</h1><p>Email: ${email}</p><p>Sujet: ${sujet}</p><p>Message:</p><p>${message}</p>`
    })
};

module.exports = { sendEmail, emailTemplates };
