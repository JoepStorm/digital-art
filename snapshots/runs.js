window.RUNS = {
  "runs": [
    {
      "id": "run_01",
      "name": "run_01",
      "model": "google/gemini-3-flash-preview",
      "description": "Original Physarum evolution run",
      "prompt": "default",
      "iterations": 22,
      "latest": 22
    },
    {
      "id": "run_02",
      "name": "Multi-agent rules",
      "model": "google/gemini-3-flash-preview",
      "description": "Focus on multiple agents interacting. Each agent should have unique rules, and allow a lot of freedom for complexemerging interactions.",
      "prompt": "Focus on multiple agents interacting. Each agent should have unique rules, and allow a lot of freedom for complexemerging interactions.",
      "iterations": 20,
      "latest": 20
    },
    {
      "id": "run_03",
      "name": "Agent interactions",
      "model": "google/gemini-3-flash-preview",
      "description": "The first iteration should simplify the setup, to contain much fewer numAgents, and remove the effect of a mouse. Then, focus on interactions initiating the creation of new events, spawning new things. A lot of co-creation possibilities.",
      "prompt": "The first iteration should simplify the setup, to contain much fewer numAgents, and remove the effect of a mouse. Then, focus on interactions initiating the creation of new events, spawning new things. A lot of co-creation possibilities.",
      "iterations": 20,
      "latest": 20
    },
    {
      "id": "run_04",
      "name": "Impermanence",
      "model": "",
      "description": "Impermanence",
      "prompt": "Impermanence",
      "iterations": 20,
      "latest": 20
    },
    {
      "id": "run_05",
      "name": "Evolution",
      "model": "google/gemini-3-flash-preview",
      "description": "Evolution. Life, death, and changing over time.",
      "prompt": "Evolution. Life, death, and changing over time.",
      "iterations": 20,
      "latest": 20
    },
    {
      "id": "run_06",
      "name": "Minimalism",
      "model": "google/gemini-3-flash-preview",
      "description": "Minimalism",
      "prompt": "Minimalism",
      "iterations": 8,
      "latest": 8
    },
    {
      "id": "run_07",
      "name": "Chaos vs Order",
      "model": "google/gemini-3-flash-preview",
      "description": "Chaos vs Order",
      "prompt": "Chaos vs Order",
      "iterations": 20,
      "latest": 20
    },
    {
      "id": "run_08",
      "name": "Biological Structure",
      "model": "google/gemini-3-flash-preview",
      "description": "Biological microstructures. Agents represent microorganisms that leave behind a web. The web should become structurally strong.",
      "prompt": "Biological microstructures. Agents represent microorganisms that leave behind a web. The web should become structurally strong.",
      "iterations": 20,
      "latest": 20
    },
    {
      "id": "run_09",
      "name": "Predator-prey",
      "model": "google/gemini-3-flash-preview",
      "description": "Create distinct agent populations with different colors that interact. One type chases the other. Prey agents flee and leave fading trails. Predators leave bright trails. The populations should oscillate.",
      "prompt": "Create distinct agent populations with different colors that interact. One type chases the other. Prey agents flee and leave fading trails. Predators leave bright trails. The populations should oscillate.",
      "iterations": 20,
      "latest": 20
    },
    {
      "id": "run_10",
      "name": "Predator-prey (Opus)",
      "model": "anthropic/claude-opus-4.6",
      "description": "Create distinct agent populations with different colors that interact. One type chases the other. Prey agents flee and leave fading trails. Predators leave bright trails. The populations should oscillate.",
      "prompt": "Create distinct agent populations with different colors that interact. One type chases the other. Prey agents flee and leave fading trails. Predators leave bright trails. The populations should oscillate.",
      "iterations": 18,
      "latest": 18
    },
    {
      "id": "run_11",
      "name": "Flocking - Multi-species",
      "model": "google/gemini-3-flash-preview",
      "description": "Create distinct species with different colors that interact in interesting ways. It does not have to be realistic, go for beauty instead.",
      "prompt": "Create distinct species with different colors that interact in interesting ways. It does not have to be realistic, go for beauty instead.",
      "iterations": 19,
      "latest": 19
    },
    {
      "id": "run_12",
      "name": "Flocking - primordial soup",
      "model": "google/gemini-3-flash-preview",
      "description": "A particle ecosystem where colored boids flock, hunt, and consume each other. Each boid has a size and a color. When a larger boid catches a smaller one, it absorbs it \u2014 growing slightly and blending their colors  together. As boids grow, they slow down and gradually lose energy, shrinking over time. Beyond a certain size they split into two smaller offspring, like cell division. Meanwhile, tiny new boids spontaneously spawn at the edges in random bright colors, replenishing the food chain. The result is a endless cycle: small fast boids swarm and scatter, mid-sized ones hunt in loose packs, and bloated giants drift slowly before dividing \u2014 a colorful, emergent food web that never reaches equilibrium.",
      "prompt": "A particle ecosystem where colored boids flock, hunt, and consume each other. Each boid has a size and a color. When a larger boid catches a smaller one, it absorbs it \u2014 growing slightly and blending their colors  together. As boids grow, they slow down and gradually lose energy, shrinking over time. Beyond a certain size they split into two smaller offspring, like cell division. Meanwhile, tiny new boids spontaneously spawn at the edges in random bright colors, replenishing the food chain. The result is a endless cycle: small fast boids swarm and scatter, mid-sized ones hunt in loose packs, and bloated giants drift slowly before dividing \u2014 a colorful, emergent food web that never reaches equilibrium.",
      "iterations": 6,
      "latest": 6
    },
    {
      "id": "run_13",
      "name": "MNCA - dynamic",
      "model": "google/gemini-3-flash-preview",
      "description": "This is a multi neighborhood cellular automata. Make the behavior very dynamic, constantly changing, evolving.",
      "prompt": "This is a multi neighborhood cellular automata. Make the behavior very dynamic, constantly changing, evolving.",
      "iterations": 20,
      "latest": 20
    },
    {
      "id": "run_14",
      "name": "MNCA - multi-cell types",
      "model": "google/gemini-3-flash-preview",
      "description": "Create different types of cells, with different very simple rules. The rules should leave room to enable new, emerging, unexpected behavior. Additionally, focus on keeping the simulation fast to run, so avoid very compute-heavy methods.",
      "prompt": "Create different types of cells, with different very simple rules. The rules should leave room to enable new, emerging, unexpected behavior. Additionally, focus on keeping the simulation fast to run, so avoid very compute-heavy methods.",
      "iterations": 14,
      "latest": 14
    },
    {
      "id": "run_15",
      "name": "Touch",
      "model": "google/gemini-3-flash-preview",
      "description": "Focus on touch interactions. Depending on the type of touch, length, shape, different behavior occurs, such as repelling or attrecting agents. Use fewer agents, Maximum 600. Have different agents behave differently depending on the touch.",
      "prompt": "Focus on touch interactions. Depending on the type of touch, length, shape, different behavior occurs, such as repelling or attrecting agents. Use fewer agents, Maximum 600. Have different agents behave differently depending on the touch.",
      "iterations": 11,
      "latest": 11
    },
    {
      "id": "run_17",
      "name": "Particle-life: Harmony",
      "model": "google/gemini-3-flash-preview",
      "description": "Harmony",
      "prompt": "Harmony",
      "iterations": 4,
      "latest": 4
    },
    {
      "id": "run_18",
      "name": "Particle-life: Harmony v2",
      "model": "google/gemini-3-flash-preview",
      "description": "Harmony",
      "prompt": "Harmony",
      "iterations": 6,
      "latest": 6
    },
    {
      "id": "run_19",
      "name": "Particle-life: Sparkling",
      "model": "google/gemini-3-flash-preview",
      "description": "Sparkling. Focus on simple, small changes. Focus on visual style, colours, etc. For the very first iteration only, change nothing. ",
      "prompt": "Sparkling. Focus on simple, small changes. Focus on visual style, colours, etc. For the very first iteration only, change nothing. ",
      "iterations": 19,
      "latest": 19
    },
    {
      "id": "run_20",
      "name": "Particle-life: Constellations",
      "model": "google/gemini-3-flash-preview",
      "description": "Constellations. Create conditions for complex constellations to emerge. Otherwise follow a minimalistic visual style. Can vary colors, but don't overdo it with a lot of spark.",
      "prompt": "Constellations. Create conditions for complex constellations to emerge. Otherwise follow a minimalistic visual style. Can vary colors, but don't overdo it with a lot of spark.",
      "iterations": 15,
      "latest": 15
    },
    {
      "id": "run_21",
      "name": "Particle-life: Quantum",
      "model": "google/gemini-3-flash-preview",
      "description": "Quantum. Quantum physics, quantum mechanics.",
      "prompt": "Quantum. Quantum physics, quantum mechanics.",
      "iterations": 13,
      "latest": 13
    },
    {
      "id": "run_22",
      "name": "Particle-life: Graphs",
      "model": "google/gemini-3-flash-preview",
      "description": "Graphs. Connected, nodes through graphs that form structures, and behave different based on their size, shape, etc. Be careful not to connect through a boundary, as then the line crosses the full screen. Avoid that.",
      "prompt": "Graphs. Connected, nodes through graphs that form structures, and behave different based on their size, shape, etc. Be careful not to connect through a boundary, as then the line crosses the full screen. Avoid that.",
      "iterations": 10,
      "latest": 10
    },
    {
      "id": "run_23",
      "name": "Particle-life: Order vs Chaos",
      "model": "google/gemini-3-flash-preview",
      "description": "Order vs Chaos",
      "prompt": "Order vs Chaos",
      "iterations": 11,
      "latest": 11
    }
  ],
  "default": "run_23"
};
