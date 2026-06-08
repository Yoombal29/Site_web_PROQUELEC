import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Download,
  Eye,
  FileJson,
  Filter,
  GitCompare,
  History,
  Loader2,
  RefreshCw,
  Rocket,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

type PageRow = {
  id: string;
  title: string;
  slug: string;
  updated_at?: string;
  builder_revision?: number;
  builder_content_hash?: string | null;
  builder_base_content_hash?: string | null;
};

type ReleasePackage = {
  kind: string;
  version: number;
  checksum: string;
  exported_at: string;
  page: {
    id?: string;
    slug: string;
    title: string;
    fields: Record<string, unknown>;
  };
  base?: {
    hash?: string;
    revision?: number;
    updated_at?: string;
  };
  current?: {
    hash?: string;
    revision?: number;
  };
  assets?: string[];
};

type PackageHealth = {
  is_valid: boolean;
  is_publishable: boolean;
  risk_level: 'low' | 'medium' | 'high';
  blockers: string[];
  warnings: string[];
  encoding: {
    replacement_count: number;
    triple_question_count: number;
    mojibake_count: number;
  };
  checksum: {
    declared?: string | null;
    computed?: string | null;
    mismatch: boolean;
  };
  assets: {
    total: number;
    external_count: number;
    missing_count: number;
    refs?: Array<{ ref: string; status: string; exists: boolean | null }>;
  };
};

type ReleaseAnalysis = {
  package_hash: string;
  package_health?: PackageHealth;
  target_exists: boolean;
  target_page_id: string | null;
  target_slug: string;
  incoming_slug: string;
  incoming_title: string;
  base_hash: string | null;
  base_revision: number | null;
  current_hash: string | null;
  current_revision: number | null;
  incoming_hash: string;
  conflict: boolean;
  can_publish: boolean;
  conflict_reason: string | null;
  diff_summary: {
    mode: 'create' | 'update';
    changed_fields: string[];
    critical_fields: string[];
    current_node_count: number;
    incoming_node_count: number;
  };
};

type CandidateStatus =
  | 'candidate'
  | 'conflict'
  | 'published'
  | 'rejected'
  | 'invalid'
  | 'quarantined'
  | 'rolled_back';

type CandidatePreview = {
  title: string;
  slug: string;
  meta_description?: string;
  text_excerpt: string;
  html_excerpt?: string;
  node_count: number;
  character_count: number;
};

type ReleaseEvent = {
  id: string;
  event_type: string;
  reason?: string | null;
  created_at: string;
};

type ReleaseCandidate = {
  id: string;
  target_page_id: string | null;
  target_slug: string;
  package_hash: string;
  base_hash: string | null;
  base_revision: number | null;
  current_hash: string | null;
  current_revision: number | null;
  status: CandidateStatus;
  conflict_reason?: string | null;
  diff_summary?: ReleaseAnalysis['diff_summary'];
  package_health?: PackageHealth;
  validation_summary?: Record<string, unknown>;
  candidate_preview?: CandidatePreview;
  live_preview?: CandidatePreview | null;
  events?: ReleaseEvent[];
  package?: ReleasePackage;
  created_at: string;
  published_at?: string | null;
  published_by?: string | null;
  publish_reason?: string | null;
  forced?: boolean;
  rollback_at?: string | null;
  rollback_reason?: string | null;
  target_title?: string | null;
  live_revision?: number | null;
};

type BuilderPermissionsResponse = {
  permissions: string[];
  role: string;
};

type PurgePreview = {
  dry_run: boolean;
  count: number;
  candidates: Array<{ id: string; target_slug: string; status: CandidateStatus; created_at: string }>;
};

type ClientPackageHealth = {
  parse_error: string | null;
  replacement_count: number;
  triple_question_count: number;
  looks_safe: boolean;
};

const ACTIVE_STATUSES: CandidateStatus[] = ['candidate', 'conflict'];
const PROCESSED_STATUSES: CandidateStatus[] = [
  'published',
  'rejected',
  'invalid',
  'quarantined',
  'rolled_back',
];
const ALL_STATUSES: CandidateStatus[] = [...ACTIVE_STATUSES, ...PROCESSED_STATUSES];

const hashLabel = (value?: string | null) => (value ? value.slice(0, 12) : 'non initialise');

const formatDate = (value?: string | null) => {
  if (!value) return 'non renseigne';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
};

const statusVariant = (status: CandidateStatus) => {
  if (status === 'published') return 'default';
  if (status === 'conflict' || status === 'invalid' || status === 'quarantined') return 'destructive';
  if (status === 'rejected' || status === 'rolled_back') return 'secondary';
  return 'outline';
};

