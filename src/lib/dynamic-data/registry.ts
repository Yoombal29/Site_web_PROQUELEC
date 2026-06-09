export interface RegistryTokenItem {
  label: string;
  expression: string;
  description: string;
}

export interface RegistryCategory {
  category: string;
  items: RegistryTokenItem[];
}

export const DYNAMIC_TOKENS_REGISTRY: RegistryCategory[] = [
  {
    category: 'Page',
    items: [
      { label: 'Titre de la Page', expression: '{{ page.title }}', description: 'Le titre principal de la page en cours' },
      { label: 'Slug / URL', expression: '{{ page.slug }}', description: 'L\'alias d\'URL de la page' },
      { label: 'Description SEO', expression: '{{ page.meta_description }}', description: 'La méta description de la page' },
      { label: 'Date de mise à jour', expression: '{{ page.updated_at }}', description: 'Date de dernière modification' },
    ],
  },
  {
    category: 'Date',
    items: [
      { label: 'Année Courante', expression: '{{ date.year }}', description: 'L\'année actuelle (ex: 2026)' },
      { label: 'Mois Courant', expression: '{{ date.month }}', description: 'Le numéro de mois actuel (ex: 05)' },
      { label: 'Jour Courant', expression: '{{ date.day }}', description: 'Le numéro de jour actuel (ex: 30)' },
    ],
  },
  {
    category: 'Global',
    items: [
      { label: 'Nom du Site', expression: '{{ global.siteName }}', description: 'Le nom officiel de l\'institution' },
      { label: 'Email de Contact', expression: '{{ global.contactEmail }}', description: 'Adresse email générale de contact' },
      { label: 'Téléphone de Contact', expression: '{{ global.contactPhone }}', description: 'Numéro de téléphone de l\'accueil' },
    ],
  },
];
