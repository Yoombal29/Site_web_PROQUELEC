import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CreditCard,
  Smartphone,
  Zap,
  Globe,
  Shield,
  Briefcase,
  ShoppingCart,
  Signal,
  Layers,
  ChevronDown,
  ChevronUp,
  Check,
  DollarSign,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

const PROVIDER_ICONS: Record<string, React.ReactNode> = {
  wave: <Zap className="w-5 h-5" />,
  orange: <Smartphone className="w-5 h-5" />,
  free: <Signal className="w-5 h-5" />,
  paytech: <Layers className="w-5 h-5" />,
  senepay: <CreditCard className="w-5 h-5" />,
  intouch: <Smartphone className="w-5 h-5" />,
  cinetpay: <Globe className="w-5 h-5" />,
  flutterwave: <Globe className="w-5 h-5" />,
  fedapay: <Shield className="w-5 h-5" />,
  kkiapay: <ShoppingCart className="w-5 h-5" />,
  julaya: <Briefcase className="w-5 h-5" />,
  paydunya: <Shield className="w-5 h-5" />,
  cash: <DollarSign className="w-5 h-5" />,
};

const PROVIDER_FIELDS: Record<string, { key: string; label: string; placeholder: string }[]> = {
  wave: [
    { key: 'WAVE_API_KEY', label: 'Clé API Wave', placeholder: 'wave_live_...' },
    { key: 'WAVE_SECRET_KEY', label: 'Clé secrète Wave', placeholder: '••••••••' },
  ],
  orange: [
    { key: 'ORANGE_CLIENT_ID', label: 'Client ID Orange', placeholder: 'orange_client_...' },
    { key: 'ORANGE_CLIENT_SECRET', label: 'Client Secret Orange', placeholder: '••••••••' },
    { key: 'ORANGE_MERCHANT_CODE', label: 'Code marchand Orange', placeholder: 'OM_MERCHANT_...' },
  ],
  free: [
    { key: 'FREE_API_KEY', label: 'Clé API Free Money', placeholder: 'free_live_...' },
    { key: 'FREE_MERCHANT_ID', label: 'ID Marchand Free', placeholder: 'FREE_...' },
  ],
  paytech: [
    { key: 'PAYTECH_API_KEY', label: 'Clé API PayTech', placeholder: 'paytech_live_...' },
    { key: 'PAYTECH_SECRET_KEY', label: 'Clé secrète PayTech', placeholder: '••••••••' },
  ],
  senepay: [
    { key: 'SENEPAY_API_KEY', label: 'Clé API SenePay', placeholder: 'sp_live_...' },
    { key: 'SENEPAY_SECRET', label: 'Clé secrète SenePay', placeholder: '••••••••' },
  ],
  intouch: [
    { key: 'INTOUCH_API_KEY', label: 'Clé API InTouch', placeholder: 'it_live_...' },
    { key: 'INTOUCH_MERCHANT_ID', label: 'ID Marchand InTouch', placeholder: 'IT_...' },
  ],
  cinetpay: [
    { key: 'CINETPAY_API_KEY', label: 'Clé API CinetPay', placeholder: 'cp_live_...' },
    { key: 'CINETPAY_SITE_ID', label: 'Site ID CinetPay', placeholder: 'CP_SITE_...' },
  ],
  flutterwave: [
    { key: 'FW_SECRET_KEY', label: 'Clé secrète Flutterwave', placeholder: 'FLWSECK_...' },
  ],
  fedapay: [
    { key: 'FEDAPAY_API_KEY', label: 'Clé API FedaPay', placeholder: 'fp_live_...' },
    { key: 'FEDAPAY_SECRET', label: 'Clé secrète FedaPay', placeholder: '••••••••' },
  ],
  kkiapay: [
    { key: 'KKIAPAY_API_KEY', label: 'Clé API Kkiapay', placeholder: 'kk_live_...' },
    { key: 'KKIAPAY_SECRET', label: 'Clé secrète Kkiapay', placeholder: '••••••••' },
  ],
  julaya: [{ key: 'JULAYA_API_KEY', label: 'Clé API Julaya', placeholder: 'jl_live_...' }],
  paydunya: [
    { key: 'PAYDUNYA_API_KEY', label: 'Clé API PayDunya', placeholder: 'pd_live_...' },
    { key: 'PAYDUNYA_SECRET_KEY', label: 'Clé secrète PayDunya', placeholder: '••••••••' },
  ],
};

