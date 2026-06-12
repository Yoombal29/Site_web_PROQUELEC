import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  CheckCircle2,
  ShieldCheck,
  Star,
  TrendingUp,
  FileBadge,
  Medal,
  Shield,
  Zap,
  Target,
  ArrowRight,
  ChevronRight,
  Building2,
  Users2,
  BookOpen,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { cn } from "@/lib/utils";

// --- Types ---

type CertifSection = 'avantages' | 'niveaux' | 'processus';

interface SectionConfig {
  id: CertifSection;
  label: string;
  icon: React.ElementType;
}

const sections: SectionConfig[] = [
  { id: 'avantages', label: 'Avantages', icon: Target },
  { id: 'niveaux', label: 'Niveaux & Labels', icon: Award },
  { id: 'processus', label: 'Processus', icon: ShieldCheck },
];

// --- Section Components ---

const SectionAvantages = () => {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Reconnaissance Nationale",
      desc: "Votre certification PROQUELEC est reconnue par les institutions, collectivités, et opérateurs privés comme gage de qualité et de conformité.",
      color: "blue",
    },
    {
      icon: ShieldCheck,
      title: "Accès aux Marchés Publics",
      desc: "La certification QUALI-ELEC est souvent exigée dans les appels d'offre publics. Elle vous ouvre les portes des grands projets institutionnels.",
      color: "emerald",
    },
    {
      icon: Star,
      title: "Confiance des Clients",
      desc: "Affichez votre label de conformité et inspirez confiance à vos clients. Une installation certifiée, c'est une garantie de sécurité supplémentaire.",
      color: "amber",
    },
    {
      icon: Zap,
      title: "Avantage Concurrentiel",
      desc: "Distinguez-vous de la concurrence. Être certifié PROQUELEC, c'est prouver votre engagement envers l'excellence et les normes de sécurité.",
      color: "purple",
    },
    {
      icon: BookOpen,
      title: "Formation Continue",
      desc: "Le processus de certification inclut des formations régulières pour maintenir vos compétences à jour face aux évolutions réglementaires.",
      color: "teal",
    },
    {
      icon: Users2,
      title: "Réseau Professionnel",
      desc: "Rejoignez la communauté des professionnels certifiés PROQUELEC et bénéficiez d'un réseau d'échange et de recommandations.",
      color: "rose",
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {benefits.map((benefit, idx) => (
        <motion.div
          key={idx}
          whileHover={{ y: -10 }}
          className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-500 group">
          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform", `bg-${benefit.color}-50 text-${benefit.color}-600 shadow-${benefit.color}-600/10`)}>
            <benefit.icon className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">{benefit.title}</h3>
          <p className="text-slate-600 leading-relaxed font-light">{benefit.desc}</p>
        </motion.div>
      ))}
    </div>
  );
};

