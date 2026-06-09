/*
 * utilitaire de conversion des structures legacy (array of blocks)
 * vers un graphe minimal compatible avec Craft.js (forme attendue par `actions.deserialize`).
 */
// Petit générateur d'ID local pour éviter d'ajouter la dépendance `uuid`
function generateId() {
  return `node_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

type LegacyBlock = {
  id?: string;
  type: string;
  content?: Record<string, unknown>;
  props?: Record<string, unknown>;
  children?: LegacyBlock[];
};

type CraftNode = {
  type: { resolvedName: string };
  nodes: string[];
  props: Record<string, unknown>;
  custom: Record<string, never>;
  hidden: boolean;
  parent?: string;
  isCanvas: boolean;
  displayName: string;
  linkedNodes: Record<string, never>;
};

const TYPE_MAP: Record<string, string> = {
  'hero': 'HeroBlock',
  'hero-banner': 'HeroBannerBlock',
  'herobanner': 'HeroBannerBlock',
  'hero_banner': 'HeroBannerBlock',
  'audienceoffers': 'AudienceOffersBlock',
  'audience-offers': 'AudienceOffersBlock',
  'visionmission': 'VisionMissionBlock',
  'vision-mission': 'VisionMissionBlock',
  'landingstats': 'LandingStatsBlock',
  'landing-stats': 'LandingStatsBlock',
  'latestnews': 'LatestNewsBlock',
  'latest-news': 'LatestNewsBlock',
  'partnerlogos': 'PartnerLogosBlock',
  'partner-logos': 'PartnerLogosBlock',
  'stats': 'StatsBlock',
  'html': 'HtmlBlock',
  'text': 'TextBlock',
  'text-block': 'TextBlock',
  'columns': 'ColumnsBlock',
  'column': 'ColumnsBlock',
};

function mapTypeToResolvedName(type: string) {
  if (!type) return 'ContainerBlock';
  const key = type.toLowerCase();
  if (TYPE_MAP[key]) return TYPE_MAP[key];
  // fallback: try to PascalCase the type
  const pascal = type
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (m) => m.toUpperCase());
  return pascal + 'Block';
}

export function convertLegacyBlocksToCraftGraph(blocks: LegacyBlock[], pageTitle = 'Page') {
  // craft minimal graph structure used across the app: ROOT + node entries
  const result: Record<string, CraftNode> = {};

  const rootNodes: string[] = [];

  function walk(block: LegacyBlock, parentId: string | null) {
    const id = block.id || generateId();
    const resolvedName = mapTypeToResolvedName(block.type || 'container');

    const childIds: string[] = [];
    if (Array.isArray(block.children)) {
      for (const child of block.children) {
        const childId = walk(child, id);
        childIds.push(childId);
      }
    }

    const props = block.props ?? block.content ?? {};

    result[id] = {
      type: { resolvedName },
      nodes: childIds,
      props,
      custom: {},
      hidden: false,
      parent: parentId || 'ROOT',
      isCanvas: Array.isArray(childIds) && childIds.length > 0,
      displayName: resolvedName,
      linkedNodes: {},
    };

    return id;
  }

  for (const b of blocks) {
    const id = walk(b, null);
    rootNodes.push(id);
  }

  // Root container
  result['ROOT'] = {
    type: { resolvedName: 'ContainerBlock' },
    nodes: rootNodes,
    props: { padding: 0, maxWidth: '100%' },
    custom: {},
    hidden: false,
    isCanvas: true,
    displayName: `Page: ${pageTitle}`,
    linkedNodes: {},
  };

  return result;
}

export default convertLegacyBlocksToCraftGraph;
