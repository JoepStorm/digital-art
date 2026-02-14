// Inspired by Jason
// Iteration 1: The Weaver - Reduced population and added a spontaneous spawning mechanism at the canvas center
// Iteration 2: The Chromatic Alchemist - Added color-shifting trails that evolve based on agent position
const agentsNum = 400;
const sensorOffset = 15;
const sensorAngle = Math.PI / 8;
const turnAngle = Math.PI / 6;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(0);
  colorMode(HSB, 255);
  agents = new Agents();
}

function draw() {
  // Drifting trails: slightly higher opacity for firmer color structures
  background(0, 8);

  loadPixels();
  for (let i = 5; i--; ) {
    agents.update();
  }
  updatePixels();

  // Pulse effect: spontaneous bursts from the center
  if (frameCount % 60 === 0) {
    for (let i = 0; i < 15; i++) {
        let a = agents.agents[floor(random(agents.agents.length))];
        a.x = width / 2;
        a.y = height / 2;
        a.dir = random(TWO_PI);
    }
  }
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

    // Standard Physarum behavior: steer towards the highest signal
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

    // Use Red channel for sensing intensity
    const index = (x + y * width) * 4;
    return pixels[index];
  }

  updatePosition() {
    this.x += cos(this.dir) * 2;
    this.y += sin(this.dir) * 2;
    
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const index = (floor(this.x) + floor(this.y) * width) * 4;
    
    // Mapping position to hue for a shifting chromatic landscape
    let h = (this.x / width * 127 + this.y / height * 127 + frameCount * 0.2) % 255;
    let c = color(h, 180, 255);
    
    pixels[index] = red(c);
    pixels[index + 1] = green(c);
    pixels[index + 2] = blue(c);
    pixels[index + 3] = 255;
  }
}

class Agents {
  constructor() {
    this.agents = Array(agentsNum).fill().map(() => new Agent());
  }
  update() {
    this.agents.forEach((e) => e.updateDirection());
    this.agents.forEach((e) => e.updatePosition());
  }
}
