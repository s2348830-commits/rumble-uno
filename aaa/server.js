// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');

const PORT = 3000;

const mimeTypes = {
    '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
    '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpg', '.gif': 'image/gif',
    '.mp3': 'audio/mpeg', 
    '.wav': 'audio/wav',
    '.mov': 'video/quicktime', // ★ 追加: movファイルを許可
    '.mp4': 'video/mp4'
};

const server = http.createServer((req, res) => {
    // ★ 追加: ngrokのヘッダー通信を許可するCORS設定（403エラー対策）
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'ngrok-skip-browser-warning, Content-Type');
    
    // ブラウザからの事前確認(OPTIONS)にはOK(204)を返す
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    let filePath = '.' + req.url.split('?')[0];
    
    if (filePath === './') filePath = './index.html';
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') { 
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }); 
                res.end('<h1>404 Not Found</h1>', 'utf-8'); 
            } 
            else { 
                res.writeHead(500); 
                res.end('Server Error: ' + error.code + ' ..\n'); 
            }
        } else { 
            res.writeHead(200, { 'Content-Type': contentType }); 
            res.end(content); 
        }
    });
});

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

let rooms = {};

io.on('connection', (socket) => {
    socket.on('create_room', (userData) => {
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        rooms[roomId] = {
            id: roomId, host: socket.id, gameStarted: false,
            slots: [{ id: socket.id, userId: userData.userId, type: 'host', name: userData.name, icon: userData.icon, ready: true, connected: true }],
            settings: null 
        };
        socket.join(roomId);
        socket.roomId = roomId; socket.userId = userData.userId;
        socket.emit('room_joined', { roomId, isHost: true, myId: socket.id, state: rooms[roomId] });
    });

    socket.on('join_room', ({ roomId, userData }) => {
        const room = rooms[roomId];
        if (room) {
            let slot = room.slots.find(s => s.userId === userData.userId);
            let myId = slot ? slot.id : socket.id;

            if (slot) {
                const oldId = slot.id; slot.id = socket.id; slot.connected = true; slot.name = userData.name; slot.icon = userData.icon; myId = socket.id;
                socket.roomId = roomId; socket.userId = userData.userId; socket.join(roomId);
                
                const isHostUser = (slot.type === 'host');
                if (isHostUser) room.host = socket.id;

                socket.emit('room_joined', { roomId, isHost: isHostUser, myId: socket.id, state: room });
                socket.to(roomId).emit('player_reconnected', { oldId, newId: socket.id, newName: userData.name, newIcon: userData.icon });
                io.to(roomId).emit('room_state_update', room);
            } else if (!room.gameStarted) {
                const emptySlotIndex = room.slots.findIndex(s => s.type === 'empty');
                if (emptySlotIndex !== -1) {
                    room.slots[emptySlotIndex] = { id: socket.id, userId: userData.userId, type: 'player', name: userData.name, icon: userData.icon, ready: false, connected: true };
                } else if (room.slots.length < 10) {
                    room.slots.push({ id: socket.id, userId: userData.userId, type: 'player', name: userData.name, icon: userData.icon, ready: false, connected: true });
                } else {
                    socket.emit('error_message', 'ルームが満員です'); return;
                }
                socket.roomId = roomId; socket.userId = userData.userId; socket.join(roomId);
                socket.emit('room_joined', { roomId, isHost: false, myId: socket.id, state: room });
                io.to(roomId).emit('room_state_update', room);
            } else { socket.emit('error_message', 'ゲームはすでに開始されています'); }
        } else { socket.emit('error_message', 'ルームが見つかりません'); }
    });

    socket.on('add_slot', () => {
        const room = rooms[socket.roomId];
        if (room && room.host === socket.id && room.slots.length < 10) {
            room.slots.push({ id: null, userId: null, type: 'empty', name: '空き枠', icon: null, ready: false, connected: false });
            io.to(socket.roomId).emit('room_state_update', room);
        }
    });

    socket.on('remove_slot', (index) => {
        const room = rooms[socket.roomId];
        if (room && room.host === socket.id && index > 0 && index < room.slots.length) {
            const removed = room.slots.splice(index, 1)[0];
            if (removed.type === 'player' && removed.id) {
                const targetSocket = io.sockets.sockets.get(removed.id);
                if (targetSocket) { targetSocket.leave(socket.roomId); targetSocket.emit('kicked_from_room'); }
            }
            io.to(socket.roomId).emit('room_state_update', room);
        }
    });

    socket.on('toggle_bot', (index) => {
        const room = rooms[socket.roomId];
        if (room && room.host === socket.id && index > 0 && index < room.slots.length) {
            const slot = room.slots[index];
            const botNames = ['Bot 太郎', 'Bot 花子', 'Bot 一郎', 'Bot 次郎'];
            const botIcons = ['data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23f44336\'%3E%3Cpath d=\'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z\'/%3E%3C/svg%3E'];
            const personalities = ['破天荒', '慎重', '攻撃的', '統制'];

            if (slot.type === 'empty') {
                const randomPersonality = personalities[Math.floor(Math.random() * personalities.length)];
                room.slots[index] = { 
                    id: 'bot_' + Math.random().toString(36).substring(2), 
                    userId: 'bot_user_' + Math.random(), 
                    type: 'bot', 
                    name: botNames[Math.floor(Math.random() * botNames.length)], 
                    icon: botIcons[0], 
                    ready: true, 
                    connected: true,
                    personality: randomPersonality,
                    difficulty: '普通' 
                };
            } else if (slot.type === 'bot') {
                room.slots[index] = { id: null, userId: null, type: 'empty', name: '空き枠', icon: null, ready: false, connected: false };
            }
            io.to(socket.roomId).emit('room_state_update', room);
        }
    });

    socket.on('change_bot_difficulty', (data) => {
        const room = rooms[socket.roomId];
        if (room && room.host === socket.id && data.index > 0 && data.index < room.slots.length) {
            const slot = room.slots[data.index];
            if (slot && slot.type === 'bot') {
                slot.difficulty = data.difficulty;
                io.to(socket.roomId).emit('room_state_update', room);
            }
        }
    });

    socket.on('toggle_ready', (data) => {
        const rId = (data && data.roomId) ? data.roomId : socket.roomId;
        const uId = (data && data.userId) ? data.userId : socket.userId;
        const room = rooms[rId];
        
        if (room && !room.gameStarted) {
            const slot = room.slots.find(s => s.userId === uId || s.id === socket.id);
            if (slot && slot.type === 'player') {
                slot.ready = !slot.ready;
                io.to(rId).emit('room_state_update', room);
            }
        }
    });

    socket.on('update_settings', (newSettings) => {
        const room = rooms[socket.roomId];
        if (room && room.host === socket.id) {
            room.settings = newSettings;
            socket.to(socket.roomId).emit('settings_updated', newSettings);
        }
    });

    socket.on('disband_room', () => {
        const room = rooms[socket.roomId];
        if (room && room.host === socket.id) {
            io.to(socket.roomId).emit('room_disbanded');
            delete rooms[socket.roomId];
        }
    });

    socket.on('start_game', () => {
        const room = rooms[socket.roomId];
        if (room && room.host === socket.id && !room.gameStarted) {
            const allReady = room.slots.filter(s => s.type === 'player').every(s => s.ready);
            if (allReady) {
                room.gameStarted = true;
                io.to(socket.roomId).emit('game_started', room);
            }
        }
    });

    socket.on('return_to_lobby', () => {
        const room = rooms[socket.roomId];
        if (room && room.host === socket.id) {
            room.gameStarted = false;
            room.slots.forEach(s => { if (s.type === 'player') s.ready = false; });
            io.to(socket.roomId).emit('back_to_lobby', room);
        }
    });

    socket.on('sync_game_state', (state) => socket.to(socket.roomId).emit('update_game_state', state));
    socket.on('request_sync_state', () => {
        const room = rooms[socket.roomId];
        if (room && room.host) io.to(room.host).emit('force_sync_state');
    });

    socket.on('player_action', (data) => {
        const room = rooms[socket.roomId];
        if (room && room.host) {
            data.playerId = socket.id;
            io.to(room.host).emit('receive_player_action', data);
        }
    });

    socket.on('declare_uno', (data) => io.to(socket.roomId).emit('broadcast_uno', data));
    socket.on('request_play_animation', (data) => io.to(socket.roomId).emit('play_animation', data));
    socket.on('request_draw_animation', (data) => io.to(socket.roomId).emit('draw_animation', data));
    socket.on('request_color_select', (targetId) => io.to(targetId).emit('show_color_selector'));
    
    socket.on('send_chat', (data) => {
        io.to(data.roomId).emit('receive_chat', data);
    });

    socket.on('announce_win', (data) => io.to(socket.roomId).emit('game_over', data));
    socket.on('announce_draw', () => io.to(socket.roomId).emit('game_over', { isDraw: true }));

    socket.on('disconnect', () => {
        const roomId = socket.roomId;
        if (roomId && rooms[roomId]) {
            const room = rooms[roomId];
            if (room.host === socket.id) {
                io.to(roomId).emit('error_message', 'ホストが退出しました'); delete rooms[roomId];
            } else {
                const slot = room.slots.find(s => s.id === socket.id);
                if (slot) {
                    if (room.gameStarted) {
                        slot.connected = false;
                        io.to(roomId).emit('room_state_update', room);
                    } else {
                        const slotIndex = room.slots.indexOf(slot);
                        room.slots[slotIndex] = { id: null, userId: null, type: 'empty', name: '空き枠', icon: null, ready: false, connected: false };
                        io.to(roomId).emit('room_state_update', room);
                    }
                }
            }
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('===================================================');
    console.log(`✅ サーバー起動！`);
    console.log(`http://localhost:3000`);
    console.log('===================================================');
});