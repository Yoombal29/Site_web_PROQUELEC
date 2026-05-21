import { useEffect } from 'react';
import { useTheme } from 'next-themes';

/**
 * ThemeSync synchronise next-themes avec la classe 'dark' du HTML
 * Permet au Tailwind CSS dark mode de fonctionner correctement
 * 
 * Configuration requise dans tailwind.config.ts:
 * darkMode: ["class"]
 */
export function ThemeSync() {
  const { theme, resolvedTheme, systemTheme } = useTheme();

  useEffect(() => {
    const html = document.documentElement;
    const isDark = resolvedTheme === 'dark';

    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [resolvedTheme]);

  // Éviter les flashes au chargement initial
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem('proquelec-ui-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const html = document.documentElement;

    // Appliquer le thème stocké ou le thème système
    if (stored === 'dark' || (!stored && prefersDark && systemTheme === 'dark')) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [systemTheme]);

  return null;
}
