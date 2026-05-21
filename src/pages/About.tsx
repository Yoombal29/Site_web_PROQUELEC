import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
  History, Target, ShieldCheck, Award, Lightbulb,
  Building2, CheckCircle2, Download,
  Globe, Scale, Handshake, FileText, ArrowRight,
  Users2, Landmark, PieChart, Briefcase, Zap } from
"lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { useLiveSettings } from "@/hooks/useLiveSettings";
import { cn } from "@/lib/utils";

// --- Types & Data ---

type AboutSection = 'presentation' | 'history' | 'vision' | 'team' | 'governance' | 'partners' | 'reports';

interface SectionConfig {
  id: AboutSection;
  label: string;
  icon: unknown;
}

const iconMap: Record<string, unknown> = {
  'Building2': Building2,
  'History': History,
  'Target': Target,
  'Users2': Users2,
  'Scale': Scale,
  'Handshake': Handshake,
  'FileText': FileText,
  'Landmark': Landmark,
  'Zap': Zap,
  'ShieldCheck': ShieldCheck,
  'Award': Award,
  'Lightbulb': Lightbulb,
  'Building': Building2,
  'PieChart': PieChart,
  'Briefcase': Briefcase
};

const sections: SectionConfig[] = [
{ id: 'presentation', label: 'Présentation', icon: Building2 },
{ id: 'history', label: 'Historique', icon: History },
{ id: 'vision', label: 'Vision & Valeurs', icon: Target },
{ id: 'team', label: 'Équipe Dirigeante', icon: Users2 },
{ id: 'governance', label: 'Gouvernance', icon: Scale },
{ id: 'partners', label: 'Partenaires', icon: Handshake },
{ id: 'reports', label: 'Rapports Annuels', icon: FileText }];


// --- Sub-components (Sections) ---

const SectionPresentation = ({ settings }: {settings: unknown;}) => {
  const data = settings?.page_sections?.about?.content?.presentation;
  if (!data) return null;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">
            {data.title.split('Re')[0]} <span className="text-blue-600">{data.title.includes('Référence') ? 'Référence' : ''}</span>
          </h3>
          <p className="text-xl text-slate-600 leading-relaxed font-light">
            {data.subtitle}
          </p>
          <div className="grid grid-cols-2 gap-6 pt-4">
            {data.features?.slice(0, 2).map((f: string, i: number) =>
            <div key={i} className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="text-3xl font-black text-blue-600">{f.split(' ')[0]}</div>
                <div className="text-sm font-bold text-slate-500 uppercase">{f.split(' ').slice(1).join(' ')}</div>
              </div>
            )}
          </div>
        </div>
        <div className="relative">
          <div className="aspect-video bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl relative group">
            <img
              src={data.image}
              alt={data.title}
              className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" loading="lazy" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent p-12 flex items-end">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="text-blue-600 w-6 h-6" />
                </div>
                <span className="text-white font-bold text-lg">{data.features?.[data.features.length - 1] || 'Certifié aux normes ISO'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

};

const SectionHistory = ({ settings }: {settings: unknown;}) => {
  const data = settings?.page_sections?.about?.content?.history;
  if (!data) return null;

  const timeline = data.features?.map((f: string) => {
    const [year, title, desc] = f.split('|').map((s) => s.trim());
    return { year, title, desc };
  }) || [];

  return (
    <div className="py-8 md:py-16">
      {/* Mobile View: Vertical Compact */}
      <div className="md:hidden space-y-8 pl-4 border-l-2 border-slate-100 ml-2">
        {timeline.map((item: unknown, idx: number) =>
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.1 }}
          className="relative pl-6">
          
            <div className="absolute left-[-21px] top-1 w-3 h-3 rounded-full bg-blue-600 border-2 border-white ring-4 ring-blue-50"></div>
            <div className="text-3xl font-black text-slate-100 absolute -top-4 right-0 z-0">{item.year}</div>
            <div className="relative z-10 glass-card p-4 rounded-xl border border-white/50">
              <span className="text-blue-600 font-bold text-xs mb-1 block">{item.year}</span>
              <h4 className="text-lg font-bold text-slate-900">{item.title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed mt-1">{item.desc}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Desktop View: Horizontal Staggered */}
      <div className="hidden md:block relative px-4">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>

        <div className="grid grid-cols-4 gap-6">
          {timeline.map((item: unknown, idx: number) =>
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: idx % 2 === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.15, type: "spring" }}
            className={cn(
              "relative p-6 rounded-2xl bg-white border border-slate-100 shadow-lg hover:shadow-2xl transition-all hover:scale-105 group",
              idx % 2 === 0 ? "mb-24" : "mt-24"
            )}>
            
              <div className={cn(
              "absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg z-10",
              idx % 2 === 0 ? "-bottom-14" : "-top-14"
            )}></div>

              <div className={cn(
              "absolute left-1/2 -translate-x-1/2 w-0.5 bg-blue-100",
              idx % 2 === 0 ? "-bottom-12 h-12" : "-top-12 h-12"
            )}></div>

              <div className="text-4xl font-black text-slate-100 absolute top-2 right-4 select-none">{item.year}</div>
              <h4 className="text-xl font-bold text-slate-900 mb-2 relative z-10">{item.title}</h4>
              <p className="text-slate-500 text-sm relative z-10">{item.desc}</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>);

};

const SectionVision = ({ settings }: {settings: unknown;}) => {
  const data = settings?.page_sections?.about?.content?.vision;
  if (!data) return null;

  const valuesConfigs: Record<string, {icon: unknown;color: string;}> = {
    'Sécurité': { icon: ShieldCheck, color: 'emerald' },
    'Indépendance': { icon: Scale, color: 'blue' },
    'Excellence': { icon: Award, color: 'indigo' },
    'Innovation': { icon: Lightbulb, color: 'orange' }
  };

  const values = data.features?.map((f: string) => {
    const [title, desc] = f.split(':').map((s) => s.trim());
    const config = valuesConfigs[title as keyof typeof valuesConfigs] || { icon: Target, color: 'blue' };
    return { title, desc, ...config };
  }) || [];

  return (
    <div className="space-y-20">
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">
          {data.title.split('Vo')[0]} <span className="text-blue-600">{data.title.includes('Vocation') ? 'Vocation' : ''}</span>
        </h3>
        <p className="text-xl text-slate-500 font-light italic">
          "{data.subtitle}"
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {values.map((v: unknown, i: number) =>
        <div key={i} className="group p-10 bg-white rounded-[2.5rem] shadow-lg border border-slate-50 hover:bg-slate-900 transition-all duration-500">
            <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-slate-50 group-hover:bg-white/10 transition-colors",
            v.color === 'emerald' ? 'text-emerald-600' :
            v.color === 'blue' ? 'text-blue-600' :
            v.color === 'indigo' ? 'text-indigo-600' : 'text-orange-600'
          )}>
              <v.icon className="w-8 h-8 group-hover:text-white transition-colors" />
            </div>
            <h4 className="text-2xl font-bold mb-4 group-hover:text-white transition-colors">{v.title}</h4>
            <p className="text-slate-500 group-hover:text-slate-400 leading-relaxed">{v.desc}</p>
          </div>
        )}
      </div>
    </div>);

};

