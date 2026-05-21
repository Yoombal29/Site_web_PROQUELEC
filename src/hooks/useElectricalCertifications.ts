
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

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
      try {
        const data = await apiFetch<ElectricalCertification[]>('/api/electrical-certifications');
        return data || [];
      } catch (error) {
        console.error('Erreur certifications:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useCreateCertification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (certification: Omit<ElectricalCertification, 'id' | 'created_at' | 'updated_at'>) => {
      const data = await apiFetch('/api/electrical-certifications', {
        method: 'POST',
        body: JSON.stringify(certification)
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["electrical-certifications"] });
    },
  });
}
