/**
 * game.js
 */
class UNOGame {
    constructor() {
        this.deck = [];
        this.players = []; 
        this.turnIndex = 0;
        this.direction = 1;
        this.hands = {}; 
        this.discardPile = [];
        this.discardRotations = [];
        this.drawStack = 0;
        this.currentColor = "";
        this.myId = null; 
        this.selectedIndices = [];
        this.unoDeclared = false;
        this.hasDrawnThisTurn = false;
    }

    get isMyTurn() { return this.currentPlayer && this.currentPlayer.id === this.myId; }
    get currentPlayer() { return this.players[this.turnIndex]; }
    get topCard() { return this.discardPile[this.discardPile.length - 1]; }
    get myHand() { return this.hands[this.myId] || []; }

    setup(slots, myId) {
        this.players = slots.filter(s => s.type === 'host' || s.type === 'player' || s.type === 'bot');
        this.players.forEach(p => {
            p.frozen = false;
            p.burnTurns = 0;
        });
        this.myId = myId;
    }

    start() {
        this.deck = UNORules.createDeck();
        
        if (window.RuleSettings && window.RuleSettings.randomTurnOrder) {
            for (let i = this.players.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.players[i], this.players[j]] = [this.players[j], this.players[i]];
            }
        }
        this.turnIndex = 0; 

        const size = (window.RuleSettings && window.RuleSettings.initialHandSize) ? parseInt(window.RuleSettings.initialHandSize) : 7; 
        const customSize = (window.RuleSettings && window.RuleSettings.customCards && window.RuleSettings.customCards.length > 0) ? (parseInt(window.RuleSettings.initialCustomHandSize) || 2) : 0;
                            
        this.hands = {};
        this.players.forEach(p => {
            if(p && p.id) { this.hands[p.id] = this.deck.splice(0, size); }
        });
        
        if (customSize > 0 && window.RuleSettings && window.RuleSettings.customCards && window.RuleSettings.customCards.length > 0) {
            let abilityDeck = UNORules.shuffle([...window.RuleSettings.customCards].map(id => ({ color: 'black', value: id })));
            this.players.forEach(p => {
                if (p && p.id) {
                    for (let i = 0; i < customSize; i++) {
                        if (abilityDeck.length > 0) {
                            this.hands[p.id].push(abilityDeck.pop());
                        }
                    }
                }
            });
        }
        
        let first;
        while (true) {
            first = this.deck.pop();
            const isNumber = /^[0-9]$/.test(first.value);
            if (isNumber && first.color !== 'black' && !(first.value && String(first.value).startsWith('id_'))) break;
            else { this.deck.unshift(first); this.deck = UNORules.shuffle(this.deck); }
        }
        this.discardPile.push(first);
        this.discardRotations = [0];
        this.currentColor = first.color;
        
