/**
 * AdminUserManagementPanel.tsx
 * Gestion des utilisateurs, sous-admins et abonnements
 */
import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api-client';
import { toast } from 'sonner';
import {
  Users,
  Shield,
  Crown,
  Plus,
  X,
  Check,
  Search,
  Mail,
  Key,
  UserCog,
  CreditCard,
  Calendar,
  Activity,
  Loader2,
} from 'lucide-react';
import { useSession } from '@/hooks/useSession';

type TabType = 'users' | 'sub-admins' | 'subscriptions' | 'plans';

export default function AdminUserManagementPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const { user: currentUser } = useSession();

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2 overflow-x-auto">
        {[
          { id: 'users' as TabType, label: 'Utilisateurs', icon: Users },
          { id: 'sub-admins' as TabType, label: 'Sous-admins', icon: UserCog },
          { id: 'subscriptions' as TabType, label: 'Abonnements', icon: CreditCard },
          { id: 'plans' as TabType, label: 'Plans', icon: Crown },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'users' && <UserList />}
      {activeTab === 'sub-admins' && <SubAdminManager />}
      {activeTab === 'subscriptions' && <SubscriptionList />}
      {activeTab === 'plans' && <PlanManager />}
    </div>
  );
}

// ── User List ──
function UserList() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiFetch<any[]>('/api/admin/users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, current: boolean) => {
    try {
      await apiFetch(`/api/admin/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !current }),
      });
      toast.success('Statut modifié');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Erreur');
    }
  };

  const filtered = users.filter((u) => u.email?.toLowerCase().includes(search.toLowerCase()));

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      superadmin: 'bg-purple-100 text-purple-700 border-purple-200',
      admin: 'bg-blue-100 text-blue-700 border-blue-200',
      secondary_admin: 'bg-amber-100 text-amber-700 border-amber-200',
      partner: 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[role] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-background"
          />
        </div>
        <span className="text-xs text-slate-500">{filtered.length} utilisateurs</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between p-4 bg-card border border-border rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                  {u.email?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{u.email}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${roleBadge(u.role)}`}
                    >
                      {u.role}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {u.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => toggleStatus(u.id, u.is_active)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border hover:bg-accent transition"
              >
                {u.is_active ? 'Désactiver' : 'Activer'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sub-Admin Manager ──
function SubAdminManager() {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [subAdmins, setSubAdmins] = useState<any[]>([]);

  useEffect(() => {
    fetchPermissions();
    fetchSubAdmins();
  }, []);

  const fetchPermissions = async () => {
    try {
      const data = await apiFetch<any[]>('/api/admin/permissions-list');
      setPermissions(Array.isArray(data) ? data : []);
    } catch {}
  };

  const fetchSubAdmins = async () => {
    try {
      const data = await apiFetch<any[]>('/api/admin/users');
      setSubAdmins(Array.isArray(data) ? data.filter((u) => u.role === 'secondary_admin') : []);
    } catch {}
  };

  const togglePerm = (name: string) => {
    setSelectedPerms((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name],
    );
  };

  const createSubAdmin = async () => {
    if (!email || !password) {
      toast.error('Email et mot de passe requis');
      return;
    }
    setCreating(true);
    try {
      await apiFetch('/api/admin/sub-admin', {
        method: 'POST',
        body: JSON.stringify({ email, password, permissions: selectedPerms }),
      });
      toast.success('Sous-admin créé !');
      setEmail('');
      setPassword('');
      setSelectedPerms([]);
      fetchSubAdmins();
    } catch (err: any) {
      toast.error(err.message || 'Erreur');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Create Form */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <UserCog className="w-5 h-5 text-amber-500" />
          Créer un sous-admin
        </h3>

        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-background"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Mot de passe</label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-background"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500 mb-2 block">
            Permissions ({selectedPerms.length})
          </label>
          <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
            {permissions.map((p) => (
              <button
                key={p.id}
                onClick={() => togglePerm(p.name)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-left transition ${
                  selectedPerms.includes(p.name)
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {selectedPerms.includes(p.name) ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Plus className="w-3 h-3" />
                )}
                <span>{p.name.replace(/_/g, ' ')}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={createSubAdmin}
          disabled={creating}
          className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-bold text-sm hover:shadow-lg transition disabled:opacity-50"
        >
          {creating ? 'Création...' : 'Créer le sous-admin'}
        </button>
      </div>

      {/* Sub-admin List */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-500" />
          Sous-admins ({subAdmins.length})
        </h3>
        {subAdmins.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">Aucun sous-admin</p>
        ) : (
          <div className="space-y-2">
            {subAdmins.map((sa) => (
              <div
                key={sa.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium">{sa.email}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    secondary_admin
                  </span>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${sa.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                >
                  {sa.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Subscription List (Admin) ──
function SubscriptionList() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<any[]>('/api/admin/subscriptions');
        setSubscriptions(Array.isArray(data) ? data : []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );

  return (
    <div>
      {subscriptions.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-12">Aucun abonnement</p>
      ) : (
        <div className="space-y-2">
          {subscriptions.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between p-4 bg-card border border-border rounded-xl"
            >
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">{s.user_email}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {s.plan_name}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(s.end_date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
              >
                {s.is_active ? 'Actif' : 'Expiré'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Plan Manager ──
function PlanManager() {
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<any[]>('/api/subscription-plans');
        setPlans(Array.isArray(data) ? data : []);
      } catch {}
    })();
  }, []);

  const featuresLabels: Record<string, string> = {
    normes_gratuites: 'Normes gratuites',
    calculateur_base: 'Calculateur de base',
    consultation_blog: 'Consultation blog',
    normes_completes: 'Normes complètes',
    calculateurs_avance: 'Calculateurs avancés',
    chute_tension: 'Chute de tension',
    diagnostic_ia: 'Diagnostic IA',
    certification: 'Certification',
    tout_acces: 'Accès illimité',
    api_acces: 'Accès API',
    support_prioritaire: 'Support prioritaire',
    formation: 'Formation',
    audit_complet: 'Audit complet',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={`bg-card border-2 rounded-xl p-6 ${
            plan.price > 0 ? 'border-blue-200 dark:border-blue-800' : 'border-border'
          }`}
        >
          {plan.price > 0 && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
              Payant
            </span>
          )}
          <h3 className="text-lg font-bold text-foreground mt-2">{plan.name}</h3>
          <div className="mt-2">
            <span className="text-3xl font-black text-foreground">
              {plan.price.toLocaleString('fr-FR')}
            </span>
            <span className="text-sm text-slate-500"> F CFA</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {plan.duration_days >= 365 ? '1 an' : `${plan.duration_days} jours`}
          </p>
          <p className="text-xs text-slate-600 mt-3">{plan.description}</p>
          <ul className="mt-4 space-y-1.5">
            {(plan.features || []).map((f: string) => (
              <li key={f} className="flex items-center gap-2 text-xs text-slate-600">
                <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                {featuresLabels[f] || f.replace(/_/g, ' ')}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
