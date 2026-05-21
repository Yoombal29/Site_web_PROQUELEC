import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
  ShieldCheck, Award, BookOpen, Zap, ClipboardCheck,
  FileSearch, Lightbulb, ArrowRight, Layers, CheckCircle2 } from
"lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { useLiveSettings } from "@/hooks/useLiveSettings";
import { cn } from "@/lib/utils";

// --- Types & Data ---

type ActivitySection = 'hero' | 'groups';

interface SectionConfig {
  id: string;
  label: string;
  icon: unknown;
}

const iconMap: Record<string, unknown> = {
  ShieldCheck, Award, BookOpen, Zap, ClipboardCheck, FileSearch, Lightbulb, Layers
};

const SectionContent = ({ group, settings }: {group: unknown;settings: unknown;}) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              {group.title}
            </h3>
            {group.subtitle &&
            <p className="text-xl text-slate-600 leading-relaxed font-light">
                {group.subtitle}
              </p>
            }
          </div>

          <ul className="space-y-4">
            {group.features?.map((feature: string, idx: number) => {
              const [fTitle, fIcon, fDesc] = feature.split('|').map((s) => s.trim());
              return (
                <li key={idx}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 hover:border-blue-200 transition-colors">
                    
                    {fIcon && iconMap[fIcon] ? React.createElement(iconMap[fIcon], { className: "w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" }) : <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />}
                    <div className="flex flex-col">
                      <span className="text-slate-900 font-bold">{fTitle}</span>
                      {fDesc && <span className="text-slate-600 text-sm">{fDesc}</span>}
                    </div>
                  </motion.div>
                </li>);

            })}
          </ul>

          <button className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
            En savoir plus <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <div className="aspect-[4/3] bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative group rotate-1 hover:rotate-0 transition-all duration-500">
            <img
              src={group.image || "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80"}
              alt={group.title}
              className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-all duration-1000" loading="lazy" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8">
              <div className="flex items-center gap-3 text-white/90 mb-2">
                <Zap className="w-5 h-5 text-blue-400" />
                <span className="uppercase text-xs font-black tracking-widest text-blue-100">Action Terrain</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

};

// --- Main Page ---

export default function Activities() {
  const { settings } = useLiveSettings();
  const [searchParams] = useSearchParams();

  const pageData = settings?.page_sections?.activities;
  const heroData = pageData?.content?.hero;
  const groupsData = pageData?.content?.groups;

  const activityGroups = groupsData?.features?.map((f: string) => {
    const [title, iconName, description] = f.split('|').map((s) => s.trim());
    return {
      title,
      icon: iconMap[iconName] || Layers,
      id: title.toLowerCase().replace(/\s+/g, '-'),
      features: [f] // Simplify for now or adapt to split
    };
  }) || [];

  const dynamicSections: SectionConfig[] = activityGroups.map((g: unknown) => ({
    id: g.id,
    label: g.title,
    icon: g.icon
  }));

  const [activeSection, setActiveSection] = useState<string>(dynamicSections[0]?.id || '');

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && dynamicSections.find((s) => s.id === hash)) {
      setActiveSection(hash);
    } else if (dynamicSections.length > 0) {
      setActiveSection(dynamicSections[0].id);
    }
  }, [window.location.hash, dynamicSections]);

  const handleSectionChange = (id: string) => {
    setActiveSection(id);
    window.location.hash = id;
  };

  if (!pageData) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-900">
      <SEO
        title="Nos Activités - PROQUELEC"
        description="Découvrez l'ensemble des activités de PROQUELEC : contrôle de conformité, labellisation, formation et audit électrique au Sénégal." />
      
      <Header solid={true} />

      <main className="flex-grow pt-24">
        {/* Hero Minimalist (Blue Theme) */}
        <section className="bg-slate-900 pt-32 pb-48 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10"></div>
          {/* Ambient Glow */}
          <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[100%] bg-blue-600/10 blur-[150px]"></div>

          <div className="container max-w-7xl mx-auto px-4 relative z-10 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-[0.2em]">
              <Layers className="w-4 h-4" /> Notre Expertise
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
              Des Actions pour <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">votre Sécurité</span>.
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
              {heroData?.subtitle || "PROQUELEC déploie un large éventail de services techniques pour garantir la conformité électrique nationale."}
            </p>
          </div>
        </section>

        {/* Sticky Nav Floating Capsule (Blue Variation) */}
        <div className="sticky top-24 z-[40] mt-[-60px] flex justify-center px-4 w-full">
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl shadow-blue-900/5 rounded-full p-1.5 max-w-full overflow-hidden">
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
                
                <div className="mb-12 border-l-4 border-blue-500 pl-8">
                  <span className="text-blue-600 font-black uppercase tracking-widest text-sm">Services / {dynamicSections.find((s) => s.id === activeSection)?.label}</span>
                  <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">{dynamicSections.find((s) => s.id === activeSection)?.label}</h2>
                </div>

                <div className="mt-20">
                  {activityGroups.find((g) => g.id === activeSection) &&
                  <SectionContent
                    group={activityGroups.find((g) => g.id === activeSection)}
                    settings={settings} />

                  }
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