
import React, { useState, useCallback } from 'react';
import { Upload, FileText, Trash2, Eye, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Document } from '@/types';

export const DocumentManager: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processing, setProcessing] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'].includes(file.type)) {
        toast({
          title: "Format non supporté",
          description: `Le fichier ${file.name} n'est pas au format PDF, DOCX ou TXT`,
          variant: "destructive"
        });
        continue;
      }

      const newDocument: Document = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type.includes('pdf') ? 'pdf' : file.type.includes('word') ? 'docx' : 'txt',
        size: file.size,
        uploadedAt: new Date(),
        processed: false
      };

      setDocuments(prev => [...prev, newDocument]);
      setUploadProgress(50);

      // Simuler l'extraction du contenu
      setTimeout(async () => {
        setProcessing(newDocument.id);
        
        try {
          const content = await extractTextFromFile(file);
          
          setDocuments(prev => prev.map(doc => 
            doc.id === newDocument.id 
              ? { ...doc, content, processed: true }
              : doc
          ));

          toast({
            title: "Document analysé",
            description: `Le contenu de ${file.name} a été extrait avec succès`
          });
        } catch (error) {
          toast({
            title: "Erreur d'analyse",
            description: `Impossible d'analyser ${file.name}`,
            variant: "destructive"
          });
        } finally {
          setProcessing(null);
          setUploadProgress(0);
        }
      }, 1000);
    }
  }, [toast]);

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Simulation d'extraction de texte
        const content = `Contenu extrait du document ${file.name}.\n\n` +
          `Ce document contient des informations importantes sur la réglementation ` +
          `et les procédures de sécurité. Il servira de base pour générer des contenus ` +
          `pédagogiques structurés et conformes aux normes en vigueur.`;
        resolve(content);
      };
      reader.readAsText(file);
    });
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast({
      title: "Document supprimé",
      description: "Le document a été retiré de la base de données"
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Documents sources</h1>
          <p className="text-muted-foreground">Importez vos documents pour générer des contenus pédagogiques</p>
        </div>
        
        <div>
          <input
            type="file"
            id="file-upload"
            multiple
            accept=".pdf,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button asChild>
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Importer des documents
            </label>
          </Button>
        </div>
      </div>

      {uploadProgress > 0 && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Analyse en cours...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {documents.map((document) => (
          <Card key={document.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(document.type)}
                  <div>
                    <CardTitle className="text-lg">{document.name}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span>{formatFileSize(document.size)}</span>
                      <span>Importé le {document.uploadedAt.toLocaleDateString()}</span>
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {document.processed ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Analysé
                    </Badge>
                  ) : processing === document.id ? (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      En cours
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      En attente
                    </Badge>
                  )}
                  
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteDocument(document.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {document.content && (
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Aperçu du contenu :</p>
                  <p className="text-sm line-clamp-3">{document.content}</p>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
        
        {documents.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun document importé</h3>
              <p className="text-muted-foreground text-center mb-4">
                Commencez par importer vos documents sources (PDF, DOCX, TXT)
              </p>
              <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Importer un document
                </label>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
