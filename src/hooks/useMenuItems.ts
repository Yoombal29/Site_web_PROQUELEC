
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];
type MenuItemInsert = Database["public"]["Tables"]["menu_items"]["Insert"];
type MenuItemUpdate = Database["public"]["Tables"]["menu_items"]["Update"];

export function useMenuItems() {
  return useQuery({
    queryKey: ["menu-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("menu_order");
      
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (menuItem: MenuItemInsert) => {
      const { data, error } = await supabase
        .from("menu_items")
        .insert([menuItem])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });
}

export function useUpdateMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: MenuItemUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("menu_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });
}

export function useDeleteMenuItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
    },
  });
}
