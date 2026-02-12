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
// Iteration 16: The Weaver - Introduced 'Temporal Caustics', where agent paths warp the underlying image buffer into shimmering, light-refracting patterns that mimic underwater light dispersal.
// Iteration 17: The Weaver - Introduced 'Quantum Gravitational Lensing', where high-density clusters distort local light paths, creating luminous warping rings that magnify agent trails.
// Iteration 18: The Weaver - Introduced 'Entropic Scaffolding', where agent trails occasionally crystallize into ephemeral, geometric blueprints of their local density maps.
// Iteration 19: The Weaver - Introduced 'Syllabic Resonance', where dense agent clusters generate floating, abstract glyphs that act as semi-solid obstacles and emitters.
// Iteration 20: The Weaver - Introduced 'Chromatic Rift Overlays', adding localized RGB color separation and displacement layers that react to agent density gradients.

const agentsNum = 4000;
let sensorOffset = 18;
const sensorAngle = Math.PI / 4;
const turnAngle = Math.PI / 10;
let agents;
let structures;
let clouds;
let glyphs = [];

function setup() {
  createCanvas(1600, 900);
  pixelDensity(1);
  background(0);
  agents = new Agents();
  structures = createGraphics(width, height);
  structures.pixelDensity(1);
  structures.noFill();
  structures.strokeJoin(ROUND);
  clouds = createGraphics(width, height);
  clouds.noStroke();
}

function draw() {
  sensorOffset = 15 + sin(frameCount * 0.02) * 10;
  
  filter(BLUR, 0.45);
  background(5, 8, 12, 22);

  blendMode(ADD);
  image(clouds, 0, 0);
  blendMode(BLEND);

  image(structures, 0, 0);

  // Update and draw Syllabic Resonance Glyphs
  structures.push();
  structures.strokeCap(SQUARE);
  for (let i = glyphs.length - 1; i >= 0; i--) {
    let g = glyphs[i];
    g.life -= 0.005;
    if (g.life <= 0) {
      glyphs.splice(i, 1);
      continue;
    }
    structures.stroke(g.c[0], g.c[1], g.c[2], g.life * 150);
    structures.strokeWeight(1 + g.life * 2);
    structures.push();
    structures.translate(g.x, g.y);
    structures.rotate(g.rot + frameCount * 0.01);
    // Draw an abstract character-like structure
    let s = g.size * g.life;
    structures.line(-s, -s, s, -s);
    structures.line(0, -s, 0, s);
    if (g.type > 0.5) structures.line(-s, s, s, s);
    else structures.noFill(), structures.ellipse(0, s/2, s, s);
    structures.pop();
  }
  structures.pop();

  loadPixels();
  for (let i = 0; i < 3; i++) {
    agents.update();
  }
  updatePixels();

  if (frameCount % 3 === 0) {
    let ripple = floor(3 * sin(frameCount * 0.04));
    copy(this, ripple, -ripple, width - 4, height - 4, 1, 1, width - 2, height - 2);
  }

  if (frameCount % 2 === 0) {
    let warpStr = map(sin(frameCount * 0.01), -1, 1, 1, 6);
    copy(this, warpStr, warpStr, width - warpStr * 2, height - warpStr * 2, 0, 0, width, height);
    
    if (frameCount % 60 === 0) {
        let lensSize = 200 + sin(frameCount * 0.1) * 100;
        let rx = random(width), ry = random(height);
        blendMode(SCREEN);
        noFill();
        strokeWeight(2);
        for(let j=0; j<3; j++) {
            stroke(100, 200, 255, 40 / (j+1));
            ellipse(rx, ry, lensSize + j*10, lensSize + j*10);
        }
        blendMode(BLEND);
    }
  }

  // Chromatic Rift Overlay: Split color channels with slight offsets to create prismatic shifts
  blendMode(SCREEN);
  let shift = map(sin(frameCount * 0.05), -1, 1, 2, 5);
  let driftY = cos(frameCount * 0.03) * 2;
  
  tint(255, 50, 50, 35); // Red fringe
  image(this, -shift, -driftY);
  
  tint(50, 255, 50, 35); // Green fringe
  image(this, 0, driftY * 0.5);
  
  tint(50, 50, 255, 35); // Blue fringe
  image(this, shift, -driftY);
  
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
    let gridFreq = 0.05;
    let cymatic = sin(this.x * gridFreq) * cos(this.y * gridFreq);
    let spiralTorque = density > 0.4 ? sin(frameCount * 0.1 + density * 10 + cymatic * 5) * 0.3 : 0;

    // Detect glyphs as obstacles (repulsion)
    for (let g of glyphs) {
      let d = dist(this.x, this.y, g.x, g.y);
      if (d < g.size * 2) {
        let angleToGlyph = atan2(g.y - this.y, g.x - this.x);
        this.dir -= (angleToGlyph - this.dir) * 0.1;
      }
    }

    if (center > 650) {
      this.dir += PI + spiralTorque;
      
      if (abs(cymatic) > 0.8 && random() < 0.1) {
        structures.push();
        structures.stroke(this.color[0], this.color[1], this.color[2], 60);
        structures.strokeWeight(0.5);
        structures.translate(this.x, this.y);
        structures.rotate(this.dir);
        let branchLen = density * 30;
        for(let b=0; b<4; b++) {
          structures.rotate(HALF_PI);
          structures.line(0, 0, branchLen, 0);
          structures.line(branchLen, 0, branchLen, -branchLen * 0.5);
        }
        structures.pop();
        
        // Chance to spawn a Syllabic Resonance glyph in high density
        if (random() < 0.02 && glyphs.length < 50) {
           glyphs.push({x: this.x, y: this.y, life: 1, type: random(), size: random(10, 30), rot: random(TWO_PI), c: this.color});
        }
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
