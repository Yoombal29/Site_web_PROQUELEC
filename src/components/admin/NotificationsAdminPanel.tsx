import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, Send, Bell, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api-client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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

interface Notification {
  id: string;
  title: string;
  message: string;
  target_role: string | null;
  created_by: string;
  sent_at: string;
  created_at: string;
  read?: boolean;
}

type Role = 'admin' | 'electricien' | 'entreprise' | 'membre' | 'partner';

const ROLES: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Administrateurs' },
  { value: 'electricien', label: 'Électriciens' },
  { value: 'entreprise', label: 'Entreprises' },
  { value: 'membre', label: 'Membres' },
  { value: 'partner', label: 'Partenaires' },
];

const ROLE_BADGE_STYLES: Record<string, string> = {
  electricien: 'bg-blue-100 text-blue-800 border-blue-200',
  entreprise: 'bg-green-100 text-green-800 border-green-200',
  membre: 'bg-gray-100 text-gray-700 border-gray-200',
  partner: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  admin: 'bg-red-100 text-red-800 border-red-200',
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
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
}

function getRoleLabel(role: string | null): string {
  if (!role) return 'Tous les utilisateurs';
  return ROLES.find((r) => r.value === role)?.label ?? role;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const NotificationsAdminPanel: React.FC = () => {
  // --- Data state ---
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // --- Form state ---
  const [formOpen, setFormOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formRole, setFormRole] = useState<string>('_all');

  // --- Delete confirmation ---
  const [deleteTarget, setDeleteTarget] = useState<Notification | null>(null);
  const [deleting, setDeleting] = useState(false);

  // -----------------------------------------------------------------------
  // Data fetching
  // -----------------------------------------------------------------------

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Notification[]>('/api/admin/notifications');
      // If the admin endpoint doesn't exist for listing, fallback to the public one (with read status)
      setNotifications(data);
    } catch {
      // Fallback: get from general notifications endpoint
      try {
        const data = await apiFetch<Notification[]>('/api/notifications');
        setNotifications(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Impossible de charger les notifications';
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // -----------------------------------------------------------------------
  // Send notification
  // -----------------------------------------------------------------------

  const handleSend = async () => {
    if (!formTitle.trim()) {
      toast.error('Le titre est requis');
      return;
    }
    if (!formMessage.trim()) {
      toast.error('Le message est requis');
      return;
    }

    setSending(true);
    try {
      await apiFetch('/api/admin/notifications', {
        method: 'POST',
        body: JSON.stringify({
          title: formTitle.trim(),
          message: formMessage.trim(),
          target_role: formRole === '_all' ? null : formRole,
        }),
      });
      toast.success('Notification envoyée avec succès');
      setFormOpen(false);
      setFormTitle('');
      setFormMessage('');
      setFormRole('_all');
      fetchNotifications();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'envoi";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  // -----------------------------------------------------------------------
  // Delete
  // -----------------------------------------------------------------------

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/admin/notifications/${deleteTarget.id}`, { method: 'DELETE' });
      toast.success('Notification supprimée avec succès');
      setDeleteTarget(null);
      fetchNotifications();
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
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Notifications groupées</h2>
            <p className="text-sm text-muted-foreground">
              Envoyez des messages à une catégorie d'utilisateurs
            </p>
          </div>
        </div>

        <Button onClick={() => setFormOpen(true)} className="gap-2">
          <Send className="w-4 h-4" />
          Nouvelle notification
        </Button>
      </div>

      {/* Liste des notifications */}
      <div className="bg-card border border-border rounded-xl shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">Aucune notification envoyée</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Cible</TableHead>
                <TableHead className="hidden md:table-cell">Message</TableHead>
                <TableHead className="hidden md:table-cell">Date d'envoi</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notif) => (
                <TableRow key={notif.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-orange-500 shrink-0" />
                      <span className="truncate max-w-[200px]">{notif.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {notif.target_role ? (
                      <Badge
                        className={
                          ROLE_BADGE_STYLES[notif.target_role] || 'bg-gray-100 text-gray-700'
                        }
                      >
                        {getRoleLabel(notif.target_role)}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Tous</Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm max-w-[250px]">
                    <span className="truncate block">{notif.message}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                    {formatDate(notif.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(notif)}
                      title="Supprimer"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* ================================================================ */}
      {/* Modal Envoi de notification                                       */}
      {/* ================================================================ */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-orange-500" />
              Envoyer une notification
            </DialogTitle>
            <DialogDescription>
              Remplissez le formulaire ci-dessous pour envoyer une notification groupée. Les
              utilisateurs ciblés recevront un email et verront la notification dans leur tableau de
              bord.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Titre <span className="text-red-500">*</span>
              </label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Ex: Maintenance programmée"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                placeholder="Saisissez le contenu de votre message..."
                rows={5}
              />
            </div>

            {/* Cible */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Destinataires
              </label>
              <Select value={formRole} onValueChange={setFormRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une cible" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Tous les utilisateurs</SelectItem>
                  {ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Si aucun rôle n'est sélectionné, la notification sera visible par tous les
                utilisateurs connectés.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSend} disabled={sending} className="gap-2">
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {sending ? 'Envoi en cours...' : 'Envoyer la notification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ================================================================ */}
      {/* Modal Confirmation suppression                                    */}
      {/* ================================================================ */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer la notification "{deleteTarget?.title}" ? Cette
              action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {deleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default NotificationsAdminPanel;
