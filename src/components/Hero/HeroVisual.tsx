'use client';

import { useEffect, useState } from 'react';

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
      setIndex((i) => (i + 1) % images.length);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full h-[42vh] sm:h-[50vh] md:h-full overflow-hidden">
      {/* ambient warmth */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(230,194,110,0.12),transparent_65%)]" />

      {/* Images */}
      {images.map((src, i) => (
  <img
    key={src}
    src={src}
    alt=""
    loading={i === 0 ? 'eager' : 'lazy'}
    decoding="async"
    className={`
      absolute inset-0 w-full h-full object-cover
      brightness-[0.9] sm:brightness-[0.75]
      transition-opacity duration-[1600ms] ease-in-out
      ${i === index ? 'opacity-100' : 'opacity-0'}
    `}
  />
))}


      {/* soft containment */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/25 z-[1] hidden sm:block" />
    </div>
  );
}
