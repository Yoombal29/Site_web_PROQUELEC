
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useUploadFile = (bucketName: string) => {
  return useMutation({
    mutationFn: async (file: File) => {
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (error) {
        throw new Error(error.message);
      }

      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      if (!publicUrlData) {
        throw new Error("Impossible d'obtenir l'URL publique de l'image.");
      }
      
      return publicUrlData.publicUrl;
    },
    onError: (error) => {
      toast.error(`Erreur lors du téléversement : ${error.message}`);
    },
  });
};
