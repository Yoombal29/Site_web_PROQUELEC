
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

// Helper for authorized fetch
const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const res = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Request failed');
  }
  return res.json();
};

// Hook pour récupérer tous les articles (pour l'admin)
export const useGetBlogPosts = () => {
  return useQuery({
    queryKey: ['blog_posts'],
    queryFn: async () => {
      const res = await authFetch("/api/admin/blog-posts");
      return res as BlogPost[];
    }
  });
};

// Hook pour récupérer les articles publiés pour le site public
export const useGetPublicBlogPosts = () => {
  return useQuery({
    queryKey: ['public_blog_posts'],
    queryFn: async () => {
      const res = await fetch("/api/blog-posts");
      if (!res.ok) throw new Error("Failed to fetch blog posts");
      return await res.json();
    }
  });
};

// Hook pour récupérer un article par son slug
export const useGetBlogPostBySlug = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['blog_post', slug],
    queryFn: async () => {
      if (!slug) return null;
      const res = await fetch(`/api/blog-posts/${slug}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch post");
      }
      return await res.json();
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
      return await authFetch("/api/blog-posts", {
        method: 'POST',
        body: JSON.stringify(postData)
      });
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
      return await authFetch(`/api/blog-posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(postData)
      });
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
      return await authFetch(`/api/blog-posts/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast.success("Article supprimé avec succès.");
      queryClient.invalidateQueries({ queryKey: ['blog_posts'] }); // Admin view
      queryClient.invalidateQueries({ queryKey: ['public_blog_posts'] }); // Public view
    },
    onError: (error) => {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    }
  });
};

