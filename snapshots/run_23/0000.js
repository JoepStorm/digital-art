// Particle Life - emergent behavior from attraction/repulsion rules
// Inspired by Jeffrey Ventrella, Tom Moens

const numTypes = 5;
const numParticles = 500;
const friction = 0.5;
const rMax = 80;
const maxSpeed = 5;
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
  background(0, 20);

  for (let a of particles) {
    let fx = 0,
      fy = 0;
    for (let b of particles) {
      if (a === b) continue;
      let dx = b.x - a.x,
        dy = b.y - a.y;
      let d = sqrt(dx * dx + dy * dy);
      if (d > 0 && d < rMax) {
        let f = rules[a.type][b.type] / d;
        fx += dx * f;
        fy += dy * f;
      }
    }
    a.vx = (a.vx + fx) * friction;
    a.vy = (a.vy + fy) * friction;
    let speed = sqrt(a.vx * a.vx + a.vy * a.vy);
    if (speed > maxSpeed) {
      a.vx = (a.vx / speed) * maxSpeed;
      a.vy = (a.vy / speed) * maxSpeed;
    }
    a.x += a.vx;
    a.y += a.vy;
    if (a.x < 0 || a.x > width) { a.vx *= -1; a.x += a.vx; }
    if (a.y < 0 || a.y > height) { a.vy *= -1; a.y += a.vy; }
  }

  noStroke();
  for (let p of particles) {
    fill(colors[p.type]);
    circle(p.x, p.y, 3);
  }
}
