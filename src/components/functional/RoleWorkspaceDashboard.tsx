import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Gauge,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProqSecondaryNav } from '@/components/ProqSecondaryNav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useProjects } from '@/hooks/useProjects';
import { cn } from '@/lib/utils';
import {
  FunctionalPanel,
  PremiumFunctionalShell,
  type FunctionalMetric,
} from '@/components/functional/PremiumFunctionalShell';

type RoleTheme = 'electrician' | 'company' | 'member';
type Accent = 'blue' | 'emerald' | 'indigo' | 'amber' | 'slate';

export type WorkspaceModule = {
  title: string;
  description: string;
  icon: LucideIcon;
  route: string;
  badge?: string;
  tone?: Accent;
};

export type WorkspaceSignal = {
  title: string;
  detail: string;
  tone?: 'success' | 'warning' | 'info';
};

type RoleWorkspaceDashboardProps = {
  navTheme: RoleTheme;
  accent: Accent;
  eyebrow: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  primaryAction: {
    label: string;
    route: string;
  };
  modules: WorkspaceModule[];
  signals: WorkspaceSignal[];
  premiumTitle: string;
  premiumText: string;
};

const toneClass: Record<Accent, string> = {
  blue: 'bg-blue-50 text-blue-700 ring-blue-100',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  amber: 'bg-amber-50 text-amber-800 ring-amber-100',
  slate: 'bg-slate-50 text-slate-700 ring-slate-200',
};

const signalClass = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
};

