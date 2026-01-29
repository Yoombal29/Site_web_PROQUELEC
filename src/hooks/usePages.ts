
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type Page = Database["public"]["Tables"]["pages"]["Row"];
type PageInsert = Database["public"]["Tables"]["pages"]["Insert"];
type PageUpdate = Database["public"]["Tables"]["pages"]["Update"];

export function usePages() {
  return useQuery({
    queryKey: ["pages"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("pages")
          .select("*")
          .order("menu_order", { ascending: true });

        if (error) {
          console.warn('Table pages issue:', error.message);
          return [];
        }
        return data || [];
      } catch (error) {
        console.warn('Error fetching pages:', error);
        return [];
      }
    },
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (page: any) => {
      try {
        const { data, error } = await supabase
          .from("pages")
          .insert([page])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error creating page:', error);
        throw error;
      }
    },
    onSuccess: (newPage) => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      queryClient.invalidateQueries({ queryKey: ["dynamic-routes"] });
    },
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      try {
        const { data, error } = await supabase
          .from("pages")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error updating page:', error);
        throw error;
      }
    },
    onSuccess: (updatedPage) => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      queryClient.invalidateQueries({ queryKey: ["dynamic-routes"] });
      queryClient.invalidateQueries({ queryKey: ["dynamic-page", updatedPage.slug] });
    },
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from("pages")
          .delete()
          .eq("id", id);

        if (error) throw error;
      } catch (error) {
        console.error('Error deleting page:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      queryClient.invalidateQueries({ queryKey: ["dynamic-routes"] });
    },
  });
}
