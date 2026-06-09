import type { Node, NodeTree } from '@craftjs/core';

const newNodeId = (prefix = 'node') =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

/**
 * Clone a Craft.js NodeTree with fresh IDs for every node, including
 * child lists (data.nodes) and linked nodes (data.linkedNodes).
 * Required before addNodeTree — Craft.js does not regenerate IDs automatically.
 */
export function cloneNodeTreeWithNewIds(
  tree: NodeTree,
  idPrefix = 'dup'
): NodeTree {
  const newNodes: NodeTree['nodes'] = {};

  const changeNodeId = (node: Node, newParentId?: string): string => {
    const newId = newNodeId(idPrefix);

    const childNodes = (node.data.nodes ?? []).map((childId) =>
      changeNodeId(tree.nodes[childId], newId)
    );

    const linkedNodes = Object.entries(node.data.linkedNodes ?? {}).reduce(
      (acc, [key, linkedId]) => {
        acc[key] = changeNodeId(tree.nodes[linkedId], newId);
        return acc;
      },
      {} as Record<string, string>
    );

    const childCanvas = node.data._childCanvas
      ? Object.entries(node.data._childCanvas).reduce(
          (acc, [key, canvasId]) => {
            if (tree.nodes[canvasId]) {
              acc[key] = changeNodeId(tree.nodes[canvasId], newId);
            }
            return acc;
          },
          {} as Record<string, string>
        )
      : undefined;

    newNodes[newId] = {
      ...node,
      id: newId,
      dom: null,
      events: { selected: false, dragged: false, hovered: false },
      data: {
        ...node.data,
        props: node.data.props
          ? JSON.parse(JSON.stringify(node.data.props))
          : {},
        parent: newParentId ?? node.data.parent,
        nodes: childNodes,
        linkedNodes,
        ...(childCanvas ? { _childCanvas: childCanvas } : {}),
      },
    };

    return newId;
  };

  const rootNodeId = changeNodeId(tree.nodes[tree.rootNodeId]);
  return { rootNodeId, nodes: newNodes };
}
