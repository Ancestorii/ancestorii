'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const images = [
  '/family4.jpg',
  '/family9.jpg',
  '/family6.jpg',
  '/album.jpg',
  '/family7.jpg',
];

export default function HeroVisual() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => {
        const nextIndex = (prev + 1) % images.length;

        // preload next image
        const img = new window.Image();
        img.src = images[nextIndex];

        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(id);
  }, []); // ✅ EMPTY — stays constant

  return (
    <div className="relative w-full h-[42vh] sm:h-[50vh] lg:h-full overflow-hidden">

      {/* BASE IMAGE (prevents black flash) */}
      <Image
        src={images[0]}
        alt=""
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 object-cover brightness-[0.92] sm:brightness-[0.78] scale-[1.06]"
      />

      {/* CINEMATIC WARMTH */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_bottom,rgba(230,194,110,0.10),transparent_45%,rgba(0,0,0,0.28))]" />

      {/* IMAGES */}
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={i === 0}
          sizes="100vw"
          className={`
            absolute inset-0 object-cover
            brightness-[0.92] sm:brightness-[0.78]
            transition-all duration-[2200ms] ease-[cubic-bezier(0.4,0,0.2,1)]
            ${i === index ? 'opacity-100 scale-[1.06]' : 'opacity-0 scale-[1.02]'}
          `}
        />
      ))}

      {/* VIGNETTE */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_55%,rgba(0,0,0,0.5)_100%)]" />
      </div>

      {/* SOFT CONTAINMENT */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/30 z-[1] hidden sm:block" />

    </div>
  );
}