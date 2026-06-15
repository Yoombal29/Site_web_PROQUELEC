import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  MessageSquare,
  Activity,
  ShieldCheck,
  ArrowRight,
  Calculator,
  Brain,
  FileText,
  Cpu,
  Globe,
  Home,
  GraduationCap,
  MessageCircle,
  Crown,
  Search,
  RotateCcw,
  BadgeCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { useToolAnalytics } from '@/hooks/useToolAnalytics';
import { useUserRole } from '@/hooks/useUserRole';
import {
  freeApps,
  premiumApps,
  internalApps,
  appGroups,
  type ProquelecApp,
} from '@/data/applications-catalog';
import { getEffectiveCategory, getEffectiveStatus } from '@/lib/toolOverrides';


type Module = {
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  bg: string;
  path: string;
  badge?: string;
};

const IA_MODULES: Module[] = [
  {
    title: 'IA Central — Chat',
    description:
      'Assistant PROQUELEC unifié. Posez vos questions, générez du contenu, analysez des normes. Alimenté par Groq (Llama 3.3 70B).',
    icon: Brain,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    path: '/admin?tab=ai',
    badge: 'Nouveau',
  },
];

const EXPERT_MODULES: Module[] = [
  {
    title: 'Calculateurs Électriques',
    description:
      "Chute de tension, section de câble, loi d'Ohm, éclairage, convertisseur d'unités. Calculs certifiés PROQUELEC.",
    icon: Calculator,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    path: '/expert-lab/calculators',
  },
  {
    title: 'Schémas & Rubriques',
    description:
      "Éditeur visuel pour schémas unifilaires et multifilaires. Sélecteur de rubriques, bibliothèque de schémas normés.",
    icon: Zap,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    path: '/rubrique-selector',
  },
  {
    title: 'Normes & Documents',
    description:
      'Accès rapide aux fiches NF C 15-100, guides de calcul, abaques, mémentos téléchargeables et publications PROQUELEC.',
    icon: FileText,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    path: '/expert-lab/docs',
  },
  {
    title: 'Chat Expert YEAI',
    description:
      "Assistant conversationnel dédié à l'électricité : normes NF C 15-100, dimensionnement, schémas et conseils techniques.",
    icon: MessageSquare,
    color: 'text-yeai-yellow',
    bg: 'bg-yeai-yellow/10',
    path: '/expert-lab/chat',
  },
  {
    title: 'Assistant PROQUELEC',
    description:
      'Guide intelligent du site : calculs électriques, schémas, normes NF C 15-100, orientation dans le site.',
    icon: MessageCircle,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    path: '/expert-kebe',
    badge: 'Gratuit',
  },
  {
    title: 'Académie IA — KEBE',
    description:
      'Génération de formations assistée par IA, quiz normatifs, explorateur de normes, bibliothèque de ressources pédagogiques.',
    icon: GraduationCap,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    path: '/admin?tab=academy_ai',
  },
  {
    title: 'Catalogue d\'outils',
    description:
      'Parcourez les 40+ applications PROQUELEC : calculs, schémas, normes, diagnostics, devis. Recherche et filtres inclus.',
    icon: Cpu,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    path: '#catalogue-outils',
    badge: 'Complet',
  },
];

const publicCatalogApps = [...freeApps, ...premiumApps];
const fullCatalogApps = [...freeApps, ...premiumApps, ...internalApps];

type PageCategory = 'all' | 'ia' | 'expert' | 'gratuit' | 'premium';

