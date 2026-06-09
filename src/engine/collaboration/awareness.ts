import type { AwarenessState, RemoteCursor, RemoteSelection } from './types';

const COLLABORATOR_COLORS = [
  '#6366f1', '#ec4899', '#14b8a6', '#f59e0b',
  '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16',
  '#d946ef', '#f97316', '#0ea5e9', '#22c55e',
];

/**
 * AwarenessManager — tracks online collaborators, their cursors, and selections.
 *
 * Uses a simple in-memory map. In production with WebSocket, you'd use
 * Yjs awareness protocol (y-protocols/awareness) for proper multi-tab support.
 * For BroadcastChannel, this works cross-tab via the sync bridge indirectly.
 */
export class AwarenessManager {
  private peers = new Map<string, AwarenessState>();
  private listeners: Array<(peers: AwarenessState[]) => void> = [];
  private _localUserId: string;
  private _localName: string;
  private _colorIndex = 0;

  constructor(userId: string, userName: string) {
    this._localUserId = userId;
    this._localName = userName;
    this.addLocalPeer();
  }

  private nextColor(): string {
    return COLLABORATOR_COLORS[this._colorIndex++ % COLLABORATOR_COLORS.length];
  }

  private addLocalPeer(): void {
    this.peers.set(this._localUserId, {
      userId: this._localUserId,
      userName: this._localName,
      color: this.nextColor(),
      cursor: null,
      selection: null,
      isOnline: true,
      lastSeen: Date.now(),
    });
  }

  /** Update local cursor position */
  setLocalCursor(cursor: RemoteCursor): void {
    const local = this.peers.get(this._localUserId);
    if (local) {
      local.cursor = cursor;
      local.lastSeen = Date.now();
      this.notify();
    }
  }

  /** Update local block selection */
  setLocalSelection(selection: RemoteSelection): void {
    const local = this.peers.get(this._localUserId);
    if (local) {
      local.selection = selection;
      local.lastSeen = Date.now();
      this.notify();
    }
  }

  /** Register or update a remote peer */
  upsertPeer(state: AwarenessState): void {
    this.peers.set(state.userId, { ...state, isOnline: true, lastSeen: state.lastSeen ?? Date.now() });
    this.notify();
  }

  /** Mark a peer as offline */
  removePeer(userId: string): void {
    const peer = this.peers.get(userId);
    if (peer) {
      peer.isOnline = false;
      this.notify();
    }
  }

  /** Get all current peers (including local) */
  getPeers(): AwarenessState[] {
    return Array.from(this.peers.values()).filter((p) => p.isOnline);
  }

  /** Get online count */
  get onlineCount(): number {
    return this.getPeers().length;
  }

  /** Subscribe to awareness changes */
  onChange(cb: (peers: AwarenessState[]) => void): () => void {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  /** Clean up stale peers (no activity for >30s) */
  cleanStalePeers(maxAgeMs: number = 30_000): void {
    const now = Date.now();
    for (const [id, peer] of this.peers) {
      if (id !== this._localUserId && now - peer.lastSeen > maxAgeMs) {
        this.removePeer(id);
      }
    }
  }

  /** Start periodic cleanup interval */
  startCleanup(intervalMs: number = 15_000): () => void {
    const interval = setInterval(() => this.cleanStalePeers(), intervalMs);
    return () => clearInterval(interval);
  }

  private notify(): void {
    const peers = this.getPeers();
    for (const cb of this.listeners) {
      cb(peers);
    }
  }
}
