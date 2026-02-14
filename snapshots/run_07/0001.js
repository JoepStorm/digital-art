// Inspired by Jason
// Iteration 1: The Weaver - Introduced a global harmonic force that pulls agents toward geometric sanity or pushes them into entropy based on their screen position.

const agentColor = new Uint8Array([0, 0, 0]);
const agentsNum = 4000;
const sensorOffset = 10;
const sensorAngle = Math.PI / 7;
const turnAngle = Math.PI / 5;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(255);
  agents = new Agents();
}

function buttonPressed() {
  agents = new Agents();
}

function draw() {
  // Persistence of memory: a very light fade allows trails to build up over time
  background(255, 5);

  loadPixels();
  for (let i = 10; i--; ) {
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
    // Chaos vs Order Logic:
    // Centered agents are influenced by a strict grid-like gravity (Order)
    // Peripheral agents succumb to the sensor-based slime mold logic (Chaos)
    let distanceFromCenter = dist(this.x, this.y, width/2, height/2);
    let orderInfluence = map(distanceFromCenter, 0, width/2, 1, 0, true);
    
    if (random() < orderInfluence) {
      // Order: Agents align to 90-degree axes
      let targetDir = round(this.dir / (HALF_PI)) * HALF_PI;
      this.dir = lerp(this.dir, targetDir, 0.1);
    } else {
      // Chaos: Standard Physarum sensing behavior
      const right = this.sense(+sensorAngle);
      const center = this.sense(0);
      const left = this.sense(-sensorAngle);

      const threeWays = [left, center - 1 , right];
      const minIndex = threeWays.indexOf(min(...threeWays));
      this.dir += turnAngle * (minIndex - 1);
    }
    
    // Slight jitter to prevent total stagnation
    this.dir += random(-0.02, 0.02);
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
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const index = floor(this.x) + floor(this.y) * width;
    // Drawing with a slight transparency simulation using the pixel buffer
    let i = index * 4;
    pixels[i] = max(0, pixels[i] - 50);
    pixels[i+1] = max(0, pixels[i+1] - 50);
    pixels[i+2] = max(0, pixels[i+2] - 50);
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
