/**
 * Page publique d'abonnement — Design Premium PROQUELEC
 * Glassmorphism · Animations · Tarifs FCFA XOF
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Crown,
  Star,
  Zap,
  Infinity,
  CreditCard,
  Check,
  Shield,
  Sparkles,
  ArrowRight,
  BadgeCheck,
  Brain,
  FileText,
  Globe,
  Headphones,
  Lock,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

const API = '/api';

function formatPrice(price: number): string {
  if (price === 0) return 'Gratuit';
  return new Intl.NumberFormat('fr-FR').format(price) + ' F CFA';
}

function getModeLabel(mode: string): string {
  switch (mode) {
    case 'lifetime':
      return '/ à vie';
    case 'yearly':
      return '/ an';
    case 'credit':
      return 'crédits';
    default:
      return '/ mois';
  }
}

const FEATURE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  normes_gratuites: { label: 'Normes électriques de base', icon: <FileText className="w-4 h-4" /> },
  normes_completes: { label: 'Normes complètes + mises à jour', icon: <FileText className="w-4 h-4" /> },
  calculateur_base: { label: 'Calculateurs de base', icon: <Zap className="w-4 h-4" /> },
  calculateurs_avance: { label: 'Calculateurs avancés', icon: <Zap className="w-4 h-4" /> },
  chute_tension: { label: 'Chute de tension & dimensionnement', icon: <Zap className="w-4 h-4" /> },
  diagnostic_ia: { label: 'Diagnostic IA (analyse photo)', icon: <Brain className="w-4 h-4" /> },
  certification: { label: 'Accès formulaires certification', icon: <BadgeCheck className="w-4 h-4" /> },
  consultation_blog: { label: 'Blog & ressources gratuites', icon: <Globe className="w-4 h-4" /> },
  tout_acces: { label: 'Accès illimité à tous les outils', icon: <Crown className="w-4 h-4" /> },
  api_acces: { label: 'Accès API développeur', icon: <Globe className="w-4 h-4" /> },
  support_prioritaire: { label: 'Support prioritaire 24/7', icon: <Headphones className="w-4 h-4" /> },
  formation: { label: 'Formations & certifications', icon: <BadgeCheck className="w-4 h-4" /> },
  audit_complet: { label: 'Audit complet de conformité', icon: <Shield className="w-4 h-4" /> },
};

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  billing_mode: string;
  credits: number;
  features: string[];
  is_premium: boolean;
  is_active: boolean;
}

interface Subscription {
  id: string;
  plan_name: string;
  end_date: string;
  is_active: boolean;
}

const PLAN_CONFIG: Record<string, {
  badge?: string;
  gradient: string;
  accentColor: string;
  textColor: string;
  bgCard: string;
  borderColor: string;
  btnClass: string;
  popular?: boolean;
  icon: React.ReactNode;
  tagline: string;
}> = {
  Gratuit: {
    gradient: 'from-slate-500 to-slate-700',
    accentColor: '#64748b',
    textColor: 'text-slate-700',
    bgCard: 'bg-white',
    borderColor: 'border-slate-200',
    btnClass: 'bg-slate-900 text-white hover:bg-slate-800',
    icon: <Star className="w-6 h-6" />,
    tagline: 'Pour commencer',
  },
  Premium: {
    badge: '⭐ Le plus populaire',
    gradient: 'from-blue-600 to-indigo-700',
    accentColor: '#2563eb',
    textColor: 'text-blue-700',
    bgCard: 'bg-gradient-to-b from-blue-50/80 to-white',
    borderColor: 'border-blue-400',
    btnClass: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200',
    popular: true,
    icon: <Crown className="w-6 h-6" />,
    tagline: 'Pour les professionnels',
  },
  Expert: {
    badge: '🏆 Tout inclus',
    gradient: 'from-amber-500 to-orange-600',
    accentColor: '#f59e0b',
    textColor: 'text-amber-700',
    bgCard: 'bg-gradient-to-b from-amber-50/60 to-white',
    borderColor: 'border-amber-400',
    btnClass: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-200',
    icon: <Sparkles className="w-6 h-6" />,
    tagline: 'Pour les experts',
  },
};

const FAQ_ITEMS = [
  {
    q: 'Comment fonctionne la facturation ?',
    a: "Les abonnements sont facturés mensuellement via Mobile Money (Orange Money, Wave) ou virement bancaire. Vous recevrez une facture par email à chaque renouvellement.",
  },
  {
    q: 'Puis-je annuler mon abonnement ?',
    a: "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. L'accès reste actif jusqu'à la fin de la période payée.",
  },
  {
    q: "Y a-t-il une période d'essai ?",
    a: "Le plan Gratuit vous donne accès aux fonctionnalités de base sans limite de durée. Vous pouvez passer à Premium ou Expert à tout moment.",
  },
  {
    q: 'Les mises à jour des normes sont-elles incluses ?',
    a: "Oui, tous les abonnements payants incluent les mises à jour automatiques des normes électriques SENELEC et ADIE dès leur publication.",
  },
  {
    q: 'Que se passe-t-il après expiration ?',
    a: "Votre compte passe automatiquement au plan Gratuit. Vos données et projets sont conservés. Vous pouvez renouveler à tout moment.",
  },
];

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [mySub, setMySub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(API + '/subscription-plans')
        .then((r) => r.json())
        .catch(() => []),
      fetch(API + '/my-subscription', {
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
      })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
    ]).then(([plansData, subData]) => {
      setPlans(Array.isArray(plansData) ? plansData : []);
      setMySub(subData || null);
      setLoading(false);
    });
  }, []);

  const handleSubscribe = async (planId: string, isFree: boolean) => {
    if (isFree) {
      navigate('/connexion');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Connectez-vous pour souscrire');
      navigate('/connexion');
      return;
    }

    setSelectedPlan(planId);
    setPaying(true);
    try {
      const res = await fetch(API + '/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ plan_id: planId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('🎉 Abonnement activé avec succès !');
        setMySub(data);
      } else {
        toast.error(data.error || 'Erreur lors de la souscription');
      }
    } catch {
      toast.error('Erreur réseau, réessayez');
    }
    setPaying(false);
    setSelectedPlan(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-400 mx-auto" />
            <p className="text-slate-400 text-sm">Chargement des offres...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Header />

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:48px_48px]" />
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 pt-20 pb-16 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 rounded-full px-4 py-1.5 text-blue-300 text-sm font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Tarification transparente · FCFA XOF
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05] tracking-tight">
            L'accès complet aux<br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-300 bg-clip-text text-transparent">
              outils d'ingénierie
            </span>
          </h1>

          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            Normes électriques, calculateurs avancés, diagnostic IA et formations certifiantes —
            tout ce dont les professionnels de l'électricité ont besoin.
          </p>

          {/* Active subscription banner */}
          {mySub?.is_active && (
            <div className="inline-flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-2xl px-6 py-3 mx-auto">
              <Shield className="w-5 h-5 text-green-400 shrink-0" />
              <span className="text-sm text-green-300">
                Abonnement <strong className="text-green-200">{mySub.plan_name}</strong> actif jusqu'au{' '}
                <strong className="text-green-200">
                  {new Date(mySub.end_date).toLocaleDateString('fr-FR')}
                </strong>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ─── PLANS ─── */}
      <section className="max-w-6xl mx-auto px-4 pb-20 w-full">
        {plans.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Crown className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Aucun plan disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {plans.map((plan) => {
              const cfg = PLAN_CONFIG[plan.name] || PLAN_CONFIG['Gratuit'];
              const isFree = plan.price === 0 || Number(plan.price) === 0;
              const price = Number(plan.price);
              const isLoading = selectedPlan === plan.id && paying;

              return (
                <div
                  key={plan.id}
                  className={`
                    relative flex flex-col rounded-3xl border overflow-hidden transition-all duration-300
                    hover:-translate-y-1 hover:shadow-2xl
                    ${cfg.popular
                      ? 'border-blue-500/60 shadow-xl shadow-blue-900/30 ring-1 ring-blue-500/30'
                      : 'border-white/10 hover:border-white/20'
                    }
                  `}
                  style={{
                    background: cfg.popular
                      ? 'linear-gradient(160deg, rgba(37,99,235,0.12) 0%, rgba(15,23,42,0.95) 100%)'
                      : 'rgba(15,23,42,0.85)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  {/* Popular badge */}
                  {cfg.badge && (
                    <div
                      className={`text-center text-xs font-bold py-2 px-4 ${
                        cfg.popular
                          ? 'bg-blue-600 text-white'
                          : 'bg-amber-500 text-slate-900'
                      }`}
                    >
                      {cfg.badge}
                    </div>
                  )}

                  <div className="flex flex-col flex-1 p-7 space-y-6">
                    {/* Header */}
                    <div className="space-y-3">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold
                        ${cfg.popular ? 'bg-blue-500/15 text-blue-300' : isFree ? 'bg-slate-700/60 text-slate-400' : 'bg-amber-500/15 text-amber-300'}
                      `}>
                        {cfg.icon}
                        {plan.name}
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white">
                          {isFree ? 'Gratuit' : new Intl.NumberFormat('fr-FR').format(price)}
                        </span>
                        {!isFree && (
                          <span className="text-slate-500 text-sm font-medium">
                            F CFA {getModeLabel(plan.billing_mode)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">{cfg.tagline}</p>
                    </div>

                    {/* Divider */}
                    <div className={`h-px ${cfg.popular ? 'bg-blue-500/30' : 'bg-white/8'}`} />

                    {/* Features */}
                    <ul className="space-y-3 flex-1">
                      {(plan.features || []).map((f) => {
                        const feat = FEATURE_LABELS[f];
                        return (
                          <li key={f} className="flex items-start gap-3">
                            <span className={`mt-0.5 shrink-0 ${cfg.popular ? 'text-blue-400' : isFree ? 'text-slate-500' : 'text-amber-400'}`}>
                              <Check className="w-4 h-4" />
                            </span>
                            <span className="text-sm text-slate-300">
                              {feat ? feat.label : f.replace(/_/g, ' ')}
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    {/* CTA */}
                    <button
                      onClick={() => handleSubscribe(plan.id, isFree)}
                      disabled={isLoading}
                      className={`
                        w-full h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all
                        disabled:opacity-60 disabled:cursor-not-allowed
                        ${cfg.popular
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40'
                          : isFree
                            ? 'bg-white/8 border border-white/10 text-slate-300 hover:bg-white/12'
                            : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-amber-900/30'
                        }
                      `}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Souscription...
                        </>
                      ) : isFree ? (
                        <>
                          Commencer gratuitement
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Souscrire maintenant
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Trust badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-slate-500 text-sm">
          {[
            { icon: <Lock className="w-4 h-4" />, label: 'Paiement sécurisé' },
            { icon: <Shield className="w-4 h-4" />, label: 'Annulation à tout moment' },
            { icon: <Headphones className="w-4 h-4" />, label: 'Support inclus' },
            { icon: <BadgeCheck className="w-4 h-4" />, label: 'Données protégées' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              {icon}
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURE TABLE ─── */}
      <section className="max-w-5xl mx-auto px-4 pb-20 w-full">
        <div className="rounded-3xl border border-white/10 overflow-hidden"
          style={{ background: 'rgba(15,23,42,0.85)' }}>
          {/* Header */}
          <div className="p-8 border-b border-white/10 text-center space-y-2">
            <h2 className="text-2xl font-black text-white">Comparatif des formules</h2>
            <p className="text-slate-500 text-sm">Ce qui est inclus dans chaque offre</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-8 font-semibold text-slate-400 min-w-[200px]">
                    Fonctionnalité
                  </th>
                  <th className="py-4 px-6 text-center font-bold text-slate-300 min-w-[110px]">Gratuit</th>
                  <th className="py-4 px-6 text-center font-bold text-blue-300 min-w-[110px]">Premium</th>
                  <th className="py-4 px-6 text-center font-bold text-amber-300 min-w-[110px]">Expert</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Normes électriques de base', free: true, premium: true, expert: true },
                  { name: 'Normes complètes + MAJ', free: false, premium: true, expert: true },
                  { name: 'Calculateurs de base', free: true, premium: true, expert: true },
                  { name: 'Calculateurs avancés', free: false, premium: true, expert: true },
                  { name: 'Chute de tension & dimensionnement', free: false, premium: true, expert: true },
                  { name: 'Diagnostic IA (photo)', free: false, premium: true, expert: true },
                  { name: 'Formulaires certification', free: false, premium: true, expert: true },
                  { name: 'Blog & ressources', free: true, premium: true, expert: true },
                  { name: 'Accès illimité à tous les outils', free: false, premium: false, expert: true },
                  { name: 'Accès API développeur', free: false, premium: false, expert: true },
                  { name: 'Support prioritaire 24/7', free: false, premium: false, expert: true },
                  { name: 'Formations certifiantes', free: false, premium: false, expert: true },
                  { name: 'Audit complet conformité', free: false, premium: false, expert: true },
                ].map((row, i) => (
                  <tr
                    key={row.name}
                    className="border-b border-white/6 last:border-0 hover:bg-white/3 transition-colors"
                  >
                    <td className="py-3.5 px-8 text-slate-300 font-medium">{row.name}</td>
                    {[row.free, row.premium, row.expert].map((val, j) => (
                      <td key={j} className="py-3.5 px-6 text-center">
                        {val ? (
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full
                            ${j === 0 ? 'bg-slate-700/60' : j === 1 ? 'bg-blue-500/20' : 'bg-amber-500/20'}
                          `}>
                            <Check className={`w-3.5 h-3.5 ${j === 0 ? 'text-slate-400' : j === 1 ? 'text-blue-400' : 'text-amber-400'}`} />
                          </span>
                        ) : (
                          <X className="w-4 h-4 text-slate-700 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="max-w-3xl mx-auto px-4 pb-24 w-full">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl font-black text-white">Questions fréquentes</h2>
          <p className="text-slate-500 text-sm">Tout ce que vous devez savoir sur nos abonnements</p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 overflow-hidden transition-all"
              style={{ background: 'rgba(15,23,42,0.7)' }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left"
              >
                <span className="font-semibold text-slate-200 text-sm">{item.q}</span>
                {openFaq === i ? (
                  <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/8 pt-4">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="max-w-4xl mx-auto px-4 pb-20 w-full">
        <div
          className="rounded-3xl p-10 md:p-14 text-center space-y-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(99,102,241,0.10) 100%)',
            border: '1px solid rgba(59,130,246,0.25)',
          }}
        >
          <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:32px_32px]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="relative space-y-4">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-300 text-xs font-bold">
              <Shield className="w-3.5 h-3.5" />
              Pas de carte requise pour l'offre gratuite
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Prêt à moderniser votre pratique ?
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              Rejoignez plus de 2 000 électriciens et entreprises qui font confiance à PROQUELEC
              pour leurs normes, calculs et certifications.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                onClick={() => navigate('/connexion')}
                className="h-12 px-8 rounded-2xl bg-white text-slate-900 font-bold hover:bg-slate-100 text-sm"
              >
                Commencer gratuitement
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/outils')}
                className="h-12 px-8 rounded-2xl border-white/15 text-slate-300 hover:bg-white/8 hover:text-white text-sm"
              >
                Voir les outils
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
