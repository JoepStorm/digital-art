// Inspired by Jason
// Iteration 1: The Weaver - Reduced agent count and added interactive touch-based repulsion/attraction fields
const sensorOffset = 15;
const sensorAngle = Math.PI / 4;
const turnAngle = Math.PI / 6;
let agents;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(0);
  // Initializing exactly 600 agents as per constraint
  agents = new Agents(600);
}

function draw() {
  // Creating a fading trail effect for smooth motion aesthetics
  background(0, 15);

  loadPixels();
  // Multiple updates per frame for smoother simulation flow
  for (let i = 5; i--; ) {
    agents.update();
  }
  updatePixels();
  
  // Visual feedback for interactions
  if (mouseIsPressed) {
    noFill();
    stroke(255, 50);
    ellipse(mouseX, mouseY, 100, 100);
  }
}

class Agent {
  constructor(index) {
    this.x = random(width);
    this.y = random(height);
    this.dir = random(TWO_PI);
    // Assigning distinct behaviors: half attract to touch, half repel
    this.type = index % 2 === 0 ? 'attract' : 'repel';
    this.color = this.type === 'attract' ? [0, 150, 255] : [255, 100, 0];
  }

  updateDirection() {
    // Spatial interaction logic based on mouse/touch position
    if (mouseIsPressed) {
      let d = dist(this.x, this.y, mouseX, mouseY);
      if (d < 150) {
        let angleToMouse = atan2(mouseY - this.y, mouseX - this.x);
        if (this.type === 'attract') {
          // Slowly align towards the touch
          this.dir += (angleToMouse - this.dir) * 0.1;
        } else {
          // Turn away from the touch
          this.dir -= (angleToMouse - this.dir) * 0.1;
        }
      }
    }

    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    // Physarum logic: prefer darker areas (trails of others) to create patterns
    if (center > left && center > right) {
      // stay on path
    } else if (center < left && center < right) {
      this.dir += (random() - 0.5) * 2 * turnAngle;
    } else if (left > right) {
      this.dir -= turnAngle;
    } else if (right > left) {
      this.dir += turnAngle;
    }
  }

  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + sensorOffset * cos(angle));
    let y = floor(this.y + sensorOffset * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;

    const index = (x + y * width) * 4;
    // Sensing the brightness of the pixel
    return pixels[index];
  }

  updatePosition() {
    this.x += cos(this.dir) * 2;
    this.y += sin(this.dir) * 2;
    
    // Toroidal world wrapping
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const index = (floor(this.x) + floor(this.y) * width) * 4;
    pixels[index] = this.color[0];
    pixels[index + 1] = this.color[1];
    pixels[index + 2] = this.color[2];
    pixels[index + 3] = 255;
  }
}

class Agents {
  constructor(num) {
    this.agents = [];
    for (let i = 0; i < num; i++) {
      this.agents.push(new Agent(i));
    }
  }
  update() {
    this.agents.forEach((e) => e.updateDirection());
    this.agents.forEach((e) => e.updatePosition());
  }
}
