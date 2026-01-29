
import { supabase } from '@/integrations/supabase/client';

interface EmailNotification {
  to: string[];
  subject: string;
  html: string;
  from?: string;
}

export function useEmailNotifications() {
  const sendNotification = async (notification: EmailNotification) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-notification-email', {
        body: notification,
      });

      if (error) {
        console.error('Erreur envoi email:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Erreur:', error);
      return { success: false, error };
    }
  };

  const sendTrainingRegistrationConfirmation = async (
    email: string,
    participantName: string,
    trainingTitle: string
  ) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2376df;">Confirmation d'inscription - PROQUELEC</h2>
        <p>Bonjour ${participantName},</p>
        <p>Votre inscription à la formation <strong>"${trainingTitle}"</strong> a bien été enregistrée.</p>
        <p>Vous recevrez prochainement les détails pratiques de la formation.</p>
        <p>Cordialement,<br>L'équipe PROQUELEC</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          PROQUELEC - Promotion de la Qualité des Installations Électriques<br>
          Depuis 1995 • Sécurité • Qualité • Formation
        </p>
      </div>
    `;

    return sendNotification({
      to: [email],
      subject: `Confirmation d'inscription - ${trainingTitle}`,
      html,
    });
  };

  const sendCertificationReminder = async (
    email: string,
    userName: string,
    certificationName: string,
    expiryDate: string
  ) => {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2376df;">Rappel de renouvellement - PROQUELEC</h2>
        <p>Bonjour ${userName},</p>
        <p>Votre certification <strong>"${certificationName}"</strong> arrive à expiration le ${expiryDate}.</p>
        <p>N'oubliez pas de planifier votre renouvellement pour maintenir vos qualifications à jour.</p>
        <p>Contactez-nous pour organiser votre formation de renouvellement.</p>
        <p>Cordialement,<br>L'équipe PROQUELEC</p>
      </div>
    `;

    return sendNotification({
      to: [email],
      subject: `Rappel de renouvellement - ${certificationName}`,
      html,
    });
  };

  return {
    sendNotification,
    sendTrainingRegistrationConfirmation,
    sendCertificationReminder,
  };
}