        this.direction = 1;
        this.drawStack = 0;
        this.unoDeclared = false;
    }

    replaceAbilityCards(playerId, oldCardValues) {
        const hand = this.hands[playerId];
        if (!hand) return;
        oldCardValues.forEach(val => {
            const idx = hand.findIndex(c => c.value === val);
            if (idx > -1) {
                hand.splice(idx, 1);
                const available = window.RuleSettings.customCards;
                if (available && available.length > 0) {
                    const newVal = available[Math.floor(Math.random() * available.length)];
                    hand.push({ color: 'black', value: newVal });
                }
            }
        });
    }

    nextTurn(skipCount = 1) {
        if (this.currentPlayer) {
            this.currentPlayer.frozen = false;
            if (this.hands[this.currentPlayer.id]) {
                this.hands[this.currentPlayer.id].forEach(c => {
                    if (c.lockedTurns && c.lockedTurns > 0) c.lockedTurns--;
                });
            }
        }

        this.turnIndex = (this.turnIndex + (this.direction * skipCount) + this.players.length * 10) % this.players.length;
        this.hasDrawnThisTurn = false;
        this.selectedIndices = [];

        if (this.currentPlayer && this.currentPlayer.burnTurns > 0) {
            this.drawCard(this.currentPlayer.id);
            if (window.isHost && window.socket) {
                window.socket.emit('request_draw_animation', { playerId: this.currentPlayer.id, count: 1 });
            }
            this.currentPlayer.burnTurns--;
        }
    }

    toggleSelect(index) {
        const card = this.myHand[index];
        if (!card) return;
        const foundPos = this.selectedIndices.indexOf(index);
        if (foundPos > -1) {
            this.selectedIndices.splice(foundPos, 1);
        } else {
            if (this.selectedIndices.length > 0) {
                const first = this.myHand[this.selectedIndices[0]];
                if (card.value === first.value) this.selectedIndices.push(index);
                else this.selectedIndices = [index];
            } else this.selectedIndices.push(index);
        }
    }

    playCards(playerId, indices) {
        const hand = this.hands[playerId];
        const selectedCards = indices.map(i => hand[i]).filter(c => c !== undefined);
        if (selectedCards.length === 0) return { success: false };

        if (UNORules.canPlaySelected(selectedCards, this.topCard, this.currentColor, this.drawStack)) {
            const lastCard = selectedCards[selectedCards.length - 1];
            
            const isAbility = lastCard.value && String(lastCard.value).startsWith('id_');
            const isAction = !/^[0-9]$/.test(lastCard.value) && !isAbility;
            
            const willBeActionFinishPenalty = (hand.length === selectedCards.length && isAction && window.RuleSettings && !window.RuleSettings.allowActionFinish);
            const willBeAbilityFinishPenalty = (hand.length === selectedCards.length && isAbility && window.RuleSettings && !window.RuleSettings.allowAbilityFinish);
            
            if (willBeActionFinishPenalty || willBeAbilityFinishPenalty) {
                const penalty = willBeActionFinishPenalty ? (parseInt(window.RuleSettings.actionFinishPenalty) || 3) : (parseInt(window.RuleSettings.abilityFinishPenalty) || 3);
                for (let i = 0; i < penalty; i++) this.drawCard(playerId);
                return { success: false, penalty: true, penaltyReason: willBeActionFinishPenalty ? '記号' : '能力' };
            }

            if (this.drawStack > 0 && isAbility && window.AbilityDef && window.AbilityDef[lastCard.value].type.includes('BL')) {
                this.drawStack = 0;
            }

            // ★ 能力カードは場(discardPile)に出さずに消費するだけにする
            if (!isAbility) {
                selectedCards.forEach(c => {
                    this.discardPile.push(c);
                    this.discardRotations.push(Math.floor(Math.random() * 21) - 10);
                    if (c.value === '+2') this.drawStack += 2;
                    if (c.value === 'Wild+4') this.drawStack += 4;
                });
            }

            const sortedIndices = [...indices].sort((a, b) => b - a);
            sortedIndices.forEach(i => hand.splice(i, 1));
            
            if (playerId === this.myId) this.selectedIndices = [];

            if (isAbility) {
                return { success: true, lastCard: lastCard, isAbility: true };
            }

            if (lastCard.color !== 'black') this.currentColor = lastCard.color;
            if (lastCard.color === 'black') return { success: true, lastCard: lastCard, needsColor: true };

            const actionCount = selectedCards.length;

            // ★ スキップ・リバースの重ね出しバグ修正
            if (lastCard.value === 'Skip') {
                if (this.players.length === 2) {
                    this.nextTurn(actionCount * 2); 
                } else {
                    this.nextTurn(1 + actionCount);
                }
            }
            else if (lastCard.value === 'Reverse') {
                if (this.players.length === 2) {
                    this.nextTurn(actionCount * 2); 
                } else {
                    if (actionCount % 2 !== 0) this.direction *= -1;
                    this.nextTurn(1);
                }
            }
            else {
                this.nextTurn(1);
            }

            return { success: true, lastCard: lastCard };
        }
        return { success: false };
    }

    drawCard(targetId) {
        if (this.deck.length === 0) {
            if (this.discardPile.length <= 1) {
                if (typeof window !== 'undefined') window.isGameOver = true; 
                if (window.isHost && typeof window.socket !== 'undefined') window.socket.emit('announce_draw');
                return false;
            }
            const top = this.discardPile.pop();
            const topRot = this.discardRotations.pop();

            const newDeck = [];
            const newDiscardPile = [];
            const newDiscardRotations = [];
            
            for(let i = 0; i < this.discardPile.length; i++) {
                const c = this.discardPile[i];
                if (c.value && String(c.value).startsWith('id_')) {
                    newDiscardPile.push(c);
                    newDiscardRotations.push(this.discardRotations[i]);
                } else {
                    newDeck.push(c);
                }
            }
            
            this.deck = UNORules.shuffle(newDeck);
            this.discardPile = newDiscardPile;
            this.discardRotations = newDiscardRotations;
            
            this.discardPile.push(top);
            this.discardRotations.push(topRot);
        }

        if (this.hands[targetId] && this.deck.length > 0) {
            this.hands[targetId].push(this.deck.pop());
            if (targetId === this.myId && this.hands[targetId].length > 1) {
                this.unoDeclared = false;
            }
            return true;
        }
        return false;
    }

    lockRandomCard(attackerId, targetId, type, count = 1, turns = 1) {
        const hand = this.hands[targetId];
        if (!hand) return;
        const candidates = hand.filter(c => {
            if (c.value && String(c.value).startsWith('id_')) return false; 
            if (c.lockedTurns && c.lockedTurns > 0) return false; 
            const isNum = /^[0-9]$/.test(c.value);
            if (type === 'number') return isNum;
            if (type === 'symbol') return !isNum;
            return true;
        });
        
        for (let i = 0; i < count; i++) {
            if (candidates.length > 0) {
                const r = Math.floor(Math.random() * candidates.length);
                const targetCard = candidates.splice(r, 1)[0];
                targetCard.lockedTurns = (attackerId === targetId) ? turns + 1 : turns; 
            }
        }
    }
}