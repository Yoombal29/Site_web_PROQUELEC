/**
 * ⚙️ Configuration Tests — Jest & Testing Library
 *
 * Configuration complète pour les tests automatisés :
 * - Jest pour les tests unitaires et d'intégration
 * - React Testing Library pour les composants UI
 * - Configuration TypeScript et ES modules
 * - Rapports de couverture
 */

module.exports = {
  // Environnement de test
  testEnvironment: 'jsdom',

  // Extensions de fichiers de test
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx|js|jsx)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx|js|jsx)',
    '<rootDir>/src/tests/**/*.(test|spec).(ts|tsx|js|jsx)'
  ],

  // Transformations pour TypeScript et JSX
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      },
      useESM: true
    }],
    '^.+\\.(js|jsx)$': 'babel-jest'
  },

  // Extensions de modules
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Mappings de modules
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@stores/(.*)$': '<rootDir>/src/stores/$1',
    '^@engines/(.*)$': '<rootDir>/src/engines/$1',
    '^@managers/(.*)$': '<rootDir>/src/managers/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1'
  },

  // Configuration des mocks
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],

  // Collecteurs de couverture
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/tests/**',
    '!src/**/*.test.(ts|tsx)',
    '!src/**/*.spec.(ts|tsx)',
    '!src/main.tsx',
    '!src/vite-env.d.ts'
  ],

  // Seuils de couverture
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 75,
      statements: 75
    }
  },

  // Répertoires de couverture
  coverageDirectory: 'coverage',

  // Formats de rapport de couverture
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],

  // Fichiers à ignorer pour la couverture
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/src/tests/',
    '/src/main.tsx',
    '/src/vite-env.d.ts'
  ],

  // Configuration des snapshots
  snapshotSerializers: [],

  // Délai d'attente par défaut
  testTimeout: 10000,

  // Mode verbose pour les détails des tests
  verbose: true,

  // Détection automatique des tests
  detectOpenHandles: true,

  // Nettoyage automatique des mocks
  clearMocks: true,
  restoreMocks: true,

  // Gestion des erreurs non interceptées
  errorOnDeprecated: true,

  // Configuration des workers
  maxWorkers: '50%',

  // Cache des transformations
  cache: true,

  // Répertoire de cache
  cacheDirectory: '<rootDir>/.jest-cache'
};