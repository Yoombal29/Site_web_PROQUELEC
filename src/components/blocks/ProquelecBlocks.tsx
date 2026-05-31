/**
 * ProquelecBlocks.tsx
 * Tous les blocs PROQUELEC adaptés pour Craft.js.
 * Chaque bloc expose ses propres settings via le panneau Inspecteur.
 */
import React, { useEffect, useState, lazy, Suspense, useRef } from 'react';
import { useNode, Element, useEditor } from '@craftjs/core';
import DOMPurify from 'dompurify';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Code2, Sparkles, Download, Upload, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { MediaPickerButton } from '@/components/admin/MediaPickerDialog';
import { getUniversalStyles } from './universalStyles';
import { useBuilderUiStore } from '@/stores/builder-ui.store';
import { resolveDynamicContent } from '@/lib/dynamic-data/resolver';
import { InlineTextEditor } from '../god-builder/InlineTextEditor';
import { HeroBanner } from '@/components/HeroBanner';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
export const SettingsLabel = ({ label }: { label: string }) => (
  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">{label}</label>
);
export const SettingsInput = ({ value, onChange, type = 'text', min, max, step }: any) => (
  <input
    type={type} value={value ?? ''} min={min} max={max} step={step}
    onChange={onChange}
    className="w-full bg-[#252538] border border-[#3a3a5a] text-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
  />
);
export const SettingsTextarea = ({ value, onChange, rows = 3 }: any) => (
  <textarea
    rows={rows} value={value ?? ''} onChange={onChange}
    className="w-full bg-[#252538] border border-[#3a3a5a] text-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500 resize-y"
  />
);
export const SettingsSelect = ({ value, onChange, options }: { value: string; onChange: any; options: { value: string; label: string }[] }) => (
  <select
    value={value}
    onChange={onChange}
    className="w-full bg-[#252538] border border-[#3a3a5a] text-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
  >
    {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
  </select>
);
export const SettingsColor = ({ value, onChange }: any) => (
  <div className="flex gap-2 items-center">
    <input type="color" value={value ?? '#ffffff'} onChange={onChange} className="w-10 h-8 rounded cursor-pointer bg-transparent border-0" />
    <SettingsInput value={value} onChange={onChange} />
  </div>
);
export const SettingsRow = ({ children }: { children: React.ReactNode }) => (
  <div className="space-y-1 mt-3">{children}</div>
);

// ─────────────────────────────────────────────
// 1. CONTAINER BLOCK
// ─────────────────────────────────────────────
interface ContainerProps {
  padding?: number;
  paddingY?: number;
  backgroundColor?: string;
  maxWidth?: string;
  children?: React.ReactNode;
}

export const ContainerBlock = (props: ContainerProps & any) => {
  const { padding = 20, paddingY, backgroundColor = '#ffffff', maxWidth = '100%', children } = props;
  const { connectors: { connect, drag } } = useNode();
  const universal = getUniversalStyles(props);
  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      style={{ padding: `${paddingY ?? padding}px ${padding}px`, backgroundColor, maxWidth, margin: '0 auto', ...universal.style }}
      className={`w-full relative min-h-[40px] proquelec-builder-node ${universal.className}`}
    >
      {children}
    </div>
  );
};
const ContainerSettings = () => {
  const { actions: { setProp }, padding, paddingY, backgroundColor, maxWidth } = useNode(n => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <SettingsRow><SettingsLabel label="Couleur de fond" /><SettingsColor value={backgroundColor} onChange={(e: any) => setProp((p: any) => p.backgroundColor = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Padding H (px)" /><SettingsInput type="number" value={padding} onChange={(e: any) => setProp((p: any) => p.padding = parseInt(e.target.value))} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Padding V (px)" /><SettingsInput type="number" value={paddingY} onChange={(e: any) => setProp((p: any) => p.paddingY = parseInt(e.target.value))} /></SettingsRow>
      <SettingsRow>
        <SettingsLabel label="Largeur max" />
        <SettingsSelect value={maxWidth} onChange={(e: any) => setProp((p: any) => p.maxWidth = e.target.value)} options={[
          { value: '100%', label: 'Pleine largeur' }, { value: '1280px', label: '1280px (XL)' }, { value: '1024px', label: '1024px (LG)' }, { value: '768px', label: '768px (MD)' },
        ]} />
      </SettingsRow>
    </div>
  );
};
ContainerBlock.craft = { displayName: 'Conteneur', props: { padding: 20, backgroundColor: '#ffffff', maxWidth: '100%' }, related: { settings: ContainerSettings } };

// ─────────────────────────────────────────────
// 2. TEXT BLOCK
// ─────────────────────────────────────────────
export const TextBlock = (props: any) => {
  const { text = 'Double-cliquez pour éditer', fontSize = 16, textAlign = 'left', color = '#0f172a', fontWeight = '400', lineHeight = '1.6' } = props;
  const { id, connectors: { connect, drag }, selected, actions: { setProp } } = useNode(n => ({ selected: n.events.selected }));

  const isEnabled = useEditor(state => state.options.enabled);
  const isLocked = useBuilderUiStore(state => state.lockedNodes[id]);
  const isHidden = useBuilderUiStore(state => state.hiddenNodes[id]);

  const [editable, setEditable] = useState(false);
  const universal = getUniversalStyles(props);

  useEffect(() => { if (!selected) setEditable(false); }, [selected]);

  // Hide in frontend page if marked hidden
  if (isHidden && !isEnabled) return null;

  const displayVal = (editable || isLocked) ? text : resolveDynamicContent(text);

  return (
    <div
      ref={(ref) => { if (ref) connect(isLocked ? ref : drag(ref)); }}
      onClick={() => !isLocked && isEnabled && selected && setEditable(true)}
      style={{
        fontSize: `${fontSize}px`,
        textAlign: textAlign as any,
        color,
        fontWeight,
        lineHeight,
        ...universal.style,
        opacity: isHidden ? 0.35 : universal.style.opacity,
        border: isHidden ? '1px dashed #ef4444' : undefined,
      }}
      className={`w-full outline-none min-h-[1.5em] proquelec-builder-node ${universal.className} ${editable ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
    >
      <InlineTextEditor
        value={displayVal}
        disabled={isLocked || !isEnabled || !editable}
        onChange={(newVal) => setProp((p: any) => p.text = newVal)}
        onBlur={() => setEditable(false)}
        style={{ fontSize: `${fontSize}px`, textAlign: textAlign as any, color, fontWeight, lineHeight }}
      />
    </div>
  );
};
const TextSettings = () => {
  const { actions: { setProp }, fontSize, textAlign, color, fontWeight } = useNode(n => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <SettingsRow><SettingsLabel label="Taille (px)" /><SettingsInput type="number" min={8} max={120} value={fontSize} onChange={(e: any) => setProp((p: any) => p.fontSize = parseInt(e.target.value))} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Couleur" /><SettingsColor value={color} onChange={(e: any) => setProp((p: any) => p.color = e.target.value)} /></SettingsRow>
      <SettingsRow>
        <SettingsLabel label="Alignement" />
        <SettingsSelect value={textAlign} onChange={(e: any) => setProp((p: any) => p.textAlign = e.target.value)} options={[
          { value: 'left', label: 'Gauche' }, { value: 'center', label: 'Centre' }, { value: 'right', label: 'Droite' }, { value: 'justify', label: 'Justifié' },
        ]} />
      </SettingsRow>
      <SettingsRow>
        <SettingsLabel label="Graisse" />
        <SettingsSelect value={fontWeight} onChange={(e: any) => setProp((p: any) => p.fontWeight = e.target.value)} options={[
          { value: '300', label: 'Light' }, { value: '400', label: 'Normal' }, { value: '600', label: 'Semi-Bold' }, { value: '700', label: 'Bold' }, { value: '900', label: 'Black' },
        ]} />
      </SettingsRow>
    </div>
  );
};
TextBlock.craft = { displayName: 'Texte', props: { text: 'Double-cliquez pour éditer', fontSize: 16, textAlign: 'left', color: '#0f172a', fontWeight: '400', lineHeight: '1.6' }, related: { settings: TextSettings } };

// ─────────────────────────────────────────────
// 3. HERO BLOCK (God Mode — édition complète)
// ─────────────────────────────────────────────
export const HeroBlock = (props: any) => {
  const {
    // Content
    headline           = '',
    subheadline        = '',
    badgeText          = '',
    ctaLabel           = '',
    ctaHref            = '/contact',
    secondaryCtaLabel  = '',
    secondaryCtaHref   = '#',
    accentColor        = '#f59e0b',
    showStats          = true,
    autoplayInterval   = 8000,
    // Custom slides override (JSON string)
    slidesJson         = '',
  } = props;

  const { id, connectors: { connect, drag } } = useNode();
  const isEnabled = useEditor(state => state.options.enabled);
  const isLocked  = useBuilderUiStore(state => state.lockedNodes[id]);
  const isHidden  = useBuilderUiStore(state => state.hiddenNodes[id]);

  if (isHidden && !isEnabled) return null;

  // Parse custom slides if provided
  let customSlides: any[] | undefined;
  if (slidesJson) {
    try { customSlides = JSON.parse(slidesJson); } catch { /* ignore */ }
  }

  return (
    <div
      ref={(ref) => { if (ref) connect(isLocked ? ref : drag(ref)); }}
      className={`relative proquelec-builder-node w-full ${isHidden ? 'opacity-40 outline-dashed outline-red-500' : ''}`}
    >
      {/* Builder overlay badge */}
      {isEnabled && (
        <div className="absolute top-3 left-3 z-50 bg-indigo-600 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg pointer-events-none select-none">
          ✦ Hero Section
        </div>
      )}

      <HeroBanner
        slides={customSlides}
        headline={headline || undefined}
        subheadline={subheadline || undefined}
        badgeText={badgeText || undefined}
        ctaLabel={ctaLabel || undefined}
        ctaHref={ctaHref || undefined}
        secondaryCtaLabel={secondaryCtaLabel || undefined}
        secondaryCtaHref={secondaryCtaHref || undefined}
        accentColor={accentColor}
        showStats={showStats}
        autoplayInterval={autoplayInterval}
      />
    </div>
  );
};

/* ── Settings Panel ── */
const HeroSettings = () => {
  const {
    actions: { setProp },
    headline, subheadline, badgeText,
    ctaLabel, ctaHref, secondaryCtaLabel, secondaryCtaHref,
    accentColor, showStats, autoplayInterval, slidesJson,
  } = useNode(n => ({ ...n.data.props }));

  const [tab, setTab] = useState<'content' | 'style' | 'slides'>('content');
  const [localJson, setLocalJson] = useState(slidesJson || '');
  const [jsonError, setJsonError] = useState('');

  const applyJson = () => {
    try {
      if (localJson.trim()) JSON.parse(localJson);
      setProp((p: any) => p.slidesJson = localJson);
      setJsonError('');
    } catch {
      setJsonError('JSON invalide — vérifiez la syntaxe');
    }
  };

  const TabBtn = ({ id, label }: { id: typeof tab; label: string }) => (
    <button
      onClick={() => setTab(id)}
      className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
        tab === id ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-3">
      {/* Tab switcher */}
      <div className="flex gap-1 bg-[#0d0d1a] rounded-lg p-1">
        <TabBtn id="content" label="Contenu" />
        <TabBtn id="style"   label="Style"   />
        <TabBtn id="slides"  label="Slides"  />
      </div>

      {/* ── Content tab ── */}
      {tab === 'content' && (
        <div className="space-y-3">
          <div className="text-[10px] text-slate-500 bg-[#0d0d1a] rounded-lg px-3 py-2 leading-relaxed">
            Ces valeurs remplacent le <strong className="text-slate-300">premier slide</strong> de la base de données.
            Laissez vide pour utiliser les données DB.
          </div>
          <SettingsRow>
            <SettingsLabel label="Badge (texte pillule)" />
            <SettingsInput value={badgeText} onChange={(e: any) => setProp((p: any) => p.badgeText = e.target.value)} />
          </SettingsRow>
          <SettingsRow>
            <SettingsLabel label="Titre principal" />
            <SettingsInput value={headline} onChange={(e: any) => setProp((p: any) => p.headline = e.target.value)} />
          </SettingsRow>
          <SettingsRow>
            <SettingsLabel label="Sous-titre / description" />
            <SettingsTextarea rows={3} value={subheadline} onChange={(e: any) => setProp((p: any) => p.subheadline = e.target.value)} />
          </SettingsRow>
          <SettingsRow>
            <SettingsLabel label="Bouton principal — texte" />
            <SettingsInput value={ctaLabel} onChange={(e: any) => setProp((p: any) => p.ctaLabel = e.target.value)} />
          </SettingsRow>
          <SettingsRow>
            <SettingsLabel label="Bouton principal — lien" />
            <SettingsInput value={ctaHref} onChange={(e: any) => setProp((p: any) => p.ctaHref = e.target.value)} />
          </SettingsRow>
          <SettingsRow>
            <SettingsLabel label="Bouton secondaire — texte" />
            <SettingsInput value={secondaryCtaLabel} onChange={(e: any) => setProp((p: any) => p.secondaryCtaLabel = e.target.value)} />
          </SettingsRow>
          <SettingsRow>
            <SettingsLabel label="Bouton secondaire — lien" />
            <SettingsInput value={secondaryCtaHref} onChange={(e: any) => setProp((p: any) => p.secondaryCtaHref = e.target.value)} />
          </SettingsRow>
        </div>
      )}

      {/* ── Style tab ── */}
      {tab === 'style' && (
        <div className="space-y-3">
          <SettingsRow>
            <SettingsLabel label="Couleur accent (badges, CTA, mots)" />
            <div className="flex items-center gap-2">
              <SettingsColor value={accentColor} onChange={(e: any) => setProp((p: any) => p.accentColor = e.target.value)} />
              <span className="text-[10px] text-slate-500">{accentColor}</span>
            </div>
          </SettingsRow>
          <SettingsRow>
            <SettingsLabel label="Intervalle défilement (ms)" />
            <SettingsInput
              type="number" min={2000} max={30000} step={500}
              value={autoplayInterval}
              onChange={(e: any) => setProp((p: any) => p.autoplayInterval = Number(e.target.value))}
            />
          </SettingsRow>
          <SettingsRow>
            <SettingsLabel label="Afficher les stats flottantes" />
            <select
              value={showStats ? 'yes' : 'no'}
              onChange={(e) => setProp((p: any) => p.showStats = e.target.value === 'yes')}
              className="w-full bg-[#252538] border border-[#3a3a5a] text-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="yes">Visible</option>
              <option value="no">Masqué</option>
            </select>
          </SettingsRow>
          <div className="text-[10px] text-slate-500 bg-[#0d0d1a] rounded-lg px-3 py-2 leading-relaxed">
            Pour changer l'image de fond des slides, utilisez l'onglet <strong className="text-slate-300">Slides</strong> ou modifiez les données via le panneau Admin → Accueil → Slides.
          </div>
        </div>
      )}

      {/* ── Slides tab ── */}
      {tab === 'slides' && (
        <div className="space-y-3">
          <div className="text-[10px] text-slate-500 bg-[#0d0d1a] rounded-lg px-3 py-2 leading-relaxed">
            Collez un tableau JSON de slides pour <strong className="text-slate-300">remplacer entièrement</strong> les slides DB.
            Chaque slide doit avoir : <code className="text-amber-400">badge</code>, <code className="text-amber-400">title</code>, <code className="text-amber-400">subtitle</code>, <code className="text-amber-400">background_url</code>, <code className="text-amber-400">cta_text</code>, <code className="text-amber-400">cta_link</code>.
          </div>

          <button
            onClick={() => {
              const example = JSON.stringify([
                {
                  id: 1,
                  badge: "Nouveau",
                  title: "Votre titre principal ici",
                  subtitle: "Un sous-titre accrocheur et professionnel",
                  description: "Description plus longue pour détailler votre message.",
                  background_url: "",
                  cta_text: "Découvrir",
                  cta_link: "/contact",
                  secondary_cta_text: "En savoir plus",
                  secondary_cta_link: "#services",
                  display_order: 1
                }
              ], null, 2);
              setLocalJson(example);
            }}
            className="w-full text-[10px] py-1.5 px-3 rounded-lg border border-dashed border-[#3a3a5a] text-slate-500 hover:text-slate-300 hover:border-indigo-500 transition-colors"
          >
            📋 Insérer un exemple de slide
          </button>

          <textarea
            value={localJson}
            onChange={(e) => { setLocalJson(e.target.value); setJsonError(''); }}
            rows={10}
            placeholder='[{"badge":"Nouveau","title":"Mon titre","subtitle":"...","background_url":"","cta_text":"Découvrir","cta_link":"/contact"}]'
            className="w-full bg-[#0a0a14] border border-[#3a3a5a] text-slate-300 rounded-lg px-3 py-2 text-[11px] font-mono focus:outline-none focus:border-indigo-500 resize-y"
          />

          {jsonError && (
            <div className="text-[10px] text-red-400 bg-red-500/10 rounded px-2 py-1">{jsonError}</div>
          )}

          <div className="flex gap-2">
            <button
              onClick={applyJson}
              className="flex-1 py-1.5 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            >
              ✓ Appliquer les slides
            </button>
            {slidesJson && (
              <button
                onClick={() => { setLocalJson(''); setProp((p: any) => p.slidesJson = ''); }}
                className="px-3 py-1.5 text-[11px] text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg transition-colors"
              >
                ✕ Réinitialiser
              </button>
            )}
          </div>

          <div className="mt-2 text-[10px] text-slate-500">
            💡 Pour éditer les slides de manière permanente, allez dans&nbsp;
            <a href="/admin/home-slides" target="_blank" className="text-indigo-400 hover:underline">Admin → Slides</a>.
          </div>
        </div>
      )}
    </div>
  );
};

HeroBlock.craft = {
  displayName: 'Hero Accueil',
  props: {
    headline: '',
    subheadline: '',
    badgeText: '',
    ctaLabel: '',
    ctaHref: '/contact',
    secondaryCtaLabel: '',
    secondaryCtaHref: '#',
    accentColor: '#f59e0b',
    showStats: true,
    autoplayInterval: 8000,
    slidesJson: '',
  },
  related: { settings: HeroSettings },
};


// ─────────────────────────────────────────────
// 4. BUTTON BLOCK
// ─────────────────────────────────────────────
export const ButtonBlock = (props: any) => {
  const { label = 'Cliquez ici', href = '#', backgroundColor = '#2563eb', textColor = '#ffffff', size = 'md', fullWidth = false, rounded = 'full' } = props;
  const { id, connectors: { connect, drag } } = useNode();

  const isEnabled = useEditor(state => state.options.enabled);
  const isLocked = useBuilderUiStore(state => state.lockedNodes[id]);
  const isHidden = useBuilderUiStore(state => state.hiddenNodes[id]);

  const sizeClasses: Record<string, string> = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3', lg: 'px-10 py-4 text-lg font-bold' };
  const roundedClasses: Record<string, string> = { none: '', md: 'rounded-md', lg: 'rounded-lg', full: 'rounded-full' };
  const universal = getUniversalStyles(props);

  if (isHidden && !isEnabled) return null;

  const resolvedLabel = resolveDynamicContent(label);

  return (
    <div
      ref={(ref) => { if (ref) connect(isLocked ? ref : drag(ref)); }}
      style={{
        ...universal.style,
        opacity: isHidden ? 0.35 : universal.style.opacity,
        border: isHidden ? '1px dashed #ef4444' : undefined,
      }}
      className={`flex proquelec-builder-node ${universal.className} ${fullWidth ? 'w-full' : 'justify-center'}`}
    >
      <a href={href} style={{ backgroundColor, color: textColor }} className={`inline-block ${sizeClasses[size] ?? sizeClasses.md} ${roundedClasses[rounded]} font-semibold transition-all hover:opacity-90 hover:scale-105 shadow-md ${fullWidth ? 'w-full text-center' : ''}`}>
        {resolvedLabel}
      </a>
    </div>
  );
};
const ButtonSettings = () => {
  const { actions: { setProp }, label, href, backgroundColor, textColor, size, fullWidth, rounded } = useNode(n => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <SettingsRow><SettingsLabel label="Texte" /><SettingsInput value={label} onChange={(e: any) => setProp((p: any) => p.label = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Lien (href)" /><SettingsInput value={href} onChange={(e: any) => setProp((p: any) => p.href = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Couleur fond" /><SettingsColor value={backgroundColor} onChange={(e: any) => setProp((p: any) => p.backgroundColor = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Couleur texte" /><SettingsColor value={textColor} onChange={(e: any) => setProp((p: any) => p.textColor = e.target.value)} /></SettingsRow>
      <SettingsRow>
        <SettingsLabel label="Taille" />
        <SettingsSelect value={size} onChange={(e: any) => setProp((p: any) => p.size = e.target.value)} options={[{ value: 'sm', label: 'Petit' }, { value: 'md', label: 'Moyen' }, { value: 'lg', label: 'Grand' }]} />
      </SettingsRow>
      <SettingsRow>
        <SettingsLabel label="Arrondi" />
        <SettingsSelect value={rounded} onChange={(e: any) => setProp((p: any) => p.rounded = e.target.value)} options={[{ value: 'none', label: 'Aucun' }, { value: 'md', label: 'MD' }, { value: 'lg', label: 'LG' }, { value: 'full', label: 'Pilule' }]} />
      </SettingsRow>
    </div>
  );
};
ButtonBlock.craft = { displayName: 'Bouton', props: { label: 'Cliquez ici', href: '#', backgroundColor: '#2563eb', textColor: '#ffffff', size: 'md', fullWidth: false, rounded: 'full' }, related: { settings: ButtonSettings } };

// ─────────────────────────────────────────────
// 5. IMAGE BLOCK
// ─────────────────────────────────────────────
export const ImageBlock = (props: any) => {
  const { src = 'https://via.placeholder.com/800x400', alt = 'Image', caption = '', objectFit = 'cover', height = 400, rounded = 'lg' } = props;
  const { connectors: { connect, drag } } = useNode();
  const roundedClasses: Record<string, string> = { none: '', sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg', xl: 'rounded-xl' };
  const universal = getUniversalStyles(props);
  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      style={universal.style}
      className={`w-full proquelec-builder-node ${universal.className}`}
    >
      <img src={src} alt={alt} style={{ objectFit, height: `${height}px` }} className={`w-full ${roundedClasses[rounded]} shadow-sm`} loading="lazy" />
      {caption && <p className="text-center text-xs text-slate-400 mt-2 italic">{caption}</p>}
    </div>
  );
};
const ImageSettings = () => {
  const { actions: { setProp }, src, alt, caption, height, objectFit, rounded } = useNode(n => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <SettingsRow><SettingsLabel label="URL de l'image" /><SettingsInput value={src} onChange={(e: any) => setProp((p: any) => p.src = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Médiathèque" /><MediaPickerButton onSelect={(url: string) => setProp((p: any) => p.src = url)} label="Choisir depuis la médiathèque" /></SettingsRow>
      <SettingsRow><SettingsLabel label="Texte alternatif" /><SettingsInput value={alt} onChange={(e: any) => setProp((p: any) => p.alt = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Légende" /><SettingsInput value={caption} onChange={(e: any) => setProp((p: any) => p.caption = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Hauteur (px)" /><SettingsInput type="number" value={height} onChange={(e: any) => setProp((p: any) => p.height = parseInt(e.target.value))} /></SettingsRow>
      <SettingsRow>
        <SettingsLabel label="Remplissage" />
        <SettingsSelect value={objectFit} onChange={(e: any) => setProp((p: any) => p.objectFit = e.target.value)} options={[{ value: 'cover', label: 'Cover' }, { value: 'contain', label: 'Contain' }, { value: 'fill', label: 'Remplir' }]} />
      </SettingsRow>
    </div>
  );
};
ImageBlock.craft = { displayName: 'Image', props: { src: 'https://via.placeholder.com/800x400', alt: 'Image', height: 400, objectFit: 'cover', rounded: 'lg' }, related: { settings: ImageSettings } };

// ─────────────────────────────────────────────
// 6. STATS BLOCK
// ─────────────────────────────────────────────
export const StatsBlock = (props: any) => {
  const { stat1Value = '100+', stat1Label = 'Projets réalisés', stat2Value = '50+', stat2Label = 'Clients satisfaits', stat3Value = '15+', stat3Label = "Ans d'expérience", backgroundColor = '#f8fafc', accentColor = '#2563eb' } = props;
  const { connectors: { connect, drag } } = useNode();
  const stats = [{ value: stat1Value, label: stat1Label }, { value: stat2Value, label: stat2Label }, { value: stat3Value, label: stat3Label }];
  const universal = getUniversalStyles(props);
  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      style={{ backgroundColor, ...universal.style }}
      className={`w-full py-16 px-8 proquelec-builder-node ${universal.className}`}
    >
      <div className="flex flex-wrap justify-center gap-12 max-w-4xl mx-auto">
        {stats.map((s, i) => (
          <div key={i} className="text-center">
            <div style={{ color: accentColor }} className="text-5xl font-black mb-2">{s.value}</div>
            <div className="text-slate-600 text-sm font-medium">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
const StatsSettings = () => {
  const { actions: { setProp }, stat1Value, stat1Label, stat2Value, stat2Label, stat3Value, stat3Label, backgroundColor, accentColor } = useNode(n => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <SettingsRow><SettingsLabel label="Stat 1 — Valeur" /><SettingsInput value={stat1Value} onChange={(e: any) => setProp((p: any) => p.stat1Value = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Stat 1 — Label" /><SettingsInput value={stat1Label} onChange={(e: any) => setProp((p: any) => p.stat1Label = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Stat 2 — Valeur" /><SettingsInput value={stat2Value} onChange={(e: any) => setProp((p: any) => p.stat2Value = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Stat 2 — Label" /><SettingsInput value={stat2Label} onChange={(e: any) => setProp((p: any) => p.stat2Label = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Stat 3 — Valeur" /><SettingsInput value={stat3Value} onChange={(e: any) => setProp((p: any) => p.stat3Value = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Stat 3 — Label" /><SettingsInput value={stat3Label} onChange={(e: any) => setProp((p: any) => p.stat3Label = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Fond" /><SettingsColor value={backgroundColor} onChange={(e: any) => setProp((p: any) => p.backgroundColor = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Accent" /><SettingsColor value={accentColor} onChange={(e: any) => setProp((p: any) => p.accentColor = e.target.value)} /></SettingsRow>
    </div>
  );
};
StatsBlock.craft = { displayName: 'Statistiques', props: { stat1Value: '100+', stat1Label: 'Projets réalisés', stat2Value: '50+', stat2Label: 'Clients satisfaits', stat3Value: '15+', stat3Label: "Ans d'expérience", backgroundColor: '#f8fafc', accentColor: '#2563eb' }, related: { settings: StatsSettings } };

// ─────────────────────────────────────────────
// 7. VIDEO BLOCK
// ─────────────────────────────────────────────
export const VideoBlock = (props: any) => {
  const { src = '', caption = '', aspectRatio = '16/9' } = props;
  const { connectors: { connect, drag } } = useNode();
  const embedUrl = src.includes('youtube.com') || src.includes('youtu.be')
    ? src.replace(/.*(?:youtu\.be\/|v\/|embed\/|watch\?v=)([^#&?]*).*/, 'https://www.youtube.com/embed/$1')
    : src;
  const universal = getUniversalStyles(props);
  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      style={universal.style}
      className={`w-full proquelec-builder-node ${universal.className}`}
    >
      <div className="rounded-xl overflow-hidden bg-slate-900 shadow-xl" style={{ aspectRatio }}>
        {embedUrl ? (
          <iframe src={embedUrl} className="w-full h-full" allowFullScreen title="Video" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">Entrez une URL YouTube</div>
        )}
      </div>
      {caption && <p className="text-center text-xs text-slate-400 mt-2 italic">{caption}</p>}
    </div>
  );
};
const VideoSettings = () => {
  const { actions: { setProp }, src, caption, aspectRatio } = useNode(n => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <SettingsRow><SettingsLabel label="URL YouTube / Vidéo" /><SettingsInput value={src} onChange={(e: any) => setProp((p: any) => p.src = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Légende" /><SettingsInput value={caption} onChange={(e: any) => setProp((p: any) => p.caption = e.target.value)} /></SettingsRow>
      <SettingsRow>
        <SettingsLabel label="Format" />
        <SettingsSelect value={aspectRatio} onChange={(e: any) => setProp((p: any) => p.aspectRatio = e.target.value)} options={[{ value: '16/9', label: '16/9 (Widescreen)' }, { value: '4/3', label: '4/3 (Classique)' }, { value: '1/1', label: '1/1 (Carré)' }]} />
      </SettingsRow>
    </div>
  );
};
VideoBlock.craft = { displayName: 'Vidéo', props: { src: '', caption: '', aspectRatio: '16/9' }, related: { settings: VideoSettings } };

// ─────────────────────────────────────────────
// 8. DIVIDER BLOCK
// ─────────────────────────────────────────────
export const DividerBlock = (props: any) => {
  const { color = '#e2e8f0', thickness = 1, marginY = 24, style: lineStyle = 'solid' } = props;
  const { connectors: { connect, drag } } = useNode();
  const universal = getUniversalStyles(props);
  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      style={{ paddingTop: `${marginY}px`, paddingBottom: `${marginY}px`, ...universal.style }}
      className={`w-full proquelec-builder-node ${universal.className}`}
    >
      <hr style={{ borderColor: color, borderTopWidth: `${thickness}px`, borderTopStyle: lineStyle }} />
    </div>
  );
};
const DividerSettings = () => {
  const { actions: { setProp }, color, thickness, marginY, style: lineStyle } = useNode(n => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <SettingsRow><SettingsLabel label="Couleur" /><SettingsColor value={color} onChange={(e: any) => setProp((p: any) => p.color = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Épaisseur (px)" /><SettingsInput type="number" min={1} max={10} value={thickness} onChange={(e: any) => setProp((p: any) => p.thickness = parseInt(e.target.value))} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Marge V (px)" /><SettingsInput type="number" value={marginY} onChange={(e: any) => setProp((p: any) => p.marginY = parseInt(e.target.value))} /></SettingsRow>
      <SettingsRow>
        <SettingsLabel label="Style" />
        <SettingsSelect value={lineStyle} onChange={(e: any) => setProp((p: any) => p.style = e.target.value)} options={[{ value: 'solid', label: 'Solide' }, { value: 'dashed', label: 'Tirets' }, { value: 'dotted', label: 'Points' }]} />
      </SettingsRow>
    </div>
  );
};
DividerBlock.craft = { displayName: 'Séparateur', props: { color: '#e2e8f0', thickness: 1, marginY: 24, style: 'solid' }, related: { settings: DividerSettings } };

// ─────────────────────────────────────────────
// 9. SPACER BLOCK
// ─────────────────────────────────────────────
export const SpacerBlock = (props: any) => {
  const { height = 40 } = props;
  const { connectors: { connect, drag } } = useNode();
  const universal = getUniversalStyles(props);
  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      style={{ height: `${height}px`, ...universal.style }}
      className={`w-full proquelec-builder-node ${universal.className}`}
    />
  );
};
const SpacerSettings = () => {
  const { actions: { setProp }, height } = useNode(n => ({ ...n.data.props }));
  return <div className="space-y-3"><SettingsRow><SettingsLabel label="Hauteur (px)" /><SettingsInput type="number" min={4} max={400} value={height} onChange={(e: any) => setProp((p: any) => p.height = parseInt(e.target.value))} /></SettingsRow></div>;
};
SpacerBlock.craft = { displayName: 'Espace', props: { height: 40 }, related: { settings: SpacerSettings } };

// ─────────────────────────────────────────────
// 10. CARD BLOCK
// ─────────────────────────────────────────────
export const CardBlock = (props: any) => {
  const { title = 'Carte', subtitle = 'Sous-titre', text = 'Contenu de la carte...', icon = '⚡', backgroundColor = '#ffffff', borderColor = '#e2e8f0', accentColor = '#2563eb' } = props;
  const { connectors: { connect, drag } } = useNode();
  const universal = getUniversalStyles(props);
  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      style={{ backgroundColor, borderColor, ...universal.style }}
      className={`rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow proquelec-builder-node ${universal.className}`}
    >
      {icon && <div className="text-3xl mb-4">{icon}</div>}
      {title && <h3 style={{ color: accentColor }} className="font-bold text-lg mb-1">{title}</h3>}
      {subtitle && <p className="text-sm text-slate-500 mb-2">{subtitle}</p>}
      {text && <p className="text-sm text-slate-600">{text}</p>}
    </div>
  );
};
const CardSettings = () => {
  const { actions: { setProp }, title, subtitle, text, icon, backgroundColor, borderColor, accentColor } = useNode(n => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <SettingsRow><SettingsLabel label="Icône (Emoji)" /><SettingsInput value={icon} onChange={(e: any) => setProp((p: any) => p.icon = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Titre" /><SettingsInput value={title} onChange={(e: any) => setProp((p: any) => p.title = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Sous-titre" /><SettingsInput value={subtitle} onChange={(e: any) => setProp((p: any) => p.subtitle = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Texte" /><SettingsTextarea value={text} onChange={(e: any) => setProp((p: any) => p.text = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Fond" /><SettingsColor value={backgroundColor} onChange={(e: any) => setProp((p: any) => p.backgroundColor = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Accent" /><SettingsColor value={accentColor} onChange={(e: any) => setProp((p: any) => p.accentColor = e.target.value)} /></SettingsRow>
    </div>
  );
};
CardBlock.craft = { displayName: 'Carte', props: { title: 'Carte', subtitle: 'Sous-titre', text: 'Contenu de la carte...', icon: '⚡', backgroundColor: '#ffffff', borderColor: '#e2e8f0', accentColor: '#2563eb' }, related: { settings: CardSettings } };

// ─────────────────────────────────────────────
// 11. COLUMNS BLOCK
// ─────────────────────────────────────────────
export const ColumnsBlock = (props: any) => {
  const { columns = 2, gap = 24, children } = props;
  const { connectors: { connect, drag } } = useNode();
  const universal = getUniversalStyles(props);
  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      style={{ gap: `${gap}px`, ...universal.style }}
      className={`w-full grid grid-cols-1 md:grid-cols-${Math.min(columns, 4)} min-h-[60px] proquelec-builder-node ${universal.className}`}
    >
      {children ?? Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="min-h-[60px] border-2 border-dashed border-slate-200 rounded flex items-center justify-center text-slate-400 text-sm">Colonne {i + 1}</div>
      ))}
    </div>
  );
};
const ColumnsSettings = () => {
  const { actions: { setProp }, columns, gap } = useNode(n => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <SettingsRow>
        <SettingsLabel label="Nombre de colonnes" />
        <SettingsSelect value={String(columns)} onChange={(e: any) => setProp((p: any) => p.columns = parseInt(e.target.value))} options={[{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }]} />
      </SettingsRow>
      <SettingsRow><SettingsLabel label="Espacement (px)" /><SettingsInput type="number" value={gap} onChange={(e: any) => setProp((p: any) => p.gap = parseInt(e.target.value))} /></SettingsRow>
    </div>
  );
};
ColumnsBlock.craft = { displayName: 'Colonnes', props: { columns: 2, gap: 24 }, related: { settings: ColumnsSettings } };

// ─────────────────────────────────────────────
// 12. FORM BLOCK
// ─────────────────────────────────────────────
export const FormBlock = (props: any) => {
  const { title = 'Contactez-nous', subtitle = 'Remplissez le formulaire ci-dessous', submitText = 'Envoyer', backgroundColor = '#f8fafc' } = props;
  const { connectors: { connect, drag } } = useNode();
  const universal = getUniversalStyles(props);
  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      style={{ backgroundColor, ...universal.style }}
      className={`w-full rounded-2xl p-8 proquelec-builder-node ${universal.className}`}
    >
      {title && <h3 className="text-2xl font-bold text-slate-800 mb-2">{title}</h3>}
      {subtitle && <p className="text-slate-500 text-sm mb-6">{subtitle}</p>}
      <div className="space-y-4">
        <input placeholder="Nom complet" className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-white text-sm" readOnly />
        <input placeholder="Adresse email" className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-white text-sm" readOnly />
        <input placeholder="Téléphone" className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-white text-sm" readOnly />
        <textarea placeholder="Votre message..." rows={4} className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-white text-sm resize-none" readOnly />
        <button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">{submitText}</button>
      </div>
    </div>
  );
};
const FormSettings = () => {
  const { actions: { setProp }, title, subtitle, submitText, backgroundColor } = useNode(n => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <SettingsRow><SettingsLabel label="Titre" /><SettingsInput value={title} onChange={(e: any) => setProp((p: any) => p.title = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Sous-titre" /><SettingsInput value={subtitle} onChange={(e: any) => setProp((p: any) => p.subtitle = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Texte bouton" /><SettingsInput value={submitText} onChange={(e: any) => setProp((p: any) => p.submitText = e.target.value)} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Fond" /><SettingsColor value={backgroundColor} onChange={(e: any) => setProp((p: any) => p.backgroundColor = e.target.value)} /></SettingsRow>
    </div>
  );
};
FormBlock.craft = { displayName: 'Formulaire', props: { title: 'Contactez-nous', subtitle: 'Remplissez le formulaire ci-dessous', submitText: 'Envoyer', backgroundColor: '#f8fafc' }, related: { settings: FormSettings } };

// ─────────────────────────────────────────────
// 13. TESTIMONIALS BLOCK
// ─────────────────────────────────────────────
export const TestimonialsBlock = (props: any) => {
  const {
    testimonial1Name = 'Sophie Martin', testimonial1Role = 'Directrice Technique', testimonial1Text = 'PROQUELEC a transformé notre approche de la sécurité électrique. Service exceptionnel !', testimonial1Stars = 5,
    testimonial2Name = 'Jean Dupont', testimonial2Role = 'Chef de projet', testimonial2Text = 'Équipe professionnelle, résultats au-delà de nos attentes. Je recommande vivement.', testimonial2Stars = 5,
    backgroundColor = '#0f172a', textColor = '#ffffff',
  } = props;
  const { connectors: { connect, drag } } = useNode();
  const testimonials = [
    { name: testimonial1Name, role: testimonial1Role, text: testimonial1Text, stars: testimonial1Stars },
    { name: testimonial2Name, role: testimonial2Role, text: testimonial2Text, stars: testimonial2Stars },
  ];
  const universal = getUniversalStyles(props);
  return (
    <div
      ref={ref => { if (ref) connect(drag(ref)); }}
      style={{ backgroundColor, ...universal.style }}
      className={`w-full py-16 px-8 proquelec-builder-node ${universal.className}`}
    >
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {testimonials.map((t, i) => (
          <div key={i} className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-8 hover:bg-white/15 transition-colors">
            <div className="flex gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, si) => (
                <span key={si} style={{ color: si < t.stars ? '#f59e0b' : '#374151' }} className="text-xl">★</span>
              ))}
            </div>
            <blockquote style={{ color: textColor }} className="text-base mb-6 leading-relaxed italic opacity-90">"{t.text}"</blockquote>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                {t.name.charAt(0)}
              </div>
              <div>
                <div style={{ color: textColor }} className="font-semibold text-sm">{t.name}</div>
                <div style={{ color: textColor }} className="text-xs opacity-60">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
const TestimonialsSettings = () => {
  const { actions: { setProp }, testimonial1Name, testimonial1Role, testimonial1Text, testimonial2Name, testimonial2Role, testimonial2Text, backgroundColor } = useNode(n => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-2">Témoignage 1</div>
      <SettingsRow><SettingsLabel label="Nom" /><SettingsInput value={testimonial1Name} onChange={(e: any) => setProp((p: any) => { p.testimonial1Name = e.target.value; })} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Rôle" /><SettingsInput value={testimonial1Role} onChange={(e: any) => setProp((p: any) => { p.testimonial1Role = e.target.value; })} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Texte" /><SettingsTextarea value={testimonial1Text} onChange={(e: any) => setProp((p: any) => { p.testimonial1Text = e.target.value; })} /></SettingsRow>
      <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-2">Témoignage 2</div>
      <SettingsRow><SettingsLabel label="Nom" /><SettingsInput value={testimonial2Name} onChange={(e: any) => setProp((p: any) => { p.testimonial2Name = e.target.value; })} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Rôle" /><SettingsInput value={testimonial2Role} onChange={(e: any) => setProp((p: any) => { p.testimonial2Role = e.target.value; })} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Texte" /><SettingsTextarea value={testimonial2Text} onChange={(e: any) => setProp((p: any) => { p.testimonial2Text = e.target.value; })} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Fond" /><SettingsColor value={backgroundColor} onChange={(e: any) => setProp((p: any) => { p.backgroundColor = e.target.value; })} /></SettingsRow>
    </div>
  );
};
TestimonialsBlock.craft = { displayName: 'Témoignages', props: { testimonial1Name: 'Sophie Martin', testimonial1Role: 'Directrice Technique', testimonial1Text: 'PROQUELEC a transformé notre approche.', testimonial1Stars: 5, testimonial2Name: 'Jean Dupont', testimonial2Role: 'Chef de projet', testimonial2Text: 'Équipe professionnelle, résultats au-delà de nos attentes.', testimonial2Stars: 5, backgroundColor: '#0f172a', textColor: '#ffffff' }, related: { settings: TestimonialsSettings } };

// ─────────────────────────────────────────────
// 14. PRICING BLOCK
// ─────────────────────────────────────────────
export const PricingBlock = (props: any) => {
  const {
    plan1Name = 'Essentiel', plan1Price = '199', plan1Period = 'mois', plan1Features = 'Audit de base\nRapport PDF\nSupport email', plan1Cta = 'Choisir',
    plan2Name = 'Professionnel', plan2Price = '499', plan2Period = 'mois', plan2Features = 'Audit complet\nRapport détaillé\nSupport prioritaire\nFormation équipe', plan2Cta = 'Choisir', plan2Featured = true,
    plan3Name = 'Entreprise', plan3Price = 'Sur devis', plan3Period = '', plan3Features = 'Audit multi-sites\nRapport personnalisé\nSupport dédié\nFormation + Suivi', plan3Cta = 'Contacter',
    accentColor = '#2563eb',
  } = props;
  const { connectors: { connect, drag } } = useNode();
  const plans = [
    { name: plan1Name, price: plan1Price, period: plan1Period, features: plan1Features, cta: plan1Cta, featured: false },
    { name: plan2Name, price: plan2Price, period: plan2Period, features: plan2Features, cta: plan2Cta, featured: plan2Featured },
    { name: plan3Name, price: plan3Price, period: plan3Period, features: plan3Features, cta: plan3Cta, featured: false },
  ];
  const universal = getUniversalStyles(props);
  return (
    <div
      ref={ref => { if (ref) connect(drag(ref)); }}
      style={universal.style}
      className={`w-full py-16 px-8 bg-white proquelec-builder-node ${universal.className}`}
    >
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {plans.map((plan, i) => (
          <div key={i} className={`relative rounded-2xl p-8 border-2 transition-all ${plan.featured ? 'shadow-2xl scale-105' : 'border-slate-100 shadow-sm hover:shadow-md bg-white'}`}
            style={plan.featured ? { borderColor: accentColor, backgroundColor: accentColor } : {}}>
            {plan.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">Populaire</div>}
            <div className={`text-sm font-bold mb-4 ${plan.featured ? 'text-blue-100' : 'text-slate-500'}`}>{plan.name}</div>
            <div className={`flex items-baseline gap-1 mb-6 ${plan.featured ? 'text-white' : 'text-slate-900'}`}>
              <span className="text-4xl font-black">{plan.price}</span>
              {plan.period && <span className={`text-sm ${plan.featured ? 'text-blue-100' : 'text-slate-400'}`}>/{plan.period}</span>}
            </div>
            <ul className="space-y-2.5 mb-8">
              {plan.features.split('\n').filter(Boolean).map((feat: string, fi: number) => (
                <li key={fi} className={`flex items-start gap-2 text-sm ${plan.featured ? 'text-blue-100' : 'text-slate-600'}`}>
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>{feat}
                </li>
              ))}
            </ul>
            <a href="#" className={`block text-center py-3 px-6 rounded-xl font-bold text-sm transition-all hover:opacity-90 ${plan.featured ? 'bg-white text-blue-700' : 'text-white'}`}
              style={!plan.featured ? { backgroundColor: accentColor } : {}}>
              {plan.cta}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
const PricingSettings = () => {
  const { actions: { setProp }, plan1Name, plan1Price, plan1Features, plan2Name, plan2Price, plan2Features, plan3Name, plan3Price, plan3Features, accentColor } = useNode(n => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-2">Plan 1</div>
      <SettingsRow><SettingsLabel label="Nom" /><SettingsInput value={plan1Name} onChange={(e: any) => setProp((p: any) => { p.plan1Name = e.target.value; })} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Prix" /><SettingsInput value={plan1Price} onChange={(e: any) => setProp((p: any) => { p.plan1Price = e.target.value; })} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Fonctionnalités (1/ligne)" /><SettingsTextarea rows={4} value={plan1Features} onChange={(e: any) => setProp((p: any) => { p.plan1Features = e.target.value; })} /></SettingsRow>
      <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mt-2">Plan 2 (Populaire)</div>
      <SettingsRow><SettingsLabel label="Nom" /><SettingsInput value={plan2Name} onChange={(e: any) => setProp((p: any) => { p.plan2Name = e.target.value; })} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Prix" /><SettingsInput value={plan2Price} onChange={(e: any) => setProp((p: any) => { p.plan2Price = e.target.value; })} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Fonctionnalités (1/ligne)" /><SettingsTextarea rows={4} value={plan2Features} onChange={(e: any) => setProp((p: any) => { p.plan2Features = e.target.value; })} /></SettingsRow>
      <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-2">Plan 3</div>
      <SettingsRow><SettingsLabel label="Nom" /><SettingsInput value={plan3Name} onChange={(e: any) => setProp((p: any) => { p.plan3Name = e.target.value; })} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Prix" /><SettingsInput value={plan3Price} onChange={(e: any) => setProp((p: any) => { p.plan3Price = e.target.value; })} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Fonctionnalités (1/ligne)" /><SettingsTextarea rows={4} value={plan3Features} onChange={(e: any) => setProp((p: any) => { p.plan3Features = e.target.value; })} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Couleur accent" /><SettingsColor value={accentColor} onChange={(e: any) => setProp((p: any) => { p.accentColor = e.target.value; })} /></SettingsRow>
    </div>
  );
};
PricingBlock.craft = { displayName: 'Tarification', props: { plan1Name: 'Essentiel', plan1Price: '199', plan1Period: 'mois', plan1Features: 'Audit de base\nRapport PDF\nSupport email', plan1Cta: 'Choisir', plan2Name: 'Professionnel', plan2Price: '499', plan2Period: 'mois', plan2Features: 'Audit complet\nRapport détaillé\nSupport prioritaire\nFormation équipe', plan2Cta: 'Choisir', plan2Featured: true, plan3Name: 'Entreprise', plan3Price: 'Sur devis', plan3Period: '', plan3Features: 'Audit multi-sites\nRapport personnalisé\nSupport dédié\nFormation + Suivi', plan3Cta: 'Contacter', accentColor: '#2563eb' }, related: { settings: PricingSettings } };

// ─────────────────────────────────────────────
// 15. ACCORDION / FAQ BLOCK
// ─────────────────────────────────────────────
const DEFAULT_FAQ = [
  { q: "Quels types d'audits réalisez-vous ?", a: "Nous réalisons des audits électriques complets conformes aux normes NF C 15-100." },
  { q: "Quelle est la durée d'un audit ?", a: "Comptez une demi-journée pour un logement et une journée pour un local professionnel." },
  { q: "Comment obtenir un devis ?", a: "Contactez-nous via notre formulaire. Nous répondons dans les 24h avec un devis personnalisé." },
];
export const AccordionBlock = (props: any) => {
  const { title = 'Questions Fréquentes', items = DEFAULT_FAQ, accentColor = '#2563eb' } = props;
  const { connectors: { connect, drag } } = useNode();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const universal = getUniversalStyles(props);
  return (
    <div
      ref={ref => { if (ref) connect(drag(ref)); }}
      style={universal.style}
      className={`w-full py-12 px-8 bg-white proquelec-builder-node ${universal.className}`}
    >
      <div className="max-w-3xl mx-auto">
        {title && <h3 className="text-3xl font-black text-slate-900 mb-8 text-center">{title}</h3>}
        <div className="space-y-3">
          {items.map((item: any, i: number) => (
            <div key={i} className={`border rounded-xl overflow-hidden transition-all ${openIndex === i ? 'border-blue-200 shadow-sm' : 'border-slate-100'}`}>
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors">
                <span className="font-semibold text-slate-800 text-sm">{item.q}</span>
                <span className="text-xl shrink-0 ml-3" style={{ color: accentColor, transform: openIndex === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>+</span>
              </button>
              {openIndex === i && <div className="px-6 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-50">{item.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
const AccordionSettings = () => {
  const { actions: { setProp }, title, accentColor } = useNode(n => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <SettingsRow><SettingsLabel label="Titre de section" /><SettingsInput value={title} onChange={(e: any) => setProp((p: any) => { p.title = e.target.value; })} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Couleur accent" /><SettingsColor value={accentColor} onChange={(e: any) => setProp((p: any) => { p.accentColor = e.target.value; })} /></SettingsRow>
    </div>
  );
};
AccordionBlock.craft = { displayName: 'Accordéon FAQ', props: { title: 'Questions Fréquentes', items: DEFAULT_FAQ, accentColor: '#2563eb' }, related: { settings: AccordionSettings } };

// ─────────────────────────────────────────────
// 16. ICON BOX BLOCK
// ─────────────────────────────────────────────
export const IconBoxBlock = (props: any) => {
  const { icon = '⚡', title = 'Expertise Électrique', text = "Notre équipe certifiée intervient sur tous types d'installations électriques.", layout = 'top', accentColor = '#2563eb', backgroundColor = '#ffffff', textColor = '#0f172a' } = props;
  const { connectors: { connect, drag } } = useNode();
  const isLeft = layout === 'left';
  const universal = getUniversalStyles(props);
  return (
    <div
      ref={ref => { if (ref) connect(drag(ref)); }}
      style={{ backgroundColor, ...universal.style }}
      className={`w-full p-8 rounded-2xl proquelec-builder-node ${universal.className} ${isLeft ? 'flex items-start gap-6' : 'text-center'}`}
    >
      <div className={`text-4xl ${isLeft ? 'shrink-0' : 'mb-4'}`}>{icon}</div>
      <div>
        <h4 style={{ color: accentColor }} className="font-black text-lg mb-2">{title}</h4>
        <p style={{ color: textColor }} className="text-sm leading-relaxed opacity-80">{text}</p>
      </div>
    </div>
  );
};
const IconBoxSettings = () => {
  const { actions: { setProp }, icon, title, text, layout, accentColor, backgroundColor } = useNode(n => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <SettingsRow><SettingsLabel label="Icône (emoji)" /><SettingsInput value={icon} onChange={(e: any) => setProp((p: any) => { p.icon = e.target.value; })} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Titre" /><SettingsInput value={title} onChange={(e: any) => setProp((p: any) => { p.title = e.target.value; })} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Description" /><SettingsTextarea value={text} onChange={(e: any) => setProp((p: any) => { p.text = e.target.value; })} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Disposition" /><SettingsSelect value={layout} onChange={(e: any) => setProp((p: any) => { p.layout = e.target.value; })} options={[{ value: 'top', label: 'Icône au-dessus' }, { value: 'left', label: 'Icône à gauche' }]} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Couleur accent" /><SettingsColor value={accentColor} onChange={(e: any) => setProp((p: any) => { p.accentColor = e.target.value; })} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Fond" /><SettingsColor value={backgroundColor} onChange={(e: any) => setProp((p: any) => { p.backgroundColor = e.target.value; })} /></SettingsRow>
    </div>
  );
};
IconBoxBlock.craft = { displayName: 'IconBox', props: { icon: '⚡', title: 'Expertise Électrique', text: "Notre équipe certifiée intervient sur tous types d'installations électriques.", layout: 'top', accentColor: '#2563eb', backgroundColor: '#ffffff', textColor: '#0f172a' }, related: { settings: IconBoxSettings } };

// ─────────────────────────────────────────────
// 17. COUNTER BLOCK
// ─────────────────────────────────────────────
export const CounterBlock = (props: any) => {
  const { value = '500', suffix = '+', label = 'Clients satisfaits', accentColor = '#2563eb', backgroundColor = '#f8fafc' } = props;
  const { connectors: { connect, drag } } = useNode();
  const universal = getUniversalStyles(props);
  return (
    <div
      ref={ref => { if (ref) connect(drag(ref)); }}
      style={{ backgroundColor, ...universal.style }}
      className={`w-full py-12 px-8 text-center proquelec-builder-node ${universal.className}`}
    >
      <div style={{ color: accentColor }} className="text-7xl font-black mb-2 tabular-nums">{value}{suffix}</div>
      <div className="text-slate-500 text-base font-medium">{label}</div>
    </div>
  );
};
const CounterSettings = () => {
  const { actions: { setProp }, value, suffix, label, accentColor, backgroundColor } = useNode(n => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <SettingsRow><SettingsLabel label="Valeur" /><SettingsInput value={value} onChange={(e: any) => setProp((p: any) => { p.value = e.target.value; })} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Suffixe" /><SettingsInput value={suffix} onChange={(e: any) => setProp((p: any) => { p.suffix = e.target.value; })} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Label" /><SettingsInput value={label} onChange={(e: any) => setProp((p: any) => { p.label = e.target.value; })} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Couleur" /><SettingsColor value={accentColor} onChange={(e: any) => setProp((p: any) => { p.accentColor = e.target.value; })} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Fond" /><SettingsColor value={backgroundColor} onChange={(e: any) => setProp((p: any) => { p.backgroundColor = e.target.value; })} /></SettingsRow>
    </div>
  );
};
CounterBlock.craft = { displayName: 'Compteur', props: { value: '500', suffix: '+', label: 'Clients satisfaits', accentColor: '#2563eb', backgroundColor: '#f8fafc' }, related: { settings: CounterSettings } };

const DEFAULT_GALLERY = [
  'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80',
  'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&q=80',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80'
];

// ─────────────────────────────────────────────
// 18. GALLERY BLOCK
// ─────────────────────────────────────────────
export const GalleryBlock = (props: any) => {
  const { columns = 3, gap = 16, images = DEFAULT_GALLERY, rounded = 8 } = props;
  const { connectors: { connect, drag } } = useNode();
  const universal = getUniversalStyles(props);
  return (
    <div
      ref={ref => { if (ref) connect(drag(ref)); }}
      style={universal.style}
      className={`w-full py-8 px-8 proquelec-builder-node ${universal.className}`}
    >
      <div className="grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: `${gap}px` }}>
        {images.map((src: string, i: number) => (
          <div key={i} className="overflow-hidden" style={{ borderRadius: `${rounded}px` }}>
            <img src={src} alt={`Galerie ${i + 1}`} className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
};
const GallerySettings = () => {
  const { actions: { setProp }, columns, gap, rounded } = useNode(n => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <SettingsRow><SettingsLabel label="Colonnes" /><SettingsSelect value={String(columns)} onChange={(e: any) => setProp((p: any) => { p.columns = parseInt(e.target.value); })} options={[{ value: '2', label: '2 colonnes' }, { value: '3', label: '3 colonnes' }, { value: '4', label: '4 colonnes' }]} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Espacement (px)" /><SettingsInput type="number" min={0} max={40} value={gap} onChange={(e: any) => setProp((p: any) => { p.gap = parseInt(e.target.value); })} /></SettingsRow>
      <SettingsRow><SettingsLabel label="Arrondi (px)" /><SettingsInput type="number" min={0} max={32} value={rounded} onChange={(e: any) => setProp((p: any) => { p.rounded = parseInt(e.target.value); })} /></SettingsRow>
    </div>
  );
};
GalleryBlock.craft = { displayName: 'Galerie', props: { columns: 3, gap: 16, rounded: 8, images: DEFAULT_GALLERY }, related: { settings: GallerySettings } };

// ─────────────────────────────────────────────
// 19. HTML BLOCK
// ─────────────────────────────────────────────
const LazyMonacoEditor = lazy(() => import('@monaco-editor/react'));

export const HtmlBlock = (props: any) => {
  const { html = '<div class="p-6 bg-slate-900/50 rounded-xl border border-slate-800 text-center"><p class="text-slate-400">Bloc HTML personnalisé. Cliquez sur modifier dans le panneau de droite.</p></div>', padding = 10, hideLabel = false } = props;
  const { id, connectors: { connect, drag }, selected, actions: { setProp } } = useNode();
  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));

  const cleanHtml = React.useMemo(() => {
    return DOMPurify.sanitize(html || '', {
      ADD_TAGS: ['iframe', 'style', 'link', 'meta', 'div', 'section', 'span', 'svg', 'path'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'target', 'class', 'style', 'data-aos', 'd', 'viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'],
    });
  }, [html]);

  const universal = getUniversalStyles(props);

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)); }}
      data-htmlblock
      data-nodeid={id}
      className={`relative ${selected && enabled ? 'craft-selected' : ''}`}
    >
      {/* Barre de sélection visible uniquement dans le builder */}
      {enabled && !hideLabel && (
        <div
          className={`h-5 flex items-center gap-1.5 px-2 cursor-pointer select-none transition-colors ${
            selected
              ? 'bg-indigo-600/80 text-white'
              : 'bg-[#1a1a2e]/70 text-slate-500 hover:bg-[#252538] hover:text-slate-400'
          }`}
          style={{ borderBottom: selected ? 'none' : '1px solid rgba(99,102,241,0.1)' }}
          title="Cliquer pour sélectionner ce bloc"
        >
          <svg className="w-2.5 h-2.5 opacity-50" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="3" cy="3" r="1.5"/>
            <circle cx="9" cy="3" r="1.5"/>
            <circle cx="3" cy="9" r="1.5"/>
            <circle cx="9" cy="9" r="1.5"/>
          </svg>
          <span className="text-[9px] font-medium tracking-wider opacity-70">Bloc HTML</span>
          {selected && <span className="text-[8px] font-mono opacity-40 ml-auto">{id.slice(0,8)}</span>}
        </div>
      )}
      {/* Contenu HTML - pointer-events: none dans le builder pour forcer la sélection du bloc */}
      <div
        style={{ padding: `${padding}px`, ...universal.style }}
        className={`w-full relative min-h-[40px] prose prose-slate max-w-none dark:prose-invert ${universal.className} ${enabled ? 'pointer-events-none' : ''}`}
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    </div>
  );
};

const HtmlSettings = () => {
  const { id, actions: { setProp }, html, padding, hideLabel } = useNode(n => ({
    html: n.data.props.html,
    padding: n.data.props.padding,
    hideLabel: n.data.props.hideLabel
  }));
  const [open, setOpen] = useState(false);
  const [localHtml, setLocalHtml] = useState('');
  const editorRef = useRef<any>(null);

  // Sync localHtml when node changes (id) or html prop changes
  useEffect(() => {
    setLocalHtml(html || '');
  }, [id, html]);

  const handleApply = () => {
    setProp((p: any) => { p.html = localHtml; });
    setOpen(false);
    toast.success('Code HTML appliqué avec succès');
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  const handleExport = () => {
    navigator.clipboard.writeText(localHtml);
    toast.info('Code HTML copié dans le presse-papier');
  };

  const handleImport = () => {
    const input = prompt('Collez votre code HTML ici pour écraser le contenu actuel :');
    if (input !== null) {
      setLocalHtml(input);
      toast.success('Code HTML importé localement. Cliquez sur Appliquer pour enregistrer.');
    }
  };

  return (
    <div className="space-y-3">
      <SettingsRow>
        <SettingsLabel label="Espacement (padding px)" />
        <SettingsInput type="number" min={0} max={100} value={padding} onChange={(e: any) => setProp((p: any) => { p.padding = parseInt(e.target.value); })} />
      </SettingsRow>

      <SettingsRow>
        <SettingsLabel label="Masquer la barre de titre" />
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={hideLabel}
            onChange={(e) => setProp((p: any) => { p.hideLabel = e.target.checked; })}
            className="rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
          />
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <EyeOff size={12} className="text-slate-500" />
            Cacher la barre dans le builder
          </span>
        </label>
      </SettingsRow>

      <SettingsRow>
        <SettingsLabel label="Contenu HTML" />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 font-bold py-2 mt-1">
              <Code2 size={14} />
              Modifier le code HTML
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-[90vw] h-[85vh] bg-[#0c0c14] border border-[#252538] text-white flex flex-col p-6 rounded-xl shadow-2xl">
            <DialogHeader className="flex flex-row items-center justify-between border-b border-[#252538] pb-3">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                  <Code2 size={20} className="text-indigo-400" />
                  Éditeur de Code HTML
                </DialogTitle>
                <p className="text-xs text-slate-500 mt-1">Modifiez le contenu HTML du bloc. Tout le code (scripts exclus) sera sécurisé et appliqué.</p>
              </div>
            </DialogHeader>

            <div className="flex-1 min-h-0 bg-[#07070a] border border-[#252538] rounded-lg overflow-hidden mt-4 relative">
              <Suspense fallback={
                <div className="absolute inset-0 flex items-center justify-center text-slate-500 bg-[#07070a]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-2 mr-3" />
                  <span>Chargement de Monaco Editor...</span>
                </div>
              }>
                <LazyMonacoEditor
                  height="100%"
                  language="html"
                  theme="vs-dark"
                  value={localHtml}
                  onChange={(val) => setLocalHtml(val || '')}
                  onMount={handleEditorDidMount}
                  options={{
                    minimap: { enabled: true },
                    fontSize: 13,
                    wordWrap: 'on',
                    automaticLayout: true,
                    formatOnPaste: true,
                    formatOnType: true,
                  }}
                />
              </Suspense>
            </div>

            <div className="flex items-center justify-between border-t border-[#252538] pt-4 mt-4 shrink-0">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleFormat} className="border-[#252538] bg-[#161624] text-slate-300 hover:text-white hover:bg-[#252538] flex items-center gap-1.5 font-semibold">
                  <Sparkles size={13} className="text-indigo-400" />
                  Beautifier
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport} className="border-[#252538] bg-[#161624] text-slate-300 hover:text-white hover:bg-[#252538] flex items-center gap-1.5 font-semibold">
                  <Download size={13} className="text-emerald-400" />
                  Exporter
                </Button>
                <Button variant="outline" size="sm" onClick={handleImport} className="border-[#252538] bg-[#161624] text-slate-300 hover:text-white hover:bg-[#252538] flex items-center gap-1.5 font-semibold">
                  <Upload size={13} className="text-amber-400" />
                  Importer
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setOpen(false)} className="border-[#252538] bg-transparent text-slate-400 hover:text-white hover:bg-[#161624]">
                  Annuler
                </Button>
                <Button onClick={handleApply} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-6">
                  Appliquer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </SettingsRow>
    </div>
  );
};

HtmlBlock.craft = {
  displayName: 'Code HTML',
  props: {
    html: '<div class="p-6 bg-slate-900/50 rounded-xl border border-slate-800 text-center"><p class="text-slate-400">Bloc HTML personnalisé. Cliquez sur modifier dans le panneau de droite.</p></div>',
    padding: 10,
    hideLabel: false
  },
  related: {
    settings: HtmlSettings
  }
};

// ─────────────────────────────────────────────
// 20. TABS BLOCK
// ─────────────────────────────────────────────
export const TabsBlock = (props: any) => {
  const { tabsCount = 3, tabTitles = 'Onglet 1, Onglet 2, Onglet 3' } = props;
  const [activeTab, setActiveTab] = useState(0);
  const { connectors: { connect, drag } } = useNode();
  const titles = tabTitles.split(',').map((t: string) => t.trim());
  const universal = getUniversalStyles(props);

  return (
    <div
      ref={ref => { if (ref) connect(drag(ref)); }}
      style={universal.style}
      className={`w-full p-6 border border-slate-200 rounded-xl bg-white shadow-sm proquelec-builder-node ${universal.className}`}
    >
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto gap-2 scrollbar-none">
        {Array.from({ length: tabsCount }).map((_, index) => {
          const title = titles[index] || `Onglet ${index + 1}`;
          return (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`py-2.5 px-5 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${activeTab === index ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            >
              {title}
            </button>
          );
        })}
      </div>

      <div className="relative">
        <div className={activeTab === 0 ? 'block' : 'hidden'}>
          <Element id="tab_pane_1" is={ContainerBlock} canvas padding={16}>
            <TextBlock text="Contenu de l'onglet 1 — Glissez vos blocs ici" />
          </Element>
        </div>
        <div className={activeTab === 1 ? 'block' : 'hidden'}>
          <Element id="tab_pane_2" is={ContainerBlock} canvas padding={16}>
            <TextBlock text="Contenu de l'onglet 2 — Glissez vos blocs ici" />
          </Element>
        </div>
        <div className={activeTab === 2 ? 'block' : 'hidden'}>
          <Element id="tab_pane_3" is={ContainerBlock} canvas padding={16}>
            <TextBlock text="Contenu de l'onglet 3 — Glissez vos blocs ici" />
          </Element>
        </div>
        {tabsCount > 3 && (
          <div className={activeTab === 3 ? 'block' : 'hidden'}>
            <Element id="tab_pane_4" is={ContainerBlock} canvas padding={16}>
              <TextBlock text="Contenu de l'onglet 4 — Glissez vos blocs ici" />
            </Element>
          </div>
        )}
      </div>
    </div>
  );
};

