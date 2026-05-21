import React, { useEffect, useRef, useState } from 'react';
import { Wand2, FileText, Download, Upload, BookOpen, Settings, CheckCircle, FileUp, Trash2, Eye, Zap, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Course, Document, GenerationSettings } from '@/types/academy';
import { exportToWord, exportToPowerPoint, exportToPDF, exportToSCORM } from '@/utils/academyExportUtils';
import { DocumentProcessor } from '@/services/academy/documentProcessor';
import { DeterministicCourseGenerator, GenerationResult } from '@/services/academy/deterministicCourseGenerator';
import { CoursePreview } from './CoursePreview';
import { saveCourseToHistory } from './CourseHistory';
import { trackAnalyticsEvent } from './AnalyticsDashboard';
import { academyApiService } from '@/services/academy/apiService';

export const CourseGenerator: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [lastGenerationStats, setLastGenerationStats] = useState<GenerationResult['processingStats'] | null>(null);
  const [lastNormRulesUsed, setLastNormRulesUsed] = useState<number>(0);
  const workerRef = useRef<Worker | null>(null);
  const pendingResolveRef = useRef<((result: GenerationResult) => void) | null>(null);
  const pendingRejectRef = useRef<((error: Error) => void) | null>(null);

  const [settings, setSettings] = useState<GenerationSettings>({
    includeQCM: true,
    includeIntroduction: true,
    includeConclusion: true,
    addExamples: true,
    addWarnings: true,
    qcmQuestionCount: 10,
    courseStyle: 'structured'
  });
  const [customInstructions, setCustomInstructions] = useState('');

  useEffect(() => {
    const worker = new Worker(new URL('../../../workers/courseGenerationWorker.ts', import.meta.url), {
      type: 'module'
    });

    worker.onmessage = (event: MessageEvent) => {
      const message = event.data;
      if (message?.type === 'result') {
        pendingResolveRef.current?.(message.payload as GenerationResult);
      } else if (message?.type === 'error') {
        const error = new Error(message.error || 'Erreur de generation');
        pendingRejectRef.current?.(error);
      }

      pendingResolveRef.current = null;
      pendingRejectRef.current = null;
    };

    worker.onerror = (event) => {
      const error = new Error(event.message || 'Erreur du worker');
      pendingRejectRef.current?.(error);
      pendingResolveRef.current = null;
      pendingRejectRef.current = null;
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
      workerRef.current = null;
      pendingResolveRef.current = null;
      pendingRejectRef.current = null;
    };
  }, []);

  // Fetch courses from API on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await academyApiService.getCourses();
        // Convert date strings back to Date objects if needed
        const formattedData = data.map((c) => ({
          ...c,
          generatedAt: new Date(c.generatedAt),
          lastModified: new Date(c.lastModified)
        }));
        setCourses(formattedData);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Erreur lors du chargement des cours');
      }
    };
    fetchCourses();
  }, []);

  const generateCourseInWorker = (
  docs: Document[],
  generationSettings: GenerationSettings,
  instructions: string) =>
  {
    if (!workerRef.current) {
      return Promise.resolve(
        DeterministicCourseGenerator.generateCourse(docs, generationSettings, instructions)
      );
    }

    return new Promise<GenerationResult>((resolve, reject) => {
      pendingResolveRef.current = resolve;
      pendingRejectRef.current = reject;
      workerRef.current?.postMessage({
        type: 'generate',
        payload: {
          documents: docs,
          settings: generationSettings,
          customInstructions: instructions
        }
      });
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newDocuments: Document[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        const content = await DocumentProcessor.extractText(file);

        const doc: Document = {
          id: `${Date.now()}-${i}`,
          name: file.name,
          type: file.type.includes('pdf') ? 'pdf' : file.type.includes('word') ? 'docx' : 'txt',
          size: file.size,
          uploadedAt: new Date(),
          content,
          processed: true
        };

        newDocuments.push(doc);
        toast.success(`Document "${file.name}" importé avec succès`);
      } catch (error) {
        toast.error(`Erreur lors de l'import de "${file.name}"`);
        console.error('File upload error:', error);
      }
    }

    setDocuments((prev) => [...prev, ...newDocuments]);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    toast.success('Document supprimé');
  };

  /**
   * GÉNÉRATION DE COURS - Fonctionne SANS IA par défaut
   */
  const handleGenerateCourse = async () => {
    if (documents.length === 0) {
      toast.error("Veuillez importer au moins un document");
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Étape 1: Analyse des documents (déterministe)
      setGenerationProgress(20);
      toast.info("Analyse structurée des documents...");

      await new Promise((resolve) => setTimeout(resolve, 500)); // UX feedback

      // Étape 2: Génération déterministe
      setGenerationProgress(50);
      toast.info("Génération du cours...");

      const result = await generateCourseInWorker(documents, settings, customInstructions);

      let finalCourse = result.course;

      // Étape 3: Finalisation
      setGenerationProgress(100);

      setCourses((prev) => [finalCourse, ...prev]);
      setLastGenerationStats(result.processingStats);
      setLastNormRulesUsed(result.normRulesUsed);

      // Save to API
      try {
        const savedCourse = await academyApiService.createCourse(finalCourse);
        setCourses((prev) => [savedCourse, ...prev]);
        toast.success(`Cours sauvegardé dans la base de données !`);
      } catch (apiError) {
        console.error('API save error:', apiError);
        toast.warning('Cours généré mais erreur lors de la sauvegarde en base');
        setCourses((prev) => [finalCourse, ...prev]);
      }

      // Save to history and track analytics
      saveCourseToHistory(finalCourse);
      trackAnalyticsEvent('course_generated', {
        generationTime: result.processingStats.processingTimeMs,
        normRulesUsed: result.normRulesUsed
      });
      documents.forEach(() => trackAnalyticsEvent('document_processed'));

      const normLabel = result.normRulesUsed > 0 ? ` + ${result.normRulesUsed} règles NS 01-001` : '';
      toast.success(`Cours généré${normLabel} et sauvegardé !`);

    } catch (error) {
      console.error('Course generation error:', error);
      toast.error('Erreur lors de la génération du cours');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleExport = async (courseId: string, format: 'pdf' | 'docx' | 'pptx' | 'scorm') => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    try {
      switch (format) {
        case 'docx':
          await exportToWord(course);
          trackAnalyticsEvent('export', { format: 'docx' });
          break;
        case 'pptx':
          await exportToPowerPoint(course);
          trackAnalyticsEvent('export', { format: 'pptx' });
          break;
        case 'pdf':
          await exportToPDF(course);
          trackAnalyticsEvent('export', { format: 'pdf' });
          break;
        case 'scorm':
          await exportToSCORM(course);
          break;
      }
      toast.success(`Export ${format.toUpperCase()} réussi`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Erreur lors de l'export ${format.toUpperCase()}`);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      // If it's a real ID from DB (number/uuid), call API. 
      // Robust mode uses Date.now() string IDs for local gen.
      if (courseId.length > 5 && !courseId.includes('-')) {
        await academyApiService.deleteCourse(courseId);
      }
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      toast.success('Cours supprimé');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Erreur lors de la suppression du cours');
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">
            <Wand2 className="w-4 h-4 mr-2" />
            Générer
          </TabsTrigger>
          <TabsTrigger value="courses">
            <BookOpen className="w-4 h-4 mr-2" />
            Cours générés ({courses.length})
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Paramètres
          </TabsTrigger>
        </TabsList>

        {/* Onglet Génération */}
        <TabsContent value="generate" className="space-y-6">
          {/* Import de documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Documents sources
              </CardTitle>
              <CardDescription>
                Importez vos documents (PDF, Word, TXT) pour générer une formation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  multiple
                  onChange={handleFileUpload}
                  className="flex-1" />
                
                <Button variant="outline" size="sm">
                  <FileUp className="w-4 h-4 mr-2" />
                  Parcourir
                </Button>
              </div>

              {documents.length > 0 &&
              <div className="space-y-2">
                  <Label>Documents importés ({documents.length})</Label>
                  <div className="space-y-2">
                    {documents.map((doc) =>
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4" />
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(doc.size / 1024).toFixed(2)} KB • {doc.type.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc.id)}>
                      
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                  )}
                  </div>
                </div>
              }
            </CardContent>
          </Card>

          {/* Instructions personnalisées */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions personnalisées</CardTitle>
              <CardDescription>
                Ajoutez des consignes spécifiques pour la génération du cours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Ex: Créer une formation pour des débutants, mettre l'accent sur la pratique, inclure des études de cas réels..."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                rows={4} />
              
            </CardContent>
          </Card>

          {/* Bouton de génération */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              {isGenerating ?
              <div className="space-y-4">
                  <Progress value={generationProgress} />
                  <p className="text-center text-sm text-muted-foreground">
                    Génération en cours... {generationProgress}%
                  </p>
                </div> :

              <Button
                onClick={handleGenerateCourse}
                disabled={documents.length === 0}
                className="w-full"
                size="lg">
                
                  <Wand2 className="w-5 h-5 mr-2" />
                  Générer le cours (mode robuste)
                </Button>
              }

              {lastGenerationStats &&
              <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Dernière génération : {lastGenerationStats.sectionsCreated} sections,
                    {lastGenerationStats.qcmGenerated} questions QCM{lastNormRulesUsed > 0 ? `, ${lastNormRulesUsed} règles NS 01-001` : ''} en {lastGenerationStats.processingTimeMs}ms
                  </AlertDescription>
                </Alert>
              }
            </CardContent>
          </Card>

          {/* Info mode sans IA */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Mode robuste :</strong> Le cours est généré par analyse structurée des documents,
              sans dépendre d'un moteur IA externe.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Onglet Cours générés */}
        <TabsContent value="courses" className="space-y-4">
          {courses.length === 0 ?
          <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Aucun cours généré</h3>
                <p className="text-muted-foreground mb-4">
                  Commencez par importer des documents et générer votre premier cours
                </p>
              </CardContent>
            </Card> :

          courses.map((course) =>
          <Card key={course.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{course.title}</CardTitle>
                      <CardDescription>
                        Généré le {new Date(course.generatedAt).toLocaleDateString('fr-FR')}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Complété
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Modules</p>
                      <p className="font-semibold">{course.modules.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sections</p>
                      <p className="font-semibold">{course.content.sections.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Questions QCM</p>
                      <p className="font-semibold">{course.content.qcm.length}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewCourse(course)}>
                  
                      <Eye className="w-4 h-4 mr-2" />
                      Prévisualiser
                    </Button>
                    <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleExport(course.id, 'docx')}>
                  
                      <Download className="w-4 h-4 mr-2" />
                      Word
                    </Button>
                    <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleExport(course.id, 'pptx')}>
                  
                      <Download className="w-4 h-4 mr-2" />
                      PowerPoint
                    </Button>
                    <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport(course.id, 'pdf')}
                  disabled>
                  
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCourse(course.id)}>
                  
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
          )
          }
        </TabsContent>

        {/* Onglet Paramètres */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de génération</CardTitle>
              <CardDescription>
                Personnalisez le contenu et le style de vos formations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="includeIntro">Inclure une introduction</Label>
                  <Switch
                    id="includeIntro"
                    checked={settings.includeIntroduction}
                    onCheckedChange={(checked) =>
                    setSettings({ ...settings, includeIntroduction: checked })
                    } />
                  
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="includeConclusion">Inclure une conclusion</Label>
                  <Switch
                    id="includeConclusion"
                    checked={settings.includeConclusion}
                    onCheckedChange={(checked) =>
                    setSettings({ ...settings, includeConclusion: checked })
                    } />
                  
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="addExamples">Ajouter des exemples</Label>
                  <Switch
                    id="addExamples"
                    checked={settings.addExamples}
                    onCheckedChange={(checked) =>
                    setSettings({ ...settings, addExamples: checked })
                    } />
                  
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="addWarnings">Ajouter des points d'attention</Label>
                  <Switch
                    id="addWarnings"
                    checked={settings.addWarnings}
                    onCheckedChange={(checked) =>
                    setSettings({ ...settings, addWarnings: checked })
                    } />
                  
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="includeQCM">Générer un QCM</Label>
                  <Switch
                    id="includeQCM"
                    checked={settings.includeQCM}
                    onCheckedChange={(checked) =>
                    setSettings({ ...settings, includeQCM: checked })
                    } />
                  
                </div>

                {settings.includeQCM &&
                <div className="space-y-2 pl-4">
                    <Label htmlFor="qcmCount">Nombre de questions QCM</Label>
                    <Input
                    id="qcmCount"
                    type="number"
                    min="5"
                    max="20"
                    value={settings.qcmQuestionCount}
                    onChange={(e) =>
                    setSettings({ ...settings, qcmQuestionCount: parseInt(e.target.value) })
                    } />
                  
                  </div>
                }
              </div>

              <div className="space-y-2">
                <Label>Style de cours</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['structured', 'conversational', 'technical'] as const).map((style) =>
                  <Button
                    key={style}
                    variant={settings.courseStyle === style ? 'default' : 'outline'}
                    onClick={() => setSettings({ ...settings, courseStyle: style })}>
                    
                      {style === 'structured' && 'Structuré'}
                      {style === 'conversational' && 'Conversationnel'}
                      {style === 'technical' && 'Technique'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={!!previewCourse} onOpenChange={(open) => !open && setPreviewCourse(null)}>
        <DialogContent className="max-w-5xl h-[85vh]">
          <DialogHeader>
            <DialogTitle>Prévisualisation du cours</DialogTitle>
            <DialogDescription>
              Naviguez dans le cours et testez le QCM interactif
            </DialogDescription>
          </DialogHeader>
          {previewCourse &&
          <div className="flex-1 overflow-hidden -mx-6 -mb-6">
              <CoursePreview course={previewCourse} onClose={() => setPreviewCourse(null)} />
            </div>
          }
        </DialogContent>
      </Dialog>
    </div>);

};