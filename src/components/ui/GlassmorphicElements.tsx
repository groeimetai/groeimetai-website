'use client';

import { motion } from 'framer-motion';

interface GlassmorphicElementsProps {
  pageType?: 'hero' | 'services' | 'cases' | 'about';
}

export default function GlassmorphicElements({ pageType = 'hero' }: GlassmorphicElementsProps) {
  const getElements = () => {
    switch (pageType) {
      case 'hero':
        return [
          {
            id: 1,
            size: { w: 120, h: 80 },
            position: { top: '15%', right: '8%' },
            shape: 'rounded-[2rem_4rem_2rem_4rem]',
            delay: 0,
            duration: 16
          },
          {
            id: 2,
            size: { w: 80, h: 120 },
            position: { bottom: '20%', left: '6%' },
            shape: 'rounded-[3rem_1rem_3rem_1rem]',
            delay: 4,
            duration: 20
          },
          {
            id: 3,
            size: { w: 60, h: 60 },
            position: { top: '60%', right: '12%' },
            shape: 'rounded-[50%]',
            delay: 8,
            duration: 14
          }
        ];
      case 'services':
        return [
          {
            id: 1,
            size: { w: 100, h: 100 },
            position: { top: '25%', left: '5%' },
            shape: 'rounded-[2rem_3rem_2rem_3rem]',
            delay: 2,
            duration: 18
          }
        ];
      case 'cases':
        return [
          {
            id: 1,
            size: { w: 90, h: 140 },
            position: { top: '30%', right: '4%' },
            shape: 'rounded-[4rem_1rem_4rem_1rem]',
            delay: 3,
            duration: 22
          }
        ];
      default:
        return [];
    }
  };

  const elements = getElements();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className={`absolute ${element.shape}`}
          style={{
            width: `${element.size.w}px`,
            height: `${element.size.h}px`,
            ...element.position,
            background: `
              linear-gradient(135deg, 
                rgba(248, 115, 21, 0.15) 0%,
                rgba(255, 133, 51, 0.25) 30%,
                rgba(255, 102, 0, 0.20) 60%,
                rgba(248, 115, 21, 0.10) 100%
              )
            `,
            backdropFilter: 'blur(20px) saturate(200%)',
            border: '1px solid rgba(248, 115, 21, 0.2)',
            boxShadow: `
              0 25px 50px -12px rgba(248, 115, 21, 0.25),
              inset 0 1px 0 rgba(255, 255, 255, 0.3),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1),
              0 0 40px rgba(248, 115, 21, 0.1)
            `,
            opacity: 0.8,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            rotateZ: [0, 5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "mirror"
          }}
        >
          {/* Inner glow/highlight */}
          <div 
            className={`absolute inset-2 ${element.shape} opacity-40`}
            style={{
              background: `
                linear-gradient(135deg,
                  rgba(255, 255, 255, 0.4) 0%,
                  rgba(248, 115, 21, 0.3) 30%,
                  rgba(255, 133, 51, 0.2) 60%,
                  transparent 100%
                )
              `,
              filter: 'blur(8px)',
            }}
          />
          
          {/* Top highlight */}
          <div 
            className={`absolute inset-x-2 top-2 h-6 ${element.shape} opacity-60`}
            style={{
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.6), transparent)',
              filter: 'blur(4px)',
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}