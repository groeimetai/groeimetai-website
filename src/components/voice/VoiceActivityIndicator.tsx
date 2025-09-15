'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface VoiceActivityIndicatorProps {
  isActive: boolean;
  sensitivity?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  type?: 'circular' | 'linear' | 'dots';
  color?: 'orange' | 'green' | 'blue' | 'red';
  animated?: boolean;
}

export const VoiceActivityIndicator: React.FC<VoiceActivityIndicatorProps> = ({
  isActive,
  sensitivity = 0.5,
  className,
  size = 'md',
  type = 'circular',
  color = 'orange',
  animated = true,
}) => {
  const [audioLevel, setAudioLevel] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);

  // Size configurations
  const sizeConfig = {
    sm: { width: 20, height: 20, strokeWidth: 2, dotSize: 4, barHeight: 16 },
    md: { width: 32, height: 32, strokeWidth: 3, dotSize: 6, barHeight: 24 },
    lg: { width: 48, height: 48, strokeWidth: 4, dotSize: 8, barHeight: 32 },
  };

  const config = sizeConfig[size];

  // Color configurations
  const colorConfig = {
    orange: {
      primary: '#f97316', // orange-500
      secondary: '#fb923c', // orange-400
      accent: '#fed7aa', // orange-200
    },
    green: {
      primary: '#10b981', // emerald-500
      secondary: '#34d399', // emerald-400
      accent: '#a7f3d0', // emerald-200
    },
    blue: {
      primary: '#3b82f6', // blue-500
      secondary: '#60a5fa', // blue-400
      accent: '#bfdbfe', // blue-200
    },
    red: {
      primary: '#ef4444', // red-500
      secondary: '#f87171', // red-400
      accent: '#fecaca', // red-200
    },
  };

  const colors = colorConfig[color];

  // Initialize audio analysis
  useEffect(() => {
    if (isActive && !isAnalyzing) {
      initializeAudioAnalysis();
    } else if (!isActive && isAnalyzing) {
      stopAudioAnalysis();
    }

    return () => stopAudioAnalysis();
  }, [isActive]);

  const initializeAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // Keep some noise for better activity detection
          autoGainControl: true,
          sampleRate: 44100,
        }
      });

      streamRef.current = stream;
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);

      analyserRef.current = audioContext.createAnalyser();
      analyserRef.current.fftSize = 512;
      analyserRef.current.smoothingTimeConstant = 0.8;

      source.connect(analyserRef.current);
      setIsAnalyzing(true);

      if (animated) {
        startAnimation();
      }
    } catch (error) {
      console.warn('Could not initialize audio analysis:', error);
      setIsAnalyzing(false);
    }
  };

  const stopAudioAnalysis = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    analyserRef.current = null;
    setIsAnalyzing(false);
    setAudioLevel(0);
  };

  const startAnimation = () => {
    const animate = () => {
      if (!analyserRef.current || !isActive) return;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Calculate average amplitude
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;

      // Normalize and apply sensitivity
      const normalizedLevel = Math.min(1, (average / 255) * (1 + sensitivity));
      setAudioLevel(normalizedLevel);

      if (isActive) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();
  };

  // Render circular indicator
  const renderCircularIndicator = () => {
    const radius = (config.width - config.strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (audioLevel * circumference);

    return (
      <div className={cn('relative', className)}>
        <svg
          width={config.width}
          height={config.height}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={config.width / 2}
            cy={config.height / 2}
            r={radius}
            fill="none"
            stroke={colors.accent}
            strokeWidth={config.strokeWidth}
            opacity={0.3}
          />

          {/* Activity circle */}
          <circle
            cx={config.width / 2}
            cy={config.height / 2}
            r={radius}
            fill="none"
            stroke={colors.primary}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn(
              'transition-all duration-150',
              isActive && animated && 'animate-pulse'
            )}
            style={{
              filter: `drop-shadow(0 0 ${Math.max(2, audioLevel * 8)}px ${colors.secondary})`,
            }}
          />

          {/* Center dot */}
          <circle
            cx={config.width / 2}
            cy={config.height / 2}
            r={config.dotSize / 2}
            fill={colors.primary}
            className={cn(
              isActive && animated && audioLevel > 0.1 && 'animate-ping'
            )}
          />
        </svg>
      </div>
    );
  };

  // Render linear indicator
  const renderLinearIndicator = () => {
    const barCount = 12;
    const bars = Array.from({ length: barCount }, (_, i) => {
      const threshold = (i + 1) / barCount;
      const isActive = audioLevel >= threshold;

      return (
        <div
          key={i}
          className={cn(
            'w-1 rounded-full transition-all duration-100',
            isActive ? 'opacity-100' : 'opacity-30'
          )}
          style={{
            height: `${config.barHeight}px`,
            backgroundColor: isActive ? colors.primary : colors.accent,
            transform: isActive && animated ? `scaleY(${0.5 + audioLevel})` : 'scaleY(0.5)',
            filter: isActive ? `drop-shadow(0 0 4px ${colors.secondary})` : 'none',
          }}
        />
      );
    });

    return (
      <div className={cn('flex items-end space-x-1', className)}>
        {bars}
      </div>
    );
  };

  // Render dots indicator
  const renderDotsIndicator = () => {
    const dotCount = 5;
    const dots = Array.from({ length: dotCount }, (_, i) => {
      const threshold = (i + 1) / dotCount;
      const isActiveDot = audioLevel >= threshold;

      return (
        <div
          key={i}
          className={cn(
            'rounded-full transition-all duration-150',
            isActiveDot && animated && 'animate-bounce'
          )}
          style={{
            width: `${config.dotSize}px`,
            height: `${config.dotSize}px`,
            backgroundColor: isActiveDot ? colors.primary : colors.accent,
            opacity: isActiveDot ? 1 : 0.3,
            animationDelay: `${i * 100}ms`,
            filter: isActiveDot ? `drop-shadow(0 0 3px ${colors.secondary})` : 'none',
          }}
        />
      );
    });

    return (
      <div className={cn('flex items-center space-x-1', className)}>
        {dots}
      </div>
    );
  };

  // Don't render anything if not active and no animation
  if (!isActive && audioLevel === 0) {
    return null;
  }

  // Render based on type
  switch (type) {
    case 'linear':
      return renderLinearIndicator();
    case 'dots':
      return renderDotsIndicator();
    case 'circular':
    default:
      return renderCircularIndicator();
  }
};

export default VoiceActivityIndicator;