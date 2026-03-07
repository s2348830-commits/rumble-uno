/**
 * ability.js
 */
window.AbilityDef = {
    'id_1': { rarity: 'SSR', type: 'AT', name: 'ミシェル', desc: '【AT】1人指定。1枚引かせ70%で凍結(能力のみ使用可)。', needsTarget: true },
    'id_2': { rarity: 'SSR', type: 'AT_BL', name: 'ルネイユ', desc: '【AT/BL】他全員に固定で1枚引かせる。その後自分にシールドIを1ターン付与する。また60%確率で他全員に固定で1枚引かせる。', fixedDraw: true },
    'id_3': { rarity: 'SSR', type: 'HE', name: 'ヴィオラ', desc: '【HE】手札を1枚選んで捨てる。', needsDiscard: true },
    'id_4': { rarity: 'SSR', type: 'HE_BL', name: 'ヘイゼル', desc: '【BL/受動】捨てられた時・場に出た時、自分にシールドIIを2ターン付与する。また15%の確率でカードが消費されず、手札に残る。' },
    'id_5': { rarity: 'SSR', type: 'HE', name: '瑠璃', desc: '【HE】自分の手札に+カードを2枚持ってくる。(内訳、各種+2：8割、+4：2割)' },
    'id_6': { rarity: 'SSR', type: 'AT', name: 'ラン', desc: '【AT】他全員に手札を2枚ランダムに捨てさせその後に3枚ドローさせる。' },
    'id_7': { rarity: 'SSR', type: 'AT', name: 'リリス', desc: '【AT】1人指定。燃焼(3T開始時固定1ドロー)を付与。', needsTarget: true },
    'id_8': { rarity: 'SSR', type: 'HE', name: 'ヘラ', desc: '【HE】1人指定し1枚引かせる。手札1枚捨てる。その後、回避Iを2ターン付与。', needsTarget: true, needsDiscard: true },
    'id_9': { rarity: 'SSR', type: 'AT_BL', name: 'レナ', desc: '【AT/BL】自分以外の他全員に1枚引かせる。防御時自分以外の他全員に固定2ドロー。' },
    'id_10': { rarity: 'SSR', type: 'HE', name: 'シャミール', desc: '【HE】1人指定。数字カード3枚を次の次ターンまでロック。', needsTarget: true },
    'id_11': { rarity: 'SSR', type: 'HE', name: 'レイ', desc: '【HE】1人指定。記号カード2枚を次の次ターンまでロック。', needsTarget: true },
    'id_12': { rarity: 'SR', type: 'AT', name: 'アンドロス', desc: '【AT】1人指定。2枚引かせる。', needsTarget: true },
    'id_13': { rarity: 'SSR', type: 'HE', name: 'エリザベス', desc: '【HE】選ばれたランダムなプレイヤーに1枚引かせランダムな記号カードを1枚山札に戻す。無ければ追加で1枚引かせる。' },
    'id_14': { rarity: 'SSR', type: 'AT', name: 'ハンナ', desc: '【AT】ランダムなプレイヤーに4枚引かせる。' },
    'id_15': { rarity: 'SSR', type: 'AT', name: 'メリア', desc: '【AT】1人指定。固定で2枚引かせる。', needsTarget: true, fixedDraw: true },
    'id_16': { rarity: 'SSR', type: 'HE', name: 'ユメゴト', desc: '【HE】手札1枚捨てる。自身のデバフ(凍結/燃焼)を全て解除。その後、回避IIを1ターン付与。', needsDiscard: true },
    'id_17': { rarity: 'SR', type: 'BL', name: 'カシウス', desc: '【BL】防御時、手札1枚選んで捨てる。', needsDiscard: true },
    'id_18': { rarity: 'SR', type: 'AT_BL', name: 'グレイス', desc: '【AT/BL】他全員に1枚引かせる。その後自分にシールドIを2ターン付与する。' },
    'id_19': { rarity: 'SR', type: 'BL', name: 'ヴィンディ', desc: '【BL】防御時手札1枚捨てる。攻撃者に1枚引かせる。', needsDiscard: true },
    'id_20': { rarity: 'UR', type: 'HV', name: '幽艶レベッカ', desc: '【HV】トリック・オア・キャロット。色を指定でき、指定した色以外のカードを全て山札に戻す。(既存カードのみ/能力カードは適応外)', needsColor: true },
    'id_21': { rarity: 'SR', type: 'AT', name: 'アヤメ', desc: '【AT】自分以外のプレイヤーを一人指定し、そのプレイヤーにカードを3枚引かせる。', needsTarget: true },
    'id_22': { rarity: 'SSR', type: 'HE', name: '遊鈴', desc: '【HE】自分のデバフ(凍結/燃焼)を1つ解除し、自分以外の全員に1枚カードを引かせる。', needsDebuffSelect: true },
    'id_23': { rarity: 'SSR', type: 'HE', name: 'ダンタ', desc: '【HE】自分を1ターン無敵状態にし、デバフを1つランダムに解除する。' },
    'id_24': { rarity: 'R', type: 'AT', name: 'アクアヘッド', desc: '【AT】自分以外のランダムなプレイヤーに燃焼を1ターン付与する。' },
    'id_25': { rarity: 'UR', type: 'HV', name: 'ミサ', desc: '【HV】自分のカード1枚をワイルド化し墓地のSSR以下の能力を1枚回収。使用後、蘇生・ミサを付与(被強制ドロー時にこのカードを回収)。', needsGraveyard: true },
    'id_26': { rarity: 'UR', type: 'HV', name: '運命の三姉妹', desc: '【HV】他1人とじゃんけん。初回相手2枚。勝つかあいこで相手2枚ドローし自分は通常カード1枚破棄(無ければ相手+1枚)。その後別の人と再戦(最大4回)。' },
    'id_27': { rarity: 'SR', type: 'HE', name: 'クララ', desc: '【HE】45%の確率で自分の手札をランダムに2枚捨てる。' },
    'id_28': { rarity: 'SSR', type: 'AT', name: 'リナ', desc: '【AT】ランダムなプレイヤーに2ターン燃焼を付与。その後1枚引かせる(貫通)。' },
    'id_29': { rarity: 'SSR', type: 'AT', name: 'エロス', desc: '【AT】自分以外の全員に75%の確率で2枚引かせる。' },
    'id_30': { rarity: 'SSR', type: 'BL', name: 'カシャ', desc: '【BL】防御時、ランダムなプレイヤーに燃焼を1ターン付与し、自分にシールドIを1ターン付与。' },
    'id_31': { rarity: 'SSR', type: 'BL', name: 'カレン', desc: '【BL】防御時、自分にシールドIIIを3ターン付与(重複可)。' },
    'id_32': { rarity: 'SSR', type: 'AT', name: 'フェイ', desc: '【AT】自分以外のランダムなプレイヤーに燃焼を2ターン付与(3回発動)。' },
    'id_33': { rarity: 'SSR', type: 'AT', name: 'ライア', desc: '【AT】指定したプレイヤーに1枚ドローさせる。その後このカードを手札に戻せる。', needsTarget: true },
    'id_34': { rarity: 'SSR', type: 'HE', name: 'オリヴィア', desc: '【HE】自分に回避Iを1ターン付与する。' },
    'id_35': { rarity: 'UR', type: 'HV', name: 'イヴ', desc: '【HV】ランダム1人に燃焼2T、他全員に裂傷(ドロー時+1枚)2T付与。使用後、蘇生・イヴを付与(被強制ドロー時にこのカードを回収)。' }
};

