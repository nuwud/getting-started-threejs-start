import * as THREE from "three";
import getLayer from "./getLayer.js";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x181a20);

const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.set(0, 2, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const ctrls = new OrbitControls(camera, renderer.domElement);
ctrls.enableDamping = true;

// Directional light for soft shadows
const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
dirLight.position.set(5, 10, 7);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.radius = 8;
dirLight.shadow.bias = -0.001;
dirLight.shadow.camera.left = -10;
dirLight.shadow.camera.right = 10;
dirLight.shadow.camera.top = 10;
dirLight.shadow.camera.bottom = -10;
dirLight.shadow.camera.near = 1;
dirLight.shadow.camera.far = 30;
scene.add(dirLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.7);
scene.add(hemiLight);

// Plane to receive shadows
const planeGeo = new THREE.PlaneGeometry(40, 40);
const planeMat = new THREE.ShadowMaterial({ opacity: 0.25 });
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -2.5;
plane.receiveShadow = true;
scene.add(plane);

// Icosahedron geometry for sculpture
const icoDetail = 2; // Increase for more vertices/boxes
const icoGeo = new THREE.IcosahedronGeometry(2.5, icoDetail);
const vertices = icoGeo.getAttribute('position');
const uniqueVerts = [];
const vertSet = new Set();
for (let i = 0; i < vertices.count; i++) {
  const v = [vertices.getX(i), vertices.getY(i), vertices.getZ(i)];
  const key = v.map(n => n.toFixed(3)).join(',');
  if (!vertSet.has(key)) {
    vertSet.add(key);
    uniqueVerts.push(new THREE.Vector3(...v));
  }
}

const boxGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const boxMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.3,
  metalness: 0.7,
  emissive: 0x222244,
  emissiveIntensity: 0.5,
});
const count = uniqueVerts.length;
const instanced = new THREE.InstancedMesh(boxGeo, boxMat, count);
instanced.castShadow = true;
instanced.receiveShadow = true;

const dummy = new THREE.Object3D();
for (let i = 0; i < count; i++) {
  const v = uniqueVerts[i];
  dummy.position.copy(v);
  dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  dummy.updateMatrix();
  instanced.setMatrixAt(i, dummy.matrix);
  // Color using HSL
  const color = new THREE.Color().setHSL(i / count, 0.7, 0.6);
  instanced.setColorAt(i, color);
}
scene.add(instanced);

// Optionally, add a wireframe icosahedron
const wireMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, opacity: 0.2, transparent: true });
const wire = new THREE.Mesh(icoGeo, wireMat);
scene.add(wire);

// Sprites BG
const gradientBackground = getLayer({
  hue: 0.5,
  numSprites: 8,
  opacity: 0.2,
  radius: 10,
  size: 24,
  z: -15.5,
});
scene.add(gradientBackground);

// --- HUD 3D Button as HTML overlay ---
// Do NOT remove anything from the main scene here
// Just create the HUD overlay scene and renderer
const hudScene = new THREE.Scene();
const hudCamera = new THREE.PerspectiveCamera(50, 1, 0.01, 10);
hudCamera.position.z = 0.08;

// Dodecahedron core
const hudButtonGeo = new THREE.DodecahedronGeometry(0.016, 0); // Larger button
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
hudButton.castShadow = false;
hudButton.receiveShadow = false;
hudButton.name = 'HUD_BUTTON';
hudScene.add(hudButton);

// Core dodecahedron
const coreGeo = new THREE.DodecahedronGeometry(0.005, 0); // Larger core
const coreMat = new THREE.MeshBasicMaterial({ color: 0xffe066 });
const coreDodeca = new THREE.Mesh(coreGeo, coreMat);
coreDodeca.position.set(0, 0, 0);
hudButton.add(coreDodeca);

// Core glow
const coreGlow = new THREE.PointLight(0xffe066, 2.5, 0.03, 3.5);
coreGlow.position.set(0, 0, 0);
hudButton.add(coreGlow);

// Rim light
const rimLight = new THREE.DirectionalLight(0x88aaff, 0.7);
rimLight.position.set(2, -2, 2);
rimLight.target = hudButton;
hudScene.add(rimLight);

