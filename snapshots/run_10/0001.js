// Inspired by Jason
// Iteration 1: Symbiogenesis - Two populations: cyan prey that flee and leave fading trails, magenta predators that chase prey and leave bright trails, with oscillating populations

const preyColor = new Uint8Array([0, 220, 220]);
const predatorColor = new Uint8Array([255, 20, 100]);
const preyNum = 3000;
const predatorNum = 800;
const sensorOffset = 12;
const sensorAngle = Math.PI / 6;
const turnAngle = Math.PI / 5;
const predatorSpeed = 1.4;
const preySpeed = 1.1;
const predatorSenseRange = 18;
// How close a predator must be to consume prey
const catchRadius = 4;
// Probability of prey reproducing each frame
const preyReproduceChance = 0.002;
// Probability of predator dying if no prey nearby
const predatorStarveChance = 0.001;

let preyAgents, predatorAgents;

function setup() {
  createCanvas(1600, 900);
  pixelDensity(1);
  background(0);
  preyAgents = Array(preyNum).fill().map(() => new PreyAgent());
  predatorAgents = Array(predatorNum).fill().map(() => new PredatorAgent());
}

function draw() {
  // Fading background — prey trails fade, predator trails linger slightly longer
  background(0, 12);

  loadPixels();
  for (let i = 5; i--; ) {
    // Update prey: they sense and avoid predator trails (red channel), attract to own trails (green channel)
    preyAgents.forEach(e => e.updateDirection());
    preyAgents.forEach(e => e.updatePosition());

    // Update predators: they chase prey trails (green channel)
    predatorAgents.forEach(e => e.updateDirection());
    predatorAgents.forEach(e => e.updatePosition());
  }
  updatePixels();

  // Population dynamics: predators consume nearby prey, prey reproduce, predators starve
  handleInteractions();

  // Draw population info
  noStroke();
  fill(255, 180);
  textSize(14);
  text(`Prey: ${preyAgents.length}  Predators: ${predatorAgents.length}`, 10, 20);
}

function handleInteractions() {
  let newPrey = [];
  let caughtSet = new Set();

  // Predators try to catch nearby prey
  for (let p = predatorAgents.length - 1; p >= 0; p--) {
    let pred = predatorAgents[p];
    let ate = false;
    for (let q = preyAgents.length - 1; q >= 0; q--) {
      if (caughtSet.has(q)) continue;
      let dx = pred.x - preyAgents[q].x;
      let dy = pred.y - preyAgents[q].y;
      if (dx * dx + dy * dy < catchRadius * catchRadius) {
        caughtSet.add(q);
        ate = true;
        // Predator reproduces upon eating
        if (predatorAgents.length < 2000) {
          let baby = new PredatorAgent();
          baby.x = pred.x;
          baby.y = pred.y;
          baby.dir = random(TWO_PI);
          predatorAgents.push(baby);
        }
        break;
      }
    }
    // Predators slowly starve
    if (!ate && random() < predatorStarveChance) {
      predatorAgents.splice(p, 1);
    }
  }

  // Remove caught prey (iterate in reverse order of indices)
  let sortedCaught = [...caughtSet].sort((a, b) => b - a);
  for (let idx of sortedCaught) {
    preyAgents.splice(idx, 1);
  }

  // Prey reproduce
  let len = preyAgents.length;
  for (let i = 0; i < len; i++) {
    if (preyAgents.length < 5000 && random() < preyReproduceChance) {
      let baby = new PreyAgent();
      baby.x = preyAgents[i].x + random(-5, 5);
      baby.y = preyAgents[i].y + random(-5, 5);
      baby.dir = random(TWO_PI);
      newPrey.push(baby);
    }
  }
  preyAgents.push(...newPrey);

  // Ensure minimum populations to prevent extinction
  if (preyAgents.length < 200) {
    for (let i = 0; i < 50; i++) preyAgents.push(new PreyAgent());
  }
  if (predatorAgents.length < 50) {
    for (let i = 0; i < 20; i++) predatorAgents.push(new PredatorAgent());
  }
}

// Prey agents: attracted to own cyan/green trails, repelled by red (predator) trails
class PreyAgent {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.dir = random(TWO_PI);
  }

  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + sensorOffset * cos(angle));
    let y = floor(this.y + sensorOffset * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;
    const index = (x + y * width) * 4;
    // Attracted to green (own trails), repelled by red (predator trails)
    let greenVal = pixels[index + 1];
    let redVal = pixels[index];
    return greenVal - redVal * 2;
  }

  updateDirection() {
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    // Flee: move toward highest value (most green, least red)
    const threeWays = [left, center - 0.5, right];
    const maxIndex = threeWays.indexOf(max(...threeWays));
    this.dir += turnAngle * (maxIndex - 1);

    // Add slight randomness for organic movement
    this.dir += random(-0.1, 0.1);
  }

  updatePosition() {
    this.x += preySpeed * cos(this.dir);
    this.y += preySpeed * sin(this.dir);
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const index = (floor(this.x) + floor(this.y) * width) * 4;
    // Leave a cyan trail
    pixels[index] = max(pixels[index], preyColor[0]);
    pixels[index + 1] = max(pixels[index + 1], preyColor[1]);
    pixels[index + 2] = max(pixels[index + 2], preyColor[2]);
    pixels[index + 3] = 255;
  }
}

// Predator agents: chase prey by following green trails, leave bright magenta trails
class PredatorAgent {
  constructor() {
    this.x = random(width);
    this.y = random(height);
    this.dir = random(TWO_PI);
  }

  sense(dirOffset) {
    const angle = this.dir + dirOffset;
    let x = floor(this.x + predatorSenseRange * cos(angle));
    let y = floor(this.y + predatorSenseRange * sin(angle));
    x = (x + width) % width;
    y = (y + height) % height;
    const index = (x + y * width) * 4;
    // Attracted strongly to green (prey trails)
    let greenVal = pixels[index + 1];
    let blueVal = pixels[index + 2];
    return greenVal + blueVal * 0.5;
  }

  updateDirection() {
    const right = this.sense(+sensorAngle);
    const center = this.sense(0);
    const left = this.sense(-sensorAngle);

    // Chase: move toward highest prey signal
    const threeWays = [left, center - 0.5, right];
    const maxIndex = threeWays.indexOf(max(...threeWays));
    this.dir += turnAngle * (maxIndex - 1);

    this.dir += random(-0.05, 0.05);
  }

  updatePosition() {
    this.x += predatorSpeed * cos(this.dir);
    this.y += predatorSpeed * sin(this.dir);
    this.x = (this.x + width) % width;
    this.y = (this.y + height) % height;

    const index = (floor(this.x) + floor(this.y) * width) * 4;
    // Leave a bright magenta trail
    pixels[index] = 255;
    pixels[index + 1] = max(pixels[index + 1], predatorColor[1]);
    pixels[index + 2] = max(pixels[index + 2], predatorColor[2]);
    pixels[index + 3] = 255;
  }
}
