// Inspired by Jason
// Iteration 1: Symbiogenesis - Two populations: cyan prey that flee and leave fading trails, magenta predators that chase prey and leave bright trails, with oscillating populations
// Iteration 2: Luminous Drift - Add trail diffusion/blur pass for organic glowing tendrils instead of scattered dots
// Iteration 3: Bioluminescent Currents - Replace expensive BLUR filter with manual 3x3 kernel diffusion on pixel data for smoother organic tendrils and better performance, plus add subtle pulsing glow intensity tied to population ratio
// Iteration 4: Phosphor Bloom - Increase deposit intensity by having agents write to a 3x3 area instead of single pixel, creating thicker luminous trails that diffusion can spread into proper tendrils
// Iteration 5: Coral Reef - Add prey flee behavior so prey actively steer away from nearby predator trails (red channel), creating dramatic chase patterns and emergent swarm structures
// Iteration 6: Borealis Veil - Add a translucent dark overlay each frame instead of pure trail persistence, creating comet-like fading tails and revealing the chase dynamics more clearly against deeper blacks
// Iteration 7: Murmuration - Add predator repulsion from own trails to prevent clumping, creating sweeping hunt formations that fan out and encircle prey swarms
// Iteration 8: Spectral Wake - Add velocity-dependent trail width and color intensity so fast-moving agents leave brilliant streaks while slow ones leave dim spores, creating dramatic comet tails during chases

const preyColor = new Uint8Array([0, 220, 220]);
const predatorColor = new Uint8Array([255, 20, 100]);
const preyNum = 3000;
const predatorNum = 800;
const sensorOffset = 12;
const sensorAngle = Math.PI / 6;
const turnAngle = Math.PI / 5;
const predatorSpeed = 1.4;
const preySpeed = 1.1;
const predatorSenseRange = 18;
const catchRadius = 4;
const preyReproduceChance = 0.002;
const predatorStarveChance = 0.001;

// Prey have an additional danger sensor at longer range to detect predator trails
const preyDangerSenseRange = 28;
const preyFleeWeight = 3.0;

// Predators repel from their own red trails to spread out and form hunting fronts
const predatorSelfRepelWeight = 1.5;

let preyAgents, predatorAgents;
let trailA, trailB;

function setup() {
  createCanvas(1600, 900);
  pixelDensity(1);
  background(0);
  
  const totalPixels = width * height * 3;
  trailA = new Float32Array(totalPixels);
  trailB = new Float32Array(totalPixels);
  
  preyAgents = Array(preyNum).fill().map(() => new PreyAgent());
  predatorAgents = Array(predatorNum).fill().map(() => new PredatorAgent());
}

// Deposit trail with intensity and radius based on agent's current speed/urgency
// Fast or panicked agents leave wide bright streaks; calm agents leave thin dim traces
function depositTrail(px, py, r, g, b, intensity) {
  const ix = floor(px);
  const iy = floor(py);
  // intensity controls both brightness and deposit radius
  const bright = constrain(intensity, 0.3, 2.0);
  const radius = bright > 1.2 ? 2 : 1; // wider trail when moving urgently
  
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      // Skip corners of the 5x5 for a rounder shape
      if (radius === 2 && abs(dx) === 2 && abs(dy) === 2) continue;
      
      let x = (ix + dx + width) % width;
      let y = (iy + dy + height) % height;
      const index = (x + y * width) * 4;
      
      // Distance-based falloff from center
      const dist = sqrt(dx * dx + dy * dy);
      const falloff = max(0, 1.0 - dist / (radius + 0.5)) * bright;
      
      pixels[index]     = min(255, max(pixels[index],     r * falloff));
      pixels[index + 1] = min(255, max(pixels[index + 1], g * falloff));
      pixels[index + 2] = min(255, max(pixels[index + 2], b * falloff));
      pixels[index + 3] = 255;
    }
  }
}

