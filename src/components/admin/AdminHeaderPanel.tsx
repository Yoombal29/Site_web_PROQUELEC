import React, { useState, useEffect } from 'react';
import { Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface HeaderSettings {
  height?: string;
  backgroundColor?: string;
  transparentBackground?: string;
  glassmorphism?: boolean;
  shadow?: string;
  borderColor?: string;
  borderColorTop?: string;
  textColor?: string;
  promoText?: string;
  promoHeight?: string;
  logoScale?: number;
  logoHeight?: string;
  searchEnabled?: boolean;
  searchPosition?: 'left' | 'center' | 'right';
  alertEnabled?: boolean;
  alertText?: string;
  alertType?: 'info' | 'success' | 'warning' | 'error';
}

export function AdminHeaderPanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'scrolled' | 'top'>('top');
  const queryClient = useQueryClient();

  const [form, setForm] = useState<HeaderSettings>({
    height: '110px',
    backgroundColor: '#09264bff',
    transparentBackground: 'rgba(0, 0, 0, 0.25)',
    glassmorphism: true,
    shadow: '0 10px 30px rgba(0,0,0,0.15)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderColorTop: 'rgba(255,255,255,0.05)',
    textColor: '#ffffff',
    promoText: '',
    promoHeight: '40px',
    logoScale: 1.2,
    logoHeight: '50px',
    searchEnabled: true,
    searchPosition: 'right',
    alertEnabled: false,
    alertText: '',
    alertType: 'info'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const res = await fetch('/api/site-config');
      if (!res.ok) throw new Error('Failed to load config');

      const data = await res.json();
      const headerConfig = data?.schema?.globals?.header || {};

      setForm({
        height: headerConfig.height || '110px',
        backgroundColor: headerConfig.backgroundColor || '#09264bff',
        transparentBackground: headerConfig.transparentBackground || 'rgba(0, 0, 0, 0.25)',
        glassmorphism: headerConfig.glassmorphism !== false,
        shadow: headerConfig.shadow || '0 10px 30px rgba(0,0,0,0.15)',
        borderColor: headerConfig.borderColor || 'rgba(255,255,255,0.1)',
        borderColorTop: headerConfig.borderColorTop || 'rgba(255,255,255,0.05)',
        textColor: headerConfig.textColor || '#ffffff',
        promoText: headerConfig.promoText || '',
        promoHeight: headerConfig.promoHeight || '40px',
        logoScale: headerConfig.logoScale || 1.2,
        logoHeight: headerConfig.logoHeight || '50px',
        searchEnabled: headerConfig.searchEnabled !== false,
        searchPosition: headerConfig.searchPosition || 'right',
        alertEnabled: headerConfig.alertEnabled || false,
        alertText: headerConfig.alertText || '',
        alertType: headerConfig.alertType || 'info'
      });
    } catch (err) {
      console.error('Error loading header settings:', err);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('token');

      // Récupérer la config actuelle
      const configRes = await fetch('/api/site-config');
      const currentConfig = await configRes.json();

      // Mettre à jour uniquement la section header
      const updatedConfig = {
        ...currentConfig,
        schema: {
          ...currentConfig.schema,
          globals: {
            ...currentConfig.schema?.globals,
            header: form
          }
        }
      };

      const res = await fetch('/api/site-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedConfig)
      });

      if (!res.ok) throw new Error('Failed to save');

      // Invalider les caches
      queryClient.invalidateQueries({ queryKey: ['site-config'] });
      queryClient.invalidateQueries({ queryKey: ['siteConfig'] });

      toast.success('Paramètres du header sauvegardés ! Rechargez la page pour voir les changements.');
    } catch (err) {
      console.error('Error saving:', err);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>);

  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
            {/* Preview Mode Toggle */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100">Mode de prévisualisation</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">Visualisez comment le header apparaît en haut de page vs au scroll</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
              type="button"
              variant={previewMode === 'top' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('top')}>
              
                            <Eye className="w-4 h-4 mr-2" />
                            En haut
                        </Button>
                        <Button
              type="button"
              variant={previewMode === 'scrolled' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewMode('scrolled')}>
              
                            <EyeOff className="w-4 h-4 mr-2" />
                            Au scroll
                        </Button>
                    </div>
                </div>
            </div>

            {/* Dimensions */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Dimensions</h3>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <Label>Hauteur du header (défaut)</Label>
                        <Input
              value={form.height}
              onChange={(e) => setForm({ ...form, height: e.target.value })}
              placeholder="110px" />
            
                        <p className="text-xs text-muted-foreground mt-1">
                            Hauteur en haut de page (avant scroll). Ex: 110px, 8rem
                        </p>
                    </div>

                    <div>
                        <Label>Hauteur de la barre promo</Label>
                        <Input
              value={form.promoHeight}
              onChange={(e) => setForm({ ...form, promoHeight: e.target.value })}
              placeholder="40px" />
            
                        <p className="text-xs text-muted-foreground mt-1">
                            Si vous avez une barre de promotion en haut
                        </p>
                    </div>
                </div>
            </section>

            {/* Couleurs */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Couleurs</h3>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <Label>Couleur de fond (scrollé/solide)</Label>
                        <div className="flex gap-2">
                            <input
                type="color"
                value={form.backgroundColor?.startsWith('#') ? form.backgroundColor.substring(0, 7) : '#09264b'}
                onChange={(e) => setForm({ ...form, backgroundColor: e.target.value + 'ff' })}
                className="w-16 h-10 rounded border"
                aria-label="Sélecteur de couleur de fond" />
              
                            <Input
                value={form.backgroundColor}
                onChange={(e) => setForm({ ...form, backgroundColor: e.target.value })}
                placeholder="#09264bff"
                className="flex-1" />
              
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Couleur quand le header est scrollé ou solide
                        </p>
                    </div>

                    <div>
                        <Label>Fond transparent (en haut)</Label>
                        <Input
              value={form.transparentBackground}
              onChange={(e) => setForm({ ...form, transparentBackground: e.target.value })}
              placeholder="rgba(0, 0, 0, 0.25)" />
            
                        <p className="text-xs text-muted-foreground mt-1">
                            Couleur semi-transparente en haut de page
                        </p>
                    </div>

                    <div>
                        <Label>Couleur du texte</Label>
                        <div className="flex gap-2">
                            <input
                type="color"
                value={form.textColor}
                onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                className="w-16 h-10 rounded border"
                aria-label="Sélecteur de couleur du texte" />
              
                            <Input
                value={form.textColor}
                onChange={(e) => setForm({ ...form, textColor: e.target.value })}
                placeholder="#ffffff"
                className="flex-1" />
              
                        </div>
                    </div>

                    <div>
                        <Label>Couleur de bordure (scrollé)</Label>
                        <Input
              value={form.borderColor}
              onChange={(e) => setForm({ ...form, borderColor: e.target.value })}
              placeholder="rgba(255,255,255,0.1)" />
            
                    </div>

                    <div>
                        <Label>Couleur de bordure (en haut)</Label>
                        <Input
              value={form.borderColorTop}
              onChange={(e) => setForm({ ...form, borderColorTop: e.target.value })}
              placeholder="rgba(255,255,255,0.05)" />
            
                    </div>
                </div>
            </section>

            {/* Effets visuels */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Effets visuels</h3>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <Label>Ombre portée</Label>
                        <Input
              value={form.shadow}
              onChange={(e) => setForm({ ...form, shadow: e.target.value })}
              placeholder="0 10px 30px rgba(0,0,0,0.15)" />
            
                        <p className="text-xs text-muted-foreground mt-1">
                            Ombre CSS quand le header est scrollé
                        </p>
                    </div>

                    <div className="flex items-center gap-3 pt-6">
                        <input
              type="checkbox"
              id="glassmorphism"
              checked={form.glassmorphism}
              onChange={(e) => setForm({ ...form, glassmorphism: e.target.checked })}
              className="w-5 h-5 rounded"
              aria-label="Activer l'effet glassmorphism" />
            
                        <Label htmlFor="glassmorphism" className="cursor-pointer">
                            Activer l'effet glassmorphism (flou d'arrière-plan)
                        </Label>
                    </div>
                </div>
            </section>

            {/* Logo */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Logo</h3>

                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <Label>Hauteur du logo</Label>
                        <Input
              value={form.logoHeight}
              onChange={(e) => setForm({ ...form, logoHeight: e.target.value })}
              placeholder="50px" />
            
                    </div>

                    <div>
                        <Label>Échelle du logo</Label>
                        <Input
              type="number"
              step="0.1"
              value={form.logoScale}
              onChange={(e) => setForm({ ...form, logoScale: parseFloat(e.target.value) || 1 })}
              placeholder="1.2" />
            
                        <p className="text-xs text-muted-foreground mt-1">
                            Multiplicateur de taille (1 = taille normale, 1.2 = 20% plus grand)
                        </p>
                    </div>
                </div>
            </section>

            {/* Barre de promotion */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Barre de promotion (optionnel)</h3>

                <div>
                    <Label>Texte de la barre promo</Label>
                    <Input
            value={form.promoText}
            onChange={(e) => setForm({ ...form, promoText: e.target.value })}
            placeholder="🎉 Offre spéciale : -20% sur toutes les formations !" />
          
                    <p className="text-xs text-muted-foreground mt-1">
                        Laissez vide pour désactiver la barre de promotion
                    </p>
                </div>
            </section>

            {/* Barre de recherche */}
            <section className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Barre de recherche</h3>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 py-2">
                        <input
              type="checkbox"
              id="searchEnabled"
              checked={form.searchEnabled}
              onChange={(e) => setForm({ ...form, searchEnabled: e.target.checked })}
              className="w-5 h-5 rounded"
              aria-label="Activer la recherche globale" />
            
                        <Label htmlFor="searchEnabled" className="cursor-pointer">
                            Activer la recherche globale dans le header
                        </Label>
                    </div>

                    <div className="space-y-2">
                        <Label>Position de la recherche</Label>
                        <select title="Sélectionner une option"
            value={form.searchPosition}
            onChange={(e) => setForm({ ...form, searchPosition: e.target.value as unknown })}
            className="w-full p-2 border rounded-md bg-background"
            aria-label="Position de la barre de recherche">
              
                            <option value="left">Gauche (Près du logo)</option>
                            <option value="center">Centre (Près du menu)</option>
                            <option value="right">Droite (Près du bouton contact)</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Barre d'alerte (Top Bar) */}
            <section className="space-y-4 shadow-sm border p-4 rounded-xl bg-muted/20">
                <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-amber-500" />
                    Barre d'alerte (Haut de page)
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-3 py-2">
                        <input
              type="checkbox"
              id="alertEnabled"
              checked={form.alertEnabled}
              onChange={(e) => setForm({ ...form, alertEnabled: e.target.checked })}
              className="w-5 h-5 rounded"
              aria-label="Activer la barre d'alerte" />
            
                        <Label htmlFor="alertEnabled" className="cursor-pointer font-medium">
                            Activer le bandeau d'information permanent
                        </Label>
                    </div>

                    <div className="space-y-2">
                        <Label>Type d'alerte</Label>
                        <select title="Sélectionner une option"
            value={form.alertType}
            onChange={(e) => setForm({ ...form, alertType: e.target.value as unknown })}
            className="w-full p-2 border rounded-md bg-background"
            aria-label="Type d'alerte">
              
                            <option value="info">Information (Bleu)</option>
                            <option value="success">Succès (Vert)</option>
                            <option value="warning">Attention (Ambre)</option>
                            <option value="error">Urgent (Rouge)</option>
                        </select>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <Label>Message d'alerte</Label>
                        <Input
              value={form.alertText}
              onChange={(e) => setForm({ ...form, alertText: e.target.value })}
              placeholder="Ex: Les inscriptions pour la session 2025 sont ouvertes !" />
            
                    </div>
                </div>
            </section>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-6 border-t">
                <Button type="submit" disabled={saving} size="lg">
                    {saving ?
          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sauvegarde...
                        </> :

          <>
                            <Save className="w-4 h-4 mr-2" />
                            Enregistrer les paramètres
                        </>
          }
                </Button>

                <Button
          type="button"
          variant="outline"
          onClick={loadSettings}
          disabled={loading || saving}>
          
                    Réinitialiser
                </Button>
            </div>

            <div className="text-sm text-muted-foreground bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <strong>💡 Astuce :</strong> Après avoir sauvegardé, rechargez la page (F5) pour voir les changements appliqués au header.
                Les modifications sont stockées dans la configuration du site et s'appliquent immédiatement.
            </div>
        </form>);

}