// Boids / Flocking simulation
// Craig Reynolds, 1986

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
  }

  steer(boids) {
    let sep = createVector(), ali = createVector(), coh = createVector();
    let n = 0;

    for (let o of boids) {
      let d = dist(this.pos.x, this.pos.y, o.pos.x, o.pos.y);
      if (o !== this && d < perception) {
        sep.add(p5.Vector.sub(this.pos, o.pos).div(d));
        ali.add(o.vel);
        coh.add(o.pos);
        n++;
      }
    }

    if (n) {
      const lim = (v, s) => v.limit(s);
      this.acc.add(lim(sep.div(n), maxForce).mult(1.5));
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
    stroke(255);
    strokeWeight(2);
    this.boids.forEach(b => {
      let t = b.vel.copy().setMag(6);
      line(b.pos.x, b.pos.y, b.pos.x - t.x, b.pos.y - t.y);
    });
  }
}
