# Guide admin CMS PROQUELEC

Ce guide formalise l'utilisation gratuite des capacités utiles au CMS PROQUELEC.

## Objectif

Le CMS doit permettre au webmaster de créer, vérifier et publier des pages sans dépendre d'un service externe pour les opérations courantes.

## Règle centrale

Les modèles officiels doivent utiliser les classes stables `pq-*`. Tailwind reste un outil de développement interne ; les contenus collés dans le Builder doivent rester lisibles parce que le CSS PROQUELEC est déjà présent dans le bundle.

## Parcours webmaster

1. Choisir un modèle officiel ou un template premium.
2. Vérifier que le HTML contient des classes `pq-*`.
3. Coller ou insérer le modèle dans le Builder.
4. Tester le rendu desktop et mobile.
5. Contrôler les liens, formulaires et appels à l'action.
6. Publier uniquement après sauvegarde et prévisualisation.
7. Lancer `npm run cms:audit` avant déploiement.

## Capacités gratuites exploitables

| Capacité              | Usage PROQUELEC                                                     |
| --------------------- | ------------------------------------------------------------------- |
| Design frontend       | Pages premium, templates Builder, design mobile, composants `pq-*`. |
| Web design guidelines | Contrôle accessibilité, cohérence visuelle et responsive.           |
| shadcn/Radix          | Admin plus robuste : cards, tabs, tables, alertes, dialogs.         |
| Composition React     | Registres de templates, composants découplés, code maintenable.     |
| React best practices  | Lazy loading, réduction des rendus inutiles, pages plus rapides.    |
| Playwright            | Tests admin, outils, Builder et permissions.                        |
| Sécurité              | Audit RBAC, tokens, routes admin et accès refusés.                  |
| Data analysis         | Exports dossiers, paiements, formations, certifications.            |
| Recharts              | Observatoire, stats conformité, campagnes et formations.            |
| Git workflow          | Commit propre, release, checklist VPS.                              |
| Documentation         | Guides admin, procédures, FAQ support.                              |
| Slides                | Supports de formation et bilans institutionnels.                    |
| Dogfood QA            | Parcours réel : login, création page, publication, permissions.     |

## Checklist avant publication

- Le titre et la méta-description de la page sont clairs.
- Le premier écran indique immédiatement le public visé.
- Les boutons ont une action réelle.
- Les textes ne débordent pas sur mobile.
- Les images ont un texte alternatif.
- Les formulaires affichent leurs erreurs.
- Les permissions admin sont cohérentes avec la sidebar.
- Le Builder ne bloque pas le drag/drop.
- La page fonctionne après rafraîchissement navigateur.

## Commandes utiles

```bash
npm run cms:audit
npm run cms:docs
npm run cms:slides
npm run cms:data
npm run test:e2e:cms
npm run build
```

## Procédure incident

Si une page Builder semble cassée :

1. Vérifier l'encodage du texte publié.
2. Vérifier que le modèle utilise `pq-*` et non des classes Tailwind inconnues.
3. Tester la page en mobile.
4. Contrôler la console navigateur.
5. Revenir au dernier candidat publié si nécessaire.
6. Créer une note d'incident avec URL, capture, rôle utilisateur et heure.

## Gouvernance

Chaque nouvelle fonctionnalité CMS doit indiquer :

- l'objectif métier ;
- le rôle autorisé ;
- le test minimal ;
- l'impact mobile ;
- le risque sécurité ;
- la procédure de retour arrière.
