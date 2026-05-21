
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export interface ElectricalEquipment {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  specifications: unknown;
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
      try {
        const data = await apiFetch<ElectricalEquipment[]>('/api/electrical-equipment');
        return data || [];
      } catch (error) {
        console.error('Erreur équipements:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 15
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (equipment: Omit<ElectricalEquipment, 'id' | 'created_at'>) => {
      const data = await apiFetch('/api/electrical-equipment', {
        method: 'POST',
        body: JSON.stringify(equipment)
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["electrical-equipment"] });
    }
  });
}