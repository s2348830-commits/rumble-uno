/**
 * bot.js (Node.js Server Module)
 */
const UNORules = require('./rule.js');

const UNOBot = {
    play: function(game, botId) {
        const botHand = game.hands[botId];
        const botPlayer = game.players.find(p => p.id === botId);
        
        const difficulty = botPlayer ? botPlayer.difficulty : '普通'; 
        
        let playableIndices = [];
        for (let i = 0; i < botHand.length; i++) {
            if (UNORules.canPlaySingle(botHand[i], game.topCard, game.currentColor, game.drawStack)) {
                playableIndices.push(i);
            }
        }

        if (playableIndices.length > 0) {
            let selectedIndex = playableIndices[0];
            
            const isAbilityCard = (card) => card.value && String(card.value).startsWith('id_');
            const isActionCard = (card) => !/^[0-9]$/.test(card.value) && !isAbilityCard(card);
            
            let abilities = playableIndices.filter(i => isAbilityCard(botHand[i]));
            let actions = playableIndices.filter(i => isActionCard(botHand[i])); 
            let numbers = playableIndices.filter(i => !isActionCard(botHand[i]) && !isAbilityCard(botHand[i])); 

            if (abilities.length > 0) {
                selectedIndex = abilities[Math.floor(Math.random() * abilities.length)];
            } else if (difficulty === '強い') {
                if (actions.length > 0) {
                    selectedIndex = actions[Math.floor(Math.random() * actions.length)];
                } else if (numbers.length > 0) {
                    selectedIndex = numbers[Math.floor(Math.random() * numbers.length)];
                }
            }

            const cardToPlay = botHand[selectedIndex];
            const isDraw = (cardToPlay.value === '+2' || cardToPlay.value === 'Wild+4');
            const isNumber = !isActionCard(cardToPlay) && !isAbilityCard(cardToPlay);
            
            // window.RuleSettings を game.ruleSettings に変更
            let limit = isDraw ? (game.ruleSettings ? parseInt(game.ruleSettings.maxDrawMultiPlay) : 1) : (isNumber ? (game.ruleSettings ? parseInt(game.ruleSettings.maxMultiPlay) : 1) : 1);
            if (isNaN(limit) || limit === 0) limit = 1;

            if (difficulty === '強い' && isDraw && limit > 1) {
                limit = 1;
            }

            let sameCardsIndices = [selectedIndex];
            
            for (let i = 0; i < botHand.length; i++) {
                if (i !== selectedIndex && botHand[i].value === cardToPlay.value) {
                    sameCardsIndices.push(i);
                }
            }

            if (limit !== -1) sameCardsIndices = sameCardsIndices.slice(0, limit);

            return { action: 'play', indices: sameCardsIndices };
        } else {
            return { action: 'draw', count: 1 };
        }
    }
};

module.exports = UNOBot;