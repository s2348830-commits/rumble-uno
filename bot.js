/**
 * bot.js
 */
const UNOBot = {
    play: function(game, botId) {
        const botHand = game.hands[botId];
        const botPlayer = game.players.find(p => p.id === botId);
        
        const difficulty = botPlayer ? botPlayer.difficulty : '普通'; 
        let rawPersonality = botPlayer ? botPlayer.personality : '普通';
        
        // ⚖ 統制：状況に応じて性格をランダム化（破天荒、慎重、攻撃的のミックス）
        let personality = rawPersonality;
        if (rawPersonality === '統制') {
            const rand = Math.random();
            if (rand < 0.33) personality = '破天荒';
            else if (rand < 0.66) personality = '慎重';
            else personality = '攻撃的';
        }

        let playableIndices = [];
        for (let i = 0; i < botHand.length; i++) {
            if (UNORules.canPlaySingle(botHand[i], game.topCard, game.currentColor, game.drawStack)) {
                playableIndices.push(i);
            }
        }

        if (playableIndices.length > 0) {
            const isAbilityCard = (card) => card.value && String(card.value).startsWith('id_');
            const isActionCard = (card) => !/^[0-9]$/.test(card.value) && !isAbilityCard(card) && card.color !== 'black';
            const isWildCard = (card) => card.color === 'black'; 
            
            let abilities = playableIndices.filter(i => isAbilityCard(botHand[i]));
            let actions = playableIndices.filter(i => isActionCard(botHand[i]) || isWildCard(botHand[i])); 
            let numbers = playableIndices.filter(i => !isActionCard(botHand[i]) && !isAbilityCard(botHand[i]) && !isWildCard(botHand[i])); 

            let defAbilities = abilities.filter(i => window.AbilityDef && window.AbilityDef[botHand[i].value] && window.AbilityDef[botHand[i].value].type.includes('BL'));
            let atkAbilities = abilities.filter(i => window.AbilityDef && window.AbilityDef[botHand[i].value] && window.AbilityDef[botHand[i].value].type.includes('AT'));
            
            let skipIndices = actions.filter(i => botHand[i].value === 'Skip');
            let revIndices = actions.filter(i => botHand[i].value === 'Reverse');
            let drawAtkIndices = actions.filter(i => botHand[i].value === '+2' || botHand[i].value === 'Wild+4');

            let selectedIndex = -1;

            // 🌪 破天荒のオーバーライド (完全無視でランダム)
            if (personality === '破天荒' && Math.random() < 0.5) {
                selectedIndex = playableIndices[Math.floor(Math.random() * playableIndices.length)];
            } 
            // 🛡 慎重のオーバーライド (ドロー攻撃に対してあえてドローで受けることがある)
            else if (personality === '慎重' && game.drawStack > 0 && Math.random() < 0.6) {
                return { action: 'draw' };
            }

            // 次のプレイヤーの情報を取得（最強用）
            let nextPlayer = null;
            const myIndex = game.players.findIndex(p => p.id === botId);
            if(myIndex !== -1) {
                let ni = (myIndex + game.direction) % game.players.length;
                if(ni < 0) ni += game.players.length;
                nextPlayer = game.players[ni];
            }
            let nextHand = nextPlayer ? game.hands[nextPlayer.id] : [];
            let nextHasAttack = nextHand ? nextHand.some(c => c.value === '+2' || c.value === 'Wild+4' || (window.AbilityDef && window.AbilityDef[c.value] && window.AbilityDef[c.value].type.includes('AT'))) : false;

            // 自分以外のプレイ中の人数を計算
            const activePlayers = game.players.filter(p => p.connected);
            const othersCount = activePlayers.length - 1;

            if (selectedIndex === -1) {
                if (difficulty === '最強') {
                    // 【最強ロジック】
                    
                    // 記号の複数出し設定（数字の重ね出し設定を参照）
                    const multiSetting = window.RuleSettings ? parseInt(window.RuleSettings.maxMultiPlay) : 1;
                    const canMultiSkip = (multiSetting === -1 || multiSetting >= othersCount);
                    
                    // 0. 「ずっと俺のターン」コンボ（スキップ複数出しで全員飛ばす）
                    if (skipIndices.length >= othersCount && othersCount > 0 && canMultiSkip) {
                        selectedIndex = skipIndices[0]; 
                    }
                    // 1. リバースの温存・使用
                    else if (revIndices.length > 0 && nextHasAttack) {
                        selectedIndex = revIndices[0];
                    }
                    // 2. スキップの効率化（残りが自分と相手だけのとき等に連続ターンを狙う）
                    else if (skipIndices.length > 0 && othersCount === 1) {
                        selectedIndex = skipIndices[0];
                    }
                    // 3. 攻撃的カード（相手を優先して妨害）
                    else if (atkAbilities.length > 0) {
                        selectedIndex = atkAbilities[0];
                    }
                    else if (drawAtkIndices.length > 0) {
                        selectedIndex = drawAtkIndices[0];
                    }
                    // 4. 能力カード (防御系は「慎重」なら温存)
                    else if (abilities.length > 0) {
                        if (personality === '慎重') {
                            let nonDef = abilities.filter(i => !defAbilities.includes(i));
                            if (nonDef.length > 0) selectedIndex = nonDef[0];
                        } else {
                            selectedIndex = abilities[0];
                        }
                    }
                    // 数字かアクションで手札を減らす
                    if (selectedIndex === -1) {
                        if (numbers.length > 0) selectedIndex = numbers[Math.floor(Math.random() * numbers.length)];
                        else if (actions.length > 0) selectedIndex = actions[0];
                        else selectedIndex = playableIndices[0];
                    }
                }
                else if (difficulty === '強い') {
                    if (personality === '攻撃的' && atkAbilities.length > 0) selectedIndex = atkAbilities[0];
                    else if (personality === '攻撃的' && drawAtkIndices.length > 0) selectedIndex = drawAtkIndices[0];
                    else if (actions.length > 0) selectedIndex = actions[Math.floor(Math.random() * actions.length)];
                    else if (abilities.length > 0) selectedIndex = abilities[0];
                    else if (numbers.length > 0) selectedIndex = numbers[0];
                    else selectedIndex = playableIndices[0];
                } 
                else if (difficulty === '普通') {
                    if (personality === '攻撃的' && abilities.length > 0) selectedIndex = abilities[0];
                    else if (numbers.length > 0) selectedIndex = numbers[Math.floor(Math.random() * numbers.length)];
                    else if (actions.length > 0) selectedIndex = actions[Math.floor(Math.random() * actions.length)];
                    else if (abilities.length > 0) selectedIndex = abilities[0];
                    else selectedIndex = playableIndices[0];
                } 
                else { // 優しい
                    if (game.drawStack > 0 && personality !== '攻撃的') return { action: 'draw' };
                    if (numbers.length > 0) selectedIndex = numbers[Math.floor(Math.random() * numbers.length)];
                    else if (abilities.length > 0 && personality === '攻撃的') selectedIndex = abilities[0];
                    else return { action: 'draw' };
                }
            }

            const cardToPlay = botHand[selectedIndex];
            const isDraw = (cardToPlay.value === '+2' || cardToPlay.value === 'Wild+4');
            const isNumber = !isActionCard(cardToPlay) && !isAbilityCard(cardToPlay) && !isWildCard(cardToPlay);
            
            // ★数字カードだけでなく、記号カード(スキップやリバース等)も複数出し設定を適用する
            const isNumberOrAction = isNumber || (isActionCard(cardToPlay) && !isDraw);

            let limit = isDraw ? (window.RuleSettings ? parseInt(window.RuleSettings.maxDrawMultiPlay) : 1) : 
                        (isNumberOrAction ? (window.RuleSettings ? parseInt(window.RuleSettings.maxMultiPlay) : 1) : 1);
            if (isNaN(limit) || limit === 0) limit = 1;

            // ドロー攻撃の重ね出し温存ロジック
            if (isDraw) {
                if (difficulty === '最強') {
                    if (nextHasAttack) limit = 1; 
                } else if (difficulty === '強い' && personality !== '攻撃的') {
                    limit = 1;
                } else if (personality === '慎重') {
                    limit = 1;
                }
            }

            // 破天荒の重ね出しランダム制限
            if (isNumberOrAction && personality === '破天荒' && Math.random() < 0.3) {
                limit = 1;
            }

            // 最強Botの「全員スキップ」発動時の枚数調整
            if (difficulty === '最強' && cardToPlay.value === 'Skip') {
                const activePlayers = game.players.filter(p => p.connected);
                const othersCount = activePlayers.length - 1;
                
                // スキップで全員飛ばす場合、無駄遣いせず「ぴったり自分以外の人数分」だけ出す
                if (botHand.filter(c => c.value === 'Skip').length >= othersCount && othersCount > 0) {
                    if (limit === -1 || limit >= othersCount) {
                        limit = othersCount; 
                    }
                }
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
            return { action: 'draw' };
        }
    },

    // 🎨 ワイルドカード等の色指定AI
    chooseColor: function(game, botId) {
        const botHand = game.hands[botId];
        const botPlayer = game.players.find(p => p.id === botId);
        const difficulty = botPlayer ? botPlayer.difficulty : '普通';
        const colors = ['red', 'blue', 'green', 'yellow'];

        // 自分の手札の色の枚数を数える
        const myColors = { red: 0, blue: 0, green: 0, yellow: 0 };
        botHand.forEach(c => {
            if (colors.includes(c.color)) myColors[c.color]++;
        });

        let maxCount = -1;
        for (let col in myColors) {
            if (myColors[col] > maxCount) maxCount = myColors[col];
        }

        if (difficulty === '最強') {
            // 上がりそうなプレイヤー（手札が2枚以下）を探す
            let dangerPlayers = game.players.filter(p => p.id !== botId && game.hands[p.id] && game.hands[p.id].length <= 2);
            
            if (dangerPlayers.length > 0) {
                // 手札が少ない順にソートして一番危険なプレイヤーを特定
                dangerPlayers.sort((a, b) => game.hands[a.id].length - game.hands[b.id].length);
                let dangerHand = game.hands[dangerPlayers[0].id];
                
                let dangerColors = new Set();
                dangerHand.forEach(c => { if (colors.includes(c.color)) dangerColors.add(c.color); });
                
                let commonColors = Object.keys(myColors).filter(col => myColors[col] > 0 && dangerColors.has(col));
                
                if (commonColors.length > 0) {
                    // 危険プレイヤーと同じ色を持っている場合、あえて違う色（自分の出せる色）を指定して妨害
                    let safeColors = Object.keys(myColors).filter(col => myColors[col] > 0 && !dangerColors.has(col));
                    if (safeColors.length > 0) {
                        return safeColors[Math.floor(Math.random() * safeColors.length)];
                    } else {
                        // 自分の出せる色がすべて危険プレイヤーの色と被っている場合、出せない色を指定して無理やり止める
                        let blockColors = colors.filter(col => !dangerColors.has(col));
                        if (blockColors.length > 0) return blockColors[Math.floor(Math.random() * blockColors.length)];
                    }
                }
            }
        }
        
        // それ以外の場合は自分の手札で一番多い色を優先して指定する
        let candidateColors = [];
        for (let col in myColors) {
            if (myColors[col] === maxCount) candidateColors.push(col);
        }
        if (candidateColors.length > 0) {
            return candidateColors[Math.floor(Math.random() * candidateColors.length)];
        }

        return colors[Math.floor(Math.random() * 4)];
    }
};