/**
 * POP-UP Game Logic
 * Recreated from Python version
 */

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
            victory: document.getElementById('victory-screen')
        };

        // Inputs & Buttons
        this.nameInput = document.getElementById('player-name');
        this.startBtn = document.getElementById('start-btn');
        this.pwdInput = document.getElementById('password-input');
        this.validatePwdBtn = document.getElementById('validate-pwd-btn');
        this.hintBtn = document.getElementById('hint-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.hintBox = document.getElementById('hint-box');

        // Displays
        this.displayName = document.getElementById('display-name');
        this.displayScore = document.getElementById('display-score');
        this.displayTimer = document.getElementById('display-timer');
        this.popupArea = document.getElementById('popup-area');

        this.finalName = document.getElementById('final-name');
        this.finalScore = document.getElementById('final-score');
        this.leaderboardList = document.getElementById('leaderboard-list');
    }

    initEvents() {
        this.startBtn.addEventListener('click', () => this.handleStart());
        this.validatePwdBtn.addEventListener('click', () => this.handleValidatePassword());
        this.hintBtn.addEventListener('click', () => {
            this.hintBox.classList.toggle('hidden');
        });
        this.restartBtn.addEventListener('click', () => this.resetGame());

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

        // Setup Password
        const years = ["2020", "2021", "2022", "2023", "2024", "2025"];
        const year = years[Math.floor(Math.random() * years.length)];
        this.correctPassword = `POPUP${year}`;
        this.passwordParts = [this.correctPassword.substring(0, 3), this.correctPassword.substring(3, 5), this.correctPassword.substring(5, 7), this.correctPassword.substring(7)];

        // UI Update
        this.displayName.textContent = this.playerName;
        this.displayScore.textContent = "0";
        this.displayTimer.textContent = `${this.timeRemaining}s`;
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

            if (this.timeRemaining <= 0) {
                this.endGamePhase();
            }
        }, 1000);
    }

    scheduleNextPopup() {
        if (!this.gameActive) return;

        this.createPopup();

        // Calculate next delay based on score (similar to Python logic)
        const speedFactor = Math.min(this.score * 0.05, 0.8);
        this.popupDelay = Math.max(this.minDelay, 2000 - (2000 * speedFactor));

        this.popupInterval = setTimeout(() => this.scheduleNextPopup(), this.popupDelay);
    }

    createPopup() {
        const popup = document.createElement('div');

        // Decide if this is a Password Clue Popup or a standard Ad Popup
        // Show a clue popup every 5 points, until all are shown
        const shouldShowClue = this.score > 0 &&
            this.score % 5 === 0 &&
            this.currentPasswordPartIndex < this.passwordParts.length;

        let part = "";
        let isClue = false;

        if (shouldShowClue) {
            part = this.passwordParts[this.currentPasswordPartIndex];
            this.currentPasswordPartIndex++;
            isClue = true;
            popup.className = 'game-popup clue-popup';
        } else {
            popup.className = 'game-popup';
        }

        // Random Image & Messages
        const imgNum = Math.floor(Math.random() * 7) + 1;
        const ads = ["FERMEZ-MOI!", "Pop-up gênant!", "Cliquez ici", "Publicité!", "Supprimez-moi!", "Malveillant!", "Alerte!"];
        const msg = isClue ? "INDICE TROUVÉ !" : ads[Math.floor(Math.random() * ads.length)];

        popup.innerHTML = `
            <div class="popup-header">
                <span>${isClue ? `🔑 INDICE [${part}]` : ""}</span>
            </div>
            <div class="popup-content">
                ${isClue ? `
                    <div class="clue-box">
                        <span class="clue-label">PARTIE DU MOT DE PASSE</span>
                        <span class="clue-value">${part}</span>
                    </div>
                ` : `<img src="img/${imgNum}.png" alt="Popup Ad">`}
                <p class="popup-msg">${msg}</p>
                <button class="close-popup-btn">✖ FERMER</button>
            </div>
        `;

        // First append to DOM (hidden) to get dimensions
        popup.style.visibility = 'hidden';
        this.popupArea.appendChild(popup);

        // Wait for a frame to ensure layout is calculated
        requestAnimationFrame(() => {
            const popupWidth = popup.offsetWidth;
            const popupHeight = popup.offsetHeight;

            // Position Logic: Stay within viewport, avoiding HUD (approx top 100px)
            const hudOffset = 100;

            // Calculate max possible values
            const maxX = Math.max(0, window.innerWidth - popupWidth - 20);
            const maxY = Math.max(hudOffset, window.innerHeight - popupHeight - 20);

            const x = 10 + Math.random() * maxX;
            const y = hudOffset + Math.random() * (maxY - hudOffset);

            popup.style.left = `${x}px`;
            popup.style.top = `${y}px`;
            popup.style.visibility = 'visible';
        });

        const closeBtn = popup.querySelector('.close-popup-btn');
        closeBtn.onclick = () => this.closePopup(popup);

        this.popups.push(popup);
    }

    closePopup(popup) {
        if (!this.gameActive) return;

        popup.style.transform = 'scale(0.8)';
        popup.style.opacity = '0';

        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
            const index = this.popups.indexOf(popup);
            if (index > -1) this.popups.splice(index, 1);
        }, 200);

        this.score++;
        this.displayScore.textContent = this.score;
    }

    endGamePhase() {
        this.gameActive = false;
        clearInterval(this.timerInterval);
        clearTimeout(this.popupInterval);

        // Clear popups
        this.popups.forEach(p => {
            if (p.parentNode) p.parentNode.removeChild(p);
        });
        this.popups = [];

        this.showScreen('password');
    }

    handleValidatePassword() {
        const input = this.pwdInput.value.trim().toUpperCase();
        if (input === this.correctPassword) {
            this.showVictory();
        } else {
            alert("Mot de passe incorrect !");
            this.pwdInput.value = '';
        }
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
        scores.push({ name, score });
        scores.sort((a, b) => b.score - a.score);
        scores = scores.slice(0, 5); // Keep top 5
        localStorage.setItem('popup_scores', JSON.stringify(scores));
    }

    updateLeaderboardUI() {
        const scores = JSON.parse(localStorage.getItem('popup_scores') || '[]');
        this.leaderboardList.innerHTML = scores.map((s, i) => {
            const medals = ["🥇", "🥈", "🥉", "🏅", "🏅"];
            return `
                <li>
                    <span class="rank">${medals[i]}</span>
                    <span class="pseudo">${s.name}</span>
                    <span class="score">${s.score} pts</span>
                </li>
            `;
        }).join('');
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
