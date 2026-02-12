// Inspired by Jason
// Iteration 1: The Mycelial Architect - Introduced species-specific logic with variable sensor ranges and color signatures
// Iteration 2: The Ethereal Weaver - Introduced species-specific repulsion and velocity variation to create cellular structures
// Iteration 3: The Pulse Oscillator - Introduced species-specific cyclic behavior where sensor range oscillates, creating rhythmic breathing patterns in the trail networks
// Iteration 4: The Chromatic Alchemist - Introduced velocity-based color shifting and trail-dragging to create more fluid, painterly gradients
const agentsNum = 4000;
const sensorAngle = Math.PI / 7;
const turnAngle = Math.PI / 5;
let agents;

function setup() {
  createCanvas(1600, 800);
  pixelDensity(1);
  background(0);
  agents = new Agents();
}

function draw() {
  // Low alpha fade handles the evaporation of trails
  background(0, 8);

  loadPixels();
  // Perform multiple simulation steps per frame for organic flow
  for (let i = 4; i--; ) {
    agents.update();
  }
  updatePixels();
}

class Agent {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.dir = random(TWO_PI);
    
    // Each species now has unique motion and sensory parameters
    this.species = floor(random(3));
    this.phase = random(TWO_PI); // Unique phase for temporal oscillation
    
    if (this.species === 0) {
      this.baseColor = [255, 60, 120]; // Deep Pink
      this.baseSensorOffset = 18;
      this.speed = 1.2;
      this.repulse = false; 
      this.pulseFreq = 0.05; // Quick rhythmic pulse
    } else if (this.species === 1) {
      this.baseColor = [40, 255, 200]; // Cyan-Green
      this.baseSensorOffset = 30;
      this.speed = 2.5;
      this.repulse = true; 
      this.pulseFreq = 0.01; // Slow breathing
    } else {
      this.baseColor = [60, 110, 255]; // Cobalt Blue
      this.baseSensorOffset = 45;
      this.speed = 1.8;
      this.repulse = false;
      this.pulseFreq = 0.03; // Moderate oscillation
    }
  }

  updateDirection() {
    // Oscillate the sensor range over time to produce "breathing" behavior
    this.phase += this.pulseFreq;
    const currentSensorOffset = this.baseSensorOffset * (1 + 0.5 * sin(this.phase));
    
    let right = this.sense(+sensorAngle, currentSensorOffset);
    let center = this.sense(0, currentSensorOffset);
    let left = this.sense(-sensorAngle, currentSensorOffset);

    // Dynamic obstacle/density avoidance
    if (this.repulse) {
      const threshold = 400; 
      if (center > threshold) center = -center;
      if (left > threshold) left = -left;
      if (right > threshold) right = -right;
    }

    if (center > left && center > right) {
      // Forward
    } else if (center < left && center < right) {
      this.dir += (random() < 0.5 ? 1 : -1) * turnAngle;
    } else if (left > right) {
      this.dir -= turnAngle;
    } else if (right > left) {
      this.dir += turnAngle;
    }
    
    this.dir += (random() - 0.5) * 0.1;
  }

  sense(dirOffset, dist) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + dist * cos(angle));
    let y = floor(this.y + dist * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;

    const index = (x + y * width) * 4;
    // Map signal strength from the current pixel trails
    return pixels[index] + pixels[index + 1] + pixels[index + 2];
  }

  updatePosition() {
    const prevX = this.x;
    const prevY = this.y;

    this.x += cos(this.dir) * this.speed;
    this.y += sin(this.dir) * this.speed;
    
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const px = floor(this.x);
    const py = floor(this.y);
    const index = (px + py * width) * 4;
    
    // Calculate a color shift based on movement phase to create iridescent smears
    const shift = sin(this.phase) * 40;
    
    // Write new position to the pixel buffer with additive blending logic
    // We blend current pixel color with the species color for softer intersections
    pixels[index]     = min(255, pixels[index]     * 0.5 + this.baseColor[0] + shift);
    pixels[index + 1] = min(255, pixels[index + 1] * 0.5 + this.baseColor[1] + shift);
    pixels[index + 2] = min(255, pixels[index + 2] * 0.5 + this.baseColor[2] + shift);
    pixels[index + 3] = 255;
  }
}

class Agents {
  constructor() {
    this.agents = Array(agentsNum)
      .fill()
      .map(() => new Agent());
  }
  update() {
    for (let a of this.agents) a.updateDirection();
    for (let a of this.agents) a.updatePosition();
  }
}
