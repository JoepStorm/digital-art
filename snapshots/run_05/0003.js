// Inspired by Jason
// Iteration 1: The Weaver - Introduced agent aging and dynamic color shifting to simulate a lifecycle
// Iteration 2: The Necromancer - Particles now scavenge and gain speed from the fading trails of their ancestors
// Iteration 3: The Harbinger - Introduced radial spawning and a pulsating field of attraction to simulate tidal evolution
const agentsNum = 4000;
const sensorOffset = 18;
const sensorAngle = Math.PI / 4;
const turnAngle = Math.PI / 8;
let agents;

function setup() {
  createCanvas(1600, 900);
  pixelDensity(1);
  background(0);
  agents = new Agents();
}

function draw() {
  // Persistence of trails. 
  background(0, 12);

  loadPixels();
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
    // Agents now sprout from a ring around the center, moving outward initially
    const angle = random(TWO_PI);
    const radius = random(10, 50);
    this.x = width / 2 + cos(angle) * radius;
    this.y = height / 2 + sin(angle) * radius;
    this.dir = angle;
    // Life property manages the agent's cycle
    this.life = random(100, 600);
    this.maxLife = this.life;
    this.speed = 1.0;
  }

  updateDirection() {
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    // Evolutionary gravity: A subtle pull towards or away from center based on time
    // This creates "breathing" structures in the slime network
    const dx = this.x - width / 2;
    const dy = this.y - height / 2;
    const angleToCenter = atan2(dy, dx);
    const pulse = sin(frameCount * 0.01) * 0.05;
    this.dir += pulse * (this.dir - angleToCenter);

    this.speed = map(center + left + right, 0, 765, 1.2, 3.5);

    if (center > left && center > right) {
      // Straight
    } else if (center < left && center < right) {
      this.dir += (random() < 0.5 ? 1 : -1) * turnAngle;
    } else if (left > right) {
      this.dir -= turnAngle;
    } else if (right > left) {
      this.dir += turnAngle;
    }
  }

  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + sensorOffset * cos(angle));
    let y = floor(this.y + sensorOffset * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;

    const index = (x + y * width) * 4;
    return pixels[index + 2];
  }

  updatePosition() {
    this.x += cos(this.dir) * this.speed;
    this.y += sin(this.dir) * this.speed;
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
      // Color evolution: Deep ocean cyan to high-frequency magenta
      pixels[index] = 120 * (1 - lifeRatio);
      pixels[index + 1] = 200 * lifeRatio * (sin(this.life * 0.05) * 0.5 + 0.5);
      pixels[index + 2] = 255;
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
