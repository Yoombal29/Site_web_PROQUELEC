/**
 * DIAGNOSTIC DE SÉCURITÉ ÉLECTRIQUE — PROQUELEC
 *
 * Outil interactif en 3 étapes : sélection du symptôme,
 * questions complémentaires et affichage des résultats.
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  Zap,
  Flame,
  Bolt,
  AlarmSmoke,
  Home,
  TimerReset,
  ArrowRight,
  ArrowLeft,
  FileText,
  Phone,
  CheckCircle2,
  ListChecks,
  Lightbulb,
  AlertCircle,
  RotateCcw,
  TriangleAlert,
  PhoneCall,
  Ambulance,
  ClipboardList,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// ════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════

type SymptomKey =
  | 'no-power'
  | 'partial-power'
  | 'breaker-tripping'
  | 'sparks-smell'
  | 'electric-shock'
  | 'smoke'
  | 'old-installation';

interface DiagnosticEntry {
  label: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  urgent?: boolean;
  causes: string[];
  solutions: string[];
}

type DiagnosticData = Record<SymptomKey, DiagnosticEntry>;

interface FollowUpQuestion {
  id: string;
  type: 'yesno' | 'select' | 'text';
  label: string;
  options?: { value: string; label: string }[];
}

interface FollowUpAnswers {
  [questionId: string]: string;
}

interface SeverityStyle {
  badge: string;
  label: string;
  text: string;
  icon: React.ElementType;
}

// ════════════════════════════════════════════════════
// DONNÉES DE DIAGNOSTIC
// ════════════════════════════════════════════════════

const SEVERITY_CONFIG: Record<string, SeverityStyle> = {
  low: {
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    label: 'Faible',
    text: 'text-emerald-400',
    icon: CheckCircle2,
  },
  medium: {
    badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    label: 'Moyen',
    text: 'text-amber-400',
    icon: AlertCircle,
  },
  high: {
    badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    label: 'Élevé',
    text: 'text-orange-400',
    icon: AlertTriangle,
  },
  critical: {
    badge: 'bg-red-500/20 text-red-400 border-red-500/30',
    label: 'Critique',
    text: 'text-red-400',
    icon: TriangleAlert,
  },
};

const SYMPTOMS: { key: SymptomKey; label: string; icon: React.ElementType }[] = [
  { key: 'no-power', label: "Pas d'électricité du tout", icon: Zap },
  { key: 'partial-power', label: 'Électricité seulement dans certaines pièces', icon: Bolt },
  { key: 'breaker-tripping', label: 'Disjoncteur qui saute souvent', icon: TimerReset },
  { key: 'sparks-smell', label: 'Odeur de brûlé', icon: Flame },
  { key: 'electric-shock', label: 'Chocs électriques', icon: Sparkles },
  { key: 'smoke', label: 'Fumée visible', icon: AlarmSmoke },
  { key: 'old-installation', label: 'Vieille installation (fils coton)', icon: Home },
];

const diagnosticData: DiagnosticData = {
  'no-power': {
    label: "Pas d'électricité du tout",
    severity: 'high',
    causes: [
      'Coupure générale du fournisseur (ENEO/Senelec)',
      'Disjoncteur général déclenché',
      'Défaut sur le réseau externe',
      'Compteur électrique défectueux',
    ],
    solutions: [
      'Vérifiez si vos voisins ont aussi une coupure',
      "Contactez votre fournisseur d'électricité",
      "Vérifiez l'état de votre disjoncteur général",
      'Faites appel à un électricien si le problème persiste',
    ],
  },
  'partial-power': {
    label: 'Électricité seulement dans certaines pièces',
    severity: 'medium',
    causes: [
      'Disjoncteur divisionnaire déclenché',
      'Défaut sur un circuit spécifique',
      'Surcharge sur un circuit électrique',
      'Mauvais contact dans le tableau',
    ],
    solutions: [
      'Identifiez le disjoncteur concerné dans le tableau',
      'Débranchez les appareils sur ce circuit',
      'Réarmez après avoir identifié la cause',
      'Si le problème persiste, contactez un professionnel',
    ],
  },
  'breaker-tripping': {
    label: 'Un disjoncteur saute souvent',
    severity: 'high',
    causes: [
      "Surcharge du circuit (trop d'appareils branchés)",
      'Court-circuit quelque part sur le circuit',
      'Disjoncteur défectueux ou fatigué',
      'Appareil électrique défectueux',
    ],
    solutions: [
      'Répartissez les appareils sur différents circuits',
      "Identifiez l'appareil qui provoque le déclenchement",
      'Ne remplacez jamais un disjoncteur par un modèle plus fort',
      'Faites diagnostiquer par un professionnel',
    ],
  },
  'sparks-smell': {
    label: 'Odeur de brûlé',
    severity: 'critical',
    urgent: true,
    causes: [
      "Échauffement anormal d'un conducteur électrique",
      'Mauvais contact électrique (connexion desserrée)',
      'Appareil en court-circuit interne',
      "Surchauffe d'un équipement",
    ],
    solutions: [
      "Coupez immédiatement l'alimentation générale",
      "Identifiez la source de l'odeur si possible",
      'Évacuez les lieux si nécessaire',
      'Appelez les pompiers (18) en cas de fumée',
      'Contactez un électricien en urgence',
    ],
  },
  'electric-shock': {
    label: 'Chocs électriques',
    severity: 'critical',
    urgent: true,
    causes: [
      "Défaut d'isolement sur un appareil",
      'Absence de mise à la terre',
      'Disjoncteur différentiel défaillant',
      'Appareil non conforme ou endommagé',
    ],
    solutions: [
      "Coupez immédiatement l'alimentation du circuit concerné",
      'Ne touchez pas la personne sous tension avec les mains nues',
      "Utilisez un objet non conducteur (bois, plastique) pour l'éloigner",
      'Appelez le SAMU (15) si la personne est blessée',
      "Faites vérifier l'installation par un professionnel",
    ],
  },
  smoke: {
    label: 'Fumée visible',
    severity: 'critical',
    urgent: true,
    causes: [
      "Début d'incendie électrique",
      "Surchauffe extrême d'un équipement",
      'Court-circuit majeur',
    ],
    solutions: [
      'Coupez le disjoncteur général immédiatement',
      'Évacuez les lieux sans prendre de risques',
      'Appelez les pompiers (18)',
      "N'utilisez jamais d'eau sur un feu électrique",
      'Utilisez un extincteur adapté (CO₂ ou poudre) si disponible',
    ],
  },
  'old-installation': {
    label: 'Vieille installation (fils coton)',
    severity: 'high',
    causes: [
      'Câblage en fils coton non conforme aux normes actuelles',
      'Absence de mise à la terre',
      'Protections obsolètes (fusibles au lieu de disjoncteurs)',
      "Risque d'incendie accru",
    ],
    solutions: [
      "Planifiez une rénovation complète de l'installation",
      'Mettez en conformité selon la norme NF C15-100 ou NS 01-001',
      'Remplacez les anciennes protections par des disjoncteurs',
      'Faites réaliser un diagnostic électrique complet',
    ],
  },
};

const FOLLOW_UP_QUESTIONS: Record<SymptomKey, FollowUpQuestion[]> = {
  'no-power': [
    {
      id: 'neighbors-power',
      type: 'yesno',
      label: 'Vos voisins ont-ils aussi une coupure de courant ?',
    },
    {
      id: 'main-breaker',
      type: 'yesno',
      label: 'Avez-vous vérifié votre disjoncteur général ?',
    },
    {
      id: 'power-outage-time',
      type: 'select',
      label: 'Depuis combien de temps ?',
      options: [
        { value: 'minutes', label: 'Quelques minutes' },
        { value: 'hours', label: 'Plusieurs heures' },
        { value: 'days', label: "Plus d'un jour" },
      ],
    },
  ],
  'partial-power': [
    {
      id: 'affected-rooms',
      type: 'text',
      label: 'Quelles pièces sont touchées ? (séparées par des virgules)',
    },
    {
      id: 'checked-breakers',
      type: 'yesno',
      label: 'Avez-vous vérifié les disjoncteurs individuels ?',
    },
    {
      id: 'recent-change',
      type: 'yesno',
      label: 'Avez-vous récemment branché un nouvel appareil ?',
    },
  ],
  'breaker-tripping': [
    {
      id: 'trip-frequency',
      type: 'select',
      label: 'À quelle fréquence cela se produit-il ?',
      options: [
        { value: 'rarely', label: 'Une fois par mois ou moins' },
        { value: 'weekly', label: 'Une fois par semaine' },
        { value: 'daily', label: 'Plusieurs fois par jour' },
        { value: 'always', label: 'Immédiatement après réarmement' },
      ],
    },
    {
      id: 'trip-trigger',
      type: 'select',
      label: 'Quand cela se déclenche-t-il ?',
      options: [
        { value: 'specific', label: "Quand j'utilise un appareil spécifique" },
        { value: 'random', label: 'De manière aléatoire' },
        { value: 'immediate', label: 'Dès que je réarme' },
        { value: 'multiple', label: 'Plusieurs appareils à la fois' },
      ],
    },
    {
      id: 'trip-breaker-type',
      type: 'yesno',
      label: "S'agit-il d'un disjoncteur différentiel (avec bouton test) ?",
    },
  ],
  'sparks-smell': [
    {
      id: 'smell-location',
      type: 'text',
      label: "D'où vient l'odeur de brûlé ? (tableau, prise, appareil...)",
    },
    {
      id: 'smell-intensity',
      type: 'select',
      label: "Quelle est l'intensité de l'odeur ?",
      options: [
        { value: 'faint', label: 'Légère' },
        { value: 'moderate', label: 'Modérée' },
        { value: 'strong', label: 'Forte' },
        { value: 'very-strong', label: 'Très forte — évacuation nécessaire' },
      ],
    },
    {
      id: 'visible-sparks',
      type: 'yesno',
      label: 'Voyez-vous des étincelles ou de la fumée ?',
    },
  ],
  'electric-shock': [
    {
      id: 'shock-victim',
      type: 'yesno',
      label: 'La personne choquée est-elle blessée ou inconsciente ?',
    },
    {
      id: 'shock-source',
      type: 'text',
      label: 'Quel appareil ou prise a provoqué la décharge ?',
    },
    {
      id: 'shock-feeling',
      type: 'select',
      label: 'Type de décharge ressentie :',
      options: [
        { value: 'tingle', label: 'Picotement léger' },
        { value: 'strong', label: 'Décharge franche' },
        { value: 'violent', label: 'Violente (projection)' },
      ],
    },
  ],
  smoke: [
    {
      id: 'smoke-location',
      type: 'text',
      label: "D'où vient la fumée ?",
    },
    {
      id: 'smoke-amount',
      type: 'select',
      label: 'Quantité de fumée :',
      options: [
        { value: 'little', label: 'Un peu de fumée' },
        { value: 'moderate', label: 'Fumée modérée' },
        { value: 'lot', label: 'Beaucoup de fumée' },
        { value: 'flames', label: 'Présence de flammes' },
      ],
    },
    {
      id: 'evacuated',
      type: 'yesno',
      label: 'Avez-vous déjà évacué les lieux ?',
    },
  ],
  'old-installation': [
    {
      id: 'installation-age',
      type: 'select',
      label: "Quel âge a l'installation électrique ?",
      options: [
        { value: '20-30', label: '20 à 30 ans' },
        { value: '30-50', label: '30 à 50 ans' },
        { value: '50-plus', label: 'Plus de 50 ans' },
        { value: 'unknown', label: 'Je ne sais pas' },
      ],
    },
    {
      id: 'grounding',
      type: 'yesno',
      label: 'Savez-vous si votre installation a une mise à la terre ?',
    },
    {
      id: 'previous-issues',
      type: 'yesno',
      label: 'Avez-vous déjà eu des problèmes électriques (chocs, odeurs) ?',
    },
  ],
};

// ════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════

export default function SafetyDiagnostic() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedSymptom, setSelectedSymptom] = useState<SymptomKey | null>(null);
  const [answers, setAnswers] = useState<FollowUpAnswers>({});
  const [generatingReport, setGeneratingReport] = useState(false);

  const currentDiagnostic = selectedSymptom ? diagnosticData[selectedSymptom] : null;
  const currentQuestions = selectedSymptom ? FOLLOW_UP_QUESTIONS[selectedSymptom] : [];

  const hasUrgentAnswers =
    answers['visible-sparks'] === 'yes' ||
    answers['smoke-amount'] === 'flames' ||
    answers['smell-intensity'] === 'very-strong' ||
    answers['shock-victim'] === 'yes' ||
    answers['evacuated'] === 'no';

  const needsStep2 = (key: SymptomKey) =>
    [
      'sparks-smell',
      'electric-shock',
      'smoke',
      'breaker-tripping',
      'no-power',
      'partial-power',
    ].includes(key);

  // ── Handlers ─────────────────────────────────────

  const selectSymptom = (key: SymptomKey) => {
    setSelectedSymptom(key);
    setAnswers({});
    if (needsStep2(key)) {
      setStep(2);
    } else {
      setStep(3);
    }
  };

  const goBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedSymptom(null);
      setAnswers({});
    } else if (step === 3) {
      if (selectedSymptom && needsStep2(selectedSymptom)) {
        setStep(2);
      } else {
        setStep(1);
        setSelectedSymptom(null);
        setAnswers({});
      }
    }
  };

  const proceedToResults = () => {
    setStep(3);
  };

  const resetDiagnostic = () => {
    setStep(1);
    setSelectedSymptom(null);
    setAnswers({});
  };

  const setAnswer = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const generateReport = () => {
    if (!selectedSymptom || !currentDiagnostic) return;
    setGeneratingReport(true);

    const severityLabel = SEVERITY_CONFIG[currentDiagnostic.severity].label;
    const separator = '═══════════════════════════════════════════════════════';
    const line = '───────────────────────────────────────────────────────────';
    const questionsText = currentQuestions
      .map((q) => {
        const answer = answers[q.id] || 'Non renseigné';
        return `  • ${q.label}\n    → ${answer}`;
      })
      .join('\n');

    const reportText = `
${separator}
        RAPPORT DE DIAGNOSTIC ÉLECTRIQUE — PROQUELEC
${separator}

Date : ${new Date().toLocaleString('fr-FR')}

${line}
PROBLÈME DÉTECTÉ
${line}
  ${currentDiagnostic.label}
  Sévérité : ${severityLabel}

${line}
CAUSES POSSIBLES
${line}
${currentDiagnostic.causes.map((c) => `  • ${c}`).join('\n')}

${line}
SOLUTIONS RECOMMANDÉES
${line}
${currentDiagnostic.solutions.map((s) => `  • ${s}`).join('\n')}

${line}
RÉPONSES AUX QUESTIONS
${line}
${questionsText}

${line}
URGENCES
${line}
  Urgence Électrique : 33 800 00 00
  SAMU (médical) :    15
  Pompiers (incendie) : 18

${separator}
  Ce diagnostic est fourni à titre indicatif uniquement.
  En cas de doute, faites toujours appel à un professionnel.
${separator}
    `.trim();

    // Ouvrir dans mailto
    const subject = encodeURIComponent(
      `Diagnostic électrique PROQUELEC - ${currentDiagnostic.label}`,
    );
    const body = encodeURIComponent(reportText);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');

    setTimeout(() => setGeneratingReport(false), 500);
  };

  const isUrgent =
    currentDiagnostic?.severity === 'critical' || currentDiagnostic?.severity === 'high';

  // ── Render helpers ───────────────────────────────

  const renderSymptomIcon = (key: SymptomKey, className = 'h-5 w-5') => {
    switch (key) {
      case 'no-power':
        return <Zap className={`${className} text-red-400`} />;
      case 'partial-power':
        return <Bolt className={`${className} text-amber-400`} />;
      case 'breaker-tripping':
        return <TimerReset className={`${className} text-orange-400`} />;
      case 'sparks-smell':
        return <Flame className={`${className} text-red-400`} />;
      case 'electric-shock':
        return <Sparkles className={`${className} text-red-400`} />;
      case 'smoke':
        return <AlarmSmoke className={`${className} text-gray-400`} />;
      case 'old-installation':
        return <Home className={`${className} text-amber-400`} />;
      default:
        return <AlertTriangle className={`${className} text-amber-400`} />;
    }
  };

  const renderQuestion = (q: FollowUpQuestion) => {
    switch (q.type) {
      case 'yesno':
        return (
          <div key={q.id} className="space-y-2">
            <Label className="text-sm text-slate-300">{q.label}</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAnswer(q.id, 'yes')}
                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                  answers[q.id] === 'yes'
                    ? 'border-emerald-500/50 bg-emerald-600/20 text-emerald-300'
                    : 'border-emerald-800/30 bg-emerald-900/10 text-slate-400 hover:border-emerald-700/40 hover:bg-emerald-900/20 hover:text-slate-200'
                }`}
              >
                Oui
              </button>
              <button
                type="button"
                onClick={() => setAnswer(q.id, 'no')}
                className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                  answers[q.id] === 'no'
                    ? 'border-emerald-500/50 bg-emerald-600/20 text-emerald-300'
                    : 'border-emerald-800/30 bg-emerald-900/10 text-slate-400 hover:border-emerald-700/40 hover:bg-emerald-900/20 hover:text-slate-200'
                }`}
              >
                Non
              </button>
            </div>
          </div>
        );

      case 'select':
        return (
          <div key={q.id} className="space-y-2">
            <Label className="text-sm text-slate-300">{q.label}</Label>
            <Select value={answers[q.id] || ''} onValueChange={(val) => setAnswer(q.id, val)}>
              <SelectTrigger className="w-full border-emerald-800/40 bg-emerald-900/20 text-slate-200 placeholder:text-slate-500 focus:ring-emerald-500">
                <SelectValue placeholder="Sélectionnez une option..." />
              </SelectTrigger>
              <SelectContent className="border-emerald-800/40 bg-[#071914] text-slate-200">
                {q.options?.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="focus:bg-emerald-900/40 focus:text-emerald-200"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'text':
        return (
          <div key={q.id} className="space-y-2">
            <Label className="text-sm text-slate-300">{q.label}</Label>
            <Input
              value={answers[q.id] || ''}
              onChange={(e) => setAnswer(q.id, e.target.value)}
              placeholder="Votre réponse..."
              className="border-emerald-800/40 bg-emerald-900/20 text-slate-200 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
        );
    }
  };

  // ── Render ───────────────────────────────────────

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* ── Header Card ──────────────────────────── */}
      <Card className="border-emerald-800/30 bg-[#071914] shadow-lg shadow-emerald-900/10">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-900/50">
              <AlertTriangle className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-emerald-100">
                Diagnostic de sécurité électrique
              </CardTitle>
              <p className="text-xs text-emerald-400/60">
                Identifiez les causes et solutions adaptées à votre situation
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-400 leading-relaxed">
            Cet outil vous aide à diagnostiquer un problème électrique. Les informations fournies
            sont à titre indicatif — en cas d&apos;urgence, appelez immédiatement les secours.
          </p>
        </CardContent>
      </Card>

      {/* ── Step Indicator ───────────────────────── */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300 ${
                step === s
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-110'
                  : step > s
                    ? 'bg-emerald-800/60 text-emerald-300'
                    : 'bg-emerald-900/40 text-slate-500'
              }`}
            >
              {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`h-0.5 w-12 transition-colors duration-300 ${
                  step > s ? 'bg-emerald-600' : 'bg-emerald-900/40'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="flex justify-center gap-10 text-xs text-slate-400 -mt-2">
        <span className={step === 1 ? 'text-emerald-400 font-medium' : ''}>Symptôme</span>
        <span className={step === 2 ? 'text-emerald-400 font-medium' : ''}>Questions</span>
        <span className={step === 3 ? 'text-emerald-400 font-medium' : ''}>Résultats</span>
      </div>

      {/* ══════════════════════════════════════════════
          ÉTAPE 1 : SÉLECTION DU SYMPTÔME
          ══════════════════════════════════════════════ */}
      {step === 1 && (
        <Card className="border-emerald-800/30 bg-[#071914] shadow-lg shadow-emerald-900/10">
          <CardHeader>
            <CardTitle className="text-lg text-emerald-100 flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-emerald-400" />
              Que se passe-t-il ?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SYMPTOMS.map((symptom) => {
                const SymptomIcon = symptom.icon;
                return (
                  <button
                    key={symptom.key}
                    onClick={() => selectSymptom(symptom.key)}
                    className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${
                      selectedSymptom === symptom.key
                        ? 'bg-emerald-600/20 border-emerald-500/50 text-white shadow-md'
                        : 'bg-emerald-900/10 border-emerald-800/30 text-slate-300 hover:bg-emerald-900/20 hover:border-emerald-700/50'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedSymptom === symptom.key ? 'bg-emerald-500/20' : 'bg-emerald-900/30'
                      }`}
                    >
                      <SymptomIcon
                        className={`h-5 w-5 ${
                          selectedSymptom === symptom.key
                            ? 'text-emerald-400'
                            : 'text-emerald-400/60'
                        }`}
                      />
                    </div>
                    <span className="text-sm font-medium leading-tight">{symptom.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ══════════════════════════════════════════════
          ÉTAPE 2 : QUESTIONS COMPLÉMENTAIRES
          ══════════════════════════════════════════════ */}
      {step === 2 && selectedSymptom && (
        <Card className="border-emerald-800/30 bg-[#071914] shadow-lg shadow-emerald-900/10">
          <CardHeader>
            <CardTitle className="text-lg text-emerald-100 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-emerald-400" />
              Questions complémentaires
            </CardTitle>
            <p className="text-xs text-slate-400">
              Aidez-nous à préciser votre situation concernant :{' '}
              <span className="text-emerald-300 font-medium">
                {diagnosticData[selectedSymptom].label}
              </span>
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {currentQuestions.map(renderQuestion)}

            {/* ── Safety alert on urgent answers ── */}
            {hasUrgentAnswers && (
              <Alert variant="destructive" className="border-red-500/40 bg-red-900/20 text-red-200">
                <TriangleAlert className="h-4 w-4 text-red-400" />
                <AlertTitle className="text-red-300 font-semibold">
                  ⚠️ Situation dangereuse détectée
                </AlertTitle>
                <AlertDescription className="text-red-200/70 text-xs">
                  Vos réponses indiquent une situation potentiellement grave. N&apos;hésitez pas à
                  contacter les secours avant de continuer.
                </AlertDescription>
              </Alert>
            )}

            {/* ── Navigation ── */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={goBack}
                className="border-emerald-800/40 text-slate-300 hover:text-white hover:bg-emerald-900/30"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <Button
                onClick={proceedToResults}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
              >
                Voir les résultats
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ══════════════════════════════════════════════
          ÉTAPE 3 : RÉSULTATS
          ══════════════════════════════════════════════ */}
      {step === 3 && currentDiagnostic && selectedSymptom && (
        <div className="space-y-6">
          {/* ── Safety Banner for critical/high ── */}
          {isUrgent && (
            <Alert variant="destructive" className="border-red-500/40 bg-red-900/20 text-red-200">
              <TriangleAlert className="h-4 w-4 text-red-400" />
              <AlertTitle className="text-red-300 font-semibold">
                ⚠️{' '}
                {currentDiagnostic.severity === 'critical'
                  ? 'URGENCE ÉLECTRIQUE'
                  : 'ATTENTION — Situation à risque'}
              </AlertTitle>
              <AlertDescription className="text-red-200/70 text-xs space-y-1">
                <p>Ce problème nécessite une intervention rapide d&apos;un professionnel.</p>
                <p>Ne tentez pas de réparer vous-même si vous n&apos;êtes pas qualifié.</p>
                {currentDiagnostic.severity === 'critical' && (
                  <p className="font-semibold text-red-300">Contactez les secours si nécessaire.</p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* ── Result Card ── */}
          <Card className="border-emerald-800/30 bg-[#071914] shadow-lg shadow-emerald-900/10">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-emerald-100 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  Résultat du diagnostic
                </CardTitle>
                <Badge
                  variant="outline"
                  className={`text-xs font-bold px-3 py-1 ${SEVERITY_CONFIG[currentDiagnostic.severity].badge}`}
                >
                  {SEVERITY_CONFIG[currentDiagnostic.severity].label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ── Problem detected ── */}
              <div className="flex items-start gap-4 p-4 rounded-xl bg-emerald-900/10 border border-emerald-800/30">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-emerald-900/30 flex items-center justify-center">
                  {renderSymptomIcon(selectedSymptom, 'h-7 w-7')}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{currentDiagnostic.label}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Sévérité :{' '}
                    <span
                      className={`font-semibold ${SEVERITY_CONFIG[currentDiagnostic.severity].text}`}
                    >
                      {SEVERITY_CONFIG[currentDiagnostic.severity].label}
                    </span>
                  </p>
                </div>
              </div>

              {/* ── Causes ── */}
              <div>
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  Causes possibles
                </h4>
                <ul className="space-y-2">
                  {currentDiagnostic.causes.map((cause, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <ChevronRight className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {cause}
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── Solutions ── */}
              <div>
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-emerald-400" />
                  Solutions recommandées
                </h4>
                <ul className="space-y-2">
                  {currentDiagnostic.solutions.map((solution, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <ChevronRight className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {solution}
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── Answers summary ── */}
              {currentQuestions.length > 0 && (
                <div className="rounded-xl border border-emerald-800/30 bg-emerald-900/10 p-4">
                  <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-emerald-400" />
                    Vos réponses
                  </h4>
                  <div className="space-y-2">
                    {currentQuestions.map((q) => (
                      <div key={q.id} className="flex justify-between text-xs text-slate-400">
                        <span>{q.label}</span>
                        <span className="text-slate-200 font-medium ml-2 text-right max-w-[50%]">
                          {answers[q.id]
                            ? q.type === 'yesno'
                              ? answers[q.id] === 'yes'
                                ? 'Oui'
                                : 'Non'
                              : q.options?.find((o) => o.value === answers[q.id])?.label ||
                                answers[q.id]
                            : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Emergency Contacts ── */}
          <Card className="border-red-800/30 bg-[#071914] shadow-lg shadow-red-900/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-red-300 flex items-center gap-2">
                <Phone className="h-5 w-5 text-red-400" />
                Numéros d&apos;urgence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a
                  href="tel:338000000"
                  className="flex items-center gap-3 p-4 rounded-xl border border-emerald-800/30 bg-emerald-900/10 hover:bg-emerald-900/20 transition-all group"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-900/30 flex items-center justify-center">
                    <PhoneCall className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Urgence Électrique</div>
                    <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      33 800 00 00
                    </div>
                  </div>
                </a>

                <a
                  href="tel:15"
                  className="flex items-center gap-3 p-4 rounded-xl border border-emerald-800/30 bg-emerald-900/10 hover:bg-emerald-900/20 transition-all group"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-900/30 flex items-center justify-center">
                    <Ambulance className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">SAMU</div>
                    <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      15
                    </div>
                  </div>
                </a>

                <a
                  href="tel:18"
                  className="flex items-center gap-3 p-4 rounded-xl border border-emerald-800/30 bg-emerald-900/10 hover:bg-emerald-900/20 transition-all group"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-900/30 flex items-center justify-center">
                    <Flame className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Pompiers</div>
                    <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      18
                    </div>
                  </div>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* ── Actions ── */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={goBack}
              className="border-emerald-800/40 text-slate-300 hover:text-white hover:bg-emerald-900/30"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Modifier mes réponses
            </Button>

            <Button
              onClick={generateReport}
              disabled={generatingReport}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
            >
              <FileText className="h-4 w-4 mr-2" />
              {generatingReport ? 'Génération...' : ' Générer le rapport'}
            </Button>

            <Button
              variant="outline"
              onClick={resetDiagnostic}
              className="border-emerald-800/40 text-slate-300 hover:text-white hover:bg-emerald-900/30"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Nouveau diagnostic
            </Button>
          </div>

          {/* ── Disclaimer ── */}
          <p className="text-center text-[11px] text-emerald-400/30">
            Ce diagnostic est fourni à titre indicatif uniquement. En cas de doute, faites toujours
            appel à un électricien professionnel qualifié.
          </p>
        </div>
      )}
    </div>
  );
}
