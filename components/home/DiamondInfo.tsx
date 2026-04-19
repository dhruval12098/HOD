'use client';

/**
 * DiamondScroll.tsx — Cinematic Edition
 * ──────────────────────────────────────
 * Enhanced with:
 *  1. Full 360° rotation visible across scroll (120° per section)
 *  2. Three dynamic PointLights with cinematic lighting reveals
 *  3. Expanded camera keyframes (5 angles) with parametric orbits
 *  4. Authentic diamond material (locked transmission, realistic IOR)
 *  5. Subtle metallic band color shifts per section
 *  6. Dolly pulsing for depth parallax effect
 */

import {
  useEffect,
  useRef,
  useCallback,
} from 'react';
import * as THREE from 'three';
import {
  GLTFLoader,
  RGBELoader,
  EffectComposer,
  RenderPass,
  UnrealBloomPass,
  RoomEnvironment,
} from 'three-stdlib';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CameraKeyframe {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
}

interface LightingPreset {
  keyLight: { color: number; intensity: number; position: THREE.Vector3 };
  fillLight: { color: number; intensity: number; position: THREE.Vector3 };
  rimLight: { color: number; intensity: number; position: THREE.Vector3 };
}

interface SectionData {
  label: string;
  title: string;
  body: string;
  accent: string;
  lightingPreset: LightingPreset;
  metalTint: number;
}

// ─── Colour constants ─────────────────────────────────────────────────────────

const BG_COLOR = 0xebebe0;  // Darker off-white for better model contrast
const BG_CSS   = '#ebebe0';

// ─── Lighting Presets ─────────────────────────────────────────────────────────
// Three complete lighting setups that reveal the ring differently

const LIGHTING_PRESETS: LightingPreset[] = [
  // Section 0: Warm jewelry studio light (2700K)
  {
    keyLight: {
      color: 0xfff5e0,
      intensity: 3.2,
      position: new THREE.Vector3(2.5, 5.5, 3.5),
    },
    fillLight: {
      color: 0xf5f9ff,
      intensity: 1.8,
      position: new THREE.Vector3(-3.5, 2.5, 2.5),
    },
    rimLight: {
      color: 0xe0d0ff,
      intensity: 1.6,
      position: new THREE.Vector3(-2, 1, -5),
    },
  },
  // Section 1: Cool studio light (5600K) — reveals fire and brilliance
  {
    keyLight: {
      color: 0xf0f7ff,
      intensity: 3.8,
      position: new THREE.Vector3(3.5, 6, 2.5),
    },
    fillLight: {
      color: 0xffe0f0,
      intensity: 2.1,
      position: new THREE.Vector3(-4, 1.5, 3),
    },
    rimLight: {
      color: 0xffd9ff,
      intensity: 1.9,
      position: new THREE.Vector3(-1.5, 0.5, -6),
    },
  },
  // Section 2: Neutral formal light (4000K) — pure clarity
  {
    keyLight: {
      color: 0xfff8f0,
      intensity: 3.4,
      position: new THREE.Vector3(2, 5.8, 4),
    },
    fillLight: {
      color: 0xf0f6ff,
      intensity: 1.9,
      position: new THREE.Vector3(-3.8, 2, 2.8),
    },
    rimLight: {
      color: 0xe8f4ff,
      intensity: 1.5,
      position: new THREE.Vector3(-2.5, 1.5, -5.5),
    },
  },
];

// ─── Sections ─────────────────────────────────────────────────────────────────

