// server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
const url = require('url'); // ★ 追加

const UNORules = require('./rule.js');
const { AbilityDef, AbilityEngine } = require('./ability.js');
const UNOGame = require('./game.js');
const UNOBot = require('./bot.js');

const PORT = process.env.PORT || 3000;

const mimeTypes = {
    '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
    '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpg', '.gif': 'image/gif',
    '.mp3': 'audio/mpeg', 
    '.wav': 'audio/wav',
    '.mov': 'video/quicktime',
    '.mp4': 'video/mp4'
};

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'ngrok-skip-browser-warning, Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // ★ 修正箇所: クエリパラメータ（?v=25 など）を取り除いて純粋なパスを取得する
    const parsedUrl = url.parse(req.url);
    let filePath = '.' + parsedUrl.pathname;
    if (filePath === './') filePath = './index.html';

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                console.log(`[404] File not found: ${filePath}`); // サーバーログで確認用
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end("404 Not Found", 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + err.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

const rooms = {};

function broadcastGameState(roomId) {
    const room = rooms[roomId];
    if (!room || !room.gameInstance) return;
    const game = room.gameInstance;

    const state = {
        deck: game.deck,
        turnIndex: game.turnIndex,
        direction: game.direction,
        hands: game.hands,
        discardPile: game.discardPile,
        discardRotations: game.discardRotations,
        drawStack: game.drawStack,
        currentColor: game.currentColor,
        playersInfo: game.players.map(p => ({ 
            id: p.id, connected: p.connected, frozen: p.frozen, burnTurns: p.burnTurns, 
            invincibleTurns: p.invincibleTurns, shield: p.shield, evasion: p.evasion, usedRaia: p.usedRaia 
        })),
        hasDrawnThisTurn: game.hasDrawnThisTurn,
        unoDeclared: game.unoDeclared,
        ruleSettings: room.ruleSettings,
        defensePhase: room.pendingDefense ? room.pendingDefense.info : null,
        defenseTimer: room.pendingDefense ? room.pendingDefense.timer : 0,
        attackGuides: room.attackGuides || [],
        abilityGraveyard: game.abilityGraveyard,
        jankenPhase: room.pendingJanken,
        customDeck: game.customDeck
    };

    io.to(roomId).emit('update_game_state', state);
    room.attackGuides = [];

    if (game.animationEvents && game.animationEvents.length > 0) {
        game.animationEvents.forEach(ev => {
            if (ev.type === 'announce_draw') io.to(roomId).emit('game_over', { isDraw: true });
            else io.to(roomId).emit(ev.type, ev.data);
        });
        game.clearAnimationEvents();
    }
}

function checkWin(roomId) {
    const room = rooms[roomId];
    const game = room.gameInstance;
    let someoneWon = false;
    game.players.forEach(p => {
        if (game.hands[p.id] && game.hands[p.id].length === 0) {
            someoneWon = true;
            io.to(roomId).emit('game_over', { winnerId: p.id, winnerName: p.name });
            if(room.timers.turn) clearTimeout(room.timers.turn);
        }
    });
    return someoneWon;
}

function startTurnTimer(roomId) {
    const room = rooms[roomId];
    if (!room || !room.gameInstance) return;
    const game = room.gameInstance;

    room.isProcessingAction = false; 

    if (room.timers.turn) clearTimeout(room.timers.turn);
    if (game.isGameOver || checkWin(roomId)) return;

    const current = game.currentPlayer;
    if (!current) return;

    broadcastGameState(roomId);

    if (current.type === 'bot' || !current.connected) {
        room.timers.turn = setTimeout(() => {
            if (room.pendingDefense || room.pendingJanken || game.currentPlayer.id !== current.id) return;
            playBotTurn(roomId, current.id);
        }, 1500);
    } else {
        let afkTime = 0;
        room.timers.turn = setInterval(() => {
            if (room.pendingDefense || room.pendingJanken) return;
            afkTime++;
            if (afkTime >= 180) { 
                clearInterval(room.timers.turn);
                if (game.currentPlayer.id === current.id) playBotTurn(roomId, current.id);
            }
        }, 1000);
    }
}

function playBotTurn(roomId, botId) {
    const room = rooms[roomId];
    const game = room.gameInstance;
    
    const result = UNOBot.play(game, botId);
    
    if (result.action === 'play') {
        const playedCards = result.indices.map(i => game.hands[botId][i]);
        const isAbility = playedCards[0] && playedCards[0].value && String(playedCards[0].value).startsWith('id_');
        const def = isAbility ? AbilityDef[playedCards[0].value] : null;

        if (isAbility && def && def.type === 'BL') {
            io.to(roomId).emit('play_animation', { playerId: botId, cards: playedCards });
            setTimeout(() => { 
                if (room.pendingDefense || room.pendingJanken || game.currentPlayer.id !== botId) return;
                room.isProcessingAction = true; 
                executeAbilityPlay(roomId, botId, result.indices, null, null, null, [], {}); 
            }, playedCards.length * 100 + 400);
            return;
        }

        let botSelectedColor = null;
        let botMultiDiscardIndices = [];
        let botDiscardIdx = null;
        let extraData = {};

        if (isAbility && def) {
            if (def.needsColor) botSelectedColor = ['red', 'blue', 'green', 'yellow'][Math.floor(Math.random() * 4)];
            if (def.needsAbilityDiscard) {
                const bHand = game.hands[botId];
                botDiscardIdx = bHand.findIndex((c, i) => !result.indices.includes(i) && (c.value && String(c.value).startsWith('id_')));
                if(botDiscardIdx === -1) botDiscardIdx = null;
            } else if (def.needsDiscard) {
                const bHand = game.hands[botId];
                botDiscardIdx = bHand.findIndex((c, i) => !result.indices.includes(i) && !(c.value && String(c.value).startsWith('id_')));
                if(botDiscardIdx === -1) botDiscardIdx = bHand.length > result.indices.length ? bHand.findIndex((c,i)=>!result.indices.includes(i)) : null;
            }
            if (playedCards[0].value === 'id_20' && botSelectedColor) {
                const bHand = game.hands[botId];
                bHand.forEach((c, i) => {
                    if (!result.indices.includes(i) && c.color === botSelectedColor) botMultiDiscardIndices.push(i);
                });
            }
            let botTargetId = null;
            if (def.needsTarget) {
                const others = game.players.filter(p=>p.id!==botId);
                if(others.length>0) botTargetId = others[Math.floor(Math.random()*others.length)].id;
            }
            if (def.needsGraveyard) {
                const gyList = game.abilityGraveyard.filter(id => AbilityDef[id] && AbilityDef[id].rarity !== 'UR');
                if (gyList.length > 0) extraData.graveyardCardId = gyList[Math.floor(Math.random() * gyList.length)];
            }
            if (def.needsDebuffSelect) {
                const p = game.players.find(x=>x.id===botId);
                if (p && p.frozen) extraData.debuffToClear = 'frozen';
                else if (p && p.burnTurns > 0) extraData.debuffToClear = 'burn';
            }
            
            io.to(roomId).emit('play_animation', { playerId: botId, cards: playedCards });
            setTimeout(() => {
                if (room.pendingDefense || room.pendingJanken || game.currentPlayer.id !== botId) return;
                room.isProcessingAction = true; 
                executeAbilityPlay(roomId, botId, result.indices, botTargetId, botDiscardIdx, botSelectedColor, botMultiDiscardIndices, extraData);
            }, playedCards.length * 100 + 400);
        } else {
            io.to(roomId).emit('play_animation', { playerId: botId, cards: playedCards });
            setTimeout(() => { 
                if (room.pendingDefense || room.pendingJanken || game.currentPlayer.id !== botId) return;
                room.isProcessingAction = true; 
                executePlay(roomId, botId, result.indices, true); 
            }, playedCards.length * 100 + 400);
        }
    } else {
        const drawCount = result.count || 1;
        io.to(roomId).emit('draw_animation', { playerId: botId, count: drawCount });
        setTimeout(() => {
            if (room.pendingDefense || room.pendingJanken || game.currentPlayer.id !== botId) return;
            room.isProcessingAction = true; 
            executeDraw(roomId, botId, true);
        }, drawCount * 100 + 400);
    }
}

function executePlay(roomId, playerId, indices, isBot = false) {
    const room = rooms[roomId];
    const game = room.gameInstance;

    const res = game.playCards(playerId, indices);
    
    if (res.penalty) {
        room.attackGuides = [{ from: playerId, to: playerId, text: `${res.penaltyReason}ペナルティ`, delay: 0 }];
        broadcastGameState(roomId);
        setTimeout(() => startTurnTimer(roomId), 1000);
        return;
    }

    if (res.success) {
        let isDrawAttack = false;
        let attackCardVal = null;

        if (res.lastCard && (res.lastCard.value === '+2' || res.lastCard.value === 'Wild+4')) {
            attackCardVal = res.lastCard.value;
            isDrawAttack = true;
        }

        if (checkWin(roomId)) return;

        if (res.isAbility) {
            broadcastGameState(roomId);
            setTimeout(() => startTurnTimer(roomId), 500);
            return;
        }

        if (res.needsColor) {
            if (isDrawAttack && game.ruleSettings.customCards && game.ruleSettings.customCards.length > 0) {
                room.pendingDrawDefenseInfo = { attackerId: playerId, cardValue: attackCardVal };
            }
            if (isBot) {
                const color = ['red', 'blue', 'green', 'yellow'][Math.floor(Math.random() * 4)];
                executeColor(roomId, playerId, color);
            } else {
                io.to(playerId).emit('show_color_selector');
                broadcastGameState(roomId);
            }
        } else {
            if (isDrawAttack) {
                const targetId = game.currentPlayer.id;
                room.attackGuides = [{ from: playerId, to: targetId, text: attackCardVal, delay: 0 }];
                if (game.ruleSettings.customCards && game.ruleSettings.customCards.length > 0) {
                    startDefensePhase(roomId, { attackerId: playerId, cardValue: attackCardVal, targets: [targetId] });
                } else {
                    broadcastGameState(roomId);
                    startTurnTimer(roomId);
                }
            } else {
                broadcastGameState(roomId);
                startTurnTimer(roomId);
            }
        }
    } else {
        if (isBot) executeDraw(roomId, playerId, true);
        else startTurnTimer(roomId);
    }
}

function executeAbilityPlay(roomId, playerId, indices, targetId, discardIdx, selectedColor, multiDiscardIndices, extraData) {
    const room = rooms[roomId];
    const game = room.gameInstance;
    const hand = game.hands[playerId];

    if (!hand || !hand[indices[0]]) { startTurnTimer(roomId); return; }

    const originalHand = [...hand];
    const playedCards = indices.map(i => originalHand[i]);
    const cardValue = playedCards[0].value;
    const def = AbilityDef[cardValue];

    if (!def) { executePlay(roomId, playerId, indices, false); return; }

    const multiplier = indices.length;
    const discCard = discardIdx !== null ? originalHand[discardIdx] : null;
    const multiCards = (multiDiscardIndices || []).map(i => originalHand[i]);

    let allRemoveIndices = [...indices];
    if (discardIdx !== null) allRemoveIndices.push(discardIdx);
    if (multiDiscardIndices && multiDiscardIndices.length > 0) allRemoveIndices.push(...multiDiscardIndices);
    
    allRemoveIndices = [...new Set(allRemoveIndices)].sort((a,b) => b - a);
    allRemoveIndices.forEach(i => hand.splice(i, 1));

    playedCards.forEach(c => {
        if (c.value && String(c.value).startsWith('id_')) game.abilityGraveyard.push(c.value);
        else { game.discardPile.push(c); game.discardRotations.push(0); }
    });

    if (cardValue === 'id_26') {
        setTimeout(() => startJankenPhase(roomId, playerId, 0), 2500);
        return;
    }

    let targets = [];
    if (def.needsTarget && targetId) targets = [targetId];
    else if (['id_2', 'id_6', 'id_9', 'id_18', 'id_29'].includes(cardValue)) targets = game.players.filter(p=>p.id!==playerId).map(p=>p.id);
    else if (['id_13', 'id_14', 'id_24', 'id_28'].includes(cardValue)) {
        const others = game.players.filter(p=>p.id!==playerId);
        if(others.length > 0) targets = [others[Math.floor(Math.random()*others.length)].id];
    } else if (cardValue === 'id_5' || cardValue === 'id_20') targets = [playerId];

    let needsDefense = false;
    if (def.type === 'AT' || def.type === 'AT_BL' || def.type === 'HV') {
        if (cardValue !== 'id_28' && def.type !== 'HV' && cardValue !== 'id_5' && cardValue !== 'id_20') {
            targets.forEach(tid => {
                const p = game.players.find(px=>px.id===tid);
                if (p && p.type === 'player' && p.connected) needsDefense = true;
            });
        }
    }

    if (needsDefense) {
        startDefensePhase(roomId, {
            attackerId: playerId, cardValue: cardValue, targets: targets,
            multiplier: multiplier, discCard: discCard, selectedColor: selectedColor, multiCards: multiCards, extraData: extraData
        });
    } else {
        let guides = AbilityEngine.resolve(game, playerId, cardValue, targetId, discCard, {}, multiplier, selectedColor, multiCards, extraData);
        guides.forEach(g => { if(g.delay === undefined) g.delay = 2500; });
        room.attackGuides.push(...guides);
        broadcastGameState(roomId);
        if (!checkWin(roomId)) setTimeout(() => startTurnTimer(roomId), 500);
    }
}

function executeColor(roomId, playerId, color) {
    const room = rooms[roomId];
    const game = room.gameInstance;
    
    game.currentColor = color;
    const info = room.pendingDrawDefenseInfo;
    room.pendingDrawDefenseInfo = null;

    game.nextTurn(1);

    if (info) {
        const targetId = game.currentPlayer.id;
        room.attackGuides = [{ from: info.attackerId, to: targetId, text: info.cardValue, delay: 0 }];
        if (game.ruleSettings.customCards && game.ruleSettings.customCards.length > 0) {
            startDefensePhase(roomId, { attackerId: info.attackerId, cardValue: info.cardValue, targets: [targetId] });
        } else {
            broadcastGameState(roomId);
            startTurnTimer(roomId);
        }
    } else {
        startTurnTimer(roomId);
    }
}

function executeDraw(roomId, playerId, isBot = false) {
    const room = rooms[roomId];
    const game = room.gameInstance;

    const stack = game.drawStack; const count = stack > 0 ? stack : 1;
    for(let i=0; i<count; i++) { if(!game.drawCard(playerId)) { if(game.isGameOver) return; break; } }
    if (stack > 0) { game.drawStack = 0; game.nextTurn(1); startTurnTimer(roomId); }
    else { 
        if (isBot) { game.nextTurn(1); startTurnTimer(roomId); } 
        else { game.hasDrawnThisTurn = true; broadcastGameState(roomId); room.isProcessingAction = false; } 
    }
}

function executeEndTurn(roomId, playerId) {
    const room = rooms[roomId];
    room.gameInstance.nextTurn(1);
    startTurnTimer(roomId);
}

function startDefensePhase(roomId, info) {
    const room = rooms[roomId];
    const game = room.gameInstance;

    let responses = {};
    info.targets.forEach(targetId => {
        const p = game.players.find(px => px.id === targetId);
        if (p && p.type === 'bot') {
            const bHand = game.hands[targetId];
            let hasDef = false;
            if(bHand) {
                const blIdx = bHand.findIndex(c => c.value && AbilityDef[c.value] && AbilityDef[c.value].type.includes('BL'));
                if (blIdx > -1) {
                    const blCard = bHand[blIdx];
                    let bDiscard = null;
                    const def = AbilityDef[blCard.value];
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
    });

    room.pendingDefense = { 
        timer: 30, 
        responses: responses,
        info: { ...info, phaseId: Date.now() }
    };

    if (Object.keys(responses).length >= info.targets.length) room.pendingDefense.timer = 0;
    broadcastGameState(roomId);

    room.timers.defense = setInterval(() => {
        if (!room.pendingDefense) { clearInterval(room.timers.defense); return; }
        if (room.pendingDefense.timer <= 0) {
            clearInterval(room.timers.defense);
            resolveDefensePhase(roomId);
        } else {
            room.pendingDefense.timer--;
            broadcastGameState(roomId);
        }
    }, 1000);
}

function resolveDefensePhase(roomId) {
    const room = rooms[roomId];
    const game = room.gameInstance;
    const phase = room.pendingDefense;
    room.pendingDefense = null;
    
    let guides = [];
    let blocked = false;
    const { attackerId, cardValue, targets, multiplier, discCard, selectedColor, multiCards, extraData } = phase.info;

    targets.forEach(tid => {
        const resp = phase.responses[tid];
        if (resp && resp.cardValue) {
            const defCardId = resp.cardValue;
            const tHand = game.hands[tid];
            const cIdx = tHand.findIndex(c => c.value === defCardId);
            
            let actualDefDiscardIdx = resp.discardIdx;
            if (cIdx > -1) {
                if (actualDefDiscardIdx !== null && cIdx < actualDefDiscardIdx) actualDefDiscardIdx--;
                const playedDefCard = tHand.splice(cIdx, 1)[0];
                game.abilityGraveyard.push(playedDefCard.value);
                io.to(roomId).emit('play_animation', { playerId: tid, cards: [playedDefCard] });
                guides.push({ from: tid, to: tid, text: '防ぐ!', delay: 2500 });
                blocked = true;
            }
            
            if (actualDefDiscardIdx !== null && tHand && tHand.length > actualDefDiscardIdx) {
                const discCard = tHand.splice(actualDefDiscardIdx, 1)[0];
                io.to(roomId).emit('play_animation', { playerId: tid, cards: [discCard] });
                AbilityEngine.triggerDiscardEffect(game, tid, discCard.value, true, discCard);
                if (discCard.value && String(discCard.value).startsWith('id_')) {
                    game.abilityGraveyard.push(discCard.value);
                } else {
                    game.discardPile.push(discCard);
                    game.discardRotations.push(0);
                }
            }

            const def = AbilityDef[defCardId];
            if (defCardId === 'id_2') {
                game.players.filter(px => px.id !== tid).forEach(px => { AbilityEngine.applyDraw(game, px.id, 1); });
                const targetP = game.players.find(p=>p.id===tid); if(targetP) targetP.shield = { level: 1, turns: 1 };
                if (Math.random() < 0.6) { game.players.filter(px => px.id !== tid).forEach(px => { AbilityEngine.applyDraw(game, px.id, 1); }); }
            } else if (defCardId === 'id_4') {
                AbilityEngine.triggerDiscardEffect(game, tid, 'id_4', false, null);
            } else if (defCardId === 'id_9') {
                game.players.filter(px => px.id !== tid).forEach(px => { AbilityEngine.applyDraw(game, px.id, 2); });
            } else if (defCardId === 'id_18') {
                game.players.filter(px => px.id !== tid).forEach(px => { AbilityEngine.applyDraw(game, px.id, 1); });
                const targetP = game.players.find(p=>p.id===tid); if(targetP) targetP.shield = { level: 1, turns: 2 };
            } else if (defCardId === 'id_19') {
                AbilityEngine.applyDraw(game, attackerId, 1);
                guides.push({ from: tid, to: attackerId, text: 'ヴィンディ', delay: 2500 });
            } else if (defCardId === 'id_30') {
                const others = game.players.filter(px => px.id !== tid && px.connected);
                if (others.length > 0) {
                    const bt = others[Math.floor(Math.random() * others.length)];
                    AbilityEngine.applyBurn(game, bt.id, 1);
                    guides.push({ from: tid, to: bt.id, text: '🔥燃焼(1T)', delay: 2500 });
                }
                const targetP = game.players.find(p=>p.id===tid); if (targetP) targetP.shield = { level: 1, turns: 1 };
            } else if (defCardId === 'id_31') {
                const targetP = game.players.find(p=>p.id===tid);
                if (targetP) {
                    if (!targetP.shield) targetP.shield = { level: 0, turns: 0 };
                    targetP.shield.level += 3;
                    targetP.shield.turns += 3;
                    guides.push({ from: tid, to: tid, text: '🛡️シールド強化!', delay: 2500 });
                }
            }
        }
    });

    if (cardValue === '+2' || cardValue === 'Wild+4') {
        if (blocked) game.drawStack = 0;
    } else {
        let resolveGuides = AbilityEngine.resolve(game, attackerId, cardValue, targets[0], discCard, phase.responses, multiplier || 1, selectedColor, multiCards, extraData);
        resolveGuides.forEach(g => { if(g.delay === undefined) g.delay = 2500; });
        guides.push(...resolveGuides);
    }

    room.attackGuides.push(...guides);
    broadcastGameState(roomId);
    if (!checkWin(roomId)) setTimeout(() => startTurnTimer(roomId), 500);
}

function startJankenPhase(roomId, attackerId, loopCount, fixedTargetId = null) {
    const room = rooms[roomId];
    const game = room.gameInstance;

    let targetId = fixedTargetId;
    if (!targetId) {
        const others = game.players.filter(p => p.id !== attackerId && p.connected);
        if (others.length === 0) { startTurnTimer(roomId); return; }
        targetId = others[Math.floor(Math.random() * others.length)].id;
    }
    
    room.pendingJanken = { attackerId, targetId, loopCount, attackerHand: null, targetHand: null, timer: 10, result: null };
    broadcastGameState(roomId);

    room.timers.janken = setInterval(() => {
        if (!room.pendingJanken || room.pendingJanken.result) { clearInterval(room.timers.janken); return; }
        room.pendingJanken.timer--;
        if (room.pendingJanken.timer <= 0) {
            clearInterval(room.timers.janken);
            if (!room.pendingJanken.attackerHand) room.pendingJanken.attackerHand = Math.floor(Math.random()*3)+1;
            if (!room.pendingJanken.targetHand) room.pendingJanken.targetHand = Math.floor(Math.random()*3)+1;
            resolveJanken(roomId);
        } else {
            [attackerId, targetId].forEach(id => {
                const p = game.players.find(px => px.id === id);
                if (p && p.type === 'bot' && !room.pendingJanken[(id===attackerId?'attackerHand':'targetHand')]) {
                    if (room.pendingJanken.timer === 8) { 
                        room.pendingJanken[(id===attackerId?'attackerHand':'targetHand')] = Math.floor(Math.random()*3)+1;
                        if (room.pendingJanken.attackerHand && room.pendingJanken.targetHand) resolveJanken(roomId);
                    }
                }
            });
            broadcastGameState(roomId);
        }
    }, 1000);
}

function resolveJanken(roomId) {
    const room = rooms[roomId];
    const game = room.gameInstance;
    if (room.timers.janken) clearInterval(room.timers.janken);

    const pJ = room.pendingJanken;
    const aH = pJ.attackerHand; const tH = pJ.targetHand;
    let result = 'draw';
    if (aH === tH) result = 'draw';
    else if ((aH===1 && tH===2) || (aH===2 && tH===3) || (aH===3 && tH===1)) result = 'win';
    else result = 'lose';

    pJ.result = result;
    broadcastGameState(roomId);

    setTimeout(() => {
        let drawCount = 0;
        if (result === 'win') drawCount = 2; 
        else if (result === 'lose' && pJ.loopCount === 0) drawCount = 2;
        
        if (drawCount > 0) {
            AbilityEngine.applyDraw(game, pJ.targetId, drawCount, false);
            room.attackGuides.push({ from: pJ.attackerId, to: pJ.targetId, text: 'じゃんけんドロー!', delay: 0 });
            broadcastGameState(roomId);
        }

        if (!checkWin(roomId)) {
            const nextLoop = pJ.loopCount + 1;
            const aId = pJ.attackerId; const tId = pJ.targetId; 

            if (result === 'win' && nextLoop < 4) {
                startJankenPhase(roomId, aId, nextLoop);
            } else if (result === 'draw') {
                startJankenPhase(roomId, aId, pJ.loopCount, tId);
            } else {
                room.pendingJanken = null;
                broadcastGameState(roomId);
                setTimeout(() => startTurnTimer(roomId), 500);
            }
        }
    }, 4500); 
}

io.on('connection', (socket) => {
    socket.on('create_room', (data) => {
        const roomId = Math.random().toString(36).substr(2, 6).toUpperCase();
        rooms[roomId] = {
            id: roomId, host: socket.id, slots: Array(10).fill(null).map(() => ({ id: null, userId: null, type: 'empty', name: '空き枠', icon: null, ready: false, connected: false })),
            ruleSettings: data.ruleSettings || {}, gameStarted: false, gameInstance: null, timers: {}, pendingDefense: null, pendingJanken: null, attackGuides: [],
            isProcessingAction: false 
        };
        rooms[roomId].slots[0] = { id: socket.id, userId: data.userId, type: 'host', name: data.playerName, icon: data.icon, ready: true, connected: true };
        socket.join(roomId); socket.roomId = roomId;
        socket.emit('room_created', roomId); io.to(roomId).emit('room_state_update', rooms[roomId]);
    });

    socket.on('join_room', (data) => {
        const room = rooms[data.roomId];
        if (room && !room.gameStarted) {
            const emptyIndex = room.slots.findIndex(s => s.type === 'empty');
            if (emptyIndex !== -1) {
                room.slots[emptyIndex] = { id: socket.id, userId: data.userId, type: 'player', name: data.playerName, icon: data.icon, ready: false, connected: true };
                socket.join(data.roomId); socket.roomId = data.roomId;
                io.to(data.roomId).emit('room_state_update', room);
            } else { socket.emit('error_message', '部屋が満員です'); }
        } else if (room && room.gameStarted) {
            const slot = room.slots.find(s => s.userId === data.userId);
            if (slot) {
                slot.id = socket.id; slot.connected = true;
                socket.join(data.roomId); socket.roomId = data.roomId;
                io.to(data.roomId).emit('room_state_update', room);
                if (room.gameInstance) broadcastGameState(data.roomId);
            } else { socket.emit('error_message', 'ゲームはすでに開始されています'); }
        } else { socket.emit('error_message', '部屋が見つかりません'); }
    });

    socket.on('update_slot', (data) => {
        const room = rooms[socket.roomId];
        if (room && room.host === socket.id && !room.gameStarted) {
            room.slots[data.index] = data.slotData; io.to(socket.roomId).emit('room_state_update', room);
        }
    });

    socket.on('player_ready', (isReady) => {
        const room = rooms[socket.roomId];
        if (room && !room.gameStarted) {
            const slot = room.slots.find(s => s.id === socket.id);
            if (slot) { slot.ready = isReady; io.to(socket.roomId).emit('room_state_update', room); }
        }
    });

    socket.on('update_rules', (settings) => {
        const room = rooms[socket.roomId];
        if (room && room.host === socket.id && !room.gameStarted) {
            room.ruleSettings = settings; io.to(socket.roomId).emit('room_state_update', room);
        }
    });

    socket.on('start_game', () => {
        const room = rooms[socket.roomId];
        if (room && room.host === socket.id && !room.gameStarted) {
            const players = room.slots.filter(s => s.type === 'host' || s.type === 'player' || s.type === 'bot');
            if (players.length < 2) { socket.emit('error_message', '2人以上プレイヤーが必要です'); return; }
            const allReady = players.every(p => p.type === 'bot' || p.ready);
            if (!allReady) { socket.emit('error_message', '全員が準備完了していません'); return; }

            room.gameStarted = true;
            room.isProcessingAction = false;
            room.gameInstance = new UNOGame();
            room.gameInstance.setup(room.slots, room.ruleSettings);
            room.gameInstance.start();

            io.to(socket.roomId).emit('game_started');
            
            setTimeout(() => {
                broadcastGameState(socket.roomId);
                const waitTime = (room.ruleSettings.abilityResetCount > 0) ? 13000 : 1000;
                setTimeout(() => startTurnTimer(socket.roomId), waitTime);
            }, 1000);
        }
    });

    socket.on('return_to_lobby', () => {
        const room = rooms[socket.roomId];
        if (room && room.host === socket.id) {
            room.gameStarted = false; room.gameInstance = null; room.pendingDefense = null; room.pendingJanken = null; room.attackGuides = [];
            room.isProcessingAction = false;
            if(room.timers.turn) clearTimeout(room.timers.turn);
            if(room.timers.defense) clearInterval(room.timers.defense);
            if(room.timers.janken) clearInterval(room.timers.janken);
            
            room.slots.forEach(s => { if (s.type === 'host' || s.type === 'player') s.ready = (s.type === 'host'); });
            io.to(socket.roomId).emit('back_to_lobby', room);
        }
    });

    socket.on('send_chat', (data) => { io.to(data.roomId).emit('receive_chat', data); });
    
    socket.on('declare_uno', (data) => {
        const room = rooms[socket.roomId];
        if (room && room.gameInstance) room.gameInstance.unoDeclared = true;
        io.to(socket.roomId).emit('broadcast_uno', data);
        broadcastGameState(socket.roomId);
    });

    socket.on('player_action', (data) => {
        const roomId = socket.roomId;
        const room = rooms[roomId];
        if (!room || !room.gameInstance) return;
        const game = room.gameInstance;

        if (room.isProcessingAction && data.action !== 'defense_response' && data.action !== 'janken_choice') return;

        if (['play', 'color', 'draw', 'end_turn'].includes(data.action)) {
            if (game.currentPlayer.id !== socket.id) return; 
            if (room.pendingDefense || room.pendingJanken) return; 
        }
        if (data.action === 'play_ability') {
            if (room.pendingDefense || room.pendingJanken) return; 
        }

        if (['play', 'play_ability', 'draw', 'end_turn', 'color', 'draw_penalty'].includes(data.action)) {
            room.isProcessingAction = true;
        }

        if (data.action === 'play') {
            io.to(roomId).emit('play_animation', { playerId: socket.id, cards: data.cards });
            setTimeout(() => executePlay(roomId, socket.id, data.indices), data.cards.length * 100 + 400);
        } else if (data.action === 'play_ability') {
            io.to(roomId).emit('play_animation', { playerId: socket.id, cards: data.cards, isHV: data.isHV });
            setTimeout(() => executeAbilityPlay(roomId, socket.id, data.indices, data.targetId, data.discardIdx, data.selectedColor, data.multiDiscardIndices, data.extraData), data.cards.length * 100 + 400);
        } else if (data.action === 'defense_response') {
            if (room.pendingDefense && room.pendingDefense.responses) {
                room.pendingDefense.responses[data.targetId] = { cardValue: data.cardValue || null, discardIdx: data.discardIdx !== undefined ? data.discardIdx : null };
                if (Object.keys(room.pendingDefense.responses).length >= room.pendingDefense.info.targets.length) {
                    room.pendingDefense.timer = 0; 
                }
            }
        } else if (data.action === 'draw') {
            io.to(roomId).emit('draw_animation', { playerId: socket.id, count: data.count });
            setTimeout(() => executeDraw(roomId, socket.id), data.count * 100 + 400);
        } else if (data.action === 'end_turn') {
            executeEndTurn(roomId, socket.id);
        } else if (data.action === 'color') {
            executeColor(roomId, socket.id, data.color);
        } else if (data.action === 'draw_penalty') {
            io.to(roomId).emit('draw_animation', { playerId: socket.id, count: data.count });
            setTimeout(() => {
                for(let i=0; i<data.count; i++) game.drawCard(socket.id);
                executeEndTurn(roomId, socket.id);
            }, data.count * 100 + 400);
        } else if (data.action === 'ability_reset') {
            game.replaceAbilityCards(socket.id, data.cards);
            broadcastGameState(roomId);
        } else if (data.action === 'janken_choice') {
            if (room.pendingJanken && !room.pendingJanken.result) {
                if (socket.id === room.pendingJanken.attackerId) room.pendingJanken.attackerHand = data.choice;
                if (socket.id === room.pendingJanken.targetId) room.pendingJanken.targetHand = data.choice;
                if (room.pendingJanken.attackerHand && room.pendingJanken.targetHand) resolveJanken(roomId);
            }
        }
    });

    socket.on('disconnect', () => {
        const roomId = socket.roomId;
        if (roomId && rooms[roomId]) {
            const room = rooms[roomId];
            if (room.host === socket.id) {
                io.to(roomId).emit('error_message', 'ホストが退出しました'); delete rooms[roomId];
            } else {
                const slot = room.slots.find(s => s.id === socket.id);
                if (slot) {
                    if (room.gameStarted) {
                        slot.connected = false;
                        
                        if (room.pendingDefense && room.pendingDefense.responses && room.pendingDefense.responses[slot.id]) {
                            if (!room.pendingDefense.responses[slot.id].cardValue) {
                                room.pendingDefense.responses[slot.id] = { cardValue: null, discardIdx: null };
                                if (Object.keys(room.pendingDefense.responses).length >= room.pendingDefense.info.targets.length) {
                                    room.pendingDefense.timer = 0; 
                                }
                            }
                        }

                        io.to(roomId).emit('room_state_update', room);
                    } else {
                        const slotIndex = room.slots.indexOf(slot);
                        room.slots[slotIndex] = { id: null, userId: null, type: 'empty', name: '空き枠', icon: null, ready: false, connected: false };
                        io.to(roomId).emit('room_state_update', room);
                    }
                }
            }
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});