export default function Index() {
  const navigate = useNavigate();
  const { hasPremium, isLoading: isLoadingPremium } = usePremiumAccess();
  const { trackEvent, getEvents } = useToolAnalytics();
  const { role } = useUserRole();
  const canViewInternalTools = role === 'admin' || role === 'superadmin' || role === 'secondary_admin';

  const [activeCategory, setActiveCategory] = useState<PageCategory>('all');
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  function applyOverrides(app: ProquelecApp): ProquelecApp {
    return {
      ...app,
      category: getEffectiveCategory(app.category, app.id),
      status: getEffectiveStatus(app.status, app.id),
    };
  }

  // Filter apps by category
  const filteredCatalogApps = useMemo(() => {
    const allApps = (canViewInternalTools ? fullCatalogApps : publicCatalogApps).map(applyOverrides);
    if (activeCategory === 'gratuit') return allApps.filter((a) => a.category === 'free');
    if (activeCategory === 'premium') return allApps.filter((a) => a.category === 'premium');
    if (activeCategory === 'all') return allApps;
    return [];
  }, [activeCategory, canViewInternalTools]);

  const catalogAppCounts = useMemo(() => {
    const all = (canViewInternalTools ? fullCatalogApps : publicCatalogApps).map(applyOverrides);
    return {
      free: all.filter((a) => a.category === 'free').length,
      premium: all.filter((a) => a.category === 'premium').length,
      internal: all.filter((a) => a.category === 'internal').length,
    };
  }, [canViewInternalTools]);

  const currentGroups = useMemo(() => {
    if (activeCategory === 'all') {
      const allGroups = new Set<string>();
      filteredCatalogApps.forEach((a) => allGroups.add(a.group));
      return Array.from(allGroups);
    }
    const key = activeCategory === 'gratuit' ? 'free' : activeCategory === 'premium' ? 'premium' : null;
    if (key) return appGroups[key as keyof typeof appGroups] || [];
    return [];
  }, [activeCategory, filteredCatalogApps]);

  const getSearchableApps = useMemo(() => {
    return filteredCatalogApps.filter((app) => {
      if (activeGroup) {
        return app.group === activeGroup;
      }
      return true;
    }).filter((app) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        app.title.toLowerCase().includes(q) ||
        app.description.toLowerCase().includes(q) ||
        app.group.toLowerCase().includes(q)
      );
    });
  }, [filteredCatalogApps, activeGroup, searchQuery]);

  // Recent tools
  const recentToolIds = useMemo(() => {
    const events = getEvents();
    const seen = new Set<string>();
    const recent: string[] = [];
    for (let i = events.length - 1; i >= 0; i--) {
      const e = events[i];
      if ((e.action === 'open' || e.action === 'demo_try') && !seen.has(e.toolId)) {
        seen.add(e.toolId);
        recent.push(e.toolId);
        if (recent.length >= 4) break;
      }
    }
    return recent;
  }, [getEvents]);

  const recentApps = useMemo(() => {
    const all = (canViewInternalTools ? fullCatalogApps : publicCatalogApps).map(applyOverrides);
    return recentToolIds
      .map((id) => all.find((a) => a.id === id))
      .filter(Boolean) as ProquelecApp[];
  }, [canViewInternalTools, recentToolIds]);

  const handleAppClick = (app: ProquelecApp) => {
    if (app.status === 'coming') {
      navigate(`/apps/${app.id}`);
      return;
    }

    if (app.category === 'premium' && !hasPremium && !isLoadingPremium) {
      trackEvent({ toolId: app.id, toolName: app.title, action: 'premium_blocked' });
      // Premium access required; navigation omitted.
      return;
    }

    trackEvent({ toolId: app.id, toolName: app.title, action: 'open' });

    switch (app.id) {
      case 'bibliotheque-documents':
        navigate('/documents');
        break;
      case 'schema-modulaire':
        navigate('/rubrique-selector');
        break;
      case 'proquelec-docs':
        navigate('/office/document/new');
        break;
      default:
        if (app.route && app.route !== '/outils' && app.route !== '/expert-lab') {
          navigate(app.route);
        } else {
          navigate(`/expert-lab/outils/${app.id}`);
        }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px] uppercase">
            Actif
          </Badge>
        );
      case 'coming':
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[9px] uppercase">
            Bientôt
          </Badge>
        );
      case 'development':
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[9px] uppercase">
            En Dev
          </Badge>
        );
      default:
        return null;
    }
  };

  const isCardInCurrentCategory = (app: ProquelecApp): boolean => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'gratuit') return app.category === 'free';
    if (activeCategory === 'premium') return app.category === 'premium';
    return false;
  };

  const handleModuleClick = (module: Module) => {
    if (module.path.startsWith('#')) {
      const el = document.getElementById(module.path.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    navigate(module.path);
  };

  return (
    <div className="min-h-screen bg-[#111827] text-slate-100">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden border-b border-white/10 bg-[#111827] py-8 md:py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge
                    variant="outline"
                    className="text-[10px] px-2 py-0 uppercase tracking-widest text-slate-400 border-slate-600"
                  >
                    Hub Central
                  </Badge>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] px-2 py-0">
                    <Activity className="w-3 h-3 mr-1" />
                    {IA_MODULES.length + EXPERT_MODULES.length + (canViewInternalTools ? fullCatalogApps.length : publicCatalogApps.length)} ressources
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-4xl font-black flex items-center gap-3">
                  <Brain className="w-9 h-9 text-orange-400" />
                  Intelligence Artificielle
                  <span className="text-slate-400 font-normal text-2xl">PROQUELEC</span>
                </h1>
                <p className="text-slate-400 mt-1 text-lg">
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
                <Button variant="outline" onClick={() => navigate('/admin')} className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-800">
                  <Home className="w-4 h-4" />
                  Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="border-b border-white/5 bg-[#0f1729] py-6">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-emerald-900/10 border-emerald-800/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Modules Expert</CardTitle>
                <Cpu className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{IA_MODULES.length + EXPERT_MODULES.length}</div>
                <p className="text-xs text-slate-500">IA + Applications pro</p>
              </CardContent>
            </Card>
            <Card className="bg-emerald-900/10 border-emerald-800/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Outils Gratuits</CardTitle>
                <Globe className="h-4 w-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{catalogAppCounts.free}</div>
                <p className="text-xs text-slate-500">Grand Public</p>
              </CardContent>
            </Card>
            <Card className="bg-emerald-900/10 border-emerald-800/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Outils Premium</CardTitle>
                <Crown className="h-4 w-4 text-amber-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{catalogAppCounts.premium}</div>
                <p className="text-xs text-slate-500">Professionnels</p>
              </CardContent>
            </Card>
            <Card className="bg-emerald-900/10 border-emerald-800/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Statut</CardTitle>
                <Activity className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">Actif</div>
                <p className="text-xs text-slate-500">Service distant Groq</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── ZONE DE RENDU : HUB OU OUTIL ─── */}
      <section className="py-8 md:py-12 container mx-auto px-4 md:px-6">
        
          {/* ─── CATEGORY TABS ─── */}
            <div className="flex flex-col gap-6 mb-8">
              <div className="flex w-full sm:w-auto bg-emerald-900/30 p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-emerald-800/30 overflow-x-auto">
                <button
                  onClick={() => { setActiveCategory('all'); setActiveGroup(null); }}
                  className={`flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap ${activeCategory === 'all' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  <Cpu className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  TOUT
                </button>
                <button
                  onClick={() => { setActiveCategory('ia'); setActiveGroup(null); }}
                  className={`flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap ${activeCategory === 'ia' ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  <Brain className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  IA CENTRAL
                </button>
                <button
                  onClick={() => { setActiveCategory('expert'); setActiveGroup(null); }}
                  className={`flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap ${activeCategory === 'expert' ? 'bg-purple-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  <Zap className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  EXPERT LAB
                </button>
                <button
                  onClick={() => { setActiveCategory('gratuit'); setActiveGroup(null); }}
                  className={`flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap ${activeCategory === 'gratuit' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  <Globe className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  GRATUIT
                </button>
                <button
                  onClick={() => { setActiveCategory('premium'); setActiveGroup(null); }}
                  className={`flex-1 sm:flex-none px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-1.5 md:gap-2 whitespace-nowrap ${activeCategory === 'premium' ? 'bg-amber-400 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  <Crown className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  PREMIUM
                  {canViewInternalTools && (
                    <span className="ml-1 text-[9px] opacity-60">+{catalogAppCounts.internal} int.</span>
                  )}
                </button>
              </div>

              {/* Search bar (visible for catalog categories) */}
              {(activeCategory === 'all' || activeCategory === 'gratuit' || activeCategory === 'premium') && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Rechercher un outil..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-800/50 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition"
                  />
                </div>
              )}

              {/* Group filters (for catalog) */}
              {(activeCategory === 'all' || activeCategory === 'gratuit' || activeCategory === 'premium') && currentGroups.length > 0 && (
                <div className="flex flex-wrap gap-1.5 md:gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                  <button
                    onClick={() => setActiveGroup(null)}
                    className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${!activeGroup ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white bg-slate-800/50'}`}
                  >
                    Tous
                  </button>
                  {currentGroups.map((group) => (
                    <button
                      key={group}
                      onClick={() => setActiveGroup(group === activeGroup ? null : group)}
                      className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${activeGroup === group ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white bg-slate-800/50'}`}
                    >
                      {group}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Recent tools */}
            {(activeCategory === 'all' || activeCategory === 'gratuit' || activeCategory === 'premium') && recentApps.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Récemment utilisés
                </h3>
                <div className="flex flex-wrap gap-3">
                  {recentApps.map((app) => (
                    <button
                      key={app.id}
                      onClick={() => handleAppClick(app)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all text-sm font-medium text-emerald-300"
                    >
                      {app.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ─── IA CENTRAL MODULES ─── */}
            {(activeCategory === 'all' || activeCategory === 'ia') && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-orange-400" />
                  IA Central
                  <span className="text-xs font-normal text-slate-500 ml-1">
                    ({IA_MODULES.length} module{IA_MODULES.length > 1 ? 's' : ''})
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {IA_MODULES.map((module, index) => {
                    const Icon = module.icon;
                    return (
                      <Card
                        key={index}
                        className="group bg-[#0d2a21]/40 border-emerald-900/40 hover:border-orange-500/40 active:border-orange-500/60 rounded-2xl shadow-xl transition-all duration-300 overflow-hidden relative cursor-pointer"
                        onClick={() => handleModuleClick(module)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        {module.badge && (
                          <Badge
                            className={`absolute top-3 right-3 text-[9px] px-2 py-0 font-bold uppercase tracking-wider ${
                              module.badge === 'Nouveau'
                                ? 'bg-orange-500 text-white'
                                : module.badge === 'Recommandé'
                                  ? 'bg-cyan-500 text-white'
                                  : module.badge === 'Mobile'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-amber-500 text-white'
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
                          <CardTitle className="text-base text-white">{module.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                            {module.description}
                          </p>
                        </CardContent>
                        <div className="px-4 pb-4 pt-0">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-orange-400 group-hover:gap-2 transition-all">
                            Accéder
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── EXPERT LAB MODULES ─── */}
            {(activeCategory === 'all' || activeCategory === 'expert') && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  Suite d'applications professionnelles
                  <span className="text-xs font-normal text-slate-500 ml-1">
                    ({EXPERT_MODULES.length} module{EXPERT_MODULES.length > 1 ? 's' : ''})
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {EXPERT_MODULES.map((module, index) => {
                    const Icon = module.icon;
                    return (
                      <Card
                        key={index}
                        className="group bg-[#0d2a21]/40 border-emerald-900/40 hover:border-purple-500/40 active:border-purple-500/60 rounded-2xl shadow-xl transition-all duration-300 overflow-hidden relative cursor-pointer"
                        onClick={() => handleModuleClick(module)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        {module.badge && (
                          <Badge
                            className={`absolute top-3 right-3 text-[9px] px-2 py-0 font-bold uppercase tracking-wider ${
                              module.badge === 'Nouveau'
                                ? 'bg-orange-500 text-white'
                                : module.badge === 'Mobile'
                                  ? 'bg-blue-500 text-white'
                                  : module.badge === 'Complet'
                                    ? 'bg-pink-500 text-white'
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
                          <CardTitle className="text-base text-white">{module.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                            {module.description}
                          </p>
                        </CardContent>
                        <div className="px-4 pb-4 pt-0">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-purple-400 group-hover:gap-2 transition-all">
                            Accéder
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── OUTILS CATALOG ─── */}
            {(activeCategory === 'all' || activeCategory === 'gratuit' || activeCategory === 'premium') && (
              <div id="catalogue-outils" className="mb-10">
                {activeCategory === 'all' && (
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-emerald-400" />
                    Catalogue d'outils
                    <span className="text-xs font-normal text-slate-500 ml-1">
                      ({getSearchableApps.length} outil{getSearchableApps.length > 1 ? 's' : ''})
                    </span>
                  </h2>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {getSearchableApps.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <p className="text-slate-500 text-sm">Aucun outil trouvé pour cette recherche.</p>
                    </div>
                  ) : (
                    getSearchableApps.map((app) => (
                      <Card
                        key={app.id}
                        onClick={() => handleAppClick(app)}
                        className={`group bg-[#0d2a21]/40 border-emerald-900/40 hover:border-emerald-500/40 active:border-emerald-500/60 rounded-2xl md:rounded-[2rem] shadow-xl transition-all duration-300 md:duration-500 overflow-hidden relative cursor-pointer touch-manipulation ${app.status === 'coming' ? 'opacity-70' : ''}`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        {app.category === 'premium' && (
                          <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-amber-500/90 text-[10px] font-black uppercase tracking-wider text-slate-900 px-2 py-1 rounded-full shadow-lg shadow-amber-500/20">
                            <Crown className="w-3 h-3" />
                            PREMIUM
                          </div>
                        )}

                        {app.category === 'premium' && activeCategory !== 'premium' && (
                          <div className="absolute inset-0 z-10 bg-[#071914]/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[2rem] flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-12 h-12 mx-auto bg-amber-400/20 rounded-full flex items-center justify-center mb-2">
                                <Crown className="w-6 h-6 text-amber-400" />
                              </div>
                              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                                Abonnement requis
                              </span>
                            </div>
                          </div>
                        )}

                        <CardContent className="p-4 md:p-6 relative z-10 flex flex-col h-full min-h-[220px] md:min-h-[280px]">
                          <div className="flex items-start justify-between mb-3 md:mb-4">
                            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 ${app.category === 'premium' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                              <app.icon className={`w-5 h-5 md:w-6 md:h-6 ${app.category === 'premium' ? 'text-amber-400' : 'text-emerald-400'}`} />
                            </div>
                            {getStatusBadge(app.status)}
                          </div>

                          <div className="mb-2 md:mb-3">
{app.norme && (
  <span className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-emerald-500/60 block mb-0.5 md:mb-1">
    {app.norme}
  </span>
)}

                            <h3 className="text-base md:text-lg font-black text-white group-hover:text-emerald-300 transition-colors leading-tight">
                              {app.title}
                            </h3>
                          </div>

                          <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed flex-1 line-clamp-3 md:line-clamp-none">
                            {app.description}
                          </p>

                          <div className="mt-3 md:mt-4 pt-3 md:pt-4 flex items-center justify-between border-t border-emerald-900/50">
                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              {app.group}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                              {app.status === 'coming' ? 'Bientôt' : 'Accéder'}
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ─── COUNTER ─── */}
            {(activeCategory === 'all' || activeCategory === 'gratuit' || activeCategory === 'premium') && getSearchableApps.length > 0 && (
              <div className="mt-8 text-center">
                <p className="text-slate-500 text-sm">
                  <span className="text-emerald-400 font-bold">
                    {getSearchableApps.filter((a) => a.status === 'active').length}
                  </span>{' '}
                  actives •
                  <span className="text-amber-400 font-bold ml-2">
                    {getSearchableApps.filter((a) => a.status === 'coming').length}
                  </span>{' '}
                  en développement
                </p>
              </div>
            )}

      </section>

      {/* ─── CHARTER SECTION ─── */}
      <section className="bg-emerald-500/5 border-y border-emerald-900/50 py-10 md:py-16 mt-4">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12">
            <div className="space-y-2 md:space-y-4">
              <div className="p-2 md:p-3 bg-emerald-500/20 w-fit rounded-lg md:rounded-xl border border-emerald-500/30">
                <BadgeCheck className="text-emerald-400 w-4 h-4 md:w-6 md:h-6" />
              </div>
              <h4 className="font-black text-sm md:text-lg text-white">{(canViewInternalTools ? fullCatalogApps : publicCatalogApps).length} Applications</h4>
              <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                Catalogue complet d'outils pour électriciens et grand public.
              </p>
            </div>
            <div className="space-y-2 md:space-y-4">
              <div className="p-2 md:p-3 bg-blue-500/20 w-fit rounded-lg md:rounded-xl border border-blue-500/30">
                <Brain className="text-blue-400 w-4 h-4 md:w-6 md:h-6" />
              </div>
              <h4 className="font-black text-sm md:text-lg text-white">IA Subordonnée</h4>
              <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                Notre IA cite la norme, l'article et le chapitre.
              </p>
            </div>
            <div className="space-y-2 md:space-y-4">
              <div className="p-2 md:p-3 bg-amber-500/20 w-fit rounded-lg md:rounded-xl border border-amber-500/30">
                <ShieldCheck className="text-amber-400 w-4 h-4 md:w-6 md:h-6" />
              </div>
              <h4 className="font-black text-sm md:text-lg text-white">Sécurité Humaine</h4>
              <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                Calculs certifiants réservés aux professionnels.
              </p>
            </div>
            <div className="space-y-2 md:space-y-4">
              <div className="p-2 md:p-3 bg-slate-500/20 w-fit rounded-lg md:rounded-xl border border-slate-500/30">
                <FileText className="text-slate-400 w-4 h-4 md:w-6 md:h-6" />
              </div>
              <h4 className="font-black text-sm md:text-lg text-white">Souveraineté</h4>
              <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                Toutes les données restent au Sénégal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── QUICK ACCESS FOOTER ─── */}
      <section className="py-6 container mx-auto px-4 md:px-6">
        <div className="flex flex-wrap items-center gap-3 p-4 bg-[#0f1729] border border-slate-800 rounded-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
            Accès rapide
          </span>
          <a
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium transition-colors text-slate-300"
          >
            <Home className="w-3.5 h-3.5" />
            Dashboard Admin
          </a>
          <a
            href="/admin?tab=ai"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-orange-900/30 hover:bg-orange-900/50 text-xs font-medium transition-colors text-orange-300"
          >
            <Brain className="w-3.5 h-3.5" />
            IA Central
          </a>
          <a
            href="/expert-lab/chat"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-900/30 hover:bg-emerald-900/50 text-xs font-medium transition-colors text-emerald-300"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Chat Expert
          </a>
          <a
            href="/expert-lab/calculators"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium transition-colors text-slate-300"
          >
            <Calculator className="w-3.5 h-3.5" />
            Calculateurs
          </a>
          <a
            href="/expert-lab/kebe"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-900/30 hover:bg-blue-900/50 text-xs font-medium transition-colors text-blue-300"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Assistant KEBE
          </a>
        </div>
      </section>
    </div>
  );
}
