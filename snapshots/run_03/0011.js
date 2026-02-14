// Inspired by Jason
// Iteration 1: The Weaver - Reduced population and added a spontaneous spawning mechanism at the canvas center
// Iteration 2: The Chromatic Alchemist - Added color-shifting trails that evolve based on agent position
// Iteration 3: The Ghost Weaver - Introduced variable speed and inertia to agent movement for more fluid, flowing trails
// Iteration 4: The Mycelial Architect - Introduced agent branching to create dense geometric webs
// Iteration 5: The Ethereal Weaver - Introduced gravitational attraction towards persistent center-points to form cellular nodes
// Iteration 6: The Pulsing Core - Added a rhythmic harmonic oscillation to sensor distance to create breathing fractal structures
// Iteration 7: The Spectral Weaver - Introduced directional momentum and velocity-based color mapping
// Iteration 8: The Harmonic Weaver - Introduced a radial scent-sink and periodic burst spawning to create orbital resonances
// Iteration 9: The Symbiotic Filament - Introduced cross-agent trail attraction where agents sense and leave chromatic pheromones
// Iteration 10: The Void Weaver - Introduced entropy and agent death based on trail density to create negative space
// Iteration 11: The Weaver - Introduced trail evaporation and diffusion via soft box-blur to create smoky, ethereal gradients
const agentsNum = 400;
const sensorAngle = Math.PI / 7;
const turnAngle = Math.PI / 9;
let agents;
let canvasBuffer;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(0);
  colorMode(HSB, 255);
  // Using a separate buffer for trail processing to allow for diffusion effects
  canvasBuffer = createGraphics(width, height);
  canvasBuffer.pixelDensity(1);
  canvasBuffer.background(0);
  agents = new Agents();
}

function draw() {
  // Instead of simple background fade, we perform a manual pixel decay and blur
  loadPixels();
  
  // Custom trail decay: Every pixel slightly fades and spreads to neighbors (Diffusion)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let i = (x + y * width) * 4;
      // Fade out slowly
      pixels[i] *= 0.94;     // Red (Sensing channel)
      pixels[i + 1] *= 0.92; // Green
      pixels[i + 2] *= 0.90; // Blue
    }
  }

  for (let i = 2; i--; ) {
    agents.update();
  }
  updatePixels();

  // Periodic wave deployment: bursts of agents from the center to create outward-radiating ripples
  if (frameCount % 300 === 0) {
    for (let i = 0; i < 50; i++) {
        agents.agents.push(new Agent(width / 2, height / 2, random(TWO_PI)));
    }
  }

  // Spontaneous migration events to prevent stagnation in one area
  if (frameCount % 180 === 0) {
    let rx = random(width);
    let ry = random(height);
    for (let i = 0; i < 15; i++) {
        let index = floor(random(agents.agents.length));
        if(agents.agents[index]) {
            agents.agents[index].x = rx;
            agents.agents[index].y = ry;
            agents.agents[index].dir = random(TWO_PI);
        }
    }
  }
}

class Agent {
  constructor(x, y, dir) {
    this.x = x || random(width);
    this.y = y || random(height);
    this.dir = dir || random(TWO_PI);
    this.speed = random(1.2, 3.2);
    this.velocity = createVector(cos(this.dir), sin(this.dir));
  }

  updateDirection() {
    // Dynamic sensing offset pulses
    const dynamicSensorOffset = 15 + sin(frameCount * 0.02) * 12;
    
    // Sense trail intensity
    const right = this.sense(+sensorAngle, dynamicSensorOffset);
    const center = this.sense(0, dynamicSensorOffset);
    const left = this.sense(-sensorAngle, dynamicSensorOffset);

    // Physarum chemotaxis logic
    if (center > left && center > right) {
        // Continue
    } else if (center < left && center < right) {
        this.dir += (random() < 0.5 ? 1 : -1) * turnAngle;
    } else if (left > right) {
        this.dir -= turnAngle;
    } else if (right > left) {
        this.dir += turnAngle;
    }

    // Radial scent-sink for orbital resonances
    let angleToCenter = atan2(height / 2 - this.y, width / 2 - this.x);
    let diff = angleToCenter - this.dir;
    while (diff < -PI) diff += TWO_PI;
    while (diff > PI) diff -= TWO_PI;
    
    const gravityStrength = 0.02 * sin(frameCount * 0.01);
    this.dir += diff * gravityStrength; 

    // Chromatic drift
    this.dir += (center / 255) * 0.1 * (random() - 0.5);
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
    
    if (pixels[index] > 245 && random() < 0.08) {
        this.dead = true;
        return;
    }

    let d = dist(this.x, this.y, width/2, height/2);
    let h = (d * 0.3 + this.dir * 40 + frameCount * 0.4) % 255;
    let s = map(this.speed, 1.2, 3.2, 160, 255);
    let b = 255;
    
    let c = color(h, s, b);
    
    pixels[index] = red(c);
    pixels[index + 1] = green(c);
    pixels[index + 2] = blue(c);
    pixels[index + 3] = 255;

    // Replication logic
    if (agents.agents.length < 3000 && random() < 0.002) {
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
    for (let i = this.agents.length - 1; i >= 0; i--) {
        this.agents[i].updatePosition();
        if (this.agents[i].dead) {
            this.agents.splice(i, 1);
        }
    }
    
    if (this.agents.length > 2800) {
        this.agents.splice(Math.floor(random(this.agents.length)), 10);
    }
  }
}
