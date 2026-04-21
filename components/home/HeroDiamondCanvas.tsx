'use client';

import { useEffect, useRef } from 'react';

export default function HeroDiamondCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || typeof window === 'undefined') return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const run = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const THREE = await import('three');
      if (cancelled) return;

      let animFrameId = 0;

      const size = Math.min(canvas.clientWidth || 600, 600);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.z = 4;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(size, size, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);

      const vertices: number[] = [];
      const tableR = 0.35;
      const crownH = 0.3;
      const pavilionH = 0.9;
      const girdleR = 0.8;
      const segments = 16;

      const tableVerts: [number, number, number][] = [];
      const girdleVerts: [number, number, number][] = [];
      const tip: [number, number, number] = [0, -pavilionH, 0];

      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        tableVerts.push([Math.cos(angle) * tableR, crownH, Math.sin(angle) * tableR]);
        girdleVerts.push([Math.cos(angle) * girdleR, 0, Math.sin(angle) * girdleR]);
      }

      for (let i = 0; i < segments; i++) {
        const next = (i + 1) % segments;
        vertices.push(0, crownH + 0.02, 0, ...tableVerts[i], ...tableVerts[next]);
        vertices.push(...tableVerts[i], ...girdleVerts[i], ...girdleVerts[next]);
        vertices.push(...tableVerts[i], ...girdleVerts[next], ...tableVerts[next]);
        vertices.push(...girdleVerts[i], ...tip, ...girdleVerts[next]);
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.computeVertexNormals();

      const material = new THREE.MeshPhysicalMaterial({
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

      const diamond = new THREE.Mesh(geometry, material);
      scene.add(diamond);

      const edgesGeom = new THREE.EdgesGeometry(geometry, 20);
      const edgesMat = new THREE.LineBasicMaterial({ color: 0xb8922a, transparent: true, opacity: 0.45 });
      const edgeLines = new THREE.LineSegments(edgesGeom, edgesMat);
      diamond.add(edgeLines);

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

      let mx = 0;
      let my = 0;
      let tx = 0;
      let ty = 0;
      const onMouseMove = (e: MouseEvent) => {
        mx = (e.clientX / window.innerWidth - 0.5) * 0.6;
        my = (e.clientY / window.innerHeight - 0.5) * 0.6;
      };
      window.addEventListener('mousemove', onMouseMove, { passive: true });

      const fadeTimeout = setTimeout(() => {
        canvas.style.opacity = '0.9';
      }, 400);

      const onResize = () => {
        const s = Math.min(canvas.clientWidth || 600, 600);
        renderer.setSize(s, s, false);
      };
      window.addEventListener('resize', onResize, { passive: true });

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

      cleanup = () => {
        clearTimeout(fadeTimeout);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(animFrameId);
        renderer.dispose();
        geometry.dispose();
        edgesGeom.dispose();
        edgesMat.dispose();
        material.dispose();
      };
    };

    run();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none opacity-0 transition-opacity duration-[1500ms]"
      style={{ width: 600, height: 600, maxWidth: '90vw', maxHeight: '90vw' }}
      aria-hidden="true"
    />
  );
}
