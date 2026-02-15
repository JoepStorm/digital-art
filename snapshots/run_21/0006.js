// Iteration 1: The Observer - Quantum superposition and wave-function collapse via opacity fluctuations
// Iteration 2: The Uncertainty Principle - Tunneling and non-local position shifts
// Iteration 3: The Weaver - Entanglement links connecting correlated quantum states
// Iteration 4: The Alchemist - Chromatic Decoherence and energy-state transitions
// Iteration 5: The Cosmographer - Probability Density Clouds representing particle wave-function fields
// Iteration 6: The Singularitarian - Spacetime Warping through local gravitational-quantum metric distortion
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
let warpMode = true; // Metric distortion toggle

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
  
  initSim();
}

function mousePressed() {
  if (mouseY > 130) initSim();
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
  background(5, 15); 

  for (let a of particles) {
    let fx = 0,
      fy = 0;
    for (let b of particles) {
      if (a === b) continue;
      let dx = b.x - a.x,
        dy = b.y - a.y;
      
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
    
    a.x += a.vx;
    a.y += a.vy;

    if (tunnelingMode && random() < 0.001) {
      let angle = random(TWO_PI);
      let hop = random(20, 100);
      a.x += cos(angle) * hop;
      a.y += sin(angle) * hop;
    }

    if (a.x < 0) a.x += width;
    if (a.x > width) a.x -= width;
    if (a.y < 0) a.y += height;
    if (a.y > height) a.y -= height;
    
    a.phase += speed * 0.1 + 0.02;
  }

  // Draw Probability Clouds
  if (cloudMode) {
    for (let p of particles) {
        let c = color(colors[p.type]);
        c.setAlpha(map(sin(p.phase), -1, 1, 1, 12));
        fill(c);
        noStroke();
        let cloudR = map(sin(p.phase), -1, 1, 5, 30);
        circle(p.x, p.y, cloudR);
    }
  }

  // Spacetime Warping: Distort the canvas background based on particle density
  if (warpMode) {
    strokeWeight(1);
    for (let i = 0; i < particles.length; i += 12) {
      let p = particles[i];
      let spd = sqrt(p.vx * p.vx + p.vy * p.vy);
      // Create a visual ripple representing local metric expansion/contraction
      noFill();
      let rippleAlpha = map(sin(p.phase * 0.5), -1, 1, 0, 40);
      stroke(255, rippleAlpha);
      let rippleSize = map(spd, 0, maxSpeed, 10, 60);
      ellipse(p.x, p.y, rippleSize, rippleSize * 0.4);
    }
  }

  if (entanglementMode) {
    strokeWeight(0.5);
    for (let i = 0; i < particles.length; i++) {
        let p1 = particles[i];
        for (let j = i + 1; j < i + 15; j++) {
            let p2 = particles[j % particles.length];
            if (p1.type === p2.type) {
                let dx = p1.x - p2.x;
                let dy = p1.y - p2.y;
                if (abs(dx) < width/2 && abs(dy) < height/2) {
                    let d = sqrt(dx*dx + dy*dy);
                    if (d < 50 && abs(sin(p1.phase) - sin(p2.phase)) < 0.2) {
                        let alpha = map(d, 0, 50, 100, 0);
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

  noStroke();
  for (let p of particles) {
    let baseColor = color(colors[p.type]);
    let speed = sqrt(p.vx * p.vx + p.vy * p.vy);
    
    if (decoherenceMode) {
      baseColor = lerpColor(baseColor, color(200, 255, 255), map(speed, 0, maxSpeed, 0, 0.7));
    }
    
    let sz = 3;
    if (quantumMode) {
      let wave = sin(p.phase);
      let alpha = map(wave, -1, 1, 20, 255);
      baseColor.setAlpha(alpha);
      sz = 3 + wave * 1.5;
      
      if (wave > 0.8) {
        let haloColor = color(colors[p.type]);
        haloColor.setAlpha(30);
        fill(haloColor); 
        circle(p.x + p.vx * 2, p.y + p.vy * 2, sz * 2.5);
      }
    } else {
      baseColor.setAlpha(200);
    }
    
    fill(baseColor);
    circle(p.x, p.y, sz);
  }
}
