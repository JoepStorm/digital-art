// Inspired by Jason
// Iteration 1: The Weaver - Reduced agent count and added interactive touch-based repulsion/attraction fields
// Iteration 2: The Sculptor - Added pressure-sensitive behavior where interaction duration changes agent speed and trail intensity
// Iteration 3: The Weaver - Added persistent touch-drawn gravity wells that distort time and pull agents into circular orbits
const sensorOffset = 15;
const sensorAngle = Math.PI / 4;
const turnAngle = Math.PI / 6;
let agents;
let touchDuration = 0;
let gravityPoints = [];

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  pixelDensity(1);
  background(0);
  agents = new Agents(600);
}

function draw() {
  // Trails fade slower if touch is held longer
  let fadeAmount = map(touchDuration, 0, 100, 15, 2, true);
  background(0, fadeAmount);

  if (mouseIsPressed) {
    touchDuration = min(touchDuration + 1, 120);
    // Create persistent gravity wells that attract or repel based on touch intensity
    if (frameCount % 5 === 0) {
      gravityPoints.push({
        x: mouseX,
        y: mouseY,
        strength: touchDuration * 0.5,
        life: 255
      });
    }
  } else {
    touchDuration = max(touchDuration - 2, 0);
  }

  loadPixels();
  let steps = floor(map(touchDuration, 0, 120, 3, 8));
  for (let i = steps; i--; ) {
    agents.update();
  }
  updatePixels();
  
  // Clean up and draw gravity wells
  for (let i = gravityPoints.length - 1; i >= 0; i--) {
    let p = gravityPoints[i];
    p.life -= 1.5;
    if (p.life <= 0) {
      gravityPoints.splice(i, 1);
      continue;
    }
    noFill();
    stroke(255, 255, 255, p.life * 0.2);
    ellipse(p.x, p.y, p.strength * (1 - p.life/255));
  }

  if (mouseIsPressed) {
    noFill();
    stroke(255, 100 + touchDuration, 255 - touchDuration, 30 + touchDuration);
    strokeWeight(1 + touchDuration * 0.1);
    ellipse(mouseX, mouseY, 100 + touchDuration, 100 + touchDuration);
  }
}

class Agent {
  constructor(index) {
    this.x = random(width);
    this.y = random(height);
    this.dir = random(TWO_PI);
    this.type = index % 2 === 0 ? 'attract' : 'repel';
    this.baseColor = this.type === 'attract' ? [0, 150, 255] : [255, 100, 0];
    this.speed = random(1.5, 2.5);
  }

  updateDirection() {
    // Influence from persistent gravity points
    for (let p of gravityPoints) {
      let d = dist(this.x, this.y, p.x, p.y);
      if (d < 100) {
        let angleToPoint = atan2(p.y - this.y, p.x - this.x);
        let force = (p.strength / (d + 1)) * 0.02;
        // Gravity wells create orbital swirl rather than direct collision
        if (this.type === 'attract') {
          this.dir += (angleToPoint + HALF_PI - this.dir) * force;
        } else {
          this.dir -= (angleToPoint - HALF_PI - this.dir) * force;
        }
      }
    }

    if (mouseIsPressed) {
      let d = dist(this.x, this.y, mouseX, mouseY);
      let threshold = 150 + touchDuration;
      if (d < threshold) {
        let angleToMouse = atan2(mouseY - this.y, mouseX - this.x);
        let force = map(touchDuration, 0, 120, 0.05, 0.4);
        if (this.type === 'attract') {
          this.dir += (angleToMouse - this.dir) * force;
        } else {
          this.dir -= (angleToMouse - this.dir) * force;
        }
      }
    }

    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    if (center > left && center > right) {
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
    return pixels[index];
  }

  updatePosition() {
    let currentSpeed = this.speed * (1 + touchDuration * 0.01);
    this.x += cos(this.dir) * currentSpeed;
    this.y += sin(this.dir) * currentSpeed;
    
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const ix = (floor(this.x) + floor(this.y) * width) * 4;
    let glow = touchDuration * 0.8;
    pixels[ix] = min(255, this.baseColor[0] + glow);
    pixels[ix + 1] = min(255, this.baseColor[1] + glow);
    pixels[ix + 2] = min(255, this.baseColor[2] + glow);
    pixels[ix + 3] = 255;
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
