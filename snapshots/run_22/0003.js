// Iteration 1: The Weaver - Connecting nearby nodes of the same species into rhythmic graph structures
// Iteration 2: The Graph Pulse - Animating connection weights based on the local density and age of structures
// Iteration 3: The Graph Cartographer - Visualizing gravitational field lines between dominant cluster nodes
const numTypes = 5;
const numParticles = 600;
const friction = 0.6;
const rMax = 100;
const maxSpeed = 5;
let particles, rules;

const colors = ["#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff"];

let optionsContainer;
let connectivityToggle;
let pulsateToggle;
let fieldLineToggle;

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  
  // Create UI options menu
  optionsContainer = createDiv('').style('position', 'absolute').style('top', '10px').style('left', '10px').style('color', 'white').style('z-index', '100');
  let details = createElement('details').parent(optionsContainer);
  createElement('summary', 'options').parent(details).style('cursor', 'pointer').style('background', 'rgba(0,0,0,0.5)').style('padding', '5px').style('user-select', 'none');
  let content = createDiv('').parent(details).style('background', 'rgba(0,0,0,0.5)').style('padding', '10px');
  
  connectivityToggle = createCheckbox('Show Graph Structures', true).parent(content);
  pulsateToggle = createCheckbox('Animate Pulse Energy', true).parent(content);
  fieldLineToggle = createCheckbox('Draw Field Projections', true).parent(content);
  
  initSim();
}

function mousePressed() {
  if (mouseX > 200 || mouseY > 150) {
    initSim();
  }
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
    neighbors: 0
  }));
}

function draw() {
  background(0, 35); 

  // Simulation step
  for (let a of particles) {
    let fx = 0, fy = 0;
    let neighborCount = 0;

    for (let b of particles) {
      if (a === b) continue;
      
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      
      let d2 = dx * dx + dy * dy;
      if (d2 > 0 && d2 < rMax * rMax) {
        let d = sqrt(d2);
        let f = rules[a.type][b.type] / d;
        fx += dx * f;
        fy += dy * f;
        
        if (a.type === b.type) {
            neighborCount++;
            
            if (connectivityToggle.checked() && d < rMax * 0.7) {
              let alpha = 60;
              let weight = 1;
              
              if (pulsateToggle.checked()) {
                let wave = sin(frameCount * 0.1 - d * 0.05);
                alpha = map(wave, -1, 1, 20, 120);
                weight = map(wave, -1, 1, 0.5, 2);
              }

              stroke(colors[a.type] + hex(floor(alpha), 2));
              strokeWeight(weight);
              line(a.x, a.y, b.x, b.y);
            }
        }
      }
    }
    
    a.neighbors = neighborCount;
    a.vx = (a.vx + fx) * friction;
    a.vy = (a.vy + fy) * friction;
    
    let speedSq = a.vx * a.vx + a.vy * a.vy;
    if (speedSq > maxSpeed * maxSpeed) {
      let speed = sqrt(speedSq);
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

  // Draw Field Projections: Project lines from large clusters towards far-away potential mates or rival structures
  if (fieldLineToggle.checked()) {
    noFill();
    for (let i = 0; i < particles.length; i += 12) { // Sample subset for performance
      let a = particles[i];
      if (a.neighbors > 10) { // Only 'hub' nodes project field lines
        for (let j = 0; j < particles.length; j += 40) {
          let b = particles[j];
          if (a.type !== b.type && b.neighbors > 5) {
            let d = dist(a.x, a.y, b.x, b.y);
            if (d > rMax && d < rMax * 3) {
              // Draw a faint bezier or arc towards the other cluster
              stroke(colors[a.type] + "11");
              strokeWeight(0.5);
              // Use neighbor count to influence curvature
              let cx = (a.x + b.x) / 2 + sin(frameCount * 0.02) * 50;
              let cy = (a.y + b.y) / 2 + cos(frameCount * 0.02) * 50;
              noFill();
              bezier(a.x, a.y, cx, cy, cx, cy, b.x, b.y);
            }
          }
        }
      }
    }
  }

  // Render nodes
  noStroke();
  for (let p of particles) {
    let baseSize = 3;
    let clusterScale = pulsateToggle.checked() ? map(p.neighbors, 0, 15, 1, 3, true) : 1;
    fill(colors[p.type]);
    circle(p.x, p.y, baseSize * clusterScale);
    
    if (p.neighbors > 8) {
        fill(colors[p.type] + "33");
        circle(p.x, p.y, baseSize * clusterScale * 2.5);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
