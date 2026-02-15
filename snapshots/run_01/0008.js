// Iteration 1: Slightly increase agent color opacity
// Iteration 2: Add a slight random wobble to the agent direction
// Iteration 3: Add a subtle trail decay effect
// Iteration 4: Increase the number of update iterations to make the trails more dense
// Iteration 5: Add a slight color variation to the trail based on the agent's direction
// Iteration 6: MANUAL: changed canvas size
// Iteration 7: Add a subtle bloom effect by blurring the pixels after updating them
// Iteration 8: Implement Diffusive Decay and Evaporation for smoother, more organic membrane textures

const agentColor = new Uint8Array([0, 0, 0]);
const agentsNum = 5000;
const sensorOffset = 15;
const sensorAngle = Math.PI / 8;
const turnAngle = Math.PI / 6;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  pixelDensity(1);
  background(255);
  agents = new Agents();
}

function buttonPressed() {
  agents = new Agents();
}

function draw() {
  // Instead of a heavy background wipe, we rely on the pixel processing
  // But we keep a very faint trails clearing for stability
  // background(255, 1);

  loadPixels();
  
  // Update agents multiple times per frame for speed
  for (let i = 8; i--; ) {
    agents.update();
  }

  // DIFFUSION AND EVAPORATION STEP
  // This simulates the chemical trail spreading and fading over time
  // creating the organic, cellular structures seen in slime mold.
  let nextPixels = new Uint8ClampedArray(pixels);
  const decayRate = 0.96; // How quickly the trail fades
  
  for (let x = 1; x < width - 1; x++) {
    for (let y = 1; y < height - 1; y++) {
      let index = (x + y * width) * 4;
      
      // Box blur / Diffusion: average the surrounding 3x3 area
      // Focusing on the Alpha channel which represents the "scent" density or trail
      let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
      
      // Unrolled or optimized neighbor check
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          let nIdx = index + (i + j * width) * 4;
          sumR += pixels[nIdx];
          sumG += pixels[nIdx+1];
          sumB += pixels[nIdx+2];
          sumA += pixels[nIdx+3];
        }
      }

      // Evaporate and diffuse
      nextPixels[index]     = (sumR / 9) * decayRate + (1 - decayRate) * 255; 
      nextPixels[index + 1] = (sumG / 9) * decayRate + (1 - decayRate) * 255;
      nextPixels[index + 2] = (sumB / 9) * decayRate + (1 - decayRate) * 255;
      nextPixels[index + 3] = (sumA / 9) * 0.99; // Alpha lingers longer for structural sensing
    }
  }
  
  pixels.set(nextPixels);
  updatePixels();

  // Interactive element
  if (mouseIsPressed) {
    stroke(100, 100, 200, 50);
    strokeWeight(20);
    line(pmouseX, pmouseY, mouseX, mouseY);
  }
}

class Agent {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.dir = random(TWO_PI);
  }

  // Sense the "darkness" (lower RGB values) in the pixels to steer
  updateDirection() {
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    // Physarum logic: steer towards the "highest concentration" 
    // In our inverted setup (white background), higher concentration is lower RGB values
    if (center < left && center < right) {
      // Stay on course
    } else if (center > left && center > right) {
      this.dir += (random() < 0.5 ? 1 : -1) * turnAngle;
    } else if (left < right) {
      this.dir -= turnAngle;
    } else if (right < left) {
      this.dir += turnAngle;
    }
    
    this.dir += random(-0.1, 0.1);
  }

  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let sx = floor(this.x + sensorOffset * cos(angle));
    let sy = floor(this.y + sensorOffset * sin(angle));
    
    // Wrap coordinates for toroidal world
    sx = (sx + width) % width;
    sy = (sy + height) % height;

    const index = (sx + sy * width) * 4;
    // Return the brightness (greyscale average)
    return (pixels[index] + pixels[index+1] + pixels[index+2]) / 3;
  }

  updatePosition() {
    this.x += cos(this.dir) * 2;
    this.y += sin(this.dir) * 2;

    // Wrap-around boundaries
    if (this.x < 0) this.x += width;
    if (this.x >= width) this.x -= width;
    if (this.y < 0) this.y += height;
    if (this.y >= height) this.y -= height;

    const index = (floor(this.x) + floor(this.y) * width) * 4;
    
    // Deposit trail: adjust RGB towards dark blue/grey
    pixels[index]     = max(0, pixels[index] - 60);
    pixels[index + 1] = max(0, pixels[index + 1] - 50);
    pixels[index + 2] = max(0, pixels[index + 2] - 30);
    pixels[index + 3] = 255;
  }
}

class Agents {
  constructor() {
    this.agents = Array(agentsNum)
      .fill()
      .map((e) => new Agent());
  }
  update() {
    // Standard Physarum process: 1. Sense 2. Rotate 3. Move/Deposit
    for (let a of this.agents) a.updateDirection();
    for (let a of this.agents) a.updatePosition();
  }
}
