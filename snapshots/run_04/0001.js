// Inspired by Jason
// Iteration 1: The Weaver of Shadows - Introduced an evaporation decay factor to the trail map for a ghostly sense of impermanence.

const agentColor = new Uint8Array([0, 0, 0]);
const agentsNum = 4000;
const sensorOffset = 10;
const sensorAngle = Math.PI / 7;
const turnAngle = Math.PI / 5;
let agents;

function setup() {
  createCanvas(1600, 900);
  pixelDensity(1);
  background(255);
  agents = new Agents();
}

function draw() {
  // Rather than drawing a clear background, we manipulate the pixel array directly
  // to create a fading effect of the past trails.
  loadPixels();
  
  // Evaporation effect: iterates through all pixels and slightly lightens them
  // this simulates the "impermanence" of the chemical trails.
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i] < 255) pixels[i] += 2;     // R
    if (pixels[i+1] < 255) pixels[i+1] += 2; // G
    if (pixels[i+2] < 255) pixels[i+2] += 2; // B
  }

  for (let i = 5; i--; ) {
    agents.update();
  }
  updatePixels();

  if (mouseIsPressed) {
    stroke(0, 50);
    strokeWeight(20);
    line(pmouseX, pmouseY, mouseX, mouseY);
  }
}

class Agent {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.dir = random(TWO_PI);
  }

  updateDirection() {
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    // Physarum logic: agents move toward areas with more "pheromones"
    // In this case, darker pixels (lower values) represent stronger trails.
    const threeWays = [left, center - 1, right];
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

    const index = (floor(this.x) + floor(this.y) * width) * 4;
    pixels[index] = agentColor[0];
    pixels[index + 1] = agentColor[1];
    pixels[index + 2] = agentColor[2];
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
