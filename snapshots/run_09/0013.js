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
  // Structures buffer for calcification
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
  background(10, 5, 2, 18);

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
  tint(255, 200, 150, 40); 
  image(this, -shift, 0);
  image(this, shift, 0);
  noTint();
  blendMode(BLEND);
  
  structures.background(0, 0, 0, 2);
  // Fade and slightly expand clouds to create nebulous drift
  clouds.background(0, 0, 0, 12);
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
    this.color = this.type === 0 ? [140, 230, 255] : [255, 170, 0];
    this.hueShift = random(100);
  }

  updateDirection() {
    this.pDir = this.dir;
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    // Entropic Veins: Apply a helical torque to movement based on local intensity
    let density = center / 765; 
    let spiralTorque = density > 0.4 ? sin(frameCount * 0.1 + density * 10) * 0.2 : 0;

    if (center > 650) {
      this.dir += PI + spiralTorque;
      
      // Stellar Chrysalis: In highly dense regions, deposit prismatic filaments into the structures buffer
      if (random() < 0.08) {
        structures.push();
        structures.colorMode(HSB, 360, 100, 100, 1);
        let h = (this.hueShift + frameCount * 0.5) % 360;
        structures.stroke(h, 80, 100, 0.3);
        structures.strokeWeight(density * 3);
        structures.line(this.x, this.y, this.x - cos(this.dir) * 15, this.y - sin(this.dir) * 15);
        structures.pop();
      }

      if (random() < 0.05) {
        structures.stroke(255, 255, 240, 50);
        structures.strokeWeight(1.5);
        structures.line(this.x, this.y, this.x + cos(this.dir) * 20, this.y + sin(this.dir) * 20);
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
      this.dir += spiralTorque;
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
    const speedBase = (this.type === 1 ? 2.4 : 1.8);
    const speedMod = 1.0 + (sin(frameCount * 0.03) * 0.5);
    const speed = speedBase * speedMod;
    
    this.x = (this.x + cos(this.dir) * speed + width) % width;
    this.y = (this.y + sin(this.dir) * speed + height) % height;

    const ix = floor(this.x);
    const iy = floor(this.y);
    const index = (ix + iy * width) * 4;

    if (this.type === 1) {
      if (pixels[index + 2] > 200) { this.spawn = true; }
    } else {
      if (pixels[index] > 200) { this.isDead = true; }
    }

    // Nebular Condensation: Emit clouds based on turning intensity
    let turnMag = abs(this.dir - this.pDir);
    if (turnMag > 0.05) {
      let c = this.color;
      clouds.fill(c[0], c[1], c[2], 15);
      clouds.ellipse(this.x, this.y, turnMag * 20, turnMag * 20);
    }

    let lum = map(speedMod, 0.5, 1.5, 100, 255);
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
        this.list.push(new Agent(random() > 0.96 ? 1 : 0));
    }
  }
  
  update() {
    for (let i = this.list.length - 1; i >= 0; i--) {
      let a = this.list[i];
      a.updateDirection();
      a.updatePosition();
      
      if (a.isDead) {
        this.list.splice(i, 1);
      } else if (a.spawn && this.list.length < agentsNum * 2.2) {
        a.spawn = false;
        this.list.push(new Agent(1, a.x, a.y));
      }
    }
    
    while (this.list.length < agentsNum) {
      this.list.push(new Agent(0));
    }
    
    const predatorCount = this.list.filter(a => a.type === 1).length;
    if (predatorCount > agentsNum * 0.35) {
      const pIdx = this.list.findIndex(a => a.type === 1);
      if (pIdx > -1) this.list.splice(pIdx, 1);
    }
  }
}
