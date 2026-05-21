
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Database } from "@/types/database";

type ThemeSettings = Database["public"]["Tables"]["theme_settings"]["Row"];
type ThemeSettingsUpdate = Database["public"]["Tables"]["theme_settings"]["Update"];


import { apiFetch } from "@/lib/api-client";

// The local authFetch is now replaced by the centralized apiFetch in src/lib/api-client.ts

export function useThemeSettings() {
  return useQuery({
    queryKey: ["theme-settings"],
    queryFn: async () => {
      const data = await apiFetch<ThemeSettings[]>("/api/theme-settings");
      return Array.isArray(data) ? data[0] : data;
    },
  });
}

export function useUpdateThemeSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: ThemeSettingsUpdate) => {
      return apiFetch("/api/theme-settings", {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["theme-settings"] });
      queryClient.invalidateQueries({ queryKey: ["liveSettings"] });
    },
  });
}

