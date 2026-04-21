'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

interface HeroProps {
  onEnquireClick?: () => void;
}

export default function Hero({ onEnquireClick }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || typeof window === 'undefined') return;

    let animFrameId: number;

    const initDiamond = async () => {
      const THREE = (window as any).THREE;
      if (!THREE) return;

      const canvas = canvasRef.current!;
      const size = Math.min(canvas.clientWidth || 600, 600);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.z = 4;
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(size, size, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Build diamond geometry
      const v: number[] = [];
      const tableR = 0.35, crownH = 0.3, pavilionH = 0.9, girdleR = 0.8, segments = 16;
      const tableVerts: [number, number, number][] = [];
      const girdleVerts: [number, number, number][] = [];
      const tip: [number, number, number] = [0, -pavilionH, 0];

      for (let i = 0; i < segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        tableVerts.push([Math.cos(a) * tableR, crownH, Math.sin(a) * tableR]);
        girdleVerts.push([Math.cos(a) * girdleR, 0, Math.sin(a) * girdleR]);
      }
      for (let i = 0; i < segments; i++) {
        const n = (i + 1) % segments;
        v.push(0, crownH + 0.02, 0, ...tableVerts[i], ...tableVerts[n]);
        v.push(...tableVerts[i], ...girdleVerts[i], ...girdleVerts[n]);
        v.push(...tableVerts[i], ...girdleVerts[n], ...tableVerts[n]);
        v.push(...girdleVerts[i], ...tip, ...girdleVerts[n]);
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
      geom.computeVertexNormals();

      const mat = new THREE.MeshPhysicalMaterial({
        color: 0xf5edd6,
        metalness: 0.35,
        roughness: 0.08,
        transmission: 0.75,
        thickness: 0.5,
        ior: 2.4,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        envMapIntensity: 1.2,
        side: THREE.DoubleSide,
        emissive: 0x3a2b10,
        emissiveIntensity: 0.1,
      });

      const diamond = new THREE.Mesh(geom, mat);
      scene.add(diamond);

      const edges = new THREE.EdgesGeometry(geom, 20);
      diamond.add(
        new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({ color: 0xb8922a, transparent: true, opacity: 0.45 })
        )
      );

      scene.add(new THREE.AmbientLight(0xf9f6f1, 0.5));
      const key = new THREE.DirectionalLight(0xffe8b0, 1.2);
      key.position.set(3, 4, 5);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 0.6);
      fill.position.set(-3, 2, 4);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0xd4a840, 0.9);
      rim.position.set(0, -3, -5);
      scene.add(rim);
      const sp1 = new THREE.PointLight(0xffffff, 0.8, 10);
      sp1.position.set(2, 2, 2);
      scene.add(sp1);
      const sp2 = new THREE.PointLight(0xffe8b0, 0.5, 8);
      sp2.position.set(-2, 1, 2);
      scene.add(sp2);

      let mx = 0, my = 0, tx = 0, ty = 0;
      const onMouseMove = (e: MouseEvent) => {
        mx = (e.clientX / window.innerWidth - 0.5) * 0.6;
        my = (e.clientY / window.innerHeight - 0.5) * 0.6;
      };
      window.addEventListener('mousemove', onMouseMove);

      setTimeout(() => {
        if (canvas) canvas.style.opacity = '0.9';
      }, 400);

      const animate = () => {
        animFrameId = requestAnimationFrame(animate);
        tx += (mx - tx) * 0.04;
        ty += (my - ty) * 0.04;
        diamond.rotation.y += 0.004;
        diamond.rotation.x = Math.sin(Date.now() * 0.0005) * 0.15 + ty * 0.3;
        diamond.rotation.z = tx * 0.2;
        sp1.position.x = Math.sin(Date.now() * 0.001) * 2.5;
        sp1.position.y = Math.cos(Date.now() * 0.0013) * 2.5;
        renderer.render(scene, camera);
      };
      animate();

      const onResize = () => {
        const s = Math.min(canvas.clientWidth || 600, 600);
        renderer.setSize(s, s, false);
      };
      window.addEventListener('resize', onResize);

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(animFrameId);
        renderer.dispose();
      };
    };

    // Load Three.js if not available
    if (!(window as any).THREE) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.onload = () => initDiamond();
      document.head.appendChild(script);
    } else {
      initDiamond();
    }

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center px-[52px] py-[60px] overflow-hidden max-md:px-5 max-md:min-h-[80vh] max-md:py-10"
      style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 20%, rgba(184,146,42,0.08), transparent), radial-gradient(ellipse 60% 40% at 10% 80%, rgba(184,146,42,0.05), transparent), #FBF9F5',
      }}
    >
      {/* Grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-35 mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Orb 1 */}
      <div
        className="absolute rounded-full pointer-events-none animate-[orbFloat_12s_ease-in-out_infinite_alternate]"
        style={{
          width: 380,
          height: 380,
          top: -120,
          right: -100,
          background: '#B8922A',
          filter: 'blur(60px)',
          opacity: 0.25,
        }}
      />
      {/* Orb 2 */}
      <div
        className="absolute rounded-full pointer-events-none animate-[orbFloat_10s_ease-in-out_infinite_alternate]"
        style={{
          width: 300,
          height: 300,
          bottom: -80,
          left: -80,
          background: '#D4A840',
          filter: 'blur(60px)',
          opacity: 0.2,
          animationDelay: '2s',
        }}
      />

      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none opacity-0 transition-opacity duration-[1500ms]"
        style={{ width: 600, height: 600, maxWidth: '90vw', maxHeight: '90vw' }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-[2] max-w-[960px] text-center">
        {/* Eyebrow pill */}
        <div className="inline-flex items-center gap-3.5 px-[22px] py-[9px] border border-[rgba(184,146,42,0.25)] rounded-full text-[10px] font-normal tracking-[0.32em] text-[#8A6A10] uppercase bg-[rgba(255,255,255,0.5)] backdrop-blur-[10px] mb-9 animate-[fadeUp_1s_0.2s_ease_forwards]">
          <span className="inline-block w-1.5 h-1.5 bg-[#B8922A] rounded-full" />
          Surat, India · Est. 2014 · Fine Jewellery
          <span className="inline-block w-1.5 h-1.5 bg-[#B8922A] rounded-full" />
        </div>

        {/* Headline */}
        <h1 className="font-serif font-light leading-[0.95] tracking-[-0.01em] text-[#14120D] mb-8 animate-[fadeUp_1.2s_0.4s_ease_forwards] text-[clamp(56px,9vw,132px)]">
          Crafted in
          <br />
          <span className="text-[#B8922A] font-normal relative inline-block">
            <span className="relative">
              Light.
              <span
                className="absolute bottom-[-8px] left-[5%] w-[90%] h-px pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent, #B8922A, transparent)',
                }}
              />
            </span>
          </span>
        </h1>

        {/* Subtitle */}
        <p className="font-serif text-[13px] font-light tracking-[0.14em] leading-[2] text-[#7A7060] max-w-[620px] mx-auto mb-11 animate-[fadeUp_1.2s_0.6s_ease_forwards]">
          Natural and CVD diamonds, precious gemstones and bespoke fine jewellery — handcrafted in
          the diamond capital of the world.
        </p>

        {/* CTAs */}
        <div className="flex gap-[18px] justify-center flex-wrap animate-[fadeUp_1.2s_0.8s_ease_forwards] max-md:flex-col max-md:w-full">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2.5 text-[10px] font-normal tracking-[0.28em] text-[#FBF9F5] bg-[#14120D] px-[34px] py-4 border-none cursor-pointer uppercase no-underline transition-all duration-400 relative overflow-hidden group max-md:justify-center hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(184,146,42,0.18)]"
            style={{ position: 'relative' }}
          >
            <span
              className="absolute inset-0 bg-[#B8922A] z-0 translate-y-full group-hover:translate-y-0 transition-transform duration-[450ms] ease-[cubic-bezier(0.77,0,0.18,1)]"
            />
            <span className="relative z-10">Explore Collection</span>
          </Link>
          <Link
            href="/bespoke"
            className="inline-flex items-center gap-2.5 text-[10px] font-normal tracking-[0.28em] text-[#14120D] bg-transparent px-8 py-[15px] border border-[#14120D] cursor-pointer uppercase no-underline transition-all duration-400 max-md:justify-content-center hover:bg-[#14120D] hover:text-[#FBF9F5]"
          >
            Commission a Piece
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-[9px] tracking-[0.4em] uppercase text-[#7A7060] font-normal animate-[fadeUp_1s_1s_ease_forwards]">
        <span>Scroll</span>
        <div className="w-px h-[50px] bg-[#B0A898] relative overflow-hidden">
          <span className="absolute top-0 left-0 w-full h-[40%] bg-[#B8922A] animate-[scrollDot_2s_ease-in-out_infinite]" />
        </div>
      </div>
    </section>
  );
}
