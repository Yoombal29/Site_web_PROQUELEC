import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import {
  BookOpen, Clock, CheckCircle2, ArrowRight, Zap,
  ShieldCheck, GraduationCap, Calendar, Layers, BarChart3,
  Award, Target, Users, LayoutDashboard, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLiveSettings } from "@/hooks/useLiveSettings";
import { motion } from "framer-motion";

const iconMap: Record<string, React.ElementType> = {
  Layers, ShieldCheck, Zap, BookOpen, Clock, GraduationCap, BarChart3, Calendar, Award, Target, Users, LayoutDashboard, Settings
};

const DEFAULT_CATEGORIES = [
  {
    title: "Normes Électriques",
    desc: "Maîtrisez la norme SN 01-015 et garantissez des installations 100% conformes et sécurisées.",
    icon: BookOpen
  },
  {
    title: "Efficacité Énergétique",
    desc: "Apprenez à optimiser la consommation énergétique pour des bâtiments durables et économiques.",
    icon: Zap
  },
  {
    title: "Habilitation Électrique",
    desc: "Obtenez les certifications nécessaires pour intervenir en toute sécurité sur les installations.",
    icon: ShieldCheck
  }
];

const DEFAULT_STATS = [
  { value: "25+", label: "Années d'expérience", desc: "Dans la formation professionnelle." },
  { value: "10k+", label: "Professionnels formés", desc: "À travers tout le territoire." },
  { value: "50+", label: "Experts formateurs", desc: "Des ingénieurs certifiés et reconnus." },
  { value: "100%", label: "Taux de satisfaction", desc: "Nos apprenants recommandent PROQUELEC." },
];

const Trainings = () => {
  const { settings } = useLiveSettings();
  const pageData = settings?.page_sections?.trainings;

  const heroData = pageData?.content?.hero;
  const categoriesData = pageData?.content?.categories;
  const statsData = pageData?.content?.stats;

  const categories = categoriesData?.features?.length > 0 
    ? categoriesData.features.map((f: string) => {
        const [title, iconName, desc] = f.split('|').map((s) => s.trim());
        return { title, desc, icon: iconMap[iconName] || Layers };
      })
    : DEFAULT_CATEGORIES;

  const stats = statsData?.features?.length > 0
    ? statsData.features.map((f: string) => {
        const [value, label, desc] = f.split('|').map((s) => s.trim());
        return { value, label, desc };
      })
    : DEFAULT_STATS;

  const heroTitle = heroData?.title || "Propulsez Votre Expertise.";
  const heroSubtitle = heroData?.subtitle || "Le centre de formation PROQUELEC accompagne les professionnels du Sénégal vers la maîtrise totale des normes et de la sécurité électrique.";
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SEO
        title="Centre de Formation - PROQUELEC"
        description="Améliorez vos compétences avec les formations expertes de PROQUELEC. Excellence et sécurité électrique."
      />
      
      <Header solid={true} />

      <main className="flex-grow pt-24">
        {/* Immersive Hero */}
        <section className="bg-slate-900 pt-32 pb-48 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/p5.png')] opacity-10"></div>
          {/* Ambient Lighting */}
          <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[80%] bg-blue-600/20 blur-[150px] rounded-full"></div>
          <div className="absolute top-[-20%] right-[10%] w-[40%] h-[60%] bg-indigo-600/20 blur-[120px] rounded-full"></div>

          <div className="container max-w-7xl mx-auto px-4 relative z-10 text-center space-y-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-[0.2em] backdrop-blur-md"
            >
              <GraduationCap className="w-4 h-4" /> Académie Nationale
            </motion.div>
            
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight"
            >
              Propulsez Votre <br className="hidden md:block" /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                Expertise Technique
              </span>.
            </motion.h1>
            
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed"
            >
              {heroSubtitle}
            </motion.p>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4 pt-8"
            >
              <Link to="/formation-certification#catalogue">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-8 text-lg rounded-xl shadow-xl shadow-blue-900/50 transition-all hover:scale-105">
                  Explorer le Catalogue
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-32 px-4 bg-white relative">
          <div className="container max-w-7xl mx-auto">
            <div className="text-center mb-24 space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                {categoriesData?.title || "Domaines d'Excellence"}
              </h2>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto font-light">
                {categoriesData?.subtitle || "Une pédagogie axée sur la pratique et la sécurité absolue."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {categories.map((cat: { title: string; desc: string; icon: React.ElementType }, idx: number) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -8 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group p-10 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-blue-900/5 hover:border-blue-100 transition-all duration-500 flex flex-col"
                >
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                    <cat.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{cat.title}</h3>
                  <p className="text-slate-600 leading-relaxed font-light mb-8 flex-grow">
                    {cat.desc}
                  </p>
                  <Link to="/formation-certification" className="inline-flex items-center gap-2 text-blue-600 font-bold uppercase tracking-wider text-sm hover:gap-3 transition-all mt-auto">
                    Voir les cours <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Stats */}
        <section className="py-32 bg-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=2000')] bg-cover bg-center opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-slate-900/90"></div>
          
          <div className="container max-w-7xl mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-full text-blue-300 text-sm font-bold backdrop-blur-md">
                  <Award className="w-4 h-4" /> Certification Reconnue
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                  {statsData?.title || "L'Excellence Reconnue par les Professionnels"}
                </h2>
                <p className="text-xl text-blue-100/70 font-light leading-relaxed">
                  {statsData?.subtitle || "Depuis plus de deux décennies, nous formons l'élite des électriciens et techniciens en sécurité énergétique du Sénégal."}
                </p>
                
                <div className="grid grid-cols-2 gap-6 pt-6">
                  {stats.slice(0, 4).map((stat: { value: string; label: string; desc: string }, idx: number) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="border-l-2 border-blue-500 pl-6"
                    >
                      <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
                      <div className="text-sm font-bold text-blue-400 mb-1">{stat.label}</div>
                      <div className="text-sm text-slate-400 font-light">{stat.desc}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div className="relative hidden lg:block">
                <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                  <img
                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80"
                    alt="Formation PROQUELEC"
                    className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105" 
                    loading="lazy" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                  
                  <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg">Agréé par l'État</p>
                        <p className="text-blue-200 text-sm">Validité sur tout le territoire national</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global CTA */}
        <section className="py-32 bg-slate-50 relative overflow-hidden">
          <div className="container max-w-4xl mx-auto px-4 relative z-10 text-center space-y-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full text-blue-600 mb-2 shadow-lg shadow-blue-100">
              <Calendar className="w-10 h-10" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Prêt à passer au niveau <span className="text-blue-600">supérieur</span> ?
            </h2>
            <p className="text-xl text-slate-500 font-light max-w-2xl mx-auto">
              Rejoignez nos prochaines sessions de formation et garantissez la conformité de vos futures installations.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link to="/formation-certification">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-8 text-lg rounded-xl shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1">
                  Voir le Calendrier
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 font-bold h-14 px-8 text-lg rounded-xl transition-all hover:-translate-y-1">
                  Demander un devis
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default Trainings;