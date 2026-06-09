import { useState, useEffect, useCallback, useRef } from 'react';
import * as Y from 'yjs';
import type { Block } from '@/types/builder';
import type { ConnectionStatus, CollaborationConfig, AwarenessState, RemoteCursor, RemoteSelection } from './types';
import { DEFAULT_COLLAB_CONFIG } from './types';
import { YjsDocManager } from './doc';
import { BroadcastChannelProvider, WebSocketProvider } from './provider';
import type { Provider } from './provider';
import { ZustandSync } from './sync';
import { AwarenessManager } from './awareness';

export interface CollaborationInstance {
  /** Current connection status */
  status: ConnectionStatus;
  /** Online collaborators */
  peers: AwarenessState[];
  /** Number of online users */
  onlineCount: number;
  /** Update local cursor position */
  updateCursor: (x: number, y: number) => void;
  /** Update local block selection */
  updateSelection: (blockId: string | null) => void;
  /** Push local blocks to peers */
  pushBlocks: (blocks: Block[]) => void;
  /** Handle remote block updates */
  onRemoteBlocks: (cb: (blocks: Block[]) => void) => void;
  /** Connect/reconnect */
  connect: () => void;
  /** Disconnect */
  disconnect: () => void;
  /** The underlying sync bridge (for advanced use) */
  sync: ZustandSync;
}

/**
 * useCollaboration — main hook for real-time collaboration.
 *
 * @param getBlocks — function that returns current blocks from Zustand
 * @param config — collaboration configuration
 */
export function useCollaboration(
  config: Partial<CollaborationConfig>,
): CollaborationInstance {
  const cfg: CollaborationConfig = { ...DEFAULT_COLLAB_CONFIG, ...config };
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [peers, setPeers] = useState<AwarenessState[]>([]);
  const remoteBlocksRef = useRef<((blocks: Block[]) => void) | null>(null);

  // Persistent refs to avoid recreating instances
  const instancesRef = useRef<{
    doc: YjsDocManager;
    provider: Provider;
    sync: ZustandSync;
    awareness: AwarenessManager;
  } | null>(null);

  useEffect(() => {
    const doc = new YjsDocManager();
    const provider = cfg.wsUrl
      ? new WebSocketProvider(cfg.wsUrl, cfg.roomName, cfg.userId || crypto.randomUUID())
      : new BroadcastChannelProvider(cfg.roomName, cfg.userId || crypto.randomUUID());

    const sync = new ZustandSync(doc, provider);
    const awareness = new AwarenessManager(cfg.userId || crypto.randomUUID(), cfg.userName);

    instancesRef.current = { doc, provider, sync, awareness };

    sync.onConnectionStatus((s) => setStatus(s));
    sync.onRemoteUpdate((blocks) => {
      remoteBlocksRef.current?.(blocks);
    });

    sync.onError((err) => {
      console.error('[Collaboration] Sync error:', err);
    });

    const stopCleanup = awareness.startCleanup();
    const unsubAwareness = awareness.onChange((p) => setPeers(p));

    if (cfg.autoConnect) {
      sync.connect();
    }

    return () => {
      stopCleanup();
      unsubAwareness();
      sync.destroy();
      provider.destroy();
    };
  }, [cfg.roomName, cfg.wsUrl, cfg.userId, cfg.userName, cfg.autoConnect]);

  const updateCursor = useCallback((x: number, y: number) => {
    const inst = instancesRef.current;
    if (!inst) return;
    inst.awareness.setLocalCursor({
      userId: cfg.userId,
      userName: cfg.userName,
      color: inst.awareness['_localUserId'] === cfg.userId ? '#6366f1' : '#14b8a6',
      x,
      y,
      lastSeen: Date.now(),
    });
  }, [cfg.userId, cfg.userName]);

  const updateSelection = useCallback((blockId: string | null) => {
    instancesRef.current?.awareness.setLocalSelection({
      userId: cfg.userId,
      blockId,
    });
  }, [cfg.userId]);

  const pushBlocks = useCallback((blocks: Block[]) => {
    instancesRef.current?.sync.pushBlocks(blocks);
  }, []);

  const onRemoteBlocks = useCallback((cb: (blocks: Block[]) => void) => {
    remoteBlocksRef.current = cb;
  }, []);

  const connect = useCallback(() => {
    instancesRef.current?.sync.connect();
  }, []);

  const disconnect = useCallback(() => {
    instancesRef.current?.sync.disconnect();
  }, []);

  return {
    status,
    peers,
    onlineCount: peers.length,
    updateCursor,
    updateSelection,
    pushBlocks,
    onRemoteBlocks,
    connect,
    disconnect,
    sync: instancesRef.current?.sync ?? (null as unknown as ZustandSync),
  };
}

/**
 * useRemoteCursors — get remote cursor positions for rendering overlays.
 */
export function useRemoteCursors(peers: AwarenessState[]): RemoteCursor[] {
  return peers
    .filter((p) => p.cursor !== null)
    .map((p) => p.cursor!);
}
