// Inspired by Jason
// Iteration 1: The Weaver - Introduced a global harmonic force that pulls agents toward geometric sanity or pushes them into entropy based on their screen position.
// Iteration 2: The Cartographer - Introduced a quadrant-based symmetry where the battle between Chaos and Order creates a crystalline urban structure.
// Iteration 3: The Archon - Introduced a localized gravity well at the mouse position that shatters the rigid grid into swirling nebulae of chaos.
// Iteration 4: The Alchemist - Introduced a reactive heat-map that causes agents to mutate their speed and steering based on the density of existing ink.
// Iteration 5: The Glassblower - Introduced a refractive chromatic aberration that warps light as chaos cools into structured geometric lenses.
// Iteration 6: The Fractal Weaver - Introduced recursive 'Lace-Work' kernels that wrap chaotic flow into intricate self-similar lattices.
// Iteration 7: The Clockmaker - Introduced a temporal oscillation that forces the simulation to 'crystallize' into sharp rectilinear lattices at intervals before dissolving back into organic foam.
// Iteration 8: The Geomancer - Introduced tectonic ley lines that warp the coordinate space, forcing the slime mold to flow through invisible canyons of order.
// Iteration 9: The Polarity Engine - Introduced magnetic dipoles that pull chaotic agents into orbit around "singularities" of order, creating localized gravitational swirls.
// Iteration 10: The Resonance Chamber - Introduced acoustic standing waves that modulate pixel intensity and agent pathing, creating interference patterns of order.
// Iteration 11: The Mycelial Architect - Introduced structural scaffolding that creates persistent "skeletal" networks, bridging the gap between chaotic flow and rigid grids.
// Iteration 12: The Void-Eater - Introduced entropy-seeking "predators" that feed on the structural scaffold, turning rigid order into dark vacuum.
// Iteration 13: The Glitch Weaver - Introduced chromatic "glitch" shifts that tear the fabric of order when chaos density reaches critical thresholds.
// Iteration 14: The Prism Cathedral - Introduced spectral light dispersal through high-density nodes, turning the monochrome structure into a stained-glass lattice of refraction.

const agentsNum = 6400;
const sensorOffset = 18;
const sensorAngle = Math.PI / 6;
const turnAngle = Math.PI / 4;
let agents;
let poles = [];
let scaffold;
let predators = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(245);
  agents = new Agents();
  
  for(let i=0; i<6; i++) {
    poles.push({
      x: random(width),
      y: random(height),
      type: i % 2 === 0 ? 1 : -1 
    });
  }

  scaffold = createGraphics(width, height);
  scaffold.pixelDensity(1);
  scaffold.noFill();
  scaffold.stroke(180, 200, 255, 35);
  scaffold.strokeWeight(1.5);

  for(let i=0; i<15; i++) {
    predators.push({
      x: random(width),
      y: random(height),
      vx: random(-2, 2),
      vy: random(-2, 2),
      size: random(40, 100)
    });
  }
}

function draw() {
  let timeCycle = (sin(frameCount * 0.005) + 1) / 2; 
  
  background(255, lerp(5, 18, timeCycle));

  loadPixels();
  for (let i = 5; i--; ) {
    agents.update(timeCycle);
  }
  
  // Resonance Standing Waves
  let freq = 0.02 + sin(frameCount * 0.002) * 0.01;
  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      let resonance = (sin(x * freq) + cos(y * freq)) * 0.5;
      if (resonance > 0.8 * (1 - timeCycle)) {
        let idx = (x + y * width) * 4;
        pixels[idx + 2] = min(255, pixels[idx + 2] + 12);
      }
    }
  }

  // Void-Eaters: Entropy-seeking zones
  predators.forEach(p => {
    p.x = (p.x + p.vx + width) % width;
    p.y = (p.y + p.vy + height) % height;
    p.vx += (noise(p.x * 0.01, p.y * 0.01, frameCount * 0.01) - 0.5) * 0.5;
    p.vy += (noise(p.y * 0.01, p.x * 0.01, frameCount * 0.01) - 0.5) * 0.5;
    
    let rx = floor(p.x);
    let ry = floor(p.y);
    let rs = floor(p.size * (0.4 + timeCycle * 0.8));
    for(let i = -rs; i < rs; i++) {
        for(let j = -rs; j < rs; j++) {
            if(i*i + j*j < rs*rs) {
                let xi = (rx + i + width) % width;
                let yi = (ry + j + height) % height;
                let idx = (xi + yi * width) * 4;
                pixels[idx] = min(255, pixels[idx] + 25);
                pixels[idx+1] = min(255, pixels[idx+1] + 25);
                pixels[idx+2] = min(255, pixels[idx+2] + 25);
            }
        }
    }
  });

  // Glitch Weaving & Prism Cathedral: Spectral dispersal at density intersections
  let cell = 60;
  for (let y = 0; y < height; y += cell) {
    for (let x = 0; x < width; x += cell) {
      let idx = (floor(x + cell/2) + floor(y + cell/2) * width) * 4;
      let brightness = (pixels[idx] + pixels[idx+1] + pixels[idx+2]) / 3;
      
      if (brightness < 180) {
         let shift = floor(map(brightness, 0, 180, 12, 0) * (1.5 - timeCycle));
         
         // The Prism Cathedral: High density (low brightness) creates a prismatic diffraction
         // This splits the RGB channels based on oscillation and local complexity
         if (brightness < 120) {
            let offsetR = floor(sin(frameCount * 0.05 + x*0.01) * 8);
            let offsetG = floor(cos(frameCount * 0.03 + y*0.01) * 8);
            let idxR = (max(0, min(width-1, floor(x+offsetR))) + y * width) * 4;
            let idxG = (x + max(0, min(height-1, floor(y+offsetG))) * width) * 4;
            pixels[idx] = lerp(pixels[idx], pixels[idxR], 0.2);
            pixels[idx+1] = lerp(pixels[idx+1], pixels[idxG+1], 0.2);
         }

         if (random() < 0.02 * (1 - timeCycle)) {
            let rowOffset = (x + (y + floor(random(-2, 2))) * width) * 4;
            pixels[idx] = pixels[rowOffset] || pixels[idx];
            pixels[idx+1] = pixels[rowOffset+1] || pixels[idx+1];
         }
         
         let cornerIdx = (x + y * width) * 4;
         if(cornerIdx < pixels.length - 20) {
            pixels[cornerIdx] = pixels[cornerIdx + shift * 4] || pixels[cornerIdx];
            pixels[cornerIdx + 2] = pixels[max(0, cornerIdx - shift * 4)] || pixels[cornerIdx + 2];
         }
      }
    }
  }
  
  updatePixels();
  image(scaffold, 0, 0);
  scaffold.background(255, 2.5);
}

