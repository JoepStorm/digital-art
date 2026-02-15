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
const numTypes = 5;
const numParticles = 600;
const friction = 0.92; 
const rMax = 120; 
let particles, rules;

const colors = ["#ffffff", "#ffccaa", "#aaddff", "#f0f0ff", "#ffeecc"];

function setup() {
  createCanvas(windowWidth, windowHeight + 4);
  initSim();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  initSim();
}

function initSim() {
  rules = Array.from({ length: numTypes }, () =>
    Array.from({ length: numTypes }, () => random(-0.3, 0.7))
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
  // Deep space background with a trail-inducing alpha
  background(2, 3, 12, 18);

  let phase = frameCount * 0.04;

  for (let i = 0; i < particles.length; i++) {
    let a = particles[i];
    let fx = 0, fy = 0;
    
    let neighbors = [];

    for (let j = 0; j < particles.length; j++) {
      if (i === j) continue;
      let b = particles[j];
      
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      
      // Wrapping coordinates
      if (dx > width / 2) dx -= width;
      if (dx < -width / 2) dx += width;
      if (dy > height / 2) dy -= height;
      if (dy < -height / 2) dy += height;
      
      let d2 = dx * dx + dy * dy;

      if (d2 < rMax * rMax) {
        let d = sqrt(d2);
        
        let angle = atan2(dy, dx);
        let targetAngle = Math.round(angle / (PI / 3)) * (PI / 3);
        let angleDiff = targetAngle - angle;
        
        let f = 0;
        if (d < 22) {
           f = (d / 22) - 1.6; 
        } else {
           let influence = (1 - abs(2 * d - (rMax + 22)) / (rMax - 22));
           f = rules[a.type][b.type] * influence;
           
           let torque = sin(angleDiff) * 0.15;
           fx -= sin(angle) * torque;
           fy += cos(angle) * torque;
        }
        
        let warpX = sin(a.y * 0.01 + phase * 0.1) * 0.05;
        let warpY = cos(a.x * 0.01 + phase * 0.1) * 0.05;
        fx += warpX;
        fy += warpY;

        fx += (dx / d) * f;
        fy += (dy / d) * f;
        
        // Identifying neighbors for filament rendering
        if (d < 45) {
          neighbors.push({d: d, dx: dx, dy: dy});
        }
      }
    }
    
    // Iteration 10: Gravitational Lensing. Dense regions distort the visual path of filaments.
    let densityScale = neighbors.length * 0.015;
    
    for(let n of neighbors) {
        let nX = a.x + n.dx;
        let nY = a.y + n.dy;

        // Ensure we don't draw lines across the screen edge wrap
        if (abs(a.x - nX) < width/2 && abs(a.y - nY) < height/2) {
            let distAlpha = 1 - n.d / 45;
            let shiftX = (a.vx) * 0.8;
            let shiftY = (a.vy) * 0.8;
            
            // Lensing distortion: pull coordinates slightly towards a "center of mass" implied by velocity
            let lensX = a.x + (a.vx * 2);
            let lensY = a.y + (a.vy * 2);

            strokeWeight(0.3 + densityScale);
            
            // Chromatic aberration colors with high-velocity lensing
            stroke(255, 50, 50, 30 * distAlpha);
            line(a.x - shiftX, a.y - shiftY, nX - shiftX, nY - shiftY);
            
            stroke(50, 100, 255, 30 * distAlpha);
            line(a.x + shiftX, a.y + shiftY, nX + shiftX, nY + shiftY);
            
            // Gold/White filament center
            let strokeCol = color(colors[a.type]);
            strokeCol.setAlpha(60 * distAlpha + densityScale * 100);
            stroke(strokeCol);
            
            // Draw curved segments to simulate lensing if dense, otherwise straight
            if(densityScale > 0.1) {
                noFill();
                beginShape();
                vertex(a.x, a.y);
                quadraticVertex(lensX, lensY, nX, nY);
                endShape();
            } else {
                line(a.x, a.y, nX, nY);
            }
        }
    }
    
    a.vx = (a.vx + fx * 0.35) * friction;
    a.vy = (a.vy + fy * 0.35) * friction;
    a.x += a.vx;
    a.y += a.vy;

    if (a.x < 0) a.x += width;
    if (a.x > width) a.x -= width;
    if (a.y < 0) a.y += height;
    if (a.y > height) a.y -= height;
  }

  for (let p of particles) {
    let twinkle = sin(phase + p.pulseOffset) * 0.5 + 0.5;
    noStroke();
    fill(255, 255, 255, 180 + twinkle * 75);
    circle(p.x, p.y, 1.0);
    let c = color(colors[p.type]);
    c.setAlpha(15 + twinkle * 25);
    fill(c);
    circle(p.x, p.y, 5 + twinkle * 3);
  }
}
