// Inspired by Jason
// Iteration 1: Symbiogenesis - Two populations: cyan prey that flee and leave fading trails, magenta predators that chase prey and leave bright trails, with oscillating populations
// Iteration 2: Luminous Drift - Add trail diffusion/blur pass for organic glowing tendrils instead of scattered dots
// Iteration 3: Bioluminescent Currents - Replace expensive BLUR filter with manual 3x3 kernel diffusion on pixel data for smoother organic tendrils and better performance, plus add subtle pulsing glow intensity tied to population ratio
// Iteration 4: Phosphor Bloom - Increase deposit intensity by having agents write to a 3x3 area instead of single pixel, creating thicker luminous trails that diffusion can spread into proper tendrils
// Iteration 5: Coral Reef - Add prey flee behavior so prey actively steer away from nearby predator trails (red channel), creating dramatic chase patterns and emergent swarm structures
// Iteration 6: Borealis Veil - Add a translucent dark overlay each frame instead of pure trail persistence, creating comet-like fading tails and revealing the chase dynamics more clearly against deeper blacks

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

let preyAgents, predatorAgents;
let trailA, trailB;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(0);
  
  const totalPixels = width * height * 3;
  trailA = new Float32Array(totalPixels);
  trailB = new Float32Array(totalPixels);
  
  preyAgents = Array(preyNum).fill().map(() => new PreyAgent());
  predatorAgents = Array(predatorNum).fill().map(() => new PredatorAgent());
}

// Helper to deposit color in a 3x3 block around a position for thicker, more visible trails
function depositTrail(px, py, r, g, b) {
  const ix = floor(px);
  const iy = floor(py);
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      let x = (ix + dx + width) % width;
      let y = (iy + dy + height) % height;
      const index = (x + y * width) * 4;
      // Center pixel gets full intensity, neighbors get softer deposit
      const falloff = (dx === 0 && dy === 0) ? 1.0 : 0.5;
      pixels[index]     = min(255, max(pixels[index],     r * falloff));
      pixels[index + 1] = min(255, max(pixels[index + 1], g * falloff));
      pixels[index + 2] = min(255, max(pixels[index + 2], b * falloff));
      pixels[index + 3] = 255;
    }
  }
}

function draw() {
  // Diffuse and decay trails using a 3x3 mean kernel
  // Stronger diffusion creates broader, smoother tendrils
  const w = width;
  const h = height;
  const decayRate = 0.94;       // Slightly faster decay for cleaner trails
  const diffuseWeight = 0.25;   // Stronger diffusion for more organic spread
  
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
    // Apply a slight gamma boost to make mid-tones glow more warmly
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
// They sense danger at a longer range and steer away, creating dramatic evasion patterns
class PreyAgent {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.dir = random(TWO_PI);
  }

  // Sense attraction to own trails (green channel)
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

  // Sense danger (red channel from predator trails) at longer range
  senseDanger(dirOffset) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + preyDangerSenseRange * cos(angle));
    let y = floor(this.y + preyDangerSenseRange * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;
    const index = (x + y * width) * 4;
    return pixels[index]; // red channel = predator presence
  }

  updateDirection() {
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    // Danger sensing: read predator trail intensity at each direction
    const dangerRight = this.senseDanger(+sensorAngle);
    const dangerCenter = this.senseDanger(0);
    const dangerLeft = this.senseDanger(-sensorAngle);

    // Combine attraction to own trails with repulsion from predator trails
    // Flee by subtracting danger * weight — prey steer AWAY from red
    const combinedLeft   = left   - dangerLeft   * preyFleeWeight;
    const combinedCenter = center - 0.5 - dangerCenter * preyFleeWeight;
    const combinedRight  = right  - dangerRight  * preyFleeWeight;

    const threeWays = [combinedLeft, combinedCenter, combinedRight];
    const maxIndex = threeWays.indexOf(max(...threeWays));
    this.dir += turnAngle * (maxIndex - 1);

    // When danger is high, add more random jitter to simulate panic
    const maxDanger = max(dangerRight, dangerCenter, dangerLeft);
    const panicJitter = map(maxDanger, 0, 255, 0.1, 0.5);
    this.dir += random(-panicJitter, panicJitter);
  }

  updatePosition() {
    this.x += preySpeed * cos(this.dir);
    this.y += preySpeed * sin(this.dir);
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    // Deposit a 3x3 soft glow instead of a single pixel
    depositTrail(this.x, this.y, preyColor[0], preyColor[1], preyColor[2]);
  }
}

// Predator agents: chase prey by following green/blue trails, leave bright magenta trails
class PredatorAgent {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.dir = random(TWO_PI);
  }

  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + predatorSenseRange * cos(angle));
    let y = floor(this.y + predatorSenseRange * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;
    const index = (x + y * width) * 4;
    let greenVal = pixels[index + 1];
    let blueVal = pixels[index + 2];
    return greenVal + blueVal * 0.5;
  }

  updateDirection() {
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    const threeWays = [left, center - 0.5, right];
    const maxIndex = threeWays.indexOf(max(...threeWays));
    this.dir += turnAngle * (maxIndex - 1);
    this.dir += random(-0.05, 0.05);
  }

  updatePosition() {
    this.x += predatorSpeed * cos(this.dir);
    this.y += predatorSpeed * sin(this.dir);
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    // Deposit a 3x3 bright glow for predator trails
    depositTrail(this.x, this.y, 255, predatorColor[1], predatorColor[2]);
  }
}
