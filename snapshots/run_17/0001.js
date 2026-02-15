// Iteration 1: The Weaver - Introduced harmonic color blending and soft connectivity lines to evoke a sense of unified movement
const numTypes = 5;
const numParticles = 500;
const friction = 0.5;
const rMax = 80;
let particles, rules;

// Harmony-focused palettes: soft, interconnected hues
const colors = ["#88c0d0", "#81a1c1", "#5e81ac", "#b48ead", "#a3be8c"];

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
  background(15, 15, 25, 40); // Deep indigo fade for soft trails

  for (let a of particles) {
    let fx = 0,
      fy = 0;
    for (let b of particles) {
      if (a === b) continue;
      let dx = b.x - a.x,
        dy = b.y - a.y;
      
      // Toroidal distance check
      if (dx > width / 2) dx -= width;
      if (dx < -width / 2) dx += width;
      if (dy > height / 2) dy -= height;
      if (dy < -height / 2) dy += height;
      
      let d = sqrt(dx * dx + dy * dy);
      if (d > 0 && d < rMax) {
        let f = rules[a.type][b.type] / d;
        fx += dx * f;
        fy += dy * f;

        // Visual change: Draw soft "harmonic" connections between particles of the same type
        // Only if they are close and not crossing the screen boundary to avoid visual flickering
        if (a.type === b.type && d < rMax * 0.5 && Math.abs(b.x - a.x) < width/2 && Math.abs(b.y - a.y) < height/2) {
            stroke(colors[a.type] + "22"); // Very transparent stroke
            strokeWeight(1);
            line(a.x, a.y, b.x, b.y);
        }
      }
    }
    a.vx = (a.vx + fx) * friction;
    a.vy = (a.vy + fy) * friction;
    a.x = (a.x + a.vx + width) % width;
    a.y = (a.y + a.vy + height) % height;
  }

  noStroke();
  for (let p of particles) {
    fill(colors[p.type]);
    // Glow effect: double drawing circles with different opacities
    fill(colors[p.type] + "66");
    circle(p.x, p.y, 6);
    fill(colors[p.type]);
    circle(p.x, p.y, 2);
  }
}
