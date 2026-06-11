# Audit CMS PROQUELEC

Date: 2026-06-11T12:54:18.083Z

Résultat: 8/8 contrôles réussis.

| Contrôle                                   | Statut | Détail                                             |
| ------------------------------------------ | ------ | -------------------------------------------------- |
| Matrice des capacités CMS                  | OK     | 13 capacité(s) détectée(s).                        |
| Design system pq-\* séparé                 | OK     | 11/11 fichiers CSS présents.                       |
| Centre CMS branché dans l’admin            | OK     | Entrée sidebar et rendu d’onglet vérifiés.         |
| Catalogue outils sans placeholder /apps    | OK     | Aucune route /apps placeholder détectée.           |
| Bibliothèque de modèles pqTemplates        | OK     | 25 template(s) dans le registre.                   |
| Scripts CMS exposés                        | OK     | Scripts npm de contrôle présents.                  |
| Validateur IA synchronisable               | OK     | test_ai_endpoints.js présent à la racine.          |
| Aucune durée Tailwind ambiguë dans le hero | OK     | La durée longue du zoom est gérée en style inline. |

## Recommandations

- Exécuter `npm run cms:audit` avant chaque déploiement VPS.
- Exécuter `npm run test:e2e:cms` lorsque le serveur local est démarré.
- Garder les modèles officiels sur les classes `pq-*` et éviter les classes Tailwind arbitraires dans le HTML collé.
- Vérifier les permissions admin quand un nouvel onglet est ajouté à la sidebar.
- Générer le guide et les slides avec `npm run cms:docs` et `npm run cms:slides` avant une formation webmaster.
