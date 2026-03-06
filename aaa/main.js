/**
 * main.js (Thin Client Architecture)
 */
window.game = new UNOGame();
window.isGameOver = false;
window.isProcessingPlay = false;

window.ensureModalsExist = function() {
    // 既存のモーダル生成ロジック（そのまま）
    if (!document.getElementById('target-modal')) {
        const targetModal = document.createElement('div');
        targetModal.id = 'target-modal';
        targetModal.className = 'action-popup hidden';
        targetModal.innerHTML = `<h3>対象のプレイヤーを選択</h3><div id="target-modal-list" class="action-popup-grid"></div>`;
        document.body.appendChild(targetModal);
    }
    // ... 他のモーダルも同様に生成（中略） ...
};

window.SE = {
    muted: false,
    volume: 0.5,
    play: function(soundName) {
        if (this.muted) return;
        
        try {
            // 例: 'touch_to_start.mp3' など、実際のファイルパスに合わせて拡張子やフォルダ名を調整してください
            // もし index.html 内に <audio id="se-touch_to_start"> のように定義している場合は
            // const audio = document.getElementById('se-' + soundName); のように取得してください。
            
            const audio = new Audio(`se/${soundName}.mp3`); // ← 元の構成に合わせてパスを変更してください
            audio.volume = this.volume;
            audio.play().catch(e => {
                // ブラウザの自動再生ブロック等によるエラーを無視
                console.warn("SE再生エラー (クリック前などの理由):", e);
            });
        } catch (e) {
            console.error("SE読み込みエラー:", e);
        }
    },
    setVolume: function(vol) {
        this.volume = vol;
    }
};

window.initVolumeControl = function() { 
    /* 元々あった音量スライダー等の初期化ロジックがあればここに入れます */ 
};

const ColorUI = { 
    callback: null,
    show: function(cb = null) { this.callback = cb; document.getElementById('color-selector').classList.remove('hidden'); }, 
    hide: function() { document.getElementById('color-selector').classList.add('hidden'); } 
};

window.updateUI = function() { 
    if(window.game && window.game.players && window.game.players.length > 0) { 
        Renderer.updateAll(window.game); 
    } 
};

window.updatePhaseUI = function(state) {
    // --- 防御(シールド等)UIの制御 ---
    if (state.defensePhase && state.defensePhase.targets.includes(window.myId)) {
        if (typeof window.showDefenseModal === 'function') {
            window.showDefenseModal(state.defensePhase.cardValue);
        }
    } else {
        const defModal = document.getElementById('defense-modal');
        if (defModal) defModal.classList.add('hidden');
    }

    // --- じゃんけんUIの制御（ここを追加・修正） ---
    if (state.jankenPhase && (state.jankenPhase.attackerId === window.myId || state.jankenPhase.targetId === window.myId)) {
        if (typeof window.showJankenModal === 'function') {
            window.showJankenModal(state.jankenPhase);
        } else {
            // 既存のじゃんけんUI表示ロジックがある場合はそれを呼び出す
            const jankenModal = document.getElementById('janken-modal');
            if (jankenModal) jankenModal.classList.remove('hidden');
        }
    } else {
        // じゃんけんフェーズが終わったら確実に隠す
        const jankenModal = document.getElementById('janken-modal');
        if (jankenModal) jankenModal.classList.add('hidden');
        window.pendingJanken = null;
    }
};

// --- 追加：じゃんけんの手をサーバーに送る関数 ---
window.sendJankenChoice = function(choice) {
    window.socket.emit('janken_choice', { choice: choice });
};

// --- UI アクション ---
window.handlePlayAction = function() {
    if (window.game.selectedIndices.length === 0 || window.isGameOver || window.isProcessingPlay) return;
    
    window.isProcessingPlay = true;
    const indices = [...window.game.selectedIndices];
    const playedCards = indices.map(i => window.game.myHand[i]);
    const lastCard = playedCards[playedCards.length - 1];
    const isAbility = lastCard.value && String(lastCard.value).startsWith('id_');
    const def = isAbility && window.AbilityDef ? window.AbilityDef[lastCard.value] : null;

    // ローカルでの最低限の適法性チェック（最終判定はサーバーが行う）
    if (!isAbility && !window.UNORules.canPlaySelected(playedCards, window.game.topCard, window.game.currentColor, window.game.drawStack, window.RuleSettings, window.AbilityDef)) {
        window.isProcessingPlay = false; return;
    }

    // クライアント側のアニメーションを再生し、終わったらサーバーに送信
    window.game.selectedIndices = []; window.updateUI();
    
    // UI側の選択ステップ（ターゲット選択、色選択など）
    let extraData = {}; let targetId = null; let discardIdx = null; let selColor = null; let multiDiscardIndices = [];
    
    const sendToServer = () => {
        if (isAbility) {
            window.socket.emit('player_action', { action: 'play_ability', indices, cards: playedCards, targetId, discardIdx, selectedColor: selColor, multiDiscardIndices, extraData });
        } else {
            window.socket.emit('player_action', { action: 'play', indices, cards: playedCards });
        }
        window.isProcessingPlay = false;
    };

    if (isAbility && def) {
        if (def.needsTarget) {
            window.openTargetSelection(window.game.players, (tid) => { targetId = tid; sendToServer(); });
            return;
        }
    }
    sendToServer();
};

window.onColorChosen = function(color) { 
    ColorUI.hide(); 
    if (ColorUI.callback) { let cb = ColorUI.callback; ColorUI.callback = null; cb(color); } 
    else { window.socket.emit('player_action', { action: 'color', color: color }); }
};

document.getElementById('draw-btn').onclick = () => {
    if (window.isProcessingPlay || window.isGameOver) return;
    const current = window.game.players[window.game.turnIndex];
    if (!current || current.id !== window.myId) return;
    window.socket.emit('player_action', { action: 'draw', count: window.game.drawStack > 0 ? window.game.drawStack : 1 });
};

document.getElementById('end-turn-btn').onclick = () => {
    if (window.isProcessingPlay || window.isGameOver) return;
    window.socket.emit('player_action', { action: 'end_turn' });
};

document.getElementById('uno-btn').onclick = () => {
    window.socket.emit('declare_uno', { id: window.myId, name: window.myData.name });
};

document.addEventListener('DOMContentLoaded', () => { 
    if(window.ensureModalsExist) window.ensureModalsExist();
});