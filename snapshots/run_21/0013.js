// Iteration 1: The Observer - Quantum superposition and wave-function collapse via opacity fluctuations
// Iteration 2: The Uncertainty Principle - Tunneling and non-local position shifts
// Iteration 3: The Weaver - Entanglement links connecting correlated quantum states
// Iteration 4: The Alchemist - Chromatic Decoherence and energy-state transitions
// Iteration 5: The Cosmographer - Probability Density Clouds representing particle wave-function fields
// Iteration 6: The Singularitarian - Spacetime Warping through local gravitational-quantum metric distortion
// Iteration 7: The Chronon - Temporal Superposition through multi-instance ghosting of past particle states
// Iteration 8: The Harmonicist - Quantum Resonance Grids manifesting as interference patterns in the vacuum
// Iteration 9: The Dirac - Spin-State Ribbon Filaments representing internal angular momentum degrees of freedom
// Iteration 10: The Eigen-state - Quantum Harmonic Fluctuations creating spectral chromatic shifts
// Iteration 11: The Hawking - Event Horizon Hawking-Radiation and pair-production visual effects
// Iteration 12: The Strings - Vibro-Chromic superstring resonance through varying spatial dimensions
// Iteration 13: The Schrödinger - Wave-function collapse gradients and probability amplitude trails
const numTypes = 5;
const numParticles = 400; 
const friction = 0.5;
const rMax = 80;
const maxSpeed = 5;
let particles, rules;
let quantumMode = true;
let tunnelingMode = true;
let entanglementMode = true;
let decoherenceMode = true;
let cloudMode = true;
let warpMode = true;
let temporalMode = true;
let resonanceMode = true;
let spinRibbonMode = true;
let eigenStateMode = true; 
let hawkingMode = true;
let stringsMode = true; 
let waveCollapseMode = true; // New probability amplitude gradient tails

const colors = ["#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff"];

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  
  let qToggle = createCheckbox('Quantum Superposition', true);
  qToggle.position(10, 10);
  qToggle.style('color', '#ffffff');
  qToggle.changed(() => { quantumMode = qToggle.checked(); });

  let tToggle = createCheckbox('Quantum Tunneling', true);
  tToggle.position(10, 30);
  tToggle.style('color', '#ffffff');
  tToggle.changed(() => { tunnelingMode = tToggle.checked(); });

  let eToggle = createCheckbox('Quantum Entanglement', true);
  eToggle.position(10, 50);
  eToggle.style('color', '#ffffff');
  eToggle.changed(() => { entanglementMode = eToggle.checked(); });

  let dToggle = createCheckbox('Chromatic Decoherence', true);
  dToggle.position(10, 70);
  dToggle.style('color', '#ffffff');
  dToggle.changed(() => { decoherenceMode = dToggle.checked(); });

  let cToggle = createCheckbox('Probability Clouds', true);
  cToggle.position(10, 90);
  cToggle.style('color', '#ffffff');
  cToggle.changed(() => { cloudMode = cToggle.checked(); });

  let wToggle = createCheckbox('Spacetime Warping', true);
  wToggle.position(10, 110);
  wToggle.style('color', '#ffffff');
  wToggle.changed(() => { warpMode = wToggle.checked(); });

  let pToggle = createCheckbox('Temporal Superposition', true);
  pToggle.position(10, 130);
  pToggle.style('color', '#ffffff');
  pToggle.changed(() => { temporalMode = pToggle.checked(); });

  let rToggle = createCheckbox('Quantum Resonance Grids', true);
  rToggle.position(10, 150);
  rToggle.style('color', '#ffffff');
  rToggle.changed(() => { resonanceMode = rToggle.checked(); });

  let sToggle = createCheckbox('Spin-State Ribbons', true);
  sToggle.position(10, 170);
  sToggle.style('color', '#ffffff');
  sToggle.changed(() => { spinRibbonMode = sToggle.checked(); });

  let eigToggle = createCheckbox('Eigen-state Shifts', true);
  eigToggle.position(10, 190);
  eigToggle.style('color', '#ffffff');
  eigToggle.changed(() => { eigenStateMode = eigToggle.checked(); });

  let hToggle = createCheckbox('Hawking Radiation', true);
  hToggle.position(10, 210);
  hToggle.style('color', '#ffffff');
  hToggle.changed(() => { hawkingMode = hToggle.checked(); });

  let stToggle = createCheckbox('Vibro-Chromic Strings', true);
  stToggle.position(10, 230);
  stToggle.style('color', '#ffffff');
  stToggle.changed(() => { stringsMode = stToggle.checked(); });

  let wcToggle = createCheckbox('Wave-Function Collapse', true);
  wcToggle.position(10, 250);
  wcToggle.style('color', '#ffffff');
  wcToggle.changed(() => { waveCollapseMode = wcToggle.checked(); });
  
  initSim();
}

