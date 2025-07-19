"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// websocket-server.ts
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 3001 });
wss.on('connection', (socket) => {
    console.log('🔌 Client connected');
    socket.on('message', (message) => {
        console.log('📨 Received:', message.toString());
        socket.send(`Echo: ${message}`);
    });
    socket.send('👋 Hello from WebSocket server!');
});
console.log('✅ WebSocket server running on ws://localhost:3001');
