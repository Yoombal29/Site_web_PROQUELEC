import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useEditor } from '@craftjs/core';
import type { SerializedNodes } from '@craftjs/core';
import { apiFetch, getAuthToken } from '@/lib/api-client';
import { toast } from 'sonner';
import { useBuilderThemeStore, DEFAULT_THEME } from '@/stores/builder-theme.store';
import type { ThemeConfig } from '@/stores/builder-theme.store';
import { useBuilderHistoryStore } from '@/stores/builder-history.store';
import { validateBuilderStructure, validateThemeConfig } from '@/validation/builderSchema';
import convertLegacyBlocksToCraftGraph from '@/utils/legacyToCraft';
import {
  getFunctionalStructureForPage,
  isFunctionalPageStructure,
} from '@/lib/functional-page-structure';
import { createHtmlCraftStructure } from '@/lib/craft-html-structure';

export type PageDesignOptions = {
  theme?: string;
  layout?: string;
  customPalette?: string[];
  page_type?: unknown;
  [key: string]: unknown;
};

type BuilderStructure = SerializedNodes;

type WorkflowStatus = PageDataState['workflowStatus'];

type PageApiResponse = {
  title?: string;
  slug?: string;
  meta_description?: string;
  meta_keywords?: string;
  meta_robots?: string;
  custom_css?: string;
  custom_js?: string;
  design_options?: string | PageDesignOptions | null;
  is_published?: boolean;
  workflow_status?: WorkflowStatus;
  status?: WorkflowStatus;
  immutable?: boolean;
  theme_config?: string | Record<string, unknown> | null;
  structure_json?: unknown;
  draft_json?: unknown;
  content_raw?: string | null;
  content?: string | null;
  updated_at?: string | null;
};

