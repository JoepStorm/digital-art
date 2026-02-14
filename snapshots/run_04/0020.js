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
// Iteration 15: The Chromatic Fray - Introduced a subtle wavelength-dependent scattering where blue light escapes faster, leaving warm chromatic ghosting in decaying trails.
// Iteration 16: The Pulmonary Mirage - Introduced a non-linear breathing of the sensor distance that pulses with the heartbeat of the canvas.
// Iteration 17: The Weaver of Shadows - Introduced "Fractured Memories," a spatial displacement where agents occasionally jump to their mirrored coordinate, creating a haunted symmetry of impermanence.
// Iteration 18: The Subterranean Pulse - Introduced a geological fracturing where high-intensity trails experience "thermal cracking," splitting their darkness into fine, web-like fissures.
// Iteration 19: The Osmotic Bleed - Introduced a depth-aware diffusion where heavy ink deposits "stain" deeper into the canvas, causing them to spread sideways based on their own darkness.
// Iteration 20: The Vitreous Humour - Introduced a refractive distortion where fluid-like "pockets" of transparency bend the paths of overlapping trails.

const agentColor = new Uint8Array([0, 0, 0]);
const agentsNum = 4200;
const sensorAngle = Math.PI / 6;
const turnAngle = Math.PI / 5;
const randomness = 0.15; 
const agentLifespan = 400; 
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(255);
  agents = new Agents();
}

function draw() {
  loadPixels();
  
  let metabolism = map(sin(frameCount * 0.01), -1, 1, 0.5, 2.5);
  
  // The Vitreous Humour: Pre-calculating a low-frequency noise field for refractive distortion
  // This simulates pockets of differing density in a fluid medium that "bend" light and trails.
  let refractiveNoise = frameCount * 0.005;

  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      let i = (x + y * width) * 4;
      let brightness = (pixels[i] + pixels[i+1] + pixels[i+2]) / 3;
      
      if (brightness < 255) {
        
        // The Osmotic Bleed: Ink "leaks" horizontally when saturated.
        if (brightness < 100 && random() < 0.1) {
          let neighborX = x + (random() < 0.5 ? -1 : 1);
          if (neighborX >= 0 && neighborX < width) {
            let ni = (neighborX + y * width) * 4;
            let bleedAmount = (1 - brightness / 255) * 0.15;
            pixels[ni] = lerp(pixels[ni], pixels[i], bleedAmount);
            pixels[ni+1] = lerp(pixels[ni+1], pixels[i+1], bleedAmount);
            pixels[ni+2] = lerp(pixels[ni+2], pixels[i+2], bleedAmount);
          }
        }

        // The Subterranean Pulse: "Thermal cracking" of dense ink clusters.
        if (brightness < 80 && random() < 0.0008) {
           let angle = random(TWO_PI);
           let dist = random(5, 15);
           let tx = floor(x + cos(angle) * dist);
           let ty = floor(y + sin(angle) * dist);
           if(tx >= 0 && tx < width && ty >= 0 && ty < height) {
             let ti = (tx + ty * width) * 4;
             pixels[ti] = lerp(pixels[ti], pixels[i], 0.4);
             pixels[ti+1] = lerp(pixels[ti+1], pixels[i+1], 0.4);
             pixels[ti+2] = lerp(pixels[ti+2], pixels[i+2], 0.4);
             pixels[i] = min(255, pixels[i] + 20);
             pixels[i+1] = min(255, pixels[i+1] + 20);
             pixels[i+2] = min(255, pixels[i+2] + 20);
           }
        }

        // Glacial Drift: Dense ink has a small chance to "drift" downwards
        if (y < height - 1 && brightness < 150 && random() < 0.02) {
          let below = (x + (y + 1) * width) * 4;
          pixels[below] = lerp(pixels[below], pixels[i], 0.1);
          pixels[below+1] = lerp(pixels[below+1], pixels[i+1], 0.1);
          pixels[below+2] = lerp(pixels[below+2], pixels[i+2], 0.1);
          pixels[i] = lerp(pixels[i], 255, 0.1);
          pixels[i+1] = lerp(pixels[i+1], 255, 0.1);
          pixels[i+2] = lerp(pixels[i+2], 255, 0.1);
        }

        // The Entropic Sigh: Small chance to bleed ink into a random neighbor
        if (brightness < 220 && random() < 0.005) {
          let ox = floor(random(-1.5, 1.5));
          let oy = floor(random(-1.5, 1.5));
          let targetIdx = ((x + ox + width) % width + ((y + oy + height) % height) * width) * 4;
          pixels[targetIdx] = lerp(pixels[targetIdx], pixels[i], 0.2);
          pixels[targetIdx+1] = lerp(pixels[targetIdx+1], pixels[i+1], 0.2);
          pixels[targetIdx+2] = lerp(pixels[targetIdx+2], pixels[i+2], 0.2);
        }

        // The Chromatic Fray: Differential decay rates for R, G, B channels
        let decayRate = (brightness > 200 ? 3 : (brightness < 40 ? 0.3 : 1)) * metabolism;
        pixels[i]   = min(255, pixels[i]   + decayRate * 0.85); 
        pixels[i+1] = min(255, pixels[i+1] + decayRate * 0.95); 
        pixels[i+2] = min(255, pixels[i+2] + decayRate * 1.20); 
      }
    }
  }

  for (let i = 5; i--; ) {
    agents.update();
  }
  updatePixels();

  if (mouseIsPressed) {
    stroke(20, 10, 0, 30);
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
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        let angleToMouse = atan2(mouseY - this.y, mouseX - this.x);
        let diff = angleToMouse - this.dir;
        while (diff < -PI) diff += TWO_PI;
        while (diff > PI) diff -= TWO_PI;
        this.dir += diff * 0.02;
    }

    // Vitreous Humour: Local refraction based on underlying texture and coordinate noise
    // This makes the slime mold "swerve" around invisible obstacles or through lens-like areas.
    let noiseVal = noise(this.x * 0.005, this.y * 0.005, frameCount * 0.002);
    this.dir += (noiseVal - 0.5) * 0.15;

    const phase = frameCount * 0.03 + (this.x * 0.001) + (this.y * 0.001);
    const pulseStrength = Math.pow(sin(phase), 4);
    const dynamicSensorOffset = lerp(5, 35, pulseStrength);

    const right = this.sense(+sensorAngle, dynamicSensorOffset);
    const center = this.sense(0, dynamicSensorOffset);
    const left = this.sense(-sensorAngle, dynamicSensorOffset);

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
    const speed = lerp(0.5, 1.2, vitality);
    this.x += cos(this.dir) * speed;
    this.y += sin(this.dir) * speed;
    
    if (random() < 0.0005) {
      this.x = width - this.x;
      this.y = height - this.y;
      this.dir += PI;
    }

    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const ix = floor(this.x);
    const iy = floor(this.y);
    const index = (ix + iy * width) * 4;
    
    const borderDist = min(min(this.x, width - this.x), min(this.y, height - this.y));
    const presence = constrain(borderDist / 100, 0, 1);
    
    const finalStrength = vitality * presence;
    
    pixels[index] = lerp(pixels[index], agentColor[0], finalStrength);
    pixels[index + 1] = lerp(pixels[index + 1], agentColor[1], finalStrength);
    pixels[index + 2] = lerp(pixels[index + 2], agentColor[2], finalStrength);

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