export function RoleWorkspaceDashboard({
  navTheme,
  accent,
  eyebrow,
  title,
  subtitle,
  icon,
  primaryAction,
  modules,
  signals,
  premiumTitle,
  premiumText,
}: RoleWorkspaceDashboardProps) {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useProjects();
  const portfolio = projects || [];
  const activeProjects = portfolio.filter((project) => project.status !== 'livre').length;
  const reviewedProjects = portfolio.filter((project) =>
    ['submitted', 'under_review'].includes(project.regulatory_status || ''),
  ).length;
  const riskyProjects = portfolio.filter(
    (project) => Number(project.compliance_score || 0) > 0 && Number(project.compliance_score || 0) < 70,
  ).length;
  const averageScore = portfolio.length
    ? Math.round(
        portfolio.reduce((sum, project) => sum + Number(project.compliance_score || 0), 0) /
          portfolio.length,
      )
    : 0;
  const readinessScore = Math.max(
    24,
    Math.min(
      100,
      46 +
        Math.min(portfolio.length, 8) * 4 +
        (averageScore >= 80 ? 18 : averageScore >= 60 ? 10 : 0) +
        reviewedProjects * 3 -
        riskyProjects * 9,
    ),
  );

  const metrics: FunctionalMetric[] = [
    {
      label: 'Dossiers actifs',
      value: isLoading ? '...' : activeProjects,
      detail: 'Chantiers, audits ou initiatives encore ouverts.',
      icon: BriefcaseBusiness,
      tone: accent,
    },
    {
      label: 'Score moyen',
      value: isLoading || !portfolio.length ? 'N/A' : `${averageScore}%`,
      detail: 'Moyenne conformité calculée sur les dossiers existants.',
      icon: Gauge,
      tone: averageScore >= 80 ? 'emerald' : averageScore >= 60 ? 'amber' : 'slate',
    },
    {
      label: 'En revue',
      value: isLoading ? '...' : reviewedProjects,
      detail: 'Dossiers soumis ou en instruction réglementaire.',
      icon: ClipboardCheck,
      tone: 'blue',
    },
    {
      label: 'A risque',
      value: isLoading ? '...' : riskyProjects,
      detail: 'Score conformité inférieur à 70%.',
      icon: AlertTriangle,
      tone: riskyProjects > 0 ? 'amber' : 'emerald',
    },
  ];

  const recommendations = buildRecommendations({
    projectCount: portfolio.length,
    activeProjects,
    riskyProjects,
    reviewedProjects,
    averageScore,
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <ProqSecondaryNav theme={navTheme} />
      <PremiumFunctionalShell
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        icon={icon}
        accent={accent}
        metrics={metrics}
        actions={[
          {
            label: primaryAction.label,
            description: 'Créer ou reprendre une opération prioritaire',
            icon: Sparkles,
            onClick: () => navigate(primaryAction.route),
          },
          {
            label: 'Portefeuille dossiers',
            description: 'Voir les audits et projets techniques',
            icon: FileText,
            onClick: () => navigate('/projects'),
          },
        ]}
        rightRail={
          <>
            <FunctionalPanel title="Score opérationnel" subtitle="Lecture rapide de votre espace">
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-4xl font-black text-slate-950">{readinessScore}%</p>
                    <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                      Préparation
                    </p>
                  </div>
                  <ShieldCheck
                    className={cn(
                      'h-9 w-9',
                      readinessScore >= 80
                        ? 'text-emerald-600'
                        : readinessScore >= 60
                          ? 'text-amber-600'
                          : 'text-slate-500',
                    )}
                  />
                </div>
                <Progress value={readinessScore} className="h-2" />
                <div className="grid grid-cols-3 gap-2 text-center">
                  {['Audit', 'GED', 'Suivi'].map((item) => (
                    <div key={item} className="rounded-md bg-slate-50 px-2 py-3 ring-1 ring-slate-100">
                      <CheckCircle2 className="mx-auto mb-1 h-4 w-4 text-emerald-600" />
                      <span className="text-[10px] font-black uppercase text-slate-500">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FunctionalPanel>

            <FunctionalPanel title="Priorités recommandées" subtitle="Actions utiles maintenant">
              <div className="space-y-3">
                {recommendations.map((item) => (
                  <div
                    key={item.title}
                    className={cn(
                      'rounded-lg border px-4 py-3 text-sm',
                      signalClass[item.tone || 'info'],
                    )}
                  >
                    <p className="font-black">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 opacity-80">{item.detail}</p>
                  </div>
                ))}
              </div>
            </FunctionalPanel>

            <div className="rounded-lg bg-slate-950 p-5 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
              <div className="mb-5 flex items-center justify-between">
                <span className="rounded-md bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/70">
                  Premium
                </span>
                <Sparkles className="h-5 w-5 text-amber-300" />
              </div>
              <h3 className="text-xl font-black">{premiumTitle}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">{premiumText}</p>
              <Button
                type="button"
                className="mt-5 h-10 w-full rounded-md bg-white text-slate-950 hover:bg-slate-100"
                onClick={() => navigate('/abonnements')}
              >
                Voir les options
              </Button>
            </div>
          </>
        }
      >
        <div className="space-y-6">
          <FunctionalPanel title="Commandes métier" subtitle="Modules directs, orientés résultat">
            <div className="grid gap-4 md:grid-cols-2">
              {modules.map((module) => {
                const ModuleIcon = module.icon;
                return (
                  <button
                    type="button"
                    key={module.title}
                    onClick={() => navigate(module.route)}
                    className="group min-h-40 rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <span
                        className={cn(
                          'grid h-11 w-11 place-items-center rounded-md ring-1',
                          toneClass[module.tone || accent],
                        )}
                      >
                        <ModuleIcon className="h-5 w-5" />
                      </span>
                      <ArrowUpRight className="h-5 w-5 text-slate-300 transition group-hover:text-slate-700" />
                    </div>
                    <div className="mt-5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-slate-950">{module.title}</h3>
                        {module.badge && (
                          <Badge variant="outline" className="rounded-md text-[10px] font-black">
                            {module.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{module.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </FunctionalPanel>

          <FunctionalPanel title="Signaux de pilotage" subtitle="Ce que l'espace vous aide à suivre">
            <div className="grid gap-3 md:grid-cols-3">
              {signals.map((signal) => (
                <div
                  key={signal.title}
                  className={cn(
                    'min-h-32 rounded-lg border px-4 py-4',
                    signalClass[signal.tone || 'info'],
                  )}
                >
                  <p className="text-sm font-black">{signal.title}</p>
                  <p className="mt-2 text-xs leading-5 opacity-80">{signal.detail}</p>
                </div>
              ))}
            </div>
          </FunctionalPanel>

          <FunctionalPanel
            title="Prochaine semaine"
            subtitle="Cadence recommandée pour garder le portefeuille propre"
          >
            <div className="grid gap-3 md:grid-cols-3">
              {[
                ['Lundi', 'Contrôler les dossiers sans fiche technique complète.'],
                ['Mercredi', 'Relancer les pièces GED manquantes et les photos chantier.'],
                ['Vendredi', 'Exporter le journal des audits et clôturer les dossiers validés.'],
              ].map(([day, detail]) => (
                <div key={day} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center gap-2 text-slate-700">
                    <CalendarClock className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-[0.16em]">{day}</span>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{detail}</p>
                </div>
              ))}
            </div>
          </FunctionalPanel>
        </div>
      </PremiumFunctionalShell>
    </div>
  );
}

function buildRecommendations({
  projectCount,
  activeProjects,
  riskyProjects,
  reviewedProjects,
  averageScore,
}: {
  projectCount: number;
  activeProjects: number;
  riskyProjects: number;
  reviewedProjects: number;
  averageScore: number;
}): WorkspaceSignal[] {
  if (projectCount === 0) {
    return [
      {
        title: 'Créer un premier dossier',
        detail: 'Initialisez un dossier technique pour activer les métriques de conformité.',
        tone: 'info',
      },
      {
        title: 'Préparer les modèles GED',
        detail: 'Classez plans, notes de calcul et rapports avant le premier audit.',
        tone: 'success',
      },
    ];
  }

  const items: WorkspaceSignal[] = [];

  if (riskyProjects > 0) {
    items.push({
      title: `${riskyProjects} dossier(s) à risque`,
      detail: 'Priorisez les scores inférieurs à 70% avant toute soumission réglementaire.',
      tone: 'warning',
    });
  }

  if (reviewedProjects > 0) {
    items.push({
      title: `${reviewedProjects} dossier(s) en revue`,
      detail: 'Surveillez les transitions et renseignez une justification à chaque changement.',
      tone: 'info',
    });
  }

  if (averageScore >= 80) {
    items.push({
      title: 'Portefeuille solide',
      detail: 'Votre moyenne est favorable. Capitalisez en exportant les preuves de conformité.',
      tone: 'success',
    });
  }

  if (activeProjects > 0 && items.length < 3) {
    items.push({
      title: 'Rythme de clôture',
      detail: 'Programmez une revue hebdomadaire pour éviter les dossiers bloqués en chantier.',
      tone: 'info',
    });
  }

  return items.slice(0, 3);
}
