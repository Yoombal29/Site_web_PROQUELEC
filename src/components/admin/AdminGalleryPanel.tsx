import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Save, Image as ImageIcon, Zap, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import ImageUploadInput from "./ImageUploadInput";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api-client";

interface Hotspot {
  x: number;
  y: number;
  title: string;
  content: string;
}

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'photo' | 'video';
  category: string;
  tags: string[];
  hotspots: Hotspot[];
  display_order: number;
  is_active: boolean;
}

export default function AdminGalleryPanel() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState<Partial<GalleryItem>>({
    title: "",
    description: "",
    url: "",
    type: "photo",
    category: "projets",
    tags: [],
    hotspots: [],
    display_order: 0,
    is_active: true
  });

  // Hotspot Editor state
  const [isHotspotMode, setIsHotspotMode] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<GalleryItem[]>('/api/admin/gallery-items');
      setItems(data || []);
    } catch (error: unknown) {
      toast.error("Erreur chargement galerie: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {fetchItems();}, []);

  const handleImageClick = (e: React.MouseEvent) => {
    if (!isHotspotMode || !imgRef.current) return;

    const rect = imgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 100;
    const y = (e.clientY - rect.top) / rect.height * 100;

    const newHotspot: Hotspot = {
      x,
      y,
      title: "Nouveau Point",
      content: "Description technique ici..."
    };

    setForm((prev) => ({
      ...prev,
      hotspots: [...(prev.hotspots || []), newHotspot]
    }));
  };

  const updateHotspot = (index: number, field: keyof Hotspot, value: string) => {
    const newHotspots = [...(form.hotspots || [])];
    newHotspots[index] = { ...newHotspots[index], [field]: value };
    setForm({ ...form, hotspots: newHotspots });
  };

  const removeHotspot = (index: number) => {
    const newHotspots = (form.hotspots || []).filter((_, i) => i !== index);
    setForm({ ...form, hotspots: newHotspots });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.url) return toast.error("Titre et Image requis");

    const payload = {
      title: form.title,
      description: form.description,
      url: form.url,
      type: form.type,
      category: form.category,
      tags: form.tags,
      hotspots: form.hotspots,
      display_order: form.display_order,
      is_active: form.is_active
    };

    try {
      if (editingId) {
        await apiFetch(`/api/gallery-items/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await apiFetch('/api/gallery-items', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      toast.success("Galerie mise à jour");
      setEditingId(null);
      setForm({ title: "", description: "", url: "", type: "photo", category: "projets", hotspots: [], tags: [], display_order: items.length + 1, is_active: true });
      fetchItems();
    } catch (error: unknown) {
      toast.error("Erreur sauvegarde: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet élément ?")) return;
    try {
      await apiFetch(`/api/gallery-items/${id}`, { method: 'DELETE' });
      toast.success("Supprimé");
      fetchItems();
    } catch (error: unknown) {
      toast.error("Erreur: " + error.message);
    }
  };

  return (
    <div className="space-y-8">
            <div className="flex justify-between items-center border-b pb-6">
                <div>
                    <h2 className="text-3xl font-black text-proqblue">Gestion Gallery Immersive</h2>
                    <p className="text-gray-500">Ajoutez des points éducatifs interactifs sur vos photos.</p>
                </div>
                <Badge variant="outline" className="h-8 px-4 text-lg font-bold">{items.length} Eléments</Badge>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* Formulaire */}
                <div className="bg-white p-8 rounded-3xl border shadow-sm space-y-6">
                    <h3 className="text-xl font-black flex items-center gap-2">
                        <Plus className="text-proqblue" />
                        {editingId ? "Modifier l'élément" : "Nouvel Élément"}
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <Label className="font-bold">Titre de l'installation *</Label>
                                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Poste de transformation T2"
                  title="Titre de l'installation" />
                
                            </div>
                            <div>
                                <Label className="font-bold">Description Éducative</Label>
                                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Décrivez le projet et son intérêt pédagogique..."
                  rows={4}
                  title="Description Éducative" />
                
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="font-bold">Catégorie</Label>
                                    <Input
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="formations, projets, installations"
                    title="Catégorie" />
                  
                                </div>
                                <div>
                                    <Label className="font-bold">Type</Label>
                                    <select
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as unknown })}
                  title="Sélectionner le type de média">
                    
                                        <option value="photo">Photo (avec Hotspots)</option>
                                        <option value="video">Vidéo</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <Label className="font-bold">Image / Média *</Label>
                                <ImageUploadInput value={form.url} onChange={(url) => setForm({ ...form, url: url || '' })} bucketName="images" />
                            </div>

                            {/* Editeur de Hotspots Visuel */}
                            {form.url && form.type === 'photo' &&
              <div className="space-y-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-black text-proqblue flex items-center gap-2 uppercase tracking-wider text-xs">
                                            Points Interactifs ({form.hotspots?.length || 0})
                                        </h4>
                                        <Button
                    type="button"
                    variant={isHotspotMode ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setIsHotspotMode(!isHotspotMode)}
                    className="font-bold">
                    
                                            {isHotspotMode ? <X className="mr-2 h-4 w-4" /> : <Zap className="mr-2 h-4 w-4" />}
                                            {isHotspotMode ? "Terminer Placement" : "Placer des Points"}
                                        </Button>
                                    </div>

                                    <div className="relative group cursor-crosshair overflow-hidden rounded-xl bg-black shadow-inner" onClick={handleImageClick}>
                                        <img ref={imgRef} src={form.url} className="w-full opacity-80" alt="Previsualisation" loading="lazy" />
                                        <style dangerouslySetInnerHTML={{
                    __html: (form.hotspots || []).map((hs, i) => `
                                            .hotspot-point-${i} { left: ${hs.x}%; top: ${hs.y}%; }
                                        `).join('\n')
                  }} />
                                        {form.hotspots?.map((hs, i) =>
                  <div
                    key={i}
                    className={`absolute w-6 h-6 -ml-3 -mt-3 bg-proqblue border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-lg hotspot-point-${i}`}>
                    
                                                {i + 1}
                                            </div>
                  )}
                                        {isHotspotMode &&
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-proqblue/10 backdrop-blur-[1px]">
                                                <span className="bg-white px-4 py-2 rounded-full text-proqblue font-black text-xs shadow-xl animate-bounce">
                                                    CLIQUEZ SUR L'IMAGE POUR PLACER UN POINT
                                                </span>
                                            </div>
                  }
                                    </div>

                                    <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                                        {form.hotspots?.map((hs, i) =>
                  <div key={i} className="bg-white p-4 rounded-xl border relative shadow-sm animate-in slide-in-from-right-2">
                                                <button
                      onClick={() => removeHotspot(i)}
                      className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded-md"
                      title="Supprimer ce point interactif">
                      
                                                    <Trash2 size={16} />
                                                </button>
                                                <Input
                      className="mb-2 font-bold bg-slate-50"
                      value={hs.title}
                      onChange={(e) => updateHotspot(i, 'title', e.target.value)}
                      placeholder="Titre du point (ex: Disjoncteur)"
                      title={`Titre du point interactif ${i + 1}`} />
                    
                                                <Textarea
                      className="text-sm h-16"
                      value={hs.content}
                      onChange={(e) => updateHotspot(i, 'content', e.target.value)}
                      placeholder="Expliquez ce qu'on voit ici..."
                      title={`Description du point interactif ${i + 1}`} />
                    
                                            </div>
                  )}
                                    </div>
                                </div>
              }
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="submit" className="flex-1 bg-proqblue h-14 text-lg font-black rounded-xl hover:scale-[1.02] transition-transform">
                                <Save className="mr-2" /> {editingId ? "Mettre à jour" : "Ajouter à la Galerie"}
                            </Button>
                            {editingId &&
              <Button type="button" variant="ghost" className="h-14 font-bold" onClick={() => {setEditingId(null);setForm({});}}>
                                    Annuler
                                </Button>
              }
                        </div>
                    </form>
                </div>

                {/* Liste des éléments */}
                <div className="space-y-6">
                    {/* Rubrique d'Aide - Comme demandé */}
                    <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 shadow-sm animate-in fade-in slide-in-from-top-4 duration-1000">
                        <h4 className="flex items-center gap-2 text-amber-800 font-black uppercase tracking-widest text-xs mb-4">
                            <Zap size={16} className="fill-amber-400 text-amber-500" />
                            Guide : Créer l'Immersion
                        </h4>
                        <ul className="space-y-3 text-sm text-amber-900 font-medium">
                            <li className="flex gap-2">
                                <span className="bg-amber-200 text-amber-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">1</span>
                                <strong>Upload :</strong> Envoyez votre photo (bucket 'images').
                            </li>
                            <li className="flex gap-2">
                                <span className="bg-amber-200 text-amber-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">2</span>
                                <strong>Placement :</strong> Activez "Placer des Points" et cliquez sur la photo pour désigner un élément technique.
                            </li>
                            <li className="flex gap-2">
                                <span className="bg-amber-200 text-amber-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">3</span>
                                <strong>Éduquer :</strong> Écrivez un titre et un conseil pro pour chaque point.
                            </li>
                            <li className="flex gap-2">
                                <span className="bg-amber-200 text-amber-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0">4</span>
                                <strong>Terminer :</strong> Désactivez le placement avant d'enregistrer pour valider.
                            </li>
                        </ul>
                        <p className="mt-4 text-[11px] text-amber-700/70 italic border-t border-amber-200 pt-3">
                            💡 Conseil : Un bon point Hotspot explique une norme ou un choix technique.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 px-2">
                        <Info className="text-proqblue" size={20} />
                        <span className="font-bold text-gray-400 uppercase tracking-widest text-xs">Aperçu de votre Showcase</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {items.map((item) =>
            <div key={item.id} className="group relative bg-white rounded-3xl overflow-hidden border shadow-sm hover:shadow-xl transition-all h-80">
                                <img
                src={item.url}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                alt={item.title || "Image de la galerie"} loading="lazy" />
              
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6">
                                    <h4 className="text-white font-black text-lg leading-tight mb-2">{item.title}</h4>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-white/20 backdrop-blur-md text-white border-0">{item.category}</Badge>
                                        <Badge className="bg-proqblue text-white border-0">{item.hotspots?.length || 0} Points</Badge>
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" className="bg-white text-proqblue hover:bg-blue-50 rounded-xl shadow-lg" onClick={() => {setForm(item);setEditingId(item.id);}}>
                                        <ImageIcon size={18} />
                                    </Button>
                                    <Button size="icon" className="bg-red-500 text-white hover:bg-red-600 rounded-xl shadow-lg" onClick={() => handleDelete(item.id)}>
                                        <Trash2 size={18} />
                                    </Button>
                                </div>
                            </div>
            )}
                    </div>
                </div>
            </div>
        </div>);

}