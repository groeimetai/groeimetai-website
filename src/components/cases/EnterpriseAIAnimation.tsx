'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Users, 
  Database, 
  Brain, 
  ArrowRight, 
  MessageSquare,
  Sparkles,
  Zap,
  CheckCircle
} from 'lucide-react';

export const EnterpriseAIAnimation: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['User Query', 'AI Processing', 'Decision Making', 'Action'];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const agents = [
    { name: 'Live Agent Transfer', icon: Users, color: 'from-blue-500 to-blue-600' },
    { name: 'Catalog Search', icon: Database, color: 'from-green-500 to-green-600' },
    { name: 'Knowledge Base', icon: Brain, color: 'from-purple-500 to-purple-600' },
    { name: 'Direct Answer', icon: MessageSquare, color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="w-full h-[500px] flex flex-col items-center justify-center p-8">
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-12">
        <div className="flex justify-between mb-4">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  index <= activeStep ? 'bg-orange' : 'bg-white/10'
                }`}
                animate={{
                  scale: index === activeStep ? 1.2 : 1,
                }}
                transition={{ duration: 0.3 }}
              >
                {index < activeStep ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <span className="text-white font-bold">{index + 1}</span>
                )}
              </motion.div>
              <span className={`text-sm ${index <= activeStep ? 'text-white' : 'text-white/50'}`}>
                {step}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange to-orange-600"
            animate={{ width: `${((activeStep + 1) / 4) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Main Animation */}
      <div className="relative w-full max-w-4xl h-80">
        {/* User */}
        <motion.div
          className="absolute left-0 top-1/2 -translate-y-1/2"
          animate={{
            scale: activeStep === 0 ? 1.1 : 1,
          }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
            <Users className="w-10 h-10 text-white" />
          </div>
          <span className="text-sm text-white/70 mt-2 block text-center">Employee</span>
        </motion.div>

        {/* AI Brain */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: activeStep === 1 || activeStep === 2 ? 1.2 : 1,
            rotate: activeStep === 1 ? 360 : 0,
          }}
          transition={{ duration: 1 }}
        >
          <div className="w-32 h-32 bg-gradient-to-br from-orange to-orange-600 rounded-full flex items-center justify-center relative">
            <Bot className="w-16 h-16 text-white" />
            <AnimatePresence>
              {activeStep === 1 && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-white rounded-full"
                      style={{
                        top: '50%',
                        left: '50%',
                        transformOrigin: '0 0',
                      }}
                      animate={{
                        x: Math.cos((i * Math.PI * 2) / 8) * 60,
                        y: Math.sin((i * Math.PI * 2) / 8) * 60,
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <span className="text-xs text-white/70 mt-2 block text-center absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">GPT-4o-mini</span>
        </motion.div>

        {/* Agent Options */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 space-y-4">
          {agents.map((agent, index) => (
            <motion.div
              key={index}
              className="relative"
              animate={{
                scale: activeStep === 3 ? 1.1 : 1,
                x: activeStep === 3 ? -20 : 0,
              }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${agent.color} rounded-lg flex items-center justify-center`}>
                <agent.icon className="w-8 h-8 text-white" />
              </div>
              <span className="text-xs text-white/70 mt-1 block text-center max-w-[80px]">
                {agent.name}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Connection Lines */}
        <AnimatePresence>
          {activeStep >= 1 && (
            <motion.svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* User to AI */}
              <motion.line
                x1="80"
                y1="50%"
                x2="45%"
                y2="50%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="5,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5 }}
              />
              
              {/* AI to Agents */}
              {activeStep >= 2 && agents.map((_, index) => (
                <motion.line
                  key={index}
                  x1="55%"
                  y1="50%"
                  x2="85%"
                  y2={`${25 + index * 25}%`}
                  stroke="white"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              ))}
            </motion.svg>
          )}
        </AnimatePresence>

        {/* Floating Messages */}
        <AnimatePresence>
          {activeStep === 0 && (
            <motion.div
              className="absolute left-24 top-1/2 -translate-y-1/2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 max-w-[200px]">
                <p className="text-sm text-white">&quot;I need help with password reset&quot;</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      <div className="mt-12 grid grid-cols-3 gap-8 text-center">
        <div>
          <motion.div
            className="text-3xl font-bold text-orange"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            50,000
          </motion.div>
          <span className="text-sm text-white/70">Active Users</span>
        </div>
        <div>
          <motion.div
            className="text-3xl font-bold text-orange"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            85%
          </motion.div>
          <span className="text-sm text-white/70">Faster Response</span>
        </div>
        <div>
          <motion.div
            className="text-3xl font-bold text-orange"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            €2.8M
          </motion.div>
          <span className="text-sm text-white/70">Annual Savings</span>
        </div>
      </div>
    </div>
  );
};