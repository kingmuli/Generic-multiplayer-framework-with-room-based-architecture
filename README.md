Technical Documentation
📁 Project Structure
text
multiframework/
├── .gitignore
├── package.json
├── server.js
├── README.md
└── public/
    ├── index.html
    ├── client.js
    ├── style.css
    └── examples/
        ├── hide-seek.html
        ├── chat-room.html
        └── drawing-game.html
🚀 Installation & Setup
Prerequisites
Node.js (v14 or higher)

Modern web browser

Step-by-Step Setup
bash
# 1. Clone the repository
git clone https://github.com/kingmuli/generic-multiplayer-with-room-based-architecture.git
cd multiframework

# 2. Install dependencies
npm install

# 3. Start the server
npm start

# 4. Access the application
# Main Dashboard: http://localhost:3000
# Hide & Seek:   http://localhost:3000/hide-seek
# Chat Room:     http://localhost:3000/chat
# Drawing Game:  http://localhost:3000/drawing
For Multiplayer Testing
When the server starts, it will display:

text
🎮 === MULTIPLAYER FRAMEWORK STARTED ===
📍 Local: http://localhost:3000
🌐 Network: http://192.168.1.100:3000
👥 Share with friends on your local network!
Share the Network URL with friends on the same WiFi.

🔌 API Documentation
Core Framework Class
MultiplayerFramework
The main server-side framework class that manages rooms, players, and game logic.

Methods:

registerGameType(gameType, gameLogic) - Register a new game type

createRoom(roomId, gameType) - Create a new room

joinRoom(socket, roomId, playerData) - Join a player to a room

leaveRoom(socketId) - Remove player from room

broadcastToRoom(roomId, event, data, excludeSocketId) - Send message to room

updateRoomState(roomId, stateUpdate) - Update room state

getRoomState(roomId) - Get current room state

getPlayersInRoom(roomId) - Get all players in room

Client-Side API
MultiFrameworkClient
The main client-side class for interacting with the framework.

Methods:

joinRoom(roomId, playerData, gameType) - Join a room

leaveRoom() - Leave current room

sendRoomAction(action, payload) - Send action to room

updatePlayer(data) - Update player data

sendMessage(message) - Send chat message

on(event, callback) - Register event listener

Events:

connect - Connected to server

disconnect - Disconnected from server

roomJoined - Successfully joined room

playerJoined - New player joined room

playerLeft - Player left room

roomAction - Received room action

playerUpdated - Player data updated

message - Received chat message

🎮 Built-in Game Types
1. Generic
Basic room functionality for custom implementations.

State Structure:

javascript
{
    players: {},
    objects: {},
    settings: {}
}
2. Hide and Seek
Minecraft-style treasure hunt game.

State Structure:

javascript
{
    hider: null,
    seekers: [],
    treasureLocation: null,
    gameStarted: false,
    roundTime: 300
}
3. Chat Room
Real-time messaging application.

State Structure:

javascript
{
    messages: [],
    users: {},
    settings: {
        maxMessages: 100
    }
}
4. Drawing Game
Collaborative drawing application.

State Structure:

javascript
{
    canvas: {},
    currentDrawer: null,
    wordToDraw: null,
    scores: {}
}
🔧 Extending the Framework
Adding a New Game Type
1. Define Game Logic (server.js)
javascript
const myGameType = {
    initializeState: () => ({
        // Initial game state
        score: 0,
        players: {},
        gameState: 'waiting'
    }),
    
    onStateUpdate: (room, update) => {
        // Custom logic when state changes
        console.log(`Game state updated in room ${room.id}:`, update);
    }
};

// Register the game type
framework.registerGameType('myGame', myGameType);
2. Create Client Interface (public/examples/my-game.html)
html
<!DOCTYPE html>
<html>
<head>
    <title>My Custom Game</title>
    <style>/* Game-specific styles */</style>
</head>
<body>
    <div id="gameContainer">
        <h1>My Custom Game</h1>
        <!-- Game UI elements -->
    </div>
    
    <script src="/socket.io/socket.io.js"></script>
    <script>
        const framework = new MultiFrameworkClient();
        
        // Join room with custom game type
        framework.joinRoom('my-game-room', {
            name: 'Player',
            ready: false
        }, 'myGame');
        
        // Handle game-specific events
        framework.on('roomAction', (data) => {
            if (data.action === 'gameEvent') {
                handleGameEvent(data.payload);
            }
        });
        
        function sendGameAction() {
            framework.sendRoomAction('gameEvent', {
                type: 'playerAction',
                value: 'someValue'
            });
        }
    </script>
