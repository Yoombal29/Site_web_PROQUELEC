import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type BlogCategory = {
  id: number;
  name: string;
};

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

export const useGetBlogCategories = () => {
  return useQuery({
    queryKey: ['blog_categories'],
    queryFn: async () => {
      const res = await fetch("/api/blog-categories");
      if (!res.ok) throw new Error("Failed to fetch blog categories");
      return (await res.json()) as BlogCategory[];
    }
  });
};

export const useCreateBlogCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categoryData: {name: string;}) => {
      return await authFetch("/api/blog-categories", {
        method: 'POST',
        body: JSON.stringify(categoryData)
      });
    },
    onSuccess: () => {
      toast.success("Catégorie créée avec succès !");
      queryClient.invalidateQueries({ queryKey: ['blog_categories'] });
    },
    onError: (error: unknown) => {
      toast.error(`Erreur lors de la création : ${error.message}`);
    }
  });
};

export const useUpdateBlogCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updateData }: {id: number;name: string;}) => {
      return await authFetch(`/api/blog-categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
    },
    onSuccess: () => {
      toast.success("Catégorie mise à jour avec succès !");
      queryClient.invalidateQueries({ queryKey: ['blog_categories'] });
    },
    onError: (error: unknown) => {
      toast.error(`Erreur lors de la mise à jour : ${error.message}`);
    }
  });
};

export const useDeleteBlogCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      // Logic for checking existing posts could be done in backend
      return await authFetch(`/api/blog-categories/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast.success("Catégorie supprimée avec succès.");
      queryClient.invalidateQueries({ queryKey: ['blog_categories'] });
    },
    onError: (error: unknown) => {
      toast.error(`${error.message}`);
    }
  });
};