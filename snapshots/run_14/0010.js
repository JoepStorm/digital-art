// Iteration 1: The Weaver - Introduced chromatic divergence by splitting the single grid into two interacting species (Cyan and Magenta)
// Iteration 2: The Prism - Integrated a "Neutral" yellow species that mediates boundaries and allows for tri-color complex behaviors
// Iteration 3: The Pulse - Introduced a global oscillatory temporal field that modulates the growth fade rate, causing the patterns to breathe and ripple over time
// Iteration 4: The Rift - Introduced a spatial torsion field that warps the cellular growth into swirling architectural lattices
// Iteration 5: The Architect - Introduced a feedback-driven neighborhood bias that crystallizes the organic swirls into rigid, rectilinear architectural modules
// Iteration 6: The Weaver - Introduced a scanline-based interference pattern that modulates pixel luminosity to create a retro-digital tapestry effect
// Iteration 7: The Alchemist - Introduced a transmutative decay field where cells change their fundamental species based on local density peaks
// Iteration 8: The Cartographer - Introduced a subtle topographic gradient that shifts the cellular rules based on the pixel's distance from the screen center
// Iteration 9: The Ghost - Introduced a feedback loop where the simulation samples its own previous state's velocity, creating phantom-like trails and directional flow
// Iteration 10: The Resonance - Introduced a harmonic frequency field that syncs cell growth with an invisible wave pattern
const res = 4;
const pad = 12;
let grid, next, cols, rows;
let typeGrid; // 0: Cyan (A), 1: Magenta (B), 2: Yellow (C)
let pGrid, sat, pCols, pRows;
let prevGrid; 

const rings = [[0, 1], [3, 5], [7, 10]];

const areas = rings.map(([r1, r2]) =>
  (2 * r2 + 1) ** 2 - (r1 > 0 ? (2 * (r1 - 1) + 1) ** 2 : 1)
);

const rulesA = [[0, 0.19, 0.31, 1], [0, 0.48, 0.82, 0], [1, 0.23, 0.45, 1], [1, 0.03, 0.12, 0], [2, 0.17, 0.33, 1], [2, 0.01, 0.09, 0]];
const rulesB = [[0, 0.15, 0.35, 1], [0, 0.40, 0.70, 0], [1, 0.20, 0.40, 1], [1, 0.05, 0.15, 0], [2, 0.15, 0.38, 1], [2, 0.02, 0.12, 0]];
const rulesC = [[0, 0.10, 0.45, 1], [1, 0.25, 0.55, 1], [2, 0.05, 0.20, 0]];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  cols = floor(width / res);
  rows = floor(height / res);
  pCols = cols + 2 * pad;
  pRows = rows + 2 * pad;
  grid = new Float32Array(cols * rows);
  next = new Float32Array(cols * rows);
  prevGrid = new Float32Array(cols * rows);
  typeGrid = new Int8Array(cols * rows);
  pGrid = new Float32Array(pCols * pRows);
  sat = new Float64Array((pCols + 1) * (pRows + 1));

  let cx = floor(cols / 2), cy = floor(rows / 2), seedR = 50;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let dx = x - cx;
      let dy = y - cy;
      let distSq = dx * dx + dy * dy;
      if (distSq < seedR * seedR) {
        grid[x + y * cols] = random() < 0.5 ? 1 : 0;
        let angle = atan2(dy, dx);
        if (angle < -PI/3) typeGrid[x + y * cols] = 0;
        else if (angle < PI/3) typeGrid[x + y * cols] = 1;
        else typeGrid[x + y * cols] = 2;
      }
    }
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
  let x1 = px - r, y1 = py - r, x2 = px + r + 1, y2 = py + r + 1;
  return sat[x2 + y2 * w] - sat[x1 + y2 * w] - sat[x2 + y1 * w] + sat[x1 + y1 * w];
}

