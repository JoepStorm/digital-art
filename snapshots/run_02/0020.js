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
// Iteration 14: The Electro-Magnetic Weaver - Introduced polar magnetism where agents are drawn toward or repelled by neighbors based on the cross product of their headings, creating swirling orbital filaments
// Iteration 15: The Synaptic Sculptor - Introduced temporal persistence through "ghost trails" and signal-echo refraction
// Iteration 16: The Chromatic Singularity - Introduced spatial event horizons that warp agent trajectories toward high-density gravity wells
// Iteration 17: The Chromatic Singularity - Introduced spatial event horizons that warp agent trajectories toward high-density gravity wells
// Iteration 18: The Mycelial Architect - Introduced "Mycelial Tunnels" where agents carve negative space through dense pheromone walls, creating intricate branching voids.
// Iteration 19: The Neural Lattice - Introduced "Synaptic Bridging" where agents discharge energy pulses that leap toward distant high-density nodes, creating ephemeral electrical connections.
// Iteration 20: The Weaver of Temporal Echoes - Introduced Kinetic Chrono-Dilation where agents slow down time in their wake, creating viscous distortion ripples that affect passing agents.
const agentsNum = 4200;
const sensorAngle = Math.PI / 7;
const turnAngle = Math.PI / 5;
let agents;
let bloomGrid;
let timeWarpGrid; // New grid to store temporal distortion

function setup() {
  createCanvas(1600, 800);
  pixelDensity(1);
  background(0);
  agents = new Agents();
  bloomGrid = new Float32Array(width * height).fill(0);
  timeWarpGrid = new Float32Array(width * height).fill(1.0); // 1.0 is normal time speed
}

