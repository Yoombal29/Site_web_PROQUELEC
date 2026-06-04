/**
 * Service d'envoi de newsletters avec templates HTML
 */
const { Pool } = require('pg');
const { sendEmail } = require('../email-service');

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5437'),
  database: process.env.DB_NAME || 'proquelec',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'proquelec_secure_db_pass',
});

// ── Template newsletter HTML ──
function newsletterTemplate(title, content, unsubscribeUrl = '') {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background:#f4f6f9; }
  .container { max-width:600px; margin:0 auto; padding:20px; }
  .header { background:linear-gradient(135deg,#1e3a5f,#2563eb); padding:30px; text-align:center; border-radius:16px 16px 0 0; }
  .header h1 { color:#fff; margin:0; font-size:24px; }
  .header p { color:rgba(255,255,255,0.7); margin:8px 0 0; font-size:14px; }
  .body { background:#fff; padding:30px; border-radius:0 0 16px 16px; }
  .body h2 { color:#1e293b; font-size:20px; margin:0 0 16px; }
  .body p { color:#475569; font-size:15px; line-height:1.7; margin:0 0 16px; }
  .footer { text-align:center; padding:20px; color:#94a3b8; font-size:12px; }
  .btn { display:inline-block; padding:12px 28px; background:#2563eb; color:#fff; text-decoration:none; border-radius:8px; font-weight:600; font-size:14px; }
  .unsubscribe { color:#94a3b8; font-size:11px; }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
      <p>PROQUELEC Sénégal</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>PROQUELEC — Promotion de la Qualité des Installations Électriques</p>
      <p>Dakar, Sénégal</p>
      ${unsubscribeUrl ? `<p><a href="${unsubscribeUrl}" class="unsubscribe">Se désabonner</a></p>` : ''}
    </div>
  </div>
</body>
</html>`;
}

// ── Envoyer une newsletter à tous les abonnés ──
async function sendNewsletter({ title, content, subject, senderName = 'PROQUELEC' }) {
  try {
    const subscribers = await pool.query(
      'SELECT email, id FROM public.newsletter_subscribers WHERE is_active = true'
    );

    console.log(`[NEWSLETTER] Envoi à ${subscribers.rows.length} abonnés...`);

    const results = { sent: 0, failed: 0, errors: [] };

    for (const sub of subscribers.rows) {
      try {
        const unsubscribeUrl = `https://proquelec.sn/api/newsletter/unsubscribe?email=${encodeURIComponent(sub.email)}&id=${sub.id}`;
        const html = newsletterTemplate(title, content, unsubscribeUrl);

        await sendEmail({
          to: sub.email,
          subject: subject || title,
          html,
          text: content.replace(/<[^>]*>/g, ''),
        });
        results.sent++;
      } catch (err) {
        results.failed++;
        results.errors.push({ email: sub.email, error: err.message });
      }

      // Petite pause pour éviter de surcharger le SMTP
      if (subscribers.rows.length > 10) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    // Journaliser l'envoi
    if (subscribers.rows.length > 0) {
      try {
        await pool.query(
          `INSERT INTO public.newsletter_campaigns (title, subject, total_sent, total_failed, sent_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [title, subject || title, results.sent, results.failed]
        );
      } catch (e) {
        console.warn('[NEWSLETTER] Impossible de journaliser:', e.message);
      }
    }

    console.log(`[NEWSLETTER] Terminé: ${results.sent} envoyés, ${results.failed} échecs`);
    return results;
  } catch (err) {
    console.error('[NEWSLETTER] Erreur:', err.message);
    throw err;
  }
}

module.exports = { sendNewsletter, newsletterTemplate };
