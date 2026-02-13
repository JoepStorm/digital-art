// Iteration 1: The Chromatist - Introduced three distinct species with unique colors and color-coded social attraction.
// Iteration 2: The Ethereal Weaver - Added species-specific rhythmic pulsing and predatory cross-species avoidance.
// Iteration 3: The Luminescent Weaver - Added magnetic entanglement where species weave around a central gravitational attractor.

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
  // Deep fading for more ethereal trails
  background(0, 10);
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
    // Each boid has a unique pulse offset based on its life cycle
    this.pulseOffset = random(TWO_PI);
  }

  steer(boids) {
    let sep = createVector(), ali = createVector(), coh = createVector(), avoid = createVector();
    let n = 0;
    let nAvoid = 0;

    for (let o of boids) {
      let d = dist(this.pos.x, this.pos.y, o.pos.x, o.pos.y);
      if (o !== this && d < perception) {
        if (o.species === this.species) {
          // Standard flocking with kin
          ali.add(o.vel);
          coh.add(o.pos);
          sep.add(p5.Vector.sub(this.pos, o.pos).div(d));
          n++;
        } else {
          // Dynamic cross-species interaction: flee from other species
          avoid.add(p5.Vector.sub(this.pos, o.pos).div(d * d));
          nAvoid++;
        }
      }
    }

    const lim = (v, s) => v.limit(s);
    
    // Applying weighted behaviors
    this.acc.add(lim(sep, maxForce).mult(1.5));
    if (nAvoid > 0) {
      this.acc.add(lim(avoid, maxForce * 1.5));
    }
    if (n > 0) {
      this.acc.add(lim(ali.div(n).sub(this.vel), maxForce));
      this.acc.add(lim(coh.div(n).sub(this.pos), maxForce));
    }

    // Centripetal magnetic force: Species orbit the center with different rotational biases
    let center = createVector(width / 2, height / 2);
    let towardCenter = p5.Vector.sub(center, this.pos);
    let distToCenter = towardCenter.mag();
    let orbitForce = towardCenter.copy().rotate(HALF_PI * (this.species === 1 ? -1 : 1));
    orbitForce.setMag(map(distToCenter, 0, width, 0, maxForce * 0.8));
    this.acc.add(orbitForce);
  }

  update() {
    this.vel.add(this.acc).limit(maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
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
    this.boids.forEach(b => {
      // Create a rhythmic breathing effect on the opacity and size
      let pulse = sin(frameCount * 0.1 + b.pulseOffset);
      let alpha = map(pulse, -1, 1, 80, 255);
      let weight = map(pulse, -1, 1, 1, 5);
      
      let c = color(red(b.color), green(b.color), blue(b.color), alpha);
      stroke(c);
      strokeWeight(weight);
      
      // Draw velocity-based strokes that look like silken threads
      let length = map(pulse, -1, 1, 8, 25);
      let t = b.vel.copy().setMag(length);
      line(b.pos.x, b.pos.y, b.pos.x - t.x, b.pos.y - t.y);
      
      // Glint effect: draw a tiny bright core for each head
      stroke(255, alpha * 0.8);
      strokeWeight(weight * 0.5);
      point(b.pos.x, b.pos.y);
    });
  }
}
