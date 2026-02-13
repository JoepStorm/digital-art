// Iteration 1: The Chromatist - Introduced three distinct species with unique colors and color-coded social attraction.
// Iteration 2: The Ethereal Weaver - Added species-specific rhythmic pulsing and predatory cross-species avoidance.
// Iteration 3: The Luminescent Weaver - Added magnetic entanglement where species weave around a central gravitational attractor.
// Iteration 4: The Chromatic Weaver - Introduced species-specific field turbulence that twists the local space.
// Iteration 5: The Ethereal Loom - Introduced spectral chromatic aberration as a trailing halo around each species' movement.
// Iteration 6: The Bioluminescent Synchronizer - Introduced species-specific rhythmic synchronization where agents align their pulsing phases with neighbors.
// Iteration 7: The Gossamer Silk-Weaver - Introduced species-specific memory trails that create a persistent woven tapestry in space.
// Iteration 8: The Prism Weaver - Introduced refraction fields where crossing species' trails create additive interference "shimmer" pools.
// Iteration 9: The Fractal Bloom Weaver - Introduced species-specific radial "blossoming" tails that fan out based on localized velocity variance.
// Iteration 10: The Weaving Alchemist - Added species-specific reactive ribbon fields that thicken and glow when different species interact closely.
// Iteration 11: The Mycelial Alchemist - Added species-specific nutrient "spores" that influence the weaving behavior of the flock.
// Iteration 12: The Stellar Cartographer - Introduced species-specific navigational "constellations" that link nearby agents with delicate, shimmering lines based on harmonic frequency.
// Iteration 13: The Vitreous Glassblower - Added translucent, refracting "shards" that emerge from high-velocity zones to distort the light behind them.
// Iteration 14: The Gossamer Cartographer - Introduced species-specific orbital 'Moons' that draw boids into local gravitational dances, creating elegant swirling nodes.
// Iteration 15: The Chromatic Filamentous - Introduced species-specific electromagnetic "tendrils" that lash out and merge when agents reach peak velocity.
// Iteration 16: The Prismatic Weaver - Introduced species-specific refraction prisms that emerge from slow-moving nodes to bend the light of passing neighbors.
// Iteration 17: The Velvet Weaver - Introduced species-specific silk veils that drape between agents, creating a sense of flowing fabric through space.

const boidsNum = 380;
const maxSpeed = 3.2;
const maxForce = 0.055;
const perception = 65;
let flock;
let spores = [];
let moons = [];

function setup() {
  createCanvas(1600, 900);
  background(0);
  blendMode(SCREEN);
  flock = new Flock();
  for (let i = 0; i < 12; i++) {
    spores.push({
      pos: createVector(random(width), random(height)),
      species: floor(random(3)),
      pulse: random(TWO_PI)
    });
  }
  for (let i = 0; i < 3; i++) {
    moons.push({
      pos: createVector(random(width), random(height)),
      vel: p5.Vector.random2D().mult(1.5),
      species: i,
      phase: random(TWO_PI)
    });
  }
}

