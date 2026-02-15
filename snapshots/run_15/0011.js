// Inspired by Jason
// Iteration 1: The Weaver - Reduced agent count and added interactive touch-based repulsion/attraction fields
// Iteration 2: The Sculptor - Added pressure-sensitive behavior where interaction duration changes agent speed and trail intensity
// Iteration 3: The Weaver - Added persistent touch-drawn gravity wells that distort time and pull agents into circular orbits
// Iteration 4: The Alchemist - Added reactive touch gestures where quick taps release energy pulses that scramble agent roles and colors
// Iteration 5: The Weaver - Added persistent touch-drawn silk threads that act as physical barriers and guide rails for agents
// Iteration 6: The Weaver - Added chromatic resonance loops that form glowing portals when silk threads are closed into circles
// Iteration 7: The Weaver - Added crystalline frost growth that crystallizes along silk threads when touched gently
// Iteration 8: The Weaver - Added kinetic thread vibration that ripples through the simulation when threads are plucked by rapid movement
// Iteration 9: The Weaver - Added prismatic refraction fields that emerge from triple-tap triangles, bending agent paths like glass
// Iteration 10: The Weaver - Added melodic chime-resonators that spawn at intersection points between silk threads
// Iteration 11: The Weaver - Added spectral echoes that manifest as faint, chromatic ghosts of agent paths following long-press releases
const sensorOffset = 18;
const sensorAngle = Math.PI / 4;
const turnAngle = Math.PI / 6;
let agents;
let touchDuration = 0;
let gravityPoints = [];
let pulseWaves = [];
let silkThreads = [];
let portals = []; 
let crystals = []; 
let threadVibrations = [];
let prisms = [];
let chimes = [];
let spectralEchoes = []; // New collection for path-based ghosts

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
  // If a touch was held for a long time, spawn spectral echoes from the agents' current positions
  if (touchDuration > 60) {
    agents.agents.forEach((a, i) => {
      if (i % 3 === 0) { // Limit frequency for performance and aesthetics
        spectralEchoes.push({
          x: a.x, y: a.y, 
          dir: a.dir, 
          life: 180, 
          col: a.baseColor,
          history: [] 
        });
      }
    });
  }

  if (touchDuration < 20) {
    pulseWaves.push({ x: mouseX, y: mouseY, r: 0, maxR: width * 0.4 });
    agents.agents.forEach(a => {
      if (dist(a.x, a.y, mouseX, mouseY) < 200) {
        a.type = a.type === 'attract' ? 'repel' : 'attract';
        a.baseColor = a.type === 'attract' ? [50, 200, 255] : [255, 100, 50];
      }
    });
  }

  let thread = silkThreads[silkThreads.length - 1];
  if (thread && thread.length > 20) {
    let d = dist(thread[0].x, thread[0].y, thread[thread.length-1].x, thread[thread.length-1].y);
    if (d < 50) {
      let cx = 0, cy = 0;
      thread.forEach(p => { cx += p.x; cy += p.y; });
      let px = cx/thread.length;
      let py = cy/thread.length;
      portals.push({x: px, y: py, r: d, hue: random(180, 400) % 360, life: 500});
      prisms.push({x: px, y: py, r: d * 3, life: 800});
    }
    
    if (silkThreads.length > 1) {
      for (let i = 0; i < silkThreads.length - 1; i++) {
        let other = silkThreads[i];
        for (let p1 of thread) {
          for (let p2 of other) {
            if (dist(p1.x, p1.y, p2.x, p2.y) < 5) {
              if (random() < 0.05) chimes.push({ x: p1.x, y: p1.y, size: 0, maxS: random(10, 30), life: 255 });
              break;
            }
          }
        }
      }
    }
  }
}

