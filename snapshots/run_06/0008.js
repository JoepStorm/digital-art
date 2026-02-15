// Inspired by Jason
// Iteration 1: The Monochromist - Replaced blue trails with a ghostly white fade and increased agent density for a delicate charcoal-on-paper aesthetic.
// Iteration 2: The Cartographer - Introduced a subtle canvas texture and limited agent movement to create delicate, map-like contour lines.
// Iteration 3: The Minimalist - Introduced void-repulsion and increased transparency to create delicate, floating geometric clouds with vast negative space.
// Iteration 4: The Linearist - Constrained sensors to strictly forward-looking long vectors, forcing agents into extremely long, parallel hair-like strokes.
// Iteration 5: The Etherealist - Reduced agent count and introduced a decaying sensory threshold to allow lines to dissipate into nothingness, emphasizing negative space and fragility.
// Iteration 6: The Reductionist - Removed the sensory-seeking logic entirely, letting agents travel in pure linear trajectories that occasionally break into delicate, slow-motion curves for a more breath-like, sparse composition.
// Iteration 7: The Threadweaver - Unified agent direction so lines flow in a singular, sweeping breath across the canvas.
// Iteration 8: The Etcher - Restricted agents to vertical bands of activity, creating rhythmic sequences of white space and silent, silver-point density.
const agentColor = new Uint8Array([60, 60, 60]); 
const agentsNum = 140; 
const turnAngle = 0.0015; 
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  pixelDensity(1);
  background(255); 
  agents = new Agents();
}

function draw() {
  // Increased fade slightly to prevent total visual saturaton and maintain the minimalist void
  background(255, 0.8);

  loadPixels();
  agents.update();
  updatePixels();
}

class Agent {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.dir = 0; 
    this.angularVel = random(-turnAngle, turnAngle);
  }

  updateDirection() {
    // Spatial restriction: Agents only change direction within specific horizontal bands.
    // This creates "striations" or "folds" in the flow, leaving large horizontal corridors of rest.
    let spatialModifier = sin(this.y * 0.005);
    
    if (abs(spatialModifier) > 0.7) {
       if (random() < 0.01) {
         this.angularVel = random(-turnAngle * 2, turnAngle * 2);
       }
    } else {
       // In the 'void' zones, they flatten out perfectly
       this.angularVel *= 0.95;
    }
    
    this.dir += this.angularVel;
  }

  updatePosition() {
    const speed = 0.8;
    this.x += cos(this.dir) * speed;
    this.y += sin(this.dir) * speed;
    
    // Seamless wrapping maintains the illusion of an infinite etch
    if (this.x < 0) this.x += width;
    if (this.x >= width) this.x -= width;
    if (this.y < 0) this.y += height;
    if (this.y >= height) this.y -= height;

    const px = floor(this.x);
    const py = floor(this.y);
    const index = (px + py * width) * 4;
    
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
