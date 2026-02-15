// Iteration 1: The Weaver - Connecting nearby nodes of the same species into rhythmic graph structures
// Iteration 2: The Graph Pulse - Animating connection weights based on the local density and age of structures
// Iteration 3: The Graph Cartographer - Visualizing gravitational field lines between dominant cluster nodes
// Iteration 4: The Graph Architect - Expanding node presence based on the structural complexity of their local network
// Iteration 5: The Metabolic Engine - Graph structures consume energy and radiate 'heat' based on connectivity
// Iteration 6: The Graph Symbiote - Structures share kinetic energy and alignment, synchronizing movement within connected graphs
// Iteration 7: The Graph Weaver - Clusters weave intricate geometric webs and crystalline boundaries when they reach critical mass
// Iteration 8: The Harmonic Resonance - Connected graphs now generate resonant fields that distort and warp the local geometry of space
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
let architecturalToggle;
let metabolicToggle;
let symbioticToggle;
let crystallineToggle;
let resonanceToggle;

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  optionsContainer = createDiv('').style('position', 'absolute').style('top', '10px').style('left', '10px').style('color', 'white').style('z-index', '100');
  let details = createElement('details').parent(optionsContainer);
  createElement('summary', 'options').parent(details).style('cursor', 'pointer').style('background', 'rgba(0,0,0,0.5)').style('padding', '5px').style('user-select', 'none');
  let content = createDiv('').parent(details).style('background', 'rgba(0,0,0,0.5)').style('padding', '10px');
  
  connectivityToggle = createCheckbox('Show Graph Structures', true).parent(content);
  pulsateToggle = createCheckbox('Animate Pulse Energy', true).parent(content);
  fieldLineToggle = createCheckbox('Draw Field Projections', true).parent(content);
  architecturalToggle = createCheckbox('Architectural Influence', true).parent(content);
  metabolicToggle = createCheckbox('Metabolic Radiation', true).parent(content);
  symbioticToggle = createCheckbox('Symbiotic Alignment', true).parent(content);
  crystallineToggle = createCheckbox('Crystalline Weaving', true).parent(content);
  resonanceToggle = createCheckbox('Harmonic Resonance', true).parent(content);
  
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
    neighbors: 0,
    cliques: 0,
    metabolism: 0,
    resonance: 0
  }));
}

