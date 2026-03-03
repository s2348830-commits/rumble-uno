/**
 * animation.js
 */
const CardAnimation = {
    // 終点(endX, endY)はコンテナの中央座標を渡す
    moveCard: function(cardElement, startRect, endX, endY, rotate = 0, callback) {
        const clone = cardElement.cloneNode(true);
        clone.style.position = 'fixed';
        clone.style.top = `${startRect.top}px`;
        clone.style.left = `${startRect.left}px`;
        clone.style.margin = '0';
        clone.style.zIndex = '9999';
        clone.style.transition = 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        document.body.appendChild(clone);

        requestAnimationFrame(() => {
            // 要素サイズを取得して、中心が(endX, endY)に合うよう調整
            const w = clone.offsetWidth;
            const h = clone.offsetHeight;
            const targetLeft = endX - (w / 2);
            const targetTop = endY - (h / 2);
            
            const deltaX = targetLeft - startRect.left;
            const deltaY = targetTop - startRect.top;

            clone.style.transform = `translate(${deltaX}px, ${deltaY}px) rotate(${rotate}deg)`;
        });

        setTimeout(() => {
            if (document.body.contains(clone)) {
                document.body.removeChild(clone);
            }
            if (callback) callback();
        }, 400);
    },

    animateMultiDraw: function(count, targetContainerId, onComplete) {
        if (count <= 0) return onComplete();

        this.animateDraw(targetContainerId, () => {
            setTimeout(() => {
                this.animateMultiDraw(count - 1, targetContainerId, onComplete);
            }, 100); 
        });
    },

    animateDraw: function(targetContainerId, callback) {
        const deckEl = document.getElementById('deck-visual');
        const targetEl = document.getElementById(targetContainerId);
        if (!deckEl || !targetEl) return callback();

        const startRect = deckEl.getBoundingClientRect();
        const endRect = targetEl.getBoundingClientRect();
        
        // ターゲットコンテナの中央座標
        const endX = endRect.left + (endRect.width / 2);
        const endY = endRect.top + (endRect.height / 2);

        const dummyCard = document.createElement('div');
        dummyCard.className = 'card back';
        this.moveCard(dummyCard, startRect, endX, endY, 0, callback);
    },

    animatePlay: function(cardElement, rotation, callback) {
        const discardEl = document.getElementById('discard-pile');
        if (!discardEl) return callback();

        const startRect = cardElement.getBoundingClientRect();
        const endRect = discardEl.getBoundingClientRect();
        
        // 場の中心から±5pxでランダムにずらす
        const offsetX = Math.floor(Math.random() * 11) - 5;
        const offsetY = Math.floor(Math.random() * 11) - 5;
        
        const endX = endRect.left + (endRect.width / 2) + offsetX;
        const endY = endRect.top + (endRect.height / 2) + offsetY;

        this.moveCard(cardElement, startRect, endX, endY, rotation, callback);
    }
};