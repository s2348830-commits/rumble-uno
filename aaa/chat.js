/**
 * chat.js
 */
window.ChatManager = {
    enabled: true,
    init: function() {
        this.container = document.createElement('div');
        this.container.id = 'niconico-container';
        document.body.appendChild(this.container);

        this.logContainer = document.getElementById('chat-log-container');

        const toggleBtns = document.querySelectorAll('.chat-toggle-btn');
        toggleBtns.forEach(btn => {
            btn.onclick = () => {
                this.enabled = !this.enabled;
                toggleBtns.forEach(b => {
                    b.innerText = this.enabled ? 'Chat: ON' : 'Chat: OFF';
                    if (this.enabled) b.classList.add('is-on'); else b.classList.remove('is-on');
                });

                if (this.enabled) {
                    this.container.style.display = 'block';
                    if (this.logContainer) this.logContainer.classList.remove('hidden');
                    const inputArea = document.getElementById('chat-input-area');
                    if (inputArea) inputArea.classList.remove('hidden');
                } else {
                    this.container.style.display = 'none';
                    if (this.logContainer) this.logContainer.classList.add('hidden');
                    const inputArea = document.getElementById('chat-input-area');
                    if (inputArea) inputArea.classList.add('hidden');
                }
                if (window.SE) window.SE.play('buttonclick');
            };
        });

        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('btn-chat-send');

        const sendMsg = () => {
            if (!input) return;
            const msg = input.value.trim();
            if (msg && window.socket && window.currentRoomState) {
                window.socket.emit('send_chat', { roomId: window.currentRoomState.id, message: msg, senderName: window.myData ? window.myData.name : 'Unknown' });
                input.value = '';
            }
        };

        if (sendBtn) sendBtn.onclick = sendMsg;
        if (input) input.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMsg(); });
    },

    showMsg: function(msg, senderName) {
        if (!this.enabled) return;

        if (this.container) {
            const el = document.createElement('div');
            el.className = 'niconico-msg';
            el.innerText = msg; 

            const top = 10 + Math.random() * 60; 
            el.style.top = `${top}vh`;
            el.style.left = '100vw';
            
            this.container.appendChild(el);

            const duration = 5000 + Math.random() * 3000; 
            const animation = el.animate([
                { transform: 'translateX(0)' },
                { transform: `translateX(calc(-100vw - ${el.offsetWidth}px))` }
            ], {
                duration: duration,
                easing: 'linear'
            });

            animation.onfinish = () => {
                el.remove();
            };
        }

        if (this.logContainer) {
            const logItem = document.createElement('div');
            logItem.className = 'chat-log-item';
            logItem.innerHTML = `<span class="chat-log-name">${senderName}:</span><span>${msg}</span>`;
            this.logContainer.appendChild(logItem);

            while (this.logContainer.children.length > 50) {
                this.logContainer.removeChild(this.logContainer.firstChild);
            }
            
            this.logContainer.scrollTop = this.logContainer.scrollHeight;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    if (window.ChatManager) window.ChatManager.init();
});