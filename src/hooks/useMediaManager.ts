
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { sanitizeFileName } from '@/utils/fileUtils';

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  bucket: string;
  path: string;
  uploadedAt: Date;
  category: 'image' | 'document' | 'video' | 'other';
}

export const useMediaManager = () => {
  const queryClient = useQueryClient();

  const uploadFile = useMutation({
    mutationFn: async ({ file, bucket }: { file: File; bucket: string }) => {
      console.log(`Téléversement de ${file.name} vers le bucket ${bucket}`);

      // Vérifier que l'utilisateur est authentifié
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        toast.error('Vous devez être connecté pour téléverser des fichiers');
        throw new Error('Vous devez être connecté pour téléverser des fichiers');
      }

      const user = session.user;
      console.log('Utilisateur connecté pour téléversement:', user.id);

      const fileName = `${Date.now()}-${sanitizeFileName(file.name)}`;
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) {
        toast.error('Erreur lors du téléversement.');
        throw new Error(error.message);
      }

      console.log('Fichier téléversé:', data);

      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      if (!publicUrlData) {
        throw new Error("Impossible d'obtenir l'URL publique du fichier.");
      }

      console.log('URL publique générée:', publicUrlData.publicUrl);

      // Enregistrer les métadonnées du fichier dans la base de données
      try {
        const mediaFileData = {
          file_name: file.name,
          file_path: data.path,
          file_size: file.size,
          mime_type: file.type,
          file_type: getFileCategory(file.type),
          bucket: bucket, // Stockage du bucket source
          uploaded_by: user.id,
          is_active: true,
          uploaded_at: new Date().toISOString()
        };

        const { error: dbError } = await (supabase as any)
          .from('media_files')
          .insert(mediaFileData);

        if (dbError) {
          toast.error('Le fichier a été téléversé mais les métadonnées n\'ont pas pu être enregistrées');
        }
      } catch (metaError) {
        toast.error('Le fichier a été téléversé mais les métadonnées n\'ont pas pu être enregistrées');
      }

      return {
        path: data.path,
        url: publicUrlData.publicUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        bucket
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
      toast.success('Fichier téléversé avec succès');
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  const deleteFile = useMutation({
    mutationFn: async ({ bucket, path }: { bucket: string; path: string }) => {
      console.log(`Suppression du fichier ${path} du bucket ${bucket}`);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Vous devez être connecté');

      const { error } = await supabase.storage.from(bucket).remove([path]);
      if (error) throw new Error(error.message);

      const { error: dbError } = await (supabase as any).from('media_files').delete().eq('file_path', path);
      if (dbError) console.error('Erreur meta delete:', dbError);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
      toast.success('Fichier supprimé');
    }
  });

  const deleteMultipleFiles = useMutation({
    mutationFn: async (filesToDelete: { bucket: string; path: string }[]) => {
      console.log(`Suppression groupée de ${filesToDelete.length} fichiers`);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Vous devez être connecté');

      // Grouper par bucket pour optimiser la suppression storage
      const groupedByBucket = filesToDelete.reduce((acc, file) => {
        if (!acc[file.bucket]) acc[file.bucket] = [];
        acc[file.bucket].push(file.path);
        return acc;
      }, {} as Record<string, string[]>);

      // Suppression physique Storage par groupe de buckets
      for (const bucket in groupedByBucket) {
        const { error } = await supabase.storage.from(bucket).remove(groupedByBucket[bucket]);
        if (error) console.error(`Erreur suppression bucket ${bucket}:`, error);
      }

      // Suppression logique Base de données (en une fois ou par path)
      const allPaths = filesToDelete.map(f => f.path);
      const { error: dbError } = await (supabase as any)
        .from('media_files')
        .delete()
        .in('file_path', allPaths);

      if (dbError) throw new Error(dbError.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
      toast.success('Fichiers supprimés avec succès');
    },
    onError: (error: any) => {
      toast.error(`Erreur suppression groupée: ${error.message}`);
    }
  });

  const getMediaFiles = useQuery({
    queryKey: ['media-files'],
    queryFn: async (): Promise<MediaFile[]> => {
      console.log('Récupération des fichiers média...');

      const { data, error } = await (supabase as any)
        .from('media_files')
        .select('*')
        .eq('is_active', true)
        .order('uploaded_at', { ascending: false });

      if (error) {
        toast.error('Erreur lors de la récupération des fichiers.');
        throw error;
      }

      console.log(`${data?.length || 0} fichiers récupérés`);

      return (data || []).map(file => {
        const bucketName = file.bucket || 'images'; // Fallback legacy
        const { data: publicUrlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(file.file_path);

        return {
          id: file.id,
          name: file.file_name,
          url: publicUrlData.publicUrl,
          size: file.file_size,
          type: file.mime_type,
          bucket: bucketName,
          path: file.file_path,
          uploadedAt: new Date(file.uploaded_at || ''),
          category: getFileCategory(file.mime_type)
        };
      });
    }
  });

  const getFileCategory = (type: string): MediaFile['category'] => {
    if (type.startsWith('image/')) return 'image';
    if (type.startsWith('video/')) return 'video';
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) return 'document';
    return 'other';
  };

  return {
    uploadFile,
    deleteFile,
    deleteMultipleFiles,
    getFileCategory,
    mediaFiles: getMediaFiles.data || [],
    isLoading: getMediaFiles.isLoading,
    error: getMediaFiles.error
  };
};
