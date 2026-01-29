
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  });
  const queryClient = useQueryClient();

  // Récupère la config au chargement
  useEffect(() => {
    setLoading(true);
    (async () => {
      try {
        const res = await supabase
          .from("site_settings")
          .select("*")
          .order("id")
          .limit(1)
          .maybeSingle();
        if (res.data) {
          setSettings(res.data);
          setForm({
            site_name: res.data.site_name ?? "",
            slogan: res.data.slogan ?? "",
            logo_url: res.data.logo_url ?? "",
            favicon_url: res.data.favicon_url ?? "",
            contact_email: res.data.contact_email ?? "",
            phone_number: res.data.phone_number ?? "",
            address: res.data.address ?? "",
            copyright_text: res.data.copyright_text ?? "",
            facebook_url: res.data.facebook_url ?? "",
            linkedin_url: res.data.linkedin_url ?? "",
            twitter_url: res.data.twitter_url ?? "",
          });
        }
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
      const { error } = await supabase
        .from("site_settings")
        .update({
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
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1);

      if (error) throw error;

      // Invalider le cache des paramètres en temps réel
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["liveSettings"] });
      
      toast.success("Paramètres mis à jour ! Les changements sont visibles immédiatement sur le site.");
      setSettings(prev => ({ ...prev!, ...form, updated_at: new Date().toISOString() }));
      
    } catch (error: any) {
      toast.error("Erreur lors de la sauvegarde : " + error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="animate-spin text-proqblue w-8 h-8 mb-2" />
        <span className="text-proqblue">Chargement paramètres…</span>
      </div>
    );
  }

  return (
    <form
      className="grid gap-8"
      onSubmit={handleSave}
      aria-label="Modifier les paramètres du site"
    >
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-proqblue-dark border-b pb-2">Paramètres Généraux</h3>
        <div>
          <Label className="block font-semibold mb-1 text-proqblue">Nom du site</Label>
          <Input name="site_name" value={form.site_name} required onChange={handleChange} className="max-w-md" disabled={saving}/>
        </div>
        <div>
          <Label className="block font-semibold mb-1 text-proqblue">Slogan</Label>
          <Input name="slogan" value={form.slogan} required onChange={handleChange} className="max-w-md" disabled={saving}/>
        </div>
        <div>
          <Label className="block font-semibold mb-1 text-proqblue">Logo</Label>
          <ImageUploadInput value={form.logo_url} onChange={(url) => setForm(prev => ({...prev, logo_url: url || ''}))} bucketName="site-assets" />
        </div>
        <div>
          <Label className="block font-semibold mb-1 text-proqblue">Favicon</Label>
          <ImageUploadInput value={form.favicon_url} onChange={(url) => setForm(prev => ({...prev, favicon_url: url || ''}))} bucketName="site-assets" />
        </div>
        <div>
            <Label className="block font-semibold mb-1 text-proqblue">Texte du Copyright (footer)</Label>
            <Input name="copyright_text" value={form.copyright_text} onChange={handleChange} className="max-w-md" disabled={saving} placeholder="Ex: © 2025 Mon Entreprise"/>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-proqblue-dark border-b pb-2">Informations de Contact</h3>
        <div>
            <Label className="block font-semibold mb-1 text-proqblue">Email de contact</Label>
            <Input type="email" name="contact_email" value={form.contact_email} onChange={handleChange} className="max-w-md" disabled={saving} placeholder="contact@exemple.com"/>
        </div>
        <div>
            <Label className="block font-semibold mb-1 text-proqblue">Téléphone</Label>
            <Input type="tel" name="phone_number" value={form.phone_number} onChange={handleChange} className="max-w-md" disabled={saving} placeholder="+221 77 123 45 67"/>
        </div>
        <div>
            <Label className="block font-semibold mb-1 text-proqblue">Adresse</Label>
            <Input name="address" value={form.address} onChange={handleChange} className="max-w-md" disabled={saving} placeholder="123, Rue de l'exemple, Dakar"/>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-proqblue-dark border-b pb-2">Réseaux Sociaux</h3>
        <div>
            <Label className="block font-semibold mb-1 text-proqblue">URL Facebook</Label>
            <Input type="url" name="facebook_url" value={form.facebook_url} onChange={handleChange} className="max-w-md" disabled={saving} placeholder="https://facebook.com/profil"/>
        </div>
        <div>
            <Label className="block font-semibold mb-1 text-proqblue">URL LinkedIn</Label>
            <Input type="url" name="linkedin_url" value={form.linkedin_url} onChange={handleChange} className="max-w-md" disabled={saving} placeholder="https://linkedin.com/in/profil"/>
        </div>
        <div>
            <Label className="block font-semibold mb-1 text-proqblue">URL Twitter (X)</Label>
            <Input type="url" name="twitter_url" value={form.twitter_url} onChange={handleChange} className="max-w-md" disabled={saving} placeholder="https://x.com/profil"/>
        </div>
      </section>

      <div className="text-xs text-gray-500 mt-1">
        Le bouton "Enregistrer" sauvegarde tous les changements, y compris les nouvelles images téléversées.
      </div>
      
      <div>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sauvegarde…
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer les modifications
            </>
          )}
        </Button>
      </div>
      <div className="text-xs text-proqblue-dark opacity-500">
        ⚠️ Ces paramètres impactent tout le site et sont réservés aux administrateurs.
      </div>
    </form>
  );
}
