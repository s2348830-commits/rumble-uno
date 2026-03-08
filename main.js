/**
 * main.js
 */
window.game = new UNOGame();
window.playerAfkTimes = {}; 
window.turnTimer = null;
window.isGameOver = false;
window.isDrawing = false; 
window.isInitialDealing = false; 
window.isDefending = false; 
window.pendingDrawDefenseInfo = null; 
window.pendingJanken = null;
window.isProcessingPlay = false;
window.currentDefensePhaseId = null;
window.hasRespondedDefense = false;
window.currentJankenLoopId = null; 

window.JANKEN_BACK_IMG = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 60'%3E%3Crect width='40' height='60' rx='6' fill='%23222' stroke='%23444' stroke-width='2'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23fff' font-size='24' font-family='sans-serif' font-weight='bold'%3E?%3C/text%3E%3C/svg%3E";

window.ensureModalsExist = function() {
    if (!document.getElementById('target-modal')) {
        const targetModal = document.createElement('div');
        targetModal.id = 'target-modal';
        targetModal.className = 'action-popup hidden';
        targetModal.innerHTML = `<h3>対象のプレイヤーを選択</h3><div id="target-modal-list" class="action-popup-grid"></div>`;
        document.body.appendChild(targetModal);
    }
    if (!document.getElementById('discard-modal')) {
        const discardModal = document.createElement('div');
        discardModal.id = 'discard-modal';
        discardModal.className = 'action-popup hidden';
        discardModal.innerHTML = `<h3>捨てるカードを選択</h3><div id="discard-modal-list" class="action-popup-grid" style="overflow-x:auto; flex-wrap:nowrap; max-width:90vw;"></div>`;
        document.body.appendChild(discardModal);
    }
    if (!document.getElementById('multi-discard-modal')) {
        const multiDiscardModal = document.createElement('div');
        multiDiscardModal.id = 'multi-discard-modal';
        multiDiscardModal.className = 'action-popup hidden';
        multiDiscardModal.innerHTML = `
            <h3 id="multi-discard-title">捨てるカードを選択 (複数可)</h3>
            <div id="multi-discard-modal-list" class="action-popup-grid" style="overflow-x:auto; flex-wrap:nowrap; max-width:90vw;"></div>
            <button id="btn-multi-discard-confirm" style="margin-top:15px; padding:8px 15px; background:#4caf50; color:white; border:none; border-radius:8px; cursor:pointer;">確定</button>
        `;
        document.body.appendChild(multiDiscardModal);
    }
    if (!document.getElementById('graveyard-modal')) {
        const gyModal = document.createElement('div');
        gyModal.id = 'graveyard-modal';
        gyModal.className = 'action-popup hidden';
        gyModal.innerHTML = `
            <h3 style="margin-top:0;">墓地からカードを1枚回収(SSR以下)</h3>
            <div id="graveyard-list" class="action-popup-grid" style="overflow-x:auto; flex-wrap:nowrap; max-width:90vw; gap:5px;"></div>
            <button id="btn-cancel-graveyard" style="margin-top:15px; padding:8px 15px; background:#777; color:white; border:none; border-radius:8px; cursor:pointer;">キャンセル</button>
        `;
        document.body.appendChild(gyModal);
    }
    if (!document.getElementById('debuff-modal')) {
        const dbModal = document.createElement('div');
        dbModal.id = 'debuff-modal';
        dbModal.className = 'action-popup hidden';
        dbModal.innerHTML = `
            <h3 style="margin-top:0;">解除するデバフを選択</h3>
            <div style="display:flex; justify-content:center; gap:20px;">
                <button id="btn-debuff-freeze" style="font-size:24px; padding:10px; border-radius:10px; background:#00bfff; cursor:pointer;">❄️凍結</button>
                <button id="btn-debuff-burn" style="font-size:24px; padding:10px; border-radius:10px; background:#ff4500; cursor:pointer;">🔥燃焼</button>
            </div>
        `;
        document.body.appendChild(dbModal);
    }
    let defModal = document.getElementById('defense-modal');
    if (!defModal || !document.getElementById('defense-question-area')) {
        if (defModal) defModal.remove();
        defModal = document.createElement('div');
        defModal.id = 'defense-modal';
        defModal.className = 'action-popup hidden';
        defModal.style.width = '90vw';
        defModal.style.maxWidth = '400px';
        defModal.style.maxHeight = '80vh';
        defModal.style.boxSizing = 'border-box';
        defModal.innerHTML = `
            <h3 id="defense-title" style="color:#ff5252; margin-top: 0;">攻撃を受けました！</h3>
            <div id="defense-desc" style="font-size: 12px; color: #ddd; background: rgba(0,0,0,0.5); padding: 8px; border-radius: 6px; margin-bottom: 10px; line-height: 1.4; text-align: left; white-space: pre-wrap;" class="hidden"></div>
            <div style="font-size:24px; color:#fbc02d; font-weight:bold; margin: 10px 0;"><span id="defense-timer-text">30</span>秒</div>
            <div id="defense-question-area">
                <p>防御カード(BL)を使用しますか？</p>
                <div style="display:flex; justify-content:center; gap:20px; margin-top:15px;">
                    <button id="btn-defense-yes" style="padding:10px 30px; background:#4caf50; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">Yes</button>
                    <button id="btn-defense-no" style="padding:10px 30px; background:#d32f2f; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer;">No</button>
                </div>
            </div>
            <div id="defense-select-area" class="hidden">
                <p>使用する防御カードを選んでください</p>
                <div id="defense-modal-list" class="action-popup-grid" style="overflow-x:auto; flex-wrap:nowrap; max-width:100%; padding-bottom: 10px;"></div>
                <button id="btn-cancel-defense" style="margin-top:15px; padding:8px 15px; background:#777; color:white; border:none; border-radius:8px; cursor:pointer; width: 100%;">キャンセル</button>
            </div>
        `;
        document.body.appendChild(defModal);
    }
    if (!document.getElementById('ability-cutin')) {
        const cutin = document.createElement('div');
        cutin.id = 'ability-cutin';
        cutin.className = 'hidden';
        cutin.innerHTML = `
            <div class="cutin-bg-red"></div>
            <div class="cutin-bg-black"></div>
            <div class="cutin-content">
                <img id="ability-cutin-img" src="" alt="Ability">
                <div class="cutin-text-container">
                    <h2 id="ability-cutin-name"></h2>
                    <p id="ability-cutin-text"></p>
                </div>
            </div>`;
        document.body.appendChild(cutin);
    }
    if (!document.getElementById('ability-reset-overlay')) {
        const resOver = document.createElement('div');
        resOver.id = 'ability-reset-overlay';
        resOver.className = 'hidden';
        resOver.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.85); z-index:8000; display:flex; flex-direction:column; justify-content:center; align-items:center;";
        resOver.innerHTML = `
            <h2 style="color:white; margin-bottom:5px;">能力カード入れ替え (<span id="reset-timer" style="color:#fbc02d;">10</span>秒)</h2>
            <p style="color:#ccc; font-size:12px; margin-top:0;">手札の能力カードをタップして入れ替えます(最大 <span id="reset-max">0</span> 枚)</p>
            <div id="reset-area" style="width:90%; max-width:400px; height:100px; border:2px dashed #4caf50; border-radius:10px; display:flex; justify-content:center; align-items:center; gap:5px; background:rgba(255,255,255,0.1); overflow-x:auto;"></div>
            <div id="reset-hand-area" style="margin-top:20px; display:flex; justify-content:center; flex-wrap:wrap; gap:5px; max-width:90%;"></div>
            <button id="btn-reset-confirm" class="start-btn" style="width:200px; margin-top:20px;">確定</button>
        `;
        document.body.appendChild(resOver);
    }
    if (!document.getElementById('janken-overlay')) {
        const jOverlay = document.createElement('div');
        jOverlay.id = 'janken-overlay';
        jOverlay.className = 'hidden';
        jOverlay.style.cssText = "position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.95); z-index:110000; display:flex; flex-direction:column; justify-content:center; align-items:center; padding-bottom: 10vh; box-sizing: border-box;";
        jOverlay.innerHTML = `
            <h2 id="janken-title" style="color:white; font-style:italic; margin-bottom: 5px;">じゃんけん 勝負！</h2>
            <div id="janken-subtitle" style="color:#aaa; font-size:14px; margin-bottom:15px;">Loop: 1/4</div>
            <div style="color:#fbc02d; font-size:36px; font-weight:bold; margin-bottom:20px;">残り <span id="janken-timer">10</span> 秒</div>
            <div style="display:flex; gap:30px; align-items:center; margin-bottom:30px; width: 90%; max-width: 500px; justify-content: center;">
                <div id="janken-player1" style="text-align:center; color:white; flex: 1;">
                    <div id="janken-p1-result" style="font-size:24px; font-weight:bold; height:35px; text-shadow: 2px 2px 4px #000;"></div>
                    <div id="janken-p1-name" style="margin-bottom:10px; font-weight:bold; font-size:14px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Player1</div>
                    <img id="janken-p1-card" src="${window.JANKEN_BACK_IMG}" style="width:80px; max-width: 100%; border-radius:10px; transition:0.3s; border-top: 10px solid transparent;">
                </div>
                <div style="color:white; font-size:30px; font-weight:bold; font-style:italic;">VS</div>
                <div id="janken-player2" style="text-align:center; color:white; flex: 1;">
                    <div id="janken-p2-result" style="font-size:24px; font-weight:bold; height:35px; text-shadow: 2px 2px 4px #000;"></div>
                    <div id="janken-p2-name" style="margin-bottom:10px; font-weight:bold; font-size:14px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">Player2</div>
                    <img id="janken-p2-card" src="${window.JANKEN_BACK_IMG}" style="width:80px; max-width: 100%; border-radius:10px; transition:0.3s; border-top: 10px solid transparent;">
                </div>
            </div>
            <div id="janken-controls" style="display:flex; gap:15px;">
                <button class="janken-btn" data-hand="1" style="background:none; border:none; cursor:pointer; transition:transform 0.2s;"><img src="card/custom/jyanken1.png" style="width:70px;" onerror="this.outerHTML='<div style=\\'width:70px;height:70px;background:#fbc02d;color:black;border-radius:50%;display:flex;justify-content:center;align-items:center;font-weight:bold;font-size:18px;\\'>グー</div>'"></button>
                <button class="janken-btn" data-hand="2" style="background:none; border:none; cursor:pointer; transition:transform 0.2s;"><img src="card/custom/jyanken2.png" style="width:70px;" onerror="this.outerHTML='<div style=\\'width:70px;height:70px;background:#fbc02d;color:black;border-radius:50%;display:flex;justify-content:center;align-items:center;font-weight:bold;font-size:18px;\\'>チョキ</div>'"></button>
                <button class="janken-btn" data-hand="3" style="background:none; border:none; cursor:pointer; transition:transform 0.2s;"><img src="card/custom/jyanken3.png" style="width:70px;" onerror="this.outerHTML='<div style=\\'width:70px;height:70px;background:#fbc02d;color:black;border-radius:50%;display:flex;justify-content:center;align-items:center;font-weight:bold;font-size:18px;\\'>パー</div>'"></button>
            </div>
        `;
        document.body.appendChild(jOverlay);
        
        document.querySelectorAll('.janken-btn').forEach(btn => {
            btn.onclick = () => {
                const choice = parseInt(btn.dataset.hand);
                if (window.socket) window.socket.emit('player_action', { action: 'janken_choice', playerId: window.myId, choice });
                document.getElementById('janken-controls').style.display = 'none';
                document.getElementById('janken-title').innerText = "相手を待っています...";
            };
        });
    }
};

