// Iteration 1: The Weaver - Introduced harmonic attraction based on golden ratio intervals to ensure peaceful equilibrium
// Iteration 2: The Eolian - Introduced thread-like connection lines between same-type neighbors to visualize the hidden harmonic resonance
// Iteration 3: The Luthier - Introduced resonant tonal pulses to the filament network, allowing connections to vibrate with collective energy
// Iteration 4: The Chord - Introduced delicate, translucent spectral webs between neighboring different-type clusters to unify the composition into a single harmonic chord
// Iteration 5: The Conductor - Introduced a global harmonic attractor that gently guides particles towards a central focal point, creating a unified flow
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

  // Time-based phase for atmospheric pulsing effects
  let pulsePhase = frameCount * 0.05;
  
  // The Conductor's influence: a central gravitational point that pulses slowly
  let centerX = width / 2 + cos(pulsePhase * 0.2) * (width * 0.1);
  let centerY = height / 2 + sin(pulsePhase * 0.2) * (height * 0.1);

  // First pass: Calculate physics and interactions
  for (let a of particles) {
    let fx = 0,
      fy = 0;
      
    // Global Harmony: A gentle pull towards the center to create a sense of unified purpose
    let gdx = centerX - a.x;
    let gdy = centerY - a.y;
    let gd = sqrt(gdx * gdx + gdy * gdy);
    let gForce = 0.0003 * (1 + sin(pulsePhase)); // Strength pulses with the rhythm
    fx += gdx * gForce;
    fy += gdy * gForce;

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

        // Visual resonance based on particle relationships
        if (d < rMax * 0.4) {
          let resonance = sin(pulsePhase + (a.x + a.y) * 0.01) * 2;
          
          if (a.type === b.type) {
            // Intratype connections: Filaments that vibrate
            strokeWeight(0.3 + resonance * 0.1);
            let strokeCol = color(colors[a.type]);
            strokeCol.setAlpha(map(d, 0, rMax * 0.4, 150, 0));
            stroke(strokeCol);
            
            let mx = (a.x + b.x) / 2 + (resonance * dy/d);
            let my = (a.y + b.y) / 2 - (resonance * dx/d);
            noFill();
            beginShape();
            vertex(a.x, a.y);
            quadraticVertex(mx, my, b.x, b.y);
            endShape();
          } else if (frameCount % 2 === 0) {
            // Intertype connections: Translucent "webs" that unify different types into a chord
            strokeWeight(0.1);
            let c1 = color(colors[a.type]);
            let c2 = color(colors[b.type]);
            let blend = lerpColor(c1, c2, 0.5);
            blend.setAlpha(map(d, 0, rMax * 0.4, 40, 0));
            stroke(blend);
            line(a.x, a.y, b.x, b.y);
          }
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
    let baseCol = color(colors[p.type]);
    
    // Core responds to movement speed, glowing brighter when finding its place
    let speed = sqrt(p.vx * p.vx + p.vy * p.vy);
    let brightness = map(speed, 0, 2, 200, 255);
    fill(red(baseCol), green(baseCol), blue(baseCol), brightness);
    circle(p.x, p.y, 2.8);
    
    // Subtle outer glow pulsing with the background resonance
    let glow = color(colors[p.type]);
    glow.setAlpha(20 + sin(pulsePhase + p.type) * 15);
    fill(glow);
    circle(p.x, p.y, 10 + speed * 3);
  }
}
