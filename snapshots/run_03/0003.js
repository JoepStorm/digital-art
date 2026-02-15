// Inspired by Jason
// Iteration 1: The Weaver - Reduced population and added a spontaneous spawning mechanism at the canvas center
// Iteration 2: The Chromatic Alchemist - Added color-shifting trails that evolve based on agent position
// Iteration 3: The Ghost Weaver - Introduced variable speed and inertia to agent movement for more fluid, flowing trails
const agentsNum = 400;
const sensorOffset = 20;
const sensorAngle = Math.PI / 8;
const turnAngle = Math.PI / 10;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  pixelDensity(1);
  background(0);
  colorMode(HSB, 255);
  agents = new Agents();
}

function draw() {
  // Fade trail slightly faster for sharper definition of new paths
  background(0, 10);

  loadPixels();
  // Multiple updates per frame for smoother simulation
  for (let i = 4; i--; ) {
    agents.update();
  }
  updatePixels();

  // Occasional burst of energy from the center to maintain complexity
  if (frameCount % 100 === 0) {
    for (let i = 0; i < 20; i++) {
        let a = agents.agents[floor(random(agents.agents.length))];
        a.x = width / 2;
        a.y = height / 2;
        a.dir = random(TWO_PI);
        a.speed = random(1.5, 3.5); // Reset individual agent speed
    }
  }
}

class Agent {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.dir = random(TWO_PI);
    this.speed = random(1, 3);
  }

  updateDirection() {
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    // Physarum chemical logic: follow the strongest path
    if (center > left && center > right) {
        // Stay the course
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
    // Look ahead to find existing trails
    let sx = floor(this.x + sensorOffset * cos(angle));
    let sy = floor(this.y + sensorOffset * sin(angle));
    
    // Wrap sensor around edges
    sx = (sx + width) % width;
    sy = (sy + height) % height;

    const index = (sx + sy * width) * 4;
    // Sense intensity using the red channel
    return pixels[index];
  }

  updatePosition() {
    // Smoother movement using pre-calculated speed
    this.x += cos(this.dir) * this.speed;
    this.y += sin(this.dir) * this.speed;
    
    // Screen wrapping logic
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const ix = floor(this.x);
    const iy = floor(this.y);
    const index = (ix + iy * width) * 4;
    
    // Color determined by spatial mapping and time
    let h = (this.x / width * 100 + this.y / height * 100 + frameCount * 0.1) % 255;
    let s = 180;
    let b = 255;
    
    let c = color(h, s, b);
    
    // Deposit chemical trail into pixel buffer
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