window.SE = {
    audioCtx: null, masterGain: null, buffers: {}, activeLoopSources: {}, intendedLoops: {}, volume: 0.5, unlocked: false, lastPlayed: {}, 
    initContext: function() {
        if (this.audioCtx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.value = this.volume;
        this.masterGain.connect(this.audioCtx.destination);
    },
    setVolume: function(val) {
        this.volume = val / 100;
        if (this.masterGain) this.masterGain.gain.value = this.volume;
    },
    loadSound: async function(name, ext) {
        if (!this.audioCtx) this.initContext();
        if (this.buffers[name]) return;
        try {
            const response = await fetch(`se/${name}.${ext}`, {
                headers: { "ngrok-skip-browser-warning": "true" }
            });
            if (!response.ok) return; 
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
            this.buffers[name] = audioBuffer;
        } catch (e) {}
    },
    play: function(name) {
        const now = Date.now();
        if (this.lastPlayed[name] && (now - this.lastPlayed[name] < 100)) return;
        this.lastPlayed[name] = now;
        let ext = 'mp3';
        if (name === 'fire' || name === 'page') ext = 'wav';
        if (!this.audioCtx) this.initContext();
        if (!this.buffers[name]) {
            this.loadSound(name, ext).then(() => this.playSoundBuffer(name, false));
        } else {
            this.playSoundBuffer(name, false);
        }
    },
    playSoundBuffer: function(name, loop) {
        if (!this.buffers[name] || !this.audioCtx) return null;
        const source = this.audioCtx.createBufferSource();
        source.buffer = this.buffers[name]; source.loop = loop;
        source.connect(this.masterGain); source.start(0);
        return source;
    },
    playMultiple: function(name, count, interval = 500) {
        let played = 0;
        const playNext = () => { if (played >= count) return; this.play(name); played++; if (played < count) setTimeout(playNext, interval); }
        playNext();
    },
    startLoop: function(name) {
        if (this.intendedLoops[name]) return; this.intendedLoops[name] = true;
        if (!this.audioCtx) this.initContext();
        if (!this.buffers[name]) {
            this.loadSound(name, 'mp3').then(() => { if (this.intendedLoops[name] && !this.activeLoopSources[name]) this.activeLoopSources[name] = this.playSoundBuffer(name, true); });
        } else {
            if (!this.activeLoopSources[name]) this.activeLoopSources[name] = this.playSoundBuffer(name, true);
        }
    },
    stopLoop: function(name) {
        this.intendedLoops[name] = false;
        if (this.activeLoopSources[name]) { this.activeLoopSources[name].stop(); this.activeLoopSources[name].disconnect(); delete this.activeLoopSources[name]; }
    }
};

const unlockAudioContext = () => {
    if (window.SE.unlocked) return; window.SE.unlocked = true; window.SE.initContext();
    if (window.SE.audioCtx.state === 'suspended') window.SE.audioCtx.resume();
['win', 'win2', 'setting', 'draw', 'uno_message', 'buttonclick', 'uno', 'uno2', 'uno3', 'uno4', 'uno5', 'uno6', 'frieze', 'rock', 'Distribute', 'mvp_1', 'mvp_2', 'hv/id_20(1)', 'hv/id_20(2)', 'hv/id_25', 'hv/id_26', 'hv/id_35'].forEach(name => window.SE.loadSound(name, 'mp3'));    ['fire', 'page'].forEach(name => window.SE.loadSound(name, 'wav'));
    document.removeEventListener('click', unlockAudioContext);
    document.removeEventListener('touchstart', unlockAudioContext);
};
document.addEventListener('click', unlockAudioContext);
document.addEventListener('touchstart', unlockAudioContext, { passive: true });

window.initVolumeControl = function() {
    const controls = document.querySelectorAll('.volume-slider');
    const icons = document.querySelectorAll('.volume-icon');
    controls.forEach(ctrl => {
        ctrl.addEventListener('input', (e) => {
            window.SE.setVolume(e.target.value);
            controls.forEach(c => c.value = e.target.value);
            icons.forEach(icon => icon.innerText = e.target.value == 0 ? '🔇' : '🔈');
        });
    });
};

const ColorUI = { 
    callback: null,
    show: function(cb = null) { this.callback = cb; document.getElementById('color-selector').classList.remove('hidden'); }, 
    hide: function() { document.getElementById('color-selector').classList.add('hidden'); } 
};

window.updateUI = function() { 
    if(window.game && window.game.players && window.game.players.length > 0) { Renderer.updateAll(window.game); window.checkFinalSprint(); } 
};

window.checkFinalSprint = function() {
    if (window.isGameOver || window.isInitialDealing) { window.SE.stopLoop('final_sprint'); return; }
    let hasUno = false;
    if (window.game.hands) Object.values(window.game.hands).forEach(h => { if (h.length === 1) hasUno = true; });
    if (hasUno) window.SE.startLoop('final_sprint'); else window.SE.stopLoop('final_sprint');
};

window.updatePhaseUI = function(state) {
    if (state.defensePhase) {
        const { attackerId, cardValue, targets, phaseId } = state.defensePhase;
        if (targets && targets.includes(window.myId) && window.myId !== attackerId) {
            if (window.currentDefensePhaseId !== phaseId) {
                window.currentDefensePhaseId = phaseId;
                window.hasRespondedDefense = false;
                window.isDefending = true;
                if (typeof window.showDefenseModal === 'function') window.showDefenseModal(cardValue);
            }
            if (window.hasRespondedDefense) {
                const modal = document.getElementById('defense-modal');
                const discModal = document.getElementById('discard-modal');
                if (modal) modal.classList.add('hidden');
                if (discModal) discModal.classList.add('hidden');
            } else {
                const timerText = document.getElementById('defense-timer-text');
                if (timerText) timerText.innerText = state.defenseTimer;
            }
        }
    } else {
        window.currentDefensePhaseId = null;
        window.hasRespondedDefense = false;
        window.isDefending = false;
        const modal = document.getElementById('defense-modal');
        const discModal = document.getElementById('discard-modal');
        if (modal) modal.classList.add('hidden');
        if (discModal) discModal.classList.add('hidden');
    }

    if (state.jankenPhase) {
        // 現在のじゃんけんの組み合わせと回数を元にIDを作成
        const newLoopId = `${state.jankenPhase.attackerId}-${state.jankenPhase.targetId}-${state.jankenPhase.loopCount}`;
        
        // ★修正: UIが表示されていない、または「新しい回（再戦）」に入った時にUIを再セットしてボタンを出す
        if (!window.isJankenShowing || window.currentJankenLoopId !== newLoopId) {
            if (typeof window.showJankenUI === 'function') {
                window.showJankenUI(state.jankenPhase.attackerId, state.jankenPhase.targetId, state.jankenPhase.loopCount);
            }
            window.isJankenShowing = true;
            window.jankenResultPlayed = false; // ★ここで結果再生フラグも確実にリセットする
        }

        const jTimer = document.getElementById('janken-timer');
        if (jTimer) jTimer.innerText = state.jankenPhase.timer;

        if (window.myId === state.jankenPhase.attackerId && state.jankenPhase.attackerHand) {
            const controls = document.getElementById('janken-controls');
            const title = document.getElementById('janken-title');
            if (controls) controls.style.display = 'none';
            if (title && !state.jankenPhase.result) title.innerText = "相手を待っています...";
        }
        if (window.myId === state.jankenPhase.targetId && state.jankenPhase.targetHand) {
            const controls = document.getElementById('janken-controls');
            const title = document.getElementById('janken-title');
            if (controls) controls.style.display = 'none';
            if (title && !state.jankenPhase.result) title.innerText = "相手を待っています...";
        }

        if (state.jankenPhase.result) {
            if (!window.jankenResultPlayed) {
                window.jankenResultPlayed = true;
                if (typeof window.playJankenResult === 'function') window.playJankenResult(state.jankenPhase.attackerId, state.jankenPhase.targetId, state.jankenPhase.attackerHand, state.jankenPhase.targetHand, state.jankenPhase.result);
            }
        }
    } else {
        window.isJankenShowing = false;
        window.jankenResultPlayed = false;
        window.currentJankenLoopId = null; 
        const jOverlay = document.getElementById('janken-overlay');
        if (jOverlay) {
            jOverlay.classList.remove('result-showing');
            jOverlay.classList.add('hidden');
        }
    }
};

window.broadcastGameState = function(skipUIUpdate = false, attackGuides = []) {
    if (!window.isHost) return;
    const playersInfo = window.game.players.map(p => ({ 
        id: p.id, connected: p.connected, frozen: p.frozen, burnTurns: p.burnTurns, 
        invincibleTurns: p.invincibleTurns, shield: p.shield, evasion: p.evasion, usedRaia: p.usedRaia,
        // ★追加: 裂傷と蘇生の情報を他プレイヤーにも送る
        lacerationTurns: p.lacerationTurns, 
        resurrectionEveCount: p.resurrectionEveCount, 
        resurrectionMisaCount: p.resurrectionMisaCount
    }));
    const state = {
        deck: window.game.deck, turnIndex: window.game.turnIndex, direction: window.game.direction,
        hands: window.game.hands, discardPile: window.game.discardPile, discardRotations: window.game.discardRotations,
        drawStack: window.game.drawStack, currentColor: window.game.currentColor, playersInfo: playersInfo,
        hasDrawnThisTurn: window.game.hasDrawnThisTurn,
        defensePhase: window.pendingDefense ? window.pendingDefense.info : null,
        defenseTimer: window.pendingDefense ? window.pendingDefense.timer : 0,
        attackGuides: attackGuides,
        abilityGraveyard: window.game.abilityGraveyard,
        jankenPhase: window.pendingJanken,
        customDeck: window.game.customDeck 
    };
    if (window.socket) window.socket.emit('sync_game_state', state);
    if (!skipUIUpdate) window.updateUI();

    window.updatePhaseUI(state);

    if (attackGuides && attackGuides.length > 0) {
        attackGuides.forEach(g => {
            const delay = g.delay || 0;
            setTimeout(() => {
                if (typeof window.showAttackGuide === 'function') window.showAttackGuide(g.from, g.to, g.text, g.se);
            }, delay);
        });
    }
};

window.playOpponentAnimation = function(playerId, cards, callback) {
    const badge = document.querySelector(`.other-player-badge[data-id="${playerId}"]`);
    const discardEl = document.getElementById('discard-pile');
    if (!badge || !discardEl || !cards || cards.length === 0) { if(callback) callback(); return; }
    const startRect = badge.getBoundingClientRect(); const endRect = discardEl.getBoundingClientRect();
    function animateSingle(index) {
        if (index >= cards.length) { if(callback) callback(); return; }
        const dummyCard = Renderer.createCardElement(cards[index]); dummyCard.style.width = '40px'; dummyCard.style.height = '60px';
        const endX = endRect.left + (endRect.width / 2) + (Math.floor(Math.random() * 11) - 5);
        const endY = endRect.top + (endRect.height / 2) + (Math.floor(Math.random() * 11) - 5);
        if(typeof CardAnimation !== 'undefined') CardAnimation.moveCard(dummyCard, startRect, endX, endY, Math.floor(Math.random() * 21) - 10, () => {});
        setTimeout(() => animateSingle(index + 1), 100);
    }
    animateSingle(0);
};

window.drawOpponentAnimation = function(playerId, count, callback) {
    if (window.SE) window.SE.playMultiple('Distribute', count, 500);
    const badge = document.querySelector(`.other-player-badge[data-id="${playerId}"]`);
    const deckEl = document.getElementById('deck-visual');
    if (!badge || !deckEl || count <= 0) { if(callback) callback(); return; }
    const startRect = deckEl.getBoundingClientRect(); const endRect = badge.getBoundingClientRect();
    const endX = endRect.left + (endRect.width / 2); const endY = endRect.top + (endRect.height / 2);
    function animateSingle(remaining) {
        if (remaining <= 0) { if(callback) callback(); return; }
        const dummyCard = document.createElement('div'); dummyCard.className = 'card back'; dummyCard.style.width = '40px'; dummyCard.style.height = '60px';
        if(typeof CardAnimation !== 'undefined') CardAnimation.moveCard(dummyCard, startRect, endX, endY, 0, () => {});
        setTimeout(() => animateSingle(remaining - 1), 100);
    }
    animateSingle(count);
};

window.showAttackGuide = function(fromId, toId, labelText, seName) {
    if (seName && window.SE) window.SE.play(seName);

    let fromEl = document.querySelector(`.circle-player-badge[data-id="${fromId}"]`);
    let toEl = document.querySelector(`.circle-player-badge[data-id="${toId}"]`);
    
    if (!fromEl && fromId === window.game.myId) fromEl = document.getElementById('my-player-info');
    if (!toEl && toId === window.game.myId) toEl = document.getElementById('my-player-info');
    
    if (!fromEl || !toEl) return;

    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();
    
    const startX = fromRect.left + fromRect.width / 2;
    const startY = fromRect.top + fromRect.height / 2;
    const endX = toRect.left + toRect.width / 2;
    const endY = toRect.top + toRect.height / 2;
    
    const dx = endX - startX;
    const dy = endY - startY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 10) return;

    const midX = (startX + endX) / 2 - dy * 0.3;
    const midY = (startY + endY) / 2 + dx * 0.3;

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.style.position = 'fixed';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100vw';
    svg.style.height = '100vh';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '900000'; 

    const defs = document.createElementNS(svgNS, "defs");
    const markerId = 'arrow-attack-' + fromId + toId + Date.now();
    const marker = document.createElementNS(svgNS, "marker");
    marker.setAttribute('id', markerId); 
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '8');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '6');
    marker.setAttribute('markerHeight', '6');
    marker.setAttribute('orient', 'auto-start-reverse');
    const markerPath = document.createElementNS(svgNS, "path");
    markerPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    markerPath.setAttribute('fill', '#ff5252');
    marker.appendChild(markerPath);
    defs.appendChild(marker);
    svg.appendChild(defs);

    const path = document.createElementNS(svgNS, "path");
    const d = `M ${startX},${startY} Q ${midX},${midY} ${endX},${endY}`;
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#ff5252');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('stroke-dasharray', '8 8');
    path.setAttribute('marker-end', `url(#${markerId})`);
    
    const length = dist * 1.5; 
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length;

    const text = document.createElementNS(svgNS, "text");
    text.setAttribute('x', midX);
    text.setAttribute('y', midY - 10);
    text.setAttribute('fill', '#fbc02d');
    text.setAttribute('font-size', '16px');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('stroke', '#000');
    text.setAttribute('stroke-width', '1');
    text.textContent = labelText;

    svg.appendChild(path);
    svg.appendChild(text);
    document.body.appendChild(svg);

    path.animate([
        { strokeDashoffset: length, opacity: 1 },
        { strokeDashoffset: 0, opacity: 1, offset: 0.6 },
        { strokeDashoffset: 0, opacity: 0 }
    ], { duration: 1500, easing: 'ease-out', fill: 'forwards' });

    text.animate([
        { opacity: 0, transform: `translateY(15px)` },
        { opacity: 1, transform: `translateY(0px)`, offset: 0.2 },
        { opacity: 1, transform: `translateY(0px)`, offset: 0.8 },
        { opacity: 0, transform: `translateY(-15px)` }
    ], { duration: 1500, easing: 'ease-out', fill: 'forwards' });

    setTimeout(() => { if (document.body.contains(svg)) document.body.removeChild(svg); }, 2000);
};

