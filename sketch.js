let teamA = []; // Team on the left
let teamB = []; // Team on the right
let fightButton;
let fighting = false;
let fightStartTime;

function setup() {
  createCanvas(800, 600); // Increased canvas size

  // Create Team A fighters on the left side
  for (let i = 0; i < 5; i++) {
    let fighter = createRandomFighter(50, (height / 6) * (i + 1));
    assignRandomGun(fighter);
    teamA.push(fighter);
  }

  // Create Team B fighters on the right side
  for (let i = 0; i < 5; i++) {
    let fighter = createRandomFighter(width - 100, (height / 6) * (i + 1));
    assignRandomGun(fighter);
    teamB.push(fighter);
  }

  // Log Team A composition
  console.log("Team A:");
  teamA.forEach((fighter) => {
    const gunType = fighter.gun ? fighter.gun.constructor.name : "No Gun";
    console.log(`- Fighter at (${fighter.x}, ${fighter.y}) with ${gunType}`);
  });

  // Log Team B composition
  console.log("Team B:");
  teamB.forEach((fighter) => {
    const gunType = fighter.gun ? fighter.gun.constructor.name : "No Gun";
    console.log(`- Fighter at (${fighter.x}, ${fighter.y}) with ${gunType}`);
  });

  // Create the "fight" button
  fightButton = createButton("fight");
  fightButton.position(width / 2 - 30, 20);
  fightButton.mousePressed(startFight);
}

function draw() {
  background(100);

  // Draw and update fighters from Team A
  teamA.forEach((fighter) => {
    fighter.draw();
    if (fighter.gun && millis() - fighter.gun.lastTargetUpdateTime > 500) {
      // Check to update target every 500ms as an example
      fighter.gun.updateTarget(teamB); // Ensure we're passing the correct opposing team
      fighter.gun.lastTargetUpdateTime = millis(); // Update the time we last updated the target
    }
    updateGun(fighter); // Assuming this function updates the shooting logic
  });

  // Draw and update fighters from Team B
  teamB.forEach((fighter) => {
    fighter.draw();
    if (fighter.gun && millis() - fighter.gun.lastTargetUpdateTime > 500) {
      // Check to update target every 500ms as an example
      fighter.gun.updateTarget(teamA); // Here's the correction, passing teamA as the opposing team
      fighter.gun.lastTargetUpdateTime = millis(); // Update the time we last updated the target
    }
    updateGun(fighter); // Assuming this function updates the shooting logic
  });

  // Handle fighting logic
  if (fighting) {
    // Log only once per draw cycle
    console.log("Attempting to shoot...");

    // Team A shooting logic with detailed logging
    teamA.forEach((fighter, index) => {
      if (fighter.gun) {
        if (fighter.gun.target) {
          console.log(
            `Team A Fighter at (${fighter.x}, ${fighter.y}) shooting at target at (${fighter.gun.target.x}, ${fighter.gun.target.y})`
          );
          fighter.gun.shoot(fighter.gun.target);
        } else {
          console.log(
            `Team A Fighter at (${fighter.x}, ${fighter.y}) has no target.`
          );
        }
      } else {
        console.log(
          `Team A Fighter at (${fighter.x}, ${fighter.y}) has no gun.`
        );
      }
    });

    // Team B shooting logic with detailed logging
    teamB.forEach((fighter, index) => {
      if (fighter.gun) {
        if (fighter.gun.target) {
          console.log(
            `Team B Fighter at (${fighter.x}, ${fighter.y}) shooting at target at (${fighter.gun.target.x}, ${fighter.gun.target.y})`
          );
          fighter.gun.shoot(fighter.gun.target);
        } else {
          console.log(
            `Team B Fighter at (${fighter.x}, ${fighter.y}) has no target.`
          );
        }
      } else {
        console.log(
          `Team B Fighter at (${fighter.x}, ${fighter.y}) has no gun.`
        );
      }
    });

    // Stop fighting after 10 seconds
    if (millis() - fightStartTime > 10000) {
      fighting = false;
    }
  }
}

function startFight() {
  if (!fighting) {
    fighting = true;
    fightStartTime = millis();
  }
}

function createRandomFighter(x, y) {
  let fighterType = floor(random(3));
  switch (fighterType) {
    case 0:
      return new BlueFighter(x, y);
    case 1:
      return new GreenFighter(x, y);
    case 2:
      return new RedFighter(x, y);
  }
}

function assignRandomGun(fighter) {
  if (random() < 0.5) {
    fighter.gun = new LaserGun(fighter);
  } else {
    fighter.gun = new AutoRifle(fighter);
  }
}

function updateGun(fighter) {
  if (fighter.gun instanceof AutoRifle) {
    fighter.gun.updatePixels();
  }
}

// Log Team A
console.log("Team A:");
teamA.forEach((fighter) => {
  const gunType = fighter.gun ? fighter.gun.constructor.name : "No Gun";
  console.log(`- Fighter at (${fighter.x}, ${fighter.y}) with ${gunType}`);
});

// Log Team B
console.log("Team B:");
teamB.forEach((fighter) => {
  const gunType = fighter.gun ? fighter.gun.constructor.name : "No Gun";
  console.log(`- Fighter at (${fighter.x}, ${fighter.y}) with ${gunType}`);
});
