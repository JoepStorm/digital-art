// Iteration 1: The Weaver - Added an Entropy slider that modulates the attraction rules over time to transition between rigid patterns and fluid chaos.

const numTypes = 5;
const numParticles = 600;
const friction = 0.5;
const rMax = 100;
const maxSpeed = 5;
let particles, rules, originalRules;
let gui;
let entropySlider;
let optionsOpen = false;

const colors = ["#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff"];

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  createInterface();
  initSim();
}

function createInterface() {
  // Container for the options toggle
  gui = createDiv('').style('position', 'fixed').style('top', '10px').style('left', '10px').style('color', 'white').style('font-family', 'sans-serif').style('background', 'rgba(0,0,0,0.5)').style('padding', '10px').style('border-radius', '5px');
  
  let toggleBtn = createButton('Options ▼').parent(gui).mousePressed(() => {
    optionsOpen = !optionsOpen;
    controls.style('display', optionsOpen ? 'block' : 'none');
    toggleBtn.html(optionsOpen ? 'Options ▲' : 'Options ▼');
  });

  let controls = createDiv('').parent(gui).style('display', 'none').style('margin-top', '10px');
  
  createDiv('Entropy (Order vs Chaos)').parent(controls).style('font-size', '12px');
  entropySlider = createSlider(0, 100, 20).parent(controls).style('width', '150px');
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  // Only reset if not clicking the GUI
  if (mouseX > 200 || mouseY > 100) {
    initSim();
  }
}

function initSim() {
  // originalRules stores the "Order" - the base DNA of this simulation run
  originalRules = Array.from({ length: numTypes }, () =>
    Array.from({ length: numTypes }, () => random(-1, 1))
  );
  
  // Current active rules
  rules = JSON.parse(JSON.stringify(originalRules));

  particles = Array.from({ length: numParticles }, () => ({
    x: random(width),
    y: random(height),
    vx: 0,
    vy: 0,
    type: floor(random(numTypes)),
  }));
}

function draw() {
  background(0, 30);

  // Artistic Theme: Order vs Chaos
  // High entropy introduces per-frame noise and drift to the physical laws (rules)
  let entropyAmt = entropySlider.value() / 100;
  
  for (let a of particles) {
    let fx = 0,
      fy = 0;
    for (let b of particles) {
      if (a === b) continue;
      
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      
      // Basic distance check
      let d2 = dx * dx + dy * dy;
      if (d2 > 0 && d2 < rMax * rMax) {
        let d = sqrt(d2);
        
        // Use the original fixed rules vs chaotic fluctuations
        let baseForce = originalRules[a.type][b.type];
        let chaosForce = noise(a.type, b.type, frameCount * 0.01) * 2 - 1;
        let activeForce = lerp(baseForce, chaosForce, entropyAmt);
        
        let f = activeForce / d;
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
    
    a.x += a.vx;
    a.y += a.vy;
    
    // Bounds handling with slight bounce
    if (a.x < 0) { a.x = 0; a.vx *= -1; }
    if (a.x > width) { a.x = width; a.vx *= -1; }
    if (a.y < 0) { a.y = 0; a.vy *= -1; }
    if (a.y > height) { a.y = height; a.vy *= -1; }
  }

  // Draw particles with a slight glow based on speed
  noStroke();
  for (let p of particles) {
    let speed = sqrt(p.vx * p.vx + p.vy * p.vy);
    fill(colors[p.type]);
    // Faster particles appear slightly larger/stretched
    circle(p.x, p.y, 2 + speed * 0.5);
  }
}
