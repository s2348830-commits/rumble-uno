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
        this.abilityGraveyard = []; 
        this.customDeck = []; 
        this.settings = {}; // サーバーから注入される設定を保持
    }

    get currentPlayer() { return this.players[this.turnIndex]; }
    get topCard() { return this.discardPile[this.discardPile.length - 1]; }

    setup(slots, settings) {
        this.players = slots.filter(s => s.type === 'host' || s.type === 'player' || s.type === 'bot');
        this.players.forEach(p => {
            p.frozen = false; p.burnTurns = 0; p.invincibleTurns = 0; 
            p.shield = { level: 0, turns: 0 }; p.evasion = { level: 0, turns: 0 }; 
            p.frozenBurnImmune = false; p.usedRaia = false; p.raiaReturnPending = false;
        });
        this.settings = settings || {};
    }

    start() {
        let UNORulesObj;
        if (typeof require !== 'undefined') { UNORulesObj = require('./rule.js').UNORules; }
        else { UNORulesObj = window.UNORules; }

        this.deck = UNORulesObj.createDeck();
        this.abilityGraveyard = [];
        this.customDeck = [];
        
        if (this.settings && this.settings.randomTurnOrder) {
            for (let i = this.players.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.players[i], this.players[j]] = [this.players[j], this.players[i]];
            }
        }
        this.turnIndex = 0; 

        const size = this.settings.initialHandSize ? parseInt(this.settings.initialHandSize) : 7; 
        const customSize = (this.settings.customCards && this.settings.customCards.length > 0) ? (parseInt(this.settings.initialCustomHandSize) || 2) : 0;
                            
        this.hands = {};
        this.players.forEach(p => {
            if(p && p.id) { this.hands[p.id] = this.deck.splice(0, size); }
        });
        
        if (customSize > 0 && this.settings.customCards && this.settings.customCards.length > 0) {
            this.customDeck = UNORulesObj.shuffle([...this.settings.customCards].map(id => ({ color: 'black', value: id })));
            this.players.forEach(p => {
                if (p && p.id) {
                    for (let i = 0; i < customSize; i++) {
                        if (this.customDeck.length > 0) {
                            this.hands[p.id].push(this.customDeck.pop());
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
            else { this.deck.unshift(first); this.deck = UNORulesObj.shuffle(this.deck); }
        }
        this.discardPile.push(first);
        this.discardRotations = [0];
        this.currentColor = first.color;
        
        this.direction = 1;
        this.drawStack = 0;
    }

    replaceAbilityCards(playerId, oldCardValues) {
        let UNORulesObj = (typeof require !== 'undefined') ? require('./rule.js').UNORules : window.UNORules;
        const hand = this.hands[playerId];
        if (!hand) return;
        
        oldCardValues.forEach(val => {
            const idx = hand.findIndex(c => c.value === val);
            if (idx > -1) {
                hand.splice(idx, 1);
                this.customDeck.push({ color: 'black', value: val });
            }
        });
        
        this.customDeck = UNORulesObj.shuffle(this.customDeck);

        oldCardValues.forEach(() => {
            if (this.customDeck.length > 0) {
                hand.push(this.customDeck.pop());
            }
        });
    }

    nextTurn(skipCount = 1) {
        if (this.currentPlayer) {
            this.currentPlayer.frozen = false;
            this.currentPlayer.frozenBurnImmune = false;
            
            if (this.currentPlayer.invincibleTurns > 0) this.currentPlayer.invincibleTurns--;
            if (this.currentPlayer.shield && this.currentPlayer.shield.turns > 0) {
                this.currentPlayer.shield.turns--;
                if (this.currentPlayer.shield.turns <= 0) this.currentPlayer.shield.level = 0;
            }
            if (this.currentPlayer.evasion && this.currentPlayer.evasion.turns > 0) {
                this.currentPlayer.evasion.turns--;
                if (this.currentPlayer.evasion.turns <= 0) this.currentPlayer.evasion.level = 0;
            }

            if (this.hands[this.currentPlayer.id]) {
                this.hands[this.currentPlayer.id].forEach(c => {
                    if (c.lockedTurns && c.lockedTurns > 0) c.lockedTurns--;
                });
            }
        }

        this.turnIndex = (this.turnIndex + (this.direction * skipCount) + this.players.length * 10) % this.players.length;
        this.hasDrawnThisTurn = false;

        if (this.currentPlayer) {
            this.currentPlayer.usedRaia = false;
            if (this.currentPlayer.raiaReturnPending) {
                const gIdx = this.abilityGraveyard.indexOf('id_33');
                if (gIdx > -1) {
                    this.abilityGraveyard.splice(gIdx, 1);
                    if (this.hands[this.currentPlayer.id]) {
                        this.hands[this.currentPlayer.id].push({ color: 'black', value: 'id_33' });
                    }
                }
                this.currentPlayer.raiaReturnPending = false;
            }
        }

        if (this.currentPlayer && this.currentPlayer.burnTurns > 0) {
            if (this.currentPlayer.invincibleTurns <= 0 && !this.currentPlayer.frozenBurnImmune) {
                this.drawCard(this.currentPlayer.id);
            }
            this.currentPlayer.burnTurns--;
        }
    }

    playCards(playerId, indices, settings) {
        let UNORulesObj = (typeof require !== 'undefined') ? require('./rule.js').UNORules : window.UNORules;
        let AbilityDefObj = (typeof require !== 'undefined') ? require('./ability.js').AbilityDef : window.AbilityDef;

        const hand = this.hands[playerId];
        const selectedCards = indices.map(i => hand[i]).filter(c => c !== undefined);
        if (selectedCards.length === 0) return { success: false };

        if (UNORulesObj.canPlaySelected(selectedCards, this.topCard, this.currentColor, this.drawStack, settings, AbilityDefObj)) {
            const lastCard = selectedCards[selectedCards.length - 1];
            
            const isAbility = lastCard.value && String(lastCard.value).startsWith('id_');
            const isAction = !/^[0-9]$/.test(lastCard.value) && !isAbility;
            
            const willBeActionFinishPenalty = (hand.length === selectedCards.length && isAction && settings && !settings.allowActionFinish);
            const willBeAbilityFinishPenalty = (hand.length === selectedCards.length && isAbility && settings && !settings.allowAbilityFinish);
            
            if (willBeActionFinishPenalty || willBeAbilityFinishPenalty) {
                const penalty = willBeActionFinishPenalty ? (parseInt(settings.actionFinishPenalty) || 3) : (parseInt(settings.abilityFinishPenalty) || 3);
                for (let i = 0; i < penalty; i++) this.drawCard(playerId);
                this.nextTurn(1);
                return { success: false, penalty: true, penaltyReason: willBeActionFinishPenalty ? '記号' : '能力' };
            }

            if (this.drawStack > 0 && isAbility && AbilityDefObj && AbilityDefObj[lastCard.value].type.includes('BL')) {
                this.drawStack = 0;
            }

            selectedCards.forEach(c => {
                const isAb = c.value && String(c.value).startsWith('id_');
                if (!isAb) {
                    this.discardPile.push(c);
                    this.discardRotations.push(Math.floor(Math.random() * 21) - 10);
                } else {
                    this.abilityGraveyard.push(c.value);
                }
                
                if (c.value === '+2') this.drawStack += 2;
                if (c.value === 'Wild+4') this.drawStack += 4;
            });

            const sortedIndices = [...indices].sort((a, b) => b - a);
            sortedIndices.forEach(i => hand.splice(i, 1));

            if (isAbility) {
                return { success: true, lastCard: lastCard, isAbility: true };
            }

            if (lastCard.color !== 'black') this.currentColor = lastCard.color;
            if (lastCard.color === 'black') return { success: true, lastCard: lastCard, needsColor: true };

            const actionCount = selectedCards.length;

            if (lastCard.value === 'Skip') {
                if (this.players.length === 2) this.nextTurn(actionCount * 2); 
                else this.nextTurn(1 + actionCount);
            }
            else if (lastCard.value === 'Reverse') {
                if (this.players.length === 2) this.nextTurn(actionCount * 2); 
                else {
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

    drawCard(targetId, ignoreShield = false) {
        let UNORulesObj = (typeof require !== 'undefined') ? require('./rule.js').UNORules : window.UNORules;

        const t = this.players.find(p => p.id === targetId);
        if (t && t.invincibleTurns > 0) return false;
        
        if (!ignoreShield && t && t.shield && t.shield.turns > 0 && t.shield.level > 0) {
            t.shield.level--;
            if (t.shield.level <= 0) t.shield.turns = 0;
            return true; 
        }

        if (this.deck.length === 0) {
            if (this.discardPile.length <= 1) { return false; }
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
            
            this.deck = UNORulesObj.shuffle(newDeck);
            this.discardPile = newDiscardPile;
            this.discardRotations = newDiscardRotations;
            
            this.discardPile.push(top);
            this.discardRotations.push(topRot);
        }

        if (this.hands[targetId] && this.deck.length > 0) {
            this.hands[targetId].push(this.deck.pop());
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
                targetCard.lockedType = type; 
            }
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UNOGame };
} else {
    window.UNOGame = UNOGame;
}