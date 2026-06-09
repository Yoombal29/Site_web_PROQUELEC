import React from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import BuilderPageRenderer from './BuilderPageRenderer';
import type { Block } from '@/types/builder';

interface BuilderDialogsProps {
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  setPreviewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  blocks: Block[];
  pageData: any;
  versionDialogOpen: boolean;
  setVersionDialogOpen: (open: boolean) => void;
  versionChangeLog: string;
  setVersionChangeLog: (log: string) => void;
  handleCreateVersion: () => void;
  pageVersions: any[];
  handleRestoreVersion: (versionId: string) => void;
  showAnalytics: boolean;
  setShowAnalytics: (show: boolean) => void;
  analyticsData: { views: number; uniqueVisitors: number; avgTime: string; bounceRate: string } | null;
}

export const BuilderDialogs: React.FC<BuilderDialogsProps> = ({
  showPreview,
  setShowPreview,
  previewMode,
  setPreviewMode,
  blocks,
  pageData,
  versionDialogOpen,
  setVersionDialogOpen,
  versionChangeLog,
  setVersionChangeLog,
  handleCreateVersion,
  pageVersions,
  handleRestoreVersion,
  showAnalytics,
  setShowAnalytics,
  analyticsData
}) => {
  return (
    <>
      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader>
            <DialogTitle>Aperçu de la page</DialogTitle>
            <DialogDescription>Visualisez le rendu final de la page sans les contrôles du builder.</DialogDescription>
          </DialogHeader>
          <div className="p-4 border-b bg-slate-50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Mode aperçu</span>
              <span className="text-xs text-slate-500">{pageData?.title || 'Page'}</span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant={previewMode === 'desktop' ? 'default' : 'outline'} onClick={() => setPreviewMode('desktop')}>
                <Monitor className="w-4 h-4" />
              </Button>
              <Button size="sm" variant={previewMode === 'tablet' ? 'default' : 'outline'} onClick={() => setPreviewMode('tablet')}>
                <Tablet className="w-4 h-4" />
              </Button>
              <Button size="sm" variant={previewMode === 'mobile' ? 'default' : 'outline'} onClick={() => setPreviewMode('mobile')}>
                <Smartphone className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="bg-slate-200 p-4 overflow-auto h-[calc(90vh-120px)]">
            <div className={`mx-auto bg-white shadow rounded overflow-hidden ${previewMode === 'desktop' ? 'max-w-4xl' : previewMode === 'tablet' ? 'max-w-md' : 'max-w-sm'}`}>
              <BuilderPageRenderer blocks={blocks} isEditor={false} className="min-h-[75vh]" />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Version Dialog */}
      <Dialog open={versionDialogOpen} onOpenChange={setVersionDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Historique des versions</DialogTitle>
            <DialogDescription>Gérez les sauvegardes manuelles de cette page.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded border border-slate-200">
              <label htmlFor="version-change-log" className="block text-xs uppercase text-slate-400 mb-2">Description de la version</label>
              <input
                id="version-change-log"
                className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
                value={versionChangeLog}
                onChange={(e) => setVersionChangeLog(e.target.value)}
              />
              <div className="mt-3 text-right">
                <Button size="sm" onClick={handleCreateVersion} className="min-w-[140px]">
                  Créer une version
                </Button>
              </div>
            </div>

            {pageVersions.length === 0 ? (
              <div className="text-sm text-slate-500">Aucune version enregistrée pour cette page.</div>
            ) : (
              <div className="space-y-3">
                {pageVersions.map((version) => (
                  <div key={version.id} className="p-4 rounded border border-slate-200 bg-white flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">Version {version.version}</div>
                        <div className="text-[11px] text-slate-500">{version.title}</div>
                      </div>
                      <div className="text-[11px] text-slate-400">{new Date(version.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="text-[12px] text-slate-600">{version.changeLog}</div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleRestoreVersion(version.id)}>
                        Restaurer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Analytics de page</DialogTitle>
            <DialogDescription>Vue sur les performances et l'engagement de cette page.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded border border-slate-200 bg-slate-50">
                <div className="text-xs uppercase text-slate-400">Vues</div>
                <div className="text-3xl font-semibold text-slate-900">{analyticsData?.views ?? '—'}</div>
              </div>
              <div className="p-4 rounded border border-slate-200 bg-slate-50">
                <div className="text-xs uppercase text-slate-400">Visiteurs uniques</div>
                <div className="text-3xl font-semibold text-slate-900">{analyticsData?.uniqueVisitors ?? '—'}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded border border-slate-200 bg-slate-50">
                <div className="text-xs uppercase text-slate-400">Temps moyen</div>
                <div className="text-2xl font-semibold text-slate-900">{analyticsData?.avgTime ?? '—'}</div>
              </div>
              <div className="p-4 rounded border border-slate-200 bg-slate-50">
                <div className="text-xs uppercase text-slate-400">Taux de rebond</div>
                <div className="text-2xl font-semibold text-slate-900">{analyticsData?.bounceRate ?? '—'}</div>
              </div>
            </div>
            <div className="text-sm text-slate-500">Les données affichées sont basées sur des analytics agrégés et la correspondance de page.</div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
