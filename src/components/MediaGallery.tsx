import { useState, useEffect } from 'react';
import { useMediaManager } from '@/hooks/useMediaManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Search, Trash2, Download, Eye, Filter, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MediaFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  bucket: string;
  path: string;
  uploadedAt: Date;
  category: 'image' | 'document' | 'video' | 'other';
}

export function MediaGallery() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);

  const { uploadFile, deleteFile, deleteMultipleFiles, getFileCategory, mediaFiles, isLoading: isLoadingFiles } = useMediaManager();
  const { toast } = useToast();

  // Synchronisation avec les données de la base
  useEffect(() => {
    if (mediaFiles) {
      setFiles(mediaFiles as any);
    }
  }, [mediaFiles]);

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
      const filesToDelete = selectedFiles.map(id => {
        const file = files.find(f => f.id === id);
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
      setSelectedFiles(filteredFiles.map(f => f.id));
    }
  };

  const filteredFiles = files.filter(file => {
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
                disabled={uploadFile.isPending}
              />
              <Button asChild variant="outline" size="sm" disabled={uploadFile.isPending}>
                <label htmlFor="image-upload" className="cursor-pointer flex items-center">
                  {uploadFile.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-proqblue" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
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
                disabled={uploadFile.isPending}
              />
              <Button asChild variant="outline" size="sm" disabled={uploadFile.isPending}>
                <label htmlFor="doc-upload" className="cursor-pointer flex items-center">
                  {uploadFile.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-proqblue" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
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
                disabled={uploadFile.isPending}
              />
              <Button asChild variant="outline" size="sm" disabled={uploadFile.isPending}>
                <label htmlFor="video-upload" className="cursor-pointer flex items-center">
                  {uploadFile.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-proqblue" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
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
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectAll}
                className="hidden md:flex"
              >
                {selectedFiles.length === filteredFiles.length && filteredFiles.length > 0
                  ? 'Tout désélectionner'
                  : 'Tout sélectionner'}
              </Button>

              {selectedFiles.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={deleteMultipleFiles.isPending}
                >
                  {deleteMultipleFiles.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Supprimer ({selectedFiles.length})
                </Button>
              )}
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
              {uploadFile.isPending && (
                <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-proqblue/30 animate-pulse">
                  <Loader2 className="h-10 w-10 text-proqblue animate-spin mb-2" />
                  <p className="text-proqblue font-bold text-lg">Importation en cours...</p>
                  <p className="text-slate-500 text-sm">Veuillez patienter pendant la synchronisation industrielle.</p>
                </div>
              )}

              <TabsContent value={activeCategory} className="mt-0">
                {isLoadingFiles ? (
                  <div className="text-center py-20">
                    <Loader2 className="h-10 w-10 text-proqblue animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">Chargement de la bibliothèque...</p>
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Upload className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Aucun fichier trouvé.</p>
                    <p className="text-sm">Commencez par téléverser des fichiers.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {filteredFiles.map((file) => (
                      <Card
                        key={file.id}
                        className={`relative group cursor-pointer transition-all ${selectedFiles.includes(file.id) ? 'ring-2 ring-blue-500' : ''
                          }`}
                        onClick={() => {
                          setSelectedFiles(prev =>
                            prev.includes(file.id)
                              ? prev.filter(id => id !== file.id)
                              : [...prev, file.id]
                          );
                        }}
                      >
                        <CardContent className="p-2">
                          <div className="aspect-square relative overflow-hidden rounded-md bg-gray-100">
                            {/* Checkbox visuelle */}
                            <div className={`absolute top-2 left-2 z-10 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedFiles.includes(file.id)
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-white/80 border-slate-300 opacity-0 group-hover:opacity-100'
                              }`}>
                              {selectedFiles.includes(file.id) && <div className="w-2 h-2 bg-white rounded-full shadow-lg" />}
                            </div>

                            {file.category === 'image' ? (
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
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
                            )}

                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPreviewFile(file);
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    downloadFile(file);
                                  }}
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Supprimer ce fichier ?')) {
                                      deleteFile.mutate({ bucket: file.bucket, path: file.path });
                                    }
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
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
                    ))}
                  </div>
                )}
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
          {previewFile && (
            <div className="max-h-96 overflow-auto">
              {previewFile.category === 'image' ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="w-full h-auto"
                />
              ) : previewFile.category === 'video' ? (
                <video controls className="w-full">
                  <source src={previewFile.url} type={previewFile.type} />
                </video>
              ) : (
                <div className="text-center py-8">
                  <p>Aperçu non disponible pour ce type de fichier.</p>
                  <Button
                    className="mt-4"
                    onClick={() => downloadFile(previewFile)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
