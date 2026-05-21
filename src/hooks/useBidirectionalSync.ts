import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

/**
 * Hook de synchronisation bidirectionnelle
 * HTML ↔ JSON ↔ contentBlocks ↔ Formulaire
 */

export interface SyncBlock {
  id: string;
  type: string;
  data: unknown;
  version?: number;
  settings?: unknown;
}

export interface PageFormData {
  title: string;
  slug: string;
  description: string;
  blocks: SyncBlock[];
}

export function htmlToContentBlocks(html: string): SyncBlock[] {
  if (!html) return [];
  // Simplification pour le test: on crée un bloc texte avec tout le HTML
  return [{
    id: 'initial',
    type: 'text',
    data: { content: html },
    version: 1
  }];
}

export function contentBlocksToHtml(blocks: SyncBlock[]): string {
  return blocks.map((b) => b.data?.content || '').join('\n');
}

export function contentBlocksToJson(blocks: SyncBlock[]): string {
  return JSON.stringify(blocks, null, 2);
}

export function jsonToContentBlocks(json: string): SyncBlock[] {
  try {
    return JSON.parse(json);
  } catch (e) {
    throw e;
  }
}

export function useBidirectionalSync(
initialContent: string = '',
initialMetadata?: Partial<PageFormData>,
initialBlocks?: SyncBlock[])
{
  const [html, setHtml] = useState(initialContent);
  const [contentBlocks, setContentBlocks] = useState<SyncBlock[]>(() =>
  initialBlocks && initialBlocks.length > 0 ? initialBlocks : htmlToContentBlocks(initialContent)
  );
  const [jsonString, setJsonString] = useState(() =>
  contentBlocksToJson(initialBlocks && initialBlocks.length > 0 ? initialBlocks : htmlToContentBlocks(initialContent))
  );
  const [formData, setFormData] = useState<PageFormData>({
    title: initialMetadata?.title || '',
    slug: initialMetadata?.slug || '',
    description: initialMetadata?.description || '',
    blocks: initialBlocks && initialBlocks.length > 0 ? initialBlocks : htmlToContentBlocks(initialContent)
  });

  const sourceRef = useRef<'html' | 'blocks' | 'json' | 'form' | null>(null);

  const handleHtmlChange = useCallback((newHtml: string) => {
    if (sourceRef.current === 'html') return;
    sourceRef.current = 'html';
    setHtml(newHtml);
    const blocks = htmlToContentBlocks(newHtml);
    setContentBlocks(blocks);
    setJsonString(contentBlocksToJson(blocks));
    setFormData((prev) => ({ ...prev, blocks }));
    setTimeout(() => {sourceRef.current = null;}, 50);
  }, []);

  const handleJsonChange = useCallback((newJson: string) => {
    if (sourceRef.current === 'json') return;
    sourceRef.current = 'json';
    setJsonString(newJson);
    try {
      const blocks = jsonToContentBlocks(newJson);
      setContentBlocks(blocks);
      setHtml(contentBlocksToHtml(blocks));
      setFormData((prev) => ({ ...prev, blocks }));
    } catch (e) {
      toast.error('Erreur JSON');
    }
    setTimeout(() => {sourceRef.current = null;}, 50);
  }, []);

  const handleBlocksChange = useCallback((newBlocks: SyncBlock[]) => {
    if (sourceRef.current === 'blocks') return;
    sourceRef.current = 'blocks';
    setContentBlocks(newBlocks);
    setHtml(contentBlocksToHtml(newBlocks));
    setJsonString(contentBlocksToJson(newBlocks));
    setFormData((prev) => ({ ...prev, blocks: newBlocks }));
    setTimeout(() => {sourceRef.current = null;}, 50);
  }, []);

  const handleFormChange = useCallback((newForm: PageFormData) => {
    if (sourceRef.current === 'form') return;
    sourceRef.current = 'form';
    setFormData(newForm);
    setContentBlocks(newForm.blocks);
    setHtml(contentBlocksToHtml(newForm.blocks));
    setJsonString(contentBlocksToJson(newForm.blocks));
    setTimeout(() => {sourceRef.current = null;}, 50);
  }, []);

  return {
    html,
    contentBlocks,
    jsonString,
    formData,
    handlers: {
      handleHtmlChange,
      handleJsonChange,
      handleBlocksChange,
      handleFormChange
    },
    getAllData: () => ({ html, contentBlocks, formData }),
    lastModifiedBy: sourceRef.current
  };
}

export function useAutoSyncToServer(
pageId: string,
data: unknown,
enabled: boolean = true,
onSave?: (data: unknown) => Promise<void>)
{
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timerRef = useRef<unknown>(null);

  useEffect(() => {
    if (!enabled || !pageId) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        if (onSave) {
          await onSave(data);
        } else {
          await fetch(`/api/pages/${pageId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
          });
        }
        setLastSaved(new Date());
      } catch (e) {
        toast.error('Erreur auto-save');
      } finally {
        setIsSaving(false);
      }
    }, 1000);
    return () => clearTimeout(timerRef.current);
  }, [data, pageId, enabled, onSave]);

  return { isSaving, lastSaved };
}