import type { ConnectionStatus } from './types';

/**
 * Abstract provider interface for transporting Yjs updates between peers.
 *
 * Implementations:
 *   - BroadcastChannelProvider — same-origin, no server needed
 *   - WebSocketProvider — production, any-origin
 */
export interface Provider {
  /** Unique peer ID for this connection */
  readonly peerId: string;

  /** Current connection status */
  readonly status: ConnectionStatus;

  /** Connect to the sync backend */
  connect(): void;

  /** Disconnect cleanly */
  disconnect(): void;

  /** Send a Yjs state update to peers */
  send(update: Uint8Array): void;

  /** Send a state vector request to peers */
  sendSyncStep1(stateVector: Uint8Array): void;

  /** Handle a sync response (update) from a peer */
  onReceive(cb: (data: Uint8Array) => void): void;

  /** Handle connection status changes */
  onStatusChange(cb: (status: ConnectionStatus) => void): void;

  /** Clean up all listeners */
  destroy(): void;
}

/**
 * BroadcastChannelProvider — uses the BroadcastChannel API for same-origin sync.
 * Zero infrastructure: works across tabs/frames on the same origin.
 */
export class BroadcastChannelProvider implements Provider {
  readonly peerId: string;
  private channel: BroadcastChannel;
  private receiveCbs: Array<(data: Uint8Array) => void> = [];
  private statusCbs: Array<(status: ConnectionStatus) => void> = [];
  private _status: ConnectionStatus = 'disconnected';

  constructor(roomName: string, peerId: string) {
    this.peerId = peerId;
    this.channel = new BroadcastChannel(`yjs-sync:${roomName}`);
  }

  get status(): ConnectionStatus {
    return this._status;
  }

  private setStatus(s: ConnectionStatus): void {
    this._status = s;
    for (const cb of this.statusCbs) {
      cb(s);
    }
  }

  connect(): void {
    this.setStatus('connecting');

    this.channel.onmessage = (event: MessageEvent) => {
      if (event.data?.type === 'yjs-update' && event.data?.peerId !== this.peerId) {
        const buffer = event.data.payload;
        const bytes = new Uint8Array(buffer);
        for (const cb of this.receiveCbs) {
          cb(bytes);
        }
      }
    };

    this.channel.onmessageerror = () => {
      this.setStatus('error');
    };

    this.setStatus('connected');
  }

  disconnect(): void {
    this.channel.close();
    this.setStatus('disconnected');
  }

  send(update: Uint8Array): void {
    this.channel.postMessage({
      type: 'yjs-update',
      peerId: this.peerId,
      payload: update.buffer,
    });
  }

  sendSyncStep1(_stateVector: Uint8Array): void {
    // BroadcastChannel is simple: we just send full updates.
    // For incremental sync, we'd use a more sophisticated protocol.
    // This implementation sends the full update.
  }

  onReceive(cb: (data: Uint8Array) => void): void {
    this.receiveCbs.push(cb);
  }

  onStatusChange(cb: (status: ConnectionStatus) => void): void {
    this.statusCbs.push(cb);
  }

  destroy(): void {
    this.receiveCbs = [];
    this.statusCbs = [];
    this.disconnect();
  }
}

/**
 * WebSocketProvider — connects to a y-sync compatible WebSocket server.
 *
 * The server can be a y-websocket server or any WebSocket that speaks
 * the yjs sync protocol (V1 or V2).
 */
export class WebSocketProvider implements Provider {
  readonly peerId: string;
  private ws: WebSocket | null = null;
  private url: string;
  private receiveCbs: Array<(data: Uint8Array) => void> = [];
  private statusCbs: Array<(status: ConnectionStatus) => void> = [];
  private _status: ConnectionStatus = 'disconnected';
  private _shouldReconnect = true;

  constructor(url: string, roomName: string, peerId: string) {
    this.peerId = peerId;
    this.url = `${url}?room=${encodeURIComponent(roomName)}&peerId=${encodeURIComponent(peerId)}`;
  }

  get status(): ConnectionStatus {
    return this._status;
  }

  private setStatus(s: ConnectionStatus): void {
    this._status = s;
    for (const cb of this.statusCbs) {
      cb(s);
    }
  }

  connect(): void {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.setStatus('connecting');

    try {
      this.ws = new WebSocket(this.url);
      this.ws.binaryType = 'arraybuffer';

      this.ws.onopen = () => {
        this.setStatus('connected');
      };

      this.ws.onmessage = (event: MessageEvent) => {
        if (event.data instanceof ArrayBuffer) {
          const bytes = new Uint8Array(event.data);
          for (const cb of this.receiveCbs) {
            cb(bytes);
          }
        }
      };

      this.ws.onclose = () => {
        this.setStatus('disconnected');
        if (this._shouldReconnect) {
          setTimeout(() => this.connect(), 2000);
        }
      };

      this.ws.onerror = () => {
        this.setStatus('error');
      };
    } catch {
      this.setStatus('error');
    }
  }

  disconnect(): void {
    this._shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus('disconnected');
  }

  send(data: Uint8Array): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data.buffer);
    }
  }

  sendSyncStep1(_stateVector: Uint8Array): void {
    // WebSocket handles this via the y-sync protocol automatically.
  }

  onReceive(cb: (data: Uint8Array) => void): void {
    this.receiveCbs.push(cb);
  }

  onStatusChange(cb: (status: ConnectionStatus) => void): void {
    this.statusCbs.push(cb);
  }

  destroy(): void {
    this.receiveCbs = [];
    this.statusCbs = [];
    this.disconnect();
  }
}