const TabsSettings = () => {
  const { actions: { setProp }, tabsCount, tabTitles } = useNode(n => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <SettingsRow>
        <SettingsLabel label="Nombre d'onglets" />
        <SettingsSelect value={String(tabsCount)} onChange={(e: any) => setProp((p: any) => p.tabsCount = parseInt(e.target.value))} options={[
          { value: '2', label: '2' },
          { value: '3', label: '3' },
          { value: '4', label: '4' }
        ]} />
      </SettingsRow>
      <SettingsRow>
        <SettingsLabel label="Titres (séparés par des virgules)" />
        <SettingsInput value={tabTitles} onChange={(e: any) => setProp((p: any) => p.tabTitles = e.target.value)} />
      </SettingsRow>
    </div>
  );
};

TabsBlock.craft = {
  displayName: 'Onglets',
  props: { tabsCount: 3, tabTitles: 'Onglet 1, Onglet 2, Onglet 3' },
  related: { settings: TabsSettings }
};

// ─────────────────────────────────────────────
// 21. CAROUSEL BLOCK
// ─────────────────────────────────────────────
export const CarouselBlock = (props: any) => {
  const {
    images = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800,https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800,https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
    autoplay = true,
    interval = 4000
  } = props;
  const { connectors: { connect, drag } } = useNode();
  const imgList = images.split(',').map((img: string) => img.trim()).filter(Boolean);
  const [currentIndex, setCurrentIndex] = useState(0);
  const universal = getUniversalStyles(props);

  useEffect(() => {
    if (!autoplay || imgList.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imgList.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoplay, interval, imgList.length]);

  return (
    <div
      ref={ref => { if (ref) connect(drag(ref)); }}
      style={universal.style}
      className={`w-full overflow-hidden relative rounded-xl shadow-lg proquelec-builder-node ${universal.className}`}
    >
      {imgList.length === 0 ? (
        <div className="bg-slate-800 text-slate-400 py-20 text-center text-sm">Aucune image dans le carrousel</div>
      ) : (
        <div className="relative aspect-[21/9] bg-slate-900 flex items-center justify-center">
          <img src={imgList[currentIndex]} className="w-full h-full object-cover transition-all duration-700 ease-in-out" />

          {imgList.length > 1 && (
            <>
              <button
                onClick={() => setCurrentIndex((currentIndex - 1 + imgList.length) % imgList.length)}
                className="absolute left-4 z-10 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full text-sm font-bold transition-all hover:scale-105"
              >
                ◀
              </button>
              <button
                onClick={() => setCurrentIndex((currentIndex + 1) % imgList.length)}
                className="absolute right-4 z-10 w-8 h-8 flex items-center justify-center bg-black/40 hover:bg-black/60 text-white rounded-full text-sm font-bold transition-all hover:scale-105"
              >
                ▶
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {imgList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${currentIndex === idx ? 'bg-white scale-125' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CarouselSettings = () => {
  const { actions: { setProp }, images, autoplay, interval } = useNode(n => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <SettingsRow>
        <SettingsLabel label="URLs des images (séparées par des virgules)" />
        <SettingsTextarea rows={4} value={images} onChange={(e: any) => setProp((p: any) => p.images = e.target.value)} />
      </SettingsRow>
      <SettingsRow>
        <SettingsLabel label="Autoplay" />
        <SettingsSelect value={String(autoplay)} onChange={(e: any) => setProp((p: any) => p.autoplay = e.target.value === 'true')} options={[
          { value: 'true', label: 'Oui' },
          { value: 'false', label: 'Non' }
        ]} />
      </SettingsRow>
      <SettingsRow>
        <SettingsLabel label="Intervalle (ms)" />
        <SettingsInput type="number" step={500} value={interval} onChange={(e: any) => setProp((p: any) => p.interval = parseInt(e.target.value))} />
      </SettingsRow>
    </div>
  );
};

CarouselBlock.craft = {
  displayName: 'Carrousel',
  props: {
    images: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800,https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800,https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
    autoplay: true,
    interval: 4000
  },
  related: { settings: CarouselSettings }
};

// ─────────────────────────────────────────────
// 22. PROGRESS BAR BLOCK
// ─────────────────────────────────────────────
export const ProgressBarBlock = (props: any) => {
  const { label = 'Indicateur de progrès', percentage = 75, barColor = '#4f46e5', trackColor = '#e2e8f0', textColor = '#334155' } = props;
  const { connectors: { connect, drag } } = useNode();
  const universal = getUniversalStyles(props);

  return (
    <div
      ref={ref => { if (ref) connect(drag(ref)); }}
      style={universal.style}
      className={`w-full py-3 px-1 proquelec-builder-node ${universal.className}`}
    >
      <div className="flex justify-between items-center mb-1.5 text-sm font-bold" style={{ color: textColor }}>
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: trackColor }}>
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
};

const ProgressBarSettings = () => {
  const { actions: { setProp }, label, percentage, barColor, trackColor } = useNode(n => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <SettingsRow>
        <SettingsLabel label="Label" />
        <SettingsInput value={label} onChange={(e: any) => setProp((p: any) => p.label = e.target.value)} />
      </SettingsRow>
      <SettingsRow>
        <SettingsLabel label="Pourcentage" />
        <SettingsInput type="number" min={0} max={100} value={percentage} onChange={(e: any) => setProp((p: any) => p.percentage = parseInt(e.target.value))} />
      </SettingsRow>
      <SettingsRow>
        <SettingsLabel label="Couleur de la barre" />
        <SettingsColor value={barColor} onChange={(e: any) => setProp((p: any) => p.barColor = e.target.value)} />
      </SettingsRow>
      <SettingsRow>
        <SettingsLabel label="Couleur de la piste" />
        <SettingsColor value={trackColor} onChange={(e: any) => setProp((p: any) => p.trackColor = e.target.value)} />
      </SettingsRow>
    </div>
  );
};

ProgressBarBlock.craft = {
  displayName: 'Barre de Progrès',
  props: { label: 'Indicateur de progrès', percentage: 75, barColor: '#4f46e5', trackColor: '#e2e8f0', textColor: '#334155' },
  related: { settings: ProgressBarSettings }
};

// ─────────────────────────────────────────────
// 23. ALERT BLOCK
// ─────────────────────────────────────────────
export const AlertBlock = (props: any) => {
  const {
    type = 'info',
    title = 'Information importante',
    message = 'Ceci est un message d\'information à destination des utilisateurs.',
  } = props;
  const { id, connectors: { connect, drag } } = useNode();

  const isEnabled = useEditor(state => state.options.enabled);
  const isLocked = useBuilderUiStore(state => state.lockedNodes[id]);
  const isHidden = useBuilderUiStore(state => state.hiddenNodes[id]);

  const universal = getUniversalStyles(props);

  if (isHidden && !isEnabled) return null;

  const resolvedTitle = resolveDynamicContent(title);
  const resolvedMessage = resolveDynamicContent(message);

  const config: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    info: { bg: 'bg-blue-50/80', border: 'border-blue-200', text: 'text-blue-800', icon: 'ℹ️' },
    success: { bg: 'bg-emerald-50/80', border: 'border-emerald-200', text: 'text-emerald-800', icon: '✅' },
    warning: { bg: 'bg-amber-50/80', border: 'border-amber-200', text: 'text-amber-800', icon: '⚠️' },
    danger: { bg: 'bg-rose-50/80', border: 'border-rose-200', text: 'text-rose-800', icon: '🚨' },
  };

  const style = config[type] || config.info;

  return (
    <div
      ref={ref => { if (ref) connect(isLocked ? ref : drag(ref)); }}
      style={{
        ...universal.style,
        opacity: isHidden ? 0.35 : universal.style.opacity,
        border: isHidden ? '1px dashed #ef4444' : undefined,
      }}
      className={`w-full p-4 border rounded-xl ${style.bg} ${style.border} ${style.text} flex gap-3 proquelec-builder-node ${universal.className}`}
    >
      <span className="text-xl shrink-0 leading-none">{style.icon}</span>
      <div>
        {resolvedTitle && <div className="font-bold text-sm mb-0.5">{resolvedTitle}</div>}
        <div className="text-xs leading-relaxed opacity-95">{resolvedMessage}</div>
      </div>
    </div>
  );
};

const AlertSettings = () => {
  const { actions: { setProp }, type, title, message } = useNode(n => ({ ...n.data.props }));
  return (
    <div className="space-y-3">
      <SettingsRow>
        <SettingsLabel label="Type d'alerte" />
        <SettingsSelect value={type} onChange={(e: any) => setProp((p: any) => p.type = e.target.value)} options={[
          { value: 'info', label: 'Info' },
          { value: 'success', label: 'Succès' },
          { value: 'warning', label: 'Avertissement' },
          { value: 'danger', label: 'Danger' }
        ]} />
      </SettingsRow>
      <SettingsRow>
        <SettingsLabel label="Titre" />
        <SettingsInput value={title} onChange={(e: any) => setProp((p: any) => p.title = e.target.value)} />
      </SettingsRow>
      <SettingsRow>
        <SettingsLabel label="Message" />
        <SettingsTextarea rows={3} value={message} onChange={(e: any) => setProp((p: any) => p.message = e.target.value)} />
      </SettingsRow>
    </div>
  );
};

AlertBlock.craft = {
  displayName: 'Alerte',
  props: { type: 'info', title: 'Information importante', message: 'Ceci est un message d\'information à destination des utilisateurs.' },
  related: { settings: AlertSettings }
};

export { getUniversalStyles };
