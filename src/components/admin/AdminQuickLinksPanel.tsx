import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Trash2, Save, icons } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

// Lucide icon names type
type IconName = keyof typeof icons;

type QuickLink = {
    id: number;
    title: string;
    description: string;
    icon_name: string;
    href: string;
    color: string;
    display_order: number;
    is_active: boolean;
};

export default function AdminQuickLinksPanel() {
    const [links, setLinks] = useState<QuickLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form state
    const [form, setForm] = useState<Partial<QuickLink>>({
        title: "",
        description: "",
        icon_name: "Zap",
        href: "",
        color: "#proqblue",
        display_order: 0,
        is_active: true
    });

    const fetchLinks = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('quick_links')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            toast.error("Erreur chargement liens");
        } else {
            setLinks(data || []);
            setForm(prev => ({ ...prev, display_order: (data?.length || 0) + 1 }));
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLinks();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.href) {
            toast.error("Titre et Lien requis");
            return;
        }

        const payload = {
            title: form.title,
            description: form.description || "",
            icon_name: form.icon_name || "Zap",
            href: form.href,
            color: form.color || "#000000",
            display_order: form.display_order,
            is_active: form.is_active
        };

        if (editingId) {
            const { error } = await supabase.from('quick_links').update(payload).eq('id', editingId);
            if (error) toast.error("Erreur update");
            else toast.success("Lien mis à jour");
        } else {
            const { error } = await supabase.from('quick_links').insert(payload);
            if (error) toast.error("Erreur création");
            else toast.success("Lien ajouté");
        }

        setEditingId(null);
        setForm({ title: "", description: "", icon_name: "Zap", href: "", color: "#000000", display_order: links.length + 1, is_active: true });
        fetchLinks();
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Supprimer ce lien ?")) return;
        const { error } = await supabase.from('quick_links').delete().eq('id', id);
        if (error) toast.error("Erreur suppression");
        else {
            toast.success("Supprimé");
            fetchLinks();
        }
    };

    const handleEdit = (l: QuickLink) => {
        setEditingId(l.id);
        setForm(l);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading && links.length === 0) return <Loader2 className="animate-spin" />;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-2xl font-bold text-proqblue">Gestion des Liens Rapides (Accueil)</h2>
                <Badge variant="outline">{links.length} liens</Badge>
            </div>

            {/* Formulaire */}
            <div className="bg-slate-50 p-6 rounded-lg border">
                <h3 className="font-semibold mb-4 text-lg">{editingId ? 'Modifier un lien' : 'Ajouter un nouveau lien'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Titre *</Label>
                            <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Formations" required />
                        </div>
                        <div>
                            <Label>Lien (URL) *</Label>
                            <Input value={form.href} onChange={e => setForm({ ...form, href: e.target.value })} placeholder="/formations" required />
                        </div>
                    </div>

                    <div>
                        <Label>Description</Label>
                        <Textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description courte..." />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label>Icône (Nom Lucide)</Label>
                            <Input value={form.icon_name} onChange={e => setForm({ ...form, icon_name: e.target.value })} placeholder="Ex: Zap, BookOpen, Award..." />
                            <p className="text-xs text-gray-500 mt-1">Utilisez les noms des icônes Lucide.</p>
                        </div>
                        <div>
                            <Label>Couleur (Hex)</Label>
                            <div className="flex gap-2">
                                <Input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-12 h-10 p-1" />
                                <Input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} placeholder="#000000" />
                            </div>
                        </div>
                        <div className="grid grid-rows-2 gap-2">
                            <div>
                                <Label>Ordre</Label>
                                <Input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: parseInt(e.target.value) })} />
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer mt-auto pb-2">
                                <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4" />
                                <span className="text-sm font-medium">Actif</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit">
                            <Save className="w-4 h-4 mr-2" />
                            {editingId ? 'Mettre à jour' : 'Ajouter'}
                        </Button>
                        {editingId && (
                            <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm({ title: "", description: "", icon_name: "Zap", href: "", color: "#000000", display_order: links.length + 1, is_active: true }); }}>
                                Annuler
                            </Button>
                        )}
                    </div>
                </form>
            </div>

            {/* Liste */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {links.map(l => (
                    <div key={l.id} className="bg-white p-4 rounded-lg border shadow-sm flex flex-col gap-3 group relative border-l-4" style={{ borderLeftColor: l.color }}>
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                {/* Icon Preview if possible, else generic */}
                                <div className="p-2 rounded bg-slate-100 text-slate-600">
                                    <span className="font-mono text-xs">{l.icon_name}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900" style={{ color: l.color }}>{l.title}</h4>
                                    <p className="text-xs text-gray-500">{l.href}</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:text-blue-800" onClick={() => handleEdit(l)}>
                                    <Save className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:text-red-800" onClick={() => handleDelete(l.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">{l.description}</p>
                        <div className="mt-auto pt-2 border-t flex justify-between text-xs text-gray-400">
                            <span>Ordre: {l.display_order}</span>
                            <span className={l.is_active ? "text-green-600" : "text-red-400"}>
                                {l.is_active ? "● Visible" : "○ Masqué"}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
