// Inspired by Jason
// Iteration 1: The Weaver - Introduced agent aging and dynamic color shifting to simulate a lifecycle
// Iteration 2: The Necromancer - Particles now scavenge and gain speed from the fading trails of their ancestors
const agentColor = new Uint8Array([0, 0, 0]);
const agentsNum = 4000;
const sensorOffset = 18;
const sensorAngle = Math.PI / 4;
const turnAngle = Math.PI / 8;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  pixelDensity(1);
  background(0);
  agents = new Agents();
}

function buttonPressed() {
  agents = new Agents();
}

function draw() {
  // Persistence of trails. Increasing the decay slightly to accentuate movement.
  background(0, 12);

  loadPixels();
  for (let i = 4; i--; ) {
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
    this.life = random(100, 600);
    this.maxLife = this.life;
    this.speed = 1.0;
  }

  updateDirection() {
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    // If sensors pick up high activity, the agent speeds up (scavenging energy from trails)
    this.speed = map(center + left + right, 0, 765, 1.2, 3.5);

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
    // Sensing the blue channel for communication
    return pixels[index + 2];
  }

  updatePosition() {
    this.x += cos(this.dir) * this.speed;
    this.y += sin(this.dir) * this.speed;
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    this.life -= 1;
    if (this.life <= 0) {
      this.init(); // Rebirth at center
    }

    const index = (floor(this.x) + floor(this.y) * width) * 4;
    
    // Shift color spectrum from Electric Blue to Ghostly Violet as they age
    const lifeRatio = this.life / this.maxLife;
    pixels[index] = 100 * (1 - lifeRatio);    // Increase Red as they age (violet shift)
    pixels[index + 1] = 180 * lifeRatio;      // Green fades out
    pixels[index + 2] = 255;                  // Consistent High Blue
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
    this.agents.forEach((e) => e.updateDirection());
    this.agents.forEach((e) => e.updatePosition());
  }
}
