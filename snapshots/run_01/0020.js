// Iteration 1: Slightly increase agent color opacity
// Iteration 2: Add a slight random wobble to the agent direction
// Iteration 3: Add a subtle trail decay effect
// Iteration 4: Increase the number of update iterations to make the trails more dense
// Iteration 5: Add a slight color variation to the trail based on the agent's direction
// Iteration 6: MANUAL: changed canvas size
// Iteration 7: Add a subtle bloom effect by blurring the pixels after updating them
// Iteration 8: Implement Diffusive Decay and Evaporation for smoother, more organic membrane textures
// Iteration 9: Add local flow fields based on pixel brightness to influence agent steering
// Iteration 10: Map trail color intensity to agent speed and make speed dynamic based on local density
// Iteration 11: Introduce "Chromatography" by separating color channel diffusion rates
// Iteration 12: Introduce "Surface Tension" via a non-linear color response curve for sharper boundaries
// Iteration 13: Add "Nutrient Gradients" where mouse proximity increases agent speed and deposits golden trails
// Iteration 14: Introduce "Hydrophobic Flow" by perturbing agent positions based on the image gradient (vignette/contour repulsion)
// Iteration 15: Add "Ionic Repulsion" to agent logic, preventing over-clustering by pushing agents away from each other
// Iteration 16: Add "Environmental Turbulence" using Perlin noise to guide agents through invisible currents
// Iteration 17: Add "Filamental Crystallization" by introducing a non-linear Laplacian weight that sharpens active trail edges
// Iteration 18: Add "Oscillatory Signal Fluctuations" to agent sensing to create rhythmic pulsing in trail densities
// Iteration 19: Add "Bioluminescent Pulse" by modulating individual agent deposit intensity via high-frequency sine waves
// Iteration 20: Add "Chromatographic Shift" where agent speed influences trail color temperature and deposit density
const agentColor = new Uint8Array([0, 0, 0]);
const agentsNum = 5000;
const sensorOffset = 18;
const sensorAngle = Math.PI / 8;
const turnAngle = Math.PI / 6;
let agents;
let noiseZ = 0;

function setup() {
  createCanvas(1600, 900);
  pixelDensity(1);
  background(255);
  agents = new Agents();
}

function draw() {
  loadPixels();
  
  for (let i = 8; i--; ) {
    agents.update();
  }

  // DIFFUSION AND EVAPORATION STEP
  let nextPixels = new Uint8ClampedArray(pixels);
  
  // Asymmetric decay for a subtle color bleed effect
  const decayR = 0.94; 
  const decayG = 0.96;
  const decayB = 0.98;
  
  for (let x = 1; x < width - 1; x++) {
    for (let y = 1; y < height - 1; y++) {
      let index = (x + y * width) * 4;
      
      let sumR = 0, sumG = 0, sumB = 0;
      
      // 3x3 kernel convolution for diffusion
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          let nIdx = index + (i + j * width) * 4;
          let weight = (i === 0 && j === 0) ? 0.2 : 0.1; 
          sumR += pixels[nIdx] * weight;
          sumG += pixels[nIdx+1] * weight;
          sumB += pixels[nIdx+2] * weight;
        }
      }

      // Evaporate towards white (255)
      let r = sumR * decayR + (1 - decayR) * 255;
      let g = sumG * decayG + (1 - decayG) * 255;
      let b = sumB * decayB + (1 - decayB) * 255;

      // FILAMENTAL CRYSTALLIZATION: Sharpen edges and contrast
      nextPixels[index]     = r < 140 ? r * 0.92 : min(255, r * 1.015); 
      nextPixels[index + 1] = g < 140 ? g * 0.92 : min(255, g * 1.015);
      nextPixels[index + 2] = b < 140 ? b * 0.92 : min(255, b * 1.015);
      nextPixels[index + 3] = 255; 
    }
  }
  
  pixels.set(nextPixels);
  updatePixels();

  noiseZ += 0.005;

  if (mouseIsPressed) {
    stroke(100, 100, 200, 20);
    strokeWeight(100);
    line(pmouseX, pmouseY, mouseX, mouseY);
  }
}

