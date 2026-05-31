import React, { useState, useEffect } from 'react';
import { useEditor } from '@craftjs/core';
import {
  Trash2,
  FileText,
  Settings,
  Globe,
  Copy,
  ArrowUp,
  ArrowDown,
  Layers,
  AlignLeft,
  Type,
  Palette,
  Box,
  Sparkles,
  Code2,
  ChevronDown,
} from 'lucide-react';
import { useGodEditor } from './GodEditorContext';
import { useBuilderThemeStore } from '@/stores/builder-theme.store';
import { useBuilderUiStore } from '@/stores/builder-ui.store';
import { useFontsStore } from '@/stores/fonts.store';

// ─────────────────────────────────────────────────────────
// TAB BUTTON
// ─────────────────────────────────────────────────────────
const TabBtn = ({ label, icon: Icon, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-1 py-2 text-[11px] font-bold uppercase tracking-wider transition-all ${
      active
        ? 'text-white border-b-2 border-indigo-500 bg-[#1a1a2e]'
        : 'text-slate-500 hover:text-slate-300 border-b-2 border-transparent hover:bg-[#1a1a2e]/50'
    }`}
  >
    <Icon size={11} />
    {label}
  </button>
);

// ─────────────────────────────────────────────────────────
// SHARED STYLE SETTINGS (margin, padding, border, shadow)
// ─────────────────────────────────────────────────────────
export const SharedStylePanel = ({ nodeProps, setProp }: { nodeProps: any; setProp: any }) => {
  const [openSection, setOpenSection] = useState<string | null>('spacing');
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  useEffect(() => {
    const handler = (e: CustomEvent) => setViewport(e.detail as any);
    window.addEventListener('god-viewport-change', handler as any);
    return () => window.removeEventListener('god-viewport-change', handler as any);
  }, []);

  const toggle = (s: string) => setOpenSection((prev) => (prev === s ? null : s));

  const Section = ({ id, title, children }: any) => (
    <div className="border border-[#252538] rounded-lg overflow-hidden mb-2">
      <button
        onClick={() => toggle(id)}
        className="w-full flex items-center justify-between px-3 py-2 bg-[#151521] text-left"
      >
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
          {title}
        </span>
        <ChevronDown
          size={12}
          className={`text-slate-500 transition-transform ${openSection === id ? 'rotate-180' : ''}`}
        />
      </button>
      {openSection === id && <div className="px-3 py-3 space-y-3 bg-[#0d0d1a]/50">{children}</div>}
    </div>
  );

  const FourSideInput = ({ label, keys }: { label: string; keys: string[] }) => {
    const getValue = (key: string) => {
      const val = nodeProps[key];
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        return val[viewport] ?? '';
      }
      if (viewport === 'desktop') {
        return val ?? '';
      }
      return '';
    };

    const setValue = (key: string, numValue: number) => {
      setProp((p: any) => {
        const current = p[key];
        if (current && typeof current === 'object' && !Array.isArray(current)) {
          p[key] = {
            ...current,
            [viewport]: numValue,
          };
        } else {
          // Convert flat simple value to responsive object
          p[key] = {
            desktop: viewport === 'desktop' ? numValue : (current ?? 0),
            tablet: viewport === 'tablet' ? numValue : 0,
            mobile: viewport === 'mobile' ? numValue : 0,
            [viewport]: numValue,
          };
        }
      });
    };

    const deviceIcon = {
      desktop: '🖥️',
      tablet: '📱 Tab',
      mobile: '📱 Mob',
    }[viewport];

    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-[10px] text-slate-500 uppercase tracking-wider">
            {label}
          </label>
          <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1 py-0.5 rounded font-mono font-bold uppercase">
            {deviceIcon}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {['↑', '→', '↓', '←'].map((dir, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span className="text-[9px] text-slate-600">{dir}</span>
              <input
                type="number"
                placeholder="-"
                value={getValue(keys[i])}
                onChange={(e) => setValue(keys[i], parseInt(e.target.value) || 0)}
                className="w-full bg-[#151521] border border-[#252538] text-slate-200 rounded px-1 py-1 text-[11px] focus:outline-none focus:border-indigo-500 text-center"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Responsive single-value input ──
  const ResponsiveNumberInput = ({
    label,
    propKey,
    min,
    max,
    step,
  }: {
    label: string;
    propKey: string;
    min?: number;
    max?: number;
    step?: number;
  }) => {
    const getValue = () => {
      const val = nodeProps[propKey];
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        return val[viewport] ?? '';
      }
      return viewport === 'desktop' ? (val ?? '') : '';
    };
    const setValue = (numValue: number) => {
      setProp((p: any) => {
        const current = p[propKey];
        if (current && typeof current === 'object' && !Array.isArray(current)) {
          p[propKey] = { ...current, [viewport]: numValue };
        } else {
          p[propKey] = {
            desktop: viewport === 'desktop' ? numValue : (current ?? step === 1) ? 0 : '',
            tablet: viewport === 'tablet' ? numValue : 0,
            mobile: viewport === 'mobile' ? numValue : 0,
            [viewport]: numValue,
          };
        }
      });
    };
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
          <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1 py-0.5 rounded font-mono font-bold uppercase">
            {viewport}
          </span>
        </div>
        <input
          type="number"
          min={min}
          max={max}
          step={step ?? 1}
          value={getValue()}
          onChange={(e) => setValue(parseInt(e.target.value) || 0)}
          className="w-full bg-[#151521] border border-[#252538] text-slate-200 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:border-indigo-500 text-center"
        />
      </div>
    );
  };

  const ResponsiveSelect = ({
    label,
    propKey,
    options,
  }: {
    label: string;
    propKey: string;
    options: { value: string; label: string }[];
  }) => {
    const getValue = () => {
      const val = nodeProps[propKey];
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        return val[viewport] ?? '';
      }
      return viewport === 'desktop' ? (val ?? '') : '';
    };
    const setValue = (newVal: string) => {
      setProp((p: any) => {
        const current = p[propKey];
        if (current && typeof current === 'object' && !Array.isArray(current)) {
          p[propKey] = { ...current, [viewport]: newVal };
        } else {
          p[propKey] = {
            desktop: viewport === 'desktop' ? newVal : (current ?? ''),
            tablet: viewport === 'tablet' ? newVal : '',
            mobile: viewport === 'mobile' ? newVal : '',
            [viewport]: newVal,
          };
        }
      });
    };
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
          <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1 py-0.5 rounded font-mono font-bold uppercase">
            {viewport}
          </span>
        </div>
        <select
          value={getValue()}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-[#151521] border border-[#252538] text-slate-200 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:border-indigo-500"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  };

  const ResponsiveTextInput = ({
    label,
    propKey,
    placeholder,
  }: {
    label: string;
    propKey: string;
    placeholder?: string;
  }) => {
    const getValue = () => {
      const val = nodeProps[propKey];
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        return val[viewport] ?? '';
      }
      return viewport === 'desktop' ? (val ?? '') : '';
    };
    const setValue = (newVal: string) => {
      setProp((p: any) => {
        const current = p[propKey];
        if (current && typeof current === 'object' && !Array.isArray(current)) {
          p[propKey] = { ...current, [viewport]: newVal };
        } else {
          p[propKey] = {
            desktop: viewport === 'desktop' ? newVal : (current ?? ''),
            tablet: viewport === 'tablet' ? newVal : '',
            mobile: viewport === 'mobile' ? newVal : '',
            [viewport]: newVal,
          };
        }
      });
    };
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
          <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1 py-0.5 rounded font-mono font-bold uppercase">
            {viewport}
          </span>
        </div>
        <input
          type="text"
          value={getValue()}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-[#151521] border border-[#252538] text-slate-200 rounded px-2 py-1.5 text-[11px] font-mono focus:outline-none focus:border-indigo-500"
        />
      </div>
    );
  };

  const ResponsiveFontFamilyInput = ({
    nodeProps,
    setProp,
    viewport,
  }: {
    nodeProps: any;
    setProp: any;
    viewport: string;
  }) => {
    const fonts = useFontsStore((s) => s.fonts);
    const getValue = () => {
      const val = nodeProps.fontFamily;
      if (val && typeof val === 'object' && !Array.isArray(val)) return val[viewport] ?? '';
      return viewport === 'desktop' ? (val ?? '') : '';
    };
    const setValue = (newVal: string) => {
      setProp((p: any) => {
        const current = p.fontFamily;
        if (current && typeof current === 'object' && !Array.isArray(current)) {
          p.fontFamily = { ...current, [viewport]: newVal };
        } else {
          p.fontFamily =
            viewport === 'desktop' ? newVal : { desktop: current ?? '', [viewport]: newVal };
        }
      });
    };
    const activeFonts = fonts.filter((f) => f.active).map((f) => f.name);
    const systemFonts = [
      'Inter, sans-serif',
      'Arial, sans-serif',
      'Helvetica, sans-serif',
      'Georgia, serif',
      'Times New Roman, serif',
      'Courier New, monospace',
      'system-ui, sans-serif',
    ];
    const allFonts = [...new Set([...systemFonts, ...activeFonts])];
    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Police</span>
          <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-1 py-0.5 rounded font-mono font-bold uppercase">
            {viewport}
          </span>
        </div>
        <select
          value={getValue()}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-[#151521] border border-[#252538] text-slate-200 rounded px-2 py-1.5 text-[11px] focus:outline-none focus:border-indigo-500"
        >
          <option value="">Police par défaut</option>
          {allFonts.map((f) => (
            <option key={f} value={f} style={{ fontFamily: f }}>
              {f}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div>
      {/* Selector viewports in panel */}
      <div className="flex justify-end gap-1.5 mb-3 bg-[#0d0d1a] border border-[#252538] rounded-lg p-1">
        {(['desktop', 'tablet', 'mobile'] as const).map((vp) => (
          <button
            key={vp}
            onClick={() => {
              setViewport(vp);
              window.dispatchEvent(new CustomEvent('god-viewport-change', { detail: vp }));
            }}
            className={`flex-1 py-1 rounded text-center transition-all flex items-center justify-center gap-1 ${
              viewport === vp
                ? 'bg-indigo-500 text-white font-bold shadow-md shadow-indigo-900/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {vp === 'desktop' && '🖥️'}
              {vp === 'tablet' && '📱'}
              {vp === 'mobile' && '📱'}
              <span className="ml-1 text-[9px]">{vp}</span>
            </span>
          </button>
        ))}
      </div>

      <Section id="spacing" title="📐 Espacement">
        <FourSideInput
          label="Marge (margin)"
          keys={['marginTop', 'marginRight', 'marginBottom', 'marginLeft']}
        />
        <FourSideInput
          label="Rembourrage (padding)"
          keys={['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']}
        />
      </Section>

      <Section id="layout" title="📐 Layout">
        <ResponsiveSelect
          label="Affichage"
          propKey="display"
          options={[
            { value: 'block', label: 'Block' },
            { value: 'flex', label: 'Flexbox' },
            { value: 'grid', label: 'CSS Grid' },
            { value: 'inline', label: 'Inline' },
            { value: 'inline-block', label: 'Inline-Block' },
            { value: 'none', label: 'Aucun' },
          ]}
        />
        <ResponsiveSelect
          label="Direction Flex"
          propKey="flexDirection"
          options={[
            { value: 'row', label: 'Ligne (row)' },
            { value: 'row-reverse', label: 'Ligne inversée' },
            { value: 'column', label: 'Colonne' },
            { value: 'column-reverse', label: 'Colonne inversée' },
          ]}
        />
        <ResponsiveSelect
          label="Wrap Flex"
          propKey="flexWrap"
          options={[
            { value: 'nowrap', label: 'Sans retour' },
            { value: 'wrap', label: 'Retour ligne' },
            { value: 'wrap-reverse', label: 'Retour inversé' },
          ]}
        />
        <ResponsiveSelect
          label="Justify Content"
          propKey="justifyContent"
          options={[
            { value: 'flex-start', label: 'Début' },
            { value: 'flex-end', label: 'Fin' },
            { value: 'center', label: 'Centré' },
            { value: 'space-between', label: 'Entre éléments' },
            { value: 'space-around', label: 'Autour éléments' },
            { value: 'space-evenly', label: 'Équiréparti' },
          ]}
        />
        <ResponsiveSelect
          label="Align Items"
          propKey="alignItems"
          options={[
            { value: 'stretch', label: 'Étiré' },
            { value: 'flex-start', label: 'Début' },
            { value: 'flex-end', label: 'Fin' },
            { value: 'center', label: 'Centré' },
            { value: 'baseline', label: 'Ligne de base' },
          ]}
        />
        <ResponsiveNumberInput label="Espace (gap)" propKey="gap" min={0} max={200} />
        <div className="grid grid-cols-2 gap-2">
          <ResponsiveNumberInput label="Flex Grow" propKey="flexGrow" min={0} max={10} step={1} />
          <ResponsiveNumberInput
            label="Flex Shrink"
            propKey="flexShrink"
            min={0}
            max={10}
            step={1}
          />
        </div>
        <ResponsiveTextInput
          label="Flex Basis"
          propKey="flexBasis"
          placeholder="auto, 50%, 200px"
        />
        <ResponsiveNumberInput label="Ordre (order)" propKey="order" min={-10} max={10} step={1} />
        <ResponsiveSelect
          label="Align Self"
          propKey="alignSelf"
          options={[
            { value: 'auto', label: 'Auto' },
            { value: 'flex-start', label: 'Début' },
            { value: 'flex-end', label: 'Fin' },
            { value: 'center', label: 'Centré' },
            { value: 'baseline', label: 'Ligne base' },
            { value: 'stretch', label: 'Étiré' },
          ]}
        />
        <div className="border-t border-[#252538] my-2" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">
            Inverser ordre sur mobile
          </span>
          <button
            onClick={() =>
              setProp((p: any) => {
                p.reverseMobile = !p.reverseMobile;
              })
            }
            className={`text-[10px] font-bold px-2 py-1 rounded transition-all ${
              nodeProps.reverseMobile
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                : 'bg-[#151521] text-slate-500 border border-[#252538]'
            }`}
          >
            {nodeProps.reverseMobile ? 'ACTIF' : 'INACTIF'}
          </button>
        </div>
        <ResponsiveTextInput
          label="Grid Template Columns"
          propKey="gridTemplateColumns"
          placeholder="1fr 1fr, repeat(3,1fr)"
        />
        <ResponsiveTextInput
          label="Grid Template Rows"
          propKey="gridTemplateRows"
          placeholder="auto 1fr, 100px 200px"
        />
        <ResponsiveTextInput
          label="Place Items"
          propKey="placeItems"
          placeholder="center, stretch"
        />
      </Section>

      {/* Typography Section */}
      <Section id="typography" title="🔤 Typographie">
        <ResponsiveFontFamilyInput nodeProps={nodeProps} setProp={setProp} viewport={viewport} />
        <ResponsiveNumberInput label="Taille (px)" propKey="fontSize" min={0} max={200} />
        <ResponsiveSelect
          label="Poids"
          propKey="fontWeight"
          options={[
            { value: '100', label: 'Thin (100)' },
            { value: '200', label: 'Extra Light (200)' },
            { value: '300', label: 'Light (300)' },
            { value: '400', label: 'Normal (400)' },
            { value: '500', label: 'Medium (500)' },
            { value: '600', label: 'Semi Bold (600)' },
            { value: '700', label: 'Bold (700)' },
            { value: '800', label: 'Extra Bold (800)' },
            { value: '900', label: 'Black (900)' },
          ]}
        />
        <ResponsiveSelect
          label="Style"
          propKey="fontStyle"
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'italic', label: 'Italic' },
          ]}
        />
        <ResponsiveNumberInput
          label="Hauteur ligne"
          propKey="lineHeight"
          min={0}
          max={5}
          step={0.1}
        />
        <ResponsiveNumberInput
          label="Espace lettres (px)"
          propKey="letterSpacing"
          min={-5}
          max={20}
          step={0.5}
        />
        <div>
          <label className="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider">
            Couleur texte
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={nodeProps.fontColor ?? '#0f172a'}
              onChange={(e) =>
                setProp((p: any) => {
                  p.fontColor = e.target.value;
                })
              }
              className="w-10 h-8 rounded cursor-pointer bg-transparent border-0"
            />
            <input
              type="text"
              value={nodeProps.fontColor ?? '#0f172a'}
              onChange={(e) =>
                setProp((p: any) => {
                  p.fontColor = e.target.value;
                })
              }
              className="flex-1 bg-[#151521] border border-[#252538] text-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
        <ResponsiveSelect
          label="Alignement"
          propKey="textAlign"
          options={[
            { value: 'left', label: 'Gauche' },
            { value: 'center', label: 'Centré' },
            { value: 'right', label: 'Droite' },
            { value: 'justify', label: 'Justifié' },
          ]}
        />
      </Section>

      {/* Scroll Entrance Animations Section */}
      <Section id="animations" title="🎬 Animation entrée">
        <ResponsiveSelect
          label="Animation"
          propKey="entranceAnimation"
          options={[
            { value: 'none', label: 'Aucune' },
            { value: 'fadeIn', label: 'Fade In' },
            { value: 'fadeInUp', label: 'Fade In (haut)' },
            { value: 'fadeInDown', label: 'Fade In (bas)' },
            { value: 'fadeInLeft', label: 'Fade In (gauche)' },
            { value: 'fadeInRight', label: 'Fade In (droite)' },
            { value: 'slideInUp', label: 'Slide In (haut)' },
            { value: 'slideInDown', label: 'Slide In (bas)' },
            { value: 'slideInLeft', label: 'Slide In (gauche)' },
            { value: 'slideInRight', label: 'Slide In (droite)' },
            { value: 'zoomIn', label: 'Zoom In' },
            { value: 'zoomInUp', label: 'Zoom In (haut)' },
            { value: 'zoomInDown', label: 'Zoom In (bas)' },
            { value: 'bounceIn', label: 'Bounce In' },
            { value: 'flipInX', label: 'Flip X' },
            { value: 'flipInY', label: 'Flip Y' },
          ]}
        />
        <ResponsiveNumberInput
          label="Durée (ms)"
          propKey="animationDuration"
          min={0}
          max={5000}
          step={100}
        />
        <ResponsiveNumberInput
          label="Délai (ms)"
          propKey="animationDelay"
          min={0}
          max={5000}
          step={100}
        />
        <ResponsiveSelect
          label="Easing"
          propKey="animationEasing"
          options={[
            { value: 'ease', label: 'Ease' },
            { value: 'ease-in', label: 'Ease In' },
            { value: 'ease-out', label: 'Ease Out' },
            { value: 'ease-in-out', label: 'Ease In Out' },
            { value: 'linear', label: 'Linear' },
          ]}
        />
      </Section>

      <Section id="border" title="🔲 Bordure">
        <div>
          <label className="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider">
            Épaisseur (px)
          </label>
          <input
            type="number"
            min={0}
            max={20}
            value={nodeProps.borderWidth ?? 0}
            onChange={(e) =>
              setProp((p: any) => {
                p.borderWidth = parseInt(e.target.value) || 0;
              })
            }
            className="w-full bg-[#151521] border border-[#252538] text-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider">
            Couleur
          </label>
          <div className="flex gap-2 items-center">
            <input
              type="color"
              value={nodeProps.borderColor ?? '#e2e8f0'}
              onChange={(e) =>
                setProp((p: any) => {
                  p.borderColor = e.target.value;
                })
              }
              className="w-10 h-8 rounded cursor-pointer bg-transparent border-0"
            />
            <input
              type="text"
              value={nodeProps.borderColor ?? '#e2e8f0'}
              onChange={(e) =>
                setProp((p: any) => {
                  p.borderColor = e.target.value;
                })
              }
              className="flex-1 bg-[#151521] border border-[#252538] text-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider">
            Style
          </label>
          <select
            value={nodeProps.borderStyle ?? 'solid'}
            onChange={(e) =>
              setProp((p: any) => {
                p.borderStyle = e.target.value;
              })
            }
            className="w-full bg-[#151521] border border-[#252538] text-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="solid">Solide</option>
            <option value="dashed">Tirets</option>
            <option value="dotted">Points</option>
            <option value="none">Aucune</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider">
            Arrondi (px)
          </label>
          <input
            type="number"
            min={0}
            max={100}
            value={nodeProps.borderRadius ?? 0}
            onChange={(e) =>
              setProp((p: any) => {
                p.borderRadius = parseInt(e.target.value) || 0;
              })
            }
            className="w-full bg-[#151521] border border-[#252538] text-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
      </Section>

      <Section id="effects" title="✨ Effets">
        <div>
          <label className="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider">
            Opacité (%)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round((nodeProps.opacity ?? 1) * 100)}
              onChange={(e) =>
                setProp((p: any) => {
                  p.opacity = parseInt(e.target.value) / 100;
                })
              }
              className="flex-1 accent-indigo-500"
            />
            <span className="text-xs text-slate-300 w-8 text-right">
              {Math.round((nodeProps.opacity ?? 1) * 100)}%
            </span>
          </div>
        </div>
        <div>
          <label className="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider">
            Ombre
          </label>
          <select
            value={nodeProps.boxShadow ?? 'none'}
            onChange={(e) =>
              setProp((p: any) => {
                p.boxShadow = e.target.value;
              })
            }
            className="w-full bg-[#151521] border border-[#252538] text-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="none">Aucune</option>
            <option value="0 1px 3px rgba(0,0,0,0.12)">Légère (SM)</option>
            <option value="0 4px 6px rgba(0,0,0,0.15)">Douce (MD)</option>
            <option value="0 10px 25px rgba(0,0,0,0.20)">Prononcée (LG)</option>
            <option value="0 20px 50px rgba(0,0,0,0.30)">Dramatique (XL)</option>
            <option value="inset 0 2px 8px rgba(0,0,0,0.15)">Intérieure</option>
          </select>
        </div>
        <div className="border-t border-[#252538] my-2" />
        <div>
          <label className="block text-[10px] text-slate-500 mb-1.5 uppercase tracking-wider">
            Visibilité Responsive
          </label>
          <div className="flex gap-2">
            {(
              [
                { key: 'hideDesktop', vp: 'desktop', icon: '🖥️ Desktop' },
                { key: 'hideTablet', vp: 'tablet', icon: '📱 Tablet' },
                { key: 'hideMobile', vp: 'mobile', icon: '📱 Mobile' },
              ] as const
            ).map(({ key, vp, icon }) => {
              const isHidden = nodeProps[key] ?? false;
              return (
                <button
                  key={key}
                  onClick={() =>
                    setProp((p: any) => {
                      p[key] = !isHidden;
                    })
                  }
                  className={`flex-1 text-[10px] font-bold uppercase tracking-wider py-2 px-1 rounded transition-all ${
                    isHidden
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-[#151521] text-slate-500 border border-[#252538] hover:text-slate-300'
                  }`}
                >
                  {isHidden ? '🙈 ' : '👁️ '}
                  {vp}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="block text-[10px] text-slate-500 mb-1 uppercase tracking-wider">
            Animation d'entrée
          </label>
          <select
            value={nodeProps.entryAnimation ?? 'none'}
            onChange={(e) =>
              setProp((p: any) => {
                p.entryAnimation = e.target.value;
              })
            }
            className="w-full bg-[#151521] border border-[#252538] text-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="none">Aucune</option>
            <option value="fadeIn">Fade In</option>
            <option value="slideInUp">Glisser vers le haut</option>
            <option value="slideInLeft">Glisser depuis gauche</option>
            <option value="slideInRight">Glisser depuis droite</option>
            <option value="zoomIn">Zoom avant</option>
            <option value="bounceIn">Rebond</option>
          </select>
        </div>
      </Section>

      {/* Display Conditions */}
      <Section id="conditions" title="Conditions d'affichage">
        <div className="space-y-2">
          <p className="text-[10px] text-slate-500">
            Le bloc n'est affiché que si TOUTES les conditions sont vraies.
          </p>
          {((nodeProps.conditions as any[]) || []).length === 0 && (
            <p className="text-[10px] text-slate-600 italic">
              Aucune condition — toujours affiché.
            </p>
          )}
          {((nodeProps.conditions as any[]) || []).map((c: any, i: number) => (
            <div key={i} className="bg-[#151521] rounded p-2 border border-[#252538] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                  Condition {i + 1}
                </span>
                <button
                  onClick={() =>
                    setProp((p: any) => {
                      const arr = [...(p.conditions || [])];
                      arr.splice(i, 1);
                      p.conditions = arr;
                    })
                  }
                  className="text-rose-400 text-[10px] hover:underline"
                >
                  Supprimer
                </button>
              </div>
              <select
                value={c.type}
                onChange={(e) =>
                  setProp((p: any) => {
                    const arr = [...(p.conditions || [])];
                    arr[i] = { ...arr[i], type: e.target.value };
                    p.conditions = arr;
                  })
                }
                className="w-full bg-[#0d0d1a] border border-[#252538] text-slate-200 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-indigo-500"
              >
                <option value="role">Rôle utilisateur</option>
                <option value="device">Appareil</option>
                <option value="url">URL</option>
                <option value="queryParam">Paramètre URL</option>
                <option value="date">Date</option>
                <option value="loggedIn">Connecté</option>
                <option value="cookie">Cookie</option>
              </select>
              {c.type !== 'loggedIn' && (
                <div className="flex gap-1.5">
                  <select
                    value={c.operator}
                    onChange={(e) =>
                      setProp((p: any) => {
                        const arr = [...(p.conditions || [])];
                        arr[i] = { ...arr[i], operator: e.target.value };
                        p.conditions = arr;
                      })
                    }
                    className="w-2/5 bg-[#0d0d1a] border border-[#252538] text-slate-200 rounded px-1.5 py-1 text-[10px] focus:outline-none focus:border-indigo-500"
                  >
                    <option value="equals">=</option>
                    <option value="notEquals">≠</option>
                    <option value="contains">contient</option>
                    <option value="notContains">ne contient pas</option>
                    <option value="exists">existe</option>
                    <option value="notExists">n'existe pas</option>
                  </select>
                  <input
                    type={c.type === 'date' ? 'datetime-local' : 'text'}
                    value={c.value || ''}
                    onChange={(e) =>
                      setProp((p: any) => {
                        const arr = [...(p.conditions || [])];
                        arr[i] = { ...arr[i], value: e.target.value };
                        p.conditions = arr;
                      })
                    }
                    placeholder={
                      c.type === 'role'
                        ? 'admin'
                        : c.type === 'device'
                          ? 'mobile'
                          : c.type === 'queryParam'
                            ? 'nom_param'
                            : c.type === 'cookie'
                              ? 'nom_cookie'
                              : c.type === 'url'
                                ? '/page'
                                : 'valeur'
                    }
                    className="flex-1 bg-[#0d0d1a] border border-[#252538] text-slate-200 rounded px-2 py-1 text-[11px] focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}
            </div>
          ))}
          <button
            onClick={() =>
              setProp((p: any) => {
                const arr = [...(p.conditions || [])];
                arr.push({ id: 'c_' + Date.now(), type: 'role', operator: 'equals', value: '' });
                p.conditions = arr;
              })
            }
            className="w-full py-1.5 border border-dashed border-[#252538] rounded text-[11px] text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-colors"
          >
            + Ajouter une condition
          </button>
        </div>
      </Section>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// ADVANCED PANEL (CSS class, ID, custom CSS)
// ─────────────────────────────────────────────────────────
const AdvancedPanel = ({ nodeProps, setProp }: { nodeProps: any; setProp: any }) => (
  <div className="space-y-3">
    <div>
      <label className="block text-[10px] text-slate-500 mb-1.5 uppercase tracking-wider">
        ID HTML
      </label>
      <input
        type="text"
        value={nodeProps.htmlId ?? ''}
        onChange={(e) =>
          setProp((p: any) => {
            p.htmlId = e.target.value;
          })
        }
        placeholder="mon-id-unique"
        className="w-full bg-[#151521] border border-[#252538] text-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500 font-mono"
      />
    </div>
    <div>
      <label className="block text-[10px] text-slate-500 mb-1.5 uppercase tracking-wider">
        Classes CSS
      </label>
      <input
        type="text"
        value={nodeProps.extraClasses ?? ''}
        onChange={(e) =>
          setProp((p: any) => {
            p.extraClasses = e.target.value;
          })
        }
        placeholder="ma-classe autre-classe"
        className="w-full bg-[#151521] border border-[#252538] text-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500 font-mono"
      />
    </div>
    <div>
      <label className="block text-[10px] text-slate-500 mb-1.5 uppercase tracking-wider">
        CSS personnalisé (inline)
      </label>
      <textarea
        rows={5}
        value={nodeProps.customInlineCss ?? ''}
        onChange={(e) =>
          setProp((p: any) => {
            p.customInlineCss = e.target.value;
          })
        }
        placeholder={'color: red;\nfont-size: 18px;'}
        className="w-full bg-[#151521] border border-[#252538] text-slate-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-500 font-mono resize-y"
      />
    </div>
    <div>
      <label className="block text-[10px] text-slate-500 mb-1.5 uppercase tracking-wider">
        Z-index
      </label>
      <input
        type="number"
        value={nodeProps.zIndex ?? 'auto'}
        onChange={(e) =>
          setProp((p: any) => {
            p.zIndex = e.target.value === '' ? 'auto' : parseInt(e.target.value);
          })
        }
        className="w-full bg-[#151521] border border-[#252538] text-slate-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
      />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────
// PAGE METADATA PANEL
// ─────────────────────────────────────────────────────────
const PageMetaPanel = () => {
  const { pageData, updateMetadata } = useGodEditor();
  if (!pageData)
    return <div className="text-sm text-slate-500 italic p-4 text-center">Chargement...</div>;

  const Row = ({ label, children }: any) => (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      {children}
    </div>
  );

  const inputCls =
    'w-full bg-[#151521] border border-[#252538] rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500';

  return (
    <div className="space-y-4">
      {/* Publication */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-500/20 rounded-lg">
        <div>
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            <Globe size={12} /> Publié
          </span>
          <span className="text-[10px] text-slate-400">Visible publiquement</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={pageData.isPublished}
            onChange={(e) => updateMetadata({ isPublished: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-[#252538] rounded-full peer peer-checked:bg-emerald-600 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
        </label>
      </div>

      <Row label="Titre de la page">
        <input
          type="text"
          value={pageData.title}
          onChange={(e) => updateMetadata({ title: e.target.value })}
          className={inputCls}
        />
      </Row>
      <Row label="Slug (URL)">
        <input
          type="text"
          value={pageData.slug}
          onChange={(e) => updateMetadata({ slug: e.target.value })}
          className={`${inputCls} font-mono text-xs`}
        />
      </Row>
      <Row label="Statut">
        <select
          value={pageData.workflowStatus}
          onChange={(e) => updateMetadata({ workflowStatus: e.target.value as any })}
          className={inputCls}
        >
          <option value="draft">📝 Brouillon</option>
          <option value="review">👁️ En revue</option>
          <option value="approved">✅ Approuvé</option>
          <option value="published">🚀 Publié</option>
          <option value="archived">📦 Archivé</option>
        </select>
      </Row>

      <div className="w-full h-px bg-[#252538]" />
      <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">SEO</p>

      <Row label="Meta description">
        <textarea
          rows={3}
          value={pageData.metaDescription}
          onChange={(e) => updateMetadata({ metaDescription: e.target.value })}
          className={`${inputCls} resize-none`}
          placeholder="Description pour les moteurs de recherche..."
        />
        <span
          className={`text-[10px] ${pageData.metaDescription.length > 160 ? 'text-red-400' : 'text-slate-500'}`}
        >
          {pageData.metaDescription.length}/160 caractères
        </span>
      </Row>
      <Row label="Mots-clés">
        <input
          type="text"
          value={pageData.metaKeywords}
          onChange={(e) => updateMetadata({ metaKeywords: e.target.value })}
          className={inputCls}
          placeholder="électricité, audit, sécurité"
        />
      </Row>
      <Row label="Robots">
        <select
          value={pageData.metaRobots}
          onChange={(e) => updateMetadata({ metaRobots: e.target.value })}
          className={inputCls}
        >
          <option value="index,follow">Index + Follow (défaut)</option>
          <option value="noindex,follow">No Index + Follow</option>
          <option value="index,nofollow">Index + No Follow</option>
          <option value="noindex,nofollow">No Index + No Follow</option>
        </select>
      </Row>

      <div className="w-full h-px bg-[#252538]" />
      <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
        Code personnalisé
      </p>

      <Row label="CSS personnalisé">
        <textarea
          rows={4}
          value={pageData.customCss}
          onChange={(e) => updateMetadata({ customCss: e.target.value })}
          className={`${inputCls} resize-y font-mono text-xs`}
          placeholder="/* styles CSS... */"
        />
      </Row>
      <Row label="JS personnalisé">
        <textarea
          rows={4}
          value={pageData.customJs}
          onChange={(e) => updateMetadata({ customJs: e.target.value })}
          className={`${inputCls} resize-y font-mono text-xs`}
          placeholder="// scripts JS..."
        />
      </Row>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// THEME CONFIGURATION PANEL
// ─────────────────────────────────────────────────────────
const ThemeConfigPanel = () => {
  const { themeConfig, setThemeConfig } = useBuilderThemeStore();

  const Row = ({ label, children }: any) => (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </label>
      {children}
    </div>
  );

  const inputCls =
    'w-full bg-[#151521] border border-[#252538] rounded px-2 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500';

  return (
    <div className="space-y-4">
      <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
        <span className="text-xs font-bold text-indigo-400 flex items-center gap-1">
          🎨 Thème Global
        </span>
        <span className="text-[10px] text-slate-400">
          Configurez les tokens de design appliqués à toute la page.
        </span>
      </div>

      <Row label="Couleur Primaire">
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={themeConfig.primaryColor || '#2563eb'}
            onChange={(e) => setThemeConfig({ primaryColor: e.target.value })}
            className="w-10 h-8 rounded cursor-pointer bg-transparent border-0 shrink-0"
          />
          <input
            type="text"
            value={themeConfig.primaryColor || '#2563eb'}
            onChange={(e) => setThemeConfig({ primaryColor: e.target.value })}
            className={`${inputCls} font-mono text-xs`}
          />
        </div>
      </Row>

      <Row label="Couleur Secondaire">
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={themeConfig.secondaryColor || '#4f46e5'}
            onChange={(e) => setThemeConfig({ secondaryColor: e.target.value })}
            className="w-10 h-8 rounded cursor-pointer bg-transparent border-0 shrink-0"
          />
          <input
            type="text"
            value={themeConfig.secondaryColor || '#4f46e5'}
            onChange={(e) => setThemeConfig({ secondaryColor: e.target.value })}
            className={`${inputCls} font-mono text-xs`}
          />
        </div>
      </Row>

      <Row label="Police de Caractères">
        <select
          value={themeConfig.fontFamily || 'Inter, sans-serif'}
          onChange={(e) => setThemeConfig({ fontFamily: e.target.value })}
          className={inputCls}
        >
          <option value="Inter, sans-serif">Inter</option>
          <option value="Roboto, sans-serif">Roboto</option>
          <option value="Poppins, sans-serif">Poppins</option>
          <option value="'Outfit', sans-serif">Outfit</option>
          <option value="'Montserrat', sans-serif">Montserrat</option>
          <option value="'Playfair Display', serif">Playfair Display</option>
        </select>
      </Row>

      <Row label="Arrondi Global (Border Radius)">
        <input
          type="text"
          value={themeConfig.borderRadius || '8px'}
          onChange={(e) => setThemeConfig({ borderRadius: e.target.value })}
          placeholder="8px"
          className={inputCls}
        />
      </Row>

      <Row label="Échelle d'Espacement">
        <select
          value={themeConfig.spacingScale || '1'}
          onChange={(e) => setThemeConfig({ spacingScale: e.target.value })}
          className={inputCls}
        >
          <option value="0.75">Compact (0.75x)</option>
          <option value="1">Normal (1.0x)</option>
          <option value="1.25">Grand (1.25x)</option>
          <option value="1.5">Large (1.5x)</option>
        </select>
      </Row>
    </div>
  );
};

// ─────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────
export const GodSettings = () => {
  const { actions, selected, isEnabled } = useEditor((state, query) => {
    const selectedSet = state.events.selected;
    const currentNodeId = selectedSet ? Array.from(selectedSet)[0] : null;
    let selected: any;

    if (currentNodeId && state.nodes[currentNodeId as string]) {
      const node = state.nodes[currentNodeId as string];
      selected = {
        id: currentNodeId,
        name: node.data.displayName || node.data.name,
        settings: node.related?.settings,
        nodeProps: node.data.props,
        isDeletable: query.node(currentNodeId as string).isDeletable(),
        setProp: (cb: any) => actions.setProp(currentNodeId as string, cb),
      };
    }

    return { selected, isEnabled: state.options.enabled };
  });

  const [tab, setTab] = useState<'content' | 'style' | 'advanced'>('content');
  const [pageTab, setPageTab] = useState<'meta' | 'theme'>('meta');

  const lockedNodes = useBuilderUiStore((state) => state.lockedNodes);
  const isLocked = selected ? lockedNodes[selected.id] : false;

  if (!isEnabled) return null;

  return (
    <div className="w-80 bg-[#12121f] border-l border-[#252538] h-full flex flex-col shrink-0 text-white z-40">
      {/* Header */}
      <div className="h-12 flex items-center px-4 border-b border-[#252538] shrink-0 justify-between">
        <span className="text-slate-300 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
          {selected ? (
            <>
              <Settings size={12} className="text-indigo-400" /> {selected.name}
            </>
          ) : (
            <>
              <FileText size={12} className="text-blue-400" /> Paramètres de page
            </>
          )}
        </span>
        {selected && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => actions.selectNode(undefined as any)}
              className="text-[10px] text-slate-500 hover:text-slate-300 px-2 py-1 rounded hover:bg-[#252538] transition-colors"
              title="Désélectionner (Escape)"
            >
              ✕ Page
            </button>
          </div>
        )}
      </div>

      {/* Block Tabs */}
      {selected ? (
        <div className="flex border-b border-[#252538] shrink-0 bg-[#0d0d1a]">
          <TabBtn
            label="Contenu"
            icon={AlignLeft}
            active={tab === 'content'}
            onClick={() => setTab('content')}
          />
          <TabBtn
            label="Style"
            icon={Palette}
            active={tab === 'style'}
            onClick={() => setTab('style')}
          />
          <TabBtn
            label="Avancé"
            icon={Code2}
            active={tab === 'advanced'}
            onClick={() => setTab('advanced')}
          />
        </div>
      ) : (
        <div className="flex border-b border-[#252538] shrink-0 bg-[#0d0d1a]">
          <TabBtn
            label="Métadonnées"
            icon={FileText}
            active={pageTab === 'meta'}
            onClick={() => setPageTab('meta')}
          />
          <TabBtn
            label="Thème Global"
            icon={Palette}
            active={pageTab === 'theme'}
            onClick={() => setPageTab('theme')}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {selected ? (
          <div className="flex flex-col gap-4">
            {isLocked && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-2.5 rounded text-xs flex items-start gap-2 mb-1">
                <span className="shrink-0 mt-0.5">🔒</span>
                <span>
                  Ce bloc est verrouillé. Déverrouillez-le depuis le navigateur de calques pour
                  modifier ses propriétés.
                </span>
              </div>
            )}

            {/* Locked inputs wrapper */}
            <div className={isLocked ? 'pointer-events-none opacity-40 select-none' : ''}>
              {tab === 'content' && (
                <>
                  {selected.settings ? (
                    React.createElement(selected.settings)
                  ) : (
                    <div className="text-sm text-slate-500 italic p-4 text-center border border-dashed border-[#252538] rounded-lg">
                      Aucune propriété de contenu pour ce bloc.
                    </div>
                  )}
                </>
              )}

              {tab === 'style' && (
                <SharedStylePanel nodeProps={selected.nodeProps} setProp={selected.setProp} />
              )}

              {tab === 'advanced' && (
                <AdvancedPanel nodeProps={selected.nodeProps} setProp={selected.setProp} />
              )}
            </div>

            {/* Delete/Duplicate controls */}
            {selected.isDeletable && (
              <div className="pt-3 border-t border-[#252538] mt-2">
                <div className="flex gap-2">
                  <button
                    disabled={isLocked}
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent('god-duplicate-node', { detail: selected.id }),
                      );
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20 hover:bg-indigo-500/20 text-xs font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Copy size={12} />
                    Dupliquer
                  </button>
                  <button
                    disabled={isLocked}
                    onClick={() => {
                      actions.delete(selected.id as string);
                      toast.success('Bloc supprimé');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-500/10 text-rose-400 rounded border border-rose-500/20 hover:bg-rose-500/20 text-xs font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={12} />
                    Supprimer
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : pageTab === 'meta' ? (
          <PageMetaPanel />
        ) : (
          <ThemeConfigPanel />
        )}
      </div>
    </div>
  );
};
