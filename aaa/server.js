// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;

const mimeTypes = {
    '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
    '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpg', '.gif': 'image/gif',
    '.mp3': 'audio/mpeg', 
    '.wav': 'audio/wav',
    '.mov': 'video/quicktime',
    '.mp4': 'video/mp4'
};

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'ngrok-skip-browser-warning, Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    let filePath = '.' + req.url;
    if (filePath === './') filePath = './index.html';

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

const rooms = {};

io.on('connection', (socket) => {
    socket.on('create_room', (data) => {
        const roomId = Math.random().toString(36).substring(2, 6).toUpperCase();
        rooms[roomId] = {
            id: roomId,
            host: socket.id,
            hostUserId: data.userId,
            gameStarted: false,
            slots: [
                { id: socket.id, userId: data.userId, type: 'host', name: data.name, icon: data.icon, ready: true, connected: true }
            ],
            settings: {}
        };
        socket.join(roomId);
        socket.roomId = roomId;
        socket.emit('room_created', rooms[roomId]);
    });

    socket.on('join_room', (data) => {
        const room = rooms[data.roomId];
        if (room && !room.gameStarted) {
            const emptySlot = room.slots.find(s => s.type === 'empty');
            if (emptySlot) {
                emptySlot.id = socket.id;
                emptySlot.userId = data.userId;
                emptySlot.type = 'player';
                emptySlot.name = data.name;
                emptySlot.icon = data.icon;
                emptySlot.ready = false;
                emptySlot.connected = true;
                socket.join(data.roomId);
                socket.roomId = data.roomId;
                socket.emit('joined_room', room);
                io.to(data.roomId).emit('room_state_update', room);
            } else {
                socket.emit('error_message', '部屋が満員です');
            }
        } else if (room && room.gameStarted) {
            const existingSlot = room.slots.find(s => s.userId === data.userId && !s.connected);
            if (existingSlot) {
                existingSlot.id = socket.id;
                existingSlot.connected = true;
                socket.join(data.roomId);
                socket.roomId = data.roomId;
                socket.emit('joined_room', room);
                io.to(data.roomId).emit('room_state_update', room);
                io.to(room.host).emit('player_reconnected', { oldId: existingSlot.id, newId: socket.id });
            } else {
                socket.emit('error_message', 'ゲームは既に開始されています');
            }
        } else {
            socket.emit('error_message', '部屋が見つかりません');
        }
    });

    socket.on('add_slot', () => {
        const room = rooms[socket.roomId];
        if (room && room.host === socket.id && room.slots.length < 8 && !room.gameStarted) {
            room.slots.push({ id: null, userId: null, type: 'empty', name: '空き枠', icon: null, ready: false, connected: false });
            io.to(socket.roomId).emit('room_state_update', room);
        }
    });

    socket.on('toggle_ready', (data) => {
        const room = rooms[socket.roomId];
        if (room) {
            const slot = room.slots.find(s => s.userId === data.userId);
            if (slot && slot.type === 'player') {
                slot.ready = !slot.ready;
                io.to(socket.roomId).emit('room_state_update', room);
            }
        }
    });

    socket.on('update_settings', (settings) => {
        const room = rooms[socket.roomId];
        if (room && room.host === socket.id) {
            room.settings = settings;
            socket.to(socket.roomId).emit('settings_updated', settings);
        }
    });

    socket.on('start_game', () => {
        const room = rooms[socket.roomId];
        if (room && room.host === socket.id) {
            room.gameStarted = true;
            io.to(socket.roomId).emit('game_started', room);
        }
    });

    socket.on('sync_game_state', (state) => socket.to(socket.roomId).emit('sync_game_state', state));
    socket.on('player_action', (data) => {
        const room = rooms[socket.roomId];
        if (room) io.to(room.host).emit('receive_player_action', data);
    });

    socket.on('request_play_animation', (data) => io.to(socket.roomId).emit('play_animation', data));
    socket.on('request_draw_animation', (data) => io.to(socket.roomId).emit('draw_animation', data));
    socket.on('request_color_select', (playerId) => io.to(playerId).emit('show_color_selector'));
    socket.on('declare_uno', (data) => io.to(socket.roomId).emit('broadcast_uno', data));
    
    socket.on('send_chat', (data) => io.to(data.roomId).emit('receive_chat', data));
    socket.on('announce_win', (data) => io.to(socket.roomId).emit('game_over', data));
    socket.on('announce_draw', () => io.to(socket.roomId).emit('game_over', { isDraw: true }));

    socket.on('return_to_lobby', () => {
        const room = rooms[socket.roomId];
        if (room && room.host === socket.id) {
            room.gameStarted = false;
            room.slots.forEach(s => { if (s.type === 'player') s.ready = false; });
            io.to(socket.roomId).emit('back_to_lobby', room);
        }
    });

    socket.on('disconnect', () => {
        const roomId = socket.roomId;
        if (roomId && rooms[roomId]) {
            const room = rooms[roomId];
            const slot = room.slots.find(s => s.id === socket.id);
            if (slot) slot.connected = false;

            // ★修正: ホストが落ちた場合、別のプレイヤーにホスト権限を移行する
            if (room.host === socket.id) {
                const newHostSlot = room.slots.find(s => s.type === 'player' && s.connected);
                if (newHostSlot) {
                    room.host = newHostSlot.id;
                    newHostSlot.type = 'host';
                    newHostSlot.ready = true;
                    io.to(roomId).emit('room_state_update', room);
                    io.to(roomId).emit('receive_chat', { senderName: 'システム', message: `${newHostSlot.name} が新しいホストになりました。` });
                } else {
                    io.to(roomId).emit('error_message', '全員が退出したため部屋を解散しました'); 
                    delete rooms[roomId];
                }
            } else {
                if (!room.gameStarted && slot) {
                    const slotIndex = room.slots.indexOf(slot);
                    room.slots[slotIndex] = { id: null, userId: null, type: 'empty', name: '空き枠', icon: null, ready: false, connected: false };
                }
                io.to(roomId).emit('room_state_update', room);
            }
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
});