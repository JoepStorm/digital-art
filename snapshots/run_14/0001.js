// Iteration 1: The Weaver - Introduced chromatic divergence by splitting the single grid into two interacting species (Cyan and Magenta)

const res = 4;
const fade = 0.08;
const pad = 12;
let grid, next, cols, rows;
let typeGrid; // 0 for Species A (Cyan), 1 for Species B (Magenta)
let pGrid, sat, pCols, pRows;

// Box ring neighborhoods [innerR, outerR] (Chebyshev distance)
const rings = [[0, 1], [3, 5], [7, 10]];

// Precompute ring areas
const areas = rings.map(([r1, r2]) =>
  (2 * r2 + 1) ** 2 - (r1 > 0 ? (2 * (r1 - 1) + 1) ** 2 : 1)
);

// Rules differ slightly by species to encourage asymmetry
const rulesA = [
  [0, 0.19, 0.31, 1],
  [0, 0.48, 0.82, 0],
  [1, 0.23, 0.45, 1],
  [1, 0.03, 0.12, 0],
  [2, 0.17, 0.33, 1],
  [2, 0.01, 0.09, 0],
];

const rulesB = [
  [0, 0.15, 0.35, 1],
  [0, 0.40, 0.70, 0],
  [1, 0.20, 0.40, 1],
  [1, 0.05, 0.15, 0],
  [2, 0.15, 0.38, 1],
  [2, 0.02, 0.12, 0],
];

function setup() {
  createCanvas(1600, 900);
  pixelDensity(1);
  cols = floor(width / res);
  rows = floor(height / res);
  pCols = cols + 2 * pad;
  pRows = rows + 2 * pad;
  grid = new Float32Array(cols * rows);
  next = new Float32Array(cols * rows);
  typeGrid = new Int8Array(cols * rows);
  pGrid = new Float32Array(pCols * pRows);
  sat = new Float64Array((pCols + 1) * (pRows + 1));

  // Seed two distinct colonies
  let cx = floor(cols / 2), cy = floor(rows / 2), seedR = 40;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let dx = x - cx;
      let dy = y - cy;
      let distSq = dx * dx + dy * dy;
      if (distSq < seedR * seedR) {
        grid[x + y * cols] = random() < 0.5 ? 1 : 0;
        // Divide the world into two species zones
        typeGrid[x + y * cols] = (x < cx) ? 0 : 1;
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
  for (let y = 0; y < rows; y++) {
    let py = y + pad;
    for (let x = 0; x < cols; x++) {
      let idx = x + y * cols;
      let state = grid[idx];
      let type = typeGrid[idx];
      let px = x + pad;

      let target = state;
      let activeRules = (type === 0) ? rulesA : rulesB;
      
      for (let [ri, lo, hi, s] of activeRules) {
        let avg = ringAvg(px, py, ri);
        if (avg >= lo && avg <= hi) { target = s; break; }
      }
      
      next[idx] = state + (target - state) * fade;
      
      // Dynamic type switching: if a cell is very active, it might switch species
      if (state > 0.9 && random() < 0.001) {
        typeGrid[idx] = 1 - type;
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
    for (let x = 0; x < cols; x++) {
      let v = grid[x + y * cols];
      let type = typeGrid[x + y * cols];
      
      // Species A is Cyan-ish, Species B is Magenta-ish
      let r = type === 0 ? v * 20 : v * 255;
      let g = type === 0 ? v * 200 : v * 40;
      let b = type === 0 ? v * 255 : v * 200;

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
