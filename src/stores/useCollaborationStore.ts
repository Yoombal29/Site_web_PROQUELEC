import { create } from 'zustand';
import type { AwarenessState, ConnectionStatus } from '@/engine/collaboration';

/** Minimal store shared between CollaborationBar and InfiniteCanvas */
interface CollaborationStoreState {
  peers: AwarenessState[];
  status: ConnectionStatus;
  setPeers: (peers: AwarenessState[]) => void;
  setStatus: (status: ConnectionStatus) => void;
}

export const useCollaborationStore = create<CollaborationStoreState>((set) => ({
  peers: [],
  status: 'disconnected',
  setPeers: (peers) => set({ peers }),
  setStatus: (status) => set({ status }),
}));
