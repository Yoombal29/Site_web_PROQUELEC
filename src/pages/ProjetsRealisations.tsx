import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
  Briefcase, Building2, FileBarChart, Camera,
  MessageSquare, CheckCircle2, ArrowRight, Zap, Target } from
"lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { useLiveSettings } from "@/hooks/useLiveSettings";
import { cn } from "@/lib/utils";

// --- Types & Data ---

type ProjetsSection = 'marches' | 'senelec' | 'etudes' | 'avant-apres' | 'temoignages';

interface SectionConfig {
  id: ProjetsSection;
  label: string;
  icon: unknown;
}

const sections: SectionConfig[] = [
{ id: 'marches', label: 'Marchés Sécurisés', icon: Briefcase },
{ id: 'senelec', label: 'Partenariat SENELEC', icon: Zap },
{ id: 'etudes', label: 'Études Majeures', icon: FileBarChart },
{ id: 'avant-apres', label: 'Avant / Après', icon: Camera },
{ id: 'temoignages', label: 'Témoignages', icon: MessageSquare }];


// --- Main Component ---

const iconMap: Record<string, unknown> = {
  Briefcase, Building2, FileBarChart, Camera, MessageSquare, CheckCircle2, ArrowRight, Zap, Target
};

const SectionContent = ({ id, settings }: {id: ProjetsSection;settings: unknown;}) => {
  const pageData = settings?.page_sections?.projets_realisations;
  const data = pageData?.content?.[id];
  if (!data) return null;
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                            {data.title}
                        </h3>
                        <p className="text-xl text-slate-600 leading-relaxed font-light">
                            {data.subtitle}
                        </p>
                    </div>

                    <ul className="space-y-4">
                        {data.features?.map((feature: string, idx: number) =>
            <li key={idx}>
                                <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100 hover:border-indigo-200 transition-colors">
                
                                    <CheckCircle2 className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-700 font-medium">{feature}</span>
                                </motion.div>
                            </li>
            )}
                    </ul>

                    <button className="flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
                        Voir les détails <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative">
                    <div className="aspect-[4/3] bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative group rotate-2 hover:rotate-0 transition-all duration-500">
                        <img
              src={data.image}
              alt={data.title}
              className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-1000" loading="lazy" />
            
                        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-8">
                            <div className="flex items-center gap-3 text-white/90 mb-2">
                                <Target className="w-5 h-5 text-indigo-400" />
                                <span className="uppercase text-xs font-black tracking-widest text-indigo-100">Réalisations Concrètes</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>);

};

// --- Main Page ---

export default function ProjetsRealisations() {
  const { settings } = useLiveSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageData = settings?.page_sections?.projets_realisations;
  const dynamicSections: SectionConfig[] = pageData?.sections?.map((s: unknown) => ({
    id: s.id, label: s.label, icon: iconMap[s.icon] || Briefcase
  })) || sections;
  const [activeSection, setActiveSection] = useState<ProjetsSection>(dynamicSections[0]?.id as ProjetsSection || 'marches');

  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as ProjetsSection;
    if (hash && dynamicSections.find((s) => s.id === hash)) setActiveSection(hash);
  }, [window.location.hash, dynamicSections]);

  const handleSectionChange = (id: ProjetsSection) => {
    setActiveSection(id);
    window.location.hash = id;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
            <SEO
        title="Projets & Réalisations - PROQUELEC"
        description="Découvrez nos réalisations concrètes : sécurisation de marchés, partenariat SENELEC, études majeures et témoignages." />
      
            <Header solid={true} />

            <main className="flex-grow pt-24">
                {/* Hero Minimalist (Indigo Theme) */}
                <section className="bg-slate-900 pt-32 pb-48 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-10"></div>
                    {/* Ambient Glow */}
                    <div className="absolute top-[-20%] right-[20%] w-[60%] h-[80%] bg-indigo-600/20 blur-[150px] rounded-full"></div>

                    <div className="container max-w-7xl mx-auto px-4 relative z-10 text-center space-y-8">
                        <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-black uppercase tracking-[0.2em]">
              
                            <Building2 className="w-4 h-4" /> Impact Terrain
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
                            Des Preuves <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-500">Concrètes</span>.
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
                            Au-delà des normes, des actions visibles qui changent le quotidien et renforcent la sécurité des populations.
                        </p>
                    </div>
                </section>

                {/* Sticky Nav Floating Capsule (Indigo Variation) */}
                <div className="sticky top-24 z-[40] mt-[-60px] flex justify-center px-4 w-full">
                    <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl shadow-indigo-900/5 rounded-full p-1.5 max-w-full overflow-hidden">
                        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto max-w-[90vw] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] px-1">
                            {dynamicSections.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={cn(
                      "group flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap",
                      isActive ?
                      "bg-slate-900 text-white shadow-lg ring-1 ring-indigo-500/20 translate-y-[-1px]" :
                      "text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-md"
                    )} aria-label="Action">
                    
                                        <section.icon className={cn("w-4 h-4 transition-colors duration-300", isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-indigo-600")} />
                                        {section.label}
                                    </button>);

              })}
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <section className="py-24 px-4 bg-white min-h-[600px]">
                    <div className="container max-w-7xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4, ease: "easeOut" }}>
                
                                <div className="mb-12 border-l-4 border-indigo-500 pl-8">
                                    <span className="text-indigo-600 font-black uppercase tracking-widest text-sm">Nos Actions / {dynamicSections.find((s) => s.id === activeSection)?.label}</span>
                                    <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">{dynamicSections.find((s) => s.id === activeSection)?.label}</h2>
                                </div>

                                <div className="mt-20">
                                    <SectionContent id={activeSection} settings={settings} />
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </section>

                {/* Global CTA (Indigo Variation) */}
                <section className="py-24 bg-slate-900 overflow-hidden relative">
                    {/* Background Pattern */}
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-5"></div>
                    <div className="absolute bottom-0 right-0 w-1/2 h-full bg-indigo-600/10 blur-[100px]"></div>

                    <div className="container max-w-4xl mx-auto px-4 text-center relative z-10 space-y-8">
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                            Un Projet à <span className="text-indigo-500">Sécuriser ?</span>
                        </h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                            Confiez vos installations aux experts reconnus par SENELEC et l'État. De l'audit à la certification finale.
                        </p>
                        <div className="flex justify-center pt-4">
                            <button className="bg-indigo-600 text-white px-10 py-5 rounded-full font-bold shadow-xl shadow-indigo-900/20 hover:scale-105 hover:bg-indigo-500 transition-all flex items-center gap-2">
                                <Briefcase className="w-5 h-5" /> Demander une étude
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
            <ScrollToTopButton aria-label="Action" />
        </div>);

}