const SectionTeam = ({ settings }: {settings: unknown;}) => {
  const data = settings?.page_sections?.about?.content?.team;
  if (!data) return null;

  const team = data.features?.map((f: string) => {
    const [name, role, bio] = f.split('|').map((s) => s.trim());
    return { name, role, bio };
  }) || [];

  return (
    <div className="grid md:grid-cols-3 gap-12">
      {team.map((member: unknown, idx: number) =>
      <div key={idx} className="group flex flex-col items-center text-center">
          <div className="relative w-64 h-64 mb-8 overflow-hidden rounded-[3rem] shadow-2xl">
            <img
            src={idx === 0 ? "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop" :
            idx === 1 ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop" :
            "https://images.unsplash.com/photo-1531123897727-8f129e16fd3c?w=400&h=400&fit=crop"}
            alt={member.name}
            className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110" loading="lazy" />
          
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center p-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white hover:bg-white hover:text-blue-600 transition-colors cursor-pointer">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
          <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{member.name}</h4>
          <div className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-4">{member.role}</div>
          <p className="text-slate-500 text-sm leading-relaxed max-w-xs">{member.bio}</p>
        </div>
      )}
    </div>);

};

const SectionGovernance = ({ settings }: {settings: unknown;}) => {
  const data = settings?.page_sections?.about?.content?.governance;
  if (!data) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px]"></div>
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-6">
            <Scale className="w-12 h-12 text-blue-400" />
            <h3 className="text-3xl font-black uppercase tracking-tighter">{data.title}</h3>
          </div>
          <div className="grid gap-6">
            {data.features?.map((f: string, i: number) => {
              const [title, desc] = f.split(':').map((s) => s.trim());
              return (
                <div key={i} className="flex items-start gap-6 p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-black">{i + 1}</div>
                  <div>
                    <h4 className="font-bold text-xl mb-1">{title}</h4>
                    <p className="text-slate-400 text-sm">{desc}</p>
                  </div>
                </div>);

            })}
          </div>
        </div>
      </div>
    </div>);

};

const SectionPartners = ({ settings }: {settings: unknown;}) => {
  const data = settings?.page_sections?.about?.content?.partners;
  if (!data) return null;

  const partnerIcons: Record<string, unknown> = {
    "Ministère de l'Énergie": Landmark,
    "Senelec": Zap,
    "ANER": Building2,
    "CRSE": Scale,
    "ASER": Landmark,
    "COSEC": Building2,
    "BOS": Target,
    "CCIAD": Landmark
  };

  return (
    <div className="space-y-16">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {data.features?.map((name: string, i: number) => {
          const Icon = partnerIcons[name] || Landmark;
          return (
            <div key={i} className="flex flex-col items-center gap-4 p-8 bg-slate-50 rounded-3xl border border-transparent hover:border-blue-200 hover:bg-white hover:shadow-xl transition-all group">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon className="w-8 h-8 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <span className="text-sm font-black text-slate-400 group-hover:text-slate-900 uppercase tracking-tighter text-center">{name}</span>
            </div>);

        })}
      </div>
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-12 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 space-y-4">
          <h4 className="text-3xl font-black uppercase tracking-tighter">Devenir Partenaire Institutionnel</h4>
          <p className="text-blue-100 max-w-xl">Contribuez à la sécurisation du patrimoine électrique national et à l'essor technologique du Sénégal.</p>
        </div>
        <button className="relative z-10 px-10 py-5 bg-white text-blue-600 rounded-2xl font-black shadow-xl hover:scale-105 transition-transform">
          Proposer une collaboration
        </button>
      </div>
    </div>);

};

