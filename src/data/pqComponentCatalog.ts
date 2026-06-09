export type PqComponentCategory =
  | 'Mise en page'
  | 'Sections'
  | 'Cartes'
  | 'Boutons'
  | 'Alertes'
  | 'Donnees'
  | 'Formulaires'
  | 'Tableaux';

export type PqComponentCatalogItem = {
  id: string;
  name: string;
  category: PqComponentCategory;
  description: string;
  classes: string[];
  html: string;
};

export const pqComponentCatalog = [
  {
    id: 'layout-container',
    name: 'Conteneur standard',
    category: 'Mise en page',
    description: 'Largeur principale pour une page publique PROQUELEC.',
    classes: ['pq-layout-container'],
    html: `<div class="pq-layout-container">
  <p>Contenu du conteneur.</p>
</div>`,
  },
  {
    id: 'grid-2',
    name: 'Grille 2 colonnes',
    category: 'Mise en page',
    description: 'Deux colonnes responsives pour contenu texte + cartes.',
    classes: ['pq-grid-2'],
    html: `<div class="pq-grid-2">
  <div>Colonne 1</div>
  <div>Colonne 2</div>
</div>`,
  },
  {
    id: 'grid-3',
    name: 'Grille 3 colonnes',
    category: 'Mise en page',
    description: 'Trois colonnes responsives pour services ou ressources.',
    classes: ['pq-grid-3'],
    html: `<div class="pq-grid-3">
  <article class="pq-card">Carte 1</article>
  <article class="pq-card">Carte 2</article>
  <article class="pq-card">Carte 3</article>
</div>`,
  },
  {
    id: 'section-standard',
    name: 'Section standard',
    category: 'Sections',
    description: 'Section claire avec titre, texte et contenu central.',
    classes: ['pq-section', 'pq-layout-container', 'pq-section-title', 'pq-section-text'],
    html: `<section class="pq-section">
  <div class="pq-layout-container">
    <p class="pq-section-kicker">Categorie</p>
    <h2 class="pq-section-title">Titre de section</h2>
    <p class="pq-section-text">Texte court et utile pour guider le visiteur.</p>
  </div>
</section>`,
  },
  {
    id: 'section-dark',
    name: 'Section sombre',
    category: 'Sections',
    description: 'Bande institutionnelle sombre pour preuve, impact ou appel a action.',
    classes: ['pq-section', 'pq-section-dark'],
    html: `<section class="pq-section pq-section-dark">
  <div class="pq-layout-container">
    <p class="pq-section-kicker">Confiance</p>
    <h2 class="pq-section-title">Message institutionnel</h2>
    <p class="pq-section-text">Texte court sur la securite electrique et la conformite.</p>
  </div>
</section>`,
  },
  {
    id: 'hero-premium',
    name: 'Hero premium',
    category: 'Sections',
    description: 'Premier ecran plus fort pour pages strategiques.',
    classes: ['pq-hero', 'pq-hero-premium', 'pq-layout-container', 'pq-title', 'pq-lead'],
    html: `<section class="pq-hero pq-hero-premium">
  <div class="pq-layout-container pq-hero-inner">
    <p class="pq-eyebrow">PROQUELEC</p>
    <div class="pq-hero-copy">
      <h1 class="pq-title">Titre de page</h1>
      <p class="pq-lead">Texte d'introduction clair, oriente metier et action.</p>
    </div>
    <div class="pq-actions">
      <a href="/contact" class="pq-button pq-button-primary">Demander un controle</a>
      <a href="/expertises" class="pq-button pq-button-secondary">Voir les services</a>
    </div>
  </div>
</section>`,
  },
  {
    id: 'card-standard',
    name: 'Carte standard',
    category: 'Cartes',
    description: 'Carte simple pour service, ressource ou information.',
    classes: ['pq-card', 'pq-card-title', 'pq-card-text'],
    html: `<article class="pq-card">
  <h3 class="pq-card-title">Titre de carte</h3>
  <p class="pq-card-text">Description courte, concrete et exploitable.</p>
</article>`,
  },
  {
    id: 'card-premium',
    name: 'Carte premium',
    category: 'Cartes',
    description: 'Carte plus marquee pour mise en avant.',
    classes: ['pq-card-premium', 'pq-card-title', 'pq-card-text'],
    html: `<article class="pq-card-premium">
  <div class="pq-icon">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4z"/><path d="M9 12l2 2 4-5"/></svg>
  </div>
  <h3 class="pq-card-title">Point fort</h3>
  <p class="pq-card-text">Explication courte avec benefice clair.</p>
</article>`,
  },
  {
    id: 'card-glass',
    name: 'Carte glass',
    category: 'Cartes',
    description: 'Carte translucide pour hero ou section premium.',
    classes: ['pq-card-glass', 'pq-card-title', 'pq-card-text'],
    html: `<article class="pq-card-glass">
  <h3 class="pq-card-title">Information premium</h3>
  <p class="pq-card-text">Contenu court dans un bloc visuel plus immersif.</p>
</article>`,
  },
  {
    id: 'button-primary',
    name: 'Bouton primaire',
    category: 'Boutons',
    description: 'Action principale visible sur fond clair ou sombre.',
    classes: ['pq-button', 'pq-button-primary'],
    html: `<a href="/contact" class="pq-button pq-button-primary">Action principale</a>`,
  },
  {
    id: 'button-outline',
    name: 'Bouton outline',
    category: 'Boutons',
    description: 'Action secondaire sur fond clair.',
    classes: ['pq-button', 'pq-button-outline'],
    html: `<a href="/expertises" class="pq-button pq-button-outline">Action secondaire</a>`,
  },
  {
    id: 'alert-warning',
    name: 'Alerte prevention',
    category: 'Alertes',
    description: 'Message de vigilance ou point a verifier.',
    classes: ['pq-alert-warning'],
    html: `<div class="pq-alert-warning">
  Point de vigilance : faites verifier l'installation par un professionnel qualifie.
</div>`,
  },
  {
    id: 'stat',
    name: 'Indicateur',
    category: 'Donnees',
    description: 'Chiffre cle avec libelle court.',
    classes: ['pq-stat', 'pq-stat-value', 'pq-stat-label'],
    html: `<div class="pq-stat">
  <p class="pq-stat-value">500+</p>
  <p class="pq-stat-label">Dossiers suivis</p>
</div>`,
  },
  {
    id: 'form-contact',
    name: 'Formulaire contact',
    category: 'Formulaires',
    description: 'Base de formulaire compatible avec le style PROQUELEC.',
    classes: ['pq-form', 'pq-form-row', 'pq-label', 'pq-input', 'pq-select', 'pq-textarea'],
    html: `<form class="pq-form">
  <div class="pq-form-row">
    <label>
      <span class="pq-label">Nom complet</span>
      <input class="pq-input" type="text" placeholder="Votre nom" />
    </label>
    <label>
      <span class="pq-label">Objet</span>
      <select class="pq-select">
        <option>Controle</option>
        <option>Formation</option>
        <option>Certification</option>
      </select>
    </label>
  </div>
  <label>
    <span class="pq-label">Message</span>
    <textarea class="pq-textarea" placeholder="Decrivez votre demande"></textarea>
  </label>
</form>`,
  },
  {
    id: 'table-status',
    name: 'Tableau statut',
    category: 'Tableaux',
    description: 'Tableau simple pour documents, actions ou suivis.',
    classes: ['pq-table-wrap', 'pq-table'],
    html: `<div class="pq-table-wrap">
  <table class="pq-table">
    <thead>
      <tr>
        <th>Element</th>
        <th>Statut</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Dossier technique</td>
        <td>A completer</td>
        <td>Verifier</td>
      </tr>
    </tbody>
  </table>
</div>`,
  },
] satisfies PqComponentCatalogItem[];

export const pqComponentCategories = Array.from(
  new Set(pqComponentCatalog.map((component) => component.category)),
) as PqComponentCategory[];

export function getPqComponentById(id: string): PqComponentCatalogItem | undefined {
  return pqComponentCatalog.find((component) => component.id === id);
}
