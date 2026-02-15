// Iteration 1: The Weaver of Light - Initializing the pristine state of the simulation
// Iteration 2: The Glimmering Alchemist - Adding glittering trails and variable point intensity for a sparkling effect
// Iteration 3: The Star-Dust Sculptor - Adding chromatic glow and distance-based luminance for deeper sparkling textures
// Iteration 4: The Prismatic Jeweler - Distorting refractive boundaries to create shimmering spectral arcs
// Iteration 5: The Celestial Scintillator - Adding a shimmering background of twinkling micro-stars for depth
// Iteration 6: The Diamond Weaver - Introducing crystalline connections that pulse with light
// Iteration 7: The Aurora Weaver - Adding a shimmering refractive wake that ripples behind active clusters

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
  background(2, 8, 18, 20); // Slightly deeper, more transparent void for longer trails
  
  // Create a subtle, static background layer of distant "micro-stars" to increase sparkle density
  fill(255, 255, 255, 30);
  for (let i = 0; i < 40; i++) {
    let sx = noise(i, frameCount * 0.005) * width;
    let sy = noise(i + 1000, frameCount * 0.005) * height;
    if (random() > 0.4) {
      circle(sx, sy, 0.7);
    }
  }

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
        
        // Draw thin, ephemeral crystalline webs between nearby particles of the same type
        if (a.type === b.type && d < 35) {
          stroke(colors[a.type] + "1A"); // Very low opacity hex (approx 10%)
          strokeWeight(map(d, 0, 35, 0.8, 0));
          line(a.x, a.y, b.x, b.y);
          noStroke();
        }

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
    
    // Smooth boundary bounce
    if (a.x < 0 || a.x > width) { a.vx *= -0.7; a.x = constrain(a.x, 0, width); }
    if (a.y < 0 || a.y > height) { a.vy *= -0.7; a.y = constrain(a.y, 0, height); }
  }

  noStroke();
  for (let p of particles) {
    let speed = sqrt(p.vx * p.vx + p.vy * p.vy);
    let c = color(colors[p.type]);
    let baseAlpha = map(speed, 0, 8, 80, 255);
    
    // Aurora Wake: Tiny colorful dots that trail behind fast-moving particles
    if (speed > 1.2) {
        let wakeCol = color(colors[(p.type + 1) % numTypes]);
        fill(red(wakeCol), green(wakeCol), blue(wakeCol), 40);
        circle(p.x - p.vx * 1.5, p.y - p.vy * 1.5, 1.2);
    }

    // Prismatic displacement: draw three slightly offset color components
    let offset = speed * 0.4;
    
    // Red Channel
    fill(255, 40, 40, baseAlpha * 0.25);
    circle(p.x - offset, p.y - offset, 2.2);
    
    // Cyan Channel
    fill(40, 255, 255, baseAlpha * 0.25);
    circle(p.x + offset, p.y + offset, 2.2);

    // Primary Core
    fill(red(c), green(c), blue(c), baseAlpha);
    let sz = random(1.2, 2.8);
    circle(p.x, p.y, sz);
    
    // Glint effect: Tiny white specks
    if(random() > 0.985) {
        fill(255, 255, 255, 200);
        circle(p.x + random(-2,2), p.y + random(-2,2), 1.0);
    }
    
    // X-shape flare for energetic stars
    if(speed > 3.0 && random() > 0.94) {
        stroke(255, baseAlpha * 0.5);
        strokeWeight(0.4);
        let s = 4;
        line(p.x - s, p.y - s, p.x + s, p.y + s);
        line(p.x + s, p.y - s, p.x - s, p.y + s);
        noStroke();
    }
  }
}