const statusLabel: Record<CandidateStatus, string> = {
  candidate: 'Candidat',
  conflict: 'Conflit',
  published: 'Publie',
  rejected: 'Rejete',
  invalid: 'Invalide',
  quarantined: 'Quarantaine',
  rolled_back: 'Rollback',
};

const parsePackage = (raw: string): ReleasePackage | null => {
  if (!raw.trim()) return null;
  try {
    return JSON.parse(raw) as ReleasePackage;
  } catch {
    return null;
  }
};

const inspectPackageText = (raw: string): ClientPackageHealth | null => {
  if (!raw.trim()) return null;
  const replacement = String.fromCharCode(0xfffd);
  let parseError: string | null = null;
  try {
    JSON.parse(raw);
  } catch (error) {
    parseError = error instanceof Error ? error.message : 'JSON invalide';
  }
  const replacementCount = raw.split(replacement).length - 1;
  const tripleQuestionCount = (raw.match(/\?\?\?/g) || []).length;
  return {
    parse_error: parseError,
    replacement_count: replacementCount,
    triple_question_count: tripleQuestionCount,
    looks_safe: !parseError && replacementCount === 0 && tripleQuestionCount === 0,
  };
};

const healthLabel = (health?: PackageHealth) => {
  if (!health) return { label: 'Non scanne', variant: 'outline' as const };
  if (!health.is_publishable) return { label: 'Bloque', variant: 'destructive' as const };
  if (health.risk_level === 'medium') return { label: 'A verifier', variant: 'secondary' as const };
  return { label: 'Sain', variant: 'outline' as const };
};

const canPublishCandidate = (candidate: ReleaseCandidate) =>
  ACTIVE_STATUSES.includes(candidate.status) && candidate.package_health?.is_publishable !== false;

const previewDocument = (html: string, title: string) => `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>body{margin:0;font-family:Inter,Arial,sans-serif;background:#fff;color:#0f172a}</style>
</head>
<body>${html || '<div style="padding:24px;color:#64748b">Aucun HTML detecte dans le paquet.</div>'}</body>
</html>`;

