// Iteration 1: The Weaver - Introduce oscillating rule modulations to create breathing, organic shifts
// Iteration 2: The Prism Weaver - Introduce spatial-spectral interference for iridescent, shifting wave interference patterns
// Iteration 3: The Chromatic Pulse - Introduce a dynamic reactive core that warps neighborhood radii based on local density
// Iteration 4: The Void Crawler - Introduce a wandering gravitational singularity that locally distorts the cellular growth rules
// Iteration 5: The Weaver - Introduce "Dimensional Torsion" by applying a spiral coordinate transformation to the neighborhood sampling
// Iteration 6: The Spectral Alchemist - Introduce Chromatic Refraction by perturbing color sampling based on local density gradients
// Iteration 7: The Neural Alchemist - Introduce Synaptic Feedback Loops through recursive temporal state modulation
// Iteration 8: The Entropy Alchemist - Introduce Spatio-Temporal Diffusion and Dynamic State Decay
// Iteration 9: The Flux Architect - Introduce Hydrodynamic Velocity Fields for cellular convection
// Iteration 10: The Fractal Weaver - Introduce Recursive Spatial Scaling by modulating neighborhood radii via a multi-octave harmonic noise function
// Iteration 11: The Chrono-Sculptor - Introduce Metamorphic Rule Evolution where the CA ruleset itself oscillates and drifts through a hyperspace of parameters
// Iteration 12: The Void Sculptor - Introduce Gravitational Lens Distortion to the rendering pipeline
// Iteration 13: The Plasma Alchemist - Introduce Ionizing Charge Gradients that induce color-shifting trails based on cellular velocity
// Iteration 14: The Quantum Weaver - Introduce Probabilistic Entanglement for stippled, indeterminate cellular states
// Iteration 15: The Chromatic Flux Architect - Introduce Fluidic Hue Advection and Velocity-Based Color Turbulence
// Iteration 16: The Void Sculptor - Introduce Event Horizon Distortion and Spatio-Temporal Accretion Disks
// Iteration 17: The Weaver - Introduce Interference Luminescence via a high-frequency spatial beat pattern
// Iteration 18: The Weaver - Introduce Bioluminescent Mycelial Tendrils that weave through the cellular grid
// Iteration 19: The Weaver - Introduce "Aetheric Turbulence" where the spatial field ripples and folds using multi-frequency perlin-noise displacement
// Iteration 20: The Neural Weaver - Introduce "Oscillatory Synaptic Plasticity" to the rule set, making neighborhood weights morph via self-organizing resonance
const res = 4;
const fade = 0.22;
const pad = 12;
let grid, next, cols, rows;
let pGrid, sat, pCols, pRows;
let history = []; 
let flowX, flowY; 
let charge; 
let tendrils = [];

const rings = [[0, 1], [3, 5], [7, 10]];

// Base rules that define the cellular growth logic
let rules = [
  [0, 0.19, 0.31, 1],
  [0, 0.48, 0.82, 0.2],
  [1, 0.23, 0.38, 0.9],
  [1, 0.03, 0.12, 0.1],
  [2, 0.17, 0.33, 0.8],
  [2, 0.01, 0.09, 0],
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  cols = floor(width / res);
  rows = floor(height / res);
  pCols = cols + 2 * pad;
  pRows = rows + 2 * pad;
  grid = new Float32Array(cols * rows);
  next = new Float32Array(cols * rows);
  flowX = new Float32Array(cols * rows);
  flowY = new Float32Array(cols * rows);
  charge = new Float32Array(cols * rows).fill(0);
  pGrid = new Float32Array(pCols * pRows);
  sat = new Float64Array((pCols + 1) * (pRows + 1));

  let cx = floor(cols / 2), cy = floor(rows / 2), seedR = 25;
  for (let dy = -seedR; dy <= seedR; dy++)
    for (let dx = -seedR; dx <= seedR; dx++)
      if (dx * dx + dy * dy < seedR * seedR)
        grid[(cx + dx) + (cy + dy) * cols] = random() < 0.6 ? 1 : 0;
  
  for(let i=0; i<40; i++) history.push(new Float32Array(cols * rows).fill(0));
  
  for(let i=0; i<12; i++) {
    tendrils.push({
      x: random(cols), 
      y: random(rows), 
      vx: random(-1,1), 
      vy: random(-1,1), 
      life: random(100),
      hue: random(TWO_PI)
    });
  }
}

