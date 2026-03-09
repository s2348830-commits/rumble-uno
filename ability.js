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
    'id_7': { rarity: 'SSR', type: 'AT', name: 'リリス', desc: '【AT】1人指定。燃焼(5T開始時固定1ドロー)を付与。既に燃焼がある場合はターン数が重複(加算)する。', needsTarget: true },
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
    'id_20': { rarity: 'UR', type: 'HV', name: '幽艶レベッカ', desc: '【HV】指定色以外のカード(能力以外)を全て山札に戻す。', needsColor: true },
    'id_21': { rarity: 'SR', type: 'AT', name: 'アヤメ', desc: '【AT】自分以外のプレイヤーを一人指定し、そのプレイヤーにカードを3枚引かせる。', needsTarget: true },
    'id_22': { rarity: 'SSR', type: 'HE', name: '遊鈴', desc: '【HE】自分のデバフ(凍結/燃焼)を1つ解除し、自分以外の全員に1枚カードを引かせる。', needsDebuffSelect: true },
    'id_23': { rarity: 'SSR', type: 'HE', name: 'ダンタ', desc: '【HE】自分を1ターン無敵状態にし、デバフを1つランダムに解除する。' },
    'id_24': { rarity: 'R', type: 'AT', name: 'アクアヘッド', desc: '【AT】自分以外のランダムなプレイヤーに燃焼を1ターン付与する。' },
    'id_25': { rarity: 'UR', type: 'HV', name: 'ミサ', desc: '【HV】1枚Wild化+SSR以下能力回収。さらに蘇生(次に引く時手札に戻る)を付与。', needsGraveyard: true },
    'id_26': { rarity: 'UR', type: 'HV', name: '運命の三姉妹', desc: '【HV】じゃんけん(最大4回)。勝敗に関わらず2ドロー、勝利/あいこなら相手2ドローさせ自分は既存カード1枚破棄。', needsJanken: true },
    'id_27': { rarity: 'SR', type: 'HE', name: 'クララ', desc: '【HE】45%の確率で自分の手札をランダムに2枚捨てる。' },
    'id_28': { rarity: 'SSR', type: 'AT', name: 'リナ', desc: '【AT】ランダムなプレイヤーに2ターン燃焼を付与する。その後そのプレイヤーに1枚引かせる(防御不可)。' },
    'id_29': { rarity: 'SR', type: 'AT', name: 'エロス', desc: '【AT】自分以外の全員に75%の確率で2枚引かせる。' },
    'id_30': { rarity: 'SR', type: 'BL', name: 'カシャ', desc: '【BL】防御時、ランダムなプレイヤーに燃焼を1ターン付与し、自分にシールドIを1ターン付与する。' },
    'id_31': { rarity: 'SSR', type: 'BL', name: 'カレン', desc: '【BL】防御時、自分のシールドIIIを3ターン付与する。また、既にシールドがある場合は重複する。' },
    'id_32': { rarity: 'SSR', type: 'AT', name: 'フェイ', desc: '【AT】自分以外のランダムなプレイヤーに燃焼(2T開始時固定1ドロー)を付与(3回発動)。既に燃焼がある場合は重複する。' },
    'id_33': { rarity: 'SSR', type: 'AT', name: 'ライア', desc: '【AT】自分以外のプレイヤーを一人指定し1枚ドローさせる。発動後このカードを手札に戻してもよい。(3回のみ)', needsTarget: true },
    'id_34': { rarity: 'SR', type: 'HE', name: 'オリヴィア', desc: '【HE】自分に回避I(20%の確率で攻撃を防ぐ)を1ターン付与する。' },
    'id_35': { rarity: 'UR', type: 'HV', name: 'イヴ', desc: '【HV】ランダム燃焼＋全員裂傷付与。さらに蘇生(次に引く時手札に戻る)を付与。' }
};

