let soldiers = [];
let particles = [];
let teamSize = 30;

function setup() {
  createCanvas(800, 600);
  for (let i = 0; i < teamSize * 2; i++) {
    // Now based on teamSize
    let team = i % 2 === 0 ? "red" : "blue";
    let x = team === "red" ? random(width / 2) : random(width / 2, width);
    let y = random(height);
    if (random() < 0.5) {
      soldiers.push(new RangedSoldier(x, y, team));
    } else {
      soldiers.push(new MeleeSoldier(x, y, team));
    }
  }
}

function draw() {
  background(100);

  // Update and display soldiers
  soldiers = soldiers.filter((soldier) => {
    soldier.show();
    soldier.move();
    soldier.attack();
    return soldier.isActive; // Keep only active soldiers
  });

  // Check for a winning team
  let activeTeams = new Set(soldiers.map((soldier) => soldier.team));
  if (activeTeams.size === 1) {
    let winningTeam = [...activeTeams][0]; // Get the winning team
    soldiers.forEach((soldier) => {
      if (soldier.team === winningTeam) {
        soldier.isWinner = true; // Mark the soldier as part of the winning team
      }
    });
  }

  // Update and display particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].show();
    if (particles[i].isDead()) {
      particles.splice(i, 1); // Remove dead particles
    }
  }
}

// Base Soldier class
class Soldier {
  constructor(x, y, team) {
    this.x = x;
    this.y = y;
    this.size = 20;
    this.team = team;
    this.health = 150; // Default health
    this.speed = 2;
    this.damage = 10; // Default damage
    this.target = null;
    this.isActive = true; // Flag to check if the soldier is active
  }

  show() {
    fill(this.team === "red" ? "red" : "blue");
    ellipse(this.x, this.y, this.size);
  }

  move() {
    if (this.isWinner) {
      // Move towards the nearest edge
      let edgeDirection = this.x < width / 2 ? -1 : 1;
      this.x += this.speed * edgeDirection * 5; // Increase speed for exiting
    } else {
      // Default random movement
      this.x += random(-this.speed, this.speed);
      this.y += random(-this.speed, this.speed);
    }
  }

  attack() {
    // Base attack method to be overridden by subclasses
  }

  findTarget() {
    // Method to find a target, can be overridden or extended by subclasses
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0 && this.isActive) {
      this.onDeath();
    }
  }

  onDeath() {
    console.log(`A ${this.team} soldier has died.`);
    this.isActive = false; // Mark the soldier as inactive

    // Generate death particles
    for (let i = 0; i < 20; i++) {
      // Generate 20 particles per death
      let teamColor = this.team === "red" ? [255, 0, 0] : [0, 0, 255]; // Color based on team
      particles.push(new Particle(this.x, this.y, teamColor));
    }
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
      this.target.takeDamage(this.damage);
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
      this.target.takeDamage(this.damage);
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

class Particle {
  constructor(x, y, teamColor) {
    this.position = createVector(x, y);
    this.velocity = p5.Vector.random2D(); // Gives a random velocity
    this.velocity.mult(random(1, 5)); // Randomize the speed
    this.size = random(3, 6);
    this.lifespan = 255; // Start fully opaque
    this.color = teamColor;
  }

  update() {
    this.position.add(this.velocity);
    this.lifespan -= 6; // Decrease to fade out
  }

  show() {
    noStroke();
    fill(this.color[0], this.color[1], this.color[2], this.lifespan); // Use RGBA for fading effect
    ellipse(this.position.x, this.position.y, this.size);
  }

  isDead() {
    return this.lifespan < 0;
  }
}
