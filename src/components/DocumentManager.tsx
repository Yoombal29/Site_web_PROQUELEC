
import { useState } from 'react';
import { useMediaManager } from '@/hooks/useMediaManager';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Search, Trash2, Download, FileText, Eye } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface Document {
  id: string;
  title: string;
  description: string;
  filename: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
  category: string;
  tags: string[];
}

export function DocumentManager() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'general',
    tags: ''
  });

  const { uploadFile } = useMediaManager();

  const categories = [
    { value: 'all', label: 'Tous les documents' },
    { value: 'formation', label: 'Formations' },
    { value: 'procedure', label: 'Procédures' },
    { value: 'certification', label: 'Certifications' },
    { value: 'technique', label: 'Documentation technique' },
    { value: 'legal', label: 'Documents légaux' },
    { value: 'general', label: 'Général' }
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadFile.mutateAsync({ file, bucket: 'documents' });
      
      const newDocument: Document = {
        id: Math.random().toString(36).substr(2, 9),
        title: uploadForm.title || file.name,
        description: uploadForm.description,
        filename: file.name,
        url: result.url,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        category: uploadForm.category,
        tags: uploadForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      setDocuments(prev => [...prev, newDocument]);
      setUploadForm({ title: '', description: '', category: 'general', tags: '' });
      setIsUploadDialogOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadDocument = (doc: Document) => {
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📽️';
    return '📎';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestionnaire de Documents</CardTitle>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Ajouter un document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Téléverser un document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titre</Label>
                    <Input
                      id="title"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Titre du document"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description du document"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Catégorie</Label>
                    <select
                      id="category"
                      value={uploadForm.category}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                    >
                      {categories.filter(cat => cat.value !== 'all').map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                    <Input
                      id="tags"
                      value={uploadForm.tags}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="sécurité, formation, électricité"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="file">Fichier</Label>
                    <input
                      id="file"
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                      onChange={handleFileUpload}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher des documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 border rounded-md min-w-48"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Aucun document trouvé.</p>
              <p className="text-sm">Ajoutez des documents pour commencer.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="text-3xl">
                          {getFileIcon(doc.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">{doc.title}</h3>
                          {doc.description && (
                            <p className="text-gray-600 text-sm mb-2">{doc.description}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="outline">
                              {categories.find(cat => cat.value === doc.category)?.label}
                            </Badge>
                            {doc.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span>{doc.filename}</span>
                            <span>{formatFileSize(doc.size)}</span>
                            <span>{doc.uploadedAt.toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadDocument(doc)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setDocuments(prev => prev.filter(d => d.id !== doc.id));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
