import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  ShieldCheck,
  FileText,
  RotateCcw,
  Crown,
  Globe,
  Search,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import YEAISenegal from '@/components/tools/YEAISenegal';
import VoltageDropCalculator from '@/components/tools/VoltageDropCalculator';
import ConsumptionCalculator from '@/components/tools/ConsumptionCalculator';
import CableSizingTool from '@/components/tools/CableSizingTool';
import SolarSizingTool from '@/components/tools/SolarSizingTool';
import SafetyDiagnostic from '@/components/tools/SafetyDiagnostic';
import SafetyChecklist from '@/components/tools/SafetyChecklist';
import QuoteGenerator from '@/components/tools/QuoteGenerator';
import LabelRequestForm from '@/components/tools/LabelRequestForm';
import GroundingGuide from '@/components/tools/GroundingGuide';
import NormativeDatabase from '@/components/tools/NormativeDatabase';
import FAQNormes from '@/components/tools/FAQNormes';
import GlossaireElectrique from '@/components/tools/GlossaireElectrique';
import PremiumPaywall from '@/components/tools/PremiumPaywall';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { useToolAnalytics } from '@/hooks/useToolAnalytics';
import { useUserRole } from '@/hooks/useUserRole';
import EarthResistanceChecker from '@/components/tools/EarthResistanceChecker';
import ElectricalUnitConverter from '@/components/tools/ElectricalUnitConverter';
import LightingCalculator from '@/components/tools/LightingCalculator';
import OperationalToolSuite, { hasOperationalTool } from '@/components/tools/OperationalToolSuite';
import SauvegardeToolsExperience from '@/components/tools/SauvegardeToolsExperience';
import {
  freeApps,
  premiumApps,
  internalApps,
  appGroups,
  type AppCategory,
  type ProquelecApp,
} from '@/data/applications-catalog';
import { getEffectiveCategory, getEffectiveStatus } from '@/lib/toolOverrides';
import { useGlobalHeader } from '@/components/MainLayout';

const publicCatalogApps = [...freeApps, ...premiumApps];
const fullCatalogApps = [...freeApps, ...premiumApps, ...internalApps];

/**
 * TOOLS PLATFORM - HUB D'INGÉNIERIE SOUVERAIN
 * Design : Emeraude Profond (Yoombal style)
 * Doctrine : Subordination Normative Totale
 */
