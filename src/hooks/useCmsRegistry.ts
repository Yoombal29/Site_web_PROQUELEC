
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import { CmsPlugin, CmsTheme } from '@/types/PageSystem';

export function useCmsPlugins() {
  return useQuery({
    queryKey: ['cms-plugins'],
    queryFn: async () => {
      // Simulated local implementation or use actual endpoint if implemented
      try {
        const data = await apiFetch<CmsPlugin[]>('/api/cms/plugins');
        return data;
      } catch (e) {
        // Fallback for missing endpoint
        console.warn("CMS Plugins missing, using mock");
        return [];
      }
    }
  });
}

export function useCmsThemes() {
  return useQuery({
    queryKey: ['cms-themes'],
    queryFn: async () => {
      try {
        const data = await apiFetch<CmsTheme[]>('/api/cms/themes');
        return data;
      } catch (e) {
        console.warn("CMS Themes missing, using mock");
        return [];
      }
    }
  });
}

export function useTogglePlugin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: {id: string;is_active: boolean;}) => {
      const data = await apiFetch<unknown>(`/api/cms/plugins/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active_globally: is_active })
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-plugins'] });
    }
  });
}