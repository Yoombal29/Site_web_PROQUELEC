import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search, Globe, Calendar, User, Tag, Hash, Code, Image, Zap,
  CheckCircle2, XCircle, ChevronDown, ChevronUp, Eye, EyeOff, Wand2,
  FileText, BarChart2, LayoutTemplate, Shield, ImagePlay
} from 'lucide-react';
import { toast } from 'sonner';
import type { PageMetadata } from '@/stores/useBuilderStore';
import { calculateSeoScore, generateSlug, estimateReadingTime } from '@/lib/seo-calculator';

interface PageSettingsPanelProps {
  pageSettings?: {
    title: string;
    slug: string;
    metaDescription: string;
    metaKeywords: string;
    metaRobots: string;
    customCss: string;
    customJs: string;
    designOptions: Record<string, unknown>;
    isPublished: boolean;
    workflowStatus: string;
  };
  onPageSettingsChange?: (changes: Partial<PageSettingsPanelProps['pageSettings'] & Record<string, unknown>>) => void;
  pageMetadata?: PageMetadata;
  onPageMetadataChange?: (changes: Partial<PageMetadata>) => void;
  contentHtml?: string;
}

const MetaDescriptionField: React.FC<{
  value: string;
  onChange: (v: string) => void;
}> = ({ value, onChange }) => {
  const len = value.length;
  const color = len <= 160 && len >= 120 ? 'text-emerald-600' : len > 160 ? 'text-red-500' : 'text-amber-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <Label className="text-[10px] uppercase text-slate-400">Meta Description</Label>
        <span className={`text-[10px] font-mono font-semibold ${color}`}>{len}/160</span>
      </div>
      <Textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Décrivez le contenu de cette page en 120-160 caractères..."
        className="min-h-[90px] text-sm resize-none"
        maxLength={200}
      />
      {len > 160 && (
        <p className="text-[10px] text-red-500">⚠ Trop long — les moteurs de recherche tronqueront cet extrait.</p>
      )}
    </div>
  );
};

const TagInput: React.FC<{
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}> = ({ label, values, onChange, placeholder }) => {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
      setInput('');
    }
  };

  const removeTag = (tag: string) => {
    onChange(values.filter(v => v !== tag));
  };

  return (
    <div className="space-y-2">
      <Label className="text-[10px] uppercase text-slate-400">{label}</Label>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); }}}
          placeholder={placeholder || 'Ajouter...'}
          className="h-8 text-sm flex-1"
        />
        <Button size="sm" variant="outline" onClick={addTag} className="h-8 px-3">+</Button>
      </div>
      <div className="flex flex-wrap gap-1.5 min-h-[24px]">
        {values.map(tag => (
          <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-medium">
            {tag}
            <button onClick={() => removeTag(tag)} className="text-blue-400 hover:text-blue-700 ml-0.5">×</button>
          </span>
        ))}
        {values.length === 0 && <span className="text-[10px] text-slate-400 italic">Aucun élément. Tapez et appuyez sur Entrée.</span>}
      </div>
    </div>
  );
};

