
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api-client";

export interface Asset {
  id: string;
  title: string;
  description: string | null;
  category: string;
  asset_type: string;
  file_size: string | null;
  file_url: string;
  bucket: string;
  preview_url: string | null;
  is_premium: boolean;
  price_fcfy: number;
  monetization_active: boolean;
  download_stats: number;
  metadata: unknown;
  created_at: string;
  updated_at: string;
}

export const useAssets = (category?: string) => {
  return useQuery({
    queryKey: ["assets", category],
    queryFn: async () => {
      const url = category && category !== "Tous les documents" ?
      `/api/site-assets?category=${encodeURIComponent(category)}` :
      '/api/site-assets';
      const data = await apiFetch<Asset[]>(url);
      return data || [];
    }
  });
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newAsset: Partial<Asset>) => {
      const data = await apiFetch('/api/site-assets', {
        method: 'POST',
        body: JSON.stringify(newAsset)
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast({
        title: "Ressource créée",
        description: "Le document a été ajouté avec succès."
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useUpdateAsset = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updatedAsset: Partial<Asset> & {id: string;}) => {
      const { id, ...changes } = updatedAsset;
      const data = await apiFetch(`/api/site-assets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(changes)
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast({
        title: "Ressource mise à jour",
        description: "Les modifications ont été enregistrées."
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch(`/api/site-assets/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast({
        title: "Ressource supprimée",
        description: "Le document a été retiré de la bibliothèque."
      });
    },
    onError: (error: unknown) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};