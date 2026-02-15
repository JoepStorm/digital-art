// Iteration 1: The Weaver - Connecting nearby nodes of the same species into rhythmic graph structures
const numTypes = 5;
const numParticles = 500;
const friction = 0.5;
const rMax = 80;
const maxSpeed = 5;
let particles, rules;

const colors = ["#ff4444", "#44ff44", "#4444ff", "#ffff44", "#ff44ff"];

let optionsContainer;
let connectivityToggle;

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  
  // Create UI options menu
  optionsContainer = createDiv('').style('position', 'absolute').style('top', '10px').style('left', '10px').style('color', 'white');
  let details = createElement('details').parent(optionsContainer);
  createElement('summary', 'options').parent(details).style('cursor', 'pointer').style('background', 'rgba(0,0,0,0.5)').style('padding', '5px');
  let content = createDiv('').parent(details).style('background', 'rgba(0,0,0,0.5)').style('padding', '10px');
  
  connectivityToggle = createCheckbox('Show Graph Structures', true).parent(content);
  
  initSim();
}

function mousePressed() {
  // Only re-init if not clicking the UI
  if (mouseX > 150 || mouseY > 100) {
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
  }));
}

function draw() {
  background(0, 40);

  for (let a of particles) {
    let fx = 0,
      fy = 0;
    for (let b of particles) {
      if (a === b) continue;
      
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      
      // Basic distance for simulation physics
      let d = sqrt(dx * dx + dy * dy);
      if (d > 0 && d < rMax) {
        let f = rules[a.type][b.type] / d;
        fx += dx * f;
        fy += dy * f;
        
        // ARTISTIC ADDITION: Draw graph connections if enabled
        // Only connect if same type and within connection range to form species-based clusters
        // Avoid connecting across edges (though this sim uses walls, good practice)
        if (connectivityToggle.checked() && a.type === b.type && d < rMax * 0.6) {
          stroke(colors[a.type] + "44"); // Low alpha for webs
          strokeWeight(1);
          line(a.x, a.y, b.x, b.y);
        }
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
    
    // Boundary collision with bounce
    if (a.x < 0) { a.x = 0; a.vx *= -1; }
    if (a.x > width) { a.x = width; a.vx *= -1; }
    if (a.y < 0) { a.y = 0; a.vy *= -1; }
    if (a.y > height) { a.y = height; a.vy *= -1; }
  }

  // Render nodes
  noStroke();
  for (let p of particles) {
    fill(colors[p.type]);
    circle(p.x, p.y, 4);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
