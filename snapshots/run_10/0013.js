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

// Flow field parameters — Perlin noise drives a gentle current across the canvas
const flowScale = 0.003;
const flowStrength = 0.35;
const flowTimeSpeed = 0.0008;

let preyAgents, predatorAgents;
let trailA, trailB;

// Burst particles emitted at predation events
let bursts = [];

// Running average of population centers of mass for vein effect
let preyCenterX = 0, preyCenterY = 0;
let predCenterX = 0, predCenterY = 0;

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
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

function draw() {
  const w = width;
  const h = height;
  const decayRate = 0.965;
  const diffuseWeight = 0.3;
  
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
  
  for (let i = bursts.length - 1; i >= 0; i--) {
    let b = bursts[i];
    b.age++;
    b.radius += 0.8;
    b.intensity *= 0.82;
    depositBurst(b.x, b.y, floor(b.radius), b.intensity);
    if (b.intensity < 0.5 || b.age > 30) {
      bursts.splice(i, 1);
    }
  }
  
  // Compute smoothed centers of mass for both populations
  let pxSum = 0, pySum = 0;
  const preyLen = preyAgents.length;
  // Sample for performance
  const preySample = min(preyLen, 500);
  for (let i = 0; i < preySample; i++) {
    const idx = floor(random(preyLen));
    pxSum += preyAgents[idx].x;
    pySum += preyAgents[idx].y;
  }
  if (preySample > 0) {
    preyCenterX = lerp(preyCenterX, pxSum / preySample, 0.05);
    preyCenterY = lerp(preyCenterY, pySum / preySample, 0.05);
  }
  
  let pdxSum = 0, pdySum = 0;
  const predLen = predatorAgents.length;
  const predSample = min(predLen, 300);
  for (let i = 0; i < predSample; i++) {
    const idx = floor(random(predLen));
    pdxSum += predatorAgents[idx].x;
    pdySum += predatorAgents[idx].y;
  }
  if (predSample > 0) {
    predCenterX = lerp(predCenterX, pdxSum / predSample, 0.05);
    predCenterY = lerp(predCenterY, pdySum / predSample, 0.05);
  }
  
  const ratio = predatorAgents.length / max(1, preyAgents.length);
  const pulse = 1.0 + 0.15 * sin(frameCount * 0.03) * (1 + ratio);
  
  const breathPhase = frameCount * 0.005;
  const predatorPressure = constrain(predatorAgents.length / 1500, 0, 1);
  
  const topR = 2 + predatorPressure * 8;
  const topG = 3 + sin(breathPhase) * 2;
  const topB = 12 + sin(breathPhase * 0.7) * 4;
  
  const botR = 4 + predatorPressure * 15;
  const botG = 1;
  const botB = 6 + (1 - predatorPressure) * 6;
  
  // Vein wave parameters — concentric sine-distorted rings emanate from population centers
  const veinTime = frameCount * 0.02;
  const veinFreq = 0.04;       // radial frequency of the rings
  const veinAngularWarp = 6;   // number of angular undulations
  const veinIntensity = constrain(3.0 + sin(frameCount * 0.01) * 1.5, 1.0, 5.0);
  
  loadPixels();
  for (let y = 0; y < h; y++) {
    const yFrac = y / h;
    const gradT = yFrac * yFrac;
    const bgR = topR + (botR - topR) * gradT;
    const bgG = topG + (botG - topG) * gradT;
    const bgB = topB + (botB - topB) * gradT;
    
    for (let x = 0; x < w; x++) {
      const i = (x + y * w) * 4;
      const j = (x + y * w) * 3;
      
      let r = trailA[j] * pulse;
      let g = trailA[j + 1] * pulse;
      let b = trailA[j + 2] * pulse;
      
      const trR = min(255, r + r * r * 0.004);
      const trG = min(255, g + g * g * 0.004);
      const trB = min(255, b + b * b * 0.004);
      
      // Compute vein overlay from prey center — cyan-tinted veins
      const dxPrey = x - preyCenterX;
      const dyPrey = y - preyCenterY;
      const distPrey = sqrt(dxPrey * dxPrey + dyPrey * dyPrey);
      const anglePrey = atan2(dyPrey, dxPrey);
      // Radial wave with angular distortion creates organic vein-like pattern
      const warpPrey = sin(anglePrey * veinAngularWarp + veinTime * 0.7) * 15;
      const veinPrey = pow(max(0, sin((distPrey + warpPrey) * veinFreq - veinTime)), 12);
      // Fade out with distance from center
      const fadePrey = exp(-distPrey * distPrey / (300 * 300));
      const vp = veinPrey * fadePrey * veinIntensity;
      
      // Compute vein overlay from predator center — magenta-tinted veins
      const dxPred = x - predCenterX;
      const dyPred = y - predCenterY;
      const distPred = sqrt(dxPred * dxPred + dyPred * dyPred);
      const anglePred = atan2(dyPred, dxPred);
      const warpPred = sin(anglePred * (veinAngularWarp + 2) - veinTime * 0.5) * 12;
      const veinPred = pow(max(0, sin((distPred + warpPred) * veinFreq * 0.8 + veinTime * 1.2)), 12);
      const fadePred = exp(-distPred * distPred / (250 * 250));
      const vd = veinPred * fadePred * veinIntensity * predatorPressure;
      
      // Add vein glow to background — prey veins are cyan, predator veins are magenta/rose
      const veinR = vd * 4.0;
      const veinG = vp * 3.0 + vd * 0.5;
      const veinB = vp * 3.5 + vd * 2.5;
      
      pixels[i]     = min(255, bgR + trR + veinR);
      pixels[i + 1] = min(255, bgG + trG + veinG);
      pixels[i + 2] = min(255, bgB + trB + veinB);
      pixels[i + 3] = 255;
    }
  }
  
  const flowTime = frameCount * flowTimeSpeed;
  
  for (let step = 0; step < 5; step++) {
    preyAgents.forEach(e => e.updateDirection(flowTime));
    preyAgents.forEach(e => e.updatePosition(flowTime));
    predatorAgents.forEach(e => e.updateDirection(flowTime));
    predatorAgents.forEach(e => e.updatePosition(flowTime));
  }
  
  updatePixels();

  handleInteractions();

  noStroke();
  fill(255, 160);
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
        
        bursts.push({
          x: preyAgents[q].x,
          y: preyAgents[q].y,
          radius: 2,
          intensity: 60,
          age: 0
        });
        
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
    preyAg
