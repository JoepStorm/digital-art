// Iteration 1: The Chromatist - Introduced three distinct species with unique colors and color-coded social attraction.
// Iteration 2: The Ethereal Weaver - Added species-specific rhythmic pulsing and predatory cross-species avoidance.
// Iteration 3: The Luminescent Weaver - Added magnetic entanglement where species weave around a central gravitational attractor.
// Iteration 4: The Chromatic Weaver - Introduced species-specific field turbulence that twists the local space.
// Iteration 5: The Ethereal Loom - Introduced spectral chromatic aberration as a trailing halo around each species' movement.
// Iteration 6: The Bioluminescent Synchronizer - Introduced species-specific rhythmic synchronization where agents align their pulsing phases with neighbors.
// Iteration 7: The Gossamer Silk-Weaver - Introduced species-specific memory trails that create a persistent woven tapestry in space.
// Iteration 8: The Prism Weaver - Introduced refraction fields where crossing species' trails create additive interference "shimmer" pools.

const boidsNum = 380;
const maxSpeed = 3.2;
const maxForce = 0.055;
const perception = 65;
let flock;

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  background(0);
  // Using blendMode SCREEN allows colors to accumulate and create "white" light where species intersect
  blendMode(SCREEN);
  flock = new Flock();
}

function draw() {
  // Clearing with a translucent black to maintain trails without overloading the additive blend
  blendMode(BLEND);
  background(0, 12);
  blendMode(SCREEN);
  
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
      color(255, 30, 80), // Hot Magenta
      color(0, 180, 255), // Electric Cyan
      color(150, 255, 0)  // Acid Lime
    ];
    this.color = this.colors[this.species];
    this.pulseOffset = random(TWO_PI);
    this.history = [];
    this.maxHistory = 18; // Slightly longer for more "weaving"
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
          // Different species repel slightly but also "twist" around each other
          let repulse = p5.Vector.sub(this.pos, o.pos);
          repulse.rotate(QUARTER_PI); // Creates a whirlpool effect between species
          avoid.add(repulse.div(d));
          nAvoid++;
        }
      }
    }

    const lim = (v, s) => v.limit(s);
    
    this.acc.add(lim(sep, maxForce).mult(1.7));
    if (nAvoid > 0) {
      this.acc.add(lim(avoid, maxForce * 2.0));
    }
    if (n > 0) {
      this.acc.add(lim(ali.div(n).sub(this.vel), maxForce));
      this.acc.add(lim(coh.div(n).sub(this.pos), maxForce));
    }

    let center = createVector(width / 2, height / 2);
    let towardCenter = p5.Vector.sub(center, this.pos);
    let distToCenter = towardCenter.mag();
    let orbitForce = towardCenter.copy().rotate(HALF_PI * (this.species === 1 ? -1.2 : 0.8));
    
    let noiseScale = 0.004;
    let nVal = noise(this.pos.x * noiseScale, this.pos.y * noiseScale, frameCount * 0.012 + this.species);
    let twist = map(nVal, 0, 1, -TWO_PI, TWO_PI);
    let flow = p5.Vector.fromAngle(twist).mult(maxForce * 0.6);
    this.acc.add(flow);

    orbitForce.setMag(map(distToCenter, 0, width, 0, maxForce));
    this.acc.add(orbitForce);
  }

  update() {
    this.history.push(this.pos.copy());
    if (this.history.length > this.maxHistory) this.history.shift();

    this.vel.add(this.acc).limit(maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);

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
      let pulse = sin(frameCount * 0.12 + b.pulseOffset);
      let alpha = map(pulse, -1, 1, 40, 200);
      let weight = map(pulse, -1, 1, 0.5, 3.5);
      
      // Prism Trail: Draw slightly offset RGB curves to create a "prismatic" weave
      if (b.history.length > 2) {
        strokeWeight(weight * 0.3);
        let c = b.color;
        
        // Main path
        stroke(red(c), green(c), blue(c), alpha * 0.3);
        beginShape();
        for (let p of b.history) curveVertex(p.x, p.y);
        endShape();

        // Shimmering Interference: Draws a point at the tail that glows
        let tail = b.history[0];
        stroke(255, alpha * 0.15);
        strokeWeight(weight * 2);
        point(tail.x, tail.y);
      }

      // Chromatic Aberration Halo / Motion Blur
      let perp = p5.Vector.rotate(b.vel, HALF_PI).setMag(weight * 1.5);
      
      // Red shift
      stroke(255, 0, 0, alpha * 0.4);
      line(b.pos.x + perp.x, b.pos.y + perp.y, b.pos.x - b.vel.x * 3, b.pos.y - b.vel.y * 3);
      
      // Blue shift
      stroke(0, 0, 255, alpha * 0.4);
      line(b.pos.x - perp.x, b.pos.y - perp.y, b.pos.x - b.vel.x * 3, b.pos.y - b.vel.y * 3);

      // Core lead agent
      stroke(b.color);
      strokeWeight(weight * 1.2);
      let headLen = map(pulse, -1, 1, 5, 20);
      let h = b.vel.copy().setMag(headLen);
      line(b.pos.x, b.pos.y, b.pos.x - h.x, b.pos.y - h.y);
      
      // Bright synchronized core
      stroke(255, 200);
      strokeWeight(weight * 0.7);
      point(b.pos.x, b.pos.y);
    });
  }
}
