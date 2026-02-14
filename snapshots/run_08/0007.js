// Inspired by Jason
// Iteration 1: The Weaver - Introduced calcified web persistence by modifying the background fade to preserve cellular walls.
// Iteration 2: The Osteoblast - Introduced a hardening logic where existing web structures slow agents down and force 'calcification' through higher density deposits.
// Iteration 3: The Arachnid - Introduced communal silk-binding behavior via dynamic sensor scaling, causing microorganisms to weave bridging fibers between dense calcified nodes.
// Iteration 4: The Mycelium - Introduced lateral "branching" behavior where agents grow secondary filamentous shoots when hitting dense structural barriers.
// Iteration 5: The Crystallographer - Introduced crystalline nucleation points that attract agents, causing the web to form radial structural clusters like mineralizing cellular colonies.
// Iteration 6: The Bio-Electrician - Introduced conductive ion trails where agents release oscillating electrical pulses that jump across gaps, creating a high-energy "synaptic" network within the calcified structure.
// Iteration 7: The Symbiote - Introduced intercellular adhesion where agents periodically snap to neighbors, forming tight-knit clusters that act as secondary colonial hubs.

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
  // Biological decay: a very low alpha allows the skeletal structure to bloom and remain rigid.
  background(5, 8, 12, 4);

  loadPixels();
  // Multiple updates per frame to resolve complex weaving patterns
  for (let i = 3; i--; ) {
    agents.update();
  }
  updatePixels();
}

class Agent {
  constructor() {
    this.x = width / 2 + random(-80, 80);
    this.y = height / 2 + random(-80, 80);
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
      this.dir = lerp(this.dir, targetDir, 0.035);
    }

    if (currentDensity > 0.8) {
      this.dir += (random() < 0.5 ? 1 : -1) * (PI * 0.4); 
    } else {
      if (center > left && center > right) {
          // Flow
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
    return pixels[index + 1]; 
  }

  updatePosition(others) {
    const currentDensity = this.sense(0, 0) / 255.0;
    
    this.pulsePhase += 0.28;
    const pulse = (sin(this.pulsePhase) + 1) * 0.5;
    
    // SYMBIOTIC COHESION: Microorganisms seek proximity. 
    // Occasionally, an agent "snaps" its trajectory towards a nearby neighbor, 
    // reinforcing the collective web and creating organic 'bundle' nodes.
    if (random() < 0.05) {
      let targetNeighbor = others[floor(random(others.length))];
      let d2 = distSq(this.x, this.y, targetNeighbor.x, targetNeighbor.y);
      if (d2 < 2500 && d2 > 25) { // Influence range
        this.dir = lerp(this.dir, atan2(targetNeighbor.y - this.y, targetNeighbor.x - this.x), 0.2);
      }
    }

    const speed = lerp(2.9, 0.5, currentDensity) * (0.8 + pulse * 0.45);
    
    this.x += cos(this.dir) * speed;
    this.y += sin(this.dir) * speed;
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const xf = floor(this.x);
    const yf = floor(this.y);
    const index = (xf + yf * width) * 4;
    
    const baseDeposit = (22 + (currentDensity * 85)) * (0.5 + pulse);
    
    pixels[index] = min(pixels[index] + baseDeposit * 0.35, 255);
    pixels[index + 1] = min(pixels[index+1] + baseDeposit * 1.3, 255);
    pixels[index + 2] = min(pixels[index+2] + baseDeposit * 2.0, 255);
  }
}

class Agents {
  constructor() {
    this.agents = Array(agentsNum).fill().map(() => new Agent());
  }
  update() {
    for(let a of this.agents) a.updateDirection();
    // Passing the agent list to allow for neighbor sensing in updatePosition
    for(let a of this.agents) a.updatePosition(this.agents);
  }
}

function distSq(x1, y1, x2, y2) {
  return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
}
