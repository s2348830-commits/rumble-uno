// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');

// サーバー側でゲームロジックを読み込む
const { UNORules } = require('./rule.js');
const { AbilityDef, AbilityEngine } = require('./ability.js');
const { UNOGame } = require('./game.js');
const { UNOBot } = require('./bot.js');

const PORT = process.env.PORT || 3000;

const mimeTypes = {
    '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
    '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpg', '.gif': 'image/gif',
    '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.mov': 'video/quicktime', '.mp4': 'video/mp4'
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

// サーバー側からの状態同期用関数
function broadcastGameState(roomId, attackGuides = []) {
    const room = rooms[roomId];
    if (!room || !room.game) return;
    
    const playersInfo = room.game.players.map(p => ({ 
        id: p.id, connected: p.connected, frozen: p.frozen, burnTurns: p.burnTurns, 
        invincibleTurns: p.invincibleTurns, shield: p.shield, evasion: p.evasion, usedRaia: p.usedRaia 
    }));
    
    const state = {
        deck: room.game.deck, turnIndex: room.game.turnIndex, direction: room.game.direction,
        hands: room.game.hands, discardPile: room.game.discardPile, discardRotations: room.game.discardRotations,
        drawStack: room.game.drawStack, currentColor: room.game.currentColor, playersInfo: playersInfo,
        hasDrawnThisTurn: room.game.hasDrawnThisTurn,
        defensePhase: room.game.pendingDefense ? room.game.pendingDefense.info : null,
        defenseTimer: room.game.pendingDefense ? room.game.pendingDefense.timer : 0,
        attackGuides: attackGuides,
        abilityGraveyard: room.game.abilityGraveyard,
        jankenPhase: room.game.pendingJanken,
        customDeck: room.game.customDeck 
    };
    
    io.to(roomId).emit('update_game_state', state);
}

io.on('connection', (socket) => {
    socket.on('create_room', (userData) => {
        const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        rooms[roomId] = {
            id: roomId, host: socket.id, gameStarted: false,
            slots: [{ id: socket.id, userId: userData.userId, type: 'host', name: userData.name, icon: userData.icon, ready: true, connected: true }],
            settings: null,
            game: new UNOGame() // サーバー側でゲームを管理
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

                // ゲーム中の復帰処理
                if (room.gameStarted && room.game) {
                    const p = room.game.players.find(p => p.id === oldId);
                    if (p) p.id = socket.id;
                    if (room.game.hands[oldId]) {
                        room.game.hands[socket.id] = room.game.hands[oldId];
                        delete room.game.hands[oldId];
                    }
                }

                socket.emit('room_joined', { roomId, isHost: isHostUser, myId: socket.id, state: room });
                socket.to(roomId).emit('player_reconnected', { oldId, newId: socket.id, newName: userData.name, newIcon: userData.icon });
                
                if (room.gameStarted) broadcastGameState(roomId);
                else io.to(roomId).emit('room_state_update', room);

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
                room.slots[index] = { 
                    id: 'bot_' + Math.random().toString(36).substring(2), 
                    userId: 'bot_user_' + Math.random(), 
                    type: 'bot', name: botNames[Math.floor(Math.random() * botNames.length)], icon: botIcons[0], 
                    ready: true, connected: true, personality: personalities[Math.floor(Math.random() * personalities.length)], difficulty: '普通' 
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

    // ゲーム開始（サーバー主導）
    socket.on('start_game', () => {
        const room = rooms[socket.roomId];
        if (room && room.host === socket.id && !room.gameStarted) {
            const allReady = room.slots.filter(s => s.type === 'player').every(s => s.ready);
            if (allReady) {
                room.gameStarted = true;
                room.game.setup(room.slots, room.settings);
                room.game.start();
                
                // 送信時にはgameインスタンス全体を送らない（クライアントにはdeckやhandsだけ送る）
                const stateToSend = { ...room, game: undefined };
                io.to(socket.roomId).emit('game_started', stateToSend);
                broadcastGameState(socket.roomId);
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

    // クライアントからのアクション（プレイ・ドローなど）をサーバーで処理
    socket.on('player_action', (data) => {
        const room = rooms[socket.roomId];
        if (!room || !room.gameStarted) return;
        const game = room.game;
        const playerId = socket.id;

        if (data.action === 'play') {
            io.to(socket.roomId).emit('play_animation', { playerId: playerId, cards: data.cards });
            const result = game.playCards(playerId, data.indices, room.settings);
            if (result.success) {
                // 能力等の解決ロジックをここに組み込む（今回はgame.js内で完結させる設計に寄せます）
                if (result.lastCard.color === 'black') {
                    io.to(playerId).emit('show_color_selector');
                }
            }
            broadcastGameState(socket.roomId);
        } else if (data.action === 'play_ability') {
            io.to(socket.roomId).emit('play_animation', { playerId: playerId, cards: data.cards, isHV: data.isHV });
            // ここで AbilityEngine.resolve などを呼び出す
            broadcastGameState(socket.roomId);
        } else if (data.action === 'draw') {
            io.to(socket.roomId).emit('draw_animation', { playerId: playerId, count: data.count });
            for(let i=0; i<data.count; i++) game.drawCard(playerId);
            broadcastGameState(socket.roomId);
        } else if (data.action === 'end_turn') {
            game.nextTurn(1);
            broadcastGameState(socket.roomId);
        } else if (data.action === 'color') {
            game.currentColor = data.color;
            game.nextTurn(1);
            broadcastGameState(socket.roomId);
        }
    });

    socket.on('janken_choice', (data) => {
        const room = rooms[socket.roomId];
        if (!room || !room.gameStarted || !room.game || !room.game.pendingJanken) return;

        const janken = room.game.pendingJanken;

        // プレイヤーの選択を記録
        if (socket.id === janken.attackerId) janken.attackerHand = data.choice;
        if (socket.id === janken.targetId) janken.targetHand = data.choice;

        // 両者の手が揃ったら勝敗判定
        if (janken.attackerHand && janken.targetHand) {
            const aHand = janken.attackerHand;
            const tHand = janken.targetHand;
            let result = ''; // attacker視点

            if (aHand === tHand) result = 'draw';
            else if ((aHand === 'gu' && tHand === 'choki') || 
                     (aHand === 'choki' && tHand === 'pa') || 
                     (aHand === 'pa' && tHand === 'gu')) {
                result = 'win';
            } else {
                result = 'lose';
            }

            janken.result = result;
            const AbilityEngineObj = require('./ability.js').AbilityEngine;

            // アニメーション用に一旦結果をブロードキャスト
            broadcastGameState(socket.roomId);

            // 演出待ちをしてから結果を適用
            setTimeout(() => {
                // 初回は結果に関わらずターゲットが2ドロー
                if (janken.loopCount === 1) {
                    AbilityEngineObj.applyDraw(room.game, janken.targetId, 2, false);
                } 
                // 2回目以降で勝った場合はターゲットが2ドロー
                else if (result === 'win') {
                    AbilityEngineObj.applyDraw(room.game, janken.targetId, 2, false);
                }

                // 勝った場合で、まだ最大回数(4回)に達していないなら再戦（ループ）
                if (result === 'win' && janken.loopCount < 4) {
                    janken.loopCount++;
                    janken.attackerHand = null;
                    janken.targetHand = null;
                    janken.result = null;
                } else {
                    // 負けた、あいこ、または最大回数に達した場合はループ終了
                    room.game.pendingJanken = null;
                }
                
                // 次のフェーズへ状態を更新して送信（ここで pendingJanken が null ならクライアント側のUIが消える）
                broadcastGameState(socket.roomId);
            }, 3000); // 3秒間結果を表示してから次の処理へ（時間はUIに合わせて調整してください）
        }
    });

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
                        broadcastGameState(roomId);
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
    console.log(`✅ サーバー主導(Authoritative) UNO サーバー起動！`);
    console.log(`http://localhost:${PORT}`);
    console.log('===================================================');
});