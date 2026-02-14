// Inspired by Jason
// Iteration 1: The Monochromist - Replaced blue trails with a ghostly white fade and increased agent density for a delicate charcoal-on-paper aesthetic.
// Iteration 2: The Cartographer - Introduced a subtle canvas texture and limited agent movement to create delicate, map-like contour lines.
// Iteration 3: The Minimalist - Introduced void-repulsion and increased transparency to create delicate, floating geometric clouds with vast negative space.
// Iteration 4: The Linearist - Constrained sensors to strictly forward-looking long vectors, forcing agents into extremely long, parallel hair-like strokes.
// Iteration 5: The Etherealist - Reduced agent count and introduced a decaying sensory threshold to allow lines to dissipate into nothingness, emphasizing negative space and fragility.
// Iteration 6: The Reductionist - Removed the sensory-seeking logic entirely, letting agents travel in pure linear trajectories that occasionally break into delicate, slow-motion curves for a more breath-like, sparse composition.
// Iteration 7: The Threadweaver - Unified agent direction so lines flow in a singular, sweeping breath across the canvas.
const agentColor = new Uint8Array([80, 80, 80]); // Soft charcoal grey
const agentsNum = 120; // Slightly lower for more isolation
const turnAngle = 0.002; // Reduced further for extreme linearity
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(255); 
  agents = new Agents();
}

function draw() {
  // A near-invisible wipe creates a history of movement rather than just trails
  background(255, 0.5);

  loadPixels();
  agents.update();
  updatePixels();
}

class Agent {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    // Initial direction is shared to create a sense of collective flow
    this.dir = PI * 0.25; 
    this.angularVel = random(-turnAngle, turnAngle);
  }

  updateDirection() {
    // Shared momentum: agents slowly oscillate around a common horizontal axis
    // This creates a sense of wind-blown threads rather than chaotic scribbles
    if (random() < 0.005) {
      this.angularVel = random(-turnAngle, turnAngle);
    }
    
    // Bias the direction toward the right to maintain a horizontal 'read'
    let targetDir = 0;
    let angleDiff = targetDir - (this.dir % TWO_PI);
    this.dir += angleDiff * 0.001 + this.angularVel;
  }

  updatePosition() {
    const speed = 0.6;
    this.x += cos(this.dir) * speed;
    this.y += sin(this.dir) * speed;
    
    // Soft Wrap 
    if (this.x < 0) this.x += width;
    if (this.x >= width) this.x -= width;
    if (this.y < 0) this.y += height;
    if (this.y >= height) this.y -= height;

    const px = floor(this.x);
    const py = floor(this.y);
    const index = (px + py * width) * 4;
    
    if (index >= 0 && index < pixels.length) {
      // Injected slight transparency into the pixel writing logic conceptually by 
      // darkening existing pixels rather than just setting them, if this were true blending.
      // Here we stick to setting the color for a crisp, thin line.
      pixels[index] = agentColor[0];
      pixels[index + 1] = agentColor[1];
      pixels[index + 2] = agentColor[2];
    }
  }
}

class Agents {
  constructor() {
    this.agents = Array(agentsNum)
      .fill()
      .map((e) => new Agent());
  }
  update() {
    this.agents.forEach((e) => {
      e.updateDirection();
      e.updatePosition();
    });
  }
}
