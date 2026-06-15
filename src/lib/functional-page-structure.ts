export type FunctionalPageStructure = Record<string, unknown>;

export type FunctionalPageRecordLike = {
  title?: string;
  slug?: string;
  immutable?: boolean;
  design_options?: { page_type?: string } | Record<string, unknown> | null;
  structure_json?: unknown;
  draft_json?: unknown;
};

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

export function parseJsonField(value: unknown) {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

import { isFunctionalPageSlug } from './functional-pages';

export function isDesignLockedFunctionalPage(page: FunctionalPageRecordLike | null | undefined) {
  if (!page || page.immutable !== true) return false;
  const slug = page.slug ? page.slug.replace(/^\//, '') : '';
  if (!isFunctionalPageSlug(slug)) return false;
  return (page.design_options as any)?.page_type !== 'hybrid';
}

export function getFunctionalStructureForPage(
  page: FunctionalPageRecordLike,
  fallbackSlug: string,
  fallbackTitle = 'Page fonctionnelle',
) {
  const rawStructure = parseJsonField(page.structure_json);

  if (isFunctionalPageStructure(rawStructure)) {
    return {
      structure: rawStructure as FunctionalPageStructure,
      healed: false,
    };
  }

  return {
    structure: createFunctionalPageStructure(
      page.slug || fallbackSlug,
      page.title || fallbackTitle,
    ),
    healed: true,
  };
}