function draw() {
  // Diffuse and decay trails using a 3x3 mean kernel
  const w = width;
  const h = height;
  const decayRate = 0.94;
  const diffuseWeight = 0.25;
  
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
        const avg = sum / 8;
        trailB[idx + c] = (center * (1 - diffuseWeight) + avg * diffuseWeight) * decayRate;
      }
    }
  }
  
  let tmp = trailA;
  trailA = trailB;
  trailB = tmp;
  
  // Population-based pulsing glow
  const ratio = predatorAgents.length / max(1, preyAgents.length);
  const pulse = 1.0 + 0.15 * sin(frameCount * 0.03) * (1 + ratio);
  
  // Render trails to canvas pixels with a non-linear tone curve for richer colors
  loadPixels();
  for (let i = 0, j = 0; i < pixels.length; i += 4, j += 3) {
    let r = trailA[j] * pulse;
    let g = trailA[j + 1] * pulse;
    let b = trailA[j + 2] * pulse;
    
    // Subtle tone mapping: boost mids, keep blacks deep
    pixels[i]     = min(255, r + r * r * 0.003);
    pixels[i + 1] = min(255, g + g * g * 0.003);
    pixels[i + 2] = min(255, b + b * b * 0.003);
    pixels[i + 3] = 255;
  }
  
  // Run simulation steps
  for (let step = 0; step < 5; step++) {
    preyAgents.forEach(e => e.updateDirection());
    preyAgents.forEach(e => e.updatePosition());
    predatorAgents.forEach(e => e.updateDirection());
    predatorAgents.forEach(e => e.updatePosition());
  }
  
  // Write agent deposits back into the trail buffer
  for (let i = 0, j = 0; i < pixels.length; i += 4, j += 3) {
    trailA[j]     = pixels[i];
    trailA[j + 1] = pixels[i + 1];
    trailA[j + 2] = pixels[i + 2];
  }
  
  updatePixels();

  handleInteractions();

  noStroke();
  fill(255, 180);
  textSize(14);
  text(`Prey: ${preyAgents.length}  Predators: ${predatorAgents.length}`, 10, 20);
}

function handleInteractions() {
  let newPrey = [];
  let caughtSet = new Set();

  for (let p = predatorAgents.length - 1; p >= 0; p--) {
    let pred = predatorAgents[p];
    let ate = false;
    for (let q = preyAgents.length - 1; q >= 0; q--) {
      if (caughtSet.has(q)) continue;
      let dx = pred.x - preyAgents[q].x;
      let dy = pred.y - preyAgents[q].y;
      if (dx * dx + dy * dy < catchRadius * catchRadius) {
        caughtSet.add(q);
        ate = true;
        if (predatorAgents.length < 2000) {
          let baby = new PredatorAgent();
          baby.x = pred.x;
          baby.y = pred.y;
          baby.dir = random(TWO_PI);
          predatorAgents.push(baby);
        }
        break;
      }
    }
    if (!ate && random() < predatorStarveChance) {
      predatorAgents.splice(p, 1);
    }
  }

  let sortedCaught = [...caughtSet].sort((a, b) => b - a);
  for (let idx of sortedCaught) {
    preyAgents.splice(idx, 1);
  }

  let len = preyAgents.length;
  for (let i = 0; i < len; i++) {
    if (preyAgents.length < 5000 && random() < preyReproduceChance) {
      let baby = new PreyAgent();
      baby.x = preyAgents[i].x + random(-5, 5);
      baby.y = preyAgents[i].y + random(-5, 5);
      baby.dir = random(TWO_PI);
      newPrey.push(baby);
    }
  }
  preyAgents.push(...newPrey);

  if (preyAgents.length < 200) {
    for (let i = 0; i < 50; i++) preyAgents.push(new PreyAgent());
  }
  if (predatorAgents.length < 50) {
    for (let i = 0; i < 20; i++) predatorAgents.push(new PredatorAgent());
  }
}

