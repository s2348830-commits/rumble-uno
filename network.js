/**
 * network.js
 */
const socket = io();
window.socket = socket;

window.myId = null;
window.currentRoomState = null;

// ユーザーIDの管理
let userId = localStorage.getItem('uno_user_id');
if (!userId) {
    userId = Math.random().toString(36).substr(2, 9);
    localStorage.getItem('uno_user_id', userId);
}
window.myUserId = userId;

// 接続完了時
socket.on('connect', () => {
    window.myId = socket.id;
    console.log('Connected to server. Socket ID:', socket.id);
});

// 部屋作成
window.createRoom = function(playerName, icon, settings) {
    socket.emit('create_room', { 
        userId: window.myUserId,
        playerName, 
        icon, 
        ruleSettings: settings 
    });
};

// 部屋参加
window.joinRoom = function(roomId, playerName, icon) {
    socket.emit('join_room', { 
        roomId, 
        userId: window.myUserId,
        playerName, 
        icon 
    });
};

// 準備完了切り替え
window.toggleReady = function(isReady) {
    socket.emit('player_ready', isReady);
};

// ルール更新（ホスト用）
window.updateRules = function(settings) {
    socket.emit('update_rules', settings);
};

// ゲーム開始（ホスト用）
window.startGame = function() {
    socket.emit('start_game');
};

// スロット更新（ホスト用）
window.updateSlot = function(index, slotData) {
    socket.emit('update_slot', { index, slotData });
};

// --- サーバーからの受信イベント ---

// 部屋作成成功
socket.on('room_created', (roomId) => {
    window.isHost = true;
    console.log('Room created:', roomId);
});

// エラーメッセージ
socket.on('error_message', (msg) => {
    alert(msg);
});

// 部屋の状態更新
socket.on('room_state_update', (roomState) => {
    window.currentRoomState = roomState;
    window.isHost = (roomState.host === socket.id);
    
    // ロビー画面の表示更新
    if (typeof renderSlots === 'function') {
        renderSlots(roomState);
    }
    
    // ルールUIの更新（ホスト以外）
    if (!window.isHost && typeof updateRuleUI === 'function') {
        updateRuleUI(roomState.ruleSettings);
    }
});

// ゲーム開始通知
socket.on('game_started', () => {
    window.isInitialDealing = true;
    
    // ★ 修正: サーバー主導のため、ブラウザ側での window.game.setup(...) は不要になりました
    console.log("Game start signal received from server.");

    document.getElementById('lobby-screen').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    
    const cia = document.getElementById('chat-input-area');
    if (cia) {
        cia.style.display = 'flex';
        cia.classList.remove('hidden');
    }
    
    const lcia = document.getElementById('lobby-chat-container');
    if (lcia) lcia.style.display = 'none';
});

/**
 * 注意：以前このファイルの下部にあった 
 * socket.on('play_animation'), socket.on('receive_chat') 等の
 * ゲーム内イベントの受信処理は、二重受信によるバグ（チャットが2回出る等）を
 * 防ぐため、すべて main.js 側に一本化されました。
 */