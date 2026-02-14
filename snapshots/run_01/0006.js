// Iteration 1: Slightly increase agent color opacity
// Iteration 2: Add a slight random wobble to the agent direction
// Iteration 3: Add a subtle trail decay effect
// Iteration 4: Increase the number of update iterations to make the trails more dense
// Iteration 5: Add a slight color variation to the trail based on the agent's direction
// Iteration 6: MANUAL: changed canvas size
const agentColor = new Uint8Array([0, 0, 0]);
const agentsNum = 5000;
const sensorOffset = 10;
const sensorAngle = Math.PI / 7;
const turnAngle = Math.PI / 5;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight);
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
  // Increase the number of update iterations
  for (let i = 50; i--; ) {
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

  // Sense left/center/right and steer toward the darkest trail
  updateDirection() {
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

		const threeWays = [left, center - 1 , right];
		const minIndex = threeWays.indexOf(min(...threeWays));
		this.dir += turnAngle * (minIndex - 1);
    // Add a small random wobble to the direction
    this.dir += random(-0.05, 0.05);
  }

  // Sample the pixel brightness at a sensor point offset from the agent
  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + sensorOffset * cos(angle));
    let y = floor(this.y + sensorOffset * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;

    const index = (x + y * width) * 4;
    return pixels[index];
  }

  // Move one step in the current direction and deposit a trail pixel
  updatePosition() {
    this.x += cos(this.dir);
    this.y += sin(this.dir);
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const index = floor(this.x) + floor(this.y) * width;
    let alpha = 150; // Initial alpha value
    if (pixels[index * 4 + 3] > 0) {
      // If there's already a pixel there, reduce the alpha
      alpha = Math.max(0, pixels[index * 4 + 3] - 10);
    }

    // Add a slight color variation based on direction
    let r = 0;
    let g = 0;
    let b = 0;

    if (this.dir > 0 && this.dir < PI / 3) {
      r = 50;
    } else if (this.dir > PI / 3 && this.dir < 2 * PI / 3) {
      g = 50;
    } else {
      b = 50;
    }

    pixels.set([r, g, b, alpha], index * 4);
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
