// Inspired by Jason
// Iteration 1: The Weaver of Shadows - Introduced an evaporation decay factor to the trail map for a ghostly sense of impermanence.
// Iteration 2: The Ethereal Wanderer - Introduced brownian motion and directional noise to mimic the entropy of decaying memory.
// Iteration 3: The Harbinger of Bloom - Introduced a life-cycle to agents where they die and respawn, preventing static patterns from dominating the void.
// Iteration 4: The Transient Pulse - Introduced an oscillating sensory radius to mimic the rhythmic breathing of a living organism.
// Iteration 5: The Spectral Weaver - Introduced variable deposition strength based on agent age, creating a "fading ink" effect as they approach the end of their lives.
// Iteration 6: The Echo of Mortality - Introduced a selective decay where the void pushes back harder against older, weaker structures.
// Iteration 7: The Gossamer Veil - Introduced velocity modulation where agents slow down as they age, causing "terminal thickening" of dying structures.
// Iteration 8: The Dissolving Nexus - Introduced spatial gravity towards the mouse to simulate the longing of fleeting structures for connection.
// Iteration 9: The Ossified Whisper - Introduced a subtle "fossilization" where extremely dense trails become harder to erase, creating a skeletal persistence.
// Iteration 10: The Liminal Threshold - Introduced a boundary-repulsion effect where agents lose the ability to deposit ink if they drift too close to the edge, creating a faded "vignette" of mortal transition.
// Iteration 11: The Tenebrous Echo - Introduced a parasitic feedback where agents are subtly repelled by their own dense histories, forcing them to constantly seek new territory.
// Iteration 12: The Chrysalis Tide - Introduced a global metabolism that oscillates, causing the entire network to periodically soften and dilate.
// Iteration 13: The Glacial Drift - Introduced a directional bias based on local ink density, causing trails to slowly "weep" or slide in the direction of gravity.
// Iteration 14: The Entropic Sigh - Introduced a subtle pixel fragmentation where trail intensity occasionally "leaks" to neighbors, blurring old paths into a misty haze.

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
  
  // The Chrysalis Tide: A global metabolic wave that shifts the rate of decay
  let metabolism = map(sin(frameCount * 0.01), -1, 1, 0.5, 2.5);
  
  // Selective Decay, Glacial Drift, and Entropic Sigh:
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      let i = (x + y * width) * 4;
      let brightness = pixels[i];
      
      if (brightness < 255) {
        // Glacial Drift: Dense ink has a small chance to "drift" downwards
        if (y < height - 1 && brightness < 150 && random() < 0.02) {
          let below = (x + (y + 1) * width) * 4;
          let temp = pixels[below];
          pixels[below] = lerp(pixels[below], brightness, 0.1);
          pixels[i] = lerp(brightness, temp, 0.1);
        }

        // The Entropic Sigh: Small chance to bleed ink into a random neighbor,
        // simulating a slow loss of definition and the spread of entropy.
        if (brightness < 220 && random() < 0.005) {
          let ox = floor(random(-1.5, 1.5));
          let oy = floor(random(-1.5, 1.5));
          let targetIdx = ((x + ox + width) % width + ((y + oy + height) % height) * width) * 4;
          pixels[targetIdx] = lerp(pixels[targetIdx], brightness, 0.2);
        }

        // Decay rate is influenced by the global metabolism wave
        let decayRate = (brightness > 200 ? 3 : (brightness < 40 ? 0.3 : 1)) * metabolism;
        pixels[i]   = min(255, pixels[i]   + decayRate);
        pixels[i+1] = min(255, pixels[i+1] + decayRate);
        pixels[i+2] = min(255, pixels[i+2] + decayRate);
      }
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
    this.maxAge = agentLifespan * random(0.5, 1.5);
  }

  updateDirection() {
    // Spatial Gravity: Agents are subtly attracted to the cursor
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        let angleToMouse = atan2(mouseY - this.y, mouseX - this.x);
        let diff = angleToMouse - this.dir;
        while (diff < -PI) diff += TWO_PI;
        while (diff > PI) diff -= TWO_PI;
        this.dir += diff * 0.02;
    }

    // Dynamic sensor offset expands and contracts
    const dynamicSensorOffset = 8 + 12 * sin(frameCount * 0.02 + (this.x * 0.01));

    const right = this.sense(+sensorAngle, dynamicSensorOffset);
    const center = this.sense(0, dynamicSensorOffset);
    const left = this.sense(-sensorAngle, dynamicSensorOffset);

    // Tenebrous Echo Change: Repulsion from deep ink to force exploration
    let centerWeight = center;
    if (center < 50) centerWeight += 120; 

    const threeWays = [left, centerWeight - 2, right];
    const minVal = min(...threeWays);
    
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
    
    x = (x + width) % width;
    y = (y + height) % height;

    const index = (x + y * width) * 4;
    return pixels[index];
  }

  updatePosition() {
    const vitality = 1.0 - (this.age / this.maxAge);
    
    // Terminal Thickening: move slower as they age
    const speed = lerp(0.5, 1.2, vitality);
    this.x += cos(this.dir) * speed;
    this.y += sin(this.dir) * speed;
    
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const ix = floor(this.x);
    const iy = floor(this.y);
    const index = (ix + iy * width) * 4;
    
    // Liminal Threshold: Vignette effect
    const borderDist = min(min(this.x, width - this.x), min(this.y, height - this.y));
    const presence = constrain(borderDist / 100, 0, 1);
    
    const currentInk = pixels[index]; 
    const finalStrength = vitality * presence;
    
    pixels[index] = lerp(currentInk, agentColor[0], finalStrength);
    pixels[index + 1] = lerp(currentInk, agentColor[1], finalStrength);
    pixels[index + 2] = lerp(currentInk, agentColor[2], finalStrength);

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