// Create a new renderer for the HUD button
const hudRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
hudRenderer.setClearColor(0x000000, 0);
hudRenderer.setSize(96, 96); // Larger overlay
hudRenderer.domElement.style.position = 'fixed';
hudRenderer.domElement.style.right = '32px';
hudRenderer.domElement.style.bottom = '32px';
hudRenderer.domElement.style.width = '96px';
hudRenderer.domElement.style.height = '96px';
hudRenderer.domElement.style.zIndex = '1000';
document.body.appendChild(hudRenderer.domElement);

// --- HUD Button Interactivity ---
let hudHover = false;
let coreFlashTimeout = null;

function hudPointerEvent(e, type) {
  const rect = hudRenderer.domElement.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  const mouse = new THREE.Vector2(x, y);
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, hudCamera);
  const intersects = raycaster.intersectObject(hudButton);
  if (type === 'move') {
    if (intersects.length > 0) {
      if (!hudHover) {
        hudHover = true;
        coreGlow.intensity = 6.5;
        coreDodeca.scale.set(1.7, 1.7, 1.7);
        hudButton.material.opacity = 0.6;
      }
      hudRenderer.domElement.style.cursor = 'pointer';
    } else {
      if (hudHover) {
        hudHover = false;
        coreGlow.intensity = 2.5;
        coreDodeca.scale.set(1, 1, 1);
        hudButton.material.opacity = 0.98;
      }
      hudRenderer.domElement.style.cursor = '';
    }
  } else if (type === 'down' && intersects.length > 0) {
    document.getElementById('hud-overlay').style.display = 'flex';
    coreGlow.intensity = 12;
    coreDodeca.scale.set(2.5, 2.5, 2.5);
    if (coreFlashTimeout) clearTimeout(coreFlashTimeout);
    coreFlashTimeout = setTimeout(() => {
      coreGlow.intensity = hudHover ? 6.5 : 2.5;
      coreDodeca.scale.set(hudHover ? 1.7 : 1, hudHover ? 1.7 : 1, hudHover ? 1.7 : 1);
    }, 120);
  }
}
hudRenderer.domElement.addEventListener('pointermove', e => hudPointerEvent(e, 'move'));
hudRenderer.domElement.addEventListener('pointerdown', e => hudPointerEvent(e, 'down'));
document.getElementById('close-hud').onclick = () => {
  document.getElementById('hud-overlay').style.display = 'none';
  // Also reset HUD button hover/click state if needed
  hudHover = false;
  coreGlow.intensity = 2.5;
  coreDodeca.scale.set(1, 1, 1);
  hudButton.material.opacity = 0.98;
};

// --- HUD Controls Logic ---
const wireToggle = document.getElementById('wire-toggle');
if (wireToggle) {
  wireToggle.checked = false; // wireframe off by default
  wire.visible = false;
  wireToggle.onchange = (e) => {
    wire.visible = e.target.checked;
  };
}
// Box Spin HUD control
const boxSpinToggle = document.getElementById('box-spin-toggle');
let boxSpinEnabled = true;
if (boxSpinToggle) {
  boxSpinToggle.checked = true; // box spin on by default
  boxSpinEnabled = true;
  boxSpinToggle.onchange = (e) => {
    boxSpinEnabled = e.target.checked;
  };
}
// --- Synthesizer Setup ---
let synthEnabled = true;
let synthHold = false;
let synthType = 'sine';
let synthActiveOsc = null;
let audioCtx = null;
let synthGain = null;
let synthVolume = 0.7;
const soundToggle = document.getElementById('sound-toggle');
if (soundToggle) {
  soundToggle.checked = true; // audio on by default
  synthEnabled = true;
  soundToggle.onchange = (e) => {
    synthEnabled = e.target.checked;
    if (!synthEnabled) stopSynth();
  };
}
const lightIntensity = document.getElementById('light-intensity');
if (lightIntensity) {
  lightIntensity.oninput = (e) => {
    dirLight.intensity = parseFloat(e.target.value);
  };
}
const shadowRadius = document.getElementById('shadow-radius');
if (shadowRadius) {
  shadowRadius.oninput = (e) => {
    dirLight.shadow.radius = parseFloat(e.target.value);
  };
}
const shadowOpacity = document.getElementById('shadow-opacity');
if (shadowOpacity) {
  shadowOpacity.oninput = (e) => {
    plane.material.opacity = parseFloat(e.target.value);
  };
}
const bgColor = document.getElementById('bg-color');
if (bgColor) {
  bgColor.oninput = (e) => {
    scene.background = new THREE.Color(e.target.value);
  };
}
const boxColor = document.getElementById('box-color');
if (boxColor) {
  boxColor.oninput = (e) => {
    boxMat.color.set(e.target.value);
  };
}
// Per-box rotation state
const boxRotations = Array(count).fill().map(() => new THREE.Euler(
  Math.random() * Math.PI,
  Math.random() * Math.PI,
  Math.random() * Math.PI
));