export default function BuilderReleaseManagerPage() {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [selectedPageId, setSelectedPageId] = useState('');
  const [exportedPackage, setExportedPackage] = useState<ReleasePackage | null>(null);
  const [packageText, setPackageText] = useState('');
  const [analysis, setAnalysis] = useState<ReleaseAnalysis | null>(null);
  const [candidates, setCandidates] = useState<ReleaseCandidate[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'processed' | CandidateStatus>('active');
  const [healthFilter, setHealthFilter] = useState<'all' | 'clean' | 'problems'>('all');
  const [pageFilter, setPageFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [inspectedCandidate, setInspectedCandidate] = useState<ReleaseCandidate | null>(null);
  const [forceCandidate, setForceCandidate] = useState<ReleaseCandidate | null>(null);
  const [forceText, setForceText] = useState('');
  const [forceReason, setForceReason] = useState('');
  const [rollbackCandidate, setRollbackCandidate] = useState<ReleaseCandidate | null>(null);
  const [rollbackReason, setRollbackReason] = useState('');
  const [purgeOpen, setPurgeOpen] = useState(false);
  const [purgeDays, setPurgeDays] = useState('0');
  const [purgeStatuses, setPurgeStatuses] = useState<CandidateStatus[]>(['published', 'rejected', 'rolled_back']);
  const [purgePreview, setPurgePreview] = useState<PurgePreview | null>(null);

  const selectedPage = useMemo(
    () => pages.find((page) => page.id === selectedPageId) || null,
    [pages, selectedPageId],
  );

  const localPackageHealth = useMemo(() => inspectPackageText(packageText), [packageText]);

  const hasPermission = useCallback(
    (permission: string) => permissions.includes(permission),
    [permissions],
  );

  const loadPages = useCallback(async () => {
    const data = await apiFetch<PageRow[]>('/api/admin/pages');
    setPages(Array.isArray(data) ? data : []);
    if (data.length > 0) {
      setSelectedPageId((current) => current || data[0].id);
    }
  }, []);

  const loadCandidates = useCallback(async () => {
    const data = await apiFetch<ReleaseCandidate[]>('/api/admin/pages/release/candidates');
    setCandidates(Array.isArray(data) ? data : []);
  }, []);

  const loadPermissions = useCallback(async () => {
    const data = await apiFetch<BuilderPermissionsResponse>('/api/admin/builder-permissions/user');
    setPermissions(data.permissions || []);
    setRole(data.role || '');
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadPages(), loadCandidates(), loadPermissions()]);
  }, [loadCandidates, loadPages, loadPermissions]);

  useEffect(() => {
    void refreshAll().catch((error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Chargement impossible');
    });
  }, [refreshAll]);

  const filteredCandidates = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return candidates.filter((candidate) => {
      const statusMatch =
        statusFilter === 'all' ||
        (statusFilter === 'active' && ACTIVE_STATUSES.includes(candidate.status)) ||
        (statusFilter === 'processed' && PROCESSED_STATUSES.includes(candidate.status)) ||
        candidate.status === statusFilter;
      const healthMatch =
        healthFilter === 'all' ||
        (healthFilter === 'clean' && candidate.package_health?.risk_level === 'low') ||
        (healthFilter === 'problems' && candidate.package_health?.risk_level !== 'low');
      const pageMatch = pageFilter === 'all' || candidate.target_slug === pageFilter;
      const searchMatch =
        !normalizedSearch ||
        candidate.target_slug.toLowerCase().includes(normalizedSearch) ||
        candidate.id.toLowerCase().includes(normalizedSearch) ||
        candidate.package_hash.toLowerCase().includes(normalizedSearch);
      return statusMatch && healthMatch && pageMatch && searchMatch;
    });
  }, [candidates, healthFilter, pageFilter, search, statusFilter]);

  const pageSlugs = useMemo(
    () => Array.from(new Set(candidates.map((candidate) => candidate.target_slug))).sort(),
    [candidates],
  );

  const exportPage = async () => {
    if (!selectedPageId) return;
    setLoading(true);
    try {
      const pkg = await apiFetch<ReleasePackage>(
        `/api/admin/pages/${encodeURIComponent(selectedPageId)}/release/export?environment=local`,
      );
      setExportedPackage(pkg);
      setPackageText(JSON.stringify(pkg, null, 2));
      setAnalysis(null);
      toast.success('Package exporte');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Export impossible');
    } finally {
      setLoading(false);
    }
  };

  const downloadPackage = () => {
    if (!exportedPackage) return;
    const slug = exportedPackage.page.slug || 'page';
    const blob = new Blob([JSON.stringify(exportedPackage, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `builder-release-${slug}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const analyzePackage = async () => {
    const pkg = parsePackage(packageText);
    if (!pkg) {
      toast.error('Package JSON invalide ou absent');
      return;
    }

    setLoading(true);
    try {
      const result = await apiFetch<ReleaseAnalysis>('/api/admin/pages/release/analyze', {
        method: 'POST',
        body: JSON.stringify({ package: pkg }),
      });
      setAnalysis(result);
      toast.success(result.can_publish ? 'Dry-run valide' : 'Publication bloquee');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Analyse impossible');
    } finally {
      setLoading(false);
    }
  };

  const importPackage = async (mode: 'stage' | 'safe-apply') => {
    const pkg = parsePackage(packageText);
    if (!pkg) {
      toast.error('Package JSON invalide ou absent');
      return;
    }

    setLoading(true);
    try {
      const result = await apiFetch<{ mode: string; analysis: ReleaseAnalysis }>(
        '/api/admin/pages/release/import',
        {
          method: 'POST',
          body: JSON.stringify({ package: pkg, mode }),
        },
      );
      toast.success(result.mode === 'published' ? 'Page publiee' : 'Candidat cree');
      setAnalysis(result.analysis);
      await Promise.all([loadPages(), loadCandidates()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import impossible');
    } finally {
      setLoading(false);
    }
  };

  const inspectCandidate = async (candidate: ReleaseCandidate) => {
    setBusyId(candidate.id);
    try {
      const detail = await apiFetch<ReleaseCandidate>(
        `/api/admin/pages/release/candidates/${candidate.id}`,
      );
      setInspectedCandidate(detail);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Inspection impossible');
    } finally {
      setBusyId(null);
    }
  };

  const publishCandidateSafe = async (candidate: ReleaseCandidate) => {
    setBusyId(candidate.id);
    try {
      await apiFetch(`/api/admin/pages/release/candidates/${candidate.id}/publish`, {
        method: 'POST',
        body: JSON.stringify({ force: false }),
      });
      toast.success('Publication safe appliquee');
      await Promise.all([loadPages(), loadCandidates()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Publication impossible');
    } finally {
      setBusyId(null);
    }
  };

  const confirmForcePublish = async () => {
    if (!forceCandidate) return;
    const expected = `FORCER ${forceCandidate.target_slug}`;
    if (forceText.trim() !== expected) {
      toast.error(`Tapez exactement: ${expected}`);
      return;
    }
    if (forceReason.trim().length < 8) {
      toast.error('Raison de forçage requise');
      return;
    }
    if (!canPublishCandidate(forceCandidate)) {
      toast.error('Ce candidat est bloque par sa sante ou son statut');
      return;
    }

    setBusyId(forceCandidate.id);
    try {
      await apiFetch(`/api/admin/pages/release/candidates/${forceCandidate.id}/publish`, {
        method: 'POST',
        body: JSON.stringify({ force: true, reason: forceReason.trim() }),
      });
      toast.success('Publication forcee appliquee');
      setForceCandidate(null);
      setForceText('');
      setForceReason('');
      await Promise.all([loadPages(), loadCandidates()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Publication forcee impossible');
    } finally {
      setBusyId(null);
    }
  };

  const rejectCandidate = async (candidate: ReleaseCandidate) => {
    const reason = window.prompt('Raison du rejet (optionnel)', 'Candidat remplace ou invalide') || '';
    setBusyId(candidate.id);
    try {
      await apiFetch(`/api/admin/pages/release/candidates/${candidate.id}`, {
        method: 'DELETE',
        body: JSON.stringify({ reason }),
      });
      toast.success('Candidat rejete');
      await loadCandidates();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Rejet impossible');
    } finally {
      setBusyId(null);
    }
  };

  const confirmRollback = async () => {
    if (!rollbackCandidate) return;
    if (rollbackReason.trim().length < 8) {
      toast.error('Raison de rollback requise');
      return;
    }
    setBusyId(rollbackCandidate.id);
    try {
      await apiFetch(`/api/admin/pages/release/candidates/${rollbackCandidate.id}/rollback`, {
        method: 'POST',
        body: JSON.stringify({ reason: rollbackReason.trim() }),
      });
      toast.success('Rollback applique');
      setRollbackCandidate(null);
      setRollbackReason('');
      await Promise.all([loadPages(), loadCandidates()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Rollback impossible');
    } finally {
      setBusyId(null);
    }
  };

  const dryRunPurge = async () => {
    try {
      const result = await apiFetch<PurgePreview>('/api/admin/pages/release/history', {
        method: 'DELETE',
        body: JSON.stringify({
          statuses: purgeStatuses,
          older_than_days: Number(purgeDays) || 0,
          dry_run: true,
        }),
      });
      setPurgePreview(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Simulation purge impossible');
    }
  };

  const confirmPurge = async () => {
    try {
      const result = await apiFetch<PurgePreview>('/api/admin/pages/release/history', {
        method: 'DELETE',
        body: JSON.stringify({
          statuses: purgeStatuses,
          older_than_days: Number(purgeDays) || 0,
          dry_run: false,
        }),
      });
      toast.success(`${result.count} candidat(s) traite(s) supprime(s)`);
      setPurgeOpen(false);
      setPurgePreview(null);
      await loadCandidates();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Purge impossible');
    }
  };

  const onFileSelected = async (file: File | null) => {
    if (!file) return;
    const text = await file.text();
    setPackageText(text);
    setAnalysis(null);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold uppercase text-blue-700">
              <Rocket className="h-3.5 w-3.5" />
              Builder Release Manager
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">
              Migration controlee local vers VPS
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Exportez, analysez, inspectez, publiez et restaurez les pages Builder avec validation UTF-8, audit et rollback.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Role {role || '...'}</Badge>
            <Button variant="outline" onClick={() => void refreshAll()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualiser
            </Button>
          </div>
        </header>

        <Tabs defaultValue="export" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[560px]">
            <TabsTrigger value="export">
              <Download className="mr-2 h-4 w-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="import">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </TabsTrigger>
            <TabsTrigger value="candidates">
              <ShieldAlert className="mr-2 h-4 w-4" />
              Candidats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileJson className="h-5 w-5 text-blue-600" />
                  Creer un package depuis cette instance
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-[360px_1fr]">
                <section className="space-y-4">
                  <label className="block text-xs font-bold uppercase text-slate-500">
                    Page source
                  </label>
                  <select
                    value={selectedPageId}
                    onChange={(event) => setSelectedPageId(event.target.value)}
                    className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  >
                    {pages.map((page) => (
                      <option key={page.id} value={page.id}>
                        {page.title} /{page.slug}
                      </option>
                    ))}
                  </select>

                  {selectedPage && (
                    <div className="rounded-md border border-slate-200 bg-white p-4 text-sm">
                      <p className="font-bold text-slate-900">{selectedPage.title}</p>
                      <p className="mt-1 text-slate-500">/{selectedPage.slug}</p>
                      <div className="mt-4 grid gap-2 text-xs text-slate-600">
                        <span>Revision: {selectedPage.builder_revision || 1}</span>
                        <span>Hash actuel: {hashLabel(selectedPage.builder_content_hash)}</span>
                        <span>Base VPS: {hashLabel(selectedPage.builder_base_content_hash)}</span>
                      </div>
                    </div>
                  )}

                  <Button
                    disabled={!selectedPageId || loading || !hasPermission('builder.release.create')}
                    onClick={exportPage}
                    className="w-full"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Exporter
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!exportedPackage}
                    onClick={downloadPackage}
                    className="w-full"
                  >
                    <FileJson className="mr-2 h-4 w-4" />
                    Telecharger JSON
                  </Button>
                </section>

                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-slate-500">
                      Package genere
                    </span>
                    {exportedPackage && (
                      <Badge variant="outline">checksum {hashLabel(exportedPackage.checksum)}</Badge>
                    )}
                  </div>
                  <Textarea
                    value={exportedPackage ? JSON.stringify(exportedPackage, null, 2) : ''}
                    readOnly
                    className="min-h-[420px] font-mono text-xs"
                    placeholder="Le package apparaitra ici apres export."
                  />
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Upload className="h-5 w-5 text-emerald-600" />
                  Analyser et importer un package
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-[1fr_420px]">
                <section className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="file"
                      accept="application/json,.json"
                      onChange={(event) => void onFileSelected(event.target.files?.[0] || null)}
                      className="block text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
                    />
                    <Button
                      variant="outline"
                      onClick={analyzePackage}
                      disabled={loading || !packageText.trim() || !hasPermission('builder.release.view')}
                    >
                      <GitCompare className="mr-2 h-4 w-4" />
                      Dry-run
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => void importPackage('stage')}
                      disabled={loading || !packageText.trim() || !hasPermission('builder.release.create')}
                    >
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Creer candidat
                    </Button>
                    <Button
                      onClick={() => void importPackage('safe-apply')}
                      disabled={loading || !packageText.trim() || !hasPermission('builder.release.publish')}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Publier si sans conflit
                    </Button>
                  </div>

                  <PackageTextHealthPanel health={localPackageHealth} />

                  <Textarea
                    value={packageText}
                    onChange={(event) => {
                      setPackageText(event.target.value);
                      setAnalysis(null);
                    }}
                    className="min-h-[520px] font-mono text-xs"
                    placeholder="Collez ici le package JSON exporte depuis l'autre instance."
                  />
                </section>

                <AnalysisPanel analysis={analysis} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="candidates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Filter className="h-5 w-5 text-blue-600" />
                  Filtres et maintenance
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 lg:grid-cols-[1fr_180px_180px_180px_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="pl-9"
                    placeholder="Rechercher slug, ID ou hash"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="active">Actifs</option>
                  <option value="processed">Traites</option>
                  <option value="all">Tous</option>
                  {ALL_STATUSES.map((status) => (
                    <option key={status} value={status}>{statusLabel[status]}</option>
                  ))}
                </select>
                <select
                  value={healthFilter}
                  onChange={(event) => setHealthFilter(event.target.value as typeof healthFilter)}
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="all">Toutes santes</option>
                  <option value="clean">Sains</option>
                  <option value="problems">A risque</option>
                </select>
                <select
                  value={pageFilter}
                  onChange={(event) => setPageFilter(event.target.value)}
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="all">Toutes pages</option>
                  {pageSlugs.map((slug) => (
                    <option key={slug} value={slug}>/{slug}</option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPurgeOpen(true);
                    setPurgePreview(null);
                  }}
                  disabled={!hasPermission('builder.release.purge')}
                >
                  <History className="mr-2 h-4 w-4" />
                  Purger traites
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ShieldAlert className="h-5 w-5 text-amber-600" />
                  Candidats de release
                  <Badge variant="outline">{filteredCandidates.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredCandidates.length === 0 && (
                  <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                    Aucun candidat ne correspond aux filtres.
                  </div>
                )}

                {filteredCandidates.map((candidate) => (
                  <CandidateRow
                    key={candidate.id}
                    candidate={candidate}
                    busy={busyId === candidate.id}
                    canPublish={canPublishCandidate(candidate)}
                    canPublishSafe={hasPermission('builder.release.publish')}
                    canForce={hasPermission('builder.release.force')}
                    canRollback={hasPermission('builder.release.rollback')}
                    canCreate={hasPermission('builder.release.create')}
                    onInspect={() => void inspectCandidate(candidate)}
                    onPublishSafe={() => void publishCandidateSafe(candidate)}
                    onForce={() => {
                      setForceCandidate(candidate);
                      setForceText('');
                      setForceReason('');
                    }}
                    onReject={() => void rejectCandidate(candidate)}
                    onRollback={() => {
                      setRollbackCandidate(candidate);
                      setRollbackReason('');
                    }}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CandidateInspectDialog
        candidate={inspectedCandidate}
        onOpenChange={(open) => {
          if (!open) setInspectedCandidate(null);
        }}
      />

      <Dialog open={Boolean(forceCandidate)} onOpenChange={(open) => !open && setForceCandidate(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Forcer la publication</DialogTitle>
            <DialogDescription>
              Cette action remplace la version VPS actuelle. Le package doit etre sain et une raison sera auditee.
            </DialogDescription>
          </DialogHeader>
          {forceCandidate && (
            <div className="space-y-4">
              <HealthCard health={forceCandidate.package_health} />
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                Tapez <strong>FORCER {forceCandidate.target_slug}</strong> pour confirmer.
              </div>
              <Input value={forceText} onChange={(event) => setForceText(event.target.value)} />
              <Textarea
                value={forceReason}
                onChange={(event) => setForceReason(event.target.value)}
                placeholder="Raison obligatoire: correction encodage, remplacement valide, etc."
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setForceCandidate(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => void confirmForcePublish()}>
              <ShieldAlert className="mr-2 h-4 w-4" />
              Forcer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(rollbackCandidate)} onOpenChange={(open) => !open && setRollbackCandidate(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Restaurer la version precedente</DialogTitle>
            <DialogDescription>
              Le rollback restaure la revision sauvegardee avant la publication de ce candidat.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rollbackReason}
            onChange={(event) => setRollbackReason(event.target.value)}
            placeholder="Raison obligatoire du rollback"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRollbackCandidate(null)}>Annuler</Button>
            <Button onClick={() => void confirmRollback()}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Restaurer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={purgeOpen} onOpenChange={setPurgeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Supprimer l'historique des candidats traites</DialogTitle>
            <DialogDescription>
              Les candidats actifs ne sont pas supprimes. Les revisions de page restent disponibles.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-slate-500">Age minimum en jours</label>
              <Input value={purgeDays} onChange={(event) => setPurgeDays(event.target.value)} type="number" min={0} />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {PROCESSED_STATUSES.map((status) => (
                <label key={status} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white p-3 text-sm">
                  <input
                    type="checkbox"
                    checked={purgeStatuses.includes(status)}
                    onChange={(event) => {
                      setPurgeStatuses((current) =>
                        event.target.checked
                          ? Array.from(new Set([...current, status]))
                          : current.filter((item) => item !== status),
                      );
                    }}
                  />
                  {statusLabel[status]}
                </label>
              ))}
            </div>
            {purgePreview && (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm">
                <p className="font-bold text-slate-900">{purgePreview.count} candidat(s) seront supprimes.</p>
                <div className="mt-2 max-h-40 space-y-1 overflow-auto font-mono text-xs text-slate-600">
                  {purgePreview.candidates.slice(0, 20).map((candidate) => (
                    <p key={candidate.id}>{candidate.status} /{candidate.target_slug} {candidate.id}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPurgeOpen(false)}>Annuler</Button>
            <Button variant="outline" onClick={() => void dryRunPurge()}>Simuler</Button>
            <Button variant="destructive" disabled={!purgePreview || purgePreview.count === 0} onClick={() => void confirmPurge()}>
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function CandidateRow({
  candidate,
  busy,
  canPublish,
  canPublishSafe,
  canForce,
  canRollback,
  canCreate,
  onInspect,
  onPublishSafe,
  onForce,
  onReject,
  onRollback,
}: {
  candidate: ReleaseCandidate;
  busy: boolean;
  canPublish: boolean;
  canPublishSafe: boolean;
  canForce: boolean;
  canRollback: boolean;
  canCreate: boolean;
  onInspect: () => void;
  onPublishSafe: () => void;
  onForce: () => void;
  onReject: () => void;
  onRollback: () => void;
}) {
  const health = healthLabel(candidate.package_health);
  const active = ACTIVE_STATUSES.includes(candidate.status);
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-black text-slate-950">/{candidate.target_slug}</h2>
            <Badge variant={statusVariant(candidate.status)}>{statusLabel[candidate.status]}</Badge>
            <Badge variant={health.variant}>{health.label}</Badge>
            <Badge variant="outline">rev {candidate.current_revision || 'new'}</Badge>
            {candidate.forced && <Badge variant="destructive">force</Badge>}
          </div>
          <p className="mt-1 truncate text-sm text-slate-500">
            Package {hashLabel(candidate.package_hash)} · base {hashLabel(candidate.base_hash)} · cree {formatDate(candidate.created_at)}
          </p>
          {candidate.conflict_reason && (
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-red-700">
              <AlertTriangle className="h-4 w-4" />
              {candidate.conflict_reason}
            </p>
          )}
          <HealthSummary health={candidate.package_health} />
          {candidate.diff_summary && (
            <p className="mt-2 text-xs text-slate-500">
              {candidate.diff_summary.changed_fields.length} champs modifies · {candidate.diff_summary.incoming_node_count} noeuds entrants
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" disabled={busy} onClick={onInspect}>
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
            Inspecter
          </Button>
          {active && (
            <>
              <Button
                size="sm"
                disabled={busy || candidate.status === 'conflict' || !canPublish || !canPublishSafe}
                onClick={onPublishSafe}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Publier safe
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={busy || !canPublish || !canForce}
                onClick={onForce}
              >
                <ShieldAlert className="mr-2 h-4 w-4" />
                Forcer
              </Button>
              <Button size="sm" variant="outline" disabled={busy || !canCreate} onClick={onReject}>
                <Trash2 className="mr-2 h-4 w-4" />
                Rejeter
              </Button>
            </>
          )}
          {candidate.status === 'published' && (
            <Button size="sm" variant="outline" disabled={busy || !canRollback} onClick={onRollback}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Rollback
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function PackageTextHealthPanel({ health }: { health: ClientPackageHealth | null }) {
  if (!health) return null;
  return (
    <div
      className={`rounded-md border p-3 text-sm ${
        health.looks_safe ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-900'
      }`}
    >
      <div className="flex items-center gap-2 font-bold">
        {health.looks_safe ? <ShieldCheck className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
        Scan local du JSON: {health.looks_safe ? 'sain' : 'a corriger'}
      </div>
      <p className="mt-1 text-xs">
        parse={health.parse_error ? 'erreur' : 'ok'} · caracteres casses={health.replacement_count} · groupes ???={health.triple_question_count}
      </p>
    </div>
  );
}

function AnalysisPanel({ analysis }: { analysis: ReleaseAnalysis | null }) {
  if (!analysis) {
    return (
      <aside className="rounded-md border border-slate-200 bg-white p-5">
        <p className="text-sm font-bold text-slate-900">Aucun dry-run</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Lancez une analyse pour connaitre les conflits, la sante UTF-8, les assets et les champs modifies.
        </p>
      </aside>
    );
  }

  return (
    <aside className="space-y-4">
      <div
        className={`rounded-md border p-5 ${
          analysis.can_publish
            ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
            : 'border-red-200 bg-red-50 text-red-950'
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-black uppercase">
          {analysis.can_publish ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {analysis.can_publish ? 'Publication safe possible' : 'Publication bloquee'}
        </div>
        <p className="mt-3 text-sm leading-6">
          {analysis.conflict_reason || 'La version VPS correspond a la base declaree par le package.'}
        </p>
      </div>

      <HealthCard health={analysis.package_health} />

      <div className="rounded-md border border-slate-200 bg-white p-5 text-sm">
        <h3 className="mb-4 font-black text-slate-950">{analysis.incoming_title}</h3>
        <dl className="grid gap-3 text-slate-600">
          <InfoRow label="Slug entrant" value={`/${analysis.incoming_slug}`} />
          <InfoRow label="Slug cible" value={`/${analysis.target_slug}`} />
          <InfoRow label="Mode" value={analysis.diff_summary.mode} />
          <InfoRow label="Hash base" value={hashLabel(analysis.base_hash)} />
          <InfoRow label="Hash VPS" value={hashLabel(analysis.current_hash)} />
          <InfoRow label="Hash entrant" value={hashLabel(analysis.incoming_hash)} />
          <InfoRow label="Noeuds VPS" value={String(analysis.diff_summary.current_node_count)} />
          <InfoRow label="Noeuds entrants" value={String(analysis.diff_summary.incoming_node_count)} />
        </dl>
      </div>

      <ChangedFieldsPanel diff={analysis.diff_summary} />
    </aside>
  );
}

function HealthCard({ health }: { health?: PackageHealth }) {
  if (!health) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-5 text-sm text-slate-500">
        Sante package non disponible.
      </div>
    );
  }
  const label = healthLabel(health);
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={label.variant}>{label.label}</Badge>
        <span className="font-bold text-slate-900">Sante du package</span>
      </div>
      <div className="mt-4 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
        <span>Caracteres casses: {health.encoding.replacement_count}</span>
        <span>Groupes ???: {health.encoding.triple_question_count}</span>
        <span>Mojibake suspect: {health.encoding.mojibake_count}</span>
        <span>Assets manquants: {health.assets.missing_count}</span>
        <span>Assets externes: {health.assets.external_count}</span>
        <span>Checksum: {health.checksum.mismatch ? 'mismatch' : 'ok'}</span>
      </div>
      {(health.blockers.length > 0 || health.warnings.length > 0) && (
        <div className="mt-4 space-y-2">
          {health.blockers.map((blocker) => (
            <p key={blocker} className="flex items-center gap-2 text-xs font-semibold text-red-700">
              <Ban className="h-3.5 w-3.5" />
              {blocker}
            </p>
          ))}
          {health.warnings.map((warning) => (
            <p key={warning} className="flex items-center gap-2 text-xs font-semibold text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5" />
              {warning}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

function HealthSummary({ health }: { health?: PackageHealth }) {
  if (!health) return null;
  return (
    <p className="mt-2 text-xs text-slate-500">
      UTF-8: {health.encoding.replacement_count} casse(s), {health.encoding.triple_question_count} groupe(s) ??? · assets manquants: {health.assets.missing_count}
    </p>
  );
}

function ChangedFieldsPanel({ diff }: { diff: ReleaseAnalysis['diff_summary'] }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-black text-slate-950">Champs modifies</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {diff.changed_fields.length === 0 ? (
          <Badge variant="outline">aucun changement</Badge>
        ) : (
          diff.changed_fields.map((field) => (
            <Badge
              key={field}
              variant={diff.critical_fields.includes(field) ? 'destructive' : 'secondary'}
            >
              {field}
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}

function CandidateInspectDialog({
  candidate,
  onOpenChange,
}: {
  candidate: ReleaseCandidate | null;
  onOpenChange: (open: boolean) => void;
}) {
  const open = Boolean(candidate);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-6xl overflow-auto">
        <DialogHeader>
          <DialogTitle>Inspection candidat {candidate?.target_slug ? `/${candidate.target_slug}` : ''}</DialogTitle>
          <DialogDescription>
            Controlez la sante, le diff, le rendu et l'audit avant toute action irreversible.
          </DialogDescription>
        </DialogHeader>
        {candidate && (
          <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-3">
              <HealthCard health={candidate.package_health} />
              <PreviewSummary title="Version VPS actuelle" preview={candidate.live_preview} />
              <PreviewSummary title="Version candidate" preview={candidate.candidate_preview} />
            </div>

            {candidate.diff_summary && <ChangedFieldsPanel diff={candidate.diff_summary} />}

            <div className="grid gap-4 lg:grid-cols-2">
              <PreviewFrame title="Rendu VPS actuel" preview={candidate.live_preview} />
              <PreviewFrame title="Rendu candidat" preview={candidate.candidate_preview} />
            </div>

            <div className="rounded-md border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-black text-slate-950">Audit</h3>
              <div className="space-y-2 text-sm text-slate-600">
                <InfoRow label="ID" value={candidate.id} />
                <InfoRow label="Statut" value={statusLabel[candidate.status]} />
                <InfoRow label="Cree" value={formatDate(candidate.created_at)} />
                <InfoRow label="Publie" value={formatDate(candidate.published_at)} />
                <InfoRow label="Raison publication" value={candidate.publish_reason || 'non renseignee'} />
                <InfoRow label="Rollback" value={formatDate(candidate.rollback_at)} />
                <InfoRow label="Raison rollback" value={candidate.rollback_reason || 'non renseignee'} />
              </div>
              {candidate.events && candidate.events.length > 0 && (
                <div className="mt-4 max-h-48 space-y-2 overflow-auto border-t border-slate-100 pt-4">
                  {candidate.events.map((event) => (
                    <p key={event.id} className="text-xs text-slate-500">
                      {formatDate(event.created_at)} · {event.event_type}
                      {event.reason ? ` · ${event.reason}` : ''}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PreviewSummary({ title, preview }: { title: string; preview?: CandidatePreview | null }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 text-sm">
      <h3 className="font-black text-slate-950">{title}</h3>
      {preview ? (
        <div className="mt-3 space-y-2 text-slate-600">
          <p className="font-semibold text-slate-900">{preview.title}</p>
          <p>/{preview.slug}</p>
          <p>{preview.node_count} noeuds · {preview.character_count} caracteres</p>
          <p className="line-clamp-4 text-xs leading-5">{preview.text_excerpt || 'Aucun extrait texte.'}</p>
        </div>
      ) : (
        <p className="mt-3 text-slate-500">Aucune version cible.</p>
      )}
    </div>
  );
}

function PreviewFrame({ title, preview }: { title: string; preview?: CandidatePreview | null }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-black text-slate-950">{title}</h3>
      <iframe
        title={title}
        sandbox=""
        srcDoc={previewDocument(preview?.html_excerpt || '', preview?.title || title)}
        className="h-[360px] w-full rounded-md border border-slate-200 bg-white"
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-2 last:border-b-0 last:pb-0">
      <dt className="text-xs font-bold uppercase text-slate-400">{label}</dt>
      <dd className="truncate text-right font-mono text-xs text-slate-700">{value}</dd>
    </div>
  );
}
