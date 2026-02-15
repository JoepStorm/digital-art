// Inspired by Jason
// Iteration 1: The Weaver - Reduced population and added a spontaneous spawning mechanism at the canvas center
// Iteration 2: The Chromatic Alchemist - Added color-shifting trails that evolve based on agent position
// Iteration 3: The Ghost Weaver - Introduced variable speed and inertia to agent movement for more fluid, flowing trails
// Iteration 4: The Mycelial Architect - Introduced agent branching to create dense geometric webs
// Iteration 5: The Ethereal Weaver - Introduced gravitational attraction towards persistent center-points to form cellular nodes
// Iteration 6: The Pulsing Core - Added a rhythmic harmonic oscillation to sensor distance to create breathing fractal structures
// Iteration 7: The Spectral Weaver - Introduced directional momentum and velocity-based color mapping
const agentsNum = 400;
const sensorAngle = Math.PI / 7;
const turnAngle = Math.PI / 9;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  pixelDensity(1);
  background(0);
  colorMode(HSB, 255);
  agents = new Agents();
}

function draw() {
  // Low alpha background creates long-lasting trails and a ghosting effect
  background(0, 8);

  loadPixels();
  for (let i = 4; i--; ) {
    agents.update();
  }
  updatePixels();

  // Spontaneous migration events to prevent stagnation in one area
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
    this.speed = random(1.2, 3.2);
    // Momentum helps create smoother curves and organic branching
    this.velocity = createVector(cos(this.dir), sin(this.dir));
  }

  updateDirection() {
    // Dynamic sensing: sensor distance pulses over time to create breathing fractal structures
    const dynamicSensorOffset = 15 + sin(frameCount * 0.02) * 12;
    
    const right = this.sense(+sensorAngle, dynamicSensorOffset);
    const center = this.sense(0, dynamicSensorOffset);
    const left = this.sense(-sensorAngle, dynamicSensorOffset);

    if (center > left && center > right) {
        // Path is strongest ahead
    } else if (center < left && center < right) {
        this.dir += (random() < 0.5 ? 1 : -1) * turnAngle;
    } else if (left > right) {
        this.dir -= turnAngle;
    } else if (right > left) {
        this.dir += turnAngle;
    }

    // Gentle pull towards center point creates globular cluster formations
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
    // Apply velocity for smoother movement integration
    this.x += cos(this.dir) * this.speed;
    this.y += sin(this.dir) * this.speed;
    
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const ix = floor(this.x);
    const iy = floor(this.y);
    const index = (ix + iy * width) * 4;
    
    // Color determined by distance from center and movement direction
    let distFromCenter = dist(this.x, this.y, width/2, height/2);
    let h = (distFromCenter * 0.4 + this.dir * 20 + frameCount * 0.2) % 255;
    let s = map(this.speed, 1.2, 3.2, 180, 255);
    let b = 255;
    
    let c = color(h, s, b);
    
    // Write directly to pixel buffer for performance
    pixels[index] = red(c);
    pixels[index + 1] = green(c);
    pixels[index + 2] = blue(c);
    pixels[index + 3] = 255;

    // Self-replication logic to allow population growth toward a ceiling
    if (agents.agents.length < 2000 && random() < 0.0015) {
        agents.agents.push(new Agent(this.x, this.y, this.dir + random(-0.5, 0.5)));
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
    
    // Prune population to maintain performance and visual clarity
    if (this.agents.length > 1500) {
        this.agents.splice(0, 10);
    }
  }
}
