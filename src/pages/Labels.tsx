import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import {
  Zap, ShieldCheck, Award, Users, CheckCircle, Search,
  BarChart3, ThumbsUp, ArrowRight, Star } from
"lucide-react";
import { useLiveSettings } from "@/hooks/useLiveSettings";
import { cn } from "@/lib/utils";

// --- Types & Data ---

type LabelSection = 'benefits' | 'criteria';

interface SectionConfig {
  id: LabelSection;
  label: string;
  icon: unknown;
}

const iconMap: Record<string, unknown> = {
  ShieldCheck, Zap, Award, BarChart3, Users, CheckCircle, Search, Star
};

const SectionContent = ({ id, settings }: {id: LabelSection;settings: unknown;}) => {
  const pageData = settings?.page_sections?.labels;
  const data = pageData?.content?.[id];
  if (!data) return null;

  if (id === 'benefits') {
    const benefits = data.features?.map((f: string) => {
      const [title, iconName, desc] = f.split('|').map((s) => s.trim());
      return { title, desc, icon: iconMap[iconName] || ShieldCheck };
    }) || [];

    return (
      <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            {data.title}
          </h3>
          <p className="text-xl text-slate-600 font-light">
            {data.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit: unknown, idx: number) =>
          <motion.div
            key={idx}
            whileHover={{ y: -10 }}
            className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl transition-all duration-500 group">
            
              <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                <benefit.icon className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{benefit.desc}</p>
            </motion.div>
          )}
        </div>
      </div>);

  }

  if (id === 'criteria') {
    const criteria = data.features?.map((f: string) => {
      const [title, iconName, desc] = f.split('|').map((s) => s.trim());
      return { title, desc, icon: iconMap[iconName] || CheckCircle };
    }) || [];

    return (
      <div className="grid lg:grid-cols-2 gap-20 items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="space-y-12">
          <div className="space-y-4">
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              {data.title}
            </h3>
            <p className="text-xl text-slate-600 font-light italic">
              {data.subtitle}
            </p>
          </div>

          <div className="space-y-8">
            {criteria.map((item: unknown, idx: number) =>
            <div key={idx} className="flex gap-6 group">
                <div className="flex-shrink-0 w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12 group-hover:bg-blue-600">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900 p-12 rounded-[3rem] text-white relative overflow-hidden group shadow-2xl">
          <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-600/20 blur-[100px] rounded-full"></div>
          <Star className="w-16 h-16 text-blue-500 mb-8 opacity-20" />
          <blockquote className="text-2xl font-light italic text-slate-200 mb-10 leading-relaxed">
            "Le Label PROQUELEC est devenu notre passeport pour les grands marchés d'infrastructure. C'est un gage de sérieux incontestable."
          </blockquote>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl">A</div>
            <div>
              <div className="font-bold text-lg text-white">Alioune Ndiaye</div>
              <div className="text-sm text-blue-400 font-black uppercase tracking-widest">Expert Consultant</div>
            </div>
          </div>
        </div>
      </div>);

  }

  return null;
};

// --- Main Page ---

export default function Labels() {
  const { settings } = useLiveSettings();
  const pageData = settings?.page_sections?.labels;
  const heroData = pageData?.content?.hero;

  const sections: SectionConfig[] = [
  { id: 'benefits', label: 'Avantages du Label', icon: ThumbsUp },
  { id: 'criteria', label: 'Critères de Qualification', icon: Search }];


  const [activeSection, setActiveSection] = useState<LabelSection>('benefits');

  if (!pageData) return null;

  const handleSectionChange = (id: LabelSection) => {
    setActiveSection(id);
    window.location.hash = id;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-900">
      <SEO
        title="Label d'Excellence - PROQUELEC"
        description="Le Label PROQUELEC est la marque de référence de la qualité électrique au Sénégal. Découvrez comment l'obtenir." />
      
      <Header solid={true} />

      <main className="flex-grow pt-24">
        {/* Hero Minimalist (Blue Theme) */}
        <section className="bg-slate-900 pt-32 pb-48 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          {/* Ambient Glow */}
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[100%] bg-blue-600/10 blur-[150px]"></div>

          <div className="container max-w-7xl mx-auto px-4 relative z-10 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-[0.2em]">
              <Award className="w-4 h-4" /> Sceau de Qualité PROQUELEC
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
              La Référence de <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-500">l'Excellence</span>.
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
              {heroData?.subtitle || "Affirmez votre professionnalisme et gagnez la confiance de vos clients avec le label de référence nationale."}
            </p>
          </div>
        </section>

        {/* Sticky Nav Floating Capsule (Blue Variation) */}
        <div className="sticky top-24 z-[40] mt-[-60px] flex justify-center px-4 w-full">
          <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl shadow-blue-900/5 rounded-full p-1.5 max-w-full overflow-hidden">
            <div className="flex items-center gap-1 md:gap-2 overflow-x-auto max-w-[90vw] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] px-1">
              {sections.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={cn(
                      "group flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap",
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
            {/* Seal Visual */}
            <div className="mb-32 grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative group flex justify-center">
                <div className="absolute inset-0 bg-blue-600/5 blur-[100px] rounded-full scale-75 group-hover:scale-100 transition-transform duration-1000"></div>
                <motion.img
                  src="/logo.png"
                  alt="Label PROQUELEC"
                  className="w-full max-w-sm drop-shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative z-10"
                  initial={{ y: 0 }}
                  animate={{ y: -20 }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} />
                
              </div>
              <div className="space-y-8">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight uppercase tracking-tighter">
                  Affirmez votre <br /><span className="text-blue-600">Supériorité Technique</span>.
                </h2>
                <p className="text-xl text-slate-600 leading-relaxed font-light">
                  Plus qu'une simple distinction, le Label PROQUELEC est un engagement quotidien pour la sécurité des populations et la pérennité des installations électriques.
                </p>
                <div className="flex items-center gap-4 text-slate-900 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm w-fit">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <ThumbsUp className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-lg font-bold">Approuvé par l'État et les assureurs</span>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4, ease: "easeOut" }}>
                
                <div className="mb-12 border-l-4 border-blue-500 pl-8">
                  <span className="text-blue-600 font-black uppercase tracking-widest text-sm">Label PROQUELEC / {sections.find((s) => s.id === activeSection)?.label}</span>
                  <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">{sections.find((s) => s.id === activeSection)?.label}</h2>
                </div>

                <div className="mt-20">
                  <SectionContent id={activeSection} settings={settings} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 bg-blue-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/padded-light.png')] opacity-10"></div>
          <div className="container max-w-4xl mx-auto px-4 text-center relative z-10 space-y-10">
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">
              Prêt à devenir <br /><span className="text-cyan-400">Labellisé</span> ?
            </h2>
            <div className="flex justify-center">
              <button className="bg-white text-blue-800 px-12 py-5 rounded-full font-black text-xl shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
                <ArrowRight className="w-6 h-6" /> Déposer une candidature
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTopButton aria-label="Action" />
    </div>);

}