import React from "react";
import {
  Home, Search, FileText, Calendar, File, Image, Download, Mail,
  Users, Layers, Menu, BookOpen, Award, Hammer, Palette,
  BarChart3, Activity, Bell, Box, Settings2,
  ChevronRight, Sparkles, Info, Database, Wrench, FolderOpen, Calculator,
  Brain, FileSpreadsheet, PenTool, Zap, Globe, Crown, ScanFace,
  WifiOff, GraduationCap } from
"lucide-react";

interface Feature {
  title: string;
  description: string;
  configuration: string;
  usage: string;
  aiInfo?: {
    type: "integrated" | "api" | "none";
    details: string;
  };
  icon: unknown;
  status?: "ready" | "beta" | "premium" | "new";
  linkId?: string;
  route?: string;
}

interface Category {
  name: string;
  icon: unknown;
  features: Feature[];
  color: string;
}

const categories: Category[] = [
{
  name: "Outils & Applications",
  icon: Wrench,
  color: "text-emerald-600",
  features: [
  {
    title: "Hub d'Outils (40 Apps)",
    description: "Catalogue complet de 40 applications : Gratuit, Premium et Interne.",
    usage: "Accédez aux calculateurs, IA normative, éditeurs et plus via le Hub unifié.",
    configuration: "Route /outils - Filtrage par catégorie et groupe.",
    aiInfo: { type: "integrated", details: "Classification intelligente et filtres dynamiques." },
    icon: Globe,
    status: "new",
    linkId: "tools_platform",
    route: "/outils"
  },
  {
    title: "GED (Gestion Électronique)",
    description: "Système de gestion documentaire professionnel avec versioning.",
    usage: "Stockez, organisez et partagez vos documents techniques avec contrôle d'accès.",
    configuration: "Route /ged - Avec upload, prévisualisation et métadonnées.",
    aiInfo: { type: "integrated", details: "Indexation automatique et recherche full-text." },
    icon: FolderOpen,
    status: "ready",
    linkId: "ged",
    route: "/ged"
  },
  {
    title: "Office Suite",
    description: "Traitement de texte, tableur et présentations intégrés.",
    usage: "Créez des documents, feuilles de calcul et slides directement dans la plateforme.",
    configuration: "Routes /office/document, /office/spreadsheet, /office/presentation.",
    aiInfo: { type: "api", details: "Génération de contenu assistée par IA (nécessite API)." },
    icon: FileSpreadsheet,
    status: "ready",
    linkId: "office_suite",
    route: "/office/document/new"
  },
  {
    title: "Calculateurs d'Ingénierie",
    description: "Calcul chute de tension, sections câbles, court-circuit (NF C 15-100).",
    usage: "Effectuez des calculs normés avec génération de notes PDF certifiables.",
    configuration: "Intégré dans le Hub Outils - Rubrique 'Électriciens'.",
    aiInfo: { type: "integrated", details: "Formules NF C 15-100 / IEC 60364 intégrées." },
    icon: Calculator,
    status: "ready",
    linkId: "eng_calcs",
    route: "/outils"
  },
  {
    title: "Auditor V8 (Expert Normatif)",
    description: "Assistant IA audité et sécurisé avec Radar 'DeepConcept' anti-erreurs.",
    usage: "Posez des questions techniques. Le système corrige vos fautes et valide les normes (Base Tension, 1.5mm²).",
    configuration: "Hybridation Phi-3.5 (Local) + Règles YAML Strictes.",
    aiInfo: { type: "integrated", details: "100% Offline & Souverain. Aucune fuite de données." },
    icon: Brain,
    status: "new",
    linkId: "yeai",
    route: "/outils"
  },
  {
    title: "Éditeur Schémas Modulaires",
    description: "Conception de schémas électriques avec bibliothèque de composants.",
    usage: "Créez des schémas unifilaires et multifilaires avec export PDF/PNG.",
    configuration: "Route /rubrique-selector puis /schema-builder.",
    aiInfo: { type: "none", details: "Éditeur visuel avec canvas Konva." },
    icon: PenTool,
    status: "ready",
    linkId: "schema_builder",
    route: "/rubrique-selector"
  },
  {
    title: "Expert Lab (Admin)",
    description: "Console d'administration avancée pour les outils IA et configurations.",
    usage: "Gérez les providers IA, historique des requêtes et configurations système.",
    configuration: "Route /expert - Réservé aux administrateurs.",
    aiInfo: { type: "integrated", details: "Logs IA, gestion des clés API et monitoring." },
    icon: Zap,
    status: "premium",
    linkId: "expert_lab",
    route: "/expert"
  },
  {
    title: "Applications Premium",
    description: "18 outils professionnels : audits, rapports, certifications, formations.",
    usage: "Accédez aux fonctionnalités avancées avec abonnement Premium.",
    configuration: "Hub Outils - Onglet 'Premium'.",
    aiInfo: { type: "api", details: "Génération de documents normés et certifications." },
    icon: Crown,
    status: "premium",
    linkId: "premium_apps",
    route: "/outils"
  }]

},
{
  name: "Contenu & Expérience",
  icon: Sparkles,
  color: "text-blue-600",
  features: [
  {
    title: "Accueil (Home)",
    description: "Vitrine principale dynamique avec blocs réorganisables.",
    usage: "Utilisez le drag-and-drop pour réordonner les services, témoignages et bannières.",
    configuration: "Module 'Pages' ou 'Gestion Home' dans le dashboard.",
    aiInfo: { type: "none", details: "Entièrement géré par le CMS interne." },
    icon: Home,
    status: "ready",
    linkId: "home_management"
  },
  {
    title: "Recherche Globale",
    description: "Indexation multi-contenus ultra-rapide sur tout le site.",
    usage: "Tapez n'importe quel terme technique ou nom de norme pour un accès direct.",
    configuration: "Automatique. Basée sur les méta-données et contenus.",
    aiInfo: { type: "integrated", details: "Moteur de recherche hybride optimisé SQL." },
    icon: Search,
    linkId: "universal_search"
  },
  {
    title: "CONTRÔLE ABSOLU",
    description: "Gestionnaire visuel de la page d'accueil (Hero, Header, Parallax, Timing).",
    usage: "Réordonnez les sections, changez les textes, ajustez la vitesse du carrousel et l'effet parallax en temps réel.",
    configuration: "Accessible via l'onglet 'Design Editor' ou directement sur l'Accueil.",
    aiInfo: { type: "integrated", details: "Interface de composition visuelle propriétaire." },
    icon: Crown,
    linkId: "universal_control"
  },
  {
    title: "Blog / SEO",
    description: "Articles, catégories, et optimisation pour les moteurs.",
    usage: "Rédigez vos articles et l'IA génère les méta-descriptions optimisées.",
    configuration: "Rubrique 'Blog' : gestion articles et catégories.",
    aiInfo: { type: "api", details: "Nécessite une clé API OpenAI/Gemini pour l'aide à la rédaction." },
    icon: FileText,
    linkId: "blog"
  },
  {
    title: "Événements",
    description: "Calendrier et gestion des sessions techniques.",
    usage: "Planifiez des formations ou webinaires avec inscription automatique.",
    configuration: "Rubrique 'Événements' pour ajouter des dates.",
    icon: Calendar,
    linkId: "events"
  },
  {
    title: "Documents (DL)",
    description: "Portail documentaire sécurisé via Cloud Storage.",
    usage: "Uploadez vos PDF et gérez les droits d'accès par rôle utilisateur.",
    configuration: "Rubrique 'Documents'. Gestion des URLs signées.",
    icon: File,
    linkId: "documents"
  },
  {
    title: "Médiathèque",
    description: "Organisation visuelle des images et vidéos.",
    usage: "Glissez vos fichiers pour une optimisation et un stockage centralisé.",
    configuration: "Rubriques 'Médiathèque' et 'Galerie'.",
    icon: Image,
    linkId: "media"
  },
  {
    title: "Buttons Directs",
    description: "Génération de call-to-action de téléchargement stylés.",
    usage: "Créez des boutons 'Shortcode' à insérer n'importe où sur vos pages.",
    configuration: "Rubrique 'Boutons de téléchargement' dans Médias.",
    icon: Download,
    linkId: "download_buttons"
  },
  {
    title: "Newsletter",
    description: "CRM simplifié pour collecte d'emails et campagnes.",
    usage: "Visualisez vos abonnés et exportez la liste pour vos mailings.",
    configuration: "Rubrique 'Newsletter' : gestion des abonnés.",
    icon: Mail,
    linkId: "newsletter"
  },
  {
    title: "Personnalisation Footer",
    description: "Gestion avancée de l'arrière-plan et du style du pied de page.",
    usage: "Ajoutez une image de fond immersive (ex: texture sombre ou installation) avec superposition automatique.",
    configuration: "Rubrique 'Thème' (Design) dans le dashboard.",
    status: "ready",
    icon: Palette,
    linkId: "design"
  }]

},
{
  name: "Gestion & Structure",
  icon: Box,
  color: "text-purple-600",
  features: [
  {
    title: "Utilisateurs",
    description: "RBAC (Role Based Access Control) et profils.",
    usage: "Assignez des rôles Admin, Partenaire ou Visiteur avec des permissions strictes.",
    configuration: "Rubrique 'Utilisateurs' : rôles et droits.",
    icon: Users,
    linkId: "users"
  },
  {
    title: "Pages (CMS)",
    description: "Éditeur de pages WYSIWYG et Monaco (HTML/CSS).",
    usage: "Modifiez le code source ou utilisez l'éditeur visuel pour créer des pages complexes.",
    configuration: "Rubrique 'Pages' : création et édition dynamique.",
    aiInfo: { type: "api", details: "Assistant IA facultatif pour générer du code HTML/Tailwind." },
    icon: Layers,
    status: "premium",
    linkId: "pages"
  },
  {
    title: "Menus",
    description: "Hiérarchie de navigation glisser-déposer.",
    usage: "Organisez la structure de votre site avec des menus et sous-menus.",
    configuration: "Rubrique 'Menus' pour structurer l'en-tête.",
    icon: Menu,
    linkId: "menu"
  },
  {
    title: "Design System",
    description: "Identité visuelle globale : couleurs, rayons, typographie.",
    usage: "Changez l'ambiance du site en un clic (Accent, Radius, Police).",
    configuration: "Rubrique 'Thème' (Global Site Config).",
    icon: Palette,
    linkId: "design"
  }]

},
{
  name: "Expertise Métier",
  icon: Award,
  color: "text-orange-600",
  features: [
  {
    title: "Intelligence Normative (RAG V2)",
    description: "Moteur de recherche hybride sur les normes (NS 01-001, NF C18-510).",
    usage: "Recherchez par mots-clés ou questions naturelles. Citations précises des articles.",
    configuration: "Rubrique 'Académie IA' > Explorateur.",
    aiInfo: { type: "integrated", details: "Vector Store local + Recherche Full-Text (Hybride)." },
    icon: Brain,
    status: "new",
    linkId: "academy_explorer",
    route: "/admin"
  },
  {
    title: "Académie & Quiz Dynamique",
    description: "Générateur de QCM automatique basé sur les normes officielles.",
    usage: "Testez vos connaissances avec des quiz de 5 à 50 questions. Correction justifiée.",
    configuration: "Rubrique 'Académie IA' > Quiz.",
    aiInfo: { type: "integrated", details: "Génération procédurale à partir du corpus normatif." },
    icon: GraduationCap,
    status: "new",
    linkId: "academy_quiz",
    route: "/admin"
  },
  {
    title: "Bibliothèque & Offline",
    description: "Accès terrain sans réseau aux normes et supports de cours.",
    usage: "Activez le bouton 'Mode Hors-ligne' pour tout télécharger. Consultation 100% offline.",
    configuration: "Service Worker PWA avec cache intelligent.",
    aiInfo: { type: "none", details: "Stockage IndexedDB/CacheStorage local." },
    icon: WifiOff,
    status: "new",
    linkId: "academy_offline",
    route: "/admin"
  },
  {
    title: "Vision Industrielle (YOLOv8)",
    description: "Détection automatique d'équipements (Disjoncteurs, Tableaux) par photo.",
    usage: "Prenez une photo d'un tableau pour un inventaire instantané des composants.",
    configuration: "Modèle 'Custom Proquelec V1' (Entraînement Local).",
    aiInfo: { type: "integrated", details: "Réseau de Neurones Convolutionnel (CNN) YOLOv8." },
    icon: ScanFace,
    status: "beta",
    linkId: "vision_ai",
    route: "/outils"
  },
  {
    title: "Formations",
    description: "Catalogue e-learning et physique certifiant.",
    usage: "Gérez les inscriptions, les sessions et les attestations de formation.",
    configuration: "Rubrique 'Formations' : quotas, prix et dates.",
    icon: BookOpen,
    linkId: "training"
  },
  {
    title: "Certifications",
    description: "Gestion des labels (Qualif, Spé, Maître).",
    usage: "Suivez le statut de certification de vos membres et partenaires.",
    configuration: "Rubrique 'Certifications' : critères et badges.",
    icon: Award,
    linkId: "certifications"
  },
  {
    title: "Construction",
    description: "Mode maintenance avec accès bypass pour l'admin.",
    usage: "Affichez une page d'attente aux visiteurs pendant vos travaux de maintenance.",
    configuration: "Interrupteur rapide dans 'Construction'.",
    icon: Hammer,
    linkId: "construction"
  }]

},
{
  name: "Opérations & Tech",
  icon: Settings2,
  color: "text-emerald-600",
  features: [
  {
    title: "Analytics / Metabase",
    description: "Plateforme Business Intelligence pour transformer vos données en insights visuels.",
    usage: "Créez des graphiques et dashboards sans SQL. Idéal pour suivre les KPI métier et les stats d'utilisation.",
    configuration: "URL: http://localhost:3101. Docker doit être actif. Accès via le bouton 'BI Metabase' du dashboard.",
    aiInfo: { type: "integrated", details: "Moteur de visualisation auto-adaptatif." },
    icon: BarChart3,
    status: "ready",
    linkId: "infrastructure"
  },
  {
    title: "Documentation API (Swagger)",
    description: "Console interactive permettant de tester et documenter chaque endpoint du backend.",
    usage: "Utilisez 'Try it out' pour tester les routes. Authentifiez-vous via 'Authorize' avec votre token JWT.",
    configuration: "URL: http://localhost:3103/api-docs. Scan automatique des annotations JSDoc du serveur.",
    aiInfo: { type: "integrated", details: "Génération automatique OpenAPI 3.0." },
    icon: Search,
    status: "new",
    linkId: "infrastructure"
  },
  {
    title: "Database Explorer",
    description: "Visualisation directe des tables SQL (Explorateur de données).",
    usage: "Parcourez les tables, visualisez les types de données et analysez les lignes sans outil externe.",
    configuration: "Port 5433 (PostgreSQL interne).",
    aiInfo: { type: "integrated", details: "Explorateur de schéma dynamique." },
    icon: Database,
    status: "ready",
    linkId: "database"
  },
  {
    title: "Audit Trail",
    description: "Historique complet des actions admin (RBAC) pour la traçabilité.",
    usage: "Vérifiez qui a modifié une page, un document ou supprimé un utilisateur.",
    configuration: "Route API /api/audit - Logs en base de données.",
    icon: Activity,
    linkId: "audit"
  },
  {
    title: "Surveillance (Monitoring)",
    description: "Alertes système, centre de messagerie et état de santé.",
    usage: "Surveillez l'uptime et les erreurs via l'endpoint /health.",
    configuration: "Endpoint /health optimisé pour Deep-Diagnostics.",
    icon: Bell,
    linkId: "monitoring"
  }]

}];


