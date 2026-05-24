import React from 'react';
import { Box, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PropertyPanel from './PropertyPanel';
import PageSettingsPanel from './PageSettingsPanel';

interface BuilderRightPanelProps {
  selectedBlockId: string | null;
  pageData: any;
  pageMetadata: any;
  blocks: any[];
  selectBlock: (id: string | null) => void;
  handlePageDataChange: (changes: any) => void;
  setPageMetadata: (metadata: any) => void;
}

export const BuilderRightPanel: React.FC<BuilderRightPanelProps> = ({
  selectedBlockId,
  pageData,
  pageMetadata,
  blocks,
  selectBlock,
  handlePageDataChange,
  setPageMetadata
}) => {
  return (
    <aside className="border-l border-slate-200 flex flex-col shadow-sm z-10 w-[400px] min-w-[400px] bg-white transition-all duration-300 shrink-0">
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
        <TabsContent value="block" className="flex-1 overflow-hidden mt-0">
          <PropertyPanel
            pageSettings={pageData ? {
              title: pageData.title,
              slug: pageData.slug,
              metaDescription: pageData.metaDescription,
              metaKeywords: pageData.metaKeywords,
              metaRobots: pageData.metaRobots,
              customCss: pageData.customCss,
              customJs: pageData.customJs,
              isPublished: pageData.isPublished,
              workflowStatus: pageData.workflowStatus
            } : undefined}
            onPageSettingsChange={handlePageDataChange}
          />
        </TabsContent>
        <TabsContent value="page" className="flex-1 overflow-hidden mt-0">
          <PageSettingsPanel
            pageSettings={pageData ? {
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
            } : undefined}
            onPageSettingsChange={handlePageDataChange}
            pageMetadata={pageMetadata}
            onPageMetadataChange={setPageMetadata}
            contentHtml={JSON.stringify(blocks)}
          />
        </TabsContent>
      </Tabs>
    </aside>
  );
};
