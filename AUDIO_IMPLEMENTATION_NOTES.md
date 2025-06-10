# Audio Implementation Notes for Three.js Interactive Sculpture

## Overview
This project features an interactive 3D sculpture built with Three.js, where each box (and each facet of a box) acts as a musical note. The audio is generated in real-time using the Web Audio API, providing a playable, musical experience as users hover and click on the sculpture.

## Key Steps and Solutions

### 1. Web Audio API Synthesizer
- **Oscillator**: Each note is generated using an `OscillatorNode` (triangle waveform for musicality).
- **Gain Envelope**: A `GainNode` is used for smooth attack and release, preventing clicks and pops.
- **Lowpass Filter**: A `BiquadFilterNode` (lowpass, cutoff ~1000Hz, Q=1.2) smooths the sound and removes harshness.
- **Vibrato**: A gentle LFO (low-frequency oscillator) modulates the pitch for warmth.
- **Shared Gain Node**: All voices sum through a single gain node (`synthGain`) with reduced output (gain=0.3) to prevent distortion when multiple notes overlap.

### 2. Polyphony and Debouncing
- **Polyphony Limit**: Only 3 notes can play at once (`MAX_POLYPHONY=3`). When the limit is reached, the oldest note is stopped to prevent audio overload and static.
- **No Overlapping Stop**: On hover, previous notes are not abruptly stopped; they are allowed to finish their envelope for smoothness.

### 3. Hover and Click Logic
- **Hover**: When the mouse moves over a new box or facet, a single note is played (no repeat while stationary). The note is determined by both the box index (`instanceId`) and the facet index (`face.a`), giving each facet a unique sound.
- **Click**: Clicking a box/facet plays a longer, more pronounced note (with a longer envelope).
- **No Sound on Empty**: If the mouse leaves the sculpture, no new notes are triggered, and existing notes fade out naturally.

### 4. Musical Mapping
- **Note Assignment**: Each box/facet is mapped to a unique note using a chromatic scale (3 octaves, starting at A3/220Hz). The formula is:
  ```js
  const baseFreq = 220; // A3
  const semitoneRatio = Math.pow(2, 1/12);
  const note = baseFreq * Math.pow(semitoneRatio, (instanceId * 3 + faceIndex) % 36);
  ```
- This ensures every part of the sculpture is a different note/key, making it a playable instrument.

### 5. User Activation
- **Audio Context Resume**: Audio only starts after the user's first interaction (click), to comply with browser autoplay policies.

### 6. Best Practices for Clean Audio
- **Envelope Smoothing**: All gain changes use `linearRampToValueAtTime` for smooth transitions.
- **Disconnect Nodes**: All audio nodes are disconnected after use to prevent memory leaks and audio artifacts.
- **No Output Overload**: The shared gain node and polyphony limit prevent distortion and static.

## Summary
To achieve clean, musical, and interactive audio in this Three.js project, it was necessary to:
- Use a shared gain node for all synth voices
- Limit polyphony and use smooth gain envelopes
- Map each box/facet to a unique note
- Use a lowpass filter and vibrato for warmth
- Carefully manage hover/click logic to avoid overlapping or repeated notes
- Ensure all audio nodes are properly disconnected

This approach results in a smooth, playable, and enjoyable audio experience for users exploring the 3D sculpture.