function draw() {
  background(4, 6, 12, 18); 

  loadPixels();
  
  for (let i = 0; i < bloomGrid.length; i++) {
    let d = bloomGrid[i];
    bloomGrid[i] *= d > 80 ? 0.98 : 0.88;
    // Gradually recover time warping back to 1.0
    timeWarpGrid[i] = lerp(timeWarpGrid[i], 1.0, 0.05);
  }

  for (let i = 3; i--; ) {
    agents.update();
  }
  
  for (let i = 0; i < pixels.length; i += 4) {
    let idx = i / 4;
    let bVal = bloomGrid[idx];
    if (bVal > 0.1) {
      let crystal = bVal > 180 ? 1.8 : 1.0;
      let echo = bVal > 40 ? 0.85 : 0.45;
      // Visualize time warp: Areas where time is slowed (low value) appear shifted toward cyan/gold
      let tWarp = timeWarpGrid[idx];
      let distortion = (1.0 - tWarp) * 100;
      
      pixels[i]     = min(255, pixels[i]     + bVal * 0.28 * crystal * echo + distortion);
      pixels[i + 1] = min(255, pixels[i + 1] + bVal * 0.15 * crystal * echo + distortion * 0.5);
      pixels[i + 2] = min(255, pixels[i + 2] + bVal * 0.60 * crystal * echo - distortion);
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
    
    this.life = parentX !== undefined ? 140 : -1;
    this.species = species !== undefined ? species : floor(random(3));
    this.phase = random(TWO_PI); 
    this.energy = random(0.5, 1.5); 
    
    this.isAnchored = false;
    this.anchorX = 0;
    this.anchorY = 0;

    if (this.species === 0) {
      this.baseColor = [255, 40, 180]; 
      this.baseSensorOffset = 18;
      this.speed = 1.35;
      this.repulse = false; 
      this.pulseFreq = 0.04;
      this.affinity = [1.2, -0.6, 0.4];
      this.charge = 1.2; 
    } else if (this.species === 1) {
      this.baseColor = [0, 255, 230]; 
      this.baseSensorOffset = 28;
      this.speed = 2.4;
      this.repulse = true; 
      this.pulseFreq = 0.015;
      this.affinity = [0.2, 1.1, -0.7];
      this.charge = -1.1; 
    } else {
      this.baseColor = [100, 140, 255]; 
      this.baseSensorOffset = 45;
      this.speed = 1.6;
      this.repulse = false;
      this.pulseFreq = 0.025;
      this.affinity = [-0.3, 0.7, 1.3];
      this.charge = 0.4; 
    }
  }

  updateInteraction(others, spawnArray) {
    let neighborIdx = floor(random(others.length));
    let neighbor = others[neighborIdx];
    
    let dx = neighbor.x - this.x;
    let dy = neighbor.y - this.y;
    let d2 = dx*dx + dy*dy;
    
    if (d2 < 1200) { 
      let angleToNeighbor = atan2(dy, dx);
      let relativeAngle = angleToNeighbor - this.dir;
      let force = (this.charge * neighbor.charge) * sin(relativeAngle) * 0.18;
      this.dir += force;

      if (neighbor.species !== this.species) {
        let transfer = 0.08;
        this.energy += transfer;
        neighbor.energy -= transfer;
        
        if (this.energy > 2.5 && random() < 0.04 && spawnArray.length < 800) {
          spawnArray.push(new Agent(others.length + spawnArray.length, this.x, this.y, this.dir + random(-0.9, 0.9), this.species));
        }
      } else {
        let diff = neighbor.dir - this.dir;
        while (diff < -PI) diff += TWO_PI;
        while (diff > PI) diff -= TWO_PI;
        this.dir += diff * 0.05;
      }
    }
    this.energy = lerp(this.energy, 1.0, 0.02);
    this.energy = constrain(this.energy, 0.2, 3.5);
  }

  updateDirection() {
    this.phase += this.pulseFreq * this.energy;
    const currentSensorOffset = this.baseSensorOffset * (1 + 0.45 * sin(this.phase));
    
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
    this.dir += (random() - 0.5) * 0.15;
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
    const density = bloomGrid[idx] / 300;
    
    // Kinetic Chrono-Dilation: Agents sense the local time-speed and slow down or speed up. 
    // This creates "pockets" of stuck movement.
    const localTimeStep = timeWarpGrid[idx] || 1.0;

    const totalBrightness = pixels[idx * 4] + pixels[idx * 4 + 1] + pixels[idx * 4 + 2];
    if (totalBrightness > 450) {
        let pullStrength = map(totalBrightness, 450, 765, 0.02, 0.15);
        let centerAngle = atan2(height/2 - this.y, width/2 - this.x);
        this.dir += sin(centerAngle - this.dir) * pullStrength * localTimeStep;
    }

    if (this.energy > 3.0 && random() < 0.05) {
      let reach = random(50, 200);
      let targetX = (px + floor(cos(this.dir) * reach) + width) % width;
      let bIdx = targetX + py * width;
      if (bloomGrid[bIdx] < 50) { 
          for(let step = 0; step < reach; step += 2) {
             let lx = (px + floor(cos(this.dir) * step) + width) % width;
             let lIdx = lx + py * width;
             bloomGrid[lIdx] += 15;
             // Synaptic bridges create temporal acceleration pathways
             timeWarpGrid[lIdx] = min(2.0, timeWarpGrid[lIdx] + 0.1);
          }
      }
    }

    if (!this.isAnchored && density > 0.8 && random() < 0.1) {
      this.isAnchored = true;
      this.anchorX = this.x;
      this.anchorY = this.y;
    }

    let moveX = cos(this.dir);
    let moveY = sin(this.dir);

    if (this.isAnchored) {
      moveX += (this.anchorX - this.x) * 0.3;
      moveY += (this.anchorY - this.y) * 0.3;
      if (sin(this.phase) < -0.9) this.isAnchored = false; 
    }

    const resistance = 1.0 / (1.0 + density * 3.0);
    // Multiply speed by the local temporal field
    const velocityMultiplier = resistance * this.energy * localTimeStep;
    
    this.x = (this.x + moveX * (this.speed * velocityMultiplier) + width) % width;
    this.y = (this.y + moveY * (this.speed * velocityMultiplier) + height) % height;

    if (this.life > 0) this.life--;

    const npx = floor(this.x);
    const npy = floor(this.y);
    const pixelIdx = (npx + npy * width) * 4;
    const gridIdx = npx + npy * width;
    
    // As agents move, they "stretch" time behind them, creating a wake of low temporal speed
    if (this.speed * velocityMultiplier > 1.5) {
        timeWarpGrid[gridIdx] = max(0.1, timeWarpGrid[gridIdx] - 0.15);
    }

    if (this.energy > 1.8 && bloomGrid[gridIdx] > 100) {
        bloomGrid[gridIdx] *= 0.5; 
    } else {
        bloomGrid[gridIdx] += 65 * this.energy;
    }
    
    const shift = sin(this.phase) * 45;
    const boost = (this.energy - 1.0) * 85;
    
    pixels[pixelIdx]     = min(255, pixels[pixelIdx]     * 0.4 + this.baseColor[0] + shift + boost);
    pixels[pixelIdx + 1] = min(255, pixels[pixelIdx + 1] * 0.4 + this.baseColor[1] + shift + boost);
    pixels[pixelIdx + 2] = min(255, pixels[pixelIdx + 2] * 0.4 + this.baseColor[2] + shift + boost);
    pixels[pixelIdx + 3] = 255;
  }
}

class Agents {
  constructor() {
    this.agentsList = Array(agentsNum).fill().map((_, i) => new Agent(i));
  }
  update() {
    let spawnQueue = [];
    let interactionStep = 3;
    for (let i = 0; i < this.agentsList.length; i++) {
        if (i % interactionStep === 0) {
            this.agentsList[i].updateInteraction(this.agentsList, spawnQueue);
        }
        this.agentsList[i].updateDirection();
        this.agentsList[i].updatePosition();
    }
    
    if (spawnQueue.length > 0) this.agentsList = this.agentsList.concat(spawnQueue);
    this.agentsList = this.agentsList.filter(a => a.life === -1 || a.life > 0);
    
    if (this.agentsList.length > 6000) {
        this.agentsList.splice(0, this.agentsList.length - 6000);
    }
  }
}
