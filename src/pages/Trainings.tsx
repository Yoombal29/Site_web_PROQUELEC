import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import {
  BookOpen, Clock, CheckCircle2, ArrowRight, Zap,
  ShieldCheck, GraduationCap, Calendar, Layers, BarChart3,
  Award, Target } from
"lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLiveSettings } from "@/hooks/useLiveSettings";
import { motion } from "framer-motion";

const iconMap: Record<string, unknown> = {
  Layers, ShieldCheck, Zap, BookOpen, Clock, GraduationCap, BarChart3, Calendar, Award, Target
};

const Trainings = () => {
  const { settings } = useLiveSettings();
  const pageData = settings?.page_sections?.trainings;

  if (!pageData) return null;

  const heroData = pageData.content?.hero;
  const categoriesData = pageData.content?.categories;
  const statsData = pageData.content?.stats;

  const categories = categoriesData?.features?.map((f: string) => {
    const [title, iconName, desc] = f.split('|').map((s) => s.trim());
    return { title, desc, icon: iconMap[iconName] || Layers };
  }) || [];

  const stats = statsData?.features?.map((f: string) => {
    const [value, label, desc] = f.split('|').map((s) => s.trim());
    return { value, label, desc };
  }) || [];

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      <SEO
        title="Centre de Formation - PROQUELEC"
        description="Améliorez vos compétences avec les formations expertes de PROQUELEC. Excellence et sécurité électrique." />
      

      <Header solid={true} />

      <main className="flex-grow pt-24">
        {/* Immersive Hero */}
        <section className="bg-slate-900 pt-32 pb-48 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/p5.png')] opacity-10"></div>
          {/* Ambient Lighting */}
          <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[80%] bg-blue-600/10 blur-[150px] rounded-full"></div>
          <div className="absolute top-[-20%] right-[10%] w-[40%] h-[60%] bg-indigo-600/10 blur-[120px] rounded-full"></div>

          <div className="container max-w-7xl mx-auto px-4 relative z-10 text-center space-y-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-[0.2em]">
              
              <GraduationCap className="w-4 h-4" /> Académie Nationale
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
              Propulsez Votre <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Expertise</span>.
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
              Le centre de formation PROQUELEC accompagne les professionnels du Sénégal vers la maîtrise totale des normes et de la sécurité électrique.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link to="/formation-certification#catalogue">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-black h-16 px-10 text-lg rounded-2xl shadow-2xl shadow-blue-600/20">
                  Explorer le Catalogue
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Highlight Categories */}
        <section className="py-32 px-4 bg-white relative">
          <div className="container max-w-7xl mx-auto">
            <div className="text-center mb-24 space-y-4">
              <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter">{categoriesData?.title || "Nos Domaines"}</h2>
              <p className="text-xl text-slate-500 font-light max-w-2xl mx-auto italic">
                {categoriesData?.subtitle || "Une expertise répartie sur 3 piliers fondamentaux."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {categories.map((cat: unknown, idx: number) =>
              <motion.div
                key={idx}
                whileHover={{ y: -12 }}
                className="group p-12 rounded-[3rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:border-blue-200 transition-all duration-500">
                
                  <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mb-10 shadow-xl shadow-blue-600/20 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                    <cat.icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 mb-6 tracking-tight uppercase leading-none">{cat.title}</h3>
                  <p className="text-slate-600 text-lg leading-relaxed font-light mb-10">
                    {cat.desc}
                  </p>
                  <Link to="/formation-certification" className="inline-flex items-center gap-2 text-blue-600 font-black uppercase tracking-widest text-xs hover:gap-4 transition-all">
                    Détails du programme <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* Elegant Stats */}
        <section className="py-32 bg-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-transparent"></div>
          <div className="container max-w-7xl mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-10">
                <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">{statsData?.title || "La Force du Réseau"}</h2>
                <p className="text-2xl text-slate-400 font-light italic leading-relaxed">{statsData?.subtitle || "Plus de 25 ans d'engagement pour l'excellence."}</p>
                <div className="grid grid-cols-2 gap-6 pt-4">
                  {stats.map((stat: unknown, idx: number) =>
                  <div key={idx} className="bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 group hover:bg-white/10 transition-colors">
                      <div className="text-5xl font-black text-blue-400 mb-2 group-hover:scale-110 transition-transform">{stat.value}</div>
                      <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{stat.label}</div>
                      <div className="text-sm text-slate-500 font-light">{stat.desc}</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-all duration-700">
                  <img
                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80"
                    alt="Formation PROQUELEC"
                    className="w-full h-full object-cover" loading="lazy" />
                  
                  <div className="absolute inset-0 bg-blue-900/20"></div>
                </div>
                <div className="absolute -bottom-8 -left-8 bg-white p-10 rounded-3xl shadow-xl space-y-4 max-w-[280px]">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                  <p className="text-slate-900 font-bold leading-tight uppercase tracking-tight">Certification Reconnue par l'État du Sénégal</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global CTA */}
        <section className="py-32 bg-white relative overflow-hidden text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[150px] -z-10"></div>
          <div className="container max-w-4xl mx-auto px-4 space-y-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-50 rounded-[2rem] text-blue-600 mb-4">
              <GraduationCap className="w-12 h-12" />
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 uppercase tracking-tighter leading-none">
              Inscrivez-vous <br /><span className="text-blue-600 text-6xl md:text-8xl">Maintenant</span>.
            </h2>
            <p className="text-2xl text-slate-500 font-light italic leading-relaxed">
              Ne laissez pas vos compétences stagner. Rejoignez la prochaine session certifiante.
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-6">
              <Link to="/contact">
                <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white font-black h-20 px-12 text-2xl rounded-[2rem] shadow-2xl hover:scale-105 transition-all">
                  Contacter un Conseiller
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTopButton aria-label="Action" />
    </div>);

};

export default Trainings;