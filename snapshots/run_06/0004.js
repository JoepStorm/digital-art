// Inspired by Jason
// Iteration 1: The Monochromist - Replaced blue trails with a ghostly white fade and increased agent density for a delicate charcoal-on-paper aesthetic.
// Iteration 2: The Cartographer - Introduced a subtle canvas texture and limited agent movement to create delicate, map-like contour lines.
// Iteration 3: The Minimalist - Introduced void-repulsion and increased transparency to create delicate, floating geometric clouds with vast negative space.
// Iteration 4: The Linearist - Constrained sensors to strictly forward-looking long vectors, forcing agents into extremely long, parallel hair-like strokes.
const agentColor = new Uint8Array([30, 30, 30]);
const agentsNum = 1200; 
const sensorOffset = 180; // Massive sensor offset creates long-distance interaction and straighter paths
const sensorAngle = Math.PI / 64; // Tight angle for near-parallel sensor detection
const turnAngle = Math.PI / 120; // Very small turns for graceful, sweeping trajectories
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(250); 
  agents = new Agents();
}

function draw() {
  // Maintaining a very subtle history to allow for delicate, layered hatching
  background(250, 0.5);

  loadPixels();
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

    const weights = [left, center, right];
    const target = weights.indexOf(max(...weights));
    
    // Minimal influence per frame keeps the lines long and fluid
    this.dir += (target - 1) * turnAngle;
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
    const speed = 0.8;
    this.x += cos(this.dir) * speed;
    this.y += sin(this.dir) * speed;
    
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const index = (floor(this.x) + floor(this.y) * width) * 4;
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
