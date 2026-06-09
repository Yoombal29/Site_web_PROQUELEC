import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Brain,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Download,
  FileSignature,
  FileText,
  GraduationCap,
  Hash,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

type ToolMode =
  | 'checklist'
  | 'assistant'
  | 'calculator'
  | 'document'
  | 'tracker'
  | 'quiz'
  | 'signature'
  | 'guide'
  | 'ia';

interface MetricInput {
  id: string;
  label: string;
  unit?: string;
  value: number;
}

interface ToolConfig {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  mode: ToolMode;
  icon: React.ElementType;
  accent: 'emerald' | 'amber' | 'blue' | 'purple' | 'red';
  norme?: string;
  metrics?: MetricInput[];
  checklist?: string[];
  deliverables?: string[];
  questions?: Array<{
    question: string;
    answer: string;
    options: string[];
  }>;
  prompts?: Array<{
    label: string;
    answer: string;
  }>;
}

const ACCENTS = {
  emerald: {
    text: 'text-emerald-300',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    button: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
  },
  amber: {
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    button: 'bg-amber-400 hover:bg-amber-300 text-slate-950',
  },
  blue: {
    text: 'text-sky-300',
    border: 'border-sky-500/30',
    bg: 'bg-sky-500/10',
    button: 'bg-sky-500 hover:bg-sky-400 text-slate-950',
  },
  purple: {
    text: 'text-violet-300',
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/10',
    button: 'bg-violet-500 hover:bg-violet-400 text-white',
  },
  red: {
    text: 'text-red-300',
    border: 'border-red-500/30',
    bg: 'bg-red-500/10',
    button: 'bg-red-500 hover:bg-red-400 text-white',
  },
} satisfies Record<ToolConfig['accent'], Record<string, string>>;

