/**
 * MediaLibrary.tsx
 * Médiathèque complète pour PROQUELEC
 * Upload, gestion, sélection de fichiers (images, vidéos, documents)
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
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
  Save,
  RefreshCw,
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
  alt_text?: string | null;
  folder_path?: string | null;
  status?: string | null;
  metadata?: Record<string, any> | null;
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
  presentation: <FileText className="w-8 h-8 text-orange-400" />,
  archive: <File className="w-8 h-8 text-slate-400" />,
  other: <File className="w-8 h-8 text-slate-400" />,
};

const ACCEPTED_UPLOADS = [
  'image/*',
  'video/*',
  'audio/*',
  '.pdf',
  '.doc',
  '.docx',
  '.odt',
  '.rtf',
  '.xls',
  '.xlsx',
  '.xlsm',
  '.csv',
  '.ods',
  '.ppt',
  '.pptx',
  '.txt',
  '.md',
  '.json',
  '.xml',
  '.zip',
  '.rar',
  '.7z',
].join(',');

const getExtension = (name = '') => {
  const index = name.lastIndexOf('.');
  return index >= 0 ? name.slice(index).toLowerCase() : '';
};

const getFileCategory = (mime: string, fileName = '', fileType = ''): string => {
  const lowerType = String(fileType || '').toLowerCase();
  const ext = getExtension(fileName);
  if (lowerType === 'image' || mime.startsWith('image/')) return 'image';
  if (lowerType === 'video' || mime.startsWith('video/')) return 'video';
  if (lowerType === 'audio' || mime.startsWith('audio/')) return 'audio';
  if (lowerType === 'pdf' || mime.includes('pdf') || ext === '.pdf') return 'pdf';
  if (
    lowerType === 'spreadsheet' ||
    mime.includes('spreadsheet') ||
    mime.includes('excel') ||
    mime.includes('sheet') ||
    ['.xls', '.xlsx', '.xlsm', '.csv', '.ods'].includes(ext)
  )
    return 'spreadsheet';
  if (lowerType === 'presentation' || ['.ppt', '.pptx', '.odp'].includes(ext)) return 'presentation';
  if (lowerType === 'archive' || ['.zip', '.rar', '.7z'].includes(ext)) return 'archive';
  if (['.doc', '.docx', '.odt', '.rtf', '.txt', '.md', '.json', '.xml'].includes(ext))
    return 'document';
  if (lowerType === 'other') return 'other';
  return 'document';
};

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    image: 'Image',
    video: 'Vidéo',
    audio: 'Audio',
    pdf: 'PDF',
    spreadsheet: 'Excel',
    document: 'Document',
    presentation: 'Présentation',
    archive: 'Archive',
    other: 'Autre',
  };
  return labels[category] || category;
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
  const [saving, setSaving] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [previewError, setPreviewError] = useState('');
  const [editDraft, setEditDraft] = useState({
    file_name: '',
    file_type: 'document',
    alt_text: '',
    folder_path: '/',
    status: 'draft',
    description: '',
    tags: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

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
      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + (localStorage.getItem('token') || '') },
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || data.message || 'Erreur upload');
      toast.success('Fichier(s) uploadé(s)');
      await fetchFiles();
    } catch {
      toast.error('Erreur upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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

  const selectedFile = files.find((f) => f.id === selectedId) || null;

  useEffect(() => {
    if (!selectedFile) return;
    const metadata = selectedFile.metadata || {};
    setEditDraft({
      file_name: selectedFile.file_name || '',
      file_type: getFileCategory(
        selectedFile.mime_type || '',
        selectedFile.file_name || selectedFile.file_path,
        selectedFile.file_type,
      ),
      alt_text: selectedFile.alt_text || '',
      folder_path: selectedFile.folder_path || '/',
      status: selectedFile.status || 'draft',
      description: typeof metadata.description === 'string' ? metadata.description : '',
      tags: Array.isArray(metadata.tags) ? metadata.tags.join(', ') : typeof metadata.tags === 'string' ? metadata.tags : '',
    });
  }, [selectedFile?.id]);

  useEffect(() => {
    let cancelled = false;
    setPreviewRows([]);
    setPreviewError('');
    if (!selectedFile) return;
    const cat = getFileCategory(selectedFile.mime_type || '', selectedFile.file_name || selectedFile.file_path, selectedFile.file_type);
    if (cat !== 'spreadsheet') return;

    fetch(getFileUrl(selectedFile))
      .then((response) => {
        if (!response.ok) throw new Error('Aperçu indisponible');
        return response.arrayBuffer();
      })
      .then((buffer) => {
        if (cancelled) return;
        const wb = XLSX.read(buffer, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false });
        setPreviewRows(rows.slice(0, 10).map((row) => row.slice(0, 6).map((cell) => String(cell ?? ''))));
      })
      .catch(() => !cancelled && setPreviewError('Aperçu Excel indisponible'));

    return () => {
      cancelled = true;
    };
  }, [selectedFile?.id, selectedFile?.file_path]);

  const handleSaveMetadata = async () => {
    if (!selectedFile) return;
    setSaving(true);
    try {
      const metadata = {
        ...(selectedFile.metadata || {}),
        description: editDraft.description,
        tags: editDraft.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      };
      const data = await apiFetch<{ file: MediaFile }>(`/api/storage/files/${selectedFile.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          file_name: editDraft.file_name,
          file_type: editDraft.file_type,
          alt_text: editDraft.alt_text,
          folder_path: editDraft.folder_path,
          status: editDraft.status,
          metadata,
        }),
      });
      setFiles((prev) => prev.map((file) => (file.id === data.file.id ? data.file : file)));
      toast.success('Fiche média sauvegardée');
    } catch (error) {
      toast.error(`Erreur sauvegarde: ${(error as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleReplace = async (fileList: FileList | null) => {
    const replacement = fileList?.[0];
    if (!selectedFile || !replacement) return;
    setReplacing(true);
    const formData = new FormData();
    formData.append('file', replacement);
    try {
      const response = await fetch(`/api/storage/files/${selectedFile.id}/replace`, {
        method: 'PUT',
        headers: { Authorization: 'Bearer ' + (localStorage.getItem('token') || '') },
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || data.message || 'Erreur remplacement');
      setFiles((prev) => prev.map((file) => (file.id === data.file.id ? data.file : file)));
      toast.success('Fichier remplacé');
    } catch (error) {
      toast.error(`Erreur remplacement: ${(error as Error).message}`);
    } finally {
      setReplacing(false);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) handleUpload(e.dataTransfer.files);
  };

  const filtered = files.filter((f) => {
    const matchSearch = f.file_name.toLowerCase().includes(search.toLowerCase());
    const cat = getFileCategory(f.mime_type || '', f.file_name || f.file_path, f.file_type);
    const matchType = typeFilter === 'all' || cat === typeFilter;
    return matchSearch && matchType;
  });

  const getFileUrl = (f: MediaFile) => {
    if (f.url) return f.url;
    const raw = f.file_path || '';
    if (raw.startsWith('http')) return raw;
    const cleaned = raw.replace(/^\/?uploads\//, '');
    return `/uploads/${cleaned}`;
  };
  const isImage = (mime?: string) => String(mime || '').startsWith('image/');

  const tabs = [
    { id: 'all', label: 'Tous', icon: FileText },
    { id: 'image', label: 'Images', icon: Image },
    { id: 'pdf', label: 'PDF', icon: FileText },
    { id: 'spreadsheet', label: 'Excel', icon: FileSpreadsheet },
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
            accept={ACCEPTED_UPLOADS}
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
              const cat = getFileCategory(f.mime_type || '', f.file_name || f.file_path, f.file_type);
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
                      {FILE_ICONS[getFileCategory(f.mime_type || '', f.file_name || f.file_path, f.file_type)] || (
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

      {selectedFile && (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-4 rounded-xl border border-border bg-white dark:bg-slate-900 p-4">
          <div className="min-h-[320px] rounded-lg overflow-hidden border border-border bg-slate-50 dark:bg-slate-950">
            {(() => {
              const cat = getFileCategory(
                selectedFile.mime_type || '',
                selectedFile.file_name || selectedFile.file_path,
                selectedFile.file_type,
              );
              const url = getFileUrl(selectedFile);
              if (cat === 'image') {
                return (
                  <img
                    src={url}
                    alt={selectedFile.alt_text || selectedFile.file_name}
                    className="w-full h-[320px] object-contain"
                  />
                );
              }
              if (cat === 'video') {
                return <video src={url} controls className="w-full h-[320px] bg-black" />;
              }
              if (cat === 'audio') {
                return (
                  <div className="h-[320px] flex items-center justify-center p-8">
                    <audio src={url} controls className="w-full" />
                  </div>
                );
              }
              if (cat === 'pdf') {
                return <iframe src={url} title={selectedFile.file_name} className="w-full h-[320px] bg-white" />;
              }
              if (cat === 'spreadsheet') {
                if (previewError) {
                  return (
                    <div className="h-[320px] flex flex-col items-center justify-center gap-2 text-slate-500">
                      <FileSpreadsheet className="w-10 h-10 text-emerald-500" />
                      <span className="text-sm">{previewError}</span>
                    </div>
                  );
                }
                if (previewRows.length === 0) {
                  return (
                    <div className="h-[320px] flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                    </div>
                  );
                }
                return (
                  <div className="h-[320px] overflow-auto bg-white">
                    <table className="w-full text-xs">
                      <tbody>
                        {previewRows.map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-b border-slate-100">
                            {Array.from({ length: Math.max(1, row.length) }).map((_, colIndex) => (
                              <td key={colIndex} className="border-r border-slate-100 px-2 py-1.5 min-w-24">
                                {row[colIndex] || ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }
              return (
                <div className="h-[320px] flex flex-col items-center justify-center gap-2 text-slate-500">
                  {FILE_ICONS[cat] || <File className="w-10 h-10 text-slate-400" />}
                  <span className="text-sm font-semibold">{getCategoryLabel(cat)}</span>
                </div>
              );
            })()}
          </div>

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">{selectedFile.file_name}</p>
                <p className="text-xs text-slate-500">
                  {formatSize(selectedFile.file_size)} · {formatDate(selectedFile.uploaded_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Fermer"
                aria-label="Fermer le panneau"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href={getFileUrl(selectedFile)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-slate-50"
              >
                <ExternalLink className="w-4 h-4" />
                Ouvrir
              </a>
              <a
                href={getFileUrl(selectedFile)}
                download
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-slate-50"
              >
                <Download className="w-4 h-4" />
                Télécharger
              </a>
              <button
                onClick={(event) => handleCopyUrl(getFileUrl(selectedFile), event)}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-slate-50"
              >
                <Copy className="w-4 h-4" />
                Copier URL
              </button>
              {onSelect && (
                <button
                  onClick={() => onSelect(getFileUrl(selectedFile))}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                >
                  <Check className="w-4 h-4" />
                  Utiliser
                </button>
              )}
            </div>

            <label className="block space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Nom</span>
              <input
                value={editDraft.file_name}
                onChange={(event) => setEditDraft((draft) => ({ ...draft, file_name: event.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="block space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Type</span>
                <select
                  value={editDraft.file_type}
                  onChange={(event) => setEditDraft((draft) => ({ ...draft, file_type: event.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="image">Image</option>
                  <option value="pdf">PDF</option>
                  <option value="spreadsheet">Excel</option>
                  <option value="document">Document</option>
                  <option value="presentation">Présentation</option>
                  <option value="video">Vidéo</option>
                  <option value="audio">Audio</option>
                  <option value="archive">Archive</option>
                  <option value="other">Autre</option>
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Statut</span>
                <select
                  value={editDraft.status}
                  onChange={(event) => setEditDraft((draft) => ({ ...draft, status: event.target.value }))}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="draft">Brouillon</option>
                  <option value="published">Publié</option>
                  <option value="archived">Archivé</option>
                </select>
              </label>
            </div>

            <label className="block space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Texte alternatif</span>
              <input
                value={editDraft.alt_text}
                onChange={(event) => setEditDraft((draft) => ({ ...draft, alt_text: event.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Dossier</span>
              <input
                value={editDraft.folder_path}
                onChange={(event) => setEditDraft((draft) => ({ ...draft, folder_path: event.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Description</span>
              <textarea
                value={editDraft.description}
                onChange={(event) => setEditDraft((draft) => ({ ...draft, description: event.target.value }))}
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none"
              />
            </label>

            <label className="block space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tags</span>
              <input
                value={editDraft.tags}
                onChange={(event) => setEditDraft((draft) => ({ ...draft, tags: event.target.value }))}
                placeholder="norme, formation, audit"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </label>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleSaveMetadata}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Sauvegarder
              </button>

              <input
                ref={replaceInputRef}
                type="file"
                accept={ACCEPTED_UPLOADS}
                className="hidden"
                onChange={(event) => handleReplace(event.target.files)}
              />
              <button
                onClick={() => replaceInputRef.current?.click()}
                disabled={replacing}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border text-xs font-bold hover:bg-slate-50 disabled:opacity-60"
              >
                {replacing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Remplacer
              </button>
            </div>
          </div>
        </div>
      )}

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
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden shadow-2xl m-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold">Médiathèque</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            title="Fermer"
            aria-label="Fermer la médiathèque"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
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
