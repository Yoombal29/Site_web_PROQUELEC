/**
 * 🏗️ CONTRATS D'INTERFACE POUR RUBRIQUES DE SCHÉMAS
 * 
 * Définit le contrat que chaque rubrique DOIT respecter pour être intégrée à la plateforme.
 * 
 * Statut : Verrouillé — Aucune modification sans validation architecture
 */



// ============================================================================
// 1️⃣ RÉSULTAT DE VALIDATION
// ============================================================================

export interface ValidationError {
  id: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
  nodeId?: string;
  edgeId?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  score?: number; // 0-100 : conformité
}

// ============================================================================
// 2️⃣ RÉSULTATS DE CALCUL
// ============================================================================

export interface CalculationMetric {
  name: string;
  value: number;
  unit: string;
  status: 'OK' | 'WARNING' | 'ERROR';
  normative?: string; // Référence NF
}

export interface CalculationResult {
  rubriquId: string;
  timestamp: number;
  metrics: CalculationMetric[];
  verdict: 'CONFORME' | 'NON_CONFORME' | 'AVERTISSEMENT' | 'INCOMPLET';
  details: Record<string, unknown>;
  graphHash: string; // Pour traçabilité
}

// ============================================================================
// 3️⃣ RAPPORT GÉNÉRÉ
// ============================================================================

export interface Report {
  title: string;
  rubriquId: string;
  timestamp: number;
  summary: string;
  sections: ReportSection[];
  verdict: 'CONFORME' | 'NON_CONFORME' | 'INCOMPLET';
  attachments?: {
    name: string;
    type: 'TABLE' | 'CHART' | 'DIAGRAM' | 'TEXT';
    content: unknown;
  }[];
}

export interface ReportSection {
  title: string;
  content: string;
  subsections?: ReportSection[];
  data?: unknown;
}

// ============================================================================
// 4️⃣ COMPORTEMENT D'OBJET DANS UNE RUBRIQUE
// ============================================================================

export interface ObjectBehavior {
  objectId: string;
  rubriquId: string;

  // Paramètres visibles et requis pour cette rubrique
  visibleParams: string[];
  requiredParams: string[];

  // Validations spécifiques
  validators: ((node: GraphNode) => ValidationError | null)[];

  // Calcul associé
  contributes_to_calculation: boolean;
  calculation_role?: 'SOURCE' | 'PROTECTION' | 'LOAD' | 'CONNECTION' | 'OTHER';
}

// ============================================================================
// 5️⃣ MOTEUR DE CALCUL
// ============================================================================

export interface Graph {
  nodes: Map<string, GraphNode>;
  edges: Map<string, GraphEdge>;
  getHash(): string;
}

export interface CalculationEngine {
  name: string;
  version: string;

  /**
   * Valider le graphe avant calcul
   */
  validate(graph: Graph): ValidationResult;

  /**
   * Effectuer les calculs
   */
  calculate(graph: Graph): CalculationResult;

  /**
   * Générer un rapport
   */
  generateReport(result: CalculationResult, graph: Graph): Report;

  /**
   * Propriétés de calcul
   */
  properties: {
    supportsBatchCalculation: boolean;
    supportsScenarios: boolean;
    supportsComparison: boolean;
    estimatedCalculationTime: number; // ms
  };
}

// ============================================================================
// 6️⃣ RUBRIQUE DE SCHÉMA - CONTRAT PRINCIPAL
// ============================================================================

export interface RubriqueSchema {
  // ========== IDENTIFIANT ET MÉTADONNÉES ==========

  /** Identifiant unique */
  id: RubriqueId;

  /** Nom lisible */
  name: string;

  /** Description détaillée */
  description: string;

  /** Version de la rubrique */
  version: string;

  /** Ordre d'affichage dans l'UI */
  displayPriority: number;

  /** Statut de maturité */
  maturity: 'ALPHA' | 'BETA' | 'STABLE' | 'DEPRECATED';

  /** Icône emoji */
  icon: string;

  // ========== MOTEUR MÉTIER ==========

  /** Moteur de calcul associé */
  engine: CalculationEngine;

  // ========== BIBLIOTHÈQUE D'OBJETS ==========

  /**
   * Retourner la liste des objets disponibles pour cette rubrique
   */
  getAvailableObjects(): ObjectDefinition[];

  /**
   * Retourner le comportement d'un objet dans cette rubrique
   */
  getObjectBehavior(objectId: string): ObjectBehavior | null;

  /**
   * Vérifier si un objet peut être utilisé dans cette rubrique
   */
  isObjectAllowed(objectId: string): boolean;

  // ========== VALIDATIONS ==========

  /**
   * Valider le graphe complet
   */
  validateGraph(graph: Graph): ValidationResult;

  /**
   * Valider un nœud (objet)
   */
  validateNode(node: GraphNode): ValidationResult;

  /**
   * Valider une arête (câble/connexion)
   */
  validateEdge(edge: GraphEdge): ValidationResult;

