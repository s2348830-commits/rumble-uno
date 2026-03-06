/**
 * network.js
 */

window.socket = io({
    reconnectionAttempts: 5, 
    timeout: 10000,          
    transports: ['websocket', 'polling'],
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
const previewIcon = document.getElementById('preview-icon');
const btnCreateRoom = document.getElementById('btn-create-room');
const btnShowJoin = document.getElementById('btn-show-join');
const joinContainer = document.getElementById('join-room-container');
const btnJoinRoom = document.getElementById('btn-join-room');
const roomIdInput = document.getElementById('room-id-input');
const loginScreen = document.getElementById('login-screen');
const lobbyScreen = document.getElementById('lobby-screen');
const gameContainer = document.getElementById('game-container');
const startOverlay = document.getElementById('start-overlay');
const btnAddSlot = document.getElementById('btn-add-slot');
const btnSettings = document.getElementById('btn-settings');
const btnDisbandRoom = document.getElementById('btn-disband-room');
const btnReady = document.getElementById('btn-ready');
const btnStart = document.getElementById('btn-start');
const slotList = document.getElementById('slot-list');
const closeSettingsBtn = document.getElementById('close-settings-btn');

function proceedToLogin() {
    if (splashScreen.classList.contains('hidden')) return;
    splashScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    if (window.SE) window.SE.play('touch_to_start');
    
    const manualBtn = document.getElementById('btn-manual');
    if (manualBtn) manualBtn.classList.remove('hidden');
}
splashScreen.addEventListener('click', proceedToLogin);
splashScreen.addEventListener('touchstart', proceedToLogin, { passive: true });

nameInput.addEventListener('input', (e) => {
    myData.name = e.target.value.trim();
    const disabled = myData.name.length === 0;
    btnCreateRoom.disabled = disabled; btnShowJoin.disabled = disabled;
    btnCreateRoom.classList.toggle('disabled-btn', disabled);
    btnShowJoin.classList.toggle('disabled-btn', disabled);
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
                previewIcon.src = myData.icon;
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

btnDisbandRoom.addEventListener('click', () => {
    if(confirm("ルームを解散しますか？")) window.socket.emit('disband_room');
});

window.applySettingsToUI = function(newSettings) {
    if (!newSettings) return;
    if (window.RuleSettings) Object.assign(window.RuleSettings, newSettings);

    const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val; };
    const setChk = (id, val) => { const el = document.getElementById(id); if(el) el.checked = val; };
    
    setVal('setting-uno-penalty', newSettings.unoPenalty);
    setVal('setting-initial-hand', newSettings.initialHandSize);
    setVal('setting-initial-custom-hand', newSettings.initialCustomHandSize); 
    setVal('setting-ability-reset-count', newSettings.abilityResetCount);
    setVal('setting-max-multi', newSettings.maxMultiPlay);
    setVal('setting-max-draw-multi', newSettings.maxDrawMultiPlay);
    setChk('setting-action-finish', newSettings.allowActionFinish);
    setChk('setting-ability-finish', newSettings.allowAbilityFinish); 
    setVal('setting-action-penalty', newSettings.actionFinishPenalty);
    setVal('setting-ability-penalty', newSettings.abilityFinishPenalty);
    setChk('setting-draw-response', newSettings.allowDrawResponse);
    setChk('setting-optional-draw', newSettings.optionalDraw);
    setChk('setting-show-bot-personality', newSettings.showBotPersonality); 
    setChk('setting-random-turn', newSettings.randomTurnOrder);
    
    const finishCheck = document.getElementById('setting-action-finish');
    if(finishCheck) finishCheck.dispatchEvent(new Event('change'));

    const abilityFinishCheck = document.getElementById('setting-ability-finish');
    if(abilityFinishCheck) abilityFinishCheck.dispatchEvent(new Event('change'));
    
    const botPersonalityCheck = document.getElementById('setting-show-bot-personality');
    if(botPersonalityCheck) botPersonalityCheck.dispatchEvent(new Event('change'));

    const randomTurnCheck = document.getElementById('setting-random-turn');
    if(randomTurnCheck) randomTurnCheck.dispatchEvent(new Event('change'));

    const customHandSelect = document.getElementById('setting-initial-custom-hand');
    const resetCountSelect = document.getElementById('setting-ability-reset-count');
    if (customHandSelect) customHandSelect.disabled = (!newSettings.customCards || newSettings.customCards.length === 0);
    if (resetCountSelect) resetCountSelect.disabled = (!newSettings.customCards || newSettings.customCards.length === 0);

    if (window.RuleSettings && typeof window.RuleSettings.renderCustomCardUI === 'function') window.RuleSettings.renderCustomCardUI();
    if (typeof window.updateLobbyUI === 'function') window.updateLobbyUI();
    if (window.currentRoomState) renderSlots(window.currentRoomState);
};

window.socket.on('room_joined', (data) => {
    window.isHost = data.isHost;
    window.myId = data.myId; 
    window.currentRoomState = data.state;
    loginScreen.classList.add('hidden');
    lobbyScreen.classList.remove('hidden');
    document.getElementById('display-room-id').innerText = data.roomId;

    const cia = document.getElementById('chat-input-area');
    if (cia) {
        cia.style.display = 'none';
        cia.classList.add('hidden');
    }

    const lcia = document.getElementById('lobby-chat-container');
    if (window.ChatManager && window.ChatManager.enabled) {
        if(lcia) lcia.style.display = 'block';
    }

    if (window.isHost) {
        btnAddSlot.classList.remove('hidden'); 
        btnStart.classList.remove('hidden'); 
        btnSettings.innerText = "⚙ ゲーム設定"; 
        btnDisbandRoom.classList.remove('hidden'); 
        if (window.sendSettingsUpdate) setTimeout(window.sendSettingsUpdate, 500); 
    } else {
        btnReady.classList.remove('hidden'); 
        btnSettings.innerText = "⚙ 設定確認"; 
        btnDisbandRoom.classList.add('hidden');
        document.querySelectorAll('.main-settings select, .main-settings input').forEach(el => el.disabled = true);
        if (data.state && data.state.settings) window.applySettingsToUI(data.state.settings);
    }
    
    if(data.state && data.state.gameStarted) {
        lobbyScreen.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        const manualBtn = document.getElementById('btn-manual');
        if (manualBtn) manualBtn.classList.add('hidden');
        if (window.game) window.game.setup(data.state.slots, window.myId);
        window.socket.emit('request_sync_state');
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
    const { oldId, newId, newIcon, newName } = data;
    if (window.game && window.game.players) {
        const p = window.game.players.find(p => p.id === oldId);
        if (p) { 
            p.id = newId; p.connected = true; 
            if(newIcon) p.icon = newIcon;
            if(newName) p.name = newName;
        }
        if (window.game.hands && window.game.hands[oldId]) { window.game.hands[newId] = window.game.hands[oldId]; delete window.game.hands[oldId]; }
        if (window.isHost && typeof window.broadcastGameState === 'function') window.broadcastGameState();
    }
});

window.socket.on('room_disbanded', () => { alert("ホストがルームを解散しました。"); location.reload(); });
window.socket.on('error_message', (msg) => { alert(msg); if (msg === 'ホストが退出しました') location.reload(); });

function renderSlots(roomState) {
    slotList.innerHTML = '';
    let allPlayersReady = true;
    let occupiedCount = roomState.slots.filter(s => s.type !== 'empty').length;
    const countEl = document.getElementById('player-count');
    if(countEl) countEl.innerText = occupiedCount;

    roomState.slots.forEach((slot, index) => {
        const div = document.createElement('div'); div.className = 'slot-item';
        const infoDiv = document.createElement('div'); infoDiv.className = 'slot-info';
        const img = document.createElement('img'); img.className = 'slot-icon';
        img.src = slot.icon || DEFAULT_ICON;
        
        let displayName = slot.name;
        if (slot.type === 'bot' && window.RuleSettings && window.RuleSettings.showBotPersonality && slot.personality) displayName += ` [${slot.personality}]`;
        
        const nameSpan = document.createElement('span'); nameSpan.className = 'slot-name'; nameSpan.innerText = displayName;
        const statusSpan = document.createElement('span'); statusSpan.className = 'slot-status';
        
        let difficultySpan = null; 
        if (slot.type === 'host') { statusSpan.innerText = 'ホスト'; statusSpan.classList.add('host'); }
        else if (slot.type === 'player') {
            statusSpan.innerText = slot.connected === false ? '切断中' : (slot.ready ? '準備完了' : '準備中');
            if (slot.ready) statusSpan.classList.add('ready'); else allPlayersReady = false;
        } else if (slot.type === 'bot') { 
            statusSpan.innerText = 'Bot'; statusSpan.classList.add('ready'); 
            difficultySpan = document.createElement('span');
            difficultySpan.innerText = `強さ: ${slot.difficulty || '普通'}`;
            difficultySpan.className = 'bot-difficulty-btn';
            if (window.isHost) {
                difficultySpan.onclick = (e) => {
                    e.stopPropagation();
                    const diffs = ['優しい', '普通', '強い'];
                    const currentIdx = diffs.indexOf(slot.difficulty || '普通');
                    window.socket.emit('change_bot_difficulty', { index: index, difficulty: diffs[(currentIdx + 1) % diffs.length] });
                };
            }
        } else { statusSpan.innerText = '空き'; }

        infoDiv.appendChild(img); infoDiv.appendChild(nameSpan); 
        if(difficultySpan) infoDiv.appendChild(difficultySpan); 
        infoDiv.appendChild(statusSpan);
        if (window.isHost && (slot.type === 'empty' || slot.type === 'bot')) infoDiv.onclick = () => window.socket.emit('toggle_bot', index);
        div.appendChild(infoDiv);
        if (window.isHost && index > 0) {
            const delBtn = document.createElement('button'); delBtn.className = 'btn-remove-slot'; delBtn.innerText = '×';
            delBtn.onclick = () => window.socket.emit('remove_slot', index); div.appendChild(delBtn);
        }
        slotList.appendChild(div);
    });

    if (window.isHost) {
        let errorMsg = null;
        if (window.RuleSettings && window.RuleSettings.checkStartError) errorMsg = window.RuleSettings.checkStartError(roomState);
        const errorEl = document.getElementById('start-error-msg');
        if (errorMsg) {
            if(errorEl) { errorEl.innerText = errorMsg; errorEl.classList.remove('hidden'); }
            btnStart.disabled = true; btnStart.classList.remove('active');
        } else {
            if(errorEl) errorEl.classList.add('hidden');
            btnStart.disabled = !allPlayersReady; btnStart.classList.toggle('active', allPlayersReady);
        }
    } else {
        const mySlot = roomState.slots.find(s => s.userId === window.clientUserId);
        if (mySlot) {
            btnReady.innerText = mySlot.ready ? "準備完了 (取消)" : "準備完了";
            btnReady.classList.toggle('is-ready', mySlot.ready);
        }
    }
}

btnAddSlot.addEventListener('click', () => window.socket.emit('add_slot'));
btnReady.addEventListener('click', () => window.socket.emit('toggle_ready', { roomId: window.currentRoomState.id, userId: window.clientUserId }));

btnSettings.addEventListener('click', () => {
    if (window.SE) window.SE.play('setting');
    startOverlay.classList.remove('hidden');
    const lcia = document.getElementById('lobby-chat-container');
    if (lcia) lcia.classList.add('hidden');
});
if (closeSettingsBtn) closeSettingsBtn.onclick = () => {
    startOverlay.classList.add('hidden');
    const lcia = document.getElementById('lobby-chat-container');
    if (lcia && window.ChatManager && window.ChatManager.enabled) lcia.classList.remove('hidden');
};

window.sendSettingsUpdate = () => { if (window.isHost) window.socket.emit('update_settings', window.RuleSettings); };

document.querySelectorAll('.main-settings select, .main-settings input').forEach(el => {
    el.addEventListener('change', () => { if (window.isHost) window.socket.emit('update_settings', window.RuleSettings); });
});

window.socket.on('settings_updated', (newSettings) => window.applySettingsToUI(newSettings));
btnStart.addEventListener('click', () => { btnStart.disabled = true; window.socket.emit('start_game'); });

window.socket.on('game_started', (roomState) => {
    window.currentRoomState = roomState;
    window.isInitialDealing = true; 
    lobbyScreen.classList.add('hidden'); startOverlay.classList.add('hidden'); gameContainer.classList.remove('hidden');
    
    const manualBtn = document.getElementById('btn-manual');
    if (manualBtn) manualBtn.classList.add('hidden');

    const cia = document.getElementById('chat-input-area');
    if (cia && window.ChatManager && window.ChatManager.enabled) {
        cia.style.display = 'flex';
        cia.classList.remove('hidden');
    }
    
    const lcia = document.getElementById('lobby-chat-container');
    if (lcia) lcia.style.display = 'none';
    
    if (window.game) window.game.setup(roomState.slots, window.myId);
    window.isGameOver = false; 
    if (window.isHost) { 
        if (window.game) window.game.start(); 
        if (typeof window.broadcastGameState === 'function') window.broadcastGameState(true); 
        if (typeof window.animateInitialDeal === 'function') {
            window.animateInitialDeal(JSON.parse(JSON.stringify(window.game.hands)), () => {});
        }
    }
});

window.socket.on('request_ability_reset', (data) => {
    if (!window.isHost || !window.game) return;
    window.game.replaceAbilityCards(data.playerId, data.cards);
    window.broadcastGameState(true);
});

window.socket.on('update_game_state', (state) => {
    if (!window.game) return;
    window.game.deck = state.deck; 
    window.game.turnIndex = state.turnIndex; 
    window.game.direction = state.direction; 
    window.game.discardPile = state.discardPile;
    window.game.discardRotations = state.discardRotations; 
    window.game.drawStack = state.drawStack; 
    window.game.currentColor = state.currentColor;
    if(state.hasDrawnThisTurn !== undefined) window.game.hasDrawnThisTurn = state.hasDrawnThisTurn;
    if(state.abilityGraveyard) window.game.abilityGraveyard = state.abilityGraveyard;
    
    if (state.playersInfo) {
        let newPlayers = [];
        state.playersInfo.forEach(info => {
            let p = window.game.players.find(x => x.id === info.id);
            if (p) { 
                p.frozen = info.frozen; 
                p.burnTurns = info.burnTurns; 
                p.connected = info.connected;
                p.invincibleTurns = info.invincibleTurns || 0;
                p.shield = info.shield || { level: 0, turns: 0 };
                newPlayers.push(p);
            }
        });
        if (newPlayers.length === window.game.players.length) window.game.players = newPlayers; 
    }

    if (window.isInitialDealing && !window.isHost) {
        if (typeof window.animateInitialDeal === 'function') {
            window.animateInitialDeal(state.hands, () => {});
        } else {
            window.isInitialDealing = false;
            window.game.hands = state.hands;
            if (typeof window.updateUI === 'function') window.updateUI();
        }
    } else if (!window.isInitialDealing) {
        window.game.hands = state.hands;
        if (typeof window.updateUI === 'function') window.updateUI(); 
    }

    const current = window.game.currentPlayer;
    const msgEl = document.getElementById('status-message');
    if (window.isInitialDealing) {
        msgEl.innerText = "カードを配っています...";
    } else if (current) {
        const roomStr = window.currentRoomState ? ` - 部屋ID:${window.currentRoomState.id}` : "";
        msgEl.innerText = current.id === window.myId ? `あなたの番です${roomStr}` : `${current.name} のターン${roomStr}`;
    }

    if (state.attackGuides && state.attackGuides.length > 0) {
        state.attackGuides.forEach(g => {
            if (typeof window.showAttackGuide === 'function') window.showAttackGuide(g.from, g.to, g.text, g.se);
        });
    }

    // ★ フェーズUI（防御・じゃんけん）の更新呼び出し
    if (typeof window.updatePhaseUI === 'function') {
        window.updatePhaseUI(state);
    }
});

window.socket.on('broadcast_uno', (data) => {
    if (window.SE) {
        const unoSounds = ['uno', 'uno2', 'uno3', 'uno4', 'uno5', 'uno6'];
        window.SE.play(unoSounds[Math.floor(Math.random() * unoSounds.length)]);
    }
    const target = (data.id === window.myId) ? document.getElementById('my-player-info') : document.querySelector(`.circle-player-badge[data-id="${data.id}"]`);
    if(target) { target.classList.add('uno-pop-badge'); setTimeout(() => target.classList.remove('uno-pop-badge'), 2500); }
});

window.socket.on('game_over', (data) => {
    window.isGameOver = true;
    if (data.isDraw) {
        if (window.SE) window.SE.play('draw');
        setTimeout(() => document.getElementById('draw-curtain').classList.add('show'), 100);
        setTimeout(() => { const b = document.getElementById('winner-banner'); b.innerText = "DRAW"; b.classList.add('show'); }, 3000);
    } else {
        if (window.SE) window.SE.play(Math.random() < 0.5 ? 'win' : 'win2');
        const { winnerId, winnerName } = data;
        const target = (winnerId === window.myId) ? document.getElementById('my-player-info') : document.querySelector(`.circle-player-badge[data-id="${winnerId}"]`);
        if(target) target.classList.add('winner-crown');
        setTimeout(() => {
            const b = document.getElementById('winner-banner');
            b.innerText = `${winnerName} が勝ちました。`; b.classList.add('show');
            if (typeof confetti === 'function') confetti({ particleCount: 150, spread: 80, origin: { x: 0.5, y: 0.5 } });
        }, 5000);
    }
    setTimeout(() => { if (window.isHost) window.socket.emit('return_to_lobby'); }, 8000);
});

window.socket.on('back_to_lobby', (roomState) => {
    window.currentRoomState = roomState;
    window.isGameOver = false; window.isInitialDealing = false;
    document.getElementById('winner-banner').classList.remove('show');
    document.getElementById('draw-curtain').classList.remove('show');
    gameContainer.classList.add('hidden'); lobbyScreen.classList.remove('hidden');
    
    const manualBtn = document.getElementById('btn-manual');
    if (manualBtn) manualBtn.classList.remove('hidden');

    const cia = document.getElementById('chat-input-area');
    if (cia) {
        cia.style.display = 'none';
        cia.classList.add('hidden');
    }
    
    const lcia = document.getElementById('lobby-chat-container');
    if (lcia && window.ChatManager && window.ChatManager.enabled) lcia.style.display = 'block';
    
    renderSlots(roomState);
});

window.socket.on('receive_player_action', (data) => {
    if (!window.isHost || window.isGameOver || window.isInitialDealing) return;
    const playerId = data.playerId;
    
    if (data.action === 'play') {
        window.socket.emit('request_play_animation', { playerId: playerId, cards: data.cards });
        const delay = data.cards.length * 100 + 400;
        setTimeout(() => {
            if (typeof window.executePlay === 'function') window.executePlay(playerId, data.indices);
        }, delay);
    } else if (data.action === 'play_ability') {
        window.socket.emit('request_play_animation', { playerId: playerId, cards: data.cards, isHV: data.isHV });
        const delay = data.cards.length * 100 + 400;
        setTimeout(() => {
            if (typeof window.executeAbilityPlay === 'function') window.executeAbilityPlay(playerId, data.indices, data.targetId, data.discardIdx, data.selectedColor, data.multiDiscardIndices, data.extraData);
        }, delay);
    } else if (data.action === 'defense_response') {
        if (window.pendingDefense && window.pendingDefense.responses) {
            window.pendingDefense.responses[data.targetId] = { cardValue: data.cardValue || null, discardIdx: data.discardIdx !== undefined ? data.discardIdx : null };
            if (window.pendingDefense.info && window.pendingDefense.info.targets) {
                const targetCount = window.pendingDefense.info.targets.length;
                const responseCount = Object.keys(window.pendingDefense.responses).length;
                if (responseCount >= targetCount) {
                    window.pendingDefense.timer = 0;
                }
            }
        }
    } else if (data.action === 'draw') {
        window.socket.emit('request_draw_animation', { playerId: playerId, count: data.count });
        const delay = data.count * 100 + 400;
        setTimeout(() => { if (typeof window.executeDraw === 'function') window.executeDraw(playerId); }, delay);
    } else if (data.action === 'end_turn') {
        if (typeof window.executeEndTurn === 'function') window.executeEndTurn(playerId);
    } else if (data.action === 'color') {
        if (typeof window.executeColor === 'function') window.executeColor(playerId, data.color);
    } else if (data.action === 'draw_penalty') {
        window.socket.emit('request_draw_animation', { playerId: playerId, count: data.count });
        const delay = data.count * 100 + 400;
        setTimeout(() => {
            if (typeof window.game !== 'undefined' && typeof window.game.drawCard === 'function') {
                for(let i=0; i<data.count; i++) window.game.drawCard(playerId);
                if (typeof window.broadcastGameState === 'function') window.broadcastGameState();
            }
        }, delay);
    } else if (data.action === 'ability_reset') {
        if (window.game && typeof window.game.replaceAbilityCards === 'function') {
            window.game.replaceAbilityCards(playerId, data.cards);
            if (typeof window.broadcastGameState === 'function') window.broadcastGameState(true);
        }
    } 
    else if (data.action === 'janken_choice') {
        if (window.pendingJanken && !window.pendingJanken.result) {
            if (playerId === window.pendingJanken.attackerId) window.pendingJanken.attackerHand = data.choice;
            if (playerId === window.pendingJanken.targetId) window.pendingJanken.targetHand = data.choice;
            if (typeof window.checkJankenReady === 'function') window.checkJankenReady();
        }
    }
});