function draw() {
  blendMode(BLEND);
  background(0, 15);
  blendMode(SCREEN);
  
  moons.forEach(m => {
    m.pos.add(m.vel);
    if(m.pos.x < 0 || m.pos.x > width) m.vel.x *= -1;
    if(m.pos.y < 0 || m.pos.y > height) m.vel.y *= -1;
    m.phase += 0.05;
    
    let c = flock.boids[0].colors[m.species];
    stroke(red(c), green(c), blue(c), 40);
    strokeWeight(1);
    noFill();
    let r = 50 + sin(m.phase) * 20;
    ellipse(m.pos.x, m.pos.y, r, r);
    let sample = flock.boids.find(b => b.species === m.species);
    if(sample) {
       stroke(red(c), green(c), blue(c), 15);
       line(m.pos.x, m.pos.y, sample.pos.x, sample.pos.y);
    }
  });

  spores.forEach(s => {
    s.pulse += 0.02;
    let sz = 40 + sin(s.pulse) * 20;
    let bIdx = constrain(floor(map(s.species, 0, 2, 0, flock.boids.length-1)), 0, flock.boids.length-1);
    let c = flock.boids[bIdx].colors[s.species];
    noFill();
    stroke(red(c), green(c), blue(c), 15 + sin(s.pulse) * 10);
    strokeWeight(1);
    ellipse(s.pos.x, s.pos.y, sz, sz);
    strokeWeight(0.5);
    ellipse(s.pos.x, s.pos.y, sz * 2, sz * 2);
  });
  
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
      color(255, 30, 80), 
      color(0, 180, 255), 
      color(150, 255, 0)  
    ];
    this.color = this.colors[this.species];
    this.pulseOffset = random(TWO_PI);
    this.history = [];
    this.maxHistory = 18;
    this.localVariance = 0; 
    this.interSpeciesStress = 0;
  }

  steer(boids) {
    let sep = createVector(), ali = createVector(), coh = createVector(), avoid = createVector();
    let n = 0;
    let nAvoid = 0;
    let avgVel = createVector();
    let localStress = 0;

    for (let o of boids) {
      let d = dist(this.pos.x, this.pos.y, o.pos.x, o.pos.y);
      if (o !== this && d < perception) {
        if (o.species === this.species) {
          ali.add(o.vel);
          coh.add(o.pos);
          sep.add(p5.Vector.sub(this.pos, o.pos).div(d));
          avgVel.add(o.vel);
          let diff = o.pulseOffset - this.pulseOffset;
          this.pulseOffset += sin(diff) * 0.05; 
          n++;
          if (abs(sin(this.pulseOffset) - sin(o.pulseOffset)) < 0.1) {
            strokeWeight(0.4);
            stroke(red(this.color), green(this.color), blue(this.color), 30);
            line(this.pos.x, this.pos.y, o.pos.x, o.pos.y);
          }
        } else {
          let repulse = p5.Vector.sub(this.pos, o.pos);
          repulse.rotate(QUARTER_PI);
          avoid.add(repulse.div(d));
          nAvoid++;
          localStress += map(d, 0, perception, 1, 0);
          
          if (o.vel.mag() < maxSpeed * 0.4) {
            let refraction = p5.Vector.sub(this.pos, o.pos);
            refraction.rotate(HALF_PI * 0.5);
            this.acc.add(refraction.setMag(maxForce * 0.8));
          }
        }
      }
    }
    
    let myMoon = moons[this.species];
    let dToMoon = dist(this.pos.x, this.pos.y, myMoon.pos.x, myMoon.pos.y);
    if(dToMoon < 400) {
      let pull = p5.Vector.sub(myMoon.pos, this.pos);
      let swirl = createVector(-pull.y, pull.x).setMag(maxForce * 1.5);
      pull.setMag(maxForce * 0.4);
      this.acc.add(pull);
      this.acc.add(swirl);
    }

    spores.forEach(s => {
      if (s.species === this.species) {
        let d = dist(this.pos.x, this.pos.y, s.pos.x, s.pos.y);
        if (d < 300) {
          let pull = p5.Vector.sub(s.pos, this.pos);
          pull.setMag(maxForce * 0.8);
          this.acc.add(pull);
        }
      }
    });

    this.interSpeciesStress = lerp(this.interSpeciesStress, localStress, 0.1);
    if (n > 0) {
      avgVel.div(n);
      this.localVariance = p5.Vector.angleBetween(this.vel, avgVel);
    }

    const lim = (v, s) => v.limit(s);
    this.acc.add(lim(sep, maxForce).mult(1.7));
    if (nAvoid > 0) this.acc.add(lim(avoid, maxForce * 2.0));
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
    this.acc.add(p5.Vector.fromAngle(twist).mult(maxForce * 0.6));
    orbitForce.setMag(map(distToCenter, 0, width, 0, maxForce));
    this.acc.add(orbitForce);
  }

  update() {
    this.history.push(this.pos.copy());
    if (this.history.length > this.maxHistory) this.history.shift();
    this.vel.add(this.acc).limit(maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
    if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height) this.history = [];
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
      
      // The Velvet Veil: Draw ethereal interconnected meshes between neighbors of the same species
      this.boids.forEach(other => {
        if (other !== b && other.species === b.species) {
          let d = dist(b.pos.x, b.pos.y, other.pos.x, other.pos.y);
          if (d > 20 && d < 65) {
             // Create a "veil" look by drawing a thin gradient mesh line
             stroke(red(b.color), green(b.color), blue(b.color), map(d, 20, 65, 12, 0));
             strokeWeight(0.2);
             let mid = p5.Vector.lerp(b.pos, other.pos, 0.5);
             let off = p5.Vector.sub(b.pos, other.pos).rotate(HALF_PI).setMag(d * 0.1 * pulse);
             noFill();
             beginShape();
             vertex(b.pos.x, b.pos.y);
             quadraticVertex(mid.x + off.x, mid.y + off.y, other.pos.x, other.pos.y);
             endShape();
          }
        }
      });

      if (b.vel.mag() > maxSpeed * 0.85) {
        this.boids.forEach(other => {
          if (other !== b && other.species === b.species && other.vel.mag() > maxSpeed * 0.85) {
            let d = dist(b.pos.x, b.pos.y, other.pos.x, other.pos.y);
            if (d < 100) {
              strokeWeight(0.2);
              stroke(red(b.color), green(b.color), blue(b.color), alpha * 0.1);
              let cp1 = p5.Vector.add(b.pos, p5.Vector.mult(b.vel, 10));
              let cp2 = p5.Vector.add(other.pos, p5.Vector.mult(other.vel, -10));
              bezier(b.pos.x, b.pos.y, cp1.x, cp1.y, cp2.x, cp2.y, other.pos.x, other.pos.y);
            }
          }
        });
      }

      if (b.vel.mag() > maxSpeed * 0.6) {
        push();
        translate(b.pos.x, b.pos.y);
        rotate(b.vel.heading());
        stroke(255, 255, 255, alpha * 0.05);
        fill(red(b.color), green(b.color), blue(b.color), alpha * 0.02);
        strokeWeight(0.5);
        beginShape(); 
        vertex(0, 0);
        vertex(-30-b.vel.mag()*5, -10);
        vertex(-20, 0); 
        vertex(-30-b.vel.mag()*5, 10);
        endShape(CLOSE);
        pop();
      }

      if (b.interSpeciesStress > 0.2) {
        let ribbonWidth = b.interSpeciesStress * 15;
        stroke(red(b.color), green(b.color), blue(b.color), alpha * 0.1);
        strokeWeight(b.interSpeciesStress * 2);
        beginShape();
        for (let i = 0; i < b.history.length; i++) {
          let h = b.history[i];
          let off = p5.Vector.fromAngle(frameCount * 0.1 + i * 0.5).mult(ribbonWidth * 0.5);
          curveVertex(h.x + off.x, h.y + off.y);
        }
        endShape();
      }

      if (b.history.length > 2) {
        let fanCount = floor(map(b.localVariance, 0, PI, 1, 5));
        let fanAngle = map(b.localVariance, 0, PI, 0, PI/3);
        for (let i = 0; i < fanCount; i++) {
          let angleOffset = map(i, 0, fanCount - 1, -fanAngle, fanAngle);
          if (fanCount === 1) angleOffset = 0;
          stroke(red(b.color), green(b.color), blue(b.color), alpha * 0.15);
          strokeWeight(weight * 0.2);
          push();
          translate(b.pos.x, b.pos.y);
          rotate(b.vel.heading() + PI + angleOffset);
          beginShape();
          vertex(0, 0);
          bezierVertex(-20, -10, -40, 10, -15, 0);
          endShape();
          pop();
        }
        stroke(red(b.color), green(b.color), blue(b.color), alpha * 0.3);
        strokeWeight(weight * 0.3);
        beginShape();
        for (let p of b.history) curveVertex(p.x, p.y);
        endShape();
      }

      let perp = p5.Vector.rotate(b.vel, HALF_PI).setMag(weight * 1.5);
      stroke(255, 0, 0, alpha * 0.4);
      line(b.pos.x + perp.x, b.pos.y + perp.y, b.pos.x - b.vel.x * 2.5, b.pos.y - b.vel.y * 2.5);
      stroke(0, 0, 255, alpha * 0.4);
      line(b.pos.x - perp.x, b.pos.y - perp.y, b.pos.x - b.vel.x * 2.5, b.pos.y - b.vel.y * 2.5);

      stroke(b.color);
      strokeWeight(weight * 1.2);
      let headLen = map(pulse, -1, 1, 5, 20);
      let h = b.vel.copy().setMag(headLen);
      line(b.pos.x, b.pos.y, b.pos.x - h.x, b.pos.y - h.y);
