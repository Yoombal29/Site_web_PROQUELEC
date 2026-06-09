import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Box, Globe, Database } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PropertyPanel from './PropertyPanel';
import PageSettingsPanel from './PageSettingsPanel';
import { DataBindingPanel } from './DataBindingPanel';

interface BuilderRightPanelProps {
  selectedBlockId: string | null;
  pageData: any;
  pageMetadata: any;
  blocks: any[];
  selectBlock: (id: string | null) => void;
  handlePageDataChange: (changes: any) => void;
  setPageMetadata: (metadata: any) => void;
  isDragging: boolean;
}

/**
 * Hook qui retarde la mise à jour d'une valeur (debounce).
 * Utilisé pour éviter de recalculer contentHtml à chaque frappe.
 */
function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export const BuilderRightPanel: React.FC<BuilderRightPanelProps> = React.memo(({
  selectedBlockId,
  pageData,
  pageMetadata,
  blocks,
  selectBlock,
  handlePageDataChange,
  setPageMetadata,
  isDragging
}) => {
  // Sérialiser les blocs en JSON seulement pour le score SEO,
  // et avec un debounce de 1s pour ne PAS le recalculer à chaque frappe.
  const debouncedBlocks = useDebounced(blocks, 1000);
  const contentHtml = useMemo(() => {
    if (isDragging) return '';
    try {
      return JSON.stringify(debouncedBlocks, (_, value) => {
        if (value instanceof HTMLElement || typeof value === 'function') {
          return undefined;
        }
        return value;
      });
    } catch {
      return '';
    }
  }, [debouncedBlocks, isDragging]);

  // Construire l'objet pageSettings une seule fois pour éviter les re-renders inutiles
  const pageSettings = useMemo(() => pageData ? {
    title: pageData.title,
    slug: pageData.slug,
    metaDescription: pageData.metaDescription,
    metaKeywords: pageData.metaKeywords,
    metaRobots: pageData.metaRobots,
    customCss: pageData.customCss,
    customJs: pageData.customJs,
    designOptions: pageData.designOptions as unknown as Record<string, unknown>,
    isPublished: pageData.isPublished,
    workflowStatus: pageData.workflowStatus
  } : undefined, [
    pageData?.title, pageData?.slug, pageData?.metaDescription,
    pageData?.metaKeywords, pageData?.metaRobots, pageData?.customCss,
    pageData?.customJs, pageData?.designOptions, pageData?.isPublished,
    pageData?.workflowStatus
  ]);

  const pageSettingsForPropertyPanel = useMemo(() => pageData ? {
    title: pageData.title,
    slug: pageData.slug,
    metaDescription: pageData.metaDescription,
    metaKeywords: pageData.metaKeywords,
    metaRobots: pageData.metaRobots,
    customCss: pageData.customCss,
    customJs: pageData.customJs,
    isPublished: pageData.isPublished,
    workflowStatus: pageData.workflowStatus
  } : undefined, [
    pageData?.title, pageData?.slug, pageData?.metaDescription,
    pageData?.metaKeywords, pageData?.metaRobots, pageData?.customCss,
    pageData?.customJs, pageData?.isPublished, pageData?.workflowStatus
  ]);

  return (
    <aside aria-label="Panneau de propriétés" data-testid="property-panel" className="border-l border-slate-200 flex flex-col shadow-sm z-10 w-[400px] min-w-[400px] bg-white transition-all duration-300 shrink-0">
      <Tabs value={selectedBlockId ? 'block' : 'page'} className="flex flex-col h-full">
        <div className="border-b bg-slate-50 px-2 pt-1.5 shrink-0">
          <TabsList className="w-full grid grid-cols-2 h-9 bg-slate-100/80">
            <TabsTrigger
              value="block"
              onClick={() => { if (!selectedBlockId) selectBlock(null); }}
              className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Box className="w-3 h-3" />
              Bloc
              {selectedBlockId && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-1"></span>}
            </TabsTrigger>
            <TabsTrigger
              value="page"
              onClick={() => selectBlock(null)}
              className="text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Globe className="w-3 h-3" />
              Page
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="block" className="flex-1 overflow-y-auto mt-0">
          <PropertyPanel
            pageSettings={pageSettingsForPropertyPanel}
            onPageSettingsChange={handlePageDataChange}
          />
          <DataBindingPanel />
        </TabsContent>
        <TabsContent value="page" className="flex-1 overflow-y-auto mt-0">
          <PageSettingsPanel
            pageSettings={pageSettings}
            onPageSettingsChange={handlePageDataChange}
            pageMetadata={pageMetadata}
            onPageMetadataChange={setPageMetadata}
            contentHtml={contentHtml}
          />
        </TabsContent>
      </Tabs>
    </aside>
  );
});
