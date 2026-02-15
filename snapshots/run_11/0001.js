// Iteration 1: The Chromatist - Introduced three distinct species with unique colors and color-coded social attraction.

const boidsNum = 400;
const maxSpeed = 3;
const maxForce = 0.05;
const perception = 50;
let flock;

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  background(0);
  flock = new Flock();
}

function draw() {
  background(0, 20);
  flock.update();
  flock.draw();
}

class Boid {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = p5.Vector.random2D().mult(maxSpeed);
    this.acc = createVector();
    // Assign a species ID (0, 1, or 2) and a corresponding vibrant color
    this.species = floor(random(3));
    this.colors = [
      color(255, 50, 100, 200), // Neon Pink
      color(50, 200, 255, 200), // Cyan
      color(200, 255, 50, 200)  // Lime
    ];
    this.color = this.colors[this.species];
  }

  steer(boids) {
    let sep = createVector(), ali = createVector(), coh = createVector();
    let n = 0;

    for (let o of boids) {
      let d = dist(this.pos.x, this.pos.y, o.pos.x, o.pos.y);
      if (o !== this && d < perception) {
        // Separation happens regardless of species to prevent crowding
        sep.add(p5.Vector.sub(this.pos, o.pos).div(d));
        
        // Only align with and gravitate towards boids of the same species
        if (o.species === this.species) {
          ali.add(o.vel);
          coh.add(o.pos);
          n++;
        }
      }
    }

    const lim = (v, s) => v.limit(s);
    this.acc.add(lim(sep, maxForce).mult(2.0)); // Stronger separation for clarity

    if (n > 0) {
      this.acc.add(lim(ali.div(n).sub(this.vel), maxForce));
      this.acc.add(lim(coh.div(n).sub(this.pos), maxForce));
    }
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
      stroke(b.color);
      strokeWeight(3);
      // Draw a short trail representing velocity direction
      let t = b.vel.copy().setMag(8);
      line(b.pos.x, b.pos.y, b.pos.x - t.x, b.pos.y - t.y);
    });
  }
}
