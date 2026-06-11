# Audit global du CMS PROQUELEC

Date: 2026-06-11

## Synthese executive

Le CMS est fonctionnel et deja mature: pages dynamiques, God Builder Craft.js, pages fonctionnelles verrouillees, pages hybrides, templates, menu/media/blog/evenements, release-manager et scripts d'audit. Les vrais risques ne sont pas dans Craft.js lui-meme, mais dans la gouvernance d'exploitation: schema release incomplet, source de verite de publication, coexistence des formats et ecarts brouillon/public.

Score d'exploitation revise: **82/100**.

Objectif realiste apres durcissement schema, normalisation des statuts, migration legacy et audit CI: **90+/100**.

## Controles executes

| Controle                                      |                       Resultat |
| --------------------------------------------- | -----------------------------: |
| `npm run cms:audit`                           |                         8/8 OK |
| `npm run cms:audit:global`                    |                             OK |
| `npm run cms:data`                            |                             OK |
| `node scripts/audit-builder-pages.cjs`        |                OK avec alertes |
| `node scripts/audit-builder-public-match.cjs` |                OK avec alertes |
| `npm run build`                               | OK avec warnings non bloquants |

Un script dedie a ete ajoute pour rendre cet audit rejouable:

```bash
npm run cms:audit:global
```

## Inventaire CMS

| Indicateur                        | Valeur |
| --------------------------------- | -----: |
| Pages CMS en base                 |    125 |
| Pages contenu                     |     70 |
| Pages fonctionnelles              |     46 |
| Pages hybrides                    |      9 |
| Pages canoniquement publiees      |    107 |
| Pages contenu publiees canoniques |     46 |
| Pages non canoniques              |     18 |
| Outils catalogue                  |     60 |
| Capacites CMS declarees           |     13 |
| Templates PROQUELEC               |     25 |

Definition recommandee pour une page publique:

```text
status='published'
AND workflow_status='published'
AND is_published=true
```

Repartition actuelle des statuts:

| Etat DB                                 | Pages |
| --------------------------------------- | ----: |
| `published/published/is_published=true` |   107 |
| `published/draft/is_published=true`     |    14 |
| `draft/draft/is_published=true`         |     3 |
| `draft/draft/is_published=false`        |     1 |

Repartition des moteurs:

| Editor/render           | Pages |
| ----------------------- | ----: |
| `code` / `raw`          |   107 |
| `visual_blocks` / `raw` |     9 |
| `craft` / `craft`       |     9 |

Pages hybrides finalisees:

| Slug                | Etat                                  |
| ------------------- | ------------------------------------- |
| `documents`         | publiee, hybride, FunctionalPageBlock |
| `events`            | publiee, hybride, FunctionalPageBlock |
| `labels`            | publiee, hybride, FunctionalPageBlock |
| `outils`            | publiee, hybride, FunctionalPageBlock |
| `showroom`          | publiee, hybride, FunctionalPageBlock |
| `blog/{slug}`       | publiee, hybride, FunctionalPageBlock |
| `expert-kebe`       | publiee, hybride, FunctionalPageBlock |
| `rubrique-selector` | publiee, hybride, FunctionalPageBlock |
| `schema-builder`    | publiee, hybride, FunctionalPageBlock |

### Cas corrige - pages React speciales

Cause racine:

- les routes publiques `/documents`, `/events`, `/labels`, `/outils` et `/showroom` affichaient de vraies pages React via `DynamicPage` et `SPECIAL_FALLBACK_PAGES`;
- le Builder ouvrait les enregistrements CMS correspondants, dont `structure_json` etait encore un placeholder de migration;
- il ne s'agissait donc pas d'un probleme de cache, mais d'une divergence entre page React fonctionnelle et page CMS editable.

Correction appliquee:

- ces routes sont routees via `FunctionalBuilderRoute`;
- les slugs sont declares dans le registre des pages fonctionnelles;
- les enregistrements DB existants sont passes en `immutable=true`, `page_type=hybrid`, `render_engine=craft`, `editor_engine=craft`;
- `structure_json` et `draft_json` contiennent maintenant un `FunctionalPageBlock`.
- `site_settings.page_sections` a ete restaure et seed pour que `labels` et `showroom` disposent de leurs donnees de contenu.