function draw() {
  background(0, 35); 

  for (let a of particles) {
    let fx = 0, fy = 0;
    let neighborCount = 0;
    let localComplexity = 0;
    let avgVx = a.vx;
    let avgVy = a.vy;

    for (let b of particles) {
      if (a === b) continue;
      
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      
      if (dx > width/2) dx -= width;
      if (dx < -width/2) dx += width;
      if (dy > height/2) dy -= height;
      if (dy < -height/2) dy += height;

      let d2 = dx * dx + dy * dy;
      if (d2 > 0 && d2 < rMax * rMax) {
        let d = sqrt(d2);
        let f = rules[a.type][b.type] / d;
        fx += dx * f;
        fy += dy * f;
        
        if (a.type === b.type) {
            neighborCount++;
            if (architecturalToggle.checked() && b.neighbors > 5) {
              localComplexity++;
            }
            
            if (connectivityToggle.checked() && d < rMax * 0.7 && abs(b.x - a.x) < width/2 && abs(b.y - a.y) < height/2) {
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

            if(symbioticToggle.checked()) {
              avgVx += b.vx;
              avgVy += b.vy;
            }
        }
      }
    }
    
    a.neighbors = neighborCount;
    a.cliques = localComplexity;
    
    if (symbioticToggle.checked() && neighborCount > 0) {
      let harmony = 0.05;
      a.vx = lerp(a.vx, avgVx / (neighborCount + 1), harmony);
      a.vy = lerp(a.vy, avgVy / (neighborCount + 1), harmony);
    }

    a.metabolism = lerp(a.metabolism, (a.neighbors + a.cliques * 0.5), 0.1);
    // Calculate a resonance value based on neighbor sync and distance
    a.resonance = lerp(a.resonance, map(a.neighbors, 0, 20, 0, 1, true), 0.05);

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
    
    if (a.x < 0) a.x += width;
    if (a.x > width) a.x -= width;
    if (a.y < 0) a.y += height;
    if (a.y > height) a.y -= height;
  }

  // Crystalline Weaving
  if (crystallineToggle.checked()) {
    noFill();
    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      if (p.neighbors > 12) {
        let step = floor(map(p.neighbors, 12, 25, 10, 2, true));
        let targetIndex = (i + step * 5) % particles.length;
        let target = particles[targetIndex];
        
        if (target.type === p.type && target !== p) {
           let d = dist(p.x, p.y, target.x, target.y);
           if (d < 250 && abs(target.x - p.x) < width/2 && abs(target.y - p.y) < height/2) {
             stroke(colors[p.type] + "22");
             strokeWeight(0.3);
             let mx = (p.x + target.x) / 2;
             let my = (p.y + target.y) / 2;
             let offsetX = cos(frameCount * 0.05 + i) * 20;
             let offsetY = sin(frameCount * 0.05 + i) * 20;
             beginShape();
             vertex(p.x, p.y);
             vertex(mx + offsetX, my + offsetY);
             vertex(target.x, target.y);
             endShape();
           }
        }
      }
    }
  }

  if (fieldLineToggle.checked()) {
    noFill();
    for (let i = 0; i < particles.length; i += 12) {
      let a = particles[i];
      if (a.neighbors > 10) { 
        for (let j = 0; j < particles.length; j += 40) {
          let b = particles[j];
          if (a.type !== b.type && b.neighbors > 5) {
            let d = dist(a.x, a.y, b.x, b.y);
            if (d > rMax && d < rMax * 3 && abs(b.x - a.x) < width/2 && abs(b.y - a.y) < height/2) {
              stroke(colors[a.type] + "11");
              strokeWeight(0.5);
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

  for (let p of particles) {
    // Harmonic Resonance: High-density nodes generate ghostly echoes of their shape
    if (resonanceToggle.checked() && p.resonance > 0.4) {
      push();
      translate(p.x, p.y);
      let resonanceScale = map(p.resonance, 0.4, 1.0, 1, 10);
      let resAlpha = floor(map(p.resonance, 0.4, 1.0, 0, 40));
      noFill();
      stroke(colors[p.type] + hex(resAlpha, 2));
      strokeWeight(0.5);
      
      // Draw concentric "echo" polygons based on type
      let sides = p.type + 3;
      let angleStep = TWO_PI / sides;
      rotate(frameCount * 0.02 * (p.type + 1));
      for (let s = 1; s < 4; s++) {
        let r = s * resonanceScale * 5 * (1 + sin(frameCount * 0.05));
        beginShape();
        for (let a = 0; a < TWO_PI; a += angleStep) {
          let sx = cos(a) * r;
          let sy = sin(a) * r;
          vertex(sx, sy);
        }
        endShape(CLOSE);
      }
      pop();
    }

    let baseSize = 3;
    let clusterScale = pulsateToggle.checked() ? map(p.neighbors, 0, 15, 1, 3, true) : 1;
    
    if (metabolicToggle.checked() && p.metabolism > 12) {
      push();
      translate(p.x, p.y);
      let ringCount = floor(p.metabolism / 4);
      noFill();
      for(let r = 0; r < ringCount; r++) {
        let rSize = (frameCount * 1.5 + r * 15) % (p.metabolism * 4);
        let alpha = map(rSize, 0, p.metabolism * 4, 100, 0);
        stroke(colors[p.type] + hex(floor(alpha), 2));
        strokeWeight(0.5);
        if (p.cliques > 5) {
          rectMode(CENTER);
          rotate(frameCount * 0.005);
          rect(0, 0, rSize, rSize);
        } else {
          ellipse(0, 0, rSize, rSize);
        }
      }
      pop();
    }

    if (architecturalToggle.checked() && p.cliques > 8) {
      push();
      translate(p.x, p.y);
      rotate(frameCount * 0.01 + p.type);
      fill(colors[p.type] + "15");
      rectMode(CENTER);
      rect(0, 0, p.cliques * 2, p.cliques * 2);
      pop();
    }

    noStroke();
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
