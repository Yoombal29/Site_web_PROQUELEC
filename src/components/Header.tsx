
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight, ChevronDown, BookOpen, Award, Phone, Home, Info, LogOut, User, LayoutDashboard, Wrench, Bell, Star, Shield, Zap, Search, HelpCircle, FileText, Briefcase, GraduationCap, PenTool, MoreHorizontal, Globe, Sparkles } from "lucide-react";

// Icon mapping for dynamic icons from DB
const ICON_MAP: Record<string, unknown> = {
  BookOpen, Award, Phone, Home, Info, LayoutDashboard, Wrench, Bell, Star, Shield, Zap, Search, HelpCircle, FileText, Briefcase, GraduationCap, Globe, Sparkles
};

import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLiveSettings } from "@/hooks/useLiveSettings";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useSession } from "@/hooks/useSession";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { SearchGlobal } from "@/components/SearchGlobal";
import { useRef, useLayoutEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { getDashboardPath } from "@/utils/navigation";

interface HeaderProps {
  solid?: boolean;
}

export const Header = ({ solid = false }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAdmin } = useIsAdmin();
  const location = useLocation();
  const { settings } = useLiveSettings();
  const { schema } = useSiteConfig();
  const { data: menuItems } = useMenuItems();
  const { user, isLoading, signOut } = useSession();
  const navigate = useNavigate();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownTimeout, setDropdownTimeout] = useState<number | null>(null);
  const [visibleItemsCount, setVisibleItemsCount] = useState<number>(20); // High default
  const navContainerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!navContainerRef.current) return;
      const container = navContainerRef.current;
      const containerWidth = container.offsetWidth;
      const items = Array.from(container.children) as HTMLElement[];

      let currentWidth = 0;
      let count = 0;
      const buffer = 150; // Reserve space for "More" and CTAs

      for (let i = 0; i < items.length; i++) {
        // Ignore the "hidden" items and the "More" button itself for measurement
        if (items[i].classList.contains('overflow-trigger')) continue;

        currentWidth += items[i].offsetWidth + 8; // width + gap
        if (currentWidth > containerWidth - buffer) {
          break;
        }
        count++;
      }
      setVisibleItemsCount(count);
    };

    const observer = new ResizeObserver(handleResize);
    if (navContainerRef.current) observer.observe(navContainerRef.current);
    handleResize(); // Initial check

    return () => observer.disconnect();
  }, [menuItems]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }
    setActiveDropdown(label);
  };

  const handleDropdownLeave = () => {
    const timeout = window.setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
    setDropdownTimeout(timeout);
  };

  const handleDropdownClick = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const handleLogout = async () => {
    await signOut();
    setIsUserMenuOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const handleScroll = () => {
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerConfig = schema?.globals?.header || {};
  const isCompact = scrolled || solid;

  // Secondary menu items
  const dbSecondaryMenuItems = menuItems?.
  filter((item) => item.is_active && (item.menu_type === 'secondary' || item.menu_type === 'top')).
  sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0)) || [];

  useEffect(() => {
    const alertH = headerConfig.alertEnabled ? 40 : 0;
    const topBarH = !scrolled && dbSecondaryMenuItems.length > 0 ? 36 : 0;
    const mainH = parseInt(headerConfig.height ?? (isCompact ? '80' : '110'));
    const total = alertH + topBarH + mainH;
    document.documentElement.style.setProperty('--effective-header-height', `${total}px`);
  }, [scrolled, solid, headerConfig, dbSecondaryMenuItems, isCompact]);

  // Filtrer les éléments de menu actifs
  const dbMainMenuItems = menuItems?.
  filter((item) => item.is_active && item.menu_type === 'main').
  sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0)) || [];

  // Navigation links - Prioritize DB if exists, otherwise fallback to defaults
  const mainNavLinks = dbMainMenuItems.length > 0 ?
  dbMainMenuItems.
  filter((item) => !item.parent_id) // Only top level for main nav
  .map((item) => ({
    id: item.id,
    label: item.title,
    path: item.url,
    icon: Home, // Default icon, could be dynamic
    submenu: dbMainMenuItems.
    filter((sub) => sub.parent_id === item.id).
    map((sub) => ({ id: sub.id, label: sub.title, path: sub.url }))
  })) :
  [
  { label: "Accueil", path: "/", icon: Home },
  {
    label: "À Propos",
    path: "/about",
    icon: Info,
    submenu: [
    { label: "À propos de PROQUELEC", path: "/about" }]

  }];


  // Mega menu groupé par sections (Dynamique depuis DB si possible)
  const dbMegaItems = menuItems?.filter((item) => item.is_active && item.menu_type === 'mega') || [];

  const megaMenuSections = dbMegaItems.length > 0 ?
  dbMegaItems.
  filter((item) => !item.parent_id).
  sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0)).
  map((section) => ({
    label: section.title,
    icon: ICON_MAP[section.icon || 'BookOpen'] || BookOpen,
    columns: dbMegaItems.
    filter((col) => col.parent_id === section.id).
    sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0)).
    map((col) => ({
      title: col.title,
      items: dbMegaItems.
      filter((item) => item.parent_id === col.id).
      sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0)).
      map((item) => ({ label: item.title, path: item.url }))
    }))
  })) :
  [
  {
    label: "Services & Expertise",
    icon: BookOpen,
    columns: [
    {
      title: "Ingénierie",
      items: [
      { label: "Formations", path: "/formations" },
      { label: "Certifications", path: "/certifications" },
      { label: "Expertises", path: "/expertises-techniques" },
      { label: "Expert Lab", path: "/expert-lab" }]

    },
    {
      title: "Labels & Activités",
      items: [
      { label: "Labels PROQUELEC", path: "/labels" },
      { label: "Nos Activités", path: "/activities" },
      { label: "Showroom", path: "/showroom" }]

    },
    {
      title: "Ressources",
      items: [
      { label: "Documents", path: "/documents" },
      { label: "Événements", path: "/events" },
      { label: "Outils métier", path: "/outils" }]

    },
    {
      title: "Espaces Métiers",
      items: [
      { label: "Espace Autorités", path: "/autorites" },
      { label: "Espace Ménages", path: "/menages" },
      { label: "Espace Professionnels", path: "/professionnels" },
      { label: "Espace Presse", path: "/presse" },
      { label: "Réseaux & Social", path: "/social" }]

    }]

  }];


  // Rest of active items (not in main nav and not excluded)
  const excludedUrls = [
  "/",
  "/about",
  "/activities",
  "/labels",
  "/documents",
  "/events",
  "/certifications",
  "/formations",
  "/blog",
  "/contact",
  "/actualites",
  "/showroom"];


  const activeMenuItems = menuItems?.
  filter((item) => item.is_active && item.menu_type !== 'main' && !excludedUrls.includes(item.url)).
  map((item) => ({ id: item.id, title: item.title, url: item.url, menu_order: item.menu_order })).
  sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0)) || [];

  const NavLink = ({ to, children, icon: Icon, isHighlight = false, isActive = false, isMobile = false }) =>
  <Link
    to={to}
    className={cn(
      "group relative flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300",
      isMobile
        ? "text-slate-900 hover:text-slate-900 bg-slate-50 hover:bg-slate-100"
        : scrolled || solid ? "text-white" : "text-white/90 hover:text-white",
      isActive && (isMobile ? "bg-slate-200 text-slate-900" : "bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] text-white")
    )}
    onClick={() => setIsMenuOpen(false)}>

      {isActive &&
    <motion.div
      layoutId="nav-bg"
      className={cn("absolute inset-0 rounded-xl -z-10 border border-white/20", isMobile ? "bg-slate-200/80" : "bg-white/10")}
      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }} />

    }
      {Icon && <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive && "text-blue-400")} />}
      {children}
      {!isActive && <div className="absolute bottom-1.5 left-4 right-4 h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full opacity-50" />}
    </Link>;


  const MegaMenuLink = ({ section }) => {
    const isActive = activeDropdown === section.label;
    return (
      <div
        className="relative"
        onMouseEnter={() => handleDropdownEnter(section.label)}
        onMouseLeave={handleDropdownLeave}>

        <button
          className={cn(
            "group relative flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300",
            scrolled || solid ? "text-white" : "text-white/90 hover:text-white",
            isActive && "bg-white/20 text-white"
          )}
          onClick={() => handleDropdownClick(section.label)} aria-label="Action">

          {section.icon && <section.icon className="h-4 w-4 transition-transform group-hover:scale-110" />}
          {section.label}
          <ChevronDown className={cn("h-3 w-3 transition-transform duration-300 opacity-50", isActive && "rotate-180")} />
        </button>

        <AnimatePresence>
          {isActive &&
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/10 overflow-hidden z-[110] grid grid-cols-4 gap-0 min-w-[950px] origin-top-left">

              {section.columns.map((column, colIdx) =>
            <div key={colIdx} className="px-6 py-8 border-r border-white/5 last:border-r-0">
                  <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    {column.title}
                  </h3>
                  <ul className="space-y-3.5">
                    {column.items.map((item, idx) =>
                <li key={idx}>
                        <Link
                    to={item.path}
                    className="text-xs font-medium text-slate-300 hover:text-white hover:translate-x-1.5 transition-all duration-200 block group/item flex items-center gap-2 py-0.5"
                    onClick={() => {
                      setActiveDropdown(null);
                      setIsMenuOpen(false);
                    }}>

                          <span className="w-0 group-hover/item:w-3.5 h-[1.5px] bg-blue-400 transition-all" />
                          {item.label}
                        </Link>
                      </li>
                )}
                  </ul>
                </div>
            )}
            </motion.div>
          }
        </AnimatePresence>
      </div>);

  };

  const DropdownNavLink = ({ item, isHighlight = false }) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isActive = activeDropdown === item.label || location.pathname === item.path;

    if (!hasSubmenu) {
      return (
        <NavLink to={item.path} icon={item.icon} isHighlight={isHighlight} isActive={location.pathname === item.path}>
          {item.label}
        </NavLink>);

    }

    // Calcul dynamique du nombre de colonnes optimal
    const count = item.submenu.length;
    const colCount = count <= 4 ? 1 : count <= 8 ? 2 : count <= 15 ? 3 : 4;
    const colWidthMap: Record<number, string> = {
      1: "w-56",
      2: "w-[420px]",
      3: "w-[620px]",
      4: "w-[800px]",
    };
    const colGridMap: Record<number, string> = {
      1: "flex flex-col",
      2: "grid grid-cols-2 gap-x-1",
      3: "grid grid-cols-3 gap-x-1",
      4: "grid grid-cols-4 gap-x-1",
    };

    return (
      <div
        className="relative"
        onMouseEnter={() => handleDropdownEnter(item.label)}
        onMouseLeave={handleDropdownLeave}>

        <button
          className={cn(
            "group relative flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300",
            scrolled || solid ? "text-white" : "text-white/90 hover:text-white",
            activeDropdown === item.label && "bg-white/10 text-white"
          )}
          onClick={() => {
            // Si l'item a un vrai path, naviguer directement vers la page
            if (item.path && item.path !== '#') {
              navigate(item.path);
              setActiveDropdown(null);
              setIsMenuOpen(false);
            } else {
              handleDropdownClick(item.label);
            }
          }} aria-label="Action">

          {item.icon && <item.icon className="h-4 w-4 transition-transform group-hover:scale-110" />}
          {item.label}
          <ChevronDown
            className={cn("h-3 w-3 transition-transform duration-300 opacity-50", activeDropdown === item.label && "rotate-180")}
            onClick={(e) => {
              // Permettre de toggler le dropdown via la flèche sans naviguer
              e.stopPropagation();
              handleDropdownClick(item.label);
            }}
          />
        </button>

        <AnimatePresence>
          {activeDropdown === item.label &&
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={cn(
              "absolute top-full right-0 mt-2 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/10 p-2 overflow-hidden z-[110] origin-top-right",
              colWidthMap[colCount],
              colGridMap[colCount]
            )}>

              {item.submenu.map((subItem, index) =>
            <Link
              key={subItem.id || `sub-${index}`}
              to={subItem.path}
              className="group flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all whitespace-nowrap"
              onClick={() => {
                setActiveDropdown(null);
                setIsMenuOpen(false);
              }}>

                  <div className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-blue-400 group-hover:scale-125 transition-all flex-shrink-0" />
                  {subItem.label}
                </Link>
            )}
            </motion.div>
          }
        </AnimatePresence>
      </div>);

  };

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'success':return 'bg-green-600 text-white';
      case 'warning':return 'bg-amber-500 text-white';
      case 'error':return 'bg-red-600 text-white';
      default:return 'bg-proqblue text-white';
    }
  };



  return (
    <header
      id="site-header"
      className={cn(
        "sticky top-0 left-0 right-0 z-[100] w-full transition-all duration-500 ease-in-out",
        isCompact ? 'header-compact' : 'header-expanded'
      )}>
      {!scrolled && dbSecondaryMenuItems.length > 0 &&
      <div className="w-full bg-slate-900/40 backdrop-blur-md border-b border-white/5 py-2 px-6 hidden sm:block">
          <div className="container mx-auto flex justify-end gap-6">
            {dbSecondaryMenuItems.filter((item) => !item.parent_id).map((item) =>
          <Link
            key={item.id}
            to={item.url}
            className="text-[10px] font-bold text-white/60 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2 group">

                <div className="w-1 h-1 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {item.title}
              </Link>
          )}
          </div>
        </div>
      }

      {/* Barre d'alerte dynamique */}
      {headerConfig.alertEnabled && headerConfig.alertText &&
      <div className={`w-full h-[var(--alert-height)] flex items-center justify-center px-4 overflow-hidden relative z-[101] ${getAlertStyles(headerConfig.alertType)}`}>
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-1 duration-500">
            <Bell className="h-3 w-3 animate-bounce" />
            <span className="truncate">{headerConfig.alertText}</span>
          </div>
        </div>
      }

      {/* Main Header Container */}
      <div
        className={cn(
          "w-full relative transition-all duration-500 flex items-center header-container-vars",
          isCompact ? 'h-[80px]' : 'h-[110px]'
        )}>

        <div className="container mx-auto px-4 md:px-6 h-full flex items-center">
          <div className="flex items-center justify-between w-full mx-auto">
            {/* Logo et nom */}
            <Link to="/" className="flex items-center gap-3 sm:gap-5 flex-shrink-0 min-w-0 group relative">
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 rounded-full blur-xl scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <img
                  src={settings?.logo_url || "/logo.png"}
                  alt={settings?.site_name || "PROQUELEC"}
                  className="w-auto object-contain transition-all duration-700 group-hover:scale-[1.3] drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] header-logo-filter header-logo-dynamic"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== "/logo.png") {
                      target.src = "/logo.png";
                    }
                  }} loading="lazy" />

              </div>

              <div className="flex flex-col justify-center border-l border-white/20 pl-4 py-1">
                <h1
                  className="text-lg sm:text-xl md:text-2xl font-black leading-none text-white uppercase tracking-tighter text-shadow-md">

                  {settings?.site_name?.replace('S?N?GAL', 'SÉNÉGAL')?.replace('S?n?gal', 'Sénégal')?.replace(' SÉNÉGAL', '') || "PROQUELEC"}
                </h1>
                <p className="text-[10px] sm:text-[11px] font-bold text-white/70 uppercase tracking-[0.1em] mt-1 text-shadow-sm">
                  {settings?.slogan?.replace('S?curit?', 'Sécurité')?.replace('Qualit?', 'Qualité')?.replace('S?n?gal', 'Sénégal') || "Sécurité · Qualité · Formation"}
                </p>
              </div>
            </Link>

            {/* Barre de recherche (Position: LEFT) */}
            {headerConfig.searchEnabled && headerConfig.searchPosition === 'left' &&
            <div className="hidden xl:flex ml-8 max-w-[200px] 2xl:max-w-xs transition-all duration-300">
                <SearchGlobal />
              </div>
            }

            {/* Navigation desktop intelligente */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-4 flex-1 justify-end">
              <div
                ref={navContainerRef}
                className="flex items-center gap-1 xl:gap-2 flex-1 justify-end overflow-visible max-h-[50px] transition-all duration-500">

                {/* Combinaison dynamique de tous les liens pour le calcul d'overflow */}
                {[
                ...mainNavLinks.map((l) => ({ ...l, type: 'nav' })),
                ...megaMenuSections.map((s) => ({ ...s, type: 'mega' })),
                ...activeMenuItems.map((m) => ({ label: m.title, path: m.url, type: 'extra' }))].
                map((item: unknown, idx) => {
                  // Gérer l'affichage conditionnel basé sur le calcul d'overflow
                  const isVisible = idx < visibleItemsCount;

                  if (!isVisible) return null;

                  if (item.type === 'mega') return <MegaMenuLink key={item.label} section={item} />;
                  return <DropdownNavLink key={item.id || item.path || item.label} item={item} />;
                })}

                {/* Bouton "Plus" intelligent si overflow */}
                {[
                ...mainNavLinks.map((l) => ({ ...l, type: 'nav' })),
                ...megaMenuSections.map((s) => ({ ...s, type: 'mega' })),
                ...activeMenuItems.map((m) => ({ label: m.title, path: m.url, type: 'extra' }))].
                length > visibleItemsCount &&
                <div className="overflow-trigger">
                  {(() => {
                    // Construire un sous-menu organisé par thématique
                    const navCount = mainNavLinks.length;
                    const megaCount = megaMenuSections.length;
                    let idx = visibleItemsCount;

                    const groups = [];

                    // Items de navigation cachés
                    const hiddenNavs = mainNavLinks.slice(visibleItemsCount);
                    if (hiddenNavs.length > 0) {
                      groups.push({ label: 'Navigation', items: hiddenNavs.map(l => ({ id: l.id, label: l.label, path: l.path })) });
                      idx += hiddenNavs.length;
                    }

                    // Méga-menu cachés organisés par section
                    const hiddenMegaCount = Math.max(0, idx - navCount);
                    const hiddenMegas = megaMenuSections.slice(hiddenMegaCount);
                    for (const section of hiddenMegas) {
                      const sectionItems = section.columns.flatMap(col =>
                        col.items.map(item => ({ id: section.label+'-'+item.label, label: item.label, path: item.path }))
                      ).filter(item => item.path);
                      if (sectionItems.length > 0) {
                        groups.push({ label: section.label, items: sectionItems });
                        idx += 1; // approximatif
                      }
                    }

                    // Items actifs supplémentaires
                    const extraStart = Math.max(0, idx - navCount - megaCount);
                    const hiddenExtras = activeMenuItems.slice(extraStart);
                    if (hiddenExtras.length > 0) {
                      groups.push({ label: 'Autres', items: hiddenExtras.map(m => ({ id: m.id, label: m.title, path: m.url })) });
                    }

                    // Filtrer les groupes vides
                    const validGroups = groups.filter(g => g.items.length > 0);

                    const totalItems = validGroups.reduce((sum, g) => sum + g.items.length + 1, 0);
                    const colCount = totalItems <= 8 ? 1 : totalItems <= 16 ? 2 : 3;

                    return (
                      <div className="relative"
                        onMouseEnter={() => handleDropdownEnter('__overflow__')}
                        onMouseLeave={handleDropdownLeave}>
                        <button
                          className={cn("group relative flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-sm transition-all duration-300", scrolled||solid ? "text-white" : "text-white/90 hover:text-white", activeDropdown === '__overflow__' && "bg-white/10 text-white")}
                          onClick={() => handleDropdownClick('__overflow__')}
                          aria-label="Plus de pages">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="hidden sm:inline">Plus</span>
                          <ChevronDown className={cn("h-3 w-3 transition-transform duration-300 opacity-50", activeDropdown === '__overflow__' && "rotate-180")} />
                        </button>
                        <AnimatePresence>
                          {activeDropdown === '__overflow__' &&
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className={cn("absolute top-full right-0 mt-2 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-white/10 p-4 overflow-hidden z-[110] origin-top-right", colCount === 1 ? 'w-64' : colCount === 2 ? 'w-[500px]' : 'w-[700px]')}>
                              <div className={cn('grid gap-x-3', colCount === 1 ? 'grid-cols-1' : colCount === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
                                {validGroups.map((group, gi) => (
                                  <div key={gi} className="mb-2">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 px-3 py-1.5">{group.label}</p>
                                    {group.items.map((item, ii) => (
                                      <Link
                                        key={item.id || ii}
                                        to={item.path}
                                        className="group flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all whitespace-nowrap"
                                        onClick={() => { setActiveDropdown(null); setIsMenuOpen(false); }}>
                                        <div className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-blue-400 group-hover:scale-125 transition-all flex-shrink-0" />
                                        {item.label}
                                      </Link>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          }
                        </AnimatePresence>
                      </div>
                    );
                  })()}
                </div>
                }
              </div>

              {/* Barre de recherche (Position: CENTER) */}
              {headerConfig.searchEnabled && (headerConfig.searchPosition === 'center' || !headerConfig.searchPosition) &&
              <div className="hidden xl:flex mx-4 max-w-[180px] transition-all duration-300">
                  <SearchGlobal />
                </div>
              }

              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white/20 flex-shrink-0">
                {/* CTA dynamique 1 (Primaire) */}
                {settings?.cta_primary_text &&
                <Link to={settings.cta_primary_url || "/contact"}>
                    <Button
                    className="text-xs md:text-sm px-4 py-2 font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm bg-white/20 hover:bg-white/30 text-white border border-white/20">

                      <Zap className="h-4 w-4" />
                      <span className="hidden xl:inline">{settings.cta_primary_text}</span>
                    </Button>
                  </Link>
                }

                {/* CTA dynamique 2 (Secondaire) */}
                {settings?.cta_secondary_text &&
                <Link to={settings.cta_secondary_url || "#"}>
                    <Button
                    variant="outline"
                    className="hidden sm:flex text-xs md:text-sm px-4 py-2 font-semibold rounded-lg transition-all duration-200 items-center gap-2 bg-transparent border-white/30 text-white hover:bg-white/10">

                      <Star className="h-4 w-4" />
                      <span className="hidden xl:inline">{settings.cta_secondary_text}</span>
                    </Button>
                  </Link>
                }

                {/* Fallback si aucun CTA défini */}
                {!settings?.cta_primary_text && !settings?.cta_secondary_text &&
                <Link to="/contact">
                    <Button
                    className="text-xs md:text-sm px-4 py-2 font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm bg-white/20 hover:bg-white/30 text-white border border-white/20">

                      <Phone className="h-4 w-4" />
                      <span className="hidden xl:inline">Contact</span>
                    </Button>
                  </Link>
                }

                {/* Barre de recherche (Position: RIGHT) */}
                {headerConfig.searchEnabled && headerConfig.searchPosition === 'right' &&
                <div className="hidden lg:flex ml-2 max-w-[150px] xl:max-w-[200px] transition-all duration-300">
                    <SearchGlobal />
                  </div>
                }

                {!isLoading && user ?
                <div className="flex items-center gap-2">
                    <div className="relative">
                      <button
                      onClick={toggleUserMenu}
                      className="text-xs md:text-sm px-3 py-2 font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2 bg-white text-blue-600" aria-label="Action">

                        <User className="h-4 w-4" />
                        <span className="hidden md:inline">{user.email?.split('@')[0]}</span>
                      </button>

                      {isUserMenuOpen &&
                    <div className="absolute right-0 mt-2 w-52 bg-card rounded-xl shadow-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[100]">
                          <div className="px-4 py-4 border-b border-border bg-muted/30">
                            <p className="text-sm font-bold text-foreground truncate">{user.email}</p>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Session Active</p>
                          </div>
                          <div className="p-1">
                            <Link
                          to={user ? getDashboardPath(user.role) : "/dashboard"}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent rounded-lg transition-colors">

                              <LayoutDashboard className="h-4 w-4 text-proqblue" />
                              Tableau de bord
                            </Link>
                            {isAdmin &&
                        <Link
                          to="/admin?tab=pages"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-accent rounded-lg transition-colors border-t border-border mt-1 font-bold text-emerald-600">

                                <PenTool className="h-4 w-4" />
                                BE Builder (Pages)
                              </Link>
                        }
                            <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border-t border-border mt-1">

                              <LogOut className="h-4 w-4" />
                              Déconnexion
                            </button>
                          </div>
                        </div>
                    }
                    </div>
                    {/* Notification Bell */}
                    <div className="relative">
                      <button
                      className="p-2 rounded-full hover:bg-white/10 transition-colors relative group"
                      aria-label="Notifications">

                        <Bell className="h-5 w-5 text-white" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
                      </button>
                    </div>
                  </div> :

                <Link to="/connexion">
                    <Button
                    className="text-xs md:text-sm px-4 py-2 font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg bg-white text-blue-600 hover:bg-blue-50">

                      Connexion
                    </Button>
                  </Link>
                }
              </div>
            </div>

            {/* Navigation tablet/mobile */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={toggleMenu}
                className="p-2 rounded-lg transition-all duration-200 text-white hover:bg-white/10"
                aria-label="Menu">

                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu mobile/tablet */}
      {isMenuOpen &&
      <div className="lg:hidden mt-0 pb-4 space-y-3 border-t border-slate-200 pt-4 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto bg-white shadow-2xl">
          <div className="px-4 space-y-4">
            <div className="space-y-1">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Navigation</p>
              {mainNavLinks.map((link) =>
            <NavLink key={link.id || link.path} to={link.path} icon={link.icon} isMobile>
                  {link.label}
                </NavLink>
            )}
            </div>

            <div className="space-y-1">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Espace Information</p>
              <NavLink to="/blog" icon={ChevronRight} isMobile>Actualités</NavLink>
              <NavLink to="/documents" icon={ChevronRight} isMobile>Documents</NavLink>
              <NavLink to="/showroom" icon={ChevronRight} isMobile>Showroom</NavLink>
            </div>

            {megaMenuSections.map((section) => (
            <div key={section.label} className="space-y-1">
                <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">{section.label}</p>
                {section.columns.flatMap((column) => column.items).map((item) => (
              <NavLink key={`${section.label}-${item.path}`} to={item.path} icon={ChevronRight} isMobile>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            ))}

            {activeMenuItems.length > 0 &&
            <div className="space-y-1">
                <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Autres pages</p>
                {activeMenuItems.map((item) => (
              <NavLink key={item.id} to={item.url} icon={ChevronRight} isMobile>
                    {item.title}
                  </NavLink>
                ))}
              </div>
            }

            <div className="pt-3 flex flex-col gap-2">
              {!isLoading && user ?
            <>
                  <Link to={getDashboardPath(user.role)} onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-proqblue text-white justify-center gap-2 rounded-2xl py-5 shadow-lg shadow-proqblue/20 border border-proqblue">
                      <LayoutDashboard className="h-5 w-5" />
                      Tableau de bord
                    </Button>
                  </Link>
                  <Button
                variant="destructive"
                onClick={() => {handleLogout();setIsMenuOpen(false);}}
                className="w-full justify-center gap-2 rounded-2xl py-4 bg-red-500 text-white hover:bg-red-600 shadow-sm">

                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </Button>
                </> :

            <Link to="/connexion" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-proqblue text-white justify-center gap-2 rounded-2xl py-5 shadow-lg shadow-proqblue/20 border border-proqblue">
                    Accès Membre / Admin
                  </Button>
                </Link>
            }
              <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center gap-2 rounded-2xl py-4 border border-proqblue bg-white text-proqblue hover:bg-slate-50">
                  <Phone className="h-4 w-4" />
                  Nous Contacter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      }
    </header>);

};
