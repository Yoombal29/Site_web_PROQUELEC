import { useState, useEffect } from "react";
import { Loader2, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ImageUploadInput from "./ImageUploadInput";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api-client";

type Partner = {
  id: number;
  name: string;
  logo_url: string;
  category: string;
  website_url: string | null;
  display_order: number;
  is_active: boolean;
};

export default function AdminPartnersPanel() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form state
  const [form, setForm] = useState<Partial<Partner>>({
    name: "",
    logo_url: "",
    category: "",
    website_url: "",
    display_order: 0,
    is_active: true
  });

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Partner[]>('/api/partners');
      setPartners(data || []);
      // Auto-set next order
      setForm((prev) => ({ ...prev, display_order: (data?.length || 0) + 1 }));
    } catch (error: unknown) {
      toast.error("Erreur chargement partenaires: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.logo_url) {
      toast.error("Nom et Logo requis");
      return;
    }

    const payload = {
      name: form.name,
      logo_url: form.logo_url,
      category: form.category || "Partenaire",
      website_url: form.website_url,
      display_order: form.display_order,
      is_active: form.is_active
    };

    try {
      if (editingId) {
        // Update
        await apiFetch(`/api/partners/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        toast.success("Partenaire mis à jour");
      } else {
        // Create
        await apiFetch('/api/partners', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        toast.success("Partenaire ajouté");
      }

      setEditingId(null);
      setForm({ name: "", logo_url: "", category: "", website_url: "", display_order: partners.length + 1, is_active: true });
      fetchPartners();
    } catch (error: unknown) {
      toast.error("Erreur sauvegarde: " + error.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer ce partenaire ?")) return;
    try {
      await apiFetch(`/api/partners/${id}`, {
        method: 'DELETE'
      });
      toast.success("Supprimé");
      fetchPartners();
    } catch (error: unknown) {
      toast.error("Erreur suppression: " + error.message);
    }
  };

  const handleEdit = (p: Partner) => {
    setEditingId(p.id);
    setForm(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && partners.length === 0) return <Loader2 className="animate-spin" />;

  return (
    <div className="space-y-8">
            <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-2xl font-bold text-primary">Gestion des Partenaires</h2>
                <Badge variant="outline">{partners.length} partenaires</Badge>
            </div>

            {/* Formulaire */}
            <div className="bg-muted/50 p-6 rounded-lg border border-border">
                <h3 className="font-semibold mb-4 text-lg text-primary">{editingId ? 'Modifier un partenaire' : 'Ajouter un nouveau partenaire'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Nom *</Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: SENELEC" required />
                        </div>
                        <div>
                            <Label>Catégorie</Label>
                            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ex: Opérateur national" />
                        </div>
                    </div>

                    <div>
                        <Label>Logo URL *</Label>
                        <ImageUploadInput value={form.logo_url} onChange={(url) => setForm({ ...form, logo_url: url || '' })} bucketName="site-assets" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Site Web</Label>
                            <Input value={form.website_url || ''} onChange={(e) => setForm({ ...form, website_url: e.target.value })} placeholder="https://..." />
                        </div>
                        <div>
                            <Label>Ordre</Label>
                            <Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) })} />
                        </div>
                        <div className="flex items-end pb-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4" />
                                <span className="text-sm font-medium">Actif (visible sur le site)</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit">
                            <Save className="w-4 h-4 mr-2" />
                            {editingId ? 'Mettre à jour' : 'Ajouter'}
                        </Button>
                        {editingId &&
            <Button type="button" variant="outline" onClick={() => {setEditingId(null);setForm({ name: "", logo_url: "", category: "", website_url: "", display_order: partners.length + 1, is_active: true });}}>
                                Annuler
                            </Button>
            }
                    </div>
                </form>
            </div>

            {/* Liste */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {partners.map((p) =>
        <div key={p.id} className="bg-card p-4 rounded-lg border border-border shadow-sm flex flex-col gap-3 group relative">
                        <div className="flex justify-between items-start">
                            <div className="h-12 w-24 bg-muted rounded flex items-center justify-center p-1 border border-border">
                                <img src={p.logo_url} className="max-h-full max-w-full object-contain" alt={p.name} loading="lazy" />
                            </div>
                            <div className="flex gap-1">
                                <Button title="Modifier" aria-label={`Modifier ${p.name}`} size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-800" onClick={() => handleEdit(p)}>
                                  <Save className="w-4 h-4" />
                                </Button>
                                <Button title="Supprimer" aria-label={`Supprimer ${p.name}`} size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-800" onClick={() => handleDelete(p.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-bold text-foreground">{p.name}</h4>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">{p.category}</span>
                        </div>
                        <div className="mt-auto pt-2 border-t border-border flex justify-between text-xs text-muted-foreground">
                            <span>Ordre: {p.display_order}</span>
                            <span className={p.is_active ? "text-green-600" : "text-red-400"}>
                                {p.is_active ? "● Visible" : "○ Masqué"}
                            </span>
                        </div>
                    </div>
        )}
            </div>
        </div>);

}