
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProfessionalTraining {
  id: string;
  title: string;
  description: string | null;
  duration_hours: number;
  level: string | null;
  certification_id: string | null;
  price: number | null;
  max_participants: number;
  instructor_name: string | null;
  location: string | null;
  equipment_provided: boolean;
  prerequisites: string[] | null;
  learning_objectives: string[] | null;
  is_active: boolean;
  created_at: string;
}

export interface TrainingRegistration {
  id: string;
  training_id: string;
  user_id: string;
  participant_name: string;
  participant_email: string;
  participant_phone: string | null;
  company_name: string | null;
  registration_date: string;
  status: string;
  payment_status: string;
  special_requirements: string | null;
}

export function useProfessionalTraining() {
  return useQuery({
    queryKey: ["professional-training"],
    queryFn: async (): Promise<ProfessionalTraining[]> => {
      const { data, error } = await supabase
        .from('professional_training')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Erreur lors de la récupération des formations.');
        throw error;
      }

      return (data || []) as ProfessionalTraining[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useTrainingRegistrations() {
  return useQuery({
    queryKey: ["training-registrations"],
    queryFn: async (): Promise<TrainingRegistration[]> => {
      const { data, error } = await supabase
        .from('training_registrations')
        .select('*')
        .order('registration_date', { ascending: false });

      if (error) {
        toast.error('Erreur lors de la récupération des inscriptions.');
        throw error;
      }

      return (data || []) as TrainingRegistration[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useRegisterForTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (registration: Omit<TrainingRegistration, 'id' | 'registration_date'>) => {
      console.log('Tentative d\'inscription:', registration);
      
      // Vérifier que l'utilisateur est authentifié
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        toast.error('Vous devez être connecté pour vous inscrire');
        throw new Error('Vous devez être connecté pour vous inscrire');
      }

      const user = session.user;
      console.log('Utilisateur connecté pour inscription:', user.id);

      // Préparer les données d'inscription
      const registrationData = {
        ...registration,
        user_id: user.id, // S'assurer que l'ID utilisateur est correct
        registration_date: new Date().toISOString(),
        status: 'pending',
        payment_status: 'pending'
      };

      console.log('Données d\'inscription à insérer:', registrationData);

      const { data, error } = await supabase
        .from('training_registrations')
        .insert([registrationData])
        .select()
        .single();

      if (error) {
        toast.error('Erreur lors de l\'inscription.');
        throw new Error(`Erreur d'inscription: ${error.message}`);
      }

      console.log('Inscription réussie:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-registrations"] });
      toast.success('Inscription enregistrée avec succès');
    },
    onError: (error: any) => {
      toast.error(`Erreur d'inscription: ${error.message}`);
    },
  });
}
