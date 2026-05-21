
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface ComponentConfig {
  id: string;
  type: string;
  settings: Record<string, unknown>;
  styles?: Record<string, unknown>;
  logic?: Record<string, unknown>;
  visibility?: {
    roles?: string[];
    condition?: string;
  };
}

export interface PageConfig {
  id: string;
  slug: string;
  title: string;
  layout: ComponentConfig[];
}

export interface SiteSchema {
  pages: PageConfig[];
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    radius: string;
    font: string;
    customCss?: string;
  };
  globals: {
    header: Record<string, unknown>;
    footer: Record<string, unknown>;
  };
}

const API_URL = '/api';

export function useSiteConfig() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['site-config'],
    queryFn: async (): Promise<SiteSchema> => {
      const res = await fetch(`${API_URL}/site-config`);
      if (!res.ok) throw new Error('Erreur chargement config');
      return res.json();
    }
  });

  const mutation = useMutation({
    mutationFn: async (newSchema: SiteSchema) => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/site-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ schema: newSchema })
      });
      if (res.status === 401 || res.status === 403) {
        throw new Error("Session expirée. Veuillez vous reconnecter.");
      }
      if (!res.ok) throw new Error('Erreur sauvegarde config');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-config'] });
      toast.success("Configuration universelle mise à jour en temps réel.");
    },
    onError: (err: unknown) => {
      toast.error(err.message);
    }
  });

  return {
    schema: query.data,
    isLoading: query.isLoading,
    save: mutation.mutateAsync,
    isSaving: mutation.isPending
  };
}