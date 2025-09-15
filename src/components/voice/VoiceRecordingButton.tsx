'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceRecordingButtonProps {
  isListening: boolean;
  isRecording: boolean;
  isSupported: boolean;
  error: string | null;
  permission: 'granted' | 'denied' | 'prompt' | 'unknown';
  onStartListening: () => void;
  onStopListening: () => void;
  onRequestPermission: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'circular' | 'square';
  pushToTalk?: boolean;
  showWaveform?: boolean;
  disabled?: boolean;
}

export const VoiceRecordingButton: React.FC<VoiceRecordingButtonProps> = ({
  isListening,
  isRecording,
  isSupported,
  error,
  permission,
  onStartListening,
  onStopListening,
  onRequestPermission,
  className,
  size = 'md',
  variant = 'circular',
  pushToTalk = false,
  showWaveform = true,
  disabled = false,
}) => {
  const [audioData, setAudioData] = useState<number[]>([]);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Size configurations
  const sizeConfig = {
    sm: {
      button: 'w-8 h-8 p-1',
      icon: 'w-4 h-4',
      pulse: 'w-12 h-12',
      waveform: 'h-6',
    },
    md: {
      button: 'w-10 h-10 p-2',
      icon: 'w-6 h-6',
      pulse: 'w-16 h-16',
      waveform: 'h-8',
    },
    lg: {
      button: 'w-12 h-12 p-3',
      icon: 'w-8 h-8',
      pulse: 'w-20 h-20',
      waveform: 'h-10',
    },
  };

  const config = sizeConfig[size];

  // Initialize audio analyser for waveform visualization
  useEffect(() => {
    if (isRecording && showWaveform && !analyserRef.current) {
      initializeAudioAnalyser();
    }

    if (!isRecording && analyserRef.current) {
      cleanup();
    }

    return cleanup;
  }, [isRecording, showWaveform]);

  const initializeAudioAnalyser = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      analyserRef.current = audioContext.createAnalyser();
      analyserRef.current.fftSize = 256;

      source.connect(analyserRef.current);
      startVisualization();
    } catch (error) {
      console.warn('Could not initialize audio analyser:', error);
    }
  };

  const startVisualization = () => {
    if (!analyserRef.current) return;

    const updateWaveform = () => {
      if (!analyserRef.current) return;

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Convert to normalized values for visualization
      const normalizedData = Array.from(dataArray)
        .slice(0, 32) // Take first 32 frequency bins
        .map(value => value / 255);

      setAudioData(normalizedData);

      if (isRecording) {
        animationRef.current = requestAnimationFrame(updateWaveform);
      }
    };

    updateWaveform();
  };

  const cleanup = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    analyserRef.current = null;
    setAudioData([]);
  };

  const handleClick = () => {
    if (disabled) return;

    if (!isSupported) {
      return;
    }

    if (permission !== 'granted') {
      onRequestPermission();
      return;
    }

    if (isListening || isRecording) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  const handleMouseDown = () => {
    if (pushToTalk && permission === 'granted' && !isListening && !disabled) {
      onStartListening();
    }
  };

  const handleMouseUp = () => {
    if (pushToTalk && isListening) {
      onStopListening();
    }
  };

  // Get button state styles
  const getButtonStyles = () => {
    if (disabled) {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed';
    }

    if (error) {
      return 'bg-red-500 hover:bg-red-600 text-white';
    }

    if (permission === 'denied') {
      return 'bg-yellow-500 hover:bg-yellow-600 text-white';
    }

    if (!isSupported) {
      return 'bg-gray-400 hover:bg-gray-500 text-white cursor-not-allowed';
    }

    if (isListening || isRecording) {
      return 'bg-red-500 hover:bg-red-600 text-white animate-pulse';
    }

    return 'bg-orange hover:bg-orange-600 text-white hover:shadow-lg transform hover:scale-105';
  };

  // Get icon based on state
  const getIcon = () => {
    if (error || permission === 'denied') {
      return <AlertCircle className={config.icon} />;
    }

    if (isListening || isRecording) {
      return pushToTalk ? <Square className={config.icon} /> : <MicOff className={config.icon} />;
    }

    return <Mic className={config.icon} />;
  };

  // Get tooltip text
  const getTooltipText = () => {
    if (disabled) return 'Voice disabled';
    if (!isSupported) return 'Speech Recognition not supported';
    if (permission === 'denied') return 'Microphone permission denied - click to retry';
    if (permission !== 'granted') return 'Click to enable microphone';
    if (error) return `Error: ${error}`;
    if (isListening) return pushToTalk ? 'Release to stop recording' : 'Click to stop listening';
    return pushToTalk ? 'Hold to speak' : 'Click to start voice input';
  };

  return (
    <div className="relative flex items-center">
      {/* Pulse animation when recording */}
      {(isListening || isRecording) && (
        <div
          className={cn(
            'absolute inset-0 rounded-full bg-orange opacity-25 animate-ping',
            config.pulse,
            'pointer-events-none',
            variant === 'square' && 'rounded-lg'
          )}
          style={{
            transform: 'translate(-50%, -50%)',
            left: '50%',
            top: '50%',
          }}
        />
      )}

      {/* Main recording button */}
      <button
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // Stop recording if mouse leaves while holding
        disabled={disabled || !isSupported}
        className={cn(
          'relative z-10 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange focus:ring-offset-2',
          config.button,
          variant === 'square' && 'rounded-lg',
          getButtonStyles(),
          className
        )}
        title={getTooltipText()}
        aria-label={getTooltipText()}
      >
        {getIcon()}

        {/* Recording indicator dot */}
        {isRecording && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white" />
        )}
      </button>

      {/* Waveform visualization */}
      {showWaveform && isRecording && audioData.length > 0 && (
        <div className={cn(
          'ml-2 flex items-center space-x-1',
          config.waveform
        )}>
          {audioData.map((value, index) => (
            <div
              key={index}
              className="bg-orange rounded-full transition-all duration-100"
              style={{
                width: '2px',
                height: `${Math.max(2, value * 100)}%`,
                opacity: 0.6 + (value * 0.4),
              }}
            />
          ))}
        </div>
      )}

      {/* Status indicator */}
      <div className="ml-2 flex flex-col items-start">
        {isListening && (
          <span className="text-xs text-orange font-medium animate-pulse">
            Listening...
          </span>
        )}
        {error && (
          <span className="text-xs text-red-500 font-medium">
            {error.includes('Geen spraak') ? 'Speak now' : 'Error'}
          </span>
        )}
        {permission === 'denied' && (
          <span className="text-xs text-yellow-600 font-medium">
            Permission needed
          </span>
        )}
        {!isSupported && (
          <span className="text-xs text-gray-500 font-medium">
            Not supported
          </span>
        )}
      </div>
    </div>
  );
};

export default VoiceRecordingButton;