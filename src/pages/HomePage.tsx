import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HeroBanner } from "@/components/HeroBanner";
import { VisionMission } from "@/components/VisionMission";
import { LandingStats } from "@/components/LandingStats";
import { LatestNews } from "@/components/LatestNews";
import { PartnerLogos } from "@/components/PartnerLogos";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { SEO } from "@/components/SEO";
import {
  ArrowRight, Sparkles, Wrench, Cpu, FileText, GraduationCap,
  BookOpen, ShieldCheck, Award, Zap, Globe, Users,
  CheckCircle2, Building2, Sun, Home, Factory
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useGlobalHeader } from '@/components/MainLayout';

const platformCards = [
  {
    icon: Wrench, title: "Outils Techniques",
    desc: "Calculateurs, dimensionnement, diagnostic de sécurité et générateur de devis.",
    href: "/outils", color: "emerald",
  },
  {
    icon: GraduationCap, title: "Formations",
    desc: "Programmes certifiants, e-learning et ateliers pratiques pour professionnels.",
    href: "/formations", color: "blue",
  },
  {
    icon: Cpu, title: "Expert Lab IA",
    desc: "Assistant intelligent, scanner de conformité et calculatrices normatives.",
    href: "/expert-lab", color: "indigo",
  },
  {
    icon: ShieldCheck, title: "Showroom Technique",
    desc: "Galerie immersive de nos missions de contrôle et diagnostics.",
    href: "/showroom", color: "amber",
  },
  {
    icon: FileText, title: "Documents & GED",
    desc: "Gestion électronique de documents, attestations et rapports techniques.",
    href: "/documents", color: "slate",
  },
  {
    icon: Award, title: "Labels & Qualité",
    desc: "Certifications, labels de qualité et reconnaissance institutionnelle.",
    href: "/labels", color: "rose",
  },
];

const summarySections = [
  {
    icon: Building2, title: "Qui Sommes-Nous",
    desc: "PROQUELEC est l'institution nationale de référence pour la promotion de la qualité et de la sécurité des installations électriques au Sénégal. Nous intervenons en tant que contrôleur agréé pour le compte du COSSUEL.",
    href: "/about",
    features: ["Contrôleur agréé COSSUEL", "12 ans d'expertise", "Réseau de membres certifiés"],
  },
  {
    icon: Users, title: "Nos Espaces",
    desc: "Des ressources adaptées à chaque acteur du secteur électrique : ménages, professionnels, autorités et partenaires.",
    href: "/professionnels",
    features: ["Espace Ménages", "Espace Professionnels", "Espace Autorités"],
  },
  {
    icon: BookOpen, title: "Normes & Ressources",
    desc: "Accédez au corpus normatif complet, aux expertises techniques et à la bibliothèque de référence.",
    href: "/normes-ressources",
    features: ["Base normative NFC", "Expertises techniques", "Bibliothèque documentaire"],
  },
  {
    icon: Globe, title: "Utilité Publique",
    desc: "Actions de sensibilisation, campagnes de diagnostic et programmes de sécurisation des installations.",
    href: "/utilite-publique",
    features: ["Sensibilisation grand public", "Diagnostics gratuits", "Sécurisation"],
  },
];

const pageLinks = [
  {
    label: "Accueil", href: "/",
    sub: "Page d'accueil institutionnelle"
  },
  {
    label: "Qui sommes-nous", href: "/about",
    sub: "Notre mission, notre vision"
  },
  {
    label: "Plateforme d'Outils", href: "/outils",
    sub: "Applications et calculateurs techniques"
  },
  {
    label: "Showroom", href: "/showroom",
    sub: "Galerie technique immersive"
  },
  {
    label: "Formations", href: "/formations",
    sub: "Programmes certifiants"
  },
  {
    label: "Expert Lab IA", href: "/expert-lab",
    sub: "Intelligence artificielle normative"
  },
  {
    label: "Normes & Ressources", href: "/normes-ressources",
    sub: "Corpus normatif et documentation"
  },
  {
    label: "Utilité Publique", href: "/utilite-publique",
    sub: "Sensibilisation et sécurité"
  },
  {
    label: "Actualités", href: "/actualites-evenements",
    sub: "Blog, événements et communiqués"
  },
  {
    label: "Contact", href: "/contact-premium",
    sub: "Support et accompagnement"
  },
  {
    label: "Labels & Qualité", href: "/labels",
    sub: "Certifications et agréments"
  },
  {
    label: "Espace Partenaires", href: "/partenaires",
    sub: "Réseau de membres certifiés"
  },
];