const PROVIDERS_META = [
  {
    name: 'wave',
    label: 'Wave Business',
    fee: '1%',
    settlement: 'Immédiat',
    target: 'Boutiques physiques et e-commerce local',
    type: 'Opérateur Direct',
    methods: 'Wave',
    color: 'bg-blue-500',
  },
  {
    name: 'orange',
    label: 'Orange Money Web',
    fee: '1% (Plafonné 500 F)',
    settlement: '24h à 48h',
    target: 'Grandes entreprises, services de masse',
    type: 'Opérateur Direct',
    methods: 'Orange Money',
    color: 'bg-orange-500',
  },
  {
    name: 'free',
    label: 'Free Money',
    fee: '1% à 1,5%',
    settlement: '24h à 48h',
    target: 'PME voulant toucher tous les abonnés Free',
    type: 'Opérateur Direct',
    methods: 'Free Money',
    color: 'bg-red-500',
  },
  {
    name: 'paytech',
    label: 'PayTech',
    fee: '1,5% à 3%',
    settlement: '24h à 72h',
    target: 'Développeurs, start-ups et TPE locales',
    type: 'Agrégateur Local',
    methods: 'Wave, OM, Free, Cartes',
    color: 'bg-purple-500',
  },
  {
    name: 'senepay',
    label: 'SenePay',
    fee: '1,8% + frais op.',
    settlement: '24h à 48h',
    target: 'E-commerce moderne, intégration rapide',
    type: 'Agrégateur Local',
    methods: 'Wave, OM, Free, Int.',
    color: 'bg-green-500',
  },
  {
    name: 'intouch',
    label: 'InTouch (TouchPay)',
    fee: '2% à 3,5%',
    settlement: '48h à 72h',
    target: 'Réseaux physiques, stations, grands comptes',
    type: 'Agrégateur Local',
    methods: 'Wave, OM, Free, Cartes, Wari',
    color: 'bg-indigo-500',
  },
  {
    name: 'cinetpay',
    label: 'CinetPay',
    fee: '1,5% à 3,5%',
    settlement: '72h',
    target: 'Entreprises visant le Sénégal + la sous-région',
    type: 'Panafricain',
    methods: 'Wave, OM, Free, Cartes (15 pays)',
    color: 'bg-teal-500',
  },
  {
    name: 'flutterwave',
    label: 'Flutterwave',
    fee: '2,9% (local) / 3,8% (inter)',
    settlement: '48h à 72h',
    target: 'SaaS, start-ups globales, Shopify',
    type: 'Panafricain/Global',
    methods: 'Mobile Money locaux, Cartes Internationales',
    color: 'bg-pink-500',
  },
  {
    name: 'fedapay',
    label: 'FedaPay',
    fee: '1% à 4% selon méthode',
    settlement: '72h',
    target: "E-commerçants d'Afrique de l'Ouest",
    type: 'Panafricain',
    methods: 'Mobile Money, Cartes Bancaires',
    color: 'bg-cyan-500',
  },
  {
    name: 'kkiapay',
    label: 'Kkiapay',
    fee: '2,5% à 3,5%',
    settlement: '48h',
    target: 'Petites boutiques e-commerce (WooCommerce)',
    type: 'Panafricain',
    methods: 'Mobile Money (Wave, OM), Cartes',
    color: 'bg-yellow-500',
  },
  {
    name: 'julaya',
    label: 'Julaya (B2B)',
    fee: 'Sur mesure',
    settlement: 'Immédiat',
    target: 'Entreprises (Paiement salaires/fournisseurs)',
    type: 'Panafricain (B2B)',
    methods: 'Comptes bancaires, Mobile Money',
    color: 'bg-gray-500',
  },
  {
    name: 'paydunya',
    label: 'PayDunya',
    fee: 'Variable selon contrat',
    settlement: '48h à 72h',
    target: 'Tous types de paiement au Sénégal',
    type: 'Agrégateur Local',
    methods: 'OM, Wave, Free, Cartes',
    color: 'bg-emerald-500',
  },
  {
    name: 'cash',
    label: '💰 Paiement Espèces',
    fee: '0%',
    settlement: 'Immédiat',
    target: 'Clients de proximité, boutiques physiques, paiement sur facture',
    type: 'Hors-ligne',
    methods: 'Espèces, Chèque, Virement bancaire',
    color: 'bg-green-600',
  },
];

