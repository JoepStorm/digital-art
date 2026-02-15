// Iteration 1: The Weaver - Connecting nearby stars with ethereal filaments to form constellations
// Iteration 2: The Astronomer - Introducing asymmetric attraction and increased friction to favor stable, crystalline clustering
// Iteration 3: The Cartographer - Orchestrating rhythmic cosmic pulses and subtle gravitational alignment
const numTypes = 5;
const numParticles = 600;
const friction = 0.88; // Slightly increased for smoother, more deliberate movement
const rMax = 140; // Expanded reach to allow constellation structures to bridge gaps
let particles, rules;

// Minimalist palette: ethereal whites, soft ambers, and deep cosmic blues
const colors = ["#ffffff", "#ffccaa", "#aaddff", "#f0f0ff", "#ffeecc"];

function setup() {
  createCanvas(windowWidth, windowHeight);
  initSim();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  initSim();
}

function initSim() {
  // Balanced matrix favoring moderate attraction to create structured clusters without total collapse
  rules = Array.from({ length: numTypes }, () =>
    Array.from({ length: numTypes }, () => random(-0.4, 0.8))
  );
  particles = Array.from({ length: numParticles }, () => ({
    x: random(width),
    y: random(height),
    vx: 0,
    vy: 0,
    type: floor(random(numTypes)),
    pulseOffset: random(TWO_PI) // Unique rhythm for each particle's visual presence
  }));
}

function draw() {
  // Deeper accumulation for a sense of "cosmic dust" and history of movement
  background(4, 5, 12, 18);

  // Pre-calculate pulse phase to avoid redundant math
  let phase = frameCount * 0.05;

  for (let i = 0; i < particles.length; i++) {
    let a = particles[i];
    let fx = 0,
      fy = 0;

    for (let j = 0; j < particles.length; j++) {
      if (i === j) continue;
      let b = particles[j];
      
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      
      // Fast check for distance
      let d2 = dx * dx + dy * dy;
      if (d2 > 0 && d2 < rMax * rMax) {
        let d = sqrt(d2);
        
        let f = 0;
        if (d < 25) {
           f = (d / 25) - 1.2; // Stronger repulsion at short range to keep "stars" distinct
        } else {
           // Smooth influence curve for graceful clustering
           let threshold = 25;
           let influence = (1 - abs(2 * d - (rMax + threshold)) / (rMax - threshold));
           f = rules[a.type][b.type] * influence;
        }
        
        fx += (dx / d) * f;
        fy += (dy / d) * f;
        
        // Filament rendering: only between closely coupled particles
        if (d < 50) {
          let alpha = map(d, 25, 50, 80, 0);
          if (alpha > 0) {
            strokeWeight(0.5);
            // Filaments share the color of the source star, but very dimly
            let col = color(colors[a.type]);
            stroke(red(col), green(col), blue(col), alpha * 0.4);
            line(a.x, a.y, b.x, b.y);
          }
        }
      }
    }
    
    // Applying forces and friction
    a.vx = (a.vx + fx * 0.4) * friction;
    a.vy = (a.vy + fy * 0.4) * friction;
    a.x += a.vx;
    a.y += a.vy;

    // Soft containment: gradual slowing when hitting borders rather than hard bounce
    let margin = 40;
    if (a.x < margin) a.vx += 0.2;
    if (a.x > width - margin) a.vx -= 0.2;
    if (a.y < margin) a.vy += 0.2;
    if (a.y > height - margin) a.vy -= 0.2;
  }

  // Final render pass for the stars themselves
  noStroke();
  for (let p of particles) {
    // Subtle breathing/twinkling effect using per-particle pulse
    let twinkle = sin(phase + p.pulseOffset) * 0.5 + 0.5;
    
    // Core of the star: sharp and bright
    fill(255, 255, 255, 200 + twinkle * 55);
    circle(p.x, p.y, 1.2 + twinkle * 0.8);
    
    // Minimal outer aura
    let c = color(colors[p.type]);
    c.setAlpha(40 + twinkle * 60);
    fill(c);
    circle(p.x, p.y, 4 + twinkle * 2);
  }
}