function draw() {
  let fadeAmount = map(touchDuration, 0, 100, 25, 8, true);
  background(0, fadeAmount);

  if (mouseIsPressed) {
    touchDuration = min(touchDuration + 1, 120);
    let head = {x: mouseX, y: mouseY};
    
    let moveDist = dist(mouseX, mouseY, pmouseX, pmouseY);
    if (moveDist > 25) {
      silkThreads.forEach((t, ti) => {
        t.forEach((p, pi) => {
           if (dist(mouseX, mouseY, p.x, p.y) < 50) {
             threadVibrations.push({threadIdx: ti, ptIdx: pi, life: 30, amp: moveDist * 0.5});
           }
        });
      });
    }

    if (silkThreads.length > 0) {
      silkThreads[silkThreads.length - 1].push(head);
      if (touchDuration < 40 && frameCount % 3 === 0) {
        let ang = random(TWO_PI);
        crystals.push({
          x: head.x, y: head.y, 
          vx: cos(ang) * 2, vy: sin(ang) * 2, 
          life: 40, c: color(180, 240, 255, 180)
        });
      }
    }
    
    if (frameCount % 8 === 0) {
      gravityPoints.push({ x: mouseX, y: mouseY, strength: touchDuration * 0.7, life: 255 });
    }
  } else {
    touchDuration = max(touchDuration - 2, 0);
  }

  // Update and Render Spectral Echoes - they drift and fade like ghosts of the agents
  for (let i = spectralEchoes.length - 1; i >= 0; i--) {
    let e = spectralEchoes[i];
    e.history.push({x: e.x, y: e.y});
    if (e.history.length > 15) e.history.shift();
    
    e.dir += noise(e.x * 0.01, e.y * 0.01, frameCount * 0.01) - 0.5;
    e.x += cos(e.dir) * 1.5;
    e.y += sin(e.dir) * 1.5;
    
    noFill();
    stroke(e.col[0], e.col[1], e.col[2], map(e.life, 0, 180, 0, 100));
    strokeWeight(0.5);
    beginShape();
    for(let p of e.history) vertex(p.x, p.y);
    endShape();

    e.life--;
    if (e.life <= 0) spectralEchoes.splice(i, 1);
  }

  for(let i = chimes.length - 1; i >= 0; i--){
    let c = chimes[i];
    c.size = lerp(c.size, c.maxS, 0.1);
    let alpha = c.life/255;
    fill(255, 255, 200, alpha * 0.5);
    noStroke();
    circle(c.x, c.y, c.size * sin(frameCount * 0.2));
    stroke(255, 255, 255, alpha * 0.8);
    point(c.x, c.y);
    c.life -= 1;
    if(c.life <= 0) chimes.splice(i, 1);
  }

  for (let i = threadVibrations.length - 1; i >= 0; i--) {
    let v = threadVibrations[i];
    let t = silkThreads[v.threadIdx];
    if (t && t[v.ptIdx]) {
      let offset = sin(v.life * 0.8) * v.amp * (v.life/30);
      t[v.ptIdx].x += offset * 0.1;
      t[v.ptIdx].y += offset * 0.1;
    }
    v.life--;
    if (v.life <= 0) threadVibrations.splice(i, 1);
  }

  for (let i = crystals.length - 1; i >= 0; i--) {
    let c = crystals[i];
    stroke(c.c);
    strokeWeight(0.5);
    line(c.x, c.y, c.x + c.vx, c.y + c.vy);
    c.x += c.vx; c.y += c.vy;
    c.vx += random(-0.1, 0.1); c.vy += random(-0.1, 0.1);
    c.life--;
    if (c.life <= 0) crystals.splice(i, 1);
  }

  colorMode(HSB, 360, 100, 100, 1);
  for (let i = prisms.length - 1; i >= 0; i--) {
    let p = prisms[i];
    noFill();
    stroke((frameCount + i*10) % 360, 60, 100, p.life/1600);
    strokeWeight(0.5);
    rectMode(CENTER);
    push();
    translate(p.x, p.y);
    rotate(frameCount * 0.02 + i);
    rect(0, 0, p.r * 2);
    pop();
    p.life--;
    if (p.life <= 0) prisms.splice(i, 1);
  }

  for (let i = portals.length - 1; i >= 0; i--) {
    let p = portals[i];
    let pulse = sin(frameCount * 0.1) * 10;
    noFill();
    stroke(p.hue, 80, 100, p.life/500 * 0.8);
    strokeWeight(1.5);
    beginShape();
    for(let a=0; a<TWO_PI; a+=PI/6){
      let r = (p.r + 40 + pulse) * (a % (PI/3) === 0 ? 1.2 : 0.7);
      vertex(p.x + cos(a)*r, p.y + sin(a)*r);
    }
    endShape(CLOSE);
    p.life--;
    if (p.life <= 0) portals.splice(i, 1);
  }
  colorMode(RGB, 255);

  for (let thread of silkThreads) {
    noFill();
    stroke(150, 200, 255, 80);
    strokeWeight(1);
    beginShape();
    for (let p of thread) { vertex(p.x, p.y); }
    endShape();
  }

  loadPixels();
  let steps = floor(map(touchDuration, 0, 120, 2, 4));
  for (let i = steps; i--; ) { agents.update(); }
  updatePixels();
  
  for (let i = pulseWaves.length - 1; i >= 0; i--) {
    let pw = pulseWaves[i];
    pw.r += 12;
    stroke(255, 255, 255, map(pw.r, 0, pw.maxR, 100, 0));
    ellipse(pw.x, pw.y, pw.r);
    if (pw.r > pw.maxR) pulseWaves.splice(i, 1);
  }

  for (let i = gravityPoints.length - 1; i >= 0; i--) {
    let p = gravityPoints[i];
    p.life -= 2;
    if (p.life <= 0) { gravityPoints.splice(i, 1); continue; }
    stroke(0, 150, 255, p.life * 0.15);
    ellipse(p.x, p.y, p.strength * (1 - p.life/255) * 2);
  }
}

