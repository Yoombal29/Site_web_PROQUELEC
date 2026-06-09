export type {
  CollaborationConfig,
  ConnectionStatus,
  RemoteCursor,
  RemoteSelection,
  AwarenessState,
  RemoteBlockMutation,
  CollaborationEventMap,
} from './types';

export {
  DEFAULT_COLLAB_CONFIG,
  YJS_PATHS,
} from './types';

export { YjsDocManager } from './doc';
export { BroadcastChannelProvider, WebSocketProvider } from './provider';
export type { Provider } from './provider';
export { ZustandSync } from './sync';
export { AwarenessManager } from './awareness';
export { useCollaboration, useRemoteCursors } from './react';
export type { CollaborationInstance } from './react';
