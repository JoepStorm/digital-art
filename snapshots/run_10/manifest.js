window.MANIFEST = {
  "latest": 18,
  "iterations": [
    {
      "num": 1,
      "description": "Symbiogenesis - Two populations: cyan prey that flee and leave fading trails, magenta predators that chase prey and leave bright trails, with oscillating populations"
    },
    {
      "num": 2,
      "description": "Luminous Drift - Add trail diffusion/blur pass for organic glowing tendrils instead of scattered dots"
    },
    {
      "num": 3,
      "description": "Bioluminescent Currents - Replace expensive BLUR filter with manual 3x3 kernel diffusion on pixel data for smoother organic tendrils and better performance, plus add subtle pulsing glow intensity tied to population ratio"
    },
    {
      "num": 4,
      "description": "Phosphor Bloom - Increase deposit intensity by having agents write to a 3x3 area instead of single pixel, creating thicker luminous trails that diffusion can spread into proper tendrils"
    },
    {
      "num": 5,
      "description": "Coral Reef - Add prey flee behavior so prey actively steer away from nearby predator trails (red channel), creating dramatic chase patterns and emergent swarm structures"
    },
    {
      "num": 6,
      "description": "Borealis Veil - Add a translucent dark overlay each frame instead of pure trail persistence, creating comet-like fading tails and revealing the chase dynamics more clearly against deeper blacks"
    },
    {
      "num": 7,
      "description": "Murmuration - Add predator repulsion from own trails to prevent clumping, creating sweeping hunt formations that fan out and encircle prey swarms"
    },
    {
      "num": 8,
      "description": "Spectral Wake - Add velocity-dependent trail width and color intensity so fast-moving agents leave brilliant streaks while slow ones leave dim spores, creating dramatic comet tails during chases"
    },
    {
      "num": 9,
      "description": "Ember Tide - Dramatically increase trail deposit brightness and reduce decay to actually build visible tendrils, plus boost base agent counts for denser coverage"
    },
    {
      "num": 10,
      "description": "Abyssal Bloom - Add warm golden \"death burst\" particles where prey are caught, creating ephemeral bloom explosions that fade into the trail map, marking the drama of each predation event"
    },
    {
      "num": 11,
      "description": "Abyssal Currents - Add flowing background current field using Perlin noise that gently pushes all agents, creating organic river-like flow patterns and swirling vortex structures"
    },
    {
      "num": 12,
      "description": "Phantom Depths - Add layered background gradient that shifts with population dynamics, creating a deep ocean atmosphere with bioluminescent depth zones"
    },
    {
      "num": 13,
      "description": "Abyssal Veins - Add pulsing vein-like structures using sine-distorted radial waves emanating from population center of mass, creating organic membrane patterns"
    },
    {
      "num": 14,
      "description": "Bioluminescent Nebulae - Add swirling aurora-like color shifting based on agent density zones, with trails transitioning through spectral hues over time for ethereal deep-sea nebula effect"
    },
    {
      "num": 15,
      "description": "Crystalline Synapses - Add flickering neural connection lines between nearby predators when they converge on prey, creating a synaptic network overlay that pulses with hunt intensity"
    },
    {
      "num": 16,
      "description": "Abyssal Convergence - Add gravitational lensing effect where trails near population centers warp and bloom outward with radial chromatic aberration, creating a deep-space gravitational lens aesthetic"
    },
    {
      "num": 17,
      "description": "Abyssal Phosphor - Replace blank rendering with proper pixel output; the simulation computes trails but never writes them to the canvas pixels, causing the black/blank screen. Fix the draw loop to actually render trail data with chromatic aberration and background gradient to the pixel buffer."
    },
    {
      "num": 18,
      "description": "Primordial Soup - The screen is completely blank/grey, indicating rendering is broken. Fix by ensuring pixels are properly loaded, written from trail data, and pushed to canvas each frame."
    }
  ]
};
