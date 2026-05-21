import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSession } from './useSession';

export const useUploadFile = (bucketName: string = 'uploads') => {
  const { session } = useSession();

  return useMutation({
    mutationFn: async (file: File) => {


      if (!session || !session.access_token) {
        toast.error('Vous devez être connecté pour téléverser des fichiers');
        throw new Error('Vous devez être connecté pour téléverser des fichiers');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', file.type.startsWith('image/') ? 'image' :
      file.type.startsWith('video/') ? 'video' : 'document');

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors du téléversement');
      }

      const result = await response.json();


      return result.url; // Return the public URL for local use
    },
    onSuccess: (url) => {

      toast.success('Fichier téléversé avec succès');
    },
    onError: (error: unknown) => {
      toast.error(`Erreur lors du téléversement : ${error.message}`);
    }
  });
};