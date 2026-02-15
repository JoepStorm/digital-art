// Inspired by Jason
// Iteration 1: The Weaver - Reduced agent count and added interactive touch-based repulsion/attraction fields
// Iteration 2: The Sculptor - Added pressure-sensitive behavior where interaction duration changes agent speed and trail intensity
// Iteration 3: The Weaver - Added persistent touch-drawn gravity wells that distort time and pull agents into circular orbits
// Iteration 4: The Alchemist - Added reactive touch gestures where quick taps release energy pulses that scramble agent roles and colors
// Iteration 5: The Weaver - Added persistent touch-drawn silk threads that act as physical barriers and guide rails for agents
// Iteration 6: The Weaver - Added chromatic resonance loops that form glowing portals when silk threads are closed into circles
const sensorOffset = 18;
const sensorAngle = Math.PI / 4;
const turnAngle = Math.PI / 6;
let agents;
let touchDuration = 0;
let gravityPoints = [];
let pulseWaves = [];
let silkThreads = [];
let portals = []; // Store finalized loops that pulse with color

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  pixelDensity(1);
  background(0);
  agents = new Agents(600);
}

function mousePressed() {
  silkThreads.push([]);
}

function mouseReleased() {
  if (touchDuration < 20) {
    pulseWaves.push({ x: mouseX, y: mouseY, r: 0, maxR: width * 0.4 });
    agents.agents.forEach(a => {
      if (dist(a.x, a.y, mouseX, mouseY) < 200) {
        a.type = a.type === 'attract' ? 'repel' : 'attract';
        a.baseColor = a.type === 'attract' ? [0, 255, 200] : [255, 50, 100];
      }
    });
  }

  // Check if current thread forms a loop (start near end)
  let thread = silkThreads[silkThreads.length - 1];
  if (thread && thread.length > 20) {
    let d = dist(thread[0].x, thread[0].y, thread[thread.length-1].x, thread[thread.length-1].y);
    if (d < 50) {
      // Calculate center for a portal
      let cx = 0, cy = 0;
      thread.forEach(p => { cx += p.x; cy += p.y; });
      portals.push({x: cx/thread.length, y: cy/thread.length, r: d, hue: random(360), life: 500});
    }
  }
}

function draw() {
  let fadeAmount = map(touchDuration, 0, 100, 18, 4, true);
  background(0, fadeAmount);

  if (mouseIsPressed) {
    touchDuration = min(touchDuration + 1, 120);
    if (silkThreads.length > 0) {
      silkThreads[silkThreads.length - 1].push({x: mouseX, y: mouseY});
    }
    
    if (frameCount % 8 === 0) {
      gravityPoints.push({
        x: mouseX,
        y: mouseY,
        strength: touchDuration * 0.7,
        life: 255
      });
    }
  } else {
    touchDuration = max(touchDuration - 2, 0);
  }

  // Draw Portals
  colorMode(HSB, 360, 100, 100, 1);
  for (let i = portals.length - 1; i >= 0; i--) {
    let p = portals[i];
    let pulse = sin(frameCount * 0.05) * 10;
    noFill();
    stroke(p.hue, 80, 100, p.life/500 * 0.4);
    strokeWeight(2);
    ellipse(p.x, p.y, 60 + pulse, 60 + pulse);
    p.life--;
    if (p.life <= 0) portals.splice(i, 1);
  }
  colorMode(RGB, 255);

  for (let thread of silkThreads) {
    noFill();
    stroke(100, 150, 255, 40);
    strokeWeight(1);
    beginShape();
    for (let p of thread) {
      vertex(p.x, p.y);
    }
    endShape();
  }

  loadPixels();
  let steps = floor(map(touchDuration, 0, 120, 2, 6));
  for (let i = steps; i--; ) {
    agents.update();
  }
  updatePixels();
  
  for (let i = pulseWaves.length - 1; i >= 0; i--) {
    let pw = pulseWaves[i];
    pw.r += 12;
    noFill();
    stroke(255, 255, 255, map(pw.r, 0, pw.maxR, 180, 0));
    strokeWeight(1.5);
    ellipse(pw.x, pw.y, pw.r);
    if (pw.r > pw.maxR) pulseWaves.splice(i, 1);
  }

  for (let i = gravityPoints.length - 1; i >= 0; i--) {
    let p = gravityPoints[i];
    p.life -= 1.2;
    if (p.life <= 0) {
      gravityPoints.splice(i, 1);
      continue;
    }
    noFill();
    stroke(255, 255, 255, p.life * 0.15);
    ellipse(p.x, p.y, p.strength * (1 - p.life/255));
  }
}

class Agent {
  constructor(index) {
    this.x = random(width);
    this.y = random(height);
    this.dir = random(TWO_PI);
    this.type = index % 2 === 0 ? 'attract' : 'repel';
    this.baseColor = this.type === 'attract' ? [0, 120, 255] : [255, 80, 0];
    this.speed = random(1.2, 3.0);
  }

  updateDirection() {
    // Portals act as high-speed accelerators
    for (let p of portals) {
      let d = dist(this.x, this.y, p.x, p.y);
      if (d < 100) {
        let angleToPortal = atan2(p.y - this.y, p.x - this.x);
        this.dir = lerp(this.dir, angleToPortal + HALF_PI, 0.15); // Orbital velocity
      }
    }

    for (let p of gravityPoints) {
      let d = dist(this.x, this.y, p.x, p.y);
      if (d < 80) {
        let angleToPoint = atan2(p.y - this.y, p.x - this.x);
        let force = (p.strength / (d + 1)) * 0.03;
        this.dir += (this.type === 'attract' ? 1 : -1) * (angleToPoint - this.dir) * force;
      }
    }

    // Alignment with Silk Threads
    for (let thread of silkThreads) {
      if (thread.length > 1) {
        for (let i = 0; i < thread.length; i += 8) {
          let d = dist(this.x, this.y, thread[i].x, thread[i].y);
          if (d < 30) {
            let nextIdx = (i + 1) % thread.length;
            let themeAngle = atan2(thread[nextIdx].y - thread[i].y, thread[nextIdx].x - thread[i].x);
            this.dir = lerp(this.dir, themeAngle, 0.1);
          }
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
    let currentSpeed = this.speed * (1 + touchDuration * 0.005);
    this.x += cos(this.dir) * currentSpeed;
    this.y += sin(this.dir) * currentSpeed;
    
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const ix = (floor(this.x) + floor(this.y) * width) * 4;
    let brightnessShift = this.type === 'attract' ? sin(frameCount * 0.1) * 20 : 0;
    pixels[ix] = constrain(this.baseColor[0] + brightnessShift, 0, 255);
    pixels[ix + 1] = constrain(this.baseColor[1] + brightnessShift, 0, 255);
    pixels[ix + 2] = constrain(this.baseColor[2] + brightnessShift, 0, 255);
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
