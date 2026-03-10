/**
 * ruleui.js
 */

window.CUSTOM_CARDS_DEF = [
    { id: 'id_1', name: 'ミシェル', desc: '【AT】1人指定。1枚引かせ70%で凍結(能力のみ使用可)。' }, 
    { id: 'id_2', name: 'ルネイユ', desc: '【AT/BL】自分以外の他全員に固定で1枚引かせる。その後自分に60%の確率でシールドIIを2ターン付与し40%の確率でシールドIIを4ターン。' },
    { id: 'id_3', name: 'ヴィオラ', desc: '【HE】手札を1枚選んで捨てる。' },
    { id: 'id_4', name: 'ヘイゼル', desc: '【BL/受動】捨てられた時・場に出た時、自分にシールドIIを2ターン付与する。また55%の確率でカードが消費されず、手札に残る。' },
    { id: 'id_5', name: '瑠璃', desc: '【HE】自分の手札に+カードを2枚持ってくる。(内訳、各種+2：8割、+4：2割)' }, 
    { id: 'id_6', name: 'ラン', desc: '【AT】他全員に手札を2枚ランダムに捨てさせその後に3枚ドローさせる。' },
    { id: 'id_7', name: 'リリス', desc: '【AT】1人指定。燃焼(5T開始時固定1ドロー)を付与。' }, 
    { id: 'id_8', name: 'ヘラ', desc: '【HE】1人指定し1枚引かせる。手札1枚捨てる。その後、回避Iを2ターン付与。' }, 
    { id: 'id_9', name: 'レナ', desc: '【AT/BL】自分以外の他全員に1枚引かせる。防御時自分以外の他全員に固定2ドロー。' },
    { id: 'id_10', name: 'シャミール', desc: '【HE】1人指定。数字カード3枚を次の次ターンまでロック。' }, 
    { id: 'id_11', name: 'レイ', desc: '【HE】1人指定。記号カード2枚を次の次ターンまでロック。' }, 
    { id: 'id_12', name: 'アンドロス', desc: '【AT】1人指定。2枚引かせる。' },
    { id: 'id_13', name: 'エリザベス', desc: '【HE】選ばれたランダムなプレイヤーに1枚引かせランダムな記号カードを1枚山札に戻す。無ければ追加で1枚引かせる。' }, 
    { id: 'id_14', name: 'ハンナ', desc: '【AT】ランダムなプレイヤーに4枚引かせる。' }, 
    { id: 'id_15', name: 'メリア', desc: '【AT/BL】1人指定。固定で2枚引かせる。その後40%の確率でもう2枚固定で引かせる。' },
    { id: 'id_16', name: 'ユメゴト', desc: '【HE】手札1枚捨てる。自身のデバフ(凍結/燃焼)を全て解除。その後、回避IIを1ターン付与。' }, 
    { id: 'id_17', name: 'カシウス', desc: '【BL】防御時、手札1枚選んで捨てる。' }, 
    { id: 'id_18', name: 'グレイス', desc: '【AT/BL】他全員に1枚引かせる。その後自分にシールドIを2ターン付与する。' },
    { id: 'id_19', name: 'ヴィンディ', desc: '【BL】防御時手札1枚捨てる。攻撃者に1枚引かせる。' },
    { id: 'id_20', name: '幽艶レベッカ', desc: '【HV】トリック・オア・キャロット。色を指定でき、指定した色以外のカード(能力以外)を全て山札に戻す。', type: 'HV' },
    { id: 'id_21', name: 'アヤメ', desc: '【AT】自分以外のプレイヤーを一人指定し、そのプレイヤーにカードを3枚引かせる。' },
    { id: 'id_22', name: '遊鈴', desc: '【HE】自分のデバフ(凍結/燃焼)を1つ解除し、自分以外の全員に1枚カードを引かせる。' },
    { id: 'id_23', name: 'ダンタ', desc: '【HE】自分を1ターン無敵状態にし、デバフを1つランダムに解除する。' },
    { id: 'id_24', name: 'アクアヘッド', desc: '【AT】自分以外のランダムなプレイヤーに燃焼を1ターン付与する。' },
    { id: 'id_25', name: 'ミサ', desc: '【HV】自分のカード1枚をWild化。SSR以下の能力1枚回収。使用後、次に+2/+4/能力で引かされる際にこのカードを手札に戻す(最大1回)。' },
    { id: 'id_26', name: '運命の三姉妹', desc: '【HV】じゃんけん(最大4回)。勝敗に関わらず2ドロー。勝利/あいこなら相手2ドローさせ自分は既存カード1枚破棄。' },
    { id: 'id_27', name: 'クララ', desc: '【HE】45%の確率で、自分の手札をランダムに2枚捨てる。' },
    { id: 'id_28', name: 'リナ', desc: '【AT】ランダムなプレイヤーに2ターン燃焼を付与する。その後そのプレイヤーに1枚引かせる(防御不可)。' },
    { id: 'id_29', name: 'エロス', desc: '【AT】自分以外の全員に75%の確率で2枚引かせる。' },
    { id: 'id_30', name: 'カシャ', desc: '【BL】防御時、ランダムなプレイヤーに燃焼を1ターン付与し、自分にシールドIを1ターン付与する。' },
    { id: 'id_31', name: 'カレン', desc: '【BL】防御時、自分のシールドIIIを3ターン付与する。また、既にシールドがある場合は重複する。' },
    { id: 'id_32', name: 'フェイ', desc: '【AT】自分以外のランダムなプレイヤーに燃焼(2T開始時固定1ドロー)を付与(3回発動)。既に燃焼がある場合は重複する。' },
    { id: 'id_33', name: 'ライア', desc: '【AT】自分以外のプレイヤーを一人指定し1枚ドローさせる。発動後このカードを手札に戻してもよい。(3回のみ)' },
    { id: 'id_34', name: 'オリヴィア', desc: '【HE】自分に回避I(20%の確率で攻撃を防ぐ)を1ターン付与する。' },
    { id: 'id_35', name: 'イヴ', desc: '【HV】ランダム燃焼+他全員裂傷(引く枚数+1)。使用後、次に+2/+4/能力で引かされる際にこのカードを手札に戻す(最大1回)。' },
    { id: 'id_36', name: 'アミリー', desc: '【HV】使用後、赤バラ、桃バラ、白バラの3つのうち好きなカードを手札に加える。', type: 'HV' },
];