// --- Global Raycaster and Synth Activation Flag ---
const raycaster = new THREE.Raycaster();
let synthUserActivated = false;

// --- Synthesizer Functions (move these above event listeners) ---
function setupSynth() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    synthGain = audioCtx.createGain();
    synthGain.gain.value = 0.3; // lower for headroom, prevents output overload
    synthGain.connect(audioCtx.destination);
  }
}

function resumeSynthContext() {
  if (audioCtx && audioCtx.state !== 'running') {
    audioCtx.resume();
  }
}

// --- Polyphony-safe synth logic ---
const activeOscillators = [];
const MAX_POLYPHONY = 3;
let lastHoverSoundTime = 0;
const HOVER_DEBOUNCE_MS = 80;

function getNoteForHover(instanceId, faceIndex) {
  // Restore original chromatic mapping for unique notes
  const baseFreq = 220; // A3
  const semitoneRatio = Math.pow(2, 1/12);
  return baseFreq * Math.pow(semitoneRatio, (instanceId * 3 + faceIndex) % 36); // 3 octaves
}

function playSynth(freq, type, hold) {
  setupSynth();
  resumeSynthContext();
  if (!hold && activeOscillators.length >= MAX_POLYPHONY) {
    const oldest = activeOscillators.shift();
    try { oldest.osc.stop(); } catch {}
  }
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1000;
  filter.Q.value = 1.2;
  gain.gain.setValueAtTime(0, audioCtx.currentTime);
  osc.type = type || 'triangle';
  osc.frequency.value = freq;
  // Gentle vibrato (LFO)
  const lfo = audioCtx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 5.2;
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 1.2;
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);
  lfo.start();
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(synthGain); // all voices sum to shared gain node
  osc.start();
  if (!hold) {
    activeOscillators.push({ osc, gain, lfo, lfoGain });
  } else {
    stopSynth();
    synthActiveOsc = osc;
  }
  // Linear envelope for smooth attack/release
  if (hold) {
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(synthVolume * 1.1, audioCtx.currentTime + 0.14);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.38);
    osc.stop(audioCtx.currentTime + 0.39);
    lfo.stop(audioCtx.currentTime + 0.39);
    osc.onended = () => {
      gain.disconnect();
      filter.disconnect();
      osc.disconnect();
      lfo.disconnect();
      lfoGain.disconnect();
      if (synthActiveOsc === osc) synthActiveOsc = null;
    };
  } else {
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(synthVolume, audioCtx.currentTime + 0.14);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.38);
    osc.stop(audioCtx.currentTime + 0.39);
    lfo.stop(audioCtx.currentTime + 0.39);
    osc.onended = () => {
      gain.disconnect();
      filter.disconnect();
      osc.disconnect();
      lfo.disconnect();
      lfoGain.disconnect();
      const idx = activeOscillators.findIndex(o => o.osc === osc);
      if (idx !== -1) activeOscillators.splice(idx, 1);
    };
  }
}

function stopSynth() {
  if (synthActiveOsc) {
    try { synthActiveOsc.stop(); } catch {}
    synthActiveOsc = null;
  }
}

// --- Explode/Bounce Logic ---
let exploded = false;
let boxVelocities = Array(count).fill().map(() => new THREE.Vector3());
const originalPositions = uniqueVerts.map(v => v.clone());
const GRAVITY = new THREE.Vector3(0, -0.012, 0);
const BOUNDS = 7;

function explodeBoxes() {
  for (let i = 0; i < count; i++) {
    // Give each box a random outward velocity
    const dir = originalPositions[i].clone().normalize().add(new THREE.Vector3(
      (Math.random() - 0.5) * 0.7,
      (Math.random() - 0.5) * 0.7,
      (Math.random() - 0.5) * 0.7
    ));
    boxVelocities[i] = dir.normalize().multiplyScalar(0.7 + Math.random() * 1.2);
  }
}

function resetBoxes() {
  for (let i = 0; i < count; i++) {
    boxVelocities[i].set(0, 0, 0);
  }
}

