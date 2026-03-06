/**
 * rule.js
 */
const UNORules = {
    createDeck: function() {
        const colors = ['red', 'blue', 'green', 'yellow'];
        const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        const actions = ['Skip', 'Reverse', '+2'];
        let deck = [];
        colors.forEach(color => {
            deck.push({ color, value: '0' });
            [...numbers.slice(1), ...actions].forEach(value => {
                deck.push({ color, value }); deck.push({ color, value });
            });
        });
        for (let i = 0; i < 4; i++) {
            deck.push({ color: 'black', value: 'Wild' });
            deck.push({ color: 'black', value: 'Wild+4' });
        }
        return this.shuffle(deck);
    },

    shuffle: function(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },

    canPlaySingle: function(card, topCard, currentColor, drawStack, settings, abilityDef) {
        if (card.lockedTurns && card.lockedTurns > 0) return false;
        
        if (drawStack > 0) {
            if (card.value && String(card.value).startsWith('id_') && abilityDef && abilityDef[card.value] && abilityDef[card.value].type.includes('BL')) {
                return true;
            }
            if (settings && settings.allowDrawResponse) {
                if (topCard.value === '+2') return (card.value === '+2' || card.value === 'Wild+4');
                if (topCard.value === 'Wild+4') return (card.value === 'Wild+4');
                return false;
            } else {
                return false;
            }
        }
        
        if (card.value && String(card.value).startsWith('id_')) return true;
        if (topCard && topCard.value && String(topCard.value).startsWith('id_')) return true;

        if (card.color === 'black') return true;
        const targetColor = topCard.color === 'black' ? currentColor : topCard.color;
        return card.color === targetColor || card.value === topCard.value;
    },

    canPlaySelected: function(selectedCards, topCard, currentColor, drawStack, settings, abilityDef) {
        if (selectedCards.length === 0) return false;
        if (selectedCards.some(c => c.lockedTurns && c.lockedTurns > 0)) return false;

        const firstValue = selectedCards[0].value;
        if (!selectedCards.every(card => card.value === firstValue)) return false;

        const isDrawCard = (firstValue === '+2' || firstValue === 'Wild+4');
        const limit = isDrawCard ? (settings ? parseInt(settings.maxDrawMultiPlay) : 0) : (settings ? parseInt(settings.maxMultiPlay) : 0);
        
        if (limit === 0 && selectedCards.length > 1) return false;
        if (limit > 0 && selectedCards.length > limit) return false;

        return this.canPlaySingle(selectedCards[0], topCard, currentColor, drawStack, settings, abilityDef);
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UNORules };
} else {
    window.UNORules = UNORules;
}