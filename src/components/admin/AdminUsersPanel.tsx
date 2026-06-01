import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Users as UsersIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api-client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface User {
  id: string;
  email: string;
  role: 'admin' | 'electricien' | 'entreprise' | 'membre' | 'partner';
  status: boolean;
  createdAt: string;
}

type Role = User['role'];

const ROLES: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'electricien', label: 'Électricien' },
  { value: 'entreprise', label: 'Entreprise' },
  { value: 'membre', label: 'Membre' },
  { value: 'partner', label: 'Partenaire' },
];

const ROLE_BADGE_VARIANTS: Record<Role, string> = {
  admin: 'destructive',
  electricien: 'default',
  entreprise: 'secondary',
  membre: 'outline',
  partner: 'secondary',
};

const ROLE_BADGE_STYLES: Record<Role, string> = {
  admin: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100',
  electricien: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100',
  entreprise: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100',
  membre: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100',
  partner: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const AdminUsersPanel: React.FC = () => {
  // --- Data state ---
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Search ---
  const [search, setSearch] = useState('');

  // --- Modal state ---
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<Role>('membre');
  const [formStatus, setFormStatus] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- Delete confirmation ---
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  // -----------------------------------------------------------------------
  // Data fetching
  // -----------------------------------------------------------------------

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<User[]>('/api/admin/users');
      setUsers(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Impossible de charger les utilisateurs';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // -----------------------------------------------------------------------
  // Filtered list
  // -----------------------------------------------------------------------

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()),
  );

  // -----------------------------------------------------------------------
  // Modal helpers
  // -----------------------------------------------------------------------

  const openCreateModal = () => {
    setEditingUser(null);
    setFormEmail('');
    setFormPassword('');
    setFormRole('membre');
    setFormStatus(true);
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormEmail(user.email);
    setFormPassword('');
    setFormRole(user.role);
    setFormStatus(user.status);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  // -----------------------------------------------------------------------
  // Save (create / update)
  // -----------------------------------------------------------------------

  const handleSave = async () => {
    if (!formEmail.trim()) {
      toast.error('L\'email est requis');
      return;
    }
    if (!editingUser && !formPassword.trim()) {
      toast.error('Le mot de passe est requis pour un nouvel utilisateur');
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        // Update
        const body: Record<string, unknown> = {
          email: formEmail.trim(),
          role: formRole,
          status: formStatus,
        };
        if (formPassword.trim()) {
          body.password = formPassword.trim();
        }
        await apiFetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        toast.success('Utilisateur mis à jour avec succès');
      } else {
        // Create
        await apiFetch('/api/admin/users', {
          method: 'POST',
          body: JSON.stringify({
            email: formEmail.trim(),
            password: formPassword.trim(),
            role: formRole,
            status: formStatus,
          }),
        });
        toast.success('Utilisateur créé avec succès');
      }
      closeModal();
      fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------------------------------------------------
  // Toggle status
  // -----------------------------------------------------------------------

  const handleToggleStatus = async (user: User) => {
    const newStatus = !user.status;
    try {
      await apiFetch(`/api/admin/users/${user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      toast.success(`Utilisateur ${newStatus ? 'activé' : 'désactivé'} avec succès`);
      fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors du changement de statut';
      toast.error(msg);
    }
  };

  // -----------------------------------------------------------------------
  // Delete
  // -----------------------------------------------------------------------

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/admin/users/${deleteTarget.id}`, { method: 'DELETE' });
      toast.success('Utilisateur supprimé avec succès');
      setDeleteTarget(null);
      fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <section className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white">
            <UsersIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Gestion des utilisateurs</h2>
            <p className="text-sm text-muted-foreground">
              {users.length} utilisateur{users.length > 1 ? 's' : ''} enregistré{users.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="w-4 h-4" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            {search
              ? 'Aucun utilisateur ne correspond à votre recherche'
              : 'Aucun utilisateur trouvé'}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="hidden md:table-cell">Date création</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={ROLE_BADGE_VARIANTS[user.role] as 'destructive' | 'default' | 'secondary' | 'outline'}
                      className={ROLE_BADGE_STYLES[user.role]}
                    >
                      {ROLES.find((r) => r.value === user.role)?.label ?? user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.status}
                        onCheckedChange={() => handleToggleStatus(user)}
                      />
                      <span className={`text-xs font-medium ${user.status ? 'text-green-600' : 'text-red-500'}`}>
                        {user.status ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(user)}
                        title="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(user)}
                        title={user.status ? 'Désactiver' : 'Activer'}
                      >
                        <span className="text-base leading-none">
                          {user.status ? '🔄' : '🔄'}
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(user)}
                        title="Supprimer"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* ================================================================ */}
      {/* Modal Création / Édition                                          */}
      {/* ================================================================ */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Modifiez les informations de l\'utilisateur ci-dessous.'
                : 'Remplissez les informations pour créer un nouvel utilisateur.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input
                type="email"
                placeholder="email@exemple.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Mot de passe {editingUser && <span className="text-muted-foreground font-normal">(laisser vide pour conserver l'actuel)</span>}
              </label>
              <Input
                type="password"
                placeholder={editingUser ? '••••••••' : 'Mot de passe'}
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Rôle</label>
              <Select value={formRole} onValueChange={(v: Role) => setFormRole(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 pt-2">
              <Switch
                id="user-status"
                checked={formStatus}
                onCheckedChange={setFormStatus}
              />
              <label htmlFor="user-status" className="text-sm font-medium text-foreground cursor-pointer">
                {formStatus ? 'Actif' : 'Inactif'}
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal} disabled={saving}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingUser ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================ */}
      {/* Delete confirmation                                              */}
      {/* ================================================================ */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
              <strong>{deleteTarget?.email}</strong> ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2"
            >
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default AdminUsersPanel;
