import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { getCurrentLanguage, setLanguage, type Language } from '@/lib/i18n';

/**
 * Hook pour gérer les routes multi-langues
 * Extrait la langue de l'URL ou utilise celle sauvegardée
 */
export function useI18nRouting() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extraire la langue de l'URL si présente (/fr/..., /en/...)
  const getLanguageFromPath = (): Language | null => {
    const match = location.pathname.match(/^\/(fr|en)\//);
    return match ? (match[1] as Language) : null;
  };
  
  const langFromPath = getLanguageFromPath();
  const storedLang = getCurrentLanguage();
  const currentLang = langFromPath || storedLang;
  
  // Si pas de langue en URL et utilisateur a une préférence, rediriger
  useEffect(() => {
    const lang = getCurrentLanguage();
    if (!langFromPath && location.pathname !== '/') {
      // Garder silencieusement la langue stockée, pas de redirection sur chaque nav
    }
  }, [langFromPath, location.pathname]);
  
  // Fonction pour naviguer avec langue (sans préfixe dans l'URL)
  const navigateWithLang = (path: string, _lang: Language = currentLang) => {
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    navigate(cleanPath);
  };
  
  // Fonction pour changer de langue (sans préfixe dans l'URL)
  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    // Rester sur la même page sans changer l'URL
  };
  
  return {
    currentLanguage: currentLang,
    changeLanguage,
    navigateWithLang,
    hasLanguageInUrl: !!langFromPath
  };
}

/**
 * Middleware pour assurer que toutes les routes ont un préfixe de langue
 * À placer dans le composant racine
 */
export function I18nRouteGuard() {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirection désactivée : les URLs n'ont plus de préfixe de langue
    // La langue est gérée via localStorage uniquement
  }, [location.pathname, navigate]);
  
  return null; // Ce composant ne rend rien
}

/**
 * Crée une version "i18n-ready" d'une route path
 * Ex: "/about" devient "/:lang/about"
 */
export function createI18nPath(path: string): string {
  // Exclure les routes spéciales qui ne doivent pas avoir le préfixe de langue
  const noLangRoutes = ['/auth', '/connexion', '/login', '/api', '/.'];
  if (noLangRoutes.some(r => path.startsWith(r))) {
    return path;
  }
  
  if (path === '/') {
    return '/:lang?';
  }
  
  return `/:lang${path}`;
}
