
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { sanitizeFileName } from '@/utils/fileUtils';

export const useUploadFile = (bucketName: string) => {
  return useMutation({
    mutationFn: async (file: File) => {
      console.log(`Début du téléversement de ${file.name} vers ${bucketName}`);

      // Vérifier que l'utilisateur est authentifié
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        toast.error('Vous devez être connecté pour téléverser des fichiers');
        throw new Error('Vous devez être connecté pour téléverser des fichiers');
      }

      const user = session.user;
      console.log('Utilisateur connecté:', user.id);

      // Vérifier que le bucket existe
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        toast.error('Impossible de vérifier les buckets de stockage');
        throw new Error('Impossible de vérifier les buckets de stockage');
      }

      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      if (!bucketExists) {
        toast.error(`Le bucket de stockage ${bucketName} n'existe pas`);
        throw new Error(`Le bucket de stockage ${bucketName} n'existe pas`);
      }

      const fileName = `${Date.now()}-${sanitizeFileName(file.name)}`;

      console.log(`Téléversement vers ${bucketName}/${fileName}`);

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (error) {
        toast.error(`Erreur de téléversement: ${error.message}`);
        throw new Error(`Erreur de téléversement: ${error.message}`);
      }

      console.log('Fichier téléversé avec succès:', data);

      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      if (!publicUrlData) {
        throw new Error("Impossible d'obtenir l'URL publique de l'image.");
      }

      console.log('URL publique générée:', publicUrlData.publicUrl);

      // Enregistrer les métadonnées du fichier
      try {
        const mediaFileData = {
          file_name: file.name,
          file_path: data.path,
          file_size: file.size,
          mime_type: file.type,
          file_type: file.type.startsWith('image/') ? 'image' :
            file.type.startsWith('video/') ? 'video' : 'document',
          bucket: bucketName, // Stockage du bucket source
          uploaded_by: user.id,
          is_active: true,
          uploaded_at: new Date().toISOString()
        };

        console.log('Données à insérer:', mediaFileData);

        const { error: dbError } = await (supabase as any)
          .from('media_files')
          .insert(mediaFileData);

        if (dbError) {
          toast.error('Le fichier a été téléversé mais les métadonnées n\'ont pas pu être enregistrées');
        } else {
          console.log('Métadonnées enregistrées avec succès');
        }
      } catch (metaError) {
        toast.error('Le fichier a été téléversé mais les métadonnées n\'ont pas pu être enregistrées');
      }

      return publicUrlData.publicUrl;
    },
    onSuccess: (url) => {
      console.log('Téléversement terminé avec succès:', url);
      toast.success('Fichier téléversé avec succès');
    },
    onError: (error: any) => {
      toast.error(`Erreur lors du téléversement : ${error.message}`);
    },
  });
};