class Agent {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.dir = random([0, HALF_PI, PI, TWO_PI - HALF_PI]);
    this.speed = 2.4;
  }

  updateDirection(timeCycle) {
    let distToMouse = dist(this.x, this.y, mouseX, mouseY);
    let chaosRadius = 260;
    let localDensity = this.sense(0) / 255.0; 
    
    poles.forEach(p => {
      let d = dist(this.x, this.y, p.x, p.y);
      if(d < 300) {
        let mag = (1 - d/300) * p.type * timeCycle;
        this.dir += mag * 0.12;
      }
    });

    let leyLineX = sin(this.y * 0.005 + frameCount * 0.01) * 25;
    let leyLineY = cos(this.x * 0.005 + frameCount * 0.01) * 25;
    
    if (distToMouse < chaosRadius) {
      let angleToMouse = atan2(mouseY - this.y, mouseX - this.x);
      this.speed = 4.2;
      this.dir = lerp(this.dir, angleToMouse + HALF_PI, 0.2 * (1 - distToMouse/chaosRadius));
    } else {
      let dx = abs(this.x + leyLineX - width/2);
      let dy = abs(this.y + leyLineY - height/2);
      
      let gridStrength = (sin(dx * 0.02) * cos(dy * 0.02)) + (sin(dx * 0.1) * cos(dy * 0.1)) * 0.25;
      let orderThreshold = lerp(0.75, 0.25, timeCycle); 
      
      this.speed = lerp(1.5, 3.8, 1.0 - localDensity);
      let dynamicTurn = lerp(turnAngle * 1.6, turnAngle * 0.3, localDensity);
      
      let waveFreq = 0.025;
      let standingWave = sin(this.x * waveFreq) * cos(this.y * waveFreq);
      
      if (gridStrength > orderThreshold || (standingWave > 0.85 && timeCycle > 0.45)) {
        let targetDir = (floor((this.dir + PI/4) / HALF_PI) * HALF_PI);
        this.dir = lerp(this.dir, targetDir, 0.45 + (timeCycle * 0.4)); 
      } else {
        const right = this.sense(+sensorAngle);
        const center = this.sense(0);
        const left = this.sense(-sensorAngle);

        if (center < left && center < right) {
        } else if (left < right) {
            this.dir -= dynamicTurn;
        } else if (right < left) {
            this.dir += dynamicTurn;
        } else {
            this.dir += (random() - 0.5) * 0.2;
        }
      }
    }
  }

  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + sensorOffset * cos(angle));
    let y = floor(this.y + sensorOffset * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;
    const index = (x + y * width) * 4;
    return pixels[index] || 255; 
  }

  updatePosition() {
    let oldX = this.x;
    let oldY = this.y;
    this.x += cos(this.dir) * this.speed;
    this.y += sin(this.dir) * this.speed;
    
    // Scaffolding becomes more rigid in times of order
    if (this.speed < 2.0 && random() < 0.14) {
       scaffold.line(oldX, oldY, this.x, this.y);
    }

    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const px = floor(this.x);
    const py = floor(this.y);
    const i = (px + py * width) * 4;
    
    let distToMouse = dist(this.x, this.y, mouseX, mouseY);
    let blueShift = distToMouse < 220 ? 70 : 15;
    
    pixels[i] = max(0, pixels[i] - 80);
    pixels[i+1] = max(15, pixels[i+1] - 60);
    pixels[i+2] = max(50, pixels[i+2] - (25 - blueShift/2));
    pixels[i+3] = 255;
  }
}

class Agents {
  constructor() {
    this.agents = Array(agentsNum).fill().map(() => new Agent());
  }
  update(timeCycle) {
    this.agents.forEach((e) => e.updateDirection(timeCycle));
    this.agents.forEach((e) => e.updatePosition());
  }
}