Resultat:

- le public continue d'afficher les vraies pages React;
- le Builder n'affiche plus le contenu placeholder "Modifiez cette page..." sur ces slugs;
- le Builder indique que ces pages sont fonctionnelles/hybrides et protege la logique React.

### Cas corrige - pages fonctionnelles verrouillees

Controle demande sur 46 pages fonctionnelles publiees, incluant les routes admin, Expert Lab, GED, Office, dashboards, projets, diagnostics, analytics, auth/login/connexion et contact.

Resultat du controle croise:

| Controle                                    | Resultat |
| ------------------------------------------- | -------: |
| Pages trouvees en base                      |    46/46 |
| Pages canoniquement publiees                |    46/46 |
| Pages `immutable=true`                      |    46/46 |
| Pages avec `FunctionalPageBlock`            |    46/46 |
| Slugs presents dans le registre fonctionnel |    46/46 |
| Routes React presentes dans `App.tsx`       |    46/46 |
| Placeholder de migration detecte            |        0 |

Corrections appliquees:

- ajout des slugs manquants dans `FUNCTIONAL_PAGE_DEFINITIONS`: `admin`, routes Builder parametrees, routes Office, `projects/{id}`, `diagnostics/{id}`;
- correction du chargement de `AnalyticsPage`, `DocumentEditorPage`, `SpreadsheetEditorPage` et `PresentationEditorPage` via exports nommes;
- ajout des routes React explicites et protegees admin: `/admin/builder/legacy`, `/admin/craft-builder/:pageId`, `/admin/schematic-editor/:pageId`;
- ordre des routes Builder remis en statique puis dynamique: `builder`, `config`, `legacy`, puis `:pageId`.

Conclusion:

- les pages fonctionnelles listees sont maintenant coherentes entre base CMS, Builder, registre React et route applicative;
- `contact` reste en `visual_blocks/raw`, mais la page est verrouillee, publiee, et encapsule bien un `FunctionalPageBlock`;
- les routes admin ajoutees restent derriere `RoleProtectedRoute`.

## Forces

1. Le rendu public est robuste: `DynamicPage` gere Craft.js, legacy builder array et HTML brut.
2. Le God Builder est connecte au runtime Craft via `CraftPageRenderer` et `craftResolver`.
3. Les pages metier sensibles peuvent etre verrouillees via `FunctionalPageBlock`.
4. Les pages hybrides importantes sont publiees et reliees a leurs vraies pages React.
5. Les scripts CMS existent et couvrent deja capacites, donnees, pages Builder et ecarts draft/public.
6. Le centre des capacites CMS est structure et branche dans l'admin.

## Performance Builder

Les structures Builder sont legeres aujourd'hui. Le risque de lenteur a 500+ composants n'est pas present dans les donnees actuelles.

| Mesure                          |  Valeur |
| ------------------------------- | ------: |
| Pages mesurees                  |     125 |
| Moyenne de noeuds               |     4,9 |
| P95 de noeuds                   |       4 |
| Maximum de noeuds               |     188 |
| Taille moyenne `structure_json` |  2,1 KB |
| P95 taille `structure_json`     | 10,5 KB |
| Taille max `structure_json`     | 59,7 KB |

Pages les plus lourdes par noeuds:

| Slug                    | Noeuds |  Taille |
| ----------------------- | -----: | ------: |
| `formations`            |    188 | 59,7 KB |
| `home`                  |     61 | 33,3 KB |
| `evenements/seminaires` |     15 |  4,1 KB |
| `temoignages`           |     10 |  3,3 KB |
| `actualites-evenements` |      5 | 10,9 KB |

Interpretation:

- les pages les plus lourdes restent raisonnables;
- le P95 bas vient du grand nombre de pages fonctionnelles/hybrides composees d'un wrapper;
- le temps de rendu reel de `CraftPageRenderer` n'est pas encore benchmarke en navigateur.

Action recommandee:

- ajouter un test Playwright qui mesure `DOMContentLoaded`, `first-contentful-paint` si disponible, et temps de rendu des pages `formations`, `home`, `actualites-evenements`;
- declencher une alerte si une page depasse 500 noeuds ou 250 KB de `structure_json`.