class Agent {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.dir = random(TWO_PI);
    this.speed = 2.5;
    this.nutrientSens = 0;
    this.phase = random(TWO_PI);
    this.pulseFreq = random(0.1, 0.3);
  }

  updateDirection() {
    let dx = mouseX - this.x;
    let dy = mouseY - this.y;
    let distSq = dx * dx + dy * dy;
    this.nutrientSens = distSq < 40000 ? map(distSq, 0, 40000, 1, 0) : 0;

    let signalStrength = 1.0 + 0.5 * sin(frameCount * 0.05 + this.phase);

    const center = this.sense(0) * signalStrength;
    const left = this.sense(-sensorAngle) * signalStrength;
    const right = this.sense(+sensorAngle) * signalStrength;

    if (center < left && center < right) {
      if(random() < 0.01) this.dir += turnAngle;
    } else if (center > left && center > right) {
      this.dir += (random() < 0.5 ? 1 : -1) * turnAngle;
    } else if (left < right) {
      this.dir -= turnAngle;
    } else if (right < left) {
      this.dir += turnAngle;
    }
    
    let floorX = floor(this.x);
    let floorY = floor(this.y);
    const idx = (max(0, min(width-1, floorX)) + max(0, min(height-1, floorY)) * width) * 4;
    const brightness = (pixels[idx] + pixels[idx+1] + pixels[idx+2]) / 765;
    
    let turbulence = noise(this.x * 0.003, this.y * 0.003, noiseZ) * TWO_PI * 2;
    this.dir = lerp(this.dir, turbulence, 0.03);

    if (brightness < 0.2) {
        this.dir += random([-1, 1]) * turnAngle * 2.0;
    }

    let gradX = (this.sense(HALF_PI) - this.sense(-HALF_PI));
    let gradY = (this.sense(PI) - this.sense(0));
    this.dir += (gradX + gradY) * 0.05;

    this.speed = map(brightness, 0, 1, 1.2, 3.8) * (1 + this.nutrientSens * 1.5);
    this.dir += (0.5 - brightness) * 0.25; 
    this.dir += random(-0.04, 0.04);

    if (this.nutrientSens > 0) {
      let angleToMouse = atan2(dy, dx);
      this.dir = lerp(this.dir, angleToMouse, 0.05 * this.nutrientSens);
    }
  }

  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let sx = floor(this.x + sensorOffset * cos(angle));
    let sy = floor(this.y + sensorOffset * sin(angle));
    sx = (sx + width) % width;
    sy = (sy + height) % height;
    const index = (sx + sy * width) * 4;
    return (pixels[index] + pixels[index+1] + pixels[index+2]) / 3;
  }

  updatePosition() {
    this.x += cos(this.dir) * this.speed;
    this.y += sin(this.dir) * this.speed;

    if (this.x < 0) this.x += width;
    if (this.x >= width) this.x -= width;
    if (this.y < 0) this.y += height;
    if (this.y >= height) this.y -= height;

    const index = (floor(this.x) + floor(this.y) * width) * 4;
    
    let pulse = 0.5 + 0.5 * Math.sin(frameCount * this.pulseFreq + this.phase);
    
    // CHROMATOGRAPHIC SHIFT: trail color shifts from warm gold to cool violet based on speed
    // Fast agents leave ethereal violet trails, slow agents leave heavy ochre trails
    let t = constrain(this.speed / 4.0, 0, 1);
    let depositR = lerp(90, 20, t);
    let depositG = lerp(70, 70, t);
    let depositB = lerp(30, 150, t);

    // Apply bioluminescent pulse and nutrient attraction boost
    let intensity = pulse * (1.0 + this.nutrientSens * 2.0);
    
    pixels[index]     = max(0, pixels[index] - depositR * intensity);
    pixels[index + 1] = max(0, pixels[index + 1] - depositG * intensity);
    pixels[index + 2] = max(0, pixels[index + 2] - depositB * intensity);
  }
}

class Agents {
  constructor() {
    this.agents = Array(agentsNum).fill().map(() => new Agent());
  }
  update() {
    for (let a of this.agents) a.updateDirection();
    for (let a of this.agents) a.updatePosition();
  }
}
