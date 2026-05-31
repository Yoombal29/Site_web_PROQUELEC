import React, { useRef, useState } from 'react';
import { useEditor } from '@craftjs/core';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Download, Upload, Trash2, FileJson, Save, Eye, Loader2, Cloud, HardDrive, RefreshCw, Search, Tags, Layers } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useTemplatesStore, type PageTemplate } from '@/stores/templates.store';
import { useTemplates, useCreateTemplate, useDeleteTemplate } from '@/hooks/useTemplates';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TemplateManagerDialog: React.FC<Props> = ({ open, onOpenChange }) => {
  const { templates, addTemplate, removeTemplate, exportTemplate, exportAllTemplates, importTemplate, importTemplatesBulk, setTemplates, deleteByServerId } = useTemplatesStore();
  const { data: serverTemplates, isLoading: serverLoading } = useTemplates();
  const createTemplateMut = useCreateTemplate();
  const deleteTemplateMut = useDeleteTemplate();
  const { query } = useEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saveName, setSaveName] = useState('');
  const [saveDesc, setSaveDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'local' | 'server'>('server');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Sync server templates into local store when they arrive
  React.useEffect(() => {
    if (serverTemplates && serverTemplates.length > 0) {
      const mapped = serverTemplates.map((t) => ({
        ...t,
        serverId: t.id,
      }));
      // Merge: keep local-only, replace matching server entries
      const existing = useTemplatesStore.getState().templates;
      const merged = [...mapped];
      for (const local of existing) {
        if (!local.serverId) {
          merged.push(local);
        }
      }
      setTemplates(merged);
    }
  }, [serverTemplates, setTemplates]);

  const handleSave = async () => {
    if (!saveName.trim()) {
      toast.error('Veuillez donner un nom au template');
      return;
    }
    setSaving(true);
    try {
      const json = query.serialize();
      const structure = JSON.parse(json);
      // Capture thumbnail from builder canvas
      let thumbnail: string | undefined;
      try {
        const canvasEl = document.querySelector('[data-builder-canvas]') as HTMLElement;
        if (canvasEl) {
          const captured = await html2canvas(canvasEl, {
            scale: 0.5,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
          });
          thumbnail = captured.toDataURL('image/webp', 0.7);
        }
      } catch {
        // Thumbnail capture failed — save without thumbnail
        console.warn('Thumbnail capture failed');
      }
      // Always save locally
      const localId = addTemplate({
        name: saveName.trim(),
        description: saveDesc.trim(),
        structure,
        thumbnail,
        category: 'page',
      });
      // Also save on server if available
      try {
        await createTemplateMut.mutateAsync({
          name: saveName.trim(),
          description: saveDesc.trim(),
          structure,
          thumbnail,
          category: 'page',
        });
      } catch {
        // Server unavailable — template is stored locally only
        console.warn('Server save failed, template kept locally');
      }
      toast.success(`Template "${saveName}" sauvegardé`);
      setSaveName('');
      setSaveDesc('');
    } catch (e: any) {
      toast.error('Erreur lors de la sauvegarde du template');
    } finally {
      setSaving(false);
    }
  };

  const handleExportOne = (id: string) => {
    const json = exportTemplate(id);
    if (!json) { toast.error('Template introuvable'); return; }
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const tpl = templates.find(t => t.id === id);
    a.download = `${tpl?.name || 'template'}.proquelec.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Template exporté');
  };

  const handleExportAll = () => {
    const json = exportAllTemplates();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-templates.proquelec.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${templates.length} templates exportés`);
  };

  const handleImportFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const count = importTemplatesBulk(text);
      if (count > 0) {
        toast.success(`${count} template(s) importé(s) avec succès`);
      } else {
        toast.error('Format de fichier invalide');
      }
    } catch {
      toast.error('Erreur de lecture du fichier');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    const tpl = templates.find(t => t.id === id);
    // If it has a serverId, delete from server too
    if (tpl?.serverId) {
      try {
        await deleteTemplateMut.mutateAsync(tpl.serverId);
        deleteByServerId(tpl.serverId);
      } catch {
        // Server unavailable — remove locally only
      }
    }
    removeTemplate(id);
    toast.success(`Template "${tpl?.name || ''}" supprimé`);
    if (selectedId === id) setSelectedId(null);
  };

  const handleApply = (tpl: PageTemplate) => {
    try {
      const json = JSON.stringify(tpl.structure);
      query.deserialize(json);
      toast.success(`Template "${tpl.name}" appliqué`);
      onOpenChange(false);
    } catch {
      toast.error('Erreur lors de l\'application du template');
    }
  };

  const handleRegenerateThumbnail = async (tpl: PageTemplate) => {
    try {
      const canvasEl = document.querySelector('[data-builder-canvas]') as HTMLElement;
      if (!canvasEl) { toast.error('Zone de canvas introuvable'); return; }
      const captured = await html2canvas(canvasEl, {
        scale: 0.5,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
      });
      const thumbnail = captured.toDataURL('image/webp', 0.7);
      useTemplatesStore.getState().updateTemplate(tpl.id, { thumbnail });
      toast.success(`Miniature régénérée pour "${tpl.name}"`);
    } catch {
      toast.error('Erreur lors de la capture de la miniature');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col bg-[#12121f] border-[#252538] text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <FileJson size={18} className="text-indigo-400" />
            Gestionnaire de Templates
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            Sauvegardez, exportez et importez des pages complètes au format .json
          </DialogDescription>
        </DialogHeader>

        {/* Save current page */}
        <div className="bg-[#0d0d1a] border border-[#252538] rounded-lg p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Sauvegarder la page actuelle</h3>
          <div className="flex gap-3">
            <Input
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              placeholder="Nom du template..."
              className="flex-1 bg-[#1a1a2a] border-[#252538] text-white text-sm placeholder:text-slate-600"
            />
            <Button
              onClick={handleSave}
              disabled={saving || !saveName.trim()}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Sauvegarder
            </Button>
          </div>
          <Textarea
            value={saveDesc}
            onChange={e => setSaveDesc(e.target.value)}
            placeholder="Description (optionnelle)..."
            rows={2}
            className="bg-[#1a1a2a] border-[#252538] text-white text-sm placeholder:text-slate-600 resize-none"
          />
        </div>

        {/* Search and filters */}
        <div className="flex flex-col gap-3">
          {/* Search bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher un template..."
              className="w-full bg-[#0d0d1a] border border-[#252538] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Row: filters + actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Tab switcher: Server ↔ Local */}
            <div className="flex items-center gap-1 bg-[#0d0d1a] rounded-lg p-1 border border-[#252538] w-fit">
              <button
                onClick={() => setActiveTab('server')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'server'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Cloud size={12} />
                Serveur
                {serverLoading && <Loader2 size={10} className="animate-spin" />}
                {!serverLoading && serverTemplates && (
                  <span className="text-[10px] text-slate-600 ml-0.5">({serverTemplates.length})</span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('local')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTab === 'local'
                    ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <HardDrive size={12} />
                Local
              </button>
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-1 bg-[#0d0d1a] rounded-lg p-1 border border-[#252538] w-fit">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  categoryFilter === 'all'
                    ? 'bg-slate-600/20 text-slate-300 border border-slate-500/30'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Layers size={12} />
                Toutes
              </button>
              {Array.from(new Set(templates.map(t => t.category).filter(Boolean) as string[])).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    categoryFilter === cat
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Tags size={10} />
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              onClick={handleImportFile}
              disabled={importing}
              variant="outline"
              size="sm"
              className="border-[#252538] text-slate-300 hover:bg-[#1a1a2a] hover:text-white text-xs"
            >
              {importing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Importer .json
            </Button>
            <Button
              onClick={handleExportAll}
              disabled={templates.length === 0}
              variant="outline"
              size="sm"
              className="border-[#252538] text-slate-300 hover:bg-[#1a1a2a] hover:text-white text-xs"
            >
              <Download size={14} />
              Tout exporter
            </Button>
          </div>
        </div>

        {/* Filtered + searched templates list */}
        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar" style={{ scrollbarWidth: 'thin', scrollbarColor: '#252538 transparent' }}>
          {(() => {
            // Compute filtered list
            const filtered = templates.filter(t => {
              // Tab filter
              if (activeTab === 'server' && !t.serverId) return false;
              if (activeTab === 'local' && t.serverId) return false;
              // Category filter
              if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
              // Search filter
              if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const nameMatch = t.name.toLowerCase().includes(q);
                const descMatch = t.description?.toLowerCase().includes(q);
                const catMatch = t.category?.toLowerCase().includes(q);
                if (!nameMatch && !descMatch && !catMatch) return false;
              }
              return true;
            });

            if (filtered.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-12 text-slate-600">
                  <FileJson size={32} className="mb-2 opacity-30" />
                  <p className="text-sm">
                    {searchQuery || categoryFilter !== 'all'
                      ? 'Aucun template ne correspond à vos filtres'
                      : activeTab === 'server'
                        ? 'Aucun template serveur disponible'
                        : 'Aucun template local sauvegardé'
                    }
                  </p>
                  {(searchQuery || categoryFilter !== 'all') && (
                    <button
                      onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 underline"
                    >
                      Réinitialiser les filtres
                    </button>
                  )}
                </div>
              );
            }

            return filtered.map((tpl) => (
              <div
                key={tpl.id}
                className={`bg-[#0d0d1a] border rounded-lg transition-all cursor-pointer ${
                  selectedId === tpl.id ? 'border-indigo-500 ring-1 ring-indigo-500/20' : 'border-[#252538] hover:border-[#3a3a5a] hover:bg-[#0d0d1a]/80'
                }`}
                onClick={() => setSelectedId(tpl.id === selectedId ? null : tpl.id)}
              >
                {/* Card header: thumbnail + info row */}
                <div className="flex items-start gap-3 p-3">
                  {/* Thumbnail preview */}
                  <div className="shrink-0 w-[130px] h-[85px] rounded-md overflow-hidden bg-[#1a1a2a] border border-[#252538] flex items-center justify-center group">
                    {tpl.thumbnail ? (
                      <img
                        src={tpl.thumbnail}
                        alt={tpl.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <FileJson size={20} className="text-slate-600" />
                        <span className="text-[8px] text-slate-700">Aperçu</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm text-slate-200 truncate max-w-[200px]">{tpl.name}</h4>
                      {tpl.serverId ? (
                        <span className="text-[9px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded font-semibold shrink-0 flex items-center gap-1">
                          <Cloud size={8} />
                          BDD
                        </span>
                      ) : (
                        <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-semibold shrink-0 flex items-center gap-1">
                          <HardDrive size={8} />
                          Local
                        </span>
                      )}
                      {tpl.category && (
                        <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-semibold shrink-0">
                          {tpl.category}
                        </span>
                      )}
                    </div>
                    {tpl.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{tpl.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <p className="text-[10px] text-slate-600">
                        {new Date(tpl.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                      {tpl.tags && tpl.tags.length > 0 && (
                        <div className="flex items-center gap-1">
                          {tpl.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[8px] text-slate-600 bg-slate-800/50 px-1.5 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                          {tpl.tags.length > 3 && (
                            <span className="text-[8px] text-slate-600">+{tpl.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Actions column */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Button
                      onClick={(e) => { e.stopPropagation(); handleApply(tpl); }}
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] h-7 px-3 font-semibold w-full"
                    >
                      <Eye size={12} className="mr-1" />
                      Appliquer
                    </Button>
                    <div className="flex items-center gap-1">
                      <Button
                        onClick={(e) => { e.stopPropagation(); handleRegenerateThumbnail(tpl); }}
                        size="sm"
                        variant="ghost"
                        className="text-slate-500 hover:text-white hover:bg-[#1a1a2a] h-7 w-7 p-0"
                        title="Régénérer la miniature"
                      >
                        <RefreshCw size={11} />
                      </Button>
                      <Button
                        onClick={(e) => { e.stopPropagation(); handleExportOne(tpl.id); }}
                        size="sm"
                        variant="ghost"
                        className="text-slate-500 hover:text-white hover:bg-[#1a1a2a] h-7 w-7 p-0"
                        title="Exporter"
                      >
                        <Download size={12} />
                      </Button>
                      <Button
                        onClick={(e) => { e.stopPropagation(); handleDelete(tpl.id); }}
                        size="sm"
                        variant="ghost"
                        className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 h-7 w-7 p-0"
                        title="Supprimer"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                </div>
                {/* Expanded details on select */}
                {selectedId === tpl.id && (
                  <div className="border-t border-[#252538] px-3 py-2 bg-[#08081a]">
                    <div className="flex items-center justify-between text-[10px] text-slate-600">
                      <span>ID: {tpl.id.slice(0, 8)}...</span>
                      <span>Créé: {new Date(tpl.createdAt).toLocaleDateString('fr-FR')}</span>
                      <span>Mis à jour: {new Date(tpl.updatedAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                )}
              </div>
            ));
          })()}
        </div>

        <DialogFooter className="border-t border-[#252538] pt-3">
          <p className="text-[10px] text-slate-600 flex items-center gap-2">
            <Cloud size={10} className="text-indigo-400" />
            Templates serveur (BDD partagée) — disponibles sur tous les postes
            <span className="text-slate-700 mx-1">|</span>
            <HardDrive size={10} className="text-amber-400" />
            Templates locaux (localStorage) — persistés même hors ligne
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