## Securite CMS

Etat positif:

- aucun signal dangereux detecte en base dans les contenus CMS audites: `script`, handler inline, `javascript:`, `iframe`, `@import`;
- un utilitaire DOMPurify existe dans `src/utils/sanitize.ts`;
- `HtmlBlock` Craft applique une sanitization dans `src/components/blocks/ProquelecBlocks.tsx`;
- les uploads passent par `multer`, avec filtre d'extensions et limite de 500 Mo dans `server/modules/storage/storage.controller.js`.

Risques restants:

- `DynamicPage` contient un fallback HTML brut avec `dangerouslySetInnerHTML` non sanitise;
- `SectionRenderer`, `BlogPost` et certains blocs legacy injectent aussi du HTML brut;
- `server/index.js` lance `helmet` avec `contentSecurityPolicy: false`;
- `server/middleware/csp.ts` existe, mais autorise encore `unsafe-inline` et `unsafe-eval`.

Conclusion securite:

- la base actuelle ne montre pas de contenu XSS actif;
- la surface d'attaque reste elevee a cause de `raw/html`, legacy blocks, Craft renderer et pages dynamiques;
- la priorite est d'unifier la sanitization au point de rendu public, pas seulement dans quelques blocs.

Actions recommandees:

- passer tout HTML CMS public par `sanitizeHTML`;
- interdire ou isoler `custom_js` sauf pour administrateurs super-admin;
- durcir progressivement la CSP;
- valider les slugs routes dynamiques cote serveur avec une regex compatible slugs imbriques;
- conserver un allowlist explicite pour les types d'uploads.

## Tables Builder

| Table                        | Etat     | Lignes | Index | Foreign keys |
| ---------------------------- | -------- | -----: | ----: | -----------: |
| `builder_release_events`     | absente  |      - |     - |            - |
| `builder_release_candidates` | presente |      3 |     5 |            1 |
| `builder_page_revisions`     | presente |      2 |     3 |            2 |
| `builder_snapshots`          | presente |      0 |     4 |            1 |
| `builder_templates`          | presente |      3 |     4 |            0 |
| `builder_components`         | presente |      0 |     5 |            0 |
| `builder_exports`            | presente |      0 |     4 |            2 |
| `builder_collaboration`      | presente |      0 |     4 |            1 |
| `builder_pages`              | absente  |      - |     - |            - |
| `builder_versions`           | absente  |      - |     - |            - |

Analyse:

- `builder_release_events` est un vrai P0, car `server/modules/pages/release-manager.js` l'utilise en lecture/ecriture;
- `builder_pages` et `builder_versions` sont absentes, mais ce n'est pas bloquant si l'architecture officielle reste centree sur `pages`, `builder_release_candidates`, `builder_page_revisions` et `builder_snapshots`;
- les tables presentes ont des index et des FK coherentes;
- les volumes sont faibles, donc pas de risque de croissance a court terme.

Action recommandee:

- creer la migration `builder_release_events`;
- documenter le modele officiel des tables Builder;
- ajouter une purge controlee des candidats traites et anciens snapshots.

## Rollback

Le code de rollback existe dans `release-manager.js`, mais le workflow n'a pas ete valide end-to-end pendant cet audit.

Prerequis manquant:

- `builder_release_events` doit exister pour journaliser correctement creation, publication, rejet, purge et rollback.

Scenario a tester apres migration:

```text
1. Exporter une page
2. Creer un release candidate
3. Publier
4. Verifier builder_page_revisions avant/apres
5. Rollback N-1
6. Rollback N-2 si revision disponible
7. Verifier page publique, hash, statut candidat et journal release
```

Risque actuel:

- la publication peut fonctionner;
- le rollback peut etre partiellement disponible via `builder_page_revisions`;
- l'audit trail release est incomplet tant que `builder_release_events` manque.

## Qualite du contenu

Sur les 125 lignes CMS:

| Controle                   | Valeur |
| -------------------------- | -----: |
| Pages sans description SEO |    105 |
| Pages sans image detectee  |    113 |
| Pages sans auteur          |    125 |

Sur les 46 pages contenu publiees canoniques:

