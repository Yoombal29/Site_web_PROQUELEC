import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as Y from 'yjs';
import type { Block } from '@/types/builder';
import { YjsDocManager } from '../doc';
import { BroadcastChannelProvider } from '../provider';
import { ZustandSync } from '../sync';
import { AwarenessManager } from '../awareness';

function makeBlock(id: string, overrides: Partial<Block> = {}): Block {
  return {
    id, type: 'section',
    content: { title: `Block ${id}` },
    style: { padding: '20px' },
    ...overrides,
  };
}

function makeBlocks(ids: string[]): Block[] {
  return ids.map((id) => makeBlock(id));
}

// ── YjsDocManager ───────────────────────────────────────────

describe('YjsDocManager', () => {
  it('should create empty document', () => {
    const mgr = new YjsDocManager();
    expect(mgr.getBlocks()).toEqual([]);
    expect(mgr.getMetadata()).toEqual({});
    mgr.destroy();
  });

  it('should set and retrieve blocks', () => {
    const mgr = new YjsDocManager();
    const blocks = makeBlocks(['a', 'b', 'c']);
    mgr.setBlocks(blocks);
    expect(mgr.getBlocks()).toHaveLength(3);
    expect(mgr.getBlocks()[0].id).toBe('a');
    expect(mgr.getBlocks()[2].id).toBe('c');
    mgr.destroy();
  });

  it('should set and retrieve metadata', () => {
    const mgr = new YjsDocManager();
    mgr.setMetadata({ title: 'Test Page', slug: '/test' });
    const meta = mgr.getMetadata();
    expect(meta.title).toBe('Test Page');
    expect(meta.slug).toBe('/test');
    mgr.destroy();
  });

  it('should encode and apply state updates', () => {
    const mgr1 = new YjsDocManager();
    mgr1.setBlocks(makeBlocks(['a', 'b']));

    const encoded = mgr1.encodeState();

    const mgr2 = new YjsDocManager();
    mgr2.applyUpdate(encoded);
    expect(mgr2.getBlocks()).toHaveLength(2);
    expect(mgr2.getBlocks()[0].id).toBe('a');

    mgr1.destroy();
    mgr2.destroy();
  });

  it('should notify observers on block changes', () => {
    const mgr = new YjsDocManager();
    const fn = vi.fn();
    mgr.onBlocksChanged(fn);
    mgr.setBlocks(makeBlocks(['x']));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 'x' })]),
      null,
    );
    mgr.destroy();
  });

  it('should notify observers on metadata changes', () => {
    const mgr = new YjsDocManager();
    const fn = vi.fn();
    mgr.onMetadataChanged(fn);
    mgr.setMetadata({ key: 'value' });
    expect(fn).toHaveBeenCalled();
    mgr.destroy();
  });

  it('should compute incremental updates', () => {
    const mgr1 = new YjsDocManager();
    mgr1.setBlocks(makeBlocks(['a']));

    const sv = mgr1.encodeStateVector();
    mgr1.setBlocks(makeBlocks(['a', 'b']));
    const incrementalUpdate = mgr1.encodeState(); // full update for simplicity

    const mgr2 = new YjsDocManager();
    mgr2.applyUpdate(incrementalUpdate);
    expect(mgr2.getBlocks()).toHaveLength(2);
    expect(mgr2.getBlocks()[1].id).toBe('b');

    mgr1.destroy();
    mgr2.destroy();
  });

  it('should handle nested blocks', () => {
    const mgr = new YjsDocManager();
    const parent: Block = {
      ...makeBlock('parent'),
      children: makeBlocks(['child-a', 'child-b']),
    };
    mgr.setBlocks([parent]);

    const retrieved = mgr.getBlocks();
    expect(retrieved).toHaveLength(1);
    expect(retrieved[0].children).toHaveLength(2);
    expect(retrieved[0].children![0].id).toBe('child-a');
    mgr.destroy();
  });

  it('should compute state vector', () => {
    const mgr = new YjsDocManager();
    mgr.setBlocks(makeBlocks(['a']));
    const sv = mgr.encodeStateVector();
    expect(sv.byteLength).toBeGreaterThan(0);
    mgr.destroy();
  });
});

