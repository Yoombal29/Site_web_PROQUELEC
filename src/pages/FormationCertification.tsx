import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Calendar, PenTool, Award, Building,
  Hammer, GraduationCap, CheckCircle2, ArrowRight,
  Users, Zap, Shield, Star, Clock, FileText, ChevronRight
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { cn } from "@/lib/utils";

// --- Types & Static Data ---

type FormationSection = 'catalogue' | 'calendrier' | 'inscription' | 'certification-elec' | 'formation-collectivites' | 'formation-artisans' | 'ressources';

interface SectionConfig {
  id: FormationSection;
  label: string;
  icon: React.ElementType;
  color: string;
}

const sections: SectionConfig[] = [
  { id: 'catalogue', label: 'Catalogue', icon: BookOpen, color: 'blue' },
  { id: 'calendrier', label: 'Calendrier', icon: Calendar, color: 'indigo' },
  { id: 'inscription', label: 'Inscription', icon: PenTool, color: 'purple' },
  { id: 'certification-elec', label: 'Certif. Électriciens', icon: Award, color: 'amber' },
  { id: 'formation-collectivites', label: 'Collectivités', icon: Building, color: 'teal' },
  { id: 'formation-artisans', label: 'Artisans', icon: Hammer, color: 'orange' },
  { id: 'ressources', label: 'Ressources', icon: GraduationCap, color: 'rose' },
];

// --- Static Section Content Components ---

