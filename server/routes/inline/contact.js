const { authenticateToken, requireAdmin } = require('../../core/middleware');
const { handleAppError } = require('../../core/errors');

function mountContactRoutes(app, pool, deps) {
  const { validateContactRequestPayload, buildEmailNotificationPayload, sendContactNotification, sendEmail, emailTemplates } = deps;

  app.post('/api/contact-requests', async (req, res) => {
    const { payload, errors } = validateContactRequestPayload(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ error: 'Validation échouée', details: errors });
    }
    const { nom, email, telephone, sujet, message } = payload;
    try {
      const result = await pool.query(
        'INSERT INTO public.contact_requests (nom, email, telephone, sujet, message, submitted_at, status) VALUES ($1, $2, $3, $4, $5, NOW(), $6) RETURNING *',
        [nom, email, telephone, sujet, message, 'nouveau'],
      );
      const emailResult = await sendContactNotification({ nom, email, telephone, sujet, message });
      const emailNotification = buildEmailNotificationPayload(emailResult);
      if (!emailResult.success) {
        console.warn('[CONTACT] Email notification failed:', emailResult.error);
        return res.status(502).json({
          error: 'EMAIL_SEND_FAILED',
          message: 'Votre demande a été enregistrée, mais la notification email PROQUELEC n\'a pas pu être envoyée.',
          saved: true, contact_request: result.rows[0],
          email_notification: { ...emailNotification, error: emailResult.error || 'Erreur SMTP inconnue' },
        });
      }
      if (emailResult.simulated) {
        console.warn('[CONTACT] Email notification simulated:', emailResult.reason);
      } else {
        console.log('[CONTACT] Email notification sent:', emailResult.messageId);
      }
      res.status(201).json({ ...result.rows[0], email_notification: emailNotification });
    } catch (error) {
      handleAppError(error, res);
    }
  });

  app.post('/api/email/welcome', async (req, res) => {
    try {
      const { email, name } = req.body;
      const template = emailTemplates.welcome(name || 'Utilisateur');
      const result = await sendEmail({ to: email, ...template });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "Erreur d'envoi d'email", details: err.message });
    }
  });

  app.post('/api/email/formation-confirmation', async (req, res) => {
    try {
      const { email, formationName, name } = req.body;
      const template = emailTemplates.formationConfirmation(formationName, name || 'Utilisateur');
      const result = await sendEmail({ to: email, ...template });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "Erreur d'envoi d'email", details: err.message });
    }
  });

  app.post('/api/email/certification-notification', async (req, res) => {
    try {
      const { email, certificationName, name } = req.body;
      const template = emailTemplates.certificationNotification(certificationName, name || 'Utilisateur');
      const result = await sendEmail({ to: email, ...template });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "Erreur d'envoi d'email", details: err.message });
    }
  });
}

module.exports = { mountContactRoutes };
