/**
 * network.js
 */

window.socket = io({
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    timeout: 20000,
    transports: ['polling', 'websocket'],
    extraHeaders: {
        "ngrok-skip-browser-warning": "true"
    }
});

window.isHost = false;
window.myId = null;
window.currentRoomState = null;

window.clientUserId = sessionStorage.getItem('uno_userid');
if (!window.clientUserId) {
    window.clientUserId = Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('uno_userid', window.clientUserId);
}

const DEFAULT_ICON = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
let myData = { name: '', icon: null, userId: window.clientUserId };
window.myData = myData;

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
    splashScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    if (window.SE) window.SE.play('touch_to_start');
}

splashScreen.addEventListener('click', proceedToLogin);
splashScreen.addEventListener('touchstart', proceedToLogin, { passive: true });

nameInput.addEventListener('input', (e) => {
    myData.name = e.target.value.trim();
    const disabled = myData.name.length === 0;
    btnCreateRoom.disabled = disabled;
    btnShowJoin.disabled = disabled;
    btnCreateRoom.classList.toggle('disabled-btn', disabled);
    btnShowJoin.classList.toggle('disabled-btn', disabled);
});

roomIdInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase();
});

iconInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const MAX_SIZE = 100;
                let width = img.width;
                let height = img.height;
                if (width > height) { if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; } } 
                else { if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; } }
                canvas.width = width;
                canvas.height = height;
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
    if(confirm("ルームを解散しますか？全員が退出します。")) {
        window.socket.emit('disband_room');
    }
});

window.applySettingsToUI = function(newSettings) {
    if (!newSettings) return;
    if (window.RuleSettings) Object.assign(window.RuleSettings, newSettings);
    
    const map = {
        'initialHandSize': 'setting-initial-hand', 'unoPenalty': 'setting-uno-penalty',
        'maxMultiPlay': 'setting-max-multi', 'maxDrawMultiPlay': 'setting-max-draw-multi',
        'actionFinishPenalty': 'setting-action-finish-penalty', 'abilityFinishPenalty': 'setting-ability-finish-penalty',
        'initialCustomHandSize': 'setting-initial-custom-hand', 'abilityResetCount': 'setting-ability-reset-count'
    };
    for (let key in map) {
        const el = document.getElementById(map[key]);
        if (el && newSettings[key] !== undefined) el.value = newSettings[key];
    }
    const checks = {
        'unoAuto': 'setting-uno-auto', 'allowActionFinish': 'setting-action-finish',
        'allowAbilityFinish': 'setting-ability-finish', 'allowDrawResponse': 'setting-draw-response',
        'optionalDraw': 'setting-optional-draw', 'showBotPersonality': 'setting-show-bot-personality',
        'randomTurnOrder': 'setting-random-turn'
    };
    for (let key in checks) {
        const el = document.getElementById(checks[key]);
        if (el && newSettings[key] !== undefined) el.checked = newSettings[key];
    }
};

window.socket.on('room_joined', (data) => {
    window.isHost = data.isHost;
    window.myId = data.myId;
    window.currentRoomState = data.state;
    loginScreen.classList.add('hidden');
    lobbyScreen.classList.remove('hidden');
    document.getElementById('display-room-id').innerText = data.roomId;

    if (window.isHost) {
        document.getElementById('btn-add-slot').classList.remove('hidden');
        btnStart.classList.remove('hidden');
        document.getElementById('btn-disband-room').classList.remove('hidden');
    } else {
        document.getElementById('btn-ready').classList.remove('hidden');
        document.getElementById('btn-disband-room').classList.add('hidden');
        if (data.state && data.state.settings) {
            window.applySettingsToUI(data.state.settings);
        }
    }
    
    if(data.state && data.state.gameStarted) {
        lobbyScreen.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        if (window.game) {
            window.game.setup(data.state.slots, data.state.settings);
            window.game.myId = window.myId;
        }
    } else {
        renderSlots(data.state);
    }
});

window.socket.on('room_state_update', (roomState) => {
    window.currentRoomState = roomState;
    if (!window.isHost && roomState.settings) {
        window.applySettingsToUI(roomState.settings);
    }
    
    if(!roomState.gameStarted) {
        renderSlots(roomState);
    } else {
        if (window.game && window.game.players) {
            window.game.players.forEach(p => {
                const slot = roomState.slots.find(s => s.id === p.id || s.userId === p.userId);
                if (slot) p.connected = slot.connected;
            });
            if (typeof window.updateUI === 'function') window.updateUI();
        }
    }
});

window.socket.on('settings_updated', (newSettings) => {
    if (!window.isHost && window.applySettingsToUI) {
        window.applySettingsToUI(newSettings);
        if (window.currentRoomState) window.currentRoomState.settings = newSettings;
    }
});

