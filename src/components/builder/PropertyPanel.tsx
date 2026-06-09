import React, { useMemo, useCallback, useTransition, useState, useEffect, useRef } from 'react';
import {
  useSelectedBlock,
  useBlockStyle,
  useBlockContent,
  useUpdateBlockStyle,
  useUpdateBlockContent,
  useRemoveBlock,
  useSaveTemplate
} from '@/stores/useBuilderStoreSelectors';
import type { Block, BlockStyle, BlockContent } from '@/types/builder';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Trash2, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Maximize, Box, Layers, Image as ImageIcon, Move, Save,
  PlusCircle, MinusCircle, Settings2, Sparkles, RefreshCcw, Monitor, Smartphone, Moon } from
'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from
"@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger } from
"@/components/ui/accordion";
import GradientControl from './PropertyPanel/controls/GradientControl';
import ShadowControl from './PropertyPanel/controls/ShadowControl';
import BackgroundSection from './PropertyPanel/sections/BackgroundSection';
import BorderSection from './PropertyPanel/sections/BorderSection';
import TypographySection from './PropertyPanel/sections/TypographySection';
import SpacingSection from './PropertyPanel/sections/SpacingSection';
import EffectsSection from './PropertyPanel/sections/EffectsSection';
import LayoutSection from './PropertyPanel/sections/LayoutSection';
import { StyleEditorContext, Device } from './PropertyPanel/hooks/useStyleEditor';

type GradientType = 'linear-gradient' | 'radial-gradient';

interface GradientStop {
  color: string;
  pos: number;
}

interface ParsedGradient {
  type: GradientType;
  angle: number;
  stops: GradientStop[];
}

interface ParsedShadow {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
}

const defaultGradient: ParsedGradient = {
  type: 'linear-gradient',
  angle: 135,
  stops: [
    { color: '#3b82f6', pos: 0 },
    { color: '#9333ea', pos: 100 }
  ]
};

