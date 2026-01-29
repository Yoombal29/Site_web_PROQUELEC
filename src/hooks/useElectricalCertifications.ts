
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ElectricalCertification {
  id: string;
  name: string;
  code: string;
  description: string | null;
  validity_period: number;
  required_training_hours: number;
  certification_body: string | null;
  cost: number | null;
  requirements: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useElectricalCertifications() {
  return useQuery({
    queryKey: ["electrical-certifications"],
    queryFn: async (): Promise<ElectricalCertification[]> => {
      const { data, error } = await supabase
        .from('electrical_certifications')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Erreur certifications:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useCreateCertification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (certification: Omit<ElectricalCertification, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('electrical_certifications')
        .insert([certification])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["electrical-certifications"] });
    },
  });
}
