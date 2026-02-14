// Inspired by Jason
// Iteration 1: The Weaver - Introduced a global harmonic force that pulls agents toward geometric sanity or pushes them into entropy based on their screen position.
// Iteration 2: The Cartographer - Introduced a quadrant-based symmetry where the battle between Chaos and Order creates a crystalline urban structure.

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
  }

  updateDirection() {
    // Chaos vs Order:
    // We use a Manhattan-distance based field to create a "grid of influence"
    // Near the major cross-axes, agents are forced into rigid 90-degree movement (The Grid)
    // In the open cells, they follow the organic sensor logic (The Slime)
    let dx = abs(this.x - width/2);
    let dy = abs(this.y - height/2);
    let gridStrength = (sin(dx * 0.02) * cos(dy * 0.02));
    
    if (gridStrength > 0.6) {
      // High Order: Force cardinal directions
      let targetDir = round(this.dir / HALF_PI) * HALF_PI;
      this.dir = lerp(this.dir, targetDir, 0.2);
    } else {
      // Chaos: Slime mold logic seeking darker trails (lower pixel values)
      const right = this.sense(+sensorAngle);
      const center = this.sense(0);
      const left = this.sense(-sensorAngle);

      if (center < left && center < right) {
          // Stay path
      } else if (left < right) {
          this.dir -= turnAngle;
      } else if (right < left) {
          this.dir += turnAngle;
      } else {
          this.dir += (random() - 0.5) * 0.1;
      }
    }
  }

  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + sensorOffset * cos(angle));
    let y = floor(this.y + sensorOffset * sin(angle));
    // Wrap around screen
    x = (x + width) % width;
    y = (y + height) % height;

    const index = (x + y * width) * 4;
    return pixels[index]; // Sense brightness (red channel)
  }

  updatePosition() {
    this.x += cos(this.dir) * 2;
    this.y += sin(this.dir) * 2;
    
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const px = floor(this.x);
    const py = floor(this.y);
    const i = (px + py * width) * 4;
    
    // Deposit biological "ink" - stronger deposition creates sharper contrast
    // We add a slight color tint based on vertical position
    pixels[i] = max(0, pixels[i] - 60);
    pixels[i+1] = max(10, pixels[i+1] - 55);
    pixels[i+2] = max(20, pixels[i+2] - 50);
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