const SeoScoreWidget: React.FC<{
  title: string;
  metaDescription: string;
  metaKeywords: string;
  featuredImage: string;
  slug: string;
  contentHtml: string;
}> = ({ title, metaDescription, metaKeywords, featuredImage, slug, contentHtml }) => {
  const [expanded, setExpanded] = useState(false);
  const result = useMemo(() =>
    calculateSeoScore(title, contentHtml, metaDescription, metaKeywords, featuredImage, slug),
    [title, contentHtml, metaDescription, metaKeywords, featuredImage, slug]
  );

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white shadow-md"
            style={{ background: `conic-gradient(${result.color} ${result.score * 3.6}deg, #e2e8f0 0deg)` }}
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <span className="font-black text-xs" style={{ color: result.color }}>{result.grade}</span>
            </div>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">Score SEO : {result.score}/100</div>
            <div className="text-[10px] text-slate-500">{result.checks.filter(c => c.passed).length}/{result.checks.length} critères validés</div>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </div>
      {expanded && (
        <div className="border-t border-slate-100 divide-y divide-slate-50">
          {result.checks.map((check, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-2.5">
              {check.passed
                ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                : <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              }
              <div className="min-w-0">
                <div className={`text-xs font-medium ${check.passed ? 'text-slate-700' : 'text-slate-500'}`}>{check.label}</div>
                {!check.passed && check.hint && (
                  <div className="text-[10px] text-amber-600 mt-0.5">{check.hint}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────────────────────────────────────
const PageSettingsPanel: React.FC<PageSettingsPanelProps> = ({
  pageSettings,
  onPageSettingsChange,
  pageMetadata = {},
  onPageMetadataChange,
  contentHtml = ''
}) => {

  // ── LOCAL STATE ──────────────────────────────────────────────────────────────
  // We maintain local copies of all fields so keystrokes update the UI instantly
  // without triggering a BuilderPage re-render on every character typed.
  const [localSettings, setLocalSettings] = useState(() => pageSettings);
  const [localMetadata, setLocalMetadata] = useState(() => pageMetadata);

  // Sync when parent resets (e.g. page load)
  const prevPageSettingsRef = useRef(pageSettings);
  const prevPageMetadataRef = useRef(pageMetadata);
  useEffect(() => {
    if (pageSettings !== prevPageSettingsRef.current) {
      prevPageSettingsRef.current = pageSettings;
      setLocalSettings(pageSettings);
    }
  }, [pageSettings]);
  useEffect(() => {
    if (pageMetadata !== prevPageMetadataRef.current) {
      prevPageMetadataRef.current = pageMetadata;
      setLocalMetadata(pageMetadata);
    }
  }, [pageMetadata]);

  // ── DEBOUNCED PROPAGATION ────────────────────────────────────────────────────
  // Notify BuilderPage only after 500ms of inactivity (avoids re-render storm)
  const settingsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const metadataTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const propagateSettings = useCallback((changes: Record<string, unknown>) => {
    if (settingsTimerRef.current) clearTimeout(settingsTimerRef.current);
    settingsTimerRef.current = setTimeout(() => {
      onPageSettingsChange?.(changes as any);
    }, 500);
  }, [onPageSettingsChange]);

  const propagateMetadata = useCallback((changes: Partial<PageMetadata>) => {
    if (metadataTimerRef.current) clearTimeout(metadataTimerRef.current);
    metadataTimerRef.current = setTimeout(() => {
      onPageMetadataChange?.(changes);
    }, 500);
  }, [onPageMetadataChange]);

  useEffect(() => {
    return () => {
      if (settingsTimerRef.current) clearTimeout(settingsTimerRef.current);
      if (metadataTimerRef.current) clearTimeout(metadataTimerRef.current);
    };
  }, []);

  // ── UPDATERS ─────────────────────────────────────────────────────────────────
  const update = useCallback(<K extends keyof PageMetadata>(key: K, value: PageMetadata[K]) => {
    setLocalMetadata(prev => ({ ...prev, [key]: value }));
    propagateMetadata({ [key]: value } as Partial<PageMetadata>);
  }, [propagateMetadata]);

  const updateLegacy = useCallback((key: string, value: unknown) => {
    setLocalSettings(prev => prev ? ({ ...prev, [key]: value } as typeof prev) : prev);
    propagateSettings({ [key]: value });
  }, [propagateSettings]);

  // Auto-compute reading time from content
  useEffect(() => {
    if (contentHtml) {
      const rt = estimateReadingTime(contentHtml);
      if (rt !== localMetadata.reading_time) {
        update('reading_time', rt);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentHtml]);

  const handleAutoSlug = () => {
    if (localSettings?.title) {
      const slug = generateSlug(localSettings.title);
      updateLegacy('slug', slug);
      toast.success(`Slug généré : /${slug}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b bg-slate-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
          <div>
            <div className="text-sm font-bold text-slate-800">Paramètres de la Page</div>
            <div className="text-[10px] text-slate-400">SEO · Publication · Contenu · Code</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="seo" className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b bg-white px-2 pt-2 shrink-0">
          <TabsList className="w-full grid grid-cols-5 h-9 bg-slate-100/80">
            <TabsTrigger value="seo" className="text-[10px] gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Search className="w-3 h-3" />SEO
            </TabsTrigger>
            <TabsTrigger value="hero" className="text-[10px] gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <ImagePlay className="w-3 h-3" />Hero
            </TabsTrigger>
            <TabsTrigger value="publish" className="text-[10px] gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Globe className="w-3 h-3" />Pub.
            </TabsTrigger>
            <TabsTrigger value="content" className="text-[10px] gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <FileText className="w-3 h-3" />Info
            </TabsTrigger>
            <TabsTrigger value="code" className="text-[10px] gap-1 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Code className="w-3 h-3" />Code
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">

          {/* ── SEO TAB ── */}
          <TabsContent value="seo" className="m-0 p-4 space-y-5">
            <SeoScoreWidget
              title={localSettings?.title || ''}
              metaDescription={localSettings?.metaDescription || ''}
              metaKeywords={localSettings?.metaKeywords || ''}
              featuredImage={localMetadata.featured_image || ''}
              slug={localSettings?.slug || ''}
              contentHtml={contentHtml}
            />

            <MetaDescriptionField
              value={localSettings?.metaDescription || ''}
              onChange={v => updateLegacy('metaDescription', v)}
            />

            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-slate-400">Meta Keywords</Label>
              <Input
                value={localSettings?.metaKeywords || ''}
                onChange={e => updateLegacy('metaKeywords', e.target.value)}
                placeholder="electricite, audit, norme, senegal..."
                className="h-9 text-sm"
              />
              <p className="text-[10px] text-slate-400">Séparez les mots-clés par des virgules.</p>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-slate-400">Meta Robots</Label>
              <Select
                value={localSettings?.metaRobots || 'index,follow'}
                onValueChange={v => updateLegacy('metaRobots', v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="index,follow">index, follow (recommandé)</SelectItem>
                  <SelectItem value="noindex,follow">noindex, follow</SelectItem>
                  <SelectItem value="index,nofollow">index, nofollow</SelectItem>
                  <SelectItem value="noindex,nofollow">noindex, nofollow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-slate-400">Langue de la page</Label>
              <Select
                value={localMetadata.language_code || 'fr'}
                onValueChange={v => update('language_code', v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">🇫🇷 Français</SelectItem>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                  <SelectItem value="wo">🇸🇳 Wolof</SelectItem>
                  <SelectItem value="ar">🇸🇦 Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase text-slate-400">Image mise en avant</Label>
                {localMetadata.featured_image && (
                  <img src={localMetadata.featured_image} alt="" className="w-8 h-8 rounded object-cover border border-slate-200" />
                )}
              </div>
              <Input
                value={localMetadata.featured_image || ''}
                onChange={e => update('featured_image', e.target.value)}
                placeholder="https://... (image Open Graph)"
                className="h-9 text-sm"
              />
            </div>
          </TabsContent>

          {/* ── HERO TAB ── */}
          <TabsContent value="hero" className="m-0 p-4 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <p className="text-xs font-medium text-slate-700">Afficher le Hero</p>
                  <p className="text-[10px] text-slate-400">Section bannière en haut de page.</p>
                </div>
                <Switch
                  checked={localMetadata.show_hero ?? true}
                  onCheckedChange={v => update('show_hero', v)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-slate-400">Titre Principal (H1)</Label>
              <Input
                value={localMetadata.hero_title || ''}
                onChange={e => update('hero_title', e.target.value)}
                placeholder="Titre accrocheur..."
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-slate-400">Sous-titre / Description</Label>
              <Textarea
                value={localMetadata.hero_subtitle || ''}
                onChange={e => update('hero_subtitle', e.target.value)}
                placeholder="Texte d'accompagnement..."
                className="min-h-[80px] text-sm resize-none"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase text-slate-400">Image de fond (URL)</Label>
                {localMetadata.hero_background_image && (
                  <img src={localMetadata.hero_background_image} alt="" className="w-8 h-8 rounded object-cover border border-slate-200" />
                )}
              </div>
              <Input
                value={localMetadata.hero_background_image || ''}
                onChange={e => update('hero_background_image', e.target.value)}
                placeholder="https://..."
                className="h-9 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase text-slate-400">Texte du bouton</Label>
                <Input
                  value={localMetadata.hero_cta_text || ''}
                  onChange={e => update('hero_cta_text', e.target.value)}
                  placeholder="En savoir plus"
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase text-slate-400">Lien du bouton</Label>
                <Input
                  value={localMetadata.hero_cta_link || ''}
                  onChange={e => update('hero_cta_link', e.target.value)}
                  placeholder="/contact"
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </TabsContent>

          {/* ── PUBLISH TAB ── */}
          <TabsContent value="publish" className="m-0 p-4 space-y-5">
            {/* Status banner */}
            <div className={`rounded-lg p-3 flex items-center justify-between border ${
              localSettings?.isPublished
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div>
                <p className={`text-sm font-bold ${localSettings?.isPublished ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {localSettings?.isPublished ? '✅ Page publiée' : '📝 Brouillon'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {localSettings?.isPublished ? 'Visible par tous les visiteurs.' : 'Visible uniquement par les administrateurs.'}
                </p>
              </div>
              <Switch
                id="page-published"
                checked={localSettings?.isPublished || false}
                onCheckedChange={v => updateLegacy('isPublished', v)}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-slate-400">Flux de travail</Label>
              <Select
                value={localSettings?.workflowStatus || 'draft'}
                onValueChange={v => updateLegacy('workflowStatus', v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">📝 Brouillon</SelectItem>
                  <SelectItem value="review">👁 En relecture</SelectItem>
                  <SelectItem value="approved">✅ Approuvé</SelectItem>
                  <SelectItem value="published">🌐 Publié</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-slate-400">Date de publication</Label>
              <Input
                type="datetime-local"
                value={localMetadata.publish_date || ''}
                onChange={e => update('publish_date', e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-slate-400">Date de dépublication</Label>
              <Input
                type="datetime-local"
                value={localMetadata.unpublish_date || ''}
                onChange={e => update('unpublish_date', e.target.value)}
                className="h-9 text-sm"
              />
              <p className="text-[10px] text-slate-400">La page sera automatiquement masquée après cette date.</p>
            </div>

            <hr className="border-slate-100" />

            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-slate-400">Template de page</Label>
              <Select
                value={localMetadata.template || 'default'}
                onValueChange={v => update('template', v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">🗂 Par défaut</SelectItem>
                  <SelectItem value="full-width">📐 Pleine largeur</SelectItem>
                  <SelectItem value="sidebar-left">◀ Barre latérale gauche</SelectItem>
                  <SelectItem value="sidebar-right">▶ Barre latérale droite</SelectItem>
                  <SelectItem value="landing">🚀 Landing Page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <p className="text-xs font-medium text-slate-700">Afficher le Pied de page</p>
                  <p className="text-[10px] text-slate-400">Footer global du site.</p>
                </div>
                <Switch
                  checked={localMetadata.show_footer ?? true}
                  onCheckedChange={v => update('show_footer', v)}
                />
              </div>
            </div>
          </TabsContent>

          {/* ── INFO / CONTENT TAB ── */}
          <TabsContent value="content" className="m-0 p-4 space-y-5">
            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-slate-400">Slug URL</Label>
              <div className="flex gap-2">
                <div className="flex items-center flex-1 h-9 border border-slate-200 rounded-md px-3 bg-slate-50 overflow-hidden">
                  <span className="text-slate-400 text-sm shrink-0">/</span>
                  <Input
                    value={localSettings?.slug || ''}
                    onChange={e => updateLegacy('slug', e.target.value)}
                    className="h-full border-0 bg-transparent px-1 text-sm focus-visible:ring-0 shadow-none"
                    placeholder="mon-url-de-page"
                  />
                </div>
                <Button size="sm" variant="outline" onClick={handleAutoSlug} className="h-9 px-3 gap-1.5 shrink-0">
                  <Wand2 className="w-3 h-3" /> Auto
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-slate-400">Extrait / Description courte</Label>
              <Textarea
                value={localMetadata.excerpt || ''}
                onChange={e => update('excerpt', e.target.value)}
                placeholder="Résumé de la page affiché dans les listes d'articles..."
                className="min-h-[80px] text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase text-slate-400">Auteur</Label>
                <Input
                  value={localMetadata.author || ''}
                  onChange={e => update('author', e.target.value)}
                  placeholder="Nom de l'auteur..."
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase text-slate-400">Temps de lecture (min)</Label>
                <div className="flex items-center h-9 border border-slate-200 rounded-md px-3 bg-slate-50 gap-2">
                  <BarChart2 className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-700 font-mono">{localMetadata.reading_time || 1} min</span>
                  <span className="text-[10px] text-slate-400">(auto)</span>
                </div>
              </div>
            </div>

            <TagInput
              label="Catégories"
              values={localMetadata.categories || []}
              onChange={v => update('categories', v)}
              placeholder="Actualités, Normes..."
            />

            <TagInput
              label="Tags"
              values={localMetadata.tags || []}
              onChange={v => update('tags', v)}
              placeholder="NFC-15-100, audit..."
            />

            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-slate-400">Ordre dans le menu</Label>
              <Input
                type="number"
                value={localMetadata.menu_order !== undefined ? String(localMetadata.menu_order) : '0'}
                onChange={e => update('menu_order' as keyof PageMetadata, parseInt(e.target.value) as never)}
                className="h-9 text-sm w-24"
                min={0}
              />
            </div>
          </TabsContent>

          {/* ── CODE TAB ── */}
          <TabsContent value="code" className="m-0 p-4 space-y-5">
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-[11px] text-amber-700 flex gap-2">
              <Shield className="w-4 h-4 shrink-0 mt-0.5" />
              Le code personnalisé est injecté sur cette page uniquement. Assurez-vous qu'il est validé avant publication.
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-slate-400">CSS personnalisé</Label>
              <Textarea
                value={localSettings?.customCss || ''}
                onChange={e => updateLegacy('customCss', e.target.value)}
                placeholder={`/* Styles spécifiques à cette page */\n.hero { background: #0f172a; }`}
                className="min-h-[120px] text-xs font-mono resize-y"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-slate-400">JavaScript personnalisé</Label>
              <Textarea
                value={localSettings?.customJs || ''}
                onChange={e => updateLegacy('customJs', e.target.value)}
                placeholder={`// Script exécuté après chargement\ndocument.addEventListener('DOMContentLoaded', () => { });`}
                className="min-h-[120px] text-xs font-mono resize-y"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-slate-400">HTML personnalisé (en-tête)</Label>
              <Textarea
                value={localMetadata.header_html || ''}
                onChange={e => update('header_html', e.target.value)}
                placeholder={`<!-- Balises meta, scripts, liens CSS additionnels -->`}
                className="min-h-[90px] text-xs font-mono resize-y"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] uppercase text-slate-400">HTML personnalisé (pied de page)</Label>
              <Textarea
                value={localMetadata.footer_html || ''}
                onChange={e => update('footer_html', e.target.value)}
                placeholder={`<!-- Scripts de tracking, widgets tiers -->`}
                className="min-h-[90px] text-xs font-mono resize-y"
              />
            </div>
          </TabsContent>

        </div>
      </Tabs>
    </div>
  );
};

export default PageSettingsPanel;

