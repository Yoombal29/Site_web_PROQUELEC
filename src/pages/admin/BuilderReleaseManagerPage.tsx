import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileJson,
  GitCompare,
  Loader2,
  Rocket,
  ShieldAlert,
  Trash2,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

type ReleaseAnalysis = {
  package_hash: string;
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

type ReleaseCandidate = {
  id: string;
  target_page_id: string | null;
  target_slug: string;
  package_hash: string;
  base_hash: string | null;
  base_revision: number | null;
  current_hash: string | null;
  current_revision: number | null;
  status: 'candidate' | 'conflict' | 'published' | 'rejected';
  conflict_reason?: string | null;
  diff_summary?: ReleaseAnalysis['diff_summary'];
  created_at: string;
  published_at?: string | null;
  target_title?: string | null;
  live_revision?: number | null;
};

const hashLabel = (value?: string | null) => (value ? value.slice(0, 12) : 'non initialise');

const statusVariant = (status: ReleaseCandidate['status']) => {
  if (status === 'published') return 'default';
  if (status === 'conflict') return 'destructive';
  if (status === 'rejected') return 'secondary';
  return 'outline';
};

const parsePackage = (raw: string): ReleasePackage | null => {
  if (!raw.trim()) return null;
  return JSON.parse(raw) as ReleasePackage;
};

export default function BuilderReleaseManagerPage() {
  const [pages, setPages] = useState<PageRow[]>([]);
  const [selectedPageId, setSelectedPageId] = useState('');
  const [exportedPackage, setExportedPackage] = useState<ReleasePackage | null>(null);
  const [packageText, setPackageText] = useState('');
  const [analysis, setAnalysis] = useState<ReleaseAnalysis | null>(null);
  const [candidates, setCandidates] = useState<ReleaseCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const selectedPage = useMemo(
    () => pages.find((page) => page.id === selectedPageId) || null,
    [pages, selectedPageId],
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

  useEffect(() => {
    void Promise.all([loadPages(), loadCandidates()]).catch((error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Chargement impossible');
    });
  }, [loadCandidates, loadPages]);

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
      toast.error('Package JSON requis');
      return;
    }

    setLoading(true);
    try {
      const result = await apiFetch<ReleaseAnalysis>('/api/admin/pages/release/analyze', {
        method: 'POST',
        body: JSON.stringify({ package: pkg }),
      });
      setAnalysis(result);
      toast.success(result.conflict ? 'Conflit detecte' : 'Dry-run valide');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Analyse impossible');
    } finally {
      setLoading(false);
    }
  };

  const importPackage = async (mode: 'stage' | 'safe-apply') => {
    const pkg = parsePackage(packageText);
    if (!pkg) {
      toast.error('Package JSON requis');
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

  const publishCandidate = async (candidate: ReleaseCandidate, force: boolean) => {
    if (force && !window.confirm('Forcer la publication remplacera la version VPS actuelle. Continuer ?')) {
      return;
    }

    setBusyId(candidate.id);
    try {
      await apiFetch(`/api/admin/pages/release/candidates/${candidate.id}/publish`, {
        method: 'POST',
        body: JSON.stringify({ force }),
      });
      toast.success(force ? 'Publication forcee appliquee' : 'Publication appliquee');
      await Promise.all([loadPages(), loadCandidates()]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Publication impossible');
    } finally {
      setBusyId(null);
    }
  };

  const rejectCandidate = async (candidate: ReleaseCandidate) => {
    setBusyId(candidate.id);
    try {
      await apiFetch(`/api/admin/pages/release/candidates/${candidate.id}`, {
        method: 'DELETE',
      });
      toast.success('Candidat rejete');
      await loadCandidates();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Rejet impossible');
    } finally {
      setBusyId(null);
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
              Exportez une page, analysez le dry-run, puis publiez uniquement si la version VPS
              correspond encore a la base utilisee localement.
            </p>
          </div>
          <Button variant="outline" onClick={() => void Promise.all([loadPages(), loadCandidates()])}>
            <GitCompare className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
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

                  <Button disabled={!selectedPageId || loading} onClick={exportPage} className="w-full">
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
                    <Button variant="outline" onClick={analyzePackage} disabled={loading || !packageText.trim()}>
                      <GitCompare className="mr-2 h-4 w-4" />
                      Dry-run
                    </Button>
                    <Button variant="outline" onClick={() => void importPackage('stage')} disabled={loading || !packageText.trim()}>
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Creer candidat
                    </Button>
                    <Button onClick={() => void importPackage('safe-apply')} disabled={loading || !packageText.trim()}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Publier si sans conflit
                    </Button>
                  </div>
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

          <TabsContent value="candidates">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ShieldAlert className="h-5 w-5 text-amber-600" />
                  Candidats de release
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {candidates.length === 0 && (
                  <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                    Aucun candidat pour le moment.
                  </div>
                )}

                {candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-black text-slate-950">
                            /{candidate.target_slug}
                          </h2>
                          <Badge variant={statusVariant(candidate.status)}>{candidate.status}</Badge>
                          <Badge variant="outline">rev {candidate.current_revision || 'new'}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                          Package {hashLabel(candidate.package_hash)} · base {hashLabel(candidate.base_hash)}
                        </p>
                        {candidate.conflict_reason && (
                          <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-red-700">
                            <AlertTriangle className="h-4 w-4" />
                            {candidate.conflict_reason}
                          </p>
                        )}
                        {candidate.diff_summary && (
                          <p className="mt-2 text-xs text-slate-500">
                            {candidate.diff_summary.changed_fields.length} champs modifies ·{' '}
                            {candidate.diff_summary.incoming_node_count} noeuds entrants
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {['candidate', 'conflict'].includes(candidate.status) && (
                          <>
                            <Button
                              size="sm"
                              disabled={busyId === candidate.id || candidate.status === 'conflict'}
                              onClick={() => void publishCandidate(candidate, false)}
                            >
                              {busyId === candidate.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                              )}
                              Publier safe
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={busyId === candidate.id}
                              onClick={() => void publishCandidate(candidate, true)}
                            >
                              <ShieldAlert className="mr-2 h-4 w-4" />
                              Forcer
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busyId === candidate.id}
                              onClick={() => void rejectCandidate(candidate)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Rejeter
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function AnalysisPanel({ analysis }: { analysis: ReleaseAnalysis | null }) {
  if (!analysis) {
    return (
      <aside className="rounded-md border border-slate-200 bg-white p-5">
        <p className="text-sm font-bold text-slate-900">Aucun dry-run</p>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Lancez une analyse pour connaitre le statut de conflit avant publication.
        </p>
      </aside>
    );
  }

  return (
    <aside className="space-y-4">
      <div
        className={`rounded-md border p-5 ${
          analysis.conflict
            ? 'border-red-200 bg-red-50 text-red-950'
            : 'border-emerald-200 bg-emerald-50 text-emerald-950'
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-black uppercase">
          {analysis.conflict ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          {analysis.conflict ? 'Conflit detecte' : 'Publication safe possible'}
        </div>
        <p className="mt-3 text-sm leading-6">
          {analysis.conflict_reason ||
            'La version VPS correspond a la base declaree par le package.'}
        </p>
      </div>

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

      <div className="rounded-md border border-slate-200 bg-white p-5">
        <h3 className="text-sm font-black text-slate-950">Champs modifies</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {analysis.diff_summary.changed_fields.length === 0 ? (
            <Badge variant="outline">aucun changement</Badge>
          ) : (
            analysis.diff_summary.changed_fields.map((field) => (
              <Badge
                key={field}
                variant={analysis.diff_summary.critical_fields.includes(field) ? 'destructive' : 'secondary'}
              >
                {field}
              </Badge>
            ))
          )}
        </div>
      </div>
    </aside>
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
