import { apiFetch } from '@/lib/api-client';

interface ContactFormData {
  nom: string;
  email: string;
  telephone?: string;
  sujet?: string;
  message: string;
}

/**
 * Envoie un email de contact
 */
export async function sendContactEmail(data: ContactFormData) {
  try {
    // Sauvegarder dans la base de données via l'API locale
    const result = await apiFetch<unknown>('/api/contact-requests', {
      method: 'POST',
      body: JSON.stringify(data)
    });

    // Appeler le service d'envoi d'email local (placeholder ou réel)
    try {
      await apiFetch<unknown>('/api/send-email', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString()
        })
      });
    } catch (e) {
      console.error('Erreur envoi email (backend):', e);
      // Ne pas bloquer l'utilisateur même si l'email échoue
      return { success: true, emailSent: false, result };
    }

    return { success: true, emailSent: true, result };
  } catch (error) {
    console.error('Erreur service email:', error);
    throw error;
  }
}

/**
 * Envoie email de bienvenue newsletter
 */
export async function sendNewsletterWelcomeEmail(email: string) {
  try {
    const data = await apiFetch<unknown>('/api/email/welcome', {
      method: 'POST',
      body: JSON.stringify({
        email,
        type: 'welcome',
        timestamp: new Date().toISOString()
      })
    });

    return { success: true, data };
  } catch (error) {
    console.error('Erreur newsletter email:', error);
    return { success: false, error };
  }
}

/**
 * Envoie email de notification formation inscrite
 */
export async function sendFormationConfirmationEmail(email: string, formationName: string, date: string) {
  try {
    const data = await apiFetch<unknown>('/api/email/formation-confirmation', {
      method: 'POST',
      body: JSON.stringify({
        email,
        formationName,
        date,
        timestamp: new Date().toISOString()
      })
    });

    return { success: true, data };
  } catch (error) {
    console.error('Erreur formation email:', error);
    return { success: false, error };
  }
}

/**
 * Envoie email de notification certification
 */
export async function sendCertificationNotificationEmail(email: string, certificationName: string) {
  try {
    const data = await apiFetch<unknown>('/api/email/certification-notification', {
      method: 'POST',
      body: JSON.stringify({
        email,
        certificationName,
        timestamp: new Date().toISOString()
      })
    });

    return { success: true, data };
  } catch (error) {
    console.error('Erreur certification email:', error);
    return { success: false, error };
  }
}