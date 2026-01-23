'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export default function GsapTestSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !imageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        { y: 140, rotateX: 10, rotateY: -8 },
        {
          y: -140,
          rotateX: -8,
          rotateY: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="h-[220vh] bg-[#fff9ee] flex items-center justify-center perspective-[1200px]"
    >
      <div className="relative w-[70vw] max-w-4xl">
        <img
          ref={imageRef}
          src="/timeline.png"
          className="rounded-3xl shadow-2xl will-change-transform"
        />
      </div>
    </section>
  );
}