function buildSAT() {
  for (let y = 0; y < pRows; y++) {
    let gy = ((y - pad) % rows + rows) % rows;
    for (let x = 0; x < pCols; x++) {
      let gx = ((x - pad) % cols + cols) % cols;
      pGrid[x + y * pCols] = grid[gx + gy * cols];
    }
  }
  let w = pCols + 1;
  sat.fill(0);
  for (let y = 1; y <= pRows; y++) {
    let rowSum = 0;
    for (let x = 1; x <= pCols; x++) {
      rowSum += pGrid[(x - 1) + (y - 1) * pCols];
      sat[x + y * w] = rowSum + sat[x + (y - 1) * w];
    }
  }
}

function boxSum(px, py, r) {
  let w = pCols + 1;
  r = Math.min(Math.floor(r), pad - 1);
  let x1 = px - r, y1 = py - r, x2 = px + r + 1, y2 = py + r + 1;
  return sat[x2 + y2 * w] - sat[x1 + y2 * w] - sat[x2 + y1 * w] + sat[x1 + y1 * w];
}

function ringAvg(px, py, ri, warp) {
  let [r1, r2] = rings[ri];
  let wr1 = Math.max(0, Math.floor(r1 * warp));
  let wr2 = Math.max(1, Math.floor(r2 * warp));
  let sum = wr1 > 0
    ? boxSum(px, py, wr2) - boxSum(px, py, wr1 - 1)
    : boxSum(px, py, wr2) - pGrid[px + py * pCols];
  let area = (2 * wr2 + 1) ** 2 - (wr1 > 0 ? (2 * (wr1 - 1) + 1) ** 2 : 1);
  return area > 0 ? sum / area : 0;
}

function step() {
  buildSAT();
  let metaT = frameCount * 0.005;
  // Oscillatory Synaptic Plasticity: Harmonically modulating weights of different neighborhoods
  let ringWeights = [
    0.5 + 0.5 * sin(metaT * 1.1),
    0.5 + 0.5 * cos(metaT * 0.9),
    0.5 + 0.5 * sin(metaT * 0.4 + PI/2)
  ];
  let ruleMod = [sin(metaT) * 0.05, cos(metaT * 0.7) * 0.1, sin(metaT * 1.3) * 0.15];
  let timeShift = sin(frameCount * 0.012) * 0.08;
  let singX = (cols / 2) + (cols / 3) * sin(frameCount * 0.01) * cos(frameCount * 0.004);
  let singY = (rows / 2) + (rows / 3) * cos(frameCount * 0.008) * sin(frameCount * 0.003);
  let torsion = sin(frameCount * 0.004) * 0.8;
  
  tendrils.forEach(t => {
    let ix = floor(t.x + cols) % cols;
    let iy = floor(t.y + rows) % rows;
    let idx = ix + iy * cols;
    t.vx += (flowX[idx] * 0.1 + (random(-0.1, 0.1)));
    t.vy += (flowY[idx] * 0.1 + (random(-0.1, 0.1)));
    t.vx *= 0.95; t.vy *= 0.95;
    t.x += t.vx; t.y += t.vy;
    grid[idx] = min(1, grid[idx] + 0.1); 
    charge[idx] = min(2, charge[idx] + 1.5); 
  });

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let idx = x + y * cols;
      let dx = x - singX;
      let dy = y - singY;
      let dSing = sqrt(dx*dx + dy*dy);
      let temporalOffset = floor(constrain(40 * exp(-dSing * 0.02), 0, history.length - 1));
      let state = grid[idx];
      let echo = history[temporalOffset][idx];
      
      let gx = (grid[((x + 1) % cols) + y * cols] - grid[((x - 1 + cols) % cols) + y * cols]);
      let gy = (grid[x + ((y + 1) % rows) * cols] - grid[x + ((y - 1 + rows) % rows) * cols]);
      flowX[idx] = lerp(flowX[idx], gy * 3.5 + (dy/dSing || 0) * 0.5, 0.12); 
      flowY[idx] = lerp(flowY[idx], -gx * 3.5 - (dx/dSing || 0) * 0.5, 0.12);
      charge[idx] = lerp(charge[idx], (abs(flowX[idx]) + abs(flowY[idx])), 0.1);
      
      let neighborAvg = (grid[((x+1)%cols) + y*cols] + grid[((x-1+cols)%cols) + y*cols] + grid[x + ((y+1)%rows)*cols] + grid[x + ((y-1+rows)%rows)*cols]) * 0.25;
      let stateSum = state * 0.35 + echo * 0.4 + neighborAvg * 0.25;
      
      let rx = x - cols/2;
      let ry = y - rows/2;
      let distNorm = sqrt(rx*rx + ry*ry) / (cols/2);
      let angleShift = distNorm * torsion * PI * sin(frameCount * 0.002);
      let px = floor(cols/2 + rx * cos(angleShift) - ry * sin(angleShift)) + pad;
      let py = floor(rows/2 + rx * sin(angleShift) + ry * cos(angleShift)) + pad;
      
      let singularityInfluence = 2.5 * exp(-dSing * 0.12); 
      let harmonic = sin(frameCount * 0.02 + distNorm * 5) * 0.5;
      let warp = 1.0 + harmonic + singularityInfluence;
      let target = stateSum;
      
      for (let i = 0; i < rules.length; i++) {
        let [ri, lo, hi, s] = rules[i];
        let avg = ringAvg(px, py, ri, warp);
        // Apply synaptic weight scaling to the neighborhood average
        avg *= ringWeights[ri]; 
        let dynamicLo = lo + timeShift + (singularityInfluence * 0.15) + ruleMod[i % 3];
        let dynamicHi = hi + timeShift - (singularityInfluence * 0.1) + ruleMod[(i+1) % 3];
        if (avg >= dynamicLo && avg <= dynamicHi) { target = s; break; }
      }
      
      let uncertainty = abs(stateSum - target);
      let stipple = (random() < uncertainty * 0.6) ? random(0, 1) : target;
      next[idx] = (stateSum + (stipple - stateSum) * fade) * (0.992 + charge[idx]*0.004);
    }
  }
  history.pop();
  history.unshift(new Float32Array(grid));
  [grid, next] = [next, grid];
}

