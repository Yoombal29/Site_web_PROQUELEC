const WebSocket = require('ws');
const http = require('http');
const setupWSConnection = require('../node_modules/y-websocket/bin/utils').setupWSConnection;

const port = process.env.COLLAB_PORT || 1234;
const server = http.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('PROQUELEC Collaboration Server is running\n');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (conn, req) => {
    // room name is the path
    setupWSConnection(conn, req);
});

server.listen(port, () => {
    console.log(`🚀 Collaboration server listening on port ${port}`);
});
