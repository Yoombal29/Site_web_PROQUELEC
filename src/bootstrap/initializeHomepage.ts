/**
 * 🚀 BOOTSTRAP — Initialisation de la Homepage
 * 
 * Enregistre tous les modules officiels de la page d'accueil.
 * C'est ici qu'on définit la structure par défaut de "l'Institution".
 */

import { homepageRegistry } from '@/services/HomepageRegistry';
import { HeroBanner } from '@/components/HeroBanner';
import { PartnerLogos } from '@/components/PartnerLogos';
import { LatestNews } from '@/components/LatestNews';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { QuickLinks } from '@/components/QuickLinks';
import { VisionMission } from '@/components/VisionMission';
import { LandingStats } from '@/components/LandingStats';
import { LandingTestimonials } from '@/components/LandingTestimonials';
import { AudienceOffers } from '@/components/AudienceOffers';

// ... DEFINITION DES MODULES ---

export function initializeHomepageModules(): void {


  // 1. HERO (Le visage de l'institution)
  homepageRegistry.register({
    id: 'hero_section',
    name: 'Bannière Héroïque',
    description: 'Zone principale d\'accueil avec messages rotatifs et alertes',
    type: 'layout',
    defaultPriority: 10,
    isEnabledByDefault: true,
    component: HeroBanner
  });

  // 1.5 OFFRES (Les 3 rubriques d'offre)
  homepageRegistry.register({
    id: 'audience_offers',
    name: 'Offres par Audience',
    description: 'Section présentant les avantages pour électriciens, professionnels et membres',
    type: 'content',
    defaultPriority: 25,
    isEnabledByDefault: true,
    component: AudienceOffers
  });

  // 2. VISION & MISSION
  homepageRegistry.register({
    id: 'vision_mission',
    name: 'Vision & Mission',
    description: 'Présentation de l\'institution, son histoire et ses objectifs',
    type: 'content',
    defaultPriority: 20,
    isEnabledByDefault: true,
    component: VisionMission
  });

  // 3. STATS (La preuve d'autorité)
  homepageRegistry.register({
    id: 'landing_stats',
    name: 'Chiffres Clés',
    description: 'Compteurs dynamiques des réalisations institutionnelles',
    type: 'content',
    defaultPriority: 30,
    isEnabledByDefault: true,
    component: LandingStats
  });

  // 4. ACTUALITÉS (La vie du réseau)
  homepageRegistry.register({
    id: 'latest_news',
    name: 'Dernières Actualités',
    description: 'Flux des articles et mises à jour normatives',
    type: 'widget',
    defaultPriority: 40,
    isEnabledByDefault: true,
    component: LatestNews
  });

  // 5. TESTIMONIALS (Témoignages)
  homepageRegistry.register({
    id: 'landing_testimonials',
    name: 'Témoignages',
    description: 'Retours d\'expérience des autorités et bénéficiaires',
    type: 'content',
    defaultPriority: 50,
    isEnabledByDefault: true,
    component: LandingTestimonials
  });

  // 6. PARTENAIRES (La légitimité)
  homepageRegistry.register({
    id: 'partners_marquee',
    name: 'Carrousel Partenaires',
    description: 'Bandeau défilant des logos institutionnels',
    type: 'layout',
    defaultPriority: 60,
    isEnabledByDefault: true,
    component: PartnerLogos
  });

  // 7. ACCÈS RAPIDE (L'utilitaire)
  homepageRegistry.register({
    id: 'quick_links',
    name: 'Accès Rapide',
    description: 'Grille de liens vers les rubriques fréquentes',
    type: 'widget',
    defaultPriority: 70,
    isEnabledByDefault: true,
    component: QuickLinks
  });

  // 8. NEWSLETTER (L'engagement)
  homepageRegistry.register({
    id: 'newsletter_signup',
    name: 'Inscription Newsletter',
    description: 'Formulaire de capture pour la veille normative',
    type: 'interactive',
    defaultPriority: 80,
    isEnabledByDefault: true,
    component: NewsletterSignup
  });


}