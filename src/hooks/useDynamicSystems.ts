import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';

export interface DynamicComponent {
  id: string;
  name: string;
  component_type: string;
  title?: string;
  subtitle?: string;
  content: Record<string, unknown>;
  settings: Record<string, unknown>;
  is_active: boolean;
  display_order: number;
}

export function useDynamicComponents(type?: string) {
  return useQuery({
    queryKey: ['dynamic-components', type],
    queryFn: async () => {
      try {
        const url = type ?
        `/api/dynamic-components?type=${encodeURIComponent(type)}` :
        '/api/dynamic-components';
        const data = await apiFetch<DynamicComponent[]>(url);
        return data || [];
      } catch (err) {
        console.warn('Error fetching dynamic components:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

export interface ThemeConfiguration {
  id: string;
  name: string;
  colors: Record<string, string>;
  fonts: Record<string, string>;
  spacing: Record<string, string>;
  breakpoints: Record<string, string>;
  is_active: boolean;
}

export function useActiveTheme() {
  return useQuery({
    queryKey: ['active-theme'],
    queryFn: async () => {
      try {
        const data = await apiFetch<ThemeConfiguration>('/api/theme-settings');
        return data;
      } catch (err) {
        console.warn('Error fetching active theme:', err);
        return null;
      }
    },
    staleTime: 10 * 60 * 1000 // 10 minutes
  });
}

export interface DynamicForm {
  id: string;
  name: string;
  title?: string;
  description?: string;
  fields: unknown[];
  settings: Record<string, unknown>;
  submit_action: string;
  is_active: boolean;
}

export function useDynamicForms() {
  return useQuery({
    queryKey: ['dynamic-forms'],
    queryFn: async () => {
      try {
        const data = await apiFetch<DynamicForm[]>('/api/dynamic-forms');
        return data || [];
      } catch (err) {
        console.warn('Error fetching dynamic forms:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000
  });
}

export interface ExternalIntegration {
  id: string;
  name: string;
  type: string;
  provider: string;
  config: Record<string, unknown>;
  is_active: boolean;
}

export function useExternalIntegrations(type?: string) {
  return useQuery({
    queryKey: ['external-integrations', type],
    queryFn: async () => {
      try {
        const url = type ?
        `/api/external-integrations?type=${encodeURIComponent(type)}` :
        '/api/external-integrations';
        const data = await apiFetch<ExternalIntegration[]>(url);
        return data || [];
      } catch (err) {
        console.warn('Error fetching external integrations:', err);
        return [];
      }
    },
    staleTime: 15 * 60 * 1000 // 15 minutes
  });
}