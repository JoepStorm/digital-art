// Iteration 1: The Observer - Quantum superposition and wave-function collapse via opacity fluctuations

const numTypes = 5;
const numParticles = 500;
const friction = 0.5;
const rMax = 80;
const maxSpeed = 5;
let particles, rules;
let quantumMode = true; // Toggle for the user: controls wave-like opacity fluctuations

const colors = ["#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff"];

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  
  // Create a toggle for the visual effect
  let toggle = createCheckbox('Quantum Superposition', true);
  toggle.position(10, 10);
  toggle.style('color', '#ffffff');
  toggle.changed(() => { quantumMode = toggle.checked(); });
  
  initSim();
}

function mousePressed() {
  if (mouseY > 40) initSim();
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
    phase: random(TWO_PI) // Initial phase for the probability wave
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
    a.x += a.vx;
    a.y += a.vy;
    if (a.x < 0 || a.x > width) { a.vx *= -1; a.x += a.vx; }
    if (a.y < 0 || a.y > height) { a.vy *= -1; a.y += a.vy; }
    
    // Update local phase based on velocity (de Broglie wavelength analogue)
    a.phase += speed * 0.1 + 0.02;
  }

  noStroke();
  for (let p of particles) {
    let c = color(colors[p.type]);
    if (quantumMode) {
      // Interference pattern effect: opacity fluctuates based on phase
      // This represents the particle 'fading' into a probability wave
      let alpha = map(sin(p.phase), -1, 1, 20, 255);
      c.setAlpha(alpha);
    }
    fill(c);
    
    // Draw particle - size slightly fluctuates with phase to suggest uncertainty
    let sz = quantumMode ? 3 + sin(p.phase) * 1.5 : 3;
    circle(p.x, p.y, sz);
  }
}