type LocalBackupData = {
  timestamp?: number;
  structure_json?: BuilderStructure | string;
  pageData?: PageDataState;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeNodeType = (type: unknown) => {
  if (typeof type !== 'string') return type;
  return type === 'div' ? type : { resolvedName: type };
};

const resolveDisplayName = (node: Record<string, unknown>, fallback: string) => {
  if (typeof node.displayName === 'string') return node.displayName;

  const type = node.type;
  if (isRecord(type) && typeof type.resolvedName === 'string') return type.resolvedName;
  if (typeof type === 'string') return type;

  return fallback;
};

const isCraftJsFormat = (jsonObj: unknown): jsonObj is Record<string, unknown> => {
  return isRecord(jsonObj) && 'ROOT' in jsonObj;
};

const parseBuilderStructure = (json: string | unknown): unknown => {
  if (typeof json === 'string') {
    try {
      return JSON.parse(json) as unknown;
    } catch (error) {
      console.warn('[GodEditor] Impossible de parser la structure JSON:', error);
      return undefined;
    }
  }
  return json;
};

const ensureValidBuilderStructure = (json: string | unknown) => {
  const parsed = parseBuilderStructure(json);
  const validation = validateBuilderStructure(parsed);
  if (!validation.success) {
    console.warn('[GodEditor] Validation structure builder échouée', validation.error.format());
    return undefined;
  }
  return validation.data;
};

const normalizeCraftStructureForBuilder = (
  structure: unknown,
  pageTitle = 'Page',
): BuilderStructure | null => {
  if (!isCraftJsFormat(structure)) return null;

  const normalized: Record<string, Record<string, unknown>> = {};

  Object.entries(structure).forEach(([id, rawNode]) => {
    if (!isRecord(rawNode)) return;

    const nodes = Array.isArray(rawNode.nodes)
      ? rawNode.nodes.filter((nodeId): nodeId is string => typeof nodeId === 'string')
      : [];

    const linkedNodes = isRecord(rawNode.linkedNodes)
      ? Object.fromEntries(
          Object.entries(rawNode.linkedNodes).filter(
            (entry): entry is [string, string] => typeof entry[1] === 'string',
          ),
        )
      : {};

    normalized[id] = {
      ...rawNode,
      type: normalizeNodeType(rawNode.type),
      nodes,
      props: isRecord(rawNode.props) ? rawNode.props : {},
      custom: isRecord(rawNode.custom) ? rawNode.custom : {},
      hidden: typeof rawNode.hidden === 'boolean' ? rawNode.hidden : false,
      linkedNodes,
      isCanvas:
        id === 'ROOT'
          ? true
          : typeof rawNode.isCanvas === 'boolean'
            ? rawNode.isCanvas
            : nodes.length > 0,
      displayName:
        id === 'ROOT'
          ? resolveDisplayName(rawNode, `Page: ${pageTitle}`)
          : resolveDisplayName(rawNode, id),
      ...(id === 'ROOT'
        ? { parent: null }
        : { parent: typeof rawNode.parent === 'string' ? rawNode.parent : 'ROOT' }),
    };
  });

  return normalized.ROOT ? (normalized as unknown as BuilderStructure) : null;
};

const getErrorMessage = (error: unknown, fallback = 'Erreur inconnue') =>
  error instanceof Error ? error.message : fallback;

export type PageDataState = {
  title: string;
  slug: string;
  metaDescription: string;
  metaKeywords: string;
  metaRobots: string;
  customCss: string;
  customJs: string;
  designOptions: PageDesignOptions;
  isPublished: boolean;
  workflowStatus: 'draft' | 'review' | 'approved' | 'published' | 'archived';
  immutable: boolean;
  pageType: 'content' | 'functional' | 'hybrid';
};

interface GodEditorContextType {
  pageId: string | undefined;
  pageData: PageDataState | null;
  setPageData: React.Dispatch<React.SetStateAction<PageDataState | null>>;
  initialStructure: BuilderStructure | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  savePage: (versionName?: string) => Promise<void>;
  updateMetadata: (changes: Partial<PageDataState>) => void;
  markCanvasHydrated: (serialized?: string) => void;
  hasLocalBackup: boolean;
  restoreLocalBackup: () => void;
  discardLocalBackup: () => void;
}

const GodEditorContext = createContext<GodEditorContextType | undefined>(undefined);

export const useGodEditor = () => {
  const context = useContext(GodEditorContext);
  if (!context) {
    throw new Error('useGodEditor must be used within a GodEditorProvider');
  }
  return context;
};

interface GodEditorProviderProps {
  pageId: string | undefined;
  children: React.ReactNode;
}

export const GodEditorProvider: React.FC<GodEditorProviderProps> = ({ pageId, children }) => {
  const { actions, query, store } = useEditor();

  const actionsRef = useRef(actions);
  useEffect(() => {
    actionsRef.current = actions;
  });

  const [pageData, setPageData] = useState<PageDataState | null>(null);
  const [initialStructure, setInitialStructure] = useState<BuilderStructure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local backup states
  const [hasLocalBackup, setHasLocalBackup] = useState(false);
  const [localBackupData, setLocalBackupData] = useState<LocalBackupData | null>(null);

  // Ref to prevent autosave loops
  const lastSerializedRef = useRef<string>('');
  const hydrationReadyRef = useRef(false);

  // Load page data
  useEffect(() => {
    const loadPage = async () => {
      if (!pageId) {
        setPageData({
          title: 'Nouvelle Page',
          slug: 'nouvelle-page',
          metaDescription: '',
          metaKeywords: '',
          metaRobots: 'index,follow',
          customCss: '',
          customJs: '',
          designOptions: {},
          isPublished: false,
          workflowStatus: 'draft',
          immutable: false,
          pageType: 'content',
        });
        setIsLoading(false);
        return;
      }

      if (!getAuthToken()) {
        setError('Authentification requise. Connectez-vous pour accéder au builder.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setInitialStructure(null);
      hydrationReadyRef.current = false;
      try {
        const page = await apiFetch<PageApiResponse>(`/api/admin/pages/${pageId}`);
        const designOptions =
          typeof page.design_options === 'string'
            ? JSON.parse(page.design_options)
            : page.design_options || {};
        const pageType: PageDataState['pageType'] =
          designOptions?.page_type === 'hybrid'
            ? 'hybrid'
            : page.immutable === true
              ? 'functional'
              : 'content';

        setPageData({
          title: page.title || 'Nouvelle page',
          slug: page.slug || '',
          metaDescription: page.meta_description || '',
          metaKeywords: page.meta_keywords || '',
          metaRobots: page.meta_robots || 'index,follow',
          customCss: page.custom_css || '',
          customJs: page.custom_js || '',
          designOptions,
          isPublished: page.is_published || false,
          workflowStatus: page.workflow_status || page.status || 'draft',
          immutable: page.immutable === true,
          pageType,
        });

        // Load theme configuration
        if (page.theme_config) {
          const rawThemeConfig =
            typeof page.theme_config === 'string'
              ? JSON.parse(page.theme_config)
              : page.theme_config;
          const themeValidation = validateThemeConfig(rawThemeConfig);
          if (themeValidation.success) {
            // Fusion avec le thème par défaut pour garantir tous les champs obligatoires
            useBuilderThemeStore
              .getState()
              .loadTheme({ ...DEFAULT_THEME, ...themeValidation.data } as ThemeConfig);
          } else {
            console.warn(
              '[GodEditor] Theme config invalide, chargement du thème par défaut.',
              themeValidation.error.format(),
            );
            useBuilderThemeStore.getState().resetThemeState();
          }
        } else {
          useBuilderThemeStore.getState().resetThemeState();
        }

        // Public pages render structure_json. The Builder must open the same published
        // structure by default, otherwise the editor and public page drift silently.
        const dbStructure = page.structure_json || page.draft_json;

        const isFunctional = pageType === 'functional';
        const parsedDbStructure = parseBuilderStructure(dbStructure);
        let structureToLoad: BuilderStructure | null = null;

        if (isFunctional && !isFunctionalPageStructure(parsedDbStructure)) {
          const functionalStructure = getFunctionalStructureForPage(
            page,
            page.slug || 'dashboard',
            page.title || 'Page fonctionnelle',
          ).structure;
          structureToLoad = normalizeCraftStructureForBuilder(
            functionalStructure,
            page.title || page.slug || 'Page fonctionnelle',
          );
          console.info('[GodEditor] Structure fonctionnelle créée pour:', page.slug);
        } else if (parsedDbStructure) {
          if (isCraftJsFormat(parsedDbStructure)) {
            structureToLoad = normalizeCraftStructureForBuilder(
              parsedDbStructure,
              page.title || page.slug || 'Page',
            );
          } else if (Array.isArray(parsedDbStructure)) {
            try {
              const craftGraph = convertLegacyBlocksToCraftGraph(
                parsedDbStructure,
                page.title || page.slug || 'Page',
              );
              structureToLoad = normalizeCraftStructureForBuilder(
                craftGraph,
                page.title || page.slug || 'Page',
              );
              console.info('[GodEditor] Page legacy convertie en format Craft et désérialisée.');
            } catch (e) {
              console.error('[GodEditor] Conversion legacy→Craft échouée:', e);
              console.warn(
                'Structure JSON détectée au format legacy. Le canvas par défaut sera utilisé.',
              );
            }
          } else {
            console.warn(
              'Structure JSON détectée au format legacy. Le canvas par défaut sera utilisé.',
            );
          }
        } else {
          const htmlContent = page.content_raw || page.content || '';
          const htmlStructure = createHtmlCraftStructure(htmlContent);
          structureToLoad = normalizeCraftStructureForBuilder(
            htmlStructure,
            page.title || page.slug || 'Page',
          );
          console.info('[GodEditor] Page sans structure Builder ouverte via HtmlBlock.');
        }

        if (!structureToLoad) {
          const htmlContent = page.content_raw || page.content || '';
          structureToLoad = normalizeCraftStructureForBuilder(
            createHtmlCraftStructure(htmlContent),
            page.title || page.slug || 'Page',
          );
        }

        if (!structureToLoad) {
          throw new Error('Structure Builder impossible à normaliser');
        }

        setInitialStructure(structureToLoad);
        lastSerializedRef.current = JSON.stringify(structureToLoad);

        // Check local storage backup
        const localBackupStr = localStorage.getItem(`proquelec_builder_backup_${pageId}`);
        if (localBackupStr) {
          try {
            const backupObj = JSON.parse(localBackupStr) as LocalBackupData;
            const pageUpdatedAt = new Date(page.updated_at || 0).getTime();
            if (backupObj && backupObj.timestamp > pageUpdatedAt && backupObj.structure_json) {
              setHasLocalBackup(true);
              setLocalBackupData(backupObj);
            }
          } catch (e) {
            console.error('Error checking local backup:', e);
          }
        }
      } catch (error: unknown) {
        const errorMsg = getErrorMessage(error);
        console.error('Erreur chargement page:', error);
        setError(errorMsg);
        toast.error('Impossible de charger la page : ' + errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [pageId]);

  // Restore/discard local backups
  const restoreLocalBackup = useCallback(() => {
    if (localBackupData && localBackupData.structure_json) {
      const backupStructure = parseBuilderStructure(localBackupData.structure_json);
      const normalizedBackup = normalizeCraftStructureForBuilder(
        backupStructure,
        localBackupData.pageData?.title || pageData?.title || 'Page',
      );

      actionsRef.current.deserialize(normalizedBackup || localBackupData.structure_json);
      if (localBackupData.pageData) {
        setPageData(localBackupData.pageData);
      }
      toast.success('Sauvegarde locale restaurée !');
    }
    setHasLocalBackup(false);
    localStorage.removeItem(`proquelec_builder_backup_${pageId}`);
  }, [localBackupData, pageData?.title, pageId]);

  const discardLocalBackup = useCallback(() => {
    setHasLocalBackup(false);
    localStorage.removeItem(`proquelec_builder_backup_${pageId}`);
    toast.info('Sauvegarde locale ignorée.');
  }, [pageId]);

  const markCanvasHydrated = useCallback(
    (serialized?: string) => {
      try {
        lastSerializedRef.current = serialized || query.serialize();
      } catch {
        lastSerializedRef.current = initialStructure ? JSON.stringify(initialStructure) : '';
      }
      hydrationReadyRef.current = true;
      useBuilderHistoryStore.getState().setAutosaveStatus('saved');
    },
    [initialStructure, query],
  );

  // Autosave subscription to Craft.js store
  useEffect(() => {
    if (!pageId || !store) return;

    let localSaveTimer: ReturnType<typeof window.setTimeout> | undefined;
    let dbSaveTimer: ReturnType<typeof window.setTimeout> | undefined;

    const unsubscribe = (store as { subscribe: (listener: () => void) => () => void }).subscribe(
      () => {
        if (!hydrationReadyRef.current || isLoading) return;

        // Mark as dirty
        const historyStore = useBuilderHistoryStore.getState();
        if (historyStore.autosaveStatus === 'saved') {
          historyStore.setAutosaveStatus('dirty');
        }

        // 1. Local backup save (1s)
        if (localSaveTimer) window.clearTimeout(localSaveTimer);
        localSaveTimer = window.setTimeout(() => {
          try {
            const structureJson = query.serialize();
            const validStructure = ensureValidBuilderStructure(structureJson);
            if (!validStructure) return;

            const jsonStr =
              typeof structureJson === 'string' ? structureJson : JSON.stringify(structureJson);

            if (jsonStr !== lastSerializedRef.current) {
              localStorage.setItem(
                `proquelec_builder_backup_${pageId}`,
                JSON.stringify({
                  timestamp: Date.now(),
                  structure_json: validStructure,
                  pageData,
                }),
              );
              useBuilderHistoryStore.getState().setAutosaveStatus('local_draft');
            }
          } catch (e) {
            console.error('Error saving local backup:', e);
          }
        }, 1000);

        // 2. Database draft autosave (3s)
        if (dbSaveTimer) window.clearTimeout(dbSaveTimer);
        dbSaveTimer = window.setTimeout(async () => {
          if (pageData?.pageType === 'functional') {
            useBuilderHistoryStore.getState().setAutosaveStatus('saved');
            return;
          }

          try {
            const structureJson = query.serialize();
            const validStructure = ensureValidBuilderStructure(structureJson);
            if (!validStructure) return;

            const jsonStr =
              typeof structureJson === 'string' ? structureJson : JSON.stringify(structureJson);

            if (jsonStr !== lastSerializedRef.current) {
              useBuilderHistoryStore.getState().setAutosaveStatus('saving');

              const themeConfig = useBuilderThemeStore.getState().themeConfig;
              await apiFetch(`/api/admin/pages/${pageId}/atomic-save`, {
                method: 'PUT',
                body: JSON.stringify({ draft_json: validStructure, theme_config: themeConfig ?? {} }),
              });

              lastSerializedRef.current = jsonStr;
              useBuilderHistoryStore.getState().setAutosaveStatus('saved');
            }
          } catch (e) {
            console.error('Database autosave failed:', e);
            // Keep dirty status so user knows it failed
            useBuilderHistoryStore.getState().setAutosaveStatus('dirty');
          }
        }, 3000);
      },
    );

    return () => {
      unsubscribe();
      if (localSaveTimer) window.clearTimeout(localSaveTimer);
      if (dbSaveTimer) window.clearTimeout(dbSaveTimer);
    };
  }, [store, pageId, pageData, query, isLoading]);

  // beforeunload + visibilitychange + sendBeacon flush
  useEffect(() => {
    if (!pageId) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const status = useBuilderHistoryStore.getState().autosaveStatus;
      if (status !== 'dirty' && status !== 'saving') return;

      e.preventDefault();
      e.returnValue = '';

      try {
        const structureJson = query.serialize();
        const validStructure = ensureValidBuilderStructure(structureJson);
        if (validStructure) {
          const themeConfig = useBuilderThemeStore.getState().themeConfig;
          const payload = JSON.stringify({ draft_json: validStructure, theme_config: themeConfig ?? {} });
          navigator.sendBeacon(
            `/api/admin/pages/${pageId}/atomic-save`,
            new Blob([payload], { type: 'application/json' }),
          );
        }
      } catch {
        // Silent fail during unload
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'hidden') return;

      const status = useBuilderHistoryStore.getState().autosaveStatus;
      if (status !== 'dirty' && status !== 'saving') return;

      try {
        const structureJson = query.serialize();
        const validStructure = ensureValidBuilderStructure(structureJson);
        if (!validStructure) return;

        const jsonStr = typeof structureJson === 'string' ? structureJson : JSON.stringify(structureJson);
        if (jsonStr !== lastSerializedRef.current) {
          localStorage.setItem(
            `proquelec_builder_backup_${pageId}`,
            JSON.stringify({
              timestamp: Date.now(),
              structure_json: validStructure,
              pageData,
            }),
          );
        }
      } catch {
        // Silent fail during visibility change
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pageId, pageData, query]);

  // Save/Publish page data manually
  const savePage = useCallback(
    async (versionName?: string) => {
      if (!pageId) {
        toast.error('Identifiant de page manquant.');
        return;
      }

      if (!getAuthToken()) {
        toast.error('Authentification requise. Connectez-vous pour sauvegarder la page.');
        return;
      }

      setIsSaving(true);
      try {
        if (!hydrationReadyRef.current) {
          toast.error('Le builder termine le chargement de la page. Réessayez dans un instant.');
          return;
        }

        if (pageData?.pageType === 'functional') {
          useBuilderHistoryStore.getState().setAutosaveStatus('saved');
          toast.info(
            'Page fonctionnelle verrouillée : la logique React reste protégée. Modifiez une page CONTENT ou HYBRIDE pour publier du design.',
          );
          return;
        }

        const structureJson = query.serialize();
        const validStructure = ensureValidBuilderStructure(structureJson);
        if (!validStructure) {
          throw new Error('Structure du builder invalide, sauvegarde interrompue');
        }

        const themeConfig = useBuilderThemeStore.getState().themeConfig;
        const themeValidation = validateThemeConfig(themeConfig);
        if (!themeValidation.success) {
          throw new Error('Configuration de thème invalide, sauvegarde interrompue');
        }

        // Update page published version
        await apiFetch(`/api/admin/pages/${pageId}`, {
          method: 'PUT',
          body: JSON.stringify({
            structure_json: validStructure,
            theme_config: themeConfig ?? {},
            title: pageData?.title,
            slug: pageData?.slug,
            meta_description: pageData?.metaDescription,
            meta_keywords: pageData?.metaKeywords,
            meta_robots: pageData?.metaRobots,
            custom_css: pageData?.customCss,
            custom_js: pageData?.customJs,
            design_options: pageData?.designOptions,
            is_published: pageData?.isPublished,
            workflow_status: pageData?.workflowStatus,
          }),
        });

        // Brouillon optionnel (colonnes draft_json — migration builder)
        try {
          await apiFetch(`/api/admin/pages/${pageId}/draft`, {
            method: 'PUT',
            body: JSON.stringify({ draft_json: validStructure }),
          });
        } catch (draftErr) {
          console.warn('[GodEditor] Sauvegarde brouillon ignorée:', draftErr);
        }

        // Clear local backup
        localStorage.removeItem(`proquelec_builder_backup_${pageId}`);
        setHasLocalBackup(false);

        // Create page version if versionName is provided (Timeline checkpoint)
        if (versionName) {
          await apiFetch(`/api/admin/pages/${pageId}/versions`, {
            method: 'POST',
            body: JSON.stringify({
              version_name: versionName,
              structure_json: validStructure,
            }),
          });
        }

        lastSerializedRef.current =
          typeof structureJson === 'string' ? structureJson : JSON.stringify(structureJson);
        useBuilderHistoryStore.getState().setAutosaveStatus('saved');
        toast.success(
          versionName ? 'Version historique créée avec succès !' : 'Page publiée avec succès !',
        );
      } catch (error: unknown) {
        console.error('Erreur sauvegarde:', error);
        const err = error as { message?: string; status?: number; code?: string };
        let hint = '';
        if (err.status === 401 || err.code === 'AUTH_EXPIRED') {
          hint = ' Reconnectez-vous à l’admin.';
        } else if (err.status === 500) {
          hint = ' Vérifiez que PostgreSQL tourne et lancez npm run migrate:auto.';
        } else if (err.code === 'NETWORK_FAIL') {
          hint = ' Le serveur API (port 3010) est-il démarré ?';
        }
        toast.error(`Erreur lors de la sauvegarde : ${err.message || 'Erreur inconnue'}${hint}`);
      } finally {
        setIsSaving(false);
      }
    },
    [pageId, pageData, query],
  );

  const updateMetadata = useCallback((changes: Partial<PageDataState>) => {
    setPageData((prev) => (prev ? { ...prev, ...changes } : null));
    // Trigger history change
    useBuilderHistoryStore.getState().setAutosaveStatus('dirty');
  }, []);

  return (
    <GodEditorContext.Provider
      value={{
        pageId,
        pageData,
        setPageData,
        initialStructure,
        isLoading,
        isSaving,
        error,
        savePage,
        updateMetadata,
        markCanvasHydrated,
        hasLocalBackup,
        restoreLocalBackup,
        discardLocalBackup,
      }}
    >
      {children}
    </GodEditorContext.Provider>
  );
};