window.showAbilityResetUI = function(maxCount) {
    const overlay = document.getElementById('ability-reset-overlay');
    const resetArea = document.getElementById('reset-area');
    const handArea = document.getElementById('reset-hand-area');
    const btnConfirm = document.getElementById('btn-reset-confirm');
    const timerSpan = document.getElementById('reset-timer');
    const maxSpan = document.getElementById('reset-max');
    
    if(!overlay) return;
    
    let timeLeft = 10;
    maxSpan.innerText = maxCount;
    resetArea.innerHTML = '';
    handArea.innerHTML = '';
    let selectedCards = [];
    let myAbilities = window.game.myHand.filter(c => c.value && String(c.value).startsWith('id_'));
    
    const renderCards = () => {
        resetArea.innerHTML = '';
        selectedCards.forEach((c, idx) => {
            const el = Renderer.createCardElement(c);
            el.style.transform = 'none'; el.style.position = 'static'; el.style.margin = '0';
            el.onclick = () => {
                selectedCards.splice(idx, 1);
                myAbilities.push(c);
                renderCards();
            };
            resetArea.appendChild(el);
        });
        
        handArea.innerHTML = '';
        myAbilities.forEach((c, idx) => {
            const el = Renderer.createCardElement(c);
            el.style.transform = 'none'; el.style.position = 'static'; el.style.margin = '0';
            el.onclick = () => {
                if (selectedCards.length < maxCount) {
                    myAbilities.splice(idx, 1);
                    selectedCards.push(c);
                    renderCards();
                }
            };
            handArea.appendChild(el);
        });
    };
    renderCards();
    overlay.classList.remove('hidden');
    
    const finish = () => {
        clearInterval(timerInt);
        overlay.classList.add('hidden');
        if (selectedCards.length > 0) {
            const vals = selectedCards.map(c => c.value);
            if (window.isHost) {
                window.game.replaceAbilityCards(window.game.myId, vals);
                window.updateUI();
            } else {
                if(window.socket) window.socket.emit('player_action', { action: 'ability_reset', cards: vals });
            }
        }
    };
    
    btnConfirm.onclick = finish;
    const timerInt = setInterval(() => {
        timeLeft--;
        timerSpan.innerText = timeLeft;
        if (timeLeft <= 0) finish();
    }, 1000);
};

window.animateInitialDeal = function(targetHands, callback) {
    const playerIds = window.game.players.map(p => p.id);
    window.game.hands = {};
    playerIds.forEach(id => { window.game.hands[id] = []; });
    window.updateUI(); 

    const deckEl = document.getElementById('deck-visual');
    if (!deckEl) {
        window.game.hands = JSON.parse(JSON.stringify(targetHands)); window.updateUI();
        if (callback) callback(); return;
    }

    const startRect = deckEl.getBoundingClientRect();
    const handSize = targetHands[playerIds[0]] ? targetHands[playerIds[0]].length : 0;
    const totalDeals = handSize * playerIds.length;
    
    let dealIndex = 0;
    let completedDeals = 0; 

    function checkComplete() {
        completedDeals++;
        if (completedDeals >= totalDeals) {
            window.game.hands = JSON.parse(JSON.stringify(targetHands));
            window.updateUI();
            window.isInitialDealing = false;
            
            if (window.RuleSettings && window.RuleSettings.abilityResetCount > 0) {
                if (typeof window.showAbilityResetUI === 'function') {
                    window.showAbilityResetUI(window.RuleSettings.abilityResetCount);
                }
                if (window.isHost) {
                    setTimeout(() => {
                        window.broadcastGameState();
                        window.checkTurn();
                    }, 13000);
                }
            } else {
                window.updateUI();
                if (window.isHost) setTimeout(() => window.checkTurn(), 500);
            }
            if (callback) callback();
        }
    }

    function dealNext() {
        if (dealIndex >= totalDeals) return;

        const pIdx = dealIndex % playerIds.length;
        const round = Math.floor(dealIndex / playerIds.length);
        const pId = playerIds[pIdx];

        if (window.SE) window.SE.play('Distribute'); 

        const dummyCard = document.createElement('div');
        dummyCard.className = 'card back';
        dummyCard.style.width = '40px'; 
        dummyCard.style.height = '60px';

        let endX, endY;
        if (pId === window.game.myId) {
            const handEl = document.getElementById('player-hand');
            const rect = handEl.getBoundingClientRect();
            endX = rect.left + rect.width / 2;
            endY = rect.top + rect.height / 2;
        } else {
            const badge = document.querySelector(`.other-player-badge[data-id="${pId}"]`);
            if (badge) {
                const rect = badge.getBoundingClientRect();
                endX = rect.left + rect.width / 2;
                endY = rect.top + rect.height / 2;
            } else {
                endX = window.innerWidth / 2;
                endY = window.innerHeight / 2;
            }
        }

        if (typeof CardAnimation !== 'undefined' && CardAnimation.moveCard) {
            CardAnimation.moveCard(dummyCard, startRect, endX, endY, 0, () => {
                if (targetHands[pId] && targetHands[pId][round]) {
                    window.game.hands[pId].push(targetHands[pId][round]);
                    window.updateUI();
                }
                checkComplete();
            });
        } else {
            if (targetHands[pId] && targetHands[pId][round]) {
                window.game.hands[pId].push(targetHands[pId][round]);
                window.updateUI();
            }
            checkComplete();
        }

        dealIndex++;
        if (dealIndex < totalDeals) setTimeout(dealNext, 120); 
    }

    dealNext();
};

window.showAbilityCutin = function(cardValue, isHVActivated = false) {
    window.ensureModalsExist();
    const cutinEl = document.getElementById('ability-cutin');
    const cutinImg = document.getElementById('ability-cutin-img');
    const cutinName = document.getElementById('ability-cutin-name');
    const cutinText = document.getElementById('ability-cutin-text');
    if (!cutinEl || !cutinImg) return;
    
    cutinImg.src = `card/custom/${cardValue}.png`;
    
    if (window.AbilityDef && window.AbilityDef[cardValue]) {
        if (cutinName) cutinName.innerText = window.AbilityDef[cardValue].name;
        if (cutinText) cutinText.innerText = window.AbilityDef[cardValue].desc;
    }

    cutinEl.classList.remove('hidden', 'fade-out');
    void cutinEl.offsetWidth; 
    cutinEl.classList.add('show-cutin');
    
    if (cardValue === 'id_20') {
        const rand = Math.random() < 0.5 ? 1 : 2;
        if (window.SE) window.SE.play(`hv/id_20(${rand})`);
    } else if (cardValue === 'id_25') {
        // 修正: id_25（ミサ）は id_25 を再生する
        if (window.SE) window.SE.play(`hv/id_25`);
    } else if (cardValue === 'id_26') {
        // 修正: id_26（運命の三姉妹）は id_26 を再生する
        if (window.SE) window.SE.play(`hv/id_26`);
    } else if (cardValue === 'id_35') {
        // イヴ(id_35)の専用SEを再生
        if (window.SE) window.SE.play(`hv/id_35`);
    } else {
        const randMvp = Math.random() < 0.5 ? 1 : 2;
        if (window.SE) window.SE.play(`mvp_${randMvp}`);
    }

    setTimeout(() => {
        cutinEl.classList.remove('show-cutin'); 
        cutinEl.classList.add('fade-out');
        setTimeout(() => cutinEl.classList.add('hidden'), 400); 
    }, 2000); 
};

window.openTargetSelection = function(players, callback) {
    window.ensureModalsExist();
    const modal = document.getElementById('target-modal');
    const list = document.getElementById('target-modal-list');
    
    const validPlayers = players || (window.game && window.game.players) || [];
    const targets = validPlayers.filter(p => p.id !== window.game.myId);

    if (targets.length === 0) { callback(window.game.myId); return; }
    if (targets.length === 1) { callback(targets[0].id); return; }

    list.innerHTML = '';
    const defaultIcon = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

    targets.forEach(p => {
        const btn = document.createElement('div');
        btn.className = 'target-icon-btn';
        btn.innerHTML = `<img src="${p.icon || defaultIcon}"><span style="font-size:10px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:60px;">${p.name}</span>`;
        btn.onclick = () => { modal.classList.add('hidden'); callback(p.id); };
        list.appendChild(btn);
    });
    modal.classList.remove('hidden');
};

window.openDiscardSelection = function(hand, excludeIndices, def, callback) {
    window.ensureModalsExist();
    const modal = document.getElementById('discard-modal');
    const list = document.getElementById('discard-modal-list');

    const isAbilityDiscard = def && def.needsAbilityDiscard;

    if (!modal || !list) {
        const discardable = hand.findIndex((c, i) => {
            if (excludeIndices.includes(i)) return false;
            if (isAbilityDiscard) return (c.value && String(c.value).startsWith('id_'));
            return !(c.value && String(c.value).startsWith('id_'));
        });
        callback(discardable > -1 ? discardable : 0);
        return;
    }

    list.innerHTML = '';
    let addedCount = 0;
    hand.forEach((card, idx) => {
        if (excludeIndices.includes(idx)) return;
        const isAb = card.value && String(card.value).startsWith('id_');
        if (isAbilityDiscard && !isAb) return;
        if (!isAbilityDiscard && def && def.needsDiscard && isAb) return;

        const btn = Renderer.createCardElement(card);
        btn.style.width = '50px'; btn.style.height = '75px'; btn.style.margin = '5px'; btn.style.cursor = 'pointer';
        btn.onclick = () => { modal.classList.add('hidden'); callback(idx); };
        list.appendChild(btn);
        addedCount++;
    });
    
    if(addedCount === 0) {
        modal.classList.add('hidden'); callback(null);
    } else {
        modal.classList.remove('hidden');
    }
};

window.openMultiDiscardSelection = function(hand, validIndices, callback) {
    window.ensureModalsExist();
    const modal = document.getElementById('multi-discard-modal');
    const list = document.getElementById('multi-discard-modal-list');
    const btnConfirm = document.getElementById('btn-multi-discard-confirm');

    if (!modal || !list) { callback([]); return; }

    list.innerHTML = '';
    let selectedIndices = [];

    validIndices.forEach(idx => {
        const card = hand[idx];
        const btn = Renderer.createCardElement(card);
        btn.style.width = '50px'; btn.style.height = '75px'; btn.style.margin = '5px'; btn.style.cursor = 'pointer';
        btn.style.transition = '0.2s';
        
        btn.onclick = () => {
            const pos = selectedIndices.indexOf(idx);
            if (pos > -1) {
                selectedIndices.splice(pos, 1);
                btn.style.transform = 'translateY(0)';
                btn.style.border = '1.5px solid white';
            } else {
                selectedIndices.push(idx);
                btn.style.transform = 'translateY(-10px)';
                btn.style.border = '2px solid #f1c40f';
            }
        };
        list.appendChild(btn);
    });

    btnConfirm.onclick = () => {
        modal.classList.add('hidden');
        callback(selectedIndices);
    };

    modal.classList.remove('hidden');
};

window.openGraveyardSelection = function(callback) {
    window.ensureModalsExist();
    const list = window.game.abilityGraveyard.filter(id => {
        const def = window.AbilityDef[id];
        return def && def.rarity !== 'UR';
    });
    
    if (list.length === 0) {
        if(confirm("対象となるSSR以下のカードが墓地にありません。\n適用されない効果がありますが、それでも実行しますか？")) {
            callback(null);
        } else {
            callback(false); 
        }
        return;
    }
    
    const modal = document.getElementById('graveyard-modal');
    const container = document.getElementById('graveyard-list');
    container.innerHTML = '';
    
    list.forEach(id => {
        const btn = document.createElement('img');
        btn.src = `card/custom/${id}.png`;
        btn.style.width = '60px'; btn.style.cursor = 'pointer';
        btn.onclick = () => {
            modal.classList.add('hidden');
            callback(id);
        };
        container.appendChild(btn);
    });

    document.getElementById('btn-cancel-graveyard').onclick = () => {
        modal.classList.add('hidden');
        callback(false); 
    };

    modal.classList.remove('hidden');
};

window.openDebuffSelection = function(callback) {
    window.ensureModalsExist();
    const modal = document.getElementById('debuff-modal');
    const btnFreeze = document.getElementById('btn-debuff-freeze');
    const btnBurn = document.getElementById('btn-debuff-burn');
    
    btnFreeze.onclick = () => { modal.classList.add('hidden'); callback('frozen'); };
    btnBurn.onclick = () => { modal.classList.add('hidden'); callback('burn'); };
    
    modal.classList.remove('hidden');
};

