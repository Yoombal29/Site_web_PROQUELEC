import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';
import type { PageTemplate } from '@/stores/templates.store';

interface TemplateDto {
  id: string;
  name: string;
  description: string;
  structure: any;
  theme_config: any;
  category: string | null;
  tags: string[] | null;
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
}

function mapDto(dto: TemplateDto): PageTemplate {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description || '',
    structure: typeof dto.structure === 'string' ? JSON.parse(dto.structure) : dto.structure,
    themeConfig: dto.theme_config ? (typeof dto.theme_config === 'string' ? JSON.parse(dto.theme_config) : dto.theme_config) : undefined,
    category: dto.category || undefined,
    tags: dto.tags || undefined,
    thumbnail: dto.thumbnail || undefined,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      try {
        const data = await apiFetch<TemplateDto[]>('/api/templates');
        return data.map(mapDto);
      } catch {
        return [];
      }
    },
  });
}

export function useTemplate(id: string | null) {
  return useQuery({
    queryKey: ['templates', id],
    queryFn: async () => {
      const data = await apiFetch<TemplateDto>(`/api/templates/${id}`);
      return mapDto(data);
    },
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (template: { name: string; description?: string; structure: any; themeConfig?: any; category?: string }) => {
      return apiFetch('/api/templates', {
        method: 'POST',
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          structure: template.structure,
          theme_config: template.themeConfig,
          category: template.category,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; description?: string; structure?: any; themeConfig?: any; category?: string }) => {
      return apiFetch(`/api/templates/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: updates.name,
          description: updates.description,
          structure: updates.structure,
          theme_config: updates.themeConfig,
          category: updates.category,
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return apiFetch(`/api/templates/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}
