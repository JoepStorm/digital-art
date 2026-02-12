// Inspired by Jason
// Iteration 1: The Weaver - Reduced population and added a spontaneous spawning mechanism at the canvas center
// Iteration 2: The Chromatic Alchemist - Added color-shifting trails that evolve based on agent position
// Iteration 3: The Ghost Weaver - Introduced variable speed and inertia to agent movement for more fluid, flowing trails
// Iteration 4: The Mycelial Architect - Introduced agent branching to create dense geometric webs
// Iteration 5: The Ethereal Weaver - Introduced gravitational attraction towards persistent center-points to form cellular nodes
// Iteration 6: The Pulsing Core - Added a rhythmic harmonic oscillation to sensor distance to create breathing fractal structures
const agentsNum = 400;
const sensorAngle = Math.PI / 7;
const turnAngle = Math.PI / 9;
let agents;

function setup() {
  createCanvas(1600, 800);
  pixelDensity(1);
  background(0);
  colorMode(HSB, 255);
  agents = new Agents();
}

function draw() {
  background(0, 6);

  loadPixels();
  for (let i = 4; i--; ) {
    agents.update();
  }
  updatePixels();

  if (frameCount % 180 === 0) {
    let rx = random(width);
    let ry = random(height);
    for (let i = 0; i < 15; i++) {
        let a = agents.agents[floor(random(agents.agents.length))];
        a.x = rx;
        a.y = ry;
        a.dir = random(TWO_PI);
    }
  }
}

class Agent {
  constructor(x, y, dir) {
    this.x = x || random(width);
    this.y = y || random(height);
    this.dir = dir || random(TWO_PI);
    this.speed = random(1.2, 2.8);
  }

  updateDirection() {
    // Dynamic sensing: sensor distance pulses over time to create expanding and contracting web patterns
    const dynamicSensorOffset = 15 + sin(frameCount * 0.02) * 12;
    
    const right = this.sense(+sensorAngle, dynamicSensorOffset);
    const center = this.sense(0, dynamicSensorOffset);
    const left = this.sense(-sensorAngle, dynamicSensorOffset);

    if (center > left && center > right) {
        // Continue forward
    } else if (center < left && center < right) {
        this.dir += (random() < 0.5 ? 1 : -1) * turnAngle;
    } else if (left > right) {
        this.dir -= turnAngle;
    } else if (right > left) {
        this.dir += turnAngle;
    }

    let angleToCenter = atan2(height / 2 - this.y, width / 2 - this.x);
    let diff = angleToCenter - this.dir;
    while (diff < -PI) diff += TWO_PI;
    while (diff > PI) diff -= TWO_PI;
    this.dir += diff * 0.02; 
  }

  sense(dirOffset, dist) {
    const angle = this.dir + dirOffset;
    let sx = floor(this.x + dist * cos(angle));
    let sy = floor(this.y + dist * sin(angle));
    
    sx = (sx + width) % width;
    sy = (sy + height) % height;

    const index = (sx + sy * width) * 4;
    return pixels[index];
  }

  updatePosition() {
    this.x += cos(this.dir) * this.speed;
    this.y += sin(this.dir) * this.speed;
    
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const ix = floor(this.x);
    const iy = floor(this.y);
    const index = (ix + iy * width) * 4;
    
    let h = (this.x / width * 100 + this.y / height * 100 + frameCount * 0.15) % 255;
    let s = 200;
    let b = 255;
    
    let c = color(h, s, b);
    
    pixels[index] = red(c);
    pixels[index + 1] = green(c);
    pixels[index + 2] = blue(c);
    pixels[index + 3] = 255;

    if (agents.agents.length < 1500 && random() < 0.0012) {
        agents.agents.push(new Agent(this.x, this.y, this.dir + random(-0.6, 0.6)));
    }
  }
}

class Agents {
  constructor() {
    this.agents = Array(agentsNum).fill().map(() => new Agent());
  }
  update() {
    for (let i = 0; i < this.agents.length; i++) {
        this.agents[i].updateDirection();
    }
    for (let i = 0; i < this.agents.length; i++) {
        this.agents[i].updatePosition();
    }
    
    if (this.agents.length > 1200) {
        this.agents.splice(0, 8);
    }
  }
}
