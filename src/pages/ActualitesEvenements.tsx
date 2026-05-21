import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
  Cake, CalendarCheck, Users, Mic2, Newspaper,
  Radio, PlayCircle, ArrowRight, Rss } from
"lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { useLiveSettings } from "@/hooks/useLiveSettings";
import { cn } from "@/lib/utils";

// --- Types & Data ---

type ActualitesSection = 'anniversaire' | 'seminaires' | 'ateliers' | 'conferences' | 'communiques' | 'revue-presse';

interface SectionConfig {
  id: ActualitesSection;
  label: string;
  icon: unknown;
}

const sections: SectionConfig[] = [
{ id: 'anniversaire', label: 'Anniversaire', icon: Cake },
{ id: 'seminaires', label: 'Séminaires', icon: Users },
{ id: 'ateliers', label: 'Ateliers Techniques', icon: CalendarCheck },
{ id: 'conferences', label: 'Conférences', icon: Mic2 },
{ id: 'communiques', label: 'Communiqués', icon: Rss },
{ id: 'revue-presse', label: 'Médias', icon: Newspaper }];


// --- Main Component ---

const iconMap: Record<string, unknown> = {
  Cake, CalendarCheck, Users, Mic2, Newspaper, Radio, PlayCircle, ArrowRight, Rss
};

const SectionContent = ({ id, settings }: {id: ActualitesSection;settings: unknown;}) => {
  const pageData = settings?.page_sections?.actualites_evenements;
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
                className="flex items-start gap-3 p-4 bg-rose-50 rounded-xl border border-rose-100 hover:border-rose-200 transition-colors">
                
                                    <PlayCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-700 font-medium">{feature}</span>
                                </motion.div>
                            </li>
            )}
                    </ul>

                    <button className="flex items-center gap-2 px-8 py-4 bg-rose-600 text-white rounded-full font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20">
                        Lire l'article complet <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative">
                    <div className="aspect-[4/3] bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative group rotate-1 hover:rotate-0 transition-all duration-500">
                        <img
              src={data.image}
              alt={data.title}
              className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-1000" loading="lazy" />
            
                        <div className="absolute inset-0 bg-gradient-to-t from-rose-900/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-8">
                            <div className="flex items-center gap-3 text-white/90 mb-2">
                                <Radio className="w-5 h-5 text-rose-400" />
                                <span className="uppercase text-xs font-black tracking-widest text-rose-100">En Direct</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>);

};

// --- Main Page ---

export default function ActualitesEvenements() {
  const { settings } = useLiveSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  const pageData = settings?.page_sections?.actualites_evenements;
  const dynamicSections: SectionConfig[] = pageData?.sections?.map((s: unknown) => ({
    id: s.id,
    label: s.label,
    icon: iconMap[s.icon] || Newspaper
  })) || sections;

  const [activeSection, setActiveSection] = useState<ActualitesSection>(dynamicSections[0]?.id as ActualitesSection || 'anniversaire');

  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as ActualitesSection;
    if (hash && dynamicSections.find((s) => s.id === hash)) {
      setActiveSection(hash);
    }
  }, [window.location.hash, dynamicSections]);

  const handleSectionChange = (id: ActualitesSection) => {
    setActiveSection(id);
    window.location.hash = id;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
            <SEO
        title="Actualités & Événements - PROQUELEC"
        description="Restez informé des dernières nouvelles de PROQUELEC : événements, séminaires, communiqués de presse et revue de presse." />
      
            <Header solid={true} />

            <main className="flex-grow pt-24">
                {/* Hero Minimalist (Rose Theme) */}
                <section className="bg-slate-900 pt-32 pb-48 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/p5.png')] opacity-10"></div>
                    {/* Ambient Glow */}
                    <div className="absolute bottom-[-20%] left-[50%] -translate-x-1/2 w-[60%] h-[80%] bg-rose-600/20 blur-[150px] rounded-full"></div>

                    <div className="container max-w-7xl mx-auto px-4 relative z-10 text-center space-y-8">
                        <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 text-xs font-black uppercase tracking-[0.2em]">
              
                            <Newspaper className="w-4 h-4" /> Espace Média
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
                            Au Cœur de <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">l'Action</span>.
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
                            PROQUELEC est sur tous les fronts pour promouvoir la sécurité électrique. Suivez nos actions et nos prises de parole.
                        </p>
                    </div>
                </section>

                {/* Sticky Nav Floating Capsule (Rose Variation) */}
                <div className="sticky top-24 z-[40] mt-[-60px] flex justify-center px-4 w-full">
                    <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl shadow-rose-900/5 rounded-full p-1.5 max-w-full overflow-hidden">
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
                      "bg-slate-900 text-white shadow-lg ring-1 ring-rose-500/20 translate-y-[-1px]" :
                      "text-slate-500 hover:bg-white hover:text-rose-600 hover:shadow-md"
                    )} aria-label="Action">
                    
                                        <section.icon className={cn("w-4 h-4 transition-colors duration-300", isActive ? "text-rose-400" : "text-slate-400 group-hover:text-rose-600")} />
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
                
                                <div className="mb-12 border-l-4 border-rose-500 pl-8">
                                    <span className="text-rose-600 font-black uppercase tracking-widest text-sm">Actualités / {dynamicSections.find((s) => s.id === activeSection)?.label}</span>
                                    <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">{dynamicSections.find((s) => s.id === activeSection)?.label}</h2>
                                </div>

                                <div className="mt-20">
                                    <SectionContent id={activeSection} settings={settings} />
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </section>

                {/* Global CTA (Rose Variation) */}
                <section className="py-24 bg-rose-700 overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/shattered-island.png')] opacity-10"></div>
                    <div className="container max-w-4xl mx-auto px-4 text-center relative z-10 space-y-8">
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                            Presse & Médias
                        </h2>
                        <p className="text-rose-100 text-lg max-w-2xl mx-auto">
                            Vous êtes journaliste ? Téléchargez notre dossier de presse et contactez notre service communication.
                        </p>
                        <div className="flex justify-center pt-4">
                            <button className="bg-white text-rose-800 px-10 py-5 rounded-full font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                                <Mic2 className="w-5 h-5" /> Espace Presse
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
            <ScrollToTopButton aria-label="Action" />
        </div>);

}