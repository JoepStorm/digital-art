// Inspired by Jason
// Iteration 1: The Weaver of Shadows - Introduced an evaporation decay factor to the trail map for a ghostly sense of impermanence.
// Iteration 2: The Ethereal Wanderer - Introduced brownian motion and directional noise to mimic the entropy of decaying memory.
// Iteration 3: The Harbinger of Bloom - Introduced a life-cycle to agents where they die and respawn, preventing static patterns from dominating the void.
// Iteration 4: The Transient Pulse - Introduced an oscillating sensory radius to mimic the rhythmic breathing of a living organism.
// Iteration 5: The Spectral Weaver - Introduced variable deposition strength based on agent age, creating a "fading ink" effect as they approach the end of their lives.
// Iteration 6: The Echo of Mortality - Introduced a selective decay where the void pushes back harder against older, weaker structures.
// Iteration 7: The Gossamer Veil - Introduced velocity modulation where agents slow down as they age, causing "terminal thickening" of dying structures.
// Iteration 8: The Dissolving Nexus - Introduced spatial gravity towards the mouse to simulate the longing of fleeting structures for connection.

const agentColor = new Uint8Array([0, 0, 0]);
const agentsNum = 4000;
const sensorAngle = Math.PI / 6;
const turnAngle = Math.PI / 5;
const randomness = 0.15; // The entropy factor: agents occasionally deviate from the path
const agentLifespan = 400; // How many frames an agent lives before resetting
let agents;

function setup() {
  createCanvas(1600, 900);
  pixelDensity(1);
  background(255);
  agents = new Agents();
}

function draw() {
  loadPixels();
  
  // Selective Decay: Instead of a flat evaporation, the environment "heals" faster 
  // where the trails are thinner/greyer. This reinforces strong paths while 
  // aggressively erasing the ghostly echoes of dying agents.
  for (let i = 0; i < pixels.length; i += 4) {
    let brightness = pixels[i];
    if (brightness < 255) {
      // The closer to white (255), the faster it evaporates. 
      // This creates a high-contrast "shriveling" effect on the edges of trails.
      pixels[i]   += brightness > 200 ? 3 : 1;
      pixels[i+1] += brightness > 200 ? 3 : 1;
      pixels[i+2] += brightness > 200 ? 3 : 1;
    }
  }

  // Multi-step update for smoother, more organic visual density
  for (let i = 5; i--; ) {
    agents.update();
  }
  updatePixels();

  if (mouseIsPressed) {
    stroke(0, 30);
    strokeWeight(40);
    line(pmouseX, pmouseY, mouseX, mouseY);
  }
}

class Agent {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = random(width);
    this.y = random(height);
    this.dir = random(TWO_PI);
    this.age = 0;
    // Each agent has a slightly different peak life to avoid mass-extinction pulses
    this.maxAge = agentLifespan * random(0.5, 1.5);
  }

  updateDirection() {
    // Spatial Gravity: Agents are subtly attracted to the cursor, creating 
    // a "gathering" of shadows that eventually dissolve as they age and move away.
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        let angleToMouse = atan2(mouseY - this.y, mouseX - this.x);
        let diff = angleToMouse - this.dir;
        while (diff < -PI) diff += TWO_PI;
        while (diff > PI) diff -= TWO_PI;
        this.dir += diff * 0.02; // A gentle tug toward the presence of the observer
    }

    // Dynamic sensor offset: The sensory reach expands and contracts over time, 
    // creating a sense of "unfolding" or "sending out feelers".
    const dynamicSensorOffset = 8 + 12 * sin(frameCount * 0.02 + (this.x * 0.01));

    const right = this.sense(+sensorAngle, dynamicSensorOffset);
    const center = this.sense(0, dynamicSensorOffset);
    const left = this.sense(-sensorAngle, dynamicSensorOffset);

    // Core Slime Mold logic: Gradient descent on the trail map (seeking darkness)
    const threeWays = [left, center - 2, right];
    const minVal = min(...threeWays);
    
    // If all paths are equally "clean", or with a slight probability, 
    // the agent takes a random turn (Brownian influence)
    if (random() < randomness) {
       this.dir += random(-turnAngle, turnAngle);
    } else {
       const minIndex = threeWays.indexOf(minVal);
       this.dir += turnAngle * (minIndex - 1);
    }
  }

  sense(dirOffset, sDist) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + sDist * cos(angle));
    let y = floor(this.y + sDist * sin(angle));
    
    // Toroidal topology: wrap around the canvas edges
    x = (x + width) % width;
    y = (y + height) % height;

    const index = (x + y * width) * 4;
    return pixels[index];
  }

  updatePosition() {
    const vitality = 1.0 - (this.age / this.maxAge);
    
    // Terminal Thickening: Younger agents move faster and leave sharper lines. 
    // As they age, they slow down, causing more ink to be concentrated in 
    // smaller areas—creating gnarled, textured knots before they vanish.
    const speed = lerp(0.5, 1.2, vitality);
    this.x += cos(this.dir) * speed;
    this.y += sin(this.dir) * speed;
    
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const ix = floor(this.x);
    const iy = floor(this.y);
    const index = (ix + iy * width) * 4;
    
    // Spectral Deposition: Agents deposit less ink as they reach the end of their lifespan
    const currentInk = pixels[index]; 
    
    pixels[index] = lerp(currentInk, agentColor[0], vitality);
    pixels[index + 1] = lerp(currentInk, agentColor[1], vitality);
    pixels[index + 2] = lerp(currentInk, agentColor[2], vitality);

    this.age++;
    if (this.age > this.maxAge) {
      this.reset();
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
