const WebSocket = require('ws');

let wss;

function setupWebSocketServer(server) {
  wss = new WebSocket.Server({ server });

  wss.on('connection', ws => {
    console.log('Client connected');
    ws.on('close', () => console.log('Client disconnected'));
  });

  return wss;
}

function getWebSocketServer() {
  if (!wss) {
    throw new Error('WebSocket server is not set up yet');
  }
  return wss;
}

module.exports = { setupWebSocketServer, getWebSocketServer };