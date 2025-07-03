'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  baseRadius: number;
  color: { r: number; g: number; b: number };
  depth: number; // for parallax effect
  mass: number; // for gravity calculations
}

interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const trailRef = useRef<TrailPoint[]>([]);
  const frameCountRef = useRef(0);
  const performanceRef = useRef({ fps: 60, lastTime: 0 });

  // Check for reduced motion preference
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      previousMouseRef.current = { ...mouseRef.current };
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect && e.touches.length > 0) {
      previousMouseRef.current = { ...mouseRef.current };
      mouseRef.current = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
    };

    const createParticles = () => {
      particles = [];
      // Detect mobile for performance optimization
      const isMobile =
        /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
      const baseCount = Math.floor(
        (window.innerWidth * window.innerHeight) / (isMobile ? 20000 : 12000)
      );
      const particleCount = Math.min(baseCount, isMobile ? 80 : 150); // Lower cap for mobile

      for (let i = 0; i < particleCount; i++) {
        const depth = Math.random() * 0.8 + 0.2; // 0.2 to 1
        const baseRadius = (Math.random() * 2 + 1) * depth;

        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 0.3 * depth,
          vy: (Math.random() - 0.5) * 0.3 * depth,
          radius: baseRadius,
          baseRadius,
          opacity: Math.random() * 0.4 + 0.1,
          color: {
            r: 37 + Math.random() * 20,
            g: 99 + Math.random() * 20,
            b: 235 + Math.random() * 20,
          },
          depth,
          mass: baseRadius * 0.5,
        });
      }
    };

    const updateTrail = () => {
      // Add new trail point
      if (
        Math.abs(mouseRef.current.x - previousMouseRef.current.x) > 2 ||
        Math.abs(mouseRef.current.y - previousMouseRef.current.y) > 2
      ) {
        trailRef.current.push({
          x: mouseRef.current.x,
          y: mouseRef.current.y,
          age: 0,
        });
      }

      // Update and filter trail
      trailRef.current = trailRef.current
        .map((point) => ({ ...point, age: point.age + 1 }))
        .filter((point) => point.age < 20);
    };

    const drawGlowEffect = () => {
      const gradient = ctx.createRadialGradient(
        mouseRef.current.x,
        mouseRef.current.y,
        0,
        mouseRef.current.x,
        mouseRef.current.y,
        100
      );

      gradient.addColorStop(0, 'rgba(37, 99, 235, 0.1)');
      gradient.addColorStop(0.5, 'rgba(37, 99, 235, 0.05)');
      gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(mouseRef.current.x - 100, mouseRef.current.y - 100, 200, 200);
    };

    const drawTrail = () => {
      if (trailRef.current.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(trailRef.current[0].x, trailRef.current[0].y);

      for (let i = 1; i < trailRef.current.length; i++) {
        const point = trailRef.current[i];
        const prevPoint = trailRef.current[i - 1];

        const cp1x = (prevPoint.x + point.x) / 2;
        const cp1y = (prevPoint.y + point.y) / 2;

        ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, cp1x, cp1y);
      }

      const gradient = ctx.createLinearGradient(
        trailRef.current[0].x,
        trailRef.current[0].y,
        trailRef.current[trailRef.current.length - 1].x,
        trailRef.current[trailRef.current.length - 1].y
      );

      gradient.addColorStop(0, 'rgba(37, 99, 235, 0.3)');
      gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();
    };

    const drawParticles = () => {
      // Clear with slight fade for motion blur effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      // Draw glow effect at mouse position
      if (!prefersReducedMotion.current) {
        drawGlowEffect();
      }

      // Sort particles by depth for proper layering
      const sortedParticles = [...particles].sort((a, b) => a.depth - b.depth);

      sortedParticles.forEach((particle, i) => {
        // Dynamic color based on proximity to mouse
        const mouseDistance = Math.sqrt(
          Math.pow(particle.x - mouseRef.current.x, 2) +
            Math.pow(particle.y - mouseRef.current.y, 2)
        );

        const colorIntensity = Math.max(0, 1 - mouseDistance / 300);
        const r = particle.color.r + colorIntensity * 50;
        const g = particle.color.g + colorIntensity * 50;
        const b = particle.color.b + colorIntensity * 20;

        // Draw particle with glow
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius * 2
        );

        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${particle.opacity})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections with dynamic opacity
        for (let j = i + 1; j < sortedParticles.length; j++) {
          const otherParticle = sortedParticles[j];
          const distance = Math.sqrt(
            Math.pow(particle.x - otherParticle.x, 2) + Math.pow(particle.y - otherParticle.y, 2)
          );

          const maxDistance = 150 * ((particle.depth + otherParticle.depth) / 2);

          if (distance < maxDistance) {
            const opacity =
              (1 - distance / maxDistance) * 0.3 * ((particle.depth + otherParticle.depth) / 2);

            ctx.beginPath();
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
            ctx.lineWidth = 0.5 * ((particle.depth + otherParticle.depth) / 2);
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        }
      });

      // Draw mouse trail
      if (!prefersReducedMotion.current) {
        drawTrail();
      }
    };

    const updateParticles = () => {
      particles.forEach((particle) => {
        // Apply gravity effect from mouse
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0 && distance < 200 && !prefersReducedMotion.current) {
          const force = (particle.mass * 20) / (distance * distance);
          const ax = (dx / distance) * force;
          const ay = (dy / distance) * force;

          particle.vx += ax * 0.02;
          particle.vy += ay * 0.02;
        }

        // Apply velocity with damping
        particle.x += particle.vx * particle.depth;
        particle.y += particle.vy * particle.depth;

        // Damping
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        // Parallax effect based on depth
        const parallaxX =
          (mouseRef.current.x - window.innerWidth / 2) * 0.02 * (1 - particle.depth);
        const parallaxY =
          (mouseRef.current.y - window.innerHeight / 2) * 0.02 * (1 - particle.depth);

        particle.x += parallaxX;
        particle.y += parallaxY;

        // Bounce off edges with damping
        if (particle.x < 0 || particle.x > window.innerWidth) {
          particle.vx *= -0.8;
          particle.x = Math.max(0, Math.min(window.innerWidth, particle.x));
        }
        if (particle.y < 0 || particle.y > window.innerHeight) {
          particle.vy *= -0.8;
          particle.y = Math.max(0, Math.min(window.innerHeight, particle.y));
        }

        // Dynamic radius based on velocity
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        particle.radius = particle.baseRadius + speed * 0.5;
      });
    };

    const animate = (currentTime: number) => {
      frameCountRef.current++;

      // Calculate FPS
      if (currentTime - performanceRef.current.lastTime > 1000) {
        performanceRef.current.fps = frameCountRef.current;
        frameCountRef.current = 0;
        performanceRef.current.lastTime = currentTime;
      }

      updateTrail();
      updateParticles();
      drawParticles();

      animationFrameId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    createParticles();
    animate(0);

    const handleResize = () => {
      resizeCanvas();
      createParticles();
    };

    // Event listeners
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [handleMouseMove, handleTouchMove]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{
        opacity: 0.8,
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.5) 100%)',
      }}
    />
  );
}
