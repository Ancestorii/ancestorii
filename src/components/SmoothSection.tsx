'use client';

import { motion, useInView, Variants } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

interface SmoothSectionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * SmoothSection
 * Cinematic fade-in + lift + subtle scale, only triggers on scroll down.
 * No reverse animation when scrolling back up.
 */
export default function SmoothSection({ children, className = '' }: SmoothSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: '-10% 0px' });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (inView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [inView, hasAnimated]);

  const parentVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.2,
      },
    },
  };

  const childVariants: Variants = {
    hidden: { opacity: 0, y: 50, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.9,
        ease: [0.33, 1, 0.68, 1],
      },
    },
  };

  return (
    <motion.section
      ref={ref}
      variants={parentVariants}
      initial="hidden"
      animate={hasAnimated ? 'visible' : 'hidden'}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Soft cinematic overlay */}
      <motion.div
        initial={{ opacity: 0.25 }}
        animate={{ opacity: hasAnimated ? 0 : 0.25 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10 pointer-events-none z-0"
      />

      {/* Content with staggered fade-in */}
      <motion.div variants={parentVariants} className="relative z-10">
        {Array.isArray(children)
          ? children.map((child, i) => (
              <motion.div key={i} variants={childVariants}>
                {child}
              </motion.div>
            ))
          : (
              <motion.div variants={childVariants}>
                {children}
              </motion.div>
            )}
      </motion.div>
    </motion.section>
  );
}
