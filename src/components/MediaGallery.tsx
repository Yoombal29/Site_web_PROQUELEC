import { useState } from 'react';
import { useMediaManager } from '@/hooks/useMediaManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Search, Trash2, Download, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { MediaFile } from '@/hooks/useMediaManager';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Wand2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { ImageEditor } from '@/components/ImageEditor';


export function MediaGallery() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

  // Rename State
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [fileToRename, setFileToRename] = useState<MediaFile | null>(null);
  const [newName, setNewName] = useState("");

  // Edit State
  const [fileToEdit, setFileToEdit] = useState<MediaFile | null>(null);


  const { uploadFile, deleteFile, deleteMultipleFiles, getFileCategory, mediaFiles, isLoading: isLoadingFiles } = useMediaManager();
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, bucket: string) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    for (const file of Array.from(selectedFiles)) {
      try {
        await uploadFile.mutateAsync({ file, bucket });
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    if (!confirm(`Supprimer ces ${selectedFiles.length} fichiers ?`)) return;

    try {
      const filesToDelete = selectedFiles.map((id) => {
        const file = mediaFiles.find((f) => f.id === id);
        return { bucket: file?.bucket || '', path: file?.path || '' };
      });

      await deleteMultipleFiles.mutateAsync(filesToDelete);
      setSelectedFiles([]);
    } catch (error) {
      console.error('Bulk delete error:', error);
    }
  };

  const toggleSelectAll = () => {
    if (selectedFiles.length === filteredFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(filteredFiles.map((f) => f.id));
    }
  };

  const filteredFiles = mediaFiles.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || file.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadFile = (file: MediaFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleRename = async () => {
    if (!fileToRename) {
      console.error("Rename error: No file selected to rename.");
      return;
    }
    if (!newName || typeof newName !== 'string' || newName.trim() === '') {
      console.error("Rename error: New name must be a non-empty string.");
      return;
    }
    try {
      const response = await fetch(`/api/storage/files/${fileToRename.id}/rename`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ newName })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || "Rename failed");
      }

      toast({ title: "Succès", description: "Fichier renommé avec succès" });
      setIsRenameDialogOpen(false);
      setFileToRename(null);
      // Trigger refresh logic if needed (or rely on React Query invalidation in a real app)
      window.location.reload();
    } catch (error) {
      console.error("Rename error:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de renommer le fichier" });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Médiathèque</span>
            <div className="flex gap-2">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'images')}
                className="hidden"
                id="image-upload"
                disabled={uploadFile.isPending} />
              
              <Button asChild variant="outline" size="sm" disabled={uploadFile.isPending}>
                <label htmlFor="image-upload" className="cursor-pointer flex items-center">
                  {uploadFile.isPending ?
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-proqblue" /> :

                  <Upload className="h-4 w-4 mr-2" />
                  }
                  {uploadFile.isPending ? 'Chargement...' : 'Images'}
                </label>
              </Button>

              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => handleFileUpload(e, 'documents')}
                className="hidden"
                id="doc-upload"
                disabled={uploadFile.isPending} />
              
              <Button asChild variant="outline" size="sm" disabled={uploadFile.isPending}>
                <label htmlFor="doc-upload" className="cursor-pointer flex items-center">
                  {uploadFile.isPending ?
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-proqblue" /> :

                  <Upload className="h-4 w-4 mr-2" />
                  }
                  {uploadFile.isPending ? 'Chargement...' : 'Documents'}
                </label>
              </Button>

              <input
                type="file"
                multiple
                accept="video/*"
                onChange={(e) => handleFileUpload(e, 'videos')}
                className="hidden"
                id="video-upload"
                disabled={uploadFile.isPending} />
              
              <Button asChild variant="outline" size="sm" disabled={uploadFile.isPending}>
                <label htmlFor="video-upload" className="cursor-pointer flex items-center">
                  {uploadFile.isPending ?
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-proqblue" /> :

                  <Upload className="h-4 w-4 mr-2" />
                  }
                  {uploadFile.isPending ? 'Chargement...' : 'Vidéos'}
                </label>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher des fichiers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10" />
              
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
                className="hidden md:flex">
                
                {selectedFiles.length === filteredFiles.length && filteredFiles.length > 0 ?
                'Tout désélectionner' :
                'Tout sélectionner'}
              </Button>

              {selectedFiles.length > 0 &&
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={deleteMultipleFiles.isPending}>
                
                  {deleteMultipleFiles.isPending ?
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> :

                <Trash2 className="h-4 w-4 mr-2" />
                }
                  Supprimer ({selectedFiles.length})
                </Button>
              }
            </div>
          </div>

          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="image">Images</TabsTrigger>
              <TabsTrigger value="document">Documents</TabsTrigger>
              <TabsTrigger value="video">Vidéos</TabsTrigger>
            </TabsList>

            <div className="relative">
              {uploadFile.isPending &&
              <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-proqblue/30 animate-pulse">
                  <Loader2 className="h-10 w-10 text-proqblue animate-spin mb-2" />
                  <p className="text-proqblue font-bold text-lg">Importation en cours...</p>
                  <p className="text-slate-500 text-sm">Veuillez patienter pendant la synchronisation industrielle.</p>
                </div>
              }

              <TabsContent value={activeCategory} className="mt-0">
                {isLoadingFiles ?
                <div className="text-center py-20">
                    <Loader2 className="h-10 w-10 text-proqblue animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">Chargement de la bibliothèque...</p>
                  </div> :
                filteredFiles.length === 0 ?
                <div className="text-center py-12 text-gray-500">
                    <Upload className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Aucun fichier trouvé.</p>
                    <p className="text-sm">Commencez par téléverser des fichiers.</p>
                  </div> :

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {filteredFiles.map((file) =>
                  <Card
                    key={file.id}
                    className={`relative group cursor-pointer transition-all ${selectedFiles.includes(file.id) ? 'ring-2 ring-blue-500' : ''}`
                    }
                    onClick={() => {
                      setSelectedFiles((prev) =>
                      prev.includes(file.id) ?
                      prev.filter((id) => id !== file.id) :
                      [...prev, file.id]
                      );
                    }}>
                    
                        <CardContent className="p-2">
                          <div className="aspect-square relative overflow-hidden rounded-md bg-gray-100">
                            {/* Checkbox visuelle */}
                            <div className={`absolute top-2 left-2 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedFiles.includes(file.id) ?
                        'bg-blue-600 border-blue-600 text-white' :
                        'bg-white/80 border-slate-300 opacity-0 group-hover:opacity-100'}`
                        }>
                              {selectedFiles.includes(file.id) && <div className="w-2 h-2 bg-white rounded-full shadow-lg" />}
                            </div>

                            {file.category === 'image' ?
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover" loading="lazy" /> :


                        <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center">
                                  <div className="text-2xl mb-2">
                                    {file.category === 'document' ? '📄' :
                              file.category === 'video' ? '🎥' : '📎'}
                                  </div>
                                  <Badge variant="secondary" className="text-xs">
                                    {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                                  </Badge>
                                </div>
                              </div>
                        }

                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="center">
                                    <DropdownMenuItem onClick={() => setPreviewFile(file)}>
                                      <Eye className="w-4 h-4 mr-2" /> Aperçu
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => {
                                  setFileToRename(file);
                                  setNewName(file.name);
                                  setIsRenameDialogOpen(true);
                                }}>
                                      <Edit className="w-4 h-4 mr-2" /> Renommer
                                    </DropdownMenuItem>
                                    {file.category === 'image' &&
                                <DropdownMenuItem onClick={() => setFileToEdit(file)}>
                                        <Wand2 className="w-4 h-4 mr-2 text-purple-600" /> Retoucher
                                      </DropdownMenuItem>
                                }
                                    <DropdownMenuItem onClick={() => downloadFile(file)}>
                                      <Download className="w-4 h-4 mr-2" /> Télécharger
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600" onClick={() => {
                                  if (confirm('Supprimer ce fichier ?')) {
                                    deleteFile.mutate({ bucket: file.bucket, path: file.path });
                                  }
                                }}>
                                      <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>

                          <div className="mt-2">
                            <p className="text-xs font-medium truncate">{file.name}</p>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>{formatFileSize(file.size)}</span>
                              <Badge variant="outline" className="text-xs">
                                {file.category}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                  )}
                  </div>
                }
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Prévisualisation */}
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewFile?.name}</DialogTitle>
          </DialogHeader>
          {previewFile &&
          <div className="max-h-96 overflow-auto">
              {previewFile.category === 'image' ?
            <img
              src={previewFile.url}
              alt={previewFile.name}
              className="w-full h-auto" loading="lazy" /> :

            previewFile.category === 'video' ?
            <video controls className="w-full">
                  <source src={previewFile.url} type={previewFile.type} />
                </video> :

            <div className="text-center py-8">
                  <p>Aperçu non disponible pour ce type de fichier.</p>
                  <Button
                className="mt-4"
                onClick={() => downloadFile(previewFile)}>
                
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
            }
            </div>
          }
        </DialogContent>
      </Dialog>
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renommer le fichier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nouveau nom</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nouveau nom" />
              
              <p className="text-xs text-slate-500">L'extension est préservée automatiquement.</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleRename}>Renommer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {fileToEdit &&
      <Dialog open={!!fileToEdit} onOpenChange={() => setFileToEdit(null)}>
          <DialogContent className="max-w-6xl w-full h-[90vh] p-0 overflow-hidden bg-slate-50">
            <div className="p-6 h-full flex flex-col">
              <DialogHeader className="mb-4">
                <DialogTitle>Retouche Image: {fileToEdit.name}</DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-auto">
                <ImageEditor
                imageUrl={fileToEdit.url}
                fileName={fileToEdit.name}
                onClose={() => setFileToEdit(null)} />
              
              </div>
            </div>
          </DialogContent>
        </Dialog>
      }
    </div>);

}