if (typeof window.AbilityDef === 'undefined') {
    window.AbilityDef = {};
    window.CUSTOM_CARDS_DEF.forEach(c => window.AbilityDef[c.id] = c);
}

if (typeof window.RuleSettings === 'undefined') {
    window.RuleSettings = {
        unoAuto: false, 
        unoPenalty: 2, 
        initialHandSize: 7, 
        initialCustomHandSize: 2,
        abilityResetCount: 0,
        maxMultiPlay: 0, 
        maxDrawMultiPlay: 0, 
        allowDrawResponse: false, 
        allowActionFinish: true, 
        allowAbilityFinish: true,
        actionFinishPenalty: 3, 
        abilityFinishPenalty: 3,
        optionalDraw: false,
        showBotPersonality: false, 
        randomTurnOrder: false, 
        showUnoAutoBtn: true, 
        customCards: [], 

        init: function() {
            const unoPenaltySelect = document.getElementById('setting-uno-penalty');
            const handSizeSelect = document.getElementById('setting-initial-hand');
            const customHandSelect = document.getElementById('setting-initial-custom-hand'); 
            const resetCountSelect = document.getElementById('setting-ability-reset-count');
            const maxMultiSelect = document.getElementById('setting-max-multi');
            const maxDrawMultiSelect = document.getElementById('setting-max-draw-multi');
            const drawResponseCheck = document.getElementById('setting-draw-response');
            const finishCheck = document.getElementById('setting-action-finish');
            const abilityFinishCheck = document.getElementById('setting-ability-finish');
            const actionPenaltySelect = document.getElementById('setting-action-penalty');
            const abilityPenaltySelect = document.getElementById('setting-ability-penalty');
            const optionalDrawCheck = document.getElementById('setting-optional-draw');
            const botPersonalityCheck = document.getElementById('setting-show-bot-personality'); 
            const randomTurnCheck = document.getElementById('setting-random-turn'); 
            const showUnoAutoCheck = document.getElementById('setting-show-uno-auto');

            const triggerUpdate = () => { if(window.sendSettingsUpdate) window.sendSettingsUpdate(); };

            if (unoPenaltySelect) unoPenaltySelect.onchange = (e) => { this.unoPenalty = parseInt(e.target.value); triggerUpdate(); };
            if (handSizeSelect) handSizeSelect.onchange = (e) => { this.initialHandSize = parseInt(e.target.value); triggerUpdate(); };
            if (customHandSelect) customHandSelect.onchange = (e) => { this.initialCustomHandSize = parseInt(e.target.value); triggerUpdate(); }; 
            if (resetCountSelect) resetCountSelect.onchange = (e) => { this.abilityResetCount = parseInt(e.target.value); triggerUpdate(); }; 
            if (maxMultiSelect) maxMultiSelect.onchange = (e) => { this.maxMultiPlay = parseInt(e.target.value); triggerUpdate(); };
            if (maxDrawMultiSelect) maxDrawMultiSelect.onchange = (e) => { this.maxDrawMultiPlay = parseInt(e.target.value); triggerUpdate(); };
            if (drawResponseCheck) drawResponseCheck.onchange = (e) => { this.allowDrawResponse = e.target.checked; triggerUpdate(); };
            if (optionalDrawCheck) optionalDrawCheck.onchange = (e) => { this.optionalDraw = e.target.checked; triggerUpdate(); };
            
            if (showUnoAutoCheck) {
                showUnoAutoCheck.onchange = (e) => {
                    this.showUnoAutoBtn = e.target.checked;
                    triggerUpdate();
                    if (typeof window.updateUI === 'function') window.updateUI();
                };
                showUnoAutoCheck.dispatchEvent(new Event('change'));
            }

            const btnUnoAuto = document.getElementById('btn-uno-auto');
            if (btnUnoAuto) {
                btnUnoAuto.onclick = () => {
                    this.unoAuto = !this.unoAuto;
                    if (this.unoAuto) {
                        btnUnoAuto.classList.add('is-on');
                        btnUnoAuto.innerText = 'UNOオート: ON';
                    } else {
                        btnUnoAuto.classList.remove('is-on');
                        btnUnoAuto.innerText = 'UNOオート: OFF';
                    }
                    if (window.SE) window.SE.play('buttonclick');
                    if (typeof window.updateUI === 'function') window.updateUI();
                };
            }
            
            if (finishCheck) {
                finishCheck.onchange = (e) => {
                    this.allowActionFinish = e.target.checked;
                    const area = document.getElementById('action-penalty-area');
                    if (area) {
                        area.style.opacity = this.allowActionFinish ? "0.2" : "1.0";
                        area.style.pointerEvents = this.allowActionFinish ? "none" : "auto";
                    }
                    triggerUpdate();
                };
                finishCheck.dispatchEvent(new Event('change'));
            }

            if (abilityFinishCheck) {
                abilityFinishCheck.onchange = (e) => {
                    this.allowAbilityFinish = e.target.checked;
                    const area = document.getElementById('ability-penalty-area');
                    if (area) {
                        area.style.opacity = this.allowAbilityFinish ? "0.2" : "1.0";
                        area.style.pointerEvents = this.allowAbilityFinish ? "none" : "auto";
                    }
                    triggerUpdate();
                };
                abilityFinishCheck.dispatchEvent(new Event('change'));
            }
            
            if (actionPenaltySelect) actionPenaltySelect.onchange = (e) => { this.actionFinishPenalty = parseInt(e.target.value); triggerUpdate(); };
            if (abilityPenaltySelect) abilityPenaltySelect.onchange = (e) => { this.abilityFinishPenalty = parseInt(e.target.value); triggerUpdate(); };

            if (botPersonalityCheck) {
                botPersonalityCheck.onchange = (e) => {
                    this.showBotPersonality = e.target.checked;
                    triggerUpdate();
                    if (typeof window.updateUI === 'function') window.updateUI();
                    if (typeof window.updateLobbyUI === 'function') window.updateLobbyUI();
                };
                botPersonalityCheck.dispatchEvent(new Event('change'));
            }

            if (randomTurnCheck) {
                randomTurnCheck.onchange = (e) => {
                    this.randomTurnOrder = e.target.checked;
                    triggerUpdate();
                };
                randomTurnCheck.dispatchEvent(new Event('change'));
            }

            document.querySelectorAll('.toggle-switch input').forEach(el => {
                el.addEventListener('change', () => {
                    if (window.SE) window.SE.play('buttonclick');
                });
            });

            const btnOpenCustom = document.getElementById('btn-open-custom-cards');
            const btnCloseCustom = document.getElementById('btn-close-custom-cards');
            const customOverlay = document.getElementById('custom-card-overlay');
            const customGrid = document.getElementById('custom-card-grid');

            if (customGrid) {
                window.CUSTOM_CARDS_DEF.forEach(c => {
                    const div = document.createElement('div');
                    div.className = 'custom-card-item disabled'; 
                    div.dataset.id = c.id;
                    div.dataset.count = 0;
                    
                    const descSafe = c.desc.replace(/\n/g, '\\n').replace(/'/g, "\\'");
                    const maxCount = (c.id === 'id_20' || c.id === 'id_25' || c.id === 'id_26' || c.id === 'id_35' || c.id === 'id_36') ? 1 : 4;
                    
                    let rarityColor = '#ccc';
                    let rarityText = 'SSR';
                    if (['id_20','id_25','id_26'].includes(c.id)) { rarityColor = '#ff4081'; rarityText = 'UR'; }
                    else if (['id_12','id_17','id_18','id_19','id_21','id_27'].includes(c.id)) { rarityColor = '#fbc02d'; rarityText = 'SR'; }
                    else if (['id_24'].includes(c.id)) { rarityColor = '#2196f3'; rarityText = 'R'; }
                    
                    div.innerHTML = `
                        <div class="card-controls">
                            <button class="count-btn minus">-</button>
                            <img class="custom-card-img" src="card/custom/${c.id}.png" alt="${c.name}" onerror="this.src='data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 24 24\\' fill=\\'%23ccc\\'%3E%3Crect width=\\'24\\' height=\\'24\\' fill=\\'none\\'/%3E%3Ctext x=\\'12\\' y=\\'14\\' font-size=\\'8\\' text-anchor=\\'middle\\' fill=\\'%23fff\\'%3E?%3C/text%3E%3C/svg%3E'">
                            <button class="count-btn plus">+</button>
                        </div>
                        <span style="font-size:9px; font-weight:bold; color:${rarityColor}; margin-top:2px;">${rarityText}</span>
                        <div class="custom-card-name">${c.name} <span class="info-icon" onclick="event.stopPropagation(); alert('${descSafe}');">?</span></div>
                        <span class="custom-card-count">0/${maxCount}</span>
                    `;
                    
                    const minusBtn = div.querySelector('.minus');
                    const plusBtn = div.querySelector('.plus');
                    const countSpan = div.querySelector('.custom-card-count');
                    const imgEl = div.querySelector('.custom-card-img');

                    const updateCountDisplay = () => {
                        const count = parseInt(div.dataset.count);
                        countSpan.innerText = `${count}/${maxCount}`;
                        if (count > 0) { div.classList.remove('disabled'); } else { div.classList.add('disabled'); }
                    };

                    minusBtn.onclick = (e) => {
                        e.stopPropagation();
                        if (!window.isHost) return;
                        let count = parseInt(div.dataset.count);
                        if (count > 0) count--;
                        div.dataset.count = count;
                        updateCountDisplay(); this.updateCustomCardsArray();
                        if (window.SE) window.SE.play('buttonclick'); triggerUpdate();
                    };

                    plusBtn.onclick = (e) => {
                        e.stopPropagation();
                        if (!window.isHost) return;
                        let count = parseInt(div.dataset.count);
                        if (count < maxCount) count++;
                        div.dataset.count = count;
                        updateCountDisplay(); this.updateCustomCardsArray();
                        if (window.SE) window.SE.play('buttonclick'); triggerUpdate();
                    };

                    imgEl.onclick = (e) => {
                        e.stopPropagation();
                        if (!window.isHost) return;
                        let count = parseInt(div.dataset.count);
                        if (count === 0) count = 1; else count = 0; 
                        div.dataset.count = count;
                        updateCountDisplay(); this.updateCustomCardsArray();
                        if (window.SE) window.SE.play('buttonclick'); triggerUpdate();
                    };

                    customGrid.appendChild(div);
                });
            }

            if (btnOpenCustom && customOverlay) {
                btnOpenCustom.onclick = () => {
                    if (window.SE) window.SE.play('buttonclick'); customOverlay.classList.remove('hidden'); this.renderCustomCardUI();
                };
            }
            if (btnCloseCustom && customOverlay) {
                btnCloseCustom.onclick = () => {
                    if (window.SE) window.SE.play('buttonclick'); customOverlay.classList.add('hidden');
                };
            }
        },

        updateCustomCardsArray: function() {
            const grid = document.getElementById('custom-card-grid');
            if (!grid) return;
            const items = grid.querySelectorAll('.custom-card-item');
            let newArray = [];
            items.forEach(item => {
                const id = item.dataset.id;
                const count = parseInt(item.dataset.count) || 0;
                for(let i=0; i<count; i++) newArray.push(id);
            });
            this.customCards = newArray;

            const customHandSelect = document.getElementById('setting-initial-custom-hand');
            const resetSelect = document.getElementById('setting-ability-reset-count');
            if (customHandSelect) customHandSelect.disabled = (this.customCards.length === 0);
            if (resetSelect) resetSelect.disabled = (this.customCards.length === 0);
        },

        renderCustomCardUI: function() {
            const grid = document.getElementById('custom-card-grid');
            if (!grid) return;
            const items = grid.querySelectorAll('.custom-card-item');
            items.forEach(item => {
                const id = item.dataset.id;
                const maxCount = (id === 'id_20' || id === 'id_25' || id === 'id_26' || id === 'id_35' || id === 'id_36') ? 1 : 4;
                const count = this.customCards.filter(c => c === id).length;
                item.dataset.count = count;
                const countSpan = item.querySelector('.custom-card-count');
                if(countSpan) countSpan.innerText = `${count}/${maxCount}`;
                if (count > 0) item.classList.remove('disabled'); else item.classList.add('disabled');
            });

            const customHandSelect = document.getElementById('setting-initial-custom-hand');
            const resetSelect = document.getElementById('setting-ability-reset-count');
            if (customHandSelect) customHandSelect.disabled = (this.customCards.length === 0);
            if (resetSelect) resetSelect.disabled = (this.customCards.length === 0);
        },

        checkStartError: function(roomState) {
            if (!roomState || !roomState.slots) return null;

            // プレイヤー数（ホスト＋参加者＋Bot）をカウント
            const playerCount = roomState.slots.filter(s => s.type === 'host' || s.type === 'player' || s.type === 'bot').length;
            
            // 👇👇 ★追加: 2人未満ならエラーにする 👇👇
            if (playerCount < 2) {
                return `【エラー】参加人数が足りません！\n(最低2人以上のプレイヤーまたはBotが必要です)`;
            }
            // 👆👆 追加ここまで 👆👆

            if (!this.customCards || this.customCards.length === 0) return null; 

            // 必要な能力カードの総数 ＝ 初期手札(能力)枚数 × プレイヤー数
            const requiredCustomCards = (parseInt(this.initialCustomHandSize) || 0) * playerCount;
            
            // 用意されている能力カードの総数
            const availableCustomCards = this.customCards.length;
            
            // 不足している場合、エラーメッセージを返す
            if (availableCustomCards < requiredCustomCards) {
                return `【エラー】設定された能力カードが足りません！\n(必要総数: ${requiredCustomCards}枚 / 追加枚数: ${availableCustomCards}枚)\n設定からカードを追加するか、初期手札の枚数を減らしてください。`;
            }
            return null;
        }
    };
}
window.addEventListener('DOMContentLoaded', () => {
    if(window.RuleSettings && typeof window.RuleSettings.init === 'function') window.RuleSettings.init();
});
//  ★追加: 0.5秒ごとにカード枚数を監視し、スタートボタンをリアルタイムで無効化する
setInterval(() => {
    if (!window.isHost || !window.RuleSettings) return;
    
    // 現在のロビーのプレイヤー情報を取得
    const roomState = window.currentRoomState;
    if (!roomState) return;

    // ゲーム開始ボタンを取得（※IDが違う場合は 'btn-start-game' の部分をご自身のHTMLに合わせてください）
    const startBtn = document.getElementById('btn-start') || document.querySelector('.start-btn');
    if (!startBtn) return;

    // エラーがあるかチェック
    const errorMsg = window.RuleSettings.checkStartError(roomState);
    
    if (errorMsg) {
        // エラーがある場合：ボタンを押せなくして、見た目を半透明にする
        startBtn.disabled = true;
        startBtn.style.opacity = '0.5';
        startBtn.style.cursor = 'not-allowed';
        startBtn.innerText = 'カード不足'; // ぱっと見で分かるように文字も変える
        startBtn.title = "設定画面から能力カードを追加するか、初期手札の枚数を減らしてください";
    } else {
        // エラーがない場合：通常通り押せるように戻す
        startBtn.disabled = false;
        startBtn.style.opacity = '1.0';
        startBtn.style.cursor = 'pointer';
        startBtn.innerText = 'ゲーム開始'; // 元の文字に戻す
        startBtn.title = "";
    }
}, 500);