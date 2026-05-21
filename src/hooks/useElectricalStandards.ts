
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export interface ElectricalStandard {
  id: string;
  code: string;
  title: string;
  description: string | null;
  category: string;
  version: string | null;
  publication_date: string | null;
  effective_date: string | null;
  status: string;
  superseded_by: string | null;
  document_url: string | null;
  summary: string | null;
  key_changes: string[] | null;
  applicable_sectors: string[] | null;
  created_at: string;
}

export function useElectricalStandards() {
  return useQuery({
    queryKey: ["electrical-standards"],
    queryFn: async (): Promise<ElectricalStandard[]> => {
      try {
        const data = await apiFetch<ElectricalStandard[]>('/api/electrical-standards');
        return data || [];
      } catch (error) {
        console.error('Erreur normes:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useCreateStandard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (standard: Omit<ElectricalStandard, 'id' | 'created_at'>) => {
      const data = await apiFetch('/api/electrical-standards', {
        method: 'POST',
        body: JSON.stringify(standard)
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["electrical-standards"] });
    },
  });
}
