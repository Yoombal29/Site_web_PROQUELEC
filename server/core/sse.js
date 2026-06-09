const sseClients = new Map();
const sseStats = { totalConnections: 0, activeConnections: 0 };

function sendSseEvent(event, data) {
    const payload = typeof data === 'string' ? data : JSON.stringify(data || {});
    const disconnectedClients = [];

    for (const [res, metadata] of sseClients) {
        try {
            if (res.writableEnded || res.destroyed) {
                disconnectedClients.push(res);
                continue;
            }
            res.write(`event: ${event}\n`);
            res.write(`data: ${payload}\n\n`);
            metadata.lastEventTime = Date.now();
        } catch (e) {
            console.warn(`[SSE] Failed to send event '${event}' to client:`, e.message);
            disconnectedClients.push(res);
        }
    }

    for (const res of disconnectedClients) {
        sseClients.delete(res);
        sseStats.activeConnections = sseClients.size;
    }
}

function addSseClient(res) {
    const metadata = {
        connectedAt: Date.now(),
        lastEventTime: Date.now(),
        lastHeartbeat: Date.now()
    };
    sseClients.set(res, metadata);
    sseStats.totalConnections++;
    sseStats.activeConnections = sseClients.size;
}

function removeSseClient(res) {
    sseClients.delete(res);
    sseStats.activeConnections = sseClients.size;
}

function getSseStats() {
    return { ...sseStats };
}

// Auto-start heartbeat
setInterval(() => {
    for (const [res] of sseClients) {
        try {
            if (!res.writableEnded && !res.destroyed) {
                res.write(`:heartbeat\n\n`);
            }
        } catch (e) { }
    }
}, 30000);

module.exports = { sendSseEvent, addSseClient, removeSseClient, getSseStats };
