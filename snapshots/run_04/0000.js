// Inspired by Jason
// https://softologyblog.wordpress.com/2019/04/11/physarum-simulations/

// OPC.button("btoButton", "back to origin");
const agentColor = new Uint8Array([0, 0, 0]);
const agentsNum = 4000;
const sensorOffset = 10;
const sensorAngle = Math.PI / 7;
const turnAngle = Math.PI / 5;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  pixelDensity(1);
  background(0);
  // frameRate(10);
  agents = new Agents();
}

function buttonPressed() {
  agents = new Agents();
}

function draw() {
  background(255, 10);

  stroke("blue");
  strokeWeight(3);
  mouseIsPressed && line(pmouseX, pmouseY, mouseX, mouseY);

  loadPixels();
  for (let i = 10; i--; ) {
    agents.update();
  }
  updatePixels();
}

class Agent {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;
    this.dir = random(TWO_PI);
  }

  updateDirection() {
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

		const threeWays = [left, center - 1 , right];
		const minIndex = threeWays.indexOf(min(...threeWays));
		this.dir += turnAngle * (minIndex - 1);
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
    this.x += cos(this.dir);
    this.y += sin(this.dir);
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const index = floor(this.x) + floor(this.y) * width;
    pixels.set(agentColor, index * 4);
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
