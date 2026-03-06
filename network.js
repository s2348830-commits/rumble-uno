/**
 * network.js
 */
window.socket = io({
    reconnectionAttempts: 5, timeout: 10000, transports: ['websocket', 'polling'],
    extraHeaders: { "ngrok-skip-browser-warning": "true" }
});

window.isHost = false; window.myId = null; window.currentRoomState = null;
window.clientUserId = sessionStorage.getItem('uno_userid') || Math.random().toString(36).substr(2, 9);
sessionStorage.setItem('uno_userid', window.clientUserId);

const DEFAULT_ICON = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
let myData = { name: '', icon: null, userId: window.clientUserId }; window.myData = myData;

const splashScreen = document.getElementById('splash-screen');
const nameInput = document.getElementById('player-name');
const iconInput = document.getElementById('icon-upload');
const btnCreateRoom = document.getElementById('btn-create-room');
const btnShowJoin = document.getElementById('btn-show-join');
const joinContainer = document.getElementById('join-room-container');
const btnJoinRoom = document.getElementById('btn-join-room');
const roomIdInput = document.getElementById('room-id-input');
const loginScreen = document.getElementById('login-screen');
const lobbyScreen = document.getElementById('lobby-screen');
const gameContainer = document.getElementById('game-container');
const startOverlay = document.getElementById('start-overlay');
const btnStart = document.getElementById('btn-start');
const slotList = document.getElementById('slot-list');

function proceedToLogin() {
    if (splashScreen.classList.contains('hidden')) return;
    splashScreen.classList.add('hidden'); loginScreen.classList.remove('hidden');
    if (window.SE) window.SE.play('touch_to_start');
}
splashScreen.addEventListener('click', proceedToLogin);
splashScreen.addEventListener('touchstart', proceedToLogin, { passive: true });

nameInput.addEventListener('input', (e) => {
    myData.name = e.target.value.trim();
    const disabled = myData.name.length === 0;
    btnCreateRoom.disabled = disabled; btnShowJoin.disabled = disabled;
    btnCreateRoom.classList.toggle('disabled-btn', disabled); btnShowJoin.classList.toggle('disabled-btn', disabled);
});
roomIdInput.addEventListener('input', (e) => { e.target.value = e.target.value.toUpperCase(); });
iconInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
                const MAX_SIZE = 100; let width = img.width; let height = img.height;
                if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } 
                else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
                canvas.width = width; canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                myData.icon = canvas.toDataURL('image/jpeg', 0.8);
                document.getElementById('preview-icon').src = myData.icon;
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

btnCreateRoom.addEventListener('click', () => window.socket.emit('create_room', myData));
btnShowJoin.addEventListener('click', () => joinContainer.classList.remove('hidden'));
btnJoinRoom.addEventListener('click', () => {
    const roomId = roomIdInput.value.trim().toUpperCase();
    if (roomId) window.socket.emit('join_room', { roomId, userData: myData });
});

document.getElementById('btn-disband-room').addEventListener('click', () => {
    if(confirm("ルームを解散しますか？")) window.socket.emit('disband_room');
});

window.applySettingsToUI = function(newSettings) {
    if (!newSettings) return;
    if (window.RuleSettings) Object.assign(window.RuleSettings, newSettings);
    // ... UIへの値セットロジック ... (既存のまま)
};

window.socket.on('room_joined', (data) => {
    window.isHost = data.isHost; window.myId = data.myId; window.currentRoomState = data.state;
    loginScreen.classList.add('hidden'); lobbyScreen.classList.remove('hidden');
    document.getElementById('display-room-id').innerText = data.roomId;

    if (window.isHost) {
        document.getElementById('btn-add-slot').classList.remove('hidden'); 
        btnStart.classList.remove('hidden'); 
        document.getElementById('btn-disband-room').classList.remove('hidden'); 
    } else {
        document.getElementById('btn-ready').classList.remove('hidden'); 
        document.getElementById('btn-disband-room').classList.add('hidden');
        if (data.state && data.state.settings) window.applySettingsToUI(data.state.settings);
    }
    
    if(data.state && data.state.gameStarted) {
        lobbyScreen.classList.add('hidden'); gameContainer.classList.remove('hidden');
        if (window.game) window.game.setup(data.state.slots, data.state.settings);
    } else {
        renderSlots(data.state);
    }
});

window.socket.on('room_state_update', (roomState) => {
    window.currentRoomState = roomState;
    if (!window.isHost && roomState.settings) window.applySettingsToUI(roomState.settings);
    if(!roomState.gameStarted) renderSlots(roomState);
});

window.socket.on('player_reconnected', (data) => {
    // クライアント側でもIDの差し替えは行うが、状態同期はサーバーからの update_game_state に任せる
    if (window.game && window.game.players) {
        const p = window.game.players.find(p => p.id === data.oldId);
        if (p) { p.id = data.newId; p.connected = true; }
        if (window.game.hands && window.game.hands[data.oldId]) { 
            window.game.hands[data.newId] = window.game.hands[data.oldId]; delete window.game.hands[data.oldId]; 
        }
    }
});

window.socket.on('room_disbanded', () => { alert("ホストがルームを解散しました。"); location.reload(); });
window.socket.on('error_message', (msg) => { alert(msg); if (msg === 'ホストが退出しました') location.reload(); });

