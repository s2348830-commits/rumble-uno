/**
 * renderer.js
 */
const Renderer = {
    updateAll: function(game) {
        this.renderPlayersCircle(game);
        this.renderPlayerHand(game);
        this.renderDiscardPile(game);
        this.updateDeckCount(game.deck.length);
        this.updateActionButtons(game);
        this.updateDirection(game);
    },

    updateDirection: function(game) {
        const arrowSvg = document.getElementById('direction-arrows');
        if(!arrowSvg) return;
        
        let reverseCount = 0;
        if (game.isMyTurn && game.selectedIndices && game.myHand) {
            game.selectedIndices.forEach(idx => {
                if (game.myHand[idx] && game.myHand[idx].value === 'Reverse') reverseCount++;
            });
        }
        if (game.players && game.players.length === 2) reverseCount = 0;

        const currentDir = game.direction;
        
        arrowSvg.setAttribute('class', 'direction-arrows');
        if (reverseCount > 0) {
            const predictedDir = currentDir * Math.pow(-1, reverseCount);
            if (predictedDir === 1) arrowSvg.classList.add('predict-normal');
            else arrowSvg.classList.add('predict-reverse');
        } else {
            if (currentDir === 1) arrowSvg.classList.add('normal');
            else arrowSvg.classList.add('reverse');
        }
    },

    renderPlayersCircle: function(game) {
        const circle = document.getElementById('players-circle');
        if(!circle) return;
        circle.innerHTML = '';
        
        const myIndex = game.players.findIndex(p => p.id === game.myId);
        if (myIndex === -1) return;
        const total = game.players.length;
        
        let skipOffset = -1;
        let pDir = game.direction;
        if (game.isMyTurn && game.selectedIndices.length > 0) {
            const firstCard = game.myHand[game.selectedIndices[0]];
            if (firstCard && firstCard.value === 'Skip') {
                skipOffset = 1 + game.selectedIndices.length;
            } else if (firstCard && firstCard.value === 'Reverse') {
                const revCount = game.selectedIndices.length;
                if (game.players.length > 2 && revCount % 2 !== 0) pDir *= -1;
                skipOffset = (game.players.length === 2) ? 1 + revCount : 1;
            } else {
                skipOffset = 1;
            }
        }
        let predictTargetId = null;
        if (skipOffset !== -1) {
            const nextIdx = (myIndex + (pDir * skipOffset) + total * 10) % total;
            predictTargetId = game.players[nextIdx].id;
        }
        
        for (let i = 0; i < total; i++) {
            const pIndex = (myIndex + i) % total;
            const p = game.players[pIndex];
            
            const angleDeg = 90 + (360 / total) * i;
            const angleRad = angleDeg * Math.PI / 180;
            const radius = 42; 
            const x = 50 + radius * Math.cos(angleRad);
            const y = 50 + radius * Math.sin(angleRad);
            
            const isTurn = (game.currentPlayer && game.currentPlayer.id === p.id);
            const isPredictTurn = (p.id === predictTargetId);
            const handCount = game.hands[p.id] ? game.hands[p.id].length : 0;
            const isOffline = p.connected === false;
            
            let displayName = p.name;
            let personality = p.personality;
            if (!personality && window.currentRoomState && window.currentRoomState.slots) {
                const slot = window.currentRoomState.slots.find(s => s.id === p.id || s.userId === p.id || s.name === p.name);
                if (slot && slot.personality) personality = slot.personality;
            }
            if (p.type === 'bot' && window.RuleSettings && window.RuleSettings.showBotPersonality && personality) displayName += ` [${personality}]`;

            let overlayHtml = '';
            if (p.frozen) overlayHtml += '<div class="status-overlay status-frozen"></div>';
            if (p.burnTurns > 0) overlayHtml += `<div class="status-overlay status-burned"></div>`;

            let numLockTurns = 0;
            let numLockCount = 0;
            let symLockTurns = 0;
            let symLockCount = 0;

            const hand = game.hands[p.id] || [];
            hand.forEach(c => {
                if (c.lockedTurns && c.lockedTurns > 0) {
                    if (c.lockedType === 'number') {
                        numLockCount++;
                        if (c.lockedTurns > numLockTurns) numLockTurns = c.lockedTurns;
                    } else if (c.lockedType === 'symbol') {
                        symLockCount++;
                        if (c.lockedTurns > symLockTurns) symLockTurns = c.lockedTurns;
                    }
                }
            });

            let statusIcons = '';
            if (p.invincibleTurns > 0) statusIcons += `<span style="margin-right:3px;">🔲(${p.invincibleTurns}T)</span>`;
            if (p.shield && p.shield.turns > 0 && p.shield.level > 0) statusIcons += `<span style="margin-right:3px;">🛡️${p.shield.level}(${p.shield.turns}T)</span>`;
            if (p.evasion && p.evasion.turns > 0 && p.evasion.level > 0) statusIcons += `<span style="margin-right:3px;">💨${p.evasion.level}(${p.evasion.turns}T)</span>`;
            if (p.frozen) statusIcons += `<span style="margin-right:3px;">❄️(1T)</span>`;
            if (p.burnTurns > 0) statusIcons += `<span style="margin-right:3px;">🔥(${p.burnTurns}T)</span>`;
            
            if (numLockCount > 0) statusIcons += `<span style="margin-right:3px;">🔒${numLockCount}(${numLockTurns}T)</span>`;
            if (symLockCount > 0) statusIcons += `<span style="margin-right:3px;">🗝️${symLockCount}(${symLockTurns}T)</span>`;
            
            if (p.lacerationTurns > 0) {
            statusIcons += `<span style="margin-right:3px;">💢(${p.lacerationTurns}T)</span>`;
            }
            if (p.resurrectionEveCount === 0 || p.resurrectionMisaCount === 0) {
                statusIcons += `<span style="margin-right:3px;">🌟</span>`;
            }

            if (statusIcons !== '') {
                const helpText = "【ステータス詳細】\\n" +
                                 "❄️凍結: 能力カードのみ使用可能\\n" +
                                 "🔥燃焼: ターン開始時にドローダメージ\\n" +
                                 "🛡️シールド: ドロー攻撃を規定回数防ぐ\\n" +
                                 "💨回避: 一定確率で攻撃を無効化\\n" +
                                 "🔲無敵: 全ての攻撃や状態異常を無効化\\n" +
                                 "🔒🗝️ロック: 対象のカードが使用不可\\n" +
                                 "💢裂傷: 全てのドロー枚数+1\\n" +
                                 "🌟蘇生待機: 次に引く能力カードが手札に戻る(ただし、1ゲームに付き1回の制限)";
                statusIcons += `<span style="cursor:pointer; display:inline-block; margin-left:2px; padding:0 5px; background:rgba(255,255,255,0.2); border:1px solid #fff; border-radius:50%; color:white; font-weight:bold; font-size:10px; line-height:14px;" onclick="alert('${helpText}')">i</span>`;
            }

            const badge = document.createElement('div');
            badge.className = `circle-player-badge other-player-badge ${isTurn ? 'active-turn' : ''} ${isPredictTurn ? 'predict-turn' : ''} ${isOffline ? 'offline' : ''} ${p.id === game.myId ? 'my-badge' : ''}`;
            badge.dataset.id = p.id; 
            if (p.id === game.myId) badge.id = 'my-player-info';
            badge.style.left = `${x}%`; badge.style.top = `${y}%`;
            
            badge.innerHTML = `
                <div style="position:relative; width:100%; height:100%;">
                    <img class="cp-icon" src="${p.icon || 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23ccc\'%3E%3Cpath d=\'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z\'/%3E%3C/svg%3E'}">
                    ${overlayHtml}
                </div>
                <div class="cp-status-icons" style="font-size: 11px;">${statusIcons}</div>
                <div class="cp-info">
                    <span class="cp-name">${displayName} ${isOffline ? '(切断)' : ''}</span>
                    <span class="cp-cards">${handCount}枚</span>
                </div>
            `;
            circle.appendChild(badge);
        }
    },

    applyFanStyle: function(element, index, total) {
        if (total > 15) { 
            element.style.setProperty('--fan-rot', `0deg`); 
            element.style.setProperty('--fan-y', `0px`); 
            return; 
        }
        if (total <= 1) { element.style.setProperty('--fan-rot', `0deg`); element.style.setProperty('--fan-y', `0px`); return; }
        const middle = (total - 1) / 2; const diff = index - middle;
        const maxAngle = 12; const anglePerCard = Math.min(3, maxAngle / (total / 2));
        const rot = diff * anglePerCard; const y = Math.pow(diff, 2) * 1.5; 
        element.style.setProperty('--fan-rot', `${rot}deg`); element.style.setProperty('--fan-y', `${y}px`);
    },

    renderPlayerHand: function(game) {
        const playerEl = document.getElementById('player-hand');
        if(!playerEl) return;
        playerEl.innerHTML = '';
        const myHand = game.myHand;
        const total = myHand.length;
        const selectedValue = game.selectedIndices.length > 0 ? myHand[game.selectedIndices[0]].value : null;

        let canSuggest = false;
        if (selectedValue !== null && window.RuleSettings) {
            const isDrawCard = (selectedValue === '+2' || selectedValue === 'Wild+4');
            const limit = isDrawCard ? parseInt(window.RuleSettings.maxDrawMultiPlay) : parseInt(window.RuleSettings.maxMultiPlay);
            if (limit !== 0) canSuggest = true;
        }

        myHand.forEach((card, i) => {
            const div = this.createCardElement(card);
            this.applyFanStyle(div, i, total);

            if (game.selectedIndices.includes(i)) div.classList.add('selected');
            else if (canSuggest && card.value === selectedValue) div.classList.add('suggested');

            div.onclick = (e) => {
                e.stopPropagation();
                game.toggleSelect(i); this.updateAll(game); 
            };
            playerEl.appendChild(div);
        });

        const infoEl = document.getElementById('ability-info');
        if (infoEl) {
            if (game.selectedIndices.length > 0) {
                const selCard = myHand[game.selectedIndices[0]];
                if (selCard && selCard.value && String(selCard.value).startsWith('id_') && typeof window.AbilityDef !== 'undefined' && window.AbilityDef[selCard.value]) {
                    infoEl.innerText = window.AbilityDef[selCard.value].desc;
                    infoEl.classList.remove('hidden');
                } else { infoEl.classList.add('hidden'); }
            } else { infoEl.classList.add('hidden'); }
        }
    },

    renderDiscardPile: function(game) {
        const discardEl = document.getElementById('discard-pile');
        if(!discardEl) return;
        discardEl.innerHTML = '';
        const maxDisplay = 5; const startIdx = Math.max(0, game.discardPile.length - maxDisplay);
        
        for (let i = startIdx; i < game.discardPile.length; i++) {
            const card = game.discardPile[i];
            const rot = game.discardRotations[i] || 0;
            const div = this.createCardElement(card);
            div.style.setProperty('--fan-rot', `${rot}deg`);
            
            if (i < game.discardPile.length - 1) { div.style.filter = 'brightness(0.7)'; div.style.pointerEvents = 'none'; } 
            else {
                div.style.zIndex = '100'; 
                if (card.color === 'black' && game.currentColor) {
                    div.style.boxShadow = `0 0 20px var(--${game.currentColor}, #fff)`;
                    div.classList.add(game.currentColor + '-glow');
                }
            }
            div.onclick = () => { if (game.selectedIndices.length > 0) window.handlePlayAction(); };
            discardEl.appendChild(div);
        }
    },

    updateDeckCount: function(count) { 
        const el = document.getElementById('deck-count');
        if(el) el.innerText = count; 
    },

    updateActionButtons: function(game) {
        const drawBtn = document.getElementById('draw-btn');
        const drawText = document.getElementById('draw-text'); 
        const unoBtn = document.getElementById('uno-btn');
        const endTurnBtn = document.getElementById('end-turn-btn');
        const btnUnoAuto = document.getElementById('btn-uno-auto'); 

        const discardArea = document.getElementById('discard-area');
        if (discardArea) {
            if (game.selectedIndices && game.selectedIndices.length > 0) {
                discardArea.classList.add('highlight-discard');
            } else {
                discardArea.classList.remove('highlight-discard');
            }
        }

        if(!drawBtn || !unoBtn || !endTurnBtn) return;

        if (drawText) {
            if (game.drawStack > 0) {
                drawText.innerText = `${game.drawStack}枚引く`;
                drawText.style.color = '#ff5252';
            } else {
                drawText.innerText = '引く';
                drawText.style.color = 'inherit';
            }
        }

        if (btnUnoAuto) {
            btnUnoAuto.style.display = (window.RuleSettings && window.RuleSettings.showUnoAutoBtn === false) ? 'none' : 'inline-flex';
        }

        let showUnoBtn = false;
        
        if (!window.isInitialDealing && !game.unoDeclared && game.isMyTurn) {
            const remaining = game.myHand.length - game.selectedIndices.length;
            if (game.myHand.length === 1) {
                showUnoBtn = true;
            } else if (game.selectedIndices.length > 0 && (remaining === 1 || remaining === 0)) {
                const selectedCards = game.selectedIndices.map(i => game.myHand[i]);
                if (UNORules.canPlaySelected(selectedCards, game.topCard, game.currentColor, game.drawStack)) {
                    if (remaining === 0) {
                        const isAbility = selectedCards[0] && selectedCards[0].value && String(selectedCards[0].value).startsWith('id_');
                        const isAction = !/^[0-9]$/.test(selectedCards[selectedCards.length - 1].value) && !isAbility;
                        
                        const willBeActionPenalty = isAction && window.RuleSettings && !window.RuleSettings.allowActionFinish;
                        const willBeAbilityPenalty = isAbility && window.RuleSettings && !window.RuleSettings.allowAbilityFinish;
                        
                        if (!willBeActionPenalty && !willBeAbilityPenalty) showUnoBtn = true;
                    } else {
                        showUnoBtn = true;
                    }
                }
            }
        }

        if (showUnoBtn) {
            if (window.RuleSettings && !window.RuleSettings.unoAuto) { 
                if (unoBtn.classList.contains('hidden')) {
                    unoBtn.classList.remove('hidden'); 
                    if (window.SE) window.SE.play('uno_message');
                }
            }
        } else { 
            unoBtn.classList.add('hidden'); 
        }

        if (game.isMyTurn) {
            drawBtn.classList.toggle('hidden', game.hasDrawnThisTurn && window.RuleSettings && !window.RuleSettings.optionalDraw);
            endTurnBtn.classList.toggle('hidden', !game.hasDrawnThisTurn);
        } else {
            drawBtn.classList.add('hidden'); endTurnBtn.classList.add('hidden');
        }
    },

    createCardElement: function(card) {
        const div = document.createElement('div'); div.className = `card ${card.color}`;
        const imgMap = { 'Wild': 'card/wild.png', 'Wild+4': 'card/+4.png', 'Reverse': 'card/reverse.png', 'Skip': 'card/skip.png' };
        const displayValue = this.getDisplayValue(card.value);

        if (card.lockedTurns && card.lockedTurns > 0) {
            div.classList.add('locked');
            const lockOverlay = document.createElement('div');
            lockOverlay.style.position = 'absolute';
            lockOverlay.style.top = '0'; lockOverlay.style.left = '0';
            lockOverlay.style.width = '100%'; lockOverlay.style.height = '100%';
            lockOverlay.style.background = 'rgba(255, 215, 0, 0.4)';
            lockOverlay.style.boxShadow = 'inset 0 0 10px #ffd700';
            lockOverlay.style.zIndex = '40';
            lockOverlay.style.pointerEvents = 'none';
            div.appendChild(lockOverlay);
        }

        const me = window.game ? window.game.players.find(p => p.id === window.game.myId) : null;
        const isFrozen = me && me.frozen;
        const isAbility = card.value && String(card.value).startsWith('id_');
        
        if (isFrozen && !isAbility) {
            const freezeOverlay = document.createElement('div');
            freezeOverlay.style.position = 'absolute';
            freezeOverlay.style.top = '0'; freezeOverlay.style.left = '0';
            freezeOverlay.style.width = '100%'; freezeOverlay.style.height = '100%';
            freezeOverlay.style.background = 'rgba(0, 191, 255, 0.4)';
            freezeOverlay.style.zIndex = '40';
            freezeOverlay.style.pointerEvents = 'none';
            div.appendChild(freezeOverlay);
        }

        if (isAbility) {
            const ct = document.createElement('div'); ct.className = 'custom-center';
            const img = document.createElement('img');
            img.src = `card/custom/${card.value}.png`;
            img.className = 'custom-card-in-hand-img';
            img.onerror = function() {
                this.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ccc'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'/%3E%3C/svg%3E";
            };
            ct.appendChild(img); div.appendChild(ct);
        } 
        else if (imgMap[card.value]) {
            const ct = document.createElement('div'); ct.className = 'card-center';
            const img = document.createElement('img'); img.src = imgMap[card.value]; img.className = 'card-img'; ct.appendChild(img); div.appendChild(ct);
        } else {
            if (card.color !== 'black') { const oval = document.createElement('div'); oval.className = 'white-oval-bg'; div.appendChild(oval); }
            const tl = document.createElement('div'); tl.className = 'card-corner top-left'; tl.innerText = displayValue; div.appendChild(tl);
            const ct = document.createElement('div'); ct.className = 'card-center card-text'; ct.innerText = displayValue; div.appendChild(ct);
            const br = document.createElement('div'); br.className = 'card-corner bottom-right'; br.innerText = displayValue; div.appendChild(br);
        }
        return div;
    },

    getDisplayValue: function(val) { return val === 'Draw+2' ? '+2' : val; }
};