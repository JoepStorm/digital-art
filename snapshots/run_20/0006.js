// Iteration 1: The Weaver - Connecting nearby stars with ethereal filaments to form constellations
// Iteration 2: The Astronomer - Introducing asymmetric attraction and increased friction to favor stable, crystalline clustering
// Iteration 3: The Cartographer - Orchestrating rhythmic cosmic pulses and subtle gravitational alignment
// Iteration 4: The Nebula - Introducing chromatic nebulous veils that emerge from the collective motion of the clusters
// Iteration 5: The Cosmographer - Synthesizing geometric geometry from local star alignment to reveal hidden constellations
// Iteration 6: The Glass-Blower - Infusing particles with high-tension surface forces to form delicate, crystalline filaments
const numTypes = 5;
const numParticles = 600;
const friction = 0.92; // Retaining velocity for longer to encourage sweeping, curved structures
const rMax = 120; // Focused interaction radius
let particles, rules;

// Minimalist celestial palette
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
  // Asymmetric matrix favoring specific pairings to create "chain" structures rather than blobs
  rules = Array.from({ length: numTypes }, () =>
    Array.from({ length: numTypes }, () => random(-0.3, 0.7))
  );
  particles = Array.from({ length: numParticles }, () => ({
    x: random(width),
    y: random(height),
    vx: 0,
    vy: 0,
    type: floor(random(numTypes)),
    pulseOffset: random(TWO_PI)
  }));
}

function draw() {
  // Darker, more consistent void to emphasize the brightness of the "glass" threads
  background(2, 3, 8, 20);

  let phase = frameCount * 0.04;

  for (let i = 0; i < particles.length; i++) {
    let a = particles[i];
    let fx = 0, fy = 0;
    
    let nearest = null;
    let minDist = Infinity;

    for (let j = 0; j < particles.length; j++) {
      if (i === j) continue;
      let b = particles[j];
      
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let d2 = dx * dx + dy * dy;

      if (d2 < rMax * rMax) {
        let d = sqrt(d2);
        
        // Physics logic: Force curve shifted to encourage specific spacing (the "bond" length)
        let f = 0;
        if (d < 20) {
           f = (d / 20) - 1.5; // Strong repulsion to prevent overlap
        } else {
           let influence = (1 - abs(2 * d - (rMax + 20)) / (rMax - 20));
           f = rules[a.type][b.type] * influence;
        }
        
        fx += (dx / d) * f;
        fy += (dy / d) * f;
        
        if (d < minDist) {
          minDist = d;
          nearest = b;
        }
      }
    }
    
    // The Glass-Blower's Change: Filamental Tension
    // Draws sharp, fading lines to the nearest neighbor if they are within bond-range
    // This creates an etched-glass or "star-map" aesthetic rather than soft nebulae.
    if (nearest && minDist < 35) {
      strokeWeight(0.8);
      let strokeCol = color(colors[a.type]);
      strokeCol.setAlpha(120 * (1 - minDist / 35));
      stroke(strokeCol);
      line(a.x, a.y, nearest.x, nearest.y);
    }
    
    // Movement with soft boundary bounce instead of hard margin forces
    a.vx = (a.vx + fx * 0.35) * friction;
    a.vy = (a.vy + fy * 0.35) * friction;
    a.x += a.vx;
    a.y += a.vy;

    // Wrap around logic for seamless celestial flow
    if (a.x < 0) a.x = width;
    if (a.x > width) a.x = 0;
    if (a.y < 0) a.y = height;
    if (a.y > height) a.y = 0;
  }

  // Render stars as sharp prisms
  for (let p of particles) {
    let twinkle = sin(phase + p.pulseOffset) * 0.5 + 0.5;
    noStroke();
    
    // Core of the star
    fill(255, 255, 255, 180 + twinkle * 75);
    circle(p.x, p.y, 1.5);
    
    // Chromatic aura
    let c = color(colors[p.type]);
    c.setAlpha(30 + twinkle * 40);
    fill(c);
    circle(p.x, p.y, 5 + twinkle * 3);
  }
}
