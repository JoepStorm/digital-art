// Inspired by Jason
// Iteration 1: The Weaver - Introduced agent aging and dynamic color shifting to simulate a lifecycle
// Iteration 2: The Necromancer - Particles now scavenge and gain speed from the fading trails of their ancestors
// Iteration 3: The Harbinger - Introduced radial spawning and a pulsating field of attraction to simulate tidal evolution
// Iteration 4: The Alchemist - Introduced cellular mutation where agents transmute their path into a diffusive "bioluminescent" flux
// Iteration 5: The Architect - Introduced spatial partitioning and structural calcification where old paths solidify into barriers
// Iteration 6: The Reaper - Introduced genetic drift and a survival-of-the-fittest mechanic where agents cannibalize the vitality of intersecting trails
// Iteration 7: The Symbiote - Introduced a horizontal gene transfer mechanism where agents swapping paths also exchange mutation rates
// Iteration 8: The Wraith - Introduced ephemeral ghosts that manifest from depleted trails, creating a recursive atmospheric haze
// Iteration 9: The Gardener - Introduced Gravitational Pollination where agents occasionally drop static 'seeds' that deflect runners and bloom into orbits
// Iteration 10: The Chronos - Introduced Temporal Dilation where agents age faster in crowded areas, creating localized speed-warping pockets
// Iteration 11: The Weaver - Introduced Mycelial Fusion where agents create structural "bridges" when crossing dense ley lines
// Iteration 12: The Void-Walker - Introduced Singularity Collapse where the core occasionally draws in all agents, transmuting their life into a radiant shockwave.
const agentsNum = 4000;
const sensorOffset = 18;
const sensorAngle = Math.PI / 4;
const turnAngle = Math.PI / 8;
let agents;
let seeds = [];
let singularityActive = false;
let singularityTimer = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(0);
  agents = new Agents();
}

function draw() {
  // Dynamic decay: Slower decay during singularity to preserve shockwave trails
  background(0, singularityActive ? 8 : 15);

  loadPixels();
  
  // Update singularity state
  singularityTimer++;
  if (!singularityActive && singularityTimer > 600 && random() < 0.005) {
    singularityActive = true;
    singularityTimer = 0;
  } else if (singularityActive && singularityTimer > 150) {
    singularityActive = false;
    singularityTimer = 0;
  }

  for (let i = 4; i--; ) {
    agents.update();
  }
  updatePixels();
  
  if (seeds.length > 50) seeds.shift();
}

class Agent {
  constructor() {
    this.init();
  }

  init() {
    const angle = random(TWO_PI);
    const radius = random() > 0.1 ? random(10, 80) : random(300, 500);
    this.x = width / 2 + cos(angle) * radius;
    this.y = height / 2 + sin(angle) * radius;
    this.dir = angle + (random() > 0.5 ? PI : 0);
    
    this.life = random(200, 1000);
    this.maxLife = this.life;
    this.speed = 1.0;
    this.mutation = random(0.5, 2.5);
    this.affinity = random([-1, 1]);
    this.reaperGene = random(0.2, 0.8);
    this.isGhost = false;
    this.isRadiant = false; 
  }

  updateDirection() {
    if (this.isGhost) {
        this.dir += sin(frameCount * 0.05) * 0.02;
        return;
    }

    const dx = this.x - width / 2;
    const dy = this.y - height / 2;
    const distToCenter = sqrt(dx*dx + dy*dy);
    const angleToCenter = atan2(dy, dx);

    // SINGULARITY COLLAPSE: Pull agents to center then explosively boost them outward
    if (singularityActive) {
      if (distToCenter > 20 && singularityTimer < 80) {
        this.dir = lerp(this.dir, angleToCenter + PI, 0.15);
      } else if (distToCenter < 100 && singularityTimer >= 80) {
        this.dir = angleToCenter;
        this.speed *= 1.5;
        this.isRadiant = true;
        this.life = this.maxLife;
      }
    } else {
      this.isRadiant = false;
    }

    // Gravitational Pollination
    for (let s of seeds) {
      let sdx = s.x - this.x;
      let sdy = s.y - this.y;
      let d2 = sdx*sdx + sdy*sdy;
      if (d2 < 2500) { 
        let force = (1 - sqrt(d2)/50) * 0.2;
        this.dir += (this.affinity > 0 ? force : -force);
      }
    }

    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);
    
    // Pulsating field of attraction
    const pulse = sin(frameCount * 0.015) * 0.15;
    this.dir += pulse * (this.dir - angleToCenter);

    this.speed = map(center + left + right, 0, 765, 1.2, 4.5);
    const actualTurn = turnAngle * this.mutation;

    if (center > left && center > right) {
    } else if (center < left && center < right) {
      this.dir += (random() < 0.5 ? 1 : -1) * actualTurn * this.affinity;
    } else if (left > right) {
      this.dir -= actualTurn * this.affinity;
    } else if (right > left) {
      this.dir += actualTurn * this.affinity;
    }
    
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
    return (pixels[index + 2] + pixels[index + 1]) - (pixels[index] * 0.5);
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
      
      let existingRed = pixels[index];
      let existingGreen = pixels[index + 1];
      let existingBlue = pixels[index + 2];

      if (!this.isGhost) {
          const localIntensity = (existingGreen + existingBlue) / 510;
          const timeWarp = 1.0 + (localIntensity * 4.0);
          
          if (existingGreen > 150 && random() < 0.05) {
            this.mutation = lerp(this.mutation, random(0.1, 5.0), 0.2);
            this.speed *= 1.1; 
            if (random() < 0.01) seeds.push({x: this.x, y: this.y});
          }

          if (existingBlue > 50) {
            this.life += existingBlue * 0.02 * this.reaperGene;
            pixels[index + 2] = max(0, existingBlue - 10);
          }

          this.life -= timeWarp;
          
          if (this.life <= 0) {
            if (existingRed > 100 && random() < 0.3) {
                this.isGhost = true;
                this.life = 100;
                this.speed *= 0.5;
            } else {
                this.init(); 
                return;
            }
          }
      } else {
          this.life -= 1;
          if (this.life <= 0) {
              this.init();
              return;
          }
      }

      const lifeRatio = constrain(this.life / (this.isGhost ? 100 : this.maxLife), 0, 1);
      
      if (this.isRadiant) {
          // Void-Walker shockwave color: Hot purple-white
          pixels[index] = min(255, pixels[index] + 200);
          pixels[index + 1] = min(255, pixels[index + 1] + 100);
          pixels[index + 2] = 255;
      } else if (this.isGhost) {
          pixels[index] = min(255, pixels[index] + 40);
          pixels[index + 1] = min(255, pixels[index + 1] + 10); 
          pixels[index + 2] = min(255, pixels[index + 2] + 60);
      } else {
          if (existingBlue > 200 && existingGreen > 100) {
              pixels[index] = min(255, pixels[index] + 120);
              pixels[index + 1] = min(255, pixels[index + 1] + 120);
              pixels[index + 2] = 255;
          } else {
              pixels[index] = min(255, existingRed + (8 * (1 - lifeRatio))); 
              pixels[index + 1] = min(255, existingGreen + (15 * this.reaperGene * lifeRatio));
              pixels[index + 2] = min(255, existingBlue + 140); 
          }
      }
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