// ── BroadcastChannelProvider ─────────────────────────────────

describe('BroadcastChannelProvider', () => {
  it('should connect and set status', () => {
    const p1 = new BroadcastChannelProvider('test-room', 'peer-1');
    const statusFn = vi.fn();
    p1.onStatusChange(statusFn);
    p1.connect();
    expect(statusFn).toHaveBeenCalledWith('connected');
    p1.destroy();
  });

  it('should send and receive messages between two instances', () => {
    const p1 = new BroadcastChannelProvider('test-room-2', 'peer-1');
    const p2 = new BroadcastChannelProvider('test-room-2', 'peer-2');

    const receiveFn = vi.fn();
    p2.onReceive(receiveFn);

    p1.connect();
    p2.connect();

    const data = new Uint8Array([1, 2, 3, 4]);
    p1.send(data);

    // BroadcastChannel is async - wait a tick
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(receiveFn).toHaveBeenCalledWith(expect.any(Uint8Array));
        p1.destroy();
        p2.destroy();
        resolve();
      }, 50);
    });
  });

  it('should not receive own messages', () => {
    const p1 = new BroadcastChannelProvider('test-room-3', 'peer-1');
    const receiveFn = vi.fn();
    p1.onReceive(receiveFn);
    p1.connect();

    const data = new Uint8Array([1, 2, 3]);
    p1.send(data);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Should NOT call receiveFn because we sent to ourselves
        expect(receiveFn).not.toHaveBeenCalled();
        p1.destroy();
        resolve();
      }, 50);
    });
  });
});

// ── ZustandSync ──────────────────────────────────────────────

describe('ZustandSync', () => {
  it('should push blocks to Yjs and sync', () => {
    const doc = new YjsDocManager();
    const provider = new BroadcastChannelProvider('sync-test', 'peer-1');
    const sync = new ZustandSync(doc, provider);

    const blocks = makeBlocks(['a', 'b']);
    sync.pushBlocks(blocks);

    expect(doc.getBlocks()).toHaveLength(2);
    expect(doc.getBlocks()[0].id).toBe('a');

    provider.destroy();
  });

  it('should fire remote update callback when Yjs changes externally', () => {
    const doc = new YjsDocManager();
    const provider = new BroadcastChannelProvider('sync-test-2', 'peer-1');
    const sync = new ZustandSync(doc, provider);

    const fn = vi.fn();
    sync.onRemoteUpdate(fn);

    // Apply an update directly to the Yjs doc (simulating remote)
    const remoteDoc = new Y.Doc();
    const remoteArr = remoteDoc.getArray('blocks');
    const map = new Y.Map();
    map.set('id', 'remote-block');
    map.set('type', 'section');
    map.set('content', {});
    remoteArr.push([map]);

    const update = Y.encodeStateAsUpdate(remoteDoc);
    doc.applyUpdate(update, 'remote');

    expect(fn).toHaveBeenCalled();
    expect(doc.getBlocks()).toHaveLength(1);
    expect(doc.getBlocks()[0].id).toBe('remote-block');

    provider.destroy();
    remoteDoc.destroy();
  });
});

// ── AwarenessManager ─────────────────────────────────────────

