// game.js - Full Integrated Version
let canvas, ctx;
let player;
let entityManager;
let keys = {};
let lastTime = 0;
let score = 0;
let xp = 0;
let wave = 1;
let enemiesKilled = 0;
let gameRunning = true;
let currentStage = 1;
let dialogueActive = false;
let currentDialogueText = "";
let dialogueIndex = 0;
let lastDialogueCharTime = 0;
let dialogueSpeed = 28;
let dialogueCallback = null;
let audioContext;

const GameState = {
    currentStage: 1,
    currentWave: 1,
    isPaused: false,
    
    nextWave() {
        this.currentWave++;
        wave = this.currentWave;
        document.getElementById('wave-value').textContent = wave;
        if (this.currentWave > 5) this.initUpgradeMenu();
        else spawnWaveForStage();
    },
    
    initUpgradeMenu() {
        this.isPaused = true;
        const menu = document.getElementById('upgrade-menu');
        const container = document.getElementById('upgrade-options');
        container.innerHTML = '';
        
        const upgrades = [
            {name: "SPEED BOOST", desc: "Movement +25%", icon: "⚡"},
            {name: "FIRE POWER", desc: "Damage +30%", icon: "🔥"},
            {name: "MAX HEALTH", desc: "Health +40", icon: "❤️"}
        ];
        
        upgrades.forEach(upg => {
            const el = document.createElement('div');
            el.className = 'upgrade-option';
            el.innerHTML = `<strong>${upg.icon} ${upg.name}</strong><br><small>${upg.desc}</small>`;
            el.onclick = () => {
                menu.classList.add('hidden');
                GameState.isPaused = false;
                GameState.nextWave();
            };
            container.appendChild(el);
        });
        menu.classList.remove('hidden');
    }
};

// Story Data
const story = {
    1: { name: "Power Station", intro: "The generators are offline. Restore power to the first substation, Engineer.", outro: "Stage 1 complete. 20% of the grid restored.", portrait: "🔋" },
    2: { name: "Transmission Network", intro: "The towers are corrupted. Reconnect the transmission lines.", outro: "Transmission network stabilized.", portrait: "📡" },
    3: { name: "Industrial Control Centre", intro: "The machines have turned against us.", outro: "Factory automation restored.", portrait: "🏭" },
    4: { name: "High Voltage Laboratory", intro: "Experiments have gone critical. Shut them down.", outro: "Laboratory secured.", portrait: "🧪" },
    5: { name: "The Digital Grid", intro: "We are inside Blackout's domain. This is the final stretch.", outro: "The Core Reactor is ahead...", portrait: "🌐" }
};

// Audio
function initAudio() {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
}
function playVoiceLine(pitch = 1) {
    initAudio();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sawtooth';
    osc.frequency.value = 160 + Math.random() * 140 * pitch;
    gain.gain.value = 0.13;
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.13);
    osc.connect(gain).connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + 0.14);
}

// Dialogue
function showDialogue(text, portrait = "⚡", onComplete = null) {
    if (dialogueActive) return;
    dialogueActive = true;
    GameState.isPaused = true;
    currentDialogueText = text;
    dialogueIndex = 0;
    lastDialogueCharTime = performance.now();
    dialogueCallback = onComplete;
    
    const box = document.getElementById('dialogue-box');
    const p = document.getElementById('dialogue-text');
    const port = document.getElementById('dialogue-portrait');
    port.textContent = portrait;
    p.textContent = "";
    box.classList.remove('hidden');
    playVoiceLine(1.2);
}

function updateDialogue() {
    if (!dialogueActive) return;
    const now = performance.now();
    if (now - lastDialogueCharTime > dialogueSpeed && dialogueIndex < currentDialogueText.length) {
        document.getElementById('dialogue-text').textContent += currentDialogueText[dialogueIndex];
        dialogueIndex++;
        lastDialogueCharTime = now;
        if (Math.random() < 0.6) playVoiceLine(0.8);
    }
}

function finishDialogue() {
    if (!dialogueActive) return;
    document.getElementById('dialogue-text').textContent = currentDialogueText;
    dialogueActive = false;
    GameState.isPaused = false;
    document.getElementById('dialogue-box').classList.add('hidden');
    if (dialogueCallback) dialogueCallback();
}

// Enemy spawning per stage
function spawnWaveForStage() {
    entityManager.clear();
    const count = 5 + currentStage * 3;
    const types = ['spark','relay','drone','arc','robot','short','plasma','capacitor','sentinel','phantom','hunter'];
    
    for (let i = 0; i < count; i++) {
        const type = types[Math.floor(Math.random() * types.length)];
        entityManager.add(new Enemy(null, null, type));
    }
}

function completeStage() {
    showDialogue(story[currentStage].outro, "✅", () => {
        finishDialogue();
        if (currentStage < 5) {
            currentStage++;
            document.getElementById('stage-display').textContent = `Stage ${currentStage}: ${story[currentStage].name}`;
            showDialogue(story[currentStage].intro, story[currentStage].portrait, () => {
                finishDialogue();
                spawnWaveForStage();
            });
        } else {
            alert("🎉 You have reached the Core Reactor! Boss fight coming soon.");
        }
    });
}

// Game Over
function showGameOver() {
    gameRunning = false;
    GameState.isPaused = true;
    document.getElementById('final-score').textContent = `Final Score: ${score}`;
    document.getElementById('final-wave').textContent = `Stage ${currentStage}`;
    document.getElementById('game-over').classList.remove('hidden');
}

function resetGame() {
    location.reload();
}

// ==================== GAME LOOP ====================
function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    if (!gameRunning || GameState.isPaused) {
        requestAnimationFrame(gameLoop);
        return;
    }

    if (dialogueActive) {
        updateDialogue();
        requestAnimationFrame(gameLoop);
        return;
    }

    player.update(dt, keys);
    entityManager.update(dt);

    // Collisions + Status Effects + Particles (same logic as before)
    // ... [Keep your previous collision code here] ...

    // Example enemy death with particles
    // if (e.health <= 0) { ... spawn particles ... }

    requestAnimationFrame(gameLoop);
}

// Init
function init() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    player = new Player();
    entityManager = new EntityManager();

    // Input
    window.addEventListener('keydown', e => keys[e.key] = true);
    window.addEventListener('keyup', e => keys[e.key] = false);
    
    canvas.addEventListener('click', () => {
        if (!dialogueActive && gameRunning) {
            // spawn projectile
        }
    });

    document.getElementById('retry-btn').onclick = resetGame;
    document.getElementById('menu-btn').onclick = () => location.reload();

    // Start Story
    showDialogue(
        "Blackout has seized The Nexus Grid.\nYou are the last Grid Engineer.",
        "🛠️",
        () => {
            finishDialogue();
            document.getElementById('stage-display').textContent = `Stage 1: ${story[1].name}`;
            showDialogue(story[1].intro, story[1].portrait, () => {
                finishDialogue();
                spawnWaveForStage();
            });
        }
    );

    requestAnimationFrame(gameLoop);
}

document.addEventListener('DOMContentLoaded', init);
