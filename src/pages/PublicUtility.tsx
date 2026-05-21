import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
  Landmark, Home, Briefcase, Building2, ShoppingBag,
  ShieldCheck, Zap, Users2, Scale, ArrowRight,
  CheckCircle2 } from
"lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { useLiveSettings } from "@/hooks/useLiveSettings";
import { cn } from "@/lib/utils";

// --- Types & Data ---

type PublicUtilitySection = 'autorites' | 'menages' | 'professionnels' | 'collectivites' | 'marches';

interface SectionConfig {
  id: PublicUtilitySection;
  label: string;
  icon: unknown;
}

const sections: SectionConfig[] = [
{ id: 'autorites', label: 'Pour les Autorités', icon: Landmark },
{ id: 'menages', label: 'Pour les Ménages', icon: Home },
{ id: 'professionnels', label: 'Pour les Professionnels', icon: Briefcase },
{ id: 'collectivites', label: 'Pour les Collectivités', icon: Building2 },
{ id: 'marches', label: 'Marchés & Centres', icon: ShoppingBag }];


// --- Main Component ---


const iconMap: Record<string, unknown> = {
  Landmark, Home, Briefcase, Building2, ShoppingBag, ShieldCheck, Zap, Users2, Scale, ArrowRight, CheckCircle2
};

const SectionContent = ({ id, settings }: {id: PublicUtilitySection;settings: unknown;}) => {
  const pageData = settings?.page_sections?.public_utility;
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
                className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                
                                    <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-slate-700 font-medium">{feature}</span>
                                </motion.div>
                            </li>
            )}
                    </ul>

                    <button className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors">
                        En savoir plus <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

                <div className="relative">
                    <div className="aspect-[4/3] bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative group rotate-2 hover:rotate-0 transition-all duration-500">
                        <img
              src={data.image}
              alt={data.title}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000" loading="lazy" />
            
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-8">
                            <div className="flex items-center gap-3 text-white/80 mb-2">
                                <ShieldCheck className="w-5 h-5 text-blue-400" />
                                <span className="uppercase text-xs font-black tracking-widest">Engagement PROQUELEC</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>);

};



// --- Main Page ---

export default function PublicUtilityPage() {
  const { settings } = useLiveSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  // Dynamically load sections from settings
  const pageData = settings?.page_sections?.public_utility;
  const dynamicSections: SectionConfig[] = pageData?.sections?.map((s: unknown) => ({
    id: s.id,
    label: s.label,
    icon: iconMap[s.icon] || Landmark
  })) || [
  { id: 'autorites', label: 'Pour les Autorités', icon: Landmark },
  { id: 'menages', label: 'Pour les Ménages', icon: Home },
  { id: 'professionnels', label: 'Pour les Professionnels', icon: Briefcase },
  { id: 'collectivites', label: 'Pour les Collectivités', icon: Building2 },
  { id: 'marches', label: 'Marchés & Centres', icon: ShoppingBag }];


  const [activeSection, setActiveSection] = useState<PublicUtilitySection>(dynamicSections[0]?.id as PublicUtilitySection || 'autorites');

  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as PublicUtilitySection;
    if (hash && dynamicSections.find((s) => s.id === hash)) {
      setActiveSection(hash);
    }
  }, [window.location.hash, dynamicSections]);

  const handleSectionChange = (id: PublicUtilitySection) => {
    setActiveSection(id);
    window.location.hash = id;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
            <SEO
        title="Utilité Publique - PROQUELEC au service de la Nation"
        description="Découvrez comment PROQUELEC sert l'intérêt général au Sénégal : Autorités, Ménages, Professionnels, Collectivités et Marchés." />
      
            <Header solid={true} />

            <main className="flex-grow pt-24">
                {/* Hero Minimalist */}
                <section className="bg-slate-900 pt-32 pb-48 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 blur-[120px] rounded-full"></div>

                    <div className="container max-w-7xl mx-auto px-4 relative z-10 text-center space-y-8">
                        <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-[0.2em]">
              
                            <Scale className="w-4 h-4" /> Intérêt Général
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
                            Au service de <br /> <span className="text-blue-600">toute la Nation</span>.
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
                            De la case du village aux grands édifices de l'État, PROQUELEC veille sur la sécurité électrique de tous les Sénégalais.
                        </p>
                    </div>
                </section>

                {/* Sticky Nav Floating Capsule */}
                <div className="sticky top-24 z-[40] mt-[-60px] flex justify-center px-4 w-full">
                    <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl shadow-blue-900/5 rounded-full p-1.5 max-w-full overflow-hidden">
                        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto max-w-[90vw] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] px-1">
                            {dynamicSections.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id as PublicUtilitySection)}
                    className={cn(
                      "group flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap",
                      isActive ?
                      "bg-slate-900 text-white shadow-lg ring-1 ring-blue-500/20 translate-y-[-1px]" :
                      "text-slate-500 hover:bg-white hover:text-blue-600 hover:shadow-md"
                    )} aria-label="Action">
                    
                                        <section.icon className={cn("w-4 h-4 transition-colors duration-300", isActive ? "text-blue-400" : "text-slate-400 group-hover:text-blue-600")} />
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
                
                                <div className="mb-12 border-l-4 border-blue-600 pl-8">
                                    <span className="text-blue-600 font-black uppercase tracking-widest text-sm">Action Publique / {dynamicSections.find((s) => s.id === activeSection)?.label}</span>
                                    <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">{dynamicSections.find((s) => s.id === activeSection)?.label}</h2>
                                </div>

                                <div className="mt-20">
                                    <SectionContent id={activeSection} settings={settings} />
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </section>

                {/* Global CTA */}
                <section className="py-24 bg-blue-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="container max-w-4xl mx-auto px-4 text-center relative z-10 space-y-8">
                        <h2 className="text-4xl font-black uppercase tracking-tighter">
                            Une mission de responsabilité
                        </h2>
                        <p className="text-blue-100 text-lg">
                            PROQUELEC est mandaté pour garantir la conformité et la sécurité. Votre confiance est notre moteur.
                        </p>
                        <div className="flex justify-center">
                            <button className="bg-white text-blue-600 px-10 py-4 rounded-full font-bold shadow-xl hover:scale-105 transition-transform">
                                Demander une intervention
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
            <ScrollToTopButton aria-label="Action" />
        </div>);

}