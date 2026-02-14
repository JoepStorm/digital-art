// Iteration 1: The Bio-Architect - Adding physical size, dynamic color, and metabolic growth/decay cycles
// Iteration 2: The Ethereal Animator - Adding luminous trails and pulsating predator-prey bioluminescence
// Iteration 3: The Chromatic Weaver - Adding spectral refraction and adaptive chromatic aberration to trails
// Iteration 4: The Kinetic Sculptor - Introducing gravitational vortex pulling and spatial distortion trails
// Iteration 5: The Lattice Architect - Introducing spatial structure through grid-based energy filaments
// Iteration 6: The Bioluminescent Weaver - Introducing silk-like synaptic connections and vibrational interference patterns
const boidsNum = 150;
const perception = 60;
let flock;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 255);
  background(0);
  flock = new Flock();
}

function draw() {
  // Deepen the void for better contrast with the new synaptic threads
  background(0, 12);
  
  // High-frequency energy lattice that ripples as agents pass
  drawGrid();
  
  flock.update();
  flock.draw();
  
  if (frameCount % 12 === 0 && flock.boids.length < 220) {
    let edgeX = random(1) > 0.5 ? 0 : width;
    let edgeY = random(height);
    flock.boids.push(new Boid(edgeX, edgeY, random(3, 5)));
  }
}

function drawGrid() {
  let spacing = 80;
  for (let x = 0; x <= width; x += spacing) {
    // Subtle interference pattern based on time
    let waveX = sin(frameCount * 0.02 + x * 0.01) * 2;
    stroke((frameCount * 0.5 + x/10) % 255, 120, 60, 25);
    strokeWeight(0.3);
    line(x + waveX, 0, x - waveX, height);
  }
  for (let y = 0; y <= height; y += spacing) {
    let waveY = cos(frameCount * 0.02 + y * 0.01) * 2;
    stroke(((frameCount * 0.5 + 120) + y/10) % 255, 120, 60, 25);
    line(0, y + waveY, width, y - waveY);
  }
}

class Boid {
  constructor(x, y, size) {
    this.pos = createVector(x || random(width), y || random(height));
    this.vel = p5.Vector.random2D().mult(random(2, 4));
    this.acc = createVector();
    this.mass = size || random(4, 8);
    this.hue = random(255);
    this.color = color(this.hue, 200, 255);
    this.maxForce = 0.15;
    this.history = []; 
    this.links = []; // Store temporary synaptic connections
  }

  interact(boids) {
    let sep = createVector(), ali = createVector(), coh = createVector();
    let n = 0;
    this.links = [];

    for (let i = boids.length - 1; i >= 0; i--) {
      let o = boids[i];
      if (o === this) continue;
      
      let d = dist(this.pos.x, this.pos.y, o.pos.x, o.pos.y);
      
      // Consumption Logic
      if (o.mass < this.mass * 0.75 && d < (this.mass + o.mass) * 0.8) {
        this.mass += o.mass * 0.3;
        this.hue = lerp(this.hue, (o.hue + 20) % 255, 0.2);
        boids.splice(i, 1);
        continue;
      }

      if (d < perception) {
        let weight = (this.mass < o.mass) ? 3.0 : 1.0; 
        sep.add(p5.Vector.sub(this.pos, o.pos).div(d * d).mult(weight * 20));
        ali.add(o.vel);
        coh.add(o.pos);
        
        // Predation Steering: Small chase the light, big hunt the small
        if (this.mass > o.mass * 1.5) {
            let hunt = p5.Vector.sub(o.pos, this.pos);
            this.acc.add(hunt.setMag(0.05));
            // Record a "synaptic" link for drawing
            if (d < perception * 0.8) this.links.push({pos: o.pos.copy(), h: o.hue});
        }

        n++;
      }
    }

    if (n) {
      this.acc.add(sep.div(n).limit(this.maxForce * 2.5));
      this.acc.add(p5.Vector.sub(ali.div(n), this.vel).limit(this.maxForce));
      this.acc.add(p5.Vector.sub(coh.div(n), this.pos).limit(this.maxForce));
    }
  }

  update() {
    this.history.push(this.pos.copy());
    if (this.history.length > 15) this.history.shift();

    let speedLimit = map(this.mass, 2, 30, 7, 0.8, true);
    this.vel.add(this.acc).limit(speedLimit);
    this.pos.add(this.vel);
    this.acc.mult(0);
    
    // Metabolism
    this.mass -= 0.006 + (this.mass * 0.0003);
    
    // Mitosis
    if (this.mass > 32) {
      this.mass *= 0.48;
      let offspring = new Boid(this.pos.x + random(-10, 10), this.pos.y + random(-10, 10), this.mass);
      offspring.hue = (this.hue + 30) % 255;
      flock.boids.push(offspring);
    }

    this.pos.x = (this.pos.x + width) % width;
    this.pos.y = (this.pos.y + height) % height;
  }

  isDead() {
    return this.mass < 1.0;
  }
}

class Flock {
  constructor() {
    this.boids = Array(boidsNum).fill().map(() => new Boid());
  }

  update() {
    for (let i = this.boids.length - 1; i >= 0; i--) {
      let b = this.boids[i];
      b.interact(this.boids);
      b.update();
      if (b.isDead()) this.boids.splice(i, 1);
    }
  }

  draw() {
    this.boids.forEach(b => {
      // Draw synaptic connection filaments between predators and prey
      b.links.forEach(l => {
        stroke(b.hue, 200, 255, 30);
        strokeWeight(0.5);
        line(b.pos.x, b.pos.y, l.pos.x, l.pos.y);
      });

      // Artistic Trail Rendering with Spectrum Shift
      let aberration = b.vel.mag() * 1.2;
      noFill();
      let offsets = [[-aberration, -2], [aberration, 2], [0, 0]];
      
      offsets.forEach((off, idx) => {
        beginShape();
        for(let i = 0; i < b.history.length; i++) {
          let alpha = map(i, 0, b.history.length, 0, 140);
          let h = (b.hue + (idx - 1) * 15 + 255) % 255;
          stroke(h, 220, 255, alpha);
          strokeWeight(map(i, 0, b.history.length, 0.1, b.mass * 0.35));
          vertex(b.history[i].x + off[0], b.history[i].y + off[1]);
        }
        endShape();
      });

      // Boid Core: Bioluminescent Head
      push();
      translate(b.pos.x, b.pos.y);
      rotate(b.vel.heading());
      
      let pulse = (1 + sin(frameCount * 0.15)) * (b.mass * 0.1);
      noStroke();
      fill(b.hue, 255, 255, 180);
      ellipse(0, 0, b.mass * 2 + pulse, b.mass * 1.4 + pulse);
      
      // Eye of the hunter
      fill(255, 220);
      ellipse(b.mass * 0.4, 0, b.mass * 0.6, b.mass * 0.6);
      fill(0);
      ellipse(b.mass * 0.5, 0, b.mass * 0.2, b.mass * 0.2);
      pop();
    });
  }
}
