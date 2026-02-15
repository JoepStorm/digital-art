// Iteration 1: The Weaver - Added an Entropy slider that modulates the attraction rules over time to transition between rigid patterns and fluid chaos.
// Iteration 2: The Weaver - Added a Crystallization toggle that locks particles onto an invisible geometric grid as Entropy decreases, forcing Chaos into Order.
// Iteration 3: The Weaver - Added Harmonic Resonators that create ripples of geometric alignment, pulsating between strict symmetry and chaotic scattering.
// Iteration 4: The Weaver - Added Entropy Entanglement where particles of the same type create ephemeral webs, bridging Order and Chaos through shared geometry.
// Iteration 5: The Weaver - Added Temporal Symmetry, creating mirror-image ghosts of particles that reflect the balance between ordered reflection and chaotic divergence.
// Iteration 6: The Weaver - Added Gravitational Wells, localized attractors that pulse between pulling matter into dense singularities and repulsing it into chaotic voids.
const numTypes = 5;
const numParticles = 600;
const friction = 0.5;
const rMax = 100;
const maxSpeed = 5;
let particles, rules, originalRules;
let gui;
let entropySlider, resonanceSlider, gravitationalSlider;
let crystalToggle, entanglementToggle, symmetryToggle, gravityToggle;
let optionsOpen = false;

const colors = ["#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff"];

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  createInterface();
  initSim();
}

function createInterface() {
  gui = createDiv('').style('position', 'fixed').style('top', '10px').style('left', '10px').style('color', 'white').style('font-family', 'sans-serif').style('background', 'rgba(0,0,0,0.6)').style('padding', '10px').style('border-radius', '5px').style('z-index', '100');
  
  let toggleBtn = createButton('Options ▼').parent(gui).mousePressed(() => {
    optionsOpen = !optionsOpen;
    controls.style('display', optionsOpen ? 'block' : 'none');
    toggleBtn.html(optionsOpen ? 'Options ▲' : 'Options ▼');
  });

  let controls = createDiv('').parent(gui).style('display', 'none').style('margin-top', '10px');
  
  createDiv('Entropy (Order vs Chaos)').parent(controls).style('font-size', '11px');
  entropySlider = createSlider(0, 100, 20).parent(controls).style('width', '150px');
  
  createDiv('Harmonic Resonance').parent(controls).style('font-size', '11px').style('margin-top', '8px');
  resonanceSlider = createSlider(0, 100, 50).parent(controls).style('width', '150px');

  createDiv('Singularity Power').parent(controls).style('font-size', '11px').style('margin-top', '8px');
  gravitationalSlider = createSlider(0, 100, 40).parent(controls).style('width', '150px');
  
  let crystalDiv = createDiv('').parent(controls).style('margin-top', '8px');
  crystalToggle = createCheckbox('Crystallization', true).parent(crystalDiv).style('font-size', '11px');

  let entangleDiv = createDiv('').parent(controls).style('margin-top', '4px');
  entanglementToggle = createCheckbox('Entanglement Webs', true).parent(entangleDiv).style('font-size', '11px');

  let symmetryDiv = createDiv('').parent(controls).style('margin-top', '4px');
  symmetryToggle = createCheckbox('Temporal Symmetry', true).parent(symmetryDiv).style('font-size', '11px');

  let gravityDiv = createDiv('').parent(controls).style('margin-top', '4px');
  gravityToggle = createCheckbox('Gravitational Wells', true).parent(gravityDiv).style('font-size', '11px');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  if (mouseX < 250 && mouseY < 250) return;
  initSim();
}

