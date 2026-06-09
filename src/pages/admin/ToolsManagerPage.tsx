import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  RotateCcw,
  Download,
  Upload,
  Settings,
  Sparkles,
  DollarSign,
  CheckCircle2,
  ChevronRight,
  Wrench,
  Info,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import {
  freeApps,
  premiumApps,
  internalApps,
  type AppCategory,
  type AppStatus,
} from '@/data/applications-catalog';

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'proquelec_tools_overrides';

interface ToolOverride {
  category: AppCategory;
  status: AppStatus;
}

type OverridesMap = Record<string, ToolOverride>;

const STATUS_CYCLE: AppStatus[] = ['active', 'coming', 'development'];

const STATUS_LABELS: Record<AppStatus, string> = {
  active: 'Actif',
  coming: 'À venir',
  development: 'En développement',
};

const STATUS_BADGE_VARIANTS: Record<AppStatus, 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  coming: 'secondary',
  development: 'outline',
};

const CATEGORY_LABELS: Record<AppCategory, string> = {
  free: 'Gratuit',
  premium: 'Premium',
  internal: 'Interne',
};

// Merge all catalog apps into a single array
const catalogApps = [...freeApps, ...premiumApps, ...internalApps];

// ---------------------------------------------------------------------------
// localStorage helpers
// ---------------------------------------------------------------------------

