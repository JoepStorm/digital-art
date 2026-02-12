// Inspired by Jason
// Iteration 1: The Weaver - Reduced population and added a spontaneous spawning mechanism at the canvas center
// Iteration 2: The Chromatic Alchemist - Added color-shifting trails that evolve based on agent position
// Iteration 3: The Ghost Weaver - Introduced variable speed and inertia to agent movement for more fluid, flowing trails
// Iteration 4: The Mycelial Architect - Introduced agent branching to create dense geometric webs
// Iteration 5: The Ethereal Weaver - Introduced gravitational attraction towards persistent center-points to form cellular nodes
// Iteration 6: The Pulsing Core - Added a rhythmic harmonic oscillation to sensor distance to create breathing fractal structures
// Iteration 7: The Spectral Weaver - Introduced directional momentum and velocity-based color mapping
// Iteration 8: The Harmonic Weaver - Introduced a radial scent-sink and periodic burst spawning to create orbital resonances
// Iteration 9: The Symbiotic Filament - Introduced cross-agent trail attraction where agents sense and leave chromatic pheromones
// Iteration 10: The Void Weaver - Introduced entropy and agent death based on trail density to create negative space
// Iteration 11: The Weaver - Introduced trail evaporation and diffusion via soft box-blur to create smoky, ethereal gradients
// Iteration 12: The Chrysalis Weaver - Introduced persistent cellular crystallization that agents can break and reform
// Iteration 13: The Prismatic Refractor - Introduced directional light bending to create glossy, iridescent trail depth
const agentsNum = 400;
const sensorAngle = Math.PI / 7;
const turnAngle = Math.PI / 9;
let agents;

function setup() {
  createCanvas(1600, 800);
  pixelDensity(1);
  background(0);
  colorMode(HSB, 255);
  agents = new Agents();
}

function draw() {
  loadPixels();
  
  // Custom decay with "crystallization": pixels below a threshold freeze, above fade.
  // This creates stable structures that agents must navigate or "eat".
  for (let i = 0; i < pixels.length; i += 4) {
      let r = pixels[i];
      if (r > 20) {
          pixels[i] *= 0.94;     // Red
          pixels[i + 1] *= 0.92; // Green
          pixels[i + 2] *= 0.90; // Blue
      } else if (r > 0) {
          // Crystallization: very low intensity pixels stay as "ghostly" structures
          pixels[i] *= 0.995;
      }
  }

  for (let i = 2; i--; ) {
    agents.update();
  }
  updatePixels();

  // Periodic wave deployment
  if (frameCount % 300 === 0) {
    for (let i = 0; i < 50; i++) {
        agents.agents.push(new Agent(width / 2, height / 2, random(TWO_PI)));
    }
  }

  // Spontaneous migration events
  if (frameCount % 180 === 0) {
    let rx = random(width);
    let ry = random(height);
    for (let i = 0; i < 15; i++) {
        let index = floor(random(agents.agents.length));
        if(agents.agents[index]) {
            agents.agents[index].x = rx;
            agents.agents[index].y = ry;
            agents.agents[index].dir = random(TWO_PI);
        }
    }
  }
}

class Agent {
  constructor(x, y, dir) {
    this.x = x || random(width);
    this.y = y || random(height);
    this.dir = dir || random(TWO_PI);
    this.speed = random(1.2, 3.2);
    this.energy = 1.0;
  }

  updateDirection() {
    const dynamicSensorOffset = 15 + sin(frameCount * 0.02) * 12;
    
    const right = this.sense(+sensorAngle, dynamicSensorOffset);
    const center = this.sense(0, dynamicSensorOffset);
    const left = this.sense(-sensorAngle, dynamicSensorOffset);

    if (center > left && center > right) {
        // Continue forward
    } else if (center < left && center < right) {
        this.dir += (random() < 0.5 ? 1 : -1) * turnAngle;
    } else if (left > right) {
        this.dir -= turnAngle;
    } else if (right > left) {
        this.dir += turnAngle;
    }

    // Radial scent-sink modified by energy levels
    let angleToCenter = atan2(height / 2 - this.y, width / 2 - this.x);
    let diff = angleToCenter - this.dir;
    while (diff < -PI) diff += TWO_PI;
    while (diff > PI) diff -= TWO_PI;
    
    // Higher energy agents are more erratic, lower energy agents are pulled to core
    const gravityStrength = (0.05 - this.energy * 0.03) * sin(frameCount * 0.01);
    this.dir += diff * gravityStrength; 

    // The Prismatic Refractor: Agents "bend" towards existing trails based on the trail color 
    // to create a self-organizing chromatic flow
    this.dir += (center / 255) * 0.1 * (random() - 0.5);
  }

  sense(dirOffset, dist) {
    const angle = this.dir + dirOffset;
    let sx = floor(this.x + dist * cos(angle));
    let sy = floor(this.y + dist * sin(angle));
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
    
    // Agent death in high density
    if (pixels[index] > 240 && random() < 0.08) {
        this.dead = true;
        return;
    }

    // Color based on "Energy" (derived from speed and proximity to center)
    let d = dist(this.x, this.y, width/2, height/2);
    this.energy = lerp(this.energy, map(this.speed, 1.2, 3.2, 0.2, 1.0), 0.1);
    
    // Prismatic Shift: Use the direction of travel to skew the color spectrum
    let h = (d * 0.2 + (this.dir * 40.5) + frameCount * 0.5) % 255;
    let s = map(this.energy, 0.2, 1.0, 140, 255);
    // Value oscillation creates a "shimmering" or metallic effect
    let b = map(cos(d * 0.01 - frameCount * 0.05), -1, 1, 150, 255);
    
    let c = color(h, s, b);
    
    // Drawing with light refraction: agents deposit slightly different hues in a lateral spread
    for(let ox = -1; ox <= 1; ox++) {
      for(let oy = -1; oy <= 1; oy++) {
        if(random() > 0.45) {
          let pIdx = (((ix + ox + width) % width) + ((iy + oy + height) % height) * width) * 4;
          // Sub-pixel prism: slight color variance per jittered pixel
          let pc = color((h + ox * 5) % 255, s, b);
          pixels[pIdx] = red(pc);
          pixels[pIdx + 1] = green(pc);
          pixels[pIdx + 2] = blue(pc);
          pixels[pIdx + 3] = 255;
        }
      }
    }

    // Replication logic
    if (agents.agents.length < 2500 && random() < 0.003) {
        agents.agents.push(new Agent(this.x, this.y, this.dir + random(-0.4, 0.4)));
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
    for (let i = this.agents.length - 1; i >= 0; i--) {
        this.agents[i].updatePosition();
        if (this.agents[i].dead) {
            this.agents.splice(i, 1);
        }
    }
    
    if (this.agents.length > 2400) {
        this.agents.splice(Math.floor(random(this.agents.length)), 10);
    }
  }
}
