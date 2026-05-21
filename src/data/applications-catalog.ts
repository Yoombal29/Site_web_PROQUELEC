/**
 * CATALOGUE DES 40 APPLICATIONS PROQUELEC
 * Classification : Gratuit / Premium / Interne
 */

import {
  Zap, ShieldCheck, Calculator, BookOpen, Brain, Palette,
  Home, Lightbulb, HelpCircle, PlugZap, FileText,
  AlertTriangle, Database, GitCompare,
  GraduationCap, Video, FileSpreadsheet, ClipboardCheck, Users, Library,
  UserCheck, MessageSquare, FileCheck,
  Edit3, FileSignature,
  Gauge, BarChart3, Archive,
  Cable, CircuitBoard, TableProperties, History, Eye, MapPin,
  Network, TrendingUp, Cpu, Building2 } from
"lucide-react";

export type AppCategory = 'free' | 'premium' | 'internal';
export type AppStatus = 'active' | 'coming' | 'development';

export interface ProquelecApp {
  id: string;
  title: string;
  description: string;
  icon: unknown;
  category: AppCategory;
  status: AppStatus;
  norme?: string;
  route?: string;
  externalUrl?: string;
  group: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🌍 GRAND PUBLIC GRATUIT (10 Applications)
// ═══════════════════════════════════════════════════════════════════════════════
export const freeApps: ProquelecApp[] = [
{
  id: "diagnostic-maison",
  title: "Diagnostic Sécurité Maison",
  description: "Évaluez la sécurité électrique de votre domicile en quelques questions simples.",
  icon: Home,
  category: "free",
  status: "coming",
  group: "Grand Public",
  route: "/apps/diagnostic-maison"
},
{
  id: "assistant-securite",
  title: "Assistant Sécurité Électrique",
  description: "Conseils et bonnes pratiques pour une utilisation sécurisée de l'électricité.",
  icon: ShieldCheck,
  category: "free",
  status: "coming",
  group: "Grand Public",
  route: "/apps/assistant-securite"
},
{
  id: "simulateur-facture",
  title: "Simulateur Facture Électrique",
  description: "Estimez votre consommation et trouvez des moyens d'économiser.",
  icon: TrendingUp,
  category: "free",
  status: "coming",
  group: "Grand Public",
  route: "/apps/simulateur-facture"
},
{
  id: "guide-renovation",
  title: "Guide Rénovation Électrique",
  description: "Guide interactif pour vos projets de rénovation électrique.",
  icon: Lightbulb,
  category: "free",
  status: "coming",
  group: "Grand Public",
  route: "/apps/guide-renovation"
},
{
  id: "glossaire-electrique",
  title: "Glossaire Électrique Intelligent",
  description: "Dictionnaire complet des termes techniques de l'électricité.",
  icon: BookOpen,
  category: "free",
  status: "coming",
  group: "Grand Public",
  route: "/apps/glossaire"
},
{
  id: "mini-chat-ia",
  title: "Mini Chat IA",
  description: "Posez vos questions simples sur l'électricité à notre assistant.",
  icon: MessageSquare,
  category: "free",
  status: "coming",
  group: "Grand Public",
  route: "/apps/mini-chat"
},
{
  id: "verif-surcharge",
  title: "Vérification Surcharge",
  description: "Vérifiez si vos multiprises et circuits sont en surcharge.",
  icon: PlugZap,
  category: "free",
  status: "coming",
  group: "Grand Public",
  route: "/apps/verif-surcharge"
},
{
  id: "faq-normes",
  title: "FAQ Normes Vulgarisées",
  description: "Questions fréquentes sur les normes électriques expliquées simplement.",
  icon: HelpCircle,
  category: "free",
  status: "coming",
  group: "Grand Public",
  route: "/apps/faq-normes"
},
{
  id: "calcul-puissance",
  title: "Calcul Puissance Appareils",
  description: "Calculez la puissance totale de vos appareils électriques.",
  icon: Gauge,
  category: "free",
  status: "coming",
  group: "Grand Public",
  route: "/apps/calcul-puissance"
},
{
  id: "decouverte-schema",
  title: "Découverte Schéma Électrique",
  description: "Apprenez à lire un schéma électrique (consultation seule).",
  icon: Eye,
  category: "free",
  status: "coming",
  group: "Grand Public",
  route: "/apps/decouverte-schema"
}];


// ═══════════════════════════════════════════════════════════════════════════════
// 💼 GRAND PUBLIC / PROS PREMIUM (18 Applications)
// ═══════════════════════════════════════════════════════════════════════════════
export const premiumApps: ProquelecApp[] = [
// ─── ÉLECTRICIENS / BUREAUX D'ÉTUDES ───
{
  id: "eng-calcs",
  title: "Calcul Chute de Tension",
  description: "Calcul normé de chute de tension selon NS 01-001 Titre 5.",
  icon: Calculator,
  category: "premium",
  status: "active",
  norme: "NS 01-001 / Titre 5",
  group: "Électriciens",
  route: "/outils" // Existe déjà
},
{
  id: "dimensionnement-cables",
  title: "Dimensionnement Câbles & Protections",
  description: "Calcul des sections de câbles, disjoncteurs, fusibles et DDR.",
  icon: Cable,
  category: "premium",
  status: "coming",
  norme: "NF C 15-100",
  group: "Électriciens",
  route: "/apps/dimensionnement"
},
{
  id: "calcul-court-circuit",
  title: "Calcul Court-Circuit",
  description: "Calcul du courant de court-circuit et pouvoir de coupure.",
  icon: Zap,
  category: "premium",
  status: "coming",
  norme: "IEC 60909",
  group: "Électriciens",
  route: "/apps/court-circuit"
},
{
  id: "verif-terre",
  title: "Vérification Mise à la Terre",
  description: "Vérification complète du système de mise à la terre.",
  icon: CircuitBoard,
  category: "premium",
  status: "coming",
  norme: "NF C 15-100",
  group: "Électriciens",
  route: "/apps/mise-terre"
},
{
  id: "notes-calcul-pdf",
  title: "Notes de Calcul PDF",
  description: "Générateur de notes de calcul certifiables au format PDF.",
  icon: FileText,
  category: "premium",
  status: "coming",
  norme: "ISO 9001",
  group: "Électriciens",
  route: "/apps/notes-calcul"
},
{
  id: "audit-conformite",
  title: "Audit Conformité Électrique",
  description: "Audit automatique de conformité NF C 15-100, IEC et normes locales.",
  icon: ClipboardCheck,
  category: "premium",
  status: "coming",
  norme: "NF C 15-100",
  group: "Électriciens",
  route: "/apps/audit-conformite"
},
{
  id: "historique-interventions",
  title: "Historique Interventions",
  description: "Gestion de l'historique des interventions par site client.",
  icon: History,
  category: "premium",
  status: "coming",
  group: "Électriciens",
  route: "/apps/historique"
},
{
  id: "gestion-tableaux",
  title: "Gestion Tableaux Électriques",
  description: "Repérage, étiquettes et équilibrage des phases.",
  icon: TableProperties,
  category: "premium",
  status: "coming",
  norme: "NF C 15-100",
  group: "Électriciens",
  route: "/apps/tableaux"
},
{
  id: "simulation-reseau",
  title: "Simulation Réseau Électrique",
  description: "Simulation de charges et scénarios sur réseau électrique.",
  icon: Network,
  category: "premium",
  status: "coming",
  group: "Ingénierie",
  route: "/apps/simulation"
},
{
  id: "analyse-energetique",
  title: "Analyse Énergétique",
  description: "Analyse de consommation et prévisions énergétiques.",
  icon: BarChart3,
  category: "premium",
  status: "coming",
  group: "Ingénierie",
  route: "/apps/energie"
},
// ─── FORMATION & DOCUMENTS ───
{
  id: "expert-rag-unified",
  title: "Moteur RAG Unifié (Haystack)",
  description: "Architecture Cerveau Gauche/Droit. Fusionne la recherche intuitive (Embeddings) et la rigueur logique (Règles).",
  icon: Brain,
  category: "premium",
  status: "active",
  norme: "NS 01-001",
  group: "IA & Outils",
  route: "/outils"
},
{
  id: "haystack-backend",
  title: "Backend Souverain Python",
  description: "Le cœur de l'intelligence (Port 8000). Indexation vectorielle des 1994 articles de la NS 01-001.",
  icon: Cpu,
  category: "premium",
  status: "active",
  group: "IA & Outils",
  route: "/outils"
},
{
  id: "master-audit-protocol",
  title: "Pipeline Audit Maître (5 Couches)",
  description: "Le protocole de réponse en 5 étapes : Identité, Ingénierie, Conformité, Sénégal, Terrain.",
  icon: ShieldCheck,
  category: "premium",
  status: "active",
  group: "IA & Outils",
  route: "/outils"
},
{
  id: "expert-rules-engine",
  title: "Moteur de Règles Déterministes",
  description: "Cerveau Gauche : Formules, matrices de décision et checklists injectés dans le pipeline Haystack.",
  icon: Calculator,
  category: "premium",
  status: "active",
  group: "IA & Outils",
  route: "/outils"
},
{
  id: "proquelec-docs",
  title: "PROQUELEC Docs",
  description: "Éditeur Word-like offline avec versioning et normes intégrées.",
  icon: Edit3,
  category: "premium",
  status: "active",
  group: "Documents",
  route: "/office/document/new"
},
{
  id: "templates-techniques",
  title: "Templates Techniques Normés",
  description: "Modèles de rapports, PV et attestations conformes.",
  icon: FileSpreadsheet,
  category: "premium",
  status: "coming",
  group: "Documents",
  route: "/apps/templates"
},
{
  id: "generateur-rapports",
  title: "Générateur de Rapports IA",
  description: "Génération automatique de rapports d'audit par IA.",
  icon: FileCheck,
  category: "premium",
  status: "coming",
  group: "Documents",
  route: "/apps/rapports-ia"
},
{
  id: "bibliotheque-normes",
  title: "Bibliothèque Normes Intelligente",
  description: "Accès complet aux normes électriques avec recherche intelligente.",
  icon: Library,
  category: "premium",
  status: "active",
  norme: "NS 01-001",
  group: "Formation",
  route: "/outils" // Explorateur Normatif
},
{
  id: "generation-cours",
  title: "Génération Cours & Diapos IA",
  description: "Création automatique de supports de formation par IA.",
  icon: Video,
  category: "premium",
  status: "coming",
  group: "Formation",
  route: "/apps/cours-ia"
},
{
  id: "qcm-certifiants",
  title: "QCM & Examens Certifiants",
  description: "Questionnaires interactifs et examens de certification.",
  icon: GraduationCap,
  category: "premium",
  status: "coming",
  group: "Formation",
  route: "/apps/qcm"
},
{
  id: "signature-electronique",
  title: "Signature Électronique",
  description: "Signature et horodatage légal des documents techniques.",
  icon: FileSignature,
  category: "premium",
  status: "coming",
  group: "Documents",
  route: "/apps/signature"
},
{
  id: "schema-modulaire",
  title: "Éditeur Schémas Électriques",
  description: "Éditeur visuel pour schémas unifilaires et multifilaires.",
  icon: Palette,
  category: "premium",
  status: "active",
  norme: "NF C 15-100",
  group: "Électriciens",
  route: "/rubrique-selector"
}];


// ═══════════════════════════════════════════════════════════════════════════════
// 🏛️ USAGE INTERNE PROQUELEC (12 Applications - Dashboard/GED)
// ═══════════════════════════════════════════════════════════════════════════════
export const internalApps: ProquelecApp[] = [
{
  id: "ia-inspecteur",
  title: "IA Inspecteur PROQUELEC",
  description: "Diagnostic avancé avec recommandations pour inspections officielles.",
  icon: UserCheck,
  category: "internal",
  status: "coming",
  group: "Inspection",
  route: "/dashboard"
},
{
  id: "validation-rapports",
  title: "Validation Rapports & Audits",
  description: "Workflow de validation des rapports par les inspecteurs.",
  icon: ClipboardCheck,
  category: "internal",
  status: "coming",
  group: "Inspection",
  route: "/dashboard"
},
{
  id: "gestion-normes",
  title: "Gestion Normes Officielles",
  description: "Administration et versioning des normes dans le système.",
  icon: Database,
  category: "internal",
  status: "active",
  group: "GED",
  route: "/ged"
},
{
  id: "atomisation-pdf",
  title: "Atomisation PDF Normes",
  description: "Extraction et structuration automatique des articles de normes.",
  icon: Cpu,
  category: "internal",
  status: "active",
  group: "GED",
  route: "/ged"
},
{
  id: "versioning-normes",
  title: "Versioning Normes & Lois",
  description: "Suivi des versions et mises à jour réglementaires.",
  icon: GitCompare,
  category: "internal",
  status: "coming",
  group: "GED",
  route: "/ged"
},
{
  id: "stats-conformite",
  title: "Statistiques Conformité",
  description: "Tableaux de bord et analyses des taux de conformité.",
  icon: BarChart3,
  category: "internal",
  status: "coming",
  group: "Dashboard",
  route: "/dashboard"
},
{
  id: "supervision-certifies",
  title: "Supervision Utilisateurs Certifiés",
  description: "Gestion des électriciens certifiés PROQUELEC.",
  icon: Users,
  category: "internal",
  status: "coming",
  group: "Dashboard",
  route: "/dashboard"
},
{
  id: "mode-inspecteur",
  title: "Mode Inspecteur Terrain",
  description: "Application mobile pour inspections sur site.",
  icon: MapPin,
  category: "internal",
  status: "coming",
  group: "Inspection",
  route: "/dashboard"
},
{
  id: "detection-fraude",
  title: "Détection Fraude / Faux Rapports",
  description: "Algorithmes de détection des anomalies et falsifications.",
  icon: AlertTriangle,
  category: "internal",
  status: "coming",
  group: "Dashboard",
  route: "/dashboard"
},
{
  id: "logs-legaux",
  title: "Logs Légaux & Traçabilité",
  description: "Journaux d'audit complets pour conformité légale.",
  icon: FileText,
  category: "internal",
  status: "active",
  group: "GED",
  route: "/ged"
},
{
  id: "archivage-legal",
  title: "Archivage Légal Long Terme",
  description: "Conservation sécurisée des documents selon les exigences légales.",
  icon: Archive,
  category: "internal",
  status: "coming",
  group: "GED",
  route: "/ged"
},
{
  id: "backoffice-institutionnel",
  title: "Backoffice Institutionnel",
  description: "Interface d'administration pour les partenaires étatiques.",
  icon: Building2,
  category: "internal",
  status: "active",
  group: "Dashboard",
  route: "/dashboard"
}];


// ═══════════════════════════════════════════════════════════════════════════════
// CATALOGUE COMPLET
// ═══════════════════════════════════════════════════════════════════════════════
export const allApps: ProquelecApp[] = [...freeApps, ...premiumApps, ...internalApps];

export const getAppsByCategory = (category: AppCategory): ProquelecApp[] => {
  return allApps.filter((app) => app.category === category);
};

export const getAppsByGroup = (group: string): ProquelecApp[] => {
  return allApps.filter((app) => app.group === group);
};

export const getActiveApps = (): ProquelecApp[] => {
  return allApps.filter((app) => app.status === 'active');
};

export const getComingApps = (): ProquelecApp[] => {
  return allApps.filter((app) => app.status === 'coming');
};

// Groupes par catégorie
export const appGroups = {
  free: ["Grand Public"],
  premium: ["Électriciens", "Ingénierie", "IA & Outils", "Documents", "Formation"],
  internal: ["Inspection", "Dashboard", "GED"]
};