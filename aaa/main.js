/**
 * main.js (全バグ修正・安定版)
 */

if (window.AbilityDef && window.AbilityDef['id_33']) {
    window.AbilityDef['id_33'].desc = '【AT】自分以外のプレイヤーを一人指定し1枚ドローさせる。自分のターン中にこのカードを使用した場合、自分のターン終了後にこのカードを手札に戻してもよい。(各ターン1回のみ)';
}

// --- グローバル変数の初期化 ---
window.game = new UNOGame(); window.playerAfkTimes = {}; window.turnTimer = null; window.isGameOver = false; window.isDrawing = false; window.isInitialDealing = false; window.isDefending = false; window.isDealAnimationRunning = false; window.isServerProcessingAbility = false;
window.pendingDrawDefenseInfo = null; window.pendingJanken = null; window.isProcessingPlay = false; window.currentDefensePhaseId = null; window.hasRespondedDefense = false; window.currentJankenLoopId = null; 
window.lastGameStateFingerprint = ""; window.hostSyncInterval = null; window.waitingForServerResponse = false; window.isAnimating = false; window.animatingTimeout = null;

// ★修正: リセット管理用変数はトップレベルに配置する
window.resetDonePlayers = new Set();
window.abilityResetSubmitted = false;

window.JANKEN_BACK_IMG = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 60'%3E%3Crect width='40' height='60' rx='6' fill='%23222' stroke='%23444' stroke-width='2'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23fff' font-size='24' font-family='sans-serif' font-weight='bold'%3E?%3C/text%3E%3C/svg%3E";

window.showConfirm = function(message, callback) {
    window.ensureModalsExist();
    const modal = document.getElementById('custom-confirm-modal'), text = document.getElementById('custom-confirm-text'), btnYes = document.getElementById('btn-custom-confirm-yes'), btnNo = document.getElementById('btn-custom-confirm-no');
    text.innerText = message; modal.classList.remove('hidden');
    btnYes.onclick = () => { modal.classList.add('hidden'); callback(true); }; 
    btnNo.onclick = () => { modal.classList.add('hidden'); callback(false); };
};

window.ensureModalsExist = function() {
    const addModal = (id, html, style) => { if(!document.getElementById(id)){ const d = document.createElement('div'); d.id = id; d.className = 'action-popup hidden'; if(style) d.style.cssText = style; d.innerHTML = html; document.body.appendChild(d); } };
    addModal('target-modal', `<h3>対象のプレイヤーを選択</h3><div id="target-modal-list" class="action-popup-grid"></div>`);
    addModal('discard-modal', `<h3>捨てるカードを選択</h3><div id="discard-modal-list" class="action-popup-grid" style="overflow-x:auto; flex-wrap:nowrap; max-width:90vw;"></div>`);
    addModal('multi-discard-modal', `<h3 id="multi-discard-title">捨てるカードを選択 (複数可)</h3><div id="multi-discard-modal-list" class="action-popup-grid" style="overflow-x:auto; flex-wrap:nowrap; max-width:90vw;"></div><button id="btn-multi-discard-confirm" style="margin-top:15px; padding:8px 15px; background:#4caf50; color:white; border:none; border-radius:8px; cursor:pointer;">確定</button>`);
    addModal('graveyard-modal', `<h3 style="margin-top:0;">墓地からカードを1枚回収(SSR以下)</h3><div id="graveyard-list" class="action-popup-grid" style="overflow-x:auto; flex-wrap:nowrap; max-width:90vw; gap:5px;"></div><button id="btn-cancel-graveyard" style="margin-top:15px; padding:8px 15px; background:#777; color:white; border:none; border-radius:8px; cursor:pointer;">キャンセル</button>`);
    addModal('debuff-modal', `<h3 style="margin-top:0;">解除するデバフを選択</h3><div style="display:flex; justify-content:center; gap:20px;"><button id="btn-debuff-freeze" style="font-size:24px; padding:10px; border-radius:10px; background:#00bfff; cursor:pointer;">❄️凍結</button><button id="btn-debuff-burn" style="font-size:24px; padding:10px; border-radius:10px; background:#ff4500; cursor:pointer;">🔥燃焼</button></div>`);
    addModal('custom-confirm-modal', `<h3 id="custom-confirm-text" style="margin-top: 0; line-height: 1.5; font-size: 16px; white-space:pre-wrap;">確認</h3><div style="display:flex; justify-content:center; gap:20px; margin-top:20px;"><button id="btn-custom-confirm-yes" style="padding:10px 30px; background:#4caf50; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">はい</button><button id="btn-custom-confirm-no" style="padding:10px 30px; background:#d32f2f; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">いいえ</button></div>`, "z-index: 999999; max-width: 90vw;");
    
    let defModal = document.getElementById('defense-modal');
    if(!defModal || !document.getElementById('defense-question-area')){
        if(defModal) defModal.remove();
        defModal = document.createElement('div'); defModal.id = 'defense-modal'; defModal.className = 'action-popup hidden'; defModal.style.cssText = "width:90vw; max-width:400px; max-height:80vh; box-sizing:border-box;";
        defModal.innerHTML = `<h3 id="defense-title" style="color:#ff5252; margin-top: 0;">攻撃を受けました！</h3><div id="defense-desc" style="font-size: 12px; color: #ddd; background: rgba(0,0,0,0.5); padding: 8px; border-radius: 6px; margin-bottom: 10px; line-height: 1.4; text-align: left; white-space: pre-wrap;" class="hidden"></div><div style="font-size:24px; color:#fbc02d; font-weight:bold; margin: 10px 0;"><span id="defense-timer-text">30</span>秒</div><div id="defense-question-area"><p>防御カード(BL)を使用しますか？</p><div style="display:flex; justify-content:center; gap:20px; margin-top:15px;"><button id="btn-defense-yes" style="padding:10px 30px; background:#4caf50; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Yes</button><button id="btn-defense-no" style="padding:10px 30px; background:#d32f2f; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">No</button></div></div><div id="defense-select-area" class="hidden"><p>使用する防御カードを選んでください</p><div id="defense-modal-list" class="action-popup-grid" style="overflow-x:auto; flex-wrap:nowrap; max-width:100%; padding-bottom: 10px;"></div><button id="btn-cancel-defense" style="margin-top:15px; padding:8px 15px; background:#777; color:white; border:none; border-radius:8px; cursor:pointer; width: 100%;">キャンセル</button></div>`;
        document.body.appendChild(defModal);
    }
};

