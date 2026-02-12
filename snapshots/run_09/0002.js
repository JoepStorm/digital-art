// Inspired by Jason
// Iteration 1: The Weaver - Introduced polarized populations (Predators vs Prey) with distinct behaviors and trail colors.
// Iteration 2: The Weaver - Introduced dynamic population oscillations by allowing predators to 'consume' prey and spawn new hunters, while prey regenerate over time.
const agentsNum = 4000;
const sensorOffset = 18;
const sensorAngle = Math.PI / 4;
const turnAngle = Math.PI / 10;
let agents;

function setup() {
  createCanvas(1600, 900);
  pixelDensity(1);
  background(0);
  agents = new Agents();
}

function draw() {
  // Fade the background - Prey leave faint trails, Predators leave sharper ones
  background(0, 8);

  loadPixels();
  // Multiple updates per frame for physical flow and population checks
  for (let i = 0; i < 3; i++) {
    agents.update();
  }
  updatePixels();
}

class Agent {
  constructor(type, x, y) {
    this.x = x || random(width);
    this.y = y || random(height);
    this.dir = random(TWO_PI);
    this.type = type; // 0 for Prey, 1 for Predator
    this.isDead = false;
    // Distinct colors: Prey are cyan, Predators are fiery orange
    this.color = this.type === 0 ? [0, 180, 255] : [255, 80, 20];
  }

  updateDirection() {
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    if (this.type === 1) {
      // Predator: turn towards the highest value (prey trails)
      if (center > left && center > right) {
        // momentum
      } else if (center < left && center < right) {
        this.dir += (random() < 0.5 ? 1 : -1) * turnAngle;
      } else if (left > right) {
        this.dir -= turnAngle;
      } else if (right > left) {
        this.dir += turnAngle;
      }
    } else {
      // Prey: turn away from the brightest light (fleeing predators/crowds)
      if (left > right) {
        this.dir += turnAngle;
      } else if (right > left) {
        this.dir -= turnAngle;
      }
    }
    
    this.dir += (random() - 0.5) * 0.15;
  }

  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let x = (this.x + sensorOffset * cos(angle) + width) % width;
    let y = (this.y + sensorOffset * sin(angle) + height) % height;
    const index = (floor(x) + floor(y) * width) * 4;
    // Return blue channel for prey sensing, red channel for predator sensing
    // This makes populations selectively sensitive to one another
    return pixels[index] + pixels[index + 1] + pixels[index + 2];
  }

  updatePosition() {
    const speed = this.type === 1 ? 1.5 : 1.1;
    this.x = (this.x + cos(this.dir) * speed + width) % width;
    this.y = (this.y + sin(this.dir) * speed + height) % height;

    const ix = floor(this.x);
    const iy = floor(this.y);
    const index = (ix + iy * width) * 4;

    // Population interactions: Predator consumes Prey
    if (this.type === 1) {
      // If predator touches high cyan concentration (prey), it consumes it effectively
      if (pixels[index + 2] > 200) {
        this.spawn = true; // Signal to hunt/reproduce
      }
    } else {
      // If prey touches high red concentration (predator), it dies
      if (pixels[index] > 180) {
        this.isDead = true;
      }
    }

    pixels[index] = this.color[0];
    pixels[index + 1] = this.color[1];
    pixels[index + 2] = this.color[2];
    pixels[index + 3] = 255;
  }
}

class Agents {
  constructor() {
    this.list = [];
    for (let i = 0; i < agentsNum; i++) {
        this.list.push(new Agent(random() > 0.9 ? 1 : 0));
    }
  }
  
  update() {
    for (let i = this.list.length - 1; i >= 0; i--) {
      let a = this.list[i];
      a.updateDirection();
      a.updatePosition();
      
      // Handle population dynamics: predation & reproduction
      if (a.isDead) {
        this.list.splice(i, 1);
      } else if (a.spawn && this.list.length < agentsNum * 1.5) {
        a.spawn = false;
        this.list.push(new Agent(1, a.x, a.y)); // New predator
      }
    }
    
    // Constant slow regeneration of prey to prevent extinction
    if (this.list.length < agentsNum) {
      this.list.push(new Agent(0));
    }
    
    // Predator starvation: if too many predators, some die off
    const predatorCount = this.list.filter(a => a.type === 1).length;
    if (predatorCount > agentsNum * 0.4) {
      const pIdx = this.list.findIndex(a => a.type === 1);
      if (pIdx > -1) this.list.splice(pIdx, 1);
    }
  }
}