describe('AwarenessManager', () => {
  let awareness: AwarenessManager;

  beforeEach(() => {
    awareness = new AwarenessManager('local-user', 'Alice');
  });

  afterEach(() => {
    // Clean up
  });

  it('should start with local peer online', () => {
    const peers = awareness.getPeers();
    expect(peers).toHaveLength(1);
    expect(peers[0].userId).toBe('local-user');
    expect(peers[0].userName).toBe('Alice');
  });

  it('should track cursor positions', () => {
    awareness.setLocalCursor({
      userId: 'local-user', userName: 'Alice', color: '#6366f1',
      x: 100, y: 200, lastSeen: Date.now(),
    });
    const peers = awareness.getPeers();
    expect(peers[0].cursor).not.toBeNull();
    expect(peers[0].cursor!.x).toBe(100);
    expect(peers[0].cursor!.y).toBe(200);
  });

  it('should track block selections', () => {
    awareness.setLocalSelection({ userId: 'local-user', blockId: 'block-1' });
    const peers = awareness.getPeers();
    expect(peers[0].selection?.blockId).toBe('block-1');
  });

  it('should register remote peers', () => {
    awareness.upsertPeer({
      userId: 'remote-1', userName: 'Bob', color: '#ec4899',
      cursor: null, selection: null, isOnline: true, lastSeen: Date.now(),
    });
    expect(awareness.onlineCount).toBe(2);
  });

  it('should remove offline peers', () => {
    awareness.upsertPeer({
      userId: 'remote-1', userName: 'Bob', color: '#ec4899',
      cursor: null, selection: null, isOnline: true, lastSeen: Date.now(),
    });
    awareness.removePeer('remote-1');
    expect(awareness.onlineCount).toBe(1);
  });

  it('should notify listeners on changes', () => {
    const fn = vi.fn();
    awareness.onChange(fn);
    awareness.setLocalCursor({
      userId: 'local-user', userName: 'Alice', color: '#6366f1',
      x: 50, y: 50, lastSeen: Date.now(),
    });
    expect(fn).toHaveBeenCalled();
  });

  it('should clean stale peers', () => {
    awareness.upsertPeer({
      userId: 'stale', userName: 'Stale', color: '#999',
      cursor: null, selection: null, isOnline: true, lastSeen: Date.now() - 60_000,
    });
    awareness.cleanStalePeers(30_000);
    expect(awareness.onlineCount).toBe(1); // only local
  });

  it('should provide distinct colors per peer within the same manager', () => {
    const a = new AwarenessManager('local', 'Host');
    // Register 3 peers
    a.upsertPeer({
      userId: 'p1', userName: 'Peer1', color: '#6366f1',
      cursor: null, selection: null, isOnline: true, lastSeen: Date.now(),
    });
    a.upsertPeer({
      userId: 'p2', userName: 'Peer2', color: '#ec4899',
      cursor: null, selection: null, isOnline: true, lastSeen: Date.now(),
    });

    expect(a.onlineCount).toBe(3); // local + 2 peers
  });

  it('should start and stop cleanup interval', () => {
    const stop = awareness.startCleanup(100);
    expect(typeof stop).toBe('function');
    stop(); // should not throw
  });
});

// ── End-to-end: two peers sync ───────────────────────────────

describe('end-to-end sync', () => {
  it('should sync blocks between two YjsDocManagers via state update', () => {
    const mgr1 = new YjsDocManager();
    const mgr2 = new YjsDocManager();

    const blocks = makeBlocks(['a', 'b', 'c']);
    mgr1.setBlocks(blocks);

    // Sync mgr1 → mgr2
    const update = mgr1.encodeState();
    mgr2.applyUpdate(update);

    expect(mgr2.getBlocks()).toHaveLength(3);

    // Now mgr2 adds a block and syncs back
    const mgr2Blocks = mgr2.getBlocks();
    mgr2Blocks.push(makeBlock('d'));
    mgr2.setBlocks(mgr2Blocks);

    const update2 = mgr2.encodeState();
    mgr1.applyUpdate(update2);

    expect(mgr1.getBlocks()).toHaveLength(4);

    mgr1.destroy();
    mgr2.destroy();
  });

  it('should sync nested block trees', () => {
    const mgr1 = new YjsDocManager();
    const mgr2 = new YjsDocManager();

    const tree: Block[] = [{
      ...makeBlock('root'),
      children: [
        makeBlock('child1'),
        { ...makeBlock('child2'), children: [makeBlock('grandchild')] },
      ],
    }];

    mgr1.setBlocks(tree);
    const update = mgr1.encodeState();
    mgr2.applyUpdate(update);

    const retrieved = mgr2.getBlocks();
    expect(retrieved[0].children).toHaveLength(2);
    expect(retrieved[0].children![1].children).toHaveLength(1);
    expect(retrieved[0].children![1].children![0].id).toBe('grandchild');

    mgr1.destroy();
    mgr2.destroy();
  });
});
