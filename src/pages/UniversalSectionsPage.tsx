import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { useLiveSettings } from "@/hooks/useLiveSettings";
import { cn } from "@/lib/utils";
import { DEFAULT_PAGE_SECTIONS } from "@/data/defaultPageSections";

import { SectionRenderer } from "@/components/cms/SectionRenderer";


interface UniversalSectionsPageProps {
  pageKey: string;
  defaultIcon?: keyof typeof LucideIcons;
  themeColor?: string;
  themeGradient?: string;
}

export default function UniversalSectionsPage({
  pageKey,
  defaultIcon = "Layout",
  themeColor = "blue",
  themeGradient = "from-blue-600 to-indigo-900"
}: UniversalSectionsPageProps) {
  const { settings } = useLiveSettings();
  const [searchParams] = useSearchParams();

  // Use CMS data if available, otherwise fallback to defaults
  const pageData = settings?.page_sections?.[pageKey] || (DEFAULT_PAGE_SECTIONS as unknown)[pageKey];
  const [activeSection, setActiveSection] = useState<string>('');

  const sections = pageData?.sections || [];

  useEffect(() => {
    if (sections.length > 0 && !activeSection) {
      const hash = window.location.hash.replace('#', '');
      if (hash && sections.find((s: unknown) => s.id === hash)) {
        setActiveSection(hash);
      } else {
        setActiveSection(sections[0].id);
      }
    }
  }, [sections]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && sections.find((s: unknown) => s.id === hash)) {
        setActiveSection(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [sections]);

  const handleSectionChange = (id: string) => {
    setActiveSection(id);
    window.location.hash = id;
  };

  if (!pageData) {
    return (
      <div className="min-h-screen flex flex-col pt-32 items-center text-slate-400">
                <LucideIcons.AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                <p>Données non configurées pour la page "{pageKey}"</p>
            </div>);

  }

  const currentSectionLabel = sections.find((s: unknown) => s.id === activeSection)?.label || '';

  // Check if page uses custom HTML
  const isHTMLMode = pageData?.renderMode === 'html';
  const customHTML = pageData?.customHTML || '';

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
            <SEO
        title={`${pageData?.hero_title || 'Espace'} - PROQUELEC`}
        description={pageData?.hero_subtitle || "Espace dédié PROQUELEC"} />
      
            <Header solid={true} />

            <main className="flex-grow pt-24">
                {isHTMLMode ?
        // Custom HTML Mode
        <section className="py-24 px-4 bg-white min-h-screen">
                        <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: customHTML }} />
          
                    </section> :

        // Sections Mode
        <>
                        {/* Hero */}
                        <section className="bg-slate-900 pt-32 pb-48 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                            <div className={cn("absolute top-0 right-0 w-1/2 h-full blur-[120px] rounded-full opacity-20", `bg-${themeColor}-600`)}></div>

                            <div className="container max-w-7xl mx-auto px-4 relative z-10 text-center space-y-8">
                                <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 border rounded-full text-xs font-black uppercase tracking-[0.2em]",
                  `bg-${themeColor}-500/10 border-${themeColor}-500/20 text-${themeColor}-400`
                )}>
                
                                    {React.createElement((LucideIcons as unknown)[defaultIcon] || LucideIcons.Layout, { className: "w-4 h-4" })} {pageData.badge || 'PROQUELEC'}
                                </motion.div>
                                <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
                                    {pageData.hero_title?.split('|').map((part: string, i: number) =>
                <React.Fragment key={i}>
                                            {i > 0 && <br />}
                                            <span className={i === 1 ? `text-${themeColor}-600` : ''}>{part}</span>
                                        </React.Fragment>
                ) || pageKey}
                                </h1>
                                <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
                                    {pageData.hero_subtitle}
                                </p>
                            </div>
                        </section>

                        {/* Sticky Nav */}
                        <div className="sticky top-[var(--effective-header-height,110px)] z-[40] mt-[-60px] flex justify-center px-4 w-full">
                            <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-full p-1.5 max-w-full overflow-hidden">
                                <div className="flex items-center gap-1 md:gap-2 overflow-x-auto max-w-[90vw] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] px-1">
                                    {sections.map((section: unknown) => {
                  const isActive = activeSection === section.id;
                  const Icon = (LucideIcons as unknown)[section.icon] || LucideIcons.Layout;
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionChange(section.id)}
                      className={cn(
                        "group flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap",
                        isActive ?
                        "bg-slate-900 text-white shadow-lg ring-1 translate-y-[-1px]" :
                        "text-slate-500 hover:bg-white hover:shadow-md",
                        isActive ? `ring-${themeColor}-500/20` : `hover:text-${themeColor}-600`
                      )} aria-label="Action">
                      
                                                <Icon className={cn("w-4 h-4 transition-colors duration-300", isActive ? `text-${themeColor}-400` : "text-slate-400")} />
                                                {section.label}
                                            </button>);

                })}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <section className="py-24 px-4 bg-white min-h-[600px]">
                            <div className="container max-w-7xl mx-auto">
                                <AnimatePresence mode="wait">
                                    <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}>
                  
                                        <div className={cn("mb-12 border-l-4 pl-8", `border-${themeColor}-600`)}>
                                            <span className={cn("font-black uppercase tracking-widest text-sm", `text-${themeColor}-600`)}>{pageData.label || 'Services'} / {currentSectionLabel}</span>
                                            <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">{currentSectionLabel}</h2>
                                        </div>

                                        <div className="mt-20">
                                            <SectionRenderer
                      section={{
                        ...pageData.content?.[activeSection],
                        id: activeSection,
                        type: pageData.content?.[activeSection]?.type || 'text-image'
                      }}
                      themeColor={themeColor} />
                    
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </section>
                    </>
        }
            </main>

            <Footer />
            <ScrollToTopButton aria-label="Action" />
        </div>);

}