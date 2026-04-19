'use client';

import { useEffect, useRef } from 'react';

export default function FloatingGems() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Desktop only
    if (window.innerWidth < 900) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    let THREE: typeof import('three') | null = null;

    async function init() {
      THREE = await import('three');
      if (!THREE || !canvas) return;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.z = 8;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

      const gems: Array<{
        mesh: InstanceType<typeof THREE.Mesh>;
        speed: number;
        floatSpeed: number;
        floatAmp: number;
        baseY: number;
      }> = [];

      for (let i = 0; i < 6; i++) {
        const geom = new THREE.OctahedronGeometry(0.3 + Math.random() * 0.2, 0);
        const mat = new THREE.MeshPhysicalMaterial({
          color: 0xe8d898,
          metalness: 0.5,
          roughness: 0.1,
          transmission: 0.8,
          ior: 2.4,
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 10,
          -2 - Math.random() * 4
        );
        scene.add(mesh);
        gems.push({
          mesh,
          speed: 0.001 + Math.random() * 0.002,
          floatSpeed: 0.0005 + Math.random() * 0.0008,
          floatAmp: 0.3 + Math.random() * 0.3,
          baseY: mesh.position.y,
        });
      }

      const ambient = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambient);
      const dir = new THREE.DirectionalLight(0xffe8b0, 0.8);
      dir.position.set(3, 3, 5);
      scene.add(dir);

      function animate() {
        animId = requestAnimationFrame(animate);
        const t = Date.now();
        gems.forEach((g) => {
          g.mesh.rotation.y += g.speed;
          g.mesh.rotation.x += g.speed * 0.7;
          g.mesh.position.y = g.baseY + Math.sin(t * g.floatSpeed) * g.floatAmp;
        });
        renderer.render(scene, camera);
      }
      animate();

      function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
      window.addEventListener('resize', onResize);

      return () => {
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(animId);
        renderer.dispose();
      };
    }

    let cleanup: (() => void) | undefined;
    init().then((fn) => { cleanup = fn; });

    return () => {
      cancelAnimationFrame(animId);
      cleanup?.();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.25,
      }}
    />
  );
}
