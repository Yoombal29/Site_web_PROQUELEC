import React, { useState, useEffect } from "react";
import Editor, { DiffEditor } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  Lock, Save, Eye, Code, History, Sparkles, Settings,
  CheckCircle2, AlertTriangle, Search, ChevronRight,
  ArrowUpRight, Info, Layout } from
"lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { PageBuilder } from "./PageBuilder";

interface AdminPageEditorProps {
  pageId: string;
  onSave?: (page: unknown) => void;
}

export const AdminPageEditor: React.FC<AdminPageEditorProps> = ({ pageId, onSave }) => {
  const [page, setPage] = useState<unknown | null>(null);
  const [content, setContent] = useState<string>("");
  const [immutable, setImmutable] = useState<boolean>(false);
  const [version, setVersion] = useState<number>(1);
  const [diffContent, setDiffContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [contentBlocks, setContentBlocks] = useState<unknown[]>([]);
  const [structureJson, setStructureJson] = useState<unknown[]>([]);

  // AI SEO State
  const [seoAnalysis, setSeoAnalysis] = useState<unknown | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch page data with ICE columns
  useEffect(() => {
    const fetchPage = async () => {
      setIsLoading(true);
      try {
        const data = await apiFetch<unknown>(`/api/admin/pages/${pageId}`);
        setPage(data);
        setContent(data.content_raw || data.content || "");
        setContentBlocks(data.content_blocks || []);
        setStructureJson(data.structure_json || []);
        setImmutable(data.immutable || false);
        setVersion(data.version || 1);

        // Fetch previous version for diff if version > 1
        if ((data.version || 1) > 1) {
          try {
            const prevData = await apiFetch<unknown>(`/api/admin/page-versions/${pageId}/${(data.version || 1) - 1}`);
            if (prevData) setDiffContent(prevData.content_raw || "");
          } catch (e) {

            // Previous version might not exist
          }}
      } catch (error: unknown) {
        console.error("Error fetching page:", error);
        toast.error("Impossible de charger la page");
      }
      setIsLoading(false);
    };

    if (pageId) fetchPage();
  }, [pageId]);

  // Save page
  const handleSave = async () => {
    if (!page) return;
    if (immutable) {
      toast.error("Cette page est IMMUABLE. Modification interdite.");
      return;
    }

    setIsSaving(true);
    try {
      const data = await apiFetch<unknown>(`/api/admin/pages/${page.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: page.title,
          slug: page.slug,
          content_raw: content,
          content: content,
          content_blocks: contentBlocks,
          structure_json: structureJson,
          updated_at: new Date().toISOString()
        })
      });

      toast.success("Page sauvegardée (v" + (data.version || version) + ")");
      setPage(data);
      setVersion(data.version || version);

      // Notify parent
      if (onSave) onSave(data);

    } catch (error: unknown) {
      console.error("Save error:", error);
      toast.error("Erreur lors de la sauvegarde: " + error.message);
    }
    setIsSaving(false);
  };

  const handleAnalyzeSEO = async () => {
    if (!page) return;
    setIsAnalyzing(true);
    setSeoAnalysis(null);
    try {
      const result = await apiFetch<unknown>('/api/ai/seo-analyze', {
        method: 'POST',
        body: JSON.stringify({
          title: page.title,
          slug: page.slug,
          content: content
        })
      });
      if (result.success) {
        setSeoAnalysis(result.seo);
        toast.success("Analyse SEO terminée !");
      } else {
        toast.error("Échec de l'analyse SEO");
      }
    } catch (error: unknown) {
      console.error("SEO Error:", error);
      toast.error("Erreur: " + error.message);
    }
    setIsAnalyzing(false);
  };

  const handleApplySEO = async (type: 'title' | 'description') => {
    if (!seoAnalysis || !page) return;

    setIsSaving(true);
    try {
      const body: unknown = {};
      if (type === 'title') body.title = seoAnalysis.meta_title;
      if (type === 'description') body.meta_description = seoAnalysis.meta_description;

      const data = await apiFetch<unknown>(`/api/admin/pages/${page.id}`, {
        method: 'PUT',
        body: JSON.stringify(body)
      });

      setPage(data);
      toast.success(`${type === 'title' ? 'Titre' : 'Meta Description'} mis à jour !`);
    } catch (error: unknown) {
      toast.error("Erreur lors de l'application: " + error.message);
    }
    setIsSaving(false);
  };

  if (isLoading) return <div className="p-8 text-center flex flex-col items-center gap-4">
        <div className="animate-spin h-8 w-8 border-4 border-proqblue border-t-transparent rounded-full"></div>
        Chargement du moteur ICE...
    </div>;
  if (!page) return <div className="p-8 text-center text-red-500">Page introuvable</div>;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] gap-4 pb-4">
            {/* Header / Status Bar */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border-b">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        {page.title}
                        <Badge variant="outline">v{version}</Badge>
                    </h2>
                    {immutable ?
          <Badge variant="destructive" className="flex gap-1"><Lock className="w-3 h-3" /> IMMUTABLE</Badge> :

          <Badge variant="default" className="bg-green-600">EDITABLE</Badge>
          }
                    <Badge variant="secondary" className="bg-proqblue/10 text-proqblue border-proqblue/20">
                        {page.security_level || 'trusted'}
                    </Badge>
                </div>

                <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => window.open(`/admin/builder/${page.slug || page.id}`, '_blank')}
                      className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                        <Layout className="w-4 h-4" />
                        Ouvrir Builder PRO
                    </Button>
                    <Button
            onClick={handleSave}
            disabled={immutable || isSaving}
            className={immutable ? "opacity-50 cursor-not-allowed" : "bg-proqblue hover:bg-proqblue/90"}>
            
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "Sauvegarde..." : "Enregistrer"}
                    </Button>
                </div>
            </div>

            {immutable &&
      <Alert variant="destructive" className="mx-4">
                    <Lock className="h-4 w-4" />
                    <AlertTitle>Modification Interdite</AlertTitle>
                    <AlertDescription>
                        Cette page est protégée en écriture (Mode Immuable). Contactez un administrateur Root pour déverrouiller.
                    </AlertDescription>
                </Alert>
      }

            {/* Main Editor Area */}
            <Tabs defaultValue="visual" className="flex-1 flex flex-col mx-4 overflow-hidden">
                <TabsList className="mb-2">
                    <TabsTrigger value="visual" className="flex gap-2"><Layout className="w-4 h-4" /> Constructeur Visuel</TabsTrigger>
                    <TabsTrigger value="editor" className="flex gap-2"><Code className="w-4 h-4" /> Code (Monaco)</TabsTrigger>
                    <TabsTrigger value="preview" className="flex gap-2"><Eye className="w-4 h-4" /> Preview (Sandbox)</TabsTrigger>
                    <TabsTrigger value="diff" className="flex gap-2" disabled={version <= 1}><History className="w-4 h-4" /> Diff (v{version - 1})</TabsTrigger>
                    <TabsTrigger value="seo" className="flex gap-2 text-indigo-600 data-[state=active]:bg-indigo-50">
                        <Sparkles className="w-4 h-4" /> Expert SEO IA
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex gap-2">
                        <Settings className="w-4 h-4" /> Paramètres
                    </TabsTrigger>
                </TabsList>

                {/* VISUAL BUILDER */}
                <TabsContent value="visual" className="flex-1 overflow-auto bg-slate-50/30 p-4 m-0 border rounded-md">
                    <div className="max-w-5xl mx-auto h-full">
                        <PageBuilder blocks={contentBlocks} onChange={setContentBlocks} />
                    </div>
                </TabsContent>

                {/* CODE EDITOR */}
                <TabsContent value="editor" className="flex-1 border rounded-md overflow-hidden bg-[#1e1e1e] m-0">
                    <Editor
            height="100%"
            defaultLanguage="html"
            theme="vs-dark"
            value={content}
            onChange={(val) => setContent(val || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              padding: { top: 16 },
              readOnly: immutable,
              scrollBeyondLastLine: false
            }} />
          
                </TabsContent>

                {/* SANDBOX PREVIEW */}
                <TabsContent value="preview" className="flex-1 border rounded-md bg-white m-0 flex flex-col overflow-hidden">
                    <div className="flex-1 relative p-4 bg-gray-100/30 overflow-auto">
                        <div className="bg-white shadow-xl mx-auto min-h-full max-w-[1200px] border overflow-hidden rounded-lg">
                            <iframe
                title="Page Preview"
                srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><script src="https://cdn.tailwindcss.com"></script><style>body{margin:0;padding:20px;font-family:sans-serif;}</style></head><body>${content}</body></html>`}
                width="100%"
                height="100%"
                id="ice-sandbox"
                className="w-full h-[800px] border-0"
                sandbox="allow-scripts allow-same-origin allow-popups" />
              
                        </div>
                    </div>
                    <div className="p-2 bg-yellow-50 text-[10px] uppercase tracking-wider font-bold text-yellow-700 border-t items-center justify-center flex gap-4">
                        <div className="flex items-center gap-1"><Lock className="w-3 h-3" /> Sandbox Isolation</div>
                        <div className="flex items-center gap-1"><Info className="w-3 h-3" /> CSS Admin Protected</div>
                        <div className="flex items-center gap-1 text-proqblue"><Code className="w-3 h-3" /> Tailwind Injecté</div>
                    </div>
                </TabsContent>

                {/* DIFF VIEWER */}
                <TabsContent value="diff" className="flex-1 border rounded-md overflow-hidden bg-[#1e1e1e] m-0">
                    <DiffEditor
            height="100%"
            language="html"
            theme="vs-dark"
            original={diffContent}
            modified={content}
            options={{
              readOnly: true,
              renderSideBySide: true,
              scrollBeyondLastLine: false
            }} />
          
                </TabsContent>

                {/* SEO IA TAB */}
                <TabsContent value="seo" className="flex-1 overflow-auto bg-slate-50/50 p-6 m-0 border rounded-md">
                    <div className="max-w-4xl mx-auto space-y-6">
                        <div className="flex items-center justify-between bg-white p-6 rounded-xl border shadow-sm">
                            <div>
                                <h3 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                                    <Sparkles className="text-indigo-500" /> Assistant SEO Intelligent
                                </h3>
                                <p className="text-slate-500 text-sm mt-1">
                                    Laissez l'IA analyser votre contenu pour maximiser votre visibilité sur Google.
                                </p>
                            </div>
                            <Button
                onClick={handleAnalyzeSEO}
                disabled={isAnalyzing}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
                
                                {isAnalyzing ?
                <><div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> Analyse...</> :

                <><Search className="w-4 h-4 mr-2" /> Lancer l'analyse</>
                }
                            </Button>
                        </div>

                        {!seoAnalysis && !isAnalyzing &&
            <div className="text-center py-20 border-2 border-dashed rounded-xl bg-white/50">
                                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-400">Cliquez sur le bouton pour démarrer l'audit SEO de cette page.</p>
                            </div>
            }

                        {seoAnalysis &&
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                                {/* Left Column: Score & Details */}
                                <div className="md:col-span-2 space-y-6">
                                    <Card className="border-indigo-100">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg">Résumé de l'analyse</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="bg-indigo-50 p-4 rounded-lg text-sm text-indigo-900 leading-relaxed italic border-l-4 border-indigo-400">
                                                "{seoAnalysis.analysis}"
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="font-bold text-sm flex items-center gap-2">
                                                    <ArrowUpRight className="w-4 h-4 text-green-500" /> Points d'amélioration :
                                                </h4>
                                                <ul className="grid grid-cols-1 gap-2">
                                                    {seoAnalysis.improvements.map((imp: string, i: number) =>
                        <li key={i} className="flex gap-2 text-sm text-slate-600 bg-white p-2 rounded border border-slate-100">
                                                            <ChevronRight className="w-4 h-4 text- indigo-400 shrink-0 mt-0.5" /> {imp}
                                                        </li>
                        )}
                                                </ul>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Card className="overflow-hidden">
                                            <div className="bg-slate-50 p-3 border-b flex justify-between items-center">
                                                <span className="text-xs font-bold uppercase text-slate-500">Titre Recommandé</span>
                                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleApplySEO('title')}>Appliquer</Button>
                                            </div>
                                            <CardContent className="p-4">
                                                <p className="font-bold text-proqblue">{seoAnalysis.meta_title}</p>
                                                <div className="mt-2 text-[10px] text-slate-400">
                                                    {seoAnalysis.meta_title.length} / 60 caractères
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card className="overflow-hidden">
                                            <div className="bg-slate-50 p-3 border-b flex justify-between items-center">
                                                <span className="text-xs font-bold uppercase text-slate-500">Meta Description</span>
                                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleApplySEO('description')}>Appliquer</Button>
                                            </div>
                                            <CardContent className="p-4">
                                                <p className="text-sm text-slate-600 leading-snug">{seoAnalysis.meta_description}</p>
                                                <div className="mt-2 text-[10px] text-slate-400">
                                                    {seoAnalysis.meta_description.length} / 160 caractères
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                {/* Right Column: Metrics */}
                                <div className="space-y-6">
                                    <Card className="text-center p-6 bg-white border-2 border-indigo-50 shadow-inner">
                                        <div className="relative inline-flex items-center justify-center mb-4">
                                            <svg className="w-32 h-32 transform -rotate-90">
                                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                                                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent"
                      strokeDasharray={364.4}
                      strokeDashoffset={364.4 - 364.4 * seoAnalysis.score / 100}
                      className={`${seoAnalysis.score >= 80 ? 'text-green-500' : seoAnalysis.score >= 50 ? 'text-yellow-500' : 'text-red-500'}`} />
                      
                                            </svg>
                                            <div className="absolute text-3xl font-black">{seoAnalysis.score}</div>
                                        </div>
                                        <CardTitle>Score Global</CardTitle>
                                        <CardDescription>Optimisation SEO</CardDescription>
                                    </Card>

                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm">Sémantique (LSI)</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2 text-xs">
                                                {seoAnalysis.keywords_suggested.map((kw: string, i: number) =>
                      <Badge key={i} variant="secondary" className="capitalize">#{kw}</Badge>
                      )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Alert className="bg-green-50 border-green-200">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <AlertTitle className="text-green-800 text-xs font-bold">Conseil d'Expert</AlertTitle>
                                        <AlertDescription className="text-green-700 text-[10px]">
                                            Utilisez les mots-clés ci-dessus dans vos titres H2 et H3 pour un meilleur référencement local.
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            </div>
            }
                    </div>
                </TabsContent>

                {/* SETTINGS TAB */}
                <TabsContent value="settings" className="flex-1 overflow-auto bg-slate-50/50 p-6 m-0 border rounded-md">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Paramètres de la Page</CardTitle>
                                <CardDescription>Modifiez les identifiants principaux de la page.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="page-title">Titre de la page</Label>
                                    <Input
                    id="page-title"
                    value={page.title}
                    onChange={(e) => setPage({ ...page, title: e.target.value })} />
                  
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="page-slug">Slug (URL)</Label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-2 rounded-l-md border border-r-0">/</span>
                                        <Input
                      id="page-slug"
                      value={page.slug}
                      onChange={(e) => setPage({ ...page, slug: e.target.value })}
                      className="rounded-l-none" />
                    
                                    </div>
                                    <p className="text-[10px] text-orange-600 mt-1 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        Attention: Si vous modifiez ce slug, mettez à jour le Menu correspondant.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>);

};