const SectionReports = ({ settings }: {settings: unknown;}) => {
  const data = settings?.page_sections?.about?.content?.reports;
  if (!data) return null;

  return (
    <div className="grid gap-6">
      {data.features?.map((f: string, idx: number) => {
        const [title, size] = f.split('-').map((s) => s.trim());
        const year = title.match(/\d{4}/)?.[0] || '2023';
        return (
          <div key={idx} className="flex items-center justify-between p-8 bg-white rounded-3xl shadow-lg border border-slate-50 hover:border-blue-200 transition-all group">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900">{title}</h4>
                <p className="text-sm text-slate-500">Document PDF - {size || '4.2 MB'}</p>
              </div>
            </div>
            <button
              className="p-4 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm"
              aria-label={`Télécharger le rapport annuel ${year}`}
              title="Télécharger PDF">
              
              <Download className="w-6 h-6" />
            </button>
          </div>);

      })}
    </div>);

};

// --- Main Page ---

export default function AboutPage() {
  const { settings } = useLiveSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState<AboutSection>('presentation');

  const pageData = settings?.page_sections?.about;
  const dynamicSections: SectionConfig[] = pageData?.sections?.map((s: unknown) => ({
    id: s.id,
    label: s.label,
    icon: iconMap[s.icon] || Building2
  })) || sections;

  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as AboutSection;
    if (hash && dynamicSections.find((s) => s.id === hash)) {
      setActiveSection(hash);
    }
  }, [window.location.hash, dynamicSections]);

  const handleSectionChange = (id: AboutSection) => {
    setActiveSection(id);
    window.location.hash = id;
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'presentation':return <SectionPresentation settings={settings} />;
      case 'history':return <SectionHistory settings={settings} />;
      case 'vision':return <SectionVision settings={settings} />;
      case 'team':return <SectionTeam settings={settings} />;
      case 'governance':return <SectionGovernance settings={settings} />;
      case 'partners':return <SectionPartners settings={settings} />;
      case 'reports':return <SectionReports settings={settings} />;
      default:return <SectionPresentation settings={settings} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <SEO
        title="Découvrir PROQUELEC - Histoire, Vision et Engagement"
        description="Plongez au cœur de PROQUELEC. Découvrez notre histoire depuis 1995, notre vision pour le Sénégal et l'équipe qui certifie votre sécurité." />
      
      <Header solid={true} />

      <main className="flex-grow pt-8">
        {/* Hero Minimalist */}
        <section className="bg-slate-900 pt-32 pb-64 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="container max-w-7xl mx-auto px-4 relative z-10 text-center space-y-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-[0.2em]">
              
              <Globe className="w-4 h-4" /> Excellence Normative
            </motion.div>
            <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none">
              {settings?.site_name} <br /> une <span className="text-blue-600">Mission</span>.
            </h1>
          </div>
        </section>

        {/* Sticky Nav Sub-menu */}
        <div className="sticky top-[var(--effective-header-height,110px)] z-[40] mt-[-80px] flex justify-center px-4 w-full">
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
                
                <div className="mb-12 border-l-4 border-blue-600 pl-8">
                  <span className="text-blue-600 font-black uppercase tracking-widest text-sm">PROQUELEC / {dynamicSections.find((s) => s.id === activeSection)?.label}</span>
                  <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">{dynamicSections.find((s) => s.id === activeSection)?.label}</h2>
                </div>

                <div className="mt-20">
                  {renderContent()}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Global CTA */}
        <section className="py-32 bg-slate-50 border-t border-slate-100 overflow-hidden relative">
          <div className="absolute -bottom-64 -right-64 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[150px] opacity-50"></div>
          <div className="container max-w-5xl mx-auto px-4 text-center space-y-12">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter italic">
              Prêt à nous rejoindre <br /> dans <span className="text-blue-600 underline">l'Excellence ?</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              <button className="group flex items-center gap-3 px-12 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-lg transition-transform hover:scale-105 hover:bg-slate-800">
                Nous rejoindre
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform text-blue-400" />
              </button>
              <button className="flex items-center gap-3 px-12 py-6 bg-white text-slate-900 border-2 border-slate-900 rounded-[2rem] font-black text-lg transition-transform hover:scale-105">
                Voir nos actions
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTopButton aria-label="Action" />
    </div>);

}