| Controle                         | Valeur |
| -------------------------------- | -----: |
| Pages sans description SEO       |     39 |
| Pages sans image detectee        |     37 |
| Pages sans auteur                |     46 |
| Pages publiees hors menu detecte |     20 |

Interpretation:

- le champ `author` n'est pas exploite comme metadata editoriale aujourd'hui;
- beaucoup de pages publiques ont besoin d'une passe SEO/metadonnees;
- les pages hors menu ne sont pas forcement des erreurs: certaines sont des routes techniques, des pages speciales ou des pages accessibles par liens directs.

Action recommandee:

- definir quels slugs doivent etre indexes;
- rendre `meta_description` obligatoire a la publication pour les pages contenu;
- ne pas rendre `author` obligatoire sur pages institutionnelles, mais le rendre obligatoire pour blog/actualites;
- distinguer "hors menu volontaire" et "orpheline involontaire".

## Risques prioritaires

### P0 - Schema release-manager incomplet

La table `builder_release_events` est referencee par `server/modules/pages/release-manager.js`, mais elle n'existe pas dans la base actuelle.

Impact:

- perte du journal d'evenements release;
- diagnostics release incomplets;
- rollback et purge moins auditables;
- risque d'exploitation en production.

Action:

- ajouter une migration `builder_release_events`;
- ajouter son creation path dans l'auto-migration;
- rejouer `npm run cms:audit:global`.

### P1 - Source de verite de publication incoherente

18 pages ne respectent pas la regle canonique. Parmi elles, 17 peuvent etre considerees visibles ou semi-visibles parce que `is_published=true` ou `status=published`.

Exemples:

- `lab`: `status=published`, `workflow_status=draft`, `is_published=true`;
- `normes`: `status=published`, `workflow_status=draft`, `is_published=true`;
- `actions/collectivites`: `status=draft`, `workflow_status=draft`, `is_published=true`;
- `teste`: `status=draft`, `workflow_status=draft`, `is_published=false`.

Impact:

- pages visibles alors que le workflow les presente comme brouillons;
- confusion admin;
- automatisations fragiles;
- risque metier superieur au risque technique.

Action:

- definir la regle canonique dans le code et la documentation;
- creer un script de normalisation avec `--dry-run`;
- empecher les futures divergences via validation backend.

### P1 - Coexistence Craft / legacy

`lab` et `normes` ont un `structure_json` de type array, pas un arbre Craft avec `ROOT`.

Impact:

- fallback public encore utile;
- edition future plus fragile;
- migration plus difficile si les blocs legacy divergent.

Action:

- convertir `lab` et `normes` vers Craft.js;
- ou les marquer explicitement comme legacy maintenu.

### P1 - Brouillons divergents de la version publique

Deux pages ont `draft_json` different de `structure_json`:

| Slug              | Type    |
| ----------------- | ------- |
| `contact-premium` | content |
| `test-builder`    | content |

Action:

- publier depuis le Builder si le brouillon est valide;
- sinon remettre `draft_json` a la valeur de `structure_json`.

### P2 - Multiplicite des moteurs de rendu

Le CMS fonctionne avec plusieurs moteurs, mais la convergence doit etre pilotee.

Strategie recommandee:

```text
craft/craft
↓
visual_blocks
↓
raw/html legacy uniquement
```

## Repriorisation

### Sprint 1 - Critique

1. Creer `builder_release_events`.
2. Corriger les 18 divergences de publication.
3. Ajouter un audit CI minimal:

```bash
npm run cms:audit
npm run cms:audit:global
node scripts/audit-builder-pages.cjs
node scripts/audit-builder-public-match.cjs
npm run build
```

### Sprint 2 - Stabilisation

4. Resoudre `contact-premium`.
5. Resoudre `test-builder`.
6. Documenter et imposer:

```text
published =
status='published'
AND workflow_status='published'
AND is_published=true
```

### Sprint 3 - Convergence Builder

7. Migrer `lab`.
8. Migrer `normes`.
9. Definir la politique officielle de rendu: `craft/craft`, puis `visual_blocks`, puis `raw/html` legacy.

### Sprint 4 - Durcissement

10. Appliquer `sanitizeHTML` a tous les rendus HTML CMS.
11. Ajouter benchmark Playwright sur les pages Builder les plus lourdes.
12. Ajouter controles SEO obligatoires avant publication des pages contenu.

