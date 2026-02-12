// Inspired by Jason
// Iteration 1: The Weaver - Reduced population and added a spontaneous spawning mechanism at the canvas center
const agentColor = new Uint8Array([255, 255, 255]);
const agentsNum = 400;
const sensorOffset = 15;
const sensorAngle = Math.PI / 8;
const turnAngle = Math.PI / 6;
let agents;

function setup() {
  createCanvas(1600, 900);
  pixelDensity(1);
  background(0);
  agents = new Agents();
}

function draw() {
  // Fade effect creates the trail memory
  background(0, 5);

  loadPixels();
  // Multiple updates per frame for smoother paths
  for (let i = 5; i--; ) {
    agents.update();
  }
  updatePixels();

  // Spontaneous generation: every few frames, reset a small batch of agents to center
  if (frameCount % 60 === 0) {
    for (let i = 0; i < 10; i++) {
        let a = agents.agents[floor(random(agents.agents.length))];
        a.x = width / 2;
        a.y = height / 2;
        a.dir = random(TWO_PI);
    }
  }
}

class Agent {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;
    this.dir = random(TWO_PI);
  }

  updateDirection() {
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    // Agents move toward higher pixel values (brightness) 
    // This allows them to follow existing trails
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
    return pixels[index];
  }

  updatePosition() {
    this.x += cos(this.dir) * 1.5;
    this.y += sin(this.dir) * 1.5;
    
    // Toroidal world wrapping
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const index = (floor(this.x) + floor(this.y) * width) * 4;
    pixels[index] = 255;
    pixels[index + 1] = 255;
    pixels[index + 2] = 255;
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
