import {
  Zap,
  MessageSquare,
  Settings,
  BookOpen,
  Activity,
  ShieldCheck,
  ArrowRight,
  Calculator,
  Camera,
  Brain,
  History,
  FileText,
  Key,
  BarChart3,
  Terminal,
  Cpu,
  Globe,
  Home,
  GraduationCap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

type Module = {
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  bg: string;
  path: string;
  category: 'ia' | 'expert' | 'admin' | 'tools';
  badge?: string;
};

const MODULES: Module[] = [
  // ─── IA CENTRAL ───
  {
    title: 'IA Central — Chat',
    description:
      'Assistant PROQUELEC unifié. Posez vos questions, générez du contenu, analysez des normes. Alimenté par Groq (Llama 3.3 70B).',
    icon: Brain,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    path: '/admin?tab=ai',
    category: 'ia',
    badge: 'Nouveau',
  },
  {
    title: 'Configuration des API',
    description:
      'Gérez vos clés et providers IA : Groq, OpenAI, Anthropic, Gemini, DeepSeek, Mistral, OpenRouter. Testez la connexion en direct.',
    icon: Key,
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
    path: '/expert/ai-providers',
    category: 'ia',
    badge: 'Recommandé',
  },
  {
    title: 'Chat Expert YEAI',
    description:
      "Assistant conversationnel dédié à l'électricité : normes NF C 15-100, dimensionnement, schémas et conseils techniques.",
    icon: MessageSquare,
    color: 'text-yeai-yellow',
    bg: 'bg-yeai-yellow/10',
    path: '/expert/chat',
    category: 'expert',
  },
  {
    title: 'Calculateurs Èlectriques',
    description:
      "Chute de tension, section de câble, loi d'Ohm, éclairage, convertisseur d'unités. Calculs certifiés PROQUELEC.",
    icon: Calculator,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    path: '/expert/calculators',
    category: 'tools',
  },
  {
    title: 'Scanner Photo — Conformité',
    description:
      "Audit visuel NF C 15-100 en temps réel. Capturez une installation et l'IA détecte les non-conformités.",
    icon: Camera,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    path: '/expert/scanner',
    category: 'tools',
    badge: 'Mobile',
  },
  {
    title: 'Normes & Documents',
    description:
      'Accès rapide aux fiches NF C 15-100, guides de calcul, abaques, mémentos téléchargeables et publications PROQUELEC.',
    icon: BookOpen,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    path: '/expert/docs',
    category: 'expert',
  },
  {
    title: 'Historique des Sessions',
    description:
      'Retrouvez toutes vos conversations, calculs et analyses IA. Filtrez, recherchez et exportez.',
    icon: History,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    path: '/expert/history',
    category: 'expert',
  },
  {
    title: 'Config Système Expert',
    description:
      "Norme active, moteur de calcul, température ambiante, paramètres avancés de l'assistant YEAI.",
    icon: Settings,
    color: 'text-slate-500',
    bg: 'bg-slate-500/10',
    path: '/expert/config',
    category: 'expert',
  },
  {
    title: 'Logs & Diagnostics',
    description:
      'Console des événements IA, historique des requêtes, diagnostic des providers, audit de performance.',
    icon: Terminal,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    path: '/expert/logs',
    category: 'expert',
  },
  {
    title: 'Clés API Développeur',
    description:
      "Gérez les clés d'accès pour vos intégrations externes : application mobile, API REST, webhooks.",
    icon: Key,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    path: '/expert/api-keys',
    category: 'expert',
  },
  {
    title: 'Documentation IA',
    description:
      "Inventaire des endpoints, modèles disponibles, guide d'utilisation du système d'intelligence artificielle PROQUELEC.",
    icon: FileText,
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
    path: '/expert/ia-docs',
    category: 'expert',
  },
  {
    title: 'Catalogue des Outils',
    description:
      "Plateforme d'ingénierie électrotechnique : 40 applications pour professionnels et grand public.",
    icon: Cpu,
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
    path: '/outils',
    category: 'tools',
  },
  {
    title: 'Dashboard Admin',
    description:
      'Pilotage global du site : utilisateurs, médiathèque, pages, événements, paiements, statistiques.',
    icon: BarChart3,
    color: 'text-blue-600',
    bg: 'bg-blue-600/10',
    path: '/admin',
    category: 'admin',
  },
  {
    title: 'Validations Partenaires',
    description:
      'Modérez les événements soumis par les partenaires. Approuvez ou refusez avec motif.',
    icon: ShieldCheck,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    path: '/admin?tab=event-moderation',
    category: 'admin',
    badge: '3 en attente',
  },
  {
    title: 'Agenda & Événements',
    description:
      'Calendrier public PROQUELEC : conférences, formations, ateliers. Inscrivez-vous aux événements.',
    icon: Zap,
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
    path: '/events',
    category: 'tools',
  },
  {
    title: 'Académie IA — KEBE',
    description:
      'Génération de formations assistée par IA, quiz normatifs, explorateur de normes, bibliothèque de ressources pédagogiques.',
    icon: GraduationCap,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    path: '/admin?tab=academy_ai',
    category: 'ia',
  },
];

const CATEGORIES: Record<
  string,
  { label: string; icon: React.FC<{ className?: string }>; color: string }
> = {
  ia: { label: 'IA Central', icon: Brain, color: 'text-orange-500' },
  expert: { label: 'Expert Lab', icon: Cpu, color: 'text-purple-500' },
  tools: { label: 'Outils & Applications', icon: Zap, color: 'text-green-500' },
  admin: { label: 'Administration', icon: Home, color: 'text-blue-600' },
};

export default function Index() {
  const navigate = useNavigate();

  const grouped = CATEGORIES;
  const modulesByCategory = {} as Record<string, Module[]>;
  for (const m of MODULES) {
    if (!modulesByCategory[m.category]) modulesByCategory[m.category] = [];
    modulesByCategory[m.category].push(m);
  }

  return (
    <div className="min-h-screen p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Badge
              variant="outline"
              className="text-[10px] px-2 py-0 uppercase tracking-widest text-muted-foreground"
            >
              Hub Central
            </Badge>
            <Badge className="bg-green-500/10 text-green-600 border-green-200 text-[10px] px-2 py-0">
              <Activity className="w-3 h-3 mr-1" /> 15 modules
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3">
            <Brain className="w-9 h-9 text-orange-500" />
            Intelligence Artificielle
            <span className="text-muted-foreground font-normal text-2xl">PROQUELEC</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Plateforme IA souveraine — Chat, outils, configuration et administration
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/admin?tab=ai')}
            className="bg-gradient-to-r from-orange-500 to-purple-600 hover:opacity-90 shadow-lg text-white gap-2"
          >
            <Brain className="w-4 h-4" />
            IA Central
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin')} className="gap-2">
            <Home className="w-4 h-4" />
            Dashboard
          </Button>
        </div>
      </div>

      {/* ─── STATS ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modules IA</CardTitle>
            <Brain className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MODULES.length}</div>
            <p className="text-xs text-muted-foreground">Chat, config, outils</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Providers</CardTitle>
            <Globe className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Groq</div>
            <p className="text-xs text-muted-foreground">Llama 3.3 70B Gratuit</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sécurité</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">NF C 15-100</div>
            <p className="text-xs text-muted-foreground">Conformité vérifiée</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statut</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Actif</div>
            <p className="text-xs text-muted-foreground">Service distant Groq</p>
          </CardContent>
        </Card>
      </div>

      {/* ─── MODULES PAR CATÉGORIE ─── */}
      {Object.entries(grouped).map(([catKey, cat]) => {
        const catModules = modulesByCategory[catKey] || [];
        const CatIcon = cat.icon;
        return (
          <div key={catKey}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CatIcon className={`w-5 h-5 ${cat.color}`} />
              {cat.label}
              <span className="text-xs font-normal text-muted-foreground ml-1">
                ({catModules.length} module{catModules.length > 1 ? 's' : ''})
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {catModules.map((module, index) => {
                const Icon = module.icon;
                return (
                  <Card
                    key={index}
                    className="group hover:border-primary/50 transition-all cursor-pointer hover:shadow-md border-border/60 relative overflow-hidden"
                    onClick={() => navigate(module.path)}
                  >
                    {module.badge && (
                      <Badge
                        className={`absolute top-3 right-3 text-[9px] px-2 py-0 font-bold uppercase tracking-wider ${
                          module.badge === 'Nouveau'
                            ? 'bg-orange-500 text-white'
                            : module.badge === 'Recommandé'
                              ? 'bg-cyan-500 text-white'
                              : module.badge.includes('en attente')
                                ? 'bg-amber-500 text-white'
                                : 'bg-blue-500 text-white'
                        }`}
                      >
                        {module.badge}
                      </Badge>
                    )}
                    <CardHeader className="pb-2">
                      <div
                        className={`w-11 h-11 rounded-xl ${module.bg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className={`w-5.5 h-5.5 ${module.color}`} />
                      </div>
                      <CardTitle className="text-base">{module.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {module.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ─── FOOTER NAV ─── */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-card border border-border rounded-xl mt-8">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-2">
          Accès rapide
        </span>
        <a
          href="/admin"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          Dashboard Admin
        </a>
        <a
          href="/admin?tab=ai"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 text-xs font-medium transition-colors"
        >
          <Brain className="w-3.5 h-3.5 text-orange-600" />
          IA Central
        </a>
        <a
          href="/expert/ai-providers"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-900/30 dark:hover:bg-cyan-900/50 text-xs font-medium transition-colors"
        >
          <Settings className="w-3.5 h-3.5 text-cyan-600" />
          Configurer les API
        </a>
        <a
          href="/events"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
          Calendrier public
        </a>
        <a
          href="/outils"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium transition-colors"
        >
          <Cpu className="w-3.5 h-3.5" />
          Catalogue d'outils
        </a>
      </div>
    </div>
  );
}
