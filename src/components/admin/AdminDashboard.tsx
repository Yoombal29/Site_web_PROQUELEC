import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Settings, BarChart3, Users, FileText, Palette, Zap, Mail,
  Shield, Globe, Lock, Image, Database, Cpu, Eye, Brain,
  ChevronRight, Plus, Trash2, Edit2, Save, X, Copy, RefreshCw,
  Calendar, TrendingUp, Clock, AlertCircle, CheckCircle, Search,
  Filter, Download, Upload, Share2, Bell, Menu, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
// SECTION: Imports stratégiques
import { useSiteSettings } from '@/hooks/useSiteSettings';
// Note: Les panels spécifiques (Galerie, Partenaires) ont été migrés vers des onglets directs pour plus de clarté.

interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

interface SiteParameter {
  id: string;
  name: string;
  value: string | number | boolean;
  type: 'text' | 'number' | 'boolean' | 'color' | 'email' | 'textarea' | 'select';
  options?: { label: string; value: string }[];
  category: string;
  description?: string;
  required?: boolean;
}

const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const { settings } = useSiteSettings();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingParams, setEditingParams] = useState<Record<string, any>>({});
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['general', 'display']));

  // Mock analytics data
  const analyticsData = [
    { name: 'Lun', visits: 2400, users: 2210 },
    { name: 'Mar', visits: 1398, users: 2290 },
    { name: 'Mer', visits: 9800, users: 2000 },
    { name: 'Jeu', visits: 3908, users: 2108 },
    { name: 'Ven', visits: 4800, users: 2289 },
    { name: 'Sam', visits: 3800, users: 2000 },
    { name: 'Dim', visits: 4300, users: 2100 }
  ];

  const pageStatsData = [
    { name: 'Accueil', value: 2400 },
    { name: 'Services', value: 1398 },
    { name: 'Blog', value: 9800 },
    { name: 'Contact', value: 3908 },
    { name: 'Formations', value: 4800 }
  ];

  const COLORS = ['#2376df', '#054393', '#1a73e8', '#16a34a', '#ea580c'];

  // Tous les paramètres configurables du site
  const allSiteParameters: SiteParameter[] = [
    // Général
    { id: 'site_name', name: 'Nom du site', value: (settings as any)?.site_name || 'PROQUELEC', type: 'text', category: 'general', required: true, description: "Le nom principal qui apparaît dans l'onglet du navigateur et les résultats Google." },
    { id: 'site_description', name: 'Description du site', value: (settings as any)?.site_description || '', type: 'textarea', category: 'general', description: "Une phrase courte décrivant votre activité. Utilisée par défaut si une page n'a pas de description spécifique." },
    { id: 'site_url', name: 'URL du site', value: (settings as any)?.site_url || 'https://proquelec.sn', type: 'text', category: 'general', required: true, description: "L'adresse web officielle de votre site. Important pour le référencement." },
    { id: 'site_logo', name: 'Logo du site (URL)', value: (settings as any)?.site_logo || '', type: 'text', category: 'general', description: "Lien vers l'image de votre logo. Utilisez le gestionnaire de fichiers pour en uploader un nouveau." },

    // Contacts
    { id: 'contact_email', name: 'Email de contact', value: settings?.contact_email || 'contact@proquelec.sn', type: 'email', category: 'contact', required: true, description: "L'adresse où les visiteurs enverront leurs messages depuis le formulaire de contact." },
    { id: 'support_email', name: 'Email de support', value: (settings as any)?.support_email || 'support@proquelec.sn', type: 'email', category: 'contact', description: "Email technique affiché en cas de problème (optionnel)." },
    { id: 'phone', name: 'Téléphone principal', value: (settings as any)?.phone || '+221 33 xxx xxxx', type: 'text', category: 'contact', description: "Numéro affiché en haut du site et dans le pied de page." },
    { id: 'phone_whatsapp', name: 'WhatsApp', value: (settings as any)?.phone_whatsapp || '+221 76 644 76 06', type: 'text', category: 'contact', description: "Numéro pour le bouton de chat WhatsApp flottant." },
    { id: 'address', name: 'Adresse', value: settings?.address || 'Dakar, Sénégal', type: 'textarea', category: 'contact', description: "Adresse physique de vos bureaux affichée dans le pied de page." },

    // Réseaux sociaux
    { id: 'social_facebook', name: 'Facebook', value: (settings as any)?.social_facebook || '', type: 'text', category: 'social', description: "Lien complet vers votre page Facebook (ex: https://facebook.com/votrepage)." },
    { id: 'social_linkedin', name: 'LinkedIn', value: (settings as any)?.social_linkedin || '', type: 'text', category: 'social', description: "Lien vers votre profil ou page entreprise LinkedIn." },
    { id: 'social_twitter', name: 'Twitter/X', value: (settings as any)?.social_twitter || '', type: 'text', category: 'social', description: "Lien vers votre compte Twitter/X." },
    { id: 'social_instagram', name: 'Instagram', value: (settings as any)?.social_instagram || '', type: 'text', category: 'social', description: "Lien vers votre profil Instagram." },
    { id: 'social_youtube', name: 'YouTube', value: (settings as any)?.social_youtube || '', type: 'text', category: 'social', description: "Lien vers votre chaîne YouTube." },

    // Affichage/Design
    { id: 'theme_primary_color', name: 'Couleur primaire', value: (settings as any)?.theme_primary_color || '#2376df', type: 'color', category: 'display', description: "Couleur principale du site (boutons, titres, liens)." },
    { id: 'theme_secondary_color', name: 'Couleur secondaire', value: (settings as any)?.theme_secondary_color || '#054393', type: 'color', category: 'display', description: "Couleur utilisée pour les dégradés et éléments secondaires." },
    { id: 'theme_accent_color', name: 'Couleur d\'accent', value: (settings as any)?.theme_accent_color || '#16a34a', type: 'color', category: 'display', description: "Couleur de mise en valeur (ex: badges 'Nouveau', succès)." },
    { id: 'theme_dark_mode_enabled', name: 'Mode sombre activé', value: (settings as any)?.theme_dark_mode_enabled || false, type: 'boolean', category: 'display', description: "Autoriser les visiteurs à basculer le site en mode sombre (fond noir)." },
    {
      id: 'header_style', name: 'Style du header', value: (settings as any)?.header_style || 'sticky', type: 'select', category: 'display', description: "Comment le menu du haut se comporte quand on défile.", options: [
        { label: 'Fixe (Sticky) - Reste visible', value: 'sticky' },
        { label: 'Classique - Disparaît au défilement', value: 'classic' },
        { label: 'Transparent - Fond invisible au début', value: 'transparent' }
      ]
    },
    {
      id: 'footer_style', name: 'Style du footer', value: (settings as any)?.footer_style || 'dark', type: 'select', category: 'display', description: "Apparence de la section tout en bas du site.", options: [
        { label: 'Sombre (Standard)', value: 'dark' },
        { label: 'Clair', value: 'light' },
        { label: 'Dégradé (Moderne)', value: 'gradient' }
      ]
    },

    // SEO
    { id: 'seo_enabled', name: 'SEO activé', value: true, type: 'boolean', category: 'seo', description: "Activer les optimisations automatiques pour Google." },
    { id: 'seo_meta_title', name: 'Titre meta par défaut', value: (settings as any)?.seo_meta_title || 'PROQUELEC - Qualité Électrique au Sénégal', type: 'text', category: 'seo', description: "Titre par défaut si une page n'en a pas. C'est ce qu'on voit en bleu sur Google." },
    { id: 'seo_meta_description', name: 'Description meta', value: (settings as any)?.seo_meta_description || '', type: 'textarea', category: 'seo', description: "Résumé par défaut pour Google. Essayez de donner envie de cliquer !" },
    { id: 'seo_meta_keywords', name: 'Mots-clés', value: (settings as any)?.seo_meta_keywords || '', type: 'textarea', category: 'seo', description: "Liste de mots séparés par des virgules (ex: électricité, dakar, installation). Moins important aujourd'hui." },
    { id: 'analytics_google_id', name: 'Google Analytics ID', value: (settings as any)?.analytics_google_id || '', type: 'text', category: 'seo', description: "Votre identifiant de suivi (ex: G-XXXXXXXXXX) pour voir les statistiques." },

    // Sécurité
    { id: 'admin_require_2fa', name: '2FA requis pour admin', value: (settings as any)?.admin_require_2fa || false, type: 'boolean', category: 'security', description: "Obliger les administrateurs à utiliser une double authentification (plus sûr)." },
    { id: 'enable_api_key', name: 'API activée', value: (settings as any)?.enable_api_key || false, type: 'boolean', category: 'security', description: "Pour les développeurs : autoriser l'accès aux données via une clé API." },
    { id: 'ssl_enabled', name: 'SSL/HTTPS forcé', value: true, type: 'boolean', category: 'security', description: "Rediriger automatiquement vers la version sécurisée (cadenas vert) du site." },
    { id: 'password_min_length', name: 'Longueur min. password', value: (settings as any)?.password_min_length || 8, type: 'number', category: 'security', description: "Nombre minimum de caractères pour les mots de passe des utilisateurs." },

    // Performances
    { id: 'cache_enabled', name: 'Cache activé', value: (settings as any)?.cache_enabled || true, type: 'boolean', category: 'performance', description: "Garder en mémoire les pages pour qu'elles s'affichent plus vite." },
    { id: 'cache_ttl', name: 'Temps de cache (sec)', value: (settings as any)?.cache_ttl || 3600, type: 'number', category: 'performance', description: "Combien de temps garder une page en mémoire avant de la recharger (3600s = 1h)." },
    { id: 'cdn_enabled', name: 'CDN activé', value: (settings as any)?.cdn_enabled || false, type: 'boolean', category: 'performance', description: "Utiliser un réseau mondial pour servir les images plus vite (avancé)." },
    { id: 'image_optimization', name: 'Optimisation images', value: (settings as any)?.image_optimization || true, type: 'boolean', category: 'performance', description: "Réduire automatiquement la taille des images pour accélérer le site." },

    // Email
    {
      id: 'email_provider', name: 'Fournisseur email', value: (settings as any)?.email_provider || 'sendgrid', type: 'select', category: 'email', description: "Le service technique utilisé pour envoyer les mails.", options: [
        { label: 'SendGrid (Recommandé)', value: 'sendgrid' },
        { label: 'Mailgun', value: 'mailgun' },
        { label: 'SMTP (Serveur perso)', value: 'smtp' }
      ]
    },
    { id: 'email_from_name', name: 'Nom d\'expéditeur', value: (settings as any)?.email_from_name || 'PROQUELEC', type: 'text', category: 'email', description: "Le nom que les gens verront dans leur boîte mail quand vous leur écrivez." },
    { id: 'email_from_address', name: 'Email d\'expéditeur', value: (settings as any)?.email_from_address || 'noreply@proquelec.sn', type: 'email', category: 'email', description: "L'adresse mail qui apparait comme expéditeur (doit être valide)." },
    { id: 'notification_emails', name: 'Emails notification', value: (settings as any)?.notification_emails || '', type: 'textarea', category: 'email', description: "Adresses qui recevront les alertes du site (contact, commandes...), séparées par des virgules." },

    // Intégrations
    { id: 'stripe_enabled', name: 'Stripe activé', value: (settings as any)?.stripe_enabled || false, type: 'boolean', category: 'integrations', description: "Activer le paiement par carte bancaire via Stripe." },
    { id: 'paypal_enabled', name: 'PayPal activé', value: (settings as any)?.paypal_enabled || false, type: 'boolean', category: 'integrations', description: "Activer le paiement via PayPal." },
    { id: 'slack_webhook', name: 'Slack Webhook', value: (settings as any)?.slack_webhook || '', type: 'text', category: 'integrations', description: "URL pour envoyer des notifications automatiques sur votre canal Slack." },
    { id: 'google_maps_api', name: 'Google Maps API Key', value: (settings as any)?.google_maps_api || '', type: 'text', category: 'integrations', description: "Clé nécessaire pour afficher les cartes Google Maps sur le site." },
  ];

  // Filtrer par recherche
  const filteredParameters = useMemo(() => {
    return allSiteParameters.filter(param =>
      param.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      param.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Grouper par catégorie
  const categorizedParams = useMemo(() => {
    const grouped: Record<string, SiteParameter[]> = {};
    filteredParameters.forEach(param => {
      if (!grouped[param.category]) {
        grouped[param.category] = [];
      }
      grouped[param.category].push(param);
    });
    return grouped;
  }, [filteredParameters]);

  const handleParameterChange = (paramId: string, value: any) => {
    setEditingParams(prev => ({
      ...prev,
      [paramId]: value
    }));
  };

  const handleSaveParameters = async () => {
    try {
      // Save to localStorage for now (can be extended to Supabase)
      localStorage.setItem('site_parameters', JSON.stringify(editingParams));
      toast({
        title: 'Succès',
        description: 'Paramètres mis à jour avec succès',
        variant: 'default'
      });
      setEditingParams({});
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la mise à jour des paramètres',
        variant: 'destructive'
      });
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer une description',
        variant: 'destructive'
      });
      return;
    }

    setAiLoading(true);
    try {
      // Appel à la Edge Function via Supabase
      const { data, error } = await supabase.functions.invoke('ai-code-assistant', {
        body: {
          prompt: aiPrompt,
          context: 'general_content_generation',
          currentCode: '',
          pageId: 'dashboard',
          userId: 'admin'
        }
      });

      if (error) throw error;

      if (data && (data.code || data.text)) {
        toast({
          title: 'Succès',
          description: 'Contenu généré avec l\'IA',
          variant: 'default'
        });
        setAiPrompt('');
      } else {
        throw new Error('Pas de réponse de l\'IA');
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de la génération IA',
        variant: 'destructive'
      });
    } finally {
      setAiLoading(false);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const CATEGORY_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    general: { label: 'Général', icon: <Globe className="w-5 h-5" />, color: 'bg-blue-50' },
    contact: { label: 'Contact', icon: <Mail className="w-5 h-5" />, color: 'bg-green-50' },
    social: { label: 'Réseaux Sociaux', icon: <Share2 className="w-5 h-5" />, color: 'bg-purple-50' },
    display: { label: 'Affichage', icon: <Palette className="w-5 h-5" />, color: 'bg-pink-50' },
    seo: { label: 'SEO', icon: <Eye className="w-5 h-5" />, color: 'bg-orange-50' },
    security: { label: 'Sécurité', icon: <Shield className="w-5 h-5" />, color: 'bg-red-50' },
    performance: { label: 'Performances', icon: <Cpu className="w-5 h-5" />, color: 'bg-cyan-50' },
    email: { label: 'Email', icon: <Mail className="w-5 h-5" />, color: 'bg-yellow-50' },
    integrations: { label: 'Intégrations', icon: <Zap className="w-5 h-5" />, color: 'bg-indigo-50' },
  };

  /**
   * CONFIGURATION DES ONGLETS STRATÉGIQUES
   * On ne conserve ici que les fonctions de pilotage global (Santé du site, Paramètres, IA).
   * Le contenu (Galerie, Blog, Pages, etc.) est géré par les onglets directs de la barre latérale.
   */
  const tabs: TabConfig[] = [
    { id: 'overview', label: 'Aperçu Global', icon: <BarChart3 className="w-5 h-5" />, color: 'text-blue-600' },
    { id: 'settings', label: 'Configuration Site', icon: <Settings className="w-5 h-5" />, color: 'text-green-600' },
    { id: 'ai', label: 'Assistant IA', icon: <Brain className="w-5 h-5" />, color: 'text-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                A
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Gestion complète du site</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition">
                Profil
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b sticky top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition flex items-center gap-2 ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* SECTION : APERÇU GLOBAL - Monitoring de la santé du site et du trafic visiteur */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI : Indicateurs de performance clés */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Visites</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">24.5K</p>
                    <p className="text-green-600 text-sm mt-2">↑ 12% ce mois</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Utilisateurs</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">1,234</p>
                    <p className="text-green-600 text-sm mt-2">↑ 8% ce mois</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Conversions</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">342</p>
                    <p className="text-green-600 text-sm mt-2">↑ 5% ce mois</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Revenus</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">$12.5K</p>
                    <p className="text-green-600 text-sm mt-2">↑ 15% ce mois</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trafic et Utilisateurs</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="visits" stroke="#2376df" />
                    <Line type="monotone" dataKey="users" stroke="#16a34a" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pages Populaires</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pageStatsData} cx="50%" cy="50%" labelLine={false} label={{ fontSize: 12 }} outerRadius={100} fill="#8884d8" dataKey="value">
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* SECTION : CONFIGURATION SITE - Contrôle des variables stratégiques (SEO, Branding, Sécurité) */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in">
            {/* Filtre de recherche rapide pour les paramètres */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-4">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un paramètre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 outline-none text-gray-900"
                />
              </div>
            </div>

            {/* Catégories de paramètres */}
            {Object.entries(categorizedParams).map(([category, params]) => {
              const categoryInfo = CATEGORY_LABELS[category];
              const isExpanded = expandedCategories.has(category);

              return (
                <div key={category} className="bg-white rounded-xl shadow overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category)}
                    className={`w-full px-6 py-4 flex items-center justify-between ${categoryInfo.color} hover:bg-opacity-75 transition`}
                  >
                    <div className="flex items-center gap-3">
                      {categoryInfo.icon}
                      <span className="font-semibold text-gray-900">{categoryInfo.label}</span>
                      <span className="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded-full">{params.length}</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="p-6 space-y-6 border-t">
                      {params.map(param => (
                        <div key={param.id} className="border-b last:border-b-0 pb-6 last:pb-0">
                          <label className="block text-sm font-medium text-gray-900 mb-2">
                            {param.name}
                            {param.required && <span className="text-red-600">*</span>}
                          </label>
                          {param.description && (
                            <p className="text-xs text-gray-500 mb-2">{param.description}</p>
                          )}

                          {param.type === 'text' && (
                            <input
                              type="text"
                              defaultValue={param.value as string}
                              onChange={(e) => handleParameterChange(param.id, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                          )}

                          {param.type === 'email' && (
                            <input
                              type="email"
                              defaultValue={param.value as string}
                              onChange={(e) => handleParameterChange(param.id, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                          )}

                          {param.type === 'number' && (
                            <input
                              type="number"
                              defaultValue={param.value as number}
                              onChange={(e) => handleParameterChange(param.id, parseInt(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                          )}

                          {param.type === 'textarea' && (
                            <textarea
                              defaultValue={param.value as string}
                              onChange={(e) => handleParameterChange(param.id, e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                          )}

                          {param.type === 'color' && (
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                defaultValue={param.value as string}
                                onChange={(e) => handleParameterChange(param.id, e.target.value)}
                                className="w-20 h-10 border border-gray-300 rounded-lg cursor-pointer"
                              />
                              <input
                                type="text"
                                defaultValue={param.value as string}
                                onChange={(e) => handleParameterChange(param.id, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-sm"
                              />
                            </div>
                          )}

                          {param.type === 'boolean' && (
                            <button
                              onClick={() => handleParameterChange(param.id, !editingParams[param.id] ? !(param.value as boolean) : !editingParams[param.id])}
                              className={`px-4 py-2 rounded-lg font-medium transition ${(editingParams[param.id] ?? param.value)
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                                }`}
                            >
                              {(editingParams[param.id] ?? param.value) ? 'Activé' : 'Désactivé'}
                            </button>
                          )}

                          {param.type === 'select' && param.options && (
                            <select
                              defaultValue={param.value as string}
                              onChange={(e) => handleParameterChange(param.id, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                            >
                              {param.options.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Boutons d'action */}
            {Object.keys(editingParams).length > 0 && (
              <div className="bg-white rounded-xl shadow p-6 flex gap-4">
                <Button onClick={handleSaveParameters} className="bg-green-600 hover:bg-green-700 gap-2">
                  <Save className="w-4 h-4" />
                  Enregistrer les modifications
                </Button>
                <Button onClick={() => setEditingParams({})} variant="outline" className="gap-2">
                  <X className="w-4 h-4" />
                  Annuler
                </Button>
              </div>
            )}
          </div>
        )}

        {/* CASE IA : Génération de contenu intelligente pour assister les administrateurs */}
        {activeTab === 'ai' && (
          <div className="space-y-6 animate-fade-in">
            {/* Bannière de l'assistant */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Assistant IA Stratégique</h2>
                  <p className="text-gray-700">Générez vos contenus pro et métadonnées SEO en quelques secondes.</p>
                </div>
              </div>
            </div>

            {/* Outils de génération IA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Prompt de Génération</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Décrivez votre besoin :</label>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Ex: Écris un résumé technique sur la norme NFC 15-100..."
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <Button
                    onClick={handleAiGenerate}
                    disabled={aiLoading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg gap-2"
                  >
                    {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                    Lancer la génération assistée
                  </Button>
                </div>
              </div>

              {/* Modèles Prédéfinis */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Templates</h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition text-sm font-medium text-blue-900">
                    📝 Fiche Technique
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition text-sm font-medium text-green-900">
                    🎯 Titre SEO Pro
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition text-sm font-medium text-purple-900">
                    📄 Meta Description
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
