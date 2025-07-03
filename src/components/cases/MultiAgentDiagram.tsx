'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Code,
  FileText,
  Database,
  Blocks,
  Sparkles,
  GitBranch,
  Package,
  BookOpen,
} from 'lucide-react';

export const MultiAgentDiagram: React.FC = () => {
  const [activeAgent, setActiveAgent] = useState(0);
  const [connections, setConnections] = useState<number[]>([1, 3, 5]);

  const agents = [
    {
      name: 'Orchestrator',
      icon: Bot,
      role: 'Coordinates all agents',
      color: 'from-purple-500 to-purple-600',
    },
    {
      name: 'Content Creator',
      icon: FileText,
      role: 'Generates course content',
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Code Generator',
      icon: Code,
      role: 'Builds platform code',
      color: 'from-green-500 to-green-600',
    },
    {
      name: 'Database Agent',
      icon: Database,
      role: 'Manages data structure',
      color: 'from-orange-500 to-orange-600',
    },
    {
      name: 'Blockchain Agent',
      icon: Blocks,
      role: 'Certificate verification',
      color: 'from-red-500 to-red-600',
    },
    {
      name: 'Quality Agent',
      icon: Sparkles,
      role: 'Ensures quality',
      color: 'from-yellow-500 to-yellow-600',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAgent((prev) => (prev + 1) % agents.length);

      // Simulate agent communication
      const newConnections = [];
      for (let i = 0; i < 3; i++) {
        newConnections.push(Math.floor(Math.random() * agents.length));
      }
      setConnections(newConnections);
    }, 2000);
    return () => clearInterval(interval);
  }, [agents.length]);

  const centerX = 400; // Center of 800px width
  const centerY = 250; // Center of 500px height
  const radiusX = 280; // Horizontal radius (wider)
  const radiusY = 140; // Vertical radius (shorter)

  const getAgentPosition = (index: number) => {
    // Start from top and distribute evenly
    const angle = (index * 2 * Math.PI) / agents.length - Math.PI / 2;
    return {
      x: centerX + radiusX * Math.cos(angle),
      y: centerY + radiusY * Math.sin(angle),
    };
  };

  return (
    <div className="w-full h-[800px] flex flex-col items-center justify-center">
      {/* Agent Network */}
      <div className="relative w-[800px] h-[500px] mb-4 mx-auto" style={{ position: 'relative' }}>
        <svg className="w-full h-full" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF6600" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#FF6600" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FF6600" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          {/* Central connections - always visible */}
          <g opacity="0.2">
            {agents.map((_, index) => {
              const pos = getAgentPosition(index);
              return (
                <line
                  key={`center-${index}`}
                  x1={centerX}
                  y1={centerY}
                  x2={pos.x}
                  y2={pos.y}
                  stroke="#FF6600"
                  strokeWidth="1"
                />
              );
            })}
          </g>

          {/* Active connections */}
          <AnimatePresence>
            {connections.map((targetIndex, i) => {
              const sourcePos = getAgentPosition(activeAgent);
              const targetPos = getAgentPosition(targetIndex);
              return (
                <motion.line
                  key={`${activeAgent}-${targetIndex}-${i}`}
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: 1, pathLength: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              );
            })}
          </AnimatePresence>
        </svg>

        {/* Central Orchestrator */}
        <motion.div
          className="absolute"
          style={{
            left: `${centerX}px`,
            top: `${centerY}px`,
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ scale: 1 }}
          animate={{
            scale: activeAgent === 0 ? 1.2 : 1,
          }}
        >
          <div className="w-24 h-24 bg-gradient-to-br from-orange to-orange-600 rounded-full flex items-center justify-center relative">
            <GitBranch className="w-12 h-12 text-white" />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-orange/50"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          </div>
          <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-sm text-white/70 whitespace-nowrap font-medium">
            Orchestrator
          </span>
        </motion.div>

        {/* Surrounding Agents */}
        {agents.map((agent, index) => {
          const position = getAgentPosition(index);

          return (
            <motion.div
              key={index}
              className="absolute"
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ scale: 1 }}
              animate={{
                scale: index === activeAgent ? 1.15 : 1,
              }}
            >
              <motion.div
                className={`w-16 h-16 bg-gradient-to-br ${agent.color} rounded-lg flex items-center justify-center relative`}
                whileHover={{ scale: 1.1 }}
              >
                <agent.icon className="w-8 h-8 text-white" />
                {index === activeAgent && (
                  <motion.div
                    className="absolute -inset-2 rounded-lg bg-white/20"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  />
                )}
              </motion.div>
              <div
                className="absolute w-36 text-center"
                style={{
                  left: '50%',
                  transform: 'translateX(-50%)',
                  top: position.y > centerY ? '72px' : 'auto',
                  bottom: position.y <= centerY ? '72px' : 'auto',
                }}
              >
                <span className="text-xs text-white font-medium block">{agent.name}</span>
                <span className="text-[10px] text-white/60 block">{agent.role}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Output Showcase */}
      <div className="w-full max-w-2xl mx-auto">
        <h3 className="text-center text-xl font-semibold mb-6">Platform Output</h3>
        <div className="grid grid-cols-4 gap-3 place-items-center">
          <motion.div
            className="bg-white/5 rounded-lg p-3 text-center h-28 w-32 flex flex-col justify-center"
            whileHover={{ scale: 1.05 }}
          >
            <BookOpen className="w-6 h-6 text-orange mx-auto mb-2" />
            <div className="text-xl font-bold text-white">10+</div>
            <span className="text-xs text-white/70">Courses</span>
          </motion.div>
          <motion.div
            className="bg-white/5 rounded-lg p-3 text-center h-28 w-32 flex flex-col justify-center"
            whileHover={{ scale: 1.05 }}
          >
            <Package className="w-6 h-6 text-orange mx-auto mb-2" />
            <div className="text-xl font-bold text-white">40+</div>
            <span className="text-xs text-white/70">Modules</span>
          </motion.div>
          <motion.div
            className="bg-white/5 rounded-lg p-3 text-center h-28 w-32 flex flex-col justify-center"
            whileHover={{ scale: 1.05 }}
          >
            <FileText className="w-6 h-6 text-orange mx-auto mb-2" />
            <div className="text-xl font-bold text-white">160+</div>
            <span className="text-xs text-white/70">Lessons</span>
          </motion.div>
          <motion.div
            className="bg-white/5 rounded-lg p-3 text-center h-28 w-32 flex flex-col justify-center"
            whileHover={{ scale: 1.05 }}
          >
            <Blocks className="w-6 h-6 text-orange mx-auto mb-2" />
            <div className="text-lg font-bold text-white">Blockchain</div>
            <span className="text-xs text-white/70">Certificates</span>
          </motion.div>
        </div>
      </div>

      {/* Timeline */}
      <div className="w-full max-w-xl mx-auto mt-8">
        <div className="flex items-center justify-center space-x-12">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange">2</div>
            <span className="text-sm text-white/70">Weeks Total</span>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <div className="text-3xl font-bold text-orange">95%</div>
            <span className="text-sm text-white/70">Automation</span>
          </div>
          <div className="w-px h-10 bg-white/20" />
          <div className="text-center">
            <div className="text-3xl font-bold text-orange">6</div>
            <span className="text-sm text-white/70">AI Agents</span>
          </div>
        </div>
      </div>
    </div>
  );
};
