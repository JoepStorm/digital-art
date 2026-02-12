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
// Iteration 13: The Osmotic Crystallizer - Introduced concentration-dependent trail coagulation that turns dense filaments into rigid, crystal-like structures with sharp edges
const agentsNum = 4200;
const sensorAngle = Math.PI / 7;
const turnAngle = Math.PI / 5;
let agents;
let bloomGrid;

function setup() {
  createCanvas(1600, 800);
  pixelDensity(1);
  background(0);
  agents = new Agents();
  bloomGrid = new Float32Array(width * height).fill(0);
}

function draw() {
  background(2, 5, 12, 12); // Slightly bluer, darker void

  loadPixels();
  
  for (let i = 0; i < bloomGrid.length; i++) {
    // Osmotic decay: lighter areas fade fast, but very dense areas "crystallize" and persist longer
    let d = bloomGrid[i];
    bloomGrid[i] *= d > 60 ? 0.96 : 0.82;
  }

  for (let i = 4; i--; ) {
    agents.update();
  }
  
  for (let i = 0; i < pixels.length; i += 4) {
    let idx = i / 4;
    let bVal = bloomGrid[idx];
    if (bVal > 0.1) {
      // Crystallization effect: sharp color quantization at high densities
      let crystal = bVal > 150 ? 1.4 : 1.0;
      pixels[i]     = min(255, pixels[i]     + bVal * 0.3 * crystal);
      pixels[i + 1] = min(255, pixels[i + 1] + bVal * 0.15 * crystal);
      pixels[i + 2] = min(255, pixels[i + 2] + bVal * 0.6 * crystal);
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
    
    this.life = parentX !== undefined ? 120 : -1;
    this.species = species !== undefined ? species : floor(random(3));
    this.phase = random(TWO_PI); 
    this.energy = random(0.5, 1.5); 
    
    this.isAnchored = false;
    this.anchorX = 0;
    this.anchorY = 0;

    if (this.species === 0) {
      this.baseColor = [255, 40, 180]; // Neon Pink/Purple
      this.baseSensorOffset = 18;
      this.speed = 1.3;
      this.repulse = false; 
      this.pulseFreq = 0.04;
      this.affinity = [1.2, -0.6, 0.4];
    } else if (this.species === 1) {
      this.baseColor = [0, 255, 230]; // Electric Cyan
      this.baseSensorOffset = 28;
      this.speed = 2.4;
      this.repulse = true; 
      this.pulseFreq = 0.015;
      this.affinity = [0.2, 1.1, -0.7];
    } else {
      this.baseColor = [80, 100, 255]; // Deep Cobalt
      this.baseSensorOffset = 42;
      this.speed = 1.7;
      this.repulse = false;
      this.pulseFreq = 0.025;
      this.affinity = [-0.3, 0.7, 1.2];
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
        let transfer = 0.06;
        this.energy += transfer;
        neighbor.energy -= transfer;
        
        if (this.energy > 2.4 && random() < 0.03 && spawnArray.length < 800) {
          spawnArray.push(new Agent(others.length + spawnArray.length, this.x, this.y, this.dir + random(-0.8, 0.8), this.species));
        }
      } else {
        // Alignment behavior: helps form the long, sharp crystalline filaments
        let diff = neighbor.dir - this.dir;
        while (diff < -PI) diff += TWO_PI;
        while (diff > PI) diff -= TWO_PI;
        this.dir += diff * 0.06;
      }
    }
    this.energy = lerp(this.energy, 1.0, 0.015);
    this.energy = constrain(this.energy, 0.3, 3.2);
  }

  updateDirection() {
    this.phase += this.pulseFreq * this.energy;
    const currentSensorOffset = this.baseSensorOffset * (1 + 0.4 * sin(this.phase));
    
    let right = this.sense(+sensorAngle, currentSensorOffset);
    let center = this.sense(0, currentSensorOffset);
    let left = this.sense(-sensorAngle, currentSensorOffset);

    if (this.repulse) {
      const threshold = 380; 
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
    this.dir += (random() - 0.5) * 0.12;
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
    const idx = (px + py * width);
    // Use the bloomGrid density to determine movement resistance
    const density = bloomGrid[idx] / 300;
    
    // Crystallization: high density slows agents significantly, causing "knots"
    if (!this.isAnchored && density > 0.75 && random() < 0.08) {
      this.isAnchored = true;
      this.anchorX = this.x;
      this.anchorY = this.y;
    }

    let moveX = cos(this.dir);
    let moveY = sin(this.dir);

    if (this.isAnchored) {
      moveX += (this.anchorX - this.x) * 0.25;
      moveY += (this.anchorY - this.y) * 0.25;
      if (sin(this.phase) < -0.85) this.isAnchored = false; 
    }

    const resistance = 1.0 / (1.0 + density * 2.5);
    const velocityMultiplier = resistance * this.energy;
    
    this.x = (this.x + moveX * (this.speed * velocityMultiplier) + width) % width;
    this.y = (this.y + moveY * (this.speed * velocityMultiplier) + height) % height;

    if (this.life > 0) this.life--;

    const npx = floor(this.x);
    const npy = floor(this.y);
    const pixelIdx = (npx + npy * width) * 4;
    
    const shift = sin(this.phase) * 35;
    const boost = (this.energy - 1.0) * 80;
    
    pixels[pixelIdx]     = min(255, pixels[pixelIdx]     * 0.45 + this.baseColor[0] + shift + boost);
    pixels[pixelIdx + 1] = min(255, pixels[pixelIdx + 1] * 0.45 + this.baseColor[1] + shift + boost);
    pixels[pixelIdx + 2] = min(255, pixels[pixelIdx + 2] * 0.45 + this.baseColor[2] + shift + boost);
    pixels[pixelIdx + 3] = 255;

    // Accumulate on bloom grid: higher accumulation allows for crystallization
    bloomGrid[npx + npy * width] += 55 * this.energy;
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
    // Hard cap for performance
    if (this.agentsList.length > 8000) this.agentsList.splice(0, this.agentsList.length - 8000);
  }
}
