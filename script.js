const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let gameRunning = false;
let score = 0, wave = 1;

// --- Sound Engine ---
const playSound = (freq, type, duration) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type; osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + duration);
};

// --- Player Object ---
const player = { x: 400, y: 300, w: 30, h: 30, hp: 100 };

// --- Boss Object ---
class Boss {
    constructor() { this.x = canvas.width/2; this.y = -50; this.active = true; }
    update() { if(this.y < 100) this.y += 0.5; }
    draw() {
        ctx.fillStyle = '#ff0033';
        ctx.shadowBlur = 20; ctx.shadowColor = '#ff0033';
        ctx.fillRect(this.x - 50, this.y, 100, 50);
        ctx.shadowBlur = 0;
    }
}

let boss = null;

// --- Game Loop ---
function update() {
    if (!gameRunning) return;
    
    ctx.fillStyle = 'rgba(5, 7, 10, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Player
    ctx.fillStyle = '#00f2ff';
    ctx.fillRect(player.x, player.y, player.w, player.h);
    
    // Boss Logic
    if (wave >= 1 && !boss) boss = new Boss();
    if (boss) { boss.update(); boss.draw(); }

    requestAnimationFrame(update);
}

// --- Init sequence ---
let p = 0;
const boot = setInterval(() => {
    p += 2;
    document.getElementById('progress').style.width = p + "%";
    if (p >= 100) {
        clearInterval(boot);
        document.getElementById('boot-screen').style.display = 'none';
        document.getElementById('ui').style.display = 'block';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gameRunning = true;
        update();
    }
}, 50);

// Interaction
window.addEventListener('keydown', (e) => {
    if(e.code === 'Space' && gameRunning) playSound(440, 'square', 0.1);
});
