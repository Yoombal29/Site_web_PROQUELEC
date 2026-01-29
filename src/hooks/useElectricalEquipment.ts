
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ElectricalEquipment {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  specifications: any;
  price: number | null;
  rental_price_daily: number | null;
  availability_status: string;
  description: string | null;
  safety_instructions: string[] | null;
  certification_standards: string[] | null;
  image_url: string | null;
  manual_url: string | null;
  is_rental: boolean;
  stock_quantity: number;
  created_at: string;
}

export function useElectricalEquipment() {
  return useQuery({
    queryKey: ["electrical-equipment"],
    queryFn: async (): Promise<ElectricalEquipment[]> => {
      const { data, error } = await supabase
        .from('electrical_equipment')
        .select('*')
        .eq('availability_status', 'available')
        .order('name');

      if (error) {
        console.error('Erreur équipements:', error);
        throw error;
      }

      return (data || []) as ElectricalEquipment[];
    },
    staleTime: 1000 * 60 * 15,
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (equipment: Omit<ElectricalEquipment, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('electrical_equipment')
        .insert([equipment])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["electrical-equipment"] });
    },
  });
}
