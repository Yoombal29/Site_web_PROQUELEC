/**
 * MediaLibrary.tsx
 * Médiathèque complète pour PROQUELEC
 * Upload, gestion, sélection de fichiers (images, vidéos, documents)
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  Image,
  FileText,
  Video,
  Music,
  Trash2,
  Copy,
  Download,
  Upload,
  Search,
  Grid3X3,
  List,
  X,
  Loader2,
  File,
  FileSpreadsheet,
  FileImage,
  ExternalLink,
  Check,
  AlertCircle,
} from 'lucide-react';

interface MediaFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  mime_type: string;
  url?: string;
  thumbnail_url?: string;
  uploaded_at: string;
}

interface MediaLibraryProps {
  onSelect?: (url: string) => void;
}

const FILE_ICONS: Record<string, React.ReactNode> = {
  image: <FileImage className="w-8 h-8 text-blue-400" />,
  video: <Video className="w-8 h-8 text-purple-400" />,
  audio: <Music className="w-8 h-8 text-green-400" />,
  document: <FileText className="w-8 h-8 text-amber-400" />,
  spreadsheet: <FileSpreadsheet className="w-8 h-8 text-emerald-400" />,
  pdf: <FileText className="w-8 h-8 text-red-400" />,
};

const getFileCategory = (mime: string): string => {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.includes('pdf')) return 'pdf';
  if (mime.includes('spreadsheet') || mime.includes('excel') || mime.includes('sheet'))
    return 'spreadsheet';
  return 'document';
};

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' o';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' Ko';
  return (bytes / 1048576).toFixed(1) + ' Mo';
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function MediaLibrary({ onSelect }: MediaLibraryProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    try {
      const data = await apiFetch<MediaFile[]>('/api/storage/files');
      setFiles(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Erreur chargement médiathèque');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpload = async (fileList: FileList | File[]) => {
    setUploading(true);
    const formData = new FormData();
    for (const f of Array.from(fileList)) {
      formData.append('file', f);
    }
    try {
      await fetch('/api/storage/upload', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + (localStorage.getItem('token') || '') },
        body: formData,
      });
      toast.success('Fichier(s) uploadé(s)');
      fetchFiles();
    } catch {
      toast.error('Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Supprimer ce fichier ?')) return;
    try {
      await apiFetch(`/api/storage/files/${id}`, { method: 'DELETE' });
      toast.success('Fichier supprimé');
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch {
      toast.error('Erreur suppression');
    }
  };

  const handleCopyUrl = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    toast.success('URL copiée');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) handleUpload(e.dataTransfer.files);
  };

  const filtered = files.filter((f) => {
    const matchSearch = f.file_name.toLowerCase().includes(search.toLowerCase());
    const cat = getFileCategory(f.mime_type);
    const matchType = typeFilter === 'all' || cat === typeFilter;
    return matchSearch && matchType;
  });

  const getFileUrl = (f: MediaFile) => `/uploads/${f.file_path}`;
  const isImage = (mime: string) => mime.startsWith('image/');

  const tabs = [
    { id: 'all', label: 'Tous', icon: FileText },
    { id: 'image', label: 'Images', icon: Image },
    { id: 'video', label: 'Vidéos', icon: Video },
    { id: 'document', label: 'Documents', icon: FileText },
  ];

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-background"
          />
        </div>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${typeFilter === t.id ? 'bg-white dark:bg-slate-700 shadow-sm text-foreground' : 'text-slate-500 hover:text-foreground'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition"
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>
      </div>

      {/* Upload progress */}
      {uploading && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-300">
          <Loader2 className="w-4 h-4 animate-spin" />
          Upload en cours...
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative min-h-[300px] rounded-xl border-2 border-dashed transition ${
          dragOver
            ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
            : 'border-slate-200 dark:border-slate-700'
        }`}
      >
        {dragOver && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-blue-500/10 rounded-xl">
            <div className="text-center">
              <Upload className="w-10 h-10 text-blue-500 mx-auto mb-2 animate-bounce" />
              <p className="text-blue-600 font-bold">Déposez les fichiers ici</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 && !dragOver && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Image className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm font-medium">
              {search || typeFilter !== 'all' ? 'Aucun résultat' : 'Médiathèque vide'}
            </p>
            <p className="text-xs mt-1">
              {search || typeFilter !== 'all'
                ? "Essayez d'autres filtres"
                : 'Uploader des fichiers pour commencer'}
            </p>
          </div>
        )}

        {/* Grid view */}
        {viewMode === 'grid' && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-3">
            {filtered.map((f) => {
              const cat = getFileCategory(f.mime_type);
              const url = getFileUrl(f);
              const selected = selectedId === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedId(selected ? null : f.id)}
                  className={`relative group rounded-xl border-2 overflow-hidden cursor-pointer transition ${
                    selected
                      ? 'border-blue-500 ring-2 ring-blue-500/20'
                      : 'border-border hover:border-blue-300'
                  }`}
                >
                  {/* Preview */}
                  <div className="aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {isImage(f.mime_type) ? (
                      <img
                        src={url}
                        alt={f.file_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        {FILE_ICONS[cat] || <File className="w-8 h-8 text-slate-400" />}
                        <span className="text-[10px] text-slate-500 uppercase font-bold">
                          {cat}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* File info */}
                  <div className="p-2 bg-white dark:bg-slate-900">
                    <p className="text-[11px] font-medium truncate">{f.file_name}</p>
                    <p className="text-[10px] text-slate-500">{formatSize(f.file_size)}</p>
                  </div>
                  {/* Hover actions */}
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => handleCopyUrl(url, e)}
                      className="p-1.5 bg-slate-900/80 text-white rounded-lg hover:bg-slate-700"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(f.id, e)}
                      className="p-1.5 bg-red-600/80 text-white rounded-lg hover:bg-red-500"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  {/* Select badge */}
                  {selected && (
                    <div className="absolute top-1 left-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {/* Use button */}
                  {onSelect && selected && (
                    <div className="absolute bottom-1 left-1 right-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(url);
                        }}
                        className="w-full py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition"
                      >
                        Utiliser
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* List view */}
        {viewMode === 'list' && filtered.length > 0 && (
          <div className="divide-y divide-border">
            {filtered.map((f) => {
              const url = getFileUrl(f);
              return (
                <div
                  key={f.id}
                  onClick={() => setSelectedId(selectedId === f.id ? null : f.id)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition ${
                    selectedId === f.id
                      ? 'bg-blue-50 dark:bg-blue-900/10'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {isImage(f.mime_type) ? (
                    <img
                      src={url}
                      alt={f.file_name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {FILE_ICONS[getFileCategory(f.mime_type)] || (
                        <File className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{f.file_name}</p>
                    <p className="text-xs text-slate-500">
                      {formatSize(f.file_size)} · {formatDate(f.uploaded_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleCopyUrl(url, e)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                      title="Copier l'URL"
                    >
                      <Copy className="w-4 h-4 text-slate-400" />
                    </button>
                    <a
                      href={url}
                      download
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                      title="Télécharger"
                    >
                      <Download className="w-4 h-4 text-slate-400" />
                    </a>
                    <button
                      onClick={(e) => handleDelete(f.id, e)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                    {onSelect && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(url);
                        }}
                        className="ml-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition"
                      >
                        Utiliser
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Count */}
      <p className="text-xs text-slate-500">
        {filtered.length} fichier(s) sur {files.length}
      </p>
    </div>
  );
}

// ── Modal Selector ──
export function MediaSelector({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect: (url: string) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl m-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold">Médiathèque</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
          <MediaLibrary
            onSelect={(url) => {
              onSelect(url);
              onOpenChange(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Picker Button ──
export function MediaPickerButton({
  onSelect,
  label = 'Choisir depuis la médiathèque',
}: {
  onSelect: (url: string) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition border border-indigo-500/30"
      >
        {label}
      </button>
      <MediaSelector open={open} onOpenChange={setOpen} onSelect={onSelect} />
    </>
  );
}
