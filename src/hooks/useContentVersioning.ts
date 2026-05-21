
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ContentVersion {
  id: string;
  contentId: string;
  version: number;
  title: string;
  content: string;
  author: string;
  timestamp: string; // Changed to string for easier serialization
  changeLog: string;
  status: 'draft' | 'published' | 'archived';
}

const STORAGE_KEY = 'proquelec_content_versions';

export function useContentVersioning() {
  const [versions, setVersions] = useState<ContentVersion[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Persist to localStorage whenever versions change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
  }, [versions]);

  const createVersion = useCallback(async (
    contentId: string,
    title: string,
    content: string,
    changeLog: string
  ) => {
    setIsLoading(true);
    try {
      const existingVersions = versions.filter(v => v.contentId === contentId);
      const nextVersion = existingVersions.length + 1;

      const newVersion: ContentVersion = {
        id: Math.random().toString(36).substr(2, 9),
        contentId,
        version: nextVersion,
        title,
        content,
        author: 'admin@proquelec.com',
        timestamp: new Date().toISOString(),
        changeLog,
        status: 'draft'
      };

      setVersions(prev => [...prev, newVersion]);

      toast({
        title: "Version créée",
        description: `Version ${nextVersion} sauvegardée concrètement.`,
      });

      return newVersion;
    } finally {
      setIsLoading(false);
    }
  }, [versions, toast]);

  const getVersions = useCallback((contentId: string) => {
    return versions
      .filter(v => v.contentId === contentId)
      .sort((a, b) => b.version - a.version);
  }, [versions]);

  const restoreVersion = useCallback(async (versionId: string) => {
    const version = versions.find(v => v.id === versionId);
    if (!version) return null;

    toast({
      title: "Version restaurée",
      description: `Version ${version.version} chargée dans l'éditeur.`,
    });

    return version;
  }, [versions, toast]);

  const compareVersions = useCallback((version1Id: string, version2Id: string) => {
    const v1 = versions.find(v => v.id === version1Id);
    const v2 = versions.find(v => v.id === version2Id);

    if (!v1 || !v2) return null;

    return {
      version1: v1,
      version2: v2,
      changes: {
        title: v1.title !== v2.title,
        content: v1.content !== v2.content,
      }
    };
  }, [versions]);

  return {
    versions,
    isLoading,
    createVersion,
    getVersions,
    restoreVersion,
    compareVersions,
  };
}