function PlatformCard({ icon: Icon, title, desc, href, color, index }: typeof platformCards[0] & { index: number }) {
  const colorMap: Record<string, string> = {
    emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400",
    blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400",
    indigo: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400",
    amber: "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400",
    slate: "from-slate-500/20 to-slate-600/10 border-slate-500/30 text-slate-400",
    rose: "from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-400",
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
    >
      <Link to={href} className="group block h-full">
        <div className="h-full rounded-2xl bg-white/5 border border-white/10 p-6 hover:border-blue-500/30 transition-all duration-500 hover:bg-white/[0.08] relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.split(" ")[0]} ${c.split(" ")[1]} border flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <Icon className={`w-6 h-6 ${c.split(" ")[4]}`} />
            </div>
            <h4 className="font-black text-white text-base group-hover:text-blue-300 transition-colors">{title}</h4>
            <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
            <div className="flex items-center gap-1 text-xs font-bold text-blue-400 group-hover:gap-2 transition-all">
              <span>Accéder</span> <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function SummaryCard({ icon: Icon, title, desc, href, features, index }: typeof summarySections[0] & { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group"
    >
      <Link to={href} className="block h-full">
        <div className="h-full rounded-[1.5rem] border border-white/10 bg-slate-800/50 p-8 hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Icon className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-2xl font-black text-white group-hover:text-blue-300 transition-colors">{title}</h3>
            <p className="text-slate-400 leading-relaxed">{desc}</p>
            <div className="space-y-2 pt-2">
              {features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-blue-400 group-hover:gap-2 transition-all pt-2">
              <span>En savoir plus</span> <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function HomePage() {
  useGlobalHeader().setHide(true);
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <SEO
        title="PROQUELEC - L'Excellence Normative Électrique au Sénégal"
        description="PROQUELEC est l'institution nationale de référence pour la sécurité et la conformité des installations électriques. Contrôle agréé COSSUEL, diagnostics, formations et outils techniques."
      />

      <Header />

      <main className="flex-grow">
        {/* ===== HERO ===== */}
        <HeroBanner />

        {/* ===== STATS ===== */}
        <LandingStats />

        {/* ===== QUI SOMMES-NOUS / VISION MISSION ===== */}
        <VisionMission
          badge="L'Institution Nationale"
          title="Garantir la sécurité électrique pour tous les Sénégalais."
           subtitle="Depuis 2014, PROQUELEC s'engage pour la promotion de la qualité et de la conformité des installations électriques à travers le contrôle, le diagnostic et la formation."
          missionTitle="Contrôle & Diagnostic"
          missionDesc="Intervenons en tant que contrôleur agréé pour le compte du COSSUEL et réalisons des diagnostics de sécurité et audits énergétiques sur les installations existantes."
          visionTitle="Qualification & Réseau"
          visionDesc="Nous nous appuyons sur notre réseau de membres certifiés et d'électriciens partenaires pour assurer la réalisation de vos projets dans les règles de l'art."
        />

        {/* ===== PLATEFORME & OUTILS ===== */}
        <section className="py-24 relative overflow-hidden bg-slate-900/50">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950 pointer-events-none" />
          <div className="container max-w-7xl mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16 space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <Sparkles className="w-3.5 h-3.5" /> Plateforme Digitale
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                Explorez Notre <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Écosystème</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light">
                Un ensemble d'outils, de ressources et de services conçus pour accompagner
                tous les acteurs du secteur électrique.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {platformCards.map((card, i) => (
                <PlatformCard key={card.title} {...card} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== RÉSUMÉ DES SECTIONS CLÉS ===== */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
          <div className="container max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16 space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <Zap className="w-3.5 h-3.5" /> Tout l'Écosystème
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                Découvrez <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">PROQUELEC</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light">
                Que vous soyez un particulier soucieux de la sécurité de votre foyer ou un professionnel
                à la recherche d'outils certifiants, PROQUELEC vous accompagne.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {summarySections.map((section, i) => (
                <SummaryCard key={section.title} {...section} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== ACTUALITÉS ===== */}
        <LatestNews />

        {/* ===== NOS OFFRES ===== */}
        <section className="py-24 relative overflow-hidden bg-slate-950">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-slate-900/30 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent pointer-events-none" />
          <div className="container max-w-7xl mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16 space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <Sparkles className="w-3.5 h-3.5" /> Nos Offres
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                Des Solutions <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Sur Mesure</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light">
                Que vous soyez particulier, professionnel ou partenaire, découvrez nos offres adaptées à vos besoins.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Home, title: "Diagnostic Résidentiel",
                  desc: "Audit complet de votre installation électrique, conformité NS 01-001, et accompagnement COSSUEL pour la mise en sécurité de votre habitation.",
                  features: ["Inspection visuelle complète", "Mesures de terre et boucle", "Rapport détaillé", "Accompagnement COSSUEL"],
                  gradient: "from-emerald-500 to-teal-600", border: "border-emerald-500/20",
                },
                {
                  icon: Building2, title: "Audit Professionnel",
                  desc: "Solutions pour entreprises, promoteurs et collectivités : audit de conformité, schémas directeurs, et gestion de patrimoine électrique.",
                  features: ["Schémas directeurs électriques", "Conformité ERP/IRC", "Audit énergétique", "Certification COSSUEL Pro"],
                  gradient: "from-blue-500 to-indigo-600", border: "border-blue-500/20",
                },
                {
                  icon: ShieldCheck, title: "Partenariat Expert",
                  desc: "Rejoignez le réseau PROQUELEC : électriciens certifiés, formateurs, et bureaux d'études bénéficiant de nos outils exclusifs et de notre accompagnement.",
                  features: ["Accès plateforme Outils", "Support technique prioritaire", "Formations certifiantes", "Visibilité réseau"],
                  gradient: "from-amber-500 to-orange-600", border: "border-amber-500/20",
                },
              ].map((offer, i) => (
                <motion.div
                  key={offer.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className={`group relative p-8 rounded-2xl bg-slate-900/50 border ${offer.border} hover:bg-slate-900/80 transition-all duration-500`}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${offer.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                    <offer.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{offer.title}</h3>
                  <p className="text-slate-400 font-light leading-relaxed mb-6">{offer.desc}</p>
                  <ul className="space-y-2.5">
                    {offer.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== PARTENAIRES ===== */}
        <PartnerLogos />

        {/* ===== PLAN DU SITE (LIENS RAPIDES) ===== */}
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
                <Globe className="w-3.5 h-3.5" /> Plan du Site
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                Accès <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Rapide</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg font-light">
                Naviguez vers l'ensemble des pages et services de la plateforme PROQUELEC.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {pageLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                >
                  <Link
                    to={link.href}
                    className="group flex items-center justify-between p-3 rounded-xl border border-white/5 hover:border-blue-500/30 bg-white/[0.02] hover:bg-white/[0.06] transition-all duration-300"
                  >
                    <div>
                      <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{link.label}</span>
                      <p className="text-[10px] text-slate-600 mt-0.5">{link.sub}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </Link>
                </motion.div>
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
              <ShieldCheck className="w-14 h-14 text-blue-500" />
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-tight"
            >
              Prêt à <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Certifier</span> Vos Installations ?
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-xl font-light leading-relaxed max-w-2xl mx-auto"
            >
              Rejoignez notre réseau de membres certifiés, bénéficiez de nos diagnostics experts
              et accédez à des outils professionnels exclusifs.
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
                className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-blue-600 text-white font-black text-base shadow-2xl shadow-blue-600/25 hover:bg-blue-500 hover:scale-105 transition-all uppercase tracking-wider"
              >
                Demander un Diagnostic <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl border border-white/20 text-white font-black text-base hover:bg-white/10 hover:scale-105 transition-all uppercase tracking-wider"
              >
                Découvrir PROQUELEC
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-8 pt-6 text-slate-600 text-sm flex-wrap"
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Contrôleur agréé COSSUEL
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Diagnostic de sécurité
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Audit énergétique
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
