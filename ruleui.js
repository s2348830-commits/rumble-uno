/**
 * ruleui.js
 */

window.CUSTOM_CARDS_DEF = [
    { id: 'id_1', name: 'ミシェル', desc: '【AT】1人指定。1枚引かせ70%で凍結(能力のみ使用可)。' },
    { id: 'id_2', name: 'ルネイユ', desc: '【AT/BL】他全員に固定で1枚引かせる。その後自分にシールドIを1ターン付与する。また60%確率で他全員に固定で1枚引かせる。' },
    { id: 'id_3', name: 'ヴィオラ', desc: '【HE】手札を1枚選んで捨てる。' },
    { id: 'id_4', name: 'ヘイゼル', desc: '【BL/受動】捨てられた時・場に出た時、自分にシールドIIを2ターン付与する。また15%の確率でカードが消費されず、手札に残る。' },
    { id: 'id_5', name: '瑠璃', desc: '【HE】自分の手札に+カードを2枚持ってくる。(内訳、各種+2：8割、+4：2割)' },
    { id: 'id_6', name: 'ラン', desc: '【AT】他全員に手札を2枚ランダムに捨てさせその後に3枚ドローさせる。' },
    { id: 'id_7', name: 'リリス', desc: '【AT】1人指定。燃焼(3T開始時固定1ドロー)を付与。' },
    { id: 'id_8', name: 'ヘラ', desc: '【HE】1人指定し1枚引かせる。手札1枚捨てる。その後、回避Iを2ターン付与。' },
    { id: 'id_9', name: 'レナ', desc: '【AT/BL】自分以外の他全員に1枚引かせる。防御時自分以外の他全員に固定2ドロー。' },
    { id: 'id_10', name: 'シャミール', desc: '【HE】1人指定。数字カード3枚を次の次ターンまでロック。' },
    { id: 'id_11', name: 'レイ', desc: '【HE】1人指定。記号カード2枚を次の次ターンまでロック。' },
    { id: 'id_12', name: 'アンドロス', desc: '【AT】1人指定。2枚引かせる。' },
    { id: 'id_13', name: 'エリザベス', desc: '【HE】選ばれたランダムなプレイヤーに1枚引かせランダムな記号カードを1枚山札に戻す。無ければ追加で1枚引かせる。' },
    { id: 'id_14', name: 'ハンナ', desc: '【AT】ランダムなプレイヤーに4枚引かせる。' },
    { id: 'id_15', name: 'メリア', desc: '【AT】1人指定。固定で2枚引かせる。' },
    { id: 'id_16', name: 'ユメゴト', desc: '【HE】手札1枚捨てる。自身のデバフ(凍結/燃焼)を全て解除。その後、回避IIを1ターン付与。' },
    { id: 'id_17', name: 'カシウス', desc: '【BL】防御時、手札1枚選んで捨てる。' },
    { id: 'id_18', name: 'グレイス', desc: '【AT/BL】他全員に1枚引かせる。その後自分にシールドIを2ターン付与する。' },
    { id: 'id_19', name: 'ヴィンディ', desc: '【BL】防御時手札1枚捨てる。攻撃者に1枚引かせる。' },
    { id: 'id_20', name: '幽艶レベッカ', desc: '【HV】トリック・オア・キャロット。色を指定でき、指定した色以外の既存カードを全て山札に戻す。(記号効果なし/能力カード除外)' },
    { id: 'id_21', name: 'アヤメ', desc: '【AT】自分以外のプレイヤーを一人指定し、そのプレイヤーにカードを3枚引かせる。' },
    { id: 'id_22', name: '遊鈴', desc: '【HE】自分のデバフ(凍結/燃焼)を1つ解除し、自分以外の全員に1枚カードを引かせる。' },
    { id: 'id_23', name: 'ダンタ', desc: '【HE】自分を1ターン無敵状態にし、デバフを1つランダムに解除する。' },
    { id: 'id_24', name: 'アクアヘッド', desc: '【AT】自分以外のランダムなプレイヤーに燃焼を1ターン付与する。' },
    { id: 'id_25', name: 'ミサ', desc: '【HV】自分のカード1枚をワイルドにし、墓地のSSR以下の能力を1枚回収。使用後、蘇生・ミサを付与(被強制ドロー時に回収)。' },
    { id: 'id_26', name: '運命の三姉妹', desc: '【HV】他1人とじゃんけん。初回相手2枚。勝つかあいこで相手2枚ドロー、自分通常1枚破棄。その後別の人と再戦(最大4回)。' },
    { id: 'id_27', name: 'クララ', desc: '【HE】45%の確率で自分の手札をランダムに2枚捨てる。' },
    { id: 'id_28', name: 'リナ', desc: '【AT】ランダムなプレイヤーに2ターン燃焼を付与。その後1枚引かせる(貫通)。' },
    { id: 'id_29', name: 'エロス', desc: '【AT】自分以外の全員に75%の確率で2枚引かせる。' },
    { id: 'id_30', name: 'カシャ', desc: '【BL】防御時、ランダムなプレイヤーに燃焼を1ターン付与し、自分にシールドIを1ターン付与。' },
    { id: 'id_31', name: 'カレン', desc: '【BL】防御時、自分にシールドIIIを3ターン付与(重複可)。' },
    { id: 'id_32', name: 'フェイ', desc: '【AT】自分以外のランダムなプレイヤーに燃焼を2ターン付与(3回発動)。' },
    { id: 'id_33', name: 'ライア', desc: '【AT】指定したプレイヤーに1枚ドローさせる。その後このカードを手札に戻せる。' },
    { id: 'id_34', name: 'オリヴィア', desc: '【HE】自分に回避Iを1ターン付与する。' },
    { id: 'id_35', name: 'イヴ', desc: '【HV】ランダム1人に燃焼2T、他全員に裂傷(ドロー時+1枚)2T付与。使用後、蘇生・イヴを付与(被強制ドロー時に回収)。' }
];

