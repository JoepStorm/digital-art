// Inspired by Jason
// Iteration 1: The Monochromist - Replaced blue trails with a ghostly white fade and increased agent density for a delicate charcoal-on-paper aesthetic.
// Iteration 2: The Cartographer - Introduced a subtle canvas texture and limited agent movement to create delicate, map-like contour lines.
// Iteration 3: The Minimalist - Introduced void-repulsion and increased transparency to create delicate, floating geometric clouds with vast negative space.
// Iteration 4: The Linearist - Constrained sensors to strictly forward-looking long vectors, forcing agents into extremely long, parallel hair-like strokes.
// Iteration 5: The Etherealist - Reduced agent count and introduced a decaying sensory threshold to allow lines to dissipate into nothingness, emphasizing negative space and fragility.
// Iteration 6: The Reductionist - Removed the sensory-seeking logic entirely, letting agents travel in pure linear trajectories that occasionally break into delicate, slow-motion curves for a more breath-like, sparse composition.
const agentColor = new Uint8Array([80, 80, 80]); // Lifted the black closer to a soft grey
const agentsNum = 150; // Further reduced for maximum negative space
const turnAngle = 0.005; // Extremely subtle turning
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  pixelDensity(1);
  background(255); 
  agents = new Agents();
}

function draw() {
  // Use a very light background wipe to maintain the ghosting of older lines
  background(255, 1);

  loadPixels();
  agents.update();
  updatePixels();
}

class Agent {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.dir = random(TWO_PI);
    this.angularVel = random(-turnAngle, turnAngle);
  }

  updateDirection() {
    // Replaced complex sensing with "Internal Drift". 
    // In minimalism, the movement is defined by its own momentum rather than external stimulus.
    // Occasionally nudge the direction to create giant, sweeping arcs.
    if (random() < 0.01) {
      this.angularVel = random(-turnAngle, turnAngle);
    }
    this.dir += this.angularVel;
  }

  updatePosition() {
    // Slowed down the agents to emphasize the stillness of the composition
    const speed = 0.8;
    this.x += cos(this.dir) * speed;
    this.y += sin(this.dir) * speed;
    
    // Smooth wrapping
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const px = floor(this.x);
    const py = floor(this.y);
    const index = (px + py * width) * 4;
    
    // Draw only a single soft grey pixel
    if (index >= 0 && index < pixels.length) {
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