</body>
</html>
3. Add Route (server.js)
javascript
app.get('/my-game', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'examples', 'my-game.html'));
});
🎯 Example Implementations
Basic Chat Application
javascript
// Client-side code for chat
framework.joinRoom('chat-room', { name: 'User' }, 'chatRoom');

framework.on('message', (data) => {
    const chatBox = document.getElementById('chatMessages');
    chatBox.innerHTML += `<div><strong>${data.playerData.name}:</strong> ${data.message}</div>`;
});

function sendChatMessage() {
    const input = document.getElementById('messageInput');
    framework.sendMessage(input.value);
    input.value = '';
}
Player Movement System
javascript
// For 3D games
function updatePlayerPosition(x, y, z) {
    framework.updatePlayer({
        position: { x, y, z },
        rotation: { x: 0, y: 0, z: 0 }
    });
}

framework.on('playerUpdated', (data) => {
    // Update other players' positions in your game world
    updateOtherPlayer(data.playerId, data.playerData.position);
});
🔍 Troubleshooting
Common Issues
1. Connection Problems
Symptoms: "Connecting..." status persists
Solutions:

Verify server is running: node server.js

Check firewall settings

Ensure correct port (3000) is accessible

2. Room Join Failures
Symptoms: Players can't see each other
Solutions:

Verify all players use same room ID

Check network connectivity

Restart server

3. Event Not Received
Symptoms: Actions not propagating to other clients
Solutions:

Verify event names match

Check room ID consistency

Confirm players are in same room

Debug Mode
Enable debug logging by adding to client.js:

javascript
// Add to MultiFrameworkClient constructor
this.socket.onAny((event, ...args) => {
    console.log(`[Socket.IO] ${event}`, args);
});
📊 Performance Considerations
Room Limits
Recommended: 10-20 players per room

Maximum: 50 players per room (theoretical)

Optimal: 4-8 players for real-time games

State Size
Keep room state under 1MB

Use incremental updates for large states

Consider client-side prediction for fast-paced games

Network Optimization
Batch frequent updates

Use delta compression for state changes

Implement client-side interpolation

🔒 Security Considerations
Input Validation
Always validate incoming data:

javascript
socket.on('roomAction', (data) => {
    // Validate roomId format
    if (!isValidRoomId(data.roomId)) return;
    
    // Validate action type
    if (!isValidAction(data.action)) return;
    
    // Process valid action
    framework.broadcastToRoom(data.roomId, 'roomAction', data);
});
Rate Limiting
Implement rate limiting for frequent actions:

javascript
const rateLimit = new Map();

socket.on('roomAction', (data) => {
    const key = `${socket.id}-${data.action}`;
    const now = Date.now();
    const lastCall = rateLimit.get(key) || 0;
    
    if (now - lastCall < 100) { // 100ms minimum between same actions
        return; // Too frequent, ignore
    }
    
    rateLimit.set(key, now);
    // Process action...
});
🚀 Deployment
Local Development
bash
npm start
Production Deployment
bash
# Set environment variable
export NODE_ENV=production

# Start with process manager
npm install -g pm2
pm2 start server.js --name "multiframework"
Environment Variables
PORT - Server port (default: 3000)

NODE_ENV - Environment mode (development/production)

🤝 Contributing
Development Workflow
Fork the repository

Create feature branch: git checkout -b feature/new-game-type

Implement changes

Test with multiple clients

Submit pull request

Code Standards
Use consistent naming conventions

Document new game types

Include example implementations

Test with multiple concurrent users

📝 Changelog
v1.0.0
Initial release

Room-based multiplayer framework

Four built-in game types

Extensible architecture

Real-time synchronization

📄 License
MIT License

Copyright (c) 2025 kingmuli

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

👥 Team
This framework was developed by a collaborative team specializing in:

Backend Development: Server architecture, Socket.io, room management

Frontend Development: UI/UX, Three.js integration, client framework

Game Design: Game mechanics, user experience, gameplay loops

Network Engineering: Real-time synchronization, performance optimization

