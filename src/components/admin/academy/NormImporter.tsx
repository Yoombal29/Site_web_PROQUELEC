/**
 * Interface d'import de normes multi-formats
 * 
 * Permet d'importer des normes au format JSON générique
 * Compatible avec NS 01-001, NF C 15-100, IEC 60364, etc.
 */

import React, { useState, useCallback } from 'react';
import { Upload, FileJson, AlertCircle, CheckCircle2, Trash2, Info, Download, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { multiNormService } from '@/services/academy/multiNormService';
import { NormMetadata, NormImportValidation } from '@/types/academy';

interface NormImporterProps {
  onImportSuccess?: (normId: string) => void;
}

export const NormImporter: React.FC<NormImporterProps> = ({ onImportSuccess }) => {
  const [jsonContent, setJsonContent] = useState('');
  const [validation, setValidation] = useState<NormImportValidation | null>(null);
  const [importedNorms, setImportedNorms] = useState<NormMetadata[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  // Charger la liste des normes au montage
  React.useEffect(() => {
    multiNormService.loadSavedNorms().then(() => {
      setImportedNorms(multiNormService.listNorms());
    });
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error('Seuls les fichiers JSON sont acceptés');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonContent(content);
      const result = multiNormService.validateImport(content);
      setValidation(result);
    };
    reader.readAsText(file);
  }, []);

  const handleTextChange = useCallback((value: string) => {
    setJsonContent(value);
    if (value.trim()) {
      const result = multiNormService.validateImport(value);
      setValidation(result);
    } else {
      setValidation(null);
    }
  }, []);

  const handleImport = useCallback(() => {
    if (!validation?.valid) return;

    setIsImporting(true);
    const result = multiNormService.importNorm(jsonContent);
    setIsImporting(false);

    if (result.success && result.normId) {
      toast.success(`Norme importée avec succès: ${result.normId}`);
      setJsonContent('');
      setValidation(null);
      setImportedNorms(multiNormService.listNorms());
      onImportSuccess?.(result.normId);
    } else {
      toast.error(result.error || 'Erreur lors de l\'import');
    }
  }, [jsonContent, validation, onImportSuccess]);

  const handleDeleteNorm = useCallback((normId: string) => {
    if (multiNormService.deleteNorm(normId)) {
      toast.success(`Norme "${normId}" supprimée`);
      setImportedNorms(multiNormService.listNorms());
    }
  }, []);

  const exampleJson = `{
   "metadata": {
     "id": "nf-c-15-100",
     "name": "NF C 15-100",
     "description": "Installation électrique à basse tension",
     "version": "2024",
     "country": "France",
     "domain": "Sécurité électrique"
   },
   "sommaire": [
     {
       "index": "1",
       "label": "Domaine d'application",
       "level": 0,
       "children": []
     }
   ],
   "rules": [
     {
       "titre": "Protection contre les contacts directs",
       "article": "411.1",
       "content": "Les parties actives doivent être protégées...",
       "page": 45,
       "category": "Protection",
       "keywords": ["contact", "protection", "parties actives"]
     }
   ]
 }`;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="import" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="import">
            <Upload className="w-4 h-4 mr-2" />
            Importer
          </TabsTrigger>
          <TabsTrigger value="manage">
            <BookOpen className="w-4 h-4 mr-2" />
            Gérer ({importedNorms.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-4">
          {/* Instructions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileJson className="w-5 h-5" />
                Format d'import JSON
              </CardTitle>
              <CardDescription>
                Importez des normes au format JSON générique (NF C 15-100, IEC 60364, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Info className="w-4 h-4 mr-2" />
                    Voir le format attendu
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Format JSON pour import de norme</DialogTitle>
                    <DialogDescription>
                      Structure requise pour importer une norme
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-[400px]">
                    <pre className="text-xs bg-muted p-4 rounded-md overflow-x-auto">
                      {exampleJson}
                    </pre>
                  </ScrollArea>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(exampleJson);
                        toast.success('Exemple copié dans le presse-papier');
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Copier l'exemple
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Zone d'upload */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Fichier JSON</Label>
                  <div className="mt-2">
                    <input
                      id="file-upload"
                      type="file"
                      accept=".json"
                      title="Sélectionner un fichier de norme JSON"
                      placeholder="Choisir un fichier"
                      onChange={handleFileUpload}
                      className="block w-full text-sm text-muted-foreground
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0
                         file:text-sm file:font-medium
                         file:bg-primary file:text-primary-foreground
                         hover:file:bg-primary/90
                         cursor-pointer"
                    />
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">ou</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="json-content">Coller le contenu JSON</Label>
                  <Textarea
                    id="json-content"
                    placeholder='{"metadata": {...}, "rules": [...]}'
                    value={jsonContent}
                    onChange={(e) => handleTextChange(e.target.value)}
                    className="mt-2 font-mono text-xs min-h-[200px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation */}
          {validation && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  {validation.valid ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  )}
                  Validation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {validation.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erreurs</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-4 mt-2 space-y-1">
                        {validation.errors.map((err, i) => (
                          <li key={i} className="text-sm">{err}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {validation.warnings.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Avertissements</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-4 mt-2 space-y-1">
                        {validation.warnings.map((warn, i) => (
                          <li key={i} className="text-sm">{warn}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {validation.valid && validation.preview && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{validation.preview.name}</Badge>
                      <Badge variant="outline">{validation.preview.ruleCount} règles</Badge>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Aperçu des règles:</p>
                      <ScrollArea className="h-[150px] border rounded-md p-3">
                        {validation.preview.sampleRules.map((rule, i) => (
                          <div key={i} className="mb-3 pb-3 border-b last:border-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                Art. {rule.article}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{rule.titre}</span>
                            </div>
                            <p className="text-sm line-clamp-2">{rule.content}</p>
                          </div>
                        ))}
                      </ScrollArea>
                    </div>

                    <Button
                      onClick={handleImport}
                      disabled={isImporting}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isImporting ? 'Import en cours...' : 'Importer la norme'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          {importedNorms.length === 0 ? (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Aucune norme importée. Utilisez l'onglet "Importer" pour ajouter des normes.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {importedNorms.map((norm) => (
                <Card key={norm.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{norm.name}</h4>
                          {norm.version && (
                            <Badge variant="secondary" className="text-xs">
                              v{norm.version}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{norm.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{norm.ruleCount} règles</Badge>
                          <Badge variant="outline">{norm.domain}</Badge>
                          {norm.country && (
                            <Badge variant="outline">{norm.country}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Importé le {new Date(norm.importedAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer la norme ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action supprimera définitivement "{norm.name}" et toutes ses {norm.ruleCount} règles.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteNorm(norm.id)}>
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NormImporter;