class Agent {
  constructor(index) {
    this.x = random(width);
    this.y = random(height);
    this.dir = random(TWO_PI);
    this.type = index % 2 === 0 ? 'attract' : 'repel';
    this.baseColor = this.type === 'attract' ? [0, 100, 255] : [255, 100, 0];
    this.speed = random(2, 4);
  }

  updateDirection() {
    for(let c of chimes){
      let d = dist(this.x, this.y, c.x, c.y);
      if(d < c.size){
        this.dir += (random() - 0.5) * 0.5;
      }
    }

    for (let p of prisms) {
      let d = dist(this.x, this.y, p.x, p.y);
      if (d < p.r) {
        this.dir += sin(d * 0.1 + frameCount * 0.05) * 0.1;
      }
    }

    for (let p of portals) {
      let d = dist(this.x, this.y, p.x, p.y);
      if (d < 150) {
        let angleToPortal = atan2(p.y - this.y, p.x - this.x);
        this.dir = lerp(this.dir, angleToPortal + HALF_PI, 0.15);
      }
    }

    for (let p of gravityPoints) {
      let d = dist(this.x, this.y, p.x, p.y);
      if (d < 120) {
        let angleToPoint = atan2(p.y - this.y, p.x - this.x);
        let force = (p.strength / (d + 2)) * 0.05;
        this.dir += (this.type === 'attract' ? 1 : -1) * (angleToPoint - this.dir) * force;
      }
    }

    for (let thread of silkThreads) {
      if (thread.length > 5) {
        for (let i = 0; i < thread.length; i += 15) {
          let d = dist(this.x, this.y, thread[i].x, thread[i].y);
          if (d < 30) {
            let nextIdx = (i + 1) % thread.length;
            let themeAngle = atan2(thread[nextIdx].y - thread[i].y, thread[nextIdx].x - thread[i].x);
            this.dir = lerp(this.dir, themeAngle, 0.2);
          }
        }
      }
    }

    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    if (center > left && center > right) {} 
    else if (center < left && center < right) { this.dir += (random() - 0.5) * turnAngle; } 
    else if (left > right) { this.dir -= turnAngle; } 
    else if (right > left) { this.dir += turnAngle; }
  }

  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + sensorOffset * cos(angle));
    let y = floor(this.y + sensorOffset * sin(angle));
    x = (x + width) % width; y = (y + height) % height;
    return pixels[(x + y * width) * 4];
  }

  updatePosition() {
    let currentSpeed = this.speed * (1 + touchDuration * 0.005);
    this.x = (this.x + cos(this.dir) * currentSpeed + width) % width;
    this.y = (this.y + sin(this.dir) * currentSpeed + height) % height;

    const ix = (floor(this.x) + floor(this.y) * width) * 4;
    let bS = this.type === 'attract' ? sin(frameCount * 0.15) * 50 : 0;
    pixels[ix] = constrain(this.baseColor[0] + bS, 0, 255);
    pixels[ix+1] = constrain(this.baseColor[1] + bS, 0, 255);
    pixels[ix+2] = constrain(this.baseColor[2] + bS, 0, 255);
    pixels[ix+