function renderSlots(roomState) {
    slotList.innerHTML = '';
    let allPlayersReady = true;
    roomState.slots.forEach((slot, index) => {
        const div = document.createElement('div'); div.className = 'slot-item';
        const infoDiv = document.createElement('div'); infoDiv.className = 'slot-info';
        const img = document.createElement('img'); img.className = 'slot-icon'; img.src = slot.icon || DEFAULT_ICON;
        const nameSpan = document.createElement('span'); nameSpan.className = 'slot-name'; nameSpan.innerText = slot.name;
        const statusSpan = document.createElement('span'); statusSpan.className = 'slot-status';
        
        if (slot.type === 'host') statusSpan.innerText = 'ホスト';
        else if (slot.type === 'player') { statusSpan.innerText = slot.ready ? '準備完了' : '準備中'; if(!slot.ready) allPlayersReady = false; }
        else if (slot.type === 'bot') { statusSpan.innerText = 'Bot'; }
        else statusSpan.innerText = '空き';

        infoDiv.appendChild(img); infoDiv.appendChild(nameSpan); infoDiv.appendChild(statusSpan);
        if (window.isHost && (slot.type === 'empty' || slot.type === 'bot')) infoDiv.onclick = () => window.socket.emit('toggle_bot', index);
        div.appendChild(infoDiv);
        slotList.appendChild(div);
    });
    if (window.isHost) { btnStart.disabled = !allPlayersReady; }
}

document.getElementById('btn-add-slot').addEventListener('click', () => window.socket.emit('add_slot'));
document.getElementById('btn-ready').addEventListener('click', () => window.socket.emit('toggle_ready', { roomId: window.currentRoomState.id, userId: window.clientUserId }));
document.getElementById('btn-settings').addEventListener('click', () => { startOverlay.classList.remove('hidden'); });
document.getElementById('close-settings-btn').addEventListener('click', () => { startOverlay.classList.add('hidden'); });

window.sendSettingsUpdate = () => { if (window.isHost) window.socket.emit('update_settings', window.RuleSettings); };
btnStart.addEventListener('click', () => { btnStart.disabled = true; window.socket.emit('start_game'); });

window.socket.on('game_started', (roomState) => {
    window.currentRoomState = roomState; window.isInitialDealing = true; 
    lobbyScreen.classList.add('hidden'); startOverlay.classList.add('hidden'); gameContainer.classList.remove('hidden');
    if (window.game) window.game.setup(roomState.slots, roomState.settings);
    window.isGameOver = false; 
});

// サーバーからの全体状態同期（ゲーム進行の要）
window.socket.on('update_game_state', (state) => {
    if (!window.game) return;
    window.game.deck = state.deck; window.game.turnIndex = state.turnIndex; window.game.direction = state.direction; 
    window.game.discardPile = state.discardPile; window.game.discardRotations = state.discardRotations; 
    window.game.drawStack = state.drawStack; window.game.currentColor = state.currentColor;
    window.game.hasDrawnThisTurn = state.hasDrawnThisTurn; window.game.abilityGraveyard = state.abilityGraveyard;
    window.game.customDeck = state.customDeck; window.game.hands = state.hands;
    
    if (state.playersInfo) {
        let newPlayers = [];
        state.playersInfo.forEach(info => {
            let p = window.game.players.find(x => x.id === info.id);
            if (p) { 
                Object.assign(p, info); // ステータスを丸ごとコピー
                newPlayers.push(p);
            }
        });
        if (newPlayers.length === window.game.players.length) window.game.players = newPlayers; 
    }

    if (typeof window.updateUI === 'function') window.updateUI(); 

    const current = window.game.players[window.game.turnIndex];
    const msgEl = document.getElementById('status-message');
    if (current) {
        msgEl.innerText = current.id === window.myId ? `あなたの番です` : `${current.name} のターン`;
    }

    if (state.attackGuides && state.attackGuides.length > 0) {
        state.attackGuides.forEach(g => { if (typeof window.showAttackGuide === 'function') window.showAttackGuide(g.from, g.to, g.text, g.se); });
    }
    if (typeof window.updatePhaseUI === 'function') window.updatePhaseUI(state);
});

window.socket.on('play_animation', (data) => {
    if (data.playerId !== window.myId) {
        if (typeof window.playOpponentAnimation === 'function') window.playOpponentAnimation(data.playerId, data.cards);
        if (data.cards && data.cards.length > 0 && data.cards[0].value && String(data.cards[0].value).startsWith('id_')) {
            if (typeof window.showAbilityCutin === 'function') window.showAbilityCutin(data.cards[0].value, data.isHV); 
        }
    }
});

window.socket.on('draw_animation', (data) => {
    if (data.playerId !== window.myId) {
        if (typeof window.drawOpponentAnimation === 'function') window.drawOpponentAnimation(data.playerId, data.count);
    }
});

window.socket.on('show_color_selector', () => { if (typeof ColorUI !== 'undefined') ColorUI.show(); });
window.socket.on('game_over', (data) => {
    window.isGameOver = true;
    if (data.isDraw) {
        document.getElementById('winner-banner').innerText = "DRAW"; document.getElementById('winner-banner').classList.add('show');
    } else {
        document.getElementById('winner-banner').innerText = `${data.winnerName} が勝ちました。`; document.getElementById('winner-banner').classList.add('show');
    }
    setTimeout(() => { if (window.isHost) window.socket.emit('return_to_lobby'); }, 8000);
});

window.socket.on('back_to_lobby', (roomState) => {
    window.currentRoomState = roomState; window.isGameOver = false; window.isInitialDealing = false;
    document.getElementById('winner-banner').classList.remove('show');
    gameContainer.classList.add('hidden'); lobbyScreen.classList.remove('hidden');
    renderSlots(roomState);
});