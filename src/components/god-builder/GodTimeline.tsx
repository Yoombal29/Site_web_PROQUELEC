import React, { useState, useEffect, useCallback } from 'react';
import { useEditor } from '@craftjs/core';
import { useBuilderHistoryStore } from '@/stores/builder-history.store';
import { useGodEditor } from './GodEditorContext';
import { apiFetch } from '@/lib/api-client';
import { 
  Clock, X, Plus, RotateCcw, User, Calendar, 
  Check, ChevronRight, History, Sparkles 
} from 'lucide-react';
import { toast } from 'sonner';

export const GodTimeline = () => {
  const { timelineOpen, setTimelineOpen } = useBuilderHistoryStore();
  const { pageId, savePage } = useGodEditor();
  const { actions } = useEditor();

  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newVersionName, setNewVersionName] = useState('');
  const [creating, setCreating] = useState(false);

  // Load versions list
  const fetchVersions = useCallback(async () => {
    if (!pageId) return;
    setLoading(true);
    try {
      const data = await apiFetch<any[]>(`/api/admin/pages/${pageId}/versions`);
      setVersions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors du chargement des versions");
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    if (timelineOpen && pageId) {
      fetchVersions();
    }
  }, [timelineOpen, pageId, fetchVersions]);

  // Create named version
  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVersionName.trim()) return;

    setCreating(true);
    try {
      await savePage(newVersionName.trim());
      setNewVersionName('');
      await fetchVersions();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  // Restore specific version
  const handleRestoreVersion = async (versionId: string, versionName: string) => {
    const confirm = window.confirm(`Voulez-vous restaurer la version "${versionName}" ? La structure actuelle non enregistrée sera écrasée.`);
    if (!confirm) return;

    try {
      const data = await apiFetch<any>(`/api/admin/pages/${pageId}/versions/${versionId}`);
      if (data && data.structure_json) {
        let parsed = data.structure_json;
        if (typeof parsed === 'string') {
          parsed = JSON.parse(parsed);
        }
        actions.deserialize(parsed);
        toast.success(`Version "${versionName}" restaurée avec succès !`);
        setTimelineOpen(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la restauration de la version");
    }
  };

  if (!timelineOpen) return null;

  return (
    <div className="w-80 bg-[#12121f] border-l border-[#252538] h-full flex flex-col shrink-0 text-white z-50 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="h-12 flex items-center px-4 border-b border-[#252538] shrink-0 justify-between">
        <span className="text-slate-300 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
          <History size={12} className="text-amber-400 animate-spin-slow" />
          Timeline des Versions
        </span>
        <button
          onClick={() => setTimelineOpen(false)}
          className="text-slate-500 hover:text-slate-300 p-1 hover:bg-[#252538] rounded transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Named Checkpoint Form */}
      <form onSubmit={handleCreateVersion} className="p-3 border-b border-[#252538] bg-[#0d0d1a]/40 space-y-2">
        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">
          Créer un point de sauvegarde
        </label>
        <div className="flex gap-1.5">
          <input
            type="text"
            placeholder="Ex: Avant refonte grille..."
            value={newVersionName}
            onChange={e => setNewVersionName(e.target.value)}
            className="flex-1 bg-[#151521] border border-[#252538] text-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={creating || !newVersionName.trim()}
            className="px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded text-xs flex items-center justify-center shrink-0 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Créer"
          >
            {creating ? (
              <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Plus size={14} />
            )}
          </button>
        </div>
      </form>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2.5">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500" />
            <span className="text-xs">Chargement de l'historique...</span>
          </div>
        )}

        {!loading && versions.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <Clock size={32} className="mx-auto mb-3 opacity-30 text-amber-500" />
            <p className="text-xs">Aucune sauvegarde enregistrée</p>
            <p className="text-[10px] text-slate-600 mt-1 max-w-[200px] mx-auto">
              Créez votre premier point de sauvegarde nommé ci-dessus.
            </p>
          </div>
        )}

        {!loading && versions.map((ver, idx) => {
          const formattedDate = new Date(ver.created_at).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={ver.id}
              className="group relative bg-[#171726]/70 border border-[#252538] rounded-xl p-3 hover:border-amber-500/40 hover:bg-[#1a1a2e] transition-all flex flex-col gap-2"
            >
              {/* Badge for latest version */}
              {idx === 0 && (
                <span className="absolute top-2.5 right-2.5 text-[8px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/25 font-bold uppercase">
                  Dernier
                </span>
              )}

              <div className="flex items-start gap-2 pr-12">
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <History size={12} className="text-amber-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                    {ver.version_name}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                    <Calendar size={10} />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                    <User size={10} />
                    <span className="truncate">{ver.created_by || 'admin'}</span>
                  </div>
                </div>
              </div>

              {/* Restore Button */}
              <div className="pt-2 border-t border-[#252538] flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleRestoreVersion(ver.id, ver.version_name)}
                  className="flex items-center gap-1 px-3 py-1 bg-amber-500/10 border border-amber-500/25 text-amber-400 hover:bg-amber-500/25 hover:text-white rounded text-[10px] font-bold transition-all"
                >
                  <RotateCcw size={10} />
                  Restaurer cette version
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
