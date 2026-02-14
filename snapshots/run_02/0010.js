// Inspired by Jason
// Iteration 1: The Mycelial Architect - Introduced species-specific logic with variable sensor ranges and color signatures
// Iteration 2: The Ethereal Weaver - Introduced species-specific repulsion and velocity variation to create cellular structures
// Iteration 3: The Pulse Oscillator - Introduced species-specific cyclic behavior where sensor range oscillates, creating rhythmic breathing patterns in the trail networks
// Iteration 4: The Chromatic Alchemist - Introduced velocity-based color shifting and trail-dragging to create more fluid, painterly gradients
// Iteration 5: The Gravitational Weaver - Introduced inter-species cross-pollination where agents mimic or flee from the scent of other species
// Iteration 6: The Kinetic Architect - Introduced spatial velocity fields that warp agent trajectories based on underlying trail density
// Iteration 7: The Harmonic Weaver - Introduced neighbor-based angular alignment (flocking) to create coherent flowing streams
// Iteration 8: The Quantum Entangler - Introduced parasitic "tethering" where high-velocity agents steal energy (speed) from their neighbors, creating chaotic bursts of motion.
// Iteration 9: The Fractal Weaver - Introduced recursive branching where agents occasionally birth short-lived clones upon high-energy interaction
// Iteration 10: The Spectral Prism - Introduced refraction-based steering where agents change velocity and direction based on the 'optical density' (local color brightness) of the environment, causing light-like bending at structure boundaries.
const agentsNum = 4200;
const sensorAngle = Math.PI / 7;
const turnAngle = Math.PI / 5;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight);
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
  constructor(id, parentX, parentY, parentDir, species) {
    this.id = id;
    this.x = parentX !== undefined ? parentX : random(width);
    this.y = parentY !== undefined ? parentY : random(height);
    this.dir = parentDir !== undefined ? parentDir : random(TWO_PI);
    
    // Lifespan for branched clones; -1 for immortal original agents
    this.life = parentX !== undefined ? 100 : -1;
    this.species = species !== undefined ? species : floor(random(3));
    this.phase = random(TWO_PI); 
    this.energy = random(0.5, 1.5); 
    
    if (this.species === 0) {
      this.baseColor = [255, 60, 120]; // Deep Pink
      this.baseSensorOffset = 18;
      this.speed = 1.2;
      this.repulse = false; 
      this.pulseFreq = 0.05;
      this.affinity = [1.0, -0.5, 0.2];
      this.refractionIndex = 1.1; // Slight bending
    } else if (this.species === 1) {
      this.baseColor = [40, 255, 200]; // Cyan-Green
      this.baseSensorOffset = 30;
      this.speed = 2.5;
      this.repulse = true; 
      this.pulseFreq = 0.01;
      this.affinity = [0.1, 1.0, -0.8];
      this.refractionIndex = 1.5; // High bending
    } else {
      this.baseColor = [60, 110, 255]; // Cobalt Blue
      this.baseSensorOffset = 45;
      this.speed = 1.8;
      this.repulse = false;
      this.pulseFreq = 0.03;
      this.affinity = [-0.4, 0.8, 1.0];
      this.refractionIndex = 0.8; // Inverse bending
    }
  }

  updateInteraction(others, spawnArray) {
    let neighborIdx = floor(random(others.length));
    let neighbor = others[neighborIdx];
    
    let dx = neighbor.x - this.x;
    let dy = neighbor.y - this.y;
    let d2 = dx*dx + dy*dy;
    
    if (d2 < 625) { 
      if (neighbor.species !== this.species) {
        let transfer = 0.05;
        this.energy += transfer;
        neighbor.energy -= transfer;
        
        // Iteration 9: Recursive Branching
        if (this.energy > 2.2 && random() < 0.02 && spawnArray.length < 1000) {
          spawnArray.push(new Agent(others.length + spawnArray.length, this.x, this.y, this.dir + random(-0.5, 0.5), this.species));
        }

        this.dir += atan2(dy, dx) * 0.02;
      } else {
        this.dir = lerp(this.dir, neighbor.dir, 0.05);
      }
    }
    
    this.energy = lerp(this.energy, 1.0, 0.01);
    this.energy = constrain(this.energy, 0.2, 3.0);
  }

  updateDirection() {
    this.phase += this.pulseFreq * this.energy;
    const currentSensorOffset = this.baseSensorOffset * (1 + 0.5 * sin(this.phase));
    
    let right = this.sense(+sensorAngle, currentSensorOffset);
    let center = this.sense(0, currentSensorOffset);
    let left = this.sense(-sensorAngle, currentSensorOffset);

    if (this.repulse) {
      const threshold = 400; 
      if (center > threshold) center = -center;
      if (left > threshold) left = -left;
      if (right > threshold) right = -right;
    }

    if (center > left && center > right) {
    } else if (center < left && center < right) {
      this.dir += (random() < 0.5 ? 1 : -1) * turnAngle;
    } else if (left > right) {
      this.dir -= turnAngle;
    } else if (right > left) {
      this.dir += turnAngle;
    }
    
    this.dir += (random() - 0.5) * 0.1;
  }

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
    const idx = (floor(this.x) + floor(this.y) * width) * 4;
    const br = (pixels[idx] + pixels[idx+1] + pixels[idx+2]) / 3;
    const localDensity = br / 255;
    
    // Iteration 10: Spectral Refraction
    // Bends the direction based on the gradient of light (brightness) encountered
    // Simulates an optical medium where agents 'refract' at boundaries
    const lookAhead = 5;
    const lx = (floor(this.x + cos(this.dir) * lookAhead) + width) % width;
    const ly = (floor(this.y + sin(this.dir) * lookAhead) + height) % height;
    const futureIdx = (lx + ly * width) * 4;
    const futureBr = (pixels[futureIdx] + pixels[futureIdx+1] + pixels[futureIdx+2]) / 3;
    
    // Angle shift proportional to change in brightness and refractive index
    const lightDelta = (futureBr - br) / 255;
    this.dir += lightDelta * (this.refractionIndex - 1.0) * 0.5;

    const velocityMultiplier = (1.0 + (this.species === 1 ? -0.4 : 0.4) * localDensity) * this.energy;

    this.x += cos(this.dir) * (this.speed * velocityMultiplier);
    this.y += sin(this.dir) * (this.speed * velocityMultiplier);
    
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    if (this.life > 0) this.life--;

    const px = floor(this.x);
    const py = floor(this.y);
    const index = (px + py * width) * 4;
    
    const shift = sin(this.phase) * 40;
    const boost = (this.energy - 1.0) * 100;
    
    pixels[index]     = min(255, pixels[index]     * 0.5 + this.baseColor[0] + shift + boost);
    pixels[index + 1] = min(255, pixels[index + 1] * 0.5 + this.baseColor[1] + shift + boost);
    pixels[index + 2] = min(255, pixels[index + 2] * 0.5 + this.baseColor[2] + shift + boost);
    pixels[index + 3] = 255;
  }
}

class Agents {
  constructor() {
    this.agentsList = Array(agentsNum)
      .fill()
      .map((_, i) => new Agent(i));
  }
  update() {
    let spawnQueue = [];
    for (let a of this.agentsList) a.updateInteraction(this.agentsList, spawnQueue);
    for (let a of this.agentsList) a.updateDirection();
    for (let a of this.agentsList) a.updatePosition();
    
    if (spawnQueue.length > 0) {
      this.agentsList = this.agentsList.concat(spawnQueue);
    }
    this.agentsList = this.agentsList.filter(a => a.life === -1 || a.life > 0);
  }
}
