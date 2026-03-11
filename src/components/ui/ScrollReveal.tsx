'use client';

import { useRef, ReactNode } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  /** Scroll progress range where animation plays: [start, end]. Default [0, 0.3] */
  range?: [number, number];
}

export default function ScrollReveal({
  children,
  className,
  direction = 'up',
  distance = 30,
  range = [0, 0.3],
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, range, [0, 1]);

  const positiveTranslate = useTransform(scrollYProgress, range, [distance, 0]);
  const negativeTranslate = useTransform(scrollYProgress, range, [-distance, 0]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const translateProp =
    direction === 'up'
      ? { y: positiveTranslate }
      : direction === 'down'
        ? { y: negativeTranslate }
        : direction === 'left'
          ? { x: positiveTranslate }
          : { x: negativeTranslate };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ opacity, ...translateProp }}
    >
      {children}
    </motion.div>
  );
}
