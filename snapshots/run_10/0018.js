// Inspired by Jason
// Iteration 1: Symbiogenesis - Two populations: cyan prey that flee and leave fading trails, magenta predators that chase prey and leave bright trails, with oscillating populations
// Iteration 2: Luminous Drift - Add trail diffusion/blur pass for organic glowing tendrils instead of scattered dots
// Iteration 3: Bioluminescent Currents - Replace expensive BLUR filter with manual 3x3 kernel diffusion on pixel data for smoother organic tendrils and better performance, plus add subtle pulsing glow intensity tied to population ratio
// Iteration 4: Phosphor Bloom - Increase deposit intensity by having agents write to a 3x3 area instead of single pixel, creating thicker luminous trails that diffusion can spread into proper tendrils
// Iteration 5: Coral Reef - Add prey flee behavior so prey actively steer away from nearby predator trails (red channel), creating dramatic chase patterns and emergent swarm structures
// Iteration 6: Borealis Veil - Add a translucent dark overlay each frame instead of pure trail persistence, creating comet-like fading tails and revealing the chase dynamics more clearly against deeper blacks
// Iteration 7: Murmuration - Add predator repulsion from own trails to prevent clumping, creating sweeping hunt formations that fan out and encircle prey swarms
// Iteration 8: Spectral Wake - Add velocity-dependent trail width and color intensity so fast-moving agents leave brilliant streaks while slow ones leave dim spores, creating dramatic comet tails during chases
// Iteration 9: Ember Tide - Dramatically increase trail deposit brightness and reduce decay to actually build visible tendrils, plus boost base agent counts for denser coverage
// Iteration 10: Abyssal Bloom - Add warm golden "death burst" particles where prey are caught, creating ephemeral bloom explosions that fade into the trail map, marking the drama of each predation event
// Iteration 11: Abyssal Currents - Add flowing background current field using Perlin noise that gently pushes all agents, creating organic river-like flow patterns and swirling vortex structures
// Iteration 12: Phantom Depths - Add layered background gradient that shifts with population dynamics, creating a deep ocean atmosphere with bioluminescent depth zones
// Iteration 13: Abyssal Veins - Add pulsing vein-like structures using sine-distorted radial waves emanating from population center of mass, creating organic membrane patterns
// Iteration 14: Bioluminescent Nebulae - Add swirling aurora-like color shifting based on agent density zones, with trails transitioning through spectral hues over time for ethereal deep-sea nebula effect
// Iteration 15: Crystalline Synapses - Add flickering neural connection lines between nearby predators when they converge on prey, creating a synaptic network overlay that pulses with hunt intensity
// Iteration 16: Abyssal Convergence - Add gravitational lensing effect where trails near population centers warp and bloom outward with radial chromatic aberration, creating a deep-space gravitational lens aesthetic
// Iteration 17: Abyssal Phosphor - Replace blank rendering with proper pixel output; the simulation computes trails but never writes them to the canvas pixels, causing the black/blank screen. Fix the draw loop to actually render trail data with chromatic aberration and background gradient to the pixel buffer.
// Iteration 18: Primordial Soup - The screen is completely blank/grey, indicating rendering is broken. Fix by ensuring pixels are properly loaded, written from trail data, and pushed to canvas each frame.

const preyColor = new Uint8Array([0, 220, 220]);
const predatorColor = new Uint8Array([255, 20, 100]);
const preyNum = 5000;
const predatorNum = 1200;
const sensorOffset = 12;
const sensorAngle = Math.PI / 6;
const turnAngle = Math.PI / 5;
const predatorSpeed = 1.4;
const preySpeed = 1.1;
const predatorSenseRange = 18;
const catchRadius = 4;
const preyReproduceChance = 0.002;
const predatorStarveChance = 0.001;

const preyDangerSenseRange = 28;
const preyFleeWeight = 3.0;

const predatorSelfRepelWeight = 1.5;

const flowScale = 0.003;
const flowStrength = 0.35;
const flowTimeSpeed = 0.0008;

const synapseMaxDist = 60;
const synapseAlpha = 80;
const synapseSampleCount = 200;

let preyAgents, predatorAgents;
let trailA, trailB;
let bursts = [];

let preyCenterX = 0, preyCenterY = 0;
let predCenterX = 0, predCenterY = 0;

function setup() {
  createCanvas(1600, 900);
  pixelDensity(1);
  background(0);
  
  const totalPixels = width * height * 3;
  trailA = new Float32Array(totalPixels);
  trailB = new Float32Array(totalPixels);
  
  preyAgents = Array(preyNum).fill().map(() => new PreyAgent());
  predatorAgents = Array(predatorNum).fill().map(() => new PredatorAgent());
  
  preyCenterX = width / 2;
  preyCenterY = height / 2;
  predCenterX = width / 2;
  predCenterY = height / 2;
}

