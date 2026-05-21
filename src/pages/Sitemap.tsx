
import React from "react";
import { Link } from "react-router-dom";
import { useDynamicRoutes } from "@/hooks/useDynamicRoutes";
import {
  Home,




  Shield,

  Wrench,


  Cpu,







  ChevronRight,
  Globe,
  Lock,

  FileCode } from


"lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Separator } from "@/components/ui/separator";

const SitemapCategory = ({ title, icon: Icon, description, items }: unknown) =>
<Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm hover:border-proqblue/50 transition-all duration-300 group overflow-hidden">
        <CardHeader className="pb-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-proqblue/20 transition-colors">
                <Icon className="w-6 h-6 text-proqblue" />
            </div>
            <CardTitle className="text-xl font-bold text-white uppercase tracking-tight">{title}</CardTitle>
            <CardDescription className="text-slate-400 text-sm leading-relaxed">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
            {items.map((item: unknown, index: number) =>
    <Link
      key={index}
      to={item.href}
      className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group/item">
      
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover/item:bg-proqblue transition-colors" />
                        <span className="text-sm text-slate-300 group-hover/item:text-white transition-colors capitalize">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover/item:text-proqblue transition-transform translate-x-0 group-hover/item:translate-x-1 duration-200" />
                </Link>
    )}
        </CardContent>
    </Card>;


