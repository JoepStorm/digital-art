// Iteration 1: The Weaver - Added an Entropy slider that modulates the attraction rules over time to transition between rigid patterns and fluid chaos.
// Iteration 2: The Weaver - Added a Crystallization toggle that locks particles onto an invisible geometric grid as Entropy decreases, forcing Chaos into Order.

const numTypes = 5;
const numParticles = 600;
const friction = 0.5;
const rMax = 100;
const maxSpeed = 5;
let particles, rules, originalRules;
let gui;
let entropySlider;
let crystalToggle;
let optionsOpen = false;

const colors = ["#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff"];

function setup() {
  createCanvas(windowWidth, windowHeight);
  createInterface();
  initSim();
}

function createInterface() {
  gui = createDiv('').style('position', 'fixed').style('top', '10px').style('left', '10px').style('color', 'white').style('font-family', 'sans-serif').style('background', 'rgba(0,0,0,0.5)').style('padding', '10px').style('border-radius', '5px');
  
  let toggleBtn = createButton('Options ▼').parent(gui).mousePressed(() => {
    optionsOpen = !optionsOpen;
    controls.style('display', optionsOpen ? 'block' : 'none');
    toggleBtn.html(optionsOpen ? 'Options ▲' : 'Options ▼');
  });

  let controls = createDiv('').parent(gui).style('display', 'none').style('margin-top', '10px');
  
  createDiv('Entropy (Order vs Chaos)').parent(controls).style('font-size', '12px');
  entropySlider = createSlider(0, 100, 20).parent(controls).style('width', '150px');
  
  let crystalDiv = createDiv('').parent(controls).style('margin-top', '10px');
  crystalToggle = createCheckbox('Crystallization', true).parent(crystalDiv).style('font-size', '12px');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  if (mouseX > 200 || mouseY > 100) {
    initSim();
  }
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
  // Use a very low alpha for persistent trails, emphasizing the transition from messy movement to rigid structure
  background(0, 20);

  let entropyAmt = entropySlider.value() / 100;
  let gridRes = 40; // Size of the 'Crystal' grid cells
  
  for (let a of particles) {
    let fx = 0, fy = 0;
    
    // Physics interaction loop
    for (let b of particles) {
      if (a === b) continue;
      
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      let d2 = dx * dx + dy * dy;

      if (d2 > 0 && d2 < rMax * rMax) {
        let d = sqrt(d2);
        let baseForce = originalRules[a.type][b.type];
        let chaosForce = noise(a.type, b.type, frameCount * 0.01) * 2 - 1;
        let activeForce = lerp(baseForce, chaosForce, entropyAmt);
        
        // Attraction/Repulsion logic
        let f = activeForce / d;
        fx += dx * f;
        fy += dy * f;
      }
    }
    
    // Artistic Theme: Crystallization
    // When entropy is low and toggle is ON, particles are pulled toward a hexagonal-ish grid
    if (crystalToggle.checked()) {
      let targetX = round(a.x / gridRes) * gridRes;
      let targetY = round(a.y / gridRes) * gridRes;
      // The pull to the grid is inverse to entropy
      let gridPull = (1 - entropyAmt) * 0.15;
      fx += (targetX - a.x) * gridPull;
      fy += (targetY - a.y) * gridPull;
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

  // Draw pass
  noStroke();
  for (let p of particles) {
    let speed = sqrt(p.vx * p.vx + p.vy * p.vy);
    fill(colors[p.type]);
    
    // Order vs Chaos Rendering: 
    // High entropy = blurry/soft, Low entropy = sharp squares/points
    if (entropyAmt < 0.3 && crystalToggle.checked()) {
      rectMode(CENTER);
      rect(p.x, p.y, 2 + speed, 2 + speed);
    } else {
      circle(p.x, p.y, 2 + speed * 0.5);
    }
  }
}