window.AbilityEngine = {
    checkEvasion: function(target) {
        if (!target || !target.evasion || target.evasion.turns <= 0 || target.evasion.level <= 0) return false;
        let rate = 0;
        if (target.evasion.level === 1) rate = 0.20;
        else if (target.evasion.level === 2) rate = 0.50;
        else if (target.evasion.level >= 3) rate = 0.80;
        return Math.random() < rate;
    },

    applyDraw: function(game, targetId, count, blockable = true, isForcedByAbility = true, isLacerationDraw = false) {
        const t = game.players.find(p => p.id === targetId);
        if (!t) return 0;
        if (t.invincibleTurns > 0) return 0; 
        if (this.checkEvasion(t)) return -1; 
        
        let actualDrawn = count;
        let lacerationTriggered = false;

        //  修正: 自分がドローする時で、裂傷ドロー以外の時に+1枚する
        if (!isLacerationDraw && t.lacerationTurns > 0 && actualDrawn > 0) {
            actualDrawn += 1;
            lacerationTriggered = true;
        }
        
        for (let i = 0; i < actualDrawn; i++) {
            game.drawCard(targetId, !blockable, isForcedByAbility); 
        }

        // 裂傷で追加ドローしたならSEを鳴らす
        if (lacerationTriggered && window.SE) {
            window.SE.play('laceration');
        }

        if (actualDrawn > 0 && window.isHost && window.socket) {
            window.socket.emit('request_draw_animation', { playerId: targetId, count: actualDrawn });
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
            const self = game.players.find(p=>p.id===attackerId);
            if(self) self.shield = { level: 2, turns: 2 };
            if (isManualDiscard && discCard) {
                if (Math.random() < 0.15) {
                    if (game.hands[attackerId]) game.hands[attackerId].push(discCard);
                }
            }
        }
    },

    resolve: function(game, attackerId, abilityId, selectedTargetId, discCard, defenseResponses, multiplier = 1, selectedColor = null, multiCards = [], extraData = {}) {
        let guides = [];
        const def = window.AbilityDef[abilityId];
        if (!def) return guides;

        const others = game.players.filter(p => p.id !== attackerId && p.connected);
        const self = game.players.find(p => p.id === attackerId);

        if (abilityId === 'id_4') this.triggerDiscardEffect(game, attackerId, 'id_4', false, null);

        let costPaid = false; 
        if ((def.needsDiscard || def.needsAbilityDiscard) && discCard) {
            if (window.isHost && window.socket) window.socket.emit('request_play_animation', { playerId: attackerId, cards: [discCard] });
            this.triggerDiscardEffect(game, attackerId, discCard.value, true, discCard);
            costPaid = true;
        }

        // --- 個別能力解決 ---
        for (let m = 0; m < multiplier; m++) {
            
            if (abilityId === 'id_20') { // 幽艶レベッカ
                const hand = game.hands[attackerId];
                if (hand && selectedColor) {
                    let toReturn = [];
                    for (let i = hand.length - 1; i >= 0; i--) {
                        const c = hand[i];
                        const isAb = c.value && String(c.value).startsWith('id_');
                        if (!isAb && c.color !== selectedColor && c.color !== 'black') {
                            toReturn.push(hand.splice(i, 1)[0]);
                        }
                    }
                    if (toReturn.length > 0) {
                        game.deck.push(...toReturn);
                        game.deck = UNORules.shuffle(game.deck);
                        guides.push({ from: attackerId, to: attackerId, text: `${toReturn.length}枚山札送り` });
                    }
                }
            } 
            else if (abilityId === 'id_25') { // ミサ
                const hand = game.hands[attackerId];
                if (hand && hand.length > 0) {
                    const rIdx = Math.floor(Math.random() * hand.length);
                    hand[rIdx] = { color: 'black', value: 'Wild' };
                }
                if (extraData.graveyardCardId) {
                    if (hand) hand.push({ color: 'black', value: extraData.graveyardCardId });
                    const gIdx = game.abilityGraveyard.indexOf(extraData.graveyardCardId);
                    if (gIdx > -1) game.abilityGraveyard.splice(gIdx, 1);
                }
                if (self && self.resurrectionMisaCount === -1) self.resurrectionMisaCount = 0;
                guides.push({ from: attackerId, to: attackerId, text: 'Wild化＆蘇生付与' });
            }
            else if (abilityId === 'id_27') { // クララ
                if (Math.random() < 0.45) {
                    const tHand = game.hands[attackerId];
                    if (tHand && tHand.length > 0) {
                        let dropCount = Math.min(2, tHand.length);
                        for (let i = 0; i < dropCount; i++) {
                            const rIdx = Math.floor(Math.random() * tHand.length);
                            const dropCard = tHand.splice(rIdx, 1)[0];
                            game.discardPile.push(dropCard);
                            game.discardRotations.push(0);
                        }
                        guides.push({ from: attackerId, to: attackerId, text: `2枚破棄(成功)` });
                    }
                } else {
                    guides.push({ from: attackerId, to: attackerId, text: `不発` });
                }
            }
            else if (abilityId === 'id_35') { // イヴ
                if (others.length > 0) {
                    const tid = others[Math.floor(Math.random() * others.length)].id;
                    this.applyBurn(game, tid, 2);
                    guides.push({ from: attackerId, to: tid, text: '🔥燃焼(2T)', se: 'fire' });
                }
                others.forEach(o => {
                    o.lacerationTurns = 2;
                    guides.push({ from: attackerId, to: o.id, text: '💢裂傷(2T)' });
                });
                if (self && self.resurrectionEveCount === -1) self.resurrectionEveCount = 0;
            }
            else if (abilityId === 'id_32') {
                for (let i = 0; i < 3; i++) {
                    if (others.length > 0) {
                        const tid = others[Math.floor(Math.random() * others.length)].id;
                        const res = this.applyBurn(game, tid, 2);
                        if (res === -1) guides.push({ from: attackerId, to: tid, text: '💨回避!' });
                        else guides.push({ from: attackerId, to: tid, text: '🔥燃焼(2T)', se: 'fire' });
                    }
                }
            }

            // --- AT/HE 共通判定 ---
            if (def.type === 'AT' || def.type === 'AT_BL') {
                let actualTargets = [];
                if (def.needsTarget && selectedTargetId) actualTargets = [selectedTargetId];
                else if (['id_2', 'id_6', 'id_9', 'id_18', 'id_29'].includes(abilityId)) actualTargets = others.map(p => p.id);
                else if (['id_14', 'id_24', 'id_28'].includes(abilityId)) {
                    if (others.length > 0) actualTargets = [others[Math.floor(Math.random() * others.length)].id];
                }

                actualTargets.forEach(t => {
                    let targetId = t;
                    const resp = defenseResponses ? defenseResponses[targetId] : null;
                    if (resp && resp.cardValue) return;

                    let drawCount = 0;
                    if (abilityId === 'id_1') {
                        drawCount = 1;
                        if (Math.random() < 0.70) {
                            const fres = this.applyFreeze(game, targetId);
                            if (fres === -1) guides.push({ from: attackerId, to: targetId, text: '💨回避!' });
                            else guides.push({ from: targetId, to: targetId, text: '❄凍結', se: 'frieze' });
                        }
                    } else if (abilityId === 'id_2') {
                        drawCount = 1;
                        if (Math.random() < 0.60) {
                            drawCount += 1;
                            guides.push({ from: attackerId, to: targetId, text: '追加1ドロー' });
                        }
                    } else if (abilityId === 'id_6') {
                        const tHand = game.hands[targetId];
                        let discCount = 0;
                        while(tHand && tHand.length > 0 && discCount < 2) {
                            const rIdx = Math.floor(Math.random() * tHand.length);
                            const discarded = tHand.splice(rIdx, 1)[0];
                            game.discardPile.push(discarded);
                            game.discardRotations.push(0);
                            discCount++;
                        }
                        drawCount = 3;
                    } else if (abilityId === 'id_7') {
                        const bres = this.applyBurn(game, targetId, 5);
                        if (bres === -1) guides.push({ from: attackerId, to: targetId, text: '💨回避!' });
                        else guides.push({ from: attackerId, to: targetId, text: '🔥燃焼(5T)', se: 'fire' });
                    } else if (abilityId === 'id_9') drawCount = 1;
                    else if (abilityId === 'id_12') drawCount = 2;
                    else if (abilityId === 'id_14') drawCount = 4;
                    else if (abilityId === 'id_15') drawCount = 2;
                    else if (abilityId === 'id_18') drawCount = 1;
                    else if (abilityId === 'id_21') drawCount = 3;
                    else if (abilityId === 'id_24') {
                        const bres = this.applyBurn(game, targetId, 1);
                        if (bres === -1) guides.push({ from: attackerId, to: targetId, text: '💨回避!' });
                        else guides.push({ from: attackerId, to: targetId, text: '🔥燃焼(1T)', se: 'fire' });
                    } else if (abilityId === 'id_28') {
                        const bres = this.applyBurn(game, targetId, 2);
                        if (bres === -1) guides.push({ from: attackerId, to: targetId, text: '💨回避!' });
                        else guides.push({ from: attackerId, to: targetId, text: '🔥燃焼+1枚(貫通)' });
                        drawCount = 1;
                    } else if (abilityId === 'id_29') {
                        if (Math.random() < 0.75) drawCount = 2;
                        else guides.push({ from: attackerId, to: targetId, text: 'ハズレ!' });
                    } else if (abilityId === 'id_33') {
                        drawCount = 1;
                        if (extraData.returnRaia) {
                            if (self) { self.usedRaia = true; self.raiaReturnPending = true; }
                            guides.push({ from: attackerId, to: attackerId, text: '回収待機' });
                        }
                    }

                    if (drawCount > 0) {
                        const actualDrawn = this.applyDraw(game, targetId, drawCount, abilityId !== 'id_28', true);
                        if (actualDrawn === -1) guides.push({ from: attackerId, to: targetId, text: `💨回避!` });
                        else if(actualDrawn > 0) guides.push({ from: attackerId, to: targetId, text: `${actualDrawn}枚` });
                    }
                });

                if (abilityId === 'id_2') {
                    if(self) self.shield = { level: 1, turns: 1 };
                } else if (abilityId === 'id_18') {
                    if(self) self.shield = { level: 1, turns: 2 };
                }
            }

            if (def.type === 'HE' || def.type === 'HE_BL') {
                if (abilityId === 'id_3' && costPaid) {
                    guides.push({ from: attackerId, to: attackerId, text: '1枚捨てる' });
                } else if (abilityId === 'id_5') {
                    const hand = game.hands[attackerId];
                    if (hand) {
                        for(let i=0; i<2; i++) {
                            const val = Math.random() < 0.8 ? '+2' : 'Wild+4';
                            const col = val === 'Wild+4' ? 'black' : ['red','blue','green','yellow'][Math.floor(Math.random()*4)];
                            hand.push({ color: col, value: val });
                        }
                        guides.push({ from: attackerId, to: attackerId, text: '+補充' });
                        if (window.isHost && window.socket) window.socket.emit('request_draw_animation', { playerId: attackerId, count: 2 });
                    }
                } else if (abilityId === 'id_8') {
                    this.applyDraw(game, selectedTargetId, 1, true, true);
                    if (self) self.evasion = { level: 1, turns: 2 };
                    guides.push({ from: attackerId, to: attackerId, text: '💨回避I(2T)' });
                } else if (abilityId === 'id_10') {
                    if (game.lockRandomCard) game.lockRandomCard(attackerId, selectedTargetId, 'number', 3, 2);
                    guides.push({ from: attackerId, to: selectedTargetId, text: '数字3枚ロック', se: 'rock' });
                } else if (abilityId === 'id_11') {
                    if (game.lockRandomCard) game.lockRandomCard(attackerId, selectedTargetId, 'symbol', 2, 2);
                    guides.push({ from: attackerId, to: selectedTargetId, text: '記号2枚ロック', se: 'rock' });
                } 
                // ★復活: 消えてしまっていた id_13, id_16, id_22, id_23 の処理を追加
                else if (abilityId === 'id_13') {
                    const othersList = game.players.filter(p=>p.id!==attackerId && p.connected);
                    if (othersList.length > 0) {
                        const tid = othersList[Math.floor(Math.random() * othersList.length)].id;
                        this.applyDraw(game, tid, 1, true, true);
                        const tHand = game.hands[tid];
                        let symbolIndices = [];
                        if (tHand) {
                            for (let i = 0; i < tHand.length; i++) {
                                const c = tHand[i];
                                if (!(c.value && String(c.value).startsWith('id_')) && !/^[0-9]$/.test(c.value)) symbolIndices.push(i);
                            }
                        }
                        if (symbolIndices.length > 0) {
                            const rIdx = symbolIndices[Math.floor(Math.random() * symbolIndices.length)];
                            const returnedCard = tHand.splice(rIdx, 1)[0];
                            if (game.deck) {
                                const insertPos = Math.floor(Math.random() * (game.deck.length + 1));
                                game.deck.splice(insertPos, 0, returnedCard);
                            }
                            guides.push({ from: attackerId, to: tid, text: '記号戻し' });
                        } else {
                            this.applyDraw(game, tid, 1, true, true);
                            guides.push({ from: attackerId, to: tid, text: '追加1ドロー' });
                        }
                    }
                } else if (abilityId === 'id_16') {
                    if(self) { 
                        self.frozen = false; self.burnTurns = 0; 
                        self.evasion = { level: 2, turns: 1 };
                        guides.push({ from: attackerId, to: attackerId, text: '✨解除＆💨回避II(1T)' }); 
                    }
                } else if (abilityId === 'id_22') {
                    if (self) {
                        if (extraData.debuffToClear === 'frozen') self.frozen = false;
                        else if (extraData.debuffToClear === 'burn') self.burnTurns = 0;
                    }
                    game.players.forEach(p => {
                        if(p.connected && p.id !== attackerId) {
                            const res = this.applyDraw(game, p.id, 1, true, true);
                            if (res === -1) guides.push({ from: attackerId, to: p.id, text: '💨回避!' });
                            else guides.push({ from: attackerId, to: p.id, text: '1枚' });
                        }
                    });
                    guides.push({ from: attackerId, to: attackerId, text: 'デバフ解除' });
                } else if (abilityId === 'id_23') {
                    if(self) {
                        self.invincibleTurns = 1;
                        let dbfs = [];
                        if (self.frozen) dbfs.push('frozen');
                        if (self.burnTurns > 0) dbfs.push('burn');
                        if (dbfs.length > 0) {
                            const r = dbfs[Math.floor(Math.random()*dbfs.length)];
                            if (r === 'frozen') self.frozen = false;
                            else self.burnTurns = 0;
                        }
                    }
                    guides.push({ from: attackerId, to: attackerId, text: '無敵化＆デバフ解除' });
                } else if (abilityId === 'id_34') {
                    if(self) self.evasion = { level: 1, turns: 1 };
                    guides.push({ from: attackerId, to: attackerId, text: '💨回避I(1T)' });
                }
            }
        } // multiplier loop ends
        return guides;
    }
};