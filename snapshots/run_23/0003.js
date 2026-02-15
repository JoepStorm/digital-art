// Iteration 1: The Weaver - Added an Entropy slider that modulates the attraction rules over time to transition between rigid patterns and fluid chaos.
// Iteration 2: The Weaver - Added a Crystallization toggle that locks particles onto an invisible geometric grid as Entropy decreases, forcing Chaos into Order.
// Iteration 3: The Weaver - Added Harmonic Resonators that create ripples of geometric alignment, pulsating between strict symmetry and chaotic scattering.

const numTypes = 5;
const numParticles = 600;
const friction = 0.5;
const rMax = 100;
const maxSpeed = 5;
let particles, rules, originalRules;
let gui;
let entropySlider;
let crystalToggle;
let resonanceSlider;
let optionsOpen = false;

const colors = ["#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff"];

function setup() {
  createCanvas(windowWidth, windowHeight);
  createInterface();
  initSim();
}

function createInterface() {
  gui = createDiv('').style('position', 'fixed').style('top', '10px').style('left', '10px').style('color', 'white').style('font-family', 'sans-serif').style('background', 'rgba(0,0,0,0.5)').style('padding', '10px').style('border-radius', '5px').style('z-index', '100');
  
  let toggleBtn = createButton('Options ▼').parent(gui).mousePressed(() => {
    optionsOpen = !optionsOpen;
    controls.style('display', optionsOpen ? 'block' : 'none');
    toggleBtn.html(optionsOpen ? 'Options ▲' : 'Options ▼');
  });

  let controls = createDiv('').parent(gui).style('display', 'none').style('margin-top', '10px');
  
  createDiv('Entropy (Order vs Chaos)').parent(controls).style('font-size', '12px');
  entropySlider = createSlider(0, 100, 20).parent(controls).style('width', '150px');
  
  createDiv('Harmonic Resonance').parent(controls).style('font-size', '12px').style('margin-top', '10px');
  resonanceSlider = createSlider(0, 100, 50).parent(controls).style('width', '150px');
  
  let crystalDiv = createDiv('').parent(controls).style('margin-top', '10px');
  crystalToggle = createCheckbox('Crystallization', true).parent(crystalDiv).style('font-size', '12px');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  // Prevent re-init if clicking GUI
  if (mouseX < 200 && mouseY < 200) return;
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
  // Subtle trails that persist longer during low entropy (Order), faster fade during high entropy (Chaos)
  let entropyAmt = entropySlider.value() / 100;
  let resAmt = resonanceSlider.value() / 100;
  background(0, lerp(10, 40, entropyAmt));

  let gridRes = 40; 
  
  // Harmonic Resonance: A pulsating sine wave that influences how "locked" the crystal is
  let wave = sin(frameCount * 0.05 * resAmt) * 0.5 + 0.5;
  let effectiveCrystalStrength = crystalToggle.checked() ? (1 - entropyAmt) * wave : 0;

  for (let a of particles) {
    let fx = 0, fy = 0;
    
    for (let b of particles) {
      if (a === b) continue;
      
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      
      // Basic distance wrapping isn't used for lines but we handle proximity for force
      let d2 = dx * dx + dy * dy;

      if (d2 > 0 && d2 < rMax * rMax) {
        let d = sqrt(d2);
        let baseForce = originalRules[a.type][b.type];
        let chaosForce = (noise(a.type, b.type, frameCount * 0.01) * 2 - 1);
        let activeForce = lerp(baseForce, chaosForce, entropyAmt);
        
        let f = activeForce / d;
        fx += dx * f;
        fy += dy * f;
      }
    }
    
    // Process Crystallization & Harmonic Alignment
    if (crystalToggle.checked()) {
      let targetX = round(a.x / gridRes) * gridRes;
      let targetY = round(a.y / gridRes) * gridRes;
      
      // Pull particles toward the grid based on both Entropy and the Harmonic Resonance wave
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
    
    // Hard boundaries to prevent line stretching across screen
    if (a.x < 0) { a.x = 0; a.vx *= -1; }
    if (a.x > width) { a.x = width; a.vx *= -1; }
    if (a.y < 0) { a.y = 0; a.vy *= -1; }
    if (a.y > height) { a.y = height; a.vy *= -1; }
  }

  // Draw pass
  for (let p of particles) {
    let speed = sqrt(p.vx * p.vx + p.vy * p.vy);
    let col = color(colors[p.type]);
    
    // The "Resonance" adds a visual tethering effect between order and chaos
    if (effectiveCrystalStrength > 0.4) {
      stroke(red(col), green(col), blue(col), effectiveCrystalStrength * 100);
      strokeWeight(0.5);
      // Draw small "tether" lines to their snapped grid position
      let tx = round(p.x / gridRes) * gridRes;
      let ty = round(p.y / gridRes) * gridRes;
      line(p.x, p.y, tx, ty);
    }

    noStroke();
    fill(col);
    
    if (entropyAmt < 0.2 && crystalToggle.checked()) {
      rectMode(CENTER);
      // Rigid geometric bits
      rect(p.x, p.y, 1 + speed * 1.5, 1 + speed * 1.5);
    } else {
      // Fluid organic bits
      circle(p.x, p.y, 2 + speed * 0.5);
    }
  }
}
