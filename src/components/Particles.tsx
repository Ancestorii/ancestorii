'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  wobble: number;
  opacity: number;
  layer: number; // 1 = far, 3 = close
};

export default function Particles() {
  const [mounted, setMounted] = useState(false);
  const [effectiveCount, setEffectiveCount] = useState(260);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const vw = () => (typeof window !== 'undefined' ? window.innerWidth : 1200);
  const vh = () => (typeof window !== 'undefined' ? window.innerHeight : 800);

  // ✅ Detect screen size & set count dynamically
  useEffect(() => {
    const calcCount = () => {
      const width = vw();
      if (width < 640) return 20;      // small phones
      if (width < 1024) return 40;    // tablets
      return 80;                      // desktop / large screens
    };

    setEffectiveCount(calcCount());

    const handleResize = () => {
      setEffectiveCount(calcCount());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => setMounted(true), []);

  // ✅ Generate particles based on the adjusted count
  const particles = useMemo<Particle[]>(() => {
    if (!mounted) return [];
    return Array.from({ length: effectiveCount }).map((_, i) => {
      const layer = Math.floor(Math.random() * 3) + 1;
      const sizeBase = [2, 4, 6][layer - 1];
      const speedBase = [20, 35, 55][layer - 1];
      const wobbleBase = [6, 10, 16][layer - 1];
      const opacity = 0.4 + layer * 0.2;

      return {
        id: i,
        x: Math.random() * vw(),
        y: Math.random() * (vh() * 1.4) - vh() * 0.2,
        size: sizeBase + Math.random() * sizeBase * 0.8,
        speed: speedBase + Math.random() * speedBase * 0.6,
        wobble: wobbleBase + Math.random() * 4,
        opacity,
        layer,
      };
    });
  }, [mounted, effectiveCount]);

  // ✅ Animation loop
  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    const els = new Map<number, HTMLDivElement>();

    particles.forEach((p) => {
      const el = document.createElement('div');
      el.style.position = 'absolute';
      el.style.borderRadius = '9999px';
      el.style.pointerEvents = 'none';
      el.style.width = `${p.size}px`;
      el.style.height = `${p.size}px`;
      el.style.left = `${p.x}px`;
      el.style.top = `${p.y}px`;
      el.style.opacity = `${p.opacity * 0.2}`; // reduce brightness for faint dust
      el.style.mixBlendMode = 'screen';

      const glow =
  p.layer === 3
    ? '0 0 10px rgba(243,217,155,0.4), 0 0 18px rgba(243,217,155,0.2)'
    : p.layer === 2
    ? '0 0 8px rgba(243,217,155,0.3), 0 0 14px rgba(243,217,155,0.15)'
    : '0 0 5px rgba(243,217,155,0.2)';


      el.style.background =
        'radial-gradient(circle, rgba(243,217,155,1) 0%, rgba(243,217,155,0.3) 60%, rgba(243,217,155,0) 80%)';
        el.style.animation = `shimmer ${6 + Math.random() * 4}s ease-in-out infinite alternate`;


      containerRef.current!.appendChild(el);
      els.set(p.id, el);
    });

    let last = performance.now();
    const loop = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;

      const height = vh();
      const width = vw();

      particles.forEach((p) => {
        p.y += p.speed * dt;
        const wobbleX = Math.sin((t / 1000) * (0.6 + (p.id % 3))) * p.wobble;

        // recycle to just above top when leaving bottom
        if (p.y - p.size > height) {
          p.y = -p.size - Math.random() * 40;
          p.x = Math.random() * width;
        }

        const el = els.get(p.id)!;
        el.style.transform = `translate3d(${wobbleX}px, 0, 0)`;
        el.style.left = `${p.x}px`;
        el.style.top = `${p.y}px`;
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    // pause animation when tab hidden
    const onVis = () => {
      if (document.hidden) {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      } else if (!rafRef.current) {
        last = performance.now();
        rafRef.current = requestAnimationFrame(loop);
      }
    };
    document.addEventListener('visibilitychange', onVis);

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener('visibilitychange', onVis);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      els.forEach((el) => el.remove());
      els.clear();
    };
  }, [mounted, particles]);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    />
  );
  <style jsx global>{`
  @keyframes shimmer {
    0% {
      opacity: 0.15;
    }
    100% {
      opacity: 0.35;
    }
  }
`}</style>

}
