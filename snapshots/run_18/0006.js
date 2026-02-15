// Iteration 1: The Weaver - Introduced harmonic attraction based on golden ratio intervals to ensure peaceful equilibrium
// Iteration 2: The Eolian - Introduced thread-like connection lines between same-type neighbors to visualize the hidden harmonic resonance
// Iteration 3: The Luthier - Introduced resonant tonal pulses to the filament network, allowing connections to vibrate with collective energy
// Iteration 4: The Chord - Introduced delicate, translucent spectral webs between neighboring different-type clusters to unify the composition into a single harmonic chord
// Iteration 5: The Conductor - Introduced a global harmonic attractor that gently guides particles towards a central focal point, creating a unified flow
// Iteration 6: The Organist - Introduced harmonic spatial blurring through resonant halos that expand based on proximity to the central attractor
const numTypes = 5;
const numParticles = 600;
const friction = 0.85;
const rMax = 120;
let particles, rules;

const colors = ["#eef2f3", "#8e9eab", "#7ec8e3", "#63ace5", "#adc5cf"];

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  initSim();
}

function mousePressed() {
  initSim();
}

function initSim() {
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
  background(15, 15, 25, 45);

  let pulsePhase = frameCount * 0.05;
  
  let centerX = width / 2 + cos(pulsePhase * 0.2) * (width * 0.1);
  let centerY = height / 2 + sin(pulsePhase * 0.2) * (height * 0.1);

  for (let a of particles) {
    let fx = 0,
      fy = 0;
      
    let gdx = centerX - a.x;
    let gdy = centerY - a.y;
    let gd = sqrt(gdx * gdx + gdy * gdy);
    let gForce = 0.0003 * (1 + sin(pulsePhase));
    fx += gdx * gForce;
    fy += gdy * gForce;

    for (let b of particles) {
      if (a === b) continue;
      let dx = b.x - a.x,
        dy = b.y - a.y;
      
      let d = sqrt(dx * dx + dy * dy);
      if (d > 0 && d < rMax) {
        let force = rules[a.type][b.type];
        let f = (1 - abs(2 * d - rMax) / rMax) * force;
        
        fx += (dx / d) * f;
        fy += (dy / d) * f;

        if (d < rMax * 0.4) {
          let resonance = sin(pulsePhase + (a.x + a.y) * 0.01) * 2;
          
          if (a.type === b.type) {
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

    if (a.x < 0 || a.x > width) { a.vx *= -1; a.x = constrain(a.x, 0, width); }
    if (a.y < 0 || a.y > height) { a.vy *= -1; a.y = constrain(a.y, 0, height); }
  }

  // Draw particles with an atmospheric expansion based on their proximity to the center
  for (let p of particles) {
    noStroke();
    let baseCol = color(colors[p.type]);
    let distFromCenter = dist(p.x, p.y, centerX, centerY);
    
    // The "Organist" effect: particles closer to the harmonic center create larger, softer halos
    // simulating a sense of spatial depth and resonant vibration.
    let resonanceSize = map(distFromCenter, 0, width, 50, 2);
    let speed = sqrt(p.vx * p.vx + p.vy * p.vy);
    
    // Core
    let brightness = map(speed, 0, 2, 200, 255);
    fill(red(baseCol), green(baseCol), blue(baseCol), brightness);
    circle(p.x, p.y, 2.5);
    
    // Resonant Halo
    let haloAlpha = map(distFromCenter, 0, width/2, 40, 5);
    let haloColor = color(colors[p.type]);
    haloColor.setAlpha(haloAlpha);
    fill(haloColor);
    // Breath-like growth of the halo
    let breath = (1 + sin(pulsePhase + p.x * 0.01)) * (resonanceSize * 0.5);
    circle(p.x, p.y, resonanceSize + breath);
    
    // Small fast glow
    let glow = color(colors[p.type]);
    glow.setAlpha(30);
    circle(p.x, p.y, 8 + speed * 4);
  }
}
