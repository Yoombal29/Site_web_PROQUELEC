import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Plus, Trash2, Layout, BarChart, Settings, Users, Activity, ShieldCheck, Cpu, Play, Square, RefreshCw } from "lucide-react";
import { useHomeStats, useHomeServices, useTestimonials, useHomeSlides, usePartners } from "@/hooks/useHomeData";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

const AdminHomePanel = () => {
  const queryClient = useQueryClient();
  const { data: slides, isLoading: loadingSlides } = useHomeSlides();
  const { data: stats, isLoading: loadingStats } = useHomeStats();
  const { data: services, isLoading: loadingServices } = useHomeServices();

  const { data: testimonials, isLoading: loadingTestimonials } = useTestimonials();
  const { data: partners, isLoading: loadingPartners } = usePartners();

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
  const [systemStatus, setSystemStatus] = useState<unknown>(null);
  const [systemLogs, setSystemLogs] = useState<unknown[]>([]);
  const [localSlides, setLocalSlides] = useState<unknown[]>([]);

  const authFetch = async (url: string, options: unknown = {}) => {
    const token = localStorage.getItem('token');
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  };

  const fetchSystemStatus = async () => {
    setIsRefreshingStatus(true);
    try {
      const res = await fetch('/api/admin/system/status', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setSystemStatus(await res.json());
    } catch (e) {
      console.error("Failed to fetch system status");
    } finally {
      setIsRefreshingStatus(false);
    }
  };

  const fetchSystemLogs = async () => {
    try {
      const res = await fetch('/api/admin/system/logs', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSystemLogs(data.logs);
      }
    } catch (e) {
      console.error("Failed to fetch system logs");
    }
  };

  useEffect(() => {
    fetchSystemStatus();
    fetchSystemLogs();
    const timer = setInterval(() => {
      fetchSystemStatus();
      fetchSystemLogs();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const controlService = async (service: string, action: string) => {
    try {
      const res = await authFetch('/api/admin/system/control', {
        method: 'POST',
        body: JSON.stringify({ service, action })
      });
      if (res.ok) {
        toast.success(action === 'start' ? "Démarrage demandé..." : "Arrêt demandé...");
        setTimeout(fetchSystemStatus, 2000); // Refresh after delay
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur de contrôle");
      }
    } catch (e) {
      toast.error("Échec de la communication avec le serveur");
    }
  };

  useEffect(() => {
    if (slides) setLocalSlides(slides);
  }, [slides]);

  const handleSlideChange = (id: number, field: string, value: unknown) => {
    setLocalSlides((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  };

  const saveSlides = async () => {
    setSaving(true);
    try {
      for (const slide of localSlides) {
        const res = await authFetch(`/api/home-slides/${slide.id}`, {
          method: 'PUT',
          body: JSON.stringify(slide)
        });
        if (res.status === 401 || res.status === 403) {
          toast.error("Session expirée. Veuillez vous reconnecter.");
          return;
        }
      }
      toast.success("Bannières enregistrées !");
      queryClient.invalidateQueries({ queryKey: ['home-slides'] });
    } catch (e) {
      toast.error("Erreur lors de l'enregistrement des bannières");
    } finally {
      setSaving(false);
    }
  };

  const deleteSlide = async (id: number) => {
    if (!confirm("Supprimer cette bannière ?")) return;
    const res = await authFetch(`/api/home-slides/${id}`, { method: 'DELETE' });
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ['home-slides'] });
      toast.info("Bannière supprimée");
    } else {
      toast.error("Erreur suppression");
    }
  };

  const addSlide = async () => {
    const title = prompt("Titre de la nouvelle bannière");
    if (!title) return;
    const res = await authFetch('/api/home-slides', {
      method: 'POST',
      body: JSON.stringify({
        badge: "NOUVEAU",
        title,
        subtitle: "",
        description: "",
        background_url: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5",
        cta_text: "En savoir plus",
        cta_link: "/"
      })
    });
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ['home-slides'] });
    } else {
      toast.error("Erreur ajout");
    }
  };

  // --- Stats Management ---
  const [localStats, setLocalStats] = useState<unknown[]>([]);

  React.useEffect(() => {
    if (stats) setLocalStats(stats);
  }, [stats]);

  const handleStatChange = (id: number, field: string, value: unknown) => {
    setLocalStats((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  };

  const saveStats = async () => {
    setSaving(true);
    try {
      for (const stat of localStats) {
        const res = await authFetch(`/api/home-stats/${stat.id}`, {
          method: 'PUT',
          body: JSON.stringify(stat)
        });
        if (res.status === 401 || res.status === 403) {
          toast.error("Session expirée. Veuillez vous reconnecter.");
          return;
        }
      }
      toast.success("Statistiques enregistrées !");
      queryClient.invalidateQueries({ queryKey: ['home-stats'] });
    } catch (e) {
      toast.error("Erreur lors de l'enregistrement des stats");
    } finally {
      setSaving(false);
    }
  };

  const deleteStat = async (id: number) => {
    if (!confirm("Supprimer cette statistique ?")) return;
    const res = await authFetch(`/api/home-stats/${id}`, { method: 'DELETE' });
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ['home-stats'] });
      toast.info("Statistique supprimée");
    } else {
      toast.error("Erreur suppression");
    }
  };

  const addStat = async () => {
    const label = prompt("Label (ex: Années d'expérience)");
    if (!label) return;
    const res = await authFetch('/api/home-stats', {
      method: 'POST',
      body: JSON.stringify({ label, value: "0", icon_name: "Award", description: "", is_warning: false })
    });
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ['home-stats'] });
    } else {
      toast.error("Erreur ajout");
    }
  };

  // --- Services Management ---
  const [localServices, setLocalServices] = useState<unknown[]>([]);

  React.useEffect(() => {
    if (services) setLocalServices(services);
  }, [services]);

  const handleServiceChange = (id: number, field: string, value: unknown) => {
    setLocalServices((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  };

  const saveServices = async () => {
    setSaving(true);
    try {
      for (const s of localServices) {
        const res = await authFetch(`/api/home-services/${s.id}`, {
          method: 'PUT',
          body: JSON.stringify(s)
        });
        if (res.status === 401 || res.status === 403) {
          toast.error("Session expirée. Veuillez vous reconnecter.");
          return;
        }
      }
      toast.success("Services enregistrés !");
      queryClient.invalidateQueries({ queryKey: ['home-services'] });
    } catch (e) {
      toast.error("Erreur lors de l'enregistrement des services");
    } finally {
      setSaving(false);
    }
  };

  const deleteService = async (id: number) => {
    if (!confirm("Supprimer ce service ?")) return;
    const res = await authFetch(`/api/home-services/${id}`, { method: 'DELETE' });
    if (res.ok) {
      queryClient.invalidateQueries({ queryKey: ['home-services'] });
      toast.info("Service supprimé");
    } else {
      toast.error("Erreur suppression");
    }
  };

  // --- Testimonials Management ---
  const deleteTestimonial = async (id: number) => {
    if (!confirm("Supprimer ce témoignage ?")) return;
    await authFetch(`/api/testimonials/${id}`, { method: 'DELETE' });
    queryClient.invalidateQueries({ queryKey: ['testimonials'] });
  };

  // --- Partners Management ---
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const deletePartner = async (id: number) => {
    if (!confirm("Supprimer ce partenaire ?")) return;
    await authFetch(`/api/partners/${id}`, { method: 'DELETE' });
    queryClient.invalidateQueries({ queryKey: ['partners'] });
    toast.info("Partenaire supprimé");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload
      const uploadRes = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData
      }); // No auth header needed for this specific endpoint primarily, or check backend

      if (!uploadRes.ok) throw new Error("Upload failed");
      const uploadData = await uploadRes.json();
      const logo_url = uploadData.url;

      // 2. Create Partner
      const name = prompt("Nom du partenaire", file.name.split('.')[0]);
      if (!name) return; // User cancelled

      const res = await authFetch('/api/partners', {
        method: 'POST',
        body: JSON.stringify({ name, logo_url, category: "Partenaire" })
      });

      if (res.ok) {
        queryClient.invalidateQueries({ queryKey: ['partners'] });
        toast.success("Partenaire ajouté avec succès");
      } else {
        toast.error("Erreur création partenaire");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'upload");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  if (loadingSlides || loadingStats || loadingServices || loadingTestimonials || loadingPartners) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <Card className="border-proqblue/20">
            <CardHeader className="bg-proqblue text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                    <Layout className="w-5 h-5" />
                    Gestion de la Page d'Accueil
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <Tabs defaultValue="hero">
                    <TabsList className="mb-6">
                        <TabsTrigger value="hero" className="gap-2"><Layout className="w-4 h-4" /> Bannière</TabsTrigger>
                        <TabsTrigger value="stats" className="gap-2"><BarChart className="w-4 h-4" /> Stats</TabsTrigger>
                        <TabsTrigger value="services" className="gap-2"><Settings className="w-4 h-4" /> Services</TabsTrigger>
                        <TabsTrigger value="partners" className="flex items-center gap-2">
                            <Users className="w-4 h-4" /> Partenaires
                        </TabsTrigger>
                        <TabsTrigger value="system" className="flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Système
                        </TabsTrigger>
                        <TabsTrigger value="testimonials" className="gap-2"><Users className="w-4 h-4" /> Témoignages</TabsTrigger>
                    </TabsList>

                    <TabsContent value="hero" className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-proqblue">Gestion des Bannières (Slides)</h3>
                            <Button onClick={addSlide} variant="outline" size="sm" className="border-proqblue text-proqblue hover:bg-proqblue/10">
                                <Plus className="w-4 h-4 mr-2" /> Ajouter une slide
                            </Button>
                        </div>

                        <div className="space-y-8">
                            {localSlides.map((slide, index) =>
              <div key={slide.id} className="p-6 border rounded-2xl bg-slate-50 border-proqblue/10 shadow-sm space-y-4">
                                    <div className="flex justify-between items-center border-b pb-2 mb-4">
                                        <Badge className="bg-proqblue">Slide #{index + 1}</Badge>
                                        <Button variant="ghost" size="sm" onClick={() => deleteSlide(slide.id)} className="text-red-500 hover:bg-red-50">
                                            <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                                        </Button>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Badge (Petit texte en haut)</Label>
                                            <Input value={slide.badge} onChange={(e) => handleSlideChange(slide.id, 'badge', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Titre Principal</Label>
                                            <Input value={slide.title} onChange={(e) => handleSlideChange(slide.id, 'title', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Sous-titre / Slogan</Label>
                                            <Input value={slide.subtitle} onChange={(e) => handleSlideChange(slide.id, 'subtitle', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Image de fond (URL)</Label>
                                            <Input value={slide.background_url} onChange={(e) => handleSlideChange(slide.id, 'background_url', e.target.value)} />
                                            <p className="text-[10px] text-slate-400 italic">
                                                Pour une image locale : <strong>http://localhost:3000/uploads/nom-fichier.ext</strong>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea value={slide.description} onChange={(e) => handleSlideChange(slide.id, 'description', e.target.value)} />
                                    </div>

                                    <div className="grid md:grid-cols-4 gap-4 border-t pt-4">
                                        <div className="space-y-2">
                                            <Label>Texte Bouton 1</Label>
                                            <Input value={slide.cta_text} onChange={(e) => handleSlideChange(slide.id, 'cta_text', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Lien Bouton 1</Label>
                                            <Input value={slide.cta_link} onChange={(e) => handleSlideChange(slide.id, 'cta_link', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Texte Bouton 2</Label>
                                            <Input value={slide.secondary_cta_text} onChange={(e) => handleSlideChange(slide.id, 'secondary_cta_text', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Lien Bouton 2</Label>
                                            <Input value={slide.secondary_cta_link} onChange={(e) => handleSlideChange(slide.id, 'secondary_cta_link', e.target.value)} />
                                        </div>
                                    </div>
                                </div>
              )}
                        </div>

                        <Button onClick={saveSlides} disabled={saving} className="w-full md:w-auto text-white bg-proqblue hover:bg-proqblue-dark">
                            {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                            Enregistrer toutes les bannières
                        </Button>
                    </TabsContent>

                    <TabsContent value="stats" className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-proqblue">Chiffres clés et statistiques</h3>
                            <Button onClick={addStat} variant="outline" size="sm" className="border-proqblue text-proqblue hover:bg-proqblue/10"><Plus className="w-4 h-4 mr-2" /> Ajouter un chiffre</Button>
                        </div>
                        <div className="grid gap-4">
                            {localStats.map((stat) =>
              <div key={stat.id} className="grid grid-cols-12 gap-3 items-end p-4 border rounded-xl bg-slate-50 border-proqblue/10 shadow-sm">
                                    <div className="col-span-4">
                                        <Label className="text-[10px] uppercase font-bold text-gray-500">Label</Label>
                                        <Input
                    value={stat.label}
                    onChange={(e) => handleStatChange(stat.id, 'label', e.target.value)}
                    className="bg-white h-9" />
                  
                                    </div>
                                    <div className="col-span-2">
                                        <Label className="text-[10px] uppercase font-bold text-gray-500">Valeur</Label>
                                        <Input
                    value={stat.value}
                    onChange={(e) => handleStatChange(stat.id, 'value', e.target.value)}
                    className="bg-white h-9" />
                  
                                    </div>
                                    <div className="col-span-3">
                                        <Label className="text-[10px] uppercase font-bold text-gray-500">Description</Label>
                                        <Input
                    value={stat.description}
                    onChange={(e) => handleStatChange(stat.id, 'description', e.target.value)}
                    className="bg-white h-9 text-xs" />
                  
                                    </div>
                                    <div className="col-span-2 flex flex-col justify-center gap-2">
                                        <Label className="text-[10px] uppercase font-bold text-gray-500">Urgent</Label>
                                        <div className="flex items-center gap-2">
                                            <input
                      type="checkbox"
                      checked={stat.is_warning}
                      onChange={(e) => handleStatChange(stat.id, 'is_warning', e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-proqblue"
                      title="Marquer comme urgent"
                      aria-label="Marquer cette statistique comme urgente" />
                    
                                            {stat.is_warning && <Badge variant="destructive" className="h-4 text-[9px]">OUI</Badge>}
                                        </div>
                                    </div>
                                    <div className="col-span-1 text-right">
                                        <Button variant="ghost" size="icon" onClick={() => deleteStat(stat.id)} className="h-9 w-9 text-red-400 hover:text-red-600 hover:bg-red-50">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
              )}
                        </div>
                        <Button onClick={saveStats} disabled={saving} className="w-full md:w-auto text-white bg-proqblue hover:bg-proqblue-dark">
                            {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                            Enregistrer toutes les statistiques
                        </Button>
                    </TabsContent>

                    <TabsContent value="services" className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-proqblue">Services et solutions</h3>
                        </div>
                        <div className="grid gap-4">
                            {localServices.map((service) =>
              <div key={service.id} className="p-4 border rounded-xl bg-white border-proqblue/10 shadow-sm space-y-3">
                                    <div className="flex justify-between gap-4">
                                        <div className="flex-1 space-y-2">
                                            <Label className="text-xs font-bold text-gray-400">Titre du service</Label>
                                            <Input
                      value={service.title}
                      onChange={(e) => handleServiceChange(service.id, 'title', e.target.value)}
                      className="font-bold" />
                    
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => deleteService(service.id)} className="self-start text-red-300 hover:text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-bold text-gray-400">Description courte</Label>
                                        <Textarea
                    value={service.description}
                    onChange={(e) => handleServiceChange(service.id, 'description', e.target.value)}
                    rows={2} />
                  
                                    </div>
                                </div>
              )}
                        </div>
                        <Button onClick={saveServices} disabled={saving} className="w-full md:w-auto text-white bg-proqblue hover:bg-proqblue-dark">
                            {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                            Enregistrer tous les services
                        </Button>
                    </TabsContent>

                    <TabsContent value="partners">
                        <div className="flex flex-col gap-6">
                            <div className="flex justify-between items-end border-b pb-4">
                                <div>
                                    <h3 className="font-semibold text-proqblue text-lg">Gestion des Partenaires</h3>
                                    <p className="text-sm text-gray-500">Ajoutez les logos de vos partenaires institutionnels et techniques.</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={triggerUpload} disabled={isUploading} className="bg-proqblue text-white hover:bg-proqblue-dark shadow-md">
                                        {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                                        {isUploading ? "Lecture..." : "Ajouter un Logo"}
                                    </Button>
                                    <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                    title="Uploader un logo"
                    aria-label="Uploader un logo" />
                  
                                </div>
                            </div>

                            {partners?.length === 0 &&
              <div className="p-12 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                                    <Users className="w-12 h-12 mb-4 opacity-20" />
                                    <p>Aucun partenaire pour le moment.</p>
                                    <Button variant="link" onClick={triggerUpload}>Commencer par en ajouter un</Button>
                                </div>
              }

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {partners?.map((p) =>
                <div key={p.id} className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-proqblue/30 aspect-square flex flex-col">
                                        {/* Image Area */}
                                        <div className="flex-1 p-4 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 relative" style={{backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(0,0,0,.03) 10px, rgba(0,0,0,.03) 11px), repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,.03) 10px, rgba(0,0,0,.03) 11px)'}}>
                                            <img
                      src={p.logo_url}
                      alt={p.name}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110" loading="lazy" />
                    
                                        </div>

                                        {/* Info Area */}
                                        <div className="p-3 bg-white border-t border-slate-100 relative z-10 transition-colors group-hover:bg-slate-50">
                                            <div className="font-bold text-sm text-slate-700 truncate text-center" title={p.name}>
                                                {p.name}
                                            </div>
                                            <div className="text-[10px] text-slate-400 text-center uppercase tracking-wide mt-1">
                                                {p.category}
                                            </div>
                                        </div>

                                        {/* Actions Overlay */}
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-1">
                                            <Button
                      variant="destructive"
                      size="icon"
                      className="h-7 w-7 shadow-sm rounded-full"
                      onClick={() => deletePartner(p.id)}
                      title="Supprimer">
                      
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="testimonials">
                        <div className="grid gap-4">
                            {testimonials?.map((t) =>
              <div key={t.id} className="p-4 border rounded-lg bg-white">
                                    <div className="flex justify-between">
                                        <div className="font-bold text-proqblue">{t.name} <span className="text-xs font-normal text-gray-500">- {t.role}</span></div>
                                        <Button variant="ghost" size="sm" onClick={() => deleteTestimonial(t.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                    </div>
                                    <div className="text-sm italic text-gray-600 mt-2">"{t.content}"</div>
                                </div>
              )}
                        </div>
                    </TabsContent>
                    <TabsContent value="system" className="space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="font-semibold text-proqblue text-lg flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-proqblue" /> Santé du Système
                                </h3>
                                <p className="text-sm text-gray-500">Surveillance des serveurs et services en temps réel.</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={fetchSystemStatus} disabled={isRefreshingStatus}>
                                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshingStatus ? 'animate-spin' : ''}`} /> Actualiser
                            </Button>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                                {/* Node Backend */}
                                <Card className="border-proqblue/10 overflow-hidden group hover:shadow-xl transition-all duration-500 bg-white/50 backdrop-blur-md">
                                    <CardHeader className="bg-slate-50/50 pb-4">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-md font-bold flex items-center gap-2 group-hover:text-proqblue transition-colors">
                                                <Activity className="w-4 h-4 text-blue-500" /> Backend Node
                                            </CardTitle>
                                            <div className="w-3 h-3 rounded-full glow-green bg-green-500 animate-pulse" title="Online" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="text-3xl font-black text-proqblue tracking-tighter">3000</div>
                                        <div className="text-[10px] text-gray-400 font-mono uppercase tracking-widest font-bold">Principal (Express.js)</div>
                                        <div className="p-2 bg-slate-900 rounded-lg text-[10px] text-emerald-400 font-mono shadow-inner border border-white/5">
                                            npm start
                                        </div>
                                        <p className="text-[11px] text-slate-500 leading-tight italic">
                                            // Gère l'API, l'authentification et la logique métier principale.
                                        </p>
                                        <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 font-bold">OPÉRATIONNEL</Badge>
                                    </CardContent>
                                </Card>

                                {/* Python AI */}
                                <Card className={cn(
                  "border-proqblue/10 overflow-hidden transition-all duration-500 bg-white/50 backdrop-blur-md group hover:shadow-xl",
                  systemStatus?.ai?.status === 'online' ? '' : 'opacity-80 grayscale-[0.5]'
                )}>
                                    <CardHeader className="bg-slate-50/50 pb-4">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-md font-bold flex items-center gap-2 group-hover:text-purple-600 transition-colors">
                                                <Cpu className="w-4 h-4 text-purple-500" /> Cerveau IA
                                            </CardTitle>
                                            <div className={cn("w-3 h-3 rounded-full", systemStatus?.ai?.status === 'online' ? 'glow-green bg-green-500' : 'glow-red bg-red-500')} />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="text-3xl font-black text-proqblue tracking-tighter">8002</div>
                                        <div className="text-[10px] text-gray-400 font-mono uppercase tracking-widest font-bold">Expert Normatif (Python)</div>
                                        <div className="p-2 bg-slate-900 rounded-lg text-[10px] text-purple-400 font-mono shadow-inner border border-white/5">
                                            python server.py
                                        </div>
                                        <p className="text-[11px] text-slate-500 leading-tight italic">
                                            // Moteur IA (Haystack) traitant les normes NS 01-001 et le RAG.
                                        </p>
                                        <div className="flex gap-2 pt-2">
                                            {systemStatus?.ai?.status === 'online' ?
                      <Button size="sm" variant="destructive" className="w-full flex items-center gap-2 rounded-lg" onClick={() => controlService('python', 'stop')}>
                                                    <Square className="w-3 h-3" /> Arrêter
                                                </Button> :

                      <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 flex items-center gap-2 rounded-lg shadow-lg shadow-green-500/20" onClick={() => controlService('python', 'start')}>
                                                    <Play className="w-3 h-3" /> Démarrer
                                                </Button>
                      }
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Vite Frontend */}
                                <Card className="border-proqblue/10 overflow-hidden shadow-sm bg-white/50 backdrop-blur-md hover:shadow-xl transition-all duration-500 group">
                                    <CardHeader className="bg-slate-50/50 pb-4">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-md font-bold flex items-center gap-2 group-hover:text-orange-500 transition-colors">
                                                <Layout className="w-4 h-4 text-orange-500" /> Interface Vite
                                            </CardTitle>
                                            <div className={`w-3 h-3 rounded-full glow-green bg-green-500 animate-pulse`} title="Online" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="text-3xl font-black text-proqblue tracking-tighter">5173</div>
                                        <div className="text-[10px] text-gray-400 font-mono uppercase tracking-widest font-bold">Frontend (React/Vite)</div>
                                        <div className="p-2 bg-slate-900 rounded-lg text-[10px] text-orange-400 font-mono shadow-inner border border-white/5">
                                            npm run dev
                                        </div>
                                        <p className="text-[11px] text-slate-500 leading-tight italic">
                                            // Serveur de développement pour l'interface React et HMR.
                                        </p>
                                        <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 uppercase font-bold">Actif</Badge>
                                    </CardContent>
                                </Card>

                                {/* Database */}
                                <Card className="border-proqblue/10 overflow-hidden shadow-sm bg-white/50 backdrop-blur-md hover:shadow-xl transition-all duration-500 group">
                                    <CardHeader className="bg-slate-50/50 pb-4">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-md font-bold flex items-center gap-2 group-hover:text-slate-700 transition-colors">
                                                <Settings className="w-4 h-4 text-slate-500" /> Base de Données
                                            </CardTitle>
                                            <div className={`w-3 h-3 rounded-full ${systemStatus?.database?.status === 'online' ? 'glow-green bg-green-500' : 'glow-red bg-red-500'}`} />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">
                                        <div className="text-lg font-black truncate text-proqblue-dark" title={systemStatus?.database?.details || 'Connexion...'}>
                                            {systemStatus?.database?.status === 'online' ? 'PostgreSQL 15' : 'Déconnecté'}
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-mono uppercase tracking-widest font-bold">Stockage Institutionnel</div>
                                        <p className="text-[11px] text-slate-500 leading-tight italic">
                                            // Base PostgreSQL stockant le corpus et les audits.
                                        </p>
                                        <Badge variant="outline" className={cn("font-bold", systemStatus?.database?.status === 'online' ? "text-green-600 bg-green-50 border-green-200" : "text-red-600 bg-red-50 border-red-200")}>
                                            {systemStatus?.database?.status === 'online' ? 'CONNECTÉ' : 'ERREUR'}
                                        </Badge>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </AnimatePresence>

                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 items-start">
                            <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <strong>Sécurité Système :</strong> Le serveur Node (Principal) ne peut pas être arrêté depuis l'interface pour éviter toute coupure irréversible. Pour la maintenance lourde, contactez l'administrateur système.
                            </div>
                        </div>

                        {/* Live Log Console */}
                        <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-slate-600">
                                    <Cpu className="w-4 h-4" /> Live System Console
                                </h3>
                                <Badge variant="outline" className="text-[10px] bg-slate-100 font-mono">
                                    {systemLogs.length} entries stored
                                </Badge>
                            </div>
                            <ScrollArea className="h-[250px] w-full rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-[11px] shadow-inner">
                                {systemLogs.length === 0 ?
                <div className="text-slate-600 italic">En attente de logs...</div> :

                <div className="space-y-1">
                                        {systemLogs.map((log, idx) =>
                  <div key={idx} className="flex gap-3 border-l border-white/5 pl-2">
                                                <span className="text-slate-500 whitespace-nowrap">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                                <span className={cn(
                      "font-bold uppercase whitespace-nowrap",
                      log.type === 'error' ? 'text-red-500' :
                      log.type === 'warn' ? 'text-amber-500' : 'text-emerald-500'
                    )}>
                                                    [{log.type}]
                                                </span>
                                                <span className="text-slate-300 break-all">{log.message}</span>
                                            </div>
                  )}
                                    </div>
                }
                            </ScrollArea>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>);

};

export default AdminHomePanel;