window.showDefenseModal = function(attackCardValue) {
    window.ensureModalsExist();
    const modal = document.getElementById('defense-modal');
    const list = document.getElementById('defense-modal-list');
    const title = document.getElementById('defense-title');
    const desc = document.getElementById('defense-desc');
    const qArea = document.getElementById('defense-question-area');
    const sArea = document.getElementById('defense-select-area');
    const btnYes = document.getElementById('btn-defense-yes');
    const btnNo = document.getElementById('btn-defense-no');
    const btnCancel = document.getElementById('btn-cancel-defense');
    
    if (!modal || !list) {
        if (window.socket) window.socket.emit('player_action', { action: 'defense_response', targetId: window.myId, cardValue: null, discardIdx: null });
        window.isDefending = false;
        return;
    }
    
    let attackName = '能力';
    let attackDesc = ''; 
    
    if (window.AbilityDef && window.AbilityDef[attackCardValue]) {
        attackName = window.AbilityDef[attackCardValue].name;
        attackDesc = window.AbilityDef[attackCardValue].desc; 
    } else if (attackCardValue === '+2' || attackCardValue === 'Wild+4') {
        attackName = attackCardValue;
        attackDesc = '引かされる枚数が増加します！(防御カードで防げます)'; 
    }
    
    title.innerText = `攻撃を受けました！(${attackName})`;
    
    if (desc) {
        if (attackDesc) {
            desc.innerText = attackDesc;
            desc.classList.remove('hidden');
        } else {
            desc.classList.add('hidden');
        }
    }
    
    qArea.classList.remove('hidden');
    sArea.classList.add('hidden');
    
    const myHand = window.game.myHand || [];
    const defCards = myHand.map((c, i) => ({card: c, idx: i}))
                           .filter(item => item.card.value && window.AbilityDef && window.AbilityDef[item.card.value] && window.AbilityDef[item.card.value].type.includes('BL'));
    
    btnYes.onclick = () => {
        if (defCards.length === 0) {
            alert('手札に防御カード(BL)がありません！');
            return;
        }
        
        // ❌ 削除: ここで true にしてしまうと、カードを選ぶ前に1秒ごとの更新で画面が閉じてしまう！
        // window.hasRespondedDefense = true; 
        
        qArea.classList.add('hidden');
        sArea.classList.remove('hidden');
        
        list.innerHTML = '';
        defCards.forEach(item => {
            const btn = Renderer.createCardElement(item.card);
            btn.style.width = '50px'; btn.style.height = '75px'; btn.style.margin = '5px'; btn.style.cursor = 'pointer';
            btn.onclick = () => {
                const def = window.AbilityDef[item.card.value];
                
                if (typeof window.showAbilityCutin === 'function') {
                    window.showAbilityCutin(item.card.value);
                }

                if (def && (def.needsDiscard || def.needsAbilityDiscard)) {
                    modal.classList.add('hidden'); 
                    window.openDiscardSelection(myHand, [item.idx], def, (discIdx) => {
                        window.hasRespondedDefense = true; // ✅ 実際にカードと捨てるカードを確定した「ここ」でフラグを立てる！
                        window.socket.emit('player_action', { action: 'defense_response', targetId: window.game.myId, cardValue: item.card.value, discardIdx: discIdx });
                        window.isDefending = false;
                    });
                } else {
                    modal.classList.add('hidden'); 
                    window.hasRespondedDefense = true; // ✅ 捨てる必要がないカードの場合も、「ここ」でフラグを立てる！
                    window.socket.emit('player_action', { action: 'defense_response', targetId: window.game.myId, cardValue: item.card.value, discardIdx: null });
                    window.isDefending = false;
                }
            };
            list.appendChild(btn);
        });
    };

    btnNo.onclick = () => {
        window.hasRespondedDefense = true; 
        modal.classList.add('hidden'); 
        if(window.socket) window.socket.emit('player_action', { action: 'defense_response', targetId: window.game.myId, cardValue: null, discardIdx: null });
        window.isDefending = false;
    };

    btnCancel.onclick = () => {
        window.hasRespondedDefense = false;
        qArea.classList.remove('hidden');
        sArea.classList.add('hidden');
    };

    modal.classList.remove('hidden');
};

window.startDrawDefensePhase = function(attackerId, targetId, cardValue, guides) {
    let responses = {};
    const p = window.game.players.find(px => px.id === targetId);
    
    if (p && p.type === 'bot') {
        const bHand = window.game.hands[targetId];
        let hasDef = false;
        if(bHand) {
            const blIdx = bHand.findIndex(c => c.value && window.AbilityDef && window.AbilityDef[c.value] && window.AbilityDef[c.value].type.includes('BL'));
            if (blIdx > -1) {
                const blCard = bHand[blIdx];
                let bDiscard = null;
                const def = window.AbilityDef[blCard.value];
                if(def && def.needsDiscard) {
                    const nonAb = bHand.findIndex((c, i) => i !== blIdx && !(c.value && String(c.value).startsWith('id_')));
                    bDiscard = nonAb > -1 ? nonAb : (bHand.length > 1 ? bHand.findIndex((c, i) => i !== blIdx) : null);
                } else if (def && def.needsAbilityDiscard) {
                    const ab = bHand.findIndex((c, i) => i !== blIdx && (c.value && String(c.value).startsWith('id_')));
                    bDiscard = ab > -1 ? ab : null;
                }
                responses[targetId] = { cardValue: blCard.value, discardIdx: bDiscard };
                hasDef = true;
            }
        }
        if(!hasDef) responses[targetId] = { cardValue: null, discardIdx: null };
    } else if (p && p.type === 'player' && !p.connected) {
        responses[targetId] = { cardValue: null, discardIdx: null };
    }

    window.pendingDefense = { 
        timer: 30, 
        responses: responses,
        info: { attackerId: attackerId, cardValue: cardValue, targets: [targetId], phaseId: Date.now() }
    };

    if (Object.keys(responses).length >= 1) window.pendingDefense.timer = 0;

    window.broadcastGameState(false, guides);

    if (targetId === window.game.myId) {
        window.isDefending = true;
        window.showDefenseModal(cardValue);
    }

    const interval = setInterval(() => {
        if (!window.pendingDefense) { clearInterval(interval); return; }
        
        if(window.pendingDefense.timer <= 0) {
            clearInterval(interval);
            const finalResponses = window.pendingDefense.responses;
            window.pendingDefense = null;
            
            let defenseGuides = [];
            let blocked = false;
            
            if (finalResponses && finalResponses[targetId] && finalResponses[targetId].cardValue) {
                const resp = finalResponses[targetId];
                const defCardId = resp.cardValue;
                const tHand = window.game.hands[targetId];
                const cIdx = tHand.findIndex(c => c.value === defCardId);
                
                let actualDefDiscardIdx = resp.discardIdx;
                if (cIdx > -1) {
                    if (actualDefDiscardIdx !== null && cIdx < actualDefDiscardIdx) actualDefDiscardIdx--;
                    const playedDefCard = tHand.splice(cIdx, 1)[0];
                    
                    if(!window.game.abilityGraveyard) window.game.abilityGraveyard = [];
                    window.game.abilityGraveyard.push(playedDefCard.value);

                    if (window.isHost && window.socket) window.socket.emit('request_play_animation', { playerId: targetId, cards: [playedDefCard] });
                    
                    if (targetId !== window.game.myId && typeof window.showAbilityCutin === 'function') {
                        window.showAbilityCutin(defCardId);
                    }

                    defenseGuides.push({ from: targetId, to: targetId, text: '防ぐ!', delay: 2500 });
                    blocked = true;
                }
                
                if (actualDefDiscardIdx !== null && tHand && tHand.length > actualDefDiscardIdx) {
                    const discCard = tHand.splice(actualDefDiscardIdx, 1)[0];
                    if (window.isHost && window.socket) window.socket.emit('request_play_animation', { playerId: targetId, cards: [discCard] });
                    if (window.AbilityEngine && window.AbilityEngine.triggerDiscardEffect) {
                        window.AbilityEngine.triggerDiscardEffect(window.game, targetId, discCard.value, true, discCard);
                    }
                    if (discCard.value && String(discCard.value).startsWith('id_')) {
                        window.game.abilityGraveyard.push(discCard.value);
                    } else {
                        window.game.discardPile.push(discCard);
                        window.game.discardRotations.push(0);
                    }
                }

                const def = window.AbilityDef[defCardId];
                if (defCardId === 'id_2') {
                    window.game.players.filter(px => px.id !== targetId).forEach(px => {
                        window.AbilityEngine.applyDraw(window.game, px.id, 1);
                    });
                    const targetP = window.game.players.find(p=>p.id===targetId);
                    if(targetP) targetP.shield = { level: 1, turns: 1 };
                    if (Math.random() < 0.6) {
                        window.game.players.filter(px => px.id !== targetId).forEach(px => {
                            window.AbilityEngine.applyDraw(window.game, px.id, 1);
                        });
                    }
                } else if (defCardId === 'id_4') {
                    if (window.AbilityEngine && window.AbilityEngine.triggerDiscardEffect) {
                        window.AbilityEngine.triggerDiscardEffect(window.game, targetId, 'id_4', false, null);
                    }
                } else if (defCardId === 'id_9') {
                    window.game.players.filter(px => px.id !== targetId).forEach(px => {
                        window.AbilityEngine.applyDraw(window.game, px.id, 2);
                    });
                } else if (defCardId === 'id_18') {
                    window.game.players.filter(px => px.id !== targetId).forEach(px => {
                        window.AbilityEngine.applyDraw(window.game, px.id, 1);
                    });
                    const targetP = window.game.players.find(p=>p.id===targetId);
                    if(targetP) targetP.shield = { level: 1, turns: 2 };
                } else if (defCardId === 'id_19') {
                    window.AbilityEngine.applyDraw(window.game, attackerId, 1);
                    defenseGuides.push({ from: targetId, to: attackerId, text: 'ヴィンディ', delay: 2500 });
                } else if (defCardId === 'id_30') {
                    const others = window.game.players.filter(px => px.id !== targetId && px.connected);
                    if (others.length > 0) {
                        const bt = others[Math.floor(Math.random() * others.length)];
                        window.AbilityEngine.applyBurn(window.game, bt.id, 1);
                        defenseGuides.push({ from: targetId, to: bt.id, text: '🔥燃焼(1T)', delay: 2500 });
                    }
                    const targetP = window.game.players.find(p=>p.id===targetId);
                    if (targetP) targetP.shield = { level: 1, turns: 1 };
                } else if (defCardId === 'id_31') {
                    const targetP = window.game.players.find(p=>p.id===targetId);
                    if (targetP) {
                        if (!targetP.shield) targetP.shield = { level: 0, turns: 0 };
                        targetP.shield.level += 3;
                        targetP.shield.turns += 3;
                        defenseGuides.push({ from: targetId, to: targetId, text: '🛡️シールド強化!', delay: 2500 });
                    }
                }
            }

            if (blocked) window.game.drawStack = 0; 

            window.broadcastGameState(false, defenseGuides);

            let someoneWon = false;
            window.game.players.forEach(p => {
                if (window.game.hands[p.id] && window.game.hands[p.id].length === 0) {
                    window.checkWin(p.id); someoneWon = true;
                }
            });

            if (!someoneWon) setTimeout(() => window.checkTurn(), 500); 
        } else {
            window.pendingDefense.timer--;
            window.broadcastGameState(true);
        }
    }, 1000);
};

