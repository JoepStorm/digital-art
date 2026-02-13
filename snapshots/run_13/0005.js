// Iteration 1: The Weaver - Introduce oscillating rule modulations to create breathing, organic shifts
// Iteration 2: The Prism Weaver - Introduce spatial-spectral interference for iridescent, shifting wave interference patterns
// Iteration 3: The Chromatic Pulse - Introduce a dynamic reactive core that warps neighborhood radii based on local density
// Iteration 4: The Void Crawler - Introduce a wandering gravitational singularity that locally distorts the cellular growth rules
// Iteration 5: The Weaver - Introduce "Dimensional Torsion" by applying a spiral coordinate transformation to the neighborhood sampling
const res = 4;
const fade = 0.15;
const pad = 12;
let grid, next, cols, rows;
let pGrid, sat, pCols, pRows;

const rings = [[0, 1], [3, 5], [7, 10]];

const areas = rings.map(([r1, r2]) =>
  (2 * r2 + 1) ** 2 - (r1 > 0 ? (2 * (r1 - 1) + 1) ** 2 : 1)
);

const rules = [
  [0, 0.19, 0.31, 1],
  [0, 0.48, 0.82, 0],
  [1, 0.23, 0.38, 1],
  [1, 0.03, 0.12, 0],
  [2, 0.17, 0.33, 1],
  [2, 0.01, 0.09, 0],
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
  pGrid = new Float32Array(pCols * pRows);
  sat = new Float64Array((pCols + 1) * (pRows + 1));

  let cx = floor(cols / 2), cy = floor(rows / 2), seedR = 15;
  for (let dy = -seedR; dy <= seedR; dy++)
    for (let dx = -seedR; dx <= seedR; dx++)
      if (dx * dx + dy * dy < seedR * seedR)
        grid[(cx + dx) + (cy + dy) * cols] = random() < 0.5 ? 1 : 0;
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
  r = Math.min(r, pad - 1);
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
  return sum / area;
}

function step() {
  buildSAT();
  let timeShift = sin(frameCount * 0.01) * 0.05;
  
  let singX = (cols / 2) + (cols / 3) * sin(frameCount * 0.007) * cos(frameCount * 0.003);
  let singY = (rows / 2) + (rows / 3) * cos(frameCount * 0.005) * sin(frameCount * 0.002);

  // Dimensional Torsion: Calculate a global rotation factor that twists the rules
  let torsion = sin(frameCount * 0.005) * 0.5;

  for (let y = 0; y < rows; y++) {
    let py_raw = y + pad;
    for (let x = 0; x < cols; x++) {
      let idx = x + y * cols;
      let state = grid[idx];
      let px_raw = x + pad;

      // Apply Torsion: Sample neighborhoods from a "twisted" coordinate space
      let dx = x - cols/2;
      let dy = y - rows/2;
      let distNorm = sqrt(dx*dx + dy*dy) / (cols/2);
      let angle = distNorm * torsion * PI;
      let px = floor(cols/2 + dx * cos(angle) - dy * sin(angle)) + pad;
      let py = floor(rows/2 + dx * sin(angle) + dy * cos(angle)) + pad;

      let dSing = dist(x, y, singX, singY);
      let singularityInfluence = 1.8 * exp(-dSing * 0.1); 
      
      let distFromCenter = dist(x, y, cols/2, rows/2) / (cols/2);
      let warp = 1.0 + 0.4 * sin(frameCount * 0.02 + distFromCenter * PI) + singularityInfluence;

      let target = state;
      for (let i = 0; i < rules.length; i++) {
        let [ri, lo, hi, s] = rules[i];
        let avg = ringAvg(px, py, ri, warp);
        let localShift = timeShift + singularityInfluence * 0.2;
        if (avg >= lo + localShift && avg <= hi + localShift) { 
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
  let t = frameCount * 0.015;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let v = grid[x + y * cols];
      
      let dx = x - cols/2;
      let dy = y - rows/2;
      let angle = atan2(dy, dx) + t;
      let distFactor = sqrt(dx*dx + dy*dy) * 0.05;
      
      let r = v * (127 + 127 * sin(t + distFactor + angle));
      let g = v * (127 + 127 * sin(t * 1.2 + distFactor * 0.7 - angle + PI/2));
      let b = v * (127 + 127 * sin(t * 0.8 + distFactor * 1.3 + PI));
      
      let r8 = r | 0, g8 = g | 0, b8 = b | 0;
      for (let py = 0; py < res; py++) {
        let ty = (y * res + py);
        if (ty >= height) continue;
        let baseIndex = (ty * width + (x * res)) * 4;
        for (let px = 0; px < res; px++) {
          let pi = baseIndex + px * 4;
          pixels[pi] = r8;
          pixels[pi + 1] = g8;
          pixels[pi + 2] = b8;
          pixels[pi + 3] = 255;
        }
      }
    }
  }
  updatePixels();
}
