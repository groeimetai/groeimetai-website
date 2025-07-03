'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  FileAudio, 
  Brain, 
  FileText, 
  Cloud, 
  Shield,
  Zap,
  CheckCircle,
  Volume2
} from 'lucide-react';

export const TranscriptionFlow: React.FC = () => {
  const [activePhase, setActivePhase] = useState(0);
  const [audioWaves, setAudioWaves] = useState(Array(20).fill(0));

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePhase((prev) => (prev + 1) % 5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const waveInterval = setInterval(() => {
      setAudioWaves(Array(20).fill(0).map(() => Math.random() * 60 + 20));
    }, 100);
    return () => clearInterval(waveInterval);
  }, []);

  const phases = [
    { name: 'Upload', icon: FileAudio, description: 'Upload meeting recording' },
    { name: 'Transcribe', icon: Mic, description: 'Whisper AI processing' },
    { name: 'Chunk', icon: Zap, description: 'Smart token chunking' },
    { name: 'Process', icon: Brain, description: 'LLM summarization' },
    { name: 'Export', icon: FileText, description: 'Download transcript' },
  ];

  return (
    <div className="w-full h-[500px] flex flex-col items-center justify-center p-8">
      {/* Process Flow */}
      <div className="w-full max-w-4xl mb-12">
        <div className="flex justify-between items-center">
          {phases.map((phase, index) => (
            <React.Fragment key={index}>
              <motion.div
                className="flex flex-col items-center"
                animate={{
                  scale: index === activePhase ? 1.1 : 1,
                }}
              >
                <motion.div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mb-3 ${
                    index <= activePhase ? 'bg-gradient-to-br from-orange to-orange-600' : 'bg-white/10'
                  }`}
                  whileHover={{ scale: 1.05 }}
                >
                  <phase.icon className="w-10 h-10 text-white" />
                </motion.div>
                <h4 className={`font-semibold mb-1 ${index <= activePhase ? 'text-white' : 'text-white/50'}`}>
                  {phase.name}
                </h4>
                <p className="text-xs text-white/60 text-center max-w-[120px]">
                  {phase.description}
                </p>
              </motion.div>
              
              {index < phases.length - 1 && (
                <motion.div
                  className="flex-1 h-0.5 bg-white/10 relative mx-4"
                  key={`line-${index}`}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-orange to-orange-600"
                    initial={{ width: '0%' }}
                    animate={{ width: index < activePhase ? '100%' : '0%' }}
                    transition={{ duration: 0.5 }}
                  />
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Visualization */}
      <div className="relative w-full max-w-4xl h-64 bg-white/5 rounded-lg p-8">
        <AnimatePresence mode="wait">
          {activePhase === 0 && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full"
            >
              <FileAudio className="w-24 h-24 text-orange" />
              <motion.div
                className="absolute"
                animate={{ y: [-20, 0, -20] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-32 h-20 border-2 border-dashed border-orange/50 rounded-lg" />
              </motion.div>
            </motion.div>
          )}

          {activePhase === 1 && (
            <motion.div
              key="audio"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full"
            >
              <div className="flex items-end space-x-1">
                {audioWaves.map((height, index) => (
                  <motion.div
                    key={index}
                    className="w-3 bg-gradient-to-t from-orange to-orange-600 rounded-t"
                    animate={{ height: `${height}px` }}
                    transition={{ duration: 0.1 }}
                  />
                ))}
              </div>
              <Volume2 className="ml-4 w-8 h-8 text-orange animate-pulse" />
            </motion.div>
          )}

          {activePhase === 2 && (
            <motion.div
              key="chunk"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full"
            >
              <div className="grid grid-cols-4 gap-2">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-12 h-6 bg-gradient-to-r from-orange to-orange-600 rounded"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  />
                ))}
              </div>
              <Zap className="absolute right-8 top-8 w-8 h-8 text-yellow-400 animate-pulse" />
            </motion.div>
          )}

          {activePhase === 3 && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-full"
            >
              <div className="relative">
                <Brain className="w-24 h-24 text-orange" />
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-3 h-3 bg-orange rounded-full"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-50px)`,
                      }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [1, 0.5, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.25,
                      }}
                    />
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}

          {activePhase === 4 && (
            <motion.div
              key="output"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full"
            >
              <FileText className="w-20 h-20 text-orange mb-4" />
              <div className="space-y-2 w-full max-w-md">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="h-2 bg-white/20 rounded"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: i * 0.2, duration: 0.5 }}
                  />
                ))}
              </div>
              <CheckCircle className="absolute right-8 bottom-8 w-8 h-8 text-green-400" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-400" />
          <span className="text-xs text-white/60">GDPR Compliant</span>
        </div>

        {/* Cloud Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <Cloud className="w-5 h-5 text-blue-400" />
          <span className="text-xs text-white/60">GCP Powered</span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-12 grid grid-cols-3 gap-8 text-center">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/5 rounded-lg p-4"
        >
          <div className="text-3xl font-bold text-orange">1M+</div>
          <span className="text-sm text-white/70">Tokens Processed</span>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/5 rounded-lg p-4"
        >
          <div className="text-3xl font-bold text-orange">1500+</div>
          <span className="text-sm text-white/70">Hours Transcribed</span>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/5 rounded-lg p-4"
        >
          <div className="text-3xl font-bold text-orange">500+</div>
          <span className="text-sm text-white/70">Active Users</span>
        </motion.div>
      </div>
    </div>
  );
};