import {
  Zap,
  Activity,
  ShieldCheck,
  FileText,
  Binary,
  BarChart3,
  History,
  Terminal,
  Camera,
  ArrowRight,
  RefreshCw,
  Bot,
  Key,
  FileCode,
  Calculator,
  Layers,
  GraduationCap,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api-client';

interface DashboardStats {
  totalAiRequests: number;
  totalDocuments: number;
}

const ADMIN_MODULES = [
  {
    title: 'Configuration des API',
    description:
      'Gérez les clés et providers IA : Groq, OpenAI, Anthropic, Gemini, DeepSeek, Mistral et OpenRouter.',
    icon: Key,
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    path: '/expert/ai-providers',
    badge: 'Admin',
  },
  {
    title: 'Dashboard Admin',
    description:
      'Pilotage global du site : utilisateurs, médiathèque, pages, événements, paiements, statistiques.',
    icon: BarChart3,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    path: '/admin',
  },
  {
    title: 'Validations Partenaires',
    description:
      'Modérez les événements soumis par les partenaires. Approuvez ou refusez avec motif.',
    icon: ShieldCheck,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    path: '/admin?tab=event-moderation',
    badge: 'À traiter',
  },
  {
    title: 'Historique des Sessions',
    description:
      'Retrouvez toutes vos conversations, calculs et analyses IA. Filtrez, recherchez et exportez.',
    icon: History,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    path: '/expert/history',
  },
  {
    title: 'Config Système Expert',
    description:
      "Norme active, moteur de calcul, température ambiante, paramètres avancés de l'assistant YEAI.",
    icon: Settings,
    color: 'text-slate-500',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    path: '/expert/config',
  },
  {
    title: 'Logs & Diagnostics',
    description:
      'Console des événements IA, historique des requêtes, diagnostic des providers, audit de performance.',
    icon: Terminal,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    path: '/expert/logs',
  },
  {
    title: 'Scanner Photo — Conformité',
    description:
      "Audit visuel NS 01-001 en temps réel. Capturez une installation et l'IA détecte les non-conformités.",
    icon: Camera,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    path: '/expert/scanner',
    badge: 'Mobile',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLaunching, setIsLaunching] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({ totalAiRequests: 0, totalDocuments: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await apiFetch<DashboardStats>('/api/admin/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    }
  };

  const handleLaunchTechnicalSuite = () => {
    setIsLaunching(true);
    toast({
      title: 'Initialisation',
      description: "Chargement de l'environnement expert...",
    });

    setTimeout(() => {
      navigate('/expert-lab/chat');
    }, 800);
  };


  return (
    <div className="min-h-screen bg-background relative overflow-hidden animate-in fade-in duration-700">
      <div className="absolute inset-0 z-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_hsl(var(--primary))_0%,_transparent_70%)]"></div>
      </div>

      <div className="relative z-10 p-6 lg:p-10 space-y-10 max-w-7xl mx-auto">
        {/* BARRE DE STATUT SUPÉRIEURE */}
        <div className="flex items-center justify-between border-b border-border pb-8">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">
                OUTILS_<span className="text-primary">ADMIN</span>{' '}
                <span className="text-[10px] uppercase font-bold opacity-30 mt-1 ml-2 tracking-widest text-muted-foreground">
                  Console de Gestion Souveraine
                </span>
              </h1>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">
                    Services Opérationnels
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={handleLaunchTechnicalSuite}
              disabled={isLaunching}
              size="lg"
              className="px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase shadow-md transition-all active:scale-95 disabled:opacity-70"
            >
              {isLaunching ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : null}
              {isLaunching ? 'Connexion...' : 'Ouvrir les outils'}
            </Button>
          </div>
        </div>

        {/* MÉTRIQUES PRINCIPALES (NAVIGABLES) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Custom Interactive Cards using Dashboard Data */}
          <Card
            className="hover:border-primary/40 transition-all group overflow-hidden border-border bg-card/50 cursor-pointer"
            onClick={() => navigate('/expert-lab/docs')}
          >
            <CardHeader className="p-4 pb-0">
              <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                <FileText className="w-3 h-3 text-primary/40 group-hover:text-primary" /> Documents
                GED
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-2 overflow-hidden">
              <p className="text-3xl font-bold tracking-tight text-indigo-400">
                {stats.totalDocuments}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[9px] uppercase font-medium opacity-40">
                  fichiers archivés
                </span>
                <Activity className="w-3 h-3 opacity-20 group-hover:opacity-100 transition-opacity" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/40 transition-all group overflow-hidden border-border bg-card/50">
            <CardHeader className="p-4 pb-0">
              <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-primary/40" /> Souveraineté
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-2 overflow-hidden">
              <p className="text-3xl font-bold tracking-tight text-primary">100%</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[9px] uppercase font-medium opacity-40">
                  Local Handshake OK
                </span>
                <ShieldCheck className="w-3 h-3 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/40 transition-all group overflow-hidden border-border bg-card/50">
            <CardHeader className="p-4 pb-0">
              <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-2">
                <Activity className="w-3 h-3 text-primary/40" /> Statut Serveur
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-2 overflow-hidden">
              <p className="text-3xl font-bold tracking-tight text-emerald-600">ONLINE</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[9px] uppercase font-medium opacity-40">
                  Proquelec-Core v7.4
                </span>
                <Activity className="w-3 h-3 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card
            className="hover:border-primary/40 transition-all group overflow-hidden border-border bg-card/50 cursor-pointer"
            onClick={() => navigate('/expert-lab/chat')}
          >
            <CardHeader className="p-4 pb-0">
              <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-2 group-hover:text-primary transition-colors">
                <RefreshCw className="w-3 h-3 text-primary/40 group-hover:text-primary" /> Requêtes
                IA
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-2 overflow-hidden">
              <p className="text-3xl font-bold tracking-tight text-cyan-400">
                {stats.totalAiRequests}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[9px] uppercase font-medium opacity-40">
                  Analyses Générées
                </span>
                <Activity className="w-3 h-3 opacity-20 group-hover:opacity-100 transition-opacity" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── OUTILS ADMIN ─── */}
        <div className="space-y-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div className="space-y-1">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-500/80">
                Outils Administration
              </h2>
              <p className="text-[11px] text-muted-foreground uppercase font-medium">
                Les outils réservés aux administrateurs sont centralisés ici.
              </p>
            </div>
            <Badge variant="outline" className="w-fit text-[9px] border-blue-500/30 text-blue-500 uppercase tracking-wider">
              {ADMIN_MODULES.length} modules
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {ADMIN_MODULES.map((module) => {
              const ModuleIcon = module.icon;

              return (
                <Card
                  key={module.title}
                  className={`group relative overflow-hidden cursor-pointer border ${module.border} bg-card/50 hover:border-primary/40 transition-all`}
                  onClick={() => navigate(module.path)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  {module.badge && (
                    <Badge className="absolute right-4 top-4 bg-primary text-primary-foreground text-[8px] uppercase tracking-wider">
                      {module.badge}
                    </Badge>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3 pr-20">
                      <div
                        className={`w-11 h-11 rounded-xl ${module.bg} flex shrink-0 items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                      >
                        <ModuleIcon className={`w-5 h-5 ${module.color}`} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold uppercase tracking-tight text-foreground">
                          {module.title}
                        </h3>
                        <p className="mt-1 text-[10px] font-semibold uppercase text-muted-foreground">
                          Accès administration
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3">
                      {module.description}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-primary group-hover:gap-2 transition-all">
                      Ouvrir
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* ─── AGENTS IA SPÉCIALISÉS ─── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-purple-500/80">
                Agents IA Spécialisés
              </h2>
              <p className="text-[11px] text-muted-foreground uppercase font-medium">
                Système multi-agents avec RAG interne souverain — remplace l'ancien Centre de Commandement IA.
              </p>
            </div>
            <Badge variant="outline" className="text-[9px] border-purple-500/30 text-purple-400 uppercase tracking-wider">
              v2.0 — Cortex
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: 'Agent Calculateur Électrique Certifié',
                role: 'Expert en Calculs Électriques Normatifs',
                description: 'Effectue des calculs électriques précis (chute de tension, section, protection) selon la NS 01-001. Validation croisée avec Agent Auditeur Normatif.',
                icon: Calculator,
                color: 'text-green-500',
                bg: 'bg-green-500/10',
                border: 'border-green-500/20',
                engine: 'Gemini Pro / GPT-4o',
                access: 'admin, partner, user',
                route: '/expert-lab/calculators',
              },
              {
                name: 'Agent Concepteur Schémas',
                role: 'Architecte de Schémas Électriques (Mermaid)',
                description: 'Génère des schémas unifilaires au format Mermaid avec export vers DWG/PDF. Bibliothèque de composants réutilisables.',
                icon: Layers,
                color: 'text-orange-500',
                bg: 'bg-orange-500/10',
                border: 'border-orange-500/20',
                engine: 'GPT-4o / Gemini Pro',
                access: 'admin, partner',
                route: '/expert-lab/schemas',
              },
              {
                name: 'Agent Auditeur Normatif',
                role: 'Expert en Interprétation Normative NS 01-001',
                description: 'Mode d\'audit complet avec checklist NS 01-001. Interprétation normes, détection non-conformités. Intégration mises à jour normatives.',
                icon: ShieldCheck,
                color: 'text-blue-500',
                bg: 'bg-blue-500/10',
                border: 'border-blue-500/20',
                engine: 'Gemini Pro / GPT-4o',
                access: 'admin, partner',
                route: '/expert-lab/docs',
              },
              {
                name: 'Agent Rédacteur Certification',
                role: 'Rédacteur de Rapports de Certification',
                description: 'Génère des rapports certifiables avec templates personnalisables, signature numérique et certification.',
                icon: FileText,
                color: 'text-indigo-500',
                bg: 'bg-indigo-500/10',
                border: 'border-indigo-500/20',
                engine: 'Gemini Pro / GPT-4o',
                access: 'admin',
                route: '/expert-lab/chat',
              },
              {
                name: 'Agent Formateur Technique',
                role: 'Consultant Pédagogique en Électricité',
                description: 'Quiz interactifs et évaluations. Parcours personnalisés par niveau. Explications pédagogiques adaptées.',
                icon: GraduationCap,
                color: 'text-emerald-500',
                bg: 'bg-emerald-500/10',
                border: 'border-emerald-500/20',
                engine: 'Gemini Pro',
                access: 'admin, partner, user',
                route: '/expert-lab/docs',
              },
              {
                name: 'Agent GED Administratif',
                role: 'Document Controller & Assistant Administratif',
                description: 'Gère l\'intelligence documentaire avec workflow d\'approbation et versioning. Intégration GED.',
                icon: Settings,
                color: 'text-slate-500',
                bg: 'bg-slate-500/10',
                border: 'border-slate-500/20',
                engine: 'Gemini Pro',
                access: 'admin',
                route: '/expert/config',
              },
              {
                name: 'Agent Orchestrateur Site',
                role: 'Guide & Accompagnant du Site PROQUELEC',
                description: 'Orchestrateur général avec tableau de bord analytique. Intégration avec tous les agents. Navigation site, actions, support vocal.',
                icon: BarChart3,
                color: 'text-pink-500',
                bg: 'bg-pink-500/10',
                border: 'border-pink-500/20',
                engine: 'Gemini Pro',
                access: 'admin',
                route: '/expert-lab/chat',
              },
            ].map((agent, index) => {
              const AgentIcon = agent.icon;
              return (
                <Card
                  key={index}
                  className={`group hover:border-primary/50 transition-all border ${agent.border} bg-card/40 relative overflow-hidden cursor-pointer`}
                  onClick={() => navigate(agent.route)}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/[0.02] to-transparent pointer-events-none" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl ${agent.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                      >
                        <AgentIcon className={`w-5 h-5 ${agent.color}`} />
                      </div>
                      <div>
                        <CardDescription className="text-xs font-bold text-foreground">
                          {agent.name}
                        </CardDescription>
                        <p className="text-[9px] text-muted-foreground uppercase font-semibold">
                          {agent.role}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                      {agent.description}
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <Badge variant="outline" className="text-[8px] px-2 py-0">
                        {agent.engine}
                      </Badge>
                      <Badge variant="secondary" className="text-[8px] px-2 py-0">
                        {agent.access}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SANTÉ SYSTÈME & AUDIT */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-1">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
                Activités Récentes & Audit
              </h2>
              <p className="text-[11px] text-muted-foreground uppercase font-medium">
                Suivi en temps réel des interactions avec la base normative et l'IA.
              </p>
            </div>
            <Card className="border-border bg-card/50 overflow-hidden">
              <div className="p-4 border-b border-border bg-secondary/30 flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-primary">
                  Journal des Événements
                </span>
                <Badge
                  variant="outline"
                  className="text-[8px] border-primary/20 text-primary uppercase"
                >
                  Direct
                </Badge>
              </div>
              <div className="p-6 space-y-4 text-xs font-medium uppercase">
                {[
                  {
                    time: '09:42',
                    log: 'Analyse Normative: Titre 4 - Protections [COMPLÉTÉ]',
                    type: 'success',
                  },
                  {
                    time: '09:38',
                    log: 'Mise à jour Base de Connaissances NS 01-001 v2.0',
                    type: 'info',
                  },
                  {
                    time: '09:12',
                    log: 'Alerte: Requête hors périmètre technique bloquée',
                    type: 'warning',
                  },
                  { time: '08:55', log: 'Handshake API IA : Session Authentifiée', type: 'info' },
                ].map((l, i) => (
                  <div
                    key={i}
                    className="flex gap-4 items-center border-b border-border pb-2 last:border-0 opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <span className="text-primary font-bold">[{l.time}]</span>
                    <span className={l.type === 'warning' ? 'text-amber-600' : 'text-foreground'}>
                      {l.log}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card
                onClick={() => navigate('/expert/ai-providers')}
                className="p-6 bg-primary/5 border-border hover:border-primary/20 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-tight">Configuration IA</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">
                      Gestion des modèles et clés API
                    </p>
                  </div>
                </div>
              </Card>
              <Card
                onClick={() => navigate('/expert/logs')}
                className="p-6 bg-emerald-500/5 border-border hover:border-emerald-500/20 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-tight">Logs Techniques</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">
                      Historique des calculs et audits
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* TÉLÉMÉTRIE & CONSTANTES SYSTÈME */}
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">
                Paramètres Experts
              </h2>
              <p className="text-[11px] text-muted-foreground uppercase font-medium">
                Constantes normatives injectées dans les calculs.
              </p>
            </div>

            <Card className="border-border bg-card/50 p-1 relative overflow-hidden">
              <div className="p-6 space-y-6">
                {[
                  {
                    label: 'Tension Nominale',
                    value: '230V / 400V',
                    icon: Activity,
                    color: 'text-primary',
                  },
                  {
                    label: 'Température Réf.',
                    value: '30°C UTE',
                    icon: Binary,
                    color: 'text-primary',
                  },
                  {
                    label: 'Standard de Calcul',
                    value: 'UTE C 15-105',
                    icon: Zap,
                    color: 'text-primary',
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-1 border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase opacity-60">
                      <item.icon className="w-3 h-3" /> {item.label}
                    </div>
                    <p className={`text-xl font-bold ${item.color || 'text-foreground'}`}>
                      {item.value}
                    </p>
                  </div>
                ))}

                <div className="pt-4">
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-4">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                    <div>
                      <p className="text-[10px] font-bold uppercase text-emerald-600">
                        Sécurité Active
                      </p>
                      <p className="text-[9px] text-muted-foreground font-medium">
                        Handshake Base de Données OK
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* PIED DE PAGE SYSTÈME */}
        <div className="flex flex-col md:flex-row justify-between items-center text-[9px] uppercase font-bold tracking-[0.2em] opacity-30 pt-10 border-t border-border">
          <span>Outils Admin v7.5 // PROQUELEC INDUSTRIAL</span>
          <div className="flex gap-6">
            <span>Environnement Sécurisé</span>
            <span>Uptime Stable</span>
            <span>Souveraineté Validée</span>
          </div>
        </div>
      </div>
    </div>
  );
}
