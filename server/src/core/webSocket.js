const WebSocket = require('ws');

const clients = new Map(); // serviceId -> Set<WebSocket>

function initWebSocket(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws, req) => {
        // Expects URL like: /ws/chats/:serviceId
        const serviceId = req.url.split('/').pop();

        if (!clients.has(serviceId)) clients.set(serviceId, new Set());
        clients.get(serviceId).add(ws);

        ws.on('close', () => clients.get(serviceId)?.delete(ws));
        ws.on('error', () => clients.get(serviceId)?.delete(ws));
    });
}

function broadcastToService(serviceId, payload) {
    const serviceClients = clients.get(serviceId);
    if (!serviceClients) return;

    const message = JSON.stringify(payload);
    for (const client of serviceClients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    }
}

module.exports = { initWebSocket, broadcastToService };
