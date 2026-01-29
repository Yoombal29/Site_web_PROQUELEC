
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type BlogCategory = {
  id: number;
  name: string;
};

export const useGetBlogCategories = () => {
  return useQuery({
    queryKey: ['blog_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }
      return data as BlogCategory[];
    }
  });
};

export const useCreateBlogCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (categoryData: { name: string }) => {
            const { data, error } = await supabase
                .from('blog_categories')
                .insert([categoryData])
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: () => {
            toast.success("Catégorie créée avec succès !");
            queryClient.invalidateQueries({ queryKey: ['blog_categories'] });
        },
        onError: (error) => {
            toast.error(`Erreur lors de la création : ${error.message}`);
        },
    });
};

export const useUpdateBlogCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...updateData }: { id: number; name: string }) => {
            const { data, error } = await supabase
                .from('blog_categories')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: () => {
            toast.success("Catégorie mise à jour avec succès !");
            queryClient.invalidateQueries({ queryKey: ['blog_categories'] });
        },
        onError: (error) => {
            toast.error(`Erreur lors de la mise à jour : ${error.message}`);
        },
    });
};

export const useDeleteBlogCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { data: posts, error: postsError } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('category_id', id)
        .limit(1);

      if (postsError) throw new Error(postsError.message);
      if (posts && posts.length > 0) {
        throw new Error("Impossible de supprimer : cette catégorie est utilisée par au moins un article.");
      }

      const { error } = await supabase.from('blog_categories').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Catégorie supprimée avec succès.");
      queryClient.invalidateQueries({ queryKey: ['blog_categories'] });
    },
    onError: (error) => {
      toast.error(`${error.message}`);
    }
  });
};
