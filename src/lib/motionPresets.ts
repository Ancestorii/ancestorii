import { Variants, easeOut } from 'framer-motion';

// Shared transition config using valid easing function
export const fadeUpConfig = { duration: 0.8, ease: easeOut };

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: fadeUpConfig 
  },
};

// Optional: You can add more presets later for consistency
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};
