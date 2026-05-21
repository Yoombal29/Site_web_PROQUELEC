import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
  Landmark, Settings, Banknote, Building,
  Handshake, Link as LinkIcon, Globe, ArrowRight } from
"lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { useLiveSettings } from "@/hooks/useLiveSettings";
import { cn } from "@/lib/utils";

// --- Types & Data ---

type PartenairesSection = 'institutionnels' | 'techniques' | 'financiers' | 'prives';

interface SectionConfig {
  id: PartenairesSection;
  label: string;
  icon: unknown;
}

const sections: SectionConfig[] = [
{ id: 'institutionnels', label: 'Institutionnels', icon: Landmark },
{ id: 'techniques', label: 'Techniques', icon: Settings },
{ id: 'financiers', label: 'Financiers', icon: Banknote },
{ id: 'prives', label: 'Secteur Privé', icon: Building }];


// --- Main Component ---

const iconMap: Record<string, unknown> = {
  Landmark, Settings, Banknote, Building, Handshake, LinkIcon, Globe, ArrowRight
};

const SectionContent = ({ id, settings }: {id: PartenairesSection;settings: unknown;}) => {
  const pageData = settings?.page_sections?.partenaires;
  const data = pageData?.content?.[id];
  if (!data) return null;
  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center max-w-3xl mx-auto space-y-6">
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                    {data.title}
                </h3>
                <p className="text-xl text-slate-600 leading-relaxed font-light">
                    {data.subtitle}
                </p>
                <p className="text-slate-500">
                    {data.desc}
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {data.features?.map((feature: string, idx: number) =>
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.1 }}
          className="aspect-square bg-slate-50 border border-slate-100 rounded-[2rem] flex flex-col items-center justify-center p-6 hover:shadow-xl hover:border-yellow-200 hover:bg-white transition-all group cursor-pointer">
          
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Handshake className="w-8 h-8 text-slate-400 group-hover:text-yellow-600 transition-colors" />
                        </div>
                        <span className="text-sm font-black text-slate-400 group-hover:text-slate-900 uppercase tracking-tighter text-center">{feature}</span>
                    </motion.div>
        )}
            </div>

            <div className="flex justify-center">
                <button className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-colors shadow-lg">
                    Devenir partenaire <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>);

};

// --- Main Page ---

export default function PartenairesPage() {
  const { settings } = useLiveSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  const pageData = settings?.page_sections?.partenaires;
  const dynamicSections: SectionConfig[] = pageData?.sections?.map((s: unknown) => ({
    id: s.id,
    label: s.label,
    icon: iconMap[s.icon] || Handshake
  })) || sections;

  const [activeSection, setActiveSection] = useState<PartenairesSection>(dynamicSections[0]?.id as PartenairesSection || 'institutionnels');

  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as PartenairesSection;
    if (hash && dynamicSections.find((s) => s.id === hash)) {
      setActiveSection(hash);
    }
  }, [window.location.hash, dynamicSections]);

  const handleSectionChange = (id: PartenairesSection) => {
    setActiveSection(id);
    window.location.hash = id;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
            <SEO
        title="Nos Partenaires - PROQUELEC"
        description="Découvrez l'écosystème de PROQUELEC : partenaires institutionnels, techniques, financiers et privés qui soutiennent notre mission." />
      
            <Header solid={true} />

            <main className="flex-grow pt-24">
                {/* Hero Minimalist (Gold/Slate Theme) */}
                <section className="bg-slate-900 pt-32 pb-48 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    {/* Ambient Glow */}
                    <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-yellow-600/10 blur-[150px]"></div>

                    <div className="container max-w-7xl mx-auto px-4 relative z-10 text-center space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-400 text-xs font-black uppercase tracking-[0.2em]">
                            <Handshake className="w-4 h-4" /> Écosystème de Confiance
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
                            Ensemble pour <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">l'Excellence</span>.
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
                            La crédibilité de PROQUELEC repose sur un réseau solide de partenaires nationaux et internationaux.
                        </p>
                    </div>
                </section>

                {/* Sticky Nav Floating Capsule (Gold Variation) */}
                <div className="sticky top-24 z-[40] mt-[-60px] flex justify-center px-4 w-full">
                    <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl shadow-yellow-900/5 rounded-full p-1.5 max-w-full overflow-hidden">
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
                      "bg-slate-900 text-white shadow-lg ring-1 ring-yellow-500/20 translate-y-[-1px]" :
                      "text-slate-500 hover:bg-white hover:text-yellow-600 hover:shadow-md"
                    )} aria-label="Action">
                    
                                        <section.icon className={cn("w-4 h-4 transition-colors duration-300", isActive ? "text-yellow-400" : "text-slate-400 group-hover:text-yellow-600")} />
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
                
                                <div className="mb-12 border-l-4 border-yellow-500 pl-8">
                                    <span className="text-yellow-600 font-black uppercase tracking-widest text-sm">Réseau / {dynamicSections.find((s) => s.id === activeSection)?.label}</span>
                                    <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">{dynamicSections.find((s) => s.id === activeSection)?.label}</h2>
                                </div>

                                <div className="mt-20">
                                    <SectionContent id={activeSection} settings={settings} />
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </section>
            </main>

            <Footer />
            <ScrollToTopButton aria-label="Action" />
        </div>);

}