const TOOL_CONFIGS: Record<string, ToolConfig> = {
  'diagnostic-maison': {
    id: 'diagnostic-maison',
    title: 'Diagnostic Sécurité Maison',
    eyebrow: 'Grand public',
    description:
      'Contrôle guidé pour repérer les risques visibles dans un logement avant de demander une intervention.',
    mode: 'checklist',
    icon: ShieldCheck,
    accent: 'emerald',
    checklist: [
      'Le tableau électrique est accessible et fermé.',
      'Les prises proches de l’eau sont protégées.',
      'Aucune prise ne chauffe après usage.',
      'Les multiprises ne sont pas en cascade.',
      'Un différentiel 30 mA est présent.',
      'Les câbles visibles ne sont pas abîmés.',
      'Les enfants ne peuvent pas toucher les parties électriques.',
    ],
    deliverables: ['Score de risque logement', 'Priorités de correction', 'Résumé à transmettre'],
  },
  'assistant-securite': {
    id: 'assistant-securite',
    title: 'Assistant Sécurité Électrique',
    eyebrow: 'Conseil rapide',
    description:
      'Assistant de prévention pour obtenir une réponse courte et prudente sur les situations courantes.',
    mode: 'assistant',
    icon: Brain,
    accent: 'blue',
    prompts: [
      {
        label: 'Une prise chauffe',
        answer:
          'Coupez le circuit si possible, débranchez l’appareil et évitez de réutiliser la prise avant contrôle. Une prise qui chauffe peut signaler un mauvais serrage, une surcharge ou un matériel dégradé.',
      },
      {
        label: 'Le disjoncteur saute souvent',
        answer:
          'Identifiez l’appareil ou la zone qui provoque la coupure. Si le défaut revient, faites contrôler le circuit, car il peut s’agir d’une fuite, d’un court-circuit ou d’une surcharge.',
      },
      {
        label: 'Multiprises en cascade',
        answer:
          'Évitez les multiprises branchées entre elles. Répartissez les appareils puissants sur des circuits adaptés et privilégiez une installation fixe vérifiée.',
      },
    ],
  },
  'simulateur-facture': {
    id: 'simulateur-facture',
    title: 'Simulateur Facture Électrique',
    eyebrow: 'Consommation',
    description:
      'Estimation simple de coût mensuel à partir de la puissance, durée d’usage et prix du kWh.',
    mode: 'calculator',
    icon: BarChart3,
    accent: 'emerald',
    metrics: [
      { id: 'power', label: 'Puissance moyenne', unit: 'W', value: 1200 },
      { id: 'hours', label: 'Utilisation par jour', unit: 'h', value: 4 },
      { id: 'price', label: 'Prix du kWh', unit: 'FCFA', value: 120 },
      { id: 'days', label: 'Jours par mois', unit: 'j', value: 30 },
    ],
  },
  'guide-renovation': {
    id: 'guide-renovation',
    title: 'Guide Rénovation Électrique',
    eyebrow: 'Projet logement',
    description:
      'Parcours de préparation pour sécuriser une rénovation électrique et éviter les demandes incomplètes.',
    mode: 'guide',
    icon: BookOpen,
    accent: 'emerald',
    checklist: [
      'Décrire les pièces concernées et les nouveaux usages.',
      'Photographier le tableau existant.',
      'Lister les appareils puissants à raccorder.',
      'Prévoir la protection des zones humides.',
      'Demander un plan de circuits avant travaux.',
      'Conserver devis, photos et attestations.',
    ],
    deliverables: ['Brief travaux', 'Checklist avant devis', 'Dossier photo'],
  },
  'mini-chat-ia': {
    id: 'mini-chat-ia',
    title: 'Mini Chat IA',
    eyebrow: 'Questions simples',
    description:
      'Réponses courtes pour orienter le public, sans remplacer un contrôle technique qualifié.',
    mode: 'assistant',
    icon: Brain,
    accent: 'blue',
    prompts: [
      {
        label: 'Puis-je réparer moi-même ?',
        answer:
          'Les gestes simples comme débrancher ou couper le circuit sont raisonnables. Pour ouvrir un tableau, modifier une prise ou intervenir sur un câble, faites appel à un professionnel.',
      },
      {
        label: 'Quand demander un diagnostic ?',
        answer:
          'Demandez un diagnostic en cas de disjonctions fréquentes, prises chaudes, odeur de brûlé, installation ancienne ou travaux de rénovation.',
      },
      {
        label: 'Que préparer avant contact ?',
        answer:
          'Préparez l’adresse, des photos du tableau et des zones concernées, la description du symptôme et vos disponibilités.',
      },
    ],
  },
  'verif-surcharge': {
    id: 'verif-surcharge',
    title: 'Vérification Surcharge',
    eyebrow: 'Multiprises et circuits',
    description:
      'Compare la charge estimée d’un groupe d’appareils avec la capacité théorique du circuit.',
    mode: 'calculator',
    icon: Zap,
    accent: 'red',
    metrics: [
      { id: 'voltage', label: 'Tension circuit', unit: 'V', value: 230 },
      { id: 'breaker', label: 'Calibre disjoncteur', unit: 'A', value: 16 },
      { id: 'load', label: 'Puissance appareils', unit: 'W', value: 2500 },
      { id: 'factor', label: 'Marge de sécurité', unit: '%', value: 80 },
    ],
  },
  'decouverte-schema': {
    id: 'decouverte-schema',
    title: 'Découverte Schéma Électrique',
    eyebrow: 'Lecture guidée',
    description:
      'Aide visuelle pour comprendre les éléments principaux d’un schéma électrique avant d’utiliser l’éditeur.',
    mode: 'guide',
    icon: BookOpen,
    accent: 'blue',
    checklist: [
      'Repérer la source d’alimentation.',
      'Identifier les protections générales.',
      'Suivre les départs vers les circuits.',
      'Distinguer éclairage, prises et charges spécialisées.',
      'Vérifier la présence de terre et différentiel.',
      'Noter les zones non comprises avant avis professionnel.',
    ],
    deliverables: ['Méthode de lecture', 'Points à vérifier', 'Orientation vers schéma builder'],
  },
  'calcul-puissance': {
    id: 'calcul-puissance',
    title: 'Calcul Puissance Appareils',
    eyebrow: 'P = U × I × cosφ',
    description:
      'Calcule la puissance d’un appareil ou d’un circuit à partir de la tension, du courant et du facteur de puissance.',
    mode: 'calculator',
    icon: Calculator,
    accent: 'emerald',
    metrics: [
      { id: 'voltage', label: 'Tension', unit: 'V', value: 230 },
      { id: 'current', label: 'Courant', unit: 'A', value: 10 },
      { id: 'powerFactor', label: 'Facteur de puissance', unit: 'cosφ', value: 0.9 },
    ],
  },
  'calcul-court-circuit': {
    id: 'calcul-court-circuit',
    title: 'Calcul Court-Circuit',
    eyebrow: 'IEC 60909 simplifié',
    description:
      'Estime le courant de court-circuit présumé à partir de la tension et de l’impédance de boucle.',
    mode: 'calculator',
    icon: Zap,
    accent: 'amber',
    norme: 'IEC 60909',
    metrics: [
      { id: 'voltage', label: 'Tension réseau', unit: 'V', value: 400 },
      { id: 'impedance', label: 'Impédance de boucle', unit: 'Ω', value: 0.18 },
      { id: 'coefficient', label: 'Coefficient max', unit: 'c', value: 1.1 },
    ],
  },
  'notes-calcul-pdf': {
    id: 'notes-calcul-pdf',
    title: 'Notes de Calcul PDF',
    eyebrow: 'Dossier technique',
    description:
      'Génère une note de calcul textuelle prête à copier ou télécharger pour constituer le dossier.',
    mode: 'document',
    icon: FileText,
    accent: 'purple',
    norme: 'ISO 9001',
    checklist: [
      'Hypothèses de calcul renseignées.',
      'Sections et protections justifiées.',
      'Chute de tension indiquée.',
      'Réserves et limites précisées.',
    ],
    deliverables: ['Note de calcul', 'Hypothèses', 'Liste de réserves'],
  },
  'audit-conformite': {
    id: 'audit-conformite',
    title: 'Audit Conformité Électrique',
    eyebrow: 'Pré-audit',
    description:
      'Checklist de pré-audit pour classer les risques et préparer une visite technique.',
    mode: 'checklist',
    icon: ClipboardCheck,
    accent: 'amber',
    norme: 'NF C 15-100',
    checklist: [
      'Plans et schémas disponibles.',
      'Protection différentielle identifiée.',
      'Mise à la terre mesurée ou documentée.',
      'Tableaux étiquetés et accessibles.',
      'Circuits humides protégés.',
      'Photos des réserves disponibles.',
      'Historique d’incidents renseigné.',
    ],
    deliverables: ['Score pré-audit', 'Criticité', 'Dossier de visite'],
  },
  'historique-interventions': {
    id: 'historique-interventions',
    title: 'Historique Interventions',
    eyebrow: 'Suivi site client',
    description:
      'Registre local pour tracer interventions, réserves, responsables et prochaines actions.',
    mode: 'tracker',
    icon: ClipboardCheck,
    accent: 'blue',
    deliverables: ['Journal local', 'Actions ouvertes', 'Export texte'],
  },
  'gestion-tableaux': {
    id: 'gestion-tableaux',
    title: 'Gestion Tableaux Électriques',
    eyebrow: 'Repérage et charge',
    description:
      'Aide au repérage des circuits et à la vérification rapide de la charge d’un tableau.',
    mode: 'calculator',
    icon: Calculator,
    accent: 'amber',
    norme: 'NF C 15-100',
    metrics: [
      { id: 'circuits', label: 'Nombre de circuits', unit: '', value: 12 },
      { id: 'load', label: 'Puissance totale estimée', unit: 'kW', value: 8.5 },
      { id: 'phases', label: 'Nombre de phases', unit: '', value: 3 },
    ],
  },
  'simulation-reseau': {
    id: 'simulation-reseau',
    title: 'Simulation Réseau Électrique',
    eyebrow: 'Scénario de charge',
    description:
      'Simulation simplifiée de charge réseau pour détecter surcharge et déséquilibre potentiel.',
    mode: 'calculator',
    icon: BarChart3,
    accent: 'blue',
    metrics: [
      { id: 'installedPower', label: 'Puissance installée', unit: 'kW', value: 25 },
      { id: 'simultaneity', label: 'Coefficient simultanéité', unit: '%', value: 65 },
      { id: 'subscription', label: 'Puissance souscrite', unit: 'kW', value: 18 },
    ],
  },
  'analyse-energetique': {
    id: 'analyse-energetique',
    title: 'Analyse Énergétique',
    eyebrow: 'Prévision',
    description:
      'Analyse rapide de consommation mensuelle et estimation d’économie après correction.',
    mode: 'calculator',
    icon: BarChart3,
    accent: 'emerald',
    metrics: [
      { id: 'monthlyKwh', label: 'Consommation mensuelle', unit: 'kWh', value: 850 },
      { id: 'price', label: 'Prix du kWh', unit: 'FCFA', value: 120 },
      { id: 'saving', label: 'Gain visé', unit: '%', value: 12 },
    ],
  },
  'templates-techniques': {
    id: 'templates-techniques',
    title: 'Templates Techniques Normés',
    eyebrow: 'Modèles prêts',
    description:
      'Bibliothèque de modèles pour rapports, PV, attestations et fiches de contrôle.',
    mode: 'document',
    icon: FileText,
    accent: 'purple',
    checklist: [
      'Rapport d’audit électrique.',
      'PV de mesure de terre.',
      'Fiche de levée de réserves.',
      'Attestation de conformité simplifiée.',
    ],
    deliverables: ['Modèle copiable', 'Structure de dossier', 'Contrôle qualité'],
  },
  'generateur-rapports': {
    id: 'generateur-rapports',
    title: 'Générateur de Rapports IA',
    eyebrow: 'Synthèse assistée',
    description:
      'Structure un rapport d’audit à partir des constats, réserves et recommandations.',
    mode: 'document',
    icon: FileText,
    accent: 'blue',
    checklist: [
      'Contexte et périmètre.',
      'Constats classés par criticité.',
      'Photos ou preuves référencées.',
      'Recommandations et délais.',
    ],
    deliverables: ['Rapport structuré', 'Synthèse exécutive', 'Plan d’action'],
  },
  'generation-cours': {
    id: 'generation-cours',
    title: 'Génération Cours & Diapos IA',
    eyebrow: 'Formation',
    description:
      'Génère un plan de cours et une séquence de diapositives pour une session technique.',
    mode: 'document',
    icon: GraduationCap,
    accent: 'purple',
    checklist: [
      'Objectifs pédagogiques.',
      'Prérequis des participants.',
      'Plan en modules.',
      'Exercices pratiques.',
      'Évaluation finale.',
    ],
    deliverables: ['Plan de cours', 'Storyboard diapos', 'Quiz de sortie'],
  },
  'qcm-certifiants': {
    id: 'qcm-certifiants',
    title: 'QCM & Examens Certifiants',
    eyebrow: 'Évaluation',
    description:
      'Mini QCM de validation pour tester les bases de sécurité et de conformité.',
    mode: 'quiz',
    icon: GraduationCap,
    accent: 'amber',
    questions: [
      {
        question: 'Quel dispositif protège les personnes contre les défauts d’isolement ?',
        answer: 'DDR 30 mA',
        options: ['DDR 30 mA', 'Fusible seul', 'Interrupteur simple'],
      },
      {
        question: 'Quel document aide à comprendre la répartition des circuits ?',
        answer: 'Schéma unifilaire',
        options: ['Schéma unifilaire', 'Facture d’eau', 'Bon de livraison'],
      },
      {
        question: 'Avant intervention sur un circuit, il faut d’abord :',
        answer: 'Mettre hors tension et vérifier',
        options: ['Mettre hors tension et vérifier', 'Toucher le conducteur', 'Changer la prise sous tension'],
      },
    ],
  },
  'signature-electronique': {
    id: 'signature-electronique',
    title: 'Signature Électronique',
    eyebrow: 'Traçabilité',
    description:
      'Génère une preuve locale horodatée pour attacher une signature à un document technique.',
    mode: 'signature',
    icon: FileSignature,
    accent: 'purple',
    deliverables: ['Empreinte locale', 'Horodatage', 'Référence signataire'],
  },
  'expert-rag-unified': {
    id: 'expert-rag-unified',
    title: 'Moteur RAG Unifié',
    eyebrow: 'IA normative',
    description:
      'Console explicative du moteur RAG : recherche sémantique, règles déterministes et réponse sourcée.',
    mode: 'ia',
    icon: Brain,
    accent: 'blue',
    norme: 'NS 01-001',
    deliverables: ['Question', 'Sources', 'Réponse contrôlée'],
  },
  'haystack-backend': {
    id: 'haystack-backend',
    title: 'Backend Souverain Python',
    eyebrow: 'Architecture IA',
    description:
      'Vue de contrôle du backend : indexation, corpus normatif, santé du service et prochaines tâches.',
    mode: 'ia',
    icon: Database,
    accent: 'blue',
    deliverables: ['Corpus indexé', 'Statut service', 'Journal de synchronisation'],
  },
  'master-audit-protocol': {
    id: 'master-audit-protocol',
    title: 'Pipeline Audit Maître',
    eyebrow: '5 couches',
    description:
      'Déroulé opérationnel du protocole : identité, ingénierie, conformité, contexte Sénégal et terrain.',
    mode: 'guide',
    icon: ShieldCheck,
    accent: 'amber',
    checklist: [
      'Identifier le site, l’usage et le niveau de risque.',
      'Contrôler les hypothèses d’ingénierie.',
      'Relier chaque constat à une exigence.',
      'Adapter la réponse au contexte local.',
      'Produire une action terrain claire.',
    ],
    deliverables: ['Protocole de réponse', 'Criticité', 'Action recommandée'],
  },
  'expert-rules-engine': {
    id: 'expert-rules-engine',
    title: 'Moteur de Règles Déterministes',
    eyebrow: 'Cerveau gauche',
    description:
      'Simule une matrice de décision : mesure, seuil, statut et recommandation associée.',
    mode: 'checklist',
    icon: Calculator,
    accent: 'blue',
    checklist: [
      'La mesure est renseignée avec unité.',
      'Le seuil applicable est identifié.',
      'Le statut conforme/non conforme est justifié.',
      'La recommandation est actionnable.',
    ],
    deliverables: ['Règle appliquée', 'Statut', 'Justification'],
  },
  'ia-inspecteur': {
    id: 'ia-inspecteur',
    title: 'IA Inspecteur PROQUELEC',
    eyebrow: 'Inspection officielle',
    description:
      'Assistant de cadrage pour inspections officielles : situation, risques, preuves et recommandations.',
    mode: 'assistant',
    icon: Brain,
    accent: 'amber',
    prompts: [
      {
        label: 'Préparer une inspection',
        answer:
          'Commencez par identifier le site, son usage, les zones à risque, les documents disponibles et le responsable présent. Les constats doivent être associés à une preuve : photo, mesure, schéma ou témoignage vérifiable.',
      },
      {
        label: 'Classer une anomalie',
        answer:
          'Classez l’anomalie selon son impact : danger immédiat, non-conformité majeure, réserve documentaire ou amélioration recommandée. Une action doit être attachée à chaque réserve.',
      },
      {
        label: 'Rédiger la recommandation',
        answer:
          'La recommandation doit dire quoi corriger, pourquoi, avec quelle priorité et quel type d’intervenant mobiliser.',
      },
    ],
    deliverables: ['Cadrage', 'Criticité', 'Recommandation'],
  },
  'validation-rapports': {
    id: 'validation-rapports',
    title: 'Validation Rapports & Audits',
    eyebrow: 'Workflow qualité',
    description:
      'Checklist de validation avant publication ou transmission d’un rapport technique.',
    mode: 'checklist',
    icon: ClipboardCheck,
    accent: 'emerald',
    checklist: [
      'Le périmètre de mission est clair.',
      'Les constats sont datés et localisés.',
      'Chaque réserve dispose d’une preuve.',
      'Les niveaux de criticité sont cohérents.',
      'Les recommandations sont actionnables.',
      'Les annexes et photos sont référencées.',
      'La version du rapport est identifiée.',
    ],
    deliverables: ['Avis de validation', 'Réserves qualité', 'Prêt à publier'],
  },
  'versioning-normes': {
    id: 'versioning-normes',
    title: 'Versioning Normes & Lois',
    eyebrow: 'Traçabilité réglementaire',
    description:
      'Registre local pour suivre versions, dates d’effet, sources et impacts opérationnels.',
    mode: 'tracker',
    icon: Database,
    accent: 'purple',
    deliverables: ['Version', 'Source', 'Impact'],
  },
  'stats-conformite': {
    id: 'stats-conformite',
    title: 'Statistiques Conformité',
    eyebrow: 'Pilotage',
    description:
      'Tableau de synthèse pour estimer le taux de conformité et le volume de réserves à traiter.',
    mode: 'calculator',
    icon: BarChart3,
    accent: 'blue',
    metrics: [
      { id: 'inspected', label: 'Sites inspectés', unit: '', value: 120 },
      { id: 'conform', label: 'Sites conformes', unit: '', value: 84 },
      { id: 'major', label: 'Réserves majeures', unit: '', value: 16 },
      { id: 'minor', label: 'Réserves mineures', unit: '', value: 38 },
    ],
    deliverables: ['Taux', 'Réserves', 'Priorité'],
  },
  'supervision-certifies': {
    id: 'supervision-certifies',
    title: 'Supervision Utilisateurs Certifiés',
    eyebrow: 'Registre qualité',
    description:
      'Suivi opérationnel des professionnels certifiés, échéances et actions de renouvellement.',
    mode: 'tracker',
    icon: ShieldCheck,
    accent: 'emerald',
    deliverables: ['Titulaire', 'Statut', 'Renouvellement'],
  },
  'mode-inspecteur': {
    id: 'mode-inspecteur',
    title: 'Mode Inspecteur Terrain',
    eyebrow: 'Terrain',
    description:
      'Parcours de visite terrain pour guider la collecte de preuves et la clôture d’une inspection.',
    mode: 'guide',
    icon: ClipboardCheck,
    accent: 'amber',
    checklist: [
      'Identifier le site et le responsable présent.',
      'Photographier l’accès, le tableau et les zones sensibles.',
      'Renseigner les mesures disponibles.',
      'Classer chaque anomalie par criticité.',
      'Noter les actions immédiates de sécurisation.',
      'Faire valider la synthèse de visite.',
    ],
    deliverables: ['Preuves', 'Anomalies', 'Synthèse terrain'],
  },
  'detection-fraude': {
    id: 'detection-fraude',
    title: 'Détection Fraude / Faux Rapports',
    eyebrow: 'Contrôle documentaire',
    description:
      'Checklist d’alerte pour repérer incohérences, doublons, dates suspectes et preuves insuffisantes.',
    mode: 'checklist',
    icon: AlertTriangle,
    accent: 'red',
    checklist: [
      'Le numéro de rapport est unique.',
      'Les dates de visite et de signature sont cohérentes.',
      'Les photos correspondent au site déclaré.',
      'Les mesures sont plausibles et correctement unitaires.',
      'Le signataire est habilité.',
      'Les réserves ne sont pas copiées sans contexte.',
      'Le document possède une trace de validation.',
    ],
    deliverables: ['Score suspicion', 'Points d’alerte', 'Action de contrôle'],
  },
  'archivage-legal': {
    id: 'archivage-legal',
    title: 'Archivage Légal Long Terme',
    eyebrow: 'Conservation',
    description:
      'Checklist d’archivage pour conserver les documents critiques avec traçabilité et durée de rétention.',
    mode: 'checklist',
    icon: FileText,
    accent: 'purple',
    checklist: [
      'Le document est identifié par un numéro unique.',
      'La version et la date sont présentes.',
      'Le propriétaire du document est connu.',
      'La durée de conservation est définie.',
      'Les pièces jointes sont archivées avec le rapport.',
      'L’accès est limité aux rôles autorisés.',
      'Une preuve de suppression ou renouvellement est prévue.',
    ],
    deliverables: ['Dossier archivé', 'Durée', 'Accès contrôlé'],
  },
};

