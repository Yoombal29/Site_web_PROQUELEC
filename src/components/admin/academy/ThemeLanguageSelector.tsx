/**
 * Composant de sélection du thème et de la langue
 */

import React from 'react';
import { Moon, Sun, Monitor, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import { useI18n } from '@/contexts/I18nContext';

export const ThemeLanguageSelector: React.FC = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="flex items-center gap-2">
      {/* Theme selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button title="Changer le thème" aria-label="Changer le thème" variant="ghost" size="icon" className="h-8 w-8">
            {resolvedTheme === 'dark' ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Thème</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setTheme('light')}
            className={theme === 'light' ? 'bg-accent' : ''}
          >
            <Sun className="mr-2 h-4 w-4" />
            Clair
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme('dark')}
            className={theme === 'dark' ? 'bg-accent' : ''}
          >
            <Moon className="mr-2 h-4 w-4" />
            Sombre
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setTheme('system')}
            className={theme === 'system' ? 'bg-accent' : ''}
          >
            <Monitor className="mr-2 h-4 w-4" />
            Système
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Language selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button title="Changer la langue" aria-label="Changer la langue" variant="ghost" size="icon" className="h-8 w-8">
            <Globe className="h-4 w-4" />
            <span className="sr-only">Select language</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Langue</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setLocale('fr')}
            className={locale === 'fr' ? 'bg-accent' : ''}
          >
            🇫🇷 Français
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setLocale('en')}
            className={locale === 'en' ? 'bg-accent' : ''}
          >
            🇬🇧 English
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setLocale('ar')}
            className={locale === 'ar' ? 'bg-accent' : ''}
          >
            🇸🇦 العربية
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