window.addEventListener('mousedown', (e) => {
  if (e.button === 3) { // Mouse first side button
    exploded = !exploded;
    if (exploded) {
      explodeBoxes();
    } else {
      resetBoxes();
    }
  }
});

// --- Animate both scenes ---
function animate() {
  requestAnimationFrame(animate);
  instanced.rotation.y += 0.008;
  instanced.rotation.x += 0.003;
  // Per-box spin
  if (boxSpinEnabled) {
    for (let i = 0; i < count; i++) {
      // Always spin the box
      boxRotations[i].x += 0.02;
      boxRotations[i].y += 0.025;
      boxRotations[i].z += 0.018;
      let boxPos;
      if (exploded) {
        // Physics: update positions and velocities
        if (!boxVelocities[i]) boxVelocities[i] = new THREE.Vector3();
        boxVelocities[i].add(GRAVITY);
        // Bounce off bounds
        if (!boxRotations[i].explodedPos) {
          // On first explode, set explodedPos to original position
          boxRotations[i].explodedPos = uniqueVerts[i].clone();
        }
        boxRotations[i].explodedPos.add(boxVelocities[i]);
        for (let axis of ['x', 'y', 'z']) {
          if (boxRotations[i].explodedPos[axis] > BOUNDS) {
            boxRotations[i].explodedPos[axis] = BOUNDS;
            boxVelocities[i][axis] *= -0.7;
          } else if (boxRotations[i].explodedPos[axis] < -BOUNDS) {
            boxRotations[i].explodedPos[axis] = -BOUNDS;
            boxVelocities[i][axis] *= -0.7;
          }
        }
        boxPos = boxRotations[i].explodedPos;
      } else {
        // Smoothly return to sphere
        if (boxRotations[i].explodedPos) {
          boxRotations[i].explodedPos.lerp(uniqueVerts[i], 0.12);
          boxPos = boxRotations[i].explodedPos;
        } else {
          boxPos = uniqueVerts[i];
        }
      }
      dummy.position.copy(boxPos);
      dummy.rotation.copy(boxRotations[i]);
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    }
    instanced.instanceMatrix.needsUpdate = true;
  }
  wire.rotation.copy(instanced.rotation);
  renderer.render(scene, camera);
  ctrls.update();
  // Animate HUD button
  hudButton.rotation.y += 0.012;
  hudButton.rotation.x += 0.007;
  hudRenderer.render(hudScene, hudCamera);
}

animate();

function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);

// --- Instanced Mesh Raycaster for Synth ---
let lastSynthBox = null;
let lastSynthFace = null;

renderer.domElement.addEventListener('pointermove', (event) => {
  if (!synthEnabled) return;
  const rect = renderer.domElement.getBoundingClientRect();
  const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera);
  const intersects = raycaster.intersectObject(instanced, true);
  if (intersects.length > 0) {
    const instanceId = intersects[0].instanceId;
    const faceIndex = intersects[0].face ? intersects[0].face.a : 0;
    if (lastSynthBox !== instanceId || lastSynthFace !== faceIndex) {
      lastSynthBox = instanceId;
      lastSynthFace = faceIndex;
      playSynth(getNoteForHover(instanceId, faceIndex), synthType, false);
    }
  } else {
    lastSynthBox = null;
    lastSynthFace = null;
    // Don't call stopSynth on hover, let envelopes finish
  }
});

renderer.domElement.addEventListener('pointerleave', () => {
  lastSynthBox = null;
  lastSynthFace = null;
});

renderer.domElement.addEventListener('pointerdown', (event) => {
  if (!synthUserActivated) {
    setupSynth();
    resumeSynthContext();
    synthUserActivated = true;
  }
  if (!synthEnabled) return;
  if (event.button !== 0) return;
  const rect = renderer.domElement.getBoundingClientRect();
  const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera);
  const intersects = raycaster.intersectObject(instanced, true);
  if (intersects.length > 0) {
    // Play a click for only the first facet under pointer (use same note logic)
    const hit = intersects[0];
    const instanceId = hit.instanceId;
    const faceIndex = hit.face ? hit.face.a : 0;
    playSynth(getNoteForHover(instanceId, faceIndex), synthType, true);
  }
});

const synthTypeSelect = document.getElementById('synth-type');
if (synthTypeSelect) {
  synthType = synthTypeSelect.value;
  synthTypeSelect.onchange = (e) => {
    synthType = e.target.value;
  };
}