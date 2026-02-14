// Inspired by Jason
// Iteration 1: The Weaver - Reduced population and added a spontaneous spawning mechanism at the canvas center
// Iteration 2: The Chromatic Alchemist - Added color-shifting trails that evolve based on agent position
// Iteration 3: The Ghost Weaver - Introduced variable speed and inertia to agent movement for more fluid, flowing trails
// Iteration 4: The Mycelial Architect - Introduced agent branching to create dense geometric webs
// Iteration 5: The Ethereal Weaver - Introduced gravitational attraction towards persistent center-points to form cellular nodes
const agentsNum = 400;
const sensorOffset = 22;
const sensorAngle = Math.PI / 7;
const turnAngle = Math.PI / 9;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(0);
  colorMode(HSB, 255);
  agents = new Agents();
}

function draw() {
  // Increased persistence of trails by lowering background opacity
  background(0, 6);

  loadPixels();
  for (let i = 4; i--; ) {
    agents.update();
  }
  updatePixels();

  // Spasmodic rebirth: agents occasionally burst from random locations to prevent static patterns
  if (frameCount % 180 === 0) {
    let rx = random(width);
    let ry = random(height);
    for (let i = 0; i < 15; i++) {
        let a = agents.agents[floor(random(agents.agents.length))];
        a.x = rx;
        a.y = ry;
        a.dir = random(TWO_PI);
    }
  }
}

class Agent {
  constructor(x, y, dir) {
    this.x = x || random(width);
    this.y = y || random(height);
    this.dir = dir || random(TWO_PI);
    this.speed = random(1.2, 2.8);
  }

  updateDirection() {
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    if (center > left && center > right) {
        // Forward
    } else if (center < left && center < right) {
        this.dir += (random() < 0.5 ? 1 : -1) * turnAngle;
    } else if (left > right) {
        this.dir -= turnAngle;
    } else if (right > left) {
        this.dir += turnAngle;
    }

    // GRAVITATIONAL DRIFT: Subtle bias towards the center to create macro-structures
    // This creates a circular tension against the chaotic expansion
    let angleToCenter = atan2(height / 2 - this.y, width / 2 - this.x);
    let diff = angleToCenter - this.dir;
    while (diff < -PI) diff += TWO_PI;
    while (diff > PI) diff -= TWO_PI;
    this.dir += diff * 0.02; 
  }

  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let sx = floor(this.x + sensorOffset * cos(angle));
    let sy = floor(this.y + sensorOffset * sin(angle));
    
    sx = (sx + width) % width;
    sy = (sy + height) % height;

    const index = (sx + sy * width) * 4;
    return pixels[index];
  }

  updatePosition() {
    this.x += cos(this.dir) * this.speed;
    this.y += sin(this.dir) * this.speed;
    
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const ix = floor(this.x);
    const iy = floor(this.y);
    const index = (ix + iy * width) * 4;
    
    // Aesthetic shift: more vibrant, narrower spectrum of colors for a cohesive look
    let h = (this.x / width * 100 + this.y / height * 100 + frameCount * 0.15) % 255;
    let s = 200;
    let b = 255;
    
    let c = color(h, s, b);
    
    // Update pixel buffer
    pixels[index] = red(c);
    pixels[index + 1] = green(c);
    pixels[index + 2] = blue(c);
    pixels[index + 3] = 255;

    // Mycelial branching logic
    if (agents.agents.length < 1500 && random() < 0.0012) {
        agents.agents.push(new Agent(this.x, this.y, this.dir + random(-0.6, 0.6)));
    }
  }
}

class Agents {
  constructor() {
    this.agents = Array(agentsNum).fill().map(() => new Agent());
  }
  update() {
    for (let i = 0; i < this.agents.length; i++) {
        this.agents[i].updateDirection();
    }
    for (let i = 0; i < this.agents.length; i++) {
        this.agents[i].updatePosition();
    }
    
    if (this.agents.length > 1200) {
        this.agents.splice(0, 8);
    }
  }
}
