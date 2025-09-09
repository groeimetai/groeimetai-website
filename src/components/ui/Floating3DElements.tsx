'use client';

import { motion } from 'framer-motion';

interface Floating3DElementsProps {
  density?: 'light' | 'medium' | 'dense';
}

export default function Floating3DElements({ density = 'medium' }: Floating3DElementsProps) {
  const elementCount = {
    light: 3,
    medium: 5,
    dense: 8
  };

  const count = elementCount[density];

  const generateRandomElement = (index: number) => {
    const shapes = ['cube', 'sphere', 'pyramid', 'cylinder'];
    const shape = shapes[index % shapes.length];
    
    return {
      id: index,
      shape,
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      size: 20 + Math.random() * 40,
      duration: 15 + Math.random() * 10,
      delay: Math.random() * 5,
      rotation: Math.random() * 360,
      opacity: 0.05 + Math.random() * 0.1
    };
  };

  const elements = Array.from({ length: count }, (_, i) => generateRandomElement(i));

  const getShapeStyle = (element: any) => {
    const baseStyle = {
      width: `${element.size}px`,
      height: `${element.size}px`,
      background: `linear-gradient(135deg, #F87315, #FF8533, #FF6600)`,
      opacity: element.opacity,
      position: 'absolute' as const,
      filter: 'blur(0.5px)',
    };

    switch (element.shape) {
      case 'cube':
        return {
          ...baseStyle,
          borderRadius: '8px',
          boxShadow: `
            0 0 20px rgba(248, 115, 21, 0.3),
            inset 0 0 20px rgba(255, 255, 255, 0.1)
          `,
          transform: `perspective(1000px) rotateX(45deg) rotateY(45deg)`
        };
      case 'sphere':
        return {
          ...baseStyle,
          borderRadius: '50%',
          boxShadow: `
            0 0 25px rgba(248, 115, 21, 0.4),
            inset -5px -5px 15px rgba(0, 0, 0, 0.3),
            inset 5px 5px 15px rgba(255, 255, 255, 0.1)
          `,
          background: `radial-gradient(circle at 30% 30%, #FF8533, #F87315, #FF6600)`
        };
      case 'pyramid':
        return {
          ...baseStyle,
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
          boxShadow: `
            0 0 15px rgba(248, 115, 21, 0.3),
            inset 0 -10px 10px rgba(0, 0, 0, 0.2)
          `,
          transform: `perspective(800px) rotateX(20deg)`
        };
      case 'cylinder':
        return {
          ...baseStyle,
          borderRadius: '50% / 20%',
          boxShadow: `
            0 0 20px rgba(248, 115, 21, 0.3),
            inset 0 5px 10px rgba(255, 255, 255, 0.1),
            inset 0 -5px 10px rgba(0, 0, 0, 0.2)
          `,
          transform: `perspective(1000px) rotateX(60deg)`
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          style={getShapeStyle(element)}
          initial={{
            x: `${element.initialX}vw`,
            y: `${element.initialY}vh`,
            rotate: element.rotation,
          }}
          animate={{
            x: [`${element.initialX}vw`, `${(element.initialX + 30) % 120}vw`, `${element.initialX}vw`],
            y: [`${element.initialY}vh`, `${(element.initialY + 20) % 120}vh`, `${element.initialY}vh`],
            rotate: [element.rotation, element.rotation + 360, element.rotation],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}