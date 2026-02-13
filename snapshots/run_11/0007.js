// Iteration 1: The Chromatist - Introduced three distinct species with unique colors and color-coded social attraction.
// Iteration 2: The Ethereal Weaver - Added species-specific rhythmic pulsing and predatory cross-species avoidance.
// Iteration 3: The Luminescent Weaver - Added magnetic entanglement where species weave around a central gravitational attractor.
// Iteration 4: The Chromatic Weaver - Introduced species-specific field turbulence that twists the local space.
// Iteration 5: The Ethereal Loom - Introduced spectral chromatic aberration as a trailing halo around each species' movement.
// Iteration 6: The Bioluminescent Synchronizer - Introduced species-specific rhythmic synchronization where agents align their pulsing phases with neighbors.
// Iteration 7: The Gossamer Silk-Weaver - Introduced species-specific memory trails that create a persistent woven tapestry in space.

const boidsNum = 400;
const maxSpeed = 3;
const maxForce = 0.05;
const perception = 60;
let flock;

function setup() {
  createCanvas(1600, 900);
  background(0);
  flock = new Flock();
}

function draw() {
  // Deepening the fade to allow the new persistent "memory trails" to linger longer and blend
  background(0, 8);
  flock.update();
  flock.draw();
}

class Boid {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = p5.Vector.random2D().mult(maxSpeed);
    this.acc = createVector();
    this.species = floor(random(3));
    this.colors = [
      color(255, 50, 100), // Neon Pink
      color(50, 200, 255), // Cyan
      color(200, 255, 50)  // Lime
    ];
    this.color = this.colors[this.species];
    this.pulseOffset = random(TWO_PI);
    // Path history to create a physical sense of "weaving" through the void
    this.history = [];
    this.maxHistory = 15;
  }

  steer(boids) {
    let sep = createVector(), ali = createVector(), coh = createVector(), avoid = createVector();
    let n = 0;
    let nAvoid = 0;

    for (let o of boids) {
      let d = dist(this.pos.x, this.pos.y, o.pos.x, o.pos.y);
      if (o !== this && d < perception) {
        if (o.species === this.species) {
          ali.add(o.vel);
          coh.add(o.pos);
          sep.add(p5.Vector.sub(this.pos, o.pos).div(d));
          
          let diff = o.pulseOffset - this.pulseOffset;
          this.pulseOffset += sin(diff) * 0.05; 
          n++;
        } else {
          avoid.add(p5.Vector.sub(this.pos, o.pos).div(d * d));
          nAvoid++;
        }
      }
    }

    const lim = (v, s) => v.limit(s);
    
    this.acc.add(lim(sep, maxForce).mult(1.5));
    if (nAvoid > 0) {
      this.acc.add(lim(avoid, maxForce * 1.5));
    }
    if (n > 0) {
      this.acc.add(lim(ali.div(n).sub(this.vel), maxForce));
      this.acc.add(lim(coh.div(n).sub(this.pos), maxForce));
    }

    let center = createVector(width / 2, height / 2);
    let towardCenter = p5.Vector.sub(center, this.pos);
    let distToCenter = towardCenter.mag();
    let orbitForce = towardCenter.copy().rotate(HALF_PI * (this.species === 1 ? -1 : 1));
    
    let noiseScale = 0.005;
    let nVal = noise(this.pos.x * noiseScale, this.pos.y * noiseScale, frameCount * 0.01 + this.species * 10);
    let twist = map(nVal, 0, 1, -PI, PI);
    let flow = p5.Vector.fromAngle(twist).mult(maxForce * 0.5);
    this.acc.add(flow);

    orbitForce.setMag(map(distToCenter, 0, width, 0, maxForce * 0.8));
    this.acc.add(orbitForce);
  }

  update() {
    // Record current position for trailing geometry before moving
    this.history.push(this.pos.copy());
    if (this.history.length > this.maxHistory) this.history.shift();

    this.vel.add(this.acc).limit(maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);

    // Screen wrap logic handles history cleanup to prevent long horizontal lines
    if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height) {
       this.history = [];
    }
    this.pos.x = (this.pos.x + width) % width;
    this.pos.y = (this.pos.y + height) % height;
  }
}

class Flock {
  constructor() {
    this.boids = Array(boidsNum).fill().map(() => new Boid());
  }
  update() {
    this.boids.forEach(b => b.steer(this.boids));
    this.boids.forEach(b => b.update());
  }
  draw() {
    noFill();
    this.boids.forEach(b => {
      let pulse = sin(frameCount * 0.15 + b.pulseOffset);
      let alpha = map(pulse, -1, 1, 80, 255);
      let weight = map(pulse, -1, 1, 1.0, 4.0);
      
      // Draw the "Gossamer Silk" — a subtle, curved path connecting history points
      // This emphasizes the fluid, non-linear movement of the species.
      if (b.history.length > 2) {
        beginShape();
        strokeWeight(weight * 0.4);
        // Species tint for the silk trail
        let silkCol = color(red(b.color), green(b.color), blue(b.color), alpha * 0.2);
        stroke(silkCol);
        for (let i = 0; i < b.history.length; i++) {
          curveVertex(b.history[i].x, b.history[i].y);
        }
        endShape();
      }

      // Chromatic Aberration Halo
      let perp = createVector(-b.vel.y, b.vel.x).setMag(3);
      stroke(red(b.color), 0, 100, alpha * 0.25);
      strokeWeight(weight * 1.1);
      line(b.pos.x + perp.x, b.pos.y + perp.y, b.pos.x - b.vel.x * 2.5, b.pos.y - b.vel.y * 2.5);
      
      stroke(0, green(b.color), blue(b.color), alpha * 0.25);
      line(b.pos.x - perp.x, b.pos.y - perp.y, b.pos.x - b.vel.x * 2.5, b.pos.y - b.vel.y * 2.5);

      // Core body
      stroke(red(b.color), green(b.color), blue(b.color), alpha);
      strokeWeight(weight);
      let length = map(pulse, -1, 1, 10, 30);
      let t = b.vel.copy().setMag(length);
      line(b.pos.x, b.pos.y, b.pos.x - t.x, b.pos.y - t.y);
      
      // Synchronized "Heartbeat" spark
      stroke(255, alpha);
      strokeWeight(weight * 0.8);
      point(b.pos.x, b.pos.y);
    });
  }
}
