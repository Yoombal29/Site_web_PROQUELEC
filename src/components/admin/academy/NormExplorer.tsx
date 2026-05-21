/**
 * Explorateur de normes NS 01-001
 * et normes importées (NF C 15-100, IEC 60364, etc.)
 * 
 * Permet de naviguer, rechercher et sélectionner des règles normatives
 * pour enrichir la génération de cours.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, BookOpen, ChevronRight, ChevronDown, FileText, AlertCircle, Loader2, Check, Filter, Database, Upload, Globe, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

import { multiNormService } from '@/services/academy/multiNormService';
import { NormRule, SommaireNode, NormSearchResult, NormFullJSON } from '@/types/academy';
import { NormImporter } from './NormImporter';
import { precacheCriticalNorms } from '@/sw-register';
import { Brain, Sparkles, Info } from 'lucide-react';

interface NormExplorerProps {
  onSelectRules?: (rules: NormRule[]) => void;
  selectionMode?: boolean;
}

export const NormExplorer: React.FC<NormExplorerProps> = ({
  onSelectRules,
  selectionMode = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NormSearchResult[]>([]);
  const [selectedRules, setSelectedRules] = useState<Set<string>>(new Set());
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '2', '3']));
  const [sommaire, setSommaire] = useState<SommaireNode[]>([]);
  const [stats, setStats] = useState({ ruleCount: 0, loaded: false });
  const [currentPage, setCurrentPage] = useState(1);
  const [allRules, setAllRules] = useState<{rules: NormRule[];total: number;pages: number;}>({ rules: [], total: 0, pages: 0 });
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedNormId, setSelectedNormId] = useState<string>('NS-01-001');
  const [availableNorms, setAvailableNorms] = useState<{id: string;name: string;ruleCount: number;}[]>([]);
  const [isRagSearch, setIsRagSearch] = useState(true);
  const [ragResults, setRagResults] = useState<{chunk: NormChunk;score: number;}[]>([]);
  const [currentSummary, setCurrentSummary] = useState<NormFullJSON['resume'] | null>(null);

  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        // Charger les normes via MultiNormService (qui inclut NS 01-001 Full AI)
        await multiNormService.loadSavedNorms();

        // Initialiser avec la norme par défaut
        const defaultNormId = 'NS-01-001';
        const db = multiNormService.getNormDatabase(defaultNormId);

        if (db) {
          setSommaire(db.sommaire);
          setStats({ ruleCount: db.ruleCount, loaded: true });
          const pageSize = 50;
          setAllRules({
            rules: db.rules.slice(0, pageSize),
            total: db.ruleCount,
            pages: Math.ceil(db.ruleCount / pageSize)
          });
          setCurrentSummary(multiNormService.getNormSummary(defaultNormId));
        }

        updateAvailableNorms();

        toast.success(`${multiNormService.getStats().totalRuleCount} règles normatives disponibles`);
      } catch (error) {
        console.error('Erreur chargement norme:', error);
        setLoadError('Impossible de charger les données normatives');
        toast.error('Erreur de chargement des données normatives');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const updateAvailableNorms = () => {
    const norms = multiNormService.listNorms().map((n) => ({
      id: n.id,
      name: n.name,
      ruleCount: n.ruleCount
    }));
    setAvailableNorms(norms);
  };

  const handleNormChange = (normId: string) => {
    setSelectedNormId(normId);
    setCurrentPage(1);

    const db = multiNormService.getNormDatabase(normId);
    if (db) {
      setSommaire(db.sommaire);
      setStats({ ruleCount: db.ruleCount, loaded: true });
      const pageSize = 50;
      setAllRules({
        rules: db.rules.slice(0, pageSize),
        total: db.ruleCount,
        pages: Math.ceil(db.ruleCount / pageSize)
      });
      setCurrentSummary(multiNormService.getNormSummary(normId));
    }
  };

  // Recherche avec debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setRagResults([]);
      return;
    }

    const timer = setTimeout(() => {
      if (isRagSearch) {
        // Recherche Vectorielle / Smart
        const chunks = multiNormService.searchChunks(searchQuery, selectedNormId === 'all' ? undefined : selectedNormId, 10);
        // On map pour simuler un score (l'API retourne déjà trié)
        setRagResults(chunks.map((c, i) => ({ chunk: c, score: 100 - i * 5 })));
      } else {
        // Recherche Classique
        const results = multiNormService.searchRules(searchQuery, selectedNormId === 'all' ? undefined : selectedNormId, 30);
        setSearchResults(results);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedNormId, isRagSearch]);

  const toggleNode = useCallback((index: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const toggleRuleSelection = useCallback((ruleId: string) => {
    setSelectedRules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ruleId)) {
        newSet.delete(ruleId);
      } else {
        newSet.add(ruleId);
      }
      return newSet;
    });
  }, []);

  const handleApplySelection = useCallback(() => {
    if (onSelectRules && selectedRules.size > 0) {
      const rules = Array.from(selectedRules).
      map((id) => {
        const result = searchResults.find((r) => r.rule.id === id);
        if (result) return result.rule;
        return allRules.rules.find((r) => r.id === id);
      }).
      filter(Boolean) as NormRule[];

      onSelectRules(rules);
      toast.success(`${rules.length} règle(s) sélectionnée(s)`);
    }
  }, [onSelectRules, selectedRules, searchResults, allRules.rules]);

  const handleLoadPage = (page: number) => {
    setCurrentPage(page);
    const db = multiNormService.getNormDatabase(selectedNormId);
    if (db) {
      const pageSize = 50;
      const start = (page - 1) * pageSize;
      setAllRules({
        rules: db.rules.slice(start, start + pageSize),
        total: db.ruleCount,
        pages: Math.ceil(db.ruleCount / pageSize)
      });
    }
  };

  const handleImportSuccess = () => {
    updateAvailableNorms();
    setActiveTab('browse');
  };

  const renderSommaireNode = (node: SommaireNode, depth: number = 0): React.ReactNode => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.index);

    return (
      <div key={node.index} className="w-full">
        <div
          className={`
            flex items-center gap-2 py-2 px-2 rounded-md cursor-pointer
            hover:bg-muted/50 transition-colors
            ${depth === 0 ? 'font-semibold' : ''}
            ${depth === 1 ? 'pl-6' : depth === 2 ? 'pl-10' : depth === 3 ? 'pl-14' : depth > 3 ? 'pl-20' : 'pl-2'}
          `}
          onClick={() => hasChildren && toggleNode(node.index)}>
          
          {hasChildren ?
          isExpanded ?
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" /> :

          <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" /> :


          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          }
          <Badge variant="outline" className="text-xs flex-shrink-0">
            {node.index}
          </Badge>
          <span className="text-sm truncate">{node.label}</span>
        </div>

        {hasChildren && isExpanded &&
        <div className="w-full">
            {node.children.map((child) => renderSommaireNode(child, depth + 1))}
          </div>
        }
      </div>);

  };

  const renderRuleCard = (rule: NormRule, matchType?: 'exact' | 'partial' | 'keyword') =>
  <Card
    key={rule.id}
    className={`mb-2 ${selectedRules.has(rule.id) ? 'ring-2 ring-primary' : ''} hover:border-primary/50 transition-colors cursor-pointer`}
    onClick={() => selectionMode && toggleRuleSelection(rule.id)}>
    
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {selectionMode &&
        <Checkbox
          checked={selectedRules.has(rule.id)}
          onCheckedChange={() => toggleRuleSelection(rule.id)}
          className="mt-1" />

        }
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                {rule.article}
              </Badge>
              {matchType &&
            <Badge
              variant={matchType === 'exact' ? 'default' : 'outline'}
              className="text-xs">
              
                  {matchType === 'exact' ? 'Exact' : matchType === 'partial' ? 'Partiel' : 'Mot-clé'}
                </Badge>
            }
            </div>
            <p className="text-sm font-medium mb-1 text-slate-900">{rule.titre}</p>
            <p className="text-xs text-muted-foreground line-clamp-2">{rule.content}</p>
          </div>
        </div>
      </CardContent>
    </Card>;


  const renderRagResult = (chunk: NormChunk, score: number) =>
  <Card key={chunk.id} className="mb-3 border-l-4 border-l-purple-500 bg-purple-50/10">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
              <Sparkles className="w-3 h-3 mr-1" />
              Smart Match
            </Badge>
            <span className="text-xs font-bold text-slate-500">{chunk.metadata.titre || 'Section sans titre'}</span>
          </div>
          <Badge className="bg-slate-900 text-white text-[10px]">{score}%</Badge>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed mb-2 bg-white/50 p-2 rounded border border-slate-100">
          {chunk.text}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider">
          <span>{chunk.metadata.normId}</span>
          <span>•</span>
          <span>{chunk.metadata.article}</span>
        </div>
      </CardContent>
    </Card>;


  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Chargement des données normatives...</p>
          </div>
        </CardContent>
      </Card>);

  }

  if (loadError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{loadError}</AlertDescription>
      </Alert>);

  }

  return (
    <div className="space-y-4">
      {/* En-tête avec statistiques */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Base Normative
              </CardTitle>
              <CardDescription>
                {availableNorms.length} norme(s) • {stats.ruleCount} règles actives
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  precacheCriticalNorms();
                  toast.success('Téléchargement des données pour le mode hors-ligne...');
                }}
                className="hidden md:flex gap-2 text-slate-600">
                
                <WifiOff className="w-4 h-4" />
                Mode Hors-ligne
              </Button>
              {selectionMode && selectedRules.size > 0 &&
              <Button onClick={handleApplySelection} size="sm">
                  <Check className="w-4 h-4 mr-2" />
                  Appliquer ({selectedRules.size})
                </Button>
              }
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-3 space-y-3">
          {/* Barre d'outils de recherche */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Select value={selectedNormId} onValueChange={handleNormChange}>
                <SelectTrigger className="w-[240px] border-slate-200">
                  <SelectValue placeholder="Sélectionner une norme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <span className="flex items-center gap-2 font-medium">
                      <Globe className="w-4 h-4 text-primary" />
                      Toutes les normes
                    </span>
                  </SelectItem>
                  {availableNorms.map((norm) =>
                  <SelectItem key={norm.id} value={norm.id}>
                      {norm.name}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              <div className="flex-1 relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isRagSearch ? 'text-purple-500' : 'text-slate-400'}`} />
                <Input
                  placeholder={isRagSearch ? "Posez une question technique (ex: hauteur prise cuisine)..." : "Recherche par mots-clés..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 ${isRagSearch ? 'border-purple-200 focus:ring-purple-500' : ''}`} />
                
              </div>

              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                <Button
                  variant={isRagSearch ? "ghost" : "secondary"}
                  size="sm"
                  onClick={() => setIsRagSearch(false)}
                  className={`text-xs ${!isRagSearch ? 'shadow-sm font-bold bg-white text-slate-800' : 'text-slate-500'}`}>
                  
                  Classique
                </Button>
                <Button
                  variant={isRagSearch ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setIsRagSearch(true)}
                  className={`text-xs gap-1 ${isRagSearch ? 'text-purple-700 shadow-sm font-bold bg-white' : 'text-slate-500'}`}>
                  
                  <Sparkles className="w-3 h-3" />
                  Smart AI
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets principaux */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-100 p-1 mb-4">
          <TabsTrigger value="browse" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Database className="w-4 h-4 mr-2" />
            Explorer
          </TabsTrigger>
          {currentSummary &&
          <TabsTrigger value="resume" className="data-[state=active]:bg-white data-[state=active]:shadow-sm text-purple-700">
              <Info className="w-4 h-4 mr-2" />
              Résumé Expert
            </TabsTrigger>
          }
          <TabsTrigger value="sommaire" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <BookOpen className="w-4 h-4 mr-2" />
            Sommaire
          </TabsTrigger>
          <TabsTrigger value="import" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Upload className="w-4 h-4 mr-2" />
            Importer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {searchQuery && isRagSearch && ragResults.length > 0 &&
          <Card className="border-purple-100 shadow-sm">
              <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-white">
                <CardTitle className="text-base flex items-center gap-2 text-purple-800">
                  <Brain className="w-4 h-4" />
                  Analyse Contextuelle (AI)
                </CardTitle>
                <CardDescription>Extraits les plus pertinents trouvés par l'IA</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ScrollArea className="h-[400px] pr-4">
                  {ragResults.map((result) => renderRagResult(result.chunk, result.score))}
                </ScrollArea>
              </CardContent>
            </Card>
          }

          {searchQuery && !isRagSearch && searchResults.length > 0 &&
          <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Résultats ({searchResults.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  {searchResults.map((result) => renderRuleCard(result.rule, result.matchType))}
                </ScrollArea>
              </CardContent>
            </Card>
          }

          {/* Liste paginée (si pas de recherche) */}
          {!searchQuery &&
          <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription>
                    Page {currentPage} sur {allRules.pages} ({allRules.total} règles)
                  </CardDescription>
                  <div className="flex gap-2">
                    <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => handleLoadPage(currentPage - 1)}>
                    
                      Précédent
                    </Button>
                    <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= allRules.pages}
                    onClick={() => handleLoadPage(currentPage + 1)}>
                    
                      Suivant
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  {allRules.rules.map((rule) => renderRuleCard(rule))}
                </ScrollArea>
              </CardContent>
            </Card>
          }

          {/* Message si aucun résultat */}
          {searchQuery && (isRagSearch && ragResults.length === 0 || !isRagSearch && searchResults.length === 0) &&
          <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Aucun résultat trouvé pour "{searchQuery}". Essayez de reformuler ou changez de mode de recherche.
              </AlertDescription>
            </Alert>
          }
        </TabsContent>

        <TabsContent value="resume" className="space-y-4">
          {currentSummary &&
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Fiche d'Identité</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Titre:</span>
                    <span className="font-medium text-right">{currentSummary.metadonnees.titre}</span>
                    <span className="text-muted-foreground">Publication:</span>
                    <span className="font-medium text-right">{currentSummary.metadonnees.date_publication}</span>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium text-right">{currentSummary.metadonnees.type_document}</span>
                  </div>
                </CardContent>
              </Card>

              {currentSummary.definitions_techniques &&
            <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Concepts Clés</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {currentSummary.definitions_techniques.categories.map((cat, i) =>
                  <Badge key={i} variant="secondary">{cat}</Badge>
                  )}
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Total définitions: {currentSummary.definitions_techniques.total_definitions}
                    </p>
                  </CardContent>
                </Card>
            }
            </div>
          }
        </TabsContent>

        <TabsContent value="import">
          <NormImporter onImportSuccess={handleImportSuccess} />
        </TabsContent>

        <TabsContent value="sommaire">
          <Card>
            <CardContent className="p-0">
              {sommaire.length > 0 ?
              <ScrollArea className="h-[500px]">
                  <div className="p-4">
                    {sommaire.map((node) => renderSommaireNode(node))}
                  </div>
                </ScrollArea> :

              <div className="p-8 text-center text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun sommaire disponible pour cette norme.</p>
                  <p className="text-sm mt-2">Le sommaire est optionnel lors de l'import.</p>
                </div>
              }
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>);

};

export default NormExplorer;