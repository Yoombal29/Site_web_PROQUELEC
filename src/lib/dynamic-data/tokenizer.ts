export interface DynamicToken {
  raw: string;
  namespace: string;
  key: string;
}

/**
 * Tokenizer étendu pour extraire et valider les expressions {{ namespace.key[.subkey]* }}
 * Supporte les chemins multi-niveaux: {{ ds.products.0.title }}, {{ query.page }}
 */
export const tokenizeExpression = (text: string): DynamicToken[] => {
  if (!text || typeof text !== 'string') return [];

  const tokens: DynamicToken[] = [];
  let startIndex = 0;

  while (true) {
    const openIndex = text.indexOf('{{', startIndex);
    if (openIndex === -1) break;

    const closeIndex = text.indexOf('}}', openIndex + 2);
    if (closeIndex === -1) break;

    const raw = text.substring(openIndex, closeIndex + 2);
    const content = text.substring(openIndex + 2, closeIndex).trim();

    const parts = content.split('.');
    const isSafe = (str: string) => /^[a-zA-Z0-9_*]+$/.test(str);

    // Support multi-level paths (>=2), e.g. ds.products.0.title
    if (parts.length >= 2 && parts.every(isSafe)) {
      tokens.push({
        raw,
        namespace: parts[0],
        key: parts.slice(1).join('.')
      });
    }

    startIndex = closeIndex + 2;
  }

  return tokens;
};
