// Iteration 1: The Bio-Architect - Adding physical size, dynamic color, and metabolic growth/decay cycles
// Iteration 2: The Ethereal Animator - Adding luminous trails and pulsating predator-prey bioluminescence
// Iteration 3: The Chromatic Weaver - Adding spectral refraction and adaptive chromatic aberration to trails
// Iteration 4: The Kinetic Sculptor - Introducing gravitational vortex pulling and spatial distortion trails
// Iteration 5: The Lattice Architect - Introducing spatial structure through grid-based energy filaments
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
  // Low alpha background for trail accumulation
  background(0, 15);
  
  // Draw an underlying energy lattice that reacts to boid density
  drawGrid();
  
  flock.update();
  flock.draw();
  
  if (frameCount % 10 === 0 && flock.boids.length < 250) {
    let edgeX = random(1) > 0.5 ? 0 : width;
    let edgeY = random(height);
    flock.boids.push(new Boid(edgeX, edgeY, random(2.5, 4.5)));
  }
}

function drawGrid() {
  // A subtle geometric structure that vibrates as boids pass through its nodes
  let spacing = 100;
  strokeWeight(0.5);
  for (let x = 0; x <= width; x += spacing) {
    stroke(frameCount % 255, 100, 50, 40);
    line(x, 0, x, height);
  }
  for (let y = 0; y <= height; y += spacing) {
    stroke((frameCount + 120) % 255, 100, 50, 40);
    line(0, y, width, y);
  }
}

class Boid {
  constructor(x, y, size) {
    this.pos = createVector(x || random(width), y || random(height));
    this.vel = p5.Vector.random2D().mult(random(2, 4));
    this.acc = createVector();
    this.mass = size || random(3, 7);
    this.hue = random(255);
    this.color = color(this.hue, 180, 255);
    this.maxForce = 0.12;
    this.history = []; 
  }

  interact(boids) {
    let sep = createVector(), ali = createVector(), coh = createVector();
    let n = 0;

    for (let i = boids.length - 1; i >= 0; i--) {
      let o = boids[i];
      if (o === this) continue;
      
      let d = dist(this.pos.x, this.pos.y, o.pos.x, o.pos.y);
      
      if (o.mass < this.mass * 0.8 && d < (this.mass + o.mass) * 0.6) {
        this.mass += o.mass * 0.25;
        this.hue = lerp(this.hue, o.hue, 0.3);
        this.color = color(this.hue, 180, 255);
        boids.splice(i, 1);
        continue;
      }

      if (d < perception) {
        let weight = (this.mass < o.mass) ? 2.5 : 1.0; 
        sep.add(p5.Vector.sub(this.pos, o.pos).div(d * d).mult(weight));
        ali.add(o.vel);
        coh.add(o.pos);
        
        if (this.mass > o.mass * 2) {
            let orbit = p5.Vector.sub(o.pos, this.pos);
            orbit.rotate(HALF_PI); 
            o.acc.add(orbit.setMag(this.mass * 0.02));
        }

        n++;
      }
    }

    if (n) {
      this.acc.add(sep.div(n).setMag(this.maxForce * 2));
      this.acc.add(p5.Vector.sub(ali.div(n), this.vel).limit(this.maxForce));
      this.acc.add(p5.Vector.sub(coh.div(n), this.pos).limit(this.maxForce));
    }
    
    // Grid alignment: Boids are slightly attracted to the nearest grid intersection
    let gridSnap = 100;
    let targetX = round(this.pos.x / gridSnap) * gridSnap;
    let targetY = round(this.pos.y / gridSnap) * gridSnap;
    let toGrid = createVector(targetX - this.pos.x, targetY - this.pos.y);
    if (toGrid.mag() < 30) {
      this.acc.add(toGrid.setMag(0.015)); // Gentle tug towards the "lattice"
    }
  }

  update() {
    this.history.push(this.pos.copy());
    if (this.history.length > 12) this.history.shift();

    let speedLimit = map(this.mass, 2, 25, 6, 1.2, true);
    this.vel.add(this.acc).limit(speedLimit);
    this.pos.add(this.vel);
    this.acc.mult(0);
    
    this.mass -= 0.004 + (this.mass * 0.0002);
    
    if (this.mass > 28) {
      this.mass *= 0.45;
      let offspring = new Boid(this.pos.x + random(-5, 5), this.pos.y + random(-5, 5), this.mass);
      offspring.hue = (this.hue + 10) % 255;
      flock.boids.push(offspring);
    }

    this.pos.x = (this.pos.x + width) % width;
    this.pos.y = (this.pos.y + height) % height;
  }

  isDead() {
    return this.mass < 1.2;
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
      if (b.isDead()) {
        this.boids.splice(i, 1);
      }
    }
  }

  draw() {
    this.boids.forEach(b => {
      let aberration = b.vel.mag() * 0.8;
      noFill();
      
      for (let offsetArr of [[-aberration, 5], [aberration, -5], [0, 0]]) {
        let hShift = offsetArr[0];
        strokeWeight(b.mass * 0.4);
        beginShape();
        for(let i = 0; i < b.history.length; i++) {
          let alpha = map(i, 0, b.history.length, 0, 180);
          stroke((b.hue + hShift + 255) % 255, 180, 255, alpha);
          vertex(b.history[i].x + offsetArr[0], b.history[i].y + offsetArr[1]);
        }
        endShape();
      }

      noStroke();
      let pulse = sin(frameCount * 0.1) * (b.mass * 0.15);
      fill(b.hue, 200, 255, 200);
      
      push();
      translate(b.pos.x, b.pos.y);
      rotate(b.vel.heading());
      ellipse(0, 0, (b.mass + pulse) * 1.5, b.mass + pulse);
      fill(255, 150);
      ellipse(b.mass * 0.2, 0, b.mass * 0.4, b.mass * 0.4);
      pop();
    });
  }
}
