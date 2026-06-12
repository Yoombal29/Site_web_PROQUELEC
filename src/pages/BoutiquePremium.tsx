import { useEffect, useMemo, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  Crown,
  Download,
  FileText,
  Layers3,
  Lock,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { premiumApps, type ProquelecApp } from '@/data/applications-catalog';
import { useEcommerceStore, type Product } from '@/stores/ecommerce.store';
import { cn } from '@/lib/utils';

type ProductCategory = 'documents' | 'applications' | 'subscriptions';

type SubscriptionPlan = {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration_days?: number;
  billing_mode?: string;
  credits?: number;
  features?: string[];
  is_premium?: boolean;
  is_active?: boolean;
};

type CategoryTab = {
  id: ProductCategory;
  label: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
};

const categoryTabs: CategoryTab[] = [
  {
    id: 'documents',
    label: 'Documents techniques',
    subtitle: 'Guides, normes et supports telechargeables',
    icon: FileText,
    color: 'bg-blue-600 text-white border-blue-600',
  },
  {
    id: 'applications',
    label: 'Applications',
    subtitle: 'Outils premium et calculateurs metier',
    icon: Zap,
    color: 'bg-emerald-600 text-white border-emerald-600',
  },
  {
    id: 'subscriptions',
    label: 'Abonnements',
    subtitle: 'Acces mensuel, annuel ou expert',
    icon: Crown,
    color: 'bg-amber-500 text-slate-950 border-amber-500',
  },
];

const appPrices: Record<string, number> = {
  'eng-calcs': 15000,
  'calcul-court-circuit': 18000,
  'verif-terre': 18000,
  'schema-unifilaire': 22000,
  'dimensionnement-cable': 18000,
  'audit-conformite': 35000,
  'rapport-technique': 25000,
  'certification-pro': 45000,
};

const fallbackPlans: SubscriptionPlan[] = [
  {
    id: 'premium-monthly',
    name: 'Premium',
    description: 'Acces aux outils avances, documents premium et mises a jour techniques.',
    price: 15000,
    duration_days: 30,
    billing_mode: 'monthly',
    features: ['Documents premium', 'Applications professionnelles', 'Support standard'],
    is_active: true,
    is_premium: true,
  },
  {
    id: 'expert-yearly',
    name: 'Expert',
    description: 'Pack complet pour bureaux d etudes, electriciens et equipes techniques.',
    price: 150000,
    duration_days: 365,
    billing_mode: 'yearly',
    features: ['Tout Premium', 'Support prioritaire', 'Modeles et rapports avances'],
    is_active: true,
    is_premium: true,
  },
];

const formatPrice = (price: number, currency = 'XOF') => {
  if (!Number.isFinite(price) || price <= 0) return 'Gratuit';
  return `${new Intl.NumberFormat('fr-FR').format(price)} ${currency === 'XOF' ? 'F CFA' : currency}`;
};

const getBillingLabel = (plan: SubscriptionPlan) => {
  if (plan.billing_mode === 'yearly' || (plan.duration_days || 0) >= 365) return '/ an';
  if (plan.billing_mode === 'lifetime') return 'a vie';
  if (plan.billing_mode === 'credit') return 'credits';
  return '/ mois';
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const ProductVisual = ({
  tone,
  children,
}: {
  tone: 'document' | 'application' | 'subscription';
  children: ReactNode;
}) => {
  const tones = {
    document: 'from-blue-700 via-blue-800 to-slate-950',
    application: 'from-emerald-600 via-teal-700 to-slate-950',
    subscription: 'from-amber-400 via-orange-500 to-slate-950',
  };

  return (
    <div className={cn('relative min-h-36 overflow-hidden rounded-t-lg bg-gradient-to-br p-4', tones[tone])}>
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(135deg,rgba(255,255,255,.25)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="relative flex h-full min-h-28 flex-col justify-between rounded-md border border-white/20 bg-white/10 p-4 text-white backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
};

const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
    <PackageCheck className="mx-auto h-10 w-10 text-slate-300" />
    <h3 className="mt-4 text-lg font-black text-slate-900">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">{description}</p>
  </div>
);

export default function BoutiquePremium() {
  const navigate = useNavigate();
  const products = useEcommerceStore((state) => state.products);
  const currency = useEcommerceStore((state) => state.currency);
  const paymentGateway = useEcommerceStore((state) => state.paymentGateway);
  const addToCart = useEcommerceStore((state) => state.addToCart);
  const cartCount = useEcommerceStore((state) => state.getCartCount());
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('documents');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/subscription-plans')
      .then((response) => (response.ok ? response.json() : []))
      .then((data: unknown) => {
        if (cancelled) return;
        const rows = Array.isArray(data) ? data : [];
        setPlans((rows as SubscriptionPlan[]).filter((plan) => plan.is_active !== false));
      })
      .catch(() => {
        if (!cancelled) setPlans([]);
      })
      .finally(() => {
        if (!cancelled) setPlansLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const documentProducts = useMemo(
    () =>
      products
        .filter((product) => product.source === 'document' || String(product.id).startsWith('asset:'))
        .filter((product) => product.inStock !== false),
    [products],
  );

  const applicationProducts = useMemo(
    () => premiumApps.filter((app) => app.status !== 'development'),
    [],
  );

  const visiblePlans = plans.length > 0 ? plans : fallbackPlans;
  const normalizedQuery = normalizeText(query.trim());

  const filteredDocuments = useMemo(() => {
    if (!normalizedQuery) return documentProducts;
    return documentProducts.filter((product) =>
      normalizeText(`${product.name} ${product.description || ''} ${product.category || ''}`).includes(
        normalizedQuery,
      ),
    );
  }, [documentProducts, normalizedQuery]);

  const filteredApplications = useMemo(() => {
    if (!normalizedQuery) return applicationProducts;
    return applicationProducts.filter((app) =>
      normalizeText(`${app.title} ${app.description} ${app.group} ${app.norme || ''}`).includes(
        normalizedQuery,
      ),
    );
  }, [applicationProducts, normalizedQuery]);

  const filteredPlans = useMemo(() => {
    if (!normalizedQuery) return visiblePlans;
    return visiblePlans.filter((plan) =>
      normalizeText(`${plan.name} ${plan.description || ''} ${(plan.features || []).join(' ')}`).includes(
        normalizedQuery,
      ),
    );
  }, [normalizedQuery, visiblePlans]);

  const totalProducts = documentProducts.length + applicationProducts.length + visiblePlans.length;

  const handleAddDocument = (product: Product) => {
    if (product.price <= 0 && product.downloadUrl) {
      window.location.href = product.downloadUrl;
      return;
    }

    addToCart(product);
    toast.success('Document ajoute au panier');
  };

  const handleOpenApp = (app: ProquelecApp) => {
    navigate(`/apps/${app.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SEO
        title="Boutique premium - PROQUELEC"
        description="Boutique numerique PROQUELEC : documents techniques, applications professionnelles et abonnements premium."
      />
      <Header />

      <main>
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(37,99,235,.32),transparent_42%),linear-gradient(45deg,rgba(16,185,129,.18),transparent_55%)]" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:44px_44px]" />
          <div className="relative mx-auto max-w-7xl px-4 py-14 md:py-18">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
              <div>
                <Badge className="mb-5 rounded-full border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-cyan-200">
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  Boutique numerique PROQUELEC
                </Badge>
                <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
                  Produits premium pour documents, applications et abonnements
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-300 md:text-lg">
                  Retrouvez les ressources commercialisables du CMS, les outils professionnels et les
                  offres d'acces dans une boutique unique synchronisee avec les reglages de paiement.
                </p>
              </div>

              <div className="rounded-lg border border-white/10 bg-white/10 p-5 shadow-2xl shadow-blue-950/30 backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase text-slate-400">Catalogue actif</p>
                    <p className="mt-1 text-3xl font-black">{totalProducts}</p>
                  </div>
                  <div className="rounded-lg bg-blue-500 p-3">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md bg-white/10 p-3">
                    <p className="text-xl font-black">{documentProducts.length}</p>
                    <p className="text-[11px] text-slate-300">Docs</p>
                  </div>
                  <div className="rounded-md bg-white/10 p-3">
                    <p className="text-xl font-black">{applicationProducts.length}</p>
                    <p className="text-[11px] text-slate-300">Apps</p>
                  </div>
                  <div className="rounded-md bg-white/10 p-3">
                    <p className="text-xl font-black">{visiblePlans.length}</p>
                    <p className="text-[11px] text-slate-300">Plans</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-md bg-slate-950/50 px-3 py-2 text-xs">
                  <span className="text-slate-300">Paiement</span>
                  <span className="font-black uppercase text-emerald-300">{paymentGateway || 'paydunya'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-xl flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un document, une application, un abonnement..."
                className="h-12 rounded-lg border-slate-200 bg-slate-50 pl-12 text-sm font-semibold"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
              {categoryTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(tab.id);
                      document.getElementById(`shop-${tab.id}`)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={cn(
                      'flex min-w-[210px] items-center gap-3 rounded-lg border px-4 py-3 text-left transition',
                      isActive
                        ? tab.color
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50',
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>
                      <span className="block text-sm font-black">{tab.label}</span>
                      <span className={cn('block text-[11px]', isActive ? 'opacity-80' : 'text-slate-500')}>
                        {tab.subtitle}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl space-y-14 px-4 py-12">
          <section id="shop-documents" className="scroll-mt-28">
            <SectionHeader
              eyebrow="Categorie numerique"
              title="Documents techniques"
              description="Documents telechargeables centralises depuis l'admin tools-manager. Les prix et fichiers proviennent du catalogue documentaire monetise."
              icon={FileText}
              count={filteredDocuments.length}
            />
            {filteredDocuments.length === 0 ? (
              <EmptyState
                title="Aucun document monetise disponible"
                description="Ajoutez des documents telechargeables et activez leur monetisation dans l'admin tools-manager pour les afficher ici."
              />
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredDocuments.map((product) => (
                  <article
                    key={product.id}
                    className="flex overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/10"
                  >
                    <div className="flex min-w-0 flex-1 flex-col">
                      <ProductVisual tone="document">
                        <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                          {product.category || 'Document'}
                        </span>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/60">
                            PROQUELEC
                          </p>
                          <h3 className="mt-2 line-clamp-2 text-xl font-black leading-tight">
                            {product.name}
                          </h3>
                        </div>
                      </ProductVisual>
                      <div className="flex flex-1 flex-col p-5">
                        <p className="line-clamp-3 text-sm font-semibold leading-relaxed text-slate-600">
                          {product.description || 'Document technique telechargeable.'}
                        </p>
                        <div className="mt-5 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-black uppercase text-slate-400">Prix</p>
                            <p className="text-lg font-black text-slate-950">
                              {formatPrice(product.price, currency)}
                            </p>
                          </div>
                          <Button
                            className="rounded-lg bg-blue-700 px-4 font-black text-white hover:bg-blue-800"
                            onClick={() => handleAddDocument(product)}
                          >
                            {product.price <= 0 ? (
                              <Download className="h-4 w-4" />
                            ) : (
                              <ShoppingCart className="h-4 w-4" />
                            )}
                            {product.price <= 0 ? 'Telecharger' : 'Ajouter'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section id="shop-applications" className="scroll-mt-28">
            <SectionHeader
              eyebrow="Categorie numerique"
              title="Applications premium"
              description="Outils professionnels, calculateurs et assistants metier. Chaque fiche redirige vers la page detaillee de l'application."
              icon={BriefcaseBusiness}
              count={filteredApplications.length}
            />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredApplications.map((app) => {
                const Icon = app.icon as ComponentType<{ className?: string }>;
                const price = appPrices[app.id] || 25000;
                return (
                  <article
                    key={app.id}
                    className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/10"
                  >
                    <ProductVisual tone="application">
                      <div className="flex items-start justify-between gap-3">
                        <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                          {app.status === 'active' ? 'Disponible' : 'Bientot'}
                        </span>
                        <div className="rounded-md bg-white/15 p-2">
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/60">
                          {app.group}
                        </p>
                        <h3 className="mt-2 line-clamp-2 text-xl font-black leading-tight">
                          {app.title}
                        </h3>
                      </div>
                    </ProductVisual>
                    <div className="p-5">
                      <p className="line-clamp-3 min-h-[66px] text-sm font-semibold leading-relaxed text-slate-600">
                        {app.description}
                      </p>
                      {app.norme && (
                        <Badge variant="outline" className="mt-4 rounded-full bg-emerald-50 text-emerald-700">
                          {app.norme}
                        </Badge>
                      )}
                      <div className="mt-5 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-black uppercase text-slate-400">Acces</p>
                          <p className="text-lg font-black text-slate-950">{formatPrice(price, currency)}</p>
                        </div>
                        <Button
                          variant="outline"
                          className="rounded-lg border-emerald-200 bg-emerald-50 font-black text-emerald-700 hover:bg-emerald-100"
                          onClick={() => handleOpenApp(app)}
                        >
                          Voir
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section id="shop-subscriptions" className="scroll-mt-28">
            <SectionHeader
              eyebrow="Categorie numerique"
              title="Abonnements"
              description="Offres d'acces pour debloquer les ressources premium, les applications avancees et les services professionnels."
              icon={Layers3}
              count={filteredPlans.length}
            />
            {plansLoading ? (
              <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500">
                Chargement des offres...
              </div>
            ) : filteredPlans.length === 0 ? (
              <EmptyState
                title="Aucun abonnement trouve"
                description="Ajustez la recherche ou creez des plans actifs dans l'administration."
              />
            ) : (
              <div className="grid gap-5 lg:grid-cols-3">
                {filteredPlans.map((plan, index) => (
                  <article
                    key={plan.id}
                    className={cn(
                      'overflow-hidden rounded-lg border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl',
                      index === 1 ? 'border-amber-300 shadow-amber-900/10' : 'border-slate-200',
                    )}
                  >
                    <ProductVisual tone="subscription">
                      <div className="flex items-start justify-between">
                        <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                          {plan.is_premium ? 'Premium' : 'Acces'}
                        </span>
                        <Crown className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/70">
                          Abonnement
                        </p>
                        <h3 className="mt-2 text-2xl font-black leading-tight">{plan.name}</h3>
                      </div>
                    </ProductVisual>
                    <div className="flex min-h-[300px] flex-col p-5">
                      <p className="text-sm font-semibold leading-relaxed text-slate-600">
                        {plan.description || 'Offre premium PROQUELEC.'}
                      </p>
                      <div className="mt-5 flex items-end gap-2">
                        <span className="text-3xl font-black text-slate-950">
                          {formatPrice(plan.price, currency)}
                        </span>
                        <span className="pb-1 text-sm font-bold text-slate-500">{getBillingLabel(plan)}</span>
                      </div>
                      <ul className="mt-5 grid gap-3">
                        {(plan.features || []).slice(0, 5).map((feature) => (
                          <li key={feature} className="flex gap-2 text-sm font-semibold text-slate-600">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="mt-auto rounded-lg bg-slate-950 font-black text-white hover:bg-blue-900"
                        onClick={() => navigate('/abonnements')}
                      >
                        Souscrire
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>

        <section className="bg-white px-4 py-12">
          <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: 'Catalogue centralise',
                text: 'Les documents payants viennent du gestionnaire documentaire admin.',
              },
              {
                icon: Lock,
                title: 'Paiement synchronise',
                text: 'La boutique utilise le fournisseur de paiement configure dans les reglages.',
              },
              {
                icon: BadgeCheck,
                title: 'Acces numerique',
                text: 'Documents, outils et abonnements sont visibles dans une seule experience.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                  <Icon className="h-8 w-8 text-blue-700" />
                  <h3 className="mt-4 text-lg font-black text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">{item.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        {cartCount > 0 && (
          <div className="fixed bottom-6 right-6 z-40">
            <Link
              to="/abonnements"
              className="flex items-center gap-3 rounded-full bg-blue-700 px-5 py-3 text-sm font-black text-white shadow-2xl shadow-blue-900/30 transition hover:bg-blue-800"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartCount} article{cartCount > 1 ? 's' : ''} dans le panier
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  count,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  count: number;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-blue-700">
          <Icon className="h-4 w-4" />
          {eyebrow}
        </div>
        <h2 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{title}</h2>
        <p className="mt-3 max-w-3xl text-sm font-semibold leading-relaxed text-slate-600 md:text-base">
          {description}
        </p>
      </div>
      <Badge variant="outline" className="w-fit rounded-full bg-white px-4 py-2 text-slate-700">
        <BookOpen className="mr-2 h-4 w-4" />
        {count} element{count > 1 ? 's' : ''}
      </Badge>
    </div>
  );
}