function ringAvg(px, py, ri) {
  let [r1, r2] = rings[ri];
  let sum = r1 > 0
    ? boxSum(px, py, r2) - boxSum(px, py, r1 - 1)
    : boxSum(px, py, r2) - pGrid[px + py * pCols];
  return sum / areas[ri];
}

function step() {
  buildSAT();
  // Global harmonic resonance pulse
  let resWave = 0.5 + 0.5 * sin(frameCount * 0.05);
  let currentFade = 0.04 + 0.12 * resWave; 
  let midX = cols / 2, midY = rows / 2;
  let maxDist = dist(0, 0, midX, midY);
  
  for (let y = 0; y < rows; y++) {
    let py = y + pad;
    for (let x = 0; x < cols; x++) {
      let idx = x + y * cols;
      let state = grid[idx];
      let type = typeGrid[idx];
      
      let velocity = state - prevGrid[idx];
      let ghostShift = velocity * 12.0;

      // Distance from center determines frequency phase
      let distFactor = dist(x, y, midX, midY);
      let harmonic = sin(distFactor * 0.1 - frameCount * 0.1) * 0.05;

      let d = distFactor / maxDist;
      let thresholdShift = d * 0.08 + harmonic;

      let n = noise(x * 0.015, y * 0.015, frameCount * 0.005);
      let angle = floor(n * 4) * HALF_PI;
      let ox = cos(angle) * 2.5 + ghostShift;
      let oy = sin(angle) * 2.5 + ghostShift;
      let px = x + pad + ox;
      let transformedPy = py + oy;

      let target = state;
      let activeRules = (type === 0) ? rulesA : (type === 1 ? rulesB : rulesC);
      let localDensity = ringAvg(floor(px), floor(transformedPy), 2);

      for (let rule of activeRules) {
        let ri = rule[0], lo = rule[1] - thresholdShift, hi = rule[2] + thresholdShift, s = rule[3];
        let avg = ringAvg(floor(px), floor(transformedPy), ri);
        if (avg >= lo && avg <= hi) { target = s; break; }
      }
      
      prevGrid[idx] = state; 
      next[idx] = state + (target - state) * (currentFade + harmonic);
      
      if (localDensity > 0.88 && random() < 0.01) {
        typeGrid[idx] = (type + 1) % 3;
      } else if (state < 0.1 && random() < 0.003) {
        let sampleX = (x + floor(random(-3, 4)) + cols) % cols;
        let sampleY = (y + floor(random(-3, 4)) + rows) % rows;
        if (grid[sampleX + sampleY * cols] > 0.5) {
            typeGrid[idx] = typeGrid[sampleX + sampleY * cols];
        }
      }
    }
  }
  [grid, next] = [next, grid];
}

function draw() {
  step();
  step();

  loadPixels();
  for (let y = 0; y < rows; y++) {
    let rowStart = y * res * width;
    // Scanline interference modulated by the resonance wave
    let waveMod = 0.5 + 0.5 * sin(y * 0.5 + frameCount * 0.1);
    let scanline = (y % 2 === 0) ? 1.0 : (0.2 + 0.3 * waveMod);
    for (let x = 0; x < cols; x++) {
      let v = grid[x + y * cols] * scanline;
      let type = typeGrid[x + y * cols];
      
      let r = 0, g = 0, b = 0;
      if (type === 0) { r = v * 15; g = v * 210; b = v * 255; }
      else if (type === 1) { r = v * 255; g = v * 20; b = v * 180; }
      else { r = v * 255; g = v * 230; b = v * 30; }

      let xOffset = x * res;
      for (let py = 0; py < res; py++) {
        let rowIdx = (rowStart + py * width + xOffset) * 4;
        for (let px = 0; px < res; px++) {
          let pi = rowIdx + px * 4;
          pixels[pi] = r;
          pixels[pi + 1] = g;
          pixels[pi + 2] = b;
          pixels[pi + 3] = 255;
        }
      }
    }
  }
  updatePixels();
}