## Evaluation par domaine

| Domaine                | Note |
| ---------------------- | ---: |
| Fonctionnel CMS        | 9/10 |
| Gouvernance contenu    | 8/10 |
| Architecture Builder   | 8/10 |
| Workflow publication   | 6/10 |
| Release management     | 5/10 |
| Dette technique        | 7/10 |
| Securite CMS           | 7/10 |
| Performance Builder    | 8/10 |
| Exploitabilite globale | 8/10 |

## Corrections appliquees pendant l'audit

1. `CmsCapabilityCenter` est maintenant branche dans `AdminDashboard`.
2. `npm run cms:audit` passe de 7/8 a 8/8.
3. `scripts/audit-cms-global.cjs` a ete ajoute.
4. `cms:audit:global` a ete ajoute dans `package.json`.

## Audit cible - page `/events`

### Diagnostic

La page publique `/events` etait hybride, mais son contenu metier restait partiellement statique: les evenements officiels et partenaires etaient definis dans `src/pages/Events.tsx`, tandis que le composant dashboard `EventCalendar` utilisait un etat local non persistant.

Le risque principal etait donc une divergence entre:

```text
Builder / page hybride
Dashboard agenda
Page publique /events
```

### Correction appliquee

1. `/events` lit maintenant ses textes, CTA et libelles depuis `site_settings.page_sections.events`.
2. Les cartes d'evenements proviennent de `public.events` via `GET /api/cms/events`.
3. `EventCalendar` cree, modifie et supprime les evenements via `POST/PUT/DELETE /api/cms/events`.
4. Les evenements publics filtrent les statuts non publies (`draft`, `annule`, `deleted`).
5. Les evenements sont separes dynamiquement par `organizer_type`: `proquelec` ou `partner`.
6. Le serveur expose le module CMS sous `/api/cms` pour eviter le conflit avec `/api/events`, deja utilise par les Server-Sent Events.
7. `scripts/seed-events-page.cjs` initialise le contenu de page et les premiers evenements de demonstration si la table est vide.

### Pilotage dashboard

| Element                     | Source                                            | Interface                           |
| --------------------------- | ------------------------------------------------- | ----------------------------------- |
| Titre hero, sous-titre, CTA | `site_settings.page_sections.events`              | Admin sections / JSON page sections |
| Evenements officiels        | `public.events` avec `organizer_type='proquelec'` | `EventCalendar`                     |
| Evenements partenaires      | `public.events` avec `organizer_type='partner'`   | `EventCalendar`                     |
| Publication                 | `status='published'`                              | `EventCalendar`                     |
| Brouillon / annulation      | `status='draft'` ou `status='annule'`             | `EventCalendar`                     |

### Verification

```text
GET /api/cms/events -> 200, 4 evenements publies
GET /events -> 200
node scripts/audit-builder-pages.cjs -> OK
node scripts/audit-builder-public-match.cjs -> OK, divergences restantes: contact-premium, test-builder
```

## Audit cible - pages sections publiques

### Diagnostic

Plusieurs pages publiques institutionnelles etaient publiees avec un contenu Builder ancien ou de migration, alors que leur vrai pilotage doit rester dynamique via les tableaux de bord de sections.

Le risque etait le meme que sur `/documents` et `/events`:

```text
Dashboard sections
Page Builder / structure_json
Page publique
```

pouvaient afficher des contenus differents.

### Source de verite retenue

Ces pages sont maintenant traitees comme des pages `section_driven`: le public lit `site_settings.page_sections`, et non un ancien `structure_json` Builder.

| Page                     | Route publique                              | Cle dashboard                    |
| ------------------------ | ------------------------------------------- | -------------------------------- |
| PORTAIL PROQUELEC        | `/`                                         | `home_page`                      |
| Espace Autorites         | `/autorites`, `/espace-autorites`           | `autorites`                      |
| Espace Menages           | `/menages`, `/espace-menages`               | `menages`                        |
| Marches Securises        | `/marches`                                  | `marches`                        |
| Espace Professionnels    | `/professionnels`, `/espace-professionnels` | `professionnels`                 |
| Espace Partenaires       | `/partenaires`                              | `partenaires`                    |
| Espace Partenaires dedie | `/espace-partenaires`                       | `espace_partenaires`             |
| Espace Formations        | `/formations`                               | `trainings`                      |
| Espace Presse            | `/presse`                                   | `presse`                         |
| Dashboard                | `/dashboard`                                | page fonctionnelle, hors Builder |