import { useNavigate } from "react-router-dom";

export default function DashboardFeaturesPage({ onTabChange }: {onTabChange: (id: string) => void;}) {
  const navigate = useNavigate();

  const handleFeatureClick = (feature: Feature) => {
    if (feature.route) {
      navigate(feature.route);
    } else if (feature.linkId) {
      onTabChange(feature.linkId);
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    const styles = {
      new: 'bg-emerald-100 text-emerald-700',
      ready: 'bg-blue-100 text-blue-700',
      beta: 'bg-purple-100 text-purple-700',
      premium: 'bg-amber-100 text-amber-700'
    };
    return (
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${styles[status as keyof typeof styles] || styles.ready}`}>
        {status === 'new' ? 'Nouveau' : status}
      </span>);

  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-extrabold text-proqblue flex items-center gap-3">
          <Settings2 className="h-10 w-10" />
          Moteur de Fonctionnalités
        </h1>
        <p className="mt-2 text-proqblue-dark text-lg opacity-80 max-w-2xl">
          Découvrez la puissance de PROQUELEC V8 : IA Hybride, Vision par Ordinateur (YOLO) et Auditeur Normatif souverain.
          Une plateforme conçue pour la performance et la sécurité absolue.
        </p>
      </div>

      <div className="space-y-16">
        {categories.map((cat, idx) =>
        <section key={idx} className="relative">
            <div className="flex items-center gap-4 mb-8">
              <div className={`p-3 rounded-2xl bg-white shadow-sm ${cat.color}`}>
                <cat.icon className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">{cat.name}</h2>
              <div className="flex-1 h-[1px] bg-gray-200 ml-4 hidden md:block"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cat.features.map((f, i) =>
            <div
              key={i}
              onClick={() => handleFeatureClick(f)}
              className={`group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col ${f.linkId || f.route ? 'cursor-pointer' : ''}`}>
              
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors ${cat.color}`}>
                      <f.icon className="h-6 w-6" />
                    </div>
                    {getStatusBadge(f.status)}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-proqblue transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-grow">
                    {f.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2 text-[11px] bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
                      <Settings2 className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="text-blue-700">
                        <span className="font-bold">Usage:</span> {f.usage}
                      </div>
                    </div>

                    {f.aiInfo && f.aiInfo.type !== 'none' &&
                <div className={`flex items-start gap-2 text-[11px] p-2 rounded-lg border ${f.aiInfo.type === 'api' ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
                        <Sparkles className={`h-3 w-3 mt-0.5 flex-shrink-0 ${f.aiInfo.type === 'api' ? 'text-amber-500' : 'text-emerald-500'}`} />
                        <div className={f.aiInfo.type === 'api' ? 'text-amber-700' : 'text-emerald-700'}>
                          <span className="font-bold">IA ({f.aiInfo.type === 'api' ? 'API' : 'Intégrée'}):</span> {f.aiInfo.details}
                        </div>
                      </div>
                }
                  </div>

                  <div className="pt-3 border-t border-gray-50 mt-auto">
                    <div className="flex items-start gap-2">
                      <Info className="h-3 w-3 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="text-[10px] text-gray-500 italic">
                        <span className="font-semibold text-gray-700 not-italic">Config:</span> {f.configuration}
                      </div>
                    </div>
                  </div>

                  {/* Bouton subtil d'indication */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="h-5 w-5 text-proqblue" />
                  </div>
                </div>
            )}
            </div>
          </section>
        )}
      </div>

      {/* Infrastructure & Connection Info */}
      <section className="mt-16 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-2xl bg-slate-100 text-slate-700">
            <Settings2 className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Infrastructure & Connexion</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Comptes Administrateurs */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-proqblue flex items-center gap-2">
              <Users className="h-5 w-5" />
              Comptes Accès Admin
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-sm font-bold text-slate-800">Administrateur Principal</div>
                <div className="text-xs text-slate-500 mt-1">Email: oumarkebe@proquelec.sn</div>
                <div className="text-[10px] mt-2 text-slate-400 italic">Usage: Production & Migration officielle</div>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <div className="text-sm font-bold text-blue-800">Compte Expérimental</div>
                <div className="text-xs text-blue-600 mt-1">Email: experimental@proquelec.com</div>
                <div className="text-xs text-blue-600">Password: experimental</div>
                <div className="text-[10px] mt-2 text-blue-400 italic">Usage: Tests & Déploiements rapides</div>
              </div>
            </div>
          </div>

          {/* Ports et Démarrage */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-proqblue flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Services & Ports réseau
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-emerald-800">Frontend (UI)</span>
                </div>
                <code className="text-[11px] bg-white px-2 py-1 rounded shadow-sm text-emerald-700">Port 5173</code>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-orange-50 border border-orange-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-orange-800">Backend (Python V8)</span>
                </div>
                <code className="text-[11px] bg-white px-2 py-1 rounded shadow-sm text-orange-700">Port 8002</code>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-blue-800">BI Metabase</span>
                </div>
                <code className="text-[11px] bg-white px-2 py-1 rounded shadow-sm text-blue-700">Port 3101</code>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 border border-purple-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-purple-800">Keycloak Auth</span>
                </div>
                <code className="text-[11px] bg-white px-2 py-1 rounded shadow-sm text-purple-700">Port 8183</code>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-green-800">Swagger API</span>
                </div>
                <code className="text-[11px] bg-white px-2 py-1 rounded shadow-sm text-green-700">Port 3103</code>
              </div>
              <div className="mt-4 p-4 rounded-2xl bg-gray-900 text-gray-300">
                <div className="text-[10px] uppercase font-bold text-gray-500 mb-2">Commandes de démarrage</div>
                <code className="block text-[11px] font-mono leading-relaxed">
                  # Backend Python <br />
                  <span className="text-emerald-400">python haystack_backend/server.py</span><br />
                  # Frontend React <br />
                  <span className="text-blue-400">npm run dev</span>
                </code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Info */}
      <div className="mt-20 p-8 rounded-3xl bg-gradient-to-r from-proqblue to-proqblue-dark text-white shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="h-6 w-6 text-amber-300" />
              Plateforme Evolutive
            </h3>
            <p className="text-white/80">
              Notre équipe déploie des mises à jour hebdomadaires. De nouvelles fonctionnalités comme l'IA générative et l'automatisation des rapports sont en cours de développement.
            </p>
          </div>
          <button className="px-8 py-3 bg-white text-proqblue font-bold rounded-2xl hover:bg-amber-100 transition-colors shadow-lg">
            Consulter la documentation
          </button>
        </div>
      </div>
    </div>);

}