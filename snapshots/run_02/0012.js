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
// Iteration 11: The Nematomorph - Introduced parasitic "anchoring" where agents occasionally tether to the pixel canvas, creating drag-induced vortexes and filamentary "knots"
// Iteration 12: The Bioluminescent Weaver - Introduced spatial pheromone diffusion using an accumulation grid to create soft, glowing gaseous halos around dense filaments
const agentsNum = 4200;
const sensorAngle = Math.PI / 7;
const turnAngle = Math.PI / 5;
let agents;
let bloomGrid; // Secondary grid for spatial light diffusion

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(0);
  agents = new Agents();
  // Bloom grid stores a localized "heat" map of agent activity for halo effects
  bloomGrid = new Float32Array(width * height).fill(0);
}

function draw() {
  // Low alpha fade handles the evaporation of trails
  background(0, 10);

  loadPixels();
  
  // Decay the bloom grid (simulating evaporation/diffusion of light)
  for (let i = 0; i < bloomGrid.length; i++) {
    bloomGrid[i] *= 0.85;
  }

  // Perform multiple simulation steps per frame for organic flow
  for (let i = 4; i--; ) {
    agents.update();
  }
  
  // Apply the bloom effect back to the pixel buffer
  // This creates the aetherial "gas" or glow around the sharp filaments
  for (let i = 0; i < pixels.length; i += 4) {
    let bVal = bloomGrid[i / 4];
    if (bVal > 0.1) {
      pixels[i]     = min(255, pixels[i]     + bVal * 0.4);
      pixels[i + 1] = min(255, pixels[i + 1] + bVal * 0.2);
      pixels[i + 2] = min(255, pixels[i + 2] + bVal * 0.5);
    }
  }
  
  updatePixels();
}

class Agent {
  constructor(id, parentX, parentY, parentDir, species) {
    this.id = id;
    this.x = parentX !== undefined ? parentX : random(width);
    this.y = parentY !== undefined ? parentY : random(height);
    this.dir = parentDir !== undefined ? parentDir : random(TWO_PI);
    
    this.life = parentX !== undefined ? 100 : -1;
    this.species = species !== undefined ? species : floor(random(3));
    this.phase = random(TWO_PI); 
    this.energy = random(0.5, 1.5); 
    
    this.isAnchored = false;
    this.anchorX = 0;
    this.anchorY = 0;

    if (this.species === 0) {
      this.baseColor = [255, 60, 120]; 
      this.baseSensorOffset = 18;
      this.speed = 1.2;
      this.repulse = false; 
      this.pulseFreq = 0.05;
      this.affinity = [1.0, -0.5, 0.2];
      this.refractionIndex = 1.1; 
    } else if (this.species === 1) {
      this.baseColor = [40, 255, 200];
      this.baseSensorOffset = 30;
      this.speed = 2.5;
      this.repulse = true; 
      this.pulseFreq = 0.01;
      this.affinity = [0.1, 1.0, -0.8];
      this.refractionIndex = 1.5; 
    } else {
      this.baseColor = [60, 110, 255]; 
      this.baseSensorOffset = 45;
      this.speed = 1.8;
      this.repulse = false;
      this.pulseFreq = 0.03;
      this.affinity = [-0.4, 0.8, 1.0];
      this.refractionIndex = 0.8; 
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
    let x = (floor(this.x + dist * cos(angle)) + width) % width;
    let y = (floor(this.y + dist * sin(angle)) + height) % height;
    const index = (x + y * width) * 4;
    return (pixels[index] * this.affinity[0]) + (pixels[index + 1] * this.affinity[1]) + (pixels[index + 2] * this.affinity[2]);
  }

  updatePosition() {
    const px = floor(this.x);
    const py = floor(this.y);
    const idx = (px + py * width) * 4;
    const br = (pixels[idx] + pixels[idx+1] + pixels[idx+2]) / 3;
    const localDensity = br / 255;
    
    if (!this.isAnchored && localDensity > 0.8 && random() < 0.05) {
      this.isAnchored = true;
      this.anchorX = this.x;
      this.anchorY = this.y;
    }

    let moveX = cos(this.dir);
    let moveY = sin(this.dir);

    if (this.isAnchored) {
      moveX += (this.anchorX - this.x) * 0.2;
      moveY += (this.anchorY - this.y) * 0.2;
      if (sin(this.phase) < -0.9) this.isAnchored = false; 
    }

    const velocityMultiplier = (1.0 + (this.species === 1 ? -0.4 : 0.4) * localDensity) * this.energy;
    this.x = (this.x + moveX * (this.speed * velocityMultiplier) + width) % width;
    this.y = (this.y + moveY * (this.speed * velocityMultiplier) + height) % height;

    if (this.life > 0) this.life--;

    const npx = floor(this.x);
    const npy = floor(this.y);
    const index = (npx + npy * width) * 4;
    
    const shift = sin(this.phase) * 40;
    const boost = (this.energy - 1.0) * 100;
    
    pixels[index]     = min(255, pixels[index]     * 0.5 + this.baseColor[0] + shift + boost);
    pixels[index + 1] = min(255, pixels[index + 1] * 0.5 + this.baseColor[1] + shift + boost);
    pixels[index + 2] = min(255, pixels[index + 2] * 0.5 + this.baseColor[2] + shift + boost);
    pixels[index + 3] = 255;

    // Iteration 12 change: Accumulate intensity on the bloomGrid for a soft glowing aura 
    // and diffused spatial interaction.
    bloomGrid[npx + npy * width] += 50 * this.energy;
  }
}

class Agents {
  constructor() {
    this.agentsList = Array(agentsNum).fill().map((_, i) => new Agent(i));
  }
  update() {
    let spawnQueue = [];
    for (let a of this.agentsList) a.updateInteraction(this.agentsList, spawnQueue);
    for (let a of this.agentsList) a.updateDirection();
    for (let a of this.agentsList) a.updatePosition();
    if (spawnQueue.length > 0) this.agentsList = this.agentsList.concat(spawnQueue);
    this.agentsList = this.agentsList.filter(a => a.life === -1 || a.life > 0);
  }
}
