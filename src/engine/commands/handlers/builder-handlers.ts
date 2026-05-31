import { v4 as uuidv4 } from 'uuid';
import type { Block, BlockStyle, BlockContent } from '@/types/builder';
import type { CommandHandler, CreateNodeCommand, UpdateNodeCommand, DeleteNodeCommand, MoveNodeCommand, SelectNodeCommand, ImportNodeCommand, SetPageMetadataCommand } from '../types';
import { useBuilderStore } from '@/stores/useBuilderStore';
import { eventBus } from '@/engine/events/bus';
import cloneDeep from 'lodash.clonedeep';
import { produce } from 'immer';

// ── Helpers reused from useBuilderStore ──────────────────────

const updateBlockRecursive = (
  blocks: Block[],
  id: string,
  updater: (b: Block) => Block,
): Block[] => {
  return blocks.map((b) => {
    if (b.id === id) return updater(b);
    if (b.children && b.children.length > 0) {
      return { ...b, children: updateBlockRecursive(b.children, id, updater) };
    }
    return b;
  });
};

const removeBlockRecursive = (blocks: Block[], id: string): Block[] => {
  return blocks.filter((b) => b.id !== id).map((b) => ({
    ...b,
    children: b.children ? removeBlockRecursive(b.children, id) : undefined,
  }));
};

const findBlockParent = (
  blocks: Block[],
  id: string,
  parent?: Block,
): { block: Block; parent: Block | undefined; index: number } | null => {
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].id === id) {
      return { block: blocks[i], parent, index: i };
    }
    if (blocks[i].children) {
      const found = findBlockParent(blocks[i].children!, id, blocks[i]);
      if (found) return found;
    }
  }
  return null;
};

// ── Snapshot helper ──────────────────────────────────────────

const saveHistorySnapshot = () => {
  const store = useBuilderStore.getState();
  // The store's own saveHistory is internal; we trigger snapshotHistory
  store.snapshotHistory();
};

// ── Handlers ─────────────────────────────────────────────────

export const createNodeHandler: CommandHandler<CreateNodeCommand> = {
  type: 'CREATE_NODE',
  execute: (command) => {
    const { blockType, parentId, index, content, style } = command.payload;
    const store = useBuilderStore.getState();

    // Store handles history internally via saveHistory
    store.addBlock(blockType, parentId, index);

    // If we have extra content/style, apply them
    const newState = useBuilderStore.getState();
    const lastBlock = parentId
      ? newState.blocks.flatMap((b) => b.children || []).slice(-1)[0]
      : newState.blocks[newState.blocks.length - 1];

    if (lastBlock && (content || style)) {
      if (content) store.updateBlockContent(lastBlock.id, content);
      if (style) store.updateBlockStyle(lastBlock.id, style);
    }

    // Emit event AFTER store update
    const finalState = useBuilderStore.getState();
    const createdBlock = parentId
      ? finalState.blocks.flatMap((b) => b.children || []).find((b) => b.id === lastBlock?.id)
      : finalState.blocks[finalState.blocks.length - 1];

    if (createdBlock) {
      eventBus.emit('block:created', {
        block: createdBlock,
        parentId,
        index,
      });
    }
  },
  undo: (command) => {
    const { blockType, parentId } = command.payload;
    const store = useBuilderStore.getState();
    const blocks = store.blocks;

    // Find the last block of this type that was added
    const targetBlocks = parentId
      ? blocks.flatMap((b) => b.children || [])
      : blocks;
    const target = [...targetBlocks].reverse().find((b) => b.type === blockType);
    if (target) {
      store.removeBlock(target.id);
      eventBus.emit('block:deleted', {
        id: target.id,
        block: target,
        parentId,
      });
    }
  },
};

