import { supabase } from './supabase/client';

interface ContactFormData {
  nom: string;
  email: string;
  telephone?: string;
  sujet?: string;
  message: string;
}

interface NewsletterData {
  email: string;
  source: string;
}

/**
 * Envoie un email de contact
 */
export async function sendContactEmail(data: ContactFormData) {
  try {
    // Sauvegarder dans la base de données
    const { error: dbError } = await supabase
      .from('contact_requests')
      .insert([
        {
          nom: data.nom,
          email: data.email,
          telephone: data.telephone || null,
          sujet: data.sujet || null,
          message: data.message,
          submitted_at: new Date().toISOString(),
          status: 'nouveau'
        }
      ]);

    if (dbError) throw dbError;

    // Appeler une fonction serverless pour envoyer l'email
    const { data: response, error } = await supabase.functions.invoke('send-contact-email', {
      body: {
        ...data,
        timestamp: new Date().toISOString()
      }
    });

    if (error) {
      console.error('Erreur envoi email:', error);
      // Ne pas bloquer l'utilisateur même si l'email échoue
      return { success: true, emailSent: false };
    }

    return { success: true, emailSent: true, response };
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
    const { data, error } = await supabase.functions.invoke('send-newsletter-email', {
      body: {
        email,
        type: 'welcome',
        timestamp: new Date().toISOString()
      }
    });

    if (error) throw error;
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
    const { data, error } = await supabase.functions.invoke('send-formation-email', {
      body: {
        email,
        formationName,
        date,
        timestamp: new Date().toISOString()
      }
    });

    if (error) throw error;
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
    const { data, error } = await supabase.functions.invoke('send-certification-email', {
      body: {
        email,
        certificationName,
        timestamp: new Date().toISOString()
      }
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erreur certification email:', error);
    return { success: false, error };
  }
}
