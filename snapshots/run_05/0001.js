// Inspired by Jason
// Iteration 1: The Weaver - Introduced agent aging and dynamic color shifting to simulate a lifecycle
const agentColor = new Uint8Array([0, 0, 0]);
const agentsNum = 4000;
const sensorOffset = 15;
const sensorAngle = Math.PI / 8;
const turnAngle = Math.PI / 6;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(0);
  agents = new Agents();
}

function buttonPressed() {
  agents = new Agents();
}

function draw() {
  // Use a very slight fade to allow trails to persist and blend
  background(0, 5);

  loadPixels();
  for (let i = 5; i--; ) {
    agents.update();
  }
  updatePixels();
}

class Agent {
  constructor() {
    this.init();
  }

  init() {
    this.x = width / 2;
    this.y = height / 2;
    this.dir = random(TWO_PI);
    // Life property manages the agent's cycle of influence on the canvas
    this.life = random(100, 500);
    this.maxLife = this.life;
  }

  updateDirection() {
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    if (center > left && center > right) {
      // Continue straight
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
    let x = floor(this.x + sensorOffset * cos(angle));
    let y = floor(this.y + sensorOffset * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;

    const index = (x + y * width) * 4;
    // Sensing the brightness in the red channel
    return pixels[index];
  }

  updatePosition() {
    this.x += cos(this.dir) * 1.5;
    this.y += sin(this.dir) * 1.5;
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    this.life -= 1;
    if (this.life <= 0) {
      this.init(); // Rebirth at center
    }

    const index = (floor(this.x) + floor(this.y) * width) * 4;
    
    // Color changes based on remaining life: white to cyan to deep blue
    const lifeRatio = this.life / this.maxLife;
    pixels[index] = 50 * lifeRatio;           // R
    pixels[index + 1] = 150 * lifeRatio;      // G
    pixels[index + 2] = 255;                  // B
    pixels[index + 3] = 255;                  // A
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
