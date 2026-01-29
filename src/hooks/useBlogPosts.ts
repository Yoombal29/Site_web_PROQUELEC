
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSession } from "./useSession";

// Type pour un article de blog (utilisé dans l'admin)
export type BlogPost = {
  id: string;
  title: string;
  content: string | null;
  excerpt: string | null;
  slug: string | null;
  cover_image_url: string | null;
  created_at: string | null;
  author_id: string;
  published_at: string | null;
  category_id: number | null;
  blog_categories: { name: string } | null;
};

// Type pour la création/mise à jour
export type BlogPostFormData = Omit<BlogPost, 'id' | 'created_at' | 'author_id' | 'blog_categories'>;

// Hook pour récupérer tous les articles (pour l'admin)
export const useGetBlogPosts = () => {
  return useQuery({
    queryKey: ['blog_posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, blog_categories(name)')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }
      return data as BlogPost[];
    }
  });
};

// Hook pour récupérer les articles publiés pour le site public
export const useGetPublicBlogPosts = () => {
  return useQuery({
    queryKey: ['public_blog_posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, title, slug, excerpt, cover_image_url, published_at, blog_categories(name)')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false });

      if (error) {
        console.error("Erreur de chargement des articles (vérifier RLS):", error);
        throw new Error(error.message);
      }
      return data;
    }
  });
};

// Hook pour récupérer un article par son slug
export const useGetBlogPostBySlug = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['blog_post', slug],
    queryFn: async () => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from('blog_posts')
        .select('title, content, excerpt, cover_image_url, published_at, created_at, blog_categories(name)')
        .eq('slug', slug)
        .not('published_at', 'is', null) // Ensure it's published
        .maybeSingle();

      if (error) {
        console.error(`Error fetching post with slug ${slug}:`, error);
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!slug,
  });
};


// Hook pour créer un article
export const useCreateBlogPost = () => {
  const queryClient = useQueryClient();
  const { user } = useSession();

  return useMutation({
    mutationFn: async (postData: BlogPostFormData) => {
      if (!user) throw new Error("Vous devez être connecté.");

      const { data, error } = await supabase
        .from('blog_posts')
        .insert([{ ...postData, author_id: user.id }])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      toast.success("Article créé avec succès !");
      queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
      queryClient.invalidateQueries({ queryKey: ['public_blog_posts'] });
    },
    onError: (error) => {
      toast.error(`Erreur lors de la création : ${error.message}`);
    },
  });
};

// Hook pour mettre à jour un article
export const useUpdateBlogPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...postData }: { id: string } & Partial<BlogPostFormData>) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: () => {
      toast.success("Article mis à jour avec succès !");
      queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
      queryClient.invalidateQueries({ queryKey: ['public_blog_posts'] });
    },
    onError: (error) => {
      toast.error(`Erreur lors de la mise à jour : ${error.message}`);
    },
  });
};


// Hook pour supprimer un article
export const useDeleteBlogPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success("Article supprimé avec succès.");
      queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
    },
    onError: (error) => {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  });
};
