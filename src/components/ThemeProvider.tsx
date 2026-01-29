import React, { createContext, useContext, useEffect } from 'react';
import { useActiveTheme } from '@/hooks/useDynamicSystems';

interface ThemeContextType {
  theme: any;
  isLoading: boolean;
  error: any;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { data: theme, isLoading, error } = useActiveTheme();

  useEffect(() => {
    if (theme) {
      // Appliquer les variables CSS dynamiques
      const root = document.documentElement;

      // Couleurs
      if (theme.colors) {
        Object.entries(theme.colors).forEach(([key, value]) => {
          root.style.setProperty(`--color-${key}`, value as string);
        });
      }

      // Polices
      if (theme.fonts) {
        Object.entries(theme.fonts).forEach(([key, value]) => {
          root.style.setProperty(`--font-${key}`, value as string);
        });
      }

      // Espacement
      if (theme.spacing) {
        Object.entries(theme.spacing).forEach(([key, value]) => {
          root.style.setProperty(`--spacing-${key}`, value as string);
        });
      }

      // Breakpoints
      if (theme.breakpoints) {
        Object.entries(theme.breakpoints).forEach(([key, value]) => {
          root.style.setProperty(`--breakpoint-${key}`, value as string);
        });
      }
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, isLoading, error }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook pour obtenir une valeur de thème spécifique
export function useThemeValue(key: string, defaultValue?: string) {
  const { theme } = useTheme();

  if (!theme) return defaultValue;

  // Support pour les clés imbriquées (ex: 'colors.primary')
  const keys = key.split('.');
  let value = theme;

  for (const k of keys) {
    value = value?.[k];
  }

  return value || defaultValue;
}

// Composant pour appliquer des styles dynamiques
export function DynamicStyle({ children, style: customStyle }: {
  children: React.ReactNode;
  style?: Record<string, any>;
}) {
  const { theme } = useTheme();

  const dynamicStyle = {
    ...customStyle,
  };

  // Appliquer les styles du thème si disponible
  if (theme && customStyle) {
    Object.entries(customStyle).forEach(([key, value]) => {
      if (typeof value === 'string' && value.startsWith('theme.')) {
        const themeKey = value.replace('theme.', '');
        const themeValue = useThemeValue(themeKey);
        if (themeValue) {
          dynamicStyle[key] = themeValue;
        }
      }
    });
  }

  return <div style={dynamicStyle}>{children}</div>;
}
