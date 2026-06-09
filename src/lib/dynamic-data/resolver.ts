import { tokenizeExpression } from './tokenizer';
import { evaluateToken, type EvaluationContext } from './safeEvaluator';

/**
 * Résout toutes les expressions dynamiques {{ namespace.key }} dans un texte donné.
 * Exemple: "Bienvenue sur {{ global.siteName }}" -> "Bienvenue sur PROQUELEC Sénégal"
 */
export const resolveDynamicContent = (text: string, context: EvaluationContext = {}): string => {
  if (!text || typeof text !== 'string') return text;
  if (!text.includes('{{') || !text.includes('}}')) return text;

  const tokens = tokenizeExpression(text);
  if (tokens.length === 0) return text;

  let resolvedText = text;
  for (const token of tokens) {
    const value = evaluateToken(token, context);
    // Replace all occurrences of this raw token
    resolvedText = resolvedText.replaceAll(token.raw, value);
  }

  return resolvedText;
};
