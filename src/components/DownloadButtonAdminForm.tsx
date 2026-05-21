import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FileText, Download, Shield, Zap, BookOpen,
  File, FileArchive, Video, Save, X, Eye, EyeOff } from
'lucide-react';


interface Props {
  buttonConfig?: DownloadButtonConfig;
  onSave?: (config: DownloadButtonConfig) => void;
  onCancel?: () => void;
}

const AVAILABLE_ICONS = [
{ name: 'download', icon: Download },
{ name: 'file', icon: File },
{ name: 'file-text', icon: FileText },
{ name: 'shield', icon: Shield },
{ name: 'zap', icon: Zap },
{ name: 'book', icon: BookOpen },
{ name: 'archive', icon: FileArchive },
{ name: 'video', icon: Video }];


export function DownloadButtonAdminForm({ buttonConfig, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(buttonConfig?.title || 'Télécharger le Document');
  const [bucket, setBucket] = useState(buttonConfig?.bucket || 'documents');
  const [path, setPath] = useState(buttonConfig?.path || '');
  const [icon, setIcon] = useState(buttonConfig?.icon || 'download');
  const [color, setColor] = useState(buttonConfig?.color || '#2376df');
  const [visible, setVisible] = useState(buttonConfig?.visible ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave({
        id: buttonConfig?.id || crypto.randomUUID(),
        title,
        bucket,
        path,
        icon,
        color,
        visible
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl border shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Titre et Visibilité */}
        <div className="space-y-4">
          <div>
            <Label className="font-bold mb-1.5 block">Titre du bouton</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Manuel de Sécurité"
              required />
            
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setVisible(!visible)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${visible ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`
              } aria-label="Action">
              
              {visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {visible ? 'VISIBLE SUR LE SITE' : 'MASQUÉ'}
            </button>
          </div>
        </div>

        {/* Configuration Bucket/Path */}
        <div className="space-y-4">
          <div>
            <Label className="font-bold mb-1.5 block">Localisation (Bucket / Chemin)</Label>
            <div className="flex gap-2">
              <select title="Sélectionner une option"
              className="w-1/3 h-10 px-3 rounded-md border border-slate-200 bg-white text-sm"
              value={bucket}
              onChange={(e) => setBucket(e.target.value)}>
                
                <option value="documents">documents</option>
                <option value="images">images</option>
                <option value="videos">videos</option>
                <option value="temp">temp</option>
              </select>
              <Input
                className="flex-grow"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="nom-fichier.pdf"
                required />
              
            </div>
          </div>
        </div>

        {/* Style et Icônes */}
        <div className="space-y-4">
          <div>
            <Label className="font-bold mb-3 block">Choisir une Icône</Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ICONS.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIcon(item.name)}
                    className={`p-2.5 rounded-xl border-2 transition-all ${icon === item.name ?
                    'border-proqblue bg-blue-50 text-proqblue' :
                    'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`
                    } aria-label="Action">
                    
                    <IconComponent className="w-5 h-5" />
                  </button>);

              })}
            </div>
          </div>
        </div>

        <div>
          <Label className="font-bold mb-1.5 block">Couleur Personnalisée</Label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-10 rounded cursor-pointer" />
            
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="font-mono text-xs"
              placeholder="#HEX" />
            
          </div>
        </div>
      </div>

      {/* Aperçu en temps réel */}
      <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 mt-4">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3 block text-center">Aperçu en temps réel</span>
        <div className="flex justify-center">
          <button
            type="button"
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold shadow-lg transition-transform active:scale-95"
            style={{ backgroundColor: color }} aria-label="Action">
            
            {AVAILABLE_ICONS.find((i) => i.name === icon)?.icon && (() => {
              const IconComp = AVAILABLE_ICONS.find((i) => i.name === icon)!.icon;
              return <IconComp className="w-5 h-5" />;
            })()}
            {title}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" className="flex-1 bg-proqblue h-12 rounded-xl text-md font-bold">
          <Save className="w-4 h-4 mr-2" />
          {buttonConfig ? 'Mettre à jour' : 'Créer le bouton'}
        </Button>
        {onCancel &&
        <Button type="button" variant="outline" onClick={onCancel} className="h-12 rounded-xl px-6">
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
        }
      </div>
    </form>);

}