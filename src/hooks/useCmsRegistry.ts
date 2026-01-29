import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/utils/supabaseClient';
import { CmsPlugin, CmsTheme } from '@/types/PageSystem';

export function useCmsPlugins() {
    return useQuery({
        queryKey: ['cms-plugins'],
        queryFn: async () => {
            const supabase = getSupabaseClient();
            const { data, error } = await supabase
                .from('cms_plugins')
                .select('*')
                .order('display_name');

            if (error) throw error;
            return (data as any) as CmsPlugin[];
        }
    });
}

export function useCmsThemes() {
    return useQuery({
        queryKey: ['cms-themes'],
        queryFn: async () => {
            const supabase = getSupabaseClient();
            const { data, error } = await supabase
                .from('cms_themes')
                .select('*')
                .order('display_name');

            if (error) throw error;
            return (data as any) as CmsTheme[];
        }
    });
}

export function useTogglePlugin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, is_active }: { id: string, is_active: boolean }) => {
            const supabase = getSupabaseClient();
            const { data, error } = await supabase
                .from('cms_plugins')
                .update({ is_active_globally: is_active, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cms-plugins'] });
        }
    });
}
