// Base class for fighters
class Fighter {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.size = 50;
    this.color = color;
    this.target = null; // New property for the target
    this.nextSwitchTime = 0; // New property to track time for next target switch
  }

  // Method to draw the fighter
  draw() {
    fill(this.color);
    noStroke();
    rect(this.x, this.y, this.size, this.size);
  }
}

// Blue square fighter
class BlueFighter extends Fighter {
  constructor(x, y) {
    super(x, y, "blue");
  }
}

// Green square fighter
class GreenFighter extends Fighter {
  constructor(x, y) {
    super(x, y, "green");
  }
}

// Red square fighter
class RedFighter extends Fighter {
  constructor(x, y) {
    super(x, y, "red");
  }
}

// Base class for guns
class Gun {
  constructor(fighter) {
    this.fighter = fighter;
    this.target = null;
    this.nextTargetSwitchTime = 0; // Allow immediate target assignment
  }

  // Method to shoot
  shoot() {
    // To be implemented by subclasses
  }

  // New method to pick a random target from the opposing team
  pickRandomTarget(opposingTeam) {
    if (opposingTeam.length > 0) {
      const randomIndex = floor(random(opposingTeam.length));
      this.target = opposingTeam[randomIndex];
    }
  }

  updateTarget(opposingTeam) {
    // Debugging logs
    console.log(
      `Current time: ${millis()}, Next target switch time: ${
        this.nextTargetSwitchTime
      }`
    );

    if (opposingTeam.length > 0 && millis() > this.nextTargetSwitchTime) {
      const randomIndex = floor(random(opposingTeam.length));
      this.target = opposingTeam[randomIndex];
      this.nextTargetSwitchTime = millis() + random(500, 3000); // Set the next switch time

      // Debugging log to confirm a new target is assigned
      console.log(
        `New target assigned to fighter at (${this.fighter.x}, ${this.fighter.y})`
      );
    }
  }
}

// Laser gun class
class LaserGun extends Gun {
  constructor(fighter) {
    super(fighter);
    this.lastTargetUpdateTime = 0; // Initialize the property
    this.color = "red"; // Color of the laser
  }

  // Method to shoot a laser
  shoot(target) {
    // Only shoot if the target is defined
    if (target) {
      stroke(this.color);
      line(
        this.fighter.x + this.fighter.size / 2,
        this.fighter.y + this.fighter.size / 2,
        target.x + target.size / 2,
        target.y + target.size / 2
      );
    }
  }
}

// AutoRifle gun class
class AutoRifle extends Gun {
  constructor(fighter) {
    super(fighter);
    this.lastTargetUpdateTime = 0; // Initialize the property
    this.pixels = []; // Array to hold the shooting pixels
    this.shootingRate = 10; // How often to shoot, in frames
    this.lastShotFrame = 0; // The frame count when the last shot was fired
  }

  // Method to update and shoot pixels
  shoot(target) {
    // Only shoot if enough frames have passed and target is defined
    if (frameCount - this.lastShotFrame > this.shootingRate && target) {
      let angle = atan2(target.y - this.fighter.y, target.x - this.fighter.x); // Calculate angle towards target
      let speed = 10; // Speed of the pixel
      this.pixels.push({
        x: this.fighter.x + this.fighter.size / 2,
        y: this.fighter.y + this.fighter.size / 2,
        vx: cos(angle) * speed,
        vy: sin(angle) * speed,
        size: 8, // Slightly larger pixel size
      });
      this.lastShotFrame = frameCount; // Update the last shot frame
    }
  }

  // Method to update pixels' positions and draw them larger and yellow
  updatePixels() {
    fill(255, 255, 0); // Yellow color
    noStroke();

    for (let i = this.pixels.length - 1; i >= 0; i--) {
      let p = this.pixels[i];
      p.x += p.vx;
      p.y += p.vy;

      // Draw the pixel larger and yellow
      ellipse(p.x, p.y, p.size, p.size); // Draw with the specified size

      // Remove the pixel if it goes beyond the canvas boundaries
      if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
        this.pixels.splice(i, 1);
      }
    }
  }
}
