
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useLiveSettings } from "@/hooks/useLiveSettings";
import {
  ArrowRight, BadgeCheck, Brain,
  ShieldCheck, FileText, RotateCcw, Crown, Globe } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import YEAISenegal from "@/components/tools/YEAISenegal";
import VoltageDropCalculator from "@/components/tools/VoltageDropCalculator";
import { freeApps, premiumApps, appGroups } from "@/data/applications-catalog";

/**
 * TOOLS PLATFORM - HUB D'INGÉNIERIE SOUVERAIN
 * Design : Emeraude Profond (Yoombal style)
 * Doctrine : Subordination Normative Totale
 */
export default function ToolsPlatform() {
  const navigate = useNavigate();
  const { settings } = useLiveSettings();
  const [activeCategory, setActiveCategory] = useState<'free' | 'premium'>('free');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const pageData = settings?.page_sections?.outils;
  const heroData = pageData?.content?.hero;

  // Filtrer les apps selon la catégorie et le groupe actifs
  const getFilteredApps = (): ProquelecApp[] => {
    const apps = activeCategory === 'free' ? freeApps : premiumApps;
    if (activeGroup) {
      return apps.filter((app) => app.group === activeGroup);
    }
    return apps;
  };

  const currentGroups = activeCategory === 'free' ? appGroups.free : appGroups.premium;

  const handleAppClick = (app: ProquelecApp) => {
    if (app.status === 'coming') {
      // Pour les apps à venir, rediriger vers une page placeholder
      navigate(`/apps/${app.id}`);
      return;
    }

    // Apps actives avec logique spéciale
    switch (app.id) {
      case 'sovereign-ai':
        setActiveTool('sovereign-ai');
        break;
      case 'eng-calcs':
        setActiveTool('eng-calcs');
        break;
      case 'schema-modulaire':
        navigate('/rubrique-selector');
        break;
      case 'proquelec-docs':
        navigate('/office/document/new');
        break;
      case 'bibliotheque-normes':
        setActiveTool('sovereign-ai');
        break;
      default:
        if (app.route) {
          navigate(app.route);
        }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px] uppercase">Actif</Badge>;
      case 'coming':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[9px] uppercase">Bientôt</Badge>;
      case 'development':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[9px] uppercase">En Dev</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#071914] text-slate-100 selection:bg-emerald-500/30">
            <SEO
        title={heroData?.seo_title || "Plateforme d'Ingénierie Électrotechnique - PROQUELEC"}
        description={heroData?.seo_description || "Référentiel Officiel & Corpus Normatif Central. 40 applications pour professionnels et grand public."} />
      

            <Header />

            <main className="pt-20 md:pt-24">
                {/* HERO SECTION TYPE YOOMBAL */}
                <section className="relative overflow-hidden pt-8 pb-12 md:pt-16 md:pb-24 border-b border-emerald-900/50">
                    <div className="absolute top-0 right-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-emerald-600/10 blur-[100px] md:blur-[150px] -mr-48 md:-mr-96 -mt-48 md:-mt-96 rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-600/5 blur-[80px] md:blur-[120px] -ml-24 md:-ml-48 -mb-24 md:-mb-48 rounded-full pointer-events-none" />

                    <div className="container mx-auto px-4 md:px-6 relative z-10">
                        <div className="max-w-4xl">
                            <Badge className="mb-4 md:mb-6 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 md:px-4 py-1 md:py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.15em] md:tracking-[0.2em]">
                                {heroData?.features?.[0] || "40 Applications • Ingénierie Souveraine"}
                            </Badge>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black mb-4 md:mb-8 leading-[1.1] md:leading-[1.05] tracking-tight">
                                {heroData?.title?.split('Outils')?.[0]}Outils <br className="hidden sm:block" /><span className="text-emerald-400 italic">{heroData?.title?.split('Outils')?.[1]?.trim() || "Électriques."}</span>
                            </h1>
                            <p className="text-base md:text-xl text-slate-400 max-w-2xl leading-relaxed mb-6 md:mb-10 font-medium">
                                {heroData?.subtitle || "Accédez au Catalogue Complet PROQUELEC : outils gratuits, solutions premium et IA normative."}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                                <Button
                  onClick={() => {setActiveCategory('free');setActiveGroup(null);}}
                  className="h-12 md:h-14 px-6 md:px-10 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl md:rounded-2xl shadow-2xl shadow-emerald-500/20 transition-all active:scale-95 text-base md:text-lg w-full sm:w-auto">
                  
                                    <Globe className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                                    Outils Gratuits
                                </Button>
                                <Button
                  onClick={() => {setActiveCategory('premium');setActiveGroup(null);}}
                  variant="outline"
                  className="h-12 md:h-14 px-6 md:px-10 border-amber-500/50 bg-amber-900/20 text-amber-400 hover:bg-amber-800/40 rounded-xl md:rounded-2xl font-bold text-base md:text-lg w-full sm:w-auto">
                  
                                    <Crown className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                                    Premium Pro
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ZONE DE RENDU : HUB OU OUTIL SPÉCIFIQUE */}
                <section className="py-12 md:py-24 container mx-auto px-4 md:px-6">
                    {activeTool === 'sovereign-ai' ?
          <div className="space-y-8">
                            <button
              onClick={() => setActiveTool(null)}
              className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors">
              
                                <RotateCcw className="w-4 h-4" /> Retour au Hub
                            </button>
                            <YEAISenegal />
                        </div> :
          activeTool === 'eng-calcs' ?
          <div className="space-y-8">
                            <button
              onClick={() => setActiveTool(null)}
              className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors">
              
                                <RotateCcw className="w-4 h-4" /> Retour au Hub
                            </button>
                            <VoltageDropCalculator />
                        </div> :

          <>
                            {/* Header avec onglets */}
                            <div className="flex flex-col gap-4 md:gap-8 mb-8 md:mb-12">
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 md:gap-8">
                                    <div className="max-w-xl">
                                        <h2 className="text-2xl md:text-3xl font-black mb-2 md:mb-4">
                                            {activeCategory === 'free' ?
                    <>Applications <span className="text-emerald-400">Gratuites</span></> :

                    <>Solutions <span className="text-amber-400">Premium</span></>
                    }
                                        </h2>
                                        <p className="text-sm md:text-base text-slate-400 font-medium">
                                            {activeCategory === 'free' ?
                    "Outils de sensibilisation et d'éducation pour le grand public." :
                    "Outils professionnels certifiés pour électriciens et bureaux d'études."}
                                        </p>
                                    </div>

                                    <div className="flex w-full sm:w-auto bg-emerald-900/30 p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-emerald-800/30">
                                        <button
                    onClick={() => {setActiveCategory('free');setActiveGroup(null);}}
                    className={`flex-1 sm:flex-none px-4 md:px-8 py-2.5 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-1.5 md:gap-2 ${activeCategory === 'free' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                    
                                            <Globe className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                            <span className="hidden xs:inline">GRATUIT</span><span className="xs:hidden">Gratuit</span> ({freeApps.length})
                                        </button>
                                        <button
                    onClick={() => {setActiveCategory('premium');setActiveGroup(null);}}
                    className={`flex-1 sm:flex-none px-4 md:px-8 py-2.5 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-1.5 md:gap-2 ${activeCategory === 'premium' ? 'bg-amber-400 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                    
                                            <Crown className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                            <span className="hidden xs:inline">PREMIUM</span><span className="xs:hidden">Premium</span> ({premiumApps.length})
                                        </button>
                                    </div>
                                </div>

                                {/* Filtres par groupe */}
                                <div className="flex flex-wrap gap-1.5 md:gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                                    <button
                  onClick={() => setActiveGroup(null)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${!activeGroup ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white bg-slate-800/50'}`}>
                  
                                        Tous
                                    </button>
                                    {currentGroups.map((group) =>
                <button
                  key={group}
                  onClick={() => setActiveGroup(group)}
                  className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${activeGroup === group ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white bg-slate-800/50'}`} aria-label="Action">
                  
                                            {group}
                                        </button>
                )}
                                </div>
                            </div>

                            {/* Grille des applications */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                {getFilteredApps().map((app) =>
              <Card
                key={app.id}
                onClick={() => handleAppClick(app)}
                className={`group bg-[#0d2a21]/40 border-emerald-900/40 hover:border-emerald-500/40 active:border-emerald-500/60 rounded-2xl md:rounded-[2rem] shadow-xl transition-all duration-300 md:duration-500 overflow-hidden relative cursor-pointer touch-manipulation ${app.status === 'coming' ? 'opacity-70' : ''}`}>
                
                                        {/* Glow effect on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                        <CardContent className="p-4 md:p-6 relative z-10 flex flex-col h-full min-h-[220px] md:min-h-[280px]">
                                            <div className="flex items-start justify-between mb-3 md:mb-4">
                                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 ${activeCategory === 'premium' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                                                    <app.icon className={`w-5 h-5 md:w-6 md:h-6 ${activeCategory === 'premium' ? 'text-amber-400' : 'text-emerald-400'}`} />
                                                </div>
                                                {getStatusBadge(app.status)}
                                            </div>

                                            <div className="mb-2 md:mb-3">
                                                {app.norme &&
                    <span className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-emerald-500/60 block mb-0.5 md:mb-1">
                                                        {app.norme}
                                                    </span>
                    }
                                                <h3 className="text-base md:text-lg font-black text-white group-hover:text-emerald-300 transition-colors leading-tight">
                                                    {app.title}
                                                </h3>
                                            </div>

                                            <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed flex-1 line-clamp-3 md:line-clamp-none">
                                                {app.description}
                                            </p>

                                            <div className="mt-3 md:mt-4 pt-3 md:pt-4 flex items-center justify-between border-t border-emerald-900/50">
                                                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                    {app.group}
                                                </span>
                                                <button className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-slate-300 hover:text-white transition-colors group/btn" aria-label="Action">
                                                    {app.status === 'coming' ? 'Bientôt' : 'Accéder'}
                                                    <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        </CardContent>
                                    </Card>
              )}
                            </div>

                            {/* Compteur */}
                            <div className="mt-12 text-center">
                                <p className="text-slate-500 text-sm">
                                    <span className="text-emerald-400 font-bold">{getFilteredApps().filter((a) => a.status === 'active').length}</span> actives •
                                    <span className="text-amber-400 font-bold ml-2">{getFilteredApps().filter((a) => a.status === 'coming').length}</span> en développement
                                </p>
                            </div>
                        </>
          }
                </section>

                {/* SECTION CHARTE SOUS LE HUB */}
                <section className="bg-emerald-500/5 border-y border-emerald-900/50 py-10 md:py-20 mt-8 md:mt-12">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12">
                            <div className="space-y-2 md:space-y-4">
                                <div className="p-2 md:p-3 bg-emerald-500/20 w-fit rounded-lg md:rounded-xl border border-emerald-500/30">
                                    <BadgeCheck className="text-emerald-400 w-4 h-4 md:w-6 md:h-6" />
                                </div>
                                <h4 className="font-black text-sm md:text-lg">40 Applications</h4>
                                <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">Catalogue complet d'outils pour électriciens et grand public.</p>
                            </div>
                            <div className="space-y-2 md:space-y-4">
                                <div className="p-2 md:p-3 bg-blue-500/20 w-fit rounded-lg md:rounded-xl border border-blue-500/30">
                                    <Brain className="text-blue-400 w-4 h-4 md:w-6 md:h-6" />
                                </div>
                                <h4 className="font-black text-sm md:text-lg">IA Subordonnée</h4>
                                <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">Notre IA cite la norme, l'article et le chapitre.</p>
                            </div>
                            <div className="space-y-2 md:space-y-4">
                                <div className="p-2 md:p-3 bg-amber-500/20 w-fit rounded-lg md:rounded-xl border border-amber-500/30">
                                    <ShieldCheck className="text-amber-400 w-4 h-4 md:w-6 md:h-6" />
                                </div>
                                <h4 className="font-black text-sm md:text-lg">Sécurité Humaine</h4>
                                <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">Calculs certifiants réservés aux professionnels.</p>
                            </div>
                            <div className="space-y-2 md:space-y-4">
                                <div className="p-2 md:p-3 bg-slate-500/20 w-fit rounded-lg md:rounded-xl border border-slate-500/30">
                                    <FileText className="text-slate-400 w-4 h-4 md:w-6 md:h-6" />
                                </div>
                                <h4 className="font-black text-sm md:text-lg">Souveraineté</h4>
                                <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">Toutes les données restent au Sénégal.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>);

}