import { useEffect, useRef, useState } from 'react';
import { SafeStorage } from '@/lib/safe-storage';

/**
 * Hook pour le CMS (Generic AutoSave)
 * Sauvegarde dans localStorage uniquement.
 */
export function useAutoSave<T>(key: string, data: T, enabled: boolean = true) {
  const lastSavedData = useRef<string>(JSON.stringify(data));

  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(() => {
      const currentData = JSON.stringify(data);
      if (currentData !== lastSavedData.current) {
        SafeStorage.set(`autosave_${key}`, data);
        lastSavedData.current = currentData;

      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [key, data, enabled]);

  return {
    restore: () => SafeStorage.get<T | null>(`autosave_${key}`, null),
    clear: () => SafeStorage.remove(`autosave_${key}`)
  };
}

/**
 * Hook pour l'Éditeur de Documents (Office AutoSave)
 * Sauvegarde via une fonction pushToServer (API).
 */
export interface OfficeAutosaveProps {
  documentId: string;
  content: unknown;
  pushToServer: (content: unknown) => Promise<unknown>;
}

export function useAutosave({ documentId, content, pushToServer }: OfficeAutosaveProps) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const lastContentRef = useRef<string>(JSON.stringify(content));

  useEffect(() => {
    if (!documentId || !content) return;

    const timer = setTimeout(async () => {
      const currentContent = JSON.stringify(content);

      // Ne sauvegarder que si le contenu a changé
      if (currentContent !== lastContentRef.current) {
        setStatus('saving');
        try {
          await pushToServer(content);
          lastContentRef.current = currentContent;
          setLastSaved(Date.now());
          setStatus('saved');

        } catch (error) {
          console.error(`[Autosave Office] Erreur:`, error);
          setStatus('error');
        }
      }
    }, 3000); // 3 secondes pour l'Office

    return () => clearTimeout(timer);
  }, [content, documentId, pushToServer]);

  return { status, lastSaved };
}