window.SE = {
    audioCtx: null, masterGain: null, buffers: {}, activeLoopSources: {}, intendedLoops: {}, volume: 0.5, unlocked: false, lastPlayed: {}, 
    initContext: function() { if (this.audioCtx) return; const AudioContext = window.AudioContext || window.webkitAudioContext; this.audioCtx = new AudioContext(); this.masterGain = this.audioCtx.createGain(); this.masterGain.gain.value = this.volume; this.masterGain.connect(this.audioCtx.destination); },
    setVolume: function(val) { this.volume = val / 100; if (this.masterGain) this.masterGain.gain.value = this.volume; },
    loadSound: async function(name, ext) { if (!this.audioCtx) this.initContext(); if (this.buffers[name]) return; try { const response = await fetch(`se/${name}.${ext}`, { headers: { "ngrok-skip-browser-warning": "true" } }); if (!response.ok) return; const arrayBuffer = await response.arrayBuffer(); const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer); this.buffers[name] = audioBuffer; } catch (e) {} },
    play: function(name) { const now = Date.now(); if (this.lastPlayed[name] && (now - this.lastPlayed[name] < 100)) return; this.lastPlayed[name] = now; let ext = 'mp3'; if (name === 'fire' || name === 'page') ext = 'wav'; if (!this.audioCtx) this.initContext(); if (!this.buffers[name]) { this.loadSound(name, ext).then(() => this.playSoundBuffer(name, false)); } else { this.playSoundBuffer(name, false); } },
    playSoundBuffer: function(name, loop) { if (!this.buffers[name] || !this.audioCtx) return null; const source = this.audioCtx.createBufferSource(); source.buffer = this.buffers[name]; source.loop = loop; source.connect(this.masterGain); source.start(0); return source; },
    playMultiple: function(name, count, interval = 500) { let played = 0; const playNext = () => { if (played >= count) return; this.play(name); played++; if (played < count) setTimeout(playNext, interval); }; playNext(); },
    startLoop: function(name) { if (this.intendedLoops[name]) return; this.intendedLoops[name] = true; if (!this.audioCtx) this.initContext(); if (!this.buffers[name]) { this.loadSound(name, 'mp3').then(() => { if (this.intendedLoops[name] && !this.activeLoopSources[name]) this.activeLoopSources[name] = this.playSoundBuffer(name, true); }); } else { if (!this.activeLoopSources[name]) this.activeLoopSources[name] = this.playSoundBuffer(name, true); } },
    stopLoop: function(name) { this.intendedLoops[name] = false; if (this.activeLoopSources[name]) { this.activeLoopSources[name].stop(); this.activeLoopSources[name].disconnect(); delete this.activeLoopSources[name]; } }
};

