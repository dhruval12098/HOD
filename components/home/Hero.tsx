'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import { GLTFLoader, RGBELoader } from 'three-stdlib';

interface HeroProps {
  onEnquireClick?: () => void;
}

// ---------------------------------------------------------------------------
// Builds a high-contrast cube-map environment entirely in code.
// 6 faces: blazing white top, near-black bottom, bright left/right,
// dark front/back → gives diamonds crisp reflections + dark voids for contrast.
// ---------------------------------------------------------------------------
function buildSyntheticEnv(renderer: THREE.WebGLRenderer): THREE.Texture {
  const SIZE = 128;
  const faces: THREE.Color[] = [
    new THREE.Color(0xffffff), // +X right  — bright
    new THREE.Color(0x111111), // -X left   — dark
    new THREE.Color(0xffffff), // +Y top    — blazing white
    new THREE.Color(0x050505), // -Y bottom — near black
    new THREE.Color(0xdddddd), // +Z front  — light grey
    new THREE.Color(0x222222), // -Z back   — dark
  ];

  const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(SIZE);
  const scene6 = new THREE.Scene();

  faces.forEach((col, i) => {
    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.MeshBasicMaterial({ color: col, side: THREE.FrontSide });
    const mesh = new THREE.Mesh(geo, mat);
    const rotations: [number, number, number][] = [
      [0,  Math.PI / 2, 0],   // +X
      [0, -Math.PI / 2, 0],   // -X
      [-Math.PI / 2, 0, 0],   // +Y
      [ Math.PI / 2, 0, 0],   // -Y
      [0, 0, 0],              // +Z
      [0, Math.PI, 0],        // -Z
    ];
    mesh.rotation.set(...rotations[i]);
    mesh.position.set(
      i === 0 ? 1 : i === 1 ? -1 : 0,
      i === 2 ? 1 : i === 3 ? -1 : 0,
      i === 4 ? 1 : i === 5 ? -1 : 0,
    );
    scene6.add(mesh);
  });

  // PMREMGenerator converts our cube scene → prefiltered env map
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(scene6).texture;
  pmrem.dispose();
  return envTexture;
}

