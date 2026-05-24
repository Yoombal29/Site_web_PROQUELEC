
import React, { useState, useEffect } from "react";
import {
  Layout,
  Layers,
  Palette,
  Settings,
  Eye,
  RotateCcw,
  Smartphone,
  Tablet,
  Monitor,
  Plus,
  Search,

  Lock,
  Zap,
  Move,
  Trash2,
  ArrowUp,
  ArrowDown,
  Clock,
  Sparkles,
  Wand2,
  ImagePlus,
  Languages,
  SearchCode,
  Cpu,
  HelpCircle,


  ExternalLink,
  BookOpen } from
"lucide-react";
import { aiMaster } from "@/lib/ai-master";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { DynamicPageRenderer } from "@/components/DynamicPageRenderer";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const FieldHelp = ({ title, description }: {title: string;description: string;}) =>
<TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <HelpCircle className="w-3 h-3 text-slate-600 hover:text-orange-400 cursor-help transition-colors" />
            </TooltipTrigger>
            <TooltipContent className="bg-slate-900 border-slate-800 text-white p-3 max-w-[250px] rounded-xl shadow-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-1">{title}</p>
                <p className="text-[11px] leading-relaxed opacity-80">{description}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>;


export const AdminUniversalDashboard = () => {
  const { schema, save, isLoading, isSaving } = useSiteConfig();
  const [selectedPage, setSelectedPage] = useState("home");
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [viewport, setViewport] = useState<"mobile" | "tablet" | "desktop">("desktop");

  useEffect(() => {
    if (schema?.pages?.length > 0) {
      const pageExists = schema.pages.some((p) => p.id === selectedPage);
      if (!pageExists) setSelectedPage(schema.pages[0].id);
    }
  }, [schema, selectedPage]);

  if (isLoading || !schema) return <div className="p-12 text-center text-slate-500 animate-pulse">Initialisation du système de contrôle absolu...</div>;

  const currentPage = schema.pages.find((p) => p.id === selectedPage) || schema.pages[0];
  const selectedComp = currentPage.layout.find((c) => c.id === selectedElement);

  const handleAddSection = () => {
    const newSection: ComponentConfig = {
      id: `section-${Date.now()}`,
      type: "NewSection",
      settings: { title: "Nouvelle Section" },
      styles: { padding: "4rem", backgroundColor: "#ffffff" }
    };
    const updated = { ...schema };
    const pageIndex = updated.pages.findIndex((p) => p.id === selectedPage);

    if (pageIndex === -1) {
      toast.error("Veuillez sélectionner une page valide");
      return;
    }

    if (!updated.pages[pageIndex].layout) updated.pages[pageIndex].layout = [];
    updated.pages[pageIndex].layout.push(newSection);
    save(updated);
  };

  const handleUpdateStyle = (id: string, property: string, value: unknown) => {
    const updated = { ...schema };
    const pageIndex = updated.pages.findIndex((p) => p.id === selectedPage);
    const compIndex = updated.pages[pageIndex].layout.findIndex((c) => c.id === id);

    if (compIndex > -1) {
      updated.pages[pageIndex].layout[compIndex].styles = {
        ...(updated.pages[pageIndex].layout[compIndex].styles || {}),
        [property]: value
      };
      save(updated);
    }
  };

  const handleDeleteComp = (id: string) => {
    if (!confirm("Supprimer ce composant ?")) return;
    const updated = { ...schema };
    const pageIndex = updated.pages.findIndex((p) => p.id === selectedPage);
    updated.pages[pageIndex].layout = updated.pages[pageIndex].layout.filter((c) => c.id !== id);
    setSelectedElement(null);
    save(updated);
  };

  const handleMoveComp = (id: string, direction: 'up' | 'down') => {
    const updated = { ...schema };
    const pageIndex = updated.pages.findIndex((p) => p.id === selectedPage);
    const layout = updated.pages[pageIndex].layout;
    const index = layout.findIndex((c) => c.id === id);

    if (direction === 'up' && index > 0) {
      [layout[index], layout[index - 1]] = [layout[index - 1], layout[index]];
    } else if (direction === 'down' && index < layout.length - 1) {
      [layout[index], layout[index + 1]] = [layout[index + 1], layout[index]];
    }

    save(updated);
  };

  const handleUpdateSetting = (id: string, property: string, value: unknown) => {
    const updated = { ...schema };
    const pageIndex = updated.pages.findIndex((p) => p.id === selectedPage);
    const compIndex = updated.pages[pageIndex].layout.findIndex((c) => c.id === id);

    if (compIndex > -1) {
      updated.pages[pageIndex].layout[compIndex].settings = {
        ...(updated.pages[pageIndex].layout[compIndex].settings || {}),
        [property]: value
      };
      save(updated);
    }
  };

  const handleUpdateGlobal = (section: 'header' | 'footer', property: string, value: unknown) => {
    const updated = { ...schema };
    if (!updated.globals) {
      updated.globals = { header: {}, footer: {} };
    }
    updated.globals[section] = {
      ...(updated.globals[section] || {}),
      [property]: value
    };
    save(updated);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] bg-slate-900 text-slate-300 overflow-hidden rounded-xl border border-slate-800 shadow-2xl font-sans">
            {/* Top Toolbar */}
            <header className="h-14 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-950/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <Badge variant="outline" className="border-orange-500/50 text-orange-500 bg-orange-500/5 px-2 py-1">
                        <Zap className="w-3 h-3 mr-1 fill-orange-500" /> CONTRÔLE ABSOLU V1
                    </Badge>
                    <Separator orientation="vertical" className="h-4 bg-slate-800" />
                    <select
          id="page-selector"
          className="bg-transparent text-sm font-semibold text-slate-200 outline-none cursor-pointer"
          value={selectedPage}
          onChange={(e) => setSelectedPage(e.target.value)}
          aria-label="Sélectionner la page à éditer"
          title="Sélecteur de page">
            
                        {schema.pages.map((p) => <option key={p.id} value={p.id} className="bg-slate-900">{p.title}</option>)}
                    </select>
                </div>

                <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800">
                    <Button
            variant="ghost"
            size="sm"
            className={`h-7 w-9 p-0 ${viewport === "mobile" ? "bg-slate-800 text-orange-500 shadow-lg" : "text-slate-500"}`}
            onClick={() => setViewport("mobile")}>
            
                        <Smartphone className="w-4 h-4" />
                    </Button>
                    <Button
            variant="ghost"
            size="sm"
            className={`h-7 w-9 p-0 ${viewport === "tablet" ? "bg-slate-800 text-orange-500 shadow-lg" : "text-slate-500"}`}
            onClick={() => setViewport("tablet")}>
            
                        <Tablet className="w-4 h-4" />
                    </Button>
                    <Button
            variant="ghost"
            size="sm"
            className={`h-7 w-9 p-0 ${viewport === "desktop" ? "bg-slate-800 text-orange-500 shadow-lg" : "text-slate-500"}`}
            onClick={() => setViewport("desktop")}>
            
                        <Monitor className="w-4 h-4" />
                    </Button>
                    <Separator orientation="vertical" className="mx-1 h-4 bg-slate-700" />
                    <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-[9px] font-black text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
            onClick={async () => {
              toast.info("IA Maître : Optimisation globale pour " + viewport + "...");
              const res = await aiMaster.process({ task: 'seo', device: viewport as unknown });
              toast.success("Design optimisé pour " + viewport);
            }}>
            
                        <Sparkles className="w-3.5 h-3.5 mr-1" /> OPTIMISER {viewport.toUpperCase()}
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-100"
            onClick={() => toast.info("Historique des versions : Bientôt disponible")}>
            
                        <RotateCcw className="w-4 h-4 mr-2" /> Historique
                    </Button>
                    <Button
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-slate-100"
            onClick={() => window.open('/', '_blank')}>
            
                        <Eye className="w-4 h-4 mr-2" /> Prévisualiser
                    </Button>
                    <Button
            disabled={isSaving}
            className="bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-lg shadow-orange-900/40 border-b-2 border-orange-800 active:scale-95 transition-transform"
            onClick={() => {
              toast.promise(save(schema), {
                loading: 'Diffusion sur le CDN global...',
                success: 'Site en ligne et performant !',
                error: (err) => `Erreur : ${err.message}`
              });
            }}>
            
                        {isSaving ? "Synchronisation..." : "Diffuser en Production"}
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Navigator & Assets */}
                <aside className="w-64 border-r border-slate-800 flex flex-col bg-slate-950/30">
                    <Tabs defaultValue="layers" className="flex-1 flex flex-col">
                        <TabsList className="bg-transparent border-b border-slate-800 rounded-none h-12 justify-start px-2 gap-2">
                            <TabsTrigger value="layers" className="data-[state=active]:bg-slate-800 data-[state=active]:text-orange-400 text-xs px-2">
                                <Layers className="w-3.5 h-3.5 mr-1" /> Structure
                            </TabsTrigger>
                            <TabsTrigger value="globals" className="data-[state=active]:bg-slate-800 data-[state=active]:text-orange-400 text-xs px-2">
                                <Monitor className="w-3.5 h-3.5 mr-1" /> Globaux
                            </TabsTrigger>
                            <TabsTrigger value="assets" className="data-[state=active]:bg-slate-800 data-[state=active]:text-orange-400 text-xs px-2">
                                <Plus className="w-3.5 h-3.5 mr-1" /> Blocs
                            </TabsTrigger>
                            <TabsTrigger value="intelligence" className="data-[state=active]:bg-slate-800 data-[state=active]:text-orange-400 text-xs px-2">
                                <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-400" /> Intelligence
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="intelligence" className="flex-1 m-0 p-4 space-y-6 overflow-y-auto">
                            <div className="space-y-4">
                                <header className="space-y-1">
                                    <h3 className="text-sm font-black text-slate-100 uppercase bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">AI Maître Hub</h3>
                                    <p className="text-[10px] text-slate-500 italic">Contrôle absolu des outils IA intégrés</p>
                                </header>

                                <Separator className="bg-slate-800" />

                                {/* SEO Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-[9px]">
                                        <SearchCode className="w-3 h-3 text-blue-400" /> SEO & Audit (Semrush)
                                    </div>
                                    <Button
                    variant="outline"
                    className="w-full h-10 text-[10px] bg-slate-900/50 border-slate-800 hover:text-blue-400 font-bold"
                    onClick={async () => {
                      toast.loading("Génération du rapport Semrush...");
                      const res = await aiMaster.process({ task: 'seo' });
                      toast.dismiss();
                      if (res.success) toast.success("Rapport SEO généré avec un score de " + res.data.score);
                    }}>
                    
                                        LANCER AUDIT COMPLET
                                    </Button>
                                </div>

                                {/* Content Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-[9px]">
                                        <Wand2 className="w-3 h-3 text-purple-400" /> Rédaction (Rytr/WriteSonic)
                                    </div>
                                    <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                                        <p className="text-[10px] text-slate-500 font-medium">Assistant de stratégie éditoriale</p>
                                        <Button size="sm" className="w-full h-8 text-[10px] bg-purple-600 hover:bg-purple-500">Planifier 10 articles</Button>
                                    </div>
                                </div>

                                {/* Engagement Section */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-[9px]">
                                        <Cpu className="w-3 h-3 text-green-400" /> Engagement (Easy-Peasy AI)
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800/50">
                                            <span className="text-[10px]">AI Chatbot</span>
                                            <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 text-[8px] cursor-pointer">ACTIF</Badge>
                                        </div>
                                        <div className="flex items-center justify-between p-2 rounded bg-slate-900/50 border border-slate-800/50">
                                            <span className="text-[10px]">WhatsApp Auto</span>
                                            <Badge variant="outline" className="text-slate-500 text-[8px]">OFF</Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Multi-language */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-[9px]">
                                        <Languages className="w-3 h-3 text-orange-400" /> Site Multilingue (DeepL)
                                    </div>
                                    <Button variant="ghost" className="w-full h-8 text-[10px] text-orange-400 hover:bg-orange-500/10 border border-orange-500/20">
                                        TRADUIRE TOUT LE SITE
                                    </Button>
                                    <p className="text-[9px] text-center text-slate-600 italic">Dernière synchro: Jamais</p>
                                </div>

                                <Separator className="bg-slate-800" />

                                {/* API Configuration Hub */}
                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-[9px]">
                                        <Lock className="w-3 h-3 text-slate-500" /> Configuration APIs
                                    </div>
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <Label className="text-[9px] text-slate-600 uppercase">Clé OpenAI / Rytr</Label>
                                            <Input type="password" placeholder="sk-..." className="h-7 text-[10px] bg-slate-900 border-slate-800 focus:border-purple-500 transition-colors" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[9px] text-slate-600 uppercase">Clé DeepL Pro</Label>
                                            <Input type="password" placeholder="Key..." className="h-7 text-[10px] bg-slate-900 border-slate-800 focus:border-orange-500 transition-colors" />
                                        </div>
                                        <Button variant="outline" className="w-full h-8 text-[9px] border-slate-800 hover:bg-slate-800 text-slate-400">
                                            SAUVEGARDER LES CLÉS
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="globals" className="flex-1 m-0 p-4 space-y-4">
                            <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                                PARAMÈTRES GÉNÉRAUX
                            </div>
                            <section className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-400 font-bold">Header (En-tête)</Label>
                                    <Input
                    placeholder="Couleur de fond"
                    className="h-8 text-[10px] bg-slate-900 border-slate-800"
                    defaultValue={schema.globals?.header?.backgroundColor}
                    onBlur={(e) => handleUpdateGlobal('header', 'backgroundColor', e.target.value)} />
                  
                                    <Input
                    placeholder="Texte Promo / News"
                    className="h-8 text-[10px] bg-slate-900 border-slate-800"
                    defaultValue={schema.globals?.header?.promoText}
                    onBlur={(e) => handleUpdateGlobal('header', 'promoText', e.target.value)} />
                  
                                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                                        <div className="space-y-1">
                                            <Label htmlFor="promo-bg-color" className="text-slate-500 font-bold uppercase text-[9px]">Fond Promo</Label>
                                            <Input
                        id="promo-bg-color"
                        type="color"
                        title="Couleur de fond promotionnelle"
                        className="h-7 p-0 border-0 bg-transparent"
                        defaultValue={schema.globals?.header?.promoBgColor || "#ea580c"}
                        onChange={(e) => handleUpdateGlobal('header', 'promoBgColor', e.target.value)} />
                      
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-slate-500 font-bold uppercase text-[9px]">Couleur Texte</span>
                                            <Input
                        type="color"
                        className="h-7 p-0 border-0 bg-transparent"
                        defaultValue={schema.globals?.header?.textColor || "#ffffff"}
                        onChange={(e) => handleUpdateGlobal('header', 'textColor', e.target.value)} />
                      
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                                        <div className="space-y-1">
                                            <span className="text-slate-500 font-bold uppercase text-[9px]">Hauteur (px)</span>
                                            <Input
                        type="text"
                        className="h-7 p-1 text-[10px] bg-slate-900 border-slate-800"
                        placeholder="80px"
                        defaultValue={schema.globals?.header?.height || "100px"}
                        onBlur={(e) => handleUpdateGlobal('header', 'height', e.target.value)} />
                      
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-slate-500 font-bold uppercase text-[9px]">Bordure</span>
                                            <Input
                        type="color"
                        className="h-7 p-0 border-0 bg-transparent"
                        defaultValue={schema.globals?.header?.borderColor || "rgba(255,255,255,0.1)"}
                        onChange={(e) => handleUpdateGlobal('header', 'borderColor', e.target.value)} />
                      
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase">Effet Verre</span>
                                        <input
                      type="checkbox"
                      title="Activer l'effet de verre dépoli"
                      className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-800 text-orange-500"
                      checked={schema.globals?.header?.glassmorphism !== false}
                      onChange={(e) => handleUpdateGlobal('header', 'glassmorphism', e.target.checked)} />
                    
                                    </div>
                                </div>
                                <Separator className="bg-slate-800" />
                                <div className="space-y-2">
                                    <Label className="text-xs text-slate-400 font-bold">Design Global (Thème)</Label>
                                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                                        <div className="space-y-1">
                                            <span>Primaire</span>
                                            <Input type="color" className="h-8 p-0 border-0 bg-transparent" defaultValue={schema.theme.primary} onBlur={(e) => {
                        const updated = { ...schema };
                        updated.theme.primary = e.target.value;
                        save(updated);
                      }} />
                                        </div>
                                        <div className="space-y-1">
                                            <span>Radius</span>
                                            <Input className="h-8 bg-slate-900 border-slate-800" defaultValue={schema.theme.radius} onBlur={(e) => {
                        const updated = { ...schema };
                        updated.theme.radius = e.target.value;
                        save(updated);
                      }} />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </TabsContent>

                        <TabsContent value="layers" className="flex-1 m-0 p-0 overflow-hidden">
                            <ScrollArea className="h-[calc(100vh-200px)] px-3 py-4">
                                <div className="space-y-1">
                                    <div className="flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-1">
                                        ARBORESCENCE DU DOM
                                    </div>
                                    {currentPage.layout.map((comp) =>
                  <div
                    key={comp.id}
                    onClick={() => setSelectedElement(comp.id)}
                    className={`flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer transition-colors group ${selectedElement === comp.id ? 'bg-orange-600/20 text-orange-400 border border-orange-500/20 shadow-[0_0_15px_rgba(234,88,12,0.1)]' : 'hover:bg-slate-800'}`}>
                    
                                            <div className="flex flex-col gap-0.5 opacity-40 group-hover:opacity-100 mr-1">
                                                <ArrowUp className="w-2.5 h-2.5 hover:text-orange-400" onClick={(e) => {e.stopPropagation();handleMoveComp(comp.id, 'up');}} />
                                                <ArrowDown className="w-2.5 h-2.5 hover:text-orange-400" onClick={(e) => {e.stopPropagation();handleMoveComp(comp.id, 'down');}} />
                                            </div>
                                            <span className="text-sm font-medium">{comp.type}</span>
                                            <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button title="Supprimer" aria-label="Supprimer le composant" variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-500" onClick={(e) => {e.stopPropagation();handleDeleteComp(comp.id);}}>
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                  )}
                                    <Button variant="ghost" className="w-full justify-start text-xs border border-dashed border-slate-700 mt-6 h-10 hover:border-orange-500/50 hover:bg-orange-500/5 text-slate-500 hover:text-orange-500" onClick={handleAddSection}>
                                        <Plus className="w-4 h-4 mr-2" /> Insérer une section
                                    </Button>
                                </div>
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="assets" className="flex-1 m-0 p-4">
                            <div className="grid grid-cols-2 gap-2">
                                {['HeroBanner', 'StatsSection', 'ServicesGrid', 'Form', 'Bento', 'Gallery'].map((type) =>
                <div
                  key={type}
                  className="flex flex-col items-center justify-center p-3 border border-slate-800 bg-slate-900 rounded-xl hover:border-orange-500 transition-colors cursor-pointer"
                  onClick={() => {
                    const newSection: ComponentConfig = {
                      id: `${type.toLowerCase()}-${Date.now()}`,
                      type: type,
                      settings: { title: `Nouveau ${type}` },
                      styles: { padding: "4rem" }
                    };
                    const updated = { ...schema };
                    const pageIndex = updated.pages.findIndex((p) => p.id === selectedPage);

                    if (pageIndex > -1) {
                      if (!updated.pages[pageIndex].layout) updated.pages[pageIndex].layout = [];
                      updated.pages[pageIndex].layout.push(newSection);
                      save(updated);
                      toast.success(`${type} ajouté`);
                    } else {
                      toast.error("Impossible d'ajouter : page non trouvée");
                    }
                  }}>
                  
                                        <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center mb-2 shadow-inner">
                                            <Layout className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase text-slate-500">{type}</span>
                                    </div>
                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </aside>

                {/* Main Canvas (Visual Preview) */}
                <main className="flex-1 bg-slate-950 p-8 flex flex-col items-center overflow-auto ring-1 ring-inset ring-slate-800 scrollbar-hide">
                    <div
            className={`bg-white transition-all duration-500 shadow-[0_40px_100px_rgba(0,0,0,0.5)] min-h-full rounded-t-lg relative ${viewport === "mobile" ? "w-[375px]" : viewport === "tablet" ? "w-[768px]" : "w-full"}`}>
            
                        <div
              className="w-full h-full relative cursor-default"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                const compElement = target.closest('[id]');
                if (compElement) {
                  setSelectedElement(compElement.id);
                }
              }}>
              
                            <DynamicPageRenderer layout={currentPage.layout} />
                        </div>

                        {selectedElement &&
            <div className="absolute inset-0 z-50 pointer-events-none ring-2 ring-orange-500 ring-offset-2 ring-offset-slate-950/50">
                                <div className="absolute top-0 right-0 bg-orange-600 text-[10px] font-black text-white px-3 py-1.5 rounded-bl-lg shadow-2xl flex items-center gap-2">
                                    <Move className="w-3 h-3" /> ÉDITION ACTIVE
                                </div>
                            </div>
            }
                    </div>
                </main>

                {/* Right Sidebar: Inspector */}
                <aside className="w-80 border-l border-slate-800 flex flex-col bg-slate-950/30">
                    <header className="h-12 border-b border-slate-800 flex items-center bg-slate-950/50 px-4 gap-2">
                        <Settings className="w-4 h-4 text-orange-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-slate-100">Inspecteur Atomique</span>
                    </header>

                    <ScrollArea className="flex-1">
                        {selectedComp ?
            <div className="p-4 space-y-6">
                                <div className="space-y-4 border-b border-slate-800 pb-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</Label>
                                            <FieldHelp title="Type de Bloc" description="Définit la structure fondamentale du composant. Chaque type possède ses propres capacités d'affichage." />
                                        </div>
                                        <Badge variant="outline" className="bg-slate-900 text-[10px] border-slate-700">{selectedComp.type}</Badge>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-xs font-bold text-slate-200">Conditions d'affichage</Label>
                                            <FieldHelp title="Visibilité" description="Public: Visible par tout le monde. Privé: Masqué sur le site public, visible uniquement dans cet éditeur." />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button variant="outline" size="sm" className="text-[10px] bg-slate-900 border-slate-800 hover:bg-orange-500/10 active:bg-orange-500/20">Public</Button>
                                            <Button variant="outline" size="sm" className="text-[10px] bg-slate-900 border-slate-800 hover:text-orange-500"><Lock className="w-3 h-3 mr-1" /> Privé</Button>
                                        </div>
                                    </div>
                                </div>

                                <section className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">
                                        <Palette className="w-3 h-3" /> Styles & Design
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Arrondi des bords (Radius)</Label>
                                                <FieldHelp title="Bordure" description="Valeur en pixels (ex: 20px). Plus la valeur est haute, plus les coins sont arrondis." />
                                            </div>
                                            <Input
                      className="h-9 text-xs bg-slate-900 border-slate-800"
                      defaultValue={selectedComp.styles?.borderRadius || "0px"}
                      onBlur={(e) => handleUpdateStyle(selectedComp.id, 'borderRadius', e.target.value)} />
                    
                                        </div>
                                        <div className="space-y-1.5 px-0.5">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Alignement du contenu</Label>
                                                <FieldHelp title="Alignement" description="Définit la position horizontale des éléments (texte, boutons) à l'intérieur de la section." />
                                            </div>
                                            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                                                <Button size="sm" variant="ghost" className={`flex-1 h-7 text-[10px] ${selectedComp.styles?.textAlign === 'left' || !selectedComp.styles?.textAlign ? 'bg-slate-800 text-orange-400' : 'text-slate-500'}`} onClick={() => handleUpdateStyle(selectedComp.id, 'textAlign', 'left')}>Gauche</Button>
                                                <Button size="sm" variant="ghost" className={`flex-1 h-7 text-[10px] ${selectedComp.styles?.textAlign === 'center' ? 'bg-slate-800 text-orange-400' : 'text-slate-500'}`} onClick={() => handleUpdateStyle(selectedComp.id, 'textAlign', 'center')}>Centre</Button>
                                                <Button size="sm" variant="ghost" className={`flex-1 h-7 text-[10px] ${selectedComp.styles?.textAlign === 'right' ? 'bg-slate-800 text-orange-400' : 'text-slate-500'}`} onClick={() => handleUpdateStyle(selectedComp.id, 'textAlign', 'right')}>Droite</Button>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Couleur du fond</Label>
                                                <FieldHelp title="Couleur de Fond" description="Couleur de l'arrière-plan de la section. Utilisez des couleurs claires ou foncées selon la visibilité du texte." />
                                            </div>
                                            <div className="flex gap-2">
                                                <Input
                        type="color"
                        className="w-12 h-9 p-1 bg-slate-900 border-slate-800 rounded cursor-pointer"
                        value={selectedComp.styles?.backgroundColor || "#ffffff"}
                        onChange={(e) => handleUpdateStyle(selectedComp.id, 'backgroundColor', e.target.value)} />
                      
                                                <Input
                        className="h-9 text-xs bg-slate-900 border-slate-800 flex-1"
                        value={selectedComp.styles?.backgroundColor || "#ffffff"}
                        onBlur={(e) => handleUpdateStyle(selectedComp.id, 'backgroundColor', e.target.value)} />
                      
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Couleur du texte</Label>
                                                <FieldHelp title="Couleur Typographique" description="Définit la couleur par défaut de tous les textes non-spécifiques dans le bloc." />
                                            </div>
                                            <div className="flex gap-2">
                                                <Input
                        type="color"
                        title="Sélecteur de couleur du texte"
                        className="w-12 h-9 p-1 bg-slate-900 border-slate-800 rounded cursor-pointer"
                        value={selectedComp.styles?.color || "#1f2937"}
                        onChange={(e) => handleUpdateStyle(selectedComp.id, 'color', e.target.value)} />
                      
                                                <Input
                        className="h-9 text-xs bg-slate-900 border-slate-800 flex-1"
                        title="Code hexadécimal de la couleur du texte"
                        value={selectedComp.styles?.color || "#1f2937"}
                        onBlur={(e) => handleUpdateStyle(selectedComp.id, 'color', e.target.value)} />
                      
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Taille du texte (px/rem)</Label>
                                                <FieldHelp title="Échelle Texte" description="Grandeur de la police. Utilisez 'rem' pour un design adaptatif ou 'px' pour une précision fixe." />
                                            </div>
                                            <Input
                      className="h-9 text-xs bg-slate-900 border-slate-800"
                      defaultValue={selectedComp.styles?.fontSize || "1rem"}
                      onBlur={(e) => handleUpdateStyle(selectedComp.id, 'fontSize', e.target.value)} />
                    
                                        </div>
                                    </div>
                                </section>

                                {/* QUICK GUIDE RUBRIC */}
                                <Separator className="bg-slate-800" />
                                <section className="space-y-3 pb-8">
                                    <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        <BookOpen className="w-3 h-3" /> Guide de Survie Expert
                                    </h4>
                                    <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-4 space-y-3">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-orange-400 uppercase">1. Sélection</p>
                                            <p className="text-[11px] text-slate-400">Cliquez sur un bloc dans le panneau central pour l'activer.</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-orange-400 uppercase">2. Configuration</p>
                                            <p className="text-[11px] text-slate-400">Modifiez les styles ici. Tout est sauvegardé en direct.</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-orange-400 uppercase">3. Publier</p>
                                            <p className="text-[11px] text-slate-400">N'oubliez pas d'utiliser le bouton de sauvegarde global en haut de page.</p>
                                        </div>
                                        <Button variant="ghost" className="w-full justify-start h-8 p-0 text-xs text-orange-400 hover:text-orange-300 hover:bg-transparent">
                                            <ExternalLink className="w-3 h-3 mr-2" /> Documentation Complète
                                        </Button>
                                    </div>
                                </section>

                                {selectedComp.type === 'HeroBanner' &&
              <section className="space-y-4 pt-4 border-t border-slate-800">
                                        <h4 className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                                            <Clock className="w-3 h-3" /> Paramètres Hero
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[10px] text-slate-500 font-bold uppercase">Effet Parallax</Label>
                                                <input
                      type="checkbox"
                      title="Activer l'effet Parallax"
                      className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-orange-500"
                      checked={selectedComp.settings?.parallax !== false}
                      onChange={(e) => handleUpdateSetting(selectedComp.id, 'parallax', e.target.checked)} />
                    
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Vitesse de défilement (ms)</Label>
                                                <Input
                      type="number"
                      step="500"
                      className="h-9 text-xs bg-slate-900 border-slate-800"
                      defaultValue={selectedComp.settings?.autoplayInterval || 8000}
                      onBlur={(e) => handleUpdateSetting(selectedComp.id, 'autoplayInterval', parseInt(e.target.value))} />
                    
                                            </div>
                                            <p className="text-[10px] text-slate-500 italic">Valeur recommandée: 5000ms pour une lecture rapide, 10000ms pour du contenu dense.</p>
                                        </div>
                                    </section>
              }

                                <Separator className="bg-slate-800/50" />

                                <section className="space-y-4 pt-2">
                                    <h4 className="flex items-center gap-2 text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">
                                        <Cpu className="w-3 h-3" /> IA MAÎTRE (Hub Central)
                                    </h4>

                                    <div className="space-y-4">
                                        {/* Image Generation */}
                                        <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[10px] text-purple-300 font-bold uppercase">Image (Firefly/Flux)</Label>
                                                <Badge variant="outline" className="text-[8px] border-purple-500/30 text-purple-400 capitalize">{viewport} optimized</Badge>
                                            </div>
                                            <Button
                      className="w-full h-9 text-[10px] bg-purple-600 hover:bg-purple-500 text-white font-bold gap-2 shadow-lg shadow-purple-900/20"
                      onClick={async () => {
                        toast.loading(`Génération d'un visuel ${viewport}...`);
                        const res = await aiMaster.process({
                          task: 'image',
                          device: viewport as unknown,
                          prompt: selectedComp.settings?.title || "Image de fond professionnelle"
                        });
                        toast.dismiss();
                        if (res.success) {
                          const urlProp = selectedComp.type === 'HeroBanner' ? 'imageUrl' : 'image';
                          handleUpdateSetting(selectedComp.id, urlProp, res.data.url);
                          toast.success("Image générée avec succès !");
                        }
                      }}>
                      
                                                <ImagePlus className="w-4 h-4" /> GÉNÉRER VISUEL {viewport === 'mobile' ? '9:16' : '16:9'}
                                            </Button>
                                        </div>

                                        {/* Content Refinement */}
                                        <div className="grid grid-cols-1 gap-2">
                                            <Button
                      variant="outline"
                      className="h-10 text-[10px] border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:text-purple-400 gap-2 font-bold justify-start px-3"
                      onClick={async () => {
                        const textToRefine = selectedComp.settings?.title || selectedComp.settings?.subtitle || "";
                        toast.loading("L'IA Rytr réécrit votre contenu...");
                        const res = await aiMaster.process({
                          task: 'text',
                          content: textToRefine,
                          device: viewport as unknown,
                          prompt: "Rendre ce titre plus accrocheur et professionnel"
                        });
                        toast.dismiss();
                        if (res.success) {
                          const prop = selectedComp.settings?.title ? 'title' : 'subtitle';
                          handleUpdateSetting(selectedComp.id, prop, res.data);
                          toast.success("Contenu optimisé !");
                        }
                      }}>
                      
                                                <Wand2 className="w-4 h-4 text-purple-400" /> RÉÉCRIRE POUR {viewport.toUpperCase()}
                                            </Button>

                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                        variant="outline"
                        className="h-9 text-[10px] border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:text-green-400 font-bold"
                        onClick={async () => {
                          toast.loading("Traduction DeepL en cours...");
                          const res = await aiMaster.process({ task: 'translation', content: selectedComp.settings?.title });
                          toast.dismiss();
                          if (res.success) handleUpdateSetting(selectedComp.id, 'title', res.data);
                        }}>
                        
                                                    <Languages className="w-3.5 h-3.5 mr-1 text-green-400" /> TRADUIRE
                                                </Button>
                                                <Button
                        variant="outline"
                        className="h-9 text-[10px] border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:text-blue-400 font-bold"
                        onClick={async () => {
                          const res = await aiMaster.process({ task: 'seo', content: selectedComp.settings?.title });
                          if (res.success) {
                            alert(`Analyse SEO (Semrush):\n\nScore: ${res.data.score}/100\nConseils: ${res.data.suggestions.join(', ')}`);
                          }
                        }}>
                        
                                                    <SearchCode className="w-3.5 h-3.5 mr-1 text-blue-400" /> AUDIT SEO
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <Separator className="bg-slate-800/50" />

                                <section className="space-y-4">
                                    <h4 className="flex items-center gap-2 text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">
                                        <Zap className="w-3 h-3" /> Logique Fonctionnelle
                                    </h4>
                                    <p className="text-[10px] text-slate-500 italic">Configurez les déclencheurs et les règles métier pour ce composant.</p>
                                    <Button variant="outline" className="w-full text-xs h-9 bg-slate-950 border-slate-800 hover:border-orange-500/50">
                                        Éditeur de Workflow JSON
                                    </Button>
                                </section>
                            </div> :

            <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-30 grayscale">
                                <Search className="w-12 h-12 mb-4" />
                                <p className="text-sm font-bold uppercase tracking-widest leading-loose">Sélectionnez un composant pour auditer ses propriétés atomiques</p>
                            </div>
            }
                    </ScrollArea>

                    <footer className="p-4 border-t border-slate-800 bg-slate-950/80">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                            <span>Moteur de Rendu</span>
                            <span className="text-emerald-500 flex items-center"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span> ACTIF</span>
                        </div>
                    </footer>
                </aside>
            </div>
        </div>);

};