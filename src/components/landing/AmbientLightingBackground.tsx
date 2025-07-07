'use client';

import { useEffect, useRef, useCallback } from 'react';

interface AmbientLight {
  x: number;
  y: number;
  radius: number;
  intensity: number;
  targetX: number;
  targetY: number;
  color: string;
}

export default function AmbientLightingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const lightsRef = useRef<AmbientLight[]>([]);
  const animationFrameId = useRef<number>();

  // Check for reduced motion preference
  const prefersReducedMotion = useRef(false);

  // Skip animations during build
  const isBuildTime = typeof window === 'undefined';

  useEffect(() => {
    if (isBuildTime) return;
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, [isBuildTime]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect && e.touches.length > 0) {
      mouseRef.current = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
  }, []);

  useEffect(() => {
    // Skip animation during build time
    if (isBuildTime) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
    };

    const createLights = () => {
      lightsRef.current = [];
      
      // Create subtle ambient lights
      const lightColors = [
        'rgba(251, 146, 60, 0.02)', // orange
        'rgba(255, 255, 255, 0.01)', // white
        'rgba(251, 146, 60, 0.015)', // orange
      ];

      // Add 3-5 ambient lights
      const lightCount = 3 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < lightCount; i++) {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        
        lightsRef.current.push({
          x,
          y,
          targetX: x,
          targetY: y,
          radius: 300 + Math.random() * 200,
          intensity: 0.3 + Math.random() * 0.3,
          color: lightColors[i % lightColors.length],
        });
      }
    };

    const updateLights = () => {
      lightsRef.current.forEach((light, index) => {
        // Slowly move lights
        if (Math.random() < 0.01) {
          light.targetX = Math.random() * window.innerWidth;
          light.targetY = Math.random() * window.innerHeight;
        }

        // Smooth movement
        light.x += (light.targetX - light.x) * 0.02;
        light.y += (light.targetY - light.y) * 0.02;

        // Subtle intensity variation
        light.intensity = 0.3 + Math.sin(Date.now() * 0.0001 + index) * 0.1;
      });
    };

    const drawLights = () => {
      // Clear canvas
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Draw ambient lights
      lightsRef.current.forEach((light) => {
        const gradient = ctx.createRadialGradient(
          light.x,
          light.y,
          0,
          light.x,
          light.y,
          light.radius
        );

        gradient.addColorStop(0, light.color.replace('0.02', `${light.intensity * 0.02}`));
        gradient.addColorStop(0.5, light.color.replace('0.02', `${light.intensity * 0.01}`));
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(
          light.x - light.radius,
          light.y - light.radius,
          light.radius * 2,
          light.radius * 2
        );
      });

      // Mouse follow light - very subtle
      if (!prefersReducedMotion.current && mouseRef.current.x && mouseRef.current.y) {
        const mouseGradient = ctx.createRadialGradient(
          mouseRef.current.x,
          mouseRef.current.y,
          0,
          mouseRef.current.x,
          mouseRef.current.y,
          150
        );

        mouseGradient.addColorStop(0, 'rgba(251, 146, 60, 0.05)');
        mouseGradient.addColorStop(0.5, 'rgba(251, 146, 60, 0.02)');
        mouseGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = mouseGradient;
        ctx.fillRect(
          mouseRef.current.x - 150,
          mouseRef.current.y - 150,
          300,
          300
        );
      }
    };

    const animate = () => {
      updateLights();
      drawLights();
      animationFrameId.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createLights();
    animate();

    const handleResize = () => {
      resizeCanvas();
      createLights();
    };

    // Event listeners
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [handleMouseMove, handleTouchMove, isBuildTime]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{
        opacity: 1,
        zIndex: 0,
      }}
    />
  );
}