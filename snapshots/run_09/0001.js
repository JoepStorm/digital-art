// Inspired by Jason
// Iteration 1: The Weaver - Introduced polarized populations (Predators vs Prey) with distinct behaviors and trail colors.
const agentsNum = 4000;
const sensorOffset = 15;
const sensorAngle = Math.PI / 6;
const turnAngle = Math.PI / 8;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(0);
  agents = new Agents();
}

function draw() {
  // Fade the background to create trails
  background(0, 5);

  loadPixels();
  // Multiple updates per frame for smoother physical flow
  for (let i = 0; i < 3; i++) {
    agents.update();
  }
  updatePixels();
}

class Agent {
  constructor(type) {
    this.x = random(width);
    this.y = random(height);
    this.dir = random(TWO_PI);
    this.type = type; // 0 for Prey, 1 for Predator
    // Distinct colors: Prey are cyan, Predators are fiery orange
    this.color = this.type === 0 ? [0, 150, 200] : [255, 100, 0];
  }

  updateDirection() {
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    // Logic shift: Predators are attracted to brightness (prey trails).
    // Prey are repelled by high brightness (sensing predators/clusters).
    if (this.type === 1) {
      // Predator: turn towards the highest value (center of trail or prey)
      if (center > left && center > right) {
        // stay same
      } else if (center < left && center < right) {
        this.dir += (random() < 0.5 ? 1 : -1) * turnAngle;
      } else if (left > right) {
        this.dir -= turnAngle;
      } else if (right > left) {
        this.dir += turnAngle;
      }
    } else {
      // Prey: turn away from the highest concentration to flee
      if (left > right) {
        this.dir += turnAngle;
      } else if (right > left) {
        this.dir -= turnAngle;
      }
    }
    
    // Slight brownian motion for organic feel
    this.dir += (random() - 0.5) * 0.1;
  }

  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + sensorOffset * cos(angle));
    let y = floor(this.y + sensorOffset * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;

    const index = (x + y * width) * 4;
    // Return average brightness of the pixel sensed
    return (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3;
  }

  updatePosition() {
    // Predators move slightly faster
    const speed = this.type === 1 ? 1.2 : 0.9;
    this.x += cos(this.dir) * speed;
    this.y += sin(this.dir) * speed;
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const index = (floor(this.x) + floor(this.y) * width) * 4;
    pixels[index] = this.color[0];
    pixels[index + 1] = this.color[1];
    pixels[index + 2] = this.color[2];
    pixels[index + 3] = 255;
  }
}

class Agents {
  constructor() {
    this.agents = [];
    for (let i = 0; i < agentsNum; i++) {
        // Split population: 80% prey, 20% predators
        this.agents.push(new Agent(random() > 0.8 ? 1 : 0));
    }
  }
  update() {
    this.agents.forEach((e) => e.updateDirection());
    this.agents.forEach((e) => e.updatePosition());
  }
}
