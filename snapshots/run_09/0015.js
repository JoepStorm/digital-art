// Inspired by Jason
// Iteration 1: The Weaver - Introduced polarized populations (Predators vs Prey) with distinct behaviors and trail colors.
// Iteration 2: The Weaver - Introduced dynamic population oscillations by allowing predators to 'consume' prey and spawn new hunters, while prey regenerate over time.
// Iteration 3: The Weaver - Introduced the 'Pulse', a rhythmic acceleration and expansion of sensor range to simulate breathing patterns in the collective.
// Iteration 4: The Weaver - Introduced the 'Turing Membrane', causing predator and prey trails to diffuse into Voronoi-like cellular structures while they interact.
// Iteration 5: The Weaver - Introduced 'Stigmergic Magnetism', causing predators to leave a magnetic wake that pulls and aligns nearby prey into swirling vortex patterns.
// Iteration 6: The Weaver - Introduced 'Coronagraphic Veils', causing predators to emit high-frequency chromatic aberrations that fracture the cellular membranes into iridescent, glass-like shards.
// Iteration 7: The Weaver - Introduced 'Echoing Thresholds', where high-density trail intersections trigger shockwaves that invert the local velocity of agents, creating pulsating geometry.
// Iteration 8: The Weaver - Introduced 'Looming Entanglement', which adds a feedback loop that warps the simulation space based on trail density, creating topographical distortions.
// Iteration 9: The Weaver - Introduced 'Luminous Phosphorescence', where trails age into spectral gold gradients that glow with intensity based on local movement velocity.
// Iteration 10: The Weaver - Introduced 'Vitruvian Calcification', where path intersections crystallize into static, bone-white structural lattices that agents must navigate around.
// Iteration 11: The Weaver - Introduced 'Nebular Condensation', where high-velocity agents leave behind soft, expanding gas clouds that dissipate based on the local curvature of their paths.
// Iteration 12: The Weaver - Introduced 'Entropic Veins', causing high-density trail regions to undergo localized space-warping that twists movement into braided spiral filaments.
// Iteration 13: The Weaver - Introduced 'Stellar Chrysalis', causing agents to leave shimmering trails of prismatic light that expand into glowing filaments as they cross high-density boundaries.
// Iteration 14: The Weaver - Introduced 'Plasma Synchrony', where agents emit bio-electric arcs to nearby kin, creating a flickering neural network overlay.
// Iteration 15: The Weaver - Introduced 'Cymatic Interference Grids', where agents crossing nodal intersections leave resonant geometric echoes of interference patterns.

const agentsNum = 4000;
let sensorOffset = 18;
const sensorAngle = Math.PI / 4;
const turnAngle = Math.PI / 10;
let agents;
let structures;
let clouds;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(0);
  agents = new Agents();
  // Structures buffer for calcification and crystalline arcs
  structures = createGraphics(width, height);
  structures.pixelDensity(1);
  structures.noFill();
  structures.strokeJoin(ROUND);
  // Clouds buffer for nebular condensation
  clouds = createGraphics(width, height);
  clouds.noStroke();
}

function draw() {
  sensorOffset = 15 + sin(frameCount * 0.02) * 10;
  
  filter(BLUR, 0.45);
  background(5, 8, 12, 22);

  // Render nebular clouds with additive blending
  blendMode(ADD);
  image(clouds, 0, 0);
  blendMode(BLEND);

  image(structures, 0, 0);

  loadPixels();
  for (let i = 0; i < 3; i++) {
    agents.update();
  }
  updatePixels();

  if (frameCount % 2 === 0) {
    let warpStr = map(sin(frameCount * 0.01), -1, 1, 1, 6);
    copy(this, warpStr, warpStr, width - warpStr * 2, height - warpStr * 2, 0, 0, width, height);
  }

  blendMode(SCREEN);
  let shift = map(sin(frameCount * 0.05), -1, 1, 2, 5);
  tint(100, 180, 255, 30); 
  image(this, -shift, 0);
  image(this, shift, 0);
  noTint();
  blendMode(BLEND);
  
  structures.background(0, 0, 0, 15); 
  clouds.background(0, 0, 0, 18);
}

class Agent {
  constructor(type, x, y) {
    this.x = x || random(width);
    this.y = y || random(height);
    this.dir = random(TWO_PI);
    this.pDir = this.dir;
    this.type = type; 
    this.isDead = false;
    this.spawn = false;
    this.color = this.type === 0 ? [100, 200, 255] : [255, 120, 50];
    this.hueShift = random(100);
  }

