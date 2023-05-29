const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const players = [];

wss.on('connection', function connection(ws) {
  // Generate a random color for the player
  const color = '#' + Math.floor(Math.random() * 16777215).toString(16);

  // Add the new player to the list
  const player = {
    id: Math.random().toString(36).substr(2, 9),
    x: Math.random() * 380,
    y: Math.random() * 380,
    color: color,
    socket: ws,
  };
  players.push(player);

  // Send the current game state to the new player
  const initialState = {
    type: "state",
    players: players.map(({ id, x, y, color }) => ({ id, x, y, color })),
  };
  ws.send(JSON.stringify(initialState));

  // Broadcast the new player's position to all connected players
  const playerJoined = {
    type: "state",
    players: players.map(({ id, x, y, color }) => ({ id, x, y, color })),
  };
  broadcast(JSON.stringify(playerJoined));

  // Handle messages from the player
ws.on('message', function incoming(message) {
    const data = JSON.parse(message);
    if (data.type === "move") {
      // Update the player's position
      player.x += data.dx;
      player.y += data.dy;
  
      // Broadcast the updated player list to all connected players
      const playerMoved = {
        type: "state",
        players: players.map(({ id, x, y, color }) => ({ id, x, y, color })),
      };
      broadcast(JSON.stringify(playerMoved));
    }
  });

  // Handle player disconnection
  ws.on('close', function () {
    // Remove the player from the list
    const index = players.indexOf(player);
    if (index > -1) {
      players.splice(index, 1);
    }

    // Broadcast the updated player list to all connected players
    const playerLeft = {
      type: "state",
      players: [{ id: player.id }],
    };
    broadcast(JSON.stringify(playerLeft));
  });

  // Broadcast a message to all connected players
  function broadcast(message) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
});