window.updateUI = function() { if(window.game && window.game.players && window.game.players.length > 0) { Renderer.updateAll(window.game); } };

window.broadcastGameState = function(skipUIUpdate = false, attackGuides = []) {
    if (!window.isHost) return;
    const playersInfo = window.game.players.map(p => ({ id: p.id, connected: p.connected, frozen: p.frozen, burnTurns: p.burnTurns, invincibleTurns: p.invincibleTurns, shield: p.shield, evasion: p.evasion, usedRaia: p.usedRaia }));
    const state = { deck: window.game.deck, turnIndex: window.game.turnIndex, direction: window.game.direction, hands: window.game.hands, discardPile: window.game.discardPile, discardRotations: window.game.discardRotations, drawStack: window.game.drawStack, currentColor: window.game.currentColor, playersInfo: playersInfo, hasDrawnThisTurn: window.game.hasDrawnThisTurn, defensePhase: window.pendingDefense ? window.pendingDefense.info : null, defenseTimer: window.pendingDefense ? window.pendingDefense.timer : 0, attackGuides: attackGuides, abilityGraveyard: window.game.abilityGraveyard, jankenPhase: window.pendingJanken, customDeck: window.game.customDeck };
    if (window.socket) window.socket.emit('sync_game_state', state);
    if (!skipUIUpdate) { window.lastGameStateFingerprint = ""; window.updateUI(); }
    if (!window.hostSyncInterval) { window.hostSyncInterval = setInterval(() => { if (window.isHost) window.broadcastGameState(true); }, 1500); }
};

window.showAbilityResetUI = function(maxCount) {
    const overlay = document.getElementById('ability-reset-overlay'), resetArea = document.getElementById('reset-area'), handArea = document.getElementById('reset-hand-area'), btnConfirm = document.getElementById('btn-reset-confirm'), timerSpan = document.getElementById('reset-timer'), maxSpan = document.getElementById('reset-max');
    if(!overlay) return; 
    window.abilityResetSubmitted = false;
    let timeLeft = 10; maxSpan.innerText = maxCount; resetArea.innerHTML = ''; handArea.innerHTML = '';
    let selectedCards = [], myAbilities = window.game.myHand.filter(c => c.value && String(c.value).startsWith('id_'));
    const renderCards = () => {
        resetArea.innerHTML = ''; selectedCards.forEach((c, idx) => { const el = Renderer.createCardElement(c); el.style.transform = 'none'; el.style.position = 'static'; el.style.margin = '0'; el.onclick = () => { selectedCards.splice(idx, 1); myAbilities.push(c); renderCards(); }; resetArea.appendChild(el); });
        handArea.innerHTML = ''; myAbilities.forEach((c, idx) => { const el = Renderer.createCardElement(c); el.style.transform = 'none'; el.style.position = 'static'; el.style.margin = '0'; el.onclick = () => { if (selectedCards.length < maxCount) { myAbilities.splice(idx, 1); selectedCards.push(c); renderCards(); } }; handArea.appendChild(el); });
    };
    renderCards(); overlay.classList.remove('hidden');
    const finish = () => { 
        if (window.abilityResetSubmitted) return;
        window.abilityResetSubmitted = true;
        clearInterval(timerInt); overlay.classList.add('hidden'); 
        if (selectedCards.length > 0) { 
            const vals = selectedCards.map(c => c.value); 
            if (window.isHost) { window.game.replaceAbilityCards(window.game.myId, vals); window.updateUI(); } 
            else { if(window.socket) window.socket.emit('player_action', { action: 'ability_reset', cards: vals }); } 
        } 
    };
    btnConfirm.onclick = finish; const timerInt = setInterval(() => { timeLeft--; timerSpan.innerText = timeLeft; if (timeLeft <= 0) finish(); }, 1000);
};

window.executePlay = function(playerId, indices) {
    if (!window.isHost) return;
    const result = window.game.playCards(playerId, indices);
    if (result.success) {
        if (window.checkWin(playerId)) return;
        if (result.isAbility) { window.broadcastGameState(); return; }
        window.broadcastGameState(); window.checkTurn();
    }
};