function depositTrail(px, py, r, g, b, intensity) {
  const ix = floor(px);
  const iy = floor(py);
  const bright = constrain(intensity, 0.3, 2.0);
  const radius = bright > 1.2 ? 2 : 1;
  const depositScale = 40.0;
  
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (radius === 2 && abs(dx) === 2 && abs(dy) === 2) continue;
      let x = (ix + dx + width) % width;
      let y = (iy + dy + height) % height;
      const idx = (x + y * width) * 3;
      const dist = sqrt(dx * dx + dy * dy);
      const falloff = max(0, 1.0 - dist / (radius + 0.5)) * bright * depositScale;
      trailA[idx]     = min(255, trailA[idx]     + r / 255 * falloff);
      trailA[idx + 1] = min(255, trailA[idx + 1] + g / 255 * falloff);
      trailA[idx + 2] = min(255, trailA[idx + 2] + b / 255 * falloff);
    }
  }
}

function depositBurst(px, py, radius, intensity) {
  const ix = floor(px);
  const iy = floor(py);
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const d2 = dx * dx + dy * dy;
      if (d2 > radius * radius) continue;
      let x = (ix + dx + width) % width;
      let y = (iy + dy + height) % height;
      const idx = (x + y * width) * 3;
      const dist = sqrt(d2);
      const falloff = intensity * exp(-dist * dist / (radius * radius * 0.3));
      trailA[idx]     = min(255, trailA[idx]     + falloff * 1.0);
      trailA[idx + 1] = min(255, trailA[idx + 1] + falloff * 0.75);
      trailA[idx + 2] = min(255, trailA[idx + 2] + falloff * 0.2);
    }
  }
}

function getFlowAngle(px, py, t) {
  return noise(px * flowScale, py * flowScale, t) * TWO_PI * 2;
}

function hsb2rgb(h, s, v) {
  h = ((h % 1) + 1) % 1;
  const i = floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r, g, b;
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return [r * 255, g * 255, b * 255];
}

// Prey agent: follows cyan pheromone trails, flees from predator (red) trails, reproduces
class PreyAgent {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.angle = random(TWO_PI);
  }
  
  sense(angleOffset) {
    const a = this.angle + angleOffset;
    const sx = (floor(this.x + cos(a) * sensorOffset) + width) % width;
    const sy = (floor(this.y + sin(a) * sensorOffset) + height) % height;
    const idx = (sx + sy * width) * 3;
    return trailA[idx + 1] + trailA[idx + 2];
  }
  
  senseDanger(angleOffset) {
    const a = this.angle + angleOffset;
    const sx = (floor(this.x + cos(a) * preyDangerSenseRange) + width) % width;
    const sy = (floor(this.y + sin(a) * preyDangerSenseRange) + height) % height;
    const idx = (sx + sy * width) * 3;
    return trailA[idx];
  }
  
  update() {
    const fwd = this.sense(0);
    const left = this.sense(-sensorAngle);
    const right = this.sense(sensorAngle);
    
    if (fwd > left && fwd > right) {
      // keep going
    } else if (left > right) {
      this.angle -= turnAngle * 0.5;
    } else if (right > left) {
      this.angle += turnAngle * 0.5;
    } else {
      this.angle += random(-turnAngle, turnAngle);
    }
    
    const dangerFwd = this.senseDanger(0);
    const dangerLeft = this.senseDanger(-sensorAngle);
    const dangerRight = this.senseDanger(sensorAngle);
    const dangerTotal = dangerFwd + dangerLeft + dangerRight;
    
    if (dangerTotal > 0.5) {
      if (dangerFwd > dangerLeft && dangerFwd > dangerRight) {
        this.angle += PI * 0.5 + random(-0.3, 0.3);
      } else if (dangerLeft > dangerRight) {
        this.angle += turnAngle * preyFleeWeight;
      } else {
        this.angle -= turnAngle * preyFleeWeight;
      }
    }
    
    const t = frameCount * flowTimeSpeed;
    const flowA = getFlowAngle(this.x, this.y, t);
    this.angle += sin(flowA - this.angle) * flowStrength * 0.5;
    
    this.x = (this.x + cos(this.angle) * preySpeed + width) % width;
    this.y = (this.y + sin(this.angle) * preySpeed + height) % height;
    
    depositTrail(this.x, this.y, preyColor[0], preyColor[1], preyColor[2], preySpeed);
  }
}

