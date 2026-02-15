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
const agentColor = new Uint8Array([0, 0, 0]);
const agentsNum = 5000;
const sensorOffset = 18;
const sensorAngle = Math.PI / 8;
const turnAngle = Math.PI / 6;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
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
  
  // Differential decay and diffusion rates create a "chromatography" effect 
  const decayR = 0.94; 
  const decayG = 0.96;
  const decayB = 0.98;
  
  for (let x = 1; x < width - 1; x++) {
    for (let y = 1; y < height - 1; y++) {
      let index = (x + y * width) * 4;
      
      let sumR = 0, sumG = 0, sumB = 0;
      
      // 3x3 box blur for diffusion
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          let nIdx = index + (i + j * width) * 4;
          sumR += pixels[nIdx];
          sumG += pixels[nIdx+1];
          sumB += pixels[nIdx+2];
        }
      }

      // Apply independent decay/evaporation for each color channel relative to white (255)
      let r = (sumR / 9) * decayR + (1 - decayR) * 255;
      let g = (sumG / 9) * decayG + (1 - decayG) * 255;
      let b = (sumB / 9) * decayB + (1 - decayB) * 255;

      // Surface Tension Effect: slightly pull values towards 0 or 255 to sharpen the "membrane" edges
      nextPixels[index]     = r < 128 ? r * 0.98 : min(255, r * 1.01); 
      nextPixels[index + 1] = g < 128 ? g * 0.98 : min(255, g * 1.01);
      nextPixels[index + 2] = b < 128 ? b * 0.98 : min(255, b * 1.01);
      nextPixels[index + 3] = 255; 
    }
  }
  
  pixels.set(nextPixels);
  updatePixels();

  if (mouseIsPressed) {
    stroke(100, 100, 200, 50);
    strokeWeight(40);
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
  }

  updateDirection() {
    // Influence direction based on mouse proximity (Nutrient Gradient)
    let dx = mouseX - this.x;
    let dy = mouseY - this.y;
    let distSq = dx * dx + dy * dy;
    this.nutrientSens = distSq < 40000 ? map(distSq, 0, 40000, 1, 0) : 0;

    const center = this.sense(0);
    const left = this.sense(-sensorAngle);
    const right = this.sense(+sensorAngle);

    if (center < left && center < right) {
      if(random() < 0.01) this.dir += turnAngle;
    } else if (center > left && center > right) {
      this.dir += (random() < 0.5 ? 1 : -1) * turnAngle;
    } else if (left < right) {
      this.dir -= turnAngle;
    } else if (right < left) {
      this.dir += turnAngle;
    }
    
    const idx = (floor(this.x) + floor(this.y) * width) * 4;
    const intensity = (pixels[idx] + pixels[idx+1] + pixels[idx+2]) / 765;
    
    // Speed increases when closer to "nutrients" (the mouse)
    this.speed = map(intensity, 0, 1, 1.2, 3.8) * (1 + this.nutrientSens * 1.5);
    
    // Slime mold steering logic
    this.dir += (0.5 - intensity) * 0.25; 
    this.dir += random(-0.04, 0.04);

    // Gently steer towards mouse if nutrients are sensed
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
    
    // Iteration 13 Change: Nutrient proximity shifts deposit toward a vibrant "Gold" hue
    let depositR = lerp(45, 80, this.nutrientSens);
    let depositG = lerp(45, 50, this.nutrientSens);
    let depositB = lerp(45, 0, this.nutrientSens);
    
    // Blend with existing speed-based color mapping
    depositR = lerp(depositR, 10, this.speed / 8);
    depositG = lerp(depositG, 60, this.speed / 8);
    depositB = lerp(depositB, 150, this.speed / 8);

    pixels[index]     = max(0, pixels[index] - depositR);
    pixels[index + 1] = max(0, pixels[index + 1] - depositG);
    pixels[index + 2] = max(0, pixels[index + 2] - depositB);
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
