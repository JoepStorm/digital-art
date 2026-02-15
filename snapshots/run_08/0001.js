// Inspired by Jason
// Iteration 1: The Weaver - Introduced calcified web persistence by modifying the background fade to preserve cellular walls.

const agentColor = new Uint8Array([220, 240, 255]);
const agentsNum = 4000;
const sensorOffset = 15;
const sensorAngle = Math.PI / 6;
const turnAngle = Math.PI / 8;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
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
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

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

  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + sensorOffset * cos(angle));
    let y = floor(this.y + sensorOffset * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;

    const index = (x + y * width) * 4;
    return pixels[index];
  }

  updatePosition() {
    this.x += cos(this.dir) * 1.5;
    this.y += sin(this.dir) * 1.5;
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const index = (floor(this.x) + floor(this.y) * width) * 4;
    // Depositing biological matter (increasing brightness)
    pixels[index] = min(pixels[index] + 40, 255);
    pixels[index+1] = min(pixels[index+1] + 45, 255);
    pixels[index+2] = min(pixels[index+2] + 50, 255);
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
