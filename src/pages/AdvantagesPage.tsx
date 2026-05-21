import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Building2, Users, CheckCircle2, Award, ShieldCheck,
  ArrowRight, BookOpen, PenTool, Calculator, Briefcase,
  Lightbulb, GraduationCap, TrendingUp, Handshake, Target } from
"lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { useLiveSettings } from "@/hooks/useLiveSettings";
import { HeroSection } from "@/components/HeroSection";

type UserType = 'electrician' | 'company' | 'member';

const iconMap: Record<string, unknown> = {
  Zap, Building2, Users, CheckCircle2, Award, ShieldCheck,
  ArrowRight, BookOpen, PenTool, Calculator, Briefcase,
  Lightbulb, GraduationCap, TrendingUp, Handshake, Target
};

export default function AdvantagesPage() {
  const { settings } = useLiveSettings();
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get('type') as UserType;

  const pageData = settings?.page_sections?.advantages;

  const [selected, setSelected] = useState<UserType>(
    typeFromUrl && ['electrician', 'company', 'member'].includes(typeFromUrl) ? typeFromUrl : 'electrician'
  );

  if (!pageData) return null;

  const heroData = pageData.content?.hero;

  const content: Record<UserType, unknown> = {
    electrician: {
      title: pageData.content?.electrician?.title || "Électriciens Indépendants",
      subtitle: pageData.content?.electrician?.subtitle || "Élevez votre expertise et sécurisez vos chantiers",
      color: "emerald",
      icon: Zap,
      advantages: pageData.content?.electrician?.features?.map((f: string) => {
        const [title, iconName, desc] = f.split('|').map((s) => s.trim());
        return { title, desc, icon: iconMap[iconName] || BookOpen };
      }) || []
    },
    company: {
      title: pageData.content?.company?.title || "Entreprises & Installateurs",
      subtitle: pageData.content?.company?.subtitle || "Fluidifiez vos opérations et certifiez votre qualité",
      color: "blue",
      icon: Building2,
      advantages: pageData.content?.company?.features?.map((f: string) => {
        const [title, iconName, desc] = f.split('|').map((s) => s.trim());
        return { title, desc, icon: iconMap[iconName] || Briefcase };
      }) || []
    },
    member: {
      title: pageData.content?.member?.title || "Membres de l'Association",
      subtitle: pageData.content?.member?.subtitle || "Le cœur de l'expertise électrique au Sénégal",
      color: "indigo",
      icon: Users,
      advantages: pageData.content?.member?.features?.map((f: string) => {
        const [title, iconName, desc] = f.split('|').map((s) => s.trim());
        return { title, desc, icon: iconMap[iconName] || ShieldCheck };
      }) || []
    }
  };

  const active = content[selected];
  const colorMap = {
    emerald: 'from-emerald-600 to-teal-700',
    blue: 'from-blue-600 to-cyan-700',
    indigo: 'from-indigo-600 to-violet-700'
  };

  const bgMap = {
    emerald: 'bg-emerald-50',
    blue: 'bg-blue-50',
    indigo: 'bg-indigo-50'
  };

  return (
    <div className={cn("min-h-screen transition-colors duration-700 flex flex-col", bgMap[active.color as keyof typeof bgMap])}>
            <SEO
        title={`Avantages - ${active.title}`}
        description={`Découvrez les avantages exclusifs de PROQUELEC pour les ${active.title.toLowerCase()}.`} />
      
            <Header solid={true} />

            <main className="flex-grow">
                {heroData &&
        <HeroSection
          badge={heroData.features?.[0] || "Exclusivités"}
          title={heroData.title}
          subtitle={heroData.subtitle}
          description={heroData.features?.slice(1).join(' • ')}
          image={heroData.image}
          gradient="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

        }

                <div className="max-w-7xl mx-auto px-4 py-20">
                    {/* Selector */}
                    <div className="flex justify-center mb-16 px-2">
                        <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-xl flex gap-2 border border-white/50">
                            {(Object.keys(content) as UserType[]).map((key) => {
                const item = content[key];
                const isActive = selected === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelected(key)}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300",
                      isActive ?
                      `bg-gradient-to-r ${colorMap[item.color as keyof typeof colorMap]} text-white shadow-lg scale-105` :
                      "text-slate-500 hover:bg-slate-100"
                    )} aria-label="Action">
                    
                                        <item.icon className="w-5 h-5" />
                                        <span className="hidden md:inline">{item.title}</span>
                                    </button>);

              })}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
              key={selected}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="space-y-12">
              
                            {/* Hero */}
                            <div className="text-center space-y-4">
                                <h2 className={cn(
                  "text-5xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b",
                  colorMap[active.color as keyof typeof colorMap]
                )}>
                                    {active.title}
                                </h2>
                                <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto">
                                    {active.subtitle}
                                </p>
                            </div>

                            {/* Grid */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                                {active.advantages.map((adv: unknown, i: number) =>
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 group">
                  
                                        <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3",
                    selected === 'electrician' ? 'bg-emerald-100 text-emerald-600' :
                    selected === 'company' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'
                  )}>
                                            <adv.icon className="w-7 h-7" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-3">{adv.title}</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed">
                                            {adv.desc}
                                        </p>
                                    </motion.div>
                )}
                            </div>

                            {/* CTA */}
                            <div className="flex justify-center pt-8">
                                <button className={cn(
                  "group flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-lg text-white shadow-2xl hover:scale-105 transition-all bg-gradient-to-r",
                  colorMap[active.color as keyof typeof colorMap]
                )}>
                                    Accéder à mon espace {active.title}
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
            <Footer />
            <ScrollToTopButton aria-label="Action" />
        </div>);

}