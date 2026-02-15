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
// Iteration 12: The Void-Whisperer - Introducing celestial ley lines that connect distant clusters via faint, low-frequency gravitational waves
// Iteration 13: The Weaver of Astral Silk - Introducing geometric tension fields that spin gossamer webs between stable nodes
// Iteration 14: The Echo-Mapper - Projecting faint geometric reflections to simulate depth in the cosmic field
const numTypes = 5;
const numParticles = 600;
const friction = 0.92; 
const rMax = 120; 
let particles, rules;

// Minimalistic cosmic palette
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
  // Balanced attraction/repulsion matrix to favor filament chains and sparse constellations
  rules = Array.from({ length: numTypes }, () =>
    Array.from({ length: numTypes }, () => random(-0.35, 0.65))
  );
  particles = Array.from({ length: numParticles }, () => ({
    x: random(width),
    y: random(height),
    vx: 0,
    vy: 0,
    type: floor(random(numTypes)),
    pulseOffset: random(TWO_PI),
    // Iteration 14: Depth layering property
    depth: random(0.5, 1.5)
  }));
}

function draw() {
  // Deep void background with high persistence for ghosting trails
  background(4, 5, 12, 18);

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
      
      // Toroidal wrapping logic
      if (dx > width / 2) dx -= width;
      if (dx < -width / 2) dx += width;
      if (dy > height / 2) dy -= height;
      if (dy < -height / 2) dy += height;
      
      let d2 = dx * dx + dy * dy;

      if (d2 < rMax * rMax) {
        let d = sqrt(d2);
        
        let angle = atan2(dy, dx);
        // Geometric alignment: snap to 60-degree increments (hexagonal)
        let targetAngle = Math.round(angle / (PI / 3)) * (PI / 3);
        let angleDiff = targetAngle - angle;
        
        let f = 0;
        if (d < 24) {
           f = (d / 24) - 1.7; // Hard repulsion
        } else {
           let influence = (1 - abs(2 * d - (rMax + 24)) / (rMax - 24));
           f = rules[a.type][b.type] * influence;
           
           // Rotational tension for crystalline edges
           let torque = sin(angleDiff) * 0.18;
           fx -= sin(angle) * torque;
           fy += cos(angle) * torque;
        }
        
        fx += (dx / d) * f;
        fy += (dy / d) * f;
        
        if (d < 58) {
          neighbors.push({d: d, dx: dx, dy: dy, type: b.type, b: b});
        }
      }
    }
    
    let density = neighbors.length;
    
    // Astral Silk - Generating complex web geometry between neighbors
    for(let n of neighbors) {
        let nX = a.x + n.dx;
        let nY = a.y + n.dy;

        if (abs(a.x - nX) < width/2 && abs(a.y - nY) < height/2) {
            let distAlpha = 1 - n.d / 58;
            
            // Iteration 14: The Echo-Mapper - Adding depth parallax to connections based on a's virtual depth
            // This creates a subtle ghosting effect that emphasizes the 3D structure of the cluster
            let shift = (1 - a.depth) * 5;
            
            if (density > 3 && frameCount % 2 === 0) {
              for (let k = 0; k < neighbors.length; k++) {
                 let other = neighbors[k];
                 if (other === n) continue;
                 let odx = other.dx - n.dx;
                 let ody = other.dy - n.dy;
                 let dBetween = sqrt(odx*odx + ody*ody);
                 if (dBetween < 30) {
                    stroke(180, 200, 255, 3 * distAlpha);
                    strokeWeight(0.2);
                    line(nX + shift, nY + shift, a.x + other.dx + shift, a.y + other.dy + shift);
                 }
              }
            }

            // Celestial Ley Lines (Iter 12)
            if (density > 1) {
              noFill();
              stroke(200, 220, 255, 10 * distAlpha);
              strokeWeight(0.5);
              beginShape();
              vertex(a.x, a.y);
              quadraticVertex(a.x + (nX - a.x)/2 + a.vy*2, a.y + (nY - a.y)/2 - a.vx*2, nX, nY);
              endShape();
            }

            // Prism Bonds (Iter 11)
            if (density > 2 && n.d < 35) {
                noStroke();
                let c1 = color(colors[a.type]);
                c1.setAlpha(5 * distAlpha);
                fill(c1);
                beginShape();
                vertex(a.x, a.y);
                vertex(nX, nY);
                vertex(a.x + a.vx * 4, a.y + a.vy * 4);
                endShape(CLOSE);
            }

            // High-tension chromatic filaments (Iter 9)
            strokeWeight(0.3 + density * 0.04);
            stroke(255, 60, 40, 22 * distAlpha);
            line(a.x - a.vx, a.y - a.vy, nX - a.vx, nY - a.vy);
            stroke(40, 120, 255, 22 * distAlpha);
            line(a.x + a.vx, a.y + a.vy, nX + a.vx, nY + a.vy);
            
            // Main skeletal line
            let strokeCol = color(colors[a.type]);
            strokeCol.setAlpha(60 * distAlpha + (density * 3));
            stroke(strokeCol);
            line(a.x, a.y, nX, nY);
        }
    }
    
    // Physics update
    a.vx = (a.vx + fx * 0.38) * friction;
    a.vy = (a.vy + fy * 0.38) * friction;
    a.x += a.vx;
    a.y += a.vy;

    // Toroidal boundary wrap
    if (a.x < 0) a.x += width;
    if (a.x > width) a.x -= width;
    if (a.y < 0) a.y += height;
    if (a.y > height) a.y -= height;
  }

  // Render individual star kernels
  for (let p of particles) {
    let twinkle = sin(phase + p.pulseOffset) * 0.5 + 0.5;
    noStroke();
    // Scale particle size slightly by depth for perspective
    let sz = 1.2 * p.depth;
    fill(255, 250, 243, (180 + twinkle * 75) * (p.depth/1.5));
    circle(p.x, p.y, sz);
    
    let glow = color(colors[p.type]);
    glow.setAlpha(15 * p.depth); 
    fill(glow); 
    circle(p.x, p.y, (6 + twinkle * 6) * p.depth);
  }
}
