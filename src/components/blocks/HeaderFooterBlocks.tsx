/**
 * HeaderFooterBlocks.tsx
 * Craft.js builder blocks for header and footer with full settings panels.
 *
 * - HeaderBuilderBlock: Editable header with logo, nav, alert bar, search, CTA, mobile menu.
 * - FooterBuilderBlock: Editable footer with logo, nav columns, social links, newsletter, copyright.
 */

import React, { useState, useEffect } from 'react';
import { useEditor, useNode } from '@craftjs/core';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Search,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Linkedin,
  Twitter,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  Info,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUniversalStyles } from './universalStyles';
import {
  SettingsLabel,
  SettingsInput,
  SettingsSelect,
  SettingsColor,
  SettingsRow,
  SettingsTextarea,
} from './ProquelecBlocks';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useLiveSettings } from '@/hooks/useLiveSettings';

// ─────────────────────────────────────────────
// SHORTHAND SETTINGS COMPONENTS
// ─────────────────────────────────────────────
const Input = (p: any) => <SettingsInput {...p} />;
const Select = (p: any) => <SettingsSelect {...p} />;
const Color = (p: any) => <SettingsColor {...p} />;
const Row = (p: any) => <SettingsRow {...p} />;
const Label = (p: any) => <SettingsLabel {...p} />;

// ─────────────────────────────────────────────
// HELPER: Alert style based on type
// ─────────────────────────────────────────────
const getAlertStyles = (type: string): string => {
  switch (type) {
    case 'success':
      return 'bg-green-600 text-white';
    case 'warning':
      return 'bg-amber-500 text-white';
    case 'danger':
      return 'bg-red-600 text-white';
    case 'info':
    default:
      return 'bg-blue-600 text-white';
  }
};

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <CheckCircle className="h-3.5 w-3.5" />;
    case 'warning':
      return <AlertTriangle className="h-3.5 w-3.5" />;
    case 'danger':
      return <AlertCircle className="h-3.5 w-3.5" />;
    case 'info':
    default:
      return <Info className="h-3.5 w-3.5" />;
  }
};

