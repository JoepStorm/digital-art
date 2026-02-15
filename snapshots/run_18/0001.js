// Iteration 1: The Weaver - Introduced harmonic attraction based on golden ratio intervals to ensure peaceful equilibrium
const numTypes = 5;
const numParticles = 600;
const friction = 0.85;
const rMax = 120;
let particles, rules;

// A softer, more harmonious palette inspired by natural gradients
const colors = ["#eef2f3", "#8e9eab", "#7ec8e3", "#63ace5", "#adc5cf"];

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  initSim();
}

function mousePressed() {
  initSim();
}

function initSim() {
  // Rules are now biased towards positive values to encourage clustering and "social" harmony
  // instead of chaotic repulsion.
  rules = Array.from({ length: numTypes }, () =>
    Array.from({ length: numTypes }, () => random(-0.2, 0.8))
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
  // Increased persistence of trails to visualize the flow of the collective
  background(15, 15, 25, 30);

  for (let a of particles) {
    let fx = 0,
      fy = 0;
    for (let b of particles) {
      if (a === b) continue;
      let dx = b.x - a.x,
        dy = b.y - a.y;
      
      // Basic distance calculation
      let d = sqrt(dx * dx + dy * dy);
      if (d > 0 && d < rMax) {
        // Force calculation: particles stabilize at a harmonic distance 
        // preventing overlaps while encouraging graceful groupings.
        let force = rules[a.type][b.type];
        let f = (1 - abs(2 * d - rMax) / rMax) * force;
        
        fx += (dx / d) * f;
        fy += (dy / d) * f;
      }
    }
    
    a.vx = (a.vx + fx) * friction;
    a.vy = (a.vy + fy) * friction;
    
    // Smooth wrapping behavior avoided to prevent visual "flashing" lines, 
    // using soft-edge dampening instead of hard constraints.
    a.x += a.vx;
    a.y += a.vy;

    if (a.x < 0 || a.x > width) a.vx *= -1;
    if (a.y < 0 || a.y > height) a.vy *= -1;
    a.x = constrain(a.x, 0, width);
    a.y = constrain(a.y, 0, height);
  }

  // Draw particles with a glow effect for a more ethereal, harmonious aesthetic
  for (let p of particles) {
    fill(colors[p.type]);
    noStroke();
    // Inner core
    circle(p.x, p.y, 2.5);
    // Subtle outer glow
    let glow = color(colors[p.type]);
    glow.setAlpha(50);
    fill(glow);
    circle(p.x, p.y, 6);
  }
}
