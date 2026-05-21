
import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Settings2,
  Layout,
  Search,
  Type,
  Image as ImageIcon,
  Square,
  List,
  MessageSquare,
  PlayCircle,
  MousePointer2,
  Columns,
  Star } from
'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger } from
'@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';


import { v4 as uuidv4 } from 'uuid';

interface PageBuilderProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

const ELEMENT_CATEGORIES = [
{ id: 'basic', label: 'Basique', icon: Layout },
{ id: 'content', label: 'Contenu', icon: Type },
{ id: 'media', label: 'Médias', icon: ImageIcon },
{ id: 'advanced', label: 'Avancé', icon: Star }];


const AVAILABLE_ELEMENTS = [
{ type: 'heading', label: 'Heading', icon: Type, category: 'content' },
{ type: 'text', label: 'Text Block', icon: Type, category: 'content' },
{ type: 'divider', label: 'Divider', icon: Square, category: 'basic' },
{ type: 'spacer', label: 'Spacer', icon: Square, category: 'basic' },
{ type: 'button', label: 'Button', icon: MousePointer2, category: 'basic' },
{ type: 'cta', label: 'Call to Action', icon: MousePointer2, category: 'content' },
{ type: 'accordion', label: 'Accordion', icon: List, category: 'content' },
{ type: 'tabs', label: 'Tabs', icon: Columns, category: 'content' },
{ type: 'image', label: 'Image', icon: ImageIcon, category: 'media' },
{ type: 'video', label: 'Video', icon: PlayCircle, category: 'media' },
{ type: 'quote', label: 'Quote', icon: MessageSquare, category: 'content' },
{ type: 'stats', label: 'Statistics', icon: Columns, category: 'advanced' },
{ type: 'feature', label: 'Feature Box', icon: Star, category: 'content' },
{ type: 'pricing', label: 'Pricing Item', icon: Square, category: 'advanced' },
{ type: 'testimonials', label: 'Single Testimonial', icon: MessageSquare, category: 'content' },
{ type: 'article_box', label: 'Article Box', icon: Layout, category: 'content' },
{ type: 'chart', label: 'Chart', icon: Columns, category: 'advanced' },
{ type: 'latest_news', label: 'Latest News', icon: List, category: 'advanced' },
{ type: 'partner_logos', label: 'Partner Logos', icon: ImageIcon, category: 'advanced' }];


import { Sparkles } from 'lucide-react';

