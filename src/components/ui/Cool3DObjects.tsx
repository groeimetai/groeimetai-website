'use client';

import { motion } from 'framer-motion';

interface Cool3DObjectsProps {
  pageType?: 'hero' | 'services' | 'cases' | 'about';
}

export default function Cool3DObjects({ pageType = 'hero' }: Cool3DObjectsProps) {
  const getObjects = () => {
    switch (pageType) {
      case 'hero':
        return [
          {
            id: 1,
            type: 'spiral',
            size: { w: 80, h: 80 },
            position: { top: '20%', right: '10%' },
            delay: 0,
            duration: 20
          },
          {
            id: 2,
            type: 'star',
            size: { w: 60, h: 60 },
            position: { bottom: '25%', left: '8%' },
            delay: 5,
            duration: 25
          },
          {
            id: 3,
            type: 'cylinder',
            size: { w: 40, h: 80 },
            position: { top: '60%', right: '15%' },
            delay: 10,
            duration: 18
          },
          {
            id: 4,
            type: 'sphere',
            size: { w: 50, h: 50 },
            position: { top: '40%', left: '12%' },
            delay: 3,
            duration: 22
          }
        ];
      case 'services':
        return [
          {
            id: 1,
            type: 'torus',
            size: { w: 70, h: 70 },
            position: { top: '30%', left: '5%' },
            delay: 2,
            duration: 24
          },
          {
            id: 2,
            type: 'cube',
            size: { w: 45, h: 45 },
            position: { bottom: '20%', right: '8%' },
            delay: 8,
            duration: 16
          }
        ];
      case 'cases':
        return [
          {
            id: 1,
            type: 'helix',
            size: { w: 50, h: 100 },
            position: { top: '25%', right: '6%' },
            delay: 4,
            duration: 30
          }
        ];
      default:
        return [];
    }
  };

  const renderObject = (obj: any) => {
    const baseStyle = {
      width: `${obj.size.w}px`,
      height: `${obj.size.h}px`,
      position: 'absolute' as const,
      ...obj.position,
    };

    switch (obj.type) {
      case 'spiral':
        return (
          <motion.div
            style={{
              ...baseStyle,
              background: `
                conic-gradient(
                  from 0deg,
                  #F87315 0deg,
                  #FF8533 45deg,
                  #FF6600 90deg,
                  #F87315 135deg,
                  #FF8533 180deg,
                  #FF6600 225deg,
                  #F87315 270deg,
                  #FF8533 315deg,
                  #F87315 360deg
                )
              `,
              borderRadius: '50%',
              opacity: 0.4,
              filter: 'drop-shadow(0 20px 40px rgba(248, 115, 21, 0.3))',
              transform: 'perspective(1000px) rotateX(60deg)',
            }}
            animate={{
              rotateZ: [0, 360],
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: obj.duration,
              delay: obj.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {/* Inner spiral highlight */}
            <div
              style={{
                position: 'absolute',
                inset: '20%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(4px)',
              }}
            />
          </motion.div>
        );

      case 'star':
        return (
          <motion.div
            style={{
              ...baseStyle,
              background: `linear-gradient(45deg, #F87315, #FF8533, #FF6600)`,
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              opacity: 0.5,
              filter: 'drop-shadow(0 15px 30px rgba(248, 115, 21, 0.4))',
            }}
            animate={{
              rotateZ: [0, 180, 360],
              y: [0, -25, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: obj.duration,
              delay: obj.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Star highlight */}
            <div
              style={{
                position: 'absolute',
                inset: '30%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 60%)',
                clipPath: 'inherit',
                filter: 'blur(2px)',
              }}
            />
          </motion.div>
        );

      case 'cylinder':
        return (
          <motion.div
            style={{
              ...baseStyle,
              background: `
                linear-gradient(to bottom,
                  #FF8533 0%,
                  #F87315 50%,
                  #FF6600 100%
                )
              `,
              borderRadius: '50% / 20%',
              opacity: 0.45,
              filter: 'drop-shadow(0 25px 50px rgba(248, 115, 21, 0.4))',
              transform: 'perspective(800px) rotateX(75deg)',
            }}
            animate={{
              rotateY: [0, 360],
              x: [0, 30, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: obj.duration,
              delay: obj.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Cylinder top highlight */}
            <div
              style={{
                position: 'absolute',
                top: '-5%',
                left: '10%',
                right: '10%',
                height: '30%',
                background: 'linear-gradient(ellipse, rgba(255,255,255,0.6) 0%, transparent 100%)',
                borderRadius: '50%',
                filter: 'blur(3px)',
              }}
            />
          </motion.div>
        );

      case 'sphere':
        return (
          <motion.div
            style={{
              ...baseStyle,
              background: `
                radial-gradient(circle at 30% 30%,
                  #FF8533 0%,
                  #F87315 40%,
                  #FF6600 70%,
                  #D66613 100%
                )
              `,
              borderRadius: '50%',
              opacity: 0.6,
              filter: 'drop-shadow(0 20px 40px rgba(248, 115, 21, 0.5))',
            }}
            animate={{
              y: [0, -35, 0],
              x: [0, 20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: obj.duration,
              delay: obj.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Sphere highlight */}
            <div
              style={{
                position: 'absolute',
                top: '20%',
                left: '25%',
                width: '30%',
                height: '30%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(2px)',
              }}
            />
          </motion.div>
        );

      case 'torus':
        return (
          <motion.div
            style={{
              ...baseStyle,
              background: `conic-gradient(from 45deg, #F87315, #FF8533, #FF6600, #F87315)`,
              borderRadius: '50%',
              opacity: 0.5,
              filter: 'drop-shadow(0 25px 50px rgba(248, 115, 21, 0.4))',
            }}
            animate={{
              rotateZ: [0, 360],
              y: [0, -20, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: obj.duration,
              delay: obj.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {/* Torus hole */}
            <div
              style={{
                position: 'absolute',
                top: '35%',
                left: '35%',
                width: '30%',
                height: '30%',
                background: 'rgba(8, 13, 20, 0.8)',
                borderRadius: '50%',
                boxShadow: 'inset 0 0 15px rgba(0,0,0,0.8)',
              }}
            />
            {/* Torus highlight */}
            <div
              style={{
                position: 'absolute',
                top: '15%',
                left: '20%',
                width: '25%',
                height: '25%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(3px)',
              }}
            />
          </motion.div>
        );

      case 'cube':
        return (
          <motion.div
            style={{
              ...baseStyle,
              background: `linear-gradient(135deg, #F87315 0%, #FF8533 50%, #FF6600 100%)`,
              opacity: 0.4,
              transform: 'perspective(1000px) rotateX(45deg) rotateY(45deg)',
              filter: 'drop-shadow(0 20px 40px rgba(248, 115, 21, 0.4))',
            }}
            animate={{
              rotateX: [45, 90, 45],
              rotateY: [45, 135, 45],
              y: [0, -25, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: obj.duration,
              delay: obj.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Cube faces */}
            <div
              style={{
                position: 'absolute',
                inset: '10%',
                background: 'linear-gradient(45deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
                filter: 'blur(2px)',
              }}
            />
          </motion.div>
        );

      case 'helix':
        return (
          <motion.div
            style={{
              ...baseStyle,
              background: `
                linear-gradient(to bottom,
                  #FF8533 0%,
                  #F87315 25%,
                  #FF6600 50%,
                  #F87315 75%,
                  #FF8533 100%
                )
              `,
              borderRadius: '40% 60% 30% 70%',
              opacity: 0.45,
              filter: 'drop-shadow(0 30px 60px rgba(248, 115, 21, 0.4))',
              transform: 'perspective(1000px) rotateX(30deg) rotateZ(15deg)',
            }}
            animate={{
              rotateY: [0, 360],
              x: [0, -40, 0],
              y: [0, -20, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: obj.duration,
              delay: obj.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {/* Helix highlight bands */}
            <div
              style={{
                position: 'absolute',
                top: '20%',
                left: '15%',
                right: '15%',
                height: '15%',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                filter: 'blur(2px)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '65%',
                left: '15%',
                right: '15%',
                height: '15%',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                filter: 'blur(2px)',
              }}
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  const objects = getObjects();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {objects.map((obj) => (
        <div key={obj.id}>
          {renderObject(obj)}
        </div>
      ))}
    </div>
  );
}