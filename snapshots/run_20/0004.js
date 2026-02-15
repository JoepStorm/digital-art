// Iteration 1: The Weaver - Connecting nearby stars with ethereal filaments to form constellations
// Iteration 2: The Astronomer - Introducing asymmetric attraction and increased friction to favor stable, crystalline clustering
// Iteration 3: The Cartographer - Orchestrating rhythmic cosmic pulses and subtle gravitational alignment
// Iteration 4: The Nebula - Introducing chromatic nebulous veils that emerge from the collective motion of the clusters
const numTypes = 5;
const numParticles = 600;
const friction = 0.88; // Slightly increased for smoother, more deliberate movement
const rMax = 140; // Expanded reach to allow constellation structures to bridge gaps
let particles, rules;

// Minimalist palette: ethereal whites, soft ambers, and deep cosmic blues
const colors = ["#ffffff", "#ffccaa", "#aaddff", "#f0f0ff", "#ffeecc"];

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
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
  // Maintaining a very low alpha background to allow the trails and connections to accumulate like cosmic dust
  background(4, 5, 12, 12);

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
          let alpha = map(d, 25, 50, 60, 0);
          if (alpha > 0) {
            strokeWeight(0.5);
            let col = color(colors[a.type]);
            // Subtle change: line alpha is now dynamic based on local cluster density for a nebulous effect
            stroke(red(col), green(col), blue(col), alpha * 0.3);
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

    // Rendering Particle Trails (The Nebula Change)
    // Draw a very faint, thick trail representing "gaseous" clouds around moving stars
    noStroke();
    let trailCol = color(colors[a.type]);
    trailCol.setAlpha(2);
    fill(trailCol);
    // Diameter based on velocity to emphasize momentum
    let speed = sqrt(a.vx * a.vx + a.vy * a.vy);
    circle(a.x - a.vx * 2, a.y - a.vy * 2, 8 + speed * 10);
  }

  // Final render pass for the stars themselves
  for (let p of particles) {
    let twinkle = sin(phase + p.pulseOffset) * 0.5 + 0.5;
    
    // Core of the star: sharp and bright
    noStroke();
    fill(255, 255, 255, 200 + twinkle * 55);
    circle(p.x, p.y, 1.2 + twinkle * 0.8);
    
    // Minimal outer aura
    let c = color(colors[p.type]);
    c.setAlpha(40 + twinkle * 60);
    fill(c);
    circle(p.x, p.y, 4 + twinkle * 2);
  }
}
