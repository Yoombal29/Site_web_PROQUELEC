import * as Y from 'yjs';
import type { Block } from '@/types/builder';
import type { ConnectionStatus } from './types';
import { YJS_PATHS } from './types';

type BlockObserver = (blocks: Block[], origin: unknown) => void;
type MetadataObserver = (metadata: Record<string, unknown>, origin: unknown) => void;

/**
 * YjsDocManager — wraps Y.Doc with the builder's block tree structure.
 *
 * Manages two shared types:
 *   - Y.Array<Y.Map> named 'blocks' — the ordered block tree
 *   - Y.Map named 'metadata' — page-level metadata
 *
 * All mutations go through Yjs transactions so they sync to peers.
 */
export class YjsDocManager {
  readonly doc: Y.Doc;
  private _blocks: Y.Array<Y.Map<unknown>>;
  private _metadata: Y.Map<unknown>;
  private blockObservers: BlockObserver[] = [];
  private metadataObservers: MetadataObserver[] = [];
  private _status: ConnectionStatus = 'disconnected';
  private pendingBlockUpdates = false;

  constructor(doc?: Y.Doc) {
    this.doc = doc ?? new Y.Doc();
    this._blocks = this.doc.getArray<Y.Map<unknown>>(YJS_PATHS.BLOCKS);
    this._metadata = this.doc.getMap(YJS_PATHS.METADATA);
    this.observeChanges();
  }

  /** The Y.Array holding the block tree */
  get blocks(): Y.Array<Y.Map<unknown>> {
    return this._blocks;
  }

  /** The Y.Map holding page metadata */
  get metadata(): Y.Map<unknown> {
    return this._metadata;
  }

  /** Current connection status */
  get status(): ConnectionStatus {
    return this._status;
  }

  set status(s: ConnectionStatus) {
    this._status = s;
  }

  /** Serialise current blocks from Y.Array to plain Block[] */
  getBlocks(): Block[] {
    return this._blocks.toArray().map((map) => this.yMapToBlock(map));
  }

  /** Serialise current metadata from Y.Map to plain object */
  getMetadata(): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    this._metadata.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }

  /** Replace all blocks atomically (used on initial load / full sync) */
  setBlocks(blocks: Block[], origin: unknown = null): void {
    this.doc.transact(() => {
      this._blocks.delete(0, this._blocks.length);
      for (const block of blocks) {
        this._blocks.push([this.blockToYMap(block)]);
      }
    }, origin);
  }

  /** Update metadata atomically */
  setMetadata(metadata: Record<string, unknown>, origin: unknown = null): void {
    this.doc.transact(() => {
      for (const [key, value] of Object.entries(metadata)) {
        this._metadata.set(key, value);
      }
    }, origin);
  }

  /** Subscribe to block changes */
  onBlocksChanged(cb: BlockObserver): () => void {
    this.blockObservers.push(cb);
    return () => {
      this.blockObservers = this.blockObservers.filter((o) => o !== cb);
    };
  }

  /** Subscribe to metadata changes */
  onMetadataChanged(cb: MetadataObserver): () => void {
    this.metadataObservers.push(cb);
    return () => {
      this.metadataObservers = this.metadataObservers.filter((o) => o !== cb);
    };
  }

  /** Encode full state for sync */
  encodeState(): Uint8Array {
    return Y.encodeStateAsUpdate(this.doc);
  }

  /** Apply remote update */
  applyUpdate(update: Uint8Array, origin: unknown = 'remote'): void {
    Y.applyUpdate(this.doc, update, origin);
  }

  /** Encode state vector (for incremental sync) */
  encodeStateVector(): Uint8Array {
    return Y.encodeStateVector(this.doc);
  }

  /** Compute incremental update since state vector */
  computeIncrementalUpdate(remoteStateVector: Uint8Array): Uint8Array {
    return Y.encodeStateAsUpdate(this.doc, remoteStateVector);
  }

  /** Destroy the document and clean up */
  destroy(): void {
    this.blockObservers = [];
    this.metadataObservers = [];
    this.doc.destroy();
  }

  /** Start observing Yjs changes and forwarding to subscribers */
  private observeChanges(): void {
    this._blocks.observeDeep((events) => {
      // Check if any event targets the blocks array
      for (const event of events) {
        if (event.target === this._blocks) {
          this.notifyBlockObservers(event.transaction.origin);
          break;
        }
      }
    });

    this._metadata.observe((event) => {
      const changes: Record<string, unknown> = {};
      event.keysChanged.forEach((key) => {
        changes[key] = this._metadata.get(key);
      });
      for (const cb of this.metadataObservers) {
        cb(changes, event.transaction.origin);
      }
    });
  }

  private notifyBlockObservers(origin: unknown): void {
    const blocks = this.getBlocks();
    for (const cb of this.blockObservers) {
      cb(blocks, origin);
    }
  }

  /** Convert a Y.Map to a Block */
  private yMapToBlock(map: Y.Map<unknown>): Block {
    const block: Block = {
      id: map.get('id') as string,
      type: map.get('type') as string,
      content: (map.get('content') as Record<string, unknown>) ?? {},
      style: map.get('style') as Block['style'],
      children: this.yArrayToBlocks(map.get('children') as Y.Array<Y.Map<unknown>> | undefined),
    };
    return block;
  }

  /** Convert a Y.Array of Y.Maps to Block[] */
  private yArrayToBlocks(arr: Y.Array<Y.Map<unknown>> | undefined): Block[] | undefined {
    if (!arr) return undefined;
    return arr.toArray().map((map) => this.yMapToBlock(map));
  }

  /** Convert a Block to a Y.Map */
  private blockToYMap(block: Block): Y.Map<unknown> {
    const map = new Y.Map<unknown>();
    map.set('id', block.id);
    map.set('type', block.type);
    map.set('content', block.content ?? {});
    map.set('style', block.style ?? {});
    if (block.children && block.children.length > 0) {
      const childrenArray = new Y.Array<Y.Map<unknown>>();
      const childMaps = block.children.map((child) => this.blockToYMap(child));
      childrenArray.insert(0, childMaps);
      map.set('children', childrenArray);
    }
    return map;
  }
}
