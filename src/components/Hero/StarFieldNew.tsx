'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import Particles from '@/components/Particles';

const images = [
  '/family4.jpg',
  '/family9.jpg',
  '/family6.jpg',
  '/album.jpg',
  '/family7.jpg',
];

export default function StarFieldNew() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((p) => (p + 1) % images.length);
    }, 9000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-black isolate">
      {/* 🖼️ Cinematic slideshow */}
      <AnimatePresence mode="wait">
        <motion.img
          key={images[index]}
          src={images[index]}
          alt=""
          className="
            absolute inset-0 w-full h-full object-cover
            brightness-[0.65] contrast-[1.05]
          "
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1.08 }}
          exit={{ opacity: 0 }}
          transition={{
            opacity: { duration: 1.2, ease: 'easeOut' },
            scale: { duration: 9, ease: 'easeOut' },
          }}
        />
      </AnimatePresence>

      {/* ✨ Particles */}
      <div className="absolute inset-0 z-[5] pointer-events-none">
        <Particles />
      </div>

      {/* 🌓 Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/55 z-[1]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_65%,rgba(0,0,0,0.45)_100%)] z-[1]" />
    </div>
  );
}
