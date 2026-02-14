// Inspired by Jason
// Iteration 1: The Monochromist - Replaced blue trails with a ghostly white fade and increased agent density for a delicate charcoal-on-paper aesthetic.
// Iteration 2: The Cartographer - Introduced a subtle canvas texture and limited agent movement to create delicate, map-like contour lines.
const agentColor = new Uint8Array([20, 20, 20]);
const agentsNum = 4000; // Reduced for a cleaner, more minimalist look
const sensorOffset = 25; // Increased sensor offset to create larger, more open voids
const sensorAngle = Math.PI / 4;
const turnAngle = Math.PI / 10;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(245); // Off-white for a paper texture feel
  agents = new Agents();
}

function draw() {
  // Increased opacity to 2 ensures trails linger longer but remain soft
  background(245, 2);

  loadPixels();
  // Simulating multiple steps per frame for organic growth
  for (let i = 3; i--; ) {
    agents.update();
  }
  updatePixels();
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

    // Logic updated to prefer areas with slightly higher brightness (less ink)
    // this creates the hollow 'cell' effect as agents avoid crowded ink spots
    const threeWays = [left, center, right];
    const maxIndex = threeWays.indexOf(max(...threeWays));
    this.dir += turnAngle * (maxIndex - 1);
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
    // Slower movement creates smoother, more intentional lines
    this.x += cos(this.dir) * 0.8;
    this.y += sin(this.dir) * 0.8;
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