window.executeAbilityPlay = function(playerId, indices, playedCardsData, targetId, discardIdx, selectedColor, multiDiscardIndices, extraData) {
    if (!window.isHost) return;
    const hand = window.game.hands[playerId];
    const cardsToRemove = [...playedCardsData];
    if (discardIdx !== null) cardsToRemove.push(hand[discardIdx]);
    cardsToRemove.forEach(pc => { const idx = hand.findIndex(c => c.value === pc.value && c.color === pc.color); if(idx > -1) hand.splice(idx, 1); });
    window.broadcastGameState(false);
};

window.handlePlayAction = function() {
    if (window.game.selectedIndices.length === 0 || window.isGameOver || window.isDrawing) return;
    if (!document.querySelector('.action-popup:not(.hidden)')) { window.isProcessingPlay = false; window.waitingForServerResponse = false; }
    if (window.waitingForServerResponse || window.isProcessingPlay || window.isServerProcessingAbility) return;
    
    window.isProcessingPlay = true;
    const selectedCards = window.game.selectedIndices.map(i => window.game.myHand[i]);
    const indices = [...window.game.selectedIndices];
    const isAbility = selectedCards[0].value.startsWith('id_');
    const def = isAbility && window.AbilityDef ? window.AbilityDef[selectedCards[0].value] : null;

    if (isAbility) {
        let targetId = null, discardIdx = null, selColor = null;
        const finish = () => {
            window.game.selectedIndices = []; window.updateUI();
            if (window.isHost) window.executeAbilityPlay(window.game.myId, indices, selectedCards, targetId, discardIdx, selColor, [], {});
            else { window.waitingForServerResponse = true; window.socket.emit('player_action', { action: 'play_ability', indices, cards: selectedCards, targetId, discardIdx, selectedColor: selColor }); }
            window.isProcessingPlay = false;
        };
        if (def.needsTarget) window.openTargetSelection(window.game.players, (tid) => { targetId = tid; finish(); });
        else finish();
    } else {
        window.game.selectedIndices = []; window.updateUI();
        if (window.isHost) window.executePlay(window.game.myId, indices);
        else { window.waitingForServerResponse = true; window.socket.emit('player_action', { action: 'play', indices, cards: selectedCards }); }
        window.isProcessingPlay = false;
    }
};

document.getElementById('draw-btn').onclick = () => {
    if (window.waitingForServerResponse || window.isDrawing) return;
    window.isDrawing = true; window.waitingForServerResponse = true;
    if (window.isHost) window.executeDraw(window.game.myId);
    else window.socket.emit('player_action', { action: 'draw', count: 1 });
};

document.getElementById('end-turn-btn').onclick = () => {
    if (window.waitingForServerResponse) return;
    window.waitingForServerResponse = true;
    if (window.isHost) window.executeEndTurn(window.game.myId);
    else window.socket.emit('player_action', { action: 'end_turn' });
};

function initMainSocketEvents() {
    if (typeof window.socket === 'undefined') { setTimeout(initMainSocketEvents, 100); return; }
    window.socket.on('sync_game_state', (state) => {
        if (!window.game) return;
        window.waitingForServerResponse = false; window.isDrawing = false; window.isProcessingPlay = false;
        if (state.defensePhase === null && state.jankenPhase === null) window.isServerProcessingAbility = false;
        else window.isServerProcessingAbility = true;
        window.game.hands = state.hands; window.game.turnIndex = state.turnIndex; window.updateUI();
    });
    window.socket.on('receive_player_action', (data) => {
        if (!window.isHost) return;
        const pId = data.playerId;
        if (data.action === 'play') window.executePlay(pId, data.indices);
        else if (data.action === 'play_ability') window.executeAbilityPlay(pId, data.indices, data.cards, data.targetId, data.discardIdx, data.selectedColor, [], data.extraData);
        else if (data.action === 'draw') window.executeDraw(pId);
        else if (data.action === 'ability_reset') {
            if (window.resetDonePlayers.has(pId)) return;
            window.resetDonePlayers.add(pId);
            window.game.replaceAbilityCards(pId, data.cards);
            window.broadcastGameState(true);
        }
    });
    window.socket.on('back_to_lobby', (roomState) => { window.resetDonePlayers.clear(); window.updateUI(); });
}
initMainSocketEvents();