/**
 * ability.js
 */
window.AbilityDef = {
    'id_1': { type: 'AT', name: 'ミシェル', desc: '【AT】1人指定。1枚引かせ70%で凍結(能力のみ使用可)。', needsTarget: true },
    'id_2': { type: 'AT_BL', name: 'ルネイユ', desc: '【AT/BL】他全員に固定で1枚引かせる。また60%確率で他全員に固定で1枚引かせる。', fixedDraw: true },
    'id_3': { type: 'HE', name: 'ヴィオラ', desc: '【HE】手札を1枚選んで捨てる。', needsDiscard: true },
    'id_4': { type: 'HE_BL', name: 'ヘイゼル', desc: '【BL/受動】捨てられた時・場に出た時、他ランダム1人に1枚引かせる。また15%の確率でカードが消費されず手札に残る。' },
    'id_5': { type: 'HE', name: '瑠璃', desc: '【HE】自分の手札に+カードを2枚持ってくる。(内訳、各種+2：8割、+4：2割)' },
    'id_6': { type: 'AT', name: 'ラン', desc: '【AT】他全員に手札を2枚ランダムに捨てさせその後に3枚ドローさせる。' },
    'id_7': { type: 'AT', name: 'リリス', desc: '【AT】1人指定。燃焼(3T開始時固定1ドロー)を付与。', needsTarget: true },
    'id_8': { type: 'HE', name: 'ヘラ', desc: '【HE】1人指定し1枚引かせる。手札1枚捨てる。', needsTarget: true, needsDiscard: true },
    'id_9': { type: 'AT_BL', name: 'レナ', desc: '【AT/BL】他全員に1枚引かせる。防御時全員に固定2ドロー。' },
    'id_10': { type: 'HE', name: 'シャミール', desc: '【HE】1人指定。数字カード3枚を次の次ターンまでロック。', needsTarget: true },
    'id_11': { type: 'HE', name: 'レイ', desc: '【HE】1人指定。記号カード2枚を次の次ターンまでロック。', needsTarget: true },
    'id_12': { type: 'AT', name: 'アンドロス', desc: '【AT】1人指定。2枚引かせる。', needsTarget: true },
    'id_13': { type: 'HE', name: 'エリザベス', desc: '【HE】選ばれたランダムなプレイヤーに1枚引かせランダムな記号カードを1枚山札に戻す。無ければ追加で1枚引かせる。' },
    'id_14': { type: 'AT', name: 'ハンナ', desc: '【AT】ランダムなプレイヤーに4枚引かせる。' },
    'id_15': { type: 'AT', name: 'メリア', desc: '【AT】1人指定。固定で2枚引かせる。', needsTarget: true, fixedDraw: true },
    'id_16': { type: 'HE', name: 'ユメゴト', desc: '【HE】手札1枚捨てる。自身のデバフ(凍結/燃焼)を解除。', needsDiscard: true },
    'id_17': { type: 'BL', name: 'カシウス', desc: '【BL】防御時、手札1枚選んで捨てる。', needsDiscard: true },
    'id_18': { type: 'BL', name: 'グレイス', desc: '【BL】防御時、他全員に1枚引かせる。' },
    'id_19': { type: 'BL', name: 'ヴィンディ', desc: '【BL】防御時手札1枚捨てる。攻撃者に1枚引かせる。', needsDiscard: true },
    'id_20': { type: 'HV', name: '幽艶レベッカ', desc: '【HV】トリック・オア・キャロット。色を指定し、指定色のカードを好きな枚数重ねて出す。', needsColor: true }
};

