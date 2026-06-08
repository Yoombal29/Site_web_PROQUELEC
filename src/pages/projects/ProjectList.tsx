import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  AlertTriangle,
  ArrowUpRight,
  BriefcaseBusiness,
  Calendar,
  ClipboardCheck,
  FileText,
  Gauge,
  Loader2,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  FunctionalEmptyState,
  FunctionalPanel,
  FunctionalPrimaryButton,
  PremiumFunctionalShell,
} from '@/components/functional/PremiumFunctionalShell';
import { useCreateProject, useProjects, type Project } from '@/hooks/useProjects';
import { cn } from '@/lib/utils';

type ProjectFilter = 'all' | 'risk' | 'review' | 'draft' | 'validated';

const filterLabels: Record<ProjectFilter, string> = {
  all: 'Tous',
  risk: 'A risque',
  review: 'En revue',
  draft: 'Brouillons',
  validated: 'Validés',
};

const statusLabels: Record<string, string> = {
  etude: 'Etude',
  chantier: 'Chantier',
  controle: 'Controle',
  livre: 'Livre',
  draft: 'Brouillon',
  submitted: 'Soumis',
  under_review: 'En revue',
  validated: 'Valide',
  rejected: 'Rejete',
  archived: 'Archive',
};

export default function ProjectList() {
  const navigate = useNavigate();
  const { data: projects, isLoading } = useProjects();
  const createMutation = useCreateProject();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>('all');
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [newProjectData, setNewProjectData] = useState({
    title: '',
    client_name: '',
    city: 'Dakar',
    address: '',
  });

  const portfolio = useMemo(() => projects || [], [projects]);
  const averageScore = portfolio.length
    ? Math.round(
        portfolio.reduce((sum, project) => sum + Number(project.compliance_score || 0), 0) /
          portfolio.length,
      )
    : 0;
  const riskCount = portfolio.filter((project) => isRiskProject(project)).length;
  const reviewCount = portfolio.filter((project) => isReviewProject(project)).length;
  const activeCount = portfolio.filter((project) => project.status !== 'livre').length;

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();
    return portfolio
      .filter((project) => {
        const matchesSearch =
          !term ||
          project.title.toLowerCase().includes(term) ||
          project.reference?.toLowerCase().includes(term) ||
          project.client_info?.name?.toLowerCase().includes(term) ||
          project.location?.city?.toLowerCase().includes(term);

        if (!matchesSearch) return false;
        if (activeFilter === 'risk') return isRiskProject(project);
        if (activeFilter === 'review') return isReviewProject(project);
        if (activeFilter === 'draft') return (project.regulatory_status || 'draft') === 'draft';
        if (activeFilter === 'validated') return project.regulatory_status === 'validated';
        return true;
      })
      .sort((a, b) => {
        const riskDelta = Number(isRiskProject(b)) - Number(isRiskProject(a));
        if (riskDelta !== 0) return riskDelta;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
  }, [activeFilter, portfolio, search]);

  const handleCreate = async () => {
    if (!newProjectData.title.trim()) return;

    const created = await createMutation.mutateAsync({
      title: newProjectData.title.trim(),
      client_info: { name: newProjectData.client_name.trim() || undefined },
      location: {
        city: newProjectData.city.trim() || 'Dakar',
        address: newProjectData.address.trim() || undefined,
      },
      status: 'etude',
      regulatory_status: 'draft',
    });

    setNewProjectOpen(false);
    setNewProjectData({ title: '', client_name: '', city: 'Dakar', address: '' });
    if (created?.id) navigate(`/projects/${created.id}`);
  };

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm font-bold text-slate-500">Chargement du portefeuille...</p>
        </div>
      </div>
    );
  }

  return (
    <PremiumFunctionalShell
      eyebrow="Portefeuille technique"
      title="Pilotez les dossiers de conformité comme un vrai centre de contrôle."
      subtitle="Priorisez les audits à risque, suivez les transitions réglementaires et centralisez les preuves avant validation."
      icon={BriefcaseBusiness}
      accent="blue"
      metrics={[
        {
          label: 'Dossiers actifs',
          value: activeCount,
          detail: 'Dossiers non livrés nécessitant suivi ou action.',
          icon: BriefcaseBusiness,
          tone: 'blue',
        },
        {
          label: 'Score moyen',
          value: portfolio.length ? `${averageScore}%` : 'N/A',
          detail: 'Moyenne conformité du portefeuille.',
          icon: Gauge,
          tone: averageScore >= 80 ? 'emerald' : averageScore >= 60 ? 'amber' : 'slate',
        },
        {
          label: 'En revue',
          value: reviewCount,
          detail: 'Dossiers soumis ou en instruction.',
          icon: ClipboardCheck,
          tone: 'indigo',
        },
        {
          label: 'A risque',
          value: riskCount,
          detail: 'Score inférieur à 70% ou rejet réglementaire.',
          icon: AlertTriangle,
          tone: riskCount > 0 ? 'amber' : 'emerald',
        },
      ]}
      actions={[
        {
          label: 'Nouveau dossier',
          description: 'Initialiser un audit PROQUELEC',
          icon: Plus,
          onClick: () => setNewProjectOpen(true),
        },
        {
          label: 'Ouvrir la GED',
          description: 'Classer les preuves techniques',
          icon: FileText,
          onClick: () => navigate('/ged'),
        },
      ]}
      rightRail={
        <>
          <FunctionalPanel title="Priorisation" subtitle="Lecture opérationnelle">
            <div className="space-y-3">
              {[
                {
                  label: 'Traiter d’abord',
                  value: riskCount > 0 ? `${riskCount} dossier(s)` : 'Aucun risque',
                  detail:
                    riskCount > 0
                      ? 'Audits à score faible ou rejetés.'
                      : 'Aucun dossier critique détecté.',
                  tone: riskCount > 0 ? 'warning' : 'success',
                },
                {
                  label: 'A surveiller',
                  value: `${reviewCount} en revue`,
                  detail: 'Transitions réglementaires à documenter.',
                  tone: 'info',
                },
                {
                  label: 'Cadence',
                  value: 'Hebdomadaire',
                  detail: 'Revue des pièces GED et statuts chaque vendredi.',
                  tone: 'info',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={cn(
                    'rounded-lg border px-4 py-3',
                    item.tone === 'warning' &&
                      'border-amber-200 bg-amber-50 text-amber-900',
                    item.tone === 'success' &&
                      'border-emerald-200 bg-emerald-50 text-emerald-800',
                    item.tone === 'info' && 'border-blue-200 bg-blue-50 text-blue-800',
                  )}
                >
                  <p className="text-xs font-black uppercase tracking-[0.16em] opacity-70">
                    {item.label}
                  </p>
                  <p className="mt-1 text-lg font-black">{item.value}</p>
                  <p className="mt-1 text-xs leading-5 opacity-80">{item.detail}</p>
                </div>
              ))}
            </div>
          </FunctionalPanel>

          <FunctionalPanel title="Workflow recommandé" subtitle="Cycle de validation">
            <div className="space-y-3">
              {[
                ['1', 'Etude', 'Fiche technique, puissance, localisation.'],
                ['2', 'Preuves GED', 'Plans, photos, notes de calcul, PV.'],
                ['3', 'Audit', 'Checklist et score de conformité.'],
                ['4', 'Validation', 'Justification et journal signé.'],
              ].map(([step, label, detail]) => (
                <div key={step} className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white text-xs font-black text-blue-700 ring-1 ring-slate-200">
                    {step}
                  </span>
                  <div>
                    <p className="text-sm font-black text-slate-900">{label}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </FunctionalPanel>
        </>
      }
    >
      <FunctionalPanel
        title="Dossiers"
        subtitle="Recherche, filtrage et tri par priorité de risque"
        action={
          <Dialog open={newProjectOpen} onOpenChange={setNewProjectOpen}>
            <DialogTrigger asChild>
              <FunctionalPrimaryButton accent="blue">
                <Plus className="mr-2 h-4 w-4" />
                Nouveau dossier
              </FunctionalPrimaryButton>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ouvrir un nouveau dossier technique</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="Nom du projet"
                  value={newProjectData.title}
                  onChange={(event) =>
                    setNewProjectData({ ...newProjectData, title: event.target.value })
                  }
                />
                <Input
                  placeholder="Client"
                  value={newProjectData.client_name}
                  onChange={(event) =>
                    setNewProjectData({ ...newProjectData, client_name: event.target.value })
                  }
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    placeholder="Ville"
                    value={newProjectData.city}
                    onChange={(event) =>
                      setNewProjectData({ ...newProjectData, city: event.target.value })
                    }
                  />
                  <Input
                    placeholder="Adresse"
                    value={newProjectData.address}
                    onChange={(event) =>
                      setNewProjectData({ ...newProjectData, address: event.target.value })
                    }
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleCreate}
                  disabled={createMutation.isPending || !newProjectData.title.trim()}
                  className="h-11 w-full rounded-md bg-blue-600 font-black hover:bg-blue-700"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  Initialiser le dossier
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      >
        <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="h-11 rounded-md border-slate-200 bg-white pl-10"
              placeholder="Chercher par titre, référence, client ou ville..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(filterLabels) as ProjectFilter[]).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  'h-11 rounded-md border px-3 text-xs font-black uppercase tracking-[0.12em] transition',
                  activeFilter === filter
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
                )}
              >
                {filterLabels[filter]}
              </button>
            ))}
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <FunctionalEmptyState
            icon={BriefcaseBusiness}
            title="Aucun dossier dans cette vue"
            description="Ajustez le filtre ou créez un nouveau dossier pour commencer le suivi technique."
            action={
              <FunctionalPrimaryButton accent="blue" onClick={() => setNewProjectOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Créer un dossier
              </FunctionalPrimaryButton>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => navigate(`/projects/${project.id}`)}
              />
            ))}
          </div>
        )}
      </FunctionalPanel>
    </PremiumFunctionalShell>
  );
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const score = Number(project.compliance_score || 0);
  const isRisk = isRiskProject(project);
  const status = project.regulatory_status || project.status || 'draft';

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group min-h-64 rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <Badge
          variant="outline"
          className="max-w-[180px] truncate rounded-md bg-slate-50 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500"
        >
          {project.reference || 'Sans reference'}
        </Badge>
        <Badge
          className={cn(
            'rounded-md text-[10px] font-black uppercase tracking-[0.12em]',
            isRisk
              ? 'bg-amber-100 text-amber-800 hover:bg-amber-100'
              : status === 'validated'
                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                : 'bg-blue-100 text-blue-800 hover:bg-blue-100',
          )}
        >
          {statusLabels[status] || status}
        </Badge>
      </div>

      <h3 className="mt-5 line-clamp-2 text-xl font-black leading-tight text-slate-950 transition group-hover:text-blue-700">
        {project.title}
      </h3>
      <div className="mt-3 space-y-2 text-sm text-slate-500">
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-400" />
          {project.location?.city || 'Localisation inconnue'}
        </p>
        <p className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          Mis à jour le {format(new Date(project.updated_at), 'dd MMM yyyy', { locale: fr })}
        </p>
      </div>

      <div className="mt-5 rounded-lg bg-slate-50 p-4 ring-1 ring-slate-100">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
            Conformité
          </span>
          <span
            className={cn(
              'text-lg font-black',
              score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-slate-500',
            )}
          >
            {score > 0 ? `${score}%` : 'N/A'}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white">
          <div
            className={cn(
              'h-full rounded-full',
              score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-slate-300',
            )}
            style={{ width: `${Math.max(6, Math.min(100, score || 6))}%` }}
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
          <ShieldCheck className="h-4 w-4" />
          Ouvrir
        </span>
        <ArrowUpRight className="h-5 w-5 text-slate-300 transition group-hover:text-blue-700" />
      </div>
    </button>
  );
}

function isRiskProject(project: Project) {
  const score = Number(project.compliance_score || 0);
  return (score > 0 && score < 70) || project.regulatory_status === 'rejected';
}

function isReviewProject(project: Project) {
  return ['submitted', 'under_review'].includes(project.regulatory_status || '');
}
