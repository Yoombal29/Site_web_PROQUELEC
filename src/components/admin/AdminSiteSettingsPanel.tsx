
import React, { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import ImageUploadInput from "./ImageUploadInput";
import { Label } from "@/components/ui/label";

type SiteSettings = {
  id: number;
  site_name: string;
  slogan: string;
  logo_url: string | null;
  favicon_url: string | null;
  updated_at: string;
  contact_email: string | null;
  phone_number: string | null;
  address: string | null;
  copyright_text: string | null;
  facebook_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  cta_primary_text: string | null;
  cta_primary_url: string | null;
  cta_secondary_text: string | null;
  cta_secondary_url: string | null;
  logo_height?: number;
  logo_scale?: number;
  logo_brightness?: number;
  logo_contrast?: number;
  audience_section_title?: string;
  audience_section_subtitle?: string;
  audience_title_electrician?: string;
  audience_subtitle_electrician?: string;
  audience_desc_electrician?: string;
  audience_title_company?: string;
  audience_subtitle_company?: string;
  audience_desc_company?: string;
  audience_title_member?: string;
  audience_subtitle_member?: string;
  audience_desc_member?: string;
};

export default function AdminSiteSettingsPanel() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    site_name: "",
    slogan: "",
    logo_url: "",
    favicon_url: "",
    contact_email: "",
    phone_number: "",
    address: "",
    copyright_text: "",
    facebook_url: "",
    linkedin_url: "",
    twitter_url: "",
    cta_primary_text: "",
    cta_primary_url: "",
    cta_secondary_text: "",
    cta_secondary_url: "",
    logo_height: 50,
    logo_scale: 1,
    logo_brightness: 100,
    logo_contrast: 100,
    audience_section_title: "",
    audience_section_subtitle: "",
    audience_title_electrician: "",
    audience_subtitle_electrician: "",
    audience_desc_electrician: "",
    audience_title_company: "",
    audience_subtitle_company: "",
    audience_desc_company: "",
    audience_title_member: "",
    audience_subtitle_member: "",
    audience_desc_member: ""
  });
  const queryClient = useQueryClient();

  // Récupère la config au chargement
  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const res = await fetch("/api/site-settings");
        if (!res.ok) throw new Error("Failed to fetch settings");
        const data = await res.json();

        // On prend le premier réglage (id=1 normalement)
        const settingsData = Array.isArray(data) ? data[0] : data;

        if (settingsData) {
          setSettings(settingsData);
          setForm({
            site_name: settingsData.site_name ?? "",
            slogan: settingsData.slogan ?? "",
            logo_url: settingsData.logo_url ?? "",
            favicon_url: settingsData.favicon_url ?? "",
            contact_email: settingsData.contact_email ?? "",
            phone_number: settingsData.phone_number ?? "",
            address: settingsData.address ?? "",
            copyright_text: settingsData.copyright_text ?? "",
            facebook_url: settingsData.facebook_url ?? "",
            linkedin_url: settingsData.linkedin_url ?? "",
            twitter_url: settingsData.twitter_url ?? "",
            cta_primary_text: settingsData.cta_primary_text ?? "",
            cta_primary_url: settingsData.cta_primary_url ?? "",
            cta_secondary_text: settingsData.cta_secondary_text ?? "",
            cta_secondary_url: settingsData.cta_secondary_url ?? "",
            logo_height: settingsData.logo_height ?? 50,
            logo_scale: settingsData.logo_scale ?? 1,
            logo_brightness: settingsData.logo_brightness ?? 100,
            logo_contrast: settingsData.logo_contrast ?? 100,
            audience_section_title: settingsData.audience_section_title ?? "Des Services Sur-Mesure",
            audience_section_subtitle: settingsData.audience_section_subtitle ?? "",
            audience_title_electrician: settingsData.audience_title_electrician ?? "Électriciens",
            audience_subtitle_electrician: settingsData.audience_subtitle_electrician ?? "Indépendants & Artisans",
            audience_desc_electrician: settingsData.audience_desc_electrician ?? "",
            audience_title_company: settingsData.audience_title_company ?? "Professionnels",
            audience_subtitle_company: settingsData.audience_subtitle_company ?? "Entreprises & Installateurs",
            audience_desc_company: settingsData.audience_desc_company ?? "",
            audience_title_member: settingsData.audience_title_member ?? "Membres",
            audience_subtitle_member: settingsData.audience_subtitle_member ?? "Association & Experts",
            audience_desc_member: settingsData.audience_desc_member ?? ""
          });
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch("/api/site-settings", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          site_name: form.site_name,
          slogan: form.slogan,
          logo_url: form.logo_url || null,
          favicon_url: form.favicon_url || null,
          contact_email: form.contact_email || null,
          phone_number: form.phone_number || null,
          address: form.address || null,
          copyright_text: form.copyright_text || null,
          facebook_url: form.facebook_url || null,
          linkedin_url: form.linkedin_url || null,
          twitter_url: form.twitter_url || null,
          cta_primary_text: form.cta_primary_text || null,
          cta_primary_url: form.cta_primary_url || null,
          cta_secondary_text: form.cta_secondary_text || null,
          cta_secondary_url: form.cta_secondary_url || null,
          logo_height: form.logo_height,
          logo_scale: form.logo_scale,
          logo_brightness: form.logo_brightness,
          logo_contrast: form.logo_contrast,
          audience_section_title: form.audience_section_title,
          audience_section_subtitle: form.audience_section_subtitle,
          audience_title_electrician: form.audience_title_electrician,
          audience_subtitle_electrician: form.audience_subtitle_electrician,
          audience_desc_electrician: form.audience_desc_electrician,
          audience_title_company: form.audience_title_company,
          audience_subtitle_company: form.audience_subtitle_company,
          audience_desc_company: form.audience_desc_company,
          audience_title_member: form.audience_title_member,
          audience_subtitle_member: form.audience_subtitle_member,
          audience_desc_member: form.audience_desc_member
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update settings");
      }

      const updatedData = await res.json();

      // Invalider le cache des paramètres en temps réel
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["liveSettings"] });

      toast.success("Paramètres mis à jour ! Les changements sont visibles immédiatement sur le site.");
      setSettings(updatedData);

    } catch (error: unknown) {
      toast.error("Erreur lors de la sauvegarde : " + error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="animate-spin text-primary w-8 h-8 mb-2" />
        <span className="text-primary">Chargement paramètres…</span>
      </div>);

  }

  return (
    <form
      className="grid gap-8"
      onSubmit={handleSave}
      aria-label="Modifier les paramètres du site">
      
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-primary border-b pb-2">Paramètres Généraux</h3>
        <div>
          <Label className="block font-semibold mb-1 text-primary">Nom du site</Label>
          <Input name="site_name" value={form.site_name} required onChange={handleChange} className="max-w-md" disabled={saving} />
        </div>
        <div>
          <Label className="block font-semibold mb-1 text-primary">Slogan</Label>
          <Input name="slogan" value={form.slogan} required onChange={handleChange} className="max-w-md" disabled={saving} />
        </div>
        <div>
          <Label className="block font-semibold mb-1 text-primary">Logo</Label>
          <ImageUploadInput value={form.logo_url} onChange={(url) => setForm((prev) => ({ ...prev, logo_url: url || '' }))} bucketName="site-assets" />
        </div>
        <div>
          <Label className="block font-semibold mb-1 text-primary">Favicon</Label>
          <ImageUploadInput value={form.favicon_url} onChange={(url) => setForm((prev) => ({ ...prev, favicon_url: url || '' }))} bucketName="site-assets" />
        </div>
        <div>
          <Label className="block font-semibold mb-1 text-primary">Texte du Copyright (footer)</Label>
          <Input name="copyright_text" value={form.copyright_text} onChange={handleChange} className="max-w-md" disabled={saving} placeholder="Ex: © 2025 Mon Entreprise" />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-primary border-b pb-2">Informations de Contact</h3>
        <div>
          <Label className="block font-semibold mb-1 text-primary">Email de contact</Label>
          <Input type="email" name="contact_email" value={form.contact_email} onChange={handleChange} className="max-w-md" disabled={saving} placeholder="contact@exemple.com" />
        </div>
        <div>
          <Label className="block font-semibold mb-1 text-primary">Téléphone</Label>
          <Input type="tel" name="phone_number" value={form.phone_number} onChange={handleChange} className="max-w-md" disabled={saving} placeholder="+221 77 123 45 67" />
        </div>
        <div>
          <Label className="block font-semibold mb-1 text-primary">Adresse</Label>
          <Input name="address" value={form.address} onChange={handleChange} className="max-w-md" disabled={saving} placeholder="123, Rue de l'exemple, Dakar" />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-primary border-b pb-2">Réseaux Sociaux</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label className="block font-semibold mb-1 text-primary">URL Facebook</Label>
            <Input type="url" name="facebook_url" value={form.facebook_url} onChange={handleChange} disabled={saving} placeholder="https://facebook.com/profil" />
          </div>
          <div>
            <Label className="block font-semibold mb-1 text-primary">URL LinkedIn</Label>
            <Input type="url" name="linkedin_url" value={form.linkedin_url} onChange={handleChange} disabled={saving} placeholder="https://linkedin.com/in/profil" />
          </div>
          <div>
            <Label className="block font-semibold mb-1 text-primary">URL Twitter (X)</Label>
            <Input type="url" name="twitter_url" value={form.twitter_url} onChange={handleChange} disabled={saving} placeholder="https://x.com/profil" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-primary border-b pb-2">Configuration des Offres (Homepage)</h3>
        <div className="grid gap-6 p-4 bg-primary/5 rounded-lg border border-border">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm mb-1 font-bold" htmlFor="audience_section_title">Titre de la Section</Label>
              <Input id="audience_section_title" name="audience_section_title" value={form.audience_section_title} onChange={handleChange} disabled={saving} placeholder="Titre principal" />
            </div>
            <div>
              <Label className="block text-sm mb-1 font-bold" htmlFor="audience_section_subtitle">Sous-titre de la Section</Label>
              <Input id="audience_section_subtitle" name="audience_section_subtitle" value={form.audience_section_subtitle} onChange={handleChange} disabled={saving} placeholder="Texte de description" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-border">
            <div className="space-y-3">
              <h4 className="font-black text-emerald-600 uppercase text-xs">Pôle Électriciens</h4>
              <Input
                name="audience_title_electrician"
                value={form.audience_title_electrician}
                onChange={handleChange}
                placeholder="Titre (ex: Électriciens)" />
              
              <Input
                name="audience_subtitle_electrician"
                value={form.audience_subtitle_electrician}
                onChange={handleChange}
                placeholder="Sous-titre" />
              
              <textarea
                id="audience_desc_electrician"
                name="audience_desc_electrician"
                value={form.audience_desc_electrician}
                onChange={(e) => setForm((prev) => ({ ...prev, audience_desc_electrician: e.target.value }))}
                className="w-full text-xs p-2 border border-border bg-background text-foreground rounded-md"
                rows={3}
                placeholder="Description pour les électriciens" />
              
            </div>
            <div className="space-y-3">
              <h4 className="font-black text-blue-600 uppercase text-xs">Pôle Professionnels</h4>
              <Input
                name="audience_title_company"
                value={form.audience_title_company}
                onChange={handleChange}
                placeholder="Titre (ex: Professionnels)" />
              
              <Input
                name="audience_subtitle_company"
                value={form.audience_subtitle_company}
                onChange={handleChange}
                placeholder="Sous-titre" />
              
              <textarea
                id="audience_desc_company"
                name="audience_desc_company"
                value={form.audience_desc_company}
                onChange={(e) => setForm((prev) => ({ ...prev, audience_desc_company: e.target.value }))}
                className="w-full text-xs p-2 border border-border bg-background text-foreground rounded-md"
                rows={3}
                placeholder="Description pour les professionnels" />
              
            </div>
            <div className="space-y-3">
              <h4 className="font-black text-indigo-600 uppercase text-xs">Pôle Membres</h4>
              <Input
                name="audience_title_member"
                value={form.audience_title_member}
                onChange={handleChange}
                placeholder="Titre (ex: Membres)" />
              
              <Input
                name="audience_subtitle_member"
                value={form.audience_subtitle_member}
                onChange={handleChange}
                placeholder="Sous-titre" />
              
              <textarea
                id="audience_desc_member"
                name="audience_desc_member"
                value={form.audience_desc_member}
                onChange={(e) => setForm((prev) => ({ ...prev, audience_desc_member: e.target.value }))}
                className="w-full text-xs p-2 border border-border bg-background text-foreground rounded-md"
                rows={3}
                placeholder="Description détaillée" />
              
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-primary border-b pb-2">Boutons d'action (Header)</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-border">
            <h4 className="font-medium text-primary">Bouton Principal (CTA 1)</h4>
            <div>
              <Label className="block text-sm mb-1">Texte du bouton</Label>
              <Input name="cta_primary_text" value={form.cta_primary_text} onChange={handleChange} disabled={saving} placeholder="Ex: Devis Gratuit" />
            </div>
            <div>
              <Label className="block text-sm mb-1">URL du bouton</Label>
              <Input name="cta_primary_url" value={form.cta_primary_url} onChange={handleChange} disabled={saving} placeholder="Ex: /contact" />
            </div>
          </div>

          <div className="space-y-4 p-4 bg-secondary/20 rounded-lg border border-border">
            <h4 className="font-medium text-foreground opacity-80">Bouton Secondaire (CTA 2)</h4>
            <div>
              <Label className="block text-sm mb-1">Texte du bouton</Label>
              <Input name="cta_secondary_text" value={form.cta_secondary_text} onChange={handleChange} disabled={saving} placeholder="Ex: Nos Services" />
            </div>
            <div>
              <Label className="block text-sm mb-1">URL du bouton</Label>
              <Input name="cta_secondary_url" value={form.cta_secondary_url} onChange={handleChange} disabled={saving} placeholder="Ex: /#services" />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-primary border-b pb-2">Ajustements Logo</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 bg-secondary/10 p-4 rounded-lg border border-border">
          <div>
            <Label className="block text-xs font-semibold mb-1 text-primary uppercase tracking-wider">Hauteur (px)</Label>
            <Input
              type="number"
              name="logo_height"
              value={form.logo_height}
              onChange={(e) => setForm((prev) => ({ ...prev, logo_height: parseInt(e.target.value) || 0 }))}
              disabled={saving}
              placeholder="50" />
            
          </div>
          <div>
            <Label className="block text-xs font-semibold mb-1 text-primary uppercase tracking-wider">Échelle</Label>
            <Input
              type="number"
              step="0.1"
              name="logo_scale"
              value={form.logo_scale}
              onChange={(e) => setForm((prev) => ({ ...prev, logo_scale: parseFloat(e.target.value) || 0 }))}
              disabled={saving}
              placeholder="1.0" />
            
          </div>
          <div>
            <Label className="block text-xs font-semibold mb-1 text-primary uppercase tracking-wider">Luminosité (%)</Label>
            <Input
              type="number"
              name="logo_brightness"
              value={form.logo_brightness}
              onChange={(e) => setForm((prev) => ({ ...prev, logo_brightness: parseInt(e.target.value) || 0 }))}
              disabled={saving}
              placeholder="100" />
            
          </div>
          <div>
            <Label className="block text-xs font-semibold mb-1 text-primary uppercase tracking-wider">Contraste (%)</Label>
            <Input
              type="number"
              name="logo_contrast"
              value={form.logo_contrast}
              onChange={(e) => setForm((prev) => ({ ...prev, logo_contrast: parseInt(e.target.value) || 0 }))}
              disabled={saving}
              placeholder="100" />
            
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground italic">
          Note: Ces ajustements s'appliquent au logo dans tout le site. 100% est la valeur par défaut pour la luminosité/contraste.
        </p>
      </section>

      <div className="text-xs text-gray-500 mt-1">
        Le bouton "Enregistrer" sauvegarde tous les changements, y compris les nouvelles images téléversées.
      </div>

      <div>
        <Button type="submit" disabled={saving}>
          {saving ?
          <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sauvegarde…
            </> :

          <>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer les modifications
            </>
          }
        </Button>
      </div>
      <div className="text-xs text-primary opacity-70">
        ⚠️ Ces paramètres impactent tout le site et sont réservés aux administrateurs.
      </div>
    </form>);

}