const SECTIONS: SectionData[] = [
  {
    label: '01 — Carat',
    title: 'Perfection\nby Weight',
    body: 'Every diamond is precision-cut to its exact carat—measured to the fourth decimal. You receive exactly what is certified, nothing less.',
    accent: '#b8972a',
    lightingPreset: LIGHTING_PRESETS[0],
    metalTint: 0xe8dcc0,
  },
  {
    label: '02 — Cut',
    title: 'Light\nMastered',
    body: 'Our master cutters coax 58 facets into alignment so that every photon entering the stone exits as spectral fire.',
    accent: '#8090a8',
    lightingPreset: LIGHTING_PRESETS[1],
    metalTint: 0xd8d4c8,
  },
  {
    label: '03 — Clarity',
    title: 'Nothing\nHidden',
    body: 'Graded under 10× magnification by independent gemologists. VVS2 or better—visible only to instruments, never to the eye.',
    accent: '#6aabb8',
    lightingPreset: LIGHTING_PRESETS[2],
    metalTint: 0xcfd5e0,
  },
];

// ─── Camera keyframes (expanded for cinematic parallax) ──────────────────────────
// 5 angles showcase the ring from hero → side → crown → tilted → back

const CAMERA_KEYFRAMES: CameraKeyframe[] = [
  {
    // Hero: slightly low, full ring in frame
    position: new THREE.Vector3(0, -0.3, 5.2),
    target:   new THREE.Vector3(0, 0.1, 0),
    fov: 40,
  },
  {
    // Side detail: right quarter, showing band profile
    position: new THREE.Vector3(3.2, 0.8, 3.8),
    target:   new THREE.Vector3(0, 0.05, 0),
    fov: 36,
  },
  {
    // Crown elevation: top-down stone view
    position: new THREE.Vector3(0.5, 4.2, 3.2),
    target:   new THREE.Vector3(0, 0.2, 0),
    fov: 32,
  },
  {
    // Side-back: rear quarter reveals band
    position: new THREE.Vector3(-3.5, 1.2, 3.5),
    target:   new THREE.Vector3(0, 0, 0),
    fov: 35,
  },
  {
    // Back silhouette: full ring in profile
    position: new THREE.Vector3(0, 0.5, 5.5),
    target:   new THREE.Vector3(0, 0, 0),
    fov: 38,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function smoothstep(t: number) { return t * t * (3 - 2 * t); }

// Smooth ease-out curve for camera motion
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

// Cinematic zoom easing — aggressive zoom-in then smooth zoom-out
function zoomEase(t: number): { fovMult: number; distanceMult: number } {
  if (t < 0.4) {
    // Fast aggressive zoom IN (0 → 0.4)
    const zoomIn = t / 0.4;
    const eased = easeOutCubic(zoomIn);
    return {
      fovMult: 1.0 - eased * 0.65,        // FOV shrinks dramatically (zoom-in look)
      distanceMult: 1.0 + eased * 0.3,    // Camera pulls back for tight framing
    };
  } else {
    // Smooth zoom OUT (0.4 → 1.0)
    const zoomOut = (t - 0.4) / 0.6;
    const eased = easeOutCubic(zoomOut);
    return {
      fovMult: 0.35 + eased * 0.65,       // FOV expands back to normal
      distanceMult: 1.3 - eased * 0.3,    // Camera returns to base distance
    };
  }
}

function resolveSection(progress: number, count: number) {
  const scaled = clamp(progress, 0, 0.9999) * count;
  const section = Math.floor(scaled);
  const localT  = scaled - section;
  return { section, localT };
}

// ─── Hook: useScrollProgress ──────────────────────────────────────────────────

function useScrollProgress(
  wrapperRef: React.RefObject<HTMLDivElement>,
  onProgress: (p: number) => void
) {
  useEffect(() => {
    const onScroll = () => {
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const totalScrollable = el.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const p = clamp(scrolled / totalScrollable, 0, 1);
      onProgress(p);
    };

    // Prefer Lenis events when present, since Lenis may prevent/virtualize native scroll events.
    const lenis = (window as any).__lenis;
    if (lenis && typeof lenis.on === 'function' && typeof lenis.off === 'function') {
      lenis.on('scroll', onScroll);
      onScroll();
      return () => lenis.off('scroll', onScroll);
    }

    // Fallback to native scrolling.
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [wrapperRef, onProgress]);
}

// ─── Hook: useThreeScene ──────────────────────────────────────────────────────

function useThreeScene(canvasRef: React.RefObject<HTMLDivElement>) {
  const sceneRef           = useRef<THREE.Scene | null>(null);
  const cameraRef          = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef        = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef        = useRef<EffectComposer | null>(null);
  const modelRef           = useRef<THREE.Group | null>(null);
  const keyLightRef        = useRef<THREE.PointLight | null>(null);
  const fillLightRef       = useRef<THREE.PointLight | null>(null);
  const rimLightRef        = useRef<THREE.PointLight | null>(null);
  const gemMaterialsRef    = useRef<THREE.MeshPhysicalMaterial[]>([]);
  const metalMaterialsRef  = useRef<THREE.MeshPhysicalMaterial[]>([]);
  const rafRef             = useRef<number>(0);
  const floatTimeRef       = useRef(0);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;
    const W = container.clientWidth;
    const H = container.clientHeight;

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ── Scene ──────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG_COLOR);
    sceneRef.current = scene;

    // ── Camera ─────────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.01, 500);
    camera.position.copy(CAMERA_KEYFRAMES[0].position);
    camera.lookAt(CAMERA_KEYFRAMES[0].target);
    cameraRef.current = camera;

    // ── Postprocessing ─────────────────────────────────────────────────────────
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(W, H),
      0.18,  // strength — subtle bloom, not overwhelming
      0.45,  // radius — controlled bloom spread
      0.85   // threshold — high, only brightest highlights bloom
    );
    composer.addPass(bloom);
    composerRef.current = composer;

    // ── Lighting — three dynamic PointLights ────────────────────────────────────
    // Key light — warm bright white, focused on diamond crown
    const keyLight = new THREE.PointLight(0xffffff, 4.5, 30);
    keyLight.position.set(3.2, 6.8, 4.2);
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    // Fill light — cool blue-white for shadow detail
    const fillLight = new THREE.PointLight(0xf0f8ff, 2.6, 25);
    fillLight.position.set(-4.0, 3.2, 2.8);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    // Rim light — warm accent for band separation
    const rimLight = new THREE.PointLight(0xffd700, 2.2, 22);
    rimLight.position.set(-1.5, 0.5, -6.0);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // Ambient — very bright to illuminate entire scene
    const ambient = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambient);

    // ── Environment ────────────────────────────────────────────────────────────
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();

    const rgbeLoader = new RGBELoader();
    const applyEnv = (texture: THREE.Texture) => {
      const envMap = pmrem.fromEquirectangular(texture).texture;
      scene.environment = envMap;
      scene.environmentIntensity = 4.5;  // Boosted for crisp studio reflections
      texture.dispose();
      pmrem.dispose();
    };
    const applyFallbackEnv = () => {
      const rt = pmrem.fromScene(RoomEnvironment(), 0.04);
      scene.environment = rt.texture;
      scene.environmentIntensity = 4.8;  // Bright room environment
      pmrem.dispose();
    };

    rgbeLoader.load('/hdri/studio_small_03_1k.hdr', applyEnv, undefined, applyFallbackEnv);

    // ── Load GLB ───────────────────────────────────────────────────────────────
    const loader = new GLTFLoader();
    loader.load(
      '/glb/diamond_engagement_ring.glb',
      (gltf) => {
        const model = gltf.scene;

        // Auto-fit
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 2.2;
        const scale = targetSize / maxDim;
        model.scale.setScalar(scale);

        const centre = new THREE.Vector3();
        new THREE.Box3().setFromObject(model).getCenter(centre);
        model.position.sub(centre);

        model.traverse((object) => {
          const node = object as THREE.Mesh;
          if (!node.isMesh) return;
          node.castShadow = true;
          node.receiveShadow = true;

          const n = node.name.toLowerCase();
          const isDiamond = n.includes('diamond') || n.includes('stone') || n.includes('gem');

          if (isDiamond) {
            // Authentic diamond: bluish water color with subtle sparkle
            const mat = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(0xf0f8ff),  // Very light blue (alice blue)
              metalness: 0.0,
              roughness: 0.04,         // Slightly rougher to avoid black transmission on solid backgrounds
              transmission: 0.0,       // Disable transmission (solid background can make refractive materials go black)
              thickness: 2.6,
              ior: 2.42,
              reflectivity: 0.95,
              envMapIntensity: 4.8,    // Moderate reflection
              clearcoat: 0.95,
              clearcoatRoughness: 0.01,
              transparent: true,
              opacity: 1.0,
              attenuationColor: new THREE.Color(0xe3f2fd),  // Blue-tinted attenuation
              attenuationDistance: 0.42,
              dispersion: 0.008,       // Subtle rainbow effect
            });
            node.material = mat;
            gemMaterialsRef.current.push(mat);
          } else {
            // Band: premium platinum/white gold finish
            const mat = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(0xffffff),
              metalness: 1.0,
              roughness: 0.035,                  // Polished but realistic
              envMapIntensity: 2.5,
              reflectivity: 0.98,                // Mirror-like
              clearcoat: 0.2,
              clearcoatRoughness: 0.06,
            });
            node.material = mat;
            metalMaterialsRef.current.push(mat);
          }
        });

        scene.add(model);
        modelRef.current = model;
      },
      undefined,
      (err) => {
        console.warn('GLB not found — rendering placeholder', err);
        addPlaceholderDiamond(scene, modelRef);
      }
    );

    // ── Render loop ────────────────────────────────────────────────────────────
    const render = () => {
      rafRef.current = requestAnimationFrame(render);
      floatTimeRef.current += 0.008;
      if (modelRef.current) {
        // Gentle floating motion
        modelRef.current.position.y = Math.sin(floatTimeRef.current * 0.6) * 0.03;
        // No intrinsic rotation here — driven by scroll handler
      }
      composer.render();
    };
    render();

    // ── Resize ─────────────────────────────────────────────────────────────────
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloom.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [canvasRef]);

  return {
    sceneRef,
    cameraRef,
    modelRef,
    keyLightRef,
    fillLightRef,
    rimLightRef,
    gemMaterialsRef,
    metalMaterialsRef,
  };
}

