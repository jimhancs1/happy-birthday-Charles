class EntityManager {
    constructor() { this.entities = []; }
    add(entity) { this.entities.push(entity); }
    update(dt) {
        for (let i = this.entities.length - 1; i >= 0; i--) {
            if (this.entities[i].update) this.entities[i].update(dt);
        }
        this.entities = this.entities.filter(e => e.active !== false);
    }
    draw(ctx) { this.entities.forEach(e => { if (e.draw) e.draw(ctx); }); }
    clear() { this.entities = []; }
}

// Particle
class Particle { /* ... same as before ... */ } // (keep previous Particle class)

// Enemy with unique types
class Enemy {
    constructor(x, y, type = 'spark') {
        this.x = x || Math.random() * 1000 + 140;
        this.y = y || Math.random() * 480 + 120;
        this.type = type;
        this.health = 30;
        this.baseSpeed = 47;
        this.speed = this.baseSpeed;
        this.radius = 19;
        this.active = true;
        this.statusEffects = [];

        // Unique visuals per type
        switch(type) {
            case 'spark': this.color = '#ffcc00'; this.radius = 16; break;
            case 'relay': this.color = '#ff3366'; break;
            case 'drone': this.color = '#00ccff'; this.radius = 22; break;
            case 'arc': this.color = '#aa00ff'; break;
            case 'robot': this.color = '#ff6600'; this.radius = 21; break;
            case 'short': this.color = '#ffff00'; break;
            case 'plasma': this.color = '#00ffcc'; this.radius = 20; break;
            case 'capacitor': this.color = '#ff00aa'; break;
            case 'sentinel': this.color = '#ff2222'; this.radius = 24; break;
            case 'phantom': this.color = '#88aaff'; break;
            case 'hunter': this.color = '#ff8800'; break;
            default: this.color = '#ff3366';
        }
    }

    applyStatus(type, duration = 3) { /* ... same as before ... */ }
    update(dt) { /* ... same status + movement logic as before ... */ }
    draw(ctx) { /* ... same drawing with status icons ... */ }
}

// Player, Projectile (keep from previous versions)
class Player { /* ... */ }
class Projectile { /* ... */ }
