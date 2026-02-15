// Inspired by Jason
// Iteration 1: The Mycelial Architect - Introduced species-specific logic with variable sensor ranges and color signatures
// Iteration 2: The Ethereal Weaver - Introduced species-specific repulsion and velocity variation to create cellular structures
// Iteration 3: The Pulse Oscillator - Introduced species-specific cyclic behavior where sensor range oscillates, creating rhythmic breathing patterns in the trail networks
// Iteration 4: The Chromatic Alchemist - Introduced velocity-based color shifting and trail-dragging to create more fluid, painterly gradients
// Iteration 5: The Gravitational Weaver - Introduced inter-species cross-pollination where agents mimic or flee from the scent of other species
// Iteration 6: The Kinetic Architect - Introduced spatial velocity fields that warp agent trajectories based on underlying trail density
// Iteration 7: The Harmonic Weaver - Introduced neighbor-based angular alignment (flocking) to create coherent flowing streams
const agentsNum = 4000;
const sensorAngle = Math.PI / 7;
const turnAngle = Math.PI / 5;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  pixelDensity(1);
  background(0);
  agents = new Agents();
}

function draw() {
  // Low alpha fade handles the evaporation of trails
  background(0, 8);

  loadPixels();
  // Perform multiple simulation steps per frame for organic flow
  for (let i = 4; i--; ) {
    agents.update();
  }
  updatePixels();
}

class Agent {
  constructor(id) {
    this.id = id;
    this.x = random(width);
    this.y = random(height);
    this.dir = random(TWO_PI);
    
    // Each species now has unique motion and sensory parameters
    this.species = floor(random(3));
    this.phase = random(TWO_PI); // Unique phase for temporal oscillation
    
    if (this.species === 0) {
      this.baseColor = [255, 60, 120]; // Deep Pink
      this.baseSensorOffset = 18;
      this.speed = 1.2;
      this.repulse = false; 
      this.pulseFreq = 0.05; // Quick rhythmic pulse
      this.affinity = [1.0, -0.5, 0.2]; // Likes its own kind, hates Green, neutral to Blue
    } else if (this.species === 1) {
      this.baseColor = [40, 255, 200]; // Cyan-Green
      this.baseSensorOffset = 30;
      this.speed = 2.5;
      this.repulse = true; 
      this.pulseFreq = 0.01; // Slow breathing
      this.affinity = [0.1, 1.0, -0.8]; // Neutral to Pink, likes Green, repelled by Blue
    } else {
      this.baseColor = [60, 110, 255]; // Cobalt Blue
      this.baseSensorOffset = 45;
      this.speed = 1.8;
      this.repulse = false;
      this.pulseFreq = 0.03; // Moderate oscillation
      this.affinity = [-0.4, 0.8, 1.0]; // Repelled by Pink, loves Green scent, likes Blue
    }
  }

  updateDirection(others) {
    // Oscillate the sensor range over time to produce "breathing" behavior
    this.phase += this.pulseFreq;
    const currentSensorOffset = this.baseSensorOffset * (1 + 0.5 * sin(this.phase));
    
    let right = this.sense(+sensorAngle, currentSensorOffset);
    let center = this.sense(0, currentSensorOffset);
    let left = this.sense(-sensorAngle, currentSensorOffset);

    // Dynamic obstacle/density avoidance
    if (this.repulse) {
      const threshold = 400; 
      if (center > threshold) center = -center;
      if (left > threshold) left = -left;
      if (right > threshold) right = -right;
    }

    if (center > left && center > right) {
      // Forward
    } else if (center < left && center < right) {
      this.dir += (random() < 0.5 ? 1 : -1) * turnAngle;
    } else if (left > right) {
      this.dir -= turnAngle;
    } else if (right > left) {
      this.dir += turnAngle;
    }
    
    // Iteration 7: Alignment Logic - Agents subtly align their direction with a random neighbor
    // This creates "rivers" of movement and cohesive ribbons within the slime mold structure
    let neighbor = others[floor(random(others.length))];
    if (neighbor.species === this.species && neighbor !== this) {
       let distSq = sq(this.x - neighbor.x) + sq(this.y - neighbor.y);
       if (distSq < 400) { // If within 20 pixels
         this.dir = lerp(this.dir, neighbor.dir, 0.05);
       }
    }

    this.dir += (random() - 0.5) * 0.1;
  }

  // The sensing logic weighs different color channels based on species affinity
  sense(dirOffset, dist) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + dist * cos(angle));
    let y = floor(this.y + dist * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;

    const index = (x + y * width) * 4;
    const r = pixels[index];
    const g = pixels[index + 1];
    const b = pixels[index + 2];
    
    return (r * this.affinity[0]) + (g * this.affinity[1]) + (b * this.affinity[2]);
  }

  updatePosition() {
    // Kinetic Effect: Trail intensity creates a local velocity field
    const idx = (floor(this.x) + floor(this.y) * width) * 4;
    const localDensity = (pixels[idx] + pixels[idx+1] + pixels[idx+2]) / 765;
    const velocityMultiplier = 1.0 + (this.species === 1 ? -0.4 : 0.4) * localDensity;

    this.x += cos(this.dir) * (this.speed * velocityMultiplier);
    this.y += sin(this.dir) * (this.speed * velocityMultiplier);
    
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const px = floor(this.x);
    const py = floor(this.y);
    const index = (px + py * width) * 4;
    
    // Calculate a color shift based on movement phase
    const shift = sin(this.phase) * 40;
    
    // Write new position to the pixel buffer
    pixels[index]     = min(255, pixels[index]     * 0.5 + this.baseColor[0] + shift);
    pixels[index + 1] = min(255, pixels[index + 1] * 0.5 + this.baseColor[1] + shift);
    pixels[index + 2] = min(255, pixels[index + 2] * 0.5 + this.baseColor[2] + shift);
    pixels[index + 3] = 255;
  }
}

class Agents {
  constructor() {
    this.agents = Array(agentsNum)
      .fill()
      .map((_, i) => new Agent(i));
  }
  update() {
    for (let a of this.agents) a.updateDirection(this.agents);
    for (let a of this.agents) a.updatePosition();
  }
}
