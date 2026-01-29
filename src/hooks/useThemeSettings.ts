
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type ThemeSettings = Database["public"]["Tables"]["theme_settings"]["Row"];
type ThemeSettingsUpdate = Database["public"]["Tables"]["theme_settings"]["Update"];

export function useThemeSettings() {
  return useQuery({
    queryKey: ["theme-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("theme_settings")
        .select("*")
        .single();
      
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateThemeSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: ThemeSettingsUpdate) => {
      const { data, error } = await supabase
        .from("theme_settings")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", 1)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["theme-settings"] });
    },
  });
}
