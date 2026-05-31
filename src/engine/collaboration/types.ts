import type { Block } from '@/types/builder';

/** Provider connection states */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

/** A remote collaborator's cursor position */
export interface RemoteCursor {
  userId: string;
  userName: string;
  color: string;
  x: number;
  y: number;
  lastSeen: number;
}

/** A remote collaborator's block selection */
export interface RemoteSelection {
  userId: string;
  blockId: string | null;
}

/** Full awareness state for a collaborator */
export interface AwarenessState {
  userId: string;
  userName: string;
  color: string;
  cursor: RemoteCursor | null;
  selection: RemoteSelection | null;
  isOnline: boolean;
  lastSeen: number;
}

/** Configuration for the collaboration engine */
export interface CollaborationConfig {
  /** Unique room/document name */
  roomName: string;
  /** Local user display name */
  userName: string;
  /** Local user ID */
  userId: string;
  /** WebSocket URL (optional, uses BroadcastChannel if empty) */
  wsUrl?: string;
  /** Whether to persist to IndexedDB */
  persist?: boolean;
  /** Auto-connect on init */
  autoConnect?: boolean;
}

export const DEFAULT_COLLAB_CONFIG: CollaborationConfig = {
  roomName: 'builder-default',
  userName: 'Anonymous',
  userId: '',
  autoConnect: true,
};

/** Payload emitted when a remote block mutation arrives */
export interface RemoteBlockMutation {
  type: 'added' | 'updated' | 'removed' | 'moved';
  blockId: string;
  block?: Block;
  origin: string;
}

/** Events emitted by the collaboration engine */
export interface CollaborationEventMap {
  'connection:status': ConnectionStatus;
  'awareness:changed': AwarenessState[];
  'remote:mutation': RemoteBlockMutation;
  'sync:started': void;
  'sync:completed': void;
  'error': Error;
}

/** Yjs shared type path constants */
export const YJS_PATHS = {
  BLOCKS: 'blocks',
  METADATA: 'metadata',
  AWARENESS: 'awareness',
} as const;