// ─── Placeholder geometry ─────────────────────────────────────────────────────

function addPlaceholderDiamond(
  scene: THREE.Scene,
  modelRef: React.MutableRefObject<THREE.Group | null>
) {
  const group = new THREE.Group();

  const geo = new THREE.OctahedronGeometry(0.8, 1);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.008,
    transmission: 0.98,
    thickness: 1.8,
    ior: 2.42,
    reflectivity: 0.98,
    envMapIntensity: 4,
    clearcoat: 1,
    clearcoatRoughness: 0,
    transparent: true,
  });
  const gem = new THREE.Mesh(geo, mat);
  gem.scale.set(1, 1.4, 1);
  gem.castShadow = true;
  group.add(gem);

  const band = new THREE.TorusGeometry(0.65, 0.09, 20, 100);
  const bandMat = new THREE.MeshPhysicalMaterial({
    color: 0xe8dcc0,
    metalness: 1,
    roughness: 0.05,
    envMapIntensity: 3.5,
    reflectivity: 0.92,
  });
  const bandMesh = new THREE.Mesh(band, bandMat);
  bandMesh.position.y = -0.82;
  bandMesh.rotation.x = Math.PI / 2;
  bandMesh.castShadow = true;
  group.add(bandMesh);

  scene.add(group);
  modelRef.current = group;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DiamondScroll() {
  const wrapperRef = useRef<HTMLDivElement>(null!);
  const canvasRef  = useRef<HTMLDivElement>(null!);
  const textRefs   = useRef<(HTMLDivElement | null)[]>([]);

  const camPosTarget       = useRef(CAMERA_KEYFRAMES[0].position.clone());
  const camLookTarget      = useRef(CAMERA_KEYFRAMES[0].target.clone());
  const camFovTarget       = useRef(CAMERA_KEYFRAMES[0].fov);
  const camRollTarget      = useRef(0);
  const camDistTarget      = useRef(1.0);
  const rotationTarget     = useRef(0);
  const zoomState          = useRef({ active: false, progress: 0, peakProgress: 0 });
  const lastSectionRef     = useRef(0);
  const lightingState      = useRef({
    keyColor: new THREE.Color(LIGHTING_PRESETS[0].keyLight.color),
    keyIntensity: LIGHTING_PRESETS[0].keyLight.intensity,
    keyPosition: LIGHTING_PRESETS[0].keyLight.position.clone(),
    fillColor: new THREE.Color(LIGHTING_PRESETS[0].fillLight.color),
    fillIntensity: LIGHTING_PRESETS[0].fillLight.intensity,
    fillPosition: LIGHTING_PRESETS[0].fillLight.position.clone(),
    rimColor: new THREE.Color(LIGHTING_PRESETS[0].rimLight.color),
    rimIntensity: LIGHTING_PRESETS[0].rimLight.intensity,
    rimPosition: LIGHTING_PRESETS[0].rimLight.position.clone(),
  });
  const metalTintTarget = useRef(new THREE.Color(SECTIONS[0].metalTint));
  const progressRef = useRef(0);

  const {
    cameraRef,
    modelRef,
    keyLightRef,
    fillLightRef,
    rimLightRef,
    gemMaterialsRef,
    metalMaterialsRef,
  } = useThreeScene(canvasRef);

  // ── Camera & lighting lerp loop ─────────────────────────────────────────────
  useEffect(() => {
    const currentLook = new THREE.Vector3().copy(CAMERA_KEYFRAMES[0].target);
    let raf: number;
    const SPEED = 0.06;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const cam     = cameraRef.current;
      const model   = modelRef.current;
      const keyLgt  = keyLightRef.current;
      const fillLgt = fillLightRef.current;
      const rimLgt  = rimLightRef.current;
      if (!cam) return;

      // Camera position & look-at
      cam.position.lerp(camPosTarget.current, SPEED);
      currentLook.lerp(camLookTarget.current, SPEED);
      cam.lookAt(currentLook);

      // Camera roll (Z rotation)
      cam.rotation.z = lerp(cam.rotation.z, camRollTarget.current, SPEED * 0.7);

      // Camera FOV
      cam.fov = lerp(cam.fov, camFovTarget.current, SPEED);
      cam.updateProjectionMatrix();

      // Model rotation (driven by scroll progress)
      if (model) {
        model.rotation.y = lerp(model.rotation.y, rotationTarget.current, SPEED * 0.8);
      }

      // Update key light
      if (keyLgt) {
        keyLgt.color.lerp(lightingState.current.keyColor, SPEED * 1.8);
        keyLgt.intensity = lerp(keyLgt.intensity, lightingState.current.keyIntensity, SPEED * 1.8);
        keyLgt.position.lerp(lightingState.current.keyPosition, SPEED * 1.5);
        // Subtle oscillation for living effect
        keyLgt.intensity += Math.sin(Date.now() * 0.001) * 0.15;
      }

      // Update fill light
      if (fillLgt) {
        fillLgt.color.lerp(lightingState.current.fillColor, SPEED * 1.8);
        fillLgt.intensity = lerp(fillLgt.intensity, lightingState.current.fillIntensity, SPEED * 1.8);
        fillLgt.position.lerp(lightingState.current.fillPosition, SPEED * 1.5);
        fillLgt.intensity += Math.sin(Date.now() * 0.0008 + 2) * 0.12;
      }

      // Update rim light
      if (rimLgt) {
        rimLgt.color.lerp(lightingState.current.rimColor, SPEED * 1.8);
        rimLgt.intensity = lerp(rimLgt.intensity, lightingState.current.rimIntensity, SPEED * 1.8);
        rimLgt.position.lerp(lightingState.current.rimPosition, SPEED * 1.5);
        rimLgt.intensity += Math.sin(Date.now() * 0.0009 + 4) * 0.1;
      }

      // Update band metallic tint
      metalMaterialsRef.current.forEach((m) => {
        m.color.lerp(metalTintTarget.current, SPEED * 1.3);
      });
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [cameraRef, modelRef, keyLightRef, fillLightRef, rimLightRef, metalMaterialsRef]);

  // ── Scroll handler: cinematic rotation & parallax ──────────────────────────
  const onProgress = useCallback((p: number) => {
    progressRef.current = p;
    const { section, localT } = resolveSection(p, SECTIONS.length);
    const t = easeOutCubic(localT);

    // ─── CINEMATIC ZOOM TRIGGER ────────────────────────────────────────────
    // When crossing into a new section (with threshold), trigger zoom
    if (section !== lastSectionRef.current) {
      lastSectionRef.current = section;
      zoomState.current.active = true;
      zoomState.current.progress = 0;
      zoomState.current.peakProgress = 0;
    }

    // Update zoom animation progress (1.2 second duration at 60fps = 72 frames)
    if (zoomState.current.active) {
      zoomState.current.progress += 1 / 72;
      if (zoomState.current.progress >= 1.0) {
        zoomState.current.progress = 1.0;
        zoomState.current.active = false;
      }
      zoomState.current.peakProgress = zoomState.current.progress;
    }

    // ─── ROTATION: Full 360° across scroll (120° per section) ───────────────
    const fullRotation = p * Math.PI * 2;
    rotationTarget.current = fullRotation;

    // ─── PARAMETRIC CAMERA ORBIT ───────────────────────────────────────────
    // Base keyframe interpolation
    const kfIdx = Math.min(section, CAMERA_KEYFRAMES.length - 1);
    const kfNextIdx = Math.min(section + 1, CAMERA_KEYFRAMES.length - 1);
    const kfA = CAMERA_KEYFRAMES[kfIdx];
    const kfB = CAMERA_KEYFRAMES[kfNextIdx];

    camPosTarget.current.lerpVectors(kfA.position, kfB.position, t);
    camLookTarget.current.lerpVectors(kfA.target, kfB.target, t);
    camFovTarget.current = lerp(kfA.fov, kfB.fov, t);

    // Parametric orbit: circle around the ring based on progress through scroll
    const orbitPhase = p * Math.PI * 3.5;
    const orbitRadius = 0.35;
    camPosTarget.current.x += Math.sin(orbitPhase) * orbitRadius;
    camPosTarget.current.y += Math.cos(orbitPhase * 0.7) * 0.25;
    camLookTarget.current.x += Math.sin(orbitPhase * 0.65) * 0.15;
    camLookTarget.current.y += Math.cos(orbitPhase * 0.5) * 0.12;

    // Dolly pulsing for depth parallax (every 0.5 sections)
    const dollyPhase = (section + localT) * Math.PI * 2 * 0.5;
    camDistTarget.current = 1.0 + Math.sin(dollyPhase) * 0.08;
    const distanceAdjustment = (camDistTarget.current - 1.0) * 0.3;
    camPosTarget.current.z += distanceAdjustment;

    // Roll motion: subtle tilt independent of orbit
    const rollPhase = p * Math.PI * 1.2;
    camRollTarget.current = Math.sin(rollPhase) * 0.025;

    // FOV pulsing for dramatic depth change
    camFovTarget.current += Math.sin(orbitPhase * 0.3) * 2.5;

    // ─── APPLY CINEMATIC ZOOM MULTIPLIER ────────────────────────────────────
    // Override FOV and distance based on active zoom sequence
    if (zoomState.current.active || zoomState.current.peakProgress > 0) {
      const zoomMult = zoomEase(zoomState.current.peakProgress);
      camFovTarget.current *= zoomMult.fovMult;
      camDistTarget.current = (camDistTarget.current - 1.0) * zoomMult.distanceMult + 1.0;
      
      // Increase Z position to pull camera back during aggressive zoom-in
      const zoomInPullBack = Math.pow(1 - zoomMult.fovMult, 1.5) * 1.2;
      camPosTarget.current.z += zoomInPullBack;
    }

    // ─── DYNAMIC LIGHTING ──────────────────────────────────────────────────
    const lightA = LIGHTING_PRESETS[Math.min(section, LIGHTING_PRESETS.length - 1)];
    const lightB = LIGHTING_PRESETS[Math.min(section + 1, LIGHTING_PRESETS.length - 1)];

    lightingState.current.keyColor.set(lightA.keyLight.color)
      .lerp(new THREE.Color(lightB.keyLight.color), t);
    lightingState.current.keyIntensity = lerp(
      lightA.keyLight.intensity,
      lightB.keyLight.intensity,
      t
    );
    lightingState.current.keyPosition.lerpVectors(
      lightA.keyLight.position,
      lightB.keyLight.position,
      t
    );

    lightingState.current.fillColor.set(lightA.fillLight.color)
      .lerp(new THREE.Color(lightB.fillLight.color), t);
    lightingState.current.fillIntensity = lerp(
      lightA.fillLight.intensity,
      lightB.fillLight.intensity,
      t
    );
    lightingState.current.fillPosition.lerpVectors(
      lightA.fillLight.position,
      lightB.fillLight.position,
      t
    );

    lightingState.current.rimColor.set(lightA.rimLight.color)
      .lerp(new THREE.Color(lightB.rimLight.color), t);
    lightingState.current.rimIntensity = lerp(
      lightA.rimLight.intensity,
      lightB.rimLight.intensity,
      t
    );
    lightingState.current.rimPosition.lerpVectors(
      lightA.rimLight.position,
      lightB.rimLight.position,
      t
    );

    // ─── BAND METALLIC TINT ────────────────────────────────────────────────
    const sA = SECTIONS[Math.min(section, SECTIONS.length - 1)];
    const sB = SECTIONS[Math.min(section + 1, SECTIONS.length - 1)];
    metalTintTarget.current.set(sA.metalTint)
      .lerp(new THREE.Color(sB.metalTint), t);

    // ─── TEXT PANEL ANIMATIONS ─────────────────────────────────────────────
    textRefs.current.forEach((el, i) => {
      if (!el) return;
      const panelStart    = i / SECTIONS.length;
      const panelEnd      = (i + 1) / SECTIONS.length;
      const panelProgress = clamp((p - panelStart) / (panelEnd - panelStart), 0, 1);
      const fadeIn        = clamp(panelProgress * 3.5, 0, 1);
      const fadeOut       = clamp((panelProgress - 0.72) * 4, 0, 1);
      const alpha         = fadeIn * (1 - fadeOut);
      const translateY    = (1 - fadeIn) * 28 - fadeOut * 18;
      el.style.opacity    = String(alpha);
      el.style.transform  = `translateY(${translateY}px)`;
    });
  }, []);

  useScrollProgress(wrapperRef, onProgress);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Mono:wght@300;400&display=swap');

        .ds-wrapper {
          position: relative;
          height: 300vh;
          background: ${BG_CSS};
        }

        .ds-sticky {
          position: sticky;
          top: 0;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: stretch;
          background: ${BG_CSS};
        }

        .ds-text-col {
          position: relative;
          width: 40%;
          display: flex;
          align-items: center;
          padding: 0 5vw;
          z-index: 10;
          background: transparent;
        }

        .ds-canvas-col {
          flex: 1;
          position: relative;
        }

        .ds-canvas-col canvas {
          display: block;
          width: 100% !important;
          height: 100% !important;
        }

        .ds-panel {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          will-change: opacity, transform;
          opacity: 0;
          pointer-events: none;
        }

        .ds-label {
          font-family: 'DM Mono', monospace;
          font-weight: 300;
          font-size: 0.68rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(30, 28, 24, 0.42);
          margin-bottom: 1.4rem;
        }

        .ds-title {
          font-family: var(--font-title);
          font-weight: 300;
          font-size: clamp(2.6rem, 4vw, 5rem);
          line-height: 1.06;
          color: #1c1a16;
          margin-bottom: 1.8rem;
          white-space: pre-line;
          letter-spacing: -0.01em;
        }

        .ds-body {
          font-family: var(--font-body);
          font-weight: 300;
          font-size: 0.78rem;
          line-height: 1.85;
          color: rgba(30, 28, 24, 0.52);
          max-width: 32ch;
          letter-spacing: 0.025em;
        }

        .ds-accent-bar {
          width: 28px;
          height: 1px;
          margin-bottom: 1.2rem;
        }

        .ds-index {
          position: absolute;
          bottom: 2.5rem;
          left: 5vw;
          display: flex;
          gap: 0.6rem;
          z-index: 20;
        }

        .ds-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(28, 26, 20, 0.18);
          transition: background 0.4s, transform 0.4s;
        }

        .ds-dot.active {
          background: #1c1a16;
          transform: scale(1.5);
        }

        .ds-wordmark {
          position: absolute;
          top: 2rem;
          left: 5vw;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 0.85rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(28, 26, 20, 0.28);
          z-index: 20;
        }

        .ds-scroll-hint {
          position: absolute;
          bottom: 2.5rem;
          right: 2.5rem;
          font-family: 'DM Mono', monospace;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          color: rgba(28, 26, 20, 0.28);
          z-index: 20;
          writing-mode: vertical-rl;
          animation: fadeHint 2s ease 1.5s both;
        }

        @keyframes fadeHint {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .ds-edge-fade {
          position: absolute;
          top: 0;
          left: calc(40% - 80px);
          width: 160px;
          height: 100%;
          background: linear-gradient(to right, ${BG_CSS} 0%, transparent 100%);
          z-index: 8;
          pointer-events: none;
        }

        .ds-vignette {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 5;
          background: radial-gradient(ellipse at center,
            transparent 40%,
            rgba(248, 246, 242, 0.35) 100%);
        }

        @media (max-width: 768px) {
          .ds-sticky      { flex-direction: column; }
          .ds-text-col    { width: 100%; height: 45%; padding: 2rem 6vw; align-items: flex-end; }
          .ds-canvas-col  { height: 55%; }
          .ds-title       { font-size: clamp(2rem, 8vw, 3rem); }
          .ds-edge-fade   { display: none; }
        }
      `}</style>

      <div ref={wrapperRef} className="ds-wrapper">
        <div className="ds-sticky">
          <div className="ds-wordmark">Lumière Diamonds</div>

          <div className="ds-text-col">
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              {SECTIONS.map((s, i) => (
                <div
                  key={i}
                  className="ds-panel"
                  ref={(el) => { textRefs.current[i] = el; }}
                >
                  <div className="ds-accent-bar" style={{ background: s.accent }} />
                  <p className="ds-label">{s.label}</p>
                  <h2 className="ds-title">{s.title}</h2>
                  <p className="ds-body">{s.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="ds-canvas-col">
            <div className="ds-vignette" />
            <div ref={canvasRef} style={{ width: '100%', height: '100%' }} />
          </div>

          <div className="ds-edge-fade" />

          <SectionDots progressRef={progressRef} count={SECTIONS.length} />
          <span className="ds-scroll-hint">scroll to explore</span>
        </div>
      </div>
    </>
  );
}

// ─── Section dots ─────────────────────────────────────────────────────────────

function SectionDots({
  progressRef,
  count,
}: {
  progressRef: React.MutableRefObject<number>;
  count: number;
}) {
  const dotsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let raf: number;
    let lastSection = -1;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const { section } = resolveSection(progressRef.current, count);
      if (section !== lastSection) {
        lastSection = section;
        dotsRef.current.forEach((d, i) => {
          if (!d) return;
          d.classList.toggle('active', i === section);
        });
      }
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [progressRef, count]);

  return (
    <div className="ds-index">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="ds-dot" ref={(el) => { dotsRef.current[i] = el; }} />
      ))}
    </div>
  );
}
