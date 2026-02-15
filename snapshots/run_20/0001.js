// Iteration 1: The Weaver - Connecting nearby stars with ethereal filaments to form constellations
const numTypes = 5;
const numParticles = 500;
const friction = 0.5;
const rMax = 80;
let particles, rules;

const colors = ["#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff"];

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  initSim();
}

function mousePressed() {
  initSim();
}

function initSim() {
  rules = Array.from({ length: numTypes }, () =>
    Array.from({ length: numTypes }, () => random(-1, 1))
  );
  particles = Array.from({ length: numParticles }, () => ({
    x: random(width),
    y: random(height),
    vx: 0,
    vy: 0,
    type: floor(random(numTypes)),
  }));
}

function draw() {
  background(5, 5, 15, 40);

  for (let i = 0; i < particles.length; i++) {
    let a = particles[i];
    let fx = 0,
      fy = 0;
    for (let j = 0; j < particles.length; j++) {
      let b = particles[j];
      if (a === b) continue;
      let dx = b.x - a.x,
        dy = b.y - a.y;
      let d = sqrt(dx * dx + dy * dy);
      if (d > 0 && d < rMax) {
        let f = rules[a.type][b.type] / d;
        fx += dx * f;
        fy += dy * f;
        
        // Draw constellation lines between close particles of the same or sympathetic types
        // Only draw if within a short distance to ensure "local" constellations
        if (d < 35) {
          strokeWeight(0.5);
          let col = color(colors[a.type]);
          col.setAlpha(map(d, 0, 35, 100, 0));
          stroke(col);
          line(a.x, a.y, b.x, b.y);
        }
      }
    }
    a.vx = (a.vx + fx) * friction;
    a.vy = (a.vy + fy) * friction;
    a.x += a.vx;
    a.y += a.vy;
    if (a.x < 0 || a.x > width) { a.vx *= -1; a.x += a.vx; }
    if (a.y < 0 || a.y > height) { a.vy *= -1; a.y += a.vy; }
  }

  noStroke();
  for (let p of particles) {
    fill(colors[p.type]);
    circle(p.x, p.y, 2);
    // Subtle glow
    fill(255, 50);
    circle(p.x, p.y, 1);
  }
}
