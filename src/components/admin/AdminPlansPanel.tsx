/**
 * Panel admin de gestion des plans d'abonnement
 * Modes : monthly, yearly, lifetime, credit
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Loader2, Crown, CreditCard, Infinity, Zap, Trash2, Edit3 } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  billing_mode: 'monthly' | 'yearly' | 'lifetime' | 'credit';
  credits: number;
  features: string[];
  is_premium: boolean;
  is_active: boolean;
}

const MODE_LABELS = {
  monthly: 'Mensuel',
  yearly: 'Annuel',
  lifetime: 'A vie',
  credit: 'Credit',
};

const MODE_ICONS = {
  monthly: <CreditCard className="w-4 h-4" />,
  yearly: <Zap className="w-4 h-4" />,
  lifetime: <Infinity className="w-4 h-4" />,
  credit: <CreditCard className="w-4 h-4" />,
};

export default function AdminPlansPanel() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDuration, setFormDuration] = useState('30');
  const [formMode, setFormMode] = useState<string>('monthly');
  const [formCredits, setFormCredits] = useState('0');
  const [formFeatures, setFormFeatures] = useState('');
  const [formPremium, setFormPremium] = useState(true);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const d = await adminApi.getSubscriptionPlans();
      setPlans(Array.isArray(d) ? d : []);
    } catch (e: any) {
      toast.error('Erreur chargement: ' + e.message);
    }
    setLoading(false);
  };

  useEffect(() => { loadPlans(); }, []);

  const openCreate = () => {
    setEditing(null);
    setFormName('');
    setFormDesc('');
    setFormPrice('');
    setFormDuration('30');
    setFormMode('monthly');
    setFormCredits('0');
    setFormFeatures('');
    setFormPremium(true);
    setModalOpen(true);
  };

  const openEdit = (plan: Plan) => {
    setEditing(plan);
    setFormName(plan.name);
    setFormDesc(plan.description || '');
    setFormPrice(String(plan.price));
    setFormDuration(String(plan.duration_days));
    setFormMode(plan.billing_mode);
    setFormCredits(String(plan.credits || 0));
    setFormFeatures((plan.features || []).join('\n'));
    setFormPremium(plan.is_premium);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName || !formPrice) {
      toast.error('Nom et prix requis');
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: formName,
        description: formDesc,
        price: parseFloat(formPrice),
        duration_days: formMode === 'lifetime' ? 36500 : parseInt(formDuration) || 30,
        billing_mode: formMode,
        credits: parseInt(formCredits) || 0,
        features: formFeatures.split('\n').filter(Boolean).map(f => f.trim()),
        is_premium: formPremium,
      };

      if (editing) {
        await fetch('/api/admin/subscription-plans/' + editing.id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') },
          body: JSON.stringify(body),
        });
        toast.success('Plan modifie');
      } else {
        await fetch('/api/admin/subscription-plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') },
          body: JSON.stringify(body),
        });
        toast.success('Plan cree');
      }
      setModalOpen(false);
      loadPlans();
    } catch (e: any) {
      toast.error('Erreur: ' + e.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce plan ?')) return;
    try {
      await fetch('/api/admin/subscription-plans/' + id, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
      });
      toast.success('Plan supprime');
      loadPlans();
    } catch (e: any) {
      toast.error('Erreur: ' + e.message);
    }
  };

  if (loading) return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" /> Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Plans d'abonnement</h2>
          <p className="text-sm text-muted-foreground">{plans.length} plan(s) — Gerer les prix, modes et fonctionnalites</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Nouveau plan</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map(plan => (
          <div key={plan.id} className={`border rounded-xl p-5 space-y-4 transition-all ${!plan.is_active ? 'opacity-50 grayscale' : ''} ${plan.is_premium ? 'border-amber-400 shadow-md' : ''}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  {plan.is_premium && <Crown className="w-4 h-4 text-amber-500" />}
                </div>
                <p className="text-xs text-muted-foreground">{plan.description}</p>
              </div>
              <Badge variant={plan.is_active ? 'default' : 'secondary'} className="flex items-center gap-1">
                {MODE_ICONS[plan.billing_mode]}
                {MODE_LABELS[plan.billing_mode]}
              </Badge>
            </div>

            <div className="text-2xl font-black">
              {plan.price === 0 ? 'Gratuit' : plan.price.toLocaleString('fr-FR') + ' F CFA'}
              {plan.billing_mode === 'monthly' && <span className="text-sm font-normal text-muted-foreground">/mois</span>}
              {plan.billing_mode === 'yearly' && <span className="text-sm font-normal text-muted-foreground">/an</span>}
              {plan.billing_mode === 'credit' && <span className="text-sm font-normal text-muted-foreground"> ({plan.credits} credits)</span>}
            </div>

            <ul className="space-y-1">
              {(plan.features || []).slice(0, 4).map((f, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span> {f}
                </li>
              ))}
              {(plan.features || []).length > 4 && (
                <li className="text-xs text-muted-foreground italic">+{plan.features.length - 4} autres...</li>
              )}
            </ul>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(plan)}>
                <Edit3 className="w-3 h-3 mr-1" /> Modifier
              </Button>
              <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(plan.id)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Create/Edit */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier le plan' : 'Nouveau plan'}</DialogTitle>
            <DialogDescription>Configurez le mode d'abonnement, le prix et les fonctionnalites</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-medium">Nom du plan</label>
                <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Ex: Premium Pro" />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-medium">Description</label>
                <Input value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Optionnelle" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Prix (FCFA)</label>
                <Input type="number" value={formPrice} onChange={e => setFormPrice(e.target.value)} placeholder="15000" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Mode de facturation</label>
                <Select value={formMode} onValueChange={setFormMode}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensuel</SelectItem>
                    <SelectItem value="yearly">Annuel</SelectItem>
                    <SelectItem value="lifetime">A vie</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formMode !== 'lifetime' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium">Duree (jours)</label>
                  <Input type="number" value={formDuration} onChange={e => setFormDuration(e.target.value)} />
                </div>
              )}
              {formMode === 'credit' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium">Nombre de credits</label>
                  <Input type="number" value={formCredits} onChange={e => setFormCredits(e.target.value)} />
                </div>
              )}
              <div className="space-y-2 flex items-end pb-1">
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <Switch checked={formPremium} onCheckedChange={setFormPremium} />
                  Plan Premium
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Fonctionnalites (une par ligne)</label>
              <textarea
                value={formFeatures}
                onChange={e => setFormFeatures(e.target.value)}
                rows={5}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none"
                placeholder="Audit complet&#10;Support prioritaire&#10;Formation equipe"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sauvegarde...</> : editing ? 'Modifier' : 'Creer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