  // ========== CALCULS ==========

  /**
   * Effectuer les calculs métier
   */
  calculate(graph: Graph): CalculationResult;

  // ========== RAPPORT ==========

  /**
   * Générer un rapport complet
   */
  generateReport(result: CalculationResult, graph: Graph): Report;

  /**
   * Exporter le rapport en différents formats
   */
  exportReport(report: Report, format: 'PDF' | 'HTML' | 'JSON'): Blob;

  // ========== RÈGLES NORMATIVES ==========

  /**
   * Références normatives applicables
   */
  normativeReferences: {
    standard: string;
    articles: string[];
    description: string;
  }[];

  // ========== INTERFACE GRAPHIQUE ADAPTÉE ==========

  /**
   * Composants React personnalisés pour cette rubrique
   */
  getCustomComponents(): {
    sidebar?: React.ComponentType<unknown>;
    toolbar?: React.ComponentType<unknown>;
    inspector?: React.ComponentType<unknown>;
    resultPanel?: React.ComponentType<unknown>;
  };

  /**
   * Couleurs et styles personnalisés
   */
  getTheme(): {
    nodeColors: Record<string, string>;
    edgeColors: Record<string, string>;
    accentColor: string;
  };

  // ========== FONCTIONNALITÉS AVANCÉES ==========

  /**
   * Scénarios de calcul (si supportés)
   */
  supportsScenarios: boolean;
  getScenarios?(): string[];
  calculateScenario?(graph: Graph, scenarioId: string): CalculationResult;

  /**
   * Comparaison (si supportée)
   */
  supportsComparison: boolean;
  compare?(result1: CalculationResult, result2: CalculationResult): ComparisonResult;
}

// ============================================================================
// 7️⃣ RÉSULTAT DE COMPARAISON
// ============================================================================

export interface ComparisonResult {
  scenario1: string;
  scenario2: string;
  differences: {
    metric: string;
    value1: number;
    value2: number;
    delta: number;
    deltaPercent: number;
  }[];
  recommendation?: string;
}

// ============================================================================
// 8️⃣ DÉFINITION D'OBJET
// ============================================================================

export interface ObjectDefinition {
  id: string;
  name: string;
  category: string;
  symbol: string;
  icon: string;
  description?: string;
  params: ObjectParameter[];
  defaultParams: Record<string, unknown>;
}

export interface ObjectParameter {
  key: string;
  name: string;
  type: 'NUMBER' | 'STRING' | 'SELECT' | 'BOOLEAN' | 'ARRAY';
  required: boolean;
  default?: unknown;
  unit?: string;
  options?: {label: string;value: unknown;}[];
}

// ============================================================================
// 9️⃣ ÉNUMÉRATION DES RUBRIQUES
// ============================================================================

export type RubriqueId =
'VOLTAGE_DROP' // Calcul de chute de tension
| 'UNIFILAIRE' // Schéma unifilaire BT
| 'PROTECTION' // Schéma de protection
| 'THERMAL' // Étude thermique
| 'REGULATORY' // Dossier réglementaire
| 'SIMULATION'; // Simulation avancée

// ============================================================================
// 🔟 REGISTRY DE RUBRIQUES
// ============================================================================

export interface RubriqueRegistry {
  /**
   * Enregistrer une nouvelle rubrique
   */
  register(rubrique: RubriqueSchema): void;

  /**
   * Récupérer une rubrique par ID
   */
  get(id: RubriqueId): RubriqueSchema | null;

  /**
   * Lister toutes les rubriques disponibles
   */
  getAll(): RubriqueSchema[];

  /**
   * Lister les rubriques actives (non deprecated)
   */
  getActive(): RubriqueSchema[];

  /**
   * Vérifier si une rubrique existe
   */
  exists(id: RubriqueId): boolean;
}

// ============================================================================
// 🧩 FACTORY PATTERN
// ============================================================================

export interface RubriqueFactory {
  /**
   * Créer une instance d'une rubrique
   */
  create(id: RubriqueId): RubriqueSchema;

  /**
   * Créer et initialiser une rubrique
   */
  createAndInitialize(id: RubriqueId, config?: unknown): RubriqueSchema;

  /**
   * Cloner une rubrique
   */
  clone(rubrique: RubriqueSchema): RubriqueSchema;
}

// ============================================================================
// 📌 CONTEXTE DE RUBRIQUE (Runtime)
// ============================================================================

export interface RubriqueContext {
  /**
   * La rubrique active
   */
  rubrique: RubriqueSchema;

  /**
   * Graphe courant
   */
  graph: Graph;

  /**
   * Résultat du dernier calcul
   */
  lastResult?: CalculationResult;

  /**
   * Erreurs et avertissements courants
   */
  validationResult?: ValidationResult;

  /**
   * État personnalisé de la rubrique
   */
  state: Record<string, unknown>;

  /**
   * Historique des calculs
   */
  history: CalculationResult[];
}

export default RubriqueSchema;