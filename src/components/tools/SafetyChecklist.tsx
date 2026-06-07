import React, { useEffect, useState, useCallback } from 'react';
import {
  Check,
  RotateCcw,
  FileText,
  ShieldCheck,
  Wrench,
  FileCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ChecklistItem {
  id: string;
  label: string;
}

interface ChecklistCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  items: ChecklistItem[];
}

interface ScoreInfo {
  percent: number;
  checkedCount: number;
  total: number;
}

type ResultLevel = 'perfect' | 'good' | 'moderate' | 'poor';

// ─── Data ──────────────────────────────────────────────────────────────────────

const CATEGORIES: ChecklistCategory[] = [
  {
    id: 'protection',
    title: 'Protection',
    icon: ShieldCheck,
    items: [
      { id: 'prot-1', label: 'Disjoncteur différentiel 30mA' },
      { id: 'prot-2', label: 'Mise à la terre' },
      { id: 'prot-3', label: 'Protection surtension' },
      { id: 'prot-4', label: 'Section câbles conforme' },
      { id: 'prot-5', label: 'DDR type AC/A' },
    ],
  },
  {
    id: 'equipement',
    title: 'Équipement',
    icon: Wrench,
    items: [
      { id: 'equip-1', label: 'Prises avec terre' },
      { id: 'equip-2', label: 'Appareils aux normes CE' },
      { id: 'equip-3', label: 'Tableau électrique accessible' },
      { id: 'equip-4', label: 'Connexions serrées' },
    ],
  },
  {
    id: 'conformite',
    title: 'Conformité',
    icon: FileCheck,
    items: [
      { id: 'conf-1', label: 'Installation conforme NF C15-100' },
      { id: 'conf-2', label: 'Distance prises/eau respectée' },
      { id: 'conf-3', label: 'Volumes salle de bains respectés' },
      { id: 'conf-4', label: 'Conduits apparents en bon état' },
    ],
  },
];

const STORAGE_KEY = 'proquelec-safety-checklist';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getTotalItems(): number {
  return CATEGORIES.reduce((sum, cat) => sum + cat.items.length, 0);
}

function getScore(checked: Set<string>): ScoreInfo {
  const total = getTotalItems();
  const checkedCount = checked.size;
  const percent = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
  return { percent, checkedCount, total };
}

function getCategoryScore(checked: Set<string>, categoryId: string): ScoreInfo {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return { percent: 0, checkedCount: 0, total: 0 };
  const total = category.items.length;
  const checkedCount = category.items.filter((item) => checked.has(item.id)).length;
  const percent = total > 0 ? Math.round((checkedCount / total) * 100) : 0;
  return { percent, checkedCount, total };
}

function getResultLevel(percent: number): ResultLevel {
  if (percent === 100) return 'perfect';
  if (percent >= 70) return 'good';
  if (percent >= 40) return 'moderate';
  return 'poor';
}

function getResultMessage(percent: number): { icon: React.ReactNode; message: string } {
  const level = getResultLevel(percent);
  switch (level) {
    case 'perfect':
      return {
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
        message: '✅ Votre installation est conforme',
      };
    case 'good':
      return {
        icon: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
        message: '⚠️ Globalement sûre, quelques améliorations',
      };
    case 'moderate':
      return {
        icon: <AlertTriangle className="h-5 w-5 text-orange-400" />,
        message: '⚠️ Risques modérés',
      };
    case 'poor':
      return {
        icon: <XCircle className="h-5 w-5 text-red-400" />,
        message: '❌ Risques importants',
      };
  }
}

function getStatusBadge(percent: number): {
  label: string;
  variant: 'default' | 'secondary' | 'destructive';
} {
  if (percent >= 80) return { label: 'Conforme', variant: 'default' };
  if (percent >= 50) return { label: 'À améliorer', variant: 'secondary' };
  return { label: 'Non conforme', variant: 'destructive' };
}