### Corrections appliquees

1. `DynamicPage` force ces routes vers le rendu dynamique `UniversalSectionsPage`.
2. `UniversalSectionsPage` utilise maintenant `SectionRenderer`, la meme logique de rendu que les sections configurees.
3. Les cles manquantes `home_page`, `autorites`, `menages`, `professionnels`, `presse`, `marches` et `espace_partenaires` ont ete initialisees dans `site_settings.page_sections`.
4. Les pages publiques correspondantes sont marquees `section_driven=true` dans `pages.design_options`, sans polluer l'arbre Craft `structure_json`.
5. `PageSectionsAdmin` expose maintenant les configurations `marches` et `espace_partenaires`.
6. `formations` est alignee sur la cle dynamique `trainings`.

### Verification

```text
GET / -> 200
GET /autorites -> 200
GET /espace-autorites -> 200
GET /menages -> 200
GET /espace-menages -> 200
GET /marches -> 200
GET /professionnels -> 200
GET /espace-professionnels -> 200
GET /partenaires -> 200
GET /espace-partenaires -> 200
GET /formations -> 200
GET /presse -> 200
GET /dashboard -> 200
npm run build -> OK
node scripts/audit-builder-pages.cjs -> OK, invalidCraft restants: lab, normes
node scripts/audit-builder-public-match.cjs -> OK, divergences restantes: contact-premium, test-builder
```

## Audit cible - menu public complet

### Diagnostic

Le menu public melange plusieurs familles de routes:

- pages institutionnelles section-driven;
- pages fonctionnelles React;
- pages hybrides historiques;
- alias de menu et sous-routes comme `/actions/diagnostics`, `/evenements/anniversaire` ou `/portal/formations`.

Le risque principal etait qu'une entree du menu affiche encore une page de migration du type:

```text
PROQUELEC Activities
Modifiez cette page avec le God Mode Builder
```

### Corrections appliquees

1. Les alias de menu ont ete normalises dans `DynamicPage`.
2. Les routes `/portal/*` sont resolues vers leur page publique equivalente.
3. Les routes menu manquantes ou anciennes ont ete rattachees a une cle `site_settings.page_sections`.
4. `PageSectionsAdmin` expose les cles utiles pour administrer ces pages via les dashboards.
5. Les scripts d'audit Builder distinguent maintenant les pages `section_driven` des pages Craft classiques.

### Verification menu

Controle navigateur Playwright sur 62 routes de menu et alias:

```text
Routes testees: 62
Statuts HTTP >= 400: 0
Pages 404 detectees: 0
Textes de migration detectes: 0
```

Routes critiques confirmees en 200:

```text
/utilite-publique
/nos-actions
/formations
/formation-certification
/normes-ressources
/projets
/projets-realisations
/actualites-evenements
/blog
/partenaires
/activities
/certifications
/expertises-techniques
/expertises
/expert-lab
/labels
/showroom
/documents
/events
/outils
/autorites
/menages
/professionnels
/presse
/social
/portal/marches
/portal/dashboard
/portal/formations
/actions/diagnostics
/actions/collectivites
/evenements/anniversaire
/evenements/seminaires
```

### Verification technique

```text
node scripts/audit-builder-pages.cjs
-> total: 127
-> sectionDriven: 36
-> missingStructure: 0
-> invalidCraft restants: lab, normes

node scripts/audit-builder-public-match.cjs
-> missingStructure: 0
-> divergences restantes: contact-premium, test-builder

npm run build -> OK
```

## Conclusion

Le CMS est exploitable et bien avance. Le point le plus important a traiter n'est pas Craft.js ni la quantite de blocs: c'est la **source de verite de publication**. Tant que `status`, `workflow_status` et `is_published` peuvent diverger, le risque de gouvernance restera superieur au risque technique.

La prochaine passe doit donc commencer par:

```text
builder_release_events
normalisation des statuts
audit CI
```
