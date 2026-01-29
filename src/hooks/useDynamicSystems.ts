import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DynamicComponent {
  id: string;
  name: string;
  component_type: string;
  title?: string;
  subtitle?: string;
  content: Record<string, any>;
  settings: Record<string, any>;
  is_active: boolean;
  display_order: number;
}

export function useDynamicComponents(type?: string) {
  return useQuery({
    queryKey: ['dynamic-components', type],
    queryFn: async () => {
      try {
        let query = supabase
          .from('dynamic_components')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (type) {
          query = query.eq('component_type', type);
        }

        const { data, error } = await query;

        if (error) {
          console.warn('Dynamic components table not available:', error.message);
          return [];
        }

        return data || [];
      } catch (err) {
        console.warn('Error fetching dynamic components:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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
        const { data, error } = await supabase
          .from('theme_configurations')
          .select('*')
          .eq('is_active', true)
          .single();

        if (error) {
          console.warn('Theme configurations table not available:', error.message);
          return null;
        }

        return data as ThemeConfiguration;
      } catch (err) {
        console.warn('Error fetching active theme:', err);
        return null;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export interface DynamicForm {
  id: string;
  name: string;
  title?: string;
  description?: string;
  fields: any[];
  settings: Record<string, any>;
  submit_action: string;
  is_active: boolean;
}

export function useDynamicForms() {
  return useQuery({
    queryKey: ['dynamic-forms'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('dynamic_forms')
          .select('*')
          .eq('is_active', true);

        if (error) {
          console.warn('Dynamic forms table not available:', error.message);
          return [];
        }

        return data as DynamicForm[];
      } catch (err) {
        console.warn('Error fetching dynamic forms:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export interface ExternalIntegration {
  id: string;
  name: string;
  type: string;
  provider: string;
  config: Record<string, any>;
  is_active: boolean;
}

export function useExternalIntegrations(type?: string) {
  return useQuery({
    queryKey: ['external-integrations', type],
    queryFn: async () => {
      try {
        let query = supabase
          .from('external_integrations')
          .select('*')
          .eq('is_active', true);

        if (type) {
          query = query.eq('type', type);
        }

        const { data, error } = await query;

        if (error) {
          console.warn('External integrations table not available:', error.message);
          return [];
        }

        return data as ExternalIntegration[];
      } catch (err) {
        console.warn('Error fetching external integrations:', err);
        return [];
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}