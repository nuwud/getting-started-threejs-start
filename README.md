# Getting Started Coding Art with Three.js

This project is an interactive 3D art and music experience built with JavaScript and Three.js. It features a dynamic sculpture of spinning boxes, real-time audio synthesis, and a modern HUD overlay for scene and synth controls.

## Features
- **3D Sculpture**: Instanced spinning boxes arranged on an icosahedron, each colored uniquely.
- **Real-Time Synthesizer**: Every box and facet acts as a musical note, playable by hovering or clicking.
- **Polyphonic, Musical Audio**: Clean, smooth, polyphony-safe synth with envelope, filter, and vibrato.
- **HUD Overlay**: 3D button and control panel for toggling wireframe, box spin, lighting, colors, and synth type (sine, triangle, square, sawtooth).
- **Box Explosion/Bounce**: Press your mouse's first side button to explode the boxes outward and bounce them around; press again to return to the sphere.
- **Responsive UI**: All controls and overlays are modern, accessible, and non-intrusive.

## Usage
- **Hover** over a box/facet to play its unique note.
- **Click** a box/facet to play a longer note.
- **Change synth type** in the HUD to alter the sound (sine, triangle, square, sawtooth).
- **Adjust lighting, color, and spin** from the HUD overlay.
- **Explode/return boxes** with your mouse's first side button (typically a side/back button).

## Audio System
- Each box/facet is mapped to a unique note using a chromatic scale.
- Synth is polyphonic (up to 3 notes at once), with smooth envelopes and a shared gain node for clean sound.
- Synth type is fully controllable from the HUD.
- See `AUDIO_IMPLEMENTATION_NOTES.md` for technical details.

## Getting Started
- Open `index.html` in a modern browser.
- Interact with the sculpture and HUD as described above.

## Credits
- Built with [Three.js](https://threejs.org/)
- Audio via Web Audio API

[YouTube »](https://youtu.be/b78_tqkBuLM)
