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
// Iteration 14: The Neural Cartographer - Introduced synaptic tethering where agents create tensile connections when crossing paths
// Iteration 15: The Chromatic Flux - Introduced fluid velocity fields that warp the trails based on local density rhythms
// Iteration 16: The Kaleidoscope Dreamer - Added angular mirror symmetries to create kaleidoscopic geometric reflections
// Iteration 17: The Weaver - Introduced gravitational lensing via radial pixel shifting to distort trails into warped singularities
// Iteration 18: The Resonance Weaver - Introduced harmonic ripple displacement based on local pixel brightness to create vibrating, fluid interference patterns.
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
  
  const cx = width / 2;
  const cy = height / 2;
  const time = frameCount * 0.01;
  
  // Custom decay with crystallization, gravitational lensing, and newly added HARMONIC RIPPLES
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let i = (x + y * width) * 4;
      let r = pixels[i];
      
      if (r > 20) {
          pixels[i] *= 0.94;     
          pixels[i + 1] *= 0.92; 
          pixels[i + 2] *= 0.90; 
      } else if (r > 0) {
          pixels[i] *= 0.995;
      }

      // Harmonic Ripple: Displacement based on local brightness and frequency
      // This creates a shimmering interference effect across the canvas
      if (r > 100 && frameCount % 3 === 0) {
          let resonance = sin(x * 0.05 + time) * cos(y * 0.05 - time) * 2;
          let rx = floor(x + resonance);
          let ry = floor(y + resonance);
          if (rx >= 0 && rx < width && ry >= 0 && ry < height) {
              let ri = (rx + ry * width) * 4;
              pixels[ri] = pixels[i];
              pixels[ri+1] = pixels[i+1];
              pixels[ri+2] = pixels[i+2];
          }
      }

      if (frameCount % 2 === 0 && r > 50 && random() < 0.01) {
          let dx = cx - x;
          let dy = cy - y;
          let targetX = floor(x + sign(dx));
          let targetY = floor(y + sign(dy));
          if (targetX >= 0 && targetX < width && targetY >= 0 && targetY < height) {
              let ti = (targetX + targetY * width) * 4;
              pixels[ti] = lerp(pixels[ti], pixels[i], 0.5);
              pixels[ti+1] = lerp(pixels[ti+1], pixels[i+1], 0.5);
              pixels[ti+2] = lerp(pixels[ti+2], pixels[i+2], 0.5);
          }
      }
    }
  }

  for (let i = 2; i--; ) {
    agents.update();
  }
  updatePixels();

  if (frameCount % 300 === 0) {
    for (let i = 0; i < 50; i++) {
        agents.agents.push(new Agent(width / 2, height / 2, random(TWO_PI)));
    }
  }

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

function sign(n) { return n > 0 ? 1 : (n < 0 ? -1 : 0); }

class Agent {
  constructor(x, y, dir) {
    this.x = x || random(width);
    this.y = y || random(height);
    this.dir = dir || random(TWO_PI);
    this.speed = random(1.2, 3.2);
    this.energy = 1.0;
    this.prevX = this.x;
    this.prevY = this.y;
    this.dead = false;
  }

  updateDirection() {
    const dynamicSensorOffset = 15 + sin(frameCount * 0.02) * 12;
    const right = this.sense(+sensorAngle, dynamicSensorOffset);
    const center = this.sense(0, dynamicSensorOffset);
    const left = this.sense(-sensorAngle, dynamicSensorOffset);

    if (center > left && center > right) {
    } else if (center < left && center < right) {
        this.dir += (random() < 0.5 ? 1 : -1) * turnAngle;
    } else if (left > right) {
        this.dir -= turnAngle;
    } else if (right > left) {
        this.dir += turnAngle;
    }

    let angleToCenter = atan2(height / 2 - this.y, width / 2 - this.x);
    let diff = angleToCenter - this.dir;
    while (diff < -PI) diff += TWO_PI;
    while (diff > PI) diff -= TWO_PI;
    
    const gravityStrength = (0.05 - this.energy * 0.03) * sin(frameCount * 0.01);
    this.dir += diff * gravityStrength; 
    this.dir += (this.x < width/2 ? 0.01 : -0.01);
    
    let swirl = (noise(this.x * 0.005, this.y * 0.005, frameCount * 0.002) - 0.5) * 0.2;
    this.dir += swirl;
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
    this.prevX = this.x;
    this.prevY = this.y;
    this.x += cos(this.dir) * this.speed;
    this.y += sin(this.dir) * this.speed;
    
    let ix = floor(this.x);
    let iy = floor(this.y);
    ix = (ix + width) % width;
    iy = (iy + height) % height;
    const index = (ix + iy * width) * 4;
    
    if (pixels[index] > 100) {
        this.speed *= 0.98;
    } else {
        this.speed = lerp(this.speed, random(1.2, 3.2), 0.05);
    }

    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    if (pixels[index] > 240 && random() < 0.08) {
        this.dead = true;
        return;
    }

    let d = dist(this.x, this.y, width/2, height/2);
    this.energy = lerp(this.energy, map(this.speed, 1.2, 3.2, 0.2, 1.0), 0.1);
    
    let h = (d * 0.2 + (this.dir * 40.5) + frameCount * 0.5) % 255;
    let s = map(this.energy, 0.2, 1.0, 140, 255);
    let b = map(cos(d * 0.01 - frameCount * 0.05), -1, 1, 150, 255);
    
    const numReflections = 4;
    const centerX = width/2;
    const centerY = height/2;

    for(let i = 0; i < 2; i++) {
        let lx = lerp(this.prevX, this.x, random());
        let ly = lerp(this.prevY, this.y, random());
        let dx = lx - centerX;
        let dy = ly - centerY;
        
        for(let j = 0; j < numReflections; j++) {
            let angle = (TWO_PI / numReflections) * j;
            let rx = centerX + dx * cos(angle) - dy * sin(angle);
            let ry = centerY + dx * sin(angle) + dy * cos(angle);
            
            let pix = (floor((rx + width) % width) + floor((ry + height) % height) * width) * 4;
            if(pix >= 0 && pix < pixels.length) {
                let pc = color((h + j * 20 + random(-5,5)) % 255, s, b);
                pixels[pix] = red(pc);
                pixels[pix+1] = green(pc);
                pixels[pix+2] = blue(pc);
                pixels[pix+3] = 255;
            }
        }
    }

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
