
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

// Helper for authorized fetch
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const res = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Request failed');
  }
  return res.json();
};

export function useProfessionalTraining() {
  return useQuery({
    queryKey: ["professional-training"],
    queryFn: async (): Promise<ProfessionalTraining[]> => {
      try {
        const res = await fetch("/api/professional-training");
        if (!res.ok) throw new Error("Failed to fetch trainings");
        return await res.json();
      } catch (error) {
        toast.error('Erreur lors de la récupération des formations.');
        return [];
      }
    },
    staleTime: 1000 * 60 * 10
  });
}

export function useTrainingRegistrations() {
  return useQuery({
    queryKey: ["training-registrations"],
    queryFn: async (): Promise<TrainingRegistration[]> => {
      try {
        const res = await authFetch("/api/training-registrations");
        return res as TrainingRegistration[];
      } catch (error) {
        toast.error('Erreur lors de la récupération des inscriptions.');
        return [];
      }
    },
    staleTime: 1000 * 60 * 5
  });
}

export function useRegisterForTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (registration: Omit<TrainingRegistration, 'id' | 'registration_date'>) => {


      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Vous devez être connecté pour vous inscrire');
        throw new Error('Vous devez être connecté pour vous inscrire');
      }

      return await authFetch("/api/training-registrations", {
        method: 'POST',
        body: JSON.stringify(registration)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-registrations"] });
      toast.success('Inscription enregistrée avec succès');
    },
    onError: (error: unknown) => {
      toast.error(`Erreur d'inscription: ${error.message}`);
    }
  });
}