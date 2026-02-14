// Inspired by Jason
// Iteration 1: The Weaver - Reduced agent count and added interactive touch-based repulsion/attraction fields
// Iteration 2: The Sculptor - Added pressure-sensitive behavior where interaction duration changes agent speed and trail intensity
// Iteration 3: The Weaver - Added persistent touch-drawn gravity wells that distort time and pull agents into circular orbits
// Iteration 4: The Alchemist - Added reactive touch gestures where quick taps release energy pulses that scramble agent roles and colors
// Iteration 5: The Weaver - Added persistent touch-drawn silk threads that act as physical barriers and guide rails for agents
// Iteration 6: The Weaver - Added chromatic resonance loops that form glowing portals when silk threads are closed into circles
// Iteration 7: The Weaver - Added crystalline frost growth that crystallizes along silk threads when touched gently
const sensorOffset = 18;
const sensorAngle = Math.PI / 4;
const turnAngle = Math.PI / 6;
let agents;
let touchDuration = 0;
let gravityPoints = [];
let pulseWaves = [];
let silkThreads = [];
let portals = []; 
let crystals = []; // Stores frost growth points

function setup() {
  createCanvas(windowWidth, windowHeight);
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

  let thread = silkThreads[silkThreads.length - 1];
  if (thread && thread.length > 20) {
    let d = dist(thread[0].x, thread[0].y, thread[thread.length-1].x, thread[thread.length-1].y);
    if (d < 50) {
      let cx = 0, cy = 0;
      thread.forEach(p => { cx += p.x; cy += p.y; });
      portals.push({x: cx/thread.length, y: cy/thread.length, r: d, hue: random(180, 240), life: 500});
    }
  }
}

function draw() {
  let fadeAmount = map(touchDuration, 0, 100, 22, 6, true);
  background(0, fadeAmount);

  if (mouseIsPressed) {
    touchDuration = min(touchDuration + 1, 120);
    if (silkThreads.length > 0) {
      let head = {x: mouseX, y: mouseY};
      silkThreads[silkThreads.length - 1].push(head);
      
      // Gently drawing (low pressure/duration) creates fractal frost branches
      if (touchDuration < 40 && frameCount % 3 === 0) {
        let ang = random(TWO_PI);
        crystals.push({
          x: head.x, 
          y: head.y, 
          vx: cos(ang) * 2, 
          vy: sin(ang) * 2, 
          life: 40,
          c: color(150, 220, 255, 150)
        });
      }
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

  // Draw and update Crystalline Frost
  for (let i = crystals.length - 1; i >= 0; i--) {
    let c = crystals[i];
    stroke(c.c);
    strokeWeight(0.5);
    line(c.x, c.y, c.x + c.vx, c.y + c.vy);
    c.x += c.vx;
    c.y += c.vy;
    c.vx += random(-0.2, 0.2);
    c.vy += random(-0.2, 0.2);
    c.life--;
    if (c.life <= 0) crystals.splice(i, 1);
  }

  // Draw Portals
  colorMode(HSB, 360, 100, 100, 1);
  for (let i = portals.length - 1; i >= 0; i--) {
    let p = portals[i];
    let pulse = sin(frameCount * 0.05) * 15;
    noFill();
    stroke(p.hue, 70, 100, p.life/500 * 0.6);
    strokeWeight(1);
    // Draw a star-like structure for the portal
    beginShape();
    for(let a=0; a<TWO_PI; a+=PI/4){
      let r = (60 + pulse) * (a % (PI/2) === 0 ? 1 : 0.5);
      vertex(p.x + cos(a)*r, p.y + sin(a)*r);
    }
    endShape(CLOSE);
    p.life--;
    if (p.life <= 0) portals.splice(i, 1);
  }
  colorMode(RGB, 255);

  for (let thread of silkThreads) {
    noFill();
    stroke(120, 180, 255, 60);
    strokeWeight(1);
    beginShape();
    for (let p of thread) {
      vertex(p.x, p.y);
    }
    endShape();
  }

  loadPixels();
  let steps = floor(map(touchDuration, 0, 120, 2, 5));
  for (let i = steps; i--; ) {
    agents.update();
  }
  updatePixels();
  
  for (let i = pulseWaves.length - 1; i >= 0; i--) {
    let pw = pulseWaves[i];
    pw.r += 10;
    noFill();
    stroke(200, 230, 255, map(pw.r, 0, pw.maxR, 150, 0));
    strokeWeight(1);
    ellipse(pw.x, pw.y, pw.r);
    if (pw.r > pw.maxR) pulseWaves.splice(i, 1);
  }

  for (let i = gravityPoints.length - 1; i >= 0; i--) {
    let p = gravityPoints[i];
    p.life -= 1.5;
    if (p.life <= 0) {
      gravityPoints.splice(i, 1);
      continue;
    }
    noFill();
    stroke(100, 200, 255, p.life * 0.2);
    ellipse(p.x, p.y, p.strength * (1 - p.life/255));
  }
}

class Agent {
  constructor(index) {
    this.x = random(width);
    this.y = random(height);
    this.dir = random(TWO_PI);
    this.type = index % 2 === 0 ? 'attract' : 'repel';
    this.baseColor = this.type === 'attract' ? [0, 140, 255] : [255, 120, 50];
    this.speed = random(1.5, 3.5);
  }

  updateDirection() {
    for (let p of portals) {
      let d = dist(this.x, this.y, p.x, p.y);
      if (d < 120) {
        let angleToPortal = atan2(p.y - this.y, p.x - this.x);
        this.dir = lerp(this.dir, angleToPortal + HALF_PI, 0.2);
      }
    }

    for (let p of gravityPoints) {
      let d = dist(this.x, this.y, p.x, p.y);
      if (d < 100) {
        let angleToPoint = atan2(p.y - this.y, p.x - this.x);
        let force = (p.strength / (d + 1)) * 0.04;
        this.dir += (this.type === 'attract' ? 1 : -1) * (angleToPoint - this.dir) * force;
      }
    }

    for (let thread of silkThreads) {
      if (thread.length > 1) {
        for (let i = 0; i < thread.length; i += 12) {
          let d = dist(this.x, this.y, thread[i].x, thread[i].y);
          if (d < 40) {
            let nextIdx = (i + 1) % thread.length;
            let themeAngle = atan2(thread[nextIdx].y - thread[i].y, thread[nextIdx].x - thread[i].x);
            this.dir = lerp(this.dir, themeAngle, 0.12);
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
    let currentSpeed = this.speed * (1 + touchDuration * 0.006);
    this.x += cos(this.dir) * currentSpeed;
    this.y += sin(this.dir) * currentSpeed;
    
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const ix = (floor(this.x) + floor(this.y) * width) * 4;
    let bS = this.type === 'attract' ? sin(frameCount * 0.15) * 30 : 0;
    pixels[ix] = constrain(this.baseColor[0] + bS, 0, 255);
    pixels[ix + 1] = constrain(this.baseColor[1] + bS, 0, 255);
    pixels[ix + 2] = constrain(this.baseColor[2] + bS, 0, 255);
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
