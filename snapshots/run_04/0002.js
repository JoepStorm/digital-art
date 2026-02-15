// Inspired by Jason
// Iteration 1: The Weaver of Shadows - Introduced an evaporation decay factor to the trail map for a ghostly sense of impermanence.
// Iteration 2: The Ethereal Wanderer - Introduced brownian motion and directional noise to mimic the entropy of decaying memory.

const agentColor = new Uint8Array([0, 0, 0]);
const agentsNum = 4000;
const sensorOffset = 12;
const sensorAngle = Math.PI / 6;
const turnAngle = Math.PI / 5;
const randomness = 0.15; // The entropy factor: agents occasionally deviate from the path
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  pixelDensity(1);
  background(255);
  agents = new Agents();
}

function draw() {
  loadPixels();
  
  // Evaporation effect: simulates the gradual forgetting or fading of organic traces.
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i] < 255) pixels[i] += 2;
    if (pixels[i+1] < 255) pixels[i+1] += 2;
    if (pixels[i+2] < 255) pixels[i+2] += 2;
  }

  // Multi-step update for smoother, more organic visual density
  for (let i = 5; i--; ) {
    agents.update();
  }
  updatePixels();

  if (mouseIsPressed) {
    stroke(0, 30);
    strokeWeight(40);
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

    // Core Slime Mold logic: Gradient descent on the trail map
    const threeWays = [left, center - 2, right];
    const minVal = min(...threeWays);
    
    // If all paths are equally "clean", or with a slight probability, 
    // the agent takes a random turn (Brownian influence)
    if (random() < randomness) {
       this.dir += random(-turnAngle, turnAngle);
    } else {
       const minIndex = threeWays.indexOf(minVal);
       this.dir += turnAngle * (minIndex - 1);
    }
  }

  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + sensorOffset * cos(angle));
    let y = floor(this.y + sensorOffset * sin(angle));
    
    // Toroidal topology: wrap around the canvas edges
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

    const ix = floor(this.x);
    const iy = floor(this.y);
    const index = (ix + iy * width) * 4;
    
    // Deposit pheromone (black ink)
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
    // Agents sense their environment before moving to maintain coherent structures
    this.agents.forEach((e) => e.updateDirection());
    this.agents.forEach((e) => e.updatePosition());
  }
}