// ─── Aide à la configuration par provider ───
const PROVIDER_HELP: Record<string, { steps: string[]; link?: string }> = {
  wave: {
    steps: [
      'Créez un compte marchand sur https://wave.com/business',
      'Dans votre dashboard Wave, allez dans "API" → "Générer une clé"',
      'Copiez la Clé API (api_key) et la Clé secrète (secret_key)',
      'Collez-les dans les champs ci-dessous et cliquez sur "Test"',
    ],
    link: 'https://wave.com/business',
  },
  orange: {
    steps: [
      'Rendez-vous sur https://developer.orange.com',
      'Créez un compte développeur Orange',
      'Créez une application et activez l\'API "Orange Money Web"',
      'Récupérez le Client ID et Client Secret',
      'Contactez Orange Sénégal pour obtenir votre Code Marchand',
      "Configurez l'URL de callback : https://votresite.com/api/webhooks/orange",
    ],
    link: 'https://developer.orange.com',
  },
  free: {
    steps: [
      'Contactez le service commercial Free Sénégal pour activer Free Money Marchand',
      'Une fois activé, vous recevrez votre API Key et Merchant ID',
      "Configurez l'URL de notification : https://votresite.com/api/webhooks/free",
    ],
  },
  paytech: {
    steps: [
      'Inscrivez-vous sur https://paytech.sn',
      'Activez votre compte marchand (documents requis : CNI, NINEA, RCCM)',
      'Depuis le dashboard, allez dans "API" → "Mes Clés"',
      'Copiez la clé API et la clé secrète',
      "Configurez l'IPN URL : https://votresite.com/api/webhooks/paytech",
    ],
    link: 'https://paytech.sn',
  },
  senepay: {
    steps: [
      'Créez un compte sur https://senepay.sn',
      'Soumettez vos documents pour validation marchand',
      'Une fois approuvé, générez vos clés API depuis le dashboard',
      "Définissez l'URL de callback : https://votresite.com/api/webhooks/senepay",
    ],
    link: 'https://senepay.sn',
  },
  intouch: {
    steps: [
      'Contactez le service commercial InTouch (ex-TouchPay)',
      'Un contrat est signé avec des frais négociés (2% à 3,5%)',
      'Vous recevrez un Merchant ID et une clé API',
      'Intégration technique via leur API REST',
    ],
  },
  cinetpay: {
    steps: [
      'Créez un compte sur https://cinetpay.com',
      'Activez votre site marchand depuis le dashboard',
      'Récupérez votre API Key et Site ID',
      'URL notification : https://votresite.com/api/webhooks/cinetpay',
    ],
    link: 'https://cinetpay.com',
  },
  flutterwave: {
    steps: [
      'Inscrivez-vous sur https://dashboard.flutterwave.com/register',
      'Après validation, allez dans "Settings" → "API"',
      'Copiez votre Secret Key (FLWSECK-)',
      "Pour le test, utilisez l'environnement sandbox d'abord",
    ],
    link: 'https://flutterwave.com',
  },
  fedapay: {
    steps: [
      'Créez un compte sur https://fedapay.com',
      'Activez votre compte marchand',
      'Générez votre clé API depuis le dashboard',
      "Configurez l'URL de callback pour les notifications",
    ],
    link: 'https://fedapay.com',
  },
  kkiapay: {
    steps: [
      'Inscrivez-vous sur https://kkiapay.com',
      'Obtenez votre clé API et votre clé secrète',
      'Intégration simple via leur API REST ou SDK',
    ],
    link: 'https://kkiapay.com',
  },
  julaya: {
    steps: [
      'Contactez Julaya pour un contrat B2B sur mesure',
      'Utilisé principalement pour les paiements de masse (salaires, fournisseurs)',
      "L'intégration se fait via API bancaire",
    ],
    link: 'https://julaya.com',
  },
  paydunya: {
    steps: [
      'Créez un compte sur https://app.paydunya.com',
      'Activez votre boutique et validez vos documents',
      'Depuis le dashboard → "API" : copiez API Key et Secret Key',
      "Configurez l'IPN URL : https://votresite.com/api/webhooks/paydunya",
      "Mode test : utilisez les clés sandbox d'abord",
    ],
    link: 'https://paydunya.com',
  },
  cash: {
    steps: [
      '✅ Aucune configuration technique requise',
      'Le client règle en espèces, chèque ou virement directement',
      'Vous marquez la commande comme "payée" manuellement',
      'Idéal pour : paiement sur facture, livraison, vente en boutique',
    ],
  },
};

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export default function AdminPaymentPanel() {
  const { toast } = useToast();
  const [providers, setProviders] = useState<Record<string, boolean>>({});
  const [defaultProvider, setDefaultProvider] = useState('paydunya');
  const [expandedConfig, setExpandedConfig] = useState<string | null>(null);
  const [expandedHelp, setExpandedHelp] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
    loadTransactions();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/payment-settings', { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || {});
        setDefaultProvider(data.default_provider || 'paydunya');
        setApiKeys(data.api_keys || {});
      } else {
        // Initialize defaults
        const defaults: Record<string, boolean> = {};
        PROVIDERS_META.forEach((p) => {
          defaults[p.name] = false;
        });
        defaults.paydunya = true; // PayDunya enabled by default
        setProviders(defaults);
      }
    } catch (err) {
      console.error('Failed to load payment settings:', err);
    }
    setLoading(false);
  };

  const loadTransactions = async () => {
    try {
      const res = await fetch('/api/admin/payment-transactions', { headers: authHeaders() });
      if (res.ok) setTransactions(await res.json());
    } catch (err) {
      /* ignore */
    }
  };

  const saveSettings = async (
    updatedProviders: Record<string, boolean>,
    updatedDefault?: string,
    updatedKeys?: Record<string, string>,
  ) => {
    try {
      await fetch('/api/admin/payment-settings', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          providers: updatedProviders || providers,
          default_provider: updatedDefault || defaultProvider,
          api_keys: updatedKeys || apiKeys,
        }),
      });
      toast({ title: '✅ Paramètres de paiement enregistrés' });
    } catch (err) {
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder', variant: 'destructive' });
    }
  };

  const toggleProvider = (name: string, enabled: boolean) => {
    const updated = { ...providers, [name]: enabled };
    setProviders(updated);
    saveSettings(updated);
  };

  const setDefault = (name: string) => {
    if (!providers[name]) {
      toast({ title: "⚠️ Activez d'abord ce fournisseur", variant: 'destructive' });
      return;
    }
    setDefaultProvider(name);
    saveSettings(providers, name);
  };

  const testConnection = async (name: string) => {
    setTestingProvider(name);
    try {
      const res = await fetch(`/api/admin/payment-providers/${name}/test`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ api_keys: apiKeys }),
      });
      const data = await res.json();
      toast({
        title: data.success ? '✅ Connexion réussie' : '❌ Échec de connexion',
        description: data.message || data.error || '',
        variant: data.success ? 'default' : 'destructive',
      });
    } catch (err) {
      toast({ title: '❌ Erreur de test', variant: 'destructive' });
    }
    setTestingProvider(null);
  };

  const saveApiKey = (providerName: string, key: string, value: string) => {
    const updated = { ...apiKeys, [key]: value };
    setApiKeys(updated);
    saveSettings(providers, defaultProvider, updated);
  };

  if (loading)
    return <div className="p-8 text-center">Chargement des paramètres de paiement...</div>;

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">💳 Configuration des Paiements</h2>
        <span className="text-xs text-slate-500">
          {Object.values(providers).filter(Boolean).length}/{PROVIDERS_META.length} actifs
        </span>
      </div>

      {/* Provider Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PROVIDERS_META.map((meta) => (
          <Card
            key={meta.name}
            className={`relative overflow-hidden border-l-4 ${providers[meta.name] ? 'border-l-green-500' : 'border-l-slate-300'}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 ${meta.color} rounded-lg flex items-center justify-center text-white`}
                  >
                    {PROVIDER_ICONS[meta.name] || <CreditCard className="w-4 h-4" />}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">{meta.label}</CardTitle>
                    <span className="text-[10px] text-slate-400">{meta.type}</span>
                  </div>
                </div>
                <Switch
                  checked={providers[meta.name] || false}
                  onCheckedChange={(checked) => toggleProvider(meta.name, checked)}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-3 gap-2 mb-2 text-[10px]">
                <div>
                  <span className="text-slate-400">Frais:</span> <strong>{meta.fee}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Reversement:</span>{' '}
                  <strong>{meta.settlement}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Moyens:</span>
                  <strong className="block truncate" title={meta.methods}>
                    {meta.methods}
                  </strong>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mb-2">{meta.target}</p>

              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={defaultProvider === meta.name ? 'default' : 'outline'}
                  className="text-[10px] h-6 px-2"
                  onClick={() => setDefault(meta.name)}
                >
                  {defaultProvider === meta.name ? '⭐ Par défaut' : 'Défaut'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-[10px] h-6 px-2"
                  onClick={() => setExpandedConfig(expandedConfig === meta.name ? null : meta.name)}
                >
                  {expandedConfig === meta.name ? '▲' : '▼'} Config
                </Button>
                {meta.name !== 'cash' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[10px] h-6 px-2"
                    onClick={() => testConnection(meta.name)}
                    disabled={testingProvider === meta.name}
                  >
                    {testingProvider === meta.name ? '🔄' : '🔍 Test'}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-[10px] h-6 px-1 text-slate-400 hover:text-blue-500"
                  onClick={() => setExpandedHelp(expandedHelp === meta.name ? null : meta.name)}
                  title="Aide à la configuration"
                >
                  <HelpCircle className="w-3 h-3" />
                </Button>
              </div>

              {/* Help section */}
              {expandedHelp === meta.name && PROVIDER_HELP[meta.name] && (
                <div className="mt-3 pt-3 border-t border-blue-200 bg-blue-50/50 rounded-lg p-3">
                  <h5 className="text-[10px] font-bold uppercase text-blue-600 mb-2">
                    📖 Comment configurer {meta.label}
                  </h5>
                  <ol className="space-y-1.5">
                    {PROVIDER_HELP[meta.name].steps.map((step, i) => (
                      <li key={i} className="text-[10px] text-slate-600 flex gap-2">
                        <span className="text-blue-500 font-bold w-4 shrink-0">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                  {PROVIDER_HELP[meta.name].link && (
                    <a
                      href={PROVIDER_HELP[meta.name].link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-[10px] text-blue-600 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Ouvrir le site {meta.label}
                    </a>
                  )}
                </div>
              )}

              {/* Expanded API Key Configuration */}
              {expandedConfig === meta.name && PROVIDER_FIELDS[meta.name] && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  {PROVIDER_FIELDS[meta.name].map((field) => (
                    <div key={field.key}>
                      <Label className="text-[10px]">{field.label}</Label>
                      <Input
                        className="h-7 text-xs"
                        type="password"
                        value={apiKeys[field.key] || ''}
                        onChange={(e) => saveApiKey(meta.name, field.key, e.target.value)}
                        placeholder={field.placeholder}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transaction Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📋 Transactions récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-slate-400 italic text-center py-4">
              Aucune transaction pour le moment.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Provider</th>
                    <th className="p-2 text-right">Montant</th>
                    <th className="p-2 text-center">Statut</th>
                    <th className="p-2 text-left">Référence</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx: any) => (
                    <tr key={tx.id} className="border-b hover:bg-slate-50">
                      <td className="p-2">{new Date(tx.created_at).toLocaleDateString('fr-FR')}</td>
                      <td className="p-2 font-medium">{tx.provider || '-'}</td>
                      <td className="p-2 text-right">{tx.amount?.toLocaleString()} FCFA</td>
                      <td className="p-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            tx.payment_status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : tx.payment_status === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {tx.payment_status}
                        </span>
                      </td>
                      <td className="p-2 font-mono text-[10px]">{tx.reference?.slice(0, 20)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
