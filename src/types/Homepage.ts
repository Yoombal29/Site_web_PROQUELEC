/**
 * 🏗️ HOMEPAGE MODULE SCHEMA
 * 
 * Définit la structure d'un module de la page d'accueil.
 * La Homepage n'est plus une page statique, mais une composition de modules gouvernés.
 */



export type HomepageModuleId =
'hero_section' |
'vision_mission' |
'landing_stats' |
'stats_dashboard' |
'services_grid' |
'partners_marquee' |
'testimonials_carousel' |
'landing_testimonials' |
'compliance_alert' // Nouveau module normatif
| 'latest_news' |
'quick_links' |
'audience_offers' |
'newsletter_signup';

export type HomepageModuleType =
'layout' // Structure majeure
| 'widget' // Petit composant informatif
| 'interactive' // Nécessite une action utilisateur
| 'content' // Section de contenu textuel/visuel
| 'normative'; // Directement lié au moteur de calcul

export interface HomepageModuleSchema {
  id: HomepageModuleId;
  name: string;
  description: string;
  type: HomepageModuleType;

  /**
   * Priorité d'affichage (0 = top, 100 = bottom)
   * Peut être surchargé par l'admin
   */
  defaultPriority: number;

  /**
   * Le composant React à rendre
   */
  component: FunctionComponent<unknown>;

  /**
   * Si vrai, le module est actif par défaut
   */
  isEnabledByDefault: boolean;

  /**
   * Configuration spécifique au module (ex: endpoint API, refresh rate...)
   */
  config?: Record<string, unknown>;

  /**
   * Données de santé du module (pour l'admin)
   */
  healthCheck?: () => Promise<boolean>;
}