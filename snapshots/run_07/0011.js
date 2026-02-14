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

const agentsNum = 6000;
const sensorOffset = 18;
const sensorAngle = Math.PI / 6;
const turnAngle = Math.PI / 4;
let agents;
let poles = [];
let scaffold;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(245);
  agents = new Agents();
  
  // Create static poles that represent centers of Order vs Chaos
  for(let i=0; i<6; i++) {
    poles.push({
      x: random(width),
      y: random(height),
      type: i % 2 === 0 ? 1 : -1 // Positive (Order) vs Negative (Chaos) poles
    });
  }

  // Mycelial Architect: A persistent bitmap to store architectural "bones"
  scaffold = createGraphics(width, height);
  scaffold.pixelDensity(1);
  scaffold.noFill();
  scaffold.stroke(180, 200, 255, 30);
  scaffold.strokeWeight(1.5);
}

function draw() {
  // A temporal tide that cycles between Chaos and Order
  let timeCycle = (sin(frameCount * 0.005) + 1) / 2; 
  
  background(255, lerp(4, 15, timeCycle));

  loadPixels();
  for (let i = 5; i--; ) {
    agents.update(timeCycle);
  }
  
  // Resonance Chamber interference patterns
  let freq = 0.02 + sin(frameCount * 0.002) * 0.01;
  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      let resonance = (sin(x * freq) + cos(y * freq)) * 0.5;
      if (resonance > 0.8 * (1 - timeCycle)) {
        let idx = (x + y * width) * 4;
        pixels[idx + 2] = min(255, pixels[idx + 2] + 10);
      }
    }
  }

  // Refractive Glass Pass
  let cell = 80;
  for (let y = 0; y < height; y += cell) {
    for (let x = 0; x < width; x += cell) {
      if ((floor(x/cell) + floor(y/cell)) % 2 == 0) {
        let idx = (floor(x + cell/2) + floor(y + cell/2) * width) * 4;
        let brightness = (pixels[idx] + pixels[idx+1] + pixels[idx+2]) / 3;
        if (brightness < 200) {
           let offset = floor(map(brightness, 0, 200, 4, 0));
           let cornerIdx = (x + y * width) * 4;
           pixels[cornerIdx] = pixels[cornerIdx + offset * 4] || pixels[cornerIdx];
           pixels[cornerIdx + 2] = pixels[max(0, cornerIdx - offset * 4)] || pixels[cornerIdx + 2];
        }
      }
    }
  }
  
  updatePixels();

  // Overlay the Mycelial Scaffold
  image(scaffold, 0, 0);
  // Slowly fade the scaffold to allow it to evolve
  scaffold.background(255, 1);
}

class Agent {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.dir = random([0, HALF_PI, PI, TWO_PI - HALF_PI]);
    this.speed = 2.2;
    this.history = [];
  }

  updateDirection(timeCycle) {
    let distToMouse = dist(this.x, this.y, mouseX, mouseY);
    let chaosRadius = 250;
    let localDensity = this.sense(0) / 255.0; 
    
    poles.forEach(p => {
      let d = dist(this.x, this.y, p.x, p.y);
      if(d < 300) {
        let mag = (1 - d/300) * p.type * timeCycle;
        this.dir += mag * 0.1;
      }
    });

    let leyLineX = sin(this.y * 0.005 + frameCount * 0.01) * 20;
    let leyLineY = cos(this.x * 0.005 + frameCount * 0.01) * 20;
    
    if (distToMouse < chaosRadius) {
      let angleToMouse = atan2(mouseY - this.y, mouseX - this.x);
      this.speed = 4.0;
      this.dir = lerp(this.dir, angleToMouse + HALF_PI, 0.15 * (1 - distToMouse/chaosRadius));
    } else {
      let dx = abs(this.x + leyLineX - width/2);
      let dy = abs(this.y + leyLineY - height/2);
      
      let gridStrength = (sin(dx * 0.02) * cos(dy * 0.02)) + (sin(dx * 0.1) * cos(dy * 0.1)) * 0.2;
      let orderThreshold = lerp(0.8, 0.2, timeCycle); 
      
      this.speed = lerp(1.2, 3.5, localDensity);
      let dynamicTurn = lerp(turnAngle * 1.5, turnAngle * 0.4, localDensity);
      
      let waveFreq = 0.02;
      let standingWave = sin(this.x * waveFreq) * cos(this.y * waveFreq);
      
      if (gridStrength > orderThreshold || (standingWave > 0.9 && timeCycle > 0.5)) {
        let targetDir = (floor((this.dir + PI/4) / HALF_PI) * HALF_PI);
        this.dir = lerp(this.dir, targetDir, 0.4 + (timeCycle * 0.5)); 
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
            this.dir += (random() - 0.5) * 0.15;
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
    
    // Architect: If the agent is in a high-order state, draw a filament on the scaffold
    if (this.speed < 1.8 && random() < 0.1) {
       scaffold.line(oldX, oldY, this.x, this.y);
    }

    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const px = floor(this.x);
    const py = floor(this.y);
    const i = (px + py * width) * 4;
    
    let distToMouse = dist(this.x, this.y, mouseX, mouseY);
    let blueShift = distToMouse < 200 ? 60 : 20;
    
    pixels[i] = max(10, pixels[i] - 70);
    pixels[i+1] = max(30, pixels[i+1] - 50);
    pixels[i+2] = max(80, pixels[i+2] - (30 - blueShift/2));
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
