import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PhotoVideoGallery } from "@/components/PhotoVideoGallery";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { Zap, Camera, Play, Sparkles, ArrowRight } from "lucide-react";
import { useLiveSettings } from "@/hooks/useLiveSettings";
import { motion } from "framer-motion";

export default function Showroom() {
  const { settings } = useLiveSettings();
  const pageData = settings?.page_sections?.showroom;

  if (!pageData) return null;

  const heroData = pageData.content?.hero;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
            <SEO
        title="Showroom Technique - PROQUELEC"
        description="Explorez nos installations électriques conformes aux normes NFC 15-100 à travers notre showroom interactif immersif." />
      

            <Header solid={true} />

            <main className="flex-grow pt-24">
                {/* Immersive Showroom Hero */}
                <section className="bg-slate-900 pt-32 pb-48 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/p5.png')] opacity-10"></div>
                    {/* Focal Lighting */}
                    <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[80%] bg-blue-600/20 blur-[150px] rounded-full"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[80%] bg-indigo-600/10 blur-[150px] rounded-full"></div>

                    <div className="container max-w-7xl mx-auto px-4 relative z-10 text-center space-y-8">
                        <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-[0.2em]">
              
                            <Sparkles className="w-4 h-4" /> Expérience Immersive
                        </motion.div>
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
                            La Conformité en <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Action</span>.
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
                            Découvrez nos projets emblématiques et nos démonstrations techniques à travers une galerie média haute définition.
                        </p>
                    </div>
                </section>

                {/* Showroom Content Area */}
                <section className="py-24 px-4 bg-white relative">
                    <div className="container max-w-7xl mx-auto">
                        <div className="sticky top-24 z-[40] mt-[-100px] mb-20 flex justify-center">
                            <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-full p-2 flex items-center gap-6 px-10 py-5">
                                <div className="flex items-center gap-2 text-slate-900 font-black uppercase tracking-widest text-xs border-r border-slate-200 pr-6">
                                    <Camera className="w-4 h-4 text-blue-600" /> Photothèque
                                </div>
                                <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-xs">
                                    <Play className="w-4 h-4" /> Vidéos Techniques
                                </div>
                            </div>
                        </div>

                        <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
                            <PhotoVideoGallery />
                        </div>
                    </div>
                </section>

                {/* Global CTA - Showroom Specific */}
                <section className="py-32 bg-slate-900 overflow-hidden relative">
                    <div className="absolute inset-0 bg-blue-900/10"></div>
                    <div className="container max-w-4xl mx-auto px-4 text-center relative z-10 space-y-12">
                        <div className="inline-block p-6 rounded-[2rem] bg-blue-600/10 border border-blue-500/20 mb-4 animate-pulse">
                            <Zap className="w-12 h-12 text-blue-500" />
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-tight">
                            Votre Projet Mérite <br /><span className="text-blue-500">l'Excellence Normative</span>.
                        </h2>
                        <p className="text-slate-400 text-xl font-light italic leading-relaxed max-w-2xl mx-auto">
                            Que vous soyez un particulier ou une grande entreprise, nos experts vous accompagnent pour transformer vos installations.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6 pt-6">
                            <button className="bg-blue-600 text-white px-12 py-6 rounded-2xl font-black text-lg shadow-2xl shadow-blue-600/20 hover:scale-105 hover:bg-blue-500 transition-all flex items-center gap-3">
                                Devenir Partenaire Certifié <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
            <ScrollToTopButton aria-label="Action" />
        </div>);

}