function draw() {
  step();
  loadPixels();
  let t = frameCount * 0.02;
  let singX = (cols / 2) + (cols / 3) * sin(frameCount * 0.01) * cos(frameCount * 0.004);
  let singY = (rows / 2) + (rows / 3) * cos(frameCount * 0.008) * sin(frameCount * 0.003);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let noiseDispX = noise(x * 0.08, y * 0.08, t * 0.2) * 15 - 7.5;
      let noiseDispY = noise(y * 0.08, x * 0.08, t * 0.2 + 100) * 15 - 7.5;
      
      let dx = x - singX + noiseDispX;
      let dy = y - singY + noiseDispY;
      let d2 = dx*dx + dy*dy;
      let lensFactor = 700 / (d2 + 150);
      let swirl = (0.8 + 0.4 * noise(t * 0.1)) * exp(-d2 * 0.0001);
      let lx = constrain(round(x - dx * lensFactor + dy * swirl), 0, cols - 1);
      let ly = constrain(round(y - dy * lensFactor - dx * swirl), 0, rows - 1);
      
      let idx = lx + ly * cols;
      let val = grid[idx];
      let chg = charge[idx] * 0.8; 
      let gx = (grid[((lx+1)%cols) + ly*cols] - grid[((lx-1+cols)%cols) + ly*cols]);
      let gy = (grid[lx + ((ly+1)%rows)*cols] - grid[lx + ((ly-1+rows)%rows)*cols]);
      let grad = sqrt(gx*gx + gy*gy) * 25;
      
      let radialX = lx - cols/2;
      let radialY = ly - rows/2;
      let rDist = sqrt(radialX*radialX + radialY*radialY);
      let radialAngle = atan2(radialY, radialX);
      
      let interference = sin(lx * 0.5 + t) * cos(ly * 0.5 - t) * (val * 0.4);
      let shear = abs(gx * flowY[idx] - gy * flowX[idx]) * 7.5;
      let huePulse = t + (flowX[idx] * 0.6) + (flowY[idx] * 0.6) + shear + (d2 * 0.00005);
      
      let r = val * (127 + 127 * sin(huePulse + radialAngle + grad + chg + interference));
      let g = val * (127 + 127 * sin(huePulse * 1.4 + radialAngle * 2 - grad * 0.4 + chg * 0.5 + interference * 2));
      let b = val * (127 + 127 * sin(huePulse * 0.7 - radialAngle + (rDist*0.02) - chg + interference * 3));
      
      let filament = chg * 25 * (0.5 + 0.5 * sin(t * 3 + lx * 0.2 + ly * 0.2));
      
      let r8 = constrain(r + grad * 12 + chg * 15 + filament, 0, 255);
      let g8 = constrain(g + grad * 15 + (1.0/lensFactor) * 2 + filament * 0.7, 0, 255);
      let b8 = constrain(b + grad * 20 + chg * 30 + filament * 1.5, 0, 255);
      
      for (let py = 0; py < res; py++) {
        let rowOff = (y * res + py) * width * 4;
        for (let px = 0; px < res; px++) {
          let pi = rowOff + (x * res + px) * 4;
          if (pi < pixels.length) {
            pixels[pi] = r8; pixels[pi+1] = g8; pixels[pi+2] = b8; pixels[pi+3] = 255;
          }
        }
      }
    }
  }
  updatePixels();
}
