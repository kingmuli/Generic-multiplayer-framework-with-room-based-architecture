// server.js - Generic Multiplayer Framework
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { networkInterfaces } = require('os');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Routes for different examples
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/hide-seek', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'examples', 'hide-seek.html'));
});

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'examples', 'chat-room.html'));
});

app.get('/drawing', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'examples', 'drawing-game.html'));
});

// =====================
// GENERIC FRAMEWORK CORE
// =====================

class MultiplayerFramework {
    constructor() {
        this.rooms = new Map(); // roomId -> Room
        this.players = new Map(); // socketId -> Player
        this.gameTypes = new Map(); // gameType -> GameLogic
    }

    registerGameType(gameType, gameLogic) {
        this.gameTypes.set(gameType, gameLogic);
    }

    createRoom(roomId, gameType = 'generic') {
        const room = {
            id: roomId,
            gameType,
            players: new Set(),
            state: {},
            createdAt: Date.now()
        };
        
        const gameLogic = this.gameTypes.get(gameType);
        if (gameLogic) {
            room.state = gameLogic.initializeState();
        }
        
        this.rooms.set(roomId, room);
        return room;
    }

    joinRoom(socket, roomId, playerData) {
        let room = this.rooms.get(roomId);
        if (!room) {
            room = this.createRoom(roomId, 'generic');
        }

        const player = {
            id: socket.id,
            socket: socket,
            roomId: roomId,
            data: playerData,
            joinedAt: Date.now()
        };

        this.players.set(socket.id, player);
        room.players.add(socket.id);

        // Notify room
        socket.join(roomId);
        socket.to(roomId).emit('playerJoined', {
            playerId: socket.id,
            playerData: playerData,
            roomState: room.state
        });

        return { room, player };
    }

    leaveRoom(socketId) {
        const player = this.players.get(socketId);
        if (!player) return;

        const room = this.rooms.get(player.roomId);
        if (room) {
            room.players.delete(socketId);
            
            // Notify room
            const socket = player.socket;
            socket.to(player.roomId).emit('playerLeft', {
                playerId: socketId,
                playerData: player.data
            });

            // Cleanup empty rooms
            if (room.players.size === 0) {
                this.rooms.delete(player.roomId);
            }
        }

        this.players.delete(socketId);
    }

    broadcastToRoom(roomId, event, data, excludeSocketId = null) {
        if (excludeSocketId) {
            io.to(roomId).except(excludeSocketId).emit(event, data);
        } else {
            io.to(roomId).emit(event, data);
        }
    }

    updateRoomState(roomId, stateUpdate) {
        const room = this.rooms.get(roomId);
        if (room) {
            Object.assign(room.state, stateUpdate);
            
            // Apply game-specific logic if available
            const gameLogic = this.gameTypes.get(room.gameType);
            if (gameLogic && gameLogic.onStateUpdate) {
                gameLogic.onStateUpdate(room, stateUpdate);
            }
        }
    }

    getRoomState(roomId) {
        const room = this.rooms.get(roomId);
        return room ? room.state : null;
    }

    getPlayersInRoom(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return [];
        
        return Array.from(room.players).map(playerId => {
            const player = this.players.get(playerId);
            return { id: player.id, data: player.data };
        });
    }
}

// =====================
// GAME TYPE DEFINITIONS
// =====================

const gameTypes = {
    generic: {
        initializeState: () => ({
            players: {},
            objects: {},
            settings: {}
        })
    },
    
    hideAndSeek: {
        initializeState: () => ({
            hider: null,
            seekers: [],
            treasureLocation: null,
            gameStarted: false,
            roundTime: 300 // 5 minutes
        }),
        
        onStateUpdate: (room, update) => {
            // Custom logic for hide and seek
            if (update.treasureLocation) {
                console.log(`Treasure hidden in room ${room.id} at:`, update.treasureLocation);
            }
        }
    },
    
    chatRoom: {
        initializeState: () => ({
            messages: [],
            users: {},
            settings: {
                maxMessages: 100
            }
        })
    },
    
    drawingGame: {
        initializeState: () => ({
            canvas: {},
            currentDrawer: null,
            wordToDraw: null,
            scores: {}
        })
    }
};

// =====================
// INITIALIZE FRAMEWORK
// =====================

const framework = new MultiplayerFramework();

// Register all game types
Object.entries(gameTypes).forEach(([gameType, logic]) => {
    framework.registerGameType(gameType, logic);
});

// =====================
// SOCKET.IO HANDLING
// =====================

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Generic event handlers
    socket.on('joinRoom', (data) => {
        const { roomId, playerData, gameType = 'generic' } = data;
        const { room, player } = framework.joinRoom(socket, roomId, playerData);
        
        socket.emit('roomJoined', {
            roomId,
            playerId: socket.id,
            roomState: room.state,
            playersInRoom: framework.getPlayersInRoom(roomId)
        });

        console.log(`Player ${socket.id} joined room ${roomId}`);
    });

    socket.on('leaveRoom', () => {
        framework.leaveRoom(socket.id);
        socket.emit('roomLeft', { playerId: socket.id });
    });

    socket.on('roomAction', (data) => {
        const { roomId, action, payload } = data;
        const player = framework.players.get(socket.id);
        
        if (player && player.roomId === roomId) {
            // Broadcast action to room
            framework.broadcastToRoom(roomId, 'roomAction', {
                playerId: socket.id,
                action,
                payload,
                timestamp: Date.now()
            });

            // Handle specific actions
            if (action === 'updateState') {
                framework.updateRoomState(roomId, payload);
            }
        }
    });

    socket.on('playerUpdate', (data) => {
        const player = framework.players.get(socket.id);
        if (player) {
            Object.assign(player.data, data);
            
            framework.broadcastToRoom(player.roomId, 'playerUpdated', {
                playerId: socket.id,
                playerData: player.data
            });
        }
    });

    socket.on('message', (data) => {
        const player = framework.players.get(socket.id);
        if (player) {
            framework.broadcastToRoom(player.roomId, 'message', {
                playerId: socket.id,
                playerData: player.data,
                message: data.message,
                timestamp: Date.now()
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        framework.leaveRoom(socket.id);
    });
});

// =====================
// UTILITY FUNCTIONS
// =====================

function getLocalIP() {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}

// =====================
// START SERVER
// =====================

server.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log('🎮 === MULTIPLAYER FRAMEWORK STARTED ===');
    console.log(`📍 Local: http://localhost:${PORT}`);
    console.log(`🌐 Network: http://${localIP}:${PORT}`);
    console.log(`📚 Examples:`);
    console.log(`   - Main Framework: http://localhost:${PORT}`);
    console.log(`   - Hide & Seek: http://localhost:${PORT}/hide-seek`);
    console.log(`   - Chat Room: http://localhost:${PORT}/chat`);
    console.log(`   - Drawing Game: http://localhost:${PORT}/drawing`);
    console.log('=========================================');
});

module.exports = { app, server, io, framework };