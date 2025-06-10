# 3D HUD Button Overlay (Three.js)

## Overview
This project demonstrates a modern, interactive 3D HUD button rendered as a fixed overlay in the bottom right corner of the browser window, fully independent from the main Three.js scene and camera. The button is a black dodecahedron with a glowing yellow dodecahedron core, featuring:

- **Pixel-perfect overlay:** Always visible and never stretched, regardless of window size or aspect ratio.
- **3D interactivity:** Hover and click effects, including core glow and scaling.
- **No interference with main scene:** Main 3D art and controls remain unaffected.

## Key Features
- **Separate Three.js scene and renderer** for the HUD button, rendered to a fixed-size transparent canvas overlay (`96x96px` by default).
- **Dodecahedron geometry** for both the outer button and the glowing core.
- **Core glow:** Achieved with a yellow `MeshBasicMaterial` dodecahedron and a `PointLight` for a sharp, bright effect.
- **Hover effect:** Increases core glow intensity, scales up the core, and lowers the outer opacity for visual feedback.
- **Click effect:** Briefly flashes the core and scales it up further.
- **Responsive:** Overlay remains in the bottom right, always the same size, even in fullscreen or on resize.

## Usage Pattern
1. **Create a new Three.js scene and camera** for the HUD button.
2. **Build the button:**
   - Outer: `MeshStandardMaterial` dodecahedron (black, semi-transparent)
   - Core: `MeshBasicMaterial` dodecahedron (yellow)
   - Add a `PointLight` for the core glow
   - Add a rim `DirectionalLight` for 3D pop
3. **Create a new WebGLRenderer** for the HUD overlay, set to fixed position and size in the corner.
4. **Add pointer event listeners** to the overlay canvas for hover/click interactivity.
5. **Render both scenes** in the main animation loop.
6. **On click, open your HUD overlay panel.**

## Example Code Snippet
```js
// Create HUD scene/camera
const hudScene = new THREE.Scene();
const hudCamera = new THREE.PerspectiveCamera(50, 1, 0.01, 10);
hudCamera.position.z = 0.08;

// Outer dodecahedron
const hudButtonGeo = new THREE.DodecahedronGeometry(0.016, 0);
const hudButtonMat = new THREE.MeshStandardMaterial({
  color: 0x111111,
  roughness: 0.12,
  metalness: 0.95,
  emissive: 0x222222,
  emissiveIntensity: 0.4,
  transparent: true,
  opacity: 0.98,
  envMapIntensity: 1.2
});
const hudButton = new THREE.Mesh(hudButtonGeo, hudButtonMat);
hudScene.add(hudButton);

// Core dodecahedron
const coreGeo = new THREE.DodecahedronGeometry(0.005, 0);
const coreMat = new THREE.MeshBasicMaterial({ color: 0xffe066 });
const coreDodeca = new THREE.Mesh(coreGeo, coreMat);
hudButton.add(coreDodeca);

// Core glow
const coreGlow = new THREE.PointLight(0xffe066, 2.5, 0.03, 3.5);
hudButton.add(coreGlow);

// Rim light
const rimLight = new THREE.DirectionalLight(0x88aaff, 0.7);
rimLight.position.set(2, -2, 2);
rimLight.target = hudButton;
hudScene.add(rimLight);

// HUD renderer
const hudRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
hudRenderer.setClearColor(0x000000, 0);
hudRenderer.setSize(96, 96);
hudRenderer.domElement.style.position = 'fixed';
hudRenderer.domElement.style.right = '32px';
hudRenderer.domElement.style.bottom = '32px';
hudRenderer.domElement.style.width = '96px';
hudRenderer.domElement.style.height = '96px';
hudRenderer.domElement.style.zIndex = '1000';
document.body.appendChild(hudRenderer.domElement);

// Interactivity: pointermove/pointerdown listeners for hover/click effects
// ...see full project for details...

// In your animation loop:
hudButton.rotation.y += 0.012;
hudButton.rotation.x += 0.007;
hudRenderer.render(hudScene, hudCamera);
```

## Integration Notes
- The HUD overlay is completely decoupled from the main scene/camera.
- You can reuse this pattern for any 3D button or widget overlay in future projects.
- Adjust geometry, color, and size as needed for your UI/UX.

---
**Milestone:** 3D HUD Button Overlay documented (June 10, 2025)
