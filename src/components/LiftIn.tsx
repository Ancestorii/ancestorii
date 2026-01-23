'use client';

import { motion } from 'framer-motion';

interface LiftInProps {
  children: React.ReactNode;
  className?: string;
}

export default function LiftIn({ children, className = '' }: LiftInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.75,
        ease: [0.22, 1, 0.36, 1], // smooth, premium lift (unchanged)
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
