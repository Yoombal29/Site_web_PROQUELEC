
import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  File,
  Search,

  Upload,
  Trash2,
  ExternalLink,
  Check,
  Loader2,


  Plus } from
'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { normalizeUploadUrl } from '@/lib/normalizeUploadUrl';








import {
  Dialog,
  DialogContent,
  DialogDescription,

  DialogHeader,
  DialogTitle,
  DialogTrigger } from
'@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSession } from '@/hooks/useSession';
import { cn } from '@/lib/utils';

export interface MediaFile {
  id: string;
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  uploaded_at: string;
  alt_text?: string;
}

interface MediaLibraryProps {
  onSelect?: (file: MediaFile) => void;
  allowedTypes?: string[];
  selectionMode?: 'single' | 'multiple';
}

export function MediaLibrary({ onSelect, allowedTypes = ['image/'], selectionMode = 'single' }: MediaLibraryProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { session } = useSession();
  const { toast } = useToast();

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/storage/files', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (err) {
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.access_token) {
      fetchFiles();
    }
  }, [session]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: formData
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Fichier ajouté à la bibliothèque"
        });
        fetchFiles();
      } else {
        throw new Error('Upload failed');
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Échec du téléversement",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Voulez-vous vraiment supprimer ce fichier ?')) return;

    try {
      const response = await fetch(`/api/storage/files/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      if (response.ok) {
        setFiles(files.filter((f) => f.id !== id));
        if (selectedId === id) setSelectedId(null);
        toast({
          title: "Supprimé",
          description: "Fichier retiré de la bibliothèque"
        });
      }
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le fichier",
        variant: "destructive"
      });
    }
  };

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.file_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = allowedTypes.some((type) => file.mime_type.startsWith(type)) || allowedTypes.length === 0;
    return matchesSearch && matchesType;
  });

  const getFileUrl = (filePath: string) => {
    if (!filePath) return filePath;
    return normalizeUploadUrl(filePath.startsWith('http') ? filePath : (filePath.startsWith('/uploads/') ? filePath : `/uploads/${filePath}`));
  };

  const handleSelect = (file: MediaFile) => {
    if (selectionMode === 'single') {
      setSelectedId(file.id);
      if (onSelect) onSelect(file);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-[70vh]">
            {/* Barre d'outils */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
            placeholder="Rechercher..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} />
          
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <label className="flex-1">
                        <div className={cn(
              "flex items-center justify-center gap-2 h-10 px-4 rounded-md border border-dashed border-primary cursor-pointer hover:bg-primary/5 transition-colors",
              isUploading && "opacity-50 pointer-events-none"
            )}>
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            <span className="text-sm font-medium">Téléverser</span>
                        </div>
                        <input type="file" className="hidden" onChange={handleUpload} accept="image/*,video/*,.pdf" />
                    </label>
                </div>
            </div>

            {/* Grille de fichiers */}
            <div className="flex-1 overflow-y-auto pr-1">
                {loading ?
        <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div> :
        filteredFiles.length === 0 ?
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <ImageIcon className="h-12 w-12 opacity-20 mb-2" />
                        <p>Aucun fichier trouvé</p>
                    </div> :

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredFiles.map((file) =>
          <div
            key={file.id}
            onClick={() => handleSelect(file)}
            className={cn(
              "group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover:ring-2 hover:ring-primary/20",
              selectedId === file.id ? "border-primary shadow-lg scale-[0.98]" : "border-border/50 bg-card"
            )}>
            
                                {/* Preview */}
                                {file.mime_type.startsWith('image/') ?
            <img
              src={getFileUrl(file.file_path)}
              alt={file.file_name}
              className="w-full h-full object-cover" loading="lazy" /> :


            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                                        <File className="h-10 w-10 text-primary opacity-40 mb-2" />
                                        <span className="text-[10px] truncate w-full font-mono">{file.file_name}</span>
                                    </div>
            }

                                {/* Overlay Selection */}
                                {selectedId === file.id &&
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                        <div className="bg-primary text-white rounded-full p-1.5 shadow-xl animate-in zoom-in">
                                            <Check className="h-5 w-5" />
                                        </div>
                                    </div>
            }

                                {/* Actions au survol */}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                onClick={(e) => handleDelete(file.id, e)}
                className="p-1.5 bg-red-600/90 text-white rounded-lg hover:bg-red-700 shadow-lg" aria-label="Action">
                
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                    <a
                href={getFileUrl(file.file_path)}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 bg-black/70 text-white rounded-lg hover:bg-black shadow-lg">
                
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </div>

                                {/* Infos bas */}
                                <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm p-1.5 translate-y-full group-hover:translate-y-0 transition-transform">
                                    <p className="text-[10px] text-white truncate leading-tight font-medium">
                                        {file.file_name}
                                    </p>
                                </div>
                            </div>
          )}
                    </div>
        }
            </div>
        </div>);

}

export function MediaSelector({
  onSelect,
  currentValue,
  label = "Sélectionner une image"




}: {onSelect: (url: string) => void;currentValue?: string;label?: string;}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <div className="flex flex-col gap-2">
                <DialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start gap-2 h-auto py-2 group">
                        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center overflow-hidden border">
                            {currentValue ?
              <img src={currentValue} alt="Current" className="w-full h-full object-cover" loading="lazy" /> :

              <Plus className="h-4 w-4 text-muted-foreground" />
              }
                        </div>
                        <div className="text-left">
                            <span className="block text-sm font-semibold">{label}</span>
                            <span className="block text-[10px] text-muted-foreground truncate max-w-[200px]">
                                {currentValue || "Aucun fichier sélectionné"}
                            </span>
                        </div>
                    </Button>
                </DialogTrigger>

                {currentValue &&
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-[10px] justify-start text-red-600"
          onClick={() => onSelect('')}>
          
                        Effacer la sélection
                    </Button>
        }
            </div>

            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>Bibliothèque Médias</DialogTitle>
                    <DialogDescription>
                        Sélectionnez un fichier existant ou téléversez-en un nouveau.
                    </DialogDescription>
                </DialogHeader>

                <MediaLibrary
          onSelect={(file) => {
            const url = normalizeUploadUrl(file.file_path.startsWith('/uploads/') ? file.file_path : `/uploads/${file.file_path}`);
            onSelect(url);
            setIsOpen(false);
          }} />
        
            </DialogContent>
        </Dialog>);

}