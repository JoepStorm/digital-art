// Inspired by Jason
// Iteration 1: The Weaver - Reduced population and added a spontaneous spawning mechanism at the canvas center
// Iteration 2: The Chromatic Alchemist - Added color-shifting trails that evolve based on agent position
// Iteration 3: The Ghost Weaver - Introduced variable speed and inertia to agent movement for more fluid, flowing trails
// Iteration 4: The Mycelial Architect - Introduced agent branching to create dense geometric webs
const agentsNum = 400;
const sensorOffset = 20;
const sensorAngle = Math.PI / 8;
const turnAngle = Math.PI / 10;
let agents;

function setup() {
  createCanvas(1600, 800);
  pixelDensity(1);
  background(0);
  colorMode(HSB, 255);
  agents = new Agents();
}

function draw() {
  // Semi-transparent background creates the "motion blur" or "trail" effect
  background(0, 10);

  loadPixels();
  // Multiple cycles per frame increases simulation speed and trail density
  for (let i = 4; i--; ) {
    agents.update();
  }
  updatePixels();

  // Pulse effect: agents at the heart of the system occasionally teleport to sustain flow
  if (frameCount % 100 === 0) {
    for (let i = 0; i < 20; i++) {
        let a = agents.agents[floor(random(agents.agents.length))];
        a.x = width / 2;
        a.y = height / 2;
        a.dir = random(TWO_PI);
        a.speed = random(1.5, 3.5);
    }
  }
}

class Agent {
  constructor(x, y, dir) {
    this.x = x || random(width);
    this.y = y || random(height);
    this.dir = dir || random(TWO_PI);
    this.speed = random(1, 3);
  }

  updateDirection() {
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    // Standard Physarum behavior: steer towards higher trail concentration
    if (center > left && center > right) {
        // Continue forward
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
    let sx = floor(this.x + sensorOffset * cos(angle));
    let sy = floor(this.y + sensorOffset * sin(angle));
    
    // Toroidal space wrapping for sensors
    sx = (sx + width) % width;
    sy = (sy + height) % height;

    const index = (sx + sy * width) * 4;
    // We sense the brightness of existing trails (stored in RGB channels)
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
    
    // Dynamic color shifting based on position and time
    let h = (this.x / width * 100 + this.y / height * 100 + frameCount * 0.1) % 255;
    let s = 180;
    let b = 255;
    
    let c = color(h, s, b);
    
    // Write values directly to the pixel buffer for performance
    pixels[index] = red(c);
    pixels[index + 1] = green(c);
    pixels[index + 2] = blue(c);
    pixels[index + 3] = 255;

    // MYCELIAL BRANCHING: Small chance to spawn a fork in the path if sensing a strong trail
    if (agents.agents.length < 1200 && random() < 0.001) {
        agents.agents.push(new Agent(this.x, this.y, this.dir + random(-0.5, 0.5)));
    }
  }
}

class Agents {
  constructor() {
    this.agents = Array(agentsNum).fill().map(() => new Agent());
  }
  update() {
    // Separate loops prevent agents from sensing their own immediate movement within one step
    for (let i = 0; i < this.agents.length; i++) {
        this.agents[i].updateDirection();
    }
    for (let i = 0; i < this.agents.length; i++) {
        this.agents[i].updatePosition();
    }
    
    // Population control: cull oldest agents when system gets too crowded
    if (this.agents.length > 1000) {
        this.agents.splice(0, 5);
    }
  }
}
