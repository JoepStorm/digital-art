// Inspired by Jason
// Iteration 1: The Weaver - Introduced agent aging and dynamic color shifting to simulate a lifecycle
// Iteration 2: The Necromancer - Particles now scavenge and gain speed from the fading trails of their ancestors
// Iteration 3: The Harbinger - Introduced radial spawning and a pulsating field of attraction to simulate tidal evolution
// Iteration 4: The Alchemist - Introduced cellular mutation where agents transmute their path into a diffusive "bioluminescent" flux
const agentsNum = 4000;
const sensorOffset = 18;
const sensorAngle = Math.PI / 4;
const turnAngle = Math.PI / 8;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  pixelDensity(1);
  background(0);
  agents = new Agents();
}

function draw() {
  // We use a blend mode or subtle fade to simulate trail decay
  // and loadPixels to allow agents to interact with the existing visual field.
  background(0, 15);

  loadPixels();
  // Diffusion/Erosion: A custom pass could go here, but for performance,
  // we let the agents handle the "lookup" and "write" within the p5 pixel array.
  for (let i = 4; i--; ) {
    agents.update();
  }
  updatePixels();
}

class Agent {
  constructor() {
    this.init();
  }

  init() {
    // Agents sprout from a ring, moving outward or inward
    const angle = random(TWO_PI);
    const radius = random(10, 80);
    this.x = width / 2 + cos(angle) * radius;
    this.y = height / 2 + sin(angle) * radius;
    this.dir = angle + (random() > 0.5 ? PI : 0);
    
    this.life = random(150, 800);
    this.maxLife = this.life;
    this.speed = 1.0;
    // Each agent now has a 'mutation' factor influencing its turning sensitivity
    this.mutation = random(0.5, 2.0);
  }

  updateDirection() {
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    const dx = this.x - width / 2;
    const dy = this.y - height / 2;
    const angleToCenter = atan2(dy, dx);
    const distToCenter = sqrt(dx*dx + dy*dy);
    
    // Mutation change: The pulse now affects the sensor strength specifically,
    // making the swarm fluctuate between rigid geometric structures and chaotic drift.
    const pulse = sin(frameCount * 0.02) * 0.1;
    this.dir += pulse * (this.dir - angleToCenter);

    this.speed = map(center + left + right, 0, 765, 1.0, 4.0);

    const actualTurn = turnAngle * this.mutation;

    if (center > left && center > right) {
      // Continue forward
    } else if (center < left && center < right) {
      this.dir += (random() < 0.5 ? 1 : -1) * actualTurn;
    } else if (left > right) {
      this.dir -= actualTurn;
    } else if (right > left) {
      this.dir += actualTurn;
    }
    
    // Edge avoidance: soft nudge back to screen center
    if (this.x < 50 || this.x > width - 50 || this.y < 50 || this.y > height - 50) {
        this.dir += (angleToCenter + PI - this.dir) * 0.1;
    }
  }

  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + sensorOffset * cos(angle));
    let y = floor(this.y + sensorOffset * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;

    const index = (x + y * width) * 4;
    // Sensing the blue channel for pheromone detection
    return pixels[index + 2];
  }

  updatePosition() {
    this.x += cos(this.dir) * this.speed;
    this.y += sin(this.dir) * this.speed;
    
    // Bounds wrapping
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    this.life -= 1;
    if (this.life <= 0) {
      this.init(); 
    }

    const px = floor(this.x);
    const py = floor(this.y);
    
    if (px >= 0 && px < width && py >= 0 && py < height) {
      const index = (px + py * width) * 4;
      const lifeRatio = this.life / this.maxLife;
      
      // CHEMICAL TRANSMUTATION: Instead of just overwriting pixels, 
      // they now perform a "max" or additive operation on specific channels
      // to create glowing overlaps and more complex color gradients.
      // Cyan to Purple to Glowing Red at the end of life.
      pixels[index] = min(255, pixels[index] + (150 * (1 - lifeRatio))); 
      pixels[index + 1] = min(255, pixels[index + 1] + (80 * lifeRatio * (sin(this.life * 0.1) * 0.5 + 0.5)));
      pixels[index + 2] = min(255, pixels[index + 2] + 120); 
      pixels[index + 3] = 255;
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
    this.agents.forEach((e) => e.updateDirection());
    this.agents.forEach((e) => e.updatePosition());
  }
}
