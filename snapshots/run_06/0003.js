// Inspired by Jason
// Iteration 1: The Monochromist - Replaced blue trails with a ghostly white fade and increased agent density for a delicate charcoal-on-paper aesthetic.
// Iteration 2: The Cartographer - Introduced a subtle canvas texture and limited agent movement to create delicate, map-like contour lines.
// Iteration 3: The Minimalist - Introduced void-repulsion and increased transparency to create delicate, floating geometric clouds with vast negative space.
const agentColor = new Uint8Array([30, 30, 30]);
const agentsNum = 1200; // Drastically reduced for extreme minimalism
const sensorOffset = 45; // Further increased to push agents into wider, more rhythmic gestures
const sensorAngle = Math.PI / 6;
const turnAngle = Math.PI / 12;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  pixelDensity(1);
  background(250); // Nearly pure white for a high-key minimalist canvas
  agents = new Agents();
}

function draw() {
  // Very low opacity fade keeps the history of the movement as faint, silver-gray memories
  background(250, 1);

  loadPixels();
  // Single step per frame to slow down the evolution and emphasize the stillness of the composition
  agents.update();
  updatePixels();
}

class Agent {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.dir = random(TWO_PI);
  }

  updateDirection() {
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    // Agents now gravitate towards the brightest white space, 
    // effectively "sculpting" the emptiness rather than filling it.
    const weights = [left, center, right];
    const target = weights.indexOf(max(...weights));
    
    // Subtle randomness prevents perfect circular trapping
    this.dir += (target - 1) * turnAngle + random(-0.02, 0.02);
  }

  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + sensorOffset * cos(angle));
    let y = floor(this.y + sensorOffset * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;

    const index = (x + y * width) * 4;
    return pixels[index]; // Sensing individual pixel brightness (R channel)
  }

  updatePosition() {
    // Variable speed based on "comfort" (proximity to others) adds organic jitter
    const speed = 0.5;
    this.x += cos(this.dir) * speed;
    this.y += sin(this.dir) * speed;
    
    // Toroidal wrap
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const index = (floor(this.x) + floor(this.y) * width) * 4;
    // Drawing only the point, no thick strokes
    pixels[index] = agentColor[0];
    pixels[index + 1] = agentColor[1];
    pixels[index + 2] = agentColor[2];
  }
}

class Agents {
  constructor() {
    this.agents = Array(agentsNum)
      .fill()
      .map((e) => new Agent());
  }
  update() {
    this.agents.forEach((e) => e.updateDirection());
    this.agents.forEach((e) => e.updatePosition());
  }
}
