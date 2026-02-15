// Inspired by Jason
// Iteration 1: The Weaver - Introduced a global harmonic force that pulls agents toward geometric sanity or pushes them into entropy based on their screen position.
// Iteration 2: The Cartographer - Introduced a quadrant-based symmetry where the battle between Chaos and Order creates a crystalline urban structure.
// Iteration 3: The Archon - Introduced a localized gravity well at the mouse position that shatters the rigid grid into swirling nebulae of chaos.
// Iteration 4: The Alchemist - Introduced a reactive heat-map that causes agents to mutate their speed and steering based on the density of existing ink.
// Iteration 5: The Glassblower - Introduced a refractive chromatic aberration that warps light as chaos cools into structured geometric lenses.

const agentsNum = 6000;
const sensorOffset = 18;
const sensorAngle = Math.PI / 6;
const turnAngle = Math.PI / 4;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  pixelDensity(1);
  background(245);
  agents = new Agents();
}

function draw() {
  // A slight bleed effect to create texture between the high-contrast lines
  background(255, 3);

  loadPixels();
  for (let i = 5; i--; ) {
    agents.update();
  }
  
  // Refractive Glass Pass: Iterates through discrete grid cells to "refract" the chaos into geometric order
  // This simulates the simulation being viewed through a warped lens grid
  let cell = 80;
  for (let y = 0; y < height; y += cell) {
    for (let x = 0; x < width; x += cell) {
      if ((floor(x/cell) + floor(y/cell)) % 2 == 0) {
        // Sample center brightness to determine refraction strength
        let idx = ((x + cell/2) + (y + cell/2) * width) * 4;
        let brightness = (pixels[idx] + pixels[idx+1] + pixels[idx+2]) / 3;
        if (brightness < 200) {
           // Apply a slight chromatic shift based on the "Glass" grid
           let offset = floor(map(brightness, 0, 200, 4, 0));
           let cornerIdx = (x + y * width) * 4;
           pixels[cornerIdx] = pixels[cornerIdx + offset * 4] || pixels[cornerIdx];
           pixels[cornerIdx + 2] = pixels[max(0, cornerIdx - offset * 4)] || pixels[cornerIdx + 2];
        }
      }
    }
  }
  
  updatePixels();
}

class Agent {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.dir = random([0, HALF_PI, PI, TWO_PI - HALF_PI]);
    this.speed = 2.2;
  }

  updateDirection() {
    // Chaos vs Order interaction with the 'Archon' (the Mouse): 
    let distToMouse = dist(this.x, this.y, mouseX, mouseY);
    let chaosRadius = 250;
    
    // Read local "density" of the simulation to influence behavior
    let localDensity = this.sense(0) / 255.0; 
    
    if (distToMouse < chaosRadius) {
      let angleToMouse = atan2(mouseY - this.y, mouseX - this.x);
      this.speed = 4.0;
      this.dir = lerp(this.dir, angleToMouse + HALF_PI, 0.15 * (1 - distToMouse/chaosRadius));
    } else {
      let dx = abs(this.x - width/2);
      let dy = abs(this.y - height/2);
      let gridStrength = (sin(dx * 0.02) * cos(dy * 0.02));
      
      this.speed = lerp(1.2, 3.2, localDensity);
      let dynamicTurn = lerp(turnAngle * 1.5, turnAngle * 0.5, localDensity);
      
      if (gridStrength > 0.6) {
        let targetDir = round(this.dir / HALF_PI) * HALF_PI;
        this.dir = lerp(this.dir, targetDir, 0.23); // Slightly tightened focus
      } else {
        const right = this.sense(+sensorAngle);
        const center = this.sense(0);
        const left = this.sense(-sensorAngle);

        if (center < left && center < right) {
            // Stay path
        } else if (left < right) {
            this.dir -= dynamicTurn;
        } else if (right < left) {
            this.dir += dynamicTurn;
        } else {
            this.dir += (random() - 0.5) * 0.1;
        }
      }
    }
  }

  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + sensorOffset * cos(angle));
    let y = floor(this.y + sensorOffset * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;

    const index = (x + y * width) * 4;
    return pixels[index]; 
  }

  updatePosition() {
    this.x += cos(this.dir) * this.speed;
    this.y += sin(this.dir) * this.speed;
    
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const px = floor(this.x);
    const py = floor(this.y);
    const i = (px + py * width) * 4;
    
    let distToMouse = dist(this.x, this.y, mouseX, mouseY);
    let shift = distToMouse < 200 ? 40 : 0;
    
    // Glassy ink: high blue presence creates a "cold" structured feel
    pixels[i] = max(0, pixels[i] - 70);
    pixels[i+1] = max(10, pixels[i+1] - 55);
    pixels[i+2] = max(40 + shift, pixels[i+2] - (30 - shift));
  }
}

class Agents {
  constructor() {
    this.agents = Array(agentsNum).fill().map(() => new Agent());
  }
  update() {
    this.agents.forEach((e) => e.updateDirection());
    this.agents.forEach((e) => e.updatePosition());
  }
}