function getRecommendations(percent: number): string[] {
  const level = getResultLevel(percent);
  switch (level) {
    case 'perfect':
      return [
        'Aucune action requise — votre installation est totalement conforme.',
        'Effectuez une vérification périodique annuelle pour maintenir ce niveau.',
      ];
    case 'good':
      return [
        'Vérifiez les points non cochés et planifiez leur mise en conformité.',
        'Remplacez les équipements défectueux ou non conformes dès que possible.',
        'Faites appel à un électricien professionnel pour corriger les anomalies.',
      ];
    case 'moderate':
      return [
        'Plusieurs points de sécurité nécessitent une attention urgente.',
        'Contactez un professionnel qualifié pour un diagnostic complet.',
        'Ne remettez pas à plus tard les corrections sur les éléments de protection.',
        'Vérifiez la conformité de votre tableau électrique et des disjoncteurs.',
      ];
    case 'poor':
      return [
        '⚠️ Votre installation présente des risques importants pour les personnes et les biens.',
        '🚨 Faites appel à un électricien professionnel IMMÉDIATEMENT.',
        "Évitez d'utiliser les circuits électriques concernés jusqu'à leur mise en conformité.",
        'Vérifiez en priorité : disjoncteur différentiel, mise à la terre et protection surtension.',
        'Une remise aux normes complète est fortement recommandée.',
      ];
  }
}

