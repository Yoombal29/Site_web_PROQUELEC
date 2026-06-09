import React from 'react';
import type { AwarenessState } from '@/engine/collaboration';
import { Users } from 'lucide-react';

interface PeerListProps {
  peers: AwarenessState[];
}

/**
 * PeerList — shows online collaborators as colored avatars.
 */
export const PeerList: React.FC<PeerListProps> = ({ peers }) => {
  if (peers.length <= 1) return null;

  return (
    <div className="flex items-center gap-1.5" title="Collaborateurs en ligne">
      <Users className="w-3 h-3 text-slate-400" />
      <div className="flex -space-x-1.5">
        {peers.map((peer) => (
          <div
            key={peer.userId}
            className="relative group"
          >
            <div
              className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: peer.color }}
              title={peer.userName}
            >
              {peer.userName.charAt(0).toUpperCase()}
            </div>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-50">
              <div className="bg-slate-800 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
                {peer.userName}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