export default function ToolsPlatform() {
  useGlobalHeader().setHide(true);
  const navigate = useNavigate();
  const { hasPremium, isLoading: isLoadingPremium } = usePremiumAccess();
  const { trackEvent, getEvents } = useToolAnalytics();
  const { role } = useUserRole();
  const canViewInternalTools = role === 'admin' || role === 'superadmin' || role === 'secondary_admin';
  const [activeCategory, setActiveCategory] = useState<AppCategory>('free');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [blockedToolName, setBlockedToolName] = useState<string | null>(null);
  const [blockedToolId, setBlockedToolId] = useState<string | null>(null);
  const [demoToolId, setDemoToolId] = useState<string | null>(null);
  const [showComingToast, setShowComingToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Outils récents (derniers ouverts, depuis les analytics)
  const recentToolIds = useMemo(() => {
    const events = getEvents();
    const seen = new Set<string>();
    const recent: string[] = [];
    // Parcourir les événements du plus récent au plus ancien
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

  // Appliquer les surcharges admin (localStorage) à une app
  function applyOverrides(app: ProquelecApp): ProquelecApp {
    return {
      ...app,
      category: getEffectiveCategory(app.category, app.id),
      status: getEffectiveStatus(app.status, app.id),
    };
  }

  // Liste des apps avec surcharges, filtrée par catégorie effective
  const getEffectiveFreeApps = (): ProquelecApp[] =>
    publicCatalogApps.map(applyOverrides).filter((a) => a.category === 'free');

  const getEffectivePremiumApps = (): ProquelecApp[] =>
    publicCatalogApps.map(applyOverrides).filter((a) => a.category === 'premium');

  const getEffectiveInternalApps = (): ProquelecApp[] =>
    canViewInternalTools
      ? fullCatalogApps.map(applyOverrides).filter((a) => a.category === 'internal')
      : [];

  // Filtrer les apps selon la catégorie, le groupe et la recherche
  const getFilteredApps = (): ProquelecApp[] => {
    const apps =
      activeCategory === 'free'
        ? getEffectiveFreeApps()
        : activeCategory === 'premium'
          ? getEffectivePremiumApps()
          : getEffectiveInternalApps();
    let filtered = apps;
    if (activeGroup) {
      filtered = filtered.filter((app) => app.group === activeGroup);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (app) =>
          app.title.toLowerCase().includes(q) ||
          app.description.toLowerCase().includes(q) ||
          app.group.toLowerCase().includes(q),
      );
    }
    return filtered;
  };

  const currentEffectiveFree = getEffectiveFreeApps();
  const currentEffectivePremium = getEffectivePremiumApps();
  const currentEffectiveInternal = getEffectiveInternalApps();
  const visibleToolCount =
    currentEffectiveFree.length +
    currentEffectivePremium.length +
    (canViewInternalTools ? currentEffectiveInternal.length : 0);

  const currentGroups =
    activeCategory === 'free'
      ? appGroups.free
      : activeCategory === 'premium'
        ? appGroups.premium
        : appGroups.internal;

  const handleAppClick = (app: ProquelecApp) => {
    if (app.status === 'coming') {
      // Pour les apps à venir, rediriger vers une page placeholder
      navigate(`/apps/${app.id}`);
      return;
    }

    // Vérification premium pour les outils payants
    // Tracker l'ouverture des outils gratuits
    if (app.category === 'free' || app.category === 'internal' || hasPremium) {
      trackEvent({ toolId: app.id, toolName: app.title, action: 'open' });
    }

    if (app.category === 'premium' && !hasPremium && !isLoadingPremium) {
      trackEvent({ toolId: app.id, toolName: app.title, action: 'premium_blocked' });
      setBlockedToolName(app.title);
      setBlockedToolId(app.id);
      return;
    }
    setBlockedToolName(null);
    setBlockedToolId(null);

    // Apps actives avec logique spéciale
    switch (app.id) {
      case 'sovereign-ai':
        setActiveTool('sovereign-ai');
        break;
      case 'eng-calcs':
        setActiveTool('eng-calcs');
        break;
      case 'verif-mise-terre':
        setActiveTool('verif-mise-terre');
        break;
      case 'convertisseur-unites':
        setActiveTool('convertisseur-unites');
        break;
      case 'calcul-eclairage':
        setActiveTool('calcul-eclairage');
        break;
      case 'simulateur-consommation':
        setActiveTool('simulateur-consommation');
        break;
      case 'faq-normes':
        setActiveTool('faq-normes');
        break;
      case 'glossaire-electrique':
        setActiveTool('glossaire-electrique');
        break;
      case 'diagnostic-securite':
        setActiveTool('diagnostic-securite');
        break;
      case 'checklist-securite':
        setActiveTool('checklist-securite');
        break;
      case 'dimensionnement-cables':
        setActiveTool('dimensionnement-cables');
        break;
      case 'calcul-puissance':
        setActiveTool('calcul-puissance');
        break;
      case 'verif-terre':
        setActiveTool('verif-mise-terre');
        break;
      case 'dimensionnement-solaire':
        setActiveTool('dimensionnement-solaire');
        break;
      case 'generateur-devis':
        setActiveTool('generateur-devis');
        break;
      case 'label-qualite':
        setActiveTool('label-qualite');
        break;
      case 'bibliotheque-documents':
        navigate('/documents');
        break;
      case 'guide-terre-differentiel':
        setActiveTool('guide-terre-differentiel');
        break;
      case 'base-normative':
        setActiveTool('base-normative');
        break;
      case 'schema-modulaire':
        navigate('/rubrique-selector');
        break;
      case 'proquelec-docs':
        navigate('/office/document/new');
        break;
      case 'bibliotheque-normes':
        setActiveTool('sovereign-ai');
        break;
      default:
        if (app.route === '/outils') {
          setActiveTool(app.id);
        } else if (app.route) {
          navigate(app.route);
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

  return (
    <div className="min-h-screen bg-[#111827] text-slate-100 selection:bg-blue-500/30">
      <SEO
        title="Plateforme d'Ingénierie Électrotechnique - PROQUELEC"
        description="Référentiel officiel et corpus normatif central pour professionnels, grand public et équipes PROQUELEC."
      />

      <Header />

      <main className="pt-20 md:pt-24">
        <section className="relative overflow-hidden border-b border-white/10 bg-[#111827] py-8 md:py-12">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mb-4 border-blue-500/30 bg-blue-600/15 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-blue-200">
                {`${visibleToolCount} outils PROQUELEC`}
              </Badge>
              <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl lg:text-6xl">
                {'Outils Techniques Avancés PROQUELEC'}
              </h1>
              <p className="mx-auto mt-5 max-w-3xl text-base font-semibold leading-relaxed text-slate-300 md:text-xl">
                {"Découvrez nos outils professionnels pour optimiser vos installations électriques, réaliser des économies d'énergie et garantir la sécurité."}
              </p>
            </div>
          </div>
        </section>

        {/* ZONE DE RENDU : HUB OU OUTIL SPÉCIFIQUE */}
        <section className="py-12 md:py-24 container mx-auto px-4 md:px-6">
          {activeTool === 'sovereign-ai' ? (
            <div className="space-y-8">
              <button
                onClick={() => setActiveTool(null)}
                className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Retour au Hub
              </button>
              <YEAISenegal />
            </div>
          ) : activeTool === 'eng-calcs' ? (
            <div className="space-y-8">
              <button
                onClick={() => setActiveTool(null)}
                className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Retour au Hub
              </button>
              <VoltageDropCalculator />
            </div>
          ) : activeTool === 'verif-mise-terre' ? (
            <div className="space-y-8">
              <button
                onClick={() => setActiveTool(null)}
                className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Retour au Hub
              </button>
              <EarthResistanceChecker />
            </div>
          ) : activeTool === 'convertisseur-unites' ? (
            <div className="space-y-8">
              <button
                onClick={() => setActiveTool(null)}
                className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Retour au Hub
              </button>
              <ElectricalUnitConverter />
            </div>
          ) : activeTool === 'simulateur-consommation' ? (
            <div className="space-y-8">
              <button
                onClick={() => setActiveTool(null)}
                className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Retour au Hub
              </button>
              <ConsumptionCalculator />
            </div>
          ) : activeTool === 'diagnostic-securite' ? (
            <div className="space-y-8">
              <button
                onClick={() => setActiveTool(null)}
                className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Retour au Hub
              </button>
              <SafetyDiagnostic />
            </div>
          ) : activeTool === 'checklist-securite' ? (
            <div className="space-y-8">
              <button
                onClick={() => setActiveTool(null)}
                className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Retour au Hub
              </button>
              <SafetyChecklist />
            </div>
          ) : activeTool === 'dimensionnement-cables' ? (
            <div className="space-y-8">
              <button
                onClick={() => setActiveTool(null)}
                className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Retour au Hub
              </button>
              <CableSizingTool />
            </div>
          ) : activeTool === 'dimensionnement-solaire' ? (
            <div className="space-y-8">
              <button
                onClick={() => setActiveTool(null)}
                className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Retour au Hub
              </button>
              <SolarSizingTool />
            </div>
          ) : activeTool === 'calcul-puissance' ? (
            <div className="space-y-8">
              <button
                onClick={() => setActiveTool(null)}
                className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Retour au Hub
              </button>
              <OperationalToolSuite toolId="calcul-puissance" demoMode={demoToolId === 'calcul-puissance'} />
            </div>
          ) : activeTool === 'generateur-devis' ? (
            <div className="space-y-8">
              <button
                onClick={() => setActiveTool(null)}
                className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Retour au Hub
              </button>
              <QuoteGenerator />
            </div>
          ) : activeTool === 'faq-normes' ? (
            <div className="space-y-8">
              <button
                onClick={() => setActiveTool(null)}
                className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Retour au Hub
              </button>
              <FAQNormes />
            </div>
          ) : activeTool === 'glossaire-electrique' ? (
            <div className="space-y-8">
              <button
                onClick={() => setActiveTool(null)}
                className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Retour au Hub
              </button>
              <GlossaireElectrique />
            </div>
          ) : activeTool === 'label-qualite' ? (
            <div className="space-y-8">
              <button
                onClick={() => setActiveTool(null)}
                className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Retour au Hub
              </button>
              <LabelRequestForm />
            </div>
          ) : activeTool === 'guide-terre-differentiel' ? (
            <div className="space-y-8">
              <button
                onClick={() => setActiveTool(null)}
                className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Retour au Hub
              </button>
              <GroundingGuide />
            </div>
          ) : activeTool === 'base-normative' ? (
            <div className="space-y-8">
              <button
                onClick={() => setActiveTool(null)}
                className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Retour au Hub
              </button>
              <NormativeDatabase />
            </div>
          ) : blockedToolName ? (
            <PremiumPaywall
              toolName={blockedToolName}
              toolId={blockedToolId || undefined}
              onBack={() => {
                setBlockedToolName(null);
                setBlockedToolId(null);
                setActiveTool(null);
              }}
              onTryDemo={() => {
                const id = blockedToolId;
                if (id) {
                  trackEvent({ toolId: id, toolName: blockedToolName, action: 'demo_try' });
                  // Trouver l'app et l'ouvrir en mode démo
                  const allApps = [...freeApps, ...premiumApps];
                  const app = allApps.find((a) => a.id === id);
                  if (app) {
                    setBlockedToolName(null);
                    setBlockedToolId(null);
                    setDemoToolId(id);
                    setActiveTool(id);
                  }
                }
              }}
            />
          ) : activeTool === 'calcul-eclairage' ? (
            <div className="space-y-8">
              <button
                onClick={() => setActiveTool(null)}
                className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Retour au Hub
              </button>
              <LightingCalculator />
            </div>
          ) : hasOperationalTool(activeTool) ? (
            <div className="space-y-8">
              <button
                onClick={() => {
                  setActiveTool(null);
                  setDemoToolId(null);
                }}
                className="flex items-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Retour au Hub
              </button>
              <OperationalToolSuite toolId={activeTool} demoMode={demoToolId === activeTool} />
            </div>
          ) : (
            <>
              <SauvegardeToolsExperience
                onOpenTool={setActiveTool}
                onOpenDocuments={() => navigate('/documents')}
              />

              {/* Header avec onglets */}
              <div className="mt-16 flex flex-col gap-4 md:gap-8 mb-8 md:mb-12">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 md:gap-8">
                  <div className="max-w-xl">
                    <h2 className="text-2xl md:text-3xl font-black mb-2 md:mb-4">
                      {activeCategory === 'free' ? (
                        <>
                          Applications <span className="text-emerald-400">Gratuites</span>
                        </>
                      ) : activeCategory === 'premium' ? (
                        <>
                          Solutions <span className="text-amber-400">Premium</span>
                        </>
                      ) : (
                        <>
                          Outils <span className="text-sky-400">Internes</span>
                        </>
                      )}
                    </h2>
                    <p className="text-sm md:text-base text-slate-400 font-medium">
                      {activeCategory === 'free'
                        ? "Outils de sensibilisation et d'éducation pour le grand public."
                        : activeCategory === 'premium'
                          ? "Outils professionnels certifiés pour électriciens et bureaux d'études."
                          : 'Outils internes réservés aux équipes autorisées PROQUELEC.'}
                    </p>
                  </div>

                  <div className="flex w-full sm:w-auto bg-emerald-900/30 p-1 md:p-1.5 rounded-xl md:rounded-2xl border border-emerald-800/30">
                    <button
                      onClick={() => {
                        setActiveCategory('free');
                        setActiveGroup(null);
                      }}
                      className={`flex-1 sm:flex-none px-4 md:px-8 py-2.5 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-1.5 md:gap-2 ${activeCategory === 'free' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                      <Globe className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span className="hidden xs:inline">GRATUIT</span>
                      <span className="xs:hidden">Gratuit</span> ({currentEffectiveFree.length})
                    </button>
                    <button
                      onClick={() => {
                        setActiveCategory('premium');
                        setActiveGroup(null);
                      }}
                      className={`flex-1 sm:flex-none px-4 md:px-8 py-2.5 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-1.5 md:gap-2 ${activeCategory === 'premium' ? 'bg-amber-400 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                      <Crown className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      <span className="hidden xs:inline">PREMIUM</span>
                      <span className="xs:hidden">Premium</span> ({currentEffectivePremium.length})
                    </button>
                    {canViewInternalTools && (
                      <button
                        onClick={() => {
                          setActiveCategory('internal');
                          setActiveGroup(null);
                        }}
                        className={`flex-1 sm:flex-none px-4 md:px-8 py-2.5 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-black transition-all flex items-center justify-center gap-1.5 md:gap-2 ${activeCategory === 'internal' ? 'bg-sky-400 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="hidden xs:inline">INTERNE</span>
                        <span className="xs:hidden">Interne</span> ({currentEffectiveInternal.length})
                      </button>
                    )}
                  </div>
                </div>

                {/* Barre de recherche */}
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

                {/* Filtres par groupe */}
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
                      onClick={() => setActiveGroup(group)}
                      className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${activeGroup === group ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-white bg-slate-800/50'}`}
                      aria-label="Action"
                    >
                      {group}
                    </button>
                  ))}
                </div>
              </div>

              {/* Outils récents */}
              {recentApps.length > 0 && (
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

              {/* Grille des applications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {getFilteredApps().map((app) => (
                  <Card
                    key={app.id}
                    onClick={() => handleAppClick(app)}
                    className={`group bg-[#0d2a21]/40 border-emerald-900/40 hover:border-emerald-500/40 active:border-emerald-500/60 rounded-2xl md:rounded-[2rem] shadow-xl transition-all duration-300 md:duration-500 overflow-hidden relative cursor-pointer touch-manipulation ${app.status === 'coming' ? 'opacity-70' : ''}`}
                  >
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    {/* Badge PREMIUM sur les cartes premium (visible même dans l'onglet gratuit) */}
                    {app.category === 'premium' && (
                      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-amber-500/90 text-[10px] font-black uppercase tracking-wider text-slate-900 px-2 py-1 rounded-full shadow-lg shadow-amber-500/20">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        PREMIUM
                      </div>
                    )}

                    {/* Overlay cadenas sur les cartes premium dans l'onglet gratuit */}
                    {app.category === 'premium' && activeCategory === 'free' && (
                      <div className="absolute inset-0 z-10 bg-[#071914]/60 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto bg-amber-400/20 rounded-full flex items-center justify-center mb-2">
                            <svg
                              className="w-6 h-6 text-amber-400"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0110 0v4" />
                            </svg>
                          </div>
                          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                            Abonnement requis
                          </span>
                        </div>
                      </div>
                    )}

                    <CardContent className="p-4 md:p-6 relative z-10 flex flex-col h-full min-h-[220px] md:min-h-[280px]">
                      <div className="flex items-start justify-between mb-3 md:mb-4">
                        <div
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 ${activeCategory === 'premium' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}
                        >
                          <app.icon
                            className={`w-5 h-5 md:w-6 md:h-6 ${activeCategory === 'premium' ? 'text-amber-400' : 'text-emerald-400'}`}
                          />
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
                        <button
                          className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-slate-300 hover:text-white transition-colors group/btn"
                          aria-label="Action"
                        >
                          {app.status === 'coming' ? 'Bientôt' : 'Accéder'}
                          <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Compteur */}
              <div className="mt-12 text-center">
                <p className="text-slate-500 text-sm">
                  <span className="text-emerald-400 font-bold">
                    {getFilteredApps().filter((a) => a.status === 'active').length}
                  </span>{' '}
                  actives •
                  <span className="text-amber-400 font-bold ml-2">
                    {getFilteredApps().filter((a) => a.status === 'coming').length}
                  </span>{' '}
                  en développement
                </p>
              </div>
            </>
          )}
        </section>

        {/* SECTION CHARTE SOUS LE HUB */}
        <section className="bg-emerald-500/5 border-y border-emerald-900/50 py-10 md:py-20 mt-8 md:mt-12">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12">
              <div className="space-y-2 md:space-y-4">
                <div className="p-2 md:p-3 bg-emerald-500/20 w-fit rounded-lg md:rounded-xl border border-emerald-500/30">
                  <BadgeCheck className="text-emerald-400 w-4 h-4 md:w-6 md:h-6" />
                </div>
                <h4 className="font-black text-sm md:text-lg">{visibleToolCount} Applications</h4>
                <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                  Catalogue complet d'outils pour électriciens et grand public.
                </p>
              </div>
              <div className="space-y-2 md:space-y-4">
                <div className="p-2 md:p-3 bg-blue-500/20 w-fit rounded-lg md:rounded-xl border border-blue-500/30">
                  <Brain className="text-blue-400 w-4 h-4 md:w-6 md:h-6" />
                </div>
                <h4 className="font-black text-sm md:text-lg">IA Subordonnée</h4>
                <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                  Notre IA cite la norme, l'article et le chapitre.
                </p>
              </div>
              <div className="space-y-2 md:space-y-4">
                <div className="p-2 md:p-3 bg-amber-500/20 w-fit rounded-lg md:rounded-xl border border-amber-500/30">
                  <ShieldCheck className="text-amber-400 w-4 h-4 md:w-6 md:h-6" />
                </div>
                <h4 className="font-black text-sm md:text-lg">Sécurité Humaine</h4>
                <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                  Calculs certifiants réservés aux professionnels.
                </p>
              </div>
              <div className="space-y-2 md:space-y-4">
                <div className="p-2 md:p-3 bg-slate-500/20 w-fit rounded-lg md:rounded-xl border border-slate-500/30">
                  <FileText className="text-slate-400 w-4 h-4 md:w-6 md:h-6" />
                </div>
                <h4 className="font-black text-sm md:text-lg">Souveraineté</h4>
                <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                  Toutes les données restent au Sénégal.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
