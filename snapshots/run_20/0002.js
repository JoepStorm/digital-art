// Iteration 1: The Weaver - Connecting nearby stars with ethereal filaments to form constellations
// Iteration 2: The Astronomer - Introducing asymmetric attraction and increased friction to favor stable, crystalline clustering
const numTypes = 5;
const numParticles = 600;
const friction = 0.85; // Increased friction to help particles "settle" into stable geometric structures
const rMax = 120; // Increased range to allow larger influence between distant clusters
let particles, rules;

const colors = ["#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff"];

function setup() {
  createCanvas(windowWidth, windowHeight);
  initSim();
}

function mousePressed() {
  initSim();
}

function initSim() {
  // We specify matrix values that are slightly biased towards attraction (positive) 
  // to encourage the formation of clusters and networks rather than chaotic repulsion.
  rules = Array.from({ length: numTypes }, () =>
    Array.from({ length: numTypes }, () => random(-0.5, 1.2))
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
  // Darker, deeper background for a more minimalist celestial feel
  background(2, 2, 8, 25);

  for (let i = 0; i < particles.length; i++) {
    let a = particles[i];
    let fx = 0,
      fy = 0;
    for (let j = 0; j < particles.length; j++) {
      let b = particles[j];
      if (a === j) continue; // Efficiency optimization: only compare different indices
      
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      
      // Basic distance check
      let d2 = dx * dx + dy * dy;
      if (d2 > 0 && d2 < rMax * rMax) {
        let d = sqrt(d2);
        
        // Compute force: repulsive when very close, attractive/repulsive based on matrix otherwise
        let f = 0;
        if (d < 20) {
           f = (d / 20) - 1; // Core repulsion to prevent overlapping
        } else {
           // Standard particle life interaction
           f = rules[a.type][b.type] * (1 - abs(2 * d - (rMax + 20)) / (rMax - 20));
        }
        
        fx += (dx / d) * f;
        fy += (dy / d) * f;
        
        // Draw constellation lines: minimal, faint, and based on proximity
        if (d < 45) {
          let alpha = map(d, 20, 45, 120, 0);
          if (alpha > 0) {
            strokeWeight(0.7);
            let col = color(colors[a.type]);
            stroke(red(col), green(col), blue(col), alpha);
            line(a.x, a.y, b.x, b.y);
          }
        }
      }
    }
    
    // Applying forces and friction
    a.vx = (a.vx + fx) * friction;
    a.vy = (a.vy + fy) * friction;
    a.x += a.vx;
    a.y += a.vy;

    // Hard wall bounce to prevent particles from flying off screen
    if (a.x < 0) { a.x = 0; a.vx *= -1; }
    else if (a.x > width) { a.x = width; a.vx *= -1; }
    if (a.y < 0) { a.y = 0; a.vy *= -1; }
    else if (a.y > height) { a.y = height; a.vy *= -1; }
  }

  // Render the stars
  noStroke();
  for (let p of particles) {
    // Core of the star
    fill(255);
    circle(p.x, p.y, 1.5);
    // Outer colored glow
    let c = color(colors[p.type]);
    c.setAlpha(150);
    fill(c);
    circle(p.x, p.y, 3);
  }
}
