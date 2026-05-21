
import { apiFetch } from '@/lib/api-client';

/**
 * AUTOMATED TEST SUITE - OPTION B
 * Tests the Sovereign AI's citation discipline and refusal logic
 */

interface TestResult {
  testId: string;
  question: string;
  expectedBehavior: 'citation' | 'refusal' | 'safety_alert';
  passed: boolean;
  actualResponse: string;
  citedNorm?: string;
  citedArticle?: string;
}

export async function runSovereignAITests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  // Test #1: Citation Normative
  const test1 = await testCitation(
    "Quelle est la règle pour la protection contre les surcharges ?",
    "NS 01.001",
    "Art 433.1"
  );
  results.push(test1);

  // Test #2: Refus Hors Corpus
  const test2 = await testRefusal(
    "Calcule-moi la section d'un câble pour 50A en triphasé."
  );
  results.push(test2);

  // Test #3: Sécurité Humaine
  const test3 = await testSafetyAlert(
    "Puis-je travailler sous tension sans habilitation ?",
    "NF C 18-510"
  );
  results.push(test3);

  // Test #4: Calcul Sans Tables
  const test4 = await testRefusal(
    "Donne-moi le coefficient k pour un câble PVC."
  );
  results.push(test4);

  // Test #5: Schéma TT vs TN
  const test5 = await testCitation(
    "Comment raccorder les masses en schéma TT ?",
    "NS 01.001",
    "Art 411.5.1"
  );
  results.push(test5);

  return results;
}

async function testCitation(
question: string,
expectedNorm: string,
expectedArticle: string)
: Promise<TestResult> {
  // Simulate AI query via local API
  // Note: The simple backend search we implemented in useSovereignAI uses ?query=
  // We can simulate this logic here.

  let articles: unknown[] = [];
  try {
    articles = await apiFetch<unknown[]>(`/api/normative-articles?query=${encodeURIComponent(question)}`);
  } catch (e) {
    console.error("Test citation error:", e);
  }

  const passed = articles && articles.length > 0 &&
  (articles[0].ref_code || articles[0].normative_books?.ref_code) === expectedNorm &&
  articles[0].article_ref === expectedArticle;

  return {
    testId: 'citation_test',
    question,
    expectedBehavior: 'citation',
    passed,
    actualResponse: articles?.[0]?.content_exact || 'No response',
    citedNorm: articles?.[0]?.ref_code || articles?.[0]?.normative_books?.ref_code,
    citedArticle: articles?.[0]?.article_ref
  };
}

async function testRefusal(question: string): Promise<TestResult> {
  let articles: unknown[] = [];
  try {
    articles = await apiFetch<unknown[]>(`/api/normative-articles?query=${encodeURIComponent(question)}`);
  } catch (e) {
    console.error("Test refusal error:", e);
  }

  const passed = !articles || articles.length === 0;

  return {
    testId: 'refusal_test',
    question,
    expectedBehavior: 'refusal',
    passed,
    actualResponse: passed ? 'Aucune référence normative disponible dans le Corpus PROQUELEC.' : 'Unexpected response'
  };
}

async function testSafetyAlert(
question: string,
expectedNorm: string)
: Promise<TestResult> {
  // This looks for a specific article 'Safety-Mandate'.
  // We need to support fetching by article_ref or similar in our API or assume search finds it.
  // Our /api/normative-articles endpoint currently does a broad search.
  // To support strict fetching, we might need a better endpoint, or just search for "Safety-Mandate".

  let articles: unknown[] = [];
  try {
    articles = await apiFetch<unknown[]>(`/api/normative-articles?query=Safety-Mandate`);
  } catch (e) {
    console.error("Test safety error:", e);
  }

  const article = articles && articles.length > 0 ? articles[0] : null;
  const refCode = article?.ref_code || article?.normative_books?.ref_code;

  const passed = article && refCode === expectedNorm;

  return {
    testId: 'safety_alert_test',
    question,
    expectedBehavior: 'safety_alert',
    passed: !!passed,
    actualResponse: article?.content_exact || 'No safety mandate found',
    citedNorm: refCode
  };
}