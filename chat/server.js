const WebSocket = require('ws');

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

// Keep track of connected clients
const clients = new Set();

// Broadcast a message to all connected clients
function broadcastMessage(message) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Handle new connections
wss.on('connection', (ws) => {
  // Add the new client to the set
  clients.add(ws);

  // Handle messages from the client
  ws.on('message', (message) => {
    broadcastMessage(message);
  });

  // Handle client disconnection
  ws.on('close', () => {
    // Remove the client from the set
    clients.delete(ws);
  });
});
