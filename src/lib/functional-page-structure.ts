export type FunctionalPageStructure = Record<string, unknown>;

export function createFunctionalPageStructure(
  slug: string,
  pageTitle = 'Page fonctionnelle',
): FunctionalPageStructure {
  return {
    ROOT: {
      type: 'div',
      nodes: ['func_page_block'],
      props: { style: {} },
      linkedNodes: {},
    },
    func_page_block: {
      type: { resolvedName: 'FunctionalPageBlock' },
      nodes: [],
      props: {
        slug,
        pageTitle,
      },
      parent: 'ROOT',
      linkedNodes: {},
      isCanvas: false,
      displayName: 'FunctionalPageBlock',
    },
  };
}

export function isFunctionalPageStructure(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  return Object.values(value as Record<string, any>).some((node) => {
    if (!node || typeof node !== 'object') return false;
    const type = node.type;
    return (
      type === 'FunctionalPageBlock' ||
      type?.resolvedName === 'FunctionalPageBlock' ||
      node.displayName === 'FunctionalPageBlock'
    );
  });
}