function getProgressColorCSS(percent: number): string {
  if (percent >= 80) return '#34d399';
  if (percent >= 50) return '#facc15';
  return '#f87171';
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function SafetyChecklist() {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        setChecked(new Set(parsed));
      }
    } catch {
      // ignore corrupt data
    }
    setIsLoaded(true);
  }, []);

  // Auto-save to localStorage on change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...checked]));
    } catch {
      // storage full or unavailable
    }
  }, [checked, isLoaded]);

  const handleToggle = useCallback((itemId: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setChecked(new Set());
  }, []);

  const handleGenerateReport = useCallback(() => {
    const { percent, checkedCount, total } = getScore(checked);
    const { message } = getResultMessage(percent);
    const recommendations = getRecommendations(percent);

    const lines: string[] = [];
    lines.push('=== RAPPORT DE SÉCURITÉ ÉLECTRIQUE — PROQUELEC ===');
    lines.push('');
    lines.push(`Score global : ${checkedCount}/${total} (${percent}%)`);
    lines.push(`Résultat : ${message}`);
    lines.push('');
    lines.push('--- Détail par catégorie ---');
    lines.push('');

    for (const category of CATEGORIES) {
      const catScore = getCategoryScore(checked, category.id);
      lines.push(
        `${category.title} : ${catScore.checkedCount}/${catScore.total} (${catScore.percent}%)`,
      );
      for (const item of category.items) {
        const done = checked.has(item.id) ? '✅' : '⬜';
        lines.push(`  ${done} ${item.label}`);
      }
      lines.push('');
    }

    lines.push('--- Recommandations ---');
    lines.push('');
    for (const rec of recommendations) {
      lines.push(`  • ${rec}`);
    }
    lines.push('');
    lines.push('Généré par PROQUELEC — proquelec.com');

    const subject = encodeURIComponent('Rapport de sécurité électrique');
    const body = encodeURIComponent(lines.join('\n'));
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  }, [checked]);

  // ── Derived state ──────────────────────────────────────────────────────────

  const { percent, checkedCount, total } = getScore(checked);
  const statusBadge = getStatusBadge(percent);
  const resultInfo = getResultMessage(percent);
  const recommendations = getRecommendations(percent);
  const progressColor = getProgressColorCSS(percent);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-emerald-400/60 text-sm">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Summary Card ──────────────────────────────────────────────────── */}
      <Card className="border-emerald-800/30 bg-[#071914] shadow-lg shadow-emerald-900/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-900/50">
                <Zap className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-lg text-emerald-100">
                  Checklist de sécurité électrique
                </CardTitle>
                <p className="text-xs text-emerald-400/60">Normes NF C15-100 / NS 01-001</p>
              </div>
            </div>
            <Badge variant={statusBadge.variant} className="text-sm px-3 py-1">
              {statusBadge.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Score and progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-emerald-300/80">
                Score global :{' '}
                <strong className="text-emerald-200">
                  {checkedCount}/{total}
                </strong>
              </span>
              <span className="font-semibold tabular-nums text-slate-100">{percent}%</span>
            </div>
            <Progress
              value={percent}
              className="h-3 bg-emerald-950/60 [&>div]:bg-[var(--bar-color)]"
              style={{ '--bar-color': progressColor } as React.CSSProperties}
            />
          </div>

          {/* Result message */}
          <Alert className="border-emerald-800/30 bg-emerald-900/20">
            <AlertDescription className="flex items-center gap-2 text-sm font-medium text-slate-100">
              {resultInfo.icon}
              {resultInfo.message}
            </AlertDescription>
          </Alert>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400/70">
                Recommandations
              </p>
              <ul className="space-y-1">
                {recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-emerald-300/70">
                    <span className="mt-0.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500/50" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Category Cards ────────────────────────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category) => {
          const catScore = getCategoryScore(checked, category.id);
          const CategoryIcon = category.icon;

          return (
            <Card
              key={category.id}
              className="border-emerald-800/20 bg-[#071914] shadow-md transition-shadow duration-200 hover:shadow-emerald-900/20 hover:shadow-lg"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-900/40">
                      <CategoryIcon className="h-4 w-4 text-emerald-400" />
                    </div>
                    <CardTitle className="text-sm font-medium text-emerald-100">
                      {category.title}
                    </CardTitle>
                  </div>
                  <span
                    className={`text-xs font-semibold tabular-nums ${
                      catScore.percent >= 80
                        ? 'text-emerald-400'
                        : catScore.percent >= 50
                          ? 'text-yellow-400'
                          : 'text-red-400'
                    }`}
                  >
                    {catScore.percent}%
                  </span>
                </div>
                <div className="mt-2">
                  <div
                    style={
                      {
                        '--bar-color': getProgressColorCSS(catScore.percent),
                      } as React.CSSProperties
                    }
                  >
                    <Progress
                      value={catScore.percent}
                      className="h-2 bg-emerald-950/60 [&>div]:bg-[var(--bar-color)]"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-emerald-400/50 mt-1">
                  {catScore.checkedCount}/{catScore.total} vérifié
                  {catScore.total > 1 ? 's' : ''}
                </p>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {category.items.map((item) => {
                  const isChecked = checked.has(item.id);
                  return (
                    <div
                      key={item.id}
                      role="checkbox"
                      aria-checked={isChecked}
                      tabIndex={0}
                      onClick={() => handleToggle(item.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleToggle(item.id);
                        }
                      }}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 transition-all duration-150 ${
                        isChecked
                          ? 'border-emerald-700/50 bg-emerald-900/20'
                          : 'border-emerald-900/20 bg-transparent hover:border-emerald-700/30 hover:bg-emerald-900/10'
                      }`}
                    >
                      {/* Custom styled checkbox */}
                      <div
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                          isChecked
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-emerald-700/40 bg-transparent'
                        }`}
                      >
                        {isChecked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                      </div>
                      <span
                        className={`text-sm leading-snug ${
                          isChecked
                            ? 'text-emerald-200/90 line-through decoration-emerald-600/40'
                            : 'text-emerald-200/70'
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Actions ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button
          variant="outline"
          onClick={handleReset}
          className="border-emerald-700/30 bg-transparent text-emerald-300/80 hover:bg-emerald-900/30 hover:text-emerald-200"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Réinitialiser
        </Button>
        <Button
          onClick={handleGenerateReport}
          className="bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/30"
        >
          <FileText className="mr-2 h-4 w-4" />
          Générer le rapport
        </Button>
      </div>

      {/* ── Info footer ───────────────────────────────────────────────────── */}
      <p className="text-center text-[11px] text-emerald-400/30">
        Les données sont enregistrées automatiquement dans votre navigateur.
      </p>
    </div>
  );
}
