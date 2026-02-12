// Inspired by Jason
// Iteration 1: The Monochromist - Replaced blue trails with a ghostly white fade and increased agent density for a delicate charcoal-on-paper aesthetic.
// Iteration 2: The Cartographer - Introduced a subtle canvas texture and limited agent movement to create delicate, map-like contour lines.
// Iteration 3: The Minimalist - Introduced void-repulsion and increased transparency to create delicate, floating geometric clouds with vast negative space.
// Iteration 4: The Linearist - Constrained sensors to strictly forward-looking long vectors, forcing agents into extremely long, parallel hair-like strokes.
// Iteration 5: The Etherealist - Reduced agent count and introduced a decaying sensory threshold to allow lines to dissipate into nothingness, emphasizing negative space and fragility.
const agentColor = new Uint8Array([20, 20, 20]);
const agentsNum = 400; // Drastically reduced for a more sparse, minimalist composition
const sensorOffset = 150; 
const sensorAngle = Math.PI / 48; 
const turnAngle = Math.PI / 100;
let agents;

function setup() {
  createCanvas(1600, 800);
  pixelDensity(1);
  background(255); 
  agents = new Agents();
}

function draw() {
  // Increased background opacity to clear trails faster, keeping the canvas "cleaner" and more minimal
  background(255, 3);

  loadPixels();
  agents.update();
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

    // If all sensed areas are too light (empty), move straighter or drift randomly
    // This prevents agents from clustering into the dense "wool" seen previously
    if (center > 240 && left > 240 && right > 240) {
      this.dir += random(-0.01, 0.01);
    } else {
      const weights = [left, center, right];
      const target = weights.indexOf(min(...weights)); // Seek darker pixels (lower values)
      this.dir += (target - 1) * turnAngle;
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
    const speed = 1.2;
    this.x += cos(this.dir) * speed;
    this.y += sin(this.dir) * speed;
    
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const px = floor(this.x);
    const py = floor(this.y);
    const index = (px + py * width) * 4;
    
    // Draw a single dark pixel
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
