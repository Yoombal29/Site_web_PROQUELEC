import React from 'react';
import type { AwarenessState } from '@/engine/collaboration';

interface RemoteCursorsProps {
  peers: AwarenessState[];
  /** CSS transform string for the canvas container (accounts for zoom/pan) */
  containerTransform?: string;
}

/**
 * RemoteCursors — overlays cursor positions for all connected peers.
 * Positioned absolutely over the canvas.
 */
export const RemoteCursors: React.FC<RemoteCursorsProps> = ({
  peers,
  containerTransform,
}) => {
  const cursors = peers.filter((p) => p.cursor !== null && p.cursor !== undefined);

  if (cursors.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        ...(containerTransform ? { transform: containerTransform } : {}),
      }}
    >
      {cursors.map((peer) => (
        <div
          key={peer.userId}
          className="remote-cursor"
          style={{
            position: 'absolute',
            left: peer.cursor!.x,
            top: peer.cursor!.y,
            transform: 'translate(-4px, -4px)',
          }}
        >
          {/* Cursor arrow */}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M2 2L5.5 14L7.5 10L13 13L11 7L14 5.5L2 2Z"
              fill={peer.color}
              stroke="white"
              strokeWidth="1"
            />
          </svg>

          {/* Name label */}
          <span
            style={{
              position: 'absolute',
              left: 12,
              top: 0,
              backgroundColor: peer.color,
              color: '#fff',
              fontSize: 10,
              fontWeight: 600,
              padding: '1px 5px',
              borderRadius: 3,
              whiteSpace: 'nowrap',
              lineHeight: '16px',
            }}
          >
            {peer.userName}
          </span>
        </div>
      ))}
    </div>
  );
};
