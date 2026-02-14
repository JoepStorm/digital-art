// Iteration 1: The Weaver - Introduced chromatic divergence by splitting the single grid into two interacting species (Cyan and Magenta)
// Iteration 2: The Prism - Integrated a "Neutral" yellow species that mediates boundaries and allows for tri-color complex behaviors

const res = 4;
const fade = 0.08;
const pad = 12;
let grid, next, cols, rows;
let typeGrid; // 0: Cyan (A), 1: Magenta (B), 2: Yellow (C)
let pGrid, sat, pCols, pRows;

const rings = [[0, 1], [3, 5], [7, 10]];

const areas = rings.map(([r1, r2]) =>
  (2 * r2 + 1) ** 2 - (r1 > 0 ? (2 * (r1 - 1) + 1) ** 2 : 1)
);

const rulesA = [[0, 0.19, 0.31, 1], [0, 0.48, 0.82, 0], [1, 0.23, 0.45, 1], [1, 0.03, 0.12, 0], [2, 0.17, 0.33, 1], [2, 0.01, 0.09, 0]];
const rulesB = [[0, 0.15, 0.35, 1], [0, 0.40, 0.70, 0], [1, 0.20, 0.40, 1], [1, 0.05, 0.15, 0], [2, 0.15, 0.38, 1], [2, 0.02, 0.12, 0]];
// Rule C is more "sticky" and stable, acting as a buffer
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
  for (let y = 0; y < rows; y++) {
    let py = y + pad;
    for (let x = 0; x < cols; x++) {
      let idx = x + y * cols;
      let state = grid[idx];
      let type = typeGrid[idx];
      let px = x + pad;

      let target = state;
      let activeRules = (type === 0) ? rulesA : (type === 1 ? rulesB : rulesC);
      
      for (let [ri, lo, hi, s] of activeRules) {
        let avg = ringAvg(px, py, ri);
        if (avg >= lo && avg <= hi) { target = s; break; }
      }
      
      next[idx] = state + (target - state) * fade;
      
      // Inheritance logic: if surrounded by a different type and state is low, swap types
      if (state < 0.1 && random() < 0.002) {
        let sampleX = (x + floor(random(-2, 3)) + cols) % cols;
        let sampleY = (y + floor(random(-2, 3)) + rows) % rows;
        if (grid[sampleX + sampleY * cols] > 0.6) {
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
    for (let x = 0; x < cols; x++) {
      let v = grid[x + y * cols];
      let type = typeGrid[x + y * cols];
      
      let r = 0, g = 0, b = 0;
      if (type === 0) { r = v * 20; g = v * 200; b = v * 255; } // Cyan
      else if (type === 1) { r = v * 255; g = v * 40; b = v * 200; } // Magenta
      else { r = v * 255; g = v * 220; b = v * 40; } // Yellow

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
