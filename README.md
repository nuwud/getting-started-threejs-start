# Interactive 3D Musical Sculpture with Three.js

This project is an interactive 3D art and music experience built with JavaScript and Three.js. It features a dynamic sculpture of spinning boxes, real-time audio synthesis, and a modern HUD overlay for scene and synth controls.

## Features
- **3D Sculpture**: Instanced spinning boxes arranged on an icosahedron, each colored uniquely and spinning independently.
- **Real-Time Synthesizer**: Every box and facet acts as a musical note, playable by hovering or clicking.
- **Polyphonic, Musical Audio**: Clean, smooth, polyphony-safe synth with envelope, filter, vibrato, and selectable waveform (sine, triangle, square, sawtooth).
- **HUD Overlay**: 3D button and control panel for toggling wireframe, box spin, lighting, colors, synth type, and volume.
- **Box Explosion/Bounce**: Press your mouse's first side button to explode the boxes outward and bounce them around; press again to return to the sphere.
- **Responsive UI**: All controls and overlays are modern, accessible, and non-intrusive.

## Usage
- **Hover** over a box/facet to play its unique note (each box and facet is mapped to a different pitch).
- **Click** a box/facet to play a longer note.
- **Change synth type** in the HUD to alter the sound (sine, triangle, square, sawtooth).
- **Adjust lighting, color, and spin** from the HUD overlay.
- **Explode/return boxes** with your mouse's first side button (typically a side/back button).

## How it Works
- Each box and facet is mapped to a unique note using a chromatic scale (3 octaves, starting at A3/220Hz).
- The synth is polyphonic (up to 3 notes at once), with smooth attack/release envelopes and a shared gain node for clean sound.
- The synth type (waveform) is fully controllable from the HUD and changes the timbre in real time.
- The explosion feature uses simple physics and gravity to bounce boxes within bounds, and smoothly returns them to the sphere when toggled off.
- All audio is generated in real time using the Web Audio API, with best practices for smoothness and no distortion.

## Technical Details
- See [`AUDIO_IMPLEMENTATION_NOTES.md`](AUDIO_IMPLEMENTATION_NOTES.md) for a full breakdown of the audio system, polyphony, mapping, and best practices.
- See [`HUD_BUTTON_README.md`](HUD_BUTTON_README.md) for details on the 3D HUD overlay pattern.

## Getting Started
- Open `index.html` in a modern browser (desktop recommended for full interactivity).
- Interact with the sculpture and HUD as described above.

## Credits
- Built with [Three.js](https://threejs.org/)
- Audio via Web Audio API

[YouTube »](https://youtu.be/b78_tqkBuLM)
