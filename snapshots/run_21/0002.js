// Iteration 1: The Observer - Quantum superposition and wave-function collapse via opacity fluctuations
// Iteration 2: The Uncertainty Principle - Tunneling and non-local position shifts

const numTypes = 5;
const numParticles = 500;
const friction = 0.5;
const rMax = 80;
const maxSpeed = 5;
let particles, rules;
let quantumMode = true;
let tunnelingMode = true; // Toggle for the user: controls probabilistic position jumps (tunneling)

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
  
  initSim();
}

function mousePressed() {
  if (mouseY > 60) initSim();
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
    phase: random(TWO_PI)
  }));
}

function draw() {
  background(0, 20);

  for (let a of particles) {
    let fx = 0,
      fy = 0;
    for (let b of particles) {
      if (a === b) continue;
      let dx = b.x - a.x,
        dy = b.y - a.y;
      
      // Handle screen wrapping for force calculation to avoid edge artifacts
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
    
    // Position Update
    a.x += a.vx;
    a.y += a.vy;

    // Quantum Tunneling: A small probability to instantly shift position
    // based on the particle's wave phase (High uncertainty/Low observation)
    if (tunnelingMode && random() < 0.001) {
      let angle = random(TWO_PI);
      let hop = random(20, 100);
      a.x += cos(angle) * hop;
      a.y += sin(angle) * hop;
    }

    // Wrap around screen edges (Quantum periodicity)
    if (a.x < 0) a.x += width;
    if (a.x > width) a.x -= width;
    if (a.y < 0) a.y += height;
    if (a.y > height) a.y -= height;
    
    a.phase += speed * 0.1 + 0.02;
  }

  noStroke();
  for (let p of particles) {
    let c = color(colors[p.type]);
    let sz = 3;
    
    if (quantumMode) {
      let wave = sin(p.phase);
      let alpha = map(wave, -1, 1, 20, 255);
      c.setAlpha(alpha);
      sz = 3 + wave * 1.5;
      
      // Ghost image: visualizes the particle's potential density at a slightly offset phase
      if (wave > 0.8) {
        fill(colors[p.type] + "33"); // low opacity
        circle(p.x + p.vx * 2, p.y + p.vy * 2, sz * 2);
      }
    }
    
    fill(c);
    circle(p.x, p.y, sz);
  }
}
