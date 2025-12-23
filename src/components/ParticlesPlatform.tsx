'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Particle = {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  baseSize: number;
  opacity: number;
  pulseSpeed: number;
};

export default function ParticlesPlatform() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [count, setCount] = useState(65);

  const vw = () => (typeof window !== 'undefined' ? window.innerWidth : 1200);
  const vh = () => (typeof window !== 'undefined' ? window.innerHeight : 800);

  useEffect(() => {
    const calc = () => {
      const w = vw();
      if (w < 640) return 35;
      if (w < 1024) return 60;
      return 85;
    };
    setCount(calc());
    const resize = () => setCount(calc());
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => setMounted(true), []);

  const particles = useMemo<Particle[]>(() => {
    if (!mounted) return [];
    return Array.from({ length: count }).map((_, i) => {
      const size = 3.5 + Math.random() * 5;
      const speed = 0.1 + Math.random() * 0.50; // very slow
      const angle = Math.random() * Math.PI * 2;
      return {
        id: i,
        x: Math.random() * vw(),
        y: Math.random() * vh(),
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
        size,
        baseSize: size,
        opacity: 0.25 + Math.random() * 0.3,
        pulseSpeed: 0.6 + Math.random() * 0.4,
      };
    });
  }, [mounted, count]);

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
      el.style.opacity = `${p.opacity}`;
      el.style.mixBlendMode = 'screen';

      // ✨ Soft deep gold gradient with glow
      el.style.background =
        'radial-gradient(circle, rgba(212,175,55,0.95) 0%, rgba(212,175,55,0.45) 40%, rgba(212,175,55,0) 80%)';
      el.style.boxShadow =
        '0 0 10px rgba(212,175,55,0.35), 0 0 25px rgba(212,175,55,0.25), 0 0 45px rgba(255,240,180,0.15)';
      el.style.animation = `softPulse ${6 + Math.random() * 4}s ease-in-out infinite alternate`;

      containerRef.current!.appendChild(el);
      els.set(p.id, el);
    });

    let last = performance.now();
    const loop = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      const width = vw();
      const height = vh();

      particles.forEach((p) => {
        // drift slowly
        p.x += p.dx * dt * 40;
        p.y += p.dy * dt * 40;

        // gentle edge wrap
        if (p.x < -20) p.x = width + 10;
        if (p.x > width + 20) p.x = -10;
        if (p.y < -20) p.y = height + 10;
        if (p.y > height + 20) p.y = -10;

        const el = els.get(p.id)!;
        el.style.left = `${p.x}px`;
        el.style.top = `${p.y}px`;
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
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
}

<style jsx global>{`
  @keyframes softPulse {
    0% {
      transform: scale(1);
      opacity: 0.25;
      filter: brightness(1);
    }
    100% {
      transform: scale(1.15);
      opacity: 0.55;
      filter: brightness(1.1);
    }
  }
`}</style>
