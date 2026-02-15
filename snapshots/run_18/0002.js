// Iteration 1: The Weaver - Introduced harmonic attraction based on golden ratio intervals to ensure peaceful equilibrium
// Iteration 2: The Eolian - Introduced thread-like connection lines between same-type neighbors to visualize the hidden harmonic resonance
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
  background(15, 15, 25, 45);

  // First pass: Calculate physics and interactions
  for (let a of particles) {
    let fx = 0,
      fy = 0;
    for (let b of particles) {
      if (a === b) continue;
      let dx = b.x - a.x,
        dy = b.y - a.y;
      
      let d = sqrt(dx * dx + dy * dy);
      if (d > 0 && d < rMax) {
        // Force calculation: particles stabilize at a harmonic distance 
        let force = rules[a.type][b.type];
        let f = (1 - abs(2 * d - rMax) / rMax) * force;
        
        fx += (dx / d) * f;
        fy += (dy / d) * f;

        // Visual change: Draw delicate filaments between particles of the same type 
        // when they reach a state of proximity, emphasizing the theme of Harmony.
        if (a.type === b.type && d < rMax * 0.4) {
          strokeWeight(0.5);
          let strokeCol = color(colors[a.type]);
          strokeCol.setAlpha(map(d, 0, rMax * 0.4, 100, 0));
          stroke(strokeCol);
          line(a.x, a.y, b.x, b.y);
        }
      }
    }
    
    a.vx = (a.vx + fx) * friction;
    a.vy = (a.vy + fy) * friction;
    
    a.x += a.vx;
    a.y += a.vy;

    // Bounce off edges to maintain structure within the frame
    if (a.x < 0 || a.x > width) { a.vx *= -1; a.x = constrain(a.x, 0, width); }
    if (a.y < 0 || a.y > height) { a.vy *= -1; a.y = constrain(a.y, 0, height); }
  }

  // Draw particles with a glow effect for a more ethereal, harmonious aesthetic
  for (let p of particles) {
    noStroke();
    fill(colors[p.type]);
    // Inner core
    circle(p.x, p.y, 2.5);
    // Subtle outer glow
    let glow = color(colors[p.type]);
    glow.setAlpha(40);
    fill(glow);
    circle(p.x, p.y, 7);
  }
}
