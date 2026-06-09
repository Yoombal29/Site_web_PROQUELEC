/**
 * seo-calculator.ts — Utilitaire de score SEO
 * Calcule un score de 0 à 100 basé sur les métadonnées et le contenu d'une page.
 */

export interface SeoScoreDetails {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  color: string;
  checks: SeoCheck[];
}

export interface SeoCheck {
  label: string;
  passed: boolean;
  points: number;
  hint?: string;
}

export const calculateSeoScore = (
  title: string,
  content: string,
  metaDescription: string,
  metaKeywords: string,
  featuredImage: string,
  slug: string
): SeoScoreDetails => {
  const checks: SeoCheck[] = [
    {
      label: 'Titre présent',
      passed: title.length > 0,
      points: 10,
      hint: 'Le titre de la page est obligatoire pour le SEO.'
    },
    {
      label: 'Titre entre 30 et 60 caractères',
      passed: title.length >= 30 && title.length <= 60,
      points: 10,
      hint: `Actuellement ${title.length} caractères. Idéalement entre 30 et 60.`
    },
    {
      label: 'Meta description présente',
      passed: metaDescription.length > 0,
      points: 10,
      hint: 'La meta description améliore le CTR dans les résultats Google.'
    },
    {
      label: 'Meta description entre 120 et 160 caractères',
      passed: metaDescription.length >= 120 && metaDescription.length <= 160,
      points: 10,
      hint: `Actuellement ${metaDescription.length} caractères. Idéalement entre 120 et 160.`
    },
    {
      label: 'Mots-clés définis',
      passed: metaKeywords.length > 0,
      points: 10,
      hint: 'Les meta keywords renforcent la pertinence thématique.'
    },
    {
      label: 'Contenu suffisant (>300 caractères)',
      passed: content.length > 300,
      points: 10,
      hint: 'Un contenu dense améliore le positionnement.'
    },
    {
      label: 'Balises de titre (H1/H2) présentes',
      passed: content.includes('<h1') || content.includes('<h2'),
      points: 10,
      hint: 'Les balises de titre structurent le contenu pour les moteurs de recherche.'
    },
    {
      label: 'Texte alternatif sur les images',
      passed: content.includes('alt='),
      points: 10,
      hint: "Les attributs alt améliorent l'accessibilité et le SEO image."
    },
    {
      label: 'Image mise en avant définie',
      passed: featuredImage.length > 0,
      points: 10,
      hint: "Une image de couverture améliore l'apparence dans les résultats sociaux (Open Graph)."
    },
    {
      label: 'Slug court et propre (<50 caractères)',
      passed: slug.length > 0 && slug.length < 50,
      points: 10,
      hint: 'Un slug court, sans accents et en minuscules est idéal.'
    }
  ];

  const score = checks.filter(c => c.passed).reduce((acc, c) => acc + c.points, 0);

  const grade = score >= 90 ? 'A' : score >= 70 ? 'B' : score >= 50 ? 'C' : score >= 30 ? 'D' : 'F';
  const color = score >= 90 ? '#10b981' : score >= 70 ? '#3b82f6' : score >= 50 ? '#f59e0b' : score >= 30 ? '#f97316' : '#ef4444';

  return { score, grade, color, checks };
};

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // Remove accents
    .replace(/[^a-z0-9]+/g, '-')        // Replace non-alphanum with hyphens
    .replace(/^-+|-+$/g, '');           // Trim hyphens
};

export const estimateReadingTime = (htmlContent: string): number => {
  // Strip HTML tags
  const text = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = text.split(' ').filter(w => w.length > 0).length;
  // Average reading speed: 200 words/min
  return Math.max(1, Math.ceil(wordCount / 200));
};
