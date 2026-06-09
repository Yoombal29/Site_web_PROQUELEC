import * as Y from 'yjs';
import type { Block } from '@/types/builder';
import type { ConnectionStatus } from './types';
import { YjsDocManager } from './doc';
import type { Provider } from './provider';

/**
 * ZustandSync — bidirectional sync bridge between Yjs and Zustand stores.
 *
 * Flow:
 *   User action → Zustand set() → this.pushToYjs() → Yjs transact → sync to peers
 *   Remote update → Yjs event → this.pullFromYjs() → Zustand set()
 */
export class ZustandSync {
  private doc: YjsDocManager;
  private provider: Provider;
  private _onRemoteUpdate: ((blocks: Block[]) => void) | null = null;
  private _onStatusChange: ((status: ConnectionStatus) => void) | null = null;
  private _onError: ((error: Error) => void) | null = null;
  private pushingToYjs = false;

  constructor(doc: YjsDocManager, provider: Provider) {
    this.doc = doc;
    this.provider = provider;
    this.setupProvider();
    this.setupDoc();
  }

  /** Register callback for remote block updates (→ Zustand setState) */
  onRemoteUpdate(cb: (blocks: Block[]) => void): void {
    this._onRemoteUpdate = cb;
  }

  /** Register callback for connection status changes */
  onConnectionStatus(cb: (status: ConnectionStatus) => void): void {
    this._onStatusChange = cb;
  }

  /** Register callback for errors */
  onError(cb: (error: Error) => void): void {
    this._onError = cb;
  }

  /** Push local block changes to Yjs (called after Zustand mutation) */
  pushBlocks(blocks: Block[], origin: unknown = 'local'): void {
    this.pushingToYjs = true;
    try {
      this.doc.setBlocks(blocks, origin);
    } finally {
      this.pushingToYjs = false;
    }
  }

  /** Push metadata changes to Yjs */
  pushMetadata(metadata: Record<string, unknown>, origin: unknown = 'local'): void {
    this.doc.setMetadata(metadata, origin);
  }

  /** Connect to sync backend */
  connect(): void {
    this.provider.connect();
    this.performInitialSync();
  }

  /** Disconnect */
  disconnect(): void {
    this.provider.disconnect();
  }

  /** Destroy and clean up */
  destroy(): void {
    this.provider.destroy();
    this._onRemoteUpdate = null;
    this._onStatusChange = null;
    this._onError = null;
  }

  /** Send current state to all peers (full sync) */
  broadcastFullState(): void {
    const update = this.doc.encodeState();
    this.provider.send(update);
  }

  private setupProvider(): void {
    this.provider.onReceive((data: Uint8Array) => {
      try {
        this.doc.applyUpdate(data, 'remote');
      } catch (err) {
        this._onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    });

    this.provider.onStatusChange((status) => {
      this.doc.status = status;
      this._onStatusChange?.(status);
    });
  }

  private setupDoc(): void {
    this.doc.onBlocksChanged((blocks, origin) => {
      // Ignore changes we pushed ourselves
      if (origin === 'local' || this.pushingToYjs) return;
      this._onRemoteUpdate?.(blocks);
    });
  }

  private performInitialSync(): void {
    try {
      // Send our full state to any peer that just joined
      const sv = this.doc.encodeStateVector();
      this.provider.sendSyncStep1(sv);
      // Broadcast our full state
      this.broadcastFullState();
    } catch (err) {
      this._onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  }
}
