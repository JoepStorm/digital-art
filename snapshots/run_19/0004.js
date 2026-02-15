// Iteration 1: The Weaver of Light - Initializing the pristine state of the simulation
// Iteration 2: The Glimmering Alchemist - Adding glittering trails and variable point intensity for a sparkling effect
// Iteration 3: The Star-Dust Sculptor - Adding chromatic glow and distance-based luminance for deeper sparkling textures
// Iteration 4: The Prismatic Jeweler - Distorting refractive boundaries to create shimmering spectral arcs

const numTypes = 5;
const numParticles = 800;
const friction = 0.85;
const rMax = 100;
let particles, rules;

// Enhanced palette with high-contrast jewel tones
const colors = ["#ff3366", "#00ffcc", "#4488ff", "#ffff33", "#ff66ff"];

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  blendMode(SCREEN);
  initSim();
}

function mousePressed() {
  initSim();
}

function initSim() {
  // Balanced rules to encourage stringing and swirling rather than clumping
  rules = Array.from({ length: numTypes }, () =>
    Array.from({ length: numTypes }, () => random(-0.8, 0.8))
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
  blendMode(BLEND);
  background(2, 18); // Darker, cleaner trails
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
        // Softened force curve for smoother movement
        let force = d < rMax * 0.4 ? (d / (rMax * 0.4) - 1) : rules[a.type][b.type] * (1 - abs(d - rMax * 0.7) / (rMax * 0.3));
        let f = force / d;
        fx += dx * f;
        fy += dy * f;
      }
    }
    
    a.vx = (a.vx + fx) * friction;
    a.vy = (a.vy + fy) * friction;
    a.x += a.vx;
    a.y += a.vy;
    
    // Bounce with a small energy loss
    if (a.x < 0 || a.x > width) { a.vx *= -0.5; a.x = constrain(a.x, 0, width); }
    if (a.y < 0 || a.y > height) { a.vy *= -0.5; a.y = constrain(a.y, 0, height); }
  }

  noStroke();
  for (let p of particles) {
    let speed = sqrt(p.vx * p.vx + p.vy * p.vy);
    let c = color(colors[p.type]);
    let baseAlpha = map(speed, 0, 5, 100, 255);
    
    // Prismatic displacement: draw three slightly offset color components for a "chromatic aberration" sparkle
    let offset = speed * 0.5;
    
    // Red Channel Offset
    fill(255, 50, 50, baseAlpha * 0.3);
    circle(p.x - offset, p.y - offset, 2.5);
    
    // Blue Channel Offset
    fill(50, 50, 255, baseAlpha * 0.3);
    circle(p.x + offset, p.y + offset, 2.5);

    // Primary Core
    fill(red(c), green(c), blue(c), baseAlpha);
    let sz = random(1.5, 3);
    circle(p.x, p.y, sz);
    
    // Glint effect: Tiny white specks that pop in and out
    if(random() > 0.99) {
        fill(255, 255);
        circle(p.x + random(-2,2), p.y + random(-2,2), 1.2);
    }
    
    // Sharp X-shape flare for moving stars
    if(speed > 2.5 && random() > 0.95) {
        stroke(255, baseAlpha * 0.6);
        strokeWeight(0.5);
        line(p.x - 3, p.y - 3, p.x + 3, p.y + 3);
        line(p.x + 3, p.y - 3, p.x - 3, p.y + 3);
        noStroke();
    }
  }
}
