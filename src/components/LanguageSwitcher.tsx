import React, { useState, useEffect } from 'react';
import { getCurrentLanguage, setLanguage, type Language } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const [currentLang, setCurrentLang] = useState<Language>('fr');
  
  useEffect(() => {
    setCurrentLang(getCurrentLanguage());
    
    // Listen for language changes
    const handleLanguageChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setCurrentLang(detail.language);
    };
    
    window.addEventListener('languageChange', handleLanguageChange);
    return () => window.removeEventListener('languageChange', handleLanguageChange);
  }, []);
  
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setCurrentLang(lang);
    // Optional: Reload page to apply language throughout
    // window.location.reload();
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="uppercase font-semibold">{currentLang}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleLanguageChange('fr')}
          className={currentLang === 'fr' ? 'bg-accent' : ''}
        >
          <span>🇫🇷 Français</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange('en')}
          className={currentLang === 'en' ? 'bg-accent' : ''}
        >
          <span>🇬🇧 English</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageSwitcher;
