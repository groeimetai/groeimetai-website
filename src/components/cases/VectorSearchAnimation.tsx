'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Database,
  Brain,
  Layers,
  Target,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  FileText,
  Users,
} from 'lucide-react';

export const VectorSearchAnimation: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showVectors, setShowVectors] = useState(false);
  const [matchedTemplates, setMatchedTemplates] = useState<number[]>([]);

  const steps = [
    'User describes issue',
    'Convert to vector',
    'Search vector space',
    'Generate follow-ups',
    'Route to team',
  ];

  const templates = [
    { id: 1, name: 'Password Reset', vector: [0.8, 0.2, 0.1], team: 'Identity Team' },
    { id: 2, name: 'Software Install', vector: [0.1, 0.9, 0.3], team: 'IT Support' },
    { id: 3, name: 'Access Request', vector: [0.7, 0.3, 0.8], team: 'Security Team' },
    { id: 4, name: 'Network Issues', vector: [0.2, 0.6, 0.9], team: 'Network Ops' },
    { id: 5, name: 'Hardware Problem', vector: [0.3, 0.8, 0.5], team: 'Hardware Support' },
    { id: 6, name: 'Account Locked', vector: [0.9, 0.1, 0.4], team: 'Identity Team' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = (prev + 1) % 5;

        if (next === 0) {
          setSearchQuery('');
          setShowVectors(false);
          setMatchedTemplates([]);
        } else if (next === 1) {
          setSearchQuery('Cannot access my email account');
        } else if (next === 2) {
          setShowVectors(true);
        } else if (next === 3) {
          setMatchedTemplates([1, 3, 6]);
        }

        return next;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[500px] flex flex-col items-center justify-center p-8">
      {/* Progress Steps */}
      <div className="w-full max-w-4xl mb-8">
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  index <= currentStep ? 'bg-orange' : 'bg-white/10'
                }`}
                animate={{
                  scale: index === currentStep ? 1.2 : 1,
                }}
              >
                {index < currentStep ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : (
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                )}
              </motion.div>
              <span
                className={`text-xs text-center ${index <= currentStep ? 'text-white' : 'text-white/50'}`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Visualization */}
      <div className="relative w-full max-w-4xl h-80">
        {/* User Input */}
        <AnimatePresence>
          {currentStep >= 0 && (
            <motion.div
              className="absolute left-0 top-1/2 -translate-y-1/2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-5 h-5 text-orange" />
                  <span className="text-sm font-medium">User Query</span>
                </div>
                <motion.p
                  className="text-sm text-white/80 max-w-[200px]"
                  animate={{ opacity: searchQuery ? 1 : 0.3 }}
                >
                  {searchQuery || 'Waiting for input...'}
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vector Space */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="relative w-64 h-64"
            animate={{
              opacity: showVectors ? 1 : 0.2,
            }}
          >
            {/* Vector Database Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange/10 to-orange/20 rounded-lg" />

            {/* Template Vectors */}
            {templates.map((template, index) => {
              const angle = (index * 2 * Math.PI) / templates.length;
              const radius = 80 + template.vector[0] * 20;
              const x = 128 + radius * Math.cos(angle);
              const y = 128 + radius * Math.sin(angle);

              return (
                <motion.div
                  key={template.id}
                  className="absolute w-3 h-3"
                  style={{ left: x, top: y }}
                  animate={{
                    scale: matchedTemplates.includes(template.id) ? 2 : 1,
                    opacity: showVectors ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={`w-full h-full rounded-full ${
                      matchedTemplates.includes(template.id) ? 'bg-orange' : 'bg-white/40'
                    }`}
                  />
                  {matchedTemplates.includes(template.id) && (
                    <motion.div
                      className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <span className="text-xs text-orange">{template.name}</span>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}

            {/* Center Database Icon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <motion.div
                animate={{
                  rotate: showVectors ? 360 : 0,
                }}
                transition={{ duration: 2, ease: 'linear' }}
              >
                <Database className="w-12 h-12 text-orange" />
              </motion.div>
            </div>

            {/* Search Pulse */}
            <AnimatePresence>
              {currentStep === 2 && (
                <motion.div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 4, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                >
                  <div className="w-16 h-16 rounded-full border-2 border-orange" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Output */}
        <AnimatePresence>
          {currentStep >= 4 && (
            <motion.div
              className="absolute right-0 top-1/2 -translate-y-1/2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium">Routed To</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange" />
                    <span className="text-sm">Identity Team</span>
                  </div>
                  <div className="text-xs text-white/60">94% confidence match</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Follow-up Questions */}
        <AnimatePresence>
          {currentStep === 3 && (
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className="bg-black/80 border border-orange/30 rounded-lg p-4 backdrop-blur-md">
                <Brain className="w-5 h-5 text-orange mb-2" />
                <h4 className="text-sm font-medium mb-2">AI Generated Follow-ups:</h4>
                <div className="space-y-1">
                  <div className="text-xs text-white/80">• Which email system?</div>
                  <div className="text-xs text-white/80">• Error message shown?</div>
                  <div className="text-xs text-white/80">• When did it start?</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-3 gap-8 text-center">
        <div className="bg-white/5 rounded-lg p-4">
          <div className="text-3xl font-bold text-orange">94%</div>
          <span className="text-sm text-white/70">Routing Accuracy</span>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <div className="text-3xl font-bold text-orange">78%</div>
          <span className="text-sm text-white/70">Time Saved</span>
        </div>
        <div className="bg-white/5 rounded-lg p-4">
          <div className="text-3xl font-bold text-orange">1000s</div>
          <span className="text-sm text-white/70">BSTs Simplified</span>
        </div>
      </div>
    </div>
  );
};
