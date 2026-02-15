// Iteration 1: The Weaver of Light - Initializing the pristine state of the simulation
// Iteration 2: The Glimmering Alchemist - Adding glittering trails and variable point intensity for a sparkling effect
// Iteration 3: The Star-Dust Sculptor - Adding chromatic glow and distance-based luminance for deeper sparkling textures

const numTypes = 5;
const numParticles = 800;
const friction = 0.85;
const rMax = 100;
let particles, rules;

const colors = ["#ff5577", "#55ffcc", "#77aaff", "#ffff99", "#ffccff"];

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  // Using screen blend mode to make overlapping particles glow more intensely
  blendMode(SCREEN);
  initSim();
}

function mousePressed() {
  initSim();
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
  // Use clear() and then a dark rectangle to handle blendMode correctly with trails
  blendMode(BLEND);
  background(5, 25);
  blendMode(SCREEN);

  for (let a of particles) {
    let fx = 0,
      fy = 0;
    for (let b of particles) {
      if (a === b) continue;
      let dx = b.x - a.x,
        dy = b.y - a.y;
      
      let d2 = dx * dx + dy * dy;
      if (d2 > 0 && d2 < rMax * rMax) {
        let d = sqrt(d2);
        let f = rules[a.type][b.type] / d;
        fx += dx * f;
        fy += dy * f;
      }
    }
    
    a.vx = (a.vx + fx) * friction;
    a.vy = (a.vy + fy) * friction;
    a.x += a.vx;
    a.y += a.vy;
    
    if (a.x < 0 || a.x > width) { a.vx *= -1; a.x = constrain(a.x, 0, width); }
    if (a.y < 0 || a.y > height) { a.vy *= -1; a.y = constrain(a.y, 0, height); }
  }

  noStroke();
  for (let p of particles) {
    // Determine speed to influence brightness - faster particles "flare"
    let speed = sqrt(p.vx * p.vx + p.vy * p.vy);
    let sparkle = random(100, 200) + (speed * 20);
    
    let c = color(colors[p.type]);
    
    // Draw a larger, very faint outer glow
    fill(red(c), green(c), blue(c), sparkle * 0.2);
    circle(p.x, p.y, random(6, 10));
    
    // Draw the bright sharp core
    fill(red(c), green(c), blue(c), sparkle);
    let sz = random(1.5, 3.5);
    circle(p.x, p.y, sz);
    
    // Occasional "diffraction spike" for extra sparkle
    if(random() > 0.98) {
        fill(255, sparkle);
        rect(p.x - 4, p.y, 8, 0.5);
        rect(p.x, p.y - 4, 0.5, 8);
    }
  }
}
