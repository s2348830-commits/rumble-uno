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
        this.abilityGraveyard = []; 
        this.customDeck = []; 
    }

    get isMyTurn() { return this.currentPlayer && this.currentPlayer.id === this.myId; }
    get currentPlayer() { return this.players[this.turnIndex]; }
    get topCard() { return this.discardPile[this.discardPile.length - 1]; }
    get myHand() { return this.hands[this.myId] || []; }

    setup(slots, ruleSettings) {
        this.players = slots.filter(s => s.type === 'host' || s.type === 'player' || s.type === 'bot');
        this.players.forEach(p => {
            p.frozen = false; p.burnTurns = 0; p.invincibleTurns = 0; 
            p.shield = { level: 0, turns: 0 }; p.evasion = { level: 0, turns: 0 }; p.usedRaia = false; 
            if (p.type === 'bot') {
                const personalities = ['aggressive', 'defensive', 'balanced', 'chaotic'];
                p.personality = personalities[Math.floor(Math.random() * personalities.length)];
            }
        });
        this.turnIndex = 0; this.direction = 1; this.hands = {};
        this.players.forEach(p => this.hands[p.id] = []);
        this.discardPile = []; this.discardRotations = []; this.drawStack = 0;
        this.unoDeclared = false; this.hasDrawnThisTurn = false;
        this.ruleSettings = ruleSettings || {}; this.abilityGraveyard = []; 
        
        let pool = [];
        const colors = ['red', 'blue', 'green', 'yellow'];
        const values = ['0','1','2','3','4','5','6','7','8','9','Skip','Reverse','+2'];
        colors.forEach(c => {
            values.forEach(v => { pool.push({ color: c, value: v }); if (v !== '0') pool.push({ color: c, value: v }); });
        });
        for(let i=0; i<4; i++) { pool.push({ color: 'black', value: 'Wild' }); pool.push({ color: 'black', value: 'Wild+4' }); }
        this.deck = UNOGame.shuffle(pool);

        this.customDeck = [];
        if (this.ruleSettings.customCards && this.ruleSettings.customCards.length > 0) {
            let customPool = [];
            this.ruleSettings.customCards.forEach(cId => {
                const def = window.AbilityDef[cId];
                let copies = 1;
                if(def) { if(def.rarity==='UR') copies=1; else if(def.rarity==='SR') copies=2; else if(def.rarity==='SSR') copies=2; else copies=3; }
                for(let i=0; i<copies; i++) customPool.push({ color: 'black', value: cId });
            });
            this.customDeck = UNOGame.shuffle(customPool);
        }
    }

    static shuffle(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex); currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    start() {
        const initialHandSize = parseInt(this.ruleSettings.initialHandSize) || 7;
        const initialCustomSize = parseInt(this.ruleSettings.initialCustomHandSize) || 0;
        
        this.players.forEach(p => {
            for(let i=0; i<initialHandSize; i++) this.hands[p.id].push(this.deck.pop());
            for(let i=0; i<initialCustomSize; i++) { if(this.customDeck.length > 0) this.hands[p.id].push(this.customDeck.pop()); }
        });

        let firstCard;
        do {
            firstCard = this.deck.pop();
            this.discardPile.push(firstCard);
            this.discardRotations.push(Math.floor(Math.random() * 21) - 10);
        } while (firstCard.color === 'black' || !/^[0-9]$/.test(firstCard.value));
        this.currentColor = firstCard.color;
    }

    replaceAbilityCards(playerId, cardValuesToReplace) {
        if (!this.hands[playerId]) return;
        let hand = this.hands[playerId]; let replacedCount = 0;
        cardValuesToReplace.forEach(val => {
            const idx = hand.findIndex(c => c.value === val);
            if (idx > -1) { const removed = hand.splice(idx, 1)[0]; this.customDeck.push(removed); replacedCount++; }
        });
        this.customDeck = UNOGame.shuffle(this.customDeck);
        for (let i = 0; i < replacedCount; i++) { if (this.customDeck.length > 0) { hand.push(this.customDeck.pop()); } }
    }

    drawCard(targetId) {
        try {
            // ★修正: 無限ループ防止機構
            if (this.deck.length === 0) {
                const recyclable = this.discardPile.filter(c => !(c.value && String(c.value).startsWith('id_')));
                if (recyclable.length <= 1) return false; // 戻せるカードが無いなら引けない扱いでスルー

                const top = this.discardPile.pop(); const topRot = this.discardRotations.pop();
                const newDeck = this.discardPile.filter(c => !(c.value && String(c.value).startsWith('id_')));
                const newDiscardPile = this.discardPile.filter(c => (c.value && String(c.value).startsWith('id_')));
                const newDiscardRotations = this.discardRotations.slice(this.discardPile.length - newDiscardPile.length);

                this.deck = UNOGame.shuffle(newDeck);
                this.discardPile = newDiscardPile; this.discardRotations = newDiscardRotations;
                this.discardPile.push(top); this.discardRotations.push(topRot);
            }

            if (this.deck.length > 0 && this.hands[targetId]) {
                this.hands[targetId].push(this.deck.pop());
                if (targetId === this.myId && this.hands[targetId].length > 1) { this.unoDeclared = false; }
                return true;
            }
            return false;
        } catch (e) {
            console.error("Game DrawCard Error:", e);
            return false;
        }
    }

    lockRandomCard(attackerId, targetId, type, count = 1, turns = 1) {
        try {
            const hand = this.hands[targetId]; if (!hand) return;
            const candidates = hand.filter(c => {
                if (!c) return false;
                if (c.value && String(c.value).startsWith('id_')) return false; 
                if (c.lockedTurns && c.lockedTurns > 0) return false; 
                const isNum = /^[0-9]$/.test(c.value);
                if (type === 'number') return isNum; if (type === 'symbol') return !isNum;
                return true;
            });
            for (let i = 0; i < count; i++) {
                if (candidates.length > 0) {
                    const r = Math.floor(Math.random() * candidates.length);
                    const targetCard = candidates.splice(r, 1)[0];
                    targetCard.lockedTurns = (attackerId === targetId) ? turns + 1 : turns; 
                }
            }
        } catch(e) { console.error(e); }
    }

    playCards(playerId, indices) {
        try {
            const hand = this.hands[playerId];
            if (!hand || indices.length === 0) return { success: false };
            
            const cards = indices.map(i => hand[i]);
            const isAbility = cards[0] && cards[0].value && String(cards[0].value).startsWith('id_');
            const def = isAbility && window.AbilityDef ? window.AbilityDef[cards[0].value] : null;

            // ★修正: 正確な残り枚数で上がり禁止ペナルティを判定
            let remainingCards = hand.length - indices.length;
            if (isAbility && def && (def.needsDiscard || def.needsAbilityDiscard)) remainingCards -= 1;

            if (remainingCards <= 0) {
                if (isAbility && this.ruleSettings && !this.ruleSettings.allowAbilityFinish) { return { success: false, penalty: true, penaltyReason: '能力' }; }
                if (!isAbility && !/^[0-9]$/.test(cards[cards.length - 1].value) && this.ruleSettings && !this.ruleSettings.allowActionFinish) { return { success: false, penalty: true, penaltyReason: '記号' }; }
            }

            if (isAbility) return { success: true, isAbility: true };
            if (!UNORules.canPlaySelected(cards, this.topCard, this.currentColor, this.drawStack)) return { success: false };

            indices.sort((a,b)=>b-a).forEach(idx => {
                const c = hand.splice(idx, 1)[0];
                this.discardPile.push(c);
                this.discardRotations.push(Math.floor(Math.random() * 21) - 10);
            });

            const lastCard = cards[cards.length - 1];
            this.currentColor = lastCard.color;
            let needsColor = false;

            if (lastCard.value === 'Skip') this.nextTurn(1 + cards.length);
            else if (lastCard.value === 'Reverse') {
                if (cards.length % 2 !== 0) this.direction *= -1;
                if (this.players.length === 2 && cards.length % 2 !== 0) this.nextTurn(2); else this.nextTurn(1);
            }
            else if (lastCard.value === '+2') { this.drawStack += 2 * cards.length; this.nextTurn(1); }
            else if (lastCard.value === 'Wild') { needsColor = true; }
            else if (lastCard.value === 'Wild+4') { this.drawStack += 4 * cards.length; needsColor = true; }
            else { this.nextTurn(1); }

            return { success: true, needsColor, lastCard };
        } catch(e) {
            console.error("Game Play Error:", e);
            return { success: false };
        }
    }

    nextTurn(steps = 1) {
        for (let i = 0; i < steps; i++) { do { this.turnIndex = (this.turnIndex + this.direction + this.players.length) % this.players.length; } while (!this.players[this.turnIndex].connected); }
        this.hasDrawnThisTurn = false;
        const currentP = this.players[this.turnIndex];
        if (currentP.burnTurns > 0) { this.drawCard(currentP.id); currentP.burnTurns--; }
        if (currentP.shield && currentP.shield.turns > 0) { currentP.shield.turns--; if (currentP.shield.turns <= 0) currentP.shield.level = 0; }
        if (currentP.evasion && currentP.evasion.turns > 0) { currentP.evasion.turns--; if (currentP.evasion.turns <= 0) currentP.evasion.level = 0; }
        currentP.usedRaia = false; 

        if (currentP.frozen) {
            let hasAbility = false;
            if (this.hands[currentP.id]) { hasAbility = this.hands[currentP.id].some(c => c && c.value && String(c.value).startsWith('id_')); }
            if (!hasAbility) { currentP.frozen = false; setTimeout(() => this.nextTurn(1), 1000); }
        }
        if (this.hands[currentP.id]) { this.hands[currentP.id].forEach(c => { if (c && c.lockedTurns > 0) c.lockedTurns--; }); }
    }
}