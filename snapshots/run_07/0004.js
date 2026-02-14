// Inspired by Jason
// Iteration 1: The Weaver - Introduced a global harmonic force that pulls agents toward geometric sanity or pushes them into entropy based on their screen position.
// Iteration 2: The Cartographer - Introduced a quadrant-based symmetry where the battle between Chaos and Order creates a crystalline urban structure.
// Iteration 3: The Archon - Introduced a localized gravity well at the mouse position that shatters the rigid grid into swirling nebulae of chaos.
// Iteration 4: The Alchemist - Introduced a reactive heat-map that causes agents to mutate their speed and steering based on the density of existing ink.

const agentsNum = 6000;
const sensorOffset = 15;
const sensorAngle = Math.PI / 6;
const turnAngle = Math.PI / 4;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(245);
  agents = new Agents();
}

function draw() {
  // A slight bleed effect to create texture between the high-contrast lines
  background(255, 3);

  loadPixels();
  for (let i = 5; i--; ) {
    agents.update();
  }
  updatePixels();
}

class Agent {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.dir = random([0, HALF_PI, PI, TWO_PI - HALF_PI]);
    this.speed = 2.2;
  }

  updateDirection() {
    // Chaos vs Order:
    // Interaction with the 'Archon' (the Mouse): 
    let distToMouse = dist(this.x, this.y, mouseX, mouseY);
    let chaosRadius = 250;
    
    // Read local "density" of the simulation to influence behavior
    let localDensity = this.sense(0) / 255.0; // 0 is ink (chaos/order structure), 1 is pure background
    
    if (distToMouse < chaosRadius) {
      let angleToMouse = atan2(mouseY - this.y, mouseX - this.x);
      // High speed in the vortex for chaotic energy
      this.speed = 4.0;
      this.dir = lerp(this.dir, angleToMouse + HALF_PI, 0.15 * (1 - distToMouse/chaosRadius));
    } else {
      let dx = abs(this.x - width/2);
      let dy = abs(this.y - height/2);
      let gridStrength = (sin(dx * 0.02) * cos(dy * 0.02));
      
      // Alchemist Mutation: Inside thick ink (low localDensity), agents move slower and turn sharper
      this.speed = lerp(1.2, 3.2, localDensity);
      let dynamicTurn = lerp(turnAngle * 1.5, turnAngle * 0.5, localDensity);
      
      if (gridStrength > 0.6) {
        let targetDir = round(this.dir / HALF_PI) * HALF_PI;
        this.dir = lerp(this.dir, targetDir, 0.2);
      } else {
        const right = this.sense(+sensorAngle);
        const center = this.sense(0);
        const left = this.sense(-sensorAngle);

        if (center < left && center < right) {
            // Stay path
        } else if (left < right) {
            this.dir -= dynamicTurn;
        } else if (right < left) {
            this.dir += dynamicTurn;
        } else {
            this.dir += (random() - 0.5) * 0.1;
        }
      }
    }
  }

  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + sensorOffset * cos(angle));
    let y = floor(this.y + sensorOffset * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;

    const index = (x + y * width) * 4;
    return pixels[index]; 
  }

  updatePosition() {
    this.x += cos(this.dir) * this.speed;
    this.y += sin(this.dir) * this.speed;
    
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const px = floor(this.x);
    const py = floor(this.y);
    const i = (px + py * width) * 4;
    
    let distToMouse = dist(this.x, this.y, mouseX, mouseY);
    let shift = distToMouse < 200 ? 30 : 0;
    
    // The ink now reacts: in high order/grid zones, it leaves a cleaner "acidic" trace
    pixels[i] = max(0, pixels[i] - 60);
    pixels[i+1] = max(10, pixels[i+1] - 55);
    pixels[i+2] = max(20 + shift, pixels[i+2] - (50 - (shift * 1.5)));
  }
}

class Agents {
  constructor() {
    this.agents = Array(agentsNum)
      .fill()
      .map(() => new Agent());
  }
  update() {
    this.agents.forEach((e) => e.updateDirection());
    this.agents.forEach((e) => e.updatePosition());
  }
}