export const operationalToolIds = new Set(Object.keys(TOOL_CONFIGS));

export function hasOperationalTool(toolId: string | null): toolId is keyof typeof TOOL_CONFIGS {
  return Boolean(toolId && operationalToolIds.has(toolId));
}

function numberValue(values: Record<string, number>, id: string, fallback = 0) {
  const value = values[id];
  return Number.isFinite(value) ? value : fallback;
}

function simpleHash(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
}

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function buildDocument(config: ToolConfig, notes: string, checked: Set<string>) {
  const selected = config.checklist?.filter((item) => checked.has(item)) || [];
  return [
    `PROQUELEC - ${config.title}`,
    `Date : ${new Date().toLocaleDateString('fr-FR')}`,
    '',
    'Objet',
    config.description,
    '',
    'Éléments retenus',
    ...(selected.length ? selected.map((item) => `- ${item}`) : ['- Aucun élément sélectionné']),
    '',
    'Livrables attendus',
    ...(config.deliverables || []).map((item) => `- ${item}`),
    '',
    'Notes',
    notes || 'Aucune note complémentaire.',
  ].join('\n');
}

export default function OperationalToolSuite({
  toolId,
  demoMode = false,
}: {
  toolId: string;
  demoMode?: boolean;
}) {
  const config = TOOL_CONFIGS[toolId];
  const accent = config ? ACCENTS[config.accent] : ACCENTS.emerald;
  const Icon = config?.icon || Calculator;
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries((config?.metrics || []).map((metric) => [metric.id, metric.value])),
  );
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');
  const [assistantAnswer, setAssistantAnswer] = useState(config?.prompts?.[0]?.answer || '');
  const [trackerRows, setTrackerRows] = useState([
    { site: 'Site témoin', action: 'Contrôle tableau et terre', status: 'À planifier' },
  ]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [signatureName, setSignatureName] = useState('Responsable technique');
  const [signatureDoc, setSignatureDoc] = useState('Rapport audit PROQUELEC');

  const result = useMemo(() => {
    if (!config) return null;

    if (config.mode === 'checklist' || config.mode === 'guide') {
      const total = config.checklist?.length || 1;
      const score = Math.round((checked.size / total) * 100);
      return {
        title: score >= 80 ? 'Dossier robuste' : score >= 50 ? 'À compléter' : 'Priorité élevée',
        value: `${score}%`,
        detail:
          score >= 80
            ? 'Les éléments principaux sont prêts.'
            : 'Complétez les points manquants avant publication ou intervention.',
        severity: score >= 80 ? 'ok' : score >= 50 ? 'warn' : 'danger',
      };
    }

    if (config.mode !== 'calculator') return null;

    switch (config.id) {
      case 'calcul-puissance': {
        const p =
          numberValue(values, 'voltage', 230) *
          numberValue(values, 'current', 0) *
          numberValue(values, 'powerFactor', 1);
        return {
          title: 'Puissance estimée',
          value: `${p.toFixed(0)} W`,
          detail: `${(p / 1000).toFixed(2)} kW à intégrer dans le bilan de charge.`,
          severity: p > 3500 ? 'warn' : 'ok',
        };
      }
      case 'simulateur-facture': {
        const kwh =
          (numberValue(values, 'power') *
            numberValue(values, 'hours') *
            numberValue(values, 'days')) /
          1000;
        const cost = kwh * numberValue(values, 'price');
        return {
          title: 'Coût mensuel estimé',
          value: `${cost.toFixed(0)} FCFA`,
          detail: `${kwh.toFixed(1)} kWh/mois pour l’usage saisi.`,
          severity: cost > 50000 ? 'warn' : 'ok',
        };
      }
      case 'verif-surcharge': {
        const capacity =
          numberValue(values, 'voltage') *
          numberValue(values, 'breaker') *
          (numberValue(values, 'factor', 80) / 100);
        const load = numberValue(values, 'load');
        const ratio = capacity > 0 ? Math.round((load / capacity) * 100) : 0;
        return {
          title: ratio > 100 ? 'Surcharge probable' : ratio > 80 ? 'Marge faible' : 'Charge acceptable',
          value: `${ratio}%`,
          detail: `Capacité conseillée : ${capacity.toFixed(0)} W pour ${load.toFixed(0)} W saisis.`,
          severity: ratio > 100 ? 'danger' : ratio > 80 ? 'warn' : 'ok',
        };
      }
      case 'calcul-court-circuit': {
        const ik =
          (numberValue(values, 'coefficient', 1.1) * numberValue(values, 'voltage', 400)) /
          (Math.sqrt(3) * Math.max(numberValue(values, 'impedance', 0.1), 0.001));
        return {
          title: 'Icc présumé',
          value: `${(ik / 1000).toFixed(2)} kA`,
          detail: 'À comparer au pouvoir de coupure du dispositif de protection.',
          severity: ik > 6000 ? 'warn' : 'ok',
        };
      }
      case 'gestion-tableaux': {
        const perPhase =
          (numberValue(values, 'load', 0) * 1000) / Math.max(numberValue(values, 'phases', 1), 1);
        return {
          title: 'Charge moyenne par phase',
          value: `${(perPhase / 1000).toFixed(2)} kW`,
          detail: `${numberValue(values, 'circuits')} circuits à repérer et équilibrer.`,
          severity: perPhase > 6000 ? 'warn' : 'ok',
        };
      }
      case 'simulation-reseau': {
        const demand =
          numberValue(values, 'installedPower') * (numberValue(values, 'simultaneity') / 100);
        const subscription = numberValue(values, 'subscription');
        return {
          title: demand > subscription ? 'Dépassement prévu' : 'Scénario acceptable',
          value: `${demand.toFixed(1)} kW`,
          detail: `Puissance souscrite : ${subscription.toFixed(1)} kW.`,
          severity: demand > subscription ? 'danger' : demand > subscription * 0.85 ? 'warn' : 'ok',
        };
      }
      case 'analyse-energetique': {
        const bill = numberValue(values, 'monthlyKwh') * numberValue(values, 'price');
        const saving = bill * (numberValue(values, 'saving') / 100);
        return {
          title: 'Économie potentielle',
          value: `${saving.toFixed(0)} FCFA/mois`,
          detail: `Facture estimée : ${bill.toFixed(0)} FCFA/mois.`,
          severity: 'ok',
        };
      }
      case 'stats-conformite': {
        const inspected = Math.max(numberValue(values, 'inspected'), 1);
        const conform = numberValue(values, 'conform');
        const major = numberValue(values, 'major');
        const minor = numberValue(values, 'minor');
        const rate = Math.round((conform / inspected) * 100);
        return {
          title: rate >= 75 ? 'Conformité maîtrisée' : rate >= 50 ? 'Plan de correction requis' : 'Risque élevé',
          value: `${rate}%`,
          detail: `${major + minor} réserve(s) à traiter, dont ${major} majeure(s), sur ${inspected} site(s).`,
          severity: rate >= 75 ? 'ok' : rate >= 50 ? 'warn' : 'danger',
        };
      }
      default:
        return null;
    }
  }, [checked, config, values]);

  if (!config) {
    return (
      <Card className="border-red-500/30 bg-red-500/10 text-white">
        <CardContent className="p-6">Outil non reconnu : {toolId}</CardContent>
      </Card>
    );
  }

  const toggleCheck = (item: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const addTrackerRow = () => {
    setTrackerRows((rows) => [
      ...rows,
      { site: 'Nouveau site', action: 'Action à préciser', status: 'Ouvert' },
    ]);
  };

  const quizScore = config.questions
    ? config.questions.filter((question, index) => quizAnswers[index] === question.answer).length
    : 0;

  const signaturePayload = `${signatureName}|${signatureDoc}|${new Date().toLocaleDateString('fr-FR')}`;
  const signatureHash = simpleHash(signaturePayload);

  return (
    <div className="space-y-6">
      {demoMode && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm font-semibold text-amber-200">
          Mode démo : les résultats sont fournis pour prévisualiser l’outil. L’usage complet reste
          réservé aux accès autorisés.
        </div>
      )}

      <Card className={`overflow-hidden border ${accent.border} bg-[#0d2a21]/70 text-slate-100`}>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <Badge className={`${accent.bg} ${accent.text} ${accent.border} mb-4 border`}>
                {config.eyebrow}
              </Badge>
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${accent.bg} ${accent.text}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white md:text-4xl">{config.title}</h2>
                  {config.norme && <p className="mt-1 text-sm font-bold text-slate-400">{config.norme}</p>}
                </div>
              </div>
              <p className="mt-5 text-base leading-7 text-slate-300">{config.description}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 md:w-80">
              {(config.deliverables || ['Entrée', 'Analyse', 'Sortie']).slice(0, 3).map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className={`text-xs font-black uppercase ${accent.text}`}>Livrable</p>
                  <p className="mt-2 text-xs font-semibold text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {config.mode === 'calculator' && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-slate-700 bg-slate-950/70 text-slate-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className={accent.text} />
                Données de calcul
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              {(config.metrics || []).map((metric) => (
                <label key={metric.id} className="space-y-2">
                  <span className="text-sm font-bold text-slate-300">
                    {metric.label} {metric.unit && <span className="text-slate-500">({metric.unit})</span>}
                  </span>
                  <Input
                    type="number"
                    value={values[metric.id] ?? ''}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [metric.id]: Number(event.target.value),
                      }))
                    }
                    className="border-slate-700 bg-slate-900 text-white"
                  />
                </label>
              ))}
            </CardContent>
          </Card>
          {result && (
            <Card className={`border ${accent.border} ${accent.bg} text-slate-100`}>
              <CardContent className="p-6">
                <p className={`text-sm font-black uppercase ${accent.text}`}>{result.title}</p>
                <p className="mt-4 text-4xl font-black text-white">{result.value}</p>
                <p className="mt-4 text-sm leading-6 text-slate-300">{result.detail}</p>
                <div className="mt-6 rounded-xl bg-slate-950/50 p-4 text-xs leading-5 text-slate-400">
                  Résultat indicatif. Pour une note certifiable, contrôlez les hypothèses, la norme
                  applicable et les mesures réelles.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {(config.mode === 'checklist' || config.mode === 'guide') && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="border-slate-700 bg-slate-950/70 text-slate-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className={accent.text} />
                Points de contrôle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(config.checklist || []).map((item) => (
                <button
                  key={item}
                  onClick={() => toggleCheck(item)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                    checked.has(item)
                      ? `${accent.border} ${accent.bg}`
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-600'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      checked.has(item) ? `${accent.border} ${accent.text}` : 'border-slate-600 text-slate-600'
                    }`}
                  >
                    {checked.has(item) && <CheckCircle2 className="h-4 w-4" />}
                  </span>
                  <span className="text-sm font-medium text-slate-200">{item}</span>
                </button>
              ))}
            </CardContent>
          </Card>
          <Card className={`border ${accent.border} bg-slate-950 text-slate-100`}>
            <CardContent className="p-6">
              <p className={`text-sm font-black uppercase ${accent.text}`}>Synthèse</p>
              <p className="mt-4 text-4xl font-black text-white">{result?.value}</p>
              <Progress value={Number(result?.value.replace('%', '') || 0)} className="mt-4" />
              <p className="mt-4 text-sm leading-6 text-slate-300">{result?.detail}</p>
              <Button
                className={`mt-6 w-full ${accent.button}`}
                onClick={() => downloadText(`${config.id}-proquelec.txt`, buildDocument(config, notes, checked))}
              >
                <Download className="mr-2 h-4 w-4" />
                Exporter la synthèse
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {config.mode === 'assistant' && (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card className="border-slate-700 bg-slate-950/70 text-slate-100">
            <CardHeader>
              <CardTitle>Questions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(config.prompts || []).map((prompt) => (
                <Button
                  key={prompt.label}
                  variant="outline"
                  className="w-full justify-start border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                  onClick={() => setAssistantAnswer(prompt.answer)}
                >
                  {prompt.label}
                </Button>
              ))}
            </CardContent>
          </Card>
          <Card className={`border ${accent.border} ${accent.bg} text-slate-100`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Brain className={accent.text} />
                <h3 className="text-xl font-black text-white">Réponse PROQUELEC</h3>
              </div>
              <p className="mt-5 text-base leading-8 text-slate-200">{assistantAnswer}</p>
              <div className="mt-6 rounded-xl bg-slate-950/50 p-4 text-xs leading-5 text-slate-400">
                Conseil de prévention. En présence de chaleur, odeur, eau, câble apparent ou
                disjonction répétée, coupez l’alimentation concernée et demandez un contrôle.
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {config.mode === 'document' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="border-slate-700 bg-slate-950/70 text-slate-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className={accent.text} />
                Structure du livrable
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(config.checklist || []).map((item) => (
                <button
                  key={item}
                  onClick={() => toggleCheck(item)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${
                    checked.has(item) ? `${accent.border} ${accent.bg}` : 'border-slate-800 bg-slate-900/60'
                  }`}
                >
                  <CheckCircle2 className={`h-4 w-4 ${checked.has(item) ? accent.text : 'text-slate-600'}`} />
                  <span className="text-sm font-semibold text-slate-200">{item}</span>
                </button>
              ))}
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Ajoutez les informations du site, les constats ou les réserves..."
                className="min-h-36 border-slate-700 bg-slate-900 text-white"
              />
            </CardContent>
          </Card>
          <Card className={`border ${accent.border} bg-slate-950 text-slate-100`}>
            <CardContent className="p-6">
              <p className={`text-sm font-black uppercase ${accent.text}`}>Aperçu export</p>
              <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl bg-black/30 p-4 text-xs leading-5 text-slate-300">
                {buildDocument(config, notes, checked)}
              </pre>
              <Button
                className={`mt-5 w-full ${accent.button}`}
                onClick={() => downloadText(`${config.id}-proquelec.txt`, buildDocument(config, notes, checked))}
              >
                <Download className="mr-2 h-4 w-4" />
                Télécharger
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {config.mode === 'tracker' && (
        <Card className="border-slate-700 bg-slate-950/70 text-slate-100">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Journal d’interventions</CardTitle>
            <Button className={accent.button} onClick={addTrackerRow}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {trackerRows.map((row, index) => (
              <div key={`${row.site}-${index}`} className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 md:grid-cols-[1fr_1.4fr_1fr_auto]">
                <Input
                  value={row.site}
                  onChange={(event) =>
                    setTrackerRows((rows) =>
                      rows.map((item, i) => (i === index ? { ...item, site: event.target.value } : item)),
                    )
                  }
                  className="border-slate-700 bg-slate-950 text-white"
                />
                <Input
                  value={row.action}
                  onChange={(event) =>
                    setTrackerRows((rows) =>
                      rows.map((item, i) => (i === index ? { ...item, action: event.target.value } : item)),
                    )
                  }
                  className="border-slate-700 bg-slate-950 text-white"
                />
                <Input
                  value={row.status}
                  onChange={(event) =>
                    setTrackerRows((rows) =>
                      rows.map((item, i) => (i === index ? { ...item, status: event.target.value } : item)),
                    )
                  }
                  className="border-slate-700 bg-slate-950 text-white"
                />
                <Button
                  variant="outline"
                  className="border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20"
                  onClick={() => setTrackerRows((rows) => rows.filter((_, i) => i !== index))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {config.mode === 'quiz' && config.questions && (
        <Card className="border-slate-700 bg-slate-950/70 text-slate-100">
          <CardHeader>
            <CardTitle>QCM de validation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {config.questions.map((question, index) => (
              <div key={question.question} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <p className="font-bold text-white">{index + 1}. {question.question}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {question.options.map((option) => (
                    <Button
                      key={option}
                      variant="outline"
                      className={`border-slate-700 ${
                        quizAnswers[index] === option ? `${accent.bg} ${accent.text} ${accent.border}` : 'bg-slate-950 text-slate-300'
                      }`}
                      onClick={() => setQuizAnswers((current) => ({ ...current, [index]: option }))}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
            <div className={`rounded-xl border ${accent.border} ${accent.bg} p-4`}>
              <p className="text-lg font-black text-white">
                Score : {quizScore}/{config.questions.length}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {quizScore === config.questions.length
                  ? 'Validation réussie.'
                  : 'Relisez les points de sécurité avant certification.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {config.mode === 'signature' && (
        <Card className="border-slate-700 bg-slate-950/70 text-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSignature className={accent.text} />
              Génération de preuve locale
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-4">
              <label className="space-y-2 block">
                <span className="text-sm font-bold text-slate-300">Signataire</span>
                <Input
                  value={signatureName}
                  onChange={(event) => setSignatureName(event.target.value)}
                  className="border-slate-700 bg-slate-900 text-white"
                />
              </label>
              <label className="space-y-2 block">
                <span className="text-sm font-bold text-slate-300">Document</span>
                <Input
                  value={signatureDoc}
                  onChange={(event) => setSignatureDoc(event.target.value)}
                  className="border-slate-700 bg-slate-900 text-white"
                />
              </label>
            </div>
            <div className={`rounded-xl border ${accent.border} ${accent.bg} p-5`}>
              <div className="flex items-center gap-2">
                <Hash className={accent.text} />
                <p className="text-sm font-black uppercase text-white">Empreinte</p>
              </div>
              <p className="mt-4 font-mono text-3xl font-black text-white">{signatureHash}</p>
              <p className="mt-3 text-sm text-slate-300">
                Horodatage : {new Date().toLocaleString('fr-FR')}
              </p>
              <Button
                className={`mt-5 ${accent.button}`}
                onClick={() =>
                  downloadText(
                    `${config.id}-preuve.txt`,
                    `Document: ${signatureDoc}\nSignataire: ${signatureName}\nEmpreinte: ${signatureHash}\nDate: ${new Date().toLocaleString('fr-FR')}`,
                  )
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Télécharger la preuve
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {config.mode === 'ia' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            ['Corpus', 'Normes, règles et guides sont séparés par source avant synthèse.'],
            ['Contrôle', 'La réponse doit citer une base et distinguer calcul, règle et conseil.'],
            ['Sortie', 'Chaque résultat se termine par une action terrain exploitable.'],
          ].map(([title, text]) => (
            <Card key={title} className={`border ${accent.border} bg-slate-950/70 text-slate-100`}>
              <CardContent className="p-5">
                <Database className={`mb-4 h-6 w-6 ${accent.text}`} />
                <h3 className="text-lg font-black text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{text}</p>
              </CardContent>
            </Card>
          ))}
          <Card className="border-slate-700 bg-slate-950/70 text-slate-100 lg:col-span-3">
            <CardContent className="p-5">
              <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-300" />
                <p className="text-sm leading-6 text-amber-100">
                  Ce panneau rend l’outil exploitable dans le hub. Le raccordement backend réel
                  reste piloté par les modules IA existants du projet.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
