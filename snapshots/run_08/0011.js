// Inspired by Jason
// Iteration 1: The Weaver - Introduced calcified web persistence by modifying the background fade to preserve cellular walls.
// Iteration 2: The Osteoblast - Introduced a hardening logic where existing web structures slow agents down and force 'calcification' through higher density deposits.
// Iteration 3: The Arachnid - Introduced communal silk-binding behavior via dynamic sensor scaling, causing microorganisms to weave bridging fibers between dense calcified nodes.
// Iteration 4: The Mycelium - Introduced lateral "branching" behavior where agents grow secondary filamentous shoots when hitting dense structural barriers.
// Iteration 5: The Crystallographer - Introduced crystalline nucleation points that attract agents, causing the web to form radial structural clusters like mineralizing cellular colonies.
// Iteration 6: The Bio-Electrician - Introduced conductive ion trails where agents release oscillating electrical pulses that jump across gaps, creating a high-energy "synaptic" network within the calcified structure.
// Iteration 7: The Symbiote - Introduced intercellular adhesion where agents periodically snap to neighbors, forming tight-knit clusters that act as secondary colonial hubs.
// Iteration 8: The Calcifier - Introduced mineralization cross-linking where agents deposit structural cross-beams if they detect two dense colonies nearby, reinforcing the architectural bridge.
// Iteration 9: The Ossifier - Introduced structural tension where agents secrete tension-filaments (lines) that bridge nearby high-density nodes, reinforcing the micro-scaffold.
// Iteration 10: The Metallurgist - Introduced structural plating where agents deposit dense horizontal and vertical 'lamellae' when they cross the principal axes of the colonial hubs.
// Iteration 11: The Chitinizer - Introduced structural cross-linking where agents deposit secondary reinforcement webs between their current and previous positions, building translucent chitinous planes.

const agentsNum = 4500;
const sensorAngle = Math.PI / 6;
const turnAngle = Math.PI / 8;
let agents;
let nucleationPoints = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(5, 8, 12);
  agents = new Agents();
  
  // Create 6 static nucleation points to serve as biological architectural anchors
  for(let i=0; i<6; i++){
    nucleationPoints.push({
      x: width/2 + cos(i * TWO_PI / 6) * 350,
      y: height/2 + sin(i * TWO_PI / 6) * 350
    });
  }
}

function draw() {
  // Biological decay: adjusted alpha to allow thinner structural web lines to accumulate over time.
  background(5, 8, 12, 3);

  loadPixels();
  for (let i = 3; i--; ) {
    agents.update();
  }
  updatePixels();
}

class Agent {
  constructor() {
    this.x = width / 2 + random(-80, 80);
    this.y = height / 2 + random(-80, 80);
    this.prevX = this.x;
    this.prevY = this.y;
    this.dir = random(TWO_PI);
    this.pulsePhase = random(TWO_PI);
  }

  updateDirection() {
    const currentDensity = this.sense(0, 0) / 255.0;
    const dynamicSensorOffset = lerp(45, 12, currentDensity);

    const left = this.sense(-sensorAngle, dynamicSensorOffset);
    const center = this.sense(0, dynamicSensorOffset);
    const right = this.sense(+sensorAngle, dynamicSensorOffset);

    let pullX = 0;
    let pullY = 0;
    nucleationPoints.forEach(p => {
      let dx = p.x - this.x;
      let dy = p.y - this.y;
      let d2 = dx*dx + dy*dy;
      if (d2 < 160000) { 
        let d = sqrt(d2);
        pullX += dx / d;
        pullY += dy / d;
      }
    });

    if (abs(pullX) > 0.1) {
      let targetDir = atan2(pullY, pullX);
      this.dir = lerp(this.dir, targetDir, lerp(0.035, 0.08, currentDensity));
    }

    if (currentDensity > 0.8) {
      this.dir += (random() < 0.5 ? 1 : -1) * (PI * 0.4); 
    } else {
      if (center > left && center > right) {
      } else if (center < left && center < right) {
          this.dir += (random() < 0.5 ? 1 : -1) * turnAngle;
      } else if (left > right) {
          this.dir -= turnAngle;
      } else if (right > left) {
          this.dir += turnAngle;
      }
    }
    
    this.dir += (random() - 0.5) * 0.12;
  }