function initSim() {
  originalRules = Array.from({ length: numTypes }, () =>
    Array.from({ length: numTypes }, () => random(-1, 1))
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
  let entropyAmt = entropySlider.value() / 100;
  let resAmt = resonanceSlider.value() / 100;
  let gravAmt = gravitationalSlider.value() / 100;
  background(0, lerp(15, 60, entropyAmt));

  let gridRes = 40; 
  let wave = sin(frameCount * 0.05 * resAmt) * 0.5 + 0.5;
  let pulse = sin(frameCount * 0.02) * 0.5 + 0.5;
  let effectiveCrystalStrength = crystalToggle.checked() ? (1 - entropyAmt) * wave : 0;

  // Gravitational Wells are fixed points that exert force
  let wells = [
    {x: width * 0.25, y: height * 0.25},
    {x: width * 0.75, y: height * 0.25},
    {x: width * 0.25, y: height * 0.75},
    {x: width * 0.75, y: height * 0.75}
  ];

  for (let a of particles) {
    let fx = 0, fy = 0;
    
    // Standard Particle Life logic
    for (let b of particles) {
      if (a === b) continue;
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let d2 = dx * dx + dy * dy;

      if (d2 > 0 && d2 < rMax * rMax) {
        let d = sqrt(d2);
        let baseForce = originalRules[a.type][b.type];
        let chaosForce = (noise(a.type, b.type, frameCount * 0.01) * 2 - 1);
        let activeForce = lerp(baseForce, chaosForce, entropyAmt);
        
        let f = activeForce / d;
        fx += dx * f;
        fy += dy * f;

        if (entanglementToggle.checked() && a.type === b.type && d < rMax * 0.6) {
          strokeWeight(lerp(0.8, 0.1, entropyAmt));
          let c = color(colors[a.type]);
          stroke(red(c), green(c), blue(c), (1 - entropyAmt) * 80 * wave);
          line(a.x, a.y, b.x, b.y);
          if(symmetryToggle.checked() && entropyAmt < 0.7) {
            line(width - a.x, height - a.y, width - b.x, height - b.y);
          }
        }
      }
    }
    
    // Gravitational Wells: Transition from Pull (Order/Low Entropy) to Push (Chaos/High Entropy)
    if (gravityToggle.checked()) {
      for (let w of wells) {
        let dx = w.x - a.x;
        let dy = w.y - a.y;
        let d = sqrt(dx * dx + dy * dy);
        if (d > 5 && d < 300) {
          // Pull when entropy is low, Repulse when entropy is high
          let gForce = (1 - entropyAmt * 2) * gravAmt * pulse * 5 / d;
          fx += dx * gForce;
          fy += dy * gForce;
        }
      }
    }

    if (crystalToggle.checked()) {
      let targetX = round(a.x / gridRes) * gridRes;
      let targetY = round(a.y / gridRes) * gridRes;
      let pullStrength = effectiveCrystalStrength * 0.25;
      fx += (targetX - a.x) * pullStrength;
      fy += (targetY - a.y) * pullStrength;
    }
    
    a.vx = (a.vx + fx) * friction;
    a.vy = (a.vy + fy) * friction;
    
    let speed = sqrt(a.vx * a.vx + a.vy * a.vy);
    if (speed > maxSpeed) {
      a.vx = (a.vx / speed) * maxSpeed;
      a.vy = (a.vy / speed) * maxSpeed;
    }
    
    a.x += a.vx;
    a.y += a.vy;
    
    if (a.x < 0) { a.x = 0; a.vx *= -1; }
    if (a.x > width) { a.x = width; a.vx *= -1; }
    if (a.y < 0) { a.y = 0; a.vy *= -1; }
    if (a.y > height) { a.y = height; a.vy *= -1; }
  }

  // Visualizing the wells if active
  if(gravityToggle.checked()) {
    noFill();
    for(let w of wells) {
      stroke(255, 255, 255, 15 * pulse * gravAmt);
      ellipse(w.x, w.y, pulse * 100 * gravAmt);
    }
  }

  for (let p of particles) {
    let speed = sqrt(p.vx * p.vx + p.vy * p.vy);
    let col = color(colors[p.type]);
    
    if (effectiveCrystalStrength > 0.4) {
      stroke(red(col), green(col), blue(col), effectiveCrystalStrength * 70);
      strokeWeight(0.5);
      let tx = round(p.x / gridRes) * gridRes;
      let ty = round(p.y / gridRes) * gridRes;
      line(p.x, p.y, tx, ty);
    }

    noStroke();
    fill(col);
    
    if (entropyAmt < 0.2 && crystalToggle.checked()) {
      rectMode(CENTER);
      rect(p.x, p.y, 1 + speed * 1.5, 1 + speed * 1.5);
    } else {
      circle(p.x, p.y, 2 + speed * 0.5);
    }

    if(symmetryToggle.checked()){
      let symAlpha = lerp(150, 20, entropyAmt);
      let offsetX = noise(p.x, frameCount * 0.01) * 20 * entropyAmt;
      let offsetY = noise(p.y, frameCount * 0.01) * 20 * entropyAmt;
      fill(red(col), green(col), blue(col), symAlpha);
      let sx = width - p.x + offsetX;
      let sy = height - p.y + offsetY;
      if (entropyAmt < 0.2 && crystalToggle.checked()) {
        rect(sx, sy, 1 + speed * 1.5, 1 + speed * 1.5);
      } else {
        circle(sx, sy, 2 + speed * 0.5);
      }
    }
  }
}
