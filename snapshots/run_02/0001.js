// Inspired by Jason
// Iteration 1: The Mycelial Architect - Introduced species-specific logic with variable sensor ranges and color signatures
const agentsNum = 4000;
const sensorAngle = Math.PI / 7;
const turnAngle = Math.PI / 5;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  pixelDensity(1);
  background(0);
  agents = new Agents();
}

function draw() {
  // Fade the background to create trails
  background(0, 5);

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
    this.dir = random(TWO_PI);
    
    // Each agent belongs to one of three species with different sensory properties
    this.species = floor(random(3));
    if (this.species === 0) {
      this.color = [255, 50, 100]; // Neon Pink
      this.sensorOffset = 15;
    } else if (this.species === 1) {
      this.color = [50, 255, 150]; // Seafoam
      this.sensorOffset = 25;
    } else {
      this.color = [50, 150, 255]; // Electric Blue
      this.sensorOffset = 40;
    }
  }

  updateDirection() {
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    // Agents are attracted to their own trail intensity (brightness)
    if (center > left && center > right) {
      // Stay on path
    } else if (center < left && center < right) {
      this.dir += (random() < 0.5 ? 1 : -1) * turnAngle;
    } else if (left > right) {
      this.dir -= turnAngle;
    } else if (right > left) {
      this.dir += turnAngle;
    }
  }

  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + this.sensorOffset * cos(angle));
    let y = floor(this.y + this.sensorOffset * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;

    const index = (x + y * width) * 4;
    // Sensing brightness of the pixel
    return pixels[index] + pixels[index + 1] + pixels[index + 2];
  }

  updatePosition() {
    this.x += cos(this.dir) * 2;
    this.y += sin(this.dir) * 2;
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const index = (floor(this.x) + floor(this.y) * width) * 4;
    // Write species color to buffer
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
    // Standard Physarum update cycle: sense then move
    for (let a of this.agents) a.updateDirection();
    for (let a of this.agents) a.updatePosition();
  }
}
