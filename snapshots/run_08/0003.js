// Inspired by Jason
// Iteration 1: The Weaver - Introduced calcified web persistence by modifying the background fade to preserve cellular walls.
// Iteration 2: The Osteoblast - Introduced a hardening logic where existing web structures slow agents down and force 'calcification' through higher density deposits.
// Iteration 3: The Arachnid - Introduced communal silk-binding behavior via dynamic sensor scaling, causing microorganisms to weave bridging fibers between dense calcified nodes.

const agentColor = new Uint8Array([220, 240, 255]);
const agentsNum = 4000;
const sensorAngle = Math.PI / 6;
const turnAngle = Math.PI / 8;
let agents;

function setup() {
  createCanvas(1600, 900);
  pixelDensity(1);
  background(10, 15, 20);
  agents = new Agents();
}

function buttonPressed() {
  agents = new Agents();
}

function draw() {
  /**
   * By lowering the alpha of the background refresh and using a darker, 
   * organic hue, the trails left by agents begin to "calcify" and 
   * form persistent biological microstructures resembling a web or 
   * skeletal lattice.
   */
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
    // SENSOR SCALING: Agents reach further out when in empty space to find 'anchors'
    // but retract sensors in dense areas to focus on thickening the local lattice wall.
    const currentDensity = this.sense(0, 0) / 255.0;
    const dynamicSensorOffset = lerp(35, 8, currentDensity);

    const right = this.sense(+sensorAngle, dynamicSensorOffset);
    const center = this.sense(0, dynamicSensorOffset);
    const left = this.sense(-sensorAngle, dynamicSensorOffset);

    // Agents are attracted to their own secretions to build structural integrity
    const threeWays = [left, center, right];
    const maxIndex = threeWays.indexOf(max(...threeWays));
    
    if (center > left && center > right) {
        // Continue forward
    } else if (center < left && center < right) {
        this.dir += (random() < 0.5 ? 1 : -1) * turnAngle;
    } else {
        this.dir += turnAngle * (maxIndex - 1);
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
    // This allows more matter to be deposited in existing structures, strengthening them.
    const currentDensity = this.sense(0, 0) / 255.0;
    const speed = lerp(1.8, 0.4, currentDensity);
    
    this.x += cos(this.dir) * speed;
    this.y += sin(this.dir) * speed;
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const xf = floor(this.x);
    const yf = floor(this.y);
    const index = (xf + yf * width) * 4;
    
    // Depositing biological matter (increasing brightness)
    // Deposit amount increases if agent is moving slowly in a dense region (thickening the wall)
    const deposit = 30 + (currentDensity * 60);
    pixels[index] = min(pixels[index] + deposit, 255);
    pixels[index+1] = min(pixels[index+1] + deposit * 1.1, 255);
    pixels[index+2] = min(pixels[index+2] + deposit * 1.3, 255);
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