function loadOverrides(): OverridesMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistOverrides(overrides: OverridesMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides, null, 2));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ToolsManagerPage() {
  const [overrides, setOverrides] = useState<OverridesMap>(loadOverrides);
  const [activeTab, setActiveTab] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-sync if localStorage was changed by another tab
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setOverrides(loadOverrides());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Apply current overrides on top of the static catalog data
  const mergedApps = useMemo(
    () =>
      catalogApps.map((app) => {
        const override = overrides[app.id];
        if (!override) return app;
        return { ...app, category: override.category, status: override.status };
      }),
    [overrides],
  );

  // Stats summary
  const stats = useMemo(
    () => ({
      total: mergedApps.length,
      free: mergedApps.filter((a) => a.category === 'free').length,
      premium: mergedApps.filter((a) => a.category === 'premium').length,
      active: mergedApps.filter((a) => a.status === 'active').length,
      coming: mergedApps.filter((a) => a.status === 'coming').length,
      development: mergedApps.filter((a) => a.status === 'development').length,
    }),
    [mergedApps],
  );

  const comingCount = stats.coming + stats.development;

  // Tabs filter
  const filteredApps = useMemo(() => {
    switch (activeTab) {
      case 'free':
        return mergedApps.filter((a) => a.category === 'free');
      case 'premium':
        return mergedApps.filter((a) => a.category === 'premium');
      case 'coming':
        return mergedApps.filter((a) => a.status === 'coming' || a.status === 'development');
      default:
        return mergedApps;
    }
  }, [mergedApps, activeTab]);

  // ── Actions ──────────────────────────────────────────────────────────

  const updateOverride = useCallback((appId: string, patch: Partial<ToolOverride>) => {
    setOverrides((prev) => {
      const baseApp = catalogApps.find((a) => a.id === appId);
      if (!baseApp) return prev;
      const existing = prev[appId];
      const next: OverridesMap = {
        ...prev,
        [appId]: {
          category: patch.category ?? existing?.category ?? baseApp.category,
          status: patch.status ?? existing?.status ?? baseApp.status,
        },
      };
      persistOverrides(next);
      return next;
    });
  }, []);

  const toggleCategory = (appId: string) => {
    const app = catalogApps.find((a) => a.id === appId);
    if (!app) return;
    const current = overrides[appId]?.category ?? app.category;
    const next: AppCategory = current === 'premium' ? 'free' : 'premium';
    updateOverride(appId, { category: next });
    toast.success(`« ${app.title} » est maintenant ${next === 'premium' ? 'Premium' : 'Gratuit'}`);
  };

  const cycleStatus = (appId: string) => {
    const app = catalogApps.find((a) => a.id === appId);
    if (!app) return;
    const current = overrides[appId]?.status ?? app.status;
    const idx = STATUS_CYCLE.indexOf(current);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    updateOverride(appId, { status: next });
    toast.success(`« ${app.title} » passe en statut « ${STATUS_LABELS[next]} »`);
  };

  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setOverrides({});
    toast.success('Tous les changements ont été réinitialisés');
  };

  const exportOverrides = () => {
    const data = loadOverrides();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proquelec-overrides-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Configuration exportée');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string) as OverridesMap;
        persistOverrides(data);
        setOverrides(data);
        toast.success(`Configuration importée (${Object.keys(data).length} outil(s))`);
      } catch {
        toast.error('Le fichier JSON est invalide');
      }
    };
    reader.readAsText(file);
    // Reset so the same file can be re-imported
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Render helpers ───────────────────────────────────────────────────

  const renderIcon = (app: (typeof catalogApps)[number]) => {
    if (!app.icon) return null;
    const IconComponent = app.icon as React.ComponentType<{
      className?: string;
    }>;
    return <IconComponent className="w-5 h-5 text-muted-foreground" />;
  };

  const overrideCount = Object.keys(overrides).length;

  // ── Template ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6">
      {/* ── Header & breadcrumb ─────────────────────────────── */}
      <div className="space-y-1">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
          <span>Administration</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-medium text-foreground">Gestion des outils</span>
          <span className="text-muted-foreground mx-1">|</span>
          <a
            href="/admin/tools-stats"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Statistiques
          </a>
          <span className="text-muted-foreground mx-1">|</span>
          <a
            href="/outils"
            className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-medium"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Voir les outils
          </a>
        </nav>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gestion des outils</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gérez la monétisation et le statut des {stats.total} outils de la plateforme
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
            <Button variant="outline" size="sm" onClick={exportOverrides}>
              <Download className="w-4 h-4 mr-1.5" />
              Exporter
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-1.5" />
              Importer
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={resetAll}
              disabled={overrideCount === 0}
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              Réinitialiser
              {overrideCount > 0 && <span className="ml-1.5">({overrideCount})</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Stats cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total outils</CardTitle>
            <Settings className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gratuits</CardTitle>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.free}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Premium</CardTitle>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.premium}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Actifs</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
      </div>

      {/* ── Tabs ────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            Tous les outils
            <Badge variant="secondary" className="ml-2 text-xs">
              {stats.total}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="free">
            Gratuits
            <Badge variant="secondary" className="ml-2 text-xs">
              {stats.free}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="premium">
            Premium
            <Badge variant="secondary" className="ml-2 text-xs">
              {stats.premium}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="coming">
            À venir
            <Badge variant="secondary" className="ml-2 text-xs">
              {comingCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[280px]">Nom / Icône</TableHead>
                    <TableHead>Groupe</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead className="text-right w-[340px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApps.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        Aucun outil trouvé dans cette catégorie.
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredApps.map((app) => {
                    const currentCategory = overrides[app.id]?.category ?? app.category;
                    const currentStatus = overrides[app.id]?.status ?? app.status;
                    const isOverridden = overrides[app.id] !== undefined;
                    const statusNext =
                      STATUS_CYCLE[(STATUS_CYCLE.indexOf(currentStatus) + 1) % STATUS_CYCLE.length];

                    return (
                      <TableRow
                        key={app.id}
                        className={isOverridden ? 'border-l-2 border-l-primary/60' : undefined}
                      >
                        {/* Nom / Icône */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                              {renderIcon(app)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-sm truncate">{app.title}</div>
                              <div className="text-xs text-muted-foreground truncate">{app.id}</div>
                            </div>
                          </div>
                        </TableCell>

                        {/* Groupe */}
                        <TableCell>
                          <Badge variant="outline" className="text-xs font-normal">
                            {app.group}
                          </Badge>
                        </TableCell>

                        {/* Statut */}
                        <TableCell>
                          <Badge variant={STATUS_BADGE_VARIANTS[currentStatus]}>
                            {STATUS_LABELS[currentStatus]}
                          </Badge>
                        </TableCell>

                        {/* Catégorie */}
                        <TableCell>
                          <Badge
                            variant={
                              currentCategory === 'premium'
                                ? 'default'
                                : currentCategory === 'free'
                                  ? 'secondary'
                                  : 'outline'
                            }
                          >
                            {CATEGORY_LABELS[currentCategory]}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-3">
                            {/* Category toggle (only for free/premium) */}
                            {currentCategory !== 'internal' && (
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-xs ${
                                    currentCategory === 'free'
                                      ? 'font-semibold text-foreground'
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  Gratuit
                                </span>
                                <Switch
                                  id={`cat-${app.id}`}
                                  checked={currentCategory === 'premium'}
                                  onCheckedChange={() => toggleCategory(app.id)}
                                />
                                <span
                                  className={`text-xs ${
                                    currentCategory === 'premium'
                                      ? 'font-semibold text-foreground'
                                      : 'text-muted-foreground'
                                  }`}
                                >
                                  Premium
                                </span>
                              </div>
                            )}
                            {currentCategory === 'internal' && (
                              <span className="text-xs text-muted-foreground italic">Interne</span>
                            )}

                            {/* Status cycle button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cycleStatus(app.id)}
                              className="text-xs h-8 whitespace-nowrap"
                              title={`Passer en « ${STATUS_LABELS[statusNext]} »`}
                            >
                              <Wrench className="w-3 h-3 mr-1" />
                              {STATUS_LABELS[statusNext]}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Footer info ─────────────────────────────────────── */}
      <Alert>
        <Info className="w-4 h-4" />
        <AlertDescription className="text-sm text-muted-foreground">
          Les modifications sont automatiquement sauvegardées dans le stockage local du navigateur
          (clé <code className="text-xs bg-muted px-1 rounded">{STORAGE_KEY}</code>). Utilisez les
          boutons Exporter / Importer pour sauvegarder ou restaurer votre configuration.
          {overrideCount > 0 && (
            <span className="ml-1">
              <strong>{overrideCount}</strong> outil(s) modifié(s).
            </span>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