const SectionCatalogue = () => (
  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
    <div className="text-center max-w-3xl mx-auto space-y-4">
      <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Catalogue de Formation</h3>
      <p className="text-lg text-slate-500">Des programmes complets pour tous les profils de professionnels électriques.</p>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      {[
        { icon: Hammer, title: "Habilitation Électrique", desc: "Formation complète aux niveaux B0, H0, B1, B2, H1, H2, BR, BC, HC. Conforme aux normes NF C 18-510.", tag: "Artisans & Pro", color: "blue" },
        { icon: Shield, title: "Sécurité des Installations", desc: "Maîtrisez les règles de sécurité IEC 60364. Protection des biens et des personnes contre les risques électriques.", tag: "Tous niveaux", color: "emerald" },
        { icon: Zap, title: "Audit Énergétique", desc: "Techniques de diagnostic et d'optimisation des consommations électriques. Réduire les pertes et améliorer l'efficacité.", tag: "Experts", color: "amber" },
        { icon: FileText, title: "Normes & Réglementation", desc: "Compréhension et application des normes NS 01-001, NF C 15-100, NF C 14-100 et décret n° 1333 de 2017.", tag: "Professionnels", color: "purple" },
        { icon: Users, title: "Formation des Formateurs", desc: "Devenez formateur agréé PROQUELEC. Transmission des savoirs et pédagogie adaptée aux électriciens.", tag: "Formateurs", color: "teal" },
        { icon: Star, title: "QUALI-ELEC Premium", desc: "Préparation à la certification nationale d'excellence. Accès privilégié aux marchés publics et privés au Sénégal.", tag: "Certif. Nationale", color: "rose" },
      ].map((mod, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex gap-5">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110", `bg-${mod.color}-50 text-${mod.color}-600`)}>
            <mod.icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-bold text-slate-900">{mod.title}</h4>
              <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-semibold">{mod.tag}</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{mod.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SectionCalendrier = () => {
  const sessions = [
    { month: "Juillet 2025", title: "Habilitation Électrique B0/H0", duration: "3 jours", places: 20, lieu: "Dakar Centre", status: "Ouvert" },
    { month: "Août 2025", title: "Sécurité & Normes NS 01-001", duration: "2 jours", places: 15, lieu: "Thiès", status: "Ouvert" },
    { month: "Septembre 2025", title: "Certification QUALI-ELEC", duration: "5 jours", places: 12, lieu: "Dakar", status: "Complet" },
    { month: "Octobre 2025", title: "Audit Énergétique Avancé", duration: "4 jours", places: 10, lieu: "Saint-Louis", status: "Ouvert" },
    { month: "Novembre 2025", title: "Formation Artisans (Module 1-4)", duration: "5 jours", places: 25, lieu: "Dakar Centre", status: "Ouvert" },
    { month: "Décembre 2025", title: "Habilitation HT - H1/H2/HC", duration: "3 jours", places: 8, lieu: "Dakar", status: "Ouvert" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      <div className="text-center space-y-4">
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Calendrier des Sessions</h3>
        <p className="text-slate-500">Planifiez votre formation parmi nos sessions disponibles sur tout le territoire sénégalais.</p>
      </div>
      <div className="space-y-4">
        {sessions.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col md:flex-row md:items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-32 shrink-0 text-center bg-slate-900 text-white rounded-xl p-3">
              <div className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">{s.month.split(' ')[1]}</div>
              <div className="font-black text-lg text-white">{s.month.split(' ')[0]}</div>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900 text-lg">{s.title}</h4>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {s.duration}</span>
                <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {s.places} places</span>
                <span className="flex items-center gap-1"><Building className="w-4 h-4" /> {s.lieu}</span>
              </div>
            </div>
            <span className={cn("px-4 py-2 rounded-full text-sm font-bold shrink-0", s.status === 'Complet' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700')}>
              {s.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SectionInscription = () => (
  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
    <div className="text-center space-y-4">
      <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Comment s'inscrire ?</h3>
      <p className="text-slate-500 max-w-2xl mx-auto">Processus simple et rapide pour rejoindre nos formations professionnelles.</p>
    </div>

    <div className="grid md:grid-cols-4 gap-6">
      {[
        { num: "01", title: "Choisir votre formation", desc: "Consultez notre catalogue et identifiez la formation adaptée à votre niveau et vos besoins." },
        { num: "02", title: "Remplir le formulaire", desc: "Complétez votre dossier d'inscription en ligne ou en agence avec vos informations professionnelles." },
        { num: "03", title: "Validation & Paiement", desc: "Votre dossier est traité sous 48h. Réglez les frais de formation (exonérés pour les artisans éligibles)." },
        { num: "04", title: "Confirmation & Accueil", desc: "Recevez votre convocation et rejoignez votre session. Le matériel pédagogique est fourni." },
      ].map((step, i) => (
        <div key={i} className="text-center group">
          <div className="w-16 h-16 bg-orange-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-black shadow-lg shadow-orange-600/20 group-hover:scale-110 transition-transform">
            {step.num}
          </div>
          <h4 className="font-bold text-slate-900 mb-2">{step.title}</h4>
          <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
        </div>
      ))}
    </div>

    <div className="bg-orange-50 border border-orange-100 rounded-3xl p-10 text-center space-y-6">
      <h4 className="text-2xl font-bold text-slate-900">Prêt à vous inscrire ?</h4>
      <p className="text-slate-600">Contactez notre équipe pédagogique pour vous guider dans votre démarche.</p>
      <div className="flex flex-wrap justify-center gap-4">
        <a href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 text-white rounded-full font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-600/20">
          Nous contacter <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    </div>
  </div>
);

const SectionCertificationElec = () => (
  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
    <div className="text-center space-y-4">
      <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Certification Électriciens</h3>
      <p className="text-slate-500 max-w-2xl mx-auto">Obtenez la reconnaissance officielle de votre expertise technique et de votre conformité aux normes nationales.</p>
    </div>

    <div className="grid md:grid-cols-2 gap-8">
      {[
        { title: "Habilitation BT", level: "Niveau 1", modules: ["Exécutant B0 - Basse Tension", "Chargé de chantier B0 - BT", "Exécutant B1/B1V - Travaux électriques", "Chargé de travaux B2/B2V", "Interventions BR, BC, BS"], color: "blue" },
        { title: "Habilitation HT", level: "Niveau 2", modules: ["Exécutant travaux H1/H1V - HTA", "Chargé de travaux H2/H2V", "Chargé de consignation HC", "Opérations de fouille BF/HF", "Essais et vérifications HT"], color: "indigo" },
        { title: "QUALI-ELEC", level: "Certification", modules: ["Audit de vos installations", "Évaluation des compétences", "Examen devant commission", "Délivrance du certificat national", "Accès aux marchés publics"], color: "amber" },
        { title: "Certification Entreprise", level: "Corporate", modules: ["Qualification de l'entreprise", "Audit des processus qualité", "Label de conformité PROQUELEC", "Formation de vos équipes", "Suivi et renouvellement annuel"], color: "emerald" },
      ].map((cert, i) => (
        <div key={i} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500 group">
          <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10"><Award className="w-32 h-32 -mt-4 -mr-4" /></div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{cert.level}</span>
            <h4 className="text-2xl font-black mt-1 group-hover:text-orange-400 transition-colors">{cert.title}</h4>
          </div>
          <ul className="p-8 space-y-3">
            {cert.modules.map((m, j) => (
              <li key={j} className="flex items-center gap-3 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> {m}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

const SectionCollectivites = () => (
  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
    <div className="bg-slate-900 text-white rounded-[3rem] p-12 relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 opacity-5"><Building className="w-64 h-64 -mt-8 -mr-8" /></div>
      <div className="relative z-10 max-w-3xl">
        <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Formation pour Collectivités</h3>
        <p className="text-slate-300 text-lg leading-relaxed">
          Des programmes sur-mesure destinés aux mairies, gouvernances, ministères et établissements publics pour garantir la conformité et la sécurité des installations électriques dans les bâtiments publics.
        </p>
      </div>
    </div>

    <div className="grid md:grid-cols-3 gap-6">
      {[
        { icon: Building, title: "Audit des bâtiments", desc: "Évaluation des installations électriques de vos bâtiments publics selon les normes en vigueur.", tag: "Mairies & Ministères" },
        { icon: Users, title: "Formation des équipes", desc: "Programme de formation de vos agents d'entretien et techniciens aux bonnes pratiques.", tag: "In-situ" },
        { icon: Shield, title: "Plan de mise en conformité", desc: "Rapport détaillé et accompagnement pour mettre vos installations aux normes réglementaires.", tag: "Compliance" },
      ].map((item, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 hover:shadow-lg hover:-translate-y-1 transition-all">
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-5">
            <item.icon className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">{item.tag}</span>
          <h4 className="text-xl font-bold text-slate-900 my-2">{item.title}</h4>
          <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
);

const SectionArtisans = () => (
  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
    <div className="grid md:grid-cols-2 gap-12 items-start">
      <div>
        <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-4">Formation Artisans-Électriciens</h3>
        <p className="text-slate-600 leading-relaxed mb-8">
          Depuis 2005, PROQUELEC forme <strong>gratuitement</strong> les artisans-électriciens sur le territoire national. Plus de <strong>10 000 artisans</strong> ont bénéficié de ce programme.
        </p>
        <div className="space-y-4">
          {[
            "Améliorer la qualité des installations domestiques",
            "Garantir la protection des personnes et équipements",
            "Instaurer une culture de la sécurité électrique",
            "Réduire les accidents et incendies d'origine électrique",
          ].map((obj, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
              <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <span className="text-slate-700 font-medium">{obj}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100">
        <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
          <Hammer className="w-6 h-6 text-amber-600" /> Modules abordés
        </h4>
        <ul className="space-y-3 text-sm text-slate-700">
          {[
            "Mod 1 : Fondamentaux et Cadre Normatif",
            "Mod 2 : Conception et Schémas Électriques",
            "Mod 3 : Techniques de Câblage et Raccordement",
            "Mod 4 : Mise à la Terre et Protection",
            "Mod 5 : Équipements de Protection et Sécurité",
            "Mod 6 : Performance Énergétique",
            "Mod 7 : Innovations (Domotique, Solaire)",
          ].map((m, i) => (
            <li key={i} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              {m}
            </li>
          ))}
        </ul>
      </div>
    </div>

    <div className="bg-slate-900 text-white rounded-[2rem] p-10 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-orange-600/5" />
      <div className="relative z-10">
        <h4 className="text-2xl font-black mb-6 uppercase tracking-tighter">Impact du Programme</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/10 pt-8">
          {[
            { num: "5 718", label: "Artisans formés\nDakar" },
            { num: "1 380", label: "Formés avec\nSenelec" },
            { num: "381", label: "Formés avec\nSonatel" },
            { num: "100%", label: "Taux de\nsatisfaction" },
          ].map((stat, i) => (
            <div key={i}>
              <div className={cn("text-4xl font-black mb-2", i === 3 ? "text-emerald-400" : "text-white")}>{stat.num}</div>
              <div className="text-xs text-blue-300 uppercase tracking-widest font-bold whitespace-pre-line">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const SectionRessources = () => (
  <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
    <div className="text-center space-y-4">
      <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Ressources Pédagogiques</h3>
      <p className="text-slate-500 max-w-2xl mx-auto">Accédez aux supports et documentations officiels pour approfondir vos connaissances.</p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        { icon: FileText, title: "Mémentos Techniques", desc: "Documents synthétiques pour rappel rapide des bonnes pratiques (NS 01-001, Protection, Caractéristiques générales).", type: "PDF", color: "blue" },
        { icon: BookOpen, title: "Guides Détaillés", desc: "Guides complets pour appliquer les normes (Marchés, Ménages à faible revenu, Vérifications, Matériels).", type: "PDF", color: "indigo" },
        { icon: FileText, title: "Feuillets Techniques", desc: "Informations rapides et précises pour résoudre les problèmes techniques (Prises, Mise à la terre, Liaisons).", type: "PDF", color: "teal" },
        { icon: GraduationCap, title: "Supports de Cours", desc: "Supports de formation officiels pour les artisans, techniciens et formateurs agréés PROQUELEC.", type: "Accès membres", color: "amber" },
        { icon: Award, title: "Guides de Certification", desc: "Tout ce qu'il faut savoir pour préparer et réussir votre certification QUALI-ELEC ou habilitation.", type: "PDF", color: "orange" },
        { icon: BookOpen, title: "Bibliothèque Normative", desc: "Textes de référence des normes nationales et internationales (NS, NF, IEC) applicables au Sénégal.", type: "Abonnés", color: "rose" },
      ].map((res, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7 hover:shadow-lg hover:-translate-y-1 transition-all group">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all group-hover:scale-110", `bg-${res.color}-50 text-${res.color}-600`)}>
            <res.icon className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{res.type}</span>
          <h4 className="text-lg font-bold text-slate-900 my-2">{res.title}</h4>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">{res.desc}</p>
          <button className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:gap-3 transition-all group-hover:text-blue-700">
            Accéder <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  </div>
);

// --- Section Renderer ---

const renderSection = (id: FormationSection) => {
  switch (id) {
    case 'catalogue': return <SectionCatalogue />;
    case 'calendrier': return <SectionCalendrier />;
    case 'inscription': return <SectionInscription />;
    case 'certification-elec': return <SectionCertificationElec />;
    case 'formation-collectivites': return <SectionCollectivites />;
    case 'formation-artisans': return <SectionArtisans />;
    case 'ressources': return <SectionRessources />;
    default: return <SectionCatalogue />;
  }
};

// --- Main Page ---

export default function FormationCertification() {
  const [activeSection, setActiveSection] = useState<FormationSection>('catalogue');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as FormationSection;
      if (hash && sections.find((s) => s.id === hash)) {
        setActiveSection(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSectionChange = (id: FormationSection) => {
    setActiveSection(id);
    window.location.hash = id;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
      <SEO
        title="Formation & Certification - PROQUELEC"
        description="Offre de formation et certification PROQUELEC pour électriciens, artisans et collectivités. Maîtrisez les normes de sécurité électrique au Sénégal." />

      <Header solid={true} />

      <main className="flex-grow pt-24">
        {/* Hero */}
        <section className="bg-slate-900 pt-32 pb-64 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-5" />
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[80%] bg-orange-600/20 blur-[150px] rounded-full" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[80%] bg-blue-600/10 blur-[150px] rounded-full" />

          <div className="container max-w-7xl mx-auto px-4 relative z-10 text-center space-y-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-xs font-black uppercase tracking-[0.2em]">
              <GraduationCap className="w-4 h-4" /> Académie PROQUELEC
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight">
              L'Expertise se <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Transmet</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
              Formez-vous aux normes de demain et certifiez vos compétences pour garantir la sécurité de tous.
            </motion.p>

            {/* Stats rapides */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-8 pt-4">
              {[
                { num: "+10 000", label: "Artisans formés" },
                { num: "100%", label: "Taux de satisfaction" },
                { num: "20+", label: "Modules de formation" },
                { num: "Gratuit", label: "Pour artisans éligibles" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-black text-orange-400">{stat.num}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Sticky Nav Floating Capsule */}
        <div className="sticky top-[var(--effective-header-height,110px)] z-[40] mt-[-80px] flex justify-center px-4 w-full">
          <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl shadow-orange-900/5 rounded-full p-2 max-w-full overflow-hidden">
            <div className="flex items-center gap-1 md:gap-2 overflow-x-auto max-w-[90vw] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] px-1">
              {sections.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={cn(
                      "group flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 whitespace-nowrap",
                      isActive
                        ? "bg-slate-900 text-white shadow-lg ring-1 ring-orange-500/20 translate-y-[-1px]"
                        : "text-slate-500 hover:bg-slate-100 hover:text-orange-600 hover:shadow-sm"
                    )}>
                    <section.icon className={cn("w-4 h-4 transition-colors duration-300", isActive ? "text-orange-400" : "text-slate-400 group-hover:text-orange-600")} />
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
                  <span className="text-orange-600 font-black uppercase tracking-widest text-sm block mb-3">PROQUELEC · Formation & Certification</span>
                  <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">{sections.find((s) => s.id === activeSection)?.label}</h2>
                </div>

                {renderSection(activeSection)}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Global CTA */}
        <section className="py-24 bg-slate-900 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-orange-600/5 blur-[100px]" />
          <div className="container max-w-4xl mx-auto px-4 text-center relative z-10 space-y-8">
            <div className="inline-block p-4 rounded-full bg-orange-500/10 mb-4">
              <Award className="w-12 h-12 text-orange-500" />
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
              Valorisez Votre <span className="text-orange-500">Expertise</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Obtenez la certification QUALI-ELEC et distinguez-vous sur le marché par votre professionnalisme et votre conformité aux normes.
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              <a href="/contact" className="inline-flex items-center gap-2 bg-orange-600 text-white px-10 py-5 rounded-full font-bold shadow-xl shadow-orange-900/20 hover:scale-105 hover:bg-orange-500 transition-all">
                <PenTool className="w-5 h-5" /> Nous contacter
              </a>
              <a href="/about#formation" className="inline-flex items-center gap-2 bg-transparent border-2 border-slate-700 text-white px-10 py-5 rounded-full font-bold hover:bg-slate-800 transition-all">
                En savoir plus
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTopButton aria-label="Remonter en haut" />
    </div>
  );
}