export const PageBuilder: React.FC<PageBuilderProps> = ({ blocks, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  const addBlock = (type: string) => {
    const newBlock: ContentBlock = {
      id: uuidv4(),
      type,
      version: 1,
      data: getDefaultData(type),
      settings: { isVisible: true }
    };
    onChange([...blocks, newBlock]);
    setIsAddingBlock(false);
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter((b) => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    onChange(newBlocks);
  };

  const updateBlockData = (id: string, data: unknown) => {
    onChange(blocks.map((b) => b.id === id ? { ...b, data } : b));
  };

  const getDefaultData = (type: string) => {
    switch (type) {
      case 'heading':return { text: 'Titre de Section', level: 'h2', align: 'left' };
      case 'text':return { content: 'Votre texte ici...' };
      case 'divider':return { style: 'solid', color: '#e5e7eb', height: 1 };
      case 'spacer':return { height: 40 };
      case 'button':return { label: 'En savoir plus', url: '#', style: 'primary' };
      case 'cta':return { title: 'Prêt à commencer ?', buttonLabel: 'Contactez-nous', url: '/contact' };
      case 'accordion':return { items: [{ title: 'Question 1', content: 'Réponse 1' }] };
      case 'image':return { url: '', alt: '', caption: '' };
      case 'video':return { url: '', type: 'youtube', caption: '' };
      case 'hero':return { title: 'Bannière Héroïque', subtitle: 'Sous-titre accrocheur', background_url: '', cta_text: 'Démarrer', cta_link: '#' };
      case 'gallery':return { images: [{ url: '', caption: '' }] };
      case 'tabs':return { items: [{ title: 'Onglet 1', content: 'Contenu 1' }] };
      case 'quote':return { text: 'La qualité est notre priorité.', author: 'Directeur Général' };
      case 'stats':return { items: [{ label: 'Projets', value: '150+' }, { label: 'Clients', value: '45' }] };
      case 'feature':return { title: 'Titre du service', description: 'Description détaillée de ce que nous proposons...', icon: 'box' };
      case 'pricing':return { title: 'Pack Basique', price: '49€', period: 'mois', features: ['Soutien 24/7', 'Accès limité'], isPopular: false };
      case 'testimonials_list':return { testimonials: [{ name: 'Jean Dupont', role: 'Architecte', content: 'Super service !' }] };
      default:return {};
    }
  };

  const filteredElements = AVAILABLE_ELEMENTS.filter((el) =>
  el.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
  el.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 h-full">
            {/* Search and Categories for Elements */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
            placeholder="Rechercher un élément (ex: divider, accordion...)"
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} />
          
                </div>
                <Dialog open={isAddingBlock} onOpenChange={setIsAddingBlock}>
                    <DialogTrigger asChild>
                        <Button className="bg-proqblue hover:bg-proqblue-dark">
                            <Plus className="w-4 h-4 mr-2" /> Ajouter un élément
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Bibliothèque d'éléments</DialogTitle>
                            <DialogDescription>
                                Choisissez un élément à ajouter à votre page.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto p-1 min-h-[300px]">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
                                {filteredElements.map((el) => {
                  const Icon = el.icon;
                  return (
                    <button
                      key={el.type}
                      onClick={() => addBlock(el.type)}
                      className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-transparent hover:border-proqblue hover:bg-proqblue/5 transition-all group" aria-label="Action">
                      
                                            <div className="w-12 h-12 rounded-lg bg-slate-100 group-hover:bg-proqblue/10 flex items-center justify-center mb-3">
                                                <Icon className="w-6 h-6 text-slate-600 group-hover:text-proqblue" />
                                            </div>
                                            <span className="text-sm font-semibold">{el.label}</span>
                                        </button>);

                })}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Blocks List */}
            <div className="flex-1 space-y-4 min-h-[400px]">
                {blocks.length === 0 ?
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl bg-slate-50/50">
                        <Sparkles className="w-12 h-12 text-slate-300 mb-4" />
                        <p className="text-slate-500 font-medium text-center">
                            Votre page est vide.<br />
                            Commencez par ajouter un élément pour construire votre design.
                        </p>
                    </div> :

        blocks.map((block, index) =>
        <Card key={block.id} className="group overflow-hidden border-2 hover:border-proqblue/30 transition-all">
                            <div className="bg-slate-50 px-4 py-2 border-b flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Badge variant="secondary" className="bg-white border text-xs capitalize">
                                        {AVAILABLE_ELEMENTS.find((el) => el.type === block.type)?.label || block.type}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground font-mono">{block.id.split('-')[0]}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={() => moveBlock(index, 'up')} disabled={index === 0}>
                                        <MoveUp className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={() => moveBlock(index, 'down')} disabled={index === blocks.length - 1}>
                                        <MoveDown className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-proqblue" onClick={() => setEditingBlockId(editingBlockId === block.id ? null : block.id)}>
                                        <Settings2 className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => removeBlock(block.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <CardContent className="p-4 bg-white">
                                {editingBlockId === block.id ?
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <BlockSettingsEditor type={block.type} data={block.data} onChange={(newData) => updateBlockData(block.id, newData)} />
                                    </div> :

            <div className="text-sm text-slate-500 italic flex items-center gap-2">
                                        {block.type === 'heading' && <span className="font-bold text-slate-900">{block.data.text}</span>}
                                        {block.type === 'text' && <span className="line-clamp-1">{block.data.content?.replace(/<[^>]*>/g, '') || "Paramètres du bloc..."}</span>}
                                        {!['heading', 'text'].includes(block.type) && `Paramètres du bloc ${block.type}...`}
                                    </div>
            }
                            </CardContent>
                        </Card>
        )
        }
            </div>
        </div>);

};

// Sub-component for editing individual block data
const BlockSettingsEditor: React.FC<{type: string;data: unknown;onChange: (data: unknown) => void;}> = ({ type, data, onChange }) => {
  const handleChange = (field: string, value: unknown) => {
    onChange({ ...data, [field]: value });
  };

  switch (type) {
    case 'heading':
      return (
        <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label>Texte du titre</Label>
                        <Input value={data.text} onChange={(e) => handleChange('text', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Niveau</Label>
                            <select title="Niveau du titre" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.level} onChange={(e) => handleChange('level', e.target.value)}>
                                <option value="h1">H1 (Principal)</option>
                                <option value="h2">H2 (Section)</option>
                                <option value="h3">H3 (Sous-section)</option>
                                <option value="h4">H4</option>
                            </select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Alignement</Label>
                            <select title="Alignement du texte" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.align} onChange={(e) => handleChange('align', e.target.value)}>
                                <option value="left">Gauche</option>
                                <option value="center">Centre</option>
                                <option value="right">Droite</option>
                            </select>
                        </div>
                    </div>
                </div>);

    case 'text':
      return (
        <div className="grid gap-2">
                    <Label>Contenu (HTML autorisé)</Label>
                    <textarea
            title="Contenu du bloc texte"
            placeholder="Saisissez votre contenu ici (supporte le HTML)..."
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={data.content}
            onChange={(e) => handleChange('content', e.target.value)} />
          
                </div>);

    case 'button':
      return (
        <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label>Texte du bouton</Label>
                        <Input value={data.label} onChange={(e) => handleChange('label', e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Lien (URL)</Label>
                        <Input value={data.url} onChange={(e) => handleChange('url', e.target.value)} />
                    </div>
                </div>);

    case 'divider':
      return (
        <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Style</Label>
                        <select title="Style du séparateur" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.style} onChange={(e) => handleChange('style', e.target.value)}>
                            <option value="solid">Plein</option>
                            <option value="dotted">Pointillé</option>
                            <option value="dashed">Tirets</option>
                        </select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Épaisseur (px)</Label>
                        <Input type="number" value={data.height} onChange={(e) => handleChange('height', parseInt(e.target.value))} />
                    </div>
                </div>);

    case 'spacer':
      return (
        <div className="grid gap-2">
                    <Label>Espace vertical (px)</Label>
                    <Input type="number" value={data.height} onChange={(e) => handleChange('height', parseInt(e.target.value))} />
                </div>);

    case 'quote':
      return (
        <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label>Citation</Label>
                        <textarea
              title="Citation"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={data.text}
              onChange={(e) => handleChange('text', e.target.value)} />
            
                    </div>
                    <div className="grid gap-2">
                        <Label>Auteur / Source</Label>
                        <Input value={data.author} onChange={(e) => handleChange('author', e.target.value)} />
                    </div>
                </div>);

    case 'stats':
      return (
        <div className="space-y-4">
                    <Label>Données statistiques</Label>
                    {data.items.map((item: unknown, i: number) =>
          <div key={i} className="flex gap-2 items-end">
                            <div className="flex-1 space-y-1">
                                <Label className="text-[10px]">Libellé</Label>
                                <Input value={item.label} onChange={(e) => {
                const newItems = [...data.items];
                newItems[i].label = e.target.value;
                handleChange('items', newItems);
              }} />
                            </div>
                            <div className="flex-1 space-y-1">
                                <Label className="text-[10px]">Valeur</Label>
                                <Input value={item.value} onChange={(e) => {
                const newItems = [...data.items];
                newItems[i].value = e.target.value;
                handleChange('items', newItems);
              }} />
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => {
              const newItems = data.items.filter((_: unknown, idx: number) => idx !== i);
              handleChange('items', newItems);
            }}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
          )}
                    <Button variant="outline" size="sm" onClick={() => {
            handleChange('items', [...data.items, { label: 'Nouveau', value: '0' }]);
          }}>
                        Ajouter une statistique
                    </Button>
                </div>);

    case 'feature':
      return (
        <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label>Titre</Label>
                        <Input value={data.title} onChange={(e) => handleChange('title', e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Description</Label>
                        <textarea
              title="Description du service"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={data.description}
              onChange={(e) => handleChange('description', e.target.value)} />
            
                    </div>
                </div>);

    case 'pricing':
      return (
        <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Nom du pack</Label>
                            <Input value={data.title} onChange={(e) => handleChange('title', e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Prix (ex: 49€)</Label>
                            <Input value={data.price} onChange={(e) => handleChange('price', e.target.value)} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>Période (ex: mois, an)</Label>
                        <Input value={data.period} onChange={(e) => handleChange('period', e.target.value)} />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
              type="checkbox"
              id="isPopular"
              title="Indiquer comme pack recommandé"
              checked={data.isPopular}
              onChange={(e) => handleChange('isPopular', e.target.checked)}
              className="h-4 w-4" />
            
                        <Label htmlFor="isPopular">Afficher comme pack recommandé</Label>
                    </div>
                </div>);

    case 'testimonials_list':
      return (
        <div className="space-y-4">
                    <Label>Liste des témoignages</Label>
                    {data.testimonials.map((t: unknown, i: number) =>
          <div key={i} className="p-4 border rounded-lg space-y-2 bg-slate-50/50">
                            <Input placeholder="Nom de la personne" title="Nom" value={t.name} onChange={(e) => {
              const newList = [...data.testimonials];
              newList[i].name = e.target.value;
              handleChange('testimonials', newList);
            }} />
                            <Input placeholder="Rôle ou entreprise" title="Rôle" value={t.role} onChange={(e) => {
              const newList = [...data.testimonials];
              newList[i].role = e.target.value;
              handleChange('testimonials', newList);
            }} />
                            <textarea
              title="Commentaire"
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={t.content}
              onChange={(e) => {
                const newList = [...data.testimonials];
                newList[i].content = e.target.value;
                handleChange('testimonials', newList);
              }} />
                        </div>
          )}
                    <Button variant="outline" size="sm" onClick={() => {
            handleChange('testimonials', [...data.testimonials, { name: '', role: '', content: '' }]);
          }}>Ajouter un témoignage</Button>
                </div>);

    case 'video':
      return (
        <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label>URL de la Vidéo (YouTube/Vimeo)</Label>
                        <Input value={data.url} onChange={(e) => handleChange('url', e.target.value)} placeholder="https://youtube.com/..." />
                    </div>
                    <div className="grid gap-2">
                        <Label>Type de plateforme</Label>
                        <select title="Type de plateforme" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={data.type} onChange={(e) => handleChange('type', e.target.value)}>
                            <option value="youtube">YouTube</option>
                            <option value="vimeo">Vimeo</option>
                            <option value="mp4">Fichier Direct (MP4)</option>
                        </select>
                    </div>
                </div>);

    case 'hero':
      return (
        <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label>Titre Principal</Label>
                        <Input value={data.title} onChange={(e) => handleChange('title', e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Sous-titre</Label>
                        <Input value={data.subtitle} onChange={(e) => handleChange('subtitle', e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label>Image de Fond (URL)</Label>
                        <Input value={data.background_url} onChange={(e) => handleChange('background_url', e.target.value)} placeholder="/images/hero.jpg" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Texte Bouton</Label>
                            <Input value={data.cta_text} onChange={(e) => handleChange('cta_text', e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Lien Bouton</Label>
                            <Input value={data.cta_link} onChange={(e) => handleChange('cta_link', e.target.value)} />
                        </div>
                    </div>
                </div>);

    case 'tabs':
      return (
        <div className="space-y-4">
                    <Label>Système d'onglets</Label>
                    {data.items.map((item: unknown, i: number) =>
          <div key={i} className="p-4 border rounded-lg space-y-2 bg-slate-50/50">
                            <Input placeholder="Titre de l'onglet" title="Titre" value={item.title} onChange={(e) => {
              const newItems = [...data.items];
              newItems[i].title = e.target.value;
              handleChange('items', newItems);
            }} />
                            <textarea
              title="Contenu de l'onglet"
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={item.content}
              onChange={(e) => {
                const newItems = [...data.items];
                newItems[i].content = e.target.value;
                handleChange('items', newItems);
              }} />
                        </div>
          )}
                    <Button variant="outline" size="sm" onClick={() => {
            handleChange('items', [...data.items, { title: 'Nouvel Onglet', content: '' }]);
          }}>Ajouter un onglet</Button>
                </div>);

    default:
      return <div className="text-xs text-muted-foreground uppercase">Éditeur spécifique à venir pour ce bloc.</div>;
  }
};