// Inspired by Jason
// Iteration 1: The Weaver - Introduced agent aging and dynamic color shifting to simulate a lifecycle
// Iteration 2: The Necromancer - Particles now scavenge and gain speed from the fading trails of their ancestors
// Iteration 3: The Harbinger - Introduced radial spawning and a pulsating field of attraction to simulate tidal evolution
// Iteration 4: The Alchemist - Introduced cellular mutation where agents transmute their path into a diffusive "bioluminescent" flux
// Iteration 5: The Architect - Introduced spatial partitioning and structural calcification where old paths solidify into barriers
// Iteration 6: The Reaper - Introduced genetic drift and a survival-of-the-fittest mechanic where agents cannibalize the vitality of intersecting trails
// Iteration 7: The Symbiote - Introduced a horizontal gene transfer mechanism where agents swapping paths also exchange mutation rates
const agentsNum = 4000;
const sensorOffset = 18;
const sensorAngle = Math.PI / 4;
const turnAngle = Math.PI / 8;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(0);
  agents = new Agents();
}

function draw() {
  // Trail decay: simulates evaporation and fading of past structures.
  background(0, 10);

  loadPixels();
  // Multiple updates per frame to increase agent density and path complexity.
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
    // Rebirth mechanism: agents re-sprout from the center or occasionally from the periphery.
    const angle = random(TWO_PI);
    const radius = random() > 0.1 ? random(10, 80) : random(300, 500);
    this.x = width / 2 + cos(angle) * radius;
    this.y = height / 2 + sin(angle) * radius;
    this.dir = angle + (random() > 0.5 ? PI : 0);
    
    // Genetic traits that vary upon rebirth
    this.life = random(200, 1000);
    this.maxLife = this.life;
    this.speed = 1.0;
    this.mutation = random(0.5, 2.5);
    this.affinity = random([-1, 1]);
    // The "Reaper" gene: higher values allow agents to steal more life from the environment
    this.reaperGene = random(0.2, 0.8);
  }

  updateDirection() {
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    const dx = this.x - width / 2;
    const dy = this.y - height / 2;
    const distToCenter = sqrt(dx*dx + dy*dy);
    const angleToCenter = atan2(dy, dx);
    
    // Pulsating field influence
    const pulse = sin(frameCount * 0.015) * 0.15;
    this.dir += pulse * (this.dir - angleToCenter);

    // Speed modulation: high density zones trigger rapid movement.
    this.speed = map(center + left + right, 0, 765, 1.2, 4.5);

    const actualTurn = turnAngle * this.mutation;

    // Movement logic based on chemical sensing.
    if (center > left && center > right) {
      // Direct path
    } else if (center < left && center < right) {
      this.dir += (random() < 0.5 ? 1 : -1) * actualTurn * this.affinity;
    } else if (left > right) {
      this.dir -= actualTurn * this.affinity;
    } else if (right > left) {
      this.dir += actualTurn * this.affinity;
    }
    
    // Soft boundary correction
    if (this.x < 40 || this.x > width - 40 || this.y < 40 || this.y > height - 40) {
        this.dir += (angleToCenter + PI - this.dir) * 0.12;
    }
  }

  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + sensorOffset * cos(angle));
    let y = floor(this.y + sensorOffset * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;

    const index = (x + y * width) * 4;
    return pixels[index + 2] + pixels[index] * 0.5;
  }

  updatePosition() {
    this.x += cos(this.dir) * this.speed;
    this.y += sin(this.dir) * this.speed;
    
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const px = floor(this.x);
    const py = floor(this.y);
    
    if (px >= 0 && px < width && py >= 0 && py < height) {
      const index = (px + py * width) * 4;
      
      // THE REAPER MECHANIC: Agents "eat" the trail they are standing on to gain life.
      let existingBlue = pixels[index + 2];
      let existingGreen = pixels[index + 1];

      // THE SYMBIOTE MECHANIC: Horizontal Gene Transfer.
      // If an agent steps on a highly "vital" (green) trail left by a high-reaper agent,
      // it has a chance to assimilate that agent's mutation speed, causing local chaotic blooms.
      if (existingGreen > 150 && random() < 0.05) {
        this.mutation = lerp(this.mutation, random(0.1, 5.0), 0.2);
        this.speed *= 1.1; 
      }

      if (existingBlue > 50) {
        this.life += existingBlue * 0.02 * this.reaperGene;
        pixels[index + 2] = max(0, existingBlue - 10); // Deplete the trail
      }

      this.life -= 1;
      if (this.life <= 0) {
        this.init(); 
        return;
      }

      const lifeRatio = constrain(this.life / this.maxLife, 0, 1);
      
      let r = pixels[index];
      let g = pixels[index + 1];
      let b = pixels[index + 2];

      // Red channel: fossilized structural memory (increases as life ratio drops)
      pixels[index] = min(255, r + (8 * (1 - lifeRatio))); 
      // Green channel: vitality flicker (reaper agents glow more intensely)
      pixels[index + 1] = min(255, g + (15 * this.reaperGene * lifeRatio));
      // Blue channel: active flux
      pixels[index + 2] = min(255, b + 140); 
      pixels[index + 3] = 255;
    }
  }
}

class Agents {
  constructor() {
    this.agents = Array(agentsNum)
      .fill()
      .map(() => new Agent());
  }
  update() {
    for (let agent of this.agents) {
      agent.updateDirection();
    }
    for (let agent of this.agents) {
      agent.updatePosition();
    }
  }
}