function mousePressed() {
  if (mouseY > 270) initSim();
}

function initSim() {
  rules = Array.from({ length: numTypes }, () =>
    Array.from({ length: numTypes }, () => random(-1, 1))
  );
  particles = Array.from({ length: numParticles }, () => ({
    x: random(width),
    y: random(height),
    vx: 0,
    vy: 0,
    type: floor(random(numTypes)),
    phase: random(TWO_PI),
    spin: random(0.01, 0.05) * (random() > 0.5 ? 1 : -1),
    history: [] 
  }));
}

function draw() {
  background(5, 30); 

  if (resonanceMode) {
    let gridSize = 40;
    noStroke();
    for (let x = 0; x < width; x += gridSize) {
      for (let y = 0; y < height; y += gridSize) {
        let interference = 0;
        for (let i = 0; i < particles.length; i += 20) {
          let p = particles[i];
          let dSq = pow(x - p.x, 2) + pow(y - p.y, 2);
          if (dSq < gridSize * gridSize * 16) {
             interference += sin(p.phase - sqrt(dSq) * 0.1);
          }
        }
        if (abs(interference) > 1.5) {
          fill(255, 255, 255, abs(interference) * 2);
          rect(x, y, 1, 1);
        }
      }
    }
  }

  for (let a of particles) {
    let fx = 0, fy = 0;
    for (let b of particles) {
      if (a === b) continue;
      let dx = b.x - a.x, dy = b.y - a.y;
      if (dx > width / 2) dx -= width;
      if (dx < -width / 2) dx += width;
      if (dy > height / 2) dy -= height;
      if (dy < -height / 2) dy += height;

      let d = sqrt(dx * dx + dy * dy);
      if (d > 0 && d < rMax) {
        let f = rules[a.type][b.type] / d;
        fx += dx * f;
        fy += dy * f;
      }
    }
    a.vx = (a.vx + fx) * friction;
    a.vy = (a.vy + fy) * friction;
    let speed = sqrt(a.vx * a.vx + a.vy * a.vy);
    if (speed > maxSpeed) {
      a.vx = (a.vx / speed) * maxSpeed;
      a.vy = (a.vy / speed) * maxSpeed;
    }
    
    if (temporalMode || spinRibbonMode || waveCollapseMode) {
      a.history.push({x: a.x, y: a.y, phase: a.phase});
      if (a.history.length > 15) a.history.shift();
    } else {
      a.history = [];
    }

    a.x += a.vx;
    a.y += a.vy;

    if (tunnelingMode && random() < 0.001) {
      let angle = random(TWO_PI);
      let hop = random(20, 100);
      a.x += cos(angle) * hop;
      a.y += sin(angle) * hop;
      a.history = []; 
    }

    if (a.x < 0) a.x += width;
    if (a.x > width) a.x -= width;
    if (a.y < 0) a.y += height;
    if (a.y > height) a.y -= height;
    
    a.phase += speed * 0.1 + 0.02;

    if (hawkingMode && speed > maxSpeed * 0.95 && random() < 0.05) {
      let angle = atan2(a.vy, a.vx);
      let r = 5 + sin(a.phase) * 5;
      stroke(255, 150);
      strokeWeight(1);
      line(a.x + cos(angle + HALF_PI) * r, a.y + sin(angle + HALF_PI) * r, a.x + cos(angle - HALF_PI) * r, a.y + sin(angle - HALF_PI) * r);
      noStroke();
    }
  }

  if (cloudMode) {
    for (let p of particles) {
        let c = color(colors[p.type]);
        if (eigenStateMode) {
          colorMode(HSB, 360, 100, 100, 1);
          let h = (hue(c) + sin(p.phase * 0.5) * 30) % 360;
          c = color(h, saturation(c), brightness(c));
          colorMode(RGB, 255, 255, 255, 255);
        }
        c.setAlpha(map(sin(p.phase), -1, 1, 1, 10));
        fill(c);
        noStroke();
        let cloudR = map(sin(p.phase), -1, 1, 5, 25);
        circle(p.x, p.y, cloudR);
    }
  }

  if (warpMode) {
    strokeWeight(1);
    for (let i = 0; i < particles.length; i += 15) {
      let p = particles[i];
      let spd = sqrt(p.vx * p.vx + p.vy * p.vy);
      noFill();
      let rippleAlpha = map(sin(p.phase * 0.5), -1, 1, 0, 30);
      stroke(255, rippleAlpha);
      let rippleSize = map(spd, 0, maxSpeed, 10, 50);
      ellipse(p.x, p.y, rippleSize, rippleSize * 0.4);
    }
  }

  if (entanglementMode) {
    strokeWeight(0.5);
    for (let i = 0; i < particles.length; i++) {
        let p1 = particles[i];
        for (let j = i + 1; j < i + 12; j++) {
            let p2 = particles[j % particles.length];
            if (p1.type === p2.type) {
                let dx = p1.x - p2.x, dy = p1.y - p2.y;
                if (abs(dx) < width/2 && abs(dy) < height/2) {
                    let d = sqrt(dx*dx + dy*dy);
                    if (d < 40 && abs(sin(p1.phase) - sin(p2.phase)) < 0.25) {
                        let alpha = map(d, 0, 40, 80, 0);
                        let c = color(colors[p1.type]);
                        if (decoherenceMode) {
                          let spd = sqrt(p1.vx * p1.vx + p1.vy * p1.vy);
                          c = lerpColor(c, color(255), spd / maxSpeed);
                        }
                        c.setAlpha(alpha);
                        stroke(c);
                        line(p1.x, p1.y, p2.x, p2.y);
                    }
                }
            }
        }
    }
  }

  for (let p of particles) {
    let speed = sqrt(p.vx * p.vx + p.vy * p.vy);
    let baseColor = color(colors[p.type]);

    if (eigenStateMode) {
      colorMode(HSB, 360, 100, 100, 1);
      let h = (hue(baseColor) + sin(p.phase) * 20) % 360;
      baseColor = color(h, saturation(baseColor), 80 + sin(p.phase)*20);
      colorMode(RGB, 255, 255, 255, 255);
    }
    
    if (stringsMode) {
        let harmonic = sin(p.phase * 4);
        let jitterX = cos(p.phase * 8) * 4 * (speed/maxSpeed);
        let jitterY = sin(p.phase * 8) * 4 * (speed/maxSpeed);
        stroke(255, 50 * abs(harmonic));
        strokeWeight(0.5);
        line(p.x, p.y, p.x + jitterX, p.y + jitterY);
    }

    // Wave-Function Collapse Gradients: Smoothly colored probability amplitude tails
    if (waveCollapseMode && p.history.length > 1) {
      noFill();
      beginShape();
      for (let i = 0; i < p.history.length - 1; i++) {
        let h1 = p.history[i];
        let h2 = p.history[i+1];
        if (dist(h1.x, h1.y, h2.x, h2.y) < 50) { 
          let intensity = i / p.history.length;
          let gradColor = lerpColor(color(0, 0, 0, 0), baseColor, intensity);
          stroke(gradColor);
          strokeWeight(intensity * 4);
          line(h1.x, h1.y, h2.x, h2.y);
        }
      }
      endShape();
    }

    if (spinRibbonMode && p.history.length > 2) {
      noFill();
      strokeWeight(0.8);
      let ribbonColor = color(baseColor);
      if (decoherenceMode) ribbonColor = lerpColor(ribbonColor, color(255), speed/maxSpeed);
      
      beginShape();
      for (let i = 0; i < p.history.length; i++) {
        let h = p.history[i];
        let spinOffset = sin(p.phase + i * 0.8) * 6;
        let perpX = -p.vy / (speed + 0.1);
        let perpY = p.vx / (speed + 0.1);
        ribbonColor.setAlpha(map(i, 0, p.history.length, 0, 100));
        stroke(ribbonColor);
        vertex(h.x + perpX * spinOffset, h.y + perpY * spinOffset);
      }
      endShape();
    }

    if (temporalMode && p.history.length > 0) {
      for (let i = 0; i < p.history.length; i++) {
        let h = p.history[i];
        let hColor = color(baseColor);
        let hAlpha = map(i, 0, p.history.length, 2, 40);
        hColor.setAlpha(hAlpha * map(sin(h.phase), -1, 1, 0.2, 1));
        fill(hColor);
        noStroke();
        circle(h.x, h.y, 2);
      }
    }

    if (decoherenceMode) {
      baseColor = lerpColor(baseColor, color(200, 255, 255, alpha(baseColor)), map(speed, 0, maxSpeed, 0, 0.7));
    }
    
    let sz = 3;
    if (quantumMode) {
      let wave = sin(p.phase);
      let alphaVal = map(wave, -1, 1, 20, 255);
      baseColor.setAlpha(alphaVal);
      sz = 3 + wave * 1.5;
      
      if (wave > 0.8) {
        let haloColor = color(baseColor);
        haloColor.setAlpha(30);
        fill(haloColor);
        circle(p.x + p.vx * 1.5, p.y + p.vy * 1.5, sz * 2.2);
      }