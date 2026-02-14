// Inspired by Jason
// Iteration 1: The Weaver - Introduced calcified web persistence by modifying the background fade to preserve cellular walls.
// Iteration 2: The Osteoblast - Introduced a hardening logic where existing web structures slow agents down and force 'calcification' through higher density deposits.
// Iteration 3: The Arachnid - Introduced communal silk-binding behavior via dynamic sensor scaling, causing microorganisms to weave bridging fibers between dense calcified nodes.
// Iteration 4: The Mycelium - Introduced lateral "branching" behavior where agents grow secondary filamentous shoots when hitting dense structural barriers.

const agentColor = new Uint8Array([220, 240, 255]);
const agentsNum = 4000;
const sensorAngle = Math.PI / 6;
const turnAngle = Math.PI / 8;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(10, 15, 20);
  agents = new Agents();
}

function buttonPressed() {
  agents = new Agents();
}

function draw() {
  // Lowering alpha ensures the "calcification" process persists over frames, 
  // turning trails into rigid biological micro-skeletons.
  background(15, 20, 25, 2);

  loadPixels();
  for (let i = 4; i--; ) {
    agents.update();
  }
  updatePixels();
}

class Agent {
  constructor() {
    this.x = width / 2 + random(-50, 50);
    this.y = height / 2 + random(-50, 50);
    this.dir = random(TWO_PI);
  }

  updateDirection() {
    const currentDensity = this.sense(0, 0) / 255.0;
    const dynamicSensorOffset = lerp(35, 8, currentDensity);

    const right = this.sense(+sensorAngle, dynamicSensorOffset);
    const center = this.sense(0, dynamicSensorOffset);
    const left = this.sense(-sensorAngle, dynamicSensorOffset);

    // LATERAL BRANCHING: If an agent hits a very dense wall (marrow), it triggers a sharp 
    // branching behavior, mimicking how mycelium or blood vessels navigate tight spaces.
    if (currentDensity > 0.8) {
      this.dir += (random() < 0.5 ? 1 : -1) * (PI / 2); // 90 degree sharp branch
    } else {
      const threeWays = [left, center, right];
      const maxIndex = threeWays.indexOf(max(...threeWays));
      
      if (center > left && center > right) {
          // Stay the course
      } else if (center < left && center < right) {
          this.dir += (random() < 0.5 ? 1 : -1) * turnAngle;
      } else {
          this.dir += turnAngle * (maxIndex - 1);
      }
    }
  }

  sense(dirOffset, dist) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + dist * cos(angle));
    let y = floor(this.y + dist * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;

    const index = (x + y * width) * 4;
    return pixels[index];
  }

  updatePosition() {
    // Structural hardening factor: agents move slower through dense "calcified" areas
    const currentDensity = this.sense(0, 0) / 255.0;
    const speed = lerp(1.8, 0.4, currentDensity);
    
    this.x += cos(this.dir) * speed;
    this.y += sin(this.dir) * speed;
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const xf = floor(this.x);
    const yf = floor(this.y);
    const index = (xf + yf * width) * 4;
    
    // Deposit amount increases in dense regions to reinforce the structural web.
    // Enhanced blue/cyan tinting to evoke a bioluminescent/microscopic slide aesthetic.
    const deposit = 30 + (currentDensity * 60);
    pixels[index] = min(pixels[index] + deposit * 0.8, 255);
    pixels[index + 1] = min(pixels[index+1] + deposit * 1.1, 255);
    pixels[index + 2] = min(pixels[index+2] + deposit * 1.5, 255);
  }
}

class Agents {
  constructor() {
    this.agents = Array(agentsNum)
      .fill()
      .map((e) => new Agent());
  }
  update() {
    this.agents.forEach((e) => e.updateDirection());
    this.agents.forEach((e) => e.updatePosition());
  }
}
