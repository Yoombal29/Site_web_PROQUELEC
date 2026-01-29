# 🧪 Système de Tests Automatisés

## Vue d'ensemble

Suite complète de tests automatisés pour valider le système électrique PROQUELEC :

- **Tests unitaires** : Logique métier et calculs NF C 15-100
- **Tests d'intégration** : Composants et interactions
- **Tests de performance** : Schémas complexes et optimisation
- **Tests de validation** : Conformité et sécurité

## Structure des Tests

```
src/tests/
├── BasicTests.test.ts          # Tests de base (calculs électriques)
├── ElectricalSystem.test.ts    # Suite complète système électrique
├── UIComponents.test.tsx       # Tests composants React
├── VoltageDropCalculator.test.tsx # Tests calculateur spécialisé
├── setup.ts                    # Configuration globale des tests
└── README.md                   # Documentation détaillée
```

## Exécution des Tests

### Tests Rapides (Recommandé)
```bash
# Tests essentiels pour le développement quotidien
./scripts/quick-test.sh
```

### Tests Complets
```bash
# Suite complète avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch

# Tests CI (sans watch)
npm run test:ci
```

### Tests Spécifiques
```bash
# Tests de base seulement
npx jest src/tests/BasicTests.test.ts

# Tests avec couverture détaillée
npx jest --coverage --coverageDirectory=coverage
```

## Métriques de Qualité

### Couverture Cible
- **Lignes** : 75% minimum
- **Fonctions** : 80% minimum
- **Branches** : 70% minimum
- **Déclarations** : 75% minimum

### Seuils de Performance
- **Calculs électriques** : < 100ms par test
- **Rendu composants** : < 500ms pour 50 nœuds
- **Validation complète** : < 2s pour schémas complexes

## Tests Implémentés

### ✅ Tests de Base (Fonctionnels)
- Calculs de chute de tension (Cuivre/Aluminium)
- Conformité NF C 15-100
- Résistance aux données invalides
- Calculs multiples et agrégation
- Différents matériaux conducteurs

### 🔄 Tests Avancés (En développement)
- Validation temps réel
- Bibliothèque de composants
- Export multi-format
- Simulation avancée
- Interface utilisateur

## Configuration Jest

```javascript
// jest.config.cjs
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: { jsx: 'react-jsx' }
    }]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 75,
      statements: 75
    }
  }
};
```

## Utilitaires de Test

### Création de données de test
```typescript
import { createTestGraphStore, createSimpleTestSchema } from '@/tests/setup';

// GraphStore de test
const store = createTestGraphStore();

// Schéma simple prédéfini
const schema = createSimpleTestSchema();
```

### Assertions personnalisées
```typescript
expect.extend({
  toBeValidCalculation(received) {
    // Validation résultat calcul
  },
  toBeValidValidation(received) {
    // Validation résultat validation
  },
  toBeValidComponent(received) {
    // Validation composant
  }
});
```

## Scripts Disponibles

### Linux/macOS
- `scripts/quick-test.sh` : Tests rapides
- `scripts/run-tests.sh` : Tests complets

### Windows
- `scripts/quick-test.ps1` : Tests rapides
- `scripts/run-tests.ps1` : Tests complets

## Intégration CI/CD

### GitHub Actions
```yaml
- name: Run Tests
  run: npm run test:ci

- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

### Validation Pré-commit
```bash
# Dans package.json
"lint-staged": {
  "*.{ts,tsx}": [
    "npm run test:ci",
    "eslint --fix"
  ]
}
```

## Dépannage

### Erreurs Courantes

**"Cannot find module"**
```bash
# Vérifier les mappings de modules dans jest.config.cjs
npm install  # Réinstaller les dépendances
```

**"JSX not configured"**
```bash
# Vérifier la configuration ts-jest
# jsx: 'react-jsx' doit être défini
```

**"Timeout"**
```bash
# Augmenter le timeout dans jest.config.cjs
testTimeout: 10000
```

### Debug des Tests
```bash
# Mode debug
npx jest --inspect-brk

# Tests spécifiques
npx jest --testNamePattern="calcul chute"

# Verbose
npx jest --verbose
```

## Évolution

### Tests à Implémenter
- [ ] Tests de performance complets
- [ ] Tests d'accessibilité (a11y)
- [ ] Tests de sécurité
- [ ] Tests d'intégration API
- [ ] Tests end-to-end (Playwright/Cypress)

### Améliorations
- [ ] Snapshots pour composants UI
- [ ] Tests de régression visuelle
- [ ] Mocking avancé des APIs
- [ ] Tests de charge
- [ ] Rapports HTML détaillés