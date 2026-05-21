/**
 * Interface de génération de cours normatifs
 * 
 * Permet de générer des cours structurés à partir de la norme NS 01-001
 * en sélectionnant un thème, des articles ou des règles spécifiques.
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpen, Wand2, FileText, GraduationCap,
  CheckCircle, Settings, Loader2, Presentation,
  Zap, Filter, Search } from
'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { NormativeCourseGenerator, PREDEFINED_THEMES, NormativeCourseResult } from '@/services/academy/normativeCourseGenerator';
import { normService } from '@/services/academy/normService';
import { NormRule } from '@/types/academy';
import { exportToWord, exportToPowerPoint } from '@/utils/academyExportUtils';
import { CoursePreview } from './CoursePreview';
import { saveCourseToHistory } from './CourseHistory';

export const NormativeCourseGeneratorUI: React.FC = () => {
  // États de configuration
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [customArticle, setCustomArticle] = useState<string>('');
  const [customTheme, setCustomTheme] = useState<string>('');
  const [targetAudience, setTargetAudience] = useState<'beginner' | 'technician' | 'engineer'>('technician');
  const [includeQCM, setIncludeQCM] = useState(true);
  const [qcmCount, setQcmCount] = useState(10);

  // États de génération
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedCourse, setGeneratedCourse] = useState<NormativeCourseResult | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // États de recherche de règles
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NormRule[]>([]);
  const [selectedRules, setSelectedRules] = useState<NormRule[]>([]);

  // Stats
  const [normStats, setNormStats] = useState({ ruleCount: 0, loaded: false });

  // Charger les données normatives au montage
  useEffect(() => {
    const loadNorms = async () => {
      try {
        await normService.loadData();
        setNormStats(normService.getStats());
      } catch (error) {
        console.error('Erreur chargement normes:', error);
      }
    };
    loadNorms();
  }, []);

  // Recherche de règles
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = normService.searchRules(searchQuery, 20);
      setSearchResults(results.map((r) => r.rule));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const toggleRuleSelection = (rule: NormRule) => {
    setSelectedRules((prev) => {
      const exists = prev.find((r) => r.id === rule.id);
      if (exists) {
        return prev.filter((r) => r.id !== rule.id);
      } else {
        return [...prev, rule];
      }
    });
  };

  const handleGenerate = async () => {
    if (!selectedTheme && !customArticle && !customTheme && selectedRules.length === 0) {
      toast.error('Veuillez sélectionner un thème, un article ou des règles');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulation de progression
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 15, 90));
      }, 200);

      const theme = selectedTheme ?
      PREDEFINED_THEMES[selectedTheme]?.label :
      customTheme || undefined;

      const result = await NormativeCourseGenerator.generateCourse({
        normReference: 'NS 01-001',
        theme,
        articlePrefix: customArticle || undefined,
        selectedRules: selectedRules.length > 0 ? selectedRules : undefined,
        targetAudience,
        includeQCM,
        qcmCount
      });

      clearInterval(progressInterval);
      setProgress(100);

      setGeneratedCourse(result);
      saveCourseToHistory(result.course);

      toast.success(`Cours généré avec ${result.rulesUsed.length} règles normatives !`);
    } catch (error) {
      console.error('Erreur génération:', error);
      toast.error('Erreur lors de la génération du cours');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleExportWord = async () => {
    if (generatedCourse) {
      await exportToWord(generatedCourse.course);
      toast.success('Export Word réussi');
    }
  };

  const handleExportPPT = async () => {
    if (generatedCourse) {
      await exportToPowerPoint(generatedCourse.course);
      toast.success('Export PowerPoint réussi');
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec stats */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-primary" />
                Professeur KEBE - Générateur Normatif
              </CardTitle>
              <CardDescription>
                Génération automatique de cours à partir de la norme NS 01-001
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {normStats.ruleCount} règles
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="theme" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="theme">
            <BookOpen className="w-4 h-4 mr-2" />
            Par thème
          </TabsTrigger>
          <TabsTrigger value="article">
            <FileText className="w-4 h-4 mr-2" />
            Par article
          </TabsTrigger>
          <TabsTrigger value="selection">
            <Filter className="w-4 h-4 mr-2" />
            Sélection manuelle
          </TabsTrigger>
        </TabsList>

        {/* === ONGLET PAR THÈME === */}
        <TabsContent value="theme" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Choisir un thème prédéfini</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(PREDEFINED_THEMES).map(([key, theme]) =>
                <Button
                  key={key}
                  variant={selectedTheme === key ? 'default' : 'outline'}
                  className="h-auto py-3 px-4 text-left flex-col items-start"
                  onClick={() => {
                    setSelectedTheme(key);
                    setCustomTheme('');
                    setCustomArticle('');
                  }}>
                  
                    <span className="font-medium text-sm">{theme.label}</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Art. {theme.articlePrefixes.slice(0, 2).join(', ')}...
                    </span>
                  </Button>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Ou saisir un thème personnalisé</Label>
                <Input
                  placeholder="Ex: Protection contre les surtensions, Locaux de service électrique..."
                  value={customTheme}
                  onChange={(e) => {
                    setCustomTheme(e.target.value);
                    if (e.target.value) setSelectedTheme('');
                  }} />
                
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === ONGLET PAR ARTICLE === */}
        <TabsContent value="article" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Générer à partir d'un article</CardTitle>
              <CardDescription>
                Saisissez un numéro d'article pour générer un cours sur tous les sous-articles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Préfixe d'article</Label>
                <Input
                  placeholder="Ex: 411, 433, 541..."
                  value={customArticle}
                  onChange={(e) => {
                    setCustomArticle(e.target.value);
                    setSelectedTheme('');
                    setCustomTheme('');
                  }} />
                
                <p className="text-xs text-muted-foreground">
                  Exemple : "411" générera un cours sur tous les articles 411.x (protection contre les chocs)
                </p>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {['411', '433', '541', '61', '701', '42'].map((article) =>
                <Button
                  key={article}
                  variant={customArticle === article ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setCustomArticle(article);
                    setSelectedTheme('');
                    setCustomTheme('');
                  }}>
                  
                    Art. {article}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === ONGLET SÉLECTION MANUELLE === */}
        <TabsContent value="selection" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sélection manuelle des règles</CardTitle>
              <CardDescription>
                Recherchez et sélectionnez les règles à inclure dans le cours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par mot-clé, concept, article..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10" />
                
              </div>

              {selectedRules.length > 0 &&
              <div className="p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">
                      {selectedRules.length} règle(s) sélectionnée(s)
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedRules([])}>
                      Tout effacer
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedRules.map((rule) =>
                  <Badge
                    key={rule.id}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => toggleRuleSelection(rule)}>
                    
                        Art. {rule.article} ✕
                      </Badge>
                  )}
                  </div>
                </div>
              }

              {searchResults.length > 0 &&
              <ScrollArea className="h-[300px] border rounded-lg">
                  <div className="p-2 space-y-2">
                    {searchResults.map((rule) => {
                    const isSelected = selectedRules.some((r) => r.id === rule.id);
                    return (
                      <div
                        key={rule.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${isSelected ?
                        'bg-primary/10 border border-primary' :
                        'bg-muted/50 hover:bg-muted'}`
                        }
                        onClick={() => toggleRuleSelection(rule)}>
                        
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              Art. {rule.article}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              p. {rule.page}
                            </Badge>
                            {isSelected &&
                          <CheckCircle className="w-4 h-4 text-primary ml-auto" />
                          }
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {rule.content.substring(0, 150)}...
                          </p>
                        </div>);

                  })}
                  </div>
                </ScrollArea>
              }
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* === OPTIONS DE GÉNÉRATION === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Options de génération
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Public cible</Label>
              <Select value={targetAudience} onValueChange={(v: unknown) => setTargetAudience(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">🎓 Débutant</SelectItem>
                  <SelectItem value="technician">🔧 Technicien</SelectItem>
                  <SelectItem value="engineer">📐 Ingénieur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nombre de questions QCM</Label>
              <Select value={String(qcmCount)} onValueChange={(v) => setQcmCount(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 questions</SelectItem>
                  <SelectItem value="10">10 questions</SelectItem>
                  <SelectItem value="15">15 questions</SelectItem>
                  <SelectItem value="20">20 questions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Inclure QCM</Label>
                <p className="text-xs text-muted-foreground">Questionnaire avec justifications</p>
              </div>
              <Switch checked={includeQCM} onCheckedChange={setIncludeQCM} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === BOUTON DE GÉNÉRATION === */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {isGenerating ?
          <div className="space-y-4">
              <Progress value={progress} />
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Génération du cours en cours...</span>
              </div>
            </div> :

          <Button
            onClick={handleGenerate}
            className="w-full"
            size="lg"
            disabled={!selectedTheme && !customArticle && !customTheme && selectedRules.length === 0}>
            
              <Wand2 className="w-5 h-5 mr-2" />
              Générer le cours normatif
            </Button>
          }

          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              La génération est 100% déterministe et fonctionne sans connexion IA.
              Le cours inclut automatiquement les règles normatives, cas pratiques et QCM.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* === RÉSULTAT DE GÉNÉRATION === */}
      {generatedCourse &&
      <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <CheckCircle className="w-5 h-5" />
                  Cours généré avec succès
                </CardTitle>
                <CardDescription>
                  {generatedCourse.generationStats.rulesAnalyzed} règles •
                  {generatedCourse.generationStats.sectionsCreated} sections •
                  {generatedCourse.generationStats.qcmGenerated} questions QCM •
                  {generatedCourse.generationStats.processingTimeMs}ms
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setPreviewOpen(true)}>
                <BookOpen className="w-4 h-4 mr-2" />
                Aperçu du cours
              </Button>
              <Button variant="outline" onClick={handleExportWord}>
                <FileText className="w-4 h-4 mr-2" />
                Export Word
              </Button>
              <Button variant="outline" onClick={handleExportPPT}>
                <Presentation className="w-4 h-4 mr-2" />
                Export PowerPoint
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-2xl font-bold text-primary">{generatedCourse.rulesUsed.length}</p>
                <p className="text-xs text-muted-foreground">Règles utilisées</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-2xl font-bold text-primary">{generatedCourse.course.modules.length}</p>
                <p className="text-xs text-muted-foreground">Modules</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-2xl font-bold text-primary">{generatedCourse.course.content.sections.length}</p>
                <p className="text-xs text-muted-foreground">Sections</p>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <p className="text-2xl font-bold text-primary">{generatedCourse.course.content.qcm.length}</p>
                <p className="text-xs text-muted-foreground">Questions QCM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      }

      {/* Modal de prévisualisation */}
      {previewOpen && generatedCourse &&
      <CoursePreview
        course={generatedCourse.course}
        onClose={() => setPreviewOpen(false)} />

      }
    </div>);

};

export default NormativeCourseGeneratorUI;