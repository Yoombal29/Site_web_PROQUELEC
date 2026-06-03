import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useEditor } from '@craftjs/core';
import { apiFetch } from '@/lib/api-client';
import { toast } from 'sonner';
import { useBuilderThemeStore, DEFAULT_THEME } from '@/stores/builder-theme.store';
import { useBuilderHistoryStore } from '@/stores/builder-history.store';
import { validateBuilderStructure, validateThemeConfig } from '@/validation/builderSchema';
import convertLegacyBlocksToCraftGraph from '@/utils/legacyToCraft';
import {
  createFunctionalPageStructure,
  isFunctionalPageStructure,
} from '@/lib/functional-page-structure';

export type PageDesignOptions = {
  theme?: string;
  layout?: string;
  customPalette?: string[];
  [key: string]: any;
};

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
};

interface GodEditorContextType {
  pageId: string | undefined;
  pageData: PageDataState | null;
  setPageData: React.Dispatch<React.SetStateAction<PageDataState | null>>;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  savePage: (versionName?: string) => Promise<void>;
  updateMetadata: (changes: Partial<PageDataState>) => void;
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local backup states
  const [hasLocalBackup, setHasLocalBackup] = useState(false);
  const [localBackupData, setLocalBackupData] = useState<any>(null);

  // Ref to prevent autosave loops
  const lastSerializedRef = useRef<string>('');

  const isCraftJsFormat = (jsonObj: any): boolean => {
    return jsonObj && typeof jsonObj === 'object' && !Array.isArray(jsonObj) && 'ROOT' in jsonObj;
  };

  const parseBuilderStructure = (json: string | unknown): unknown => {
    if (typeof json === 'string') {
      try {
        return JSON.parse(json);
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
        });
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentification requise. Connectez-vous pour accéder au builder.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const page = await apiFetch<any>(`/api/admin/pages/${pageId}`);

        setPageData({
          title: page.title || 'Nouvelle page',
          slug: page.slug || '',
          metaDescription: page.meta_description || '',
          metaKeywords: page.meta_keywords || '',
          metaRobots: page.meta_robots || 'index,follow',
          customCss: page.custom_css || '',
          customJs: page.custom_js || '',
          designOptions:
            typeof page.design_options === 'string'
              ? JSON.parse(page.design_options)
              : page.design_options || {},
          isPublished: page.is_published || false,
          workflowStatus: page.workflow_status || page.status || 'draft',
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
              .loadTheme({ ...DEFAULT_THEME, ...themeValidation.data } as any);
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

        // Check structure: prioritize draft_json over structure_json
        const dbStructure = page.draft_json || page.structure_json;

        const isHybrid = page.design_options?.page_type === 'hybrid';
        const isFunctional = page.immutable === true && !isHybrid;
        const parsedDbStructure = parseBuilderStructure(dbStructure);

        if (isFunctional && !isFunctionalPageStructure(parsedDbStructure)) {
          const functionalStructure = createFunctionalPageStructure(
            page.slug || 'dashboard',
            page.title || 'Page fonctionnelle',
          );
          // @ts-ignore - Craft.js deserialize accepte les objets bruts
          actionsRef.current.deserialize(functionalStructure);
          lastSerializedRef.current = JSON.stringify(functionalStructure);
          console.info('[GodEditor] Structure fonctionnelle créée pour:', page.slug);
        } else if (parsedDbStructure) {
          const parsed: any = parsedDbStructure;
          lastSerializedRef.current =
            typeof dbStructure === 'string' ? dbStructure : JSON.stringify(dbStructure);

          if (isCraftJsFormat(parsed)) {
            actionsRef.current.deserialize(parsed);
          } else if (Array.isArray(parsed)) {
            try {
              const craftGraph = convertLegacyBlocksToCraftGraph(
                parsed,
                page.title || page.slug || 'Page',
              );
              actionsRef.current.deserialize(craftGraph);
              lastSerializedRef.current = JSON.stringify(craftGraph);
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
        }

        // Check local storage backup
        const localBackupStr = localStorage.getItem(`proquelec_builder_backup_${pageId}`);
        if (localBackupStr) {
          try {
            const backupObj = JSON.parse(localBackupStr);
            const pageUpdatedAt = new Date(page.updated_at || 0).getTime();
            if (backupObj && backupObj.timestamp > pageUpdatedAt && backupObj.structure_json) {
              setHasLocalBackup(true);
              setLocalBackupData(backupObj);
            }
          } catch (e) {
            console.error('Error checking local backup:', e);
          }
        }
      } catch (error: any) {
        const errorMsg = error.message || 'Erreur inconnue';
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
      actionsRef.current.deserialize(localBackupData.structure_json);
      if (localBackupData.pageData) {
        setPageData(localBackupData.pageData);
      }
      toast.success('Sauvegarde locale restaurée !');
    }
    setHasLocalBackup(false);
    localStorage.removeItem(`proquelec_builder_backup_${pageId}`);
  }, [localBackupData, pageId]);

  const discardLocalBackup = useCallback(() => {
    setHasLocalBackup(false);
    localStorage.removeItem(`proquelec_builder_backup_${pageId}`);
    toast.info('Sauvegarde locale ignorée.');
  }, [pageId]);

  // Autosave subscription to Craft.js store
  useEffect(() => {
    if (!pageId || !store) return;

    let localSaveTimer: any;
    let dbSaveTimer: any;

    const unsubscribe = (store as any).subscribe(() => {
      // Mark as dirty
      const historyStore = useBuilderHistoryStore.getState();
      if (historyStore.autosaveStatus === 'saved') {
        historyStore.setAutosaveStatus('dirty');
      }

      // 1. Local backup save (1s)
      clearTimeout(localSaveTimer);
      localSaveTimer = setTimeout(() => {
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
      clearTimeout(dbSaveTimer);
      dbSaveTimer = setTimeout(async () => {
        try {
          const structureJson = query.serialize();
          const validStructure = ensureValidBuilderStructure(structureJson);
          if (!validStructure) return;

          const jsonStr =
            typeof structureJson === 'string' ? structureJson : JSON.stringify(structureJson);

          if (jsonStr !== lastSerializedRef.current) {
            useBuilderHistoryStore.getState().setAutosaveStatus('saving');

            await apiFetch(`/api/admin/pages/${pageId}/draft`, {
              method: 'PUT',
              body: JSON.stringify({ draft_json: validStructure }),
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
    });

    return () => {
      unsubscribe();
      clearTimeout(localSaveTimer);
      clearTimeout(dbSaveTimer);
    };
  }, [store, pageId, pageData, query]);

  // Save/Publish page data manually
  const savePage = useCallback(
    async (versionName?: string) => {
      if (!pageId) {
        toast.error('Identifiant de page manquant.');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentification requise. Connectez-vous pour sauvegarder la page.');
        return;
      }

      setIsSaving(true);
      try {
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
        isLoading,
        isSaving,
        error,
        savePage,
        updateMetadata,
        hasLocalBackup,
        restoreLocalBackup,
        discardLocalBackup,
      }}
    >
      {children}
    </GodEditorContext.Provider>
  );
};
