import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import {
  Mail, Phone, MapPin, MessageSquare, Stethoscope,
  Send, CheckCircle2, ArrowRight } from
"lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { useLiveSettings } from "@/hooks/useLiveSettings";
import { cn } from "@/lib/utils";

// --- Types & Data ---

type ContactSection = 'formulaire' | 'coordonnees' | 'carte' | 'conseil' | 'diagnostic';

interface SectionConfig {
  id: ContactSection;
  label: string;
  icon: unknown;
}

const sections: SectionConfig[] = [
{ id: 'formulaire', label: 'Message', icon: Mail },
{ id: 'conseil', label: 'Besoin de Conseil', icon: MessageSquare },
{ id: 'diagnostic', label: 'Demande Diagnostic', icon: Stethoscope },
{ id: 'coordonnees', label: 'Coordonnées', icon: Phone },
{ id: 'carte', label: 'Nous Trouver', icon: MapPin }];

const iconMap: Record<string, unknown> = {
  Mail, Phone, MapPin, MessageSquare, Stethoscope, Send, CheckCircle2, ArrowRight
};

const SectionContent = ({ id, settings }: {id: ContactSection;settings: unknown;}) => {
  const pageData = settings?.page_sections?.contact;
  const data = pageData?.content?.[id];

  // In contact page, we have special renderers for some IDs
  // but we can still use dynamic data for titles/subtitles if provided.

  if (id === 'formulaire' || id === 'conseil' || id === 'diagnostic') {
    const isDiagnostic = id === 'diagnostic';
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="text-center mb-10 space-y-4">
                    <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                        {data?.title || (isDiagnostic ? "Demander un Diagnostic" : "Envoyez-nous un message")}
                    </h3>
                    <p className="text-slate-500 text-lg">
                        {data?.subtitle || (isDiagnostic ?
            "Nos experts évalueront la conformité de votre installation. Réponse sous 48h." :
            "Une question, une suggestion ou une demande d'information ? Nous sommes à votre écoute.")}
                    </p>
                </div>

                <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Nom Complet</label>
                            <input type="text" className="w-full px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all" placeholder="Ex: Moussa Diop" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Email</label>
                            <input type="email" className="w-full px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all" placeholder="votre@email.com" />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Téléphone</label>
                            <input type="tel" className="w-full px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all" placeholder="+221 77..." />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="contact-subject" className="text-sm font-bold text-slate-700 uppercase tracking-wide">Sujet</label>
                            <select id="contact-subject" title="Sujet du message" className="w-full px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all appearance-none">
                                <option>Sélectionnez un sujet...</option>
                                <option>Renseignements généraux</option>
                                <option>Demande de devis</option>
                                <option>Partenariat</option>
                                <option>Autre</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wide">Votre Message</label>
                        <textarea rows={5} className="w-full px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all" placeholder="Détaillez votre demande ici..."></textarea>
                    </div>

                    <button type="button" className="w-full py-5 bg-green-600 text-white rounded-xl font-black text-lg shadow-xl shadow-green-600/20 hover:bg-green-700 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                        <Send className="w-5 h-5" /> Envoyer la demande
                    </button>
                </form>
            </div>);

  }

  if (id === 'coordonnees') {
    return (
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {[
        { icon: Phone, title: "Téléphone", content: "+221 33 848 68 55", sub: "Du Lundi au Vendredi, 8h-17h", color: "blue" },
        { icon: Mail, title: "Email", content: "proquelec@proquelec.sn", sub: "Réponse sous 24h ouvrées", color: "green" },
        { icon: MapPin, title: "Siège Social", content: "Immeuble Coumba Castel, 12 rue Saint-Michel, 4e étage", sub: "Dakar, Sénégal", color: "orange" }].
        map((item, idx) =>
        <motion.div
          key={idx}
          className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all text-center space-y-4 group"
          whileHover={{ y: -5 }}>
          
                        <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-${item.color}-50 text-${item.color}-600 group-hover:bg-${item.color}-600 group-hover:text-white transition-all`}>
                            <item.icon className="w-8 h-8" />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-slate-900 mb-1">{item.title}</h4>
                            <p className="text-lg font-bold text-slate-700">{item.content}</p>
                            <p className="text-sm text-slate-400">{item.sub}</p>
                        </div>
                    </motion.div>
        )}
            </div>);

  }

  if (id === 'carte') {
    return (
      <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 h-[500px] relative animate-in fade-in zoom-in duration-700">
                <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3859.083164966779!2d-17.46747962426365!3d14.707960985790884!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xec172f5b5b5b5b5%3A0x5b5b5b5b5b5b5b5b!2sDakar%2C%20S%C3%A9n%C3%A9gal!5e0!3m2!1sfr!2sfr!4v1620000000000!5m2!1sfr!2sfr"
          width="100%"
          height="100%"
          title="Carte de localisation du siège de PROQUELEC"
          allowFullScreen={true}
          loading="lazy"
          className="grayscale hover:grayscale-0 transition-all duration-700 border-0">
        </iframe>
                <div className="absolute bottom-8 left-8 bg-white p-6 rounded-2xl shadow-xl max-w-xs hidden md:block">
                    <h4 className="font-black text-slate-900 mb-2">PROQUELEC Siège</h4>
                    <p className="text-sm text-slate-500">
                        Situé au cœur de Dakar, notre siège est ouvert au public pour vos démarches administratives.
                    </p>
                    <button className="mt-4 text-xs font-bold text-green-600 uppercase tracking-widest hover:underline flex items-center gap-1">
                        Itinéraire <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            </div>);

  }

  return null;
};

// --- Main Page ---

export default function ContactPremium() {
  const { settings } = useLiveSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  const pageData = settings?.page_sections?.contact;
  const dynamicSections: SectionConfig[] = pageData?.sections?.map((s: unknown) => ({
    id: s.id,
    label: s.label,
    icon: iconMap[s.icon] || Mail
  })) || sections;

  const [activeSection, setActiveSection] = useState<ContactSection>(dynamicSections[0]?.id as ContactSection || 'formulaire');

  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as ContactSection;
    if (hash && dynamicSections.find((s) => s.id === hash)) {
      setActiveSection(hash);
    }
  }, [window.location.hash, dynamicSections]);

  const handleSectionChange = (id: ContactSection) => {
    setActiveSection(id);
    window.location.hash = id;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
            <SEO
        title="Contact & Diagnostic - PROQUELEC"
        description="Contactez PROQUELEC pour toute demande de renseignement, devis ou diagnostic de conformité électrique. Nous sommes à votre écoute." />
      
            <Header solid={true} />

            <main className="flex-grow pt-24">
                {/* Hero Minimalist (Green/Emerald Theme) */}
                <section className="bg-slate-900 pt-32 pb-48 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10"></div>
                    {/* Ambient Glow */}
                    <div className="absolute top-[0%] left-[0%] w-[100%] h-[100%] bg-green-600/10 blur-[150px]"></div>

                    <div className="container max-w-7xl mx-auto px-4 relative z-10 text-center space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-black uppercase tracking-[0.2em]">
                            <MessageSquare className="w-4 h-4" /> Service Client
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
                            Parlons de votre <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Sécurité</span>.
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
                            Nos équipes sont disponibles pour répondre à toutes vos interrogations et vous accompagner dans vos projets.
                        </p>
                    </div>
                </section>

                {/* Sticky Nav Floating Capsule (Green Variation) */}
                <div className="sticky top-24 z-[40] mt-[-60px] flex justify-center px-4 w-full">
                    <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl shadow-green-900/5 rounded-full p-1.5 max-w-full overflow-hidden">
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
                      "bg-slate-900 text-white shadow-lg ring-1 ring-green-500/20 translate-y-[-1px]" :
                      "text-slate-500 hover:bg-white hover:text-green-600 hover:shadow-md"
                    )} aria-label="Action">
                    
                                        <section.icon className={cn("w-4 h-4 transition-colors duration-300", isActive ? "text-green-400" : "text-slate-400 group-hover:text-green-600")} />
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
                
                                <div className="mb-12 border-l-4 border-green-500 pl-8">
                                    <span className="text-green-600 font-black uppercase tracking-widest text-sm">Contact / {dynamicSections.find((s) => s.id === activeSection)?.label}</span>
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