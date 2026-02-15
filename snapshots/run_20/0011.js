// Iteration 1: The Weaver - Connecting nearby stars with ethereal filaments to form constellations
// Iteration 2: The Astronomer - Introducing asymmetric attraction and increased friction to favor stable, crystalline clustering
// Iteration 3: The Cartographer - Orchestrating rhythmic cosmic pulses and subtle gravitational alignment
// Iteration 4: The Nebula - Introducing chromatic nebulous veils that emerge from the collective motion of the clusters
// Iteration 5: The Cosmographer - Synthesizing geometric geometry from local star alignment to reveal hidden constellations
// Iteration 6: The Glass-Blower - Infusing particles with high-tension surface forces to form delicate, crystalline filaments
// Iteration 7: The Star-Charter - Implementing geometric angular constraints to favor linear and hexagonal grid-like constellations
// Iteration 8: The Void-Walker - Introducing a subtle spatial curvature that warps the star-charts into organic, celestial rifts
// Iteration 9: The Chromaticist - Introducing spectral lensing to draw chromatic aberrations along the filaments
// Iteration 10: The Stellar-Cartographer - Introducing Gravitational Lensing that warps space-time around dense clusters
// Iteration 11: The Prism-Gazer - Introducing geometric lattice bonds that crystallize into spectral prisms
const numTypes = 5;
const numParticles = 600;
const friction = 0.92; 
const rMax = 120; 
let particles, rules;

const colors = ["#ffffff", "#ffccaa", "#aaddff", "#f0f0ff", "#ffeecc"];

function setup() {
  createCanvas(windowWidth, windowHeight);
  initSim();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  initSim();
}

function initSim() {
  // Balanced attraction/repulsion matrix to favor filament chains
  rules = Array.from({ length: numTypes }, () =>
    Array.from({ length: numTypes }, () => random(-0.35, 0.65))
  );
  particles = Array.from({ length: numParticles }, () => ({
    x: random(width),
    y: random(height),
    vx: 0,
    vy: 0,
    type: floor(random(numTypes)),
    pulseOffset: random(TWO_PI)
  }));
}

function draw() {
  // Deep space contrast
  background(4, 5, 15, 22);

  let phase = frameCount * 0.035;

  for (let i = 0; i < particles.length; i++) {
    let a = particles[i];
    let fx = 0, fy = 0;
    
    let neighbors = [];

    for (let j = 0; j < particles.length; j++) {
      if (i === j) continue;
      let b = particles[j];
      
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      
      if (dx > width / 2) dx -= width;
      if (dx < -width / 2) dx += width;
      if (dy > height / 2) dy -= height;
      if (dy < -height / 2) dy += height;
      
      let d2 = dx * dx + dy * dy;

      if (d2 < rMax * rMax) {
        let d = sqrt(d2);
        
        let angle = atan2(dy, dx);
        // Force angular snapping to 60-degree increments for hexagonal lattice structures
        let targetAngle = Math.round(angle / (PI / 3)) * (PI / 3);
        let angleDiff = targetAngle - angle;
        
        let f = 0;
        if (d < 24) {
           f = (d / 24) - 1.7; 
        } else {
           let influence = (1 - abs(2 * d - (rMax + 24)) / (rMax - 24));
           f = rules[a.type][b.type] * influence;
           
           // Rotational tension to align clusters into straight edges
           let torque = sin(angleDiff) * 0.18;
           fx -= sin(angle) * torque;
           fy += cos(angle) * torque;
        }
        
        fx += (dx / d) * f;
        fy += (dy / d) * f;
        
        if (d < 50) {
          neighbors.push({d: d, dx: dx, dy: dy, type: b.type});
        }
      }
    }
    
    // Filament and Prism Rendering Logic
    let density = neighbors.length;
    
    for(let n of neighbors) {
        let nX = a.x + n.dx;
        let nY = a.y + n.dy;

        if (abs(a.x - nX) < width/2 && abs(a.y - nY) < height/2) {
            let distAlpha = 1 - n.d / 50;
            
            // Iteration 11 Change: Geometric Prism Bonds
            // If two particles are very close and aligned, draw a "prism" fill between them and a hypothetical third point
            if (density > 2 && n.d < 35) {
                noStroke();
                let c1 = color(colors[a.type]);
                c1.setAlpha(8 * distAlpha);
                fill(c1);
                // Create a translucent shard projecting out based on velocity
                beginShape();
                vertex(a.x, a.y);
                vertex(nX, nY);
                vertex(a.x + a.vx * 5, a.y + a.vy * 5);
                endShape(CLOSE);
            }

            // High-tension chromatic filaments
            strokeWeight(0.4 + density * 0.05);
            
            // Red Shift
            stroke(255, 60, 40, 35 * distAlpha);
            line(a.x - a.vx, a.y - a.vy, nX - a.vx, nY - a.vy);
            
            // Blue Shift
            stroke(40, 120, 255, 35 * distAlpha);
            line(a.x + a.vx, a.y + a.vy, nX + a.vx, nY + a.vy);
            
            // Golden geometric core
            let strokeCol = color(colors[a.type]);
            strokeCol.setAlpha(80 * distAlpha + (density * 5));
            stroke(strokeCol);
            line(a.x, a.y, nX, nY);
        }
    }
    
    a.vx = (a.vx + fx * 0.38) * friction;
    a.vy = (a.vy + fy * 0.38) * friction;
    a.x += a.vx;
    a.y += a.vy;

    if (a.x < 0) a.x += width;
    if (a.x > width) a.x -= width;
    if (a.y < 0) a.y += height;
    if (a.y > height) a.y -= height;
  }

  // Draw point-stars
  for (let p of particles) {
    let twinkle = sin(phase + p.pulseOffset) * 0.5 + 0.5;
    noStroke();
    fill(255, 250, 240, 200 + twinkle * 55);
    circle(p.x, p.y, 1.2);
    
    let glow = colors[p.type];
    fill(glow + "1a"); // Subtle glow
    circle(p.x, p.y, 6 + twinkle * 4);
  }
}