export default function Hero({ onEnquireClick }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || typeof window === 'undefined') return;

    let animFrameId: number;
    let disposed = false;

    const init = () => {
      const canvas = canvasRef.current!;
      const size = Math.min(canvas.clientWidth || 600, 600);

      // ── Scene / Camera ──────────────────────────────────────────────
      const scene = new THREE.Scene();
      // NO scene.background → stays null → canvas alpha works correctly

      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.z = 4;

      // ── Renderer — alpha:true, NO composer (composer kills alpha) ───
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        premultipliedAlpha: false,
      });
      renderer.setSize(size, size, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.3;
      renderer.setClearColor(0x000000, 0); // transparent clear every frame

      // ── Environment: try HDR first, fall back to synthetic ──────────
      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();

      const applyHDR = (tex: THREE.Texture) => {
        scene.environment = pmrem.fromEquirectangular(tex).texture;
        scene.environmentIntensity = 5.0;
        tex.dispose();
        pmrem.dispose();
      };

      new RGBELoader().load(
        '/hdri/studio_small_03_1k.hdr',
        applyHDR,
        undefined,
        () => {
          // No HDR file — build high-contrast env in code instead
          pmrem.dispose();
          scene.environment = buildSyntheticEnv(renderer);
          scene.environmentIntensity = 5.5;
        }
      );

      // ── Diamond material ─────────────────────────────────────────────
      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xffffff),
        metalness: 0.0,
        roughness: 0.02,
        transmission: 0.95,
        ior: 2.42,
        thickness: 2.0,
        envMapIntensity: 7.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
        transparent: true,
        side: THREE.DoubleSide,
        attenuationColor: new THREE.Color(0xd4eeff),
        attenuationDistance: 0.3,
        dispersion: 0.15,
      });

      // ── Lighting: 2 hard directionals + 1 orbiting spot ─────────────
      // No ambient/hemisphere — kills contrast
      const key = new THREE.DirectionalLight(0xfff8e8, 4.0);
      key.position.set(5, 6, 5);
      scene.add(key);

      const rim = new THREE.DirectionalLight(0xc8e0ff, 2.5);
      rim.position.set(-6, -4, -5);
      scene.add(rim);

      // This spot orbits every frame → moving caustic flashes on facets
      const spot = new THREE.SpotLight(0xffffff, 5.0, 20, Math.PI / 8, 0.2);
      spot.position.set(3, 7, 4);
      scene.add(spot);

      // ── Load GLB ────────────────────────────────────────────────────
      const diamondGroup = new THREE.Group();
      scene.add(diamondGroup);

      new GLTFLoader().load('/glb/diamond.glb', (gltf) => {
        if (disposed) return;
        const obj = gltf.scene;
        obj.traverse((child: any) => {
          if (child.isMesh) {
            child.material = mat;
            // ✅ No EdgesGeometry
          }
        });

        const box = new THREE.Box3().setFromObject(obj);
        const center = box.getCenter(new THREE.Vector3());
        const sz = box.getSize(new THREE.Vector3());
        const scale = 2.0 / (Math.max(sz.x, sz.y, sz.z) || 1);
        obj.scale.setScalar(scale);
        obj.position.sub(center.multiplyScalar(scale));
        diamondGroup.add(obj);

        setTimeout(() => { if (!disposed && canvas) canvas.style.opacity = '0.9'; }, 400);
      });

      // ── Mouse parallax ──────────────────────────────────────────────
      let mx = 0, my = 0, tx = 0, ty = 0;
      const onMouseMove = (e: MouseEvent) => {
        mx = (e.clientX / window.innerWidth - 0.5) * 0.6;
        my = (e.clientY / window.innerHeight - 0.5) * 0.6;
      };
      window.addEventListener('mousemove', onMouseMove);

      // ── Animate ─────────────────────────────────────────────────────
      const animate = () => {
        if (disposed) return;
        animFrameId = requestAnimationFrame(animate);
        tx += (mx - tx) * 0.04;
        ty += (my - ty) * 0.04;

        const t = Date.now();
        diamondGroup.rotation.y += 0.004;
        diamondGroup.rotation.x = Math.sin(t * 0.0005) * 0.15 + ty * 0.3;
        diamondGroup.rotation.z = tx * 0.2;

        // Orbit spot → caustic-like flashes
        spot.position.x = Math.sin(t * 0.0009) * 5;
        spot.position.z = Math.cos(t * 0.0009) * 5;
        spot.position.y = 4 + Math.sin(t * 0.0006) * 2;

        // Direct renderer.render — preserves alpha perfectly, no composer
        renderer.render(scene, camera);
      };
      animate();

      // ── Resize ──────────────────────────────────────────────────────
      const onResize = () => {
        const s = Math.min(canvas.clientWidth || 600, 600);
        renderer.setSize(s, s, false);
      };
      window.addEventListener('resize', onResize);

      return () => {
        disposed = true;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(animFrameId);
        renderer.dispose();
      };
    };

    const cleanup = init();
    return () => { cleanup(); };
  }, []);

  return (
    <section
      className="relative min-h-[92vh] flex items-center justify-center px-[52px] py-[60px] overflow-hidden max-md:px-5 max-md:min-h-[80vh] max-md:py-10"
      style={{
        background:
          'radial-gradient(ellipse 80% 50% at 50% 20%, rgba(184,146,42,0.08), transparent), radial-gradient(ellipse 60% 40% at 10% 80%, rgba(184,146,42,0.05), transparent), #FBF9F5',
      }}
    >
      {/* Grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-35 mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E")`,
        }}
      />
      {/* Orb 1 */}
      <div className="absolute rounded-full pointer-events-none animate-[orbFloat_12s_ease-in-out_infinite_alternate]"
        style={{ width:380, height:380, top:-120, right:-100, background:'#B8922A', filter:'blur(60px)', opacity:0.25 }} />
      {/* Orb 2 */}
      <div className="absolute rounded-full pointer-events-none animate-[orbFloat_10s_ease-in-out_infinite_alternate]"
        style={{ width:300, height:300, bottom:-80, left:-80, background:'#D4A840', filter:'blur(60px)', opacity:0.2, animationDelay:'2s' }} />

      {/* 3D Canvas — transparent, behind content */}
      <canvas
        ref={canvasRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none opacity-0 transition-opacity duration-[1500ms]"
        style={{ width:600, height:600, maxWidth:'90vw', maxHeight:'90vw' }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-[2] max-w-[960px] text-center">
        <div className="inline-flex items-center gap-3.5 px-[22px] py-[9px] border border-[rgba(184,146,42,0.25)] rounded-full text-[10px] font-normal tracking-[0.32em] text-[#8A6A10] uppercase bg-[rgba(255,255,255,0.5)] backdrop-blur-[10px] mb-9 animate-[fadeUp_1s_0.2s_ease_forwards]">
          <span className="inline-block w-1.5 h-1.5 bg-[#B8922A] rounded-full" />
          Surat, India · Est. 2014 · Fine Jewellery
          <span className="inline-block w-1.5 h-1.5 bg-[#B8922A] rounded-full" />
        </div>

        <h1 className="font-serif font-light leading-[0.95] tracking-[-0.01em] text-[#14120D] mb-8 animate-[fadeUp_1.2s_0.4s_ease_forwards] text-[clamp(56px,9vw,82px)]">
          Crafted in<br />
          <em className="not-italic text-[#B8922A] font-normal relative inline-block">
            <span className="relative">
              Light.
              <span className="absolute bottom-[-8px] left-[5%] w-[90%] h-px pointer-events-none"
                style={{ background:'linear-gradient(90deg, transparent, #B8922A, transparent)' }} />
            </span>
          </em>
        </h1>

        <p className="text-[13px] font-light tracking-[0.14em] leading-[2] text-[#7A7060] max-w-[620px] mx-auto mb-11 animate-[fadeUp_1.2s_0.6s_ease_forwards]">
          Natural and CVD diamonds, precious gemstones and bespoke fine jewellery — handcrafted in
          the diamond capital of the world.
        </p>

        <div className="flex gap-[18px] justify-center flex-wrap animate-[fadeUp_1.2s_0.8s_ease_forwards] max-md:flex-col max-md:w-full">
          <Link href="/shop"
            className="inline-flex items-center gap-2.5 text-[10px] font-normal tracking-[0.28em] text-[#FBF9F5] bg-[#14120D] px-[34px] py-4 border-none cursor-pointer uppercase no-underline transition-all duration-400 relative overflow-hidden group max-md:justify-center hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(184,146,42,0.18)]">
            <span className="absolute inset-0 bg-[#B8922A] z-0 translate-y-full group-hover:translate-y-0 transition-transform duration-[450ms] ease-[cubic-bezier(0.77,0,0.18,1)]" />
            <span className="relative z-10">Explore Collection</span>
          </Link>
          <Link href="/bespoke"
            className="inline-flex items-center gap-2.5 text-[10px] font-normal tracking-[0.28em] text-[#14120D] bg-transparent px-8 py-[15px] border border-[#14120D] cursor-pointer uppercase no-underline transition-all duration-400 hover:bg-[#14120D] hover:text-[#FBF9F5]">
            Commission a Piece
          </Link>
        </div>
      </div>
    </section>
  );
}
