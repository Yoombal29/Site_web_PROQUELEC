import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  FileText,
  GitBranch,
  PlayCircle,
  ShieldCheck,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  cmsCapabilities,
  cmsCapabilityChartData,
  cmsCapabilityRoadmap,
  cmsCapabilityStatusLabels,
  cmsCapabilitySummary,
  type CmsCapabilityStatus,
} from '@/data/cms-capabilities';
import { cn } from '@/lib/utils';

const statusStyles: Record<CmsCapabilityStatus, string> = {
  opérationnel: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  'à renforcer': 'border-amber-200 bg-amber-50 text-amber-700',
  'à connecter': 'border-blue-200 bg-blue-50 text-blue-700',
};

const priorityStyles = {
  Haute: 'border-red-200 bg-red-50 text-red-700',
  Moyenne: 'border-amber-200 bg-amber-50 text-amber-700',
  Basse: 'border-slate-200 bg-slate-50 text-slate-700',
};

const scripts = [
  {
    command: 'npm run cms:audit',
    title: 'Audit CMS',
    text: 'Vérifie design system, admin, templates, sécurité de base et catalogue outils.',
    icon: ShieldCheck,
  },
  {
    command: 'npm run cms:docs',
    title: 'Documentation',
    text: 'Génère le guide webmaster et les procédures de publication.',
    icon: FileText,
  },
  {
    command: 'npm run cms:slides',
    title: 'Slides',
    text: 'Produit un deck PowerPoint pour formation, bilan ou comité.',
    icon: PlayCircle,
  },
  {
    command: 'npm run test:e2e:cms',
    title: 'QA Playwright',
    text: 'Lance les smoke-tests ciblés CMS, admin, outils et Builder.',
    icon: ClipboardList,
  },
];

function getProgressTone(value: number) {
  if (value >= 80) return 'text-emerald-600';
  if (value >= 65) return 'text-amber-600';
  return 'text-red-600';
}

export default function CmsCapabilityCenter() {
  const highPriority = cmsCapabilities.filter((capability) => capability.priority === 'Haute');
  const freeReady = cmsCapabilities.filter(
    (capability) => capability.status === 'opérationnel' || capability.status === 'à renforcer',
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge className="mb-3 bg-blue-50 text-blue-700 hover:bg-blue-50">
            Centre de capacités CMS
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Exploiter gratuitement les outils utiles au CMS PROQUELEC
          </h2>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Cette page relie design, sécurité, tests, données, documentation et workflow Git aux
            actions concrètes du CMS. Les outils externes sont traités comme des méthodes :
            priorité aux briques déjà présentes dans le projet.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <a href="/docs/guide-admin-cms-proquelec.md" target="_blank" rel="noreferrer">
              Guide admin
            </a>
          </Button>
          <Button asChild>
            <a href="/admin?tab=tech-tools">
              Outils techniques
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Capacités</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black">{cmsCapabilitySummary.total}</p>
            <p className="mt-1 text-sm text-muted-foreground">familles couvertes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Opérationnelles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-emerald-600">
              {cmsCapabilitySummary.operational}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">utilisables tout de suite</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Priorité haute
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-red-600">{cmsCapabilitySummary.highPriority}</p>
            <p className="mt-1 text-sm text-muted-foreground">à surveiller avant VPS</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Maturité moyenne
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn('text-3xl font-black', getProgressTone(cmsCapabilitySummary.averageMaturity))}>
              {cmsCapabilitySummary.averageMaturity}%
            </p>
            <Progress value={cmsCapabilitySummary.averageMaturity} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      <Alert className="border-blue-200 bg-blue-50 text-blue-950">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Positionnement gratuit</AlertTitle>
        <AlertDescription>
          Les capacités ci-dessous ne dépendent pas d’un abonnement externe pour démarrer. Elles
          exploitent surtout le code local : design system, shadcn/Radix, Recharts, Playwright,
          Markdown, Git et pptxgenjs.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="priorites" className="space-y-6">
        <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-muted/60 p-2">
          <TabsTrigger value="priorites">Priorités</TabsTrigger>
          <TabsTrigger value="capacites">Capacités</TabsTrigger>
          <TabsTrigger value="gratuits">Usages gratuits</TabsTrigger>
          <TabsTrigger value="scripts">Automatisation</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="priorites" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
            <Card>
              <CardHeader>
                <CardTitle>Actions à traiter en premier</CardTitle>
                <CardDescription>
                  Les éléments critiques pour stabiliser l’administration, le Builder et la
                  publication.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {highPriority.map((capability) => {
                  const Icon = capability.icon;
                  return (
                    <article
                      key={capability.id}
                      className="rounded-lg border bg-background p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{capability.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {capability.recommendedAction}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <Badge variant="outline" className={statusStyles[capability.status]}>
                          {cmsCapabilityStatusLabels[capability.status]}
                        </Badge>
                        <span className={cn('text-sm font-black', getProgressTone(capability.maturity))}>
                          {capability.maturity}%
                        </span>
                      </div>
                    </article>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maturité par domaine</CardTitle>
                <CardDescription>Vue rapide des zones solides et des zones à renforcer.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cmsCapabilityChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="maturity" name="Maturité" fill="#2376df" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="capacites">
          <Card>
            <CardHeader>
              <CardTitle>Matrice complète</CardTitle>
              <CardDescription>
                Chaque ligne indique le bénéfice CMS, l’état actuel et l’action recommandée.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Outil</TableHead>
                    <TableHead>Domaine</TableHead>
                    <TableHead>Bénéfice CMS</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead>Maturité</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cmsCapabilities.map((capability) => (
                    <TableRow key={capability.id}>
                      <TableCell>
                        <div className="font-semibold">{capability.tools}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{capability.currentAsset}</div>
                      </TableCell>
                      <TableCell>{capability.category}</TableCell>
                      <TableCell className="max-w-md text-sm leading-6 text-muted-foreground">
                        {capability.benefit}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusStyles[capability.status]}>
                          {cmsCapabilityStatusLabels[capability.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={priorityStyles[capability.priority]}>
                          {capability.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={cn('font-black', getProgressTone(capability.maturity))}>
                          {capability.maturity}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gratuits" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {freeReady.map((capability) => {
            const Icon = capability.icon;
            return (
              <Card key={capability.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{capability.title}</CardTitle>
                      <CardDescription>{capability.tools}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted-foreground">{capability.freeUse}</p>
                  <div className="mt-4 space-y-2">
                    {capability.deliverables.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="scripts" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {scripts.map((script) => {
            const Icon = script.icon;
            return (
              <Card key={script.command}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{script.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <code className="rounded bg-slate-950 px-2 py-1 text-xs text-slate-100">
                    {script.command}
                  </code>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">{script.text}</p>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="roadmap" className="grid gap-4 lg:grid-cols-3">
          {cmsCapabilityRoadmap.map((phase) => (
            <Card key={phase.phase}>
              <CardHeader>
                <Badge variant="outline" className="w-fit">
                  {phase.phase}
                </Badge>
                <CardTitle>{phase.title}</CardTitle>
                <CardDescription>{phase.owner}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {phase.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <GitBranch className="h-4 w-4 text-blue-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Card className="border-slate-900 bg-slate-950 text-white">
        <CardContent className="p-6">
          <p className="text-sm font-black uppercase tracking-wide text-amber-300">
            Règle d’exploitation
          </p>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-300">
            Le CMS PROQUELEC doit d’abord utiliser les briques gratuites déjà disponibles dans le
            dépôt. Les services externes ne deviennent nécessaires que pour Figma, Notion, paiement
            international ou génération média avancée.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
