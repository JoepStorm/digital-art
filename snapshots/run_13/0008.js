// Iteration 1: The Weaver - Introduce oscillating rule modulations to create breathing, organic shifts
// Iteration 2: The Prism Weaver - Introduce spatial-spectral interference for iridescent, shifting wave interference patterns
// Iteration 3: The Chromatic Pulse - Introduce a dynamic reactive core that warps neighborhood radii based on local density
// Iteration 4: The Void Crawler - Introduce a wandering gravitational singularity that locally distorts the cellular growth rules
// Iteration 5: The Weaver - Introduce "Dimensional Torsion" by applying a spiral coordinate transformation to the neighborhood sampling
// Iteration 6: The Spectral Alchemist - Introduce Chromatic Refraction by perturbing color sampling based on local density gradients
// Iteration 7: The Neural Alchemist - Introduce Synaptic Feedback Loops through recursive temporal state modulation
// Iteration 8: The Entropy Alchemist - Introduce Spatio-Temporal Diffusion and Dynamic State Decay
const res = 4;
const fade = 0.22;
const pad = 12;
let grid, next, cols, rows;
let pGrid, sat, pCols, pRows;
let history = []; 

const rings = [[0, 1], [3, 5], [7, 10]];

const rules = [
  [0, 0.19, 0.31, 1],
  [0, 0.48, 0.82, 0.2],
  [1, 0.23, 0.38, 0.9],
  [1, 0.03, 0.12, 0.1],
  [2, 0.17, 0.33, 0.8],
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

  let cx = floor(cols / 2), cy = floor(rows / 2), seedR = 25;
  for (let dy = -seedR; dy <= seedR; dy++)
    for (let dx = -seedR; dx <= seedR; dx++)
      if (dx * dx + dy * dy < seedR * seedR)
        grid[(cx + dx) + (cy + dy) * cols] = random() < 0.6 ? 1 : 0;
  
  for(let i=0; i<40; i++) history.push(new Float32Array(cols * rows).fill(0));
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
  let timeShift = sin(frameCount * 0.012) * 0.08;
  let singX = (cols / 2) + (cols / 2.5) * sin(frameCount * 0.01) * cos(frameCount * 0.004);
  let singY = (rows / 2) + (rows / 2.5) * cos(frameCount * 0.008) * sin(frameCount * 0.003);
  let torsion = sin(frameCount * 0.004) * 0.8;
  
  let historyIdx = floor(map(cos(frameCount * 0.015), -1, 1, 0, history.length - 1));
  let prevGrid = history[historyIdx];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let idx = x + y * cols;
      let state = grid[idx];
      
      // Spatio-Temporal Entropy: Influence state by its neighborhood and historic echoes
      let echo = prevGrid[idx];
      let neighborAvg = (grid[((x+1)%cols) + y*cols] + grid[((x-1+cols)%cols) + y*cols] + grid[x + ((y+1)%rows)*cols] + grid[x + ((y-1+rows)%rows)*cols]) * 0.25;
      let stateSum = state * 0.5 + echo * 0.3 + neighborAvg * 0.2;
      
      let dx = x - cols/2;
      let dy = y - rows/2;
      let distNorm = sqrt(dx*dx + dy*dy) / (cols/2);
      let angleShift = distNorm * torsion * PI * sin(frameCount * 0.002);
      let px = floor(cols/2 + dx * cos(angleShift) - dy * sin(angleShift)) + pad;
      let py = floor(rows/2 + dx * sin(angleShift) + dy * cos(angleShift)) + pad;

      let dSing = dist(x, y, singX, singY);
      let singularityInfluence = 2.2 * exp(-dSing * 0.15); 
      
      let distCenter = dist(x, y, cols/2, rows/2) / (cols/1.5);
      let warp = 1.0 + 0.6 * sin(frameCount * 0.025 + distCenter * TWO_PI) + singularityInfluence;

      let target = stateSum;
      for (let i = 0; i < rules.length; i++) {
        let [ri, lo, hi, s] = rules[i];
        let avg = ringAvg(px, py, ri, warp);
        let dynamicLo = lo + timeShift + (singularityInfluence * 0.1);
        let dynamicHi = hi + timeShift - (singularityInfluence * 0.05);
        if (avg >= dynamicLo && avg <= dynamicHi) { 
          target = s; 
          break; 
        }
      }
      
      // Dynamic Decay: gradual loss of signal intensity to create ghosting effects
      let decay = 0.992;
      next[idx] = (stateSum + (target - stateSum) * fade) * decay;
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
  let centerDistMax = sqrt((cols/2)**2 + (rows/2)**2);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let idx = x + y * cols;
      let val = grid[idx];
      
      // Sample gradients for lighting effects
      let gx = (grid[((x+1)%cols) + y*cols] - grid[((x-1+cols)%cols) + y*cols]);
      let gy = (grid[x + ((y+1)%rows)*cols] - grid[x + ((y-1+rows)%rows)*cols]);
      let grad = sqrt(gx*gx + gy*gy) * 20;
      
      let radialX = x - cols/2;
      let radialY = y - rows/2;
      let rDist = sqrt(radialX*radialX + radialY*radialY);
      let radialAngle = atan2(radialY, radialX);
      
      // Chromatic separation based on flow and cellular evolution
      let drift = sin(t + rDist * 0.03 + radialAngle);
      let r = val * (140 + 115 * sin(t + radialAngle + grad));
      let g = val * (140 + 115 * sin(t * 0.9 + radialAngle + PI/2 - grad * 0.5));
      let b = val * (140 + 115 * sin(t * 1.1 - radialAngle + PI + drift));
      
      // Apply specular highlights and gamma-like curve
      let bright = r * 0.299 + g * 0.587 + b * 0.114;
      let burst = pow(val, 0.6) * 255;
      
      let r8 = constrain(r + grad * 5, 0, burst);
      let g8 = constrain(g + grad * 8, 0, burst);
      let b8 = constrain(b + grad * 12, 0, burst);
      
      for (let py = 0; py < res; py++) {
        let ty = (y * res + py);
        if (ty >= height) continue;
        let baseRel = ty * width * 4;
        let xRes = x * res;
        for (let px = 0; px < res; px++) {
          let pi = baseRel + (xRes + px) * 4;
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