window.executeAbilityPlay = function(playerId, indices, targetId, discardIdx, selectedColor = null, multiDiscardIndices = [], extraData = {}) {
    if (!window.isHost) return;
    
    const hand = window.game.hands[playerId];
    if (!hand || !hand[indices[0]]) return; 

    const originalHand = [...hand];
    const playedCards = indices.map(i => originalHand[i]);
    const cardValue = playedCards[0].value;
    const def = window.AbilityDef ? window.AbilityDef[cardValue] : null;

    if (!def) {
        window.executePlay(playerId, indices, false);
        return;
    }

    const multiplier = indices.length; 
    const discCard = discardIdx !== null ? originalHand[discardIdx] : null;
    const multiCards = (multiDiscardIndices || []).map(i => originalHand[i]);

    let allRemoveIndices = [...indices];
    if (discardIdx !== null) allRemoveIndices.push(discardIdx);
    if (multiDiscardIndices && multiDiscardIndices.length > 0) allRemoveIndices.push(...multiDiscardIndices);
    
    allRemoveIndices = [...new Set(allRemoveIndices)].sort((a,b) => b - a);
    allRemoveIndices.forEach(i => hand.splice(i, 1));

    playedCards.forEach(c => {
        const isAb = c.value && String(c.value).startsWith('id_');
        if (isAb) {
            if(!window.game.abilityGraveyard) window.game.abilityGraveyard = [];
            window.game.abilityGraveyard.push(c.value);
        } else {
            window.game.discardPile.push(c); 
            window.game.discardRotations.push(0);
        }
    });

    if (cardValue === 'id_26') {
        setTimeout(() => {
            window.startJankenPhase(playerId, 0);
        }, 2500);
        return; 
    }

    if (def.type === 'AT' || def.type === 'AT_BL' || def.type === 'HV') {
        let targets = [];
        if (def.needsTarget && targetId) targets = [targetId];
        else if (['id_2', 'id_6', 'id_9', 'id_18', 'id_29'].includes(cardValue)) targets = window.game.players.filter(p=>p.id!==playerId).map(p=>p.id);
        else if (['id_13', 'id_14', 'id_24', 'id_28'].includes(cardValue)) {
            const others = window.game.players.filter(p=>p.id!==playerId);
            if(others.length > 0) targets = [others[Math.floor(Math.random()*others.length)].id];
        } else if (cardValue === 'id_5' || cardValue === 'id_20') {
            targets = [playerId]; 
        }
        
        let responses = {};
        let needsDefense = false;
        
        if (cardValue !== 'id_28') { 
            targets.forEach(tid => {
                const p = window.game.players.find(px=>px.id===tid);
                if(p && p.type==='bot') {
                    const bHand = window.game.hands[tid];
                    let hasDef = false;
                    if(bHand && def.type !== 'HV' && cardValue !== 'id_5' && cardValue !== 'id_20') {
                        const blIdx = bHand.findIndex(c => c.value && window.AbilityDef && window.AbilityDef[c.value] && window.AbilityDef[c.value].type.includes('BL'));
                        if (blIdx > -1) {
                            const blCard = bHand[blIdx];
                            let bDiscard = null;
                            const bDef = window.AbilityDef[blCard.value];
                            if(bDef && bDef.needsDiscard) {
                                const nonAb = bHand.findIndex((c, i) => i !== blIdx && !(c.value && String(c.value).startsWith('id_')));
                                bDiscard = nonAb > -1 ? nonAb : (bHand.length > 1 ? bHand.findIndex((c, i) => i !== blIdx) : null);
                            } else if (bDef && bDef.needsAbilityDiscard) {
                                const ab = bHand.findIndex((c, i) => i !== blIdx && (c.value && String(c.value).startsWith('id_')));
                                bDiscard = ab > -1 ? ab : null;
                            }
                            responses[tid] = { cardValue: blCard.value, discardIdx: bDiscard };
                            hasDef = true;
                        }
                    }
                    if(!hasDef) responses[tid] = { cardValue: null, discardIdx: null };
                } else if (p && p.type === 'player' && !p.connected) {
                    responses[tid] = { cardValue: null, discardIdx: null };
                } else if (def.type === 'HV' || cardValue === 'id_5' || cardValue === 'id_20') {
                    responses[tid] = { cardValue: null, discardIdx: null }; 
                } else {
                    needsDefense = true;
                }
            });
        }

        if (cardValue === 'id_28' || !needsDefense) {
            let guides = [];
            if (window.AbilityEngine) guides = window.AbilityEngine.resolve(window.game, playerId, cardValue, targetId, discCard, responses, multiplier, selectedColor, multiCards, extraData);
            guides.forEach(g => { if(g.delay === undefined) g.delay = 2500; });
            window.broadcastGameState(false, guides);

            let someoneWon = false;
            window.game.players.forEach(p => {
                if (window.game.hands[p.id] && window.game.hands[p.id].length === 0) {
                    window.checkWin(p.id); someoneWon = true;
                }
            });
            if (!someoneWon) setTimeout(() => window.checkTurn(), 500);
            return;
        }

        window.pendingDefense = { 
            timer: 30, 
            responses: responses,
            info: { attackerId: playerId, cardValue: cardValue, targets: targets, phaseId: Date.now() }
        };

        if (Object.keys(responses).length >= targets.length) window.pendingDefense.timer = 0;

        window.broadcastGameState();

        if (def.type !== 'HV' && cardValue !== 'id_5' && cardValue !== 'id_20' && targets.includes(window.game.myId) && window.game.myId !== playerId) {
            window.isDefending = true;
            window.showDefenseModal(cardValue);
        }

        const interval = setInterval(() => {
            if (!window.pendingDefense) { clearInterval(interval); return; }
            
            if(window.pendingDefense.timer <= 0) {
                clearInterval(interval);
                const finalResponses = window.pendingDefense.responses;
                window.pendingDefense = null;
                
                let guides = [];

                if (finalResponses) {
                    Object.keys(finalResponses).forEach(tid => {
                        const resp = finalResponses[tid];
                        if (resp && resp.cardValue) {
                            const defCardId = resp.cardValue;
                            const tHand = window.game.hands[tid];
                            const cIdx = tHand.findIndex(c => c.value === defCardId);
                            
                            let actualDefDiscardIdx = resp.discardIdx;
                            if (cIdx > -1) {
                                if (actualDefDiscardIdx !== null && cIdx < actualDefDiscardIdx) actualDefDiscardIdx--;
                                const playedDefCard = tHand.splice(cIdx, 1)[0];
                                
                                if(!window.game.abilityGraveyard) window.game.abilityGraveyard = [];
                                window.game.abilityGraveyard.push(playedDefCard.value);
                                
                                if (window.isHost && window.socket) window.socket.emit('request_play_animation', { playerId: tid, cards: [playedDefCard] });
                                
                                if (tid !== window.game.myId && typeof window.showAbilityCutin === 'function') {
                                    window.showAbilityCutin(defCardId);
                                }
                                guides.push({ from: tid, to: tid, text: '防ぐ!', delay: 2500 });
                            }
                            
                            if (actualDefDiscardIdx !== null && tHand && tHand.length > actualDefDiscardIdx) {
                                const discCard = tHand.splice(actualDefDiscardIdx, 1)[0];
                                if (window.isHost && window.socket) window.socket.emit('request_play_animation', { playerId: tid, cards: [discCard] });
                                if (window.AbilityEngine && window.AbilityEngine.triggerDiscardEffect) {
                                    window.AbilityEngine.triggerDiscardEffect(window.game, tid, discCard.value, true, discCard);
                                }
                                if (discCard.value && String(discCard.value).startsWith('id_')) {
                                    window.game.abilityGraveyard.push(discCard.value);
                                } else {
                                    window.game.discardPile.push(discCard);
                                    window.game.discardRotations.push(0);
                                }
                            }
                            
                            const def = window.AbilityDef[defCardId];
                            if (defCardId === 'id_2') {
                                window.game.players.filter(px => px.id !== tid).forEach(px => {
                                    window.AbilityEngine.applyDraw(window.game, px.id, 1);
                                });
                                const targetP = window.game.players.find(p=>p.id===tid);
                                if(targetP) targetP.shield = { level: 1, turns: 1 };
                                if (Math.random() < 0.6) {
                                    window.game.players.filter(px => px.id !== tid).forEach(px => {
                                        window.AbilityEngine.applyDraw(window.game, px.id, 1);
                                    });
                                }
                            } else if (defCardId === 'id_4') {
                                if (window.AbilityEngine && window.AbilityEngine.triggerDiscardEffect) {
                                    window.AbilityEngine.triggerDiscardEffect(window.game, tid, 'id_4', false, null);
                                }
                            } else if (defCardId === 'id_9') {
                                window.game.players.filter(px => px.id !== tid).forEach(px => {
                                    window.AbilityEngine.applyDraw(window.game, px.id, 2);
                                });
                            } else if (defCardId === 'id_18') {
                                window.game.players.filter(px => px.id !== tid).forEach(px => {
                                    window.AbilityEngine.applyDraw(window.game, px.id, 1);
                                });
                                const targetP = window.game.players.find(p=>p.id===tid);
                                if(targetP) targetP.shield = { level: 1, turns: 2 };
                            } else if (defCardId === 'id_19') {
                                window.AbilityEngine.applyDraw(window.game, playerId, 1);
                                guides.push({ from: tid, to: playerId, text: 'ヴィンディ', delay: 2500 });
                            } else if (defCardId === 'id_30') {
                                const others = window.game.players.filter(px => px.id !== tid && px.connected);
                                if (others.length > 0) {
                                    const bt = others[Math.floor(Math.random() * others.length)];
                                    window.AbilityEngine.applyBurn(window.game, bt.id, 1);
                                    guides.push({ from: tid, to: bt.id, text: '🔥燃焼(1T)', delay: 2500 });
                                }
                                const targetP = window.game.players.find(p=>p.id===tid);
                                if (targetP) targetP.shield = { level: 1, turns: 1 };
                            } else if (defCardId === 'id_31') {
                                const targetP = window.game.players.find(p=>p.id===tid);
                                if (targetP) {
                                    if (!targetP.shield) targetP.shield = { level: 0, turns: 0 };
                                    targetP.shield.level += 3;
                                    targetP.shield.turns += 3;
                                    guides.push({ from: tid, to: tid, text: '🛡️シールド強化!', delay: 2500 });
                                }
                            }
                        }
                    });
                }

                if (window.AbilityEngine) {
                    let resolveGuides = window.AbilityEngine.resolve(window.game, playerId, cardValue, targetId, discCard, finalResponses, multiplier, selectedColor, multiCards, extraData);
                    guides = resolveGuides.concat(guides);
                }
                guides.forEach(g => { if(g.delay === undefined) g.delay = 2500; });

                window.broadcastGameState(false, guides);

                let someoneWon = false;
                window.game.players.forEach(p => {
                    if (window.game.hands[p.id] && window.game.hands[p.id].length === 0) {
                        window.checkWin(p.id); someoneWon = true;
                    }
                });

                if (!someoneWon) setTimeout(() => window.checkTurn(), 500); 
            } else {
                window.pendingDefense.timer--;
                window.broadcastGameState(true);
            }
        }, 1000);
    } else {
        let guides = [];
        if (window.AbilityEngine) guides = window.AbilityEngine.resolve(window.game, playerId, cardValue, targetId, discCard, {}, multiplier, selectedColor, multiCards, extraData);
        guides.forEach(g => { if(g.delay === undefined) g.delay = 2500; });
        
        window.broadcastGameState(false, guides);

        let someoneWon = false;
        window.game.players.forEach(p => {
            if (window.game.hands[p.id] && window.game.hands[p.id].length === 0) {
                window.checkWin(p.id); someoneWon = true;
            }
        });

        if (!someoneWon) setTimeout(() => window.checkTurn(), 500);
    }
};

window.startJankenPhase = function(attackerId, loopCount, fixedTargetId = null) {
    if (window.jankenInterval) clearInterval(window.jankenInterval);

    let targetId = fixedTargetId;
    if (!targetId) {
        const others = window.game.players.filter(p => p.id !== attackerId && p.connected);
        if (others.length === 0) {
            alert("じゃんけんの相手がいません！");
            window.checkTurn();
            return;
        }
        targetId = others[Math.floor(Math.random() * others.length)].id;
    }
    
    window.pendingJanken = {
        attackerId, targetId, loopCount,
        attackerHand: null, targetHand: null,
        timer: 10,
        result: null
    };

    window.broadcastGameState(); 

    window.jankenInterval = setInterval(() => {
        if (!window.pendingJanken || window.pendingJanken.result) {
            clearInterval(window.jankenInterval);
            return;
        }
        
        window.pendingJanken.timer--;
        if (window.pendingJanken.timer <= 0) {
            clearInterval(window.jankenInterval);
            if (!window.pendingJanken.attackerHand) window.pendingJanken.attackerHand = Math.floor(Math.random()*3)+1;
            if (!window.pendingJanken.targetHand) window.pendingJanken.targetHand = Math.floor(Math.random()*3)+1;
            window.resolveJanken();
        } else {
            [attackerId, targetId].forEach(id => {
                const p = window.game.players.find(px => px.id === id);
                if (p && p.type === 'bot' && !window.pendingJanken[(id===attackerId?'attackerHand':'targetHand')]) {
                    if (window.pendingJanken.timer === 8) { 
                        window.pendingJanken[(id===attackerId?'attackerHand':'targetHand')] = Math.floor(Math.random()*3)+1;
                        window.checkJankenReady();
                    }
                }
            });
            window.broadcastGameState(true);
        }
    }, 1000);
};

window.checkJankenReady = function() {
    if (window.pendingJanken && window.pendingJanken.attackerHand && window.pendingJanken.targetHand && !window.pendingJanken.result) {
        if (window.jankenInterval) clearInterval(window.jankenInterval);
        window.resolveJanken();
    }
};

window.resolveJanken = function() {
    if (window.jankenInterval) clearInterval(window.jankenInterval);

    const pJ = window.pendingJanken;
    const aH = pJ.attackerHand;
    const tH = pJ.targetHand;
    
    let result = 'draw';
    if (aH === tH) result = 'draw';
    else if ((aH===1 && tH===2) || (aH===2 && tH===3) || (aH===3 && tH===1)) result = 'win';
    else result = 'lose';

    pJ.result = result;
    window.broadcastGameState(); 

    setTimeout(() => {
        let drawCount = 2; // 初回は結果によらず2ドロー
        let winOrDrawDrawn = false;

        if (result === 'win' || result === 'draw') {
            winOrDrawDrawn = true;
            // 相手2ドロー
            window.AbilityEngine.applyDraw(window.game, pJ.targetId, drawCount, false, true);
            
            // 自分はランダムな「既存カード」を1枚捨てる
            const aHand = window.game.hands[pJ.attackerId];
            if (aHand) {
                const normalCardIndices = [];
                aHand.forEach((c, idx) => {
                    const isAb = c.value && String(c.value).startsWith('id_');
                    if (!isAb) normalCardIndices.push(idx);
                });

                if (normalCardIndices.length > 0) {
                    const rIdx = normalCardIndices[Math.floor(Math.random() * normalCardIndices.length)];
                    const discCard = aHand.splice(rIdx, 1)[0];
                    window.game.discardPile.push(discCard);
                    window.game.discardRotations.push(0);
                } else {
                    // 捨てれるカードがない場合は相手に+1ドロー
                    window.AbilityEngine.applyDraw(window.game, pJ.targetId, 1, false, true);
                }
            }
        } else if (result === 'lose' && pJ.loopCount === 0) {
            // 初回負けの場合も相手2ドローのみ
            window.AbilityEngine.applyDraw(window.game, pJ.targetId, drawCount, false, true);
        }
        
        const guides = [{ from: pJ.attackerId, to: pJ.targetId, text: 'じゃんけんドロー!', delay: 0 }];
        window.broadcastGameState(false, guides);

        let someoneWon = false;
        window.game.players.forEach(p => {
            if (window.game.hands[p.id] && window.game.hands[p.id].length === 0) {
                window.checkWin(p.id); someoneWon = true;
            }
        });

        if (!someoneWon) {
            const nextLoop = pJ.loopCount + 1;
            const aId = pJ.attackerId;

            // ★修正: 勝つもしくはあいこだった場合、最大4回まで「UIを閉じずに」再戦へ移行する
            if ((result === 'win' || result === 'draw') && nextLoop < 4) {
                setTimeout(() => {
                    window.startJankenPhase(aId, nextLoop);
                }, 1000);
            } else {
                // ★修正: 負けた時、または上限(4回)に達した時のみデータを消してUIを閉じる
                window.pendingJanken = null;
                window.broadcastGameState();
                
                setTimeout(() => window.checkTurn(), 1000);
            }
        }
    }, 4500); 
};

window.showJankenUI = function(attackerId, targetId, loopCount) {
    window.ensureModalsExist();
    let overlay = document.getElementById('janken-overlay');
    if (!overlay) return;

    const jankenLoopId = `${attackerId}-${targetId}-${loopCount}`;
    if (window.currentJankenLoopId !== jankenLoopId) {
        window.currentJankenLoopId = jankenLoopId;
    }

    overlay.classList.remove('result-showing');
    overlay.classList.remove('hidden');
    
    const title = document.getElementById('janken-title');
    const subtitle = document.getElementById('janken-subtitle');
    const p1Name = document.getElementById('janken-p1-name');
    const p2Name = document.getElementById('janken-p2-name');
    const p1Card = document.getElementById('janken-p1-card');
    const p2Card = document.getElementById('janken-p2-card');
    const p1Res = document.getElementById('janken-p1-result');
    const p2Res = document.getElementById('janken-p2-result');
    const controls = document.getElementById('janken-controls');
    
    if (title) title.innerText = `じゃんけん 勝負！`;
    if (subtitle) subtitle.innerText = `運命の三姉妹 (Loop: ${loopCount+1}/4)`;
    
    const aP = window.game.players.find(p=>p.id===attackerId);
    const tP = window.game.players.find(p=>p.id===targetId);
    if (p1Name) p1Name.innerText = aP ? aP.name : 'Attacker';
    if (p2Name) p2Name.innerText = tP ? tP.name : 'Target';
    
    if (p1Card) { p1Card.src = window.JANKEN_BACK_IMG; p1Card.style.borderTop = '10px solid transparent'; }
    if (p2Card) { p2Card.src = window.JANKEN_BACK_IMG; p2Card.style.borderTop = '10px solid transparent'; }
    if (p1Res) p1Res.innerText = ''; 
    if (p2Res) p2Res.innerText = '';
    
    if (controls) {
        if (window.myId === attackerId || window.myId === targetId) {
            controls.style.display = 'flex';
        } else {
            controls.style.display = 'none';
            if (title) title.innerText = "じゃんけん観戦中...";
        }
    }
};

