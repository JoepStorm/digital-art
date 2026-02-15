// Iteration 1: The Bio-Architect - Adding physical size, dynamic color, and metabolic growth/decay cycles
const boidsNum = 150;
const perception = 60;
let flock;

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  colorMode(HSB, 255);
  background(0);
  flock = new Flock();
}

function draw() {
  background(0, 30);
  flock.update();
  flock.draw();
  
  // Spontaneously spawn tiny new boids to keep the ecosystem alive
  if (frameCount % 10 === 0 && flock.boids.length < 250) {
    flock.boids.push(new Boid(random(width), random(height), random(2, 4)));
  }
}

class Boid {
  constructor(x, y, size) {
    this.pos = createVector(x || random(width), y || random(height));
    this.vel = p5.Vector.random2D().mult(random(2, 4));
    this.acc = createVector();
    this.mass = size || random(3, 7);
    this.color = color(random(255), 180, 255);
    this.maxForce = 0.1;
  }

  // Metabolism and Interaction logic
  interact(boids) {
    let sep = createVector(), ali = createVector(), coh = createVector();
    let n = 0;

    for (let i = boids.length - 1; i >= 0; i--) {
      let o = boids[i];
      if (o === this) continue;
      
      let d = dist(this.pos.x, this.pos.y, o.pos.x, o.pos.y);
      
      // Consumption Logic: Larger boids eat smaller ones
      if (o.mass < this.mass * 0.8 && d < this.mass) {
        this.mass += o.mass * 0.2;
        // Blend colors upon consumption
        this.color = lerpColor(this.color, o.color, 0.2);
        boids.splice(i, 1);
        continue;
      }

      if (d < perception) {
        sep.add(p5.Vector.sub(this.pos, o.pos).div(d));
        ali.add(o.vel);
        coh.add(o.pos);
        n++;
      }
    }

    if (n) {
      this.acc.add(sep.div(n).setMag(this.maxForce * 1.5));
      this.acc.add(p5.Vector.sub(ali.div(n), this.vel).limit(this.maxForce));
      this.acc.add(p5.Vector.sub(coh.div(n), this.pos).limit(this.maxForce));
    }
  }

  update() {
    // Large boids move slower
    let speedLimit = map(this.mass, 2, 20, 5, 1.5, true);
    this.vel.add(this.acc).limit(speedLimit);
    this.pos.add(this.vel);
    this.acc.mult(0);
    
    // Metabolic decay: lose mass over time
    this.mass -= 0.005;
    
    // Cell Division: if too large, split into two
    if (this.mass > 25) {
      this.mass /= 2;
      flock.boids.push(new Boid(this.pos.x + 5, this.pos.y + 5, this.mass));
    }

    // Screen wrap
    this.pos.x = (this.pos.x + width) % width;
    this.pos.y = (this.pos.y + height) % height;
  }

  isDead() {
    return this.mass < 1.5;
  }
}

class Flock {
  constructor() {
    this.boids = Array(boidsNum).fill().map(() => new Boid());
  }

  update() {
    // Update backwards to safely remove boids that die or are eaten
    for (let i = this.boids.length - 1; i >= 0; i--) {
      let b = this.boids[i];
      b.interact(this.boids);
      b.update();
      if (b.isDead()) {
        this.boids.splice(i, 1);
      }
    }
  }

  draw() {
    noStroke();
    this.boids.forEach(b => {
      fill(b.color);
      // Visual representation is a glowy circle proportional to mass
      ellipse(b.pos.x, b.pos.y, b.mass, b.mass);
      // Small directional tail
      stroke(b.color);
      strokeWeight(1);
      let t = b.vel.copy().setMag(b.mass);
      line(b.pos.x, b.pos.y, b.pos.x - t.x, b.pos.y - t.y);
      noStroke();
    });
  }
}