window.AbilityEngine = {
    checkEvasion: function(target) {
        if (!target || !target.evasion || target.evasion.turns <= 0 || target.evasion.level <= 0) return false;
        let rate = (target.evasion.level === 1) ? 0.20 : (target.evasion.level === 2) ? 0.50 : 0.80;
        return Math.random() < rate;
    },

    applyDraw: function(game, targetId, count, blockable = true) {
        const t = game.players.find(p => p.id === targetId);
        if (!t || t.invincibleTurns > 0) return 0;
        if (blockable && this.checkEvasion(t)) return -1; 
        
        let totalCount = count;
        // 🩸裂傷：ドロー時に+1枚
        if (t.laceration && t.laceration > 0) totalCount += 1;

        let actualDrawn = 0;
        for (let i = 0; i < totalCount; i++) {
            if (game.drawCard(targetId)) actualDrawn++;
        }
        
        if (actualDrawn > 0) {
            if (typeof window !== 'undefined' && window.isHost && window.socket) {
                window.socket.emit('request_draw_animation', { playerId: targetId, count: actualDrawn });
            }
            if (game.triggerRevive) game.triggerRevive(targetId);
        }
        return actualDrawn;
    },

    applyBurn: function(game, targetId, turns) {
        const t = game.players.find(p => p.id === targetId);
        if (!t || t.invincibleTurns > 0 || t.frozenBurnImmune) return 0;
        if (this.checkEvasion(t)) return -1;
        t.burnTurns += turns;
        return 1;
    },

    applyFreeze: function(game, targetId) {
        const t = game.players.find(p => p.id === targetId);
        if (!t || t.invincibleTurns > 0 || t.frozenBurnImmune) return 0;
        if (this.checkEvasion(t)) return -1;
        t.frozen = true;
        return 1;
    },

    triggerDiscardEffect: function(game, attackerId, abilityId, isManualDiscard, discCard) {
        if (abilityId === 'id_4') {
            const self = game.players.find(p => p.id === attackerId);
            if (self) self.shield = { level: 2, turns: 2 };
            if (isManualDiscard && discCard && Math.random() < 0.15) {
                if (game.hands[attackerId]) game.hands[attackerId].push(discCard);
            }
        }
    },

    resolve: function(game, attackerId, abilityId, selectedTargetId, discCard, defenseResponses, multiplier = 1, selectedColor = null, multiCards = [], extraData = {}) {
        let guides = [];
        const def = window.AbilityDef[abilityId];
        if (!def) return guides;
        const others = game.players.filter(p => p.id !== attackerId && p.connected);

        // 幽艶レベッカ(id_20)
        if (abilityId === 'id_20' && selectedColor) {
            const hand = game.hands[attackerId];
            if (hand) {
                let returnedCount = 0;
                game.hands[attackerId] = hand.filter(c => {
                    const isAbility = (c.value && String(c.value).startsWith('id_'));
                    if (!isAbility && c.color !== selectedColor) {
                        game.deck.push(c);
                        returnedCount++;
                        return false;
                    }
                    return true;
                });
                if (returnedCount > 0) {
                    game.deck = UNORules.shuffle(game.deck);
                    guides.push({ from: attackerId, to: attackerId, text: `${returnedCount}枚山札へ` });
                }
            }
            return guides;
        }

        for (let m = 0; m < multiplier; m++) {
            // イヴ(id_35)
            if (abilityId === 'id_35') {
                if (others.length > 0) {
                    const bt = others[Math.floor(Math.random() * others.length)].id;
                    const res = this.applyBurn(game, bt, 2);
                    guides.push({ from: attackerId, to: bt, text: (res === -1 ? '💨回避!' : '🔥燃焼(2T)'), se: (res === -1 ? null : 'fire') });
                }
                others.forEach(p => {
                    p.laceration = (p.laceration || 0) + 2;
                    guides.push({ from: attackerId, to: p.id, text: '🩸裂傷(2T)' });
                });
                const self = game.players.find(p => p.id === attackerId);
                if (self && self.usedReviveEve === 0) {
                    self.hasReviveEve = true;
                    guides.push({ from: attackerId, to: attackerId, text: '蘇生・イヴ付与' });
                }
            }

            // クララ(id_27)
            if (abilityId === 'id_27') {
                if (Math.random() < 0.45) {
                    const tHand = game.hands[attackerId];
                    if (tHand && tHand.length > 0) {
                        let dropCount = Math.min(2, tHand.length);
                        for (let i = 0; i < dropCount; i++) {
                            const discarded = tHand.splice(Math.floor(Math.random() * tHand.length), 1)[0];
                            game.discardPile.push(discarded);
                            game.discardRotations.push(0);
                        }
                        guides.push({ from: attackerId, to: attackerId, text: `2枚破棄` });
                    }
                } else guides.push({ from: attackerId, to: attackerId, text: `不発...` });
            }

            // ミサ(id_25)
            if (abilityId === 'id_25') {
                const hand = game.hands[attackerId];
                if (hand && hand.length > 0) {
                    const rCard = hand[Math.floor(Math.random() * hand.length)];
                    rCard.color = 'black'; rCard.value = 'Wild'; delete rCard.lockedTurns;
                }
                if (extraData.graveyardCardId && hand) {
                    hand.push({ color: 'black', value: extraData.graveyardCardId });
                    const gIdx = game.abilityGraveyard.indexOf(extraData.graveyardCardId);
                    if (gIdx > -1) game.abilityGraveyard.splice(gIdx, 1);
                }
                const self = game.players.find(p => p.id === attackerId);
                if (self && self.usedReviveMisa === 0) {
                    self.hasReviveMisa = true;
                    guides.push({ from: attackerId, to: attackerId, text: 'ワイルド化＆回収(蘇生付与)' });
                } else guides.push({ from: attackerId, to: attackerId, text: 'ワイルド化＆回収' });
            }

            // その他汎用攻撃(AT/AT_BL)
            if (def.type === 'AT' || def.type === 'AT_BL') {
                let targets = def.needsTarget ? [selectedTargetId] : 
                          (['id_2','id_6','id_9','id_18','id_29'].includes(abilityId) ? others.map(p=>p.id) : 
                          (others.length > 0 ? [others[Math.floor(Math.random()*others.length)].id] : []));

                targets.forEach(tid => {
                    if (defenseResponses && defenseResponses[tid]?.cardValue) return;
                    let draw = 0;
                    if (abilityId === 'id_1') { draw = 1; if(Math.random() < 0.7) this.applyFreeze(game, tid); }
                    else if (abilityId === 'id_2') { draw = 1; if(Math.random() < 0.6) draw++; }
                    else if (abilityId === 'id_6') { 
                        for(let i=0; i<2; i++) if(game.hands[tid]?.length > 0) game.discardPile.push(game.hands[tid].splice(Math.floor(Math.random()*game.hands[tid].length),1)[0]);
                        draw = 3; 
                    }
                    else if (abilityId === 'id_7') this.applyBurn(game, tid, 3);
                    else if (['id_9','id_18','id_33'].includes(abilityId)) draw = 1;
                    else if (['id_12','id_15'].includes(abilityId)) draw = 2;
                    else if (abilityId === 'id_14') draw = 4;
                    else if (abilityId === 'id_21') draw = 3;
                    else if (abilityId === 'id_28') { draw = 1; this.applyBurn(game, tid, 2); }
                    else if (abilityId === 'id_29') { if(Math.random() < 0.75) draw = 2; }
                    
                    if (draw > 0) {
                        const res = this.applyDraw(game, tid, draw, abilityId !== 'id_28');
                        guides.push({ from: attackerId, to: tid, text: (res === -1 ? '💨回避!' : `${res}枚`) });
                    }
                });
            }

            // 補助系
            if (abilityId === 'id_5') {
                const hand = game.hands[attackerId];
                if (hand) {
                    for(let i=0; i<2; i++) {
                        const val = Math.random() < 0.8 ? '+2' : 'Wild+4';
                        hand.push({ color: val==='Wild+4'?'black':['red','blue','green','yellow'][Math.floor(Math.random()*4)], value: val });
                    }
                    guides.push({ from: attackerId, to: attackerId, text: '+カード補充' });
                }
            } else if (abilityId === 'id_8') {
                this.applyDraw(game, selectedTargetId, 1);
                const self = game.players.find(p=>p.id===attackerId);
                if(self) self.evasion = { level: 1, turns: 2 };
                guides.push({ from: attackerId, to: attackerId, text: '💨回避I(2T)' });
            } else if (abilityId === 'id_10') {
                game.lockRandomCard(attackerId, selectedTargetId, 'number', 3, 2);
                guides.push({ from: attackerId, to: selectedTargetId, text: '数字ロック', se: 'rock' });
            } else if (abilityId === 'id_11') {
                game.lockRandomCard(attackerId, selectedTargetId, 'symbol', 2, 2);
                guides.push({ from: attackerId, to: selectedTargetId, text: '記号ロック', se: 'rock' });
            } else if (abilityId === 'id_16') {
                const self = game.players.find(p=>p.id===attackerId);
                if(self) { self.frozen = false; self.burnTurns = 0; self.evasion = { level: 2, turns: 1 }; }
                guides.push({ from: attackerId, to: attackerId, text: '✨解除＆回避II' });
            } else if (abilityId === 'id_23') {
                const self = game.players.find(p=>p.id===attackerId);
                if(self) { self.invincibleTurns = 1; self.frozen = false; self.burnTurns = 0; }
                guides.push({ from: attackerId, to: attackerId, text: '🛡️無敵(1T)' });
            } else if (abilityId === 'id_34') {
                const self = game.players.find(p=>p.id===attackerId);
                if(self) self.evasion = { level: 1, turns: 1 };
                guides.push({ from: attackerId, to: attackerId, text: '💨回避I(1T)' });
            }
        }
        return guides;
    }
};