  sense(dirOffset, dist) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + dist * cos(angle));
    let y = floor(this.y + dist * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;

    const index = (x + y * width) * 4;
    return pixels[index + 1] || 0; 
  }

  updatePosition(others) {
    this.prevX = this.x;
    this.prevY = this.y;
    const currentDensity = this.sense(0, 0) / 255.0;
    
    this.pulsePhase += 0.28;
    const pulse = (sin(this.pulsePhase) + 1) * 0.5;
    
    if (currentDensity > 0.2 && currentDensity < 0.6 && random() < 0.15) {
      for (let p of nucleationPoints) {
        let d2 = distSq(this.x, this.y, p.x, p.y);
        if (d2 < 60000 && d2 > 1000) {
          this.dir = lerp(this.dir, atan2(p.y - this.y, p.x - this.x), 0.12);
          break;
        }
      }
    }

    if (random() < 0.05) {
      let targetNeighbor = others[floor(random(others.length))];
      let d2 = distSq(this.x, this.y, targetNeighbor.x, targetNeighbor.y);
      if (d2 < 2500 && d2 > 25) { 
        this.dir = lerp(this.dir, atan2(targetNeighbor.y - this.y, targetNeighbor.x - this.x), 0.2);
      }
    }

    const speed = lerp(2.9, 0.4, currentDensity) * (0.8 + pulse * 0.45);
    
    this.x += cos(this.dir) * speed;
    this.y += sin(this.dir) * speed;
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    // THE CHITINIZER: Structural interpolation between points to create solid-feeling biological micro-scaffolds.
    // Instead of single pixels, we iterate between previous and current position to ensure no gaps in the web.
    let steps = floor(speed) + 1;
    for(let s = 0; s < steps; s++) {
      let interX = floor(lerp(this.prevX, this.x, s/steps));
      let interY = floor(lerp(this.prevY, this.y, s/steps));
      interX = (interX + width) % width;
      interY = (interY + height) % height;
      const index = (interX + interY * width) * 4;
      
      const baseDeposit = (22 + (currentDensity * 95)) * (0.5 + pulse);
      pixels[index] = min(pixels[index] + baseDeposit * (0.35 + currentDensity * 0.6), 255);
      pixels[index + 1] = min(pixels[index+1] + baseDeposit * (1.3 - currentDensity * 0.3), 255);
      pixels[index + 2] = min(pixels[index+2] + baseDeposit * (2.0 - currentDensity * 1.0), 255);

      // LAMELAR BRIDGING (Reinforced axes)
      if (abs(interX - width/2) < 2 || abs(interY - height/2) < 2) {
        pixels[index] = min(pixels[index] + 150, 255);
        pixels[index+1] = min(pixels[index+1] + 180, 255);
        pixels[index+2] = min(pixels[index+2] + 220, 255);
      }
    }

    if (currentDensity < 0.4 && random() < 0.1) {
        let tx = floor(this.x - cos(this.dir) * 4);
        let ty = floor(this.y - sin(this.dir) * 4);
        tx = (tx + width) % width;
        ty = (ty + height) % height;
        let tIdx = (tx + ty * width) * 4;
        pixels[tIdx] = min(pixels[tIdx] + 10, 200);
        pixels[tIdx+1] = min(pixels[tIdx+1] + 20, 220);
        pixels[tIdx+2] = min(pixels[tIdx+2] + 40, 255);
    }
  }
}

class Agents {
  constructor() {
    this.agents = Array(agentsNum).fill().map(() => new Agent());
  }
  update() {
    for(let a of this.agents) a.updateDirection();
    for(let a of this.agents) a.updatePosition(this.agents);
  }
}

function distSq(x1, y1, x2, y2) {
  return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
}