const parseGradient = (str: string): ParsedGradient => {
  if (!str.includes('gradient')) return defaultGradient;
  const type: GradientType = str.includes('radial') ? 'radial-gradient' : 'linear-gradient';

  let angle = 135;
  const angleMatch = str.match(/(\d+)deg/);
  if (angleMatch) angle = parseInt(angleMatch[1], 10);

  const stops: GradientStop[] = [];
  const stopMatches = str.match(/(#[a-fA-F0-9]{3,6}|rgba?\([^)]+\))\s*(\d+)%/g);
  if (stopMatches) {
    stopMatches.forEach((match) => {
      const parts = match.trim().split(/\s+/);
      const posPart = parts[parts.length - 1];
      const colorPart = parts.slice(0, parts.length - 1).join(' ');
      stops.push({ color: colorPart, pos: parseInt(posPart, 10) });
    });
  } else {
    return defaultGradient;
  }

  return { type, angle, stops };
};

const buildGradient = (gradient: ParsedGradient) => {
  const stopsStr = gradient.stops.map((stop) => `${stop.color} ${stop.pos}%`).join(', ');
  return gradient.type === 'linear-gradient'
    ? `linear-gradient(${gradient.angle}deg, ${stopsStr})`
    : `radial-gradient(circle, ${stopsStr})`;
};

const parseShadow = (str: string): ParsedShadow => {
  if (str === 'none') return { x: 0, y: 0, blur: 0, spread: 0, color: '#000000', opacity: 0 };

  const nums = str.match(/-?\d+px/g)?.map((n) => parseInt(n, 10)) || [0, 0, 0, 0];
  const colorMatch = str.match(/rgba?\([^)]+\)|#[a-fA-F0-9]{3,6}/);
  const color = colorMatch ? colorMatch[0] : '#000000';
  const opacity = color.startsWith('rgba')
    ? Math.round(parseFloat(color.split(',')[3]) * 100)
    : 100;
  const normalizedColor = color.startsWith('rgba')
    ? (() => {
        const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return '#000000';
        const [, r, g, b] = match;
        return `#${Number(r).toString(16).padStart(2, '0')}${Number(g).toString(16).padStart(2, '0')}${Number(b).toString(16).padStart(2, '0')}`;
      })()
    : color;

  return {
    x: nums[0] || 0,
    y: nums[1] || 0,
    blur: nums[2] || 0,
    spread: nums[3] || 0,
    color: normalizedColor,
    opacity
  };
};

const buildShadow = (shadow: ParsedShadow) => {
  const rgba = shadow.color.startsWith('#')
    ? `rgba(${parseInt(shadow.color.slice(1, 3), 16)}, ${parseInt(shadow.color.slice(3, 5), 16)}, ${parseInt(shadow.color.slice(5, 7), 16)}, ${shadow.opacity / 100})`
    : shadow.color;
  return `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${rgba}`;
};

const normalizeClasses = (value: string) => {
  return Array.from(new Set(value.split(/\s+/).filter(Boolean))).join(' ');
};

const toggleClassName = (current: string | undefined, className: string, enabled: boolean) => {
  const classes = new Set((current || '').split(/\s+/).filter(Boolean));
  if (enabled) classes.add(className);
  else classes.delete(className);
  return normalizeClasses(Array.from(classes).join(' '));
};

interface PageSettings {
  title: string;
  slug: string;
  metaDescription: string;
  metaKeywords: string;
  metaRobots: string;
  customCss: string;
  customJs: string;
  isPublished: boolean;
  workflowStatus: 'draft' | 'review' | 'approved' | 'published' | 'archived';
}

interface PropertyPanelProps {
  pageSettings?: PageSettings;
  onPageSettingsChange?: (changes: Partial<PageSettings>) => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({ pageSettings, onPageSettingsChange }) => {
  const selectedBlock = useSelectedBlock();
  const updateBlockContent = useUpdateBlockContent();
  const updateBlockStyle = useUpdateBlockStyle();
  const removeBlock = useRemoveBlock();
  const saveTemplate = useSaveTemplate();
  const [activeDevice, setActiveDevice] = React.useState<Device>('base');
  // useTransition : marque les mises à jour du store comme non-urgentes
  // L'input clavier reste réactif, le canvas se met à jour en arrière-plan
  const [, startTransition] = useTransition();

  // ── LOCAL CONTENT STATE ──────────────────────────────────────────────────────
  // We maintain a local copy of block content so keystrokes update the UI instantly
  // without triggering Zustand store updates (and full canvas re-renders) on every character.
  const [localContent, setLocalContent] = useState<Record<string, string>>({});
  const contentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevBlockIdRef = useRef<string | null>(null);

  // Sync local content when selected block changes
  useEffect(() => {
    if (selectedBlock?.id !== prevBlockIdRef.current) {
      prevBlockIdRef.current = selectedBlock?.id || null;
      setLocalContent((selectedBlock?.content as Record<string, string>) || {});
    }
  }, [selectedBlock?.id, selectedBlock?.content]);

  // Also sync when content changes from external sources (undo/redo, etc.)
  useEffect(() => {
    if (selectedBlock?.content && selectedBlock.id === prevBlockIdRef.current) {
      // Only sync if no pending local timer (i.e. we're not currently typing)
      if (!contentTimerRef.current) {
        setLocalContent((selectedBlock.content as Record<string, string>) || {});
      }
    }
  }, [selectedBlock?.content, selectedBlock?.id]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (contentTimerRef.current) clearTimeout(contentTimerRef.current);
    };
  }, []);

  // -- Handlers --
  const handleContentChange = useCallback((key: keyof BlockContent, value: string) => {
    const id = selectedBlock?.id;
    if (!id) return;
    // 1. Update local state instantly (no lag)
    setLocalContent(prev => ({ ...prev, [key]: value }));
    // 2. Debounce propagation to Zustand store (300ms)
    if (contentTimerRef.current) clearTimeout(contentTimerRef.current);
    contentTimerRef.current = setTimeout(() => {
      contentTimerRef.current = null;
      startTransition(() => {
        updateBlockContent(id, { [key]: value } as Partial<BlockContent>);
      });
    }, 300);
  }, [selectedBlock?.id, updateBlockContent, startTransition]);

  const activeStyle = useMemo(() => {
    if (activeDevice === 'base') return selectedBlock?.style || {};
    const baseStyle = selectedBlock?.style || {};
    const deviceStyle = (selectedBlock?.style as any)?.[activeDevice] || {};
    return { ...baseStyle, ...deviceStyle }; // device overrides base for preview
  }, [selectedBlock?.style, activeDevice]);

  const handleStyleChange = useCallback((key: keyof BlockStyle, value: string | number | undefined) => {
    const id = selectedBlock?.id;
    if (!id) return;
    startTransition(() => {
      if (activeDevice === 'base') {
        updateBlockStyle(id, { [key]: value } as Partial<BlockStyle>);
      } else {
        const currentRaw = selectedBlock?.style as any;
        const currentDeviceStyle = currentRaw?.[activeDevice] || {};
        updateBlockStyle(id, { [activeDevice]: { ...currentDeviceStyle, [key]: value } } as any);
      }
    });
  }, [selectedBlock?.id, updateBlockStyle, activeDevice, selectedBlock?.style, startTransition]);

  const handleSaveTemplate = useCallback(() => {
    if (!selectedBlock) return;
    const name = window.prompt('Nom du modèle :', (selectedBlock.content || {}).title || 'Mon Bloc');
    if (!name) return;
    saveTemplate(selectedBlock, name);
    toast.success('Modèle enregistré avec succès.');
  }, [selectedBlock, saveTemplate]);

  const handleResetStyle = () => {
    const id = selectedBlock?.id;
    if (!id) return;
    updateBlockStyle(id, {
      width: undefined,
      height: undefined,
      padding: undefined,
      paddingTop: undefined,
      paddingBottom: undefined,
      paddingLeft: undefined,
      paddingRight: undefined,
      margin: undefined,
      marginTop: undefined,
      marginBottom: undefined,
      marginLeft: undefined,
      marginRight: undefined,
      backgroundColor: undefined,
      backgroundImage: undefined,
      backgroundSize: undefined,
      backgroundPosition: undefined,
      borderRadius: undefined,
      borderWidth: undefined,
      borderColor: undefined,
      color: undefined,
      textAlign: undefined,
      display: undefined,
      justifyContent: undefined,
      alignItems: undefined,
      flexDirection: undefined,
      gap: undefined,
      maxWidth: undefined,
      minHeight: undefined,
      boxShadow: undefined,
      opacity: undefined,
      textTransform: undefined,
      fontWeight: undefined,
      fontFamily: undefined,
      lineHeight: undefined,
      letterSpacing: undefined,
      className: undefined,
      customCss: undefined
    });
    toast.success('Styles réinitialisés.');
  };

  const handleResetContent = () => {
    if (!selectedBlock?.id) return;
    updateBlockContent(selectedBlock.id, {
      title: undefined,
      subtitle: undefined,
      text: undefined,
      html: undefined,
      code: undefined,
      src: undefined,
      alt: undefined,
      href: undefined,
      caption: undefined,
      items: undefined
    });
    toast.success('Contenu réinitialisé.');
  };

  const handlePageSettingChange = (key: keyof PageSettings, value: string | boolean) => {
    if (!onPageSettingsChange) return;
    onPageSettingsChange({ [key]: value } as Partial<PageSettings>);
  };

    // Controls moved to separate files under ./PropertyPanel/controls

  if (!selectedBlock) {
    if (pageSettings) {
      return (
        <div className="flex flex-col h-full overflow-y-auto p-4 space-y-6 bg-slate-50">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Paramètres de la page</h3>
                <p className="text-sm text-slate-500">Modifiez les métadonnées et options globales.</p>
              </div>
              <span className={`text-[10px] uppercase font-semibold px-2 py-1 rounded ${pageSettings.workflowStatus === 'published' ? 'bg-emerald-100 text-emerald-700' : pageSettings.workflowStatus === 'review' ? 'bg-amber-100 text-amber-700' : pageSettings.workflowStatus === 'approved' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                {pageSettings.workflowStatus === 'published' ? 'Publié' : pageSettings.workflowStatus === 'review' ? 'En relecture' : pageSettings.workflowStatus === 'approved' ? 'Approuvée' : 'Brouillon'}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-[10px] uppercase text-slate-400">Titre de la page</Label>
                <Input
                  value={pageSettings.title}
                  onChange={(e) => handlePageSettingChange('title', e.target.value)}
                  className="h-10 text-sm" />
              </div>

              <div>
                <Label className="text-[10px] uppercase text-slate-400">Slug</Label>
                <Input
                  value={pageSettings.slug}
                  onChange={(e) => handlePageSettingChange('slug', e.target.value)}
                  className="h-10 text-sm" />
              </div>

              <div>
                <Label className="text-[10px] uppercase text-slate-400">Meta Description</Label>
                <Textarea
                  value={pageSettings.metaDescription}
                  onChange={(e) => handlePageSettingChange('metaDescription', e.target.value)}
                  className="min-h-[120px] text-sm" />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-[10px] uppercase text-slate-400">Meta Keywords</Label>
                  <Input
                    value={pageSettings.metaKeywords}
                    onChange={(e) => handlePageSettingChange('metaKeywords', e.target.value)}
                    className="h-10 text-sm" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase text-slate-400">Meta Robots</Label>
                  <Input
                    value={pageSettings.metaRobots}
                    onChange={(e) => handlePageSettingChange('metaRobots', e.target.value)}
                    className="h-10 text-sm" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-[10px] uppercase text-slate-400">CSS personnalisé</Label>
                  <Textarea
                    value={pageSettings.customCss}
                    onChange={(e) => handlePageSettingChange('customCss', e.target.value)}
                    className="min-h-[120px] text-sm font-mono" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase text-slate-400">JS personnalisé</Label>
                  <Textarea
                    value={pageSettings.customJs}
                    onChange={(e) => handlePageSettingChange('customJs', e.target.value)}
                    className="min-h-[120px] text-sm font-mono" />
                </div>
              </div>

              <div className="grid gap-4">
                <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 rounded-md border border-slate-200">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Publication</p>
                    <p className="text-xs text-slate-500">Activez pour publier immédiatement la page.</p>
                  </div>
                  <Switch
                    id="page-published"
                    checked={pageSettings.isPublished}
                    onCheckedChange={(checked) => handlePageSettingChange('isPublished', checked)} />
                </div>
                <div className="space-y-2 p-3 bg-slate-50 rounded-md border border-slate-200">
                  <Label className="text-[10px] uppercase text-slate-400">Statut workflow</Label>
                  <Select value={pageSettings.workflowStatus} onValueChange={(value) => handlePageSettingChange('workflowStatus', value as PageSettings['workflowStatus'])}>
                    <SelectTrigger className="w-full h-10 text-sm">
                      <SelectValue placeholder="Sélectionnez un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="review">En relecture</SelectItem>
                      <SelectItem value="approved">Approuvée</SelectItem>
                      <SelectItem value="published">Publié</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-slate-400">Utilisez ce statut pour indiquer l’étape de validation de la page.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50/50 p-10 text-center">
                <Box className="w-16 h-16 mb-6 opacity-20" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">Aucun élément sélectionné</h3>
                <p className="text-sm">Cliquez sur un élément dans le constructeur à gauche pour modifier ses propriétés, ou sélectionnez la page pour les réglages globaux.</p>
            </div>);

  }

  const TYPE_HINTS: Record<string, string> = {
    hero: 'Section hero avec titre, sous-titre et bouton principal.',
    section: 'Section de contenu modulable, utile comme conteneur ou bannière.',
    'text-block': 'Bloc texte rich et HTML, modifiable directement dans le panneau.',
    text: 'Bloc texte simple avec rendu HTML, idéal pour paragraphes et citations.',
    image: 'Bloc image responsive avec légende optionnelle.',
    html: 'Bloc HTML libre : éditez le code source et prévisualisez directement.',
    button: 'Bouton d’appel à l’action : modifiez le texte, le lien et le style.',
    code: 'Bloc code brut : modifiez le contenu source textuel direct.'
  };

  const textTypes = ['hero', 'section', 'text', 'text-block', 'button'];
  const showTypography = textTypes.includes(selectedBlock.type);
  const showImageStyle = selectedBlock.type === 'image';

  const renderImageStyleSection = () => {
    if (!showImageStyle) return null;
    return (
      <AccordionItem value="media" className="border-b px-4">
        <AccordionTrigger className="hover:no-underline py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Image</AccordionTrigger>
        <AccordionContent className="space-y-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-slate-400">Largeur</Label>
              <Input className="h-8 text-xs" placeholder="ex: 100%" value={activeStyle.width || ''} onChange={(e) => handleStyleChange('width', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-slate-400">Hauteur</Label>
              <Input className="h-8 text-xs" placeholder="ex: auto" value={activeStyle.height || ''} onChange={(e) => handleStyleChange('height', e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase text-slate-400">Object Fit</Label>
            <select title="Object Fit" className="h-8 w-full text-xs border rounded bg-white px-2" value={(activeStyle.objectFit as string) || 'cover'} onChange={(e) => handleStyleChange('objectFit', e.target.value)}>
              <option value="cover">cover</option>
              <option value="contain">contain</option>
              <option value="fill">fill</option>
              <option value="none">none</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase text-slate-400">Cadre / Bordure</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input className="h-8 text-xs" placeholder="ex: 1px" value={activeStyle.borderWidth || ''} onChange={(e) => handleStyleChange('borderWidth', `${e.target.value}px`)} />
              <Input className="h-8 text-xs" placeholder="#000000" value={activeStyle.borderColor || ''} onChange={(e) => handleStyleChange('borderColor', e.target.value)} />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  const defaultAccordionValues = ['layout', 'spacing', 'background', 'borders'];
  if (showTypography) defaultAccordionValues.splice(2, 0, 'typography');
  if (showImageStyle) defaultAccordionValues.splice(showTypography ? 3 : 2, 0, 'media');

  const renderContentForm = () => {
    switch (selectedBlock.type) {
      case 'hero':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Titre</Label>
              <Input value={localContent.title || ''} onChange={(e) => handleContentChange('title', e.target.value)} placeholder="Titre principal..." />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Sous-titre</Label>
              <Textarea value={localContent.subtitle || ''} onChange={(e) => handleContentChange('subtitle', e.target.value)} placeholder="Phrase d’accroche..." className="min-h-[120px]" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-slate-500">Libellé du bouton</Label>
                <Input value={localContent.text || ''} onChange={(e) => handleContentChange('text', e.target.value)} placeholder="Texte du bouton..." />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-slate-500">Lien du bouton</Label>
                <Input value={localContent.href || ''} onChange={(e) => handleContentChange('href', e.target.value)} placeholder="/contact ou https://..." />
              </div>
            </div>
          </div>
        );
      case 'section':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Titre</Label>
              <Input value={localContent.title || ''} onChange={(e) => handleContentChange('title', e.target.value)} placeholder="Titre de section..." />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Contenu</Label>
              <Textarea value={localContent.subtitle || localContent.text || ''} onChange={(e) => handleContentChange('subtitle', e.target.value)} placeholder="Texte de présentation..." className="min-h-[120px]" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-slate-500">Lien</Label>
                <Input value={localContent.href || ''} onChange={(e) => handleContentChange('href', e.target.value)} placeholder="/contact ou https://..." />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase text-slate-500">Image / Illustration</Label>
                <Input value={localContent.src || ''} onChange={(e) => handleContentChange('src', e.target.value)} placeholder="https://..." />
              </div>
            </div>
          </div>
        );
      case 'text-block':
      case 'text':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Titre</Label>
              <Input value={localContent.title || ''} onChange={(e) => handleContentChange('title', e.target.value)} placeholder="Titre du texte..." />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Texte HTML</Label>
              <Textarea value={localContent.html || localContent.text || ''} onChange={(e) => handleContentChange('html', e.target.value)} placeholder="Votre contenu ici..." className="min-h-[180px] font-mono text-xs" />
            </div>
          </div>
        );
      case 'image':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Source Image</Label>
              <Input value={localContent.src || ''} onChange={(e) => handleContentChange('src', e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Texte alternatif (alt)</Label>
              <Input value={localContent.alt || ''} onChange={(e) => handleContentChange('alt', e.target.value)} placeholder="Description de l’image..." />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Légende</Label>
              <Textarea value={localContent.caption || ''} onChange={(e) => handleContentChange('caption', e.target.value)} placeholder="Texte sous l’image..." className="min-h-[100px]" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Lien</Label>
              <Input value={localContent.href || ''} onChange={(e) => handleContentChange('href', e.target.value)} placeholder="Lien cliquable facultatif..." />
            </div>
          </div>
        );
      case 'html':
      case 'code':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Code source</Label>
              <Textarea value={localContent.html || localContent.code || ''} onChange={(e) => handleContentChange(selectedBlock.type === 'code' ? 'code' : 'html', e.target.value)} placeholder="<div>...</div>" className="min-h-[280px] font-mono text-xs" />
            </div>
          </div>
        );
      case 'button':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Texte du bouton</Label>
              <Input value={localContent.text || localContent.title || ''} onChange={(e) => handleContentChange('text', e.target.value)} placeholder="Acheter / En savoir plus..." />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">URL du bouton</Label>
              <Input value={localContent.href || ''} onChange={(e) => handleContentChange('href', e.target.value)} placeholder="/contact ou https://..." />
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Titre</Label>
              <Input value={localContent.title || ''} onChange={(e) => handleContentChange('title', e.target.value)} placeholder="Titre..." />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-slate-500">Contenu</Label>
              <Textarea value={localContent.subtitle || localContent.text || ''} onChange={(e) => handleContentChange('subtitle', e.target.value)} placeholder="Votre contenu ici..." className="min-h-[120px]" />
            </div>
          </div>
        );
    }
  };

  const renderAdvancedForm = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase text-slate-500">ID HTML</Label>
        <Input value={activeStyle.id || ''} onChange={(e) => handleStyleChange('id', e.target.value)} placeholder="mon-ancre" className="font-mono text-xs" />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase text-slate-500">Classes CSS</Label>
        <Input value={activeStyle.className || ''} onChange={(e) => handleStyleChange('className', e.target.value)} placeholder="p-4 bg-white shadow..." className="font-mono text-xs" />
        <p className="text-[10px] text-slate-400">Ajouter des classes Tailwind additionnelles.</p>
      </div>
      {selectedBlock.type === 'image' && (
        <div className="space-y-4 pt-4 border-t border-dashed">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-slate-500">Texte ALT</Label>
            <Input value={localContent.alt || ''} onChange={(e) => handleContentChange('alt', e.target.value)} placeholder="Description de l’image..." />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-slate-500">Légende</Label>
            <Textarea value={localContent.caption || ''} onChange={(e) => handleContentChange('caption', e.target.value)} placeholder="Texte sous l’image..." className="min-h-[100px]" />
          </div>
        </div>
      )}
      {selectedBlock.type === 'html' && (
        <div className="space-y-4 pt-4 border-t border-dashed">
          <Label className="text-xs font-semibold uppercase text-slate-500">HTML brut</Label>
          <Textarea value={localContent.html || ''} onChange={(e) => handleContentChange('html', e.target.value)} placeholder="<div>...</div>" className="min-h-[120px] font-mono text-xs" />
        </div>
      )}
      <div className="space-y-4 pt-4 border-t border-dashed">
        <Label className="text-xs font-semibold uppercase text-slate-500">Visibilité Réactive</Label>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded border bg-slate-50">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-slate-400" />
              <span className="text-xs">Afficher sur Desktop</span>
            </div>
            <input
              type="checkbox"
              id="vis-desktop"
              title="Toggle visibilité desktop"
              checked={!activeStyle.className?.includes('hidden')}
              onChange={(e) => {
                let cls = activeStyle.className || '';
                if (e.target.checked) cls = cls.replace('hidden', '').trim(); else cls = `${cls} hidden`.trim();
                handleStyleChange('className', cls);
              }} />
          </div>
          <div className="flex items-center justify-between p-2 rounded border bg-slate-50">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-slate-400" />
              <span className="text-xs">Cacher sur Mobile</span>
            </div>
            <input
              type="checkbox"
              id="vis-mobile"
              title="Toggle visibilité mobile"
              checked={activeStyle.className?.includes('max-md:hidden')}
              onChange={(e) => {
                let cls = activeStyle.className || '';
                if (e.target.checked) cls = `${cls} max-md:hidden`.trim(); else cls = cls.replace('max-md:hidden', '').trim();
                handleStyleChange('className', cls);
              }} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white text-sm">
            {/* Header */}
            <div className="border-b bg-white sticky top-0 z-20">
                <div className="h-14 flex items-center justify-between px-4 font-bold text-slate-800">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]"></span>
                        <div>
                            <div className="uppercase tracking-widest text-xs">{selectedBlock.type}</div>
                            <div className="text-[10px] text-slate-400 font-mono">#{selectedBlock.id.substring(0, 6)}</div>
                        </div>
                    </div>
                    <div className="flex gap-2 items-center">
                        <Button variant="outline" size="sm" className="h-8 px-3 text-slate-600" onClick={handleSaveTemplate} title="Sauvegarder ce bloc en tant que modèle">
                            <Save className="w-4 h-4 mr-2" />
                            Modèle
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 px-3 text-slate-600" onClick={handleResetStyle} title="Réinitialiser les styles du bloc">
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Reset styles
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 px-3 text-slate-600" onClick={handleResetContent} title="Réinitialiser le contenu du bloc">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Reset contenu
                        </Button>
                    </div>
                </div>
                <div className="px-4 pb-3 pt-2 text-[11px] text-slate-500">
                    {TYPE_HINTS[selectedBlock.type] || 'Modifier les propriétés et styles du bloc sélectionné.'}
                </div>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="style" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4 border-b bg-slate-50/50">
                    <TabsList className="w-full justify-start h-10 bg-transparent p-0 gap-6">
                        <TabsTrigger value="style" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-0 font-medium">Style</TabsTrigger>
                        <TabsTrigger value="content" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-0 font-medium">Contenu</TabsTrigger>
                        <TabsTrigger value="settings" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-full px-0 font-medium">Avancé</TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">

                    {/* --- STYLE TAB --- */}
                    <TabsContent value="style" className="mt-0 p-0">
                        {/* Device & Mode Selector */}
                        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex bg-slate-100 rounded p-0.5 shadow-inner">
                                <button
                                    onClick={() => setActiveDevice('base')}
                                    className={`p-1.5 rounded-sm ${activeDevice === 'base' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                    title="Desktop"
                                ><Monitor className="w-3.5 h-3.5" /></button>
                                <button
                                    onClick={() => setActiveDevice('mobile')}
                                    className={`p-1.5 rounded-sm ${activeDevice === 'mobile' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                                    title="Mobile"
                                ><Smartphone className="w-3.5 h-3.5" /></button>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="dark-mode-edit" className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                                    <Moon className="w-3 h-3 text-indigo-500" /> Mode Sombre
                                </Label>
                                <Switch
                                    id="dark-mode-edit"
                                    checked={activeDevice === 'dark'}
                                    onCheckedChange={(checked) => setActiveDevice(checked ? 'dark' : 'base')}
                                />
                            </div>
                        </div>

                        {activeDevice === 'dark' && (
                            <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100 text-[10px] text-indigo-700 font-medium text-center">
                                Édition des styles pour le Mode Sombre uniquement.
                            </div>
                        )}

                        <StyleEditorContext.Provider value={{ activeDevice }}>
                            <Accordion type="multiple" defaultValue={defaultAccordionValues} className="w-full">

                            {/* 1. Layout & Size (PRO Flexbox Editor) */}
                            <AccordionItem value="layout" className="border-b px-4">
                                <AccordionTrigger className="hover:no-underline py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Disposition</AccordionTrigger>
                                <AccordionContent className="space-y-4 pb-4">
                                    {/* Display Mode */}
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase text-slate-400">Mode d'affichage</Label>
                                        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-md">
                                            {['block', 'flex', 'grid', 'inline-block'].map((d) =>
                      <button
                        key={d}
                        title={d}
                        className={`h-7 rounded text-[10px] uppercase font-medium transition-all ${activeStyle.display === d ? 'bg-white shadow-sm text-blue-600 ring-1 ring-blue-100' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => handleStyleChange('display', d)}>
                        
                                                    {d === 'inline-block' ? 'Inline' : d}
                                                </button>
                      )}
                                        </div>
                                    </div>

                                    {/* FLEXBOX CONTROLS (Only visible if Flex) */}
                                    {activeStyle.display === 'flex' &&
                  <div className="p-3 bg-blue-50/50 rounded-md border border-blue-100 space-y-3 animation-fade-in">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[9px] uppercase text-blue-500 font-bold">Flexbox Settings</Label>
                                                <Layers className="w-3 h-3 text-blue-400" />
                                            </div>

                                            {/* Direction */}
                                            <div className="space-y-1">
                                                <Label className="text-[9px] text-slate-400">Direction</Label>
                                                <div className="flex bg-white rounded border overflow-hidden">
                                                    <button onClick={() => handleStyleChange('flexDirection', 'row')} className={`flex-1 h-6 flex items-center justify-center ${activeStyle.flexDirection === 'row' ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-50'}`} title="Ligne (Row)"><Move className="w-3 h-3 transform rotate-0" /></button>
                                                    <button onClick={() => handleStyleChange('flexDirection', 'column')} className={`flex-1 h-6 flex items-center justify-center ${activeStyle.flexDirection === 'column' ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-50'}`} title="Colonne (Column)"><Move className="w-3 h-3 transform rotate-90" /></button>
                                                </div>
                                            </div>

                                            {/* Justify Content (Main Axis) */}
                                            <div className="space-y-1">
                                                <Label className="text-[9px] text-slate-400">Alignement Principal (Justify)</Label>
                                                <div className="grid grid-cols-5 bg-white rounded border overflow-hidden">
                                                    {[
                        { val: 'flex-start', icon: AlignLeft, label: 'Start' },
                        { val: 'center', icon: AlignCenter, label: 'Center' },
                        { val: 'flex-end', icon: AlignRight, label: 'End' },
                        { val: 'space-between', icon: AlignJustify, label: 'Between' },
                        { val: 'space-around', icon: Box, label: 'Around' }].
                        map((opt) =>
                        <button
                          key={opt.val}
                          onClick={() => handleStyleChange('justifyContent', opt.val)}
                          className={`h-6 flex items-center justify-center ${activeStyle.justifyContent === opt.val ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-50'}`}
                          title={opt.label}>
                          
                                                            <opt.icon className="w-3 h-3" />
                                                        </button>
                        )}
                                                </div>
                                            </div>

                                            {/* Align Items (Cross Axis) */}
                                            <div className="space-y-1">
                                                <Label className="text-[9px] text-slate-400">Alignement Secondaire (Align)</Label>
                                                <div className="grid grid-cols-4 bg-white rounded border overflow-hidden">
                                                    {[
                        { val: 'stretch', icon: Maximize, label: 'Stretch' },
                        { val: 'flex-start', icon: AlignLeft, label: 'Start' },
                        { val: 'center', icon: AlignCenter, label: 'Center' },
                        { val: 'flex-end', icon: AlignRight, label: 'End' }].
                        map((opt) =>
                        <button
                          key={opt.val}
                          onClick={() => handleStyleChange('alignItems', opt.val)}
                          className={`h-6 flex items-center justify-center ${activeStyle.alignItems === opt.val ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-50'}`}
                          title={opt.label}>
                          
                                                            <opt.icon className={`w-3 h-3 ${opt.val === 'stretch' ? '' : 'transform rotate-90'}`} />
                                                        </button>
                        )}
                                                </div>
                                            </div>

                                            {/* Gap */}
                                            <div className="flex items-center gap-2">
                                                <Label className="text-[9px] text-slate-400 w-8">Gap</Label>
                                                <Input className="h-6 text-xs bg-white" placeholder="ex: 16px" value={activeStyle.gap || ''} onChange={(e) => handleStyleChange('gap', e.target.value)} />
                                            </div>
                                        </div>
                  }

                                    {/* Dimensions */}
                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-dashed">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase text-slate-400">Largeur</Label>
                                            <div className="flex items-center border rounded bg-white group hover:border-blue-400 focus-within:border-blue-500 transition-colors">
                                                <span className="pl-2 text-[10px] text-slate-400">W</span>
                                                <Input className="border-0 h-7 text-xs px-2 focus-visible:ring-0" placeholder="auto" value={activeStyle.width || ''} onChange={(e) => handleStyleChange('width', e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase text-slate-400">Hauteur</Label>
                                            <div className="flex items-center border rounded bg-white group hover:border-blue-400 focus-within:border-blue-500 transition-colors">
                                                <span className="pl-2 text-[10px] text-slate-400">H</span>
                                                <Input className="border-0 h-7 text-xs px-2 focus-visible:ring-0" placeholder="auto" value={activeStyle.height || ''} onChange={(e) => handleStyleChange('height', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-[10px] uppercase text-slate-400">Max-Width (Centrage)</Label>
                                        <div className="flex gap-2">
                                            <Input className="h-8 text-xs flex-1" placeholder="ex: 1200px" value={activeStyle.maxWidth || ''} onChange={(e) => handleStyleChange('maxWidth', e.target.value)} />
                                            <Button
                        variant="outline" size="sm" className="h-8 text-[10px]"
                        onClick={() => {
                          // Quick Auto Margin Center Preset
                          handleStyleChange('marginLeft', 'auto');
                          handleStyleChange('marginRight', 'auto');
                          handleStyleChange('width', '100%');
                          if (!activeStyle.maxWidth) handleStyleChange('maxWidth', '1280px');
                        }}
                        title="Centrer le bloc horizontalement">
                        
                                                Centrer
                                            </Button>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* 2. Spacing (Visual Box Model) */}
                            <AccordionItem value="spacing" className="border-b px-4">
                              <AccordionTrigger className="hover:no-underline py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Espacement</AccordionTrigger>
                              <AccordionContent className="pb-4 pt-0">
                                <SpacingSection />
                              </AccordionContent>
                            </AccordionItem>

                            {showTypography && (
                              <>
                              {/* 3. Typography (Google Fonts & PRO Controls) */}
                              <AccordionItem value="typography" className="border-b px-4">
                                <AccordionTrigger className="hover:no-underline py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Typographie</AccordionTrigger>
                                <AccordionContent className="space-y-4 pb-4">
                                <TypographySection />
                                </AccordionContent>
                              </AccordionItem>
                              </>
                            )}

                            {renderImageStyleSection()}

                            {/* 4. Backgrounds (Advanced Gradient Support V2) */}
                            <AccordionItem value="background" className="border-b px-4">
                              <AccordionTrigger className="hover:no-underline py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Arrière-plan</AccordionTrigger>
                              <AccordionContent className="space-y-4 pb-4">
                                <BackgroundSection />
                              </AccordionContent>
                            </AccordionItem>

                            {/* 5. Borders & Effects (Advanced Shadow) */}
                            <AccordionItem value="borders" className="border-b px-4">
                              <AccordionTrigger className="hover:no-underline py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Bordures & Effets</AccordionTrigger>
                              <AccordionContent className="space-y-4 pb-4">
                                <BorderSection />
                              </AccordionContent>
                            </AccordionItem>

                            {/* 6. Effects (Motion & Visual FX) */}
                            <AccordionItem value="effects" className="border-b px-4">
                              <AccordionTrigger className="hover:no-underline py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Effets</AccordionTrigger>
                              <AccordionContent className="space-y-4 pb-4">
                                <EffectsSection />
                              </AccordionContent>
                            </AccordionItem>

                            {/* 7. Layout (Flex / Grid) */}
                            <AccordionItem value="layout" className="border-b px-4">
                              <AccordionTrigger className="hover:no-underline py-3 text-xs font-bold uppercase tracking-wider text-slate-500">Layout</AccordionTrigger>
                              <AccordionContent className="space-y-4 pb-4">
                                <LayoutSection />
                              </AccordionContent>
                            </AccordionItem>

                            {/* 8. Advanced Custom CSS */}
                            <AccordionItem value="custom-css" className="border-b px-4">
                                <AccordionTrigger className="hover:no-underline py-3 text-xs font-bold uppercase tracking-wider text-slate-500">CSS Personnalisé</AccordionTrigger>
                                <AccordionContent className="pb-4">
                                    <Textarea
                    className="font-mono text-[10px] min-h-[100px] bg-slate-900 text-blue-300"
                    placeholder=".ma-classe { ... }"
                    value={activeStyle.customCss || ''}
                    onChange={(e) => handleStyleChange('customCss', e.target.value)} />
                  
                                    <p className="text-[9px] text-slate-400 mt-2 italic">Note: Le CSS sera injecté directement sur l'élément.</p>
                                </AccordionContent>
                            </AccordionItem>

                        </Accordion>
                        </StyleEditorContext.Provider>
                    </TabsContent>

                    {/* --- CONTENT TAB --- */}
                    <TabsContent value="content" className="mt-0 p-4 space-y-6">
                        {renderContentForm()}
                    </TabsContent>

                    {/* --- SETTINGS TAB --- */}
                    <TabsContent value="settings" className="mt-0 p-4 space-y-6">
                        {renderAdvancedForm()}
                    </TabsContent>

                </div>
            </Tabs>
        </div>);

};

export default React.memo(PropertyPanel);