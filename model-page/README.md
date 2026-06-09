# Modèles PROQUELEC pour le Builder

Ce dossier sert d'outil de travail au webmaster. Les fichiers HTML ne sont pas scannés par Tailwind et ne sont pas lus directement par l'application au runtime.

## Règle principale

Les modèles officiels doivent utiliser les classes CSS stables `pq-*`. Ces classes sont définies dans `src/index.css` et restent disponibles dans le bundle final, même quand le HTML est collé dans un bloc du Builder puis stocké en base de données.

## Convention recommandée

- `pq-layout-container`, `pq-layout-wide`, `pq-layout-narrow`
- `pq-section`, `pq-section-muted`, `pq-section-dark`, `pq-section-compact`
- `pq-card`, `pq-card-feature`, `pq-card-service`, `pq-card-highlight`
- `pq-button`, `pq-button-primary`, `pq-button-secondary`, `pq-button-outline`
- `pq-grid-2`, `pq-grid-3`, `pq-grid-4`
- `pq-alert-info`, `pq-alert-warning`, `pq-alert-success`, `pq-alert-danger`
- `pq-stat`, `pq-badge`, `pq-table`, `pq-form`

## Exemple

```html
<section class="pq-section">
  <div class="pq-layout-container">
    <p class="pq-section-kicker">Service</p>
    <h2 class="pq-section-title">Titre de section</h2>
    <div class="pq-grid-3">
      <article class="pq-card pq-card-feature">
        <h3 class="pq-card-title">Bloc métier</h3>
        <p class="pq-card-text">Contenu clair, utile et réutilisable.</p>
      </article>
    </div>
  </div>
</section>
```

## À éviter

Éviter de construire les modèles officiels avec des classes Tailwind longues ou arbitraires comme `bg-[#123456]`, `rounded-[28px]`, `min-h-[83vh]`. Elles ne sont pas garanties pour le HTML injecté au runtime. Utiliser plutôt une classe `pq-*` ou ajouter une nouvelle brique dans `src/index.css`.