window.AbilityEngine = {
    resolve: function(game, attackerId, abilityId, selectedTargetId, discCard, defenseResponses, multiplier = 1, selectedColor = null, multiCards = []) {
        const def = window.AbilityDef[abilityId];
        let guides = []; 

        if (!def) return guides;

        const triggerDiscardEffect = (pId, cVal, isCost = false, originalCard = null) => {
            if (cVal === 'id_4') {
                const others = game.players.filter(p => p.id !== pId);
                if (others.length > 0) {
                    const tid = others[Math.floor(Math.random() * others.length)].id;
                    game.drawCard(tid);
                    if (window.isHost && window.socket) window.socket.emit('request_draw_animation', { playerId: tid, count: 1 });
                    guides.push({ from: pId, to: tid, text: 'ヘイゼル' });
                }
                
                if (Math.random() < 0.15) {
                    guides.push({ from: pId, to: pId, text: '手札回帰' });
                    if (isCost && originalCard) {
                        game.hands[pId].push(originalCard);
                    } else if (!isCost && game.discardPile.length > 0 && game.discardPile[game.discardPile.length - 1].value === 'id_4') {
                        const returned = game.discardPile.pop();
                        game.discardRotations.pop();
                        game.hands[pId].push(returned);
                    }
                }
            }
        };

        if (abilityId === 'id_4') triggerDiscardEffect(attackerId, 'id_4', false, null);

        let costPaid = false; 
        if ((def.needsDiscard || def.needsAbilityDiscard) && discCard) {
            game.discardPile.push(discCard);
            game.discardRotations.push(0);
            if (window.isHost && window.socket) window.socket.emit('request_play_animation', { playerId: attackerId, cards: [discCard] });
            triggerDiscardEffect(attackerId, discCard.value, true, discCard);
            costPaid = true;
        }

        if (def.needsAbilityDiscard && !costPaid) {
            guides.push({ from: attackerId, to: attackerId, text: '不発(コストなし)' });
            return guides;
        }

        if (abilityId === 'id_20') {
            if (costPaid && multiCards && multiCards.length > 0) {
                game.discardPile.push(...multiCards);
                multiCards.forEach(() => game.discardRotations.push(0));
                if (window.isHost && window.socket) window.socket.emit('request_play_animation', { playerId: attackerId, cards: multiCards });
                guides.push({ from: attackerId, to: attackerId, text: `${selectedColor}を${multiCards.length}枚放出` });
            }
            return guides; 
        }

        // 重ね出し（multiplier）の回数分ループして能力を発動
        for (let m = 0; m < multiplier; m++) {
            let actualTargets = [];
            if (def.needsTarget && selectedTargetId) actualTargets = [selectedTargetId];
            else if (abilityId === 'id_6' || abilityId === 'id_2' || abilityId === 'id_9') actualTargets = game.players.filter(p => p.id !== attackerId).map(p=>p.id);
            else if (abilityId === 'id_13') actualTargets = ['random_other'];
            else if (abilityId === 'id_14') actualTargets = ['random_other'];
            else if (abilityId === 'id_5') actualTargets = [attackerId];

            actualTargets.forEach(t => {
                let targetId = t;
                if (t === 'random_other') {
                    const others = game.players.filter(p => p.id !== attackerId);
                    targetId = others.length > 0 ? others[Math.floor(Math.random() * others.length)].id : attackerId;
                }
                if (!targetId) return;

                if (targetId !== attackerId && abilityId !== 'id_4') {
                    guides.push({ from: attackerId, to: targetId, text: (multiplier > 1 ? `${def.name} x${m+1}` : def.name) });
                }

                let reduceDraw = false;

                // 防御効果は1回目の発動時のみ判定し、防がれたらドロー数が半減する
                if (m === 0 && defenseResponses && defenseResponses[targetId] && defenseResponses[targetId].cardValue) {
                    const resp = defenseResponses[targetId];
                    const defCardId = resp.cardValue;
                    const tHand = game.hands[targetId];
                    const cIdx = tHand.findIndex(c => c.value === defCardId);
                    
                    let actualDefDiscardIdx = resp.discardIdx;
                    if (cIdx > -1) {
                        if (actualDefDiscardIdx !== null && cIdx < actualDefDiscardIdx) actualDefDiscardIdx--;
                        const playedDefCard = tHand.splice(cIdx, 1)[0];
                        game.discardPile.push(playedDefCard);
                        game.discardRotations.push(0);
                        if (window.isHost && window.socket) window.socket.emit('request_play_animation', { playerId: targetId, cards: [playedDefCard] });
                        guides.push({ from: targetId, to: targetId, text: '防ぐ!(半減)' });
                    }
                    
                    if (defCardId === 'id_2' || defCardId === 'id_18') {
                        game.players.filter(p => p.id !== targetId).forEach(p => {
                            game.drawCard(p.id);
                            if(window.isHost && window.socket) window.socket.emit('request_draw_animation', { playerId: p.id, count: 1 });
                        });
                    } else if (defCardId === 'id_4') {
                        triggerDiscardEffect(targetId, 'id_4', false, null);
                    } else if (defCardId === 'id_9') {
                        game.players.forEach(p => {
                            game.drawCard(p.id); game.drawCard(p.id);
                            if(window.isHost && window.socket) window.socket.emit('request_draw_animation', { playerId: p.id, count: 2 });
                        });
                    } else if (defCardId === 'id_17' || defCardId === 'id_19') {
                        if (actualDefDiscardIdx !== null && game.hands[targetId] && game.hands[targetId].length > actualDefDiscardIdx) {
                            const discardC = game.hands[targetId].splice(actualDefDiscardIdx, 1)[0];
                            if (window.isHost && window.socket) window.socket.emit('request_play_animation', { playerId: targetId, cards: [discardC] });
                            triggerDiscardEffect(targetId, discardC.value, true, discardC);
                        }
                        if (defCardId === 'id_19') {
                            game.drawCard(attackerId);
                            if(window.isHost && window.socket) window.socket.emit('request_draw_animation', { playerId: attackerId, count: 1 });
                            guides.push({ from: targetId, to: attackerId, text: 'ヴィンディ' });
                        }
                    }
                    if (!def.fixedDraw) reduceDraw = true;
                }

                let drawCount = 0;

                if (abilityId === 'id_1') {
                    drawCount = 1;
                    if (!reduceDraw && Math.random() < 0.70) {
                        const p = game.players.find(px=>px.id === targetId);
                        if(p) { p.frozen = true; guides.push({ from: targetId, to: targetId, text: '❄凍結', se: 'frieze' }); }
                    }
                } else if (abilityId === 'id_2') {
                    drawCount = 1;
                    if (Math.random() < 0.60) {
                        drawCount += 1;
                        guides.push({ from: attackerId, to: targetId, text: 'ルネイユ追撃' });
                    }
                } else if (abilityId === 'id_5') {
                    const ruriCards = [];
                    for(let i=0; i<2; i++) {
                        if (Math.random() < 0.8) ruriCards.push({ color: ['red','blue','green','yellow'][Math.floor(Math.random()*4)], value: '+2' });
                        else ruriCards.push({ color: 'black', value: 'Wild+4' });
                    }
                    game.hands[targetId].push(...ruriCards);
                    guides.push({ from: targetId, to: targetId, text: '+補充' });
                } else if (abilityId === 'id_6') {
                    const tHand = game.hands[targetId];
                    let discCount = 0;
                    while(tHand && tHand.length > 0 && discCount < 2) {
                        const rIdx = Math.floor(Math.random() * tHand.length);
                        const discarded = tHand.splice(rIdx, 1)[0];
                        game.discardPile.push(discarded);
                        game.discardRotations.push(0);
                        if (window.isHost && window.socket) window.socket.emit('request_play_animation', { playerId: targetId, cards: [discarded] });
                        discCount++;
                    }
                    drawCount = 3;
                } else if (abilityId === 'id_7' && !reduceDraw) {
                    const p = game.players.find(px=>px.id === targetId);
                    if(p) { p.burnTurns += 3; guides.push({ from: targetId, to: targetId, text: '🔥燃焼', se: 'fire' }); }
                } else if (abilityId === 'id_8') {
                    drawCount = 1;
                } else if (abilityId === 'id_9') {
                    drawCount = 1;
                } else if (abilityId === 'id_10' && !reduceDraw) {
                    if (game.lockRandomCard) game.lockRandomCard(attackerId, targetId, 'number', 3, 2); 
                    guides.push({ from: targetId, to: targetId, text: '🔒ロック', se: 'rock' });
                } else if (abilityId === 'id_11' && !reduceDraw) {
                    if (game.lockRandomCard) game.lockRandomCard(attackerId, targetId, 'symbol', 2, 2); 
                    guides.push({ from: targetId, to: targetId, text: '🔒ロック', se: 'rock' });
                } else if (abilityId === 'id_12') {
                    drawCount = 2;
                } else if (abilityId === 'id_13') {
                    drawCount = 1;
                    const tHand = game.hands[targetId];
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
                        guides.push({ from: targetId, to: targetId, text: '山札へ戻す' });
                    } else {
                        drawCount += 1;
                        guides.push({ from: targetId, to: targetId, text: '追加ドロー' });
                    }
                } else if (abilityId === 'id_14') {
                    drawCount = 4;
                } else if (abilityId === 'id_15') {
                    drawCount = 2;
                }

                if (drawCount > 0) {
                    if (reduceDraw && !def.fixedDraw) drawCount = Math.max(1, Math.floor(drawCount / 2));
                    for(let i=0; i<drawCount; i++) game.drawCard(targetId);
                    if (window.isHost && window.socket) window.socket.emit('request_draw_animation', { playerId: targetId, count: drawCount });
                }
            });

            if (abilityId === 'id_16') {
                const self = game.players.find(p=>p.id === attackerId);
                if(self) { self.frozen = false; self.burnTurns = 0; guides.push({ from: attackerId, to: attackerId, text: '✨解除' }); }
            }
        } 

        return guides;
    }
};