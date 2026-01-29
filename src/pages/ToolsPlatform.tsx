
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import {
    Zap, ShieldCheck, Calculator, BookOpen,
    ArrowRight, Lock, Sparkles, Brain, Info,
    ChevronRight, BadgeCheck, FileText, Wrench, RotateCcw, Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SovereignAIEngine from "@/components/tools/SovereignAIEngine";
import YEAISenegal from "@/components/tools/YEAISenegal";
import VoltageDropCalculator from "@/components/tools/VoltageDropCalculator";

/**
 * TOOLS PLATFORM - HUB D'INGÉNIERIE SOUVERAIN
 * Design : Emeraude Profond (Yoombal style)
 * Doctrine : Subordination Normative Totale
 */
export default function ToolsPlatform() {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState<'free' | 'premium'>('free');
    const [activeTool, setActiveTool] = useState<string | null>(null);

    const tools = [
        {
            id: "norm-explorer",
            title: "Explorateur Normatif",
            desc: "Consultation du Corpus PROQUELEC. Actuellement : NS 01-001 Titre 4 (Protection).",
            icon: BookOpen,
            category: "free",
            status: "Actif",
            norme: "NS 01-001"
        },
        {
            id: "mat-database",
            title: "Base de Données Matériel",
            desc: "Fiches techniques certifiées Senelec et internationales.",
            icon: Wrench,
            category: "free",
            status: "Actif",
            norme: "NF EN 60228"
        },
        {
            id: "eng-calcs",
            title: "Calculateurs d'Ingénierie",
            desc: "Chute de tension normée (Art 525). Calcul certifié NS 01-001.",
            icon: Calculator,
            category: "premium",
            status: "ACTIF",
            norme: "NS 01-001 / Titre 5"
        },
        {
            id: "sovereign-ai",
            title: "YEAI Sénégal",
            desc: "Assistant IA 100% Sénégalais soumis à la norme NS 01-001 (1994 articles). Traçabilité totale par article et page.",
            icon: Brain,
            category: "premium",
            status: "ACTIF",
            norme: "NS 01-001 (Sénégal)"
        },
        {
            id: "safety-audit",
            title: "Audit de Sécurité Humaine",
            desc: "En développement. Nécessite l'atomisation de la NF C 18-510 (Habilitations).",
            icon: ShieldCheck,
            category: "premium",
            status: "Bientôt",
            norme: "NF C 18-510"
        },
        {
            id: "schema-modulaire",
            title: "Schéma Graphique Modulaire",
            desc: "Éditeur visuel pour concevoir des schémas électriques normatifs. Sélectionnez une rubrique et commencez à dessiner.",
            icon: Palette,
            category: "premium",
            status: "ACTIF",
            norme: "NF C 15-100"
        }
    ];

    return (
        <div className="min-h-screen bg-[#071914] text-slate-100 selection:bg-emerald-500/30">
            <SEO
                title="Plateforme d'Ingénierie Électrotechnique - PROQUELEC"
                description="Référentiel Officiel & Corpus Normatif Central. Outils de calcul normés et aide à la décision pour professionnels."
            />

            <Header />

            <main className="pt-24">
                {/* HERO SECTION TYPE YOOMBAL */}
                <section className="relative overflow-hidden pt-16 pb-24 border-b border-emerald-900/50">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-600/10 blur-[150px] -mr-96 -mt-96 rounded-full pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] -ml-48 -mb-48 rounded-full pointer-events-none" />

                    <div className="container mx-auto px-6 relative z-10">
                        <div className="max-w-4xl">
                            <Badge className="mb-6 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em]">
                                Ingénierie Souveraine
                            </Badge>
                            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.05] tracking-tight">
                                Plateforme d'Audit & <br /> Rendu <span className="text-emerald-400 italic">Technique.</span>
                            </h1>
                            <p className="text-xl text-slate-400 max-w-2xl leading-relaxed mb-10 font-medium font-inter">
                                Accédez au <span className="text-white font-bold">Corpus Normatif Central</span>, pilotez vos calculs d'ingénierie et bénéficiez d'un assistant IA strictement soumis à la norme.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Button className="h-14 px-10 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-2xl shadow-emerald-500/20 transition-all active:scale-95 text-lg">
                                    Lancer un Diagnostic IA
                                    <ChevronRight className="ml-2 h-5 w-5" />
                                </Button>
                                <Button variant="outline" className="h-14 px-10 border-emerald-800 bg-emerald-900/20 text-emerald-400 hover:bg-emerald-800/40 rounded-2xl font-bold text-lg">
                                    Consulter le Corpus
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ZONE DE RENDU : HUB OU OUTIL SPÉCIFIQUE */}
                <section className="py-24 container mx-auto px-6">
                    {activeTool === 'sovereign-ai' ? (
                        <div className="space-y-8">
                            <button
                                onClick={() => setActiveTool(null)}
                                className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" /> Retour au Hub
                            </button>
                            <YEAISenegal />
                        </div>
                    ) : activeTool === 'eng-calcs' ? (
                        <div className="space-y-8">
                            <button
                                onClick={() => setActiveTool(null)}
                                className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors"
                            >
                                <RotateCcw className="w-4 h-4" /> Retour au Hub
                            </button>
                            <VoltageDropCalculator />
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
                                <div className="max-w-xl">
                                    <h2 className="text-3xl font-black mb-4">Référentiel <span className="text-emerald-400">Opérationnel</span></h2>
                                    <p className="text-slate-400 font-medium">Choisissez un outil d'ingénierie. Chaque résultat est tracé et certifié par le Corpus Normatif PROQUELEC.</p>
                                </div>

                                <div className="flex bg-emerald-900/30 p-1.5 rounded-2xl border border-emerald-800/30">
                                    <button
                                        onClick={() => setActiveCategory('free')}
                                        className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${activeCategory === 'free' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        GRATUIT (Consultation)
                                    </button>
                                    <button
                                        onClick={() => setActiveCategory('premium')}
                                        className={`px-8 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeCategory === 'premium' ? 'bg-amber-400 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        <Lock className="w-3.5 h-3.5" /> PREMIUM (Expertise)
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {tools.filter(t => t.category === activeCategory).map((tool) => (
                                    <Card
                                        key={tool.id}
                                        onClick={() => {
                                            if (tool.id === 'schema-modulaire') {
                                                navigate('/rubrique-selector');
                                            } else {
                                                setActiveTool(tool.id);
                                            }
                                        }}
                                        className="group bg-[#0d2a21]/40 border-emerald-900/40 hover:border-emerald-500/40 rounded-[2.5rem] shadow-2xl transition-all duration-500 overflow-hidden relative cursor-pointer"
                                    >
                                        {/* Glow effect on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                        <CardContent className="p-10 relative z-10 flex flex-col h-full">
                                            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                                                <tool.icon className="w-8 h-8 text-emerald-400" />
                                            </div>

                                            <div className="mb-4">
                                                <Badge variant="outline" className="border-emerald-800 text-[10px] uppercase font-black tracking-widest text-emerald-500/70 mb-2">
                                                    Norme : {tool.norme}
                                                </Badge>
                                                <h3 className="text-2xl font-black text-white group-hover:text-emerald-300 transition-colors uppercase leading-tight">
                                                    {tool.title}
                                                </h3>
                                            </div>

                                            <p className="text-slate-400 font-medium leading-relaxed mb-10">
                                                {tool.desc}
                                            </p>

                                            <div className="mt-auto pt-4 flex items-center justify-between border-t border-emerald-900/50">
                                                <span className={`text-[11px] font-black uppercase tracking-wider ${tool.category === 'premium' ? 'text-amber-400' : 'text-emerald-500'}`}>
                                                    {tool.status}
                                                </span>
                                                <button className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors group/btn">
                                                    Accéder
                                                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </section>

                {/* SECTION CHARTE SOUS LE HUB */}
                <section className="bg-emerald-500/5 border-y border-emerald-900/50 py-20 mt-12">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                            <div className="space-y-4">
                                <div className="p-3 bg-emerald-500/20 w-fit rounded-xl border border-emerald-500/30">
                                    <BadgeCheck className="text-emerald-400" />
                                </div>
                                <h4 className="font-black text-lg">Zéro Erreur</h4>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">Chaque calcul est validé par des algorithmes soumis au référentiel PROQUELEC.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="p-3 bg-blue-500/20 w-fit rounded-xl border border-blue-500/30">
                                    <Brain className="text-blue-400" />
                                </div>
                                <h4 className="font-black text-lg">IA Subordonnée</h4>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">Notre IA cite systématiquement la norme, l'article et le chapitre.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="p-3 bg-amber-500/20 w-fit rounded-xl border border-amber-500/30">
                                    <ShieldCheck className="text-amber-400" />
                                </div>
                                <h4 className="font-black text-lg">Sécurité Humaine</h4>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">La norme NF C 18-510 est le pilier central de tous nos diagnostics pannes.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="p-3 bg-slate-500/20 w-fit rounded-xl border border-slate-500/30">
                                    <FileText className="text-slate-400" />
                                </div>
                                <h4 className="font-black text-lg">Preuve Technique</h4>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">Exports PDF certifiés pour vos comptes-rendus de chantier et rapports techniques.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