window.playJankenResult = function(attackerId, targetId, aH, tH, result) {
    const overlay = document.getElementById('janken-overlay');
    if (overlay) overlay.classList.add('result-showing'); 

    const p1Card = document.getElementById('janken-p1-card');
    const p2Card = document.getElementById('janken-p2-card');
    const p1Res = document.getElementById('janken-p1-result');
    const p2Res = document.getElementById('janken-p2-result');
    const controls = document.getElementById('janken-controls');
    const title = document.getElementById('janken-title');
    
    if (controls) controls.style.display = 'none';
    if (title) title.innerText = "結果発表！";
    
    if (p1Card) {
        p1Card.src = `card/custom/jyanken${aH}.png`;
        p1Card.onerror = function() { this.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 60'%3E%3Crect width='40' height='60' rx='6' fill='%23555'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23fff' font-size='16'%3E手" + aH + "%3C/text%3E%3C/svg%3E"; };
    }
    if (p2Card) {
        p2Card.src = `card/custom/jyanken${tH}.png`;
        p2Card.onerror = function() { this.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 60'%3E%3Crect width='40' height='60' rx='6' fill='%23555'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23fff' font-size='16'%3E手" + tH + "%3C/text%3E%3C/svg%3E"; };
    }
    
    if (result === 'win') {
        if (p1Res) { p1Res.innerText = 'Win'; p1Res.style.color = '#fbc02d'; }
        if (p1Card) p1Card.style.borderTop = '10px solid #fbc02d';
        if (p2Res) { p2Res.innerText = 'Lose'; p2Res.style.color = '#7e57c2'; }
        if (p2Card) p2Card.style.borderTop = '10px solid #7e57c2';
        
        if (window.myId === attackerId) { if(window.SE) window.SE.play('win'); }
        else if (window.myId === targetId) { if(window.SE) window.SE.play('win2'); }

        // ★追加: 勝った時に1秒待機して id_26.mp3 を再生
        setTimeout(() => {
            if (window.SE) window.SE.play('hv/id_26');
        }, 1000);

    } else if (result === 'lose') {
        if (p1Res) { p1Res.innerText = 'Lose'; p1Res.style.color = '#7e57c2'; }
        if (p1Card) p1Card.style.borderTop = '10px solid #7e57c2';
        if (p2Res) { p2Res.innerText = 'Win'; p2Res.style.color = '#fbc02d'; }
        if (p2Card) p2Card.style.borderTop = '10px solid #fbc02d';
        if (window.myId === targetId) { if(window.SE) window.SE.play('win'); }
        else if (window.myId === attackerId) { if(window.SE) window.SE.play('win2'); }
    } else {
        if (p1Res) { p1Res.innerText = 'Draw'; p1Res.style.color = '#aaa'; }
        if (p1Card) p1Card.style.borderTop = '10px solid #aaa';
        if (p2Res) { p2Res.innerText = 'Draw'; p2Res.style.color = '#aaa'; }
        if (p2Card) p2Card.style.borderTop = '10px solid #aaa';
    setTimeout(() => {
            if (window.SE) window.SE.play('hv/id_26');
        }, 1000);
    }
};

window.checkTurn = function() {
    if (!window.isHost || window.isGameOver || window.isInitialDealing) return; 
    clearInterval(window.turnTimer); 
    const current = window.game.currentPlayer;
    if (!current) return;
    
    let dispName = current.name;
    if(current.type === 'bot' && window.RuleSettings && window.RuleSettings.showBotPersonality && current.personality) dispName += ` [${current.personality}]`;

    if (current.type === 'bot') {
        const roomStr = window.currentRoomState ? ` - 部屋ID:${window.currentRoomState.id}` : "";
        document.getElementById('status-message').innerText = `${dispName} が考え中...${roomStr}`;
        window.broadcastGameState();
        setTimeout(() => {
            if(window.isGameOver || window.isInitialDealing) return; 
            const result = UNOBot.play(window.game, current.id);
            if (result.action === 'play') {
                const playedCards = result.indices.map(i => window.game.hands[current.id][i]);
                const isAbility = playedCards[0] && playedCards[0].value && String(playedCards[0].value).startsWith('id_');
                
                const def = isAbility && window.AbilityDef ? window.AbilityDef[playedCards[0].value] : null;

                if (isAbility && def && def.type === 'BL') {
                    window.socket.emit('request_play_animation', { playerId: current.id, cards: playedCards });
                    setTimeout(() => {
                        window.executeAbilityPlay(current.id, result.indices, null, null, null, [], {});
                    }, playedCards.length * 100 + 400);
                    return;
                }

                let willDiscard = (isAbility && def && (def.needsDiscard || def.needsAbilityDiscard)) ? 1 : 0;
                
                let botSelectedColor = null;
                let botMultiDiscardIndices = [];
                let botDiscardIdx = null;

                if (isAbility && def) {
                    if (def.needsColor) botSelectedColor = ['red', 'blue', 'green', 'yellow'][Math.floor(Math.random() * 4)];
                    if (def.needsAbilityDiscard) {
                        const bHand = window.game.hands[current.id];
                        const discIdx = bHand.findIndex((c, i) => !result.indices.includes(i) && (c.value && String(c.value).startsWith('id_')));
                        botDiscardIdx = discIdx > -1 ? discIdx : null;
                    } else if (def.needsDiscard) {
                        const bHand = window.game.hands[current.id];
                        const discIdx = bHand.findIndex((c, i) => !result.indices.includes(i) && !(c.value && String(c.value).startsWith('id_')));
                        botDiscardIdx = discIdx > -1 ? discIdx : (bHand.length > result.indices.length ? bHand.findIndex((c,i)=>!result.indices.includes(i)) : null);
                    }
                    
                }

                const remainingCards = window.game.hands[current.id].length - playedCards.length - willDiscard;
                
                if (remainingCards === 1 || remainingCards === 0) window.socket.emit('declare_uno', { id: current.id, name: current.name });
                
                window.socket.emit('request_play_animation', { playerId: current.id, cards: playedCards });
                const delay = playedCards.length * 100 + 400;
                
                setTimeout(() => {
                    if (isAbility) {
                        let botTargetId = null;
                        if (def && def.needsTarget) {
                            const others = window.game.players.filter(p=>p.id!==current.id);
                            if(others.length>0) botTargetId = others[Math.floor(Math.random()*others.length)].id;
                        }
                        
                        let extraData = {};
                        if (def && def.needsGraveyard) {
                            const gyList = window.game.abilityGraveyard.filter(id => window.AbilityDef[id] && window.AbilityDef[id].rarity !== 'UR');
                            if (gyList.length > 0) extraData.graveyardCardId = gyList[Math.floor(Math.random() * gyList.length)];
                        }
                        if (def && def.needsDebuffSelect) {
                            const p = window.game.players.find(x=>x.id===current.id);
                            if (p && p.frozen) extraData.debuffToClear = 'frozen';
                            else if (p && p.burnTurns > 0) extraData.debuffToClear = 'burn';
                        }

                        window.executeAbilityPlay(current.id, result.indices, botTargetId, botDiscardIdx, botSelectedColor, botMultiDiscardIndices, extraData);
                    } else {
                        window.executePlay(current.id, result.indices, true);
                    }
                }, delay);
            } else {
                const drawCount = result.count || 1;
                window.socket.emit('request_draw_animation', { playerId: current.id, count: drawCount });
                setTimeout(() => window.executeDraw(current.id, true), drawCount * 100 + 400);
            }
        }, 1500);
    } else {
        const roomStr = window.currentRoomState ? ` - 部屋ID:${window.currentRoomState.id}` : "";
        document.getElementById('status-message').innerText = current.id === window.game.myId ? `あなたの番です${roomStr}` : `${dispName} のターン${roomStr}`;
        window.broadcastGameState();
        window.turnTimer = setInterval(() => {
            if (!window.playerAfkTimes[current.id]) window.playerAfkTimes[current.id] = 0;
            window.playerAfkTimes[current.id]++;
            if (window.playerAfkTimes[current.id] >= 180) {
                clearInterval(window.turnTimer);
                if(window.isGameOver || window.isInitialDealing) return;
                window.playerAfkTimes[current.id] = 0; 
                setTimeout(() => {
                    const result = UNOBot.play(window.game, current.id);
                    if (result.action === 'play') {
                        const playedCards = result.indices.map(i => window.game.hands[current.id][i]);
                        const isAbility = playedCards[0] && playedCards[0].value && String(playedCards[0].value).startsWith('id_');
                        
                        const def = isAbility && window.AbilityDef ? window.AbilityDef[playedCards[0].value] : null;

                        if (isAbility && def && def.type === 'BL') {
                            window.socket.emit('request_play_animation', { playerId: current.id, cards: playedCards });
                            setTimeout(() => {
                                window.executeAbilityPlay(current.id, result.indices, null, null, null, [], {});
                            }, playedCards.length * 100 + 400);
                            return;
                        }

                        let willDiscard = (isAbility && def && (def.needsDiscard || def.needsAbilityDiscard)) ? 1 : 0;
                        let botSelectedColor = null;
                        let botMultiDiscardIndices = [];
                        let botDiscardIdx = null;

                        if (isAbility && def) {
                            if (def.needsColor) botSelectedColor = ['red', 'blue', 'green', 'yellow'][Math.floor(Math.random() * 4)];
                            if (def.needsAbilityDiscard) {
                                const bHand = window.game.hands[current.id];
                                const discIdx = bHand.findIndex((c, i) => !result.indices.includes(i) && (c.value && String(c.value).startsWith('id_')));
                                botDiscardIdx = discIdx > -1 ? discIdx : null;
                            } else if (def.needsDiscard) {
                                const bHand = window.game.hands[current.id];
                                const discIdx = bHand.findIndex((c, i) => !result.indices.includes(i) && !(c.value && String(c.value).startsWith('id_')));
                                botDiscardIdx = discIdx > -1 ? discIdx : (bHand.length > result.indices.length ? bHand.findIndex((c,i)=>!result.indices.includes(i)) : null);
                            }
                        }

                        const remainingCards = window.game.hands[current.id].length - playedCards.length - willDiscard;
                        
                        if (remainingCards === 1 || remainingCards === 0) window.socket.emit('declare_uno', { id: current.id, name: current.name });
                        
                        window.socket.emit('request_play_animation', { playerId: current.id, cards: playedCards });
                        setTimeout(() => {
                            if (isAbility) {
                                let botTargetId = null;
                                if (def && def.needsTarget) {
                                    const others = window.game.players.filter(p=>p.id!==current.id);
                                    if(others.length>0) botTargetId = others[Math.floor(Math.random()*others.length)].id;
                                }

                                let extraData = {};
                                if (def && def.needsGraveyard) {
                                    const gyList = window.game.abilityGraveyard.filter(id => window.AbilityDef[id] && window.AbilityDef[id].rarity !== 'UR');
                                    if (gyList.length > 0) extraData.graveyardCardId = gyList[Math.floor(Math.random() * gyList.length)];
                                }
                                if (def && def.needsDebuffSelect) {
                                    const p = window.game.players.find(x=>x.id===current.id);
                                    if (p && p.frozen) extraData.debuffToClear = 'frozen';
                                    else if (p && p.burnTurns > 0) extraData.debuffToClear = 'burn';
                                }

                                window.executeAbilityPlay(current.id, result.indices, botTargetId, botDiscardIdx, botSelectedColor, botMultiDiscardIndices, extraData);
                            } else window.executePlay(current.id, result.indices, true);
                        }, playedCards.length * 100 + 400);
                    } else {
                        const drawCount = result.count || 1;
                        window.socket.emit('request_draw_animation', { playerId: current.id, count: drawCount });
                        setTimeout(() => window.executeDraw(current.id, true), drawCount * 100 + 400);
                    }
                }, 1000);
            }
        }, 1000);
    }
};

window.executePlay = function(playerId, indices, isBot = false) {
    if (!window.isHost || window.isGameOver || window.isInitialDealing) return;
    
    clearInterval(window.turnTimer); 
    if(window.playerAfkTimes) window.playerAfkTimes[playerId] = 0; 
    
    const result = window.game.playCards(playerId, indices);
    
    if (result.penalty) { 
        document.getElementById('status-message').innerText = `${result.penaltyReason}上がり禁止ペナルティ！`; 
        window.broadcastGameState(); setTimeout(window.checkTurn, 1000); return; 
    }
    
    if (result.success) {
        let guides = [];
        let isDrawAttack = false;
        let attackCardVal = null;
        let targetId = null;

        if (result.lastCard && (result.lastCard.value === '+2' || result.lastCard.value === 'Wild+4')) {
            attackCardVal = result.lastCard.value;
            isDrawAttack = true;
        }

        if (window.checkWin(playerId)) return;
        if (result.isAbility) { window.broadcastGameState(false, guides); setTimeout(() => { window.checkTurn(); }, 500); return; }

        if (result.needsColor) {
            if (isDrawAttack) {
                if (window.RuleSettings && window.RuleSettings.customCards && window.RuleSettings.customCards.length === 0) {
                    // 何もしない
                } else {
                    window.pendingDrawDefenseInfo = { attackerId: playerId, cardValue: attackCardVal };
                }
            }
            if (isBot) { 
                window.game.currentColor = ['red', 'blue', 'green', 'yellow'][Math.floor(Math.random() * 4)]; 
                window.executeColor(playerId, window.game.currentColor); 
            } 
            else if (playerId === window.game.myId) { 
                const roomStr = window.currentRoomState ? ` - 部屋ID:${window.currentRoomState.id}` : "";
                document.getElementById('status-message').innerText = `色を選択してください${roomStr}`; 
                ColorUI.show(); window.broadcastGameState(false, guides); 
            } 
            else { 
                const roomStr = window.currentRoomState ? ` - 部屋ID:${window.currentRoomState.id}` : "";
                document.getElementById('status-message').innerText = `色選択中...${roomStr}`; 
                window.socket.emit('request_color_select', playerId); window.broadcastGameState(false, guides); 
            }
        } else { 
            if (isDrawAttack) {
                targetId = window.game.currentPlayer.id;
                guides.push({ from: playerId, to: targetId, text: attackCardVal, delay: 0 }); 
                if (window.RuleSettings && window.RuleSettings.customCards && window.RuleSettings.customCards.length > 0) {
                    window.startDrawDefensePhase(playerId, targetId, attackCardVal, guides);
                } else {
                    window.broadcastGameState(false, guides);
                    window.checkTurn(); 
                }
            } else {
                window.broadcastGameState(false, guides);
                window.checkTurn(); 
            }
        }
    } else {
        if (isBot) window.executeDraw(playerId, true); else window.checkTurn(); 
    }
};

window.executeColor = function(playerId, color) {
    if (!window.isHost || window.isGameOver || window.isInitialDealing) return;
    
    if(window.playerAfkTimes) window.playerAfkTimes[playerId] = 0; 
    window.game.currentColor = color; 
    
    const info = window.pendingDrawDefenseInfo;
    window.pendingDrawDefenseInfo = null;

    window.game.nextTurn(1); 
    
    if (info) {
        const targetId = window.game.currentPlayer.id;
        const guides = [{ from: info.attackerId, to: targetId, text: info.cardValue, delay: 0 }];
        if (window.RuleSettings && window.RuleSettings.customCards && window.RuleSettings.customCards.length > 0) {
            window.startDrawDefensePhase(info.attackerId, targetId, info.cardValue, guides);
        } else {
            window.broadcastGameState(false, guides);
            window.checkTurn();
        }
    } else {
        window.checkTurn();
    }
};

// ★修正: ホスト側の処理を厳格化（「現在ターンか？」をチェック）
window.executeDraw = function(playerId, isBot = false) {
    if (!window.isHost || window.isGameOver || window.isInitialDealing) return;
    
    // 【重要】現在のターンのプレイヤーかチェック
    const current = window.game.currentPlayer;
    if (!current || current.id !== playerId) return;

    clearInterval(window.turnTimer);
    if(window.playerAfkTimes) window.playerAfkTimes[playerId] = 0;
    
    const stack = window.game.drawStack; 
    const count = stack > 0 ? stack : 1;
    
    for(let i=0; i<count; i++) { 
        if(!window.game.drawCard(playerId)) { if(window.isGameOver) return; break; } 
    }
    
    if (stack > 0) { 
        window.game.drawStack = 0; 
        window.game.nextTurn(1); 
        window.checkTurn(); 
    } else { 
        if (isBot) { 
            window.game.nextTurn(1); window.checkTurn(); 
        } else { 
            // ドロー後に自動でターンを終了させず、引いた状態（hasDrawnThisTurn）にする
            window.game.hasDrawnThisTurn = true; 
            window.broadcastGameState(); 
        } 
    }
};

// ★修正: 終了時も厳格化
window.executeEndTurn = function(playerId) {
    if (!window.isHost || window.isGameOver || window.isInitialDealing) return;
    
    // 【重要】現在のターンのプレイヤーかチェック
    const current = window.game.currentPlayer;
    if (!current || current.id !== playerId) return;

    clearInterval(window.turnTimer);
    if(window.playerAfkTimes) window.playerAfkTimes[playerId] = 0; 
    window.game.nextTurn(1); 
    window.checkTurn();
};

window.checkWin = function(playerId) {
    if (window.game.hands[playerId] && window.game.hands[playerId].length === 0) {
        window.isGameOver = true; 
        if (window.SE) window.SE.stopLoop('final_sprint'); 
        window.broadcastGameState(); 
        const winner = window.game.players.find(p => p.id === playerId);
        let winnerName = winner ? winner.name : "不明なプレイヤー";
        if (winner && winner.type === 'bot' && window.RuleSettings && window.RuleSettings.showBotPersonality && winner.personality) winnerName += ` [${winner.personality}]`;
        setTimeout(() => { if(window.socket) window.socket.emit('announce_win', { winnerId: playerId, winnerName: winnerName }); }, 500);
        return true;
    }
    return false;
};

window.animateSequentialPlay = function(indices, gameInstance, callback) {
    if (indices.length === 0) { if(callback) callback(); return; }
    const playerHandEl = document.getElementById('player-hand');
    if (!playerHandEl) { if(callback) callback(); return; }
    const currentIndex = indices[0];
    const cardEl = playerHandEl.children[currentIndex];
    if (!cardEl) return window.animateSequentialPlay(indices.slice(1), gameInstance, callback);
    const targetRotation = Math.floor(Math.random() * 21) - 10;
    if (typeof CardAnimation !== 'undefined' && CardAnimation.animatePlay) {
        CardAnimation.animatePlay(cardEl, targetRotation, () => setTimeout(() => window.animateSequentialPlay(indices.slice(1), gameInstance, callback), 100));
    } else window.animateSequentialPlay(indices.slice(1), gameInstance, callback);
};

window.declareUno = function() {
    if (window.isInitialDealing) return; 
    window.game.unoDeclared = true; window.updateUI();
    const me = window.game.players.find(p => p.id === window.game.myId);
    if(me && window.socket) window.socket.emit('declare_uno', { id: me.id, name: me.name });
};

window.tryDrawWithAbility = function(callback) {
    const me = window.game.players.find(p => p.id === window.game.myId);
    const renaIdx = window.game.myHand.findIndex(c => c.value === 'id_9');
    if (renaIdx > -1 && !me.frozen) {
        if (confirm("【レナ】カードを引く代わりに「レナ」を場に出して効果を発動しますか？")) {
            window.isDrawing = false; 
            window.game.selectedIndices = [renaIdx]; window.handlePlayAction(); return; 
        }
    }
    callback(); 
};

window.handlePlayAction = function() {
    if (window.game.selectedIndices.length === 0 || window.isGameOver || window.isInitialDealing || window.isDrawing) return;
    if (window.pendingJanken) return; 

    if (window.pendingDefense || window.currentDefensePhaseId) {
        alert("現在、他の能力が処理中です。解決するまでお待ちください。");
        window.game.selectedIndices = []; window.updateUI(); return;
    }

    if (window.isProcessingPlay) return; 
    window.isProcessingPlay = true;
    
    const me = window.game.players.find(p => p.id === window.game.myId);
    const selectedCards = window.game.selectedIndices.map(i => window.game.myHand[i]);
    const lastCard = selectedCards[selectedCards.length - 1];
    const cardValue = lastCard.value;
    
    if (!lastCard) { window.game.selectedIndices = []; window.updateUI(); window.isProcessingPlay = false; return; }

    const isAbility = selectedCards[0] && selectedCards[0].value && String(selectedCards[0].value).startsWith('id_');
    const isAction = !/^[0-9]$/.test(lastCard.value) && !isAbility;
    const def = isAbility && window.AbilityDef ? window.AbilityDef[selectedCards[0].value] : null;

    if (isAbility && def && def.type === 'BL') {
        const indicesToSend = [...window.game.selectedIndices]; 
        const cardsToSend = [...selectedCards];
        window.game.selectedIndices = []; window.updateUI();
        
        window.animateSequentialPlay(indicesToSend, window.game, () => {
            if (window.isHost) {
                if (window.socket) window.socket.emit('request_play_animation', { playerId: window.game.myId, cards: cardsToSend });
                window.executeAbilityPlay(window.game.myId, indicesToSend, null, null, null, [], {});
            } else if (window.socket) {
                window.socket.emit('player_action', { action: 'play_ability', indices: indicesToSend, cards: cardsToSend, targetId: null, discardIdx: null, selectedColor: null, multiDiscardIndices: [], isHV: false, extraData: {} });
            }
            window.isProcessingPlay = false; 
        });
        return;
    }

    if (!window.game.isMyTurn && !isAbility) {
        window.game.selectedIndices = []; window.updateUI(); window.isProcessingPlay = false; return;
    }
    
    if (me.frozen && !isAbility) {
        alert("凍結中は能力カードしか使用できません！"); window.game.selectedIndices = []; window.updateUI(); window.isProcessingPlay = false; return;
    }
    if (selectedCards.some(c => c.lockedTurns && c.lockedTurns > 0)) {
        alert("ロックされているカードは使用できません！"); window.game.selectedIndices = []; window.updateUI(); window.isProcessingPlay = false; return;
    }

    if (!isAbility) {
        const isLegalPlay = UNORules.canPlaySelected(selectedCards, window.game.topCard, window.game.currentColor, window.game.drawStack);
        if (!isLegalPlay) { if (window.SE) window.SE.play('Impossible'); window.isProcessingPlay = false; return; }
    }

    let willDiscard = (isAbility && def && (def.needsDiscard || def.needsAbilityDiscard)) ? 1 : 0;
    const finalHandCount = window.game.myHand.length - selectedCards.length - willDiscard;

    const willBeActionFinishPenalty = (finalHandCount <= 0 && isAction && window.RuleSettings && !window.RuleSettings.allowActionFinish);
    const willBeAbilityFinishPenalty = (finalHandCount <= 0 && isAbility && window.RuleSettings && !window.RuleSettings.allowAbilityFinish);
    
    if (willBeActionFinishPenalty || willBeAbilityFinishPenalty || (finalHandCount <= 0 && !window.game.unoDeclared && window.RuleSettings && !window.RuleSettings.unoAuto)) {
        let penaltyCount = window.RuleSettings.unoPenalty || 2;
        let penaltyMsg = "UNO宣言忘れ！";
        
        if (willBeActionFinishPenalty) {
            penaltyCount = window.RuleSettings.actionFinishPenalty || 3;
            penaltyMsg = "記号上がり禁止！";
        } else if (willBeAbilityFinishPenalty) {
            penaltyCount = window.RuleSettings.abilityFinishPenalty || 3;
            penaltyMsg = "能力上がり禁止！";
        }

        window.game.selectedIndices = []; window.updateUI(); 
        alert(`${penaltyMsg} ペナルティとして ${penaltyCount}枚ドローします！`); 
        
        window.isDrawing = true; 
        window.tryDrawWithAbility(() => {
            if (window.SE) window.SE.playMultiple('Distribute', penaltyCount, 500);
            if (typeof CardAnimation !== 'undefined' && CardAnimation.animateMultiDraw) {
                CardAnimation.animateMultiDraw(penaltyCount, 'player-hand', () => {
                    window.isDrawing = false;
                    window.isProcessingPlay = false; 
                    window.game.selectedIndices = []; window.updateUI();
                    if (window.isHost) {
                        if(window.socket) window.socket.emit('request_draw_animation', { playerId: window.game.myId, count: penaltyCount });
                        for(let i=0; i<penaltyCount; i++) window.game.drawCard(window.game.myId);
                        window.executeEndTurn(window.game.myId); 
                    } else if(window.socket) {
                        window.socket.emit('player_action', { action: 'draw_penalty', count: penaltyCount });
                        setTimeout(() => window.socket.emit('player_action', { action: 'end_turn' }), 500); 
                    }
                });
            } else {
                window.isDrawing = false;
                window.isProcessingPlay = false; 
                window.game.selectedIndices = []; window.updateUI();
                if (window.isHost) {
                    if(window.socket) window.socket.emit('request_draw_animation', { playerId: window.game.myId, count: penaltyCount });
                    for(let i=0; i<penaltyCount; i++) window.game.drawCard(window.game.myId);
                    window.executeEndTurn(window.game.myId);
                } else if(window.socket) {
                    window.socket.emit('player_action', { action: 'draw_penalty', count: penaltyCount });
                    setTimeout(() => window.socket.emit('player_action', { action: 'end_turn' }), 500);
                }
            }
        });
        return; 
    }

    const shouldAutoUno = window.RuleSettings && window.RuleSettings.unoAuto && (finalHandCount === 1 || finalHandCount === 0) && !window.game.unoDeclared;
    if (shouldAutoUno) window.declareUno();

    const indices = [...window.game.selectedIndices];
    const playedCards = indices.map(i => window.game.myHand[i]);

    if (isAbility) {
        let targetId = null; let discardIdx = null; let selColor = null; let multiDiscardIndices = [];
        let debuffToClear = null; let graveyardCardId = null;
        let extraData = {};

        const finishAbilityPlay = () => {
            window.game.selectedIndices = []; window.updateUI();
            const indicesToSend = [...indices]; const cardsToSend = [...playedCards];
            if (debuffToClear) extraData.debuffToClear = debuffToClear;
            if (graveyardCardId) extraData.graveyardCardId = graveyardCardId;

            window.animateSequentialPlay(indices, window.game, () => {
                const isHVActivated = (cardValue === 'id_20') || (def && def.needsAbilityDiscard && discardIdx !== null);
                window.showAbilityCutin(cardsToSend[0].value, isHVActivated);
                if (window.isHost) {
                    if (window.socket) window.socket.emit('request_play_animation', { playerId: window.game.myId, cards: cardsToSend, isHV: isHVActivated });
                    window.executeAbilityPlay(window.game.myId, indicesToSend, targetId, discardIdx, selColor, multiDiscardIndices, extraData);
                } else if (window.socket) {
                    window.socket.emit('player_action', { action: 'play_ability', indices: indicesToSend, cards: cardsToSend, targetId: targetId, discardIdx: discardIdx, selectedColor: selColor, multiDiscardIndices, isHV: isHVActivated, extraData });
                }
                window.isProcessingPlay = false; 
            });
        };

        const step6 = () => {
            if (def && def.needsGraveyard) {
                window.openGraveyardSelection((selectedId) => {
                    if (selectedId === false) { 
                        window.game.selectedIndices = []; window.updateUI(); window.isProcessingPlay = false; return; 
                    }
                    graveyardCardId = selectedId;
                    finishAbilityPlay();
                });
            } else { finishAbilityPlay(); }
        }

        window.localRaiaReturnedTurn = window.localRaiaReturnedTurn || -1;
        const stepRaia = () => {
            if (cardValue === 'id_33' && !me.usedRaia) {
                if (confirm("ライアの効果により、次の自分のターン開始時にこのカードを手札に戻しますか？\n(各ターン1回のみ)")) {
                    extraData.returnRaia = true;
                    me.usedRaia = true; 
                }
            }
            step6();
        }

        const step5 = () => {
            if (def && def.needsDebuffSelect && me.frozen && me.burnTurns > 0) {
                window.openDebuffSelection((selected) => {
                    debuffToClear = selected;
                    stepRaia();
                });
            } else if (def && def.needsDebuffSelect) {
                if (me.frozen) debuffToClear = 'frozen';
                else if (me.burnTurns > 0) debuffToClear = 'burn';
                stepRaia();
            } else {
                stepRaia();
            }
        };

        // ▼ 修正後（これだけに書き換える）
        const step4 = () => {
            step5(); // レベッカのカード選択は自動化されたためスキップ
        };

        const step3 = () => {
            if (def && def.needsColor) {
                ColorUI.show((color) => { selColor = color; step4(); });
            } else { step4(); }
        };

        const step2 = () => {
            if (def && (def.needsDiscard || def.needsAbilityDiscard)) {
                window.openDiscardSelection(window.game.myHand, indices, def, (idx) => { 
                    discardIdx = idx; step3(); 
                });
            } else { step3(); }
        };

        if (def && def.needsTarget) {
            window.openTargetSelection(window.game.players, (tid) => { targetId = tid; step2(); });
        } else { step2(); }

        return; 
    }

    window.game.selectedIndices = []; window.updateUI();
    const indicesToSend = [...indices]; const cardsToSend = [...playedCards];
    window.animateSequentialPlay(indices, window.game, () => {
        if (window.isHost) {
            if (window.socket) window.socket.emit('request_play_animation', { playerId: window.game.myId, cards: cardsToSend });
            window.executePlay(window.game.myId, indicesToSend);
        } else if (window.socket) window.socket.emit('player_action', { action: 'play', indices: indicesToSend, cards: cardsToSend });
        window.isProcessingPlay = false; 
    });
};

window.onColorChosen = function(color) { 
    ColorUI.hide(); 
    if (ColorUI.callback) {
        let cb = ColorUI.callback;
        ColorUI.callback = null;
        cb(color);
    } else {
        if (window.isHost) window.executeColor(window.game.myId, color); 
        else if (window.socket) window.socket.emit('player_action', { action: 'color', color: color }); 
    }
};

// ★修正: 参加者側のボタン連打・重複送信防止
document.getElementById('draw-btn').onclick = function() {
    if (window.pendingJanken || window.isDrawing || window.isProcessingPlay) return; 
    if (!window.game.isMyTurn || window.isGameOver || window.isInitialDealing) return;
    if (window.game.hasDrawnThisTurn && window.RuleSettings && !window.RuleSettings.optionalDraw) return;
    
    // ★ 物理的にボタンを無効化（disabled）して、2回目のクリックを絶対に防ぐ
    window.isDrawing = true; 
    this.disabled = true;
    this.style.pointerEvents = 'none'; // クリックロック
    this.style.opacity = '0.5'; // 見た目もグレーアウトさせる
    
    window.tryDrawWithAbility(() => {
        window.game.hasDrawnThisTurn = true; 
        window.updateUI();                    
        
        const s = window.game.drawStack; 
        const count = s > 0 ? s : 1;
        
        if (window.isHost) {
            if (window.socket) window.socket.emit('request_draw_animation', { playerId: window.game.myId, count: count }); 
            window.executeDraw(window.game.myId); 
        } else if (window.socket) {
            // アニメーションを待たずに即座に送信！
            window.socket.emit('player_action', { action: 'draw', count: count });
        }

        if (window.SE) window.SE.playMultiple('Distribute', count, 500);

        const finishDraw = () => {
            window.isDrawing = false; 
            const btn = document.getElementById('draw-btn');
            if (btn) {
                btn.style.pointerEvents = 'auto'; // ロック解除
                btn.disabled = false;
                btn.style.opacity = '1';
            }
        };

        if (typeof CardAnimation !== 'undefined' && CardAnimation.animateMultiDraw) {
            CardAnimation.animateMultiDraw(count, 'player-hand', finishDraw);
            setTimeout(finishDraw, 3000); // 異常時の安全装置
        } else {
            setTimeout(finishDraw, 500);
        }
    });
};

// ★修正: 終了ボタンのロック
document.getElementById('end-turn-btn').onclick = () => {
    if (window.pendingJanken || window.isDrawing || window.isProcessingPlay) return; 
    if (!window.game.isMyTurn || window.isGameOver || window.isInitialDealing) return;
    
    window.isDrawing = true; 
    document.getElementById('end-turn-btn').style.pointerEvents = 'none'; // ロック

    if (window.isHost) {
        window.executeEndTurn(window.game.myId); 
    } else if (window.socket) {
        window.socket.emit('player_action', { action: 'end_turn' });
    }
    
    setTimeout(() => { 
        window.isDrawing = false; 
        const btn = document.getElementById('end-turn-btn');
        if (btn) btn.style.pointerEvents = 'auto'; // ロック解除
    }, 1000); 
};

document.getElementById('uno-btn').onclick = window.declareUno;

(() => {
    const btnManual = document.getElementById('btn-manual');
    const manualOverlay = document.getElementById('manual-overlay');
    const manualImage = document.getElementById('manual-image');
    const manualPrev = document.getElementById('manual-prev');
    const manualNext = document.getElementById('manual-next');
    const manualClose = document.getElementById('manual-close');
    const manualIndicators = document.getElementById('manual-indicators');
    let currentManualPage = 1;
    const totalManualPages = 8;

    function updateManualUI() {
        if(!manualImage) return;
        manualImage.src = `ex/ex${currentManualPage}.png`;
        if(manualPrev) manualPrev.classList.toggle('hidden-nav', currentManualPage === 1);
        if(manualNext) manualNext.classList.toggle('hidden-nav', currentManualPage === totalManualPages);
        if(manualClose) manualClose.classList.toggle('hidden', currentManualPage !== totalManualPages);
        let ind = ''; for (let i = 1; i <= totalManualPages; i++) ind += (i === currentManualPage) ? '🔸' : '🔹';
        if(manualIndicators) manualIndicators.innerHTML = ind;
    }
    
    if(btnManual) btnManual.onclick = () => { if(window.SE) window.SE.play('page'); currentManualPage = 1; updateManualUI(); if(manualOverlay) manualOverlay.classList.remove('hidden'); };
    if(manualPrev) manualPrev.onclick = () => { if (currentManualPage > 1) { if(window.SE) window.SE.play('page'); currentManualPage--; updateManualUI(); } };
    if(manualNext) manualNext.onclick = () => { if (currentManualPage < totalManualPages) { if(window.SE) window.SE.play('page'); currentManualPage++; updateManualUI(); } };
    if(manualClose) manualClose.onclick = () => { if(window.SE) window.SE.play('page'); if(manualOverlay) manualOverlay.classList.add('hidden'); };

    let touchStartX = 0;
    if(manualOverlay) {
        manualOverlay.addEventListener('touchstart', (e) => touchStartX = e.changedTouches[0].screenX, { passive: true });
        manualOverlay.addEventListener('touchend', (e) => {
            let endX = e.changedTouches[0].screenX;
            if (endX < touchStartX - 50 && currentManualPage < totalManualPages) { if(window.SE) window.SE.play('page'); currentManualPage++; updateManualUI(); }
            else if (endX > touchStartX + 50 && currentManualPage > 1) { if(window.SE) window.SE.play('page'); currentManualPage--; updateManualUI(); }
        }, { passive: true });
    }
})();

document.addEventListener('DOMContentLoaded', () => { 
    if(window.ensureModalsExist) window.ensureModalsExist();
    if(window.initVolumeControl) window.initVolumeControl(); 
});

function initMainSocketEvents() {
    if (typeof window.socket === 'undefined') {
        setTimeout(initMainSocketEvents, 100);
        return;
    }

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
        if(state.customDeck) window.game.customDeck = state.customDeck;
        
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
                    p.evasion = info.evasion || { level: 0, turns: 0 };
                    p.usedRaia = info.usedRaia || false;
                    // ★追加: 受け取ったデータをプレイヤーに反映させる
                    p.lacerationTurns = info.lacerationTurns || 0;
                    p.resurrectionEveCount = info.resurrectionEveCount !== undefined ? info.resurrectionEveCount : -1;
                    p.resurrectionMisaCount = info.resurrectionMisaCount !== undefined ? info.resurrectionMisaCount : -1;
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
                const delay = g.delay || 0;
                setTimeout(() => {
                    if (typeof window.showAttackGuide === 'function') window.showAttackGuide(g.from, g.to, g.text, g.se);
                }, delay);
            });
        }

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
        if (window.SE) window.SE.stopLoop('final_sprint');
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
        document.getElementById('game-container').classList.add('hidden'); 
        document.getElementById('lobby-screen').classList.remove('hidden');
        
        const manualBtn = document.getElementById('btn-manual');
        if (manualBtn) manualBtn.classList.remove('hidden');

        const cia = document.getElementById('chat-input-area');
        if (cia) {
            cia.style.display = 'none';
            cia.classList.add('hidden');
        }
        
        const lcia = document.getElementById('lobby-chat-container');
        if (lcia && window.ChatManager && window.ChatManager.enabled) lcia.style.display = 'block';
        
        if (typeof renderSlots === 'function') renderSlots(roomState);
    });

    // ★修正: ホスト側のガードを強化
    window.socket.on('receive_player_action', (data) => {
        if (!window.isHost || window.isGameOver || window.isInitialDealing) return;
        const playerId = data.playerId;
        const current = window.game.currentPlayer;
        
        if (data.action === 'play') {
            if (window.pendingDefense || window.pendingJanken) return;
            window.socket.emit('request_play_animation', { playerId: playerId, cards: data.cards });
            const delay = data.cards.length * 100 + 400;
            setTimeout(() => {
                if (typeof window.executePlay === 'function') window.executePlay(playerId, data.indices);
            }, delay);
        } else if (data.action === 'play_ability') {
            if (window.pendingDefense || window.pendingJanken) return;
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
            // 【完全ガード】 その人のターンじゃなければ無視！
            if (!current || current.id !== playerId) return;
            if (window.isProcessingPlay) return; 
            
            // ★超重要修正：スタックの有無や状況に関わらず、ドロー要求は「1ターンに絶対に1回だけ」受け付ける！
            if (window.game.hasDrawnThisTurn) return;

            // ★命令を受信した「瞬間」にフラグを立てて心のシャッターを閉じ、2回目の通信を完全ブロック！
            window.isProcessingPlay = true;
            window.game.hasDrawnThisTurn = true;

            window.socket.emit('request_draw_animation', { playerId: playerId, count: data.count });
            
            // 安全対策：もし不正な通信が来ても最低1枚として扱う
            const safeCount = (typeof data.count === 'number' && data.count > 0) ? data.count : 1;
            const delay = safeCount * 100 + 400;
            
            setTimeout(() => { 
                window.isProcessingPlay = false;
                if (typeof window.executeDraw === 'function') window.executeDraw(playerId); 
            }, delay);

        } else if (data.action === 'end_turn') {
            // 【重要追加ガード】 その人のターンじゃなければ無視！
            if (!current || current.id !== playerId) return;
            if (typeof window.executeEndTurn === 'function') window.executeEndTurn(playerId);

        } else if (data.action === 'color') {
            if (typeof window.executeColor === 'function') window.executeColor(playerId, data.color);
        } else if (data.action === 'draw_penalty') {
            window.socket.emit('request_draw_animation', { playerId: playerId, count: data.count });
            const delay = data.count * 100 + 400;
            setTimeout(() => {
                if (typeof window.game !== 'undefined' && typeof window.game.drawCard === 'function') {
                    for(let i=0; i<data.count; i++) window.game.drawCard(playerId);
                    if (typeof window.executeEndTurn === 'function') window.executeEndTurn(playerId);
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

    window.socket.on('show_color_selector', () => {
        if (typeof ColorUI !== 'undefined' && ColorUI.show) ColorUI.show();
    });

    window.socket.on('receive_chat', (data) => {
        if (window.ChatManager && typeof window.ChatManager.showMsg === 'function') {
            window.ChatManager.showMsg(data.message, data.senderName);
        }
    });

    // ★修正: 再接続時にIDがズレて終了ボタンが効かなくなるバグを防止
    window.socket.on('player_reconnected', (data) => {
        if (window.isHost && window.game && window.game.players) {
            const p = window.game.players.find(x => x.id === data.oldId);
            if (p) {
                p.id = data.newId; 
                p.connected = true;
                if (window.game.hands[data.oldId]) {
                    window.game.hands[data.newId] = window.game.hands[data.oldId];
                    delete window.game.hands[data.oldId];
                }
                window.broadcastGameState(true);
            }
        }
    });
}

initMainSocketEvents();