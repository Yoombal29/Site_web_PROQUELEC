
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { useSession } from './useSession';

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

const EMPTY_ARRAY: MediaFile[] = [];

export const useMediaManager = () => {
  const queryClient = useQueryClient();
  const { session, user } = useSession();

  const getFullUrl = (path: string) => {
    const normalizeUploadUrl = (value: string) => {
      try {
        const parsed = new URL(value);
        if (parsed.pathname.startsWith('/uploads/')) {
          return `${parsed.pathname}${parsed.search}${parsed.hash}`;
        }
        return value;
      } catch {
        return value;
      }
    };

    if (path.startsWith('http')) return normalizeUploadUrl(path);
    // Base URL for local uploads served via the proxy
    return `/uploads/${path}`;
  };

  const uploadFile = useMutation({
    mutationFn: async ({ file, bucket, projectId }: { file: File; bucket?: string; projectId?: string; }) => {

      if (!session || !session.access_token) {
        toast.error('Vous devez être connecté pour téléverser des fichiers');
        throw new Error('Vous devez être connecté');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', getFileCategory(file.type));
      if (projectId) formData.append('project_id', projectId);

      // CHANGED: Use /api/storage/upload (Standardized Backend Route)
      const response = await fetch('/api/storage/upload', {
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


      return {
        id: result.id, // backend returns full object
        path: result.file_path,
        url: getFullUrl(result.file_path),
        name: result.file_name,
        size: result.file_size,
        type: result.mime_type,
        bucket
      };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
      // Invalidate project documents if uploaded to a project
      if (variables.projectId) {
        queryClient.invalidateQueries({ queryKey: ['project-docs', variables.projectId] });
        queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      }
      toast.success('Fichier téléversé avec succès');
    },
    onError: (error: unknown) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  const deleteFile = useMutation({
    mutationFn: async ({ id, path: filePath }: { id: string; path: string; }) => {
      if (!session || !session.access_token) throw new Error('Vous devez être connecté');

      const response = await fetch(`/api/storage/files/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
      queryClient.invalidateQueries({ queryKey: ['project-docs'] }); // Invalidate all project docs just in case
      toast.success('Fichier supprimé');
    },
    onError: (error: unknown) => {
      // toast.error(`Erreur: ${error.message}`); // Silent fail better
    }
  });

  const deleteMultipleFiles = useMutation({
    mutationFn: async (filesToDelete: { id: string; path: string; }[]) => {
      if (!session || !session.access_token) throw new Error('Vous devez être connecté');

      for (const file of filesToDelete) {
        // CHANGED: Use /api/storage/files/:id
        const response = await fetch(`/api/storage/files/${file.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        if (!response.ok) console.error(`Erreur suppression file ${file.id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media-files'] });
      toast.success('Fichiers supprimés avec succès');
    },
    onError: (error: unknown) => {
      toast.error(`Erreur suppression groupée: ${error.message}`);
    }
  });

  const getMediaFiles = useQuery({
    queryKey: ['media-files'],
    queryFn: async (): Promise<MediaFile[]> => {


      const token = localStorage.getItem('token');
      if (!token) return EMPTY_ARRAY;

      // CHANGED: Use /api/storage/files (Standardized Backend Route)
      const response = await fetch('/api/storage/files', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur récupération médias');
      }

      const data = await response.json();


      return (data || []).map((file: any) => ({
        id: file.id,
        name: file.file_name,
        url: getFullUrl(file.file_path),
        size: file.file_size,
        type: file.mime_type,
        bucket: 'uploads',
        path: file.file_path,
        uploadedAt: new Date(file.uploaded_at),
        category: getFileCategory(file.mime_type)
      }));
    },
    enabled: !!localStorage.getItem('token')
  });

  const getFileCategory = (type: string): MediaFile['category'] => {
    if (!type) return 'other';
    const lowerType = type.toLowerCase();
    if (lowerType.startsWith('image/')) return 'image';
    if (lowerType.startsWith('video/')) return 'video';
    if (lowerType.includes('pdf') || lowerType.includes('document') || lowerType.includes('text') || lowerType.includes('msword')) return 'document';
    return 'other';
  };

  return {
    uploadFile,
    deleteFile,
    deleteMultipleFiles,
    getFileCategory,
    mediaFiles: getMediaFiles.data || EMPTY_ARRAY,
    isLoading: getMediaFiles.isLoading,
    error: getMediaFiles.error
  };
};