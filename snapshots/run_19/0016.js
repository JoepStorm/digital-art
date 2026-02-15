// Iteration 1: The Weaver of Light - Initializing the pristine state of the simulation
// Iteration 2: The Glimmering Alchemist - Adding glittering trails and variable point intensity for a sparkling effect
// Iteration 3: The Star-Dust Sculptor - Adding chromatic glow and distance-based luminance for deeper sparkling textures
// Iteration 4: The Prismatic Jeweler - Distorting refractive boundaries to create shimmering spectral arcs
// Iteration 5: The Celestial Scintillator - Adding a shimmering background of twinkling micro-stars for depth
// Iteration 6: The Diamond Weaver - Introducing crystalline connections that pulse with light
// Iteration 7: The Aurora Weaver - Adding a shimmering refractive wake that ripples behind active clusters
// Iteration 8: The Silver Threader - Adding a subtle cosmic dust layer that glimmers in the wake of the particles
// Iteration 9: The Gilded Reflector - Adding a shimmering golden radiance and light-reactive halo to active particle clusters
// Iteration 10: The Opaline Dreamer - Introducing a shifting pearlescent glow and subtle temporal shimmer
// Iteration 11: The Crystal Prismatist - Adding a diffraction grating effect that scatters spectral highlights in the particle wakes
// Iteration 12: The Stardust Weaver - Introducing a deep field of drifting cosmic nebulae for enhanced scale and glimmer
// Iteration 13: The Glinting Prism - Adding a subtle chromatic aberration sweep to the overall scene 
// Iteration 14: The Radiant Prismatist - Concentrating crystalline energy into refracting diamond flares
// Iteration 15: The Glinting Luminary - Adding twinkling star-cross bokeh and a chromatic dispersion blur
// Iteration 16: The Velvet Astronomer - Introducing soft, trailing light-ribbons and shimmering chromatic halos
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
    // Store history for smooth ribbon trails
    history: []
  }));
}

function draw() {
  blendMode(BLEND);
  background(2, 6, 14, 25); 
  
  // Drift some soft nebulous glow to create a deep space feel
  noStroke();
  for (let i = 0; i < 6; i++) {
    let nx = noise(i, frameCount * 0.002) * width;
    let ny = noise(i + 50, frameCount * 0.002) * height;
    let nCol = color(colors[i % 5]);
    fill(red(nCol), green(nCol), blue(nCol), 3);
    circle(nx, ny, 300 + sin(frameCount * 0.01 + i) * 100);
  }

  // Large out-of-focus background bokeh circles for depth
  for (let i = 0; i < 8; i++) {
    let bx = (noise(i * 10, frameCount * 0.001) * width * 1.5) - width * 0.25;
    let by = (noise(i * 20, frameCount * 0.001) * height * 1.5) - height * 0.25;
    let bCol = color(colors[i % 5]);
    fill(red(bCol), green(bCol), blue(bCol), 5);
    circle(bx, by, 150 + sin(frameCount * 0.005 + i) * 50);
  }

  // Create a subtle, static background layer of distant "micro-stars" to increase sparkle density
  fill(220, 230, 255, 40);
  for (let i = 0; i < 40; i++) {
    let sx = noise(i, frameCount * 0.004) * width;
    let sy = noise(i + 1000, frameCount * 0.004) * height;
    if (random() > 0.45) {
      circle(sx, sy, 0.8);
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
        
        // Draw thin, ephemeral crystalline webs
        if (a.type === b.type && d < 35) {
          stroke(colors[a.type] + "1A"); 
          strokeWeight(map(d, 0, 35, 0.8, 0));
          line(a.x, a.y, b.x, b.y);
          noStroke();
        }

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

    // Record history for trails
    a.history.push({x: a.x, y: a.y});
    if (a.history.length > 12) a.history.shift();
    
    // Smooth boundary bounce
    if (a.x < 0 || a.x > width) { a.vx *= -0.7; a.x = constrain(a.x, 0, width); }
    if (a.y < 0 || a.y > height) { a.vy *= -0.7; a.y = constrain(a.y, 0, height); }
  }

  noStroke();
  for (let p of particles) {
    let speed = sqrt(p.vx * p.vx + p.vy * p.vy);
    let c = color(colors[p.type]);
    let shimmer = sin(frameCount * 0.1 + p.x * 0.01 + p.y * 0.01) * 30;
    let baseAlpha = constrain(map(speed, 0, 10, 80, 255) + shimmer, 40, 255);
    
    // Draw silk-like ribbons following history
    noFill();
    strokeWeight(1.5);
    stroke(red(c), green(c), blue(c), baseAlpha * 0.15);
    beginShape();
    for(let pos of p.history) {
        vertex(pos.x, pos.y);
    }
    endShape();
    noStroke();

    // Aurora Wake bits
    if (speed > 1.2) {
        let wakeCol = color(colors[(p.type + 1) % numTypes]);
        fill(red(wakeCol), green(wakeCol), blue(wakeCol), 35);
        circle(p.x - p.vx * 1.5, p.y - p.vy * 1.5, 1.2);
    }

    let wave = sin(frameCount * 0.05 + p.type) * 0.8;
    let offset = speed * (0.42 + wave);
    
    // Prismatic displacement components
    fill(255, 50, 80, baseAlpha * 0.22);
    circle(p.x - offset, p.y - offset, 2.1);
    fill(50, 255, 255, baseAlpha * 0.22);
    circle(p.x + offset, p.y + offset, 2.1);

    // Primary Core
    fill(red(c), green(c), blue(c), baseAlpha);
    let sz = random(1.3, 3.0);
    circle(p.x, p.y, sz);
    
    // Gilded Reflector
    if (speed > 2.0) {
        fill(255, 215, 100, 10 + speed * 4);
        circle(p.x, p.y, 6 + speed * 2);
    }

    // Glint effect
    if(random() > 0.982) {
        fill(255, 255, 255, 240);
        let starSize = random(4, 10);
        push();
        translate(p.x, p.y);
        stroke(255, 255, 255, 180);
        strokeWeight(0.4);
        line(-starSize, 0, starSize, 0);
        line(0, -starSize, 0, starSize);
        pop();
        noStroke();
        circle(p.x, p.y, 1.5);
    }
    
    // Radiant Diamond Flare
    if (speed > 2.5 && random() > 0.95) {
      stroke(255, 255, 255, baseAlpha * 0.9);
      strokeWeight(0.5);
      let r = 7 + sin(frameCount * 0.3) * 3;
      line(p.x - r, p.y, p.x + r, p.y);
      line(p.x, p.y - r, p.x, p.y + r);
      noStroke();
    }
  }
}
