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
const agentColor = new Uint8Array([0, 0, 0]);
const agentsNum = 5000;
const sensorOffset = 18;
const sensorAngle = Math.PI / 8;
const turnAngle = Math.PI / 6;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight);
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
  const decayRate = 0.96; 
  
  for (let x = 1; x < width - 1; x++) {
    for (let y = 1; y < height - 1; y++) {
      let index = (x + y * width) * 4;
      
      let sumR = 0, sumG = 0, sumB = 0;
      
      // Optimized 3x3 diffusion
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          let nIdx = index + (i + j * width) * 4;
          sumR += pixels[nIdx];
          sumG += pixels[nIdx+1];
          sumB += pixels[nIdx+2];
        }
      }

      nextPixels[index]     = (sumR / 9) * decayRate + (1 - decayRate) * 255; 
      nextPixels[index + 1] = (sumG / 9) * decayRate + (1 - decayRate) * 255;
      nextPixels[index + 2] = (sumB / 9) * decayRate + (1 - decayRate) * 255;
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
  }

  updateDirection() {
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);
    const right = this.sense(+sensorAngle);

    if (center < left && center < right) {
      // Stay on course
    } else if (center > left && center > right) {
      this.dir += (random() < 0.5 ? 1 : -1) * turnAngle;
    } else if (left < right) {
      this.dir -= turnAngle;
    } else if (right < left) {
      this.dir += turnAngle;
    }
    
    const idx = (floor(this.x) + floor(this.y) * width) * 4;
    const intensity = (pixels[idx] + pixels[idx+1] + pixels[idx+2]) / 765;
    
    // Dynamic speed: agents move faster in white space, slower in dense dark areas
    this.speed = map(intensity, 0, 1, 1.0, 3.5);
    
    this.dir += (0.5 - intensity) * 0.2; 
    this.dir += random(-0.05, 0.05);
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
    
    // Deposit trail with color saturation influenced by speed
    // Fast agents leave thinner, lighter trails; slow agents deposit heavy ink
    let depositR = lerp(20, 100, this.speed / 3.5);
    let depositG = lerp(40, 80, this.speed / 3.5);
    let depositB = lerp(80, 40, this.speed / 3.5);

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
