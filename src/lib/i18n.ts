// i18n Configuration - PROQUELEC
// Supports: FR (Français), EN (English)

export type Language = 'fr' | 'en';

export interface Translations {
  [key: string]: {
    [key: string]: string | { [key: string]: string };
  };
}

export const translations: Translations = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.about': 'À Propos',
    'nav.services': 'Services',
    'nav.formations': 'Formations',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'nav.admin': 'Administration',
    'nav.login': 'Connexion',
    'nav.logout': 'Déconnexion',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.cancel': 'Annuler',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.export': 'Exporter',
    'common.import': 'Importer',
    'common.language': 'Langue',
    'common.language_fr': 'Français',
    'common.language_en': 'English',
    
    // Home
    'home.title': 'Bienvenue à PROQUELEC',
    'home.subtitle': 'Expertise Électrique & Formations Certifiées',
    'home.hero_cta': 'Commencer',
    'home.about_section': 'À propos de PROQUELEC',
    'home.services_section': 'Nos Services',
    'home.latest_news': 'Actualités Récentes',
    
    // Inspections
    'inspections.title': 'Inspections Électriques',
    'inspections.new': 'Nouvelle Inspection',
    'inspections.list': 'Mes Inspections',
    'inspections.report': 'Rapport d\'Inspection',
    'inspections.checklist': 'Checklist',
    'inspections.findings': 'Résultats',
    'inspections.conformity': 'Conformité: {score}%',
    'inspections.export_pdf': 'Exporter en PDF',
    'inspections.export_docx': 'Exporter en DOCX',
    
    // Formations
    'formations.title': 'Formations PROQUELEC',
    'formations.my_courses': 'Mes Cours',
    'formations.register': 'S\'inscrire',
    'formations.continue': 'Continuer',
    'formations.completed': 'Terminé',
    'formations.certificate': 'Certificat',
    'formations.download_certificate': 'Télécharger le Certificat',
    
    // Blog
    'blog.title': 'Blog',
    'blog.recent_posts': 'Articles Récents',
    'blog.read_more': 'Lire la Suite',
    'blog.written_by': 'Écrit par',
    'blog.published': 'Publié le',
    'blog.categories': 'Catégories',
    
    // Contact
    'contact.title': 'Nous Contacter',
    'contact.name': 'Nom',
    'contact.email': 'Email',
    'contact.phone': 'Téléphone',
    'contact.message': 'Message',
    'contact.send': 'Envoyer',
    'contact.address': 'Adresse',
    'contact.hours': 'Horaires',
    
    // Footer
    'footer.copyright': '© 2026 PROQUELEC. Tous droits réservés.',
    'footer.legal': 'Mentions Légales',
    'footer.privacy': 'Politique de Confidentialité',
    'footer.terms': 'Conditions d\'Utilisation',
    'footer.contact': 'Contact',
    'footer.partners': 'Partenaires',
  },
  
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.formations': 'Trainings',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'nav.admin': 'Administration',
    'nav.login': 'Sign In',
    'nav.logout': 'Sign Out',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.cancel': 'Cancel',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.language': 'Language',
    'common.language_fr': 'Français',
    'common.language_en': 'English',
    
    // Home
    'home.title': 'Welcome to PROQUELEC',
    'home.subtitle': 'Electrical Expertise & Certified Trainings',
    'home.hero_cta': 'Get Started',
    'home.about_section': 'About PROQUELEC',
    'home.services_section': 'Our Services',
    'home.latest_news': 'Latest News',
    
    // Inspections
    'inspections.title': 'Electrical Inspections',
    'inspections.new': 'New Inspection',
    'inspections.list': 'My Inspections',
    'inspections.report': 'Inspection Report',
    'inspections.checklist': 'Checklist',
    'inspections.findings': 'Findings',
    'inspections.conformity': 'Conformity: {score}%',
    'inspections.export_pdf': 'Export as PDF',
    'inspections.export_docx': 'Export as DOCX',
    
    // Trainings
    'formations.title': 'PROQUELEC Trainings',
    'formations.my_courses': 'My Courses',
    'formations.register': 'Register',
    'formations.continue': 'Continue',
    'formations.completed': 'Completed',
    'formations.certificate': 'Certificate',
    'formations.download_certificate': 'Download Certificate',
    
    // Blog
    'blog.title': 'Blog',
    'blog.recent_posts': 'Recent Articles',
    'blog.read_more': 'Read More',
    'blog.written_by': 'Written by',
    'blog.published': 'Published on',
    'blog.categories': 'Categories',
    
    // Contact
    'contact.title': 'Contact Us',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.phone': 'Phone',
    'contact.message': 'Message',
    'contact.send': 'Send',
    'contact.address': 'Address',
    'contact.hours': 'Hours',
    
    // Footer
    'footer.copyright': '© 2026 PROQUELEC. All rights reserved.',
    'footer.legal': 'Legal Notice',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Use',
    'footer.contact': 'Contact',
    'footer.partners': 'Partners',
  }
};

// Get current language from localStorage or browser
export function getCurrentLanguage(): Language {
  if (typeof window === 'undefined') return 'fr';
  
  const stored = localStorage.getItem('language');
  if (stored === 'fr' || stored === 'en') return stored;
  
  const browserLang = navigator.language.split('-')[0];
  return (browserLang === 'en' ? 'en' : 'fr') as Language;
}

// Set language and persist
export function setLanguage(lang: Language) {
  localStorage.setItem('language', lang);
  // Dispatch custom event for components to listen
  window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: lang } }));
}

// Get translated string with interpolation support
export function t(key: string, lang: Language = getCurrentLanguage(), vars?: Record<string, string>): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  if (typeof value !== 'string') {
    return key;
  }
  
  // Interpolate variables
  if (vars) {
    let result = value;
    for (const [varKey, varValue] of Object.entries(vars)) {
      result = result.replace(`{${varKey}}`, varValue);
    }
    return result;
  }
  
  return value;
}

// Hook-like function for React components
export function useTranslation(lang?: Language) {
  const currentLang = lang || getCurrentLanguage();
  
  return {
    t: (key: string, vars?: Record<string, string>) => t(key, currentLang, vars),
    lang: currentLang,
    setLanguage,
    allLanguages: ['fr', 'en'] as Language[]
  };
}
