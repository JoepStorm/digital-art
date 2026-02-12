// Inspired by Jason
// Iteration 1: The Mycelial Architect - Introduced species-specific logic with variable sensor ranges and color signatures
// Iteration 2: The Ethereal Weaver - Introduced species-specific repulsion and velocity variation to create cellular structures
const agentsNum = 4000;
const sensorAngle = Math.PI / 7;
const turnAngle = Math.PI / 5;
let agents;

function setup() {
  createCanvas(1600, 800);
  pixelDensity(1);
  background(0);
  agents = new Agents();
}

function draw() {
  // Use a very low alpha fade to create long-lasting ethereal trails
  background(0, 8);

  loadPixels();
  // Multiple steps per frame for smoother, faster growth
  for (let i = 4; i--; ) {
    agents.update();
  }
  updatePixels();
}

class Agent {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.dir = random(TWO_PI);
    
    // Each species now has a unique speed and sensory weight
    // Species interact differently with the environment based on their "chemical" preference
    this.species = floor(random(3));
    if (this.species === 0) {
      this.color = [255, 60, 120]; // Deep Pink
      this.sensorOffset = 18;
      this.speed = 1.2;
      this.repulse = false; // Attracted to all trails
    } else if (this.species === 1) {
      this.color = [40, 255, 200]; // Cyan-Green
      this.sensorOffset = 30;
      this.speed = 2.5;
      this.repulse = true; // Repulsed by high concentrations, creating cellular voids
    } else {
      this.color = [60, 110, 255]; // Cobalt Blue
      this.sensorOffset = 45;
      this.speed = 1.8;
      this.repulse = false;
    }
  }

  updateDirection() {
    let right = this.sense(+sensorAngle);
    let center = this.sense(0);
    let left = this.sense(-sensorAngle);

    // If repulse is true, the agent avoids areas with too much trail density
    if (this.repulse) {
      const threshold = 400; 
      if (center > threshold) center = -center;
      if (left > threshold) left = -left;
      if (right > threshold) right = -right;
    }

    if (center > left && center > right) {
      // Continue forward
    } else if (center < left && center < right) {
      this.dir += (random() < 0.5 ? 1 : -1) * turnAngle;
    } else if (left > right) {
      this.dir -= turnAngle;
    } else if (right > left) {
      this.dir += turnAngle;
    }
    
    // Subtle Brownian motion to prevent pixel-perfect locking
    this.dir += (random() - 0.5) * 0.1;
  }

  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + this.sensorOffset * cos(angle));
    let y = floor(this.y + this.sensorOffset * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;

    const index = (x + y * width) * 4;
    // Sensing the sum of the RGB channels
    return pixels[index] + pixels[index + 1] + pixels[index + 2];
  }

  updatePosition() {
    this.x += cos(this.dir) * this.speed;
    this.y += sin(this.dir) * this.speed;
    
    // Seamless screen wrapping
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const px = floor(this.x);
    const py = floor(this.y);
    const index = (px + py * width) * 4;
    
    // Deposit color into the pixel buffer
    pixels[index] = this.color[0];
    pixels[index + 1] = this.color[1];
    pixels[index + 2] = this.color[2];
    pixels[index + 3] = 255;
  }
}

class Agents {
  constructor() {
    this.agents = Array(agentsNum)
      .fill()
      .map((e) => new Agent());
  }
  update() {
    for (let a of this.agents) a.updateDirection();
    for (let a of this.agents) a.updatePosition();
  }
}