  updateDirection() {
    this.pDir = this.dir;
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    let density = center / 765; 
    // Cymatic torque based on grid coordinates
    let gridFreq = 0.05;
    let cymatic = sin(this.x * gridFreq) * cos(this.y * gridFreq);
    let spiralTorque = density > 0.4 ? sin(frameCount * 0.1 + density * 10 + cymatic * 5) * 0.3 : 0;

    if (center > 650) {
      this.dir += PI + spiralTorque;
      
      // Cymatic Echoes: When crossing high-density nodes, draw interference patterns
      if (abs(cymatic) > 0.8 && random() < 0.15) {
        structures.push();
        structures.stroke(this.color[0], this.color[1], this.color[2], 80);
        structures.noFill();
        let size = 15 * abs(cymatic);
        structures.rectMode(CENTER);
        structures.translate(this.x, this.y);
        structures.rotate(this.dir + frameCount * 0.05);
        structures.rect(0, 0, size, size);
        structures.pop();
      }

      if (random() < 0.08) {
        structures.push();
        structures.colorMode(HSB, 360, 100, 100, 1);
        let h = (this.hueShift + frameCount * 0.5) % 360;
        structures.stroke(h, 60, 100, 0.2);
        structures.strokeWeight(density * 2);
        structures.line(this.x, this.y, this.x - cos(this.dir) * 12, this.y - sin(this.dir) * 12);
        structures.pop();
      }
    } else {
      if (this.type === 1) {
        if (center > left && center > right) {
        } else if (center < left && center < right) {
          this.dir += (random() < 0.5 ? 1 : -1) * turnAngle;
        } else if (left > right) {
          this.dir -= turnAngle;
        } else if (right > left) {
          this.dir += turnAngle;
        }
      } else {
        if (left > 120 || right > 120) {
          this.dir += turnAngle * 1.5;
        } else if (left > right) {
          this.dir += turnAngle;
        } else if (right > left) {
          this.dir -= turnAngle;
        }
      }
      this.dir += spiralTorque + (cymatic * 0.05);
    }
    this.dir += (random() - 0.5) * 0.15;
  }

  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let x = (this.x + sensorOffset * cos(angle) + width) % width;
    let y = (this.y + sensorOffset * sin(angle) + height) % height;
    const index = (floor(x) + floor(y) * width) * 4;
    return pixels[index] + pixels[index + 1] + pixels[index + 2];
  }

  updatePosition() {
    const speedBase = (this.type === 1 ? 2.6 : 1.9);
    const speedMod = 1.0 + (sin(frameCount * 0.03 + (this.x*0.01)) * 0.4);
    const speed = speedBase * speedMod;
    
    this.x = (this.x + cos(this.dir) * speed + width) % width;
    this.y = (this.y + sin(this.dir) * speed + height) % height;

    const ix = floor(this.x);
    const iy = floor(this.y);
    const index = (ix + iy * width) * 4;

    if (this.type === 1) {
      if (pixels[index + 2] > 180) { this.spawn = true; }
    } else {
      if (pixels[index] > 180) { this.isDead = true; }
    }

    let turnMag = abs(this.dir - this.pDir);
    if (turnMag > 0.07) {
      let c = this.color;
      clouds.fill(c[0], c[1], c[2], 12);
      clouds.ellipse(this.x, this.y, turnMag * 25, turnMag * 25);
    }

    let lum = map(speedMod, 0.6, 1.4, 120, 255);
    pixels[index] = (this.color[0] * lum) / 255;
    pixels[index + 1] = (this.color[1] * lum) / 255;
    pixels[index + 2] = (this.color[2] * lum) / 255;
    pixels[index + 3] = 255;
  }
}

class Agents {
  constructor() {
    this.list = [];
    for (let i = 0; i < agentsNum; i++) {
        this.list.push(new Agent(random() > 0.95 ? 1 : 0));
    }
  }
  
  update() {
    const spatialGrid = new Map();
    const cellSize = 60;

    for (let i = this.list.length - 1; i >= 0; i--) {
      let a = this.list[i];
      a.updateDirection();
      a.updatePosition();
      
      let gx = floor(a.x / cellSize);
      let gy = floor(a.y / cellSize);
      let cellKey = gx + "_" + gy;
      if (!spatialGrid.has(cellKey)) spatialGrid.set(cellKey, []);
      spatialGrid.get(cellKey).push(a);

      if (a.isDead) {
        this.list.splice(i, 1);
      } else if (a.spawn && this.list.length < agentsNum * 2.0) {
        a.spawn = false;
        this.list.push(new Agent(1, a.x, a.y));
      }
    }

    if (frameCount % 4 === 0) {
      structures.push();
      structures.strokeWeight(0.4);
      for (let [key, cellAgents] of spatialGrid) {
        if (cellAgents.length > 2) {
          for (let i = 0; i < min(cellAgents.length, 2); i++) {
            let a1 = cellAgents[i];
            let a2 = cellAgents[floor(random(cellAgents.length))];
            if (a1 !== a2 && a1.type === a2.type) {
              let arcAlpha = map(sin(frameCount * 0.15), -1, 1, 30, 100);
              structures.stroke(a1.color[0], a1.color[1], a1.color[2], arcAlpha);
              structures.line(a1.x, a1.y, a2.x, a2.y);
            }
          }
        }
      }
      structures.pop();
    }
    
    while (this.list.length < agentsNum) {
      this.list.push(new Agent(0));
    }
    
    const predatorCount = this.list.filter(a => a.type === 1).length;
    if (predatorCount > agentsNum * 0.45) {
      const pIdx = this.list.findIndex(a => a.type === 1);
      if (pIdx > -1) this.list.splice(pIdx, 1);
    }
  }
}
