// client.js - MultiFramework Core Client
class MultiFrameworkClient {
    constructor() {
        this.socket = io();
        this.currentRoom = null;
        this.playerData = {};
        this.eventCallbacks = new Map();
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Connection events
        this.socket.on('connect', () => this.onConnect());
        this.socket.on('disconnect', () => this.onDisconnect());
        
        // Room events
        this.socket.on('roomJoined', (data) => this.onRoomJoined(data));
        this.socket.on('playerJoined', (data) => this.onPlayerJoined(data));
        this.socket.on('playerLeft', (data) => this.onPlayerLeft(data));
        this.socket.on('roomAction', (data) => this.onRoomAction(data));
        this.socket.on('playerUpdated', (data) => this.onPlayerUpdated(data));
        this.socket.on('message', (data) => this.onMessage(data));
    }

    // Public API Methods
    joinRoom(roomId, playerData, gameType = 'generic') {
        this.playerData = { ...playerData, id: this.socket.id };
        this.socket.emit('joinRoom', {
            roomId,
            playerData: this.playerData,
            gameType
        });
    }

    leaveRoom() {
        if (this.currentRoom) {
            this.socket.emit('leaveRoom');
            this.currentRoom = null;
        }
    }

    sendRoomAction(action, payload = {}) {
        if (this.currentRoom) {
            this.socket.emit('roomAction', {
                roomId: this.currentRoom,
                action,
                payload
            });
        }
    }

    updatePlayer(data) {
        Object.assign(this.playerData, data);
        this.socket.emit('playerUpdate', data);
    }

    sendMessage(message) {
        this.socket.emit('message', { message });
    }

    on(event, callback) {
        this.eventCallbacks.set(event, callback);
    }

    // Event Handlers
    onConnect() {
        this.triggerEvent('connect');
        updateConnectionStatus('Connected to MultiFramework', true);
        addEventLog('Connected to server', 'success');
    }

    onDisconnect() {
        this.triggerEvent('disconnect');
        updateConnectionStatus('Disconnected', false);
        addEventLog('Disconnected from server', 'warning');
    }

    onRoomJoined(data) {
        this.currentRoom = data.roomId;
        this.triggerEvent('roomJoined', data);
        addEventLog(`Joined room: ${data.roomId}`, 'success');
        addEventLog(`Players in room: ${data.playersInRoom.length}`, 'info');
    }

    onPlayerJoined(data) {
        this.triggerEvent('playerJoined', data);
        addEventLog(`Player joined: ${data.playerData.name || data.playerId}`, 'info');
    }

    onPlayerLeft(data) {
        this.triggerEvent('playerLeft', data);
        addEventLog(`Player left: ${data.playerId}`, 'warning');
    }

    onRoomAction(data) {
        this.triggerEvent('roomAction', data);
        addEventLog(`Action: ${data.action} from ${data.playerId}`, 'info');
    }

    onPlayerUpdated(data) {
        this.triggerEvent('playerUpdated', data);
    }

    onMessage(data) {
        this.triggerEvent('message', data);
        addEventLog(`Message from ${data.playerData.name}: ${data.message}`, 'message');
    }

    triggerEvent(event, data) {
        const callback = this.eventCallbacks.get(event);
        if (callback) {
            callback(data);
        }
    }
}

// Global framework instance
window.framework = new MultiFrameworkClient();

// UI Functions
function updateConnectionStatus(message, isConnected) {
    const statusEl = document.getElementById('connectionStatus');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = `status ${isConnected ? 'connected' : 'disconnected'}`;
    }
}

function addEventLog(message, type = 'info') {
    const logEl = document.getElementById('eventLog');
    if (logEl) {
        const eventEl = document.createElement('div');
        eventEl.className = `event ${type}`;
        eventEl.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logEl.appendChild(eventEl);
        
        // Keep only last 50 events
        while (logEl.children.length > 50) {
            logEl.removeChild(logEl.firstChild);
        }
        
        logEl.scrollTop = logEl.scrollHeight;
    }
}

// Demo Functions
function openFramework() {
    document.getElementById('frameworkDemo').classList.remove('hidden');
}

function joinRoom() {
    const roomId = document.getElementById('roomId').value || 'demo-room';
    const playerName = document.getElementById('playerName').value || 'Player';
    
    framework.joinRoom(roomId, {
        name: playerName,
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
    });
}

function leaveRoom() {
    framework.leaveRoom();
    addEventLog('Left room', 'warning');
}

function sendAction(action) {
    framework.sendRoomAction(action, {
        timestamp: Date.now(),
        random: Math.random()
    });
}

function sendMessage() {
    const messageInput = document.getElementById('customMessage');
    const message = messageInput.value.trim();
    if (message) {
        framework.sendMessage(message);
        messageInput.value = '';
    }
}

function showApiDocs() {
    alert(`MultiFramework API Documentation:

Framework.joinRoom(roomId, playerData, gameType)
Framework.leaveRoom()
Framework.sendRoomAction(action, payload)
Framework.updatePlayer(data)
Framework.sendMessage(message)
Framework.on(event, callback)

Events: connect, disconnect, roomJoined, playerJoined, 
        playerLeft, roomAction, playerUpdated, message
    `);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add server info
    const serverInfoEl = document.getElementById('serverInfo');
    if (serverInfoEl) {
        serverInfoEl.textContent = `Server: ${window.location.host}`;
    }
    
    // Setup framework event logging
    framework.on('roomAction', (data) => {
        addEventLog(`Action: ${data.action} from ${data.playerId}`, 'info');
    });
    
    framework.on('message', (data) => {
        addEventLog(`Chat: ${data.playerData.name}: ${data.message}`, 'message');
    });
});