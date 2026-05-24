
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { normalizeUploadUrl } from '@/lib/normalizeUploadUrl';

/**
 * Hook for uploading files to local storage.
 * The bucketName parameter is kept for API compatibility but not used in local storage.
 */
export const useUploadFile = (bucketName: string) => {
  return useMutation({
    mutationFn: async (file: File) => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vous devez être connecté pour téléverser des fichiers.');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        throw new Error(error.error || 'Erreur lors du téléversement');
      }

      const result = await response.json();
      return normalizeUploadUrl(result.url || `/uploads/${result.file_name}`);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`Erreur lors du téléversement : ${message}`);
    }
  });
};