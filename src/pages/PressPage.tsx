
import React from 'react';
import { motion } from "framer-motion";
import {

  Download,
  Mail,
  Phone,
  Calendar,
  ArrowRight,
  Newspaper,
  Image as ImageIcon,
  Share2 } from
'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const PressPage = () => {
  const pressReleases = [
  {
    id: 1,
    date: "12 Octobre 2023",
    title: "PROQUELEC lance sa nouvelle plateforme d'innovation",
    excerpt: "Une avancée majeure pour le secteur électrique en Côte d'Ivoire avec le lancement du Lab Expert.",
    category: "Innovation",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 2,
    date: "05 Septembre 2023",
    title: "Partenariat stratégique pour la sécurité électrique",
    excerpt: "Signature d'un accord historique visant à renforcer les normes de sécurité dans les zones rurales.",
    category: "Partenariat",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2923216?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 3,
    date: "20 Août 2023",
    title: "Rapport Annuel 2022 : Une croissance soutenue",
    excerpt: "PROQUELEC annonce des résultats records et un impact social sans précédent pour l'année écoulée.",
    category: "Finance",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"
  }];


  const pressKit = [
  { title: "Dossier de Presse 2023", size: "4.2 MB", type: "PDF" },
  { title: "Pack Logos Haute Résolution", size: "12.5 MB", type: "ZIP" },
  { title: "Photos de Direction", size: "8.1 MB", type: "JPG" },
  { title: "Infographies Clés", size: "3.7 MB", type: "PDF" }];


  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
            <Header solid={true} />

            <main className="flex-grow pt-12 pb-20 px-4 md:px-8">
                {/* Hero Section */}
                <section className="max-w-6xl mx-auto mb-20 text-center">
                    <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}>
            
                        <Badge variant="outline" className="mb-4 border-proqblue text-proqblue py-1 px-4 text-sm font-medium">
                            Espace Médias
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
                            Espace <span className="text-proqblue">Presse</span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                            Retrouvez nos derniers communiqués, dossiers de presse et ressources multimédias pour les professionnels de l'information.
                        </p>
                    </motion.div>
                </section>

                {/* Latest Releases Grid */}
                <section className="max-w-6xl mx-auto mb-32">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Newspaper className="text-proqblue" />
                            Communiqués Récents
                        </h2>
                        <Button variant="ghost" className="text-proqblue font-semibold flex items-center gap-1 hover:underline transition-all h-auto p-0" title="Voir tous les communiqués">
                            Tout voir <ArrowRight size={16} />
                        </Button>
                    </div>

                    <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}>
            
                        {pressReleases.map((release) =>
            <motion.div key={release.id} variants={itemVariants}>
                                <Card className="h-full border-none shadow-xl shadow-slate-200/50 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 bg-white group">
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                    src={release.image}
                    alt={release.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                  
                                        <div className="absolute top-4 left-4">
                                            <Badge className="bg-proqblue/90 backdrop-blur-md border-none">{release.category}</Badge>
                                        </div>
                                    </div>
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-2 text-slate-400 text-sm mb-3 font-medium">
                                            <Calendar size={14} />
                                            {release.date}
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-proqblue transition-colors">
                                            {release.title}
                                        </h3>
                                        <p className="text-slate-600 text-sm mb-6 line-clamp-2 leading-relaxed">
                                            {release.excerpt}
                                        </p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <Button variant="ghost" className="flex items-center gap-2 text-sm font-bold text-proqblue group/btn hover:bg-transparent h-auto p-0" title="Lire la suite du communiqué">
                                                Lire la suite
                                                <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-proqblue transition-colors" title="Partager ce communiqué">
                                                <Share2 size={18} />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
            )}
                    </motion.div>
                </section>

                {/* Press Kit & Contact Section */}
                <section className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                        {/* Press Kit */}
                        <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-proqblue p-8 md:p-12 rounded-[2rem] text-white shadow-2xl shadow-proqblue/20 relative overflow-hidden">
              
                            <div className="relative z-10">
                                <h2 className="text-3xl font-black mb-4 flex items-center gap-3">
                                    <ImageIcon className="text-blue-200" />
                                    Kit Médias
                                </h2>
                                <p className="text-blue-100 mb-10 leading-relaxed font-medium">
                                    Téléchargez nos ressources officielles pour vos articles et publications.
                                </p>

                                <div className="space-y-4">
                                    {pressKit.map((item, idx) =>
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 hover:bg-white/20 transition-all cursor-pointer group">
                    
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xs">
                                                    {item.type}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm md:text-base">{item.title}</div>
                                                    <div className="text-xs text-blue-200">{item.size}</div>
                                                </div>
                                            </div>
                                            <Download size={20} className="text-white group-hover:translate-y-1 transition-transform" />
                                        </div>
                  )}
                                </div>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl"></div>
                        </motion.div>

                        {/* Contact Card */}
                        <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white p-8 md:p-12 rounded-[2rem] border border-slate-200 flex flex-col justify-center shadow-xl shadow-slate-100">
              
                            <h2 className="text-3xl font-black text-slate-900 mb-4 flex items-center gap-3">
                                <Mail className="text-proqblue" />
                                Contact Presse
                            </h2>
                            <p className="text-slate-600 mb-10 leading-relaxed">
                                Notre équipe est à votre disposition pour toute demande de interview, information complémentaire ou accès au terrain.
                            </p>

                            <div className="space-y-8">
                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-proqblue">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">E-mail de contact</div>
                                        <div className="text-lg font-black text-slate-900 border-b-2 border-slate-100 pb-1 hover:border-proqblue transition-colors cursor-pointer inline-block">
                                            presse@proquelec.ci
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-proqblue">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Ligne Directe</div>
                                        <div className="text-lg font-black text-slate-900">
                                            +225 07 00 00 00 00
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <p className="text-sm font-medium text-slate-500 italic">
                                    "Nous nous engageons à répondre à toutes les sollicitations médiatiques sous 24h ouvrées."
                                </p>
                            </div>
                        </motion.div>

                    </div>
                </section>
            </main>

            <Footer />
        </div>);

};

export default PressPage;