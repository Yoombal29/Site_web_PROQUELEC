import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PhotoVideoGallery } from "@/components/PhotoVideoGallery";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import {
  Zap, Camera, Play, Sparkles, ArrowRight, CheckCircle2,
  Building2, Home, Factory, Sun, ShieldCheck, BarChart3,
  FileCheck, Wrench, Clock, Users, Search
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useGlobalHeader } from '@/components/MainLayout';

const stats = [
  { value: "150+", label: "Projets Accompagnés", desc: "Résidentiels, commerciaux et industriels via notre réseau de membres certifiés" },
  { value: "12", label: "Années d'Expertise", desc: "Depuis 2014 au service de la conformité électrique" },
  { value: "98%", label: "Clients Satisfaits", desc: "Taux de recommandation sur nos diagnostics et audits" },
  { value: "3 500+", label: "Diagnostics et Contrôles Effectués", desc: "Audits de sécurité et vérifications de conformité" },
];

const featuredProjects = [
  {
    title: "Complexe Industriel Thiès",
    subtitle: "Audit HT/BT",
    desc: "Audit de conformité complet et contrôle technique d'une unité de transformation agroalimentaire de 5 000 m², supervisé par nos experts.",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80",
    tags: ["HT/BT", "Industrie", "Audit"],
  },
  {
    title: "Résidence Présidentielle",
    subtitle: "Diagnostic Sécurité",
    desc: "Diagnostic de sécurité électrique avancé avec préconisations sur les systèmes de protection différentielle et mise en conformité.",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80",
    tags: ["Sécurité", "Diagnostic", "Conformité"],
  },
  {
    title: "Parc Solaire Mekhé",
    subtitle: "Contrôle Technique",
    desc: "Accompagnement dans le processus de contrôle et de certification de l'installation photovoltaïque de 2,5 MWc via COSSUEL.",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&q=80",
    tags: ["Solaire", "Contrôle", "COSSUEL"],
  },
];

const expertises = [
  { icon: Home, title: "Résidentiel", desc: "Diagnostic et contrôle des installations domestiques conformes NS 01-001, vérification des tableaux électriques et mise à la terre." },
  { icon: Building2, title: "Commercial & ERP", desc: "Audit de sécurité des bureaux, commerces et établissements recevant du public : éclairage, incendie, conformité réglementaire." },
  { icon: Factory, title: "Industriel", desc: "Contrôle technique HT/BT, inspection des armoires électriques, supervision et audit de maintenance." },
  { icon: Sun, title: "Solaire & Vert", desc: "Vérification de conformité des systèmes photovoltaïques, diagnostic des installations de stockage et onduleurs." },
];

const processSteps = [
  { icon: Search, title: "Diagnostic", desc: "Audit complet de l'existant et relevés techniques sur site.", step: "01" },
  { icon: FileCheck, title: "Conception", desc: "Planification et dimensionnement selon les normes en vigueur.", step: "02" },
  { icon: Building2, title: "Prescription", desc: "Mise en relation avec notre réseau de membres certifiés et électriciens partenaires agréés.", step: "03" },
  { icon: ShieldCheck, title: "Accompagnement COSSUEL", desc: "Accompagnement dans le processus de contrôle et d'obtention de l'attestation de conformité COSSUEL.", step: "04" },
];

const testimonials = [
  {
    name: "M. Diallo",
    role: "Directeur Technique, Groupe SENELEC",
    content: "PROQUELEC a réalisé l'audit complet de nos installations. Un professionnalisme irréprochable et une conformité totale aux normes.",
  },
  {
    name: "Mme Faye",
    role: "Chef de Projet, Ministère de l'Énergie",
    content: "Le showroom technique nous a permis de visualiser concrètement les solutions. Un outil pédagogique remarquable.",
  },
  {
    name: "M. Ndiaye",
    role: "Architecte DPLG, Dakar",
    content: "Je collabore avec PROQUELEC depuis 5 ans. Leurs diagnostics sont toujours rigoureux et parfaitement documentés, ce qui facilite mes certifications.",
  },
];

