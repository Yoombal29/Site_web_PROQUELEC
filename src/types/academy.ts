
export interface Module {
  id: string;
  title: string;
  prerequisites: string[];
  knowledge: string[];
  skills: string[];
  duration: number; // en heures
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'pptx';
  size: number;
  uploadedAt: Date;
  content?: string;
  processed: boolean;
}

export interface Course {
  id: string;
  title: string;
  description?: string;
  instructor_name?: string;
  duration_hours?: number;
  level?: string;
  difficulty?: string;
  status: 'draft' | 'published' | 'archived';
  modules: Module[];
  documents: Document[];
  content: CourseContent;
  generatedAt: Date;
  lastModified: Date;
}

export interface CourseContent {
  introduction: string;
  sections: CourseSection[];
  conclusion: string;
  qcm: QCMQuestion[];
  resources: string[];
}

export interface CourseSection {
  id: string;
  title: string;
  explanation: string;
  examples: string[];
  warnings: string[];
  illustrations?: string[];
}

export interface QCMQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ContentAnalysis {
  wordCount: number;
  concepts: string[];
  suggestedModules: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
}

export interface GenerationSettings {
  includeQCM: boolean;
  includeIntroduction: boolean;
  includeConclusion: boolean;
  addExamples: boolean;
  addWarnings: boolean;
  qcmQuestionCount: number;
  courseStyle: 'structured' | 'conversational' | 'technical';
}

export interface NormRule {
  id: string;
  titre: string;
  article: string;
  content: string;
  page: number;
  normId?: string;
  category?: string;
  keywords?: string[];
}

export interface SommaireNode {
  index: string;
  label: string;
  level: number;
  children: SommaireNode[];
}

export interface NormSearchResult {
  rule: NormRule;
  score: number;
  matchType: 'exact' | 'partial' | 'keyword';
  normId?: string;
}

export interface NormDatabase {
  rules: NormRule[];
  sommaire: SommaireNode[];
  loaded: boolean;
  ruleCount: number;
  fullData?: NormFullJSON;
  chunks?: NormChunk[];
  qcm?: NormQCMQuestion[];
}

export interface NormMetadata {
  id: string;
  name: string;
  description: string;
  version?: string;
  country?: string;
  domain: string;
  importedAt: string;
  ruleCount: number;
  source?: string;
}

export interface NormImportFormat {
  metadata: {
    id: string;
    name: string;
    description: string;
    version?: string;
    country?: string;
    domain: string;
  };
  sommaire?: SommaireNode[];
  rules: Array<{
    id?: string;
    titre: string;
    article: string;
    content: string;
    page?: number;
    category?: string;
    keywords?: string[];
  }>;
}

export interface MultiNormDatabase {
  norms: Map<string, NormDatabase>;
  metadata: Map<string, NormMetadata>;
  activeNormId: string | null;
  totalRuleCount: number;
}

export interface NormContext {
  selectedRules: NormRule[];
  searchQuery: string;
  selectedTitre: string | null;
  selectedArticle: string | null;
  activeNormId?: string;
}

export interface NormImportValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  preview?: {
    name: string;
    ruleCount: number;
    sampleRules: NormRule[];
  };
}

// --- Nouvelles structures pour l'IA Normative ---

export interface NormChunk {
  id: string;
  text: string;
  metadata: {
    normId: string;
    article?: string;
    titre?: string;
    page?: number;
    context?: string;
  };
}

export interface NormQCMQuestion {
  id: string;
  question: string;
  options: string[];
  correct_indices: number[];
  source_section: string;
}

export interface NormFullJSON {
  metadata: {
    generated_at: string;
    source_md: string;
    source_pdf: string;
    sections_count: number;
    chunks_count: number;
  };
  resume: {
    metadonnees: {
      type_document: string;
      numero_norme: string;
      titre: string;
      date_publication: string;
      equivalence?: string;
      editeur?: string;
      country?: string;
    };
    definitions_techniques?: {
      total_definitions: number;
      categories: string[];
    };
    concepts_cles?: Record<string, unknown>;
    references_legales?: Record<string, string[]>;
  };
  atomisation: {
    sections: Array<{
      id: string;
      numero: string;
      titre: string;
      type: string;
      contenu: string;
      niveau: number;
    }>;
  };
}