
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Asset {
    id: string;
    title: string;
    description: string | null;
    category: string;
    asset_type: string;
    file_size: string | null;
    file_url: string;
    bucket: string; // Nouveau champ V2.1
    preview_url: string | null;
    is_premium: boolean;
    price_fcfy: number;
    monetization_active: boolean;
    download_stats: number;
    metadata: any;
    created_at: string;
    updated_at: string;
}

export const useAssets = (category?: string) => {
    return useQuery({
        queryKey: ["assets", category],
        queryFn: async () => {
            let query = (supabase as any).from("site_assets").select("*").order("created_at", { ascending: false });

            if (category && category !== "Tous les documents") {
                query = query.eq("category", category);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as Asset[];
        },
    });
};

export const useCreateAsset = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (newAsset: Partial<Asset>) => {
            const { data, error } = await (supabase as any).from("site_assets").insert([newAsset]).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assets"] });
            toast({
                title: "Ressource créée",
                description: "Le document a été ajouté avec succès.",
            });
        },
        onError: (error) => {
            toast({
                title: "Erreur",
                description: error.message,
                variant: "destructive",
            });
        },
    });
};

export const useUpdateAsset = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (updatedAsset: Partial<Asset> & { id: string }) => {
            const { id, ...changes } = updatedAsset;
            const { data, error } = await (supabase as any).from("site_assets").update(changes).eq("id", id).select().single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assets"] });
            toast({
                title: "Ressource mise à jour",
                description: "Les modifications ont été enregistrées.",
            });
        },
        onError: (error) => {
            toast({
                title: "Erreur",
                description: error.message,
                variant: "destructive",
            });
        },
    });
};

export const useDeleteAsset = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await (supabase as any).from("site_assets").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assets"] });
            toast({
                title: "Ressource supprimée",
                description: "Le document a été retiré de la bibliothèque.",
            });
        },
        onError: (error) => {
            toast({
                title: "Erreur",
                description: error.message,
                variant: "destructive",
            });
        },
    });
};