// ─────────────────────────────────────────────
// HEADER BUILDER BLOCK
// ─────────────────────────────────────────────
export const HeaderBuilderBlock = (props: any) => {
  const {
    logoUrl = '',
    siteName = 'PROQUELEC',
    backgroundColor = '#ffffff',
    textColor = '#0f172a',
    accentColor = '#2376df',
    headerHeight = 72,
    glassmorphism = false,
    sticky = true,
    showSearch = false,
    showAlert = false,
    alertText = '',
    alertType = 'info',
    showCta = false,
    ctaText = 'Nous contacter',
    ctaLink = '/contact',
  } = props;

  const {
    connectors: { connect, drag },
  } = useNode();
  const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));
  const u = getUniversalStyles(props);
  const { settings } = useLiveSettings();
  const { data: menuItems } = useMenuItems();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll for sticky effect
  useEffect(() => {
    if (!sticky || enabled) return;
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sticky, enabled]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Resolved logo: prefer prop, then settings logo_url, fallback to /logo.png
  const resolvedLogo = logoUrl || settings?.logo_url || '/logo.png';
  const resolvedSiteName = siteName || settings?.site_name || 'PROQUELEC';

  // Fetch main navigation items
  const mainNavItems =
    menuItems
      ?.filter((item: any) => item.menu_type === 'main' && item.is_active)
      ?.sort((a: any, b: any) => (a.menu_order || 0) - (b.menu_order || 0)) || [];

  const effectiveBg = glassmorphism ? `${backgroundColor}cc` : backgroundColor;

  const headerClasses = cn(
    'w-full transition-all duration-300 z-[100]',
    sticky && !enabled ? 'fixed top-0 left-0 right-0' : 'relative',
    scrolled && sticky && !enabled ? 'shadow-md' : 'shadow-sm',
  );

  return (
    <div
      ref={(r: any) => {
        if (r) connect(drag(r));
      }}
      style={{ ...u.style }}
      className={'proquelec-builder-node ' + u.className}
    >
      {/* Alert bar */}
      {showAlert && alertText && (
        <div
          className={cn(
            'w-full flex items-center justify-center px-4 py-2 gap-2 text-xs font-semibold',
            getAlertStyles(alertType),
          )}
        >
          {getAlertIcon(alertType)}
          <span>{alertText}</span>
        </div>
      )}

      {/* Main header */}
      <header
        className={headerClasses}
        style={{
          background: effectiveBg,
          color: textColor,
          height: headerHeight,
          backdropFilter: glassmorphism ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: glassmorphism ? 'blur(12px)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0 min-w-0 group">
            <img
              src={resolvedLogo}
              alt={resolvedSiteName}
              className="h-8 sm:h-10 w-auto object-contain transition-all duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== '/logo.png') {
                  target.src = '/logo.png';
                }
              }}
              loading="lazy"
            />
            <span
              className="hidden sm:block text-base sm:text-lg font-bold truncate"
              style={{ color: textColor }}
            >
              {resolvedSiteName}
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center px-4">
            {mainNavItems.length > 0 ? (
              mainNavItems.map((item: any) => (
                <Link
                  key={item.id}
                  to={item.url || '#'}
                  className="px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 hover:opacity-80"
                  style={{ color: textColor }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = accentColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = textColor;
                  }}
                >
                  {item.title}
                </Link>
              ))
            ) : (
              <div className="text-xs text-slate-400 italic px-4 py-2">
                Navigation items will appear here
              </div>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search toggle */}
            {showSearch && (
              <button
                type="button"
                className="p-2 rounded-lg transition-colors duration-200 hover:opacity-70"
                style={{ color: textColor }}
                aria-label="Rechercher"
              >
                <Search className="h-5 w-5" />
              </button>
            )}

            {/* CTA button */}
            {showCta && (
              <Link
                to={ctaLink}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:opacity-90"
                style={{
                  background: accentColor,
                  color: '#ffffff',
                }}
              >
                {ctaText}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => {
                if (enabled) return;
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="lg:hidden p-2 rounded-lg transition-colors duration-200 hover:opacity-70"
              style={{ color: textColor }}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile overlay menu */}
        {mobileMenuOpen && !enabled && (
          <div
            className="lg:hidden fixed inset-0 z-50 flex flex-col"
            style={{
              background: backgroundColor,
              color: textColor,
              paddingTop: headerHeight + (showAlert && alertText ? 40 : 0),
            }}
          >
            {/* Mobile search */}
            {showSearch && (
              <div className="px-4 pt-4 pb-2">
                <div
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border"
                  style={{ borderColor: `${textColor}20` }}
                >
                  <Search className="h-4 w-4 opacity-50" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="bg-transparent border-none outline-none text-sm flex-1"
                    style={{ color: textColor }}
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Mobile nav links */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {mainNavItems.length > 0 ? (
                mainNavItems.map((item: any) => (
                  <Link
                    key={item.id}
                    to={item.url || '#'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 hover:opacity-80"
                    style={{ color: textColor }}
                  >
                    {item.title}
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </Link>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic text-center py-8">
                  Aucun élément de menu
                </div>
              )}
            </nav>

            {/* Mobile CTA */}
            {showCta && (
              <div className="px-4 pb-6 pt-2 border-t" style={{ borderColor: `${textColor}15` }}>
                <Link
                  to={ctaLink}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    background: accentColor,
                    color: '#ffffff',
                  }}
                >
                  {ctaText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Spacer for fixed header */}
      {sticky && !enabled && <div style={{ height: headerHeight }} />}
    </div>
  );
};

// ─── MENU ITEM CRUD HELPERS ───────────────────
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const MenuEditor = ({ menuItems, onRefresh }: { menuItems: any[]; onRefresh: () => void }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [adding, setAdding] = useState(false);

  const addItem = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      await fetch('/api/menu-items', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          title: newTitle.trim(),
          url: newUrl.trim() || '/' + newTitle.trim().toLowerCase().replace(/\s+/g, '-'),
          menu_type: 'main',
          menu_order: menuItems.length,
          is_active: true,
          target: '_self',
        }),
      });
      setNewTitle('');
      setNewUrl('');
      onRefresh();
    } catch (e) {
      console.error('Failed to add menu item:', e);
    }
    setAdding(false);
  };

  const deleteItem = async (id: string) => {
    if (!window.confirm('Supprimer cet élément du menu ?')) return;
    try {
      await fetch('/api/menu-items/' + id, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      onRefresh();
    } catch (e) {
      console.error('Failed to delete menu item:', e);
    }
  };

  const toggleActive = async (item: any) => {
    try {
      await fetch('/api/menu-items/' + item.id, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ is_active: !item.is_active }),
      });
      onRefresh();
    } catch (e) {
      console.error('Failed to toggle menu item:', e);
    }
  };

  const updateOrder = async (id: string, newOrder: number) => {
    try {
      await fetch('/api/menu-items/' + id, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ menu_order: newOrder }),
      });
      onRefresh();
    } catch (e) {
      console.error('Failed to update menu order:', e);
    }
  };

  const sortedItems = [...menuItems]
    .filter((i: any) => i.menu_type === 'main')
    .sort((a: any, b: any) => (a.menu_order || 0) - (b.menu_order || 0));

  return (
    <div className="space-y-2">
      {/* Existing items */}
      {sortedItems.map((item: any, idx: number) => (
        <div
          key={item.id}
          className="flex items-center gap-1 p-1.5 bg-white rounded border border-slate-200 text-xs"
        >
          <button
            onClick={() => updateOrder(item.id, idx - 1)}
            disabled={idx === 0}
            className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-20"
            title="Monter"
          >
            ▲
          </button>
          <button
            onClick={() => updateOrder(item.id, idx + 1)}
            disabled={idx === sortedItems.length - 1}
            className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-20"
            title="Descendre"
          >
            ▼
          </button>
          <span
            className={`flex-1 truncate px-1 ${item.is_active ? 'text-slate-800' : 'text-slate-400 line-through'}`}
          >
            {item.title || item.label}
          </span>
          <button
            onClick={() => toggleActive(item)}
            className={`p-0.5 rounded ${item.is_active ? 'text-green-500' : 'text-slate-300'}`}
            title={item.is_active ? 'Désactiver' : 'Activer'}
          >
            {item.is_active ? '👁' : '👁‍🗨'}
          </button>
          <button
            onClick={() => deleteItem(item.id)}
            className="p-0.5 text-red-400 hover:text-red-600"
            title="Supprimer"
          >
            ✕
          </button>
        </div>
      ))}

      {/* Add new item */}
      <div className="pt-2 border-t border-slate-200">
        <input
          value={newTitle}
          onChange={(e: any) => setNewTitle(e.target.value)}
          placeholder="Titre du lien"
          className="w-full mb-1 px-2 py-1 text-xs border border-slate-300 rounded"
          onKeyDown={(e: any) => e.key === 'Enter' && addItem()}
        />
        <div className="flex gap-1">
          <input
            value={newUrl}
            onChange={(e: any) => setNewUrl(e.target.value)}
            placeholder="/chemin (optionnel)"
            className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded"
            onKeyDown={(e: any) => e.key === 'Enter' && addItem()}
          />
          <button
            onClick={addItem}
            disabled={adding || !newTitle.trim()}
            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            + Ajouter
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// HEADER BUILDER SETTINGS
// ─────────────────────────────────────────────
const HeaderBuilderSettings = () => {
  const {
    actions: { setProp },
    logoUrl,
    siteName,
    backgroundColor,
    textColor,
    accentColor,
    headerHeight,
    glassmorphism,
    sticky,
    showSearch,
    showAlert,
    alertText,
    alertType,
    showCta,
    ctaText,
    ctaLink,
  } = useNode((n: any) => ({ ...n.data.props }));

  const { data: menuItems, refetch: refetchMenu } = useMenuItems();

  const [showMenuEditor, setShowMenuEditor] = useState(false);

  return (
    <div className="space-y-4">
      {/* ── Section: Branding ── */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Marque</h4>
        <Row>
          <Label label="URL du logo" />
          <Input
            value={logoUrl}
            onChange={(e: any) => setProp((p: any) => (p.logoUrl = e.target.value))}
            placeholder="Laissez vide pour utiliser celui des réglages"
          />
        </Row>
        <Row>
          <Label label="Nom du site (fallback)" />
          <Input
            value={siteName}
            onChange={(e: any) => setProp((p: any) => (p.siteName = e.target.value))}
          />
        </Row>
      </div>

      {/* ── Section: Menu Editor ── */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
          <span>📋 Menu de navigation</span>
          <button
            onClick={() => setShowMenuEditor(!showMenuEditor)}
            className="text-[10px] text-blue-500 hover:text-blue-700 font-normal"
          >
            {showMenuEditor ? 'Masquer ▲' : 'Modifier ▼'}
          </button>
        </h4>
        {showMenuEditor && (
          <div className="p-2 bg-slate-50 rounded border border-slate-200">
            {menuItems && menuItems.length > 0 ? (
              <MenuEditor menuItems={menuItems} onRefresh={refetchMenu} />
            ) : (
              <p className="text-xs text-slate-400 italic">Chargement des éléments du menu...</p>
            )}
          </div>
        )}
      </div>

      {/* ── Section: Appearance ── */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Apparence
        </h4>
        <Row>
          <Label label="Couleur de fond" />
          <Color
            value={backgroundColor}
            onChange={(e: any) => setProp((p: any) => (p.backgroundColor = e.target.value))}
          />
        </Row>
        <Row>
          <Label label="Couleur du texte" />
          <Color
            value={textColor}
            onChange={(e: any) => setProp((p: any) => (p.textColor = e.target.value))}
          />
        </Row>
        <Row>
          <Label label="Couleur d'accent" />
          <Color
            value={accentColor}
            onChange={(e: any) => setProp((p: any) => (p.accentColor = e.target.value))}
          />
        </Row>
        <Row>
          <Label label="Hauteur du header (px)" />
          <Input
            type="number"
            min={48}
            max={160}
            value={headerHeight}
            onChange={(e: any) =>
              setProp((p: any) => (p.headerHeight = parseInt(e.target.value) || 72))
            }
          />
        </Row>
        <Row>
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={glassmorphism}
              onChange={(e: any) => setProp((p: any) => (p.glassmorphism = e.target.checked))}
              className="rounded"
            />
            Effet glassmorphism (arrière-plan flou)
          </label>
        </Row>
        <Row>
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={sticky}
              onChange={(e: any) => setProp((p: any) => (p.sticky = e.target.checked))}
              className="rounded"
            />
            Header fixe (sticky)
          </label>
        </Row>
      </div>

      {/* ── Section: Alert Bar ── */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Barre d&apos;alerte
        </h4>
        <Row>
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showAlert}
              onChange={(e: any) => setProp((p: any) => (p.showAlert = e.target.checked))}
              className="rounded"
            />
            Afficher la barre d&apos;alerte
          </label>
        </Row>
        {showAlert && (
          <>
            <Row>
              <Label label="Texte d'alerte" />
              <Input
                value={alertText}
                onChange={(e: any) => setProp((p: any) => (p.alertText = e.target.value))}
                placeholder="Message important..."
              />
            </Row>
            <Row>
              <Label label="Type d'alerte" />
              <Select
                value={alertType}
                onChange={(e: any) => setProp((p: any) => (p.alertType = e.target.value))}
                options={[
                  { value: 'info', label: 'Info' },
                  { value: 'success', label: 'Succès' },
                  { value: 'warning', label: 'Attention' },
                  { value: 'danger', label: 'Danger' },
                ]}
              />
            </Row>
          </>
        )}
      </div>

      {/* ── Section: Search ── */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Recherche
        </h4>
        <Row>
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showSearch}
              onChange={(e: any) => setProp((p: any) => (p.showSearch = e.target.checked))}
              className="rounded"
            />
            Afficher la barre de recherche
          </label>
        </Row>
      </div>

      {/* ── Section: CTA Button ── */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Bouton CTA
        </h4>
        <Row>
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showCta}
              onChange={(e: any) => setProp((p: any) => (p.showCta = e.target.checked))}
              className="rounded"
            />
            Afficher le bouton CTA
          </label>
        </Row>
        {showCta && (
          <>
            <Row>
              <Label label="Texte du CTA" />
              <Input
                value={ctaText}
                onChange={(e: any) => setProp((p: any) => (p.ctaText = e.target.value))}
              />
            </Row>
            <Row>
              <Label label="Lien du CTA" />
              <Input
                value={ctaLink}
                onChange={(e: any) => setProp((p: any) => (p.ctaLink = e.target.value))}
                placeholder="/contact"
              />
            </Row>
          </>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// CRAFT CONFIG — HeaderBuilderBlock
// ─────────────────────────────────────────────
HeaderBuilderBlock.craft = {
  displayName: 'Header Builder',
  props: {
    logoUrl: '',
    siteName: 'PROQUELEC',
    backgroundColor: '#ffffff',
    textColor: '#0f172a',
    accentColor: '#2376df',
    headerHeight: 72,
    glassmorphism: false,
    sticky: true,
    showSearch: false,
    showAlert: false,
    alertText: '',
    alertType: 'info',
    showCta: false,
    ctaText: 'Nous contacter',
    ctaLink: '/contact',
  },
  related: {
    settings: HeaderBuilderSettings,
  },
};

// ─────────────────────────────────────────────
// FOOTER BUILDER BLOCK
// ─────────────────────────────────────────────
export const FooterBuilderBlock = (props: any) => {
  const {
    backgroundColor = '#0f172a',
    textColor = '#ffffff',
    accentColor = '#2376df',
    columns = 4,
    showNewsletter = true,
    showCopyright = true,
    copyrightText = '',
    facebookUrl = '',
    linkedinUrl = '',
    twitterUrl = '',
  } = props;

  const {
    connectors: { connect, drag },
  } = useNode();
  const u = getUniversalStyles(props);
  const { settings } = useLiveSettings();
  const { data: menuItems } = useMenuItems();
  const currentYear = new Date().getFullYear();

  // Fetch footer menu items
  const footerNavItems =
    menuItems
      ?.filter((item: any) => item.menu_type === 'footer' && item.is_active)
      ?.sort((a: any, b: any) => (a.menu_order || 0) - (b.menu_order || 0)) || [];

  // Resolved social URLs: prop overrides settings
  const resolvedFacebook = facebookUrl || settings?.facebook_url || '';
  const resolvedLinkedin = linkedinUrl || settings?.linkedin_url || '';
  const resolvedTwitter = twitterUrl || settings?.twitter_url || '';
  const resolvedLogo = settings?.logo_url || '/logo.png';
  const resolvedSiteName = settings?.site_name || 'PROQUELEC';
  const resolvedSlogan = settings?.slogan || 'Sécurité · Qualité · Formation';
  const resolvedCopyright =
    copyrightText ||
    settings?.copyright_text ||
    `© ${currentYear} ${resolvedSiteName}. Tous droits réservés.`;

  // Split footer links into columns
  const chunkSize = Math.max(1, Math.ceil(footerNavItems.length / Math.max(1, columns - 1)));

  // Generate column data
  const columnData: { title: string; items: any[] }[] = [];

  // Column 1: Brand / About (always present)
  columnData.push({
    title: resolvedSiteName,
    items: [],
  });

  // Distribute remaining nav items across columns
  if (footerNavItems.length > 0) {
    for (let i = 0; i < footerNavItems.length; i += chunkSize) {
      columnData.push({
        title: i === 0 ? 'Navigation' : `Liens`,
        items: footerNavItems.slice(i, i + chunkSize),
      });
    }
  } else {
    // Fallback columns when no menu items
    columnData.push({
      title: 'Navigation',
      items: [
        { title: 'Accueil', url: '/' },
        { title: 'À propos', url: '/about' },
        { title: 'Services', url: '/services' },
        { title: 'Contact', url: '/contact' },
      ],
    });
    columnData.push({
      title: 'Services',
      items: [
        { title: 'Formations', url: '/formations' },
        { title: 'Certifications', url: '/certifications' },
        { title: 'Documentation', url: '/documents' },
      ],
    });
  }

  // Social column (always at the end if columns allow)
  const maxColumns = Math.min(columns, columnData.length + 1);

  // Responsive grid columns
  const gridColsClass =
    maxColumns <= 2
      ? 'sm:grid-cols-2'
      : maxColumns === 3
        ? 'sm:grid-cols-2 lg:grid-cols-3'
        : 'sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div
      ref={(r: any) => {
        if (r) connect(drag(r));
      }}
      style={{ ...u.style }}
      className={'proquelec-builder-node ' + u.className}
    >
      <footer style={{ backgroundColor, color: textColor }} className="relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl"
            style={{ background: textColor }}
          />
          <div
            className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl"
            style={{ background: textColor }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Main grid */}
          <div className={cn('grid grid-cols-1 gap-8 md:gap-12', gridColsClass)}>
            {/* Column 1: Brand & about */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={resolvedLogo}
                  alt={resolvedSiteName}
                  className="h-10 sm:h-12 w-auto object-contain"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== '/logo.png') {
                      target.src = '/logo.png';
                    }
                  }}
                />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">{resolvedSiteName}</h3>
              </div>
              <p className="text-xs sm:text-sm opacity-75 max-w-xs leading-relaxed">
                {resolvedSlogan}
              </p>

              {/* Contact info from settings */}
              {settings?.address && (
                <div className="flex items-start gap-2 text-xs sm:text-sm opacity-80">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{settings.address}</span>
                </div>
              )}
              {settings?.phone_number && (
                <a
                  href={`tel:${settings.phone_number}`}
                  className="flex items-center gap-2 text-xs sm:text-sm opacity-80 hover:opacity-100 transition-opacity"
                  style={{ color: textColor }}
                >
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>{settings.phone_number}</span>
                </a>
              )}
              {settings?.contact_email && (
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="flex items-center gap-2 text-xs sm:text-sm opacity-80 hover:opacity-100 transition-opacity"
                  style={{ color: textColor }}
                >
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="break-all">{settings.contact_email}</span>
                </a>
              )}
            </div>

            {/* Navigation columns */}
            {columnData.slice(0, maxColumns - 1).map((col, idx) => (
              <div key={`col-${idx}`}>
                <h4 className="text-sm sm:text-base font-semibold mb-4">{col.title}</h4>
                {idx === 0 ? (
                  // Brand column — no link list, just about text
                  <p className="text-xs sm:text-sm opacity-70 leading-relaxed">
                    {settings?.slogan ||
                      'Votre partenaire en sécurité électrique et formation professionnelle.'}
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {col.items.map((item: any, i: number) => (
                      <li key={item.id || item.url || `link-${i}`}>
                        <Link
                          to={item.url || '#'}
                          className="group inline-flex items-center gap-1.5 text-xs sm:text-sm opacity-80 hover:opacity-100 transition-all duration-200"
                          style={{ color: textColor }}
                        >
                          <ArrowRight className="h-3 w-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                          <span>{item.title || item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {/* Social links column */}
            {(resolvedFacebook || resolvedLinkedin || resolvedTwitter) && (
              <div>
                <h4 className="text-sm sm:text-base font-semibold mb-4">Suivez-nous</h4>
                <div className="flex flex-wrap gap-3">
                  {resolvedFacebook && (
                    <a
                      href={resolvedFacebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                      className="group flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 hover:scale-110"
                      style={{
                        background: `${textColor}15`,
                        color: textColor,
                      }}
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {resolvedLinkedin && (
                    <a
                      href={resolvedLinkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="group flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 hover:scale-110"
                      style={{
                        background: `${textColor}15`,
                        color: textColor,
                      }}
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {resolvedTwitter && (
                    <a
                      href={resolvedTwitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Twitter"
                      className="group flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 hover:scale-110"
                      style={{
                        background: `${textColor}15`,
                        color: textColor,
                      }}
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {settings?.contact_email && (
                    <a
                      href={`mailto:${settings.contact_email}`}
                      aria-label="Email"
                      className="group flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 hover:scale-110"
                      style={{
                        background: `${textColor}15`,
                        color: textColor,
                      }}
                    >
                      <Mail className="h-5 w-5" />
                    </a>
                  )}
                </div>

                {/* Newsletter signup */}
                {showNewsletter && (
                  <div className="mt-6">
                    <h5 className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-2">
                      Newsletter
                    </h5>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="Votre email"
                        className="flex-1 px-3 py-2 text-xs rounded-lg border bg-transparent focus:outline-none"
                        style={{
                          borderColor: `${textColor}25`,
                          color: textColor,
                        }}
                      />
                      <button
                        type="button"
                        className="px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-200 hover:opacity-90"
                        style={{
                          background: accentColor,
                          color: '#ffffff',
                        }}
                      >
                        OK
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Copyright bar */}
          {showCopyright && (
            <div
              className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{ borderColor: `${textColor}15` }}
            >
              <p className="text-xs sm:text-sm opacity-70 text-center sm:text-left">
                {resolvedCopyright}
              </p>
              <div className="flex gap-4 text-xs sm:text-sm opacity-60">
                <Link
                  to="/legal"
                  className="hover:opacity-100 transition-opacity"
                  style={{ color: textColor }}
                >
                  Mentions légales
                </Link>
                <span className="opacity-30">·</span>
                <Link
                  to="/privacy"
                  className="hover:opacity-100 transition-opacity"
                  style={{ color: textColor }}
                >
                  Confidentialité
                </Link>
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

// ─────────────────────────────────────────────
// FOOTER BUILDER SETTINGS
// ─────────────────────────────────────────────
const FooterBuilderSettings = () => {
  const {
    actions: { setProp },
    backgroundColor,
    textColor,
    accentColor,
    columns,
    showNewsletter,
    showCopyright,
    copyrightText,
    facebookUrl,
    linkedinUrl,
    twitterUrl,
  } = useNode((n: any) => ({ ...n.data.props }));

  return (
    <div className="space-y-4">
      {/* ── Section: Appearance ── */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Apparence
        </h4>
        <Row>
          <Label label="Couleur de fond" />
          <Color
            value={backgroundColor}
            onChange={(e: any) => setProp((p: any) => (p.backgroundColor = e.target.value))}
          />
        </Row>
        <Row>
          <Label label="Couleur du texte" />
          <Color
            value={textColor}
            onChange={(e: any) => setProp((p: any) => (p.textColor = e.target.value))}
          />
        </Row>
        <Row>
          <Label label="Couleur d'accent" />
          <Color
            value={accentColor}
            onChange={(e: any) => setProp((p: any) => (p.accentColor = e.target.value))}
          />
        </Row>
        <Row>
          <Label label="Nombre de colonnes" />
          <Select
            value={String(columns)}
            onChange={(e: any) => setProp((p: any) => (p.columns = parseInt(e.target.value) || 4))}
            options={[
              { value: '2', label: '2 colonnes' },
              { value: '3', label: '3 colonnes' },
              { value: '4', label: '4 colonnes' },
            ]}
          />
        </Row>
      </div>

      {/* ── Section: Social Links ── */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Réseaux sociaux
        </h4>
        <Row>
          <Label label="Facebook URL" />
          <Input
            value={facebookUrl}
            onChange={(e: any) => setProp((p: any) => (p.facebookUrl = e.target.value))}
            placeholder="Laissez vide pour utiliser les réglages"
          />
        </Row>
        <Row>
          <Label label="LinkedIn URL" />
          <Input
            value={linkedinUrl}
            onChange={(e: any) => setProp((p: any) => (p.linkedinUrl = e.target.value))}
            placeholder="Laissez vide pour utiliser les réglages"
          />
        </Row>
        <Row>
          <Label label="Twitter URL" />
          <Input
            value={twitterUrl}
            onChange={(e: any) => setProp((p: any) => (p.twitterUrl = e.target.value))}
            placeholder="Laissez vide pour utiliser les réglages"
          />
        </Row>
      </div>

      {/* ── Section: Newsletter ── */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Newsletter
        </h4>
        <Row>
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showNewsletter}
              onChange={(e: any) => setProp((p: any) => (p.showNewsletter = e.target.checked))}
              className="rounded"
            />
            Afficher l&apos;inscription newsletter
          </label>
        </Row>
      </div>

      {/* ── Section: Copyright ── */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Copyright
        </h4>
        <Row>
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={showCopyright}
              onChange={(e: any) => setProp((p: any) => (p.showCopyright = e.target.checked))}
              className="rounded"
            />
            Afficher le copyright
          </label>
        </Row>
        {showCopyright && (
          <Row>
            <Label label="Texte personnalisé" />
            <SettingsTextarea
              rows={2}
              value={copyrightText}
              onChange={(e: any) => setProp((p: any) => (p.copyrightText = e.target.value))}
              placeholder="Laissez vide pour utiliser les réglages du site"
            />
          </Row>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// CRAFT CONFIG — FooterBuilderBlock
// ─────────────────────────────────────────────
FooterBuilderBlock.craft = {
  displayName: 'Footer Builder',
  props: {
    backgroundColor: '#0f172a',
    textColor: '#ffffff',
    accentColor: '#2376df',
    columns: 4,
    showNewsletter: true,
    showCopyright: true,
    copyrightText: '',
    facebookUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
  },
  related: {
    settings: FooterBuilderSettings,
  },
};
