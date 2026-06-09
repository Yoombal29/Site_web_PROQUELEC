import React, { useState, useCallback, useEffect } from 'react';
import { useCollaboration } from '@/engine/collaboration';
import type { Block } from '@/types/builder';
import { ConnectionStatusBadge } from './ConnectionStatusBadge';
import { PeerList } from './PeerList';
import { useCollaborationStore } from '@/stores/useCollaborationStore';

interface CollaborationBarProps {
  pageId: string;
  userName: string;
  userId: string;
  blocks: Block[];
  onRemoteBlocksUpdate?: (blocks: Block[]) => void;
}

/**
 * CollaborationBar — activates collaboration for a page, shows connection status
 * and peer list. Writes peers/status to useCollaborationStore for InfiniteCanvas.
 */
export const CollaborationBar: React.FC<CollaborationBarProps> = ({
  pageId,
  userName,
  userId,
  blocks,
  onRemoteBlocksUpdate,
}) => {
  const [enabled, setEnabled] = useState(false);
  const setStorePeers = useCollaborationStore((s) => s.setPeers);
  const setStoreStatus = useCollaborationStore((s) => s.setStatus);

  const collab = useCollaboration({
    roomName: `proquelec-builder-${pageId}`,
    userName,
    userId,
    autoConnect: enabled,
  });

  // Sync peers/status to shared store for InfiniteCanvas
  useEffect(() => {
    setStorePeers(collab.peers);
  }, [collab.peers, setStorePeers]);

  useEffect(() => {
    setStoreStatus(collab.status);
  }, [collab.status, setStoreStatus]);

  // Forward remote block updates
  useEffect(() => {
    if (enabled) {
      collab.onRemoteBlocks((remoteBlocks) => {
        onRemoteBlocksUpdate?.(remoteBlocks);
      });
    }
  }, [enabled, collab, onRemoteBlocksUpdate]);

  // Push local blocks when they change
  useEffect(() => {
    if (enabled && blocks.length > 0) {
      collab.pushBlocks(blocks);
    }
  }, [enabled, blocks, collab]);

  const toggleCollaboration = useCallback(() => {
    setEnabled((prev) => {
      if (prev) {
        collab.disconnect();
      }
      return !prev;
    });
  }, [collab]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleCollaboration}
        className={`text-[11px] font-medium px-2 py-0.5 rounded-full border transition-colors ${
          enabled
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
        }`}
        title={enabled ? 'Désactiver la collaboration' : 'Activer la collaboration en temps réel'}
      >
        {enabled ? '⚡ Collaboration active' : '🤝 Collaborer'}
      </button>

      {enabled && (
        <>
          <ConnectionStatusBadge
            status={collab.status}
            onlineCount={collab.onlineCount}
            onDisconnect={() => {
              setEnabled(false);
              collab.disconnect();
            }}
          />
          <PeerList peers={collab.peers} />
        </>
      )}
    </div>
  );
};
