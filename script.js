/**
 * POP-UP Game Logic
 * Recreated from Python version
 */

// Sound Effects (Optional placeholders for now)
const SFX = {
    pop: new Audio(),
    close: new Audio(),
    win: new Audio()
};

class PopUpGame {
    constructor() {
        this.score = 0;
        this.timeLimit = 30;
        this.timeRemaining = 30;
        this.gameActive = false;
        this.playerName = "Anonyme";
        this.correctPassword = "";
        this.passwordParts = [];
        this.timerInterval = null;
        this.popupInterval = null;
        this.popups = [];
        this.popupDelay = 2000;
        this.minDelay = 150;
        this.currentPasswordPartIndex = 0; // Track which part to show next

        this.initElements();
        this.initEvents();
    }

    initElements() {
        // Screens
        this.screens = {
            start: document.getElementById('start-screen'),
            game: document.getElementById('game-board'),
            password: document.getElementById('password-screen'),
            victory: document.getElementById('victory-screen'),
            hacked: document.getElementById('hacked-screen')
        };

        // Inputs & Buttons
        this.nameInput = document.getElementById('player-name');
        this.startBtn = document.getElementById('start-btn');
        this.pwdInput = document.getElementById('password-input');
        this.validatePwdBtn = document.getElementById('validate-pwd-btn');
        this.hintBtn = document.getElementById('hint-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.restartHackedBtn = document.querySelector('.restart-hacked-btn');
        this.hintBox = document.getElementById('hint-box');

        // Displays
        this.displayName = document.getElementById('display-name');
        this.displayScore = document.getElementById('display-score');
        this.displayTimer = document.getElementById('display-timer');
        this.popupArea = document.getElementById('popup-area');

        this.finalName = document.getElementById('final-name');
        this.finalScore = document.getElementById('final-score');
        this.leaderboardList = document.getElementById('leaderboard-list');

        // HUD wrapper for timer pulse effect
        this.timerItem = document.querySelector('.timer-item');
    }

    initEvents() {
        this.startBtn.addEventListener('click', () => this.handleStart());
        this.validatePwdBtn.addEventListener('click', () => this.handleValidatePassword());
        this.hintBtn.addEventListener('click', () => {
            this.hintBox.classList.toggle('hidden');
        });
        this.restartBtn.addEventListener('click', () => this.resetGame());
        this.restartHackedBtn.addEventListener('click', () => this.showScreen('start'));

        // Enter key support
        this.nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleStart();
        });
        this.pwdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleValidatePassword();
        });
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(s => {
            s.classList.remove('active');
            s.style.display = 'none';
        });
        const current = this.screens[screenName];
        current.style.display = 'flex';
        // Force reflow for opacity transition
        current.offsetHeight;
        current.classList.add('active');
    }

    handleStart() {
        const name = this.nameInput.value.trim();
        if (name.length < 2) {
            alert("Le pseudo doit contenir au moins 2 caractères !");
            return;
        }
        this.playerName = name;
        this.startGame();
    }

    startGame() {
        this.score = 0;
        this.timeRemaining = this.timeLimit;
        this.gameActive = true;
        this.popupDelay = 2000;
        this.attempts = 3; // Reset attempts to 3 at start of game

        // Setup Password
        const years = ["2020", "2021", "2022", "2023", "2024", "2025"];
        const year = years[Math.floor(Math.random() * years.length)];
        this.correctPassword = `POPUP${year}`;
        this.passwordParts = [this.correctPassword.substring(0, 3), this.correctPassword.substring(3, 5), this.correctPassword.substring(5, 7), this.correctPassword.substring(7)];

        // UI Update
        this.displayName.textContent = this.playerName;
        this.displayScore.textContent = "0";
        this.displayTimer.textContent = `${this.timeRemaining}s`;
        this.timerItem.classList.remove('urgent');
        this.popupArea.innerHTML = '';
        this.popups = [];
        this.currentPasswordPartIndex = 0;

        this.showScreen('game');

        // Start Timers
        this.startTimer();
        this.scheduleNextPopup();
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.displayTimer.textContent = `${this.timeRemaining}s`;

            if (this.timeRemaining <= 10) {
                this.timerItem.classList.add('urgent');
            }

            if (this.timeRemaining <= 0) {
                this.endGamePhase();
            }
        }, 1000);
    }

    scheduleNextPopup() {
        if (!this.gameActive) return;

        this.createPopup();

        // Calculate next delay based on TIME ELAPSED (Scale difficulty)
        const progress = (this.timeLimit - this.timeRemaining) / this.timeLimit;
        // Using a square root curve: it ramps up fast but slows its acceleration at the end
        // And capping it at 0.7 (70% faster) instead of 0.9 to keep it manageable
        const speedFactor = Math.sqrt(progress) * 0.7;

        this.popupDelay = Math.max(this.minDelay, 1500 - (1500 * speedFactor));

        // Add randomness to delay
        const randomDelay = this.popupDelay * (0.8 + Math.random() * 0.4);

        this.popupInterval = setTimeout(() => this.scheduleNextPopup(), randomDelay);
    }

    createPopup() {
        const popup = document.createElement('div');

        // Decide if this is a Password Clue Popup or a standard Ad Popup
        // NOW BASED ON TIME: Every 6 seconds for 4 parts in 30s
        const elapsed = this.timeLimit - this.timeRemaining;
        const clueThreshold = (this.currentPasswordPartIndex + 1) * 6;

        const shouldShowClue = elapsed >= clueThreshold &&
            this.currentPasswordPartIndex < this.passwordParts.length;

        let part = "";
        let isClue = false;

        // Random theme for variety
        const themes = ['theme-classic', 'theme-modern', 'theme-alert', 'theme-neon'];
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];

        if (shouldShowClue) {
            part = this.passwordParts[this.currentPasswordPartIndex];
            this.currentPasswordPartIndex++;
            isClue = true;
            popup.className = 'game-popup clue-popup';
        } else {
            popup.className = `game-popup ${randomTheme}`;
        }

        // NO ROTATION for Metro Style (Flat)
        popup.style.transform = `scale(1)`;

        // Content
        const imgNum = Math.floor(Math.random() * 7) + 1;
        const ads = ["FERMEZ-MOI!", "Metro UI", "Windows 8", "Publicité!", "Mise à jour", "Tuiles Dynamiques", "Attention"];
        const msg = isClue ? "INDICE TROUVÉ !" : ads[Math.floor(Math.random() * ads.length)];

        popup.innerHTML = `
            <div class="popup-header">
                <span>${isClue ? `🔑 CLÉ [${part}]` : new Date().toLocaleTimeString()}</span>
                <span>✖</span>
            </div>
            <div class="popup-content">
                ${isClue ? `
                    <div class="clue-box">
                        <span class="clue-label">SÉQUENCE DE DÉCRYPTAGE</span>
                        <span class="clue-value">${part}</span>
                    </div>
                ` : `<img src="img/${imgNum}.png" alt="Popup Ad" onerror="this.style.display='none'">`}
                <p class="popup-msg">${msg}</p>
                <button class="close-popup-btn">Fermer</button>
            </div>
        `;

        // Position logic
        popup.style.visibility = 'hidden';
        this.popupArea.appendChild(popup);

        const onReady = () => {
            // Dimensions
            const width = 350;
            const height = popup.offsetHeight || 250;

            // Viewport safety
            const maxX = window.innerWidth - width - 20;
            const maxY = window.innerHeight - height - 20;
            const minY = 50;

            const x = Math.max(10, Math.floor(Math.random() * maxX));
            const y = Math.max(minY, Math.floor(Math.random() * (maxY - minY) + minY));

            popup.style.left = `${x}px`;
            popup.style.top = `${y}px`;

            popup.style.visibility = 'visible';
        };

        const img = popup.querySelector('img');
        if (img && !isClue) {
            if (img.complete) onReady();
            else {
                img.onload = onReady;
                img.onerror = onReady;
            }
        } else {
            onReady();
        }

        // Close Event
        const closeBtn = popup.querySelector('.close-popup-btn');
        const triggerClose = (e) => {
            e.stopPropagation();
            this.closePopup(popup, e.clientX, e.clientY);
        };

        closeBtn.onclick = triggerClose;
        popup.onclick = (e) => {
            popup.style.zIndex = 100 + this.popups.length + 1;
        };

        this.popups.push(popup);
    }

    spawnParticles(x, y) {
        const particleCount = 12;
        const colors = ['#ff0055', '#00e5ff', '#ffffff', '#ffbd2e'];

        for (let i = 0; i < particleCount; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            p.style.left = `${x}px`;
            p.style.top = `${y}px`;

            const angle = Math.random() * Math.PI * 2;
            const velocity = 2 + Math.random() * 4;
            const tx = Math.cos(angle) * velocity * 50;
            const ty = Math.sin(angle) * velocity * 50;

            p.style.transition = 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)';
            p.style.opacity = '1';

            this.popupArea.appendChild(p);

            // Animate
            requestAnimationFrame(() => {
                p.style.transform = `translate(${tx}px, ${ty}px) scale(0)`;
                p.style.opacity = '0';
            });

            // Cleanup
            setTimeout(() => p.remove(), 600);
        }
    }

    spawnFloatingScore(x, y) {
        const el = document.createElement('div');
        el.className = 'floating-score';
        el.textContent = '+1';
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        this.popupArea.appendChild(el);
        setTimeout(() => el.remove(), 800);
    }

    // Removed spawnParticles simply by not calling it
    // Removed spawnFloatingScore simply by not calling it or keeping it minimal

    closePopup(popup, clickX, clickY) {
        if (!this.gameActive) return;

        const index = this.popups.indexOf(popup);
        if (index > -1) this.popups.splice(index, 1);
        else return;

        // Metro animation: Slide down/fade out fast
        popup.style.transition = 'all 0.2s ease-in';
        popup.style.opacity = '0';
        popup.style.transform = 'scale(0.95)';

        setTimeout(() => {
            if (popup.parentNode) popup.parentNode.removeChild(popup);
        }, 200);

        this.score++;
        this.displayScore.textContent = this.score;

        // Optional: Add simple floating score if desired, else skip
        // this.spawnFloatingScore(clickX, clickY); 
    }

    endGamePhase() {
        this.gameActive = false;
        clearInterval(this.timerInterval);
        clearTimeout(this.popupInterval);
        this.timerItem.classList.remove('urgent');

        // Clear popups with dramatic effect
        this.popups.forEach((p, i) => {
            setTimeout(() => {
                p.style.transform = 'scale(0)';
                p.style.opacity = '0';
                setTimeout(() => p.remove(), 300);
            }, i * 50);
        });
        this.popups = [];

        this.showScreen('password');
        this.pwdInput.focus();
    }

    handleValidatePassword() {
        const input = this.pwdInput.value.trim().toUpperCase();
        if (input === this.correctPassword) {
            this.showVictory();
        } else {
            this.attempts--;

            // Shake effect
            this.pwdInput.style.borderColor = 'var(--metro-red)';
            this.pwdInput.classList.add('shake');
            setTimeout(() => {
                this.pwdInput.style.borderColor = '#ccc';
                this.pwdInput.classList.remove('shake');
            }, 500);

            this.pwdInput.value = '';

            if (this.attempts > 0) {
                alert(`Accès Refusé ! Mot de passe incorrect.\nIl vous reste ${this.attempts} essais.`);
            } else {
                this.showHacked();
            }
        }
    }

    showHacked() {
        this.showScreen('hacked');
    }

    showVictory() {
        this.finalName.textContent = this.playerName;
        this.finalScore.textContent = this.score;

        this.saveScore(this.playerName, this.score);
        this.updateLeaderboardUI();

        this.showScreen('victory');
    }

    saveScore(name, score) {
        let scores = JSON.parse(localStorage.getItem('popup_scores') || '[]');
        const timestamp = Date.now();
        this.lastScoreTimestamp = timestamp; // Store to identify current score
        scores.push({ name, score, timestamp });
        scores.sort((a, b) => b.score - a.score || b.timestamp - a.timestamp);
        scores = scores.slice(0, 50); // Keep enough to track rank
        localStorage.setItem('popup_scores', JSON.stringify(scores));
    }

    updateLeaderboardUI() {
        const scores = JSON.parse(localStorage.getItem('popup_scores') || '[]');

        // Render top 5
        let html = scores.slice(0, 5).map((s, i) => `
            <li>
                <span class="rank">#${i + 1}</span>
                <span class="pseudo">${s.name}</span>
                <span class="score">${s.score} pts</span>
            </li>
        `).join('');

        // Check if current score is outside top 5
        const currentIndex = scores.findIndex(s => s.timestamp === this.lastScoreTimestamp);
        if (currentIndex >= 5) {
            const currentScore = scores[currentIndex];
            html += `
                <li class="leaderboard-separator">...</li>
                <li class="current-player-rank">
                    <span class="rank">#${currentIndex + 1}</span>
                    <span class="pseudo">${currentScore.name}</span>
                    <span class="score">${currentScore.score} pts</span>
                </li>
            `;
        }

        this.leaderboardList.innerHTML = html;
    }

    resetGame() {
        this.nameInput.value = '';
        this.pwdInput.value = '';
        this.hintBox.classList.add('hidden');
        this.showScreen('start');
    }
}

// Initialize Game on Load
window.addEventListener('DOMContentLoaded', () => {
    new PopUpGame();
});