// Predator agent: chases prey trails (cyan), deposits red/magenta trails, self-repels
class PredatorAgent {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.angle = random(TWO_PI);
  }
  
  sense(angleOffset) {
    const a = this.angle + angleOffset;
    const sx = (floor(this.x + cos(a) * predatorSenseRange) + width) % width;
    const sy = (floor(this.y + sin(a) * predatorSenseRange) + height) % height;
    const idx = (sx + sy * width) * 3;
    const preySignal = trailA[idx + 1] + trailA[idx + 2];
    const selfSignal = trailA[idx];
    return preySignal - selfSignal * predatorSelfRepelWeight;
  }
  
  update() {
    const fwd = this.sense(0);
    const left = this.sense(-sensorAngle);
    const right = this.sense(sensorAngle);
    
    if (fwd > left && fwd > right) {
      // keep going
    } else if (left > right) {
      this.angle -= turnAngle;
    } else if (right > left) {
      this.angle += turnAngle;
    } else {
      this.angle += random(-turnAngle, turnAngle);
    }
    
    const t = frameCount * flowTimeSpeed;
    const flowA = getFlowAngle(this.x, this.y, t);
    this.angle += sin(flowA - this.angle) * flowStrength * 0.3;
    
    this.x = (this.x + cos(this.angle) * predatorSpeed + width) % width;
    this.y = (this.y + sin(this.angle) * predatorSpeed + height) % height;
    
    depositTrail(this.x, this.y, predatorColor[0], predatorColor[1], predatorColor[2], predatorSpeed);
  }
}

function draw() {
  const w = width;
  const h = height;
  const decayRate = 0.965;
  const diffuseWeight = 0.3;
  
  // --- Diffuse and decay trail map into trailB ---
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (x + y * w) * 3;
      for (let c = 0; c < 3; c++) {
        const center = trailA[idx + c];
        const sum = 
          trailA[((x-1) + (y-1) * w) * 3 + c] +
          trailA[((x)   + (y-1) * w) * 3 + c] +
          trailA[((x+1) + (y-1) * w) * 3 + c] +
          trailA[((x-1) + (y)   * w) * 3 + c] +
          trailA[((x+1) + (y)   * w) * 3 + c] +
          trailA[((x-1) + (y+1) * w) * 3 + c] +
          trailA[((x)   + (y+1) * w) * 3 + c] +
          trailA[((x+1) + (y+1) * w) * 3 + c];
        const avg = sum / 8.0;
        trailB[idx + c] = (center * (1 - diffuseWeight) + avg * diffuseWeight) * decayRate;
      }
    }
  }
  
  // Swap trail buffers
  let tmp = trailA;
  trailA = trailB;
  trailB = tmp;
  
  // --- Update agents ---
  for (let i = 0; i < preyAgents.length; i++) {
    preyAgents[i].update();
  }
  for (let i = 0; i < predatorAgents.length; i++) {
    predatorAgents[i].update();
  }
  
  // --- Predation: predators catch nearby prey, emit burst ---
  for (let i = predatorAgents.length - 1; i >= 0; i--) {
    const pred = predatorAgents[i];
    for (let j = preyAgents.length - 1; j >= 0; j--) {
      const prey = preyAgents[j];
      const dx = pred.x - prey.x;
      const dy = pred.y - prey.y;
      if (dx * dx + dy * dy < catchRadius * catchRadius) {
        // Death burst
        depositBurst(prey.x, prey.y, 8, 60);
        bursts.push({ x: prey.x, y: prey.y, life: 30, maxLife: 30 });
        preyAgents.splice(j, 1);
        break;
      }
    }
  }
  
  // --- Population dynamics: reproduction and starvation ---
  // Prey reproduce
  const newPrey = [];
  for (let i = 0; i < preyAgents.length; i++) {
    if (random() < preyReproduceChance && preyAgents.length + newPrey.length < 8000) {
      const p = new PreyAgent();
      p.x = preyAgents[i].x + random(-5, 5);
      p.y = preyAgents[i].y + random(-5, 5);
      newPrey.push(p);
    }
  }
  preyAgents = preyAgents.concat(newPrey);
  
  // Predators starve
  for (let i = predatorAgents.length - 1; i >= 0; i--) {
    if (random() < predatorStarveChance && predatorAgents.length > 100) {
      predatorAgents.splice(i, 1);
    }
  }
  
  // Predators reproduce when prey are plentiful
  if (preyAgents.length > 2000 && predatorAgents.length < 2000) {
    if (random() < 0.01) {
      predatorAgents.push(new PredatorAgent());
    }
  }
  
  // Ensure minimum prey population
  if (preyAgents.length < 500) {
    for (let i = 0; i < 10; i++) {
      preyAgents.push(new PreyAgent());
    }
  }
  
  // --- Update burst particles ---
  for (let i = bursts.length - 1; i >= 0; i--) {
    bursts[i].life--;
    if (bursts[i].life > 20) {
      depositBurst(bursts[i].x, bursts[i].y
