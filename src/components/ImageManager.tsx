
import { useState, useRef } from "react";
import { Upload, Edit, Download, Trash2, Search, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMediaManager } from "@/hooks/useMediaManager";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";


interface ImageFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
  tags: string[];
  category: string;
  alt: string;
}

export function ImageManager() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewImage, setPreviewImage] = useState<ImageFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { uploadFile, deleteFile, getFileCategory } = useMediaManager();

  const categories = [
  { value: 'all', label: 'Toutes les images' },
  { value: 'formations', label: 'Formations' },
  { value: 'projets', label: 'Projets' },
  { value: 'equipe', label: 'Équipe' },
  { value: 'installations', label: 'Installations' },
  { value: 'certifications', label: 'Certifications' },
  { value: 'general', label: 'Général' }];


  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsUploading(true);

    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        try {
          const result = await uploadFile.mutateAsync({ file, bucket: 'images' });
          const newImage: ImageFile = {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            url: result.url,
            size: file.size,
            type: file.type,
            uploadedAt: new Date(),
            tags: [],
            category: 'general',
            alt: file.name.replace(/\.[^/.]+$/, '')
          };

          setImages((prev) => [...prev, newImage]);
        } catch (error) {
          console.error('Upload error:', error);
        }
      }
    }

    setIsUploading(false);
    toast({
      title: "Images uploadées",
      description: `${files.length} image(s) ajoutée(s) avec succès`
    });
  };

  const handleDeleteImage = async (id: string) => {
    const image = images.find((img) => img.id === id);
    if (!image) return;

    try {
      await deleteFile.mutateAsync({
        bucket: 'images',
        path: image.url.split('/').pop() || ''
      });

      setImages((prev) => prev.filter((img) => img.id !== id));
      setSelectedImages((prev) => prev.filter((imgId) => imgId !== id));

      toast({
        title: "Image supprimée",
        description: "L'image a été supprimée avec succès"
      });
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const deleteSelected = async () => {
    for (const imageId of selectedImages) {
      await handleDeleteImage(imageId);
    }
    setSelectedImages([]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const toggleImageSelection = (id: string) => {
    setSelectedImages((prev) =>
    prev.includes(id) ?
    prev.filter((imgId) => imgId !== id) :
    [...prev, id]
    );
  };

  const downloadImage = (image: ImageFile) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredImages = images.filter((image) => {
    const matchesSearch = image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || image.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const updateImageMetadata = (id: string, updates: Partial<ImageFile>) => {
    setImages((prev) => prev.map((img) =>
    img.id === id ? { ...img, ...updates } : img
    ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestionnaire d'images</CardTitle>
            <div className="flex gap-2">
              {selectedImages.length > 0 &&
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteSelected}>
                
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer ({selectedImages.length})
                </Button>
              }
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </Button>
              <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Upload...' : 'Ajouter des images'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden" />
          
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher des images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10" />
              
            </div>
            
            <select title="Sélectionner une option"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border rounded-md min-w-48">
              
              {categories.map((cat) =>
              <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              )}
            </select>
          </div>
          
          {filteredImages.length === 0 ?
          <div className="text-center py-8 text-muted-foreground">
              <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune image. Cliquez sur "Ajouter des images" pour commencer.</p>
            </div> :
          viewMode === 'grid' ?
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filteredImages.map((image) =>
            <div
              key={image.id}
              className={`relative group border rounded-lg overflow-hidden cursor-pointer transition-all ${
              selectedImages.includes(image.id) ? 'ring-2 ring-primary' : ''}`
              }
              onClick={() => toggleImageSelection(image.id)}>
              
                  <div className="aspect-square relative">
                    <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  loading="lazy" />
                
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex gap-1">
                        <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(image);
                      }}>
                      
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(image);
                      }}>
                      
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(image.id);
                      }}>
                      
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{image.name}</p>
                    <div className="flex justify-between items-center mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {image.type.split('/')[1].toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(image.size)}
                      </span>
                    </div>
                    {image.tags.length > 0 &&
                <div className="flex flex-wrap gap-1 mt-1">
                        {image.tags.slice(0, 2).map((tag) =>
                  <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                  )}
                        {image.tags.length > 2 &&
                  <span className="text-xs text-gray-500">+{image.tags.length - 2}</span>
                  }
                      </div>
                }
                  </div>
                </div>
            )}
            </div> :

          <div className="space-y-4">
              {filteredImages.map((image) =>
            <Card
              key={image.id}
              className={`cursor-pointer transition-all ${
              selectedImages.includes(image.id) ? 'ring-2 ring-primary' : ''}`
              }
              onClick={() => toggleImageSelection(image.id)}>
              
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <img
                    src={image.url}
                    alt={image.alt}
                    className="w-16 h-16 object-cover rounded" loading="lazy" />
                  
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{image.name}</h3>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(image.size)} • {image.type}
                        </p>
                        <p className="text-sm text-gray-500">
                          {image.uploadedAt.toLocaleDateString('fr-FR')}
                        </p>
                        {image.tags.length > 0 &&
                    <div className="flex flex-wrap gap-1 mt-2">
                            {image.tags.map((tag) =>
                      <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                      )}
                          </div>
                    }
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage(image);
                      }}>
                      
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(image);
                      }}>
                      
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(image.id);
                      }}>
                      
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
            )}
            </div>
          }
        </CardContent>
      </Card>

      {/* Dialog de prévisualisation et édition */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Modifier l'image</DialogTitle>
          </DialogHeader>
          {previewImage &&
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <img
                src={previewImage.url}
                alt={previewImage.alt}
                className="w-full h-auto rounded-lg" loading="lazy" />
              
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom</label>
                  <Input
                  value={previewImage.name}
                  onChange={(e) => updateImageMetadata(previewImage.id, { name: e.target.value })} />
                
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Texte alternatif</label>
                  <Input
                  value={previewImage.alt}
                  onChange={(e) => updateImageMetadata(previewImage.id, { alt: e.target.value })}
                  placeholder="Description de l'image pour l'accessibilité" />
                
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Catégorie</label>
                  <select title="Sélectionner une option"
                value={previewImage.category}
                onChange={(e) => updateImageMetadata(previewImage.id, { category: e.target.value })}
                className="w-full p-2 border rounded-md">
                  
                    {categories.filter((cat) => cat.value !== 'all').map((cat) =>
                  <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                  )}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Tags (séparés par des virgules)</label>
                  <Input
                  value={previewImage.tags.join(', ')}
                  onChange={(e) => updateImageMetadata(previewImage.id, {
                    tags: e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean)
                  })}
                  placeholder="électricité, formation, sécurité" />
                
                </div>
                
                <div className="text-sm text-gray-500">
                  <p>Taille: {formatFileSize(previewImage.size)}</p>
                  <p>Type: {previewImage.type}</p>
                  <p>Uploadé le: {previewImage.uploadedAt.toLocaleDateString('fr-FR')}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                  variant="outline"
                  onClick={() => downloadImage(previewImage)}
                  className="flex-1">
                  
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                  </Button>
                  <Button
                  variant="destructive"
                  onClick={() => {
                    handleDeleteImage(previewImage.id);
                    setPreviewImage(null);
                  }}
                  className="flex-1">
                  
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </div>
            </div>
          }
        </DialogContent>
      </Dialog>
    </div>);

}