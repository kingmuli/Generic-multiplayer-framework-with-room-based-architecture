# MultiFramework 🎮

A **generic multiplayer framework** for building various real-time collaborative applications and games.

## 🚀 Features

- **Room-based multiplayer** - Create/join rooms with different game types
- **Generic event system** - Flexible communication between clients
- **Multiple game types** - Built-in support for various game modes
- **Extensible architecture** - Easy to add new game types
- **Real-time synchronization** - Automatic state management
- **Cross-platform** - Works on any device with a web browser

## 📚 Built-in Examples

1. **Hide & Seek Game** - Minecraft-style treasure hunt
2. **Chat Room** - Real-time messaging with rooms
3. **Drawing Game** - Collaborative drawing board
4. **Generic Framework** - Base for your custom games

## 🛠 Quick Start

```bash
# Clone and install
git clone <your-repo-url>
cd multiframework
npm install

# Start server
npm start

# Access the framework
http://localhost:3000
🎯 Usage Examples
Join a Room
javascript
socket.emit('joinRoom', {
    roomId: 'game-room-1',
    gameType: 'hideAndSeek',
    playerData: {
        name: 'Player1',
        color: '#FF0000',
        position: { x: 0, y: 0, z: 0 }
    }
});
Send Room Actions
javascript
socket.emit('roomAction', {
    roomId: 'game-room-1',
    action: 'movePlayer',
    payload: { x: 10, y: 0, z: 5 }
});
Update Player Data
javascript
socket.emit('playerUpdate', {
    health: 100,
    score: 150,
    position: { x: 5, y: 2, z: 8 }
});
🏗 Architecture
text
Client Apps
    ↓
MultiFramework Server
    ↓
Game Types → Rooms → Players
    ↓
Real-time Events & State
🔧 API Reference
Server Events
joinRoom - Join or create a room

leaveRoom - Leave current room

roomAction - Send action to room

playerUpdate - Update player data

message - Send chat message

Client Events
roomJoined - Successfully joined room

playerJoined - New player joined

playerLeft - Player left room

roomAction - Action received from room

playerUpdated - Player data updated

message - Chat message received

🌐 Network Access
Share your network URL (shown in console) for local multiplayer:

text
http://YOUR_LOCAL_IP:3000
🎮 Creating Custom Games
Define game logic in server.js

Register game type in framework

Create client interface in public/examples/

Handle events between clients

👥 Team Development
This framework supports multiple team members working on different game types simultaneously without conflicts.
