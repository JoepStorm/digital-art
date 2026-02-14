// Inspired by Jason
// Iteration 1: The Weaver - Introduced polarized populations (Predators vs Prey) with distinct behaviors and trail colors.
// Iteration 2: The Weaver - Introduced dynamic population oscillations by allowing predators to 'consume' prey and spawn new hunters, while prey regenerate over time.
// Iteration 3: The Weaver - Introduced the 'Pulse', a rhythmic acceleration and expansion of sensor range to simulate breathing patterns in the collective.
// Iteration 4: The Weaver - Introduced the 'Turing Membrane', causing predator and prey trails to diffuse into Voronoi-like cellular structures while they interact.
const agentsNum = 4000;
let sensorOffset = 18;
const sensorAngle = Math.PI / 4;
const turnAngle = Math.PI / 10;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(0);
  agents = new Agents();
}

function draw() {
  // Oscillate the sensor range over time to create a rhythmic "breathing" effect
  sensorOffset = 15 + sin(frameCount * 0.02) * 10;
  
  // Apply a subtle box blur/diffusion effect to create cellular "membranes" from trails
  // This simulates a Turing-like reaction-diffusion interaction on the canvas
  filter(BLUR, 0.45);
  
  // Fade the background - Prey leave faint trails, Predators leave sharper ones
  background(0, 12);

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
      // Predator: turn towards the highest value (chasing trails)
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
      // Prey: flee from high intensity areas (avoiding predators)
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
    // Sensivity to trail luminance
    return pixels[index] + pixels[index + 1] + pixels[index + 2];
  }

  updatePosition() {
    // Speed also pulses with the sensor range for a lunging effect
    const speedBoost = 1.0 + (sin(frameCount * 0.02) * 0.4);
    const speed = (this.type === 1 ? 1.8 : 1.3) * speedBoost;
    this.x = (this.x + cos(this.dir) * speed + width) % width;
    this.y = (this.y + sin(this.dir) * speed + height) % height;

    const ix = floor(this.x);
    const iy = floor(this.y);
    const index = (ix + iy * width) * 4;

    // Interaction logic
    if (this.type === 1) {
      // Predators check if they are near prey (cyan channel)
      if (pixels[index + 2] > 180) {
        this.spawn = true; 
      }
    } else {
      // Prey check if they are near predators (red channel)
      if (pixels[index] > 160) {
        this.isDead = true;
      }
    }

    // Paint the agent to the buffer
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
        this.list.push(new Agent(random() > 0.92 ? 1 : 0));
    }
  }
  
  update() {
    for (let i = this.list.length - 1; i >= 0; i--) {
      let a = this.list[i];
      a.updateDirection();
      a.updatePosition();
      
      // Handle population dynamics
      if (a.isDead) {
        this.list.splice(i, 1);
      } else if (a.spawn && this.list.length < agentsNum * 1.8) {
        a.spawn = false;
        // Reproduce predator at current location
        this.list.push(new Agent(1, a.x, a.y));
      }
    }
    
    // Constant slow regeneration of prey
    if (this.list.length < agentsNum) {
      this.list.push(new Agent(0));
    }
    
    // Predator starvation to maintain balance
    const predatorCount = this.list.filter(a => a.type === 1).length;
    if (predatorCount > agentsNum * 0.45) {
      const pIdx = this.list.findIndex(a => a.type === 1);
      if (pIdx > -1) this.list.splice(pIdx, 1);
    }
  }
}
