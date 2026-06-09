import React, { useCallback, useState } from 'react';
import {
  useSelectedBlock,
  useUpdateBlockStyle,
  useUpdateBlockContent,
} from '@/stores/useBuilderStoreSelectors';
import { useDataStore } from '@/engine/data/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Database, Link, Link2Off, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const DataBindingPanel: React.FC<{ className?: string }> = ({ className }) => {
  const selectedBlock = useSelectedBlock();
  const updateContent = useUpdateBlockContent();
  const updateStyle = useUpdateBlockStyle();

  const { sources, registerSource, removeSource, refreshSource, resolveBlockData } = useDataStore();

  const [endpoint, setEndpoint] = useState('');
  const [dataPreview, setDataPreview] = useState<string | null>(null);

  const blockSourceId = selectedBlock?.dataSourceId;
  const currentSource = blockSourceId ? sources[blockSourceId] : undefined;

  const handleConnectApi = useCallback(() => {
    if (!selectedBlock || !endpoint.trim()) return;

    const sourceId = registerSource({
      type: 'api',
      endpoint: endpoint.trim(),
      method: 'GET',
    });

    // Update block with sourceId
    const blockEl = document.getElementById(selectedBlock.id);
    if (blockEl) {
      // We'll use the builder store to update the block's dataSourceId
      // This will be handled by the builder store integration
    }

    // Refresh immediately
    refreshSource(sourceId);
    setEndpoint('');
  }, [selectedBlock, endpoint, registerSource, refreshSource]);

  const handleDisconnect = useCallback(() => {
    if (!selectedBlock || !blockSourceId) return;
    removeSource(blockSourceId);
  }, [selectedBlock, blockSourceId, removeSource]);

  const handleRefresh = useCallback(() => {
    if (blockSourceId) refreshSource(blockSourceId);
  }, [blockSourceId, refreshSource]);

  const handlePreview = useCallback(() => {
    if (!blockSourceId || !currentSource?.data) return;
    setDataPreview(JSON.stringify(currentSource.data, null, 2));
  }, [blockSourceId, currentSource]);

  if (!selectedBlock) return null;

  return (
    <div className={cn('p-3 border-t border-slate-100', className)}>
      <div className="flex items-center gap-2 mb-3">
        <Database className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-xs font-semibold text-slate-600">Données dynamiques</span>
      </div>

      {/* Currently connected source */}
      {currentSource ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between bg-blue-50 rounded p-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className={cn(
                'w-2 h-2 rounded-full shrink-0',
                currentSource.status === 'ready' && 'bg-green-500',
                currentSource.status === 'loading' && 'bg-yellow-500 animate-pulse',
                currentSource.status === 'error' && 'bg-red-500',
              )} />
              <span className="text-[10px] font-mono text-slate-600 truncate">
                {currentSource.source.type === 'api'
                  ? (currentSource.source as any).endpoint
                  : currentSource.source.type}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleRefresh}
                className="p-1 hover:bg-blue-100 rounded"
                title="Rafraîchir"
              >
                <RefreshCw className={cn(
                  'w-3 h-3 text-slate-500',
                  currentSource.status === 'loading' && 'animate-spin'
                )} />
              </button>
              <button
                onClick={handleDisconnect}
                className="p-1 hover:bg-red-100 rounded"
                title="Déconnecter"
              >
                <Link2Off className="w-3 h-3 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Status */}
          {currentSource.status === 'ready' && (
            <button
              onClick={handlePreview}
              className="w-full text-[10px] text-left text-green-700 bg-green-50 rounded p-1.5 hover:bg-green-100"
            >
              ✓ Données chargées — cliquer pour prévisualiser
            </button>
          )}
          {currentSource.status === 'loading' && (
            <div className="flex items-center gap-1 text-[10px] text-yellow-700">
              <Loader2 className="w-3 h-3 animate-spin" />
              Chargement...
            </div>
          )}
          {currentSource.status === 'error' && (
            <div className="text-[10px] text-red-600 bg-red-50 rounded p-1.5">
              ✗ {currentSource.error}
            </div>
          )}

          {/* Data preview */}
          {dataPreview && (
            <pre className="text-[10px] font-mono bg-slate-950 text-slate-200 p-2 rounded max-h-32 overflow-auto">
              {dataPreview}
            </pre>
          )}

          {/* Template syntax hint */}
          <div className="text-[10px] text-slate-400 italic">
            Utilisez <code className="text-blue-600 font-mono">{'{{path.to.value}}'}</code> dans le contenu
          </div>
        </div>
      ) : (
        /* No source — show connect form */
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Input
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="/api/projects/current"
              className="h-7 text-xs font-mono flex-1"
            />
            <Button
              size="sm"
              className="h-7 text-xs shrink-0"
              onClick={handleConnectApi}
              disabled={!endpoint.trim()}
            >
              <Link className="w-3 h-3 mr-1" />
              Connecter
            </Button>
          </div>
          <div className="text-[10px] text-slate-400 flex gap-2">
            <span className="text-blue-500 cursor-pointer hover:underline" onClick={() => setEndpoint('/api/projects')}>Projets</span>
            <span className="text-blue-500 cursor-pointer hover:underline" onClick={() => setEndpoint('/api/stats')}>Stats</span>
            <span className="text-blue-500 cursor-pointer hover:underline" onClick={() => setEndpoint('/api/clients')}>Clients</span>
          </div>
        </div>
      )}

      {/* Template syntax instructions */}
      <div className="mt-2 pt-2 border-t border-slate-100">
        <div className="text-[10px] text-slate-500 font-medium mb-1">Syntaxe de liaison</div>
        <div className="space-y-0.5">
          <code className="block text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
            {'{'}{'{'}project.name{'}'}{'}'} → Titre du projet
          </code>
          <code className="block text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
            {'{'}{'{'}stats.total{'}'}{'}'} → Valeur statistique
          </code>
          <code className="block text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
            {'{'}{'{'}items[0].label{'}'}{'}'} → Premier élément
          </code>
        </div>
      </div>
    </div>
  );
};