function StatCard({ value, label, desc, index }: { value: string; label: string; desc: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group"
    >
      <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 text-center h-full hover:bg-white/[0.08] transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        <div className="relative z-10">
          <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-1">
            {value}
          </div>
          <div className="text-sm font-bold text-white mb-1 uppercase tracking-widest">{label}</div>
          <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ProjectCard({ project, index }: { project: typeof featuredProjects[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-800/50 h-full hover:border-blue-500/30 transition-all duration-500">
        <div className="aspect-[16/10] overflow-hidden relative">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-full bg-blue-500/20 backdrop-blur-sm border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider text-blue-300">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="p-5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">{project.subtitle}</span>
          <h3 className="text-lg font-black text-white mt-1 group-hover:text-blue-300 transition-colors">{project.title}</h3>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">{project.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ExpertiseCard({ icon: Icon, title, desc, index }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative"
    >
      <div className="h-full rounded-2xl bg-white/5 border border-white/10 p-6 hover:border-blue-500/30 transition-all duration-500 hover:bg-white/[0.08] relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-6 h-6 text-blue-400" />
          </div>
          <h4 className="font-black text-white text-base">{title}</h4>
          <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ProcessStep({ icon: Icon, title, desc, step, index }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string; step: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="relative flex flex-col items-center text-center group"
    >
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]">
          <Icon className="w-8 h-8 text-blue-400" />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-blue-500/30">
          {step}
        </div>
      </div>
      <h4 className="font-black text-white text-sm uppercase tracking-widest mt-5 mb-2">{title}</h4>
      <p className="text-sm text-slate-400 leading-relaxed max-w-[200px]">{desc}</p>
      {index < processSteps.length - 1 && (
        <div className="hidden lg:block absolute top-10 left-[60%] w-[calc(100%-80px)] h-px bg-gradient-to-r from-blue-500/40 to-transparent pointer-events-none" />
      )}
    </motion.div>
  );
}

function TestimonialCard({ testimonial, index }: { testimonial: typeof testimonials[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative"
    >
      <div className="h-full rounded-2xl bg-white/5 border border-white/10 p-8 hover:border-white/20 transition-all duration-500 relative overflow-hidden group">
        <div className="absolute top-4 right-4 text-6xl font-black text-white/5 group-hover:text-blue-500/10 transition-colors duration-500 leading-none pointer-events-none">
          &ldquo;
        </div>
        <div className="relative z-10 space-y-5">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-4 h-4 text-orange-400 fill-orange-400" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <p className="text-slate-300 leading-relaxed text-sm italic">&ldquo;{testimonial.content}&rdquo;</p>
          <div className="flex items-center gap-3 pt-2 border-t border-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-black text-white">
              {testimonial.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{testimonial.name}</h4>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{testimonial.role}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Showroom() {
  useGlobalHeader().setHide(true);
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <SEO
        title="Showroom Technique - PROQUELEC"
        description="Parcourez nos missions de diagnostic, de contrôle technique et d'audit de conformité à travers notre showroom interactif immersif."
      />

      <Header solid={true} />

      <main className="flex-grow pt-24">
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden bg-slate-950 pt-24 pb-48">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre-v2.png')] opacity-5" />
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[80%] bg-blue-600/15 blur-[150px] rounded-full" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[80%] bg-indigo-600/10 blur-[150px] rounded-full" />
          <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-pulse" />
          <div className="absolute top-1/2 left-1/3 w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.6)] animate-pulse" style={{ animationDelay: "1s" }} />

          <div className="container max-w-7xl mx-auto px-4 relative z-10 text-center space-y-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="inline-flex items-center gap-2 px-5 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-[0.2em]"
            >
              <Sparkles className="w-4 h-4" /> Showroom Technique Immersif
            </motion.div>

            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9]"
            >
              La Conformité<br />en <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Action</span>.
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed"
            >
              Parcourez nos missions de contrôle et de diagnostic, explorez notre galerie technique haute définition
              et découvrez l'excellence normative PROQUELEC.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex flex-wrap justify-center gap-4 pt-4"
            >
              <a
                href="#galerie"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 text-white font-black text-sm uppercase tracking-wider shadow-2xl shadow-blue-600/20 hover:bg-blue-500 hover:scale-105 transition-all"
              >
                <Camera className="w-4 h-4" /> Explorer la Galerie
              </a>
              <a
                href="#missions"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/20 text-white font-black text-sm uppercase tracking-wider hover:bg-white/10 hover:scale-105 transition-all"
              >
                <Play className="w-4 h-4" /> Voir nos Missions
              </a>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Scroll</span>
            <div className="w-5 h-8 rounded-full border border-slate-700 flex justify-center pt-1.5">
              <div className="w-1 h-2 rounded-full bg-slate-500 animate-bounce" />
            </div>
          </motion.div>
        </section>

        {/* ===== STATS RIBBON ===== */}
        <section className="-mt-24 relative z-20 pb-16">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {stats.map((stat, i) => (
                <StatCard key={stat.label} {...stat} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== RÉALISATIONS PHARES ===== */}
        <section id="missions" className="py-24 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
          <div className="container max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16 space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <Building2 className="w-3.5 h-3.5" /> Projets Phares
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                Nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Missions</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light">
                Découvrez une sélection de missions de diagnostic, d'audit et de contrôle représentatives de notre savoir-faire technique.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredProjects.map((project, i) => (
                <ProjectCard key={project.title} project={project} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== EXPERTISES ===== */}
        <section className="py-24 relative overflow-hidden bg-slate-900/50">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950 pointer-events-none" />
          <div className="container max-w-7xl mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16 space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <Zap className="w-3.5 h-3.5" /> Domaines d'Intervention
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                Un Savoir-Faire <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Polyvalent</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light">
                De l'habitat individuel aux grandes installations industrielles, nous intervenons en diagnostic, audit et contrôle pour tous les secteurs.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {expertises.map((exp, i) => (
                <ExpertiseCard key={exp.title} {...exp} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== GALERIE INTERACTIVE ===== */}
        <section id="galerie" className="py-24 relative overflow-hidden bg-slate-900/30">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
          <div className="container max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16 space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <Camera className="w-3.5 h-3.5" /> Galerie Média
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                Explorer Notre <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Showroom</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light">
                Photos et vidéos haute définition de nos missions de diagnostic, de contrôle et des démonstrations techniques de notre réseau de membres certifiés.
              </p>
            </motion.div>

            <div className="sticky top-24 z-40 -mt-8 mb-12 flex justify-center">
              <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 shadow-xl rounded-full p-1.5 flex items-center gap-1 px-6 py-3">
                <div className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-xs px-4 py-2 rounded-full bg-blue-600">
                  <Camera className="w-4 h-4" /> Photothèque
                </div>
                <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-xs px-4 py-2">
                  <Play className="w-4 h-4" /> Vidéos Techniques
                </div>
              </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <PhotoVideoGallery />
            </div>
          </div>
        </section>

        {/* ===== PROCESSUS ===== */}
        <section className="py-24 relative overflow-hidden bg-slate-950">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
          <div className="container max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16 space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <BarChart3 className="w-3.5 h-3.5" /> Notre Méthodologie
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                Du Diagnostic à l'<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Accompagnement</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light">
                Un processus rigoureux en 4 étapes pour garantir la conformité normative de vos installations.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6 relative">
              {processSteps.map((step, i) => (
                <ProcessStep key={step.step} {...step} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== TESTIMONIALS ===== */}
        <section className="py-24 relative overflow-hidden bg-slate-900/50">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950 pointer-events-none" />
          <div className="container max-w-7xl mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16 space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <Users className="w-3.5 h-3.5" /> Témoignages
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                Ils Nous <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Font Confiance</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light">
                Découvrez les retours d'expérience de nos partenaires et clients.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t, i) => (
                <TestimonialCard key={t.name} testimonial={t} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA FINAL ===== */}
        <section className="py-32 relative overflow-hidden bg-slate-950">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre-v2.png')] opacity-5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[200px] rounded-full pointer-events-none" />
          <div className="container max-w-4xl mx-auto px-4 text-center relative z-10 space-y-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block p-6 rounded-[2rem] bg-blue-600/10 border border-blue-500/20"
            >
              <Zap className="w-14 h-14 text-blue-500" />
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-tight"
            >
              Votre Installation Mérite <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">l'Excellence Normative</span>.
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-xl font-light leading-relaxed max-w-2xl mx-auto"
            >
              PROQUELEC n'effectue pas de travaux d'installation directe. Nous nous appuyons sur notre réseau de membres certifiés
              et d'électriciens partenaires pour la réalisation de vos projets. PROQUELEC a créé COSSUEL et se positionne comme
              accompagnant pour vous guider dans le processus de contrôle et de mise en conformité de vos installations électriques.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-6 pt-4"
            >
              <Link
                to="/contact-premium"
                className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-base shadow-2xl shadow-blue-600/25 hover:bg-blue-500 hover:scale-105 transition-all flex items-center gap-3 uppercase tracking-wider"
              >
                Demander un Diagnostic <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/expert-lab"
                className="px-10 py-5 rounded-2xl border border-white/20 text-white font-black text-base hover:bg-white/10 hover:scale-105 transition-all uppercase tracking-wider flex items-center gap-3"
              >
                <Clock className="w-5 h-5" /> Planifier un Audit
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-8 pt-6 text-slate-600 text-sm"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Devis Gratuit
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Accompagnement COSSUEL
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Support Dédié
              </span>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTopButton aria-label="Action" />
    </div>
  );
}
