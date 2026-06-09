import React, { useEffect, useState } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { getUniversalStyles } from '@/components/blocks/universalStyles';
import { useBuilderUiStore } from '@/stores/builder-ui.store';
import { resolveDynamicContent } from '@/lib/dynamic-data/resolver';

// ─────────────────────────────────────────────
// SETTINGS HELPERS (self-contained)
// ─────────────────────────────────────────────
const SettingsLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm font-medium text-slate-700 mb-1">{children}</div>
);
const SettingsInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
  />
);
const SettingsRow = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-3">{children}</div>
);
const SettingsColor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => (
  <input
    type="color"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full h-9 rounded cursor-pointer border"
  />
);
const SettingsSelect = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);
const SettingsToggle = ({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) => (
  <button
    onClick={() => onChange(!value)}
    className={
      'px-3 py-1.5 rounded-lg text-xs font-bold transition w-full text-left ' +
      (value
        ? 'bg-blue-100 text-blue-700 border border-blue-200'
        : 'bg-slate-100 text-slate-600 border border-slate-200')
    }
  >
    {label}: {value ? '✅ Oui' : '❌ Non'}
  </button>
);

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface MenuItem {
  id: number;
  title: string;
  url: string;
  parent_id: number | null;
  menu_type: string;
  order: number;
  children?: MenuItem[];
}

interface HeaderBlockProps {
  logoUrl?: string;
  siteName?: string;
  menuType?: 'main' | 'footer';
  backgroundColor?: string;
  textColor?: string;
  height?: string;
  showSearch?: boolean;
  showCta?: boolean;
  ctaText?: string;
  ctaLink?: string;
  sticky?: boolean;
  transparent?: boolean;
  borderColor?: string;
  paddingX?: string;
  fontSize?: string;
  fontFamily?: string;
  borderRadius?: string;
}

// ─────────────────────────────────────────────
// HEADER BLOCK
// ─────────────────────────────────────────────
export const HeaderBlock = (props: HeaderBlockProps & any) => {
  const {
    logoUrl = '/logo.png',
    siteName = 'PROQUELEC',
    menuType = 'main',
    backgroundColor = '#ffffff',
    textColor = '#1e293b',
    height = '72',
    showSearch = true,
    showCta = false,
    ctaText = 'Contact',
    ctaLink = '/contact',
    sticky = true,
    transparent = false,
    borderColor = '#e2e8f0',
    paddingX = '24',
    fontSize = 'sm',
    fontFamily = 'Inter',
    borderRadius = 'none',
  } = props;

  const {
    id,
    connectors: { connect, drag },
    selected,
  } = useNode((n) => ({ selected: n.events.selected }));

  const isEnabled = useEditor((state) => state.options.enabled);
  const isLocked = useBuilderUiStore((state) => state.lockedNodes[id]);
  const isHidden = useBuilderUiStore((state) => state.hiddenNodes[id]);
  const universal = getUniversalStyles(props);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/menu-items?menu_type=${menuType}`);
        if (!res.ok) throw new Error('Failed to fetch menu items');
        const data = await res.json();
        if (!cancelled) {
          // Build nested structure from flat list if children are not provided
          const items: MenuItem[] = Array.isArray(data) ? data : data.data ?? [];
          setMenuItems(items);
        }
      } catch (err) {
        console.warn('HeaderBlock: Could not load menu items', err);
        if (!cancelled) setMenuItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchMenu();
    return () => {
      cancelled = true;
    };
  }, [menuType]);

  if (isHidden && !isEnabled) return null;

  // ── Style maps ──
  const fontSizeClasses: Record<string, string> = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const borderRadiusClasses: Record<string, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  const selectedRing = selected && !isLocked ? 'ring-2 ring-indigo-500 ring-offset-2' : '';

  return (
    <header
      ref={(ref) => {
        if (ref) connect(isLocked ? ref : drag(ref));
      }}
      style={{
        backgroundColor: transparent ? 'transparent' : backgroundColor,
        borderBottom: `1px solid ${borderColor}`,
        color: textColor,
        height: `${height}px`,
        padding: `0 ${paddingX}px`,
        fontFamily,
        ...universal.style,
        opacity: isHidden ? 0.35 : universal.style.opacity,
        border: isHidden ? '1px dashed #ef4444' : undefined,
      }}
      className={`w-full flex items-center justify-between proquelec-builder-node ${fontSizeClasses[fontSize] ?? 'text-sm'} ${borderRadiusClasses[borderRadius]} ${sticky ? 'sticky top-0 z-50' : 'relative'} ${selectedRing} ${universal.className}`}
    >
      {/* ── Left: Logo / Site Name ── */}
      <div className="flex items-center gap-3 shrink-0">
        {logoUrl && (
          <img
            src={logoUrl}
            alt={siteName}
            className="h-8 w-auto object-contain"
            style={{ maxHeight: `${Math.min(parseInt(height) * 0.6, 48)}px` }}
          />
        )}
        <span
          className="font-bold tracking-tight"
          style={{ fontSize: `clamp(1rem, ${parseInt(height) * 0.35}px, 1.5rem)` }}
        >
          {resolveDynamicContent(siteName)}
        </span>
      </div>

      {/* ── Center: Navigation Links ── */}
      <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
        {loading ? (
          <div className="flex items-center gap-2 text-sm opacity-60">
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Chargement...
          </div>
        ) : menuItems.length > 0 ? (
          menuItems.map((item) => (
            <a
              key={item.id}
              href={item.url}
              className="font-medium transition-opacity hover:opacity-70 whitespace-nowrap"
              style={{ color: textColor }}
            >
              {item.title}
            </a>
          ))
        ) : (
          <span className="text-sm opacity-40 italic">Aucun lien de menu</span>
        )}
      </nav>

      {/* ── Right: Search + CTA ── */}
      <div className="flex items-center gap-3 shrink-0">
        {showSearch && (
          <button
            className="p-2 rounded-full transition-colors hover:bg-black/5 focus:outline-none"
            aria-label="Rechercher"
            style={{ color: textColor }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        )}
        {showCta && (
          <a
            href={ctaLink}
            className="inline-block px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-md shadow-sm"
          >
            {resolveDynamicContent(ctaText)}
          </a>
        )}
      </div>
    </header>
  );
};

// ─────────────────────────────────────────────
// HEADER SETTINGS
// ─────────────────────────────────────────────
const HeaderSettings = () => {
  const {
    actions: { setProp },
    logoUrl,
    siteName,
    menuType,
    backgroundColor,
    textColor,
    height,
    showSearch,
    showCta,
    ctaText,
    ctaLink,
    sticky,
    transparent,
    borderColor,
    paddingX,
    fontSize,
    fontFamily,
    borderRadius,
  } = useNode((n) => ({ ...n.data.props }));

  return (
    <div className="space-y-3">
      {/* ── Branding ── */}
      <SettingsRow>
        <SettingsLabel>Site Name</SettingsLabel>
        <SettingsInput
          value={siteName}
          onChange={(v) => setProp((p: any) => (p.siteName = v))}
          placeholder="PROQUELEC"
        />
      </SettingsRow>
      <SettingsRow>
        <SettingsLabel>Logo URL</SettingsLabel>
        <SettingsInput
          value={logoUrl}
          onChange={(v) => setProp((p: any) => (p.logoUrl = v))}
          placeholder="/logo.png"
        />
      </SettingsRow>

      {/* ── Colors ── */}
      <SettingsRow>
        <SettingsLabel>Background Color</SettingsLabel>
        <SettingsColor
          value={backgroundColor}
          onChange={(v) => setProp((p: any) => (p.backgroundColor = v))}
        />
      </SettingsRow>
      <SettingsRow>
        <SettingsLabel>Text Color</SettingsLabel>
        <SettingsColor
          value={textColor}
          onChange={(v) => setProp((p: any) => (p.textColor = v))}
        />
      </SettingsRow>
      <SettingsRow>
        <SettingsLabel>Border Color</SettingsLabel>
        <SettingsColor
          value={borderColor}
          onChange={(v) => setProp((p: any) => (p.borderColor = v))}
        />
      </SettingsRow>

      {/* ── Dimensions ── */}
      <SettingsRow>
        <SettingsLabel>Height (px)</SettingsLabel>
        <SettingsInput
          value={height}
          onChange={(v) => setProp((p: any) => (p.height = v))}
          placeholder="72"
        />
      </SettingsRow>
      <SettingsRow>
        <SettingsLabel>Padding X (px)</SettingsLabel>
        <SettingsInput
          value={paddingX}
          onChange={(v) => setProp((p: any) => (p.paddingX = v))}
          placeholder="24"
        />
      </SettingsRow>

      {/* ── Typography ── */}
      <SettingsRow>
        <SettingsLabel>Font Size</SettingsLabel>
        <SettingsSelect
          value={fontSize}
          onChange={(v) => setProp((p: any) => (p.fontSize = v))}
          options={[
            { value: 'sm', label: 'SM' },
            { value: 'base', label: 'Base' },
            { value: 'lg', label: 'LG' },
            { value: 'xl', label: 'XL' },
          ]}
        />
      </SettingsRow>
      <SettingsRow>
        <SettingsLabel>Font Family</SettingsLabel>
        <SettingsSelect
          value={fontFamily}
          onChange={(v) => setProp((p: any) => (p.fontFamily = v))}
          options={[
            { value: 'Inter', label: 'Inter' },
            { value: 'Poppins', label: 'Poppins' },
            { value: 'Roboto', label: 'Roboto' },
          ]}
        />
      </SettingsRow>

      {/* ── Menu ── */}
      <SettingsRow>
        <SettingsLabel>Menu Type</SettingsLabel>
        <SettingsSelect
          value={menuType}
          onChange={(v) => setProp((p: any) => (p.menuType = v))}
          options={[
            { value: 'main', label: 'Main' },
            { value: 'footer', label: 'Footer' },
          ]}
        />
      </SettingsRow>

      {/* ── Border Radius ── */}
      <SettingsRow>
        <SettingsLabel>Border Radius</SettingsLabel>
        <SettingsSelect
          value={borderRadius}
          onChange={(v) => setProp((p: any) => (p.borderRadius = v))}
          options={[
            { value: 'none', label: 'None' },
            { value: 'sm', label: 'SM' },
            { value: 'md', label: 'MD' },
            { value: 'lg', label: 'LG' },
            { value: 'full', label: 'Full' },
          ]}
        />
      </SettingsRow>

      {/* ── Toggles ── */}
      <SettingsRow>
        <SettingsToggle
          value={showSearch}
          onChange={(v) => setProp((p: any) => (p.showSearch = v))}
          label="Show Search"
        />
      </SettingsRow>
      <SettingsRow>
        <SettingsToggle
          value={showCta}
          onChange={(v) => setProp((p: any) => (p.showCta = v))}
          label="Show CTA"
        />
      </SettingsRow>
      {showCta && (
        <>
          <SettingsRow>
            <SettingsLabel>CTA Text</SettingsLabel>
            <SettingsInput
              value={ctaText}
              onChange={(v) => setProp((p: any) => (p.ctaText = v))}
              placeholder="Contact"
            />
          </SettingsRow>
          <SettingsRow>
            <SettingsLabel>CTA Link</SettingsLabel>
            <SettingsInput
              value={ctaLink}
              onChange={(v) => setProp((p: any) => (p.ctaLink = v))}
              placeholder="/contact"
            />
          </SettingsRow>
        </>
      )}
      <SettingsRow>
        <SettingsToggle
          value={sticky}
          onChange={(v) => setProp((p: any) => (p.sticky = v))}
          label="Sticky"
        />
      </SettingsRow>
      <SettingsRow>
        <SettingsToggle
          value={transparent}
          onChange={(v) => setProp((p: any) => (p.transparent = v))}
          label="Transparent"
        />
      </SettingsRow>
    </div>
  );
};

// ─────────────────────────────────────────────
// CRAFT REGISTRATION
// ─────────────────────────────────────────────
HeaderBlock.craft = {
  displayName: 'Header',
  props: {
    logoUrl: '/logo.png',
    siteName: 'PROQUELEC',
    menuType: 'main',
    backgroundColor: '#ffffff',
    textColor: '#1e293b',
    height: '72',
    showSearch: true,
    showCta: false,
    ctaText: 'Contact',
    ctaLink: '/contact',
    sticky: true,
    transparent: false,
    borderColor: '#e2e8f0',
    paddingX: '24',
    fontSize: 'sm',
    fontFamily: 'Inter',
    borderRadius: 'none',
  },
  related: {
    settings: HeaderSettings,
  },
};
