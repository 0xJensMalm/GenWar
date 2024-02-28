// Global variables
let soldiers = [];
let particles = [];
const teamSize = 30; // Constant for team size

// Blood particle parameters
let bloodParticleAmount = 30; // Default amount of blood particles
let bloodParticleSpeedMin = 10; // Minimum speed of blood particles
let bloodParticleSpeedMax = 40; // Maximum speed of blood particles
let bloodParticleSizeMin = 1; // Minimum size of blood particles
let bloodParticleSizeMax = 8; // Maximum size of blood particles

// Draw function to update the canvas each frame
function draw() {
  background(100);
  updateSoldiers();
  checkWinningCondition();
  updateParticles();
}

// Function to initialize soldiers
function initializeSoldiers() {
  for (let i = 0; i < teamSize * 2; i++) {
    const team = i % 2 === 0 ? "red" : "blue";
    const x = team === "red" ? random(width / 2) : random(width / 2, width);
    const y = random(height);
    const soldierType = random() < 0.5 ? RangedSoldier : MeleeSoldier;
    soldiers.push(new soldierType(x, y, team));
  }
}

// Function to update and display soldiers
function updateSoldiers() {
  soldiers = soldiers.filter((soldier) => {
    soldier.show();
    soldier.move();
    soldier.attack();
    return soldier.isActive;
  });
}

// Function to check for a winning team
function checkWinningCondition() {
  const activeTeams = new Set(soldiers.map((soldier) => soldier.team));
  if (activeTeams.size === 1) {
    const winningTeam = [...activeTeams][0];
    soldiers.forEach((soldier) => {
      if (soldier.team === winningTeam) soldier.isWinner = true;
    });
  }
}

// Function to update and display particles
function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].isDead()) particles.splice(i, 1);
  }
}

// Base Soldier class
class Soldier {
  constructor(x, y, team) {
    this.x = x;
    this.y = y;
    this.size = 20;
    this.team = team;
    this.health = 150;
    this.speed = 2;
    this.damage = 10;
    this.target = null;
    this.isActive = true;
  }

  show() {
    fill(this.team === "red" ? "red" : "blue");
    ellipse(this.x, this.y, this.size);
  }

  move() {
    // Custom move logic for winners
    if (this.isWinner) this.moveOutOfCanvas();
    else this.randomMove();
  }

  randomMove() {
    this.x += random(-this.speed, this.speed);
    this.y += random(-this.speed, this.speed);
  }

  moveOutOfCanvas() {
    const edgeDirection = this.x < width / 2 ? -1 : 1;
    this.x += this.speed * edgeDirection * 5;
  }

  attack() {
    /* Base attack method */
  }

  findTarget() {
    /* Base findTarget method */
  }

  takeDamage(amount, attacker) {
    this.health -= amount;
    if (this.health <= 0) this.onDeath();
    else this.generateParticles(attacker);
  }

  onDeath() {
    this.isActive = false;
    console.log(`A ${this.team} soldier has died.`);
    this.generateDeathParticles();
  }

  generateParticles(attacker) {
    if (!attacker) return;
    for (let i = 0; i < bloodParticleAmount; i++) {
      const angle =
        atan2(this.y - attacker.y, this.x - attacker.x) +
        random(-bloodParticleSpread, bloodParticleSpread);
      const speed = random(bloodParticleSpeedMin, bloodParticleSpeedMax);
      const velocity = createVector(cos(angle) * speed, sin(angle) * speed);
      const size = random(bloodParticleSizeMin, bloodParticleSizeMax);
      const color = [random(100, 255), 0, 0]; // Shades of red
      particles.push(new Particle(this.x, this.y, color, velocity, size));
    }
  }

  generateDeathParticles() {
    for (let i = 0; i < 20; i++) {
      const teamColor = this.team === "red" ? [255, 0, 0] : [0, 0, 255];
      particles.push(
        new Particle(
          this.x,
          this.y,
          teamColor,
          createVector(random(-1, 1), random(-1, 1))
        )
      );
    }
  }
}

// Particle class with added checks
class Particle {
  constructor(x, y, color, velocity, size) {
    this.position = createVector(x, y);
    this.velocity = velocity;
    this.size = size; // Use the size parameter
    this.lifespan = 255;
    this.color = color;
    this.isStatic = false;
  }

  update() {
    if (!this.isStatic) {
      this.position.add(this.velocity);
      this.velocity.mult(0.9);
      if (this.velocity.mag() < 0.1) this.isStatic = true;
    }
    this.lifespan -= 2;
  }

  show() {
    noStroke();
    fill(...this.color, this.lifespan);
    ellipse(this.position.x, this.position.y, this.size);
  }

  isDead() {
    return this.isStatic && this.lifespan < 0;
  }
}

class RangedSoldier extends Soldier {
  constructor(x, y, team) {
    super(x, y, team);
    this.damage = 15; // Specific damage for ranged
    this.lastAttackTime = 0; // Initialize last attack time
    this.attackInterval = random(2000, 5000); // Random interval between attacks
  }

  findTarget() {
    // Find a random target every few seconds, not necessarily the closest
    if (millis() - this.lastAttackTime > this.attackInterval) {
      this.target = random(
        soldiers.filter(
          (soldier) => soldier.team !== this.team && soldier.health > 0
        )
      );
      this.lastAttackTime = millis(); // Update the last attack time
    }
  }

  attack() {
    this.findTarget();
    if (this.target) {
      stroke("yellow");
      line(this.x, this.y, this.target.x, this.target.y);
      this.target.takeDamage(this.damage, this);

      // Optionally, reset target after each attack or keep attacking the same target for a while
    }
  }
}

// MeleeSoldier class
class MeleeSoldier extends Soldier {
  constructor(x, y, team) {
    super(x, y, team);
    this.health = 250; // Higher health for melee
    this.damage = 25; // Higher damage for melee
    this.attackRange = 25;
  }

  move() {
    this.findTarget(); // Ensure a target is always being sought
    if (this.target) {
      let angle = atan2(this.target.y - this.y, this.target.x - this.x);
      this.x += this.speed * cos(angle);
      this.y += this.speed * sin(angle);
    }
    this.x = constrain(this.x, 0, width); // Keep within canvas bounds
    this.y = constrain(this.y, 0, height);
  }

  attack() {
    this.findTarget(); // Ensure a target is available before attacking
    if (
      this.target &&
      dist(this.x, this.y, this.target.x, this.target.y) <= this.attackRange
    ) {
      this.target.takeDamage(this.damage, this);

      fill("black");
      ellipse(this.x, this.y, this.size * 1.5); // Visual indication of attack
    }
  }

  findTarget() {
    // Updated targeting logic to ensure continuous engagement
    let closest = null;
    let recordDistance = Infinity;
    soldiers.forEach((soldier) => {
      if (soldier.team !== this.team && soldier.health > 0) {
        let d = dist(this.x, this.y, soldier.x, soldier.y);
        if (d < recordDistance) {
          recordDistance = d;
          closest = soldier;
        }
      }
    });
    this.target = closest;
  }
}

// Setup function to initialize the canvas and soldiers
function setup() {
  createCanvas(800, 600);
  bloodParticleSpread = PI / 6; // Initialize here, where PI is available
  initializeSoldiers();
}
