// Iteration 1: The Weaver - Introduced harmonic color blending and soft connectivity lines to evoke a sense of unified movement
// Iteration 2: The Resonator - Introduced symmetric attraction and gentle orbital paths to foster a state of equilibrium and communal flow
// Iteration 3: The Lyrist - Introduced resonant cross-cluster chords by drawing threads between distant particles of the same type to visualize global harmony
// Iteration 4: The Aeolian - Introduced breathing clusters where particles gently expand and contract in synchronized radial pulses to the rhythm of a global sine wave
// Iteration 5: The Monochord - Introduced golden-ratio based pitch shifts that modulate particle repulsion, creating resonant spatial intervals
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
  background(10, 12, 20, 20); // Slightly more transparency for longer trails

  // Global rhythm for the "breathing" effect
  let breath = sin(frameCount * 0.02) * 0.5 + 0.5;
  // Golden ratio shift to influence spatial harmony
  let phi = 1.618;

  // Group particles by type to facilitate global "chords" or threads
  let groups = Array.from({ length: numTypes }, () => []);

  for (let a of particles) {
    groups[a.type].push(a);
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
        
        // Force calculation modulated by the global 'breath' for harmonic expansion/contraction
        let harmonicScale = lerp(0.8, 1.2, breath);
        let currentRMax = rMax * harmonicScale;
        
        // The Monochord addition: Modulate the "pure repulsion" threshold (0.3) by the golden ratio 
        // per particle type to create varied spatial "intervals" between different species
        let pitchShift = (a.type * phi) % 0.5;
        let repulsionThreshold = (0.2 + pitchShift) * currentRMax;
        
        let f = (d < repulsionThreshold) ? (d / repulsionThreshold - 1) : rules[a.type][b.type] * (1 - abs(2 * d - currentRMax - repulsionThreshold) / (currentRMax - repulsionThreshold));
        
        fx += (dx / d) * f * interactionStrength;
        fy += (dy / d) * f * interactionStrength;

        // Visual change: Subtle 'tendrils' connect particles moving in sympathetic resonance
        if (d < currentRMax * 0.4 && abs(dx) < width/2 && abs(dy) < height/2) {
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

  // Draw "Harmonic Chords": long, vertical/horizontal threads between same-colored clusters
  strokeWeight(0.2);
  for(let i = 0; i < numTypes; i++) {
    stroke(colors[i] + "08");
    for(let j = 0; j < groups[i].length - 1; j += 15) {
        let p1 = groups[i][j];
        let p2 = groups[i][(j + 1) % groups[i].length];
        // Connection threshold relaxed to allow more persistent structural lines
        if(abs(p1.x - p2.x) < 8 || abs(p1.y - p2.y) < 8) {
           line(p1.x, p1.y, p2.x, p2.y);
        }
    }
  }

  noStroke();
  for (let p of particles) {
    // Pulse size synchronized with the breathing force rhythm
    let pulseSize = 2 * breath;
    fill(colors[p.type] + "33");
    circle(p.x, p.y, 8 + pulseSize);
    fill(colors[p.type] + "aa");
    circle(p.x, p.y, 3 + pulseSize/2);
    // Core of the particle glows slightly based on its harmonic position (breath)
    fill(255, 180 + (breath * 75));
    circle(p.x, p.y, 1);
  }
}
