/**
 * Panel de gestion des permissions et abonnements (Admin uniquement)
 * Intégré dans AdminDashboard
 */
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/lib/admin-api.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Loader2, Shield, Crown, Key, Ban } from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Subscription {
  id: string;
  plan_id: string;
  plan_name: string;
  price: number;
  features: string[];
  end_date: string;
  is_active: boolean;
  payment_status: string;
}

export default function AdminPermissionsPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userPerms, setUserPerms] = useState<string[]>([]);
  const [userSub, setUserSub] = useState<Subscription | null>(null);
  const [showPermModal, setShowPermModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, p] = await Promise.all([
        adminApi.getUsers().catch(() => []),
        adminApi.getPermissions().catch(() => []),
      ]);
      setUsers(Array.isArray(u) ? u : []);
      setPermissions(Array.isArray(p) ? p : []);
    } catch (e: any) {
      toast.error('Erreur chargement: ' + e.message);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const openPermissions = async (user: any) => {
    setSelectedUser(user);
    setUserPerms([]);
    setShowPermModal(true);
    try {
      const d = await adminApi.getUserPermissions(user.id);
      setUserPerms(Array.isArray(d) ? d : []);
    } catch {}
  };

  const savePermissions = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await adminApi.setUserPermissions(selectedUser.id, userPerms);
      toast.success('Permissions mises a jour');
      setShowPermModal(false);
    } catch (e: any) {
      toast.error('Erreur: ' + e.message);
    }
    setSaving(false);
  };

  const togglePerm = (permName: string) => {
    setUserPerms(prev =>
      prev.includes(permName) ? prev.filter(p => p !== permName) : [...prev, permName]
    );
  };

  const openSubscription = async (user: any) => {
    setSelectedUser(user);
    setShowSubModal(true);
    try {
      const d = await adminApi.getUserSubscription(user.id);
      setUserSub(d);
    } catch {
      setUserSub(null);
    }
  };

  const forcePremium = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await adminApi.setUserSubscription(selectedUser.id, 'premium', null);
      toast.success('Abonnement premium force');
      openSubscription(selectedUser);
    } catch (e: any) {
      toast.error('Erreur: ' + e.message);
    }
    setSaving(false);
  };

  // Regrouper les permissions par catégorie
  const permsByCategory: Record<string, Permission[]> = {};
  for (const p of permissions) {
    (permsByCategory[p.category] = permsByCategory[p.category] || []).push(p);
  }

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" /> Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Permissions & Abonnements</h2>
          <p className="text-sm text-muted-foreground">
            {users.length} utilisateur{users.length > 1 ? 's' : ''} — {permissions.length} permissions disponibles
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>Actualiser</Button>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Role</th>
              <th className="text-left p-3 font-medium">Statut</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="p-3">{user.email}</td>
                <td className="p-3">
                  <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                    {user.role === 'admin' ? 'Super Admin' : user.role === 'secondary_admin' ? 'Admin Limite' : user.role}
                  </Badge>
                </td>
                <td className="p-3">
                  <span className={`inline-flex items-center gap-1.5 ${user.is_active !== false ? 'text-green-600' : 'text-red-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${user.is_active !== false ? 'bg-green-500' : 'bg-red-500'}`} />
                    {user.is_active !== false ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openPermissions(user)} title="Permissions">
                      <Shield className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openSubscription(user)} title="Abonnement">
                      <Crown className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Aucun utilisateur</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Permissions */}
      <Dialog open={showPermModal} onOpenChange={setShowPermModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" /> Permissions — {selectedUser?.email}
            </DialogTitle>
            <DialogDescription>
              Cochez les permissions a accorder a cet utilisateur. Les permissions vides utilisent celles par defaut du role.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {Object.entries(permsByCategory).map(([category, perms]) => (
              <div key={category}>
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">{category}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {perms.map(perm => (
                    <label key={perm.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        className="mt-0.5"
                        checked={userPerms.includes(perm.name)}
                        onChange={() => togglePerm(perm.name)}
                      />
                      <div>
                        <p className="text-sm font-medium">{perm.name}</p>
                        {perm.description && <p className="text-xs text-muted-foreground">{perm.description}</p>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="ghost" onClick={() => setShowPermModal(false)}>Annuler</Button>
            <Button onClick={savePermissions} disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sauvegarde...</> : 'Enregistrer les permissions'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Abonnement */}
      <Dialog open={showSubModal} onOpenChange={setShowSubModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5" /> Abonnement — {selectedUser?.email}
            </DialogTitle>
          </DialogHeader>

          <div className="py-6 space-y-4">
            {userSub ? (
              <div className="space-y-3 p-4 bg-muted/30 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Plan</span>
                  <Badge>{userSub.plan_name}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Expire le</span>
                  <span className="text-sm">{new Date(userSub.end_date).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Statut</span>
                  <Badge variant={userSub.is_active ? 'default' : 'secondary'}>
                    {userSub.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
                <div className="pt-3 border-t">
                  <Button variant="destructive" size="sm" onClick={async () => {
                    if (confirm('Annuler cet abonnement ?')) {
                      try {
                        await adminApi.cancelSubscription(userSub.id);
                        toast.success('Abonnement annule');
                        setUserSub(prev => prev ? { ...prev, is_active: false } : null);
                      } catch {}
                    }
                  }}>
                    <Ban className="w-4 h-4 mr-1" /> Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <p className="text-muted-foreground">Aucun abonnement actif</p>
                <Button onClick={forcePremium} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Crown className="w-4 h-4 mr-2" />}
                  Forcer acces Premium
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="ghost" onClick={() => setShowSubModal(false)}>Fermer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
