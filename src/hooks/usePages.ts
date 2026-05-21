
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Database } from "@/types/database";

export type Page = Database["public"]["Tables"]["pages"]["Row"];
type PageInsert = Database["public"]["Tables"]["pages"]["Insert"];
type PageUpdate = Database["public"]["Tables"]["pages"]["Update"];


import { apiFetch } from "@/lib/api-client";

export function usePages() {
  return useQuery({
    queryKey: ["pages"],
    queryFn: async () => {
      try {
        return await apiFetch<Page[]>("/api/pages");
      } catch (error) {
        console.warn('Error fetching pages:', error);
        return [];
      }
    }
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (page: unknown) => {
      return apiFetch("/api/pages", {
        method: 'POST',
        body: JSON.stringify(page)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      queryClient.invalidateQueries({ queryKey: ["dynamic-routes"] });
    }
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: unknown) => {
      return apiFetch(`/api/pages/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    },
    onSuccess: (updatedPage: unknown) => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      queryClient.invalidateQueries({ queryKey: ["dynamic-routes"] });
      if (updatedPage?.slug) {
        queryClient.invalidateQueries({ queryKey: ["dynamic-page", updatedPage.slug] });
      }
    }
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return apiFetch(`/api/pages/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      queryClient.invalidateQueries({ queryKey: ["dynamic-routes"] });
    }
  });
}