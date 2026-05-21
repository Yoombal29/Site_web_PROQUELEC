/// <reference lib="webworker" />

import { DeterministicCourseGenerator } from '@/services/academy/deterministicCourseGenerator';
import { normService } from '@/services/academy/normService';


type GenerateRequest = {
  type: 'generate';
  payload: {
    documents: Document[];
    settings: GenerationSettings;
    customInstructions?: string;
    selectedNormRules?: NormRule[];
  };
};

type WorkerRequest = GenerateRequest;

type WorkerResponse =
{type: 'result';payload: ReturnType<typeof DeterministicCourseGenerator.generateCourse>;} |
{type: 'error';error: string;};

const loadNorms = async () => {
  try {
    if (!normService.isLoaded()) {
      await normService.loadData();
    }
  } catch {

    // Normes optionnelles: generation possible meme si le chargement echoue.
  }};

const handleGenerate = async (request: GenerateRequest) => {
  const { documents, settings, customInstructions, selectedNormRules } = request.payload;
  await loadNorms();
  return DeterministicCourseGenerator.generateCourse(
    documents,
    settings,
    customInstructions,
    selectedNormRules
  );
};

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const message = event.data;

  try {
    if (message.type === 'generate') {
      const result = await handleGenerate(message);
      const response: WorkerResponse = { type: 'result', payload: result };
      self.postMessage(response);
    }
  } catch (error) {
    const response: WorkerResponse = {
      type: 'error',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
    self.postMessage(response);
  }
};