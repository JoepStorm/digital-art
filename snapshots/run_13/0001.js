// Iteration 1: The Weaver - Introduce oscillating rule modulations to create breathing, organic shifts

const res = 4;
const fade = 0.08;
const pad = 10;
let grid, next, cols, rows;
let pGrid, sat, pCols, pRows;

// Box ring neighborhoods [innerR, outerR] (Chebyshev distance)
const rings = [[0, 1], [3, 5], [7, 10]];

// Precompute ring areas
const areas = rings.map(([r1, r2]) =>
  (2 * r2 + 1) ** 2 - (r1 > 0 ? (2 * (r1 - 1) + 1) ** 2 : 1)
);

// Rules: [ringIndex, lo, hi, targetState] — base thresholds
const rules = [
  [0, 0.19, 0.31, 1],
  [0, 0.48, 0.82, 0],
  [1, 0.23, 0.38, 1],
  [1, 0.03, 0.12, 0],
  [2, 0.17, 0.33, 1],
  [2, 0.01, 0.09, 0],
];

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  pixelDensity(1);
  cols = floor(width / res);
  rows = floor(height / res);
  pCols = cols + 2 * pad;
  pRows = rows + 2 * pad;
  grid = new Float32Array(cols * rows);
  next = new Float32Array(cols * rows);
  pGrid = new Float32Array(pCols * pRows);
  sat = new Float64Array((pCols + 1) * (pRows + 1));

  // Small seed cluster in the center
  let cx = floor(cols / 2), cy = floor(rows / 2), seedR = 15;
  for (let dy = -seedR; dy <= seedR; dy++)
    for (let dx = -seedR; dx <= seedR; dx++)
      if (dx * dx + dy * dy < seedR * seedR)
        grid[(cx + dx) + (cy + dy) * cols] = random() < 0.5 ? 1 : 0;
}

function buildSAT() {
  // Copy grid into padded grid with wrapping
  for (let y = 0; y < pRows; y++) {
    let gy = ((y - pad) % rows + rows) % rows;
    for (let x = 0; x < pCols; x++) {
      let gx = ((x - pad) % cols + cols) % cols;
      pGrid[x + y * pCols] = grid[gx + gy * cols];
    }
  }
  // Build prefix sums
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
  // Harmonic modulation for thresholds to create evolving patterns
  let timeShift = sin(frameCount * 0.01) * 0.05;
  
  for (let y = 0; y < rows; y++) {
    let py = y + pad;
    for (let x = 0; x < cols; x++) {
      let idx = x + y * cols;
      let state = grid[idx];
      let px = x + pad;

      let target = state;
      for (let [ri, lo, hi, s] of rules) {
        let avg = ringAvg(px, py, ri);
        // Apply temporal modulation to the lo/hi thresholds
        if (avg >= lo + timeShift && avg <= hi + timeShift) { 
          target = s; 
          break; 
        }
      }
      next[idx] = state + (target - state) * fade;
    }
  }
  [grid, next] = [next, grid];
}

function draw() {
  step();
  step();

  loadPixels();
  let t = frameCount * 0.02;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let v = grid[x + y * cols];
      // Color shifts based on state and slow oscillation
      let r = v * (127 + 127 * sin(t));
      let g = v * (127 + 127 * cos(t * 0.7));
      let b = v * (127 + 127 * sin(t * 1.3));
      
      for (let py = 0; py < res; py++) {
        let row = (y * res + py) * width;
        for (let px = 0; px < res; px++) {
          let pi = (row + x * res + px) * 4;
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
