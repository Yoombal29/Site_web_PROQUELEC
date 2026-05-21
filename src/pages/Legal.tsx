import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { ShieldCheck, Scale, Lock, FileText, ArrowRight } from "lucide-react";
import { useLiveSettings } from "@/hooks/useLiveSettings";
import { motion } from "framer-motion";

export default function Legal() {
  const { settings } = useLiveSettings();
  const pageData = settings?.page_sections?.legal;

  if (!pageData) return null;

  const contentData = pageData.content?.content;

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      <SEO
        title="Mentions Légales - PROQUELEC"
        description="Consultez les mentions légales, la politique de confidentialité et les conditions d'utilisation de PROQUELEC." />
      

      <Header solid={true} />

      <main className="flex-grow pt-24">
        {/* Institutional Hero */}
        <section className="bg-slate-900 pt-32 pb-48 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')] opacity-5"></div>
          {/* Ambient Lighting */}
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[80%] bg-blue-600/10 blur-[150px] rounded-full"></div>

          <div className="container max-w-7xl mx-auto px-4 relative z-10 text-center space-y-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-[0.2em]">
              
              <ShieldCheck className="w-4 h-4" /> Conformité & Transparence
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
              Cadre <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Légal</span>.
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
              PROQUELEC s'engage à respecter les normes de transparence et de protection des données en vigueur au Sénégal.
            </p>
          </div>
        </section>

        {/* Legal Content Section */}
        <section className="py-24 px-4 bg-white relative">
          <div className="container max-w-5xl mx-auto">
            <div className="sticky top-24 z-[40] mt-[-100px] mb-20 flex justify-center">
              <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-full p-2 flex items-center gap-4 px-8 py-4">
                <div className="flex items-center gap-2 text-slate-900 font-black uppercase tracking-widest text-[10px] bg-slate-100 px-4 py-2 rounded-full">
                  <Scale className="w-3 h-3 text-blue-600" /> Mentions Légales
                </div>
                <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px] px-2">
                  <Lock className="w-3 h-3" /> Confidentialité
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="bg-slate-50 p-10 md:p-16 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{contentData?.title || "Informations Légales"}</h2>
                </div>

                <div className="prose prose-lg prose-slate max-w-none font-light leading-relaxed text-slate-600 space-y-6">
                  {contentData?.features?.map((feature: string, idx: number) =>
                  <div key={idx} className="flex gap-4 p-6 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2.5 flex-shrink-0"></div>
                      <p className="font-medium text-slate-800">{feature}</p>
                    </div>
                  )}
                  <p className="pt-8 text-sm italic text-slate-400">
                    Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Support CTA */}
        <section className="py-24 bg-slate-900 overflow-hidden relative text-center">
          <div className="container max-w-4xl mx-auto px-4 space-y-8">
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
              Une question d'ordre <span className="text-blue-500">Juridique</span> ?
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
              Notre service juridique est à votre disposition pour toute précision concernant nos conditions générales ou la protection de vos données.
            </p>
            <div className="flex justify-center pt-4">
              <button className="bg-white text-slate-900 px-10 py-5 rounded-2xl font-black shadow-xl hover:scale-105 transition-all flex items-center gap-2">
                Contacter le Service Juridique <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTopButton aria-label="Action" />
    </div>);

}