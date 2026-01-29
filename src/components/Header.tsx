
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight, BookOpen, Award, Phone, Home, Info, LogOut, User, LayoutDashboard, Wrench } from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLiveSettings } from "@/hooks/useLiveSettings";
import { useMenuItems } from "@/hooks/useMenuItems";
import { useSession } from "@/hooks/useSession";
import { DynamicMenu } from "@/components/DynamicMenu";
import { supabase } from "@/integrations/supabase/client";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { settings } = useLiveSettings();
  const { data: menuItems } = useMenuItems();
  const { user, isLoading } = useSession();
  const navigate = useNavigate();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownTimeout, setDropdownTimeout] = useState<NodeJS.Timeout | null>(null);

  // Nettoyage du timeout lors du démontage
  useEffect(() => {
    return () => {
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
      }
    };
  }, [dropdownTimeout]);

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
    const timeout = setTimeout(() => {
      setActiveDropdown(null);
    }, 150); // Délai de 150ms pour éviter la fermeture accidentelle
    setDropdownTimeout(timeout);
  };

  const handleDropdownClick = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsUserMenuOpen(false);
    navigate("/");
  };

  const dynamicStyle = {
    backgroundColor: settings?.primary_color || '#2376df',
    color: settings?.text_color || '#ffffff',
    boxShadow: scrolled ? '0 8px 32px rgba(35, 118, 223, 0.2)' : 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  };

  // Navigation links organisés par domaine d'expertise
  const mainNavLinks = [
    { label: "Accueil", path: "/", icon: Home },
    {
      label: "À Propos",
      path: "/about",
      icon: Info,
      submenu: [
        { label: "À propos de PROQUELEC", path: "/about" }
      ]
    },
  ];

  // Mega menu groupé par sections
  const megaMenuSections = [
    {
      label: "Formation & Services",
      icon: BookOpen,
      columns: [
        {
          title: "Formations",
          items: [
            { label: "Catalogue Formations", path: "/formations" }
          ]
        },
        {
          title: "Certifications & Labels",
          items: [
            { label: "Programme Certification", path: "/certifications" },
            { label: "Labels PROQUELEC", path: "/labels" }
          ]
        },
        {
          title: "Expertise Technique",
          items: [
            { label: "Solutions & Expertises", path: "/expertises-techniques" }
          ]
        }
      ]
    },
    {
      label: "Ressources",
      icon: ChevronRight,
      columns: [
        {
          title: "Nos Activités",
          items: [
            { label: "Activités & Services", path: "/activities" },
            { label: "Showroom Technique", path: "/showroom" }
          ]
        },
        {
          title: "Documentation & Outils",
          items: [
            { label: "Documents & Ressources", path: "/documents" },
            { label: "Base de Données Matériaux", path: "/outils" }
          ]
        },
        {
          title: "Événements",
          items: [
            { label: "Événements & Actualités", path: "/events" }
          ]
        }
      ]
    }
  ];

  // Filtrer les éléments de menu actifs et les trier
  // Exclure les URLs déjà présentes dans les menus principaux
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
    "/showroom"
  ];

  const activeMenuItems = menuItems
    ?.filter(item => item.is_active && !excludedUrls.includes(item.url))
    .sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0)) || [];

  const NavLink = ({ to, children, icon: Icon, isHighlight = false }) => (
    <Link
      to={to}
      className={`group flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isHighlight
        ? 'bg-white bg-opacity-20 hover:bg-opacity-30'
        : 'hover:bg-white hover:bg-opacity-10'
        }`}
      onClick={() => setIsMenuOpen(false)}
    >
      {Icon && <Icon className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />}
      {children}
    </Link>
  );

  const MegaMenuLink = ({ section, isHighlight = false }) => {
    return (
      <div
        className="relative"
        onMouseEnter={() => handleDropdownEnter(section.label)}
        onMouseLeave={handleDropdownLeave}
      >
        <button
          className={`group flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isHighlight
            ? 'bg-white bg-opacity-20 hover:bg-opacity-30'
            : 'hover:bg-white hover:bg-opacity-10'
            }`}
          onClick={() => handleDropdownClick(section.label)}
        >
          {section.icon && <section.icon className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />}
          {section.label}
          <ChevronRight className={`h-3 w-3 transition-transform duration-200 ${activeDropdown === section.label ? 'rotate-90' : ''}`} />
        </button>

        {activeDropdown === section.label && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50 grid grid-cols-3 gap-0 min-w-max">
            {section.columns.map((column, colIdx) => (
              <div key={colIdx} className="px-6 py-4 border-r border-gray-100 last:border-r-0">
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">{column.title}</h3>
                <ul className="space-y-2">
                  {column.items.map((item, idx) => (
                    <li key={idx}>
                      <Link
                        to={item.path}
                        className="text-sm text-gray-700 hover:text-blue-600 hover:pl-1 transition-all duration-150 block"
                        onClick={() => {
                          setActiveDropdown(null);
                          setIsMenuOpen(false);
                          if (dropdownTimeout) {
                            clearTimeout(dropdownTimeout);
                            setDropdownTimeout(null);
                          }
                        }}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const DropdownNavLink = ({ item, isHighlight = false }) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;

    if (!hasSubmenu) {
      return (
        <NavLink to={item.path} icon={item.icon} isHighlight={isHighlight}>
          {item.label}
        </NavLink>
      );
    }

    return (
      <div
        className="relative"
        onMouseEnter={() => handleDropdownEnter(item.label)}
        onMouseLeave={handleDropdownLeave}
      >
        <button
          className={`group flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${isHighlight
            ? 'bg-white bg-opacity-20 hover:bg-opacity-30'
            : 'hover:bg-white hover:bg-opacity-10'
            }`}
          onClick={() => handleDropdownClick(item.label)}
        >
          {item.icon && <item.icon className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />}
          {item.label}
          <ChevronRight className={`h-3 w-3 transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-90' : ''}`} />
        </button>

        {activeDropdown === item.label && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
            {item.submenu.map((subItem, index) => (
              <Link
                key={index}
                to={subItem.path}
                className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors border-b border-gray-100 last:border-b-0"
                onClick={() => {
                  setActiveDropdown(null);
                  setIsMenuOpen(false);
                  if (dropdownTimeout) {
                    clearTimeout(dropdownTimeout);
                    setDropdownTimeout(null);
                  }
                }}
              >
                {subItem.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-smooth" style={dynamicStyle}>
      {/* Navigation principale */}
      <nav className="px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 md:py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo et nom */}
          {/* Logo et nom */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0 group">
            {settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings?.site_name || "Logo"}
                className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="block min-w-0">
                <h1 className="text-base sm:text-lg md:text-xl font-bold leading-tight" style={{ fontFamily: settings?.font_family }}>
                  {settings?.site_name || "PROQUELEC"}
                </h1>
                <p className="text-xs opacity-70">
                  {settings?.slogan || "Information · Sensibilisation · Conseil"}
                </p>
              </div>
            )}
          </Link>

          {/* Navigation desktop */}
          <div className="hidden lg:flex items-center justify-between flex-1 max-w-4xl">
            {/* Liens de navigation */}
            <div className="flex items-center gap-1 xl:gap-2">
              {/* Liens principaux */}
              {mainNavLinks.map((link) => (
                <DropdownNavLink key={link.path} item={link} />
              ))}

              {/* Mega menus groupés */}
              {megaMenuSections.map((section) => (
                <MegaMenuLink key={section.label} section={section} isHighlight={true} />
              ))}

              {/* Actualités */}
              <NavLink to="/blog" icon={ChevronRight}>
                Actualités
              </NavLink>

              {/* Pages CMS dynamiques */}
              {activeMenuItems.map((menuItem) => (
                <NavLink key={menuItem.id} to={menuItem.url} icon={ChevronRight}>
                  {menuItem.title}
                </NavLink>
              ))}
            </div>

            {/* Section authentification */}
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-white border-opacity-20 flex-shrink-0">
              <Link to="/contact">
                <Button
                  className="text-xs md:text-sm px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  <span className="hidden xl:inline">Contact</span>
                </Button>
              </Link>

              {!isLoading && user ? (
                /* Menu utilisateur connecté */
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="text-xs md:text-sm px-3 py-2 bg-white text-blue-600 hover:bg-gray-100 font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">{user.email?.split('@')[0]}</span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user.email}</p>
                        <p className="text-xs text-gray-500">Connecté</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Tableau de bord
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                      >
                        <LogOut className="h-4 w-4" />
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Bouton connexion */
                <Link to="/connexion">
                  <Button
                    className="text-xs md:text-sm px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl border border-blue-200"
                  >
                    Connexion
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Navigation tablet/mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={toggleMenu}
              className="text-white p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Menu mobile/tablet */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 space-y-3 border-t border-white border-opacity-10 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Groupe : PROQUELEC */}
            <div className="space-y-1">
              <p className="px-3 py-1 text-xs font-semibold opacity-60 uppercase tracking-wider">Navigation</p>
              {mainNavLinks.map((link) => (
                <NavLink key={link.path} to={link.path} icon={link.icon}>
                  {link.label}
                </NavLink>
              ))}
              {mainNavLinks[1]?.submenu?.map((subItem, index) => (
                <Link
                  key={index}
                  to={subItem.path}
                  className="flex items-center gap-2 px-6 py-2 text-sm hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200 ml-4 border-l border-white border-opacity-20"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {subItem.label}
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="border-t border-white border-opacity-10 my-2"></div>

            {/* Mega Menus - Formation & Services */}
            <div className="space-y-1">
              <p className="px-3 py-1 text-xs font-semibold opacity-60 uppercase tracking-wider">Formation & Services</p>
              <NavLink to="/formations" icon={BookOpen} isHighlight={true}>
                Formations
              </NavLink>
              <NavLink to="/certifications" icon={Award} isHighlight={true}>
                Certifications
              </NavLink>
              <NavLink to="/labels" icon={ChevronRight} isHighlight={true}>
                Labellisation
              </NavLink>
            </div>

            {/* Divider */}
            <div className="border-t border-white border-opacity-10 my-2"></div>

            {/* Mega Menus - Ressources */}
            <div className="space-y-1">
              <p className="px-3 py-1 text-xs font-semibold opacity-60 uppercase tracking-wider">Ressources</p>
              <NavLink to="/activities" icon={ChevronRight}>
                Activités
              </NavLink>
              <NavLink to="/showroom" icon={ChevronRight}>
                Showroom Technique
              </NavLink>
              <NavLink to="/documents" icon={ChevronRight}>
                Documents
              </NavLink>
              <NavLink to="/events" icon={ChevronRight}>
                Événements
              </NavLink>
            </div>

            {/* Groupe : Pages CMS (si des éléments existent) */}
            {activeMenuItems.length > 0 && (
              <>
                {/* Divider */}
                <div className="border-t border-white border-opacity-10 my-2"></div>

                <div className="space-y-1">
                  <p className="px-3 py-1 text-xs font-semibold opacity-60 uppercase tracking-wider">Plus</p>
                  <NavLink to="/actualites" icon={ChevronRight}>
                    Actualités
                  </NavLink>
                  {activeMenuItems.map((menuItem) => (
                    <NavLink key={menuItem.id} to={menuItem.url} icon={ChevronRight}>
                      {menuItem.title}
                    </NavLink>
                  ))}
                </div>
              </>
            )}

            {/* Divider */}
            <div className="border-t border-white border-opacity-10 my-2"></div>

            {/* Boutons action */}
            <div className="space-y-2 pt-2">
              <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="block">
                <Button
                  className="w-full text-white bg-white bg-opacity-20 hover:bg-opacity-30 transition-all font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Nous contacter
                </Button>
              </Link>
              {!isLoading && user ? (
                <>
                  <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block">
                    <Button
                      className="w-full text-white bg-white bg-opacity-20 hover:bg-opacity-30 transition-all font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Tableau de bord
                    </Button>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-red-600 bg-white hover:bg-gray-100 transition-all font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link to="/connexion" onClick={() => setIsMenuOpen(false)} className="block">
                  <Button
                    className="w-full text-blue-600 bg-white hover:bg-gray-100 transition-all font-semibold py-2.5 rounded-lg"
                  >
                    Connexion
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