export const updateNodeHandler: CommandHandler<UpdateNodeCommand> = {
  type: 'UPDATE_NODE',
  execute: (command) => {
    const { id, path, value } = command.payload;
    const store = useBuilderStore.getState();

    // Get previous value for event
    const block = findBlockRecursive(store.blocks, id);
    const previous = block
      ? path === 'style'
        ? { ...(block.style || {}) }
        : { ...(block.content || {}) }
      : {};

    if (path === 'style') {
      store.updateBlockStyle(id, value as Partial<BlockStyle>);
    } else {
      store.updateBlockContent(id, value as Partial<BlockContent>);
    }

    eventBus.emit('block:updated', {
      id,
      path,
      previous,
      next: value as Partial<BlockStyle> | Partial<BlockContent>,
    });
  },
  undo: (command) => {
    // Re-execute with previous value — but we don't store "previous" in command payload
    // For now, rely on Zustand history snapshot for undo
    console.warn('[CommandBus] UPDATE_NODE undo: relies on store snapshot');
  },
};

export const deleteNodeHandler: CommandHandler<DeleteNodeCommand> = {
  type: 'DELETE_NODE',
  execute: (command) => {
    const { id } = command.payload;
    const store = useBuilderStore.getState();
    const found = findBlockParent(store.blocks, id);

    store.removeBlock(id);

    eventBus.emit('block:deleted', {
      id,
      block: found?.block || { id, type: 'unknown', content: {} },
      parentId: found?.parent?.id,
      index: found?.index,
    });
  },
  undo: (command) => {
    // Relies on store snapshot because we don't store deleted block data
    console.warn('[CommandBus] DELETE_NODE undo: relies on store snapshot');
  },
};

export const moveNodeHandler: CommandHandler<MoveNodeCommand> = {
  type: 'MOVE_NODE',
  execute: (command) => {
    const { activeId, overId } = command.payload;
    const store = useBuilderStore.getState();
    const oldIndex = store.blocks.findIndex((b) => b.id === activeId);
    const newIndex = store.blocks.findIndex((b) => b.id === overId);

    store.moveBlock(activeId, overId);

    eventBus.emit('block:moved', {
      activeId,
      overId,
      previousIndex: oldIndex,
      newIndex,
    });
  },
};

export const selectNodeHandler: CommandHandler<SelectNodeCommand> = {
  type: 'SELECT_NODE',
  execute: (command) => {
    const { id } = command.payload;
    const store = useBuilderStore.getState();
    const previousId = store.selectedBlockId;

    store.selectBlock(id);

    eventBus.emit('block:selected', { id, previousId });
  },
};

export const importNodeHandler: CommandHandler<ImportNodeCommand> = {
  type: 'IMPORT_NODE',
  execute: (command) => {
    const { block, parentId, index } = command.payload;
    const store = useBuilderStore.getState();

    store.importBlock(block, parentId, index);

    eventBus.emit('block:imported', { block, parentId, index });
  },
};

export const setPageMetadataHandler: CommandHandler<SetPageMetadataCommand> = {
  type: 'SET_PAGE_METADATA',
  execute: (command) => {
    const { metadata } = command.payload;
    const store = useBuilderStore.getState();
    const previous = { ...store.pageMetadata };

    store.setPageMetadata(metadata);

    eventBus.emit('page:metadata:updated', { previous, next: metadata });
  },
};

// ── Helper ─────────────────────────────────────────────────

function findBlockRecursive(
  blocks: Block[],
  id: string,
): Block | undefined {
  for (const b of blocks) {
    if (b.id === id) return b;
    if (b.children) {
      const found = findBlockRecursive(b.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

// ── Register all ─────────────────────────────────────────────

import { CommandRegistry } from '../registry';

export function registerBuilderCommands(registry: CommandRegistry): void {
  registry.register(createNodeHandler);
  registry.register(updateNodeHandler);
  registry.register(deleteNodeHandler);
  registry.register(moveNodeHandler);
  registry.register(selectNodeHandler);
  registry.register(importNodeHandler);
  registry.register(setPageMetadataHandler);
}