const Sitemap = () => {
  const { data: dynamicRoutes } = useDynamicRoutes();

  const categories = [
  {
    title: "Navigation Principale",
    icon: Home,
    description: "Accès aux pages publiques et institutionnelles de PROQUELEC.",
    items: [
    { label: "Accueil", href: "/" },
    { label: "À propos", href: "/about" },
    { label: "Activités", href: "/activities" },
    { label: "Actualités", href: "/actualites" },
    { label: "Actualités & Événements", href: "/actualites-evenements" },
    { label: "Blog & Actualités", href: "/blog" },
    { label: "Labels & Qualité", href: "/labels" },
    { label: "Partenaires", href: "/partenaires" },
    { label: "Contact", href: "/contact" },
    { label: "Contact Premium", href: "/contact-premium" },
    { label: "Mentions Légales", href: "/legal" }]

  },
  {
    title: "Formation & Apprentissage",
    icon: Home,
    description: "Programmes de formation et certification professionnelle.",
    items: [
    { label: "Formation & Certification", href: "/formation-certification" },
    { label: "Certifications", href: "/certifications" },
    { label: "Formations", href: "/formations" },
    { label: "Formations PROQUELEC", href: "/formations-proquelec" }]

  },
  {
    title: "Normes & Ressources",
    icon: FileCode,
    description: "Normes techniques, expertises et cas d'études.",
    items: [
    { label: "Normes & Ressources", href: "/normes-ressources" },
    { label: "Expertises Techniques", href: "/expertises-techniques" },
    { label: "Projets & Réalisations", href: "/projets-realisations" }]

  },
  {
    title: "Espace Professionnel",
    icon: Wrench,
    description: "Outils et ressources dédiés aux professionnels de l'électricité.",
    items: [
    { label: "Plateforme d'Outils", href: "/outils" },
    { label: "Showroom Technique", href: "/showroom" },
    { label: "Gestionnaire GED", href: "/ged" },
    { label: "Schema Builder", href: "/schema-builder" },
    { label: "Avantages Membres", href: "/avantages" },
    { label: "Sélecteur de Rubrique", href: "/rubrique-selector" }]

  },
  {
    title: "Piliers & Espaces",
    icon: Globe,
    description: "Information et sensibilisation pour tous les acteurs du secteur électrique.",
    items: [
    { label: "Utilité Publique", href: "/utilite-publique" },
    { label: "Espace Autorités", href: "/autorites" },
    { label: "Espace Ménages", href: "/menages" },
    { label: "Espace Professionnels", href: "/professionnels" },
    { label: "Espace Presse", href: "/presse" },
    { label: "Réseaux & Social", href: "/social" },
    { label: "Espace Ménages (Avancé)", href: "/espace-menages" },
    { label: "Espace Professionnels (Avancé)", href: "/espace-professionnels" },
    { label: "Espace Autorités (Avancé)", href: "/espace-autorites" }]

  },
  {
    title: "Ressources & Documentation",
    icon: FileCode,
    description: "Documents techniques et événements.",
    items: [
    { label: "Documents & GED", href: "/documents" },
    { label: "Événements", href: "/events" }]

  },
  {
    title: "Expert Lab (IA)",
    icon: Cpu,
    description: "L'intelligence artificielle au service de la conformité normative.",
    items: [
    { label: "Console Expert", href: "/expert" },
    { label: "Expert Lab", href: "/expert-lab" },
    { label: "Assistant Chat IA", href: "/expert/chat" },
    { label: "Calculatrices Normatives", href: "/expert/calculators" },
    { label: "Scanner de Conformité", href: "/expert/scanner" },
    { label: "Archives & Historique", href: "/expert/history" },
    { label: "Logs Système", href: "/expert/logs" }]

  }];


  // Add Dynamic Pages if they exist
  if (dynamicRoutes && dynamicRoutes.length > 0) {
    categories.push({
      title: "Pages Dynamiques",
      icon: FileCode,
      description: "Contenus additionnels générés dynamiquement par notre équipe.",
      items: dynamicRoutes.map((route: unknown) => ({
        label: route.title || route.path.replace('/', ''),
        href: route.path
      }))
    });
  }

  // Add Admin as last category
  categories.push({
    title: "Administration",
    icon: Lock,
    description: "Gestion centralisée du contenu et du système PROQUELEC.",
    items: [
    { label: "Dashboard Admin", href: "/admin" },
    { label: "Gestionnaire de Pages", href: "/admin?tab=pages" },
    { label: "Paramètres Système", href: "/expert/config" },
    { label: "Fournisseurs IA", href: "/expert/ai-providers" },
    { label: "Statistiques Globales", href: "/analytics" }]

  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-16 px-4 md:py-24">
            <div className="max-w-7xl mx-auto space-y-16">

                {/* Header HUD Style */}
                <div className="relative text-center space-y-4">
                    <Badge variant="outline" className="text-[10px] border-proqblue/30 text-proqblue px-4 py-1 uppercase tracking-widest font-black animate-pulse">
                        Sitemap v7.6 // Indexation Active
                    </Badge>
                    <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-tight italic">
                        Plan du <span className="text-proqblue not-italic tracking-normal text-stroke-white">Système</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-slate-400 text-lg font-light leading-relaxed">
                        Cartographie complète de l'écosystème numérique de <span className="text-white font-bold tracking-widest uppercase">Proquelec</span>. Accédez rapidement à toutes nos plateformes et outils.
                    </p>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-proqblue/10 rounded-full blur-[120px] pointer-events-none -z-10" />
                </div>

                <Separator className="bg-slate-800 max-w-4xl mx-auto" />

                {/* Grid Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 px-4">
                    {categories.map((cat, i) =>
          <SitemapCategory key={i} {...cat} />
          )}
                </div>

                {/* Footer Technical Info */}
                <div className="pt-20 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40">
                    <div className="flex items-center gap-6 text-[10px] font-black tracking-widest uppercase">
                        <span className="flex items-center gap-2"><Globe className="w-3 h-3" /> Navigation Chiffrée</span>
                        <span className="flex items-center gap-2"><Shield className="w-3 h-3" /> Accès Sécurisé</span>
                    </div>
                    <div className="text-[9px] font-mono text-center md:text-right">
                        PROQUELEC INDUSTRIAL HUB // © 2026 // DAKAR, SÉNÉGAL
                    </div>
                </div>
            </div>
        </div>);

};

export default Sitemap;