window.socket.on('player_reconnected', (data) => {
    if (window.game && window.game.players) {
        const p = window.game.players.find(p => p.id === data.oldId || p.userId === data.userId);
        if (p) {
            p.id = data.newId;
            p.connected = true;
        }
        if (window.game.hands && window.game.hands[data.oldId]) { 
            window.game.hands[data.newId] = window.game.hands[data.oldId]; 
            delete window.game.hands[data.oldId]; 
        }
    }
    if (window.isHost && window.currentRoomState && window.currentRoomState.gameStarted) {
        if (typeof window.broadcastGameState === 'function') window.broadcastGameState(true);
    }
});

window.socket.on('room_disbanded', () => {
    alert("ホストがルームを解散しました。");
    location.reload();
});

window.socket.on('error_message', (msg) => {
    alert(msg);
    if (msg === 'ホストが退出しました') location.reload();
});

function renderSlots(roomState) {
    slotList.innerHTML = '';
    let allPlayersReady = true;

    roomState.slots.forEach((slot, index) => {
        const div = document.createElement('div');
        div.className = 'slot-item';
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'slot-info';
        
        const img = document.createElement('img');
        img.className = 'slot-icon';
        img.src = slot.icon || DEFAULT_ICON;
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'slot-name';
        nameSpan.innerText = slot.name;
        
        const statusSpan = document.createElement('span');
        statusSpan.className = 'slot-status';
        
        if (slot.type === 'host') {
            statusSpan.innerText = 'ホスト';
        } else if (slot.type === 'player') {
            statusSpan.innerText = slot.ready ? '準備完了' : '準備中';
            if (!slot.ready) allPlayersReady = false;
        } else if (slot.type === 'bot') {
            statusSpan.innerText = `Bot (${slot.difficulty})`;
            if (window.isHost) {
                const diffBtn = document.createElement('button');
                diffBtn.innerText = '強さ変更';
                diffBtn.style.marginLeft = '10px';
                diffBtn.style.fontSize = '12px';
                diffBtn.onclick = (e) => {
                    e.stopPropagation();
                    const diffs = ['優しい', '普通', '強い'];
                    const next = diffs[(diffs.indexOf(slot.difficulty) + 1) % diffs.length];
                    window.socket.emit('change_bot_difficulty', { index: index, difficulty: next });
                };
                statusSpan.appendChild(diffBtn);
            }
        } else {
            statusSpan.innerText = '空き';
        }

        infoDiv.appendChild(img);
        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(statusSpan);

        if (window.isHost && (slot.type === 'empty' || slot.type === 'bot')) {
            infoDiv.onclick = () => window.socket.emit('toggle_bot', index);
            infoDiv.style.cursor = 'pointer';
        }

        div.appendChild(infoDiv);

        if (window.isHost && index > 0) {
            const removeBtn = document.createElement('button');
            removeBtn.innerText = '削除';
            removeBtn.className = 'remove-slot-btn';
            removeBtn.onclick = () => window.socket.emit('remove_slot', index);
            div.appendChild(removeBtn);
        }

        slotList.appendChild(div);
    });

    if (window.isHost) {
        btnStart.disabled = !allPlayersReady;
    }
}

document.getElementById('btn-add-slot').addEventListener('click', () => {
    window.socket.emit('add_slot');
});

document.getElementById('btn-ready').addEventListener('click', () => {
    window.socket.emit('toggle_ready', { roomId: window.currentRoomState.id, userId: window.clientUserId });
});

document.getElementById('btn-settings').addEventListener('click', () => {
    startOverlay.classList.remove('hidden');
});

document.getElementById('close-settings-btn').addEventListener('click', () => {
    startOverlay.classList.add('hidden');
});

window.sendSettingsUpdate = () => {
    if (window.isHost && window.RuleSettings) {
        window.socket.emit('update_settings', window.RuleSettings);
    }
};

btnStart.addEventListener('click', () => {
    if (typeof RuleUI !== 'undefined') {
        const err = RuleUI.checkStartError(window.currentRoomState);
        if (err) { alert(err); return; }
    }
    btnStart.disabled = true;
    window.socket.emit('start_game');
});

window.socket.on('game_started', (roomState) => {
    window.currentRoomState = roomState;
    window.isInitialDealing = true; 
    lobbyScreen.classList.add('hidden');
    startOverlay.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    if (window.game) {
        window.game.setup(roomState.slots, roomState.settings);
        window.game.myId = window.myId;
    }
    window.isGameOver = false; 
    
    if (window.isHost && typeof window.checkTurn === 'function') {
        window.game.start();
        window.broadcastGameState();
        window.animateInitialDeal(window.game.hands, () => {});
    }
});