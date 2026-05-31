import React, { useState } from 'react';
import { useBrandingStore } from '@/stores/branding.store';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RotateCcw, Save, Eye } from 'lucide-react';

export const AdminBrandingPanel: React.FC = () => {
  const { config, updateConfig, resetConfig } = useBrandingStore();
  const [local, setLocal] = useState({ ...config });
  const [dirty, setDirty] = useState(false);

  const handleChange = (key: string, value: any) => {
    setLocal(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    updateConfig(local);
    setDirty(false);
    toast.success('Configuration de marque sauvegardée');
  };

  const handleReset = () => {
    resetConfig();
    setLocal({ ...useBrandingStore.getState().config });
    setDirty(false);
    toast.success('Réinitialisé aux valeurs par défaut');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Marque & White-Label</h2>
          <p className="text-sm text-slate-500">Personnalisez le nom, le logo et l'apparence du builder</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw size={14} className="mr-1" />
            Réinitialiser
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!dirty}>
            <Save size={14} className="mr-1" />
            Sauvegarder
          </Button>
        </div>
      </div>

      {/* Preview */}
      <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <Eye size={14} className="text-slate-400" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Aperçu du builder</span>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3">
          {local.logoUrl ? (
            <img src={local.logoUrl} alt="" className="h-8 w-auto" />
          ) : (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: local.primaryColor }}>
              {local.brandName.charAt(0)}
            </div>
          )}
          <div>
            <div className="font-bold text-sm text-white">{local.brandName}</div>
            <div className="text-[10px] text-slate-500">{local.brandTagline}</div>
          </div>
        </div>
      </Card>

      {/* Form */}
      <Card className="p-6 space-y-5 border-slate-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Nom de la marque</Label>
            <Input
              value={local.brandName}
              onChange={e => handleChange('brandName', e.target.value)}
              placeholder="PROQUELEC STUDIO"
              className="border-slate-300"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Slogan / Tagline</Label>
            <Input
              value={local.brandTagline}
              onChange={e => handleChange('brandTagline', e.target.value)}
              placeholder="Studio de Création"
              className="border-slate-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">URL du logo</Label>
            <Input
              value={local.logoUrl || ''}
              onChange={e => handleChange('logoUrl', e.target.value)}
              placeholder="https://example.com/logo.png"
              className="border-slate-300"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">URL de l'icône (favicon)</Label>
            <Input
              value={local.iconUrl || ''}
              onChange={e => handleChange('iconUrl', e.target.value)}
              placeholder="https://example.com/favicon.ico"
              className="border-slate-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Couleur primaire</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={local.primaryColor}
                onChange={e => handleChange('primaryColor', e.target.value)}
                className="w-10 h-10 rounded border border-slate-300 cursor-pointer"
              />
              <Input
                value={local.primaryColor}
                onChange={e => handleChange('primaryColor', e.target.value)}
                className="flex-1 border-slate-300 font-mono"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">Libellé du builder</Label>
            <Input
              value={local.builderLabel}
              onChange={e => handleChange('builderLabel', e.target.value)}
              placeholder="Studio de Création"
              className="border-slate-300"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">Pied de page</Label>
          <Input
            value={local.footerText}
            onChange={e => handleChange('footerText', e.target.value)}
            placeholder="Propulsé par PROQUELEC"
            className="border-slate-300"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <div>
            <Label className="text-sm font-semibold text-slate-700">Masquer les références God Mode</Label>
            <p className="text-xs text-slate-500">Cache les mentions techniques "God Mode", "GOD MODE" dans l'interface</p>
          </div>
          <Switch
            checked={local.hideGodMode}
            onCheckedChange={v => handleChange('hideGodMode', v)}
          />
        </div>
      </Card>
    </div>
  );
};
