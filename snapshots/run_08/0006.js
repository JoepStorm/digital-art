// Inspired by Jason
// Iteration 1: The Weaver - Introduced calcified web persistence by modifying the background fade to preserve cellular walls.
// Iteration 2: The Osteoblast - Introduced a hardening logic where existing web structures slow agents down and force 'calcification' through higher density deposits.
// Iteration 3: The Arachnid - Introduced communal silk-binding behavior via dynamic sensor scaling, causing microorganisms to weave bridging fibers between dense calcified nodes.
// Iteration 4: The Mycelium - Introduced lateral "branching" behavior where agents grow secondary filamentous shoots when hitting dense structural barriers.
// Iteration 5: The Crystallographer - Introduced crystalline nucleation points that attract agents, causing the web to form radial structural clusters like mineralizing cellular colonies.
// Iteration 6: The Bio-Electrician - Introduced conductive ion trails where agents release oscillating electrical pulses that jump across gaps, creating a high-energy "synaptic" network within the calcified structure.

const agentsNum = 4000;
const sensorAngle = Math.PI / 6;
const turnAngle = Math.PI / 8;
let agents;
let nucleationPoints = [];

function setup() {
  createCanvas(1600, 900);
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
  background(5, 8, 12, 3);

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
    // Unique phase for bio-electrical pulsing
    this.pulsePhase = random(TWO_PI);
  }

  updateDirection() {
    const currentDensity = this.sense(0, 0) / 255.0;
    const dynamicSensorOffset = lerp(45, 12, currentDensity);

    const left = this.sense(-sensorAngle, dynamicSensorOffset);
    const center = this.sense(0, dynamicSensorOffset);
    const right = this.sense(+sensorAngle, dynamicSensorOffset);

    // CRYSTALLINE NUCLEATION: Agents migrate toward anchors to establish the colony perimeter.
    let pullX = 0;
    let pullY = 0;
    nucleationPoints.forEach(p => {
      let dx = p.x - this.x;
      let dy = p.y - this.y;
      let d2 = dx*dx + dy*dy;
      if (d2 < 160000) { // 400px radius
        let d = sqrt(d2);
        pullX += dx / d;
        pullY += dy / d;
      }
    });

    if (abs(pullX) > 0.1) {
      let targetDir = atan2(pullY, pullX);
      this.dir = lerp(this.dir, targetDir, 0.03);
    }

    // IONIC CONDUCTIVITY: If an agent is in a medium-density area, it follows the 'electricity' (higher trail values),
    // but if it hits a dense 'bone' wall (>0.85), it conducts a sharp turn to wrap around the structure.
    if (currentDensity > 0.85) {
      this.dir += (random() < 0.5 ? 1 : -1) * (PI * 0.4); 
    } else {
      if (center > left && center > right) {
          // Maintaining flow
      } else if (center < left && center < right) {
          this.dir += (random() < 0.5 ? 1 : -1) * turnAngle;
      } else if (left > right) {
          this.dir -= turnAngle;
      } else if (right > left) {
          this.dir += turnAngle;
      }
    }
    
    // Slight Brownian motion to simulate liquid microscopic environment
    this.dir += (random() - 0.5) * 0.1;
  }

  sense(dirOffset, dist) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + dist * cos(angle));
    let y = floor(this.y + dist * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;

    const index = (x + y * width) * 4;
    return pixels[index + 1]; // Sense the Green channel - which represents the "ion" trails
  }

  updatePosition() {
    const currentDensity = this.sense(0, 0) / 255.0;
    
    // BIO-ELECTRIC PULSING: The agent's speed and deposit intensity oscillate, 
    // creating "dotted" synaptic lines that look like electrical signals traveling through a web.
    this.pulsePhase += 0.25;
    const pulse = (sin(this.pulsePhase) + 1) * 0.5;
    
    const speed = lerp(2.8, 0.6, currentDensity) * (0.8 + pulse * 0.4);
    
    this.x += cos(this.dir) * speed;
    this.y += sin(this.dir) * speed;
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const xf = floor(this.x);
    const yf = floor(this.y);
    const index = (xf + yf * width) * 4;
    
    // Deposit calculation for the ionic web
    // Blue = Hard calcified structure; Cyan/White = High energy ion pulses
    const baseDeposit = (20 + (currentDensity * 80)) * (0.5 + pulse);
    
    // R: Core structure, G: Ionic conductivity, B: Bioluminescent glow
    pixels[index] = min(pixels[index] + baseDeposit * 0.4, 255);
    pixels[index + 1] = min(pixels[index+1] + baseDeposit * 1.2, 255);
    pixels[index + 2] = min(pixels[index+2] + baseDeposit * 1.8, 255);
  }
}

class Agents {
  constructor() {
    this.agents = Array(agentsNum).fill().map(() => new Agent());
  }
  update() {
    for(let a of this.agents) a.updateDirection();
    for(let a of this.agents) a.updatePosition();
  }
}