const SectionNiveaux = () => {
  const levels = [
    {
      title: "QUALI-ELEC Artisan",
      level: "Niveau Artisan",
      description: "Certification destinée aux artisans-électriciens indépendants. Atteste de la maîtrise des règles d'installation conformes à la norme NS 01-001 et du décret de conformité n°1333 (2017). Idéale pour les travaux résidentiels et petits commerces.",
    },
    {
      title: "QUALI-ELEC Pro",
      level: "Niveau Professionnel",
      description: "Pour les électriciens et techniciens en entreprise. Couvre l'habilitation BT complète (B0 à BR/BC/BS), la maîtrise des installations industrielles et tertiaires, et la gestion des systèmes de protection différentielle.",
    },
    {
      title: "QUALI-ELEC Expert",
      level: "Niveau Expert",
      description: "Certification haute tension pour les chargés de travaux HT (H1, H2, HC). Inclut la maîtrise des réseaux HTA/BT, des postes de transformation, et des opérations sous tension ou au voisinage de pièces nues.",
    },
    {
      title: "Label Entreprise",
      level: "Label Corporate",
      description: "Qualification de l'entreprise dans son ensemble. Audit des processus qualité, formation des équipes, et délivrance d'un label de conformité PROQUELEC valable 2 ans, renouvelable avec suivi annuel.",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {levels.map((cert, idx) => (
        <div
          key={idx}
          className="group relative bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-700 flex flex-col lg:flex-row">
          <div className="lg:w-1/3 bg-slate-900 p-12 text-white flex flex-col items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent" />
            <Award className="w-20 h-20 text-blue-400 mb-6 relative z-10 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black tracking-[0.3em] text-blue-400 uppercase relative z-10 mb-2">{cert.level}</span>
            <h3 className="text-3xl font-black text-center relative z-10 tracking-tighter uppercase">{cert.title}</h3>
          </div>
          <div className="lg:w-2/3 p-12 flex flex-col justify-center">
            <p className="text-xl text-slate-600 font-light leading-relaxed mb-8">
              {cert.description}
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              {["Reconnaissance Nationale", "Accès Marchés Publics", "Badge de Qualité"].map((tag, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-bold">
                  <CheckCircle2 className="w-4 h-4" /> {tag}
                </div>
              ))}
            </div>
            <button className="inline-flex items-center gap-2 text-blue-600 font-black uppercase tracking-widest text-xs hover:gap-4 transition-all">
              Consulter les prérequis <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const SectionProcessus = () => {
  const steps = [
    { title: "Dépôt du Dossier", desc: "Soumettez vos documents administratifs et techniques via le portail PROQUELEC ou en agence.", icon: FileBadge },
    { title: "Audit Technique", desc: "Nos inspecteurs réalisent un audit approfondi de vos installations ou de vos compétences techniques.", icon: Shield },
    { title: "Validation Commission", desc: "Examen final par notre comité technique national pour garantir l'excellence et la conformité.", icon: Star },
    { title: "Délivrance Label", desc: "Remise officielle de votre certificat et activation de votre profil certifié sur le registre PROQUELEC.", icon: Medal },
  ];

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid md:grid-cols-4 gap-8">
        {steps.map((step, idx) => (
          <div key={idx} className="relative text-center group">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:shadow-blue-600/20 relative">
              <step.icon className="w-10 h-10" />
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center text-xs font-black text-slate-400 group-hover:border-blue-600 group-hover:text-blue-600 transition-colors">
                0{idx + 1}
              </div>
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h4>
            <p className="text-slate-500 font-light text-sm">{step.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 rounded-3xl border border-slate-100 p-10">
        <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-500" /> Documents requis pour le dépôt
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            "Copie de la carte d'identité nationale ou passeport",
            "Justificatif de domicile professionnel",
            "Diplôme ou attestation de compétences électriques",
            "Rapport des dernières installations réalisées",
            "Attestation d'assurance responsabilité civile professionnelle",
            "Formulaire de candidature complété et signé",
          ].map((doc, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-100 text-sm text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" /> {doc}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main Page ---

const Certifications = () => {
  const [activeSection, setActiveSection] = useState<CertifSection>('avantages');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as CertifSection;
      if (hash && sections.find((s) => s.id === hash)) {
        setActiveSection(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSectionChange = (id: CertifSection) => {
    setActiveSection(id);
    window.location.hash = id;
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'avantages': return <SectionAvantages />;
      case 'niveaux': return <SectionNiveaux />;
      case 'processus': return <SectionProcessus />;
      default: return <SectionAvantages />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      <SEO
        title="Certifications Professionnelles - PROQUELEC"
        description="Valorisez votre expertise avec les certifications PROQUELEC. Des parcours qualifiants QUALI-ELEC reconnus nationalement pour tous les niveaux d'électriciens." />

      <Header solid={true} />

      <main className="flex-grow pt-24">
        {/* Premium Hero */}
        <section className="bg-slate-900 pt-32 pb-64 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="absolute bottom-[-30%] left-[-10%] w-[70%] h-[100%] bg-blue-600/20 blur-[180px] rounded-full" />
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[80%] bg-indigo-600/10 blur-[150px] rounded-full" />

          <div className="container max-w-7xl mx-auto px-4 relative z-10 text-center space-y-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-[0.2em]">
              <Star className="w-4 h-4" /> Excellence Normative
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
              Validez Votre <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Savoir-Faire</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
              Rejoignez les meilleurs professionnels du Sénégal. Obtenez un label reconnu qui atteste de votre rigueur et de votre conformité technique.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-8 pt-4">
              {[
                { num: "4", label: "Niveaux de certification" },
                { num: "100%", label: "Reconnu nationalement" },
                { num: "2 ans", label: "Validité du certificat" },
                { num: "QUALI-ELEC", label: "Label d'excellence" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-black text-blue-400">{stat.num}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Sticky Nav Capsule */}
        <div className="sticky top-[var(--effective-header-height,110px)] z-[40] mt-[-80px] flex justify-center px-4 w-full">
          <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl shadow-blue-900/5 rounded-full p-2 max-w-full overflow-hidden">
            <div className="flex items-center gap-1 md:gap-2 overflow-x-auto max-w-[90vw] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] px-1">
              {sections.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={cn(
                      "group flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap",
                      isActive
                        ? "bg-slate-900 text-white shadow-lg ring-1 ring-blue-500/20 translate-y-[-1px]"
                        : "text-slate-500 hover:bg-slate-100 hover:text-blue-600 hover:shadow-sm"
                    )}>
                    <section.icon className={cn("w-4 h-4 transition-colors duration-300", isActive ? "text-blue-400" : "text-slate-400 group-hover:text-blue-600")} />
                    {section.label}
                  </button>
                );
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

                <div className="mb-16 text-center">
                  <span className="text-blue-600 font-black uppercase tracking-widest text-sm block mb-3">PROQUELEC · Certifications</span>
                  <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">{sections.find((s) => s.id === activeSection)?.label}</h2>
                </div>

                <div className="mt-8">{renderContent()}</div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Action CTA */}
        <section className="py-24 bg-slate-900 overflow-hidden relative">
          <div className="absolute inset-0 bg-blue-600/5" />
          <div className="container max-w-4xl mx-auto px-4 text-center relative z-10 space-y-10">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-600/10 rounded-full mb-4">
              <Award className="w-12 h-12 text-blue-500" />
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-tight">
              Prêt pour le <br /> <span className="text-blue-500">Label d'Excellence</span> ?
            </h2>
            <p className="text-slate-400 text-xl font-light max-w-2xl mx-auto italic">
              Élevez votre carrière professionnelle et garantissez la sécurité des installations électriques au Sénégal.
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              <a href="/contact" className="inline-flex items-center gap-3 bg-blue-600 text-white px-12 py-6 rounded-2xl font-black text-lg shadow-2xl shadow-blue-600/20 hover:scale-105 hover:bg-blue-500 transition-all">
                Démarrer ma certification <ArrowRight className="w-5 h-5" />
              </a>
              <a href="/formation-certification" className="inline-flex items-center gap-3 bg-transparent border-2 border-slate-700 text-white px-12 py-6 rounded-2xl font-bold hover:bg-slate-800 transition-all">
                Voir les formations
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTopButton aria-label="Remonter en haut" />
    </div>
  );
};

export default Certifications;