if (typeof window !== 'undefined' && !window.RuleSettings) {
    window.RuleSettings = {
        initialHandSize: 7,
        initialCustomHandSize: 2,
        customCards: [],
        unoPenalty: 2,
        unoAuto: false,
        allowActionFinish: true,
        actionFinishPenalty: 3,
        allowAbilityFinish: true,
        abilityFinishPenalty: 3,
        maxMultiPlay: 0,
        maxDrawMultiPlay: 0,
        randomTurnOrder: false,
        optionalDraw: true,
        abilityResetCount: 0,
        showBotPersonality: true
    };
}

if (typeof window !== 'undefined' && !window.RuleUIManager) {
    window.RuleUIManager = {
        customCards: [],
        initialCustomHandSize: 2,

        init: function() {
            const container = document.getElementById('custom-card-list');
            if (!container) return;
            container.innerHTML = '';
            
            window.CUSTOM_CARDS_DEF.forEach(def => {
                const item = document.createElement('div');
                item.className = 'custom-card-item disabled';
                item.dataset.id = def.id;

                const controls = document.createElement('div');
                controls.className = 'card-controls';
                
                const btnMinus = document.createElement('div');
                btnMinus.className = 'count-btn btn-minus'; btnMinus.innerText = '−';
                const btnPlus = document.createElement('div');
                btnPlus.className = 'count-btn btn-plus'; btnPlus.innerText = '＋';
                
                const img = document.createElement('img');
                img.className = 'custom-card-img';
                img.src = `card/custom/${def.id}.png`;
                img.onerror = function() {
                    this.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/%3E%3C/svg%3E";
                };

                const infoIcon = document.createElement('span');
                infoIcon.className = 'info-icon';
                infoIcon.innerText = 'i';
                
                // ★修正: iマーク押したときに詳細パネルを自動生成して表示
                infoIcon.onclick = (e) => {
                    e.stopPropagation();
                    let infoPanel = document.getElementById('ability-info');
                    if (!infoPanel) {
                        infoPanel = document.createElement('div');
                        infoPanel.id = 'ability-info';
                        infoPanel.style.cssText = "position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.9); color:white; padding:15px; border-radius:10px; z-index:110000; pointer-events:none; transition:0.3s; opacity:0; white-space:pre-wrap; border:1px solid #f1c40f; width:80%; max-width:400px; text-align:center;";
                        document.body.appendChild(infoPanel);
                    }
                    if (infoPanel.style.opacity == 1 && infoPanel.innerText.includes(def.name)) {
                        infoPanel.style.opacity = 0;
                    } else {
                        infoPanel.innerText = `【${def.name}】\n${def.desc}`;
                        infoPanel.style.opacity = 1;
                        setTimeout(() => { if(infoPanel) infoPanel.style.opacity = 0; }, 5000);
                    }
                };

                const nameDiv = document.createElement('div');
                nameDiv.className = 'custom-card-name';
                nameDiv.innerText = def.name;
                nameDiv.appendChild(infoIcon);

                const countDiv = document.createElement('div');
                countDiv.className = 'custom-card-count';
                countDiv.innerHTML = `<span class="count-val">0</span>/<span class="count-max">4</span>`;

                controls.appendChild(btnMinus); controls.appendChild(img); controls.appendChild(btnPlus);
                item.appendChild(controls); item.appendChild(nameDiv); item.appendChild(countDiv);
                
                btnPlus.onclick = (e) => { e.stopPropagation(); this.addCard(def.id, 4); };
                btnMinus.onclick = (e) => { e.stopPropagation(); this.removeCard(def.id); };

                container.appendChild(item);
            });

            // 要素が存在するか確認してからイベントを登録
            const customHandSelect = document.getElementById('setting-initial-custom-hand');
            if (customHandSelect) {
                customHandSelect.addEventListener('change', (e) => {
                    this.initialCustomHandSize = parseInt(e.target.value);
                    if (window.isHost) this.broadcastSettings();
                });
            }
        },

        addCard: function(id, maxLimit) {
            const currentCount = this.customCards.filter(c => c === id).length;
            if (currentCount < maxLimit) {
                this.customCards.push(id);
                this.updateUI();
                if (window.isHost) this.broadcastSettings();
            }
        },

        removeCard: function(id) {
            const idx = this.customCards.indexOf(id);
            if (idx > -1) {
                this.customCards.splice(idx, 1);
                this.updateUI();
                if (window.isHost) this.broadcastSettings();
            }
        },

        broadcastSettings: function() {
            if (!window.socket) return;
            const el = (id) => document.getElementById(id);
            const settings = {
                initialHandSize: el('setting-initial-hand') ? el('setting-initial-hand').value : 7,
                initialCustomHandSize: this.initialCustomHandSize,
                customCards: this.customCards,
                unoPenalty: el('setting-uno-penalty') ? el('setting-uno-penalty').value : 2,
                unoAuto: el('setting-uno-auto') ? el('setting-uno-auto').checked : false,
                allowActionFinish: el('setting-allow-action-finish') ? el('setting-allow-action-finish').checked : true,
                actionFinishPenalty: el('setting-action-finish-penalty') ? el('setting-action-finish-penalty').value : 3,
                allowAbilityFinish: el('setting-allow-ability-finish') ? el('setting-allow-ability-finish').checked : true,
                abilityFinishPenalty: el('setting-ability-finish-penalty') ? el('setting-ability-finish-penalty').value : 3,
                maxMultiPlay: el('setting-max-multi-play') ? el('setting-max-multi-play').value : 0,
                maxDrawMultiPlay: el('setting-max-draw-multi-play') ? el('setting-max-draw-multi-play').value : 0,
                randomTurnOrder: el('setting-random-turn-order') ? el('setting-random-turn-order').checked : false,
                optionalDraw: el('setting-optional-draw') ? el('setting-optional-draw').checked : true,
                abilityResetCount: el('setting-ability-reset-count') ? el('setting-ability-reset-count').value : 0,
                showBotPersonality: el('setting-bot-personality') ? el('setting-bot-personality').checked : true
            };
            window.RuleSettings = settings;
            window.socket.emit('update_settings', settings);
        },

        applySettings: function(settings) {
            if (!settings) return;
            window.RuleSettings = settings;
            
            const el = (id) => document.getElementById(id);
            if(el('setting-initial-hand')) el('setting-initial-hand').value = settings.initialHandSize;
            if(el('setting-initial-custom-hand')) el('setting-initial-custom-hand').value = settings.initialCustomHandSize;
            if(el('setting-uno-penalty')) el('setting-uno-penalty').value = settings.unoPenalty;
            if(el('setting-uno-auto')) el('setting-uno-auto').checked = settings.unoAuto;
            if(el('setting-allow-action-finish')) el('setting-allow-action-finish').checked = settings.allowActionFinish;
            if(el('setting-action-finish-penalty')) el('setting-action-finish-penalty').value = settings.actionFinishPenalty;
            if(el('setting-allow-ability-finish')) el('setting-allow-ability-finish').checked = settings.allowAbilityFinish;
            if(el('setting-ability-finish-penalty')) el('setting-ability-finish-penalty').value = settings.abilityFinishPenalty;
            if(el('setting-max-multi-play')) el('setting-max-multi-play').value = settings.maxMultiPlay;
            if(el('setting-max-draw-multi-play')) el('setting-max-draw-multi-play').value = settings.maxDrawMultiPlay;
            if(el('setting-random-turn-order')) el('setting-random-turn-order').checked = settings.randomTurnOrder;
            if(el('setting-optional-draw')) el('setting-optional-draw').checked = settings.optionalDraw;
            if(el('setting-ability-reset-count')) el('setting-ability-reset-count').value = settings.abilityResetCount;
            if(el('setting-bot-personality')) el('setting-bot-personality').checked = settings.showBotPersonality;

            this.initialCustomHandSize = settings.initialCustomHandSize;
            this.customCards = settings.customCards || [];
            this.updateUI();
        },

        updateUI: function() {
            document.querySelectorAll('.custom-card-item').forEach(item => {
                const id = item.dataset.id;
                const count = this.customCards.filter(c => c === id).length;
                const countSpan = item.querySelector('.count-val');
                if (countSpan) countSpan.innerText = count;
                if (count > 0) item.classList.remove('disabled'); else item.classList.add('disabled');
            });

            const customHandSelect = document.getElementById('setting-initial-custom-hand');
            const resetSelect = document.getElementById('setting-ability-reset-count');
            if (customHandSelect) customHandSelect.disabled = (this.customCards.length === 0);
            if (resetSelect) resetSelect.disabled = (this.customCards.length === 0);
        },

        checkStartError: function(roomState) {
            if (!roomState || !roomState.slots) return null;
            if (!this.customCards || this.customCards.length === 0) return null; 

            const playerCount = roomState.slots.filter(s => s.type === 'host' || s.type === 'player' || s.type === 'bot').length;
            const requiredCustomCards = (parseInt(this.initialCustomHandSize) || 0) * playerCount;
            const availableCustomCards = this.customCards.length;
            
            if (availableCustomCards < requiredCustomCards) {
                return `【エラー】設定された能力カードが足りません！\n(必要総数: ${requiredCustomCards}枚 / 追加枚数: ${availableCustomCards}枚)\n設定からカードを追加するか、初期手札の枚数を減らしてください。`;
            }
            return null;
        }
    };
}
window.addEventListener('DOMContentLoaded', () => { if (window.RuleUIManager) window.RuleUIManager.init(); });