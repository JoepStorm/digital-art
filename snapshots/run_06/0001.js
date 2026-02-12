// Inspired by Jason
// Iteration 1: The Monochromist - Replaced blue trails with a ghostly white fade and increased agent density for a delicate charcoal-on-paper aesthetic.
const agentColor = new Uint8Array([0, 0, 0]);
const agentsNum = 8000;
const sensorOffset = 15;
const sensorAngle = Math.PI / 8;
const turnAngle = Math.PI / 6;
let agents;

function setup() {
  createCanvas(1600, 900);
  pixelDensity(1);
  background(255);
  agents = new Agents();
}

function buttonPressed() {
  agents = new Agents();
}

function draw() {
  // A very high alpha background creates a lingering, minimalist ghosting effect
  background(255, 5);

  loadPixels();
  for (let i = 5; i--; ) {
    agents.update();
  }
  updatePixels();
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

    // Agents are attracted to previous paths, creating branching structures
    const threeWays = [left, center - 1 , right];
    const minIndex = threeWays.indexOf(min(...threeWays));
    this.dir += turnAngle * (minIndex - 1);
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
    this.x += cos(this.dir);
    this.y += sin(this.dir);
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const index = floor(this.x) + floor(this.y) * width;
    pixels.set(agentColor, index * 4);
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
