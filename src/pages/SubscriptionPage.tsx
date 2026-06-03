/**
 * SubscriptionPage.tsx
 * Page d'abonnement pour les utilisateurs
 * Supporte Orange Money, Wave, Free Money, Carte
 */
import React, { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { toast } from 'sonner';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { useSession } from '@/hooks/useSession';
import {
  Check, Crown, Star, Zap, Loader2, CreditCard, Smartphone,
  Building2, ChevronRight, Shield
} from 'lucide-react';

const PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    price: 0,
    duration: '1 an',
    color: 'from-slate-500 to-slate-600',
    features: ['Normes gratuites', 'Calculateur de base', 'Consultation blog'],
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 15,
    duration: '30 jours',
    color: 'from-blue-600 to-indigo-700',
    features: ['Normes complètes', 'Calculateurs avancés', 'Chute de tension', 'Diagnostic IA', 'Certification'],
    popular: true
  },
  {
    id: 'expert',
    name: 'Expert',
    price: 50,
    duration: '30 jours',
    color: 'from-amber-500 to-orange-600',
    features: ['Accès illimité', 'Accès API', 'Support prioritaire', 'Formation', 'Audit complet'],
    popular: false
  },
];

const PAYMENT_METHODS = [
  { id: 'orange_money', name: 'Orange Money', icon: Smartphone, color: 'text-orange-500' },
  { id: 'wave', name: 'Wave', icon: Zap, color: 'text-blue-500' },
  { id: 'free_money', name: 'Free Money', icon: Smartphone, color: 'text-red-500' },
  { id: 'card', name: 'Carte bancaire', icon: CreditCard, color: 'text-green-500' },
];

export default function SubscriptionPage() {
  const { user } = useSession();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [mySubscription, setMySubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    loadSubscription();
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await apiFetch<any[]>('/api/subscription-plans');
      setPlans(Array.isArray(data) ? data : []);
    } catch {}
  };

  const loadSubscription = async () => {
    if (!user) { setLoading(false); return; }
    try {
      const data = await apiFetch<any>('/api/my-subscription');
      setMySubscription(data);
    } catch {}
    setLoading(false);
  };

  const handleSubscribe = async (planId: string) => {
    setSelectedPlan(planId);
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    // Plan gratuit
    if (plan.price === 0) {
      try {
        await apiFetch('/api/subscriptions', {
          method: 'POST',
          body: JSON.stringify({ plan_id: planId })
        });
        toast.success('Abonnement gratuit activé !');
        loadSubscription();
        return;
      } catch (err: any) {
        toast.error(err.message || 'Erreur');
        return;
      }
    }

    // Plan payant
    setPaying(true);
    try {
      const res = await apiFetch<any>('/api/payments/create', {
        method: 'POST',
        body: JSON.stringify({
          planId,
          userId: user?.id,
          email: user?.email,
          name: user?.email?.split('@')[0] || 'Client',
          phone: ''
        })
      });

      if (res.invoice_url) {
        window.open(res.invoice_url, '_blank');
        toast.success('Redirection vers le paiement...');
      } else {
        toast.error('Erreur de paiement');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erreur paiement');
    } finally {
      setPaying(false);
    }
  };

  const formatPrice = (price: number) => {
    return (price * 1000).toLocaleString('fr-FR') + ' F CFA';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Connectez-vous pour vous abonner</h1>
          <p className="text-slate-600 mb-8">Créez un compte ou connectez-vous pour accéder aux abonnements</p>
          <a href="/connexion" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
            Se connecter
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEO title="Abonnements - PROQUELEC" description="Choisissez votre formule d'abonnement" />
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 mb-3">Nos Abonnements</h1>
          <p className="text-lg text-slate-600">Accédez à tous les outils PROQUELEC selon vos besoins</p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const isPopular = plan.price > 0 && plan.price < 50000;
            const clr = plan.price === 0 ? 'from-slate-500 to-slate-600' :
                         plan.price < 30000 ? 'from-blue-600 to-indigo-700' : 'from-amber-500 to-orange-600';

            return (
              <div key={plan.id} className={`relative bg-white rounded-2xl border-2 p-6 transition-all hover:shadow-xl ${
                isPopular ? 'border-blue-400 shadow-lg scale-105' : 'border-slate-200'
              }`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                    Populaire
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${clr} flex items-center justify-center mb-4`}>
                  {plan.price === 0 ? <Star className="w-6 h-6 text-white" /> :
                   plan.price < 30000 ? <Crown className="w-6 h-6 text-white" /> :
                   <Zap className="w-6 h-6 text-white" />}
                </div>

                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <div className="mt-3">
                  <span className="text-3xl font-black text-slate-900">{formatPrice(plan.price)}</span>
                  <span className="text-sm text-slate-500 ml-1">/{plan.duration_days >= 365 ? 'an' : 'mois'}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{plan.description}</p>

                <ul className="mt-6 space-y-3">
                  {(plan.features || []).map((f: string) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-slate-600">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {f.replace(/_/g, ' ')}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={paying && selectedPlan === plan.id}
                  className={`w-full mt-6 py-3 rounded-xl font-bold text-sm transition-all ${
                    plan.price === 0
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-gradient-to-r ' + clr + ' text-white hover:shadow-lg'
                  } disabled:opacity-50`}
                >
                  {paying && selectedPlan === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : plan.price === 0 ? (
                    'Souscrire gratuitement'
                  ) : (
                    `Souscrire - ${formatPrice(plan.price)}`
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Moyens de paiement */}
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
            Moyens de paiement acceptés
          </h3>
          <div className="flex justify-center gap-6">
            {PAYMENT_METHODS.map(method => (
              <div key={method.id} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200">
                <method.icon className={`w-5 h-5 ${method.color}`} />
                <span className="text-sm font-medium text-slate-700">{method.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Abonnement actuel */}
        {mySubscription && (
          <div className="max-w-md mx-auto mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
            <h3 className="font-bold text-blue-900 mb-2">Mon abonnement actuel</h3>
            <p className="text-sm text-blue-700">
              {mySubscription.name} - Expire le {new Date(mySubscription.end_date).toLocaleDateString('fr-FR')}
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