// Prey agents: attracted to own cyan/green trails, actively flee from red (predator) trails
// Track turning rate to measure urgency — panicked prey leave brighter, wider trails
class PreyAgent {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.dir = random(TWO_PI);
    this.urgency = 0; // how panicked/fast this agent is turning
  }

  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + sensorOffset * cos(angle));
    let y = floor(this.y + sensorOffset * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;
    const index = (x + y * width) * 4;
    let greenVal = pixels[index + 1];
    let redVal = pixels[index];
    return greenVal - redVal * 2;
  }

  senseDanger(dirOffset) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + preyDangerSenseRange * cos(angle));
    let y = floor(this.y + preyDangerSenseRange * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;
    const index = (x + y * width) * 4;
    return pixels[index];
  }

  updateDirection() {
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    const dangerRight = this.senseDanger(+sensorAngle);
    const dangerCenter = this.senseDanger(0);
    const dangerLeft = this.senseDanger(-sensorAngle);

    const combinedLeft   = left   - dangerLeft   * preyFleeWeight;
    const combinedCenter = center - 0.5 - dangerCenter * preyFleeWeight;
    const combinedRight  = right  - dangerRight  * preyFleeWeight;

    const threeWays = [combinedLeft, combinedCenter, combinedRight];
    const maxIndex = threeWays.indexOf(max(...threeWays));
    const oldDir = this.dir;
    this.dir += turnAngle * (maxIndex - 1);

    const maxDanger = max(dangerRight, dangerCenter, dangerLeft);
    const panicJitter = map(maxDanger, 0, 255, 0.1, 0.5);
    this.dir += random(-panicJitter, panicJitter);
    
    // Track urgency based on danger level — smoothly blend for gradual trail changes
    const dangerNorm = maxDanger / 255.0;
    this.urgency = lerp(this.urgency, dangerNorm * 2.0, 0.15);
  }

  updatePosition() {
    // Panicked prey move faster
    const speed = preySpeed + this.urgency * 0.4;
    this.x += speed * cos(this.dir);
    this.y += speed * sin(this.dir);
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    // Trail intensity scales with urgency — calm prey leave dim traces, fleeing prey leave bright streaks
    const intensity = 0.5 + this.urgency;
    depositTrail(this.x, this.y, preyColor[0], preyColor[1], preyColor[2], intensity);
  }
}

// Predator agents: chase prey by following green/blue trails, repel from own red trails
// Track how strongly they smell prey to modulate trail intensity — hot pursuit = bright streaks
class PredatorAgent {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.dir = random(TWO_PI);
    this.excitement = 0; // how much prey trail they're sensing
  }

  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + predatorSenseRange * cos(angle));
    let y = floor(this.y + predatorSenseRange * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;
    const index = (x + y * width) * 4;
    let redVal = pixels[index];
    let greenVal = pixels[index + 1];
    let blueVal = pixels[index + 2];
    return (greenVal + blueVal * 0.5) - redVal * predatorSelfRepelWeight;
  }

  updateDirection() {
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    const threeWays = [left, center - 0.5, right];
    const maxIndex = threeWays.indexOf(max(...threeWays));
    this.dir += turnAngle * (maxIndex - 1);
    this.dir += random(-0.05, 0.05);
    
    // Track excitement based on how strong the best signal is
    const bestSignal = max(...threeWays);
    const exciteNorm = constrain(bestSignal / 200.0, 0, 1);
    this.excitement = lerp(this.excitement, exciteNorm * 2.0, 0.1);
  }

  updatePosition() {
    // Excited predators move faster when on the hunt
    const speed = predatorSpeed + this.excitement * 0.3;
    this.x += speed * cos(this.dir);
    this.y += speed * sin(this.dir);
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    // Trail intensity scales with excitement — searching predators are dim, hunting ones are blazing
    const intensity = 0.4 + this.excitement;
    depositTrail(this.x, this.y, 255, predatorColor[1], predatorColor[2], intensity);
  }
}
