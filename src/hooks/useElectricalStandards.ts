
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
      const { data, error } = await supabase
        .from('electrical_standards')
        .select('*')
        .eq('status', 'active')
        .order('code');

      if (error) {
        console.error('Erreur normes:', error);
        throw error;
      }

      return (data || []) as ElectricalStandard[];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useCreateStandard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (standard: Omit<ElectricalStandard, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('electrical_standards')
        .insert([standard])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["electrical-standards"] });
    },
  });
}
