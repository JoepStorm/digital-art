// Iteration 1: The Weaver - Introduced harmonic color blending and soft connectivity lines to evoke a sense of unified movement
// Iteration 2: The Resonator - Introduced symmetric attraction and gentle orbital paths to foster a state of equilibrium and communal flow
const numTypes = 5;
const numParticles = 600;
const friction = 0.85; // Increased friction for smoother, more deliberate movement
const rMax = 120; // Increased radius for wider influence
const interactionStrength = 0.15;
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
  // Symmetric rules create "harmonic" pairs where particles tend to orbit or travel together
  rules = Array.from({ length: numTypes }, () => new Float32Array(numTypes));
  for (let i = 0; i < numTypes; i++) {
    for (let j = 0; j <= i; j++) {
      let force = random(-1, 1);
      rules[i][j] = force;
      rules[j][i] = force; // Ensure interaction is mutual and balanced
    }
  }
  
  particles = Array.from({ length: numParticles }, () => ({
    x: random(width),
    y: random(height),
    vx: 0,
    vy: 0,
    type: floor(random(numTypes)),
  }));
}

function draw() {
  background(10, 12, 20, 25); // Darker, smoother trails

  for (let a of particles) {
    let fx = 0,
      fy = 0;
    for (let b of particles) {
      if (a === b) continue;
      let dx = b.x - a.x,
        dy = b.y - a.y;
      
      // Toroidal distance check
      if (dx > width / 2) dx -= width;
      else if (dx < -width / 2) dx += width;
      if (dy > height / 2) dy -= height;
      else if (dy < -height / 2) dy += height;
      
      let d2 = dx * dx + dy * dy;
      if (d2 > 0 && d2 < rMax * rMax) {
        let d = sqrt(d2);
        // Force calculation: attraction/repulsion based on rule and distance
        // Added a "sweet spot" at 30% of rMax to prevent total collapse
        let f = (d < rMax * 0.3) ? (d / (rMax * 0.3) - 1) : rules[a.type][b.type] * (1 - abs(2 * d - rMax - rMax * 0.3) / (rMax - rMax * 0.3));
        
        fx += (dx / d) * f * interactionStrength;
        fy += (dy / d) * f * interactionStrength;

        // Visual change: Subtle 'tendrils' connect particles moving in sympathetic resonance
        if (d < rMax * 0.4 && abs(dx) < width/2 && abs(dy) < height/2) {
            strokeWeight(0.5);
            stroke(colors[a.type] + "11");
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
    // Render particles as soft pulses of light
    fill(colors[p.type] + "33");
    circle(p.x, p.y, 8);
    fill(colors[p.type] + "aa");
    circle(p.x, p.y, 3);
    fill(255, 180); // Core of inner light
    circle(p.x, p.y, 1);
  }
}
