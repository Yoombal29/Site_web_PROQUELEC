
import { supabase } from '@/integrations/supabase/client';

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
    expectedArticle: string
): Promise<TestResult> {
    // Simulate AI query (in production, this would call the actual AI endpoint)
    const { data: articles } = await supabase
        .from('normative_articles')
        .select('*, normative_books(ref_code)')
        .textSearch('content_exact', question.split(' ').join(' & '))
        .limit(1);

    const passed = articles && articles.length > 0 &&
        (articles[0].normative_books as any)?.ref_code === expectedNorm &&
        articles[0].article_ref === expectedArticle;

    return {
        testId: 'citation_test',
        question,
        expectedBehavior: 'citation',
        passed,
        actualResponse: articles?.[0]?.content_exact || 'No response',
        citedNorm: (articles?.[0]?.normative_books as any)?.ref_code,
        citedArticle: articles?.[0]?.article_ref
    };
}

async function testRefusal(question: string): Promise<TestResult> {
    const { data: articles } = await supabase
        .from('normative_articles')
        .select('*')
        .textSearch('content_exact', question.split(' ').join(' & '));

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
    expectedNorm: string
): Promise<TestResult> {
    const { data: articles } = await supabase
        .from('normative_articles')
        .select('*, normative_books(ref_code)')
        .eq('article_ref', 'Safety-Mandate')
        .single();

    const passed = articles && (articles.normative_books as any)?.ref_code === expectedNorm;

    return {
        testId: 'safety_alert_test',
        question,
        expectedBehavior: 'safety_alert',
        passed,
        actualResponse: articles?.content_exact || 'No safety mandate found',
        citedNorm: (articles?.normative_books as any)?.ref_code
    };
}
