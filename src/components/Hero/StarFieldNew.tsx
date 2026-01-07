'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Particles from '@/components/Particles';

const images = [
  '/family4.jpg',
  '/family9.jpg',
  '/family6.jpg',
  '/album.jpg',
  '/family7.jpg',
];

// Helper for random direction each image
function getRandomDirection() {
  const directions = [
    { x: -40, y: 0 },   // from left
    { x: 40, y: 0 },    // from right
    { x: 0, y: -40 },   // from top
    { x: 0, y: 40 },    // from bottom
    { x: -30, y: -20 }, // slight top-left
    { x: 30, y: 20 },   // slight bottom-right
  ];
  return directions[Math.floor(Math.random() * directions.length)];
}

export default function StarFieldNew() {
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(true);
  const [entryOffsets, setEntryOffsets] = useState<
  { x: number; y: number }[] | null
>(null);

useEffect(() => {
  setEntryOffsets(images.map(getRandomDirection));
}, []);



  // Switch background every 9 seconds
  useEffect(() => {
    const id = setInterval(() => setIndex((p) => (p + 1) % images.length), 9000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 z-0 w-full h-full overflow-hidden bg-black">
      {/* 🖼️ Cinematic slideshow */}
      {entryOffsets &&
       images.map((src, i) => (
          <motion.img
            key={src}
            src={src}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            initial={{
              opacity: 0,
              scale: 1.05,
              x: entryOffsets[i].x,
              y: entryOffsets[i].y,
              filter: 'blur(8px)',
            }}
            animate={{
              opacity: i === index && started ? 1 : 0,
              x: 0,
              y: 0,
              scale: i === index ? [1.05, 1.1, 1.08] : 1.05,
              filter: i === index
                ? [
                    'brightness(1) contrast(1.1) blur(0px)',
                    'brightness(1.05) contrast(1.15) blur(0px)',
                    'brightness(1) contrast(1.1) blur(0px)',
                  ]
                : 'blur(10px)',
            }}
            transition={{
              opacity: { duration: 1.2, ease: 'easeOut' },
              x: { duration: 4.5, ease: 'easeOut' },
              y: { duration: 4.5, ease: 'easeOut' },
              scale: { duration: 10, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' },
              filter: { duration: 20, ease: 'easeInOut', repeat: Infinity },
            }}
          />
        ))}

      {/* ✨ Continuous golden particles (always visible) */}
      <div className="absolute inset-0 z-[5] pointer-events-none">
        <Particles />
      </div>

      {/* 🔥 Black intro overlay */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: started ? 0 : 1 }}
        transition={{ duration: 1.0, ease: 'easeOut' }}
        className="absolute inset-0 bg-black z-[3] pointer-events-none"
      />

      {/* 🌓 Subtle vignette edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none z-[1]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_65%,rgba(0,0,0,0.4)_100%)] pointer-events-none z-[1]" />
    </div>
  );
}
