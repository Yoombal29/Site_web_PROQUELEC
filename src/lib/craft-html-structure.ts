export function createHtmlCraftStructure(html: string | null | undefined) {
  return {
    ROOT: { type: 'div', nodes: ['html_wrapper'], props: { style: {} }, linkedNodes: {} },
    html_wrapper: {
      type: { resolvedName: 'ContainerBlock' },
      nodes: ['html_block'],
      props: { padding: 48, paddingY: 32, backgroundColor: '#ffffff', maxWidth: '1200px' },
      parent: 'ROOT',
      linkedNodes: {},
      isCanvas: true,
      displayName: 'ContainerBlock',
    },
    html_block: {
      type: { resolvedName: 'HtmlBlock' },
      nodes: [],
      props: {
        html: html || '<p>Contenu en cours de création...</p>',
        padding: 0,
        hideLabel: true,
      },
      parent: 'html_wrapper',
      linkedNodes: {},
      isCanvas: false,
      displayName: 'HtmlBlock',
    },
  };
}
