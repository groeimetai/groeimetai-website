'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';

// Modern Color System
const COLORS = {
  primary: '#6366f1',    // Indigo - Professional
  secondary: '#8b5cf6',  // Purple - Innovation  
  accent: '#06b6d4',     // Cyan - Connection
  success: '#10b981',    // Green - Success
  warning: '#f59e0b',    // Amber - Processing
  background: {
    primary: '#0f172a',
    secondary: '#1e293b',
    glass: 'rgba(255, 255, 255, 0.05)',
  },
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.8)',
    muted: 'rgba(255, 255, 255, 0.6)',
  }
} as const;

// Animation Configuration
const ANIMATION_CONFIG = {
  phases: {
    isolated: 0,
    transforming: 1,
    connected: 2,
  },
  durations: {
    phase: 5000,
    transition: 800,
    element: 400,
  },
  easings: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    gentle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  }
} as const;

// TypeScript Interfaces
interface ApiNode {
  id: string;
  name: string;
  position: { x: number; y: number };
  angle: number;
}

interface AnimationPhase {
  id: number;
  title: string;
  subtitle: string;
  description: string;
}

interface Position {
  x: number;
  y: number;
}

// Custom Hook for Animation State
function useAnimationState(autoPlay: boolean, phases: AnimationPhase[]) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const nextPhase = useCallback(() => {
    setCurrentPhase(prev => (prev + 1) % phases.length);
  }, [phases.length]);
  
  const reset = useCallback(() => {
    setCurrentPhase(0);
  }, []);
  
  useEffect(() => {
    if (autoPlay) {
      intervalRef.current = setInterval(nextPhase, ANIMATION_CONFIG.durations.phase);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoPlay, nextPhase]);
  
  return { currentPhase, setCurrentPhase, reset };
}

// SVG Icon Components
const ApiIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L2 7L12 12L22 7L12 2Z" opacity="0.8"/>
    <path d="M2 17L12 22L22 17"/>
    <path d="M2 12L12 17L22 12"/>
  </svg>
);

const McpIcon = ({ size = 32, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" className={className}>
    <circle cx="16" cy="16" r="6" opacity="0.6"/>
    <circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4"/>
    <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
  </svg>
);

const AgentIcon = ({ size = 28, className = '' }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="currentColor" className={className}>
    <rect x="6" y="8" width="16" height="12" rx="2" opacity="0.8"/>
    <rect x="11" y="4" width="6" height="4" rx="1"/>
    <circle cx="10" cy="14" r="2"/>
    <circle cx="18" cy="14" r="2"/>
  </svg>
);

// Connection Path Component
const ConnectionPath = ({ 
  from, 
  to, 
  phase,
  delay = 0,
  animated = true 
}: { 
  from: Position; 
  to: Position; 
  phase: number;
  delay?: number;
  animated?: boolean;
}) => {
  const shouldReduce = useReducedMotion();
  const pathLength = Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2);
  
  if (phase < ANIMATION_CONFIG.phases.connected) return null;
  
  return (
    <motion.line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke={COLORS.accent}
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="4 4"
      initial={{ 
        pathLength: 0, 
        opacity: 0,
        strokeDashoffset: shouldReduce ? 0 : pathLength 
      }}
      animate={{ 
        pathLength: 1, 
        opacity: 0.8,
        strokeDashoffset: shouldReduce ? 0 : [pathLength, 0]
      }}
      transition={{ 
        duration: shouldReduce ? 0.1 : ANIMATION_CONFIG.durations.transition / 1000,
        delay: shouldReduce ? 0 : delay,
        ease: ANIMATION_CONFIG.easings.gentle,
        strokeDashoffset: {
          duration: shouldReduce ? 0 : 2,
          repeat: shouldReduce ? 0 : Infinity,
          ease: "linear"
        }
      }}
    />
  );
};

// Main Component
export default function BeautifulApiToMcpAnimation() {
  const t = useTranslations('mcpAnimation');
  const [autoPlay, setAutoPlay] = useState(true);
  const shouldReduce = useReducedMotion();
  
  // Animation phases
  const phases: AnimationPhase[] = useMemo(() => [
    {
      id: 0,
      title: t('phases.before.title', { defaultValue: 'Isolated APIs' }),
      subtitle: t('phases.before.subtitle', { defaultValue: 'Fragmented Ecosystem' }),
      description: t('phases.before.description', { defaultValue: 'APIs exist in isolation, difficult for agents to access' }),
    },
    {
      id: 1,
      title: t('phases.during.title', { defaultValue: 'MCP Transformation' }),
      subtitle: t('phases.during.subtitle', { defaultValue: 'Protocol Bridge' }),
      description: t('phases.during.description', { defaultValue: 'MCP protocol creates a unified interface layer' }),
    },
    {
      id: 2,
      title: t('phases.after.title', { defaultValue: 'Connected Agents' }),
      subtitle: t('phases.after.subtitle', { defaultValue: 'Seamless Integration' }),
      description: t('phases.after.description', { defaultValue: 'AI agents connect effortlessly to all services' }),
    },
  ], [t]);

  const { currentPhase, setCurrentPhase, reset } = useAnimationState(autoPlay, phases);
  
  // API nodes configuration
  const apiNodes: ApiNode[] = useMemo(() => [
    { id: 'crm', name: 'CRM API', position: { x: 80, y: 120 }, angle: -90 },
    { id: 'support', name: 'Support API', position: { x: 60, y: 200 }, angle: -45 },
    { id: 'erp', name: 'ERP API', position: { x: 80, y: 280 }, angle: 0 },
    { id: 'analytics', name: 'Analytics API', position: { x: 120, y: 320 }, angle: 45 },
    { id: 'payment', name: 'Payment API', position: { x: 180, y: 300 }, angle: 90 },
  ], []);

  // MCP hub position
  const mcpPosition: Position = { x: 300, y: 220 };
  
  // Agent positions
  const agentPositions: Position[] = [
    { x: 500, y: 180 },
    { x: 520, y: 220 },
    { x: 500, y: 260 },
  ];

  const toggleAutoPlay = useCallback(() => {
    setAutoPlay(prev => !prev);
  }, []);

  const handlePhaseClick = useCallback((phaseIndex: number) => {
    setCurrentPhase(phaseIndex);
    setAutoPlay(false);
  }, [setCurrentPhase]);

  const handleReset = useCallback(() => {
    reset();
    setAutoPlay(false);
  }, [reset]);

  // Get dynamic styles based on phase
  const getApiNodeStyle = useCallback((phase: number) => {
    switch (phase) {
      case ANIMATION_CONFIG.phases.isolated:
        return {
          fill: COLORS.text.muted,
          stroke: COLORS.text.muted,
          opacity: 0.6,
        };
      case ANIMATION_CONFIG.phases.transforming:
        return {
          fill: COLORS.warning,
          stroke: COLORS.warning,
          opacity: 0.8,
        };
      case ANIMATION_CONFIG.phases.connected:
        return {
          fill: COLORS.success,
          stroke: COLORS.success,
          opacity: 1,
        };
      default:
        return {};
    }
  }, []);

  const getMcpStyle = useCallback((phase: number) => {
    if (phase < ANIMATION_CONFIG.phases.transforming) {
      return { opacity: 0, scale: 0 };
    }
    
    return {
      opacity: phase === ANIMATION_CONFIG.phases.connected ? 1 : 0.7,
      scale: phase === ANIMATION_CONFIG.phases.connected ? 1.1 : 1,
      fill: phase === ANIMATION_CONFIG.phases.connected ? COLORS.primary : COLORS.secondary,
    };
  }, []);

  const getAgentStyle = useCallback((phase: number) => {
    return {
      fill: phase === ANIMATION_CONFIG.phases.connected ? COLORS.accent : COLORS.text.muted,
      opacity: phase === ANIMATION_CONFIG.phases.connected ? 1 : 0.4,
      scale: phase === ANIMATION_CONFIG.phases.connected ? 1 : 0.9,
    };
  }, []);

  return (
    <section 
      className="py-24 relative overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at center, ${COLORS.background.secondary}, ${COLORS.background.primary})`,
      }}
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduce ? 0.1 : 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('title', { defaultValue: 'Transform APIs into' })}{' '}
              <span
                className="px-4 py-2 rounded-lg inline-block font-black"
                style={{ 
                  background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                  color: 'white'
                }}
              >
                {t('highlight', { defaultValue: 'MCP Protocol' })}
              </span>{' '}
              {t('titleEnd', { defaultValue: 'for AI Agents' })}
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              {t('subtitle', { defaultValue: 'Watch how the Model Context Protocol creates seamless connections between APIs and AI agents' })}
            </p>
          </motion.div>

          {/* Animation Container */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 mb-16">
            {/* Phase Controls */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              {phases.map((phase, idx) => (
                <button
                  key={phase.id}
                  onClick={() => handlePhaseClick(idx)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    idx === currentPhase 
                      ? 'text-white shadow-lg' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                  style={{
                    backgroundColor: idx === currentPhase 
                      ? COLORS.primary 
                      : 'rgba(255,255,255,0.05)',
                  }}
                >
                  {idx + 1}. {phase.title}
                </button>
              ))}
              
              <div className="mx-4 h-6 w-px bg-white/20" />
              
              {/* Playback Controls */}
              <button
                onClick={toggleAutoPlay}
                className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label={autoPlay ? 'Pause Animation' : 'Play Animation'}
                title={autoPlay ? 'Pause' : 'Play'}
              >
                {autoPlay ? <Pause size={20} /> : <Play size={20} />}
              </button>
              
              <button
                onClick={handleReset}
                className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Reset Animation"
                title="Reset"
              >
                <RotateCcw size={20} />
              </button>
            </div>

            {/* Main Animation SVG */}
            <div className="relative bg-gradient-to-br from-white/5 to-white/2 rounded-xl border border-white/10 overflow-hidden">
              <svg
                viewBox="0 0 600 400"
                className="w-full h-96 lg:h-[28rem]"
                style={{ background: 'transparent' }}
              >
                <defs>
                  {/* Gradients */}
                  <radialGradient id="mcpGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={COLORS.primary} stopOpacity="0.8" />
                    <stop offset="70%" stopColor={COLORS.secondary} stopOpacity="0.6" />
                    <stop offset="100%" stopColor={COLORS.accent} stopOpacity="0.2" />
                  </radialGradient>
                  
                  <radialGradient id="apiGradient" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
                  </radialGradient>
                  
                  {/* Glow Filter */}
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Connection Lines */}
                <g className="connections">
                  {/* API to MCP connections */}
                  {currentPhase >= ANIMATION_CONFIG.phases.transforming && 
                    apiNodes.map((node, index) => (
                      <ConnectionPath
                        key={`api-mcp-${node.id}`}
                        from={node.position}
                        to={mcpPosition}
                        phase={currentPhase}
                        delay={index * 0.15}
                      />
                    ))
                  }
                  
                  {/* MCP to Agent connections */}
                  {currentPhase >= ANIMATION_CONFIG.phases.connected &&
                    agentPositions.map((agentPos, index) => (
                      <ConnectionPath
                        key={`mcp-agent-${index}`}
                        from={mcpPosition}
                        to={agentPos}
                        phase={currentPhase}
                        delay={0.5 + index * 0.1}
                      />
                    ))
                  }
                </g>

                {/* API Nodes */}
                <g className="api-nodes">
                  {apiNodes.map((node, index) => {
                    const style = getApiNodeStyle(currentPhase);
                    
                    return (
                      <g key={node.id}>
                        <motion.circle
                          cx={node.position.x}
                          cy={node.position.y}
                          r="24"
                          fill="url(#apiGradient)"
                          stroke={style.stroke}
                          strokeWidth="2"
                          filter={currentPhase === ANIMATION_CONFIG.phases.connected ? "url(#glow)" : undefined}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ 
                            scale: currentPhase === ANIMATION_CONFIG.phases.connected ? 1.1 : 1,
                            opacity: style.opacity,
                            rotate: shouldReduce ? 0 : (currentPhase === 0 ? [0, 5, -5, 0] : 0)
                          }}
                          transition={{ 
                            duration: shouldReduce ? 0.1 : ANIMATION_CONFIG.durations.element / 1000,
                            delay: index * 0.1,
                            rotate: {
                              duration: shouldReduce ? 0 : 4,
                              repeat: shouldReduce ? 0 : (currentPhase === 0 ? Infinity : 0),
                              ease: "easeInOut"
                            }
                          }}
                          style={{ color: style.fill }}
                        />
                        
                        {/* API Icon */}
                        <motion.g
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.2 }}
                        >
                          <foreignObject 
                            x={node.position.x - 12} 
                            y={node.position.y - 12} 
                            width="24" 
                            height="24"
                          >
                            <ApiIcon 
                              size={24} 
                              className="text-current transition-colors duration-300"
                              style={{ color: style.fill }}
                            />
                          </foreignObject>
                        </motion.g>
                        
                        {/* API Label */}
                        <motion.text
                          x={node.position.x}
                          y={node.position.y + 40}
                          textAnchor="middle"
                          className="text-xs font-medium fill-current"
                          style={{ color: style.fill }}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 0.9, y: 0 }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                        >
                          {node.name}
                        </motion.text>
                      </g>
                    );
                  })}
                </g>

                {/* MCP Hub */}
                <AnimatePresence>
                  {currentPhase >= ANIMATION_CONFIG.phases.transforming && (
                    <motion.g
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: getMcpStyle(currentPhase).scale,
                        opacity: getMcpStyle(currentPhase).opacity,
                        rotate: shouldReduce ? 0 : (currentPhase === ANIMATION_CONFIG.phases.transforming ? [0, 360] : 0)
                      }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ 
                        duration: shouldReduce ? 0.1 : ANIMATION_CONFIG.durations.transition / 1000,
                        rotate: {
                          duration: shouldReduce ? 0 : 4,
                          repeat: shouldReduce ? 0 : (currentPhase === ANIMATION_CONFIG.phases.transforming ? Infinity : 0),
                          ease: "linear"
                        }
                      }}
                    >
                      {/* MCP Hub Background */}
                      <circle
                        cx={mcpPosition.x}
                        cy={mcpPosition.y}
                        r="40"
                        fill="url(#mcpGradient)"
                        filter={currentPhase === ANIMATION_CONFIG.phases.connected ? "url(#glow)" : undefined}
                      />
                      
                      {/* MCP Icon */}
                      <foreignObject 
                        x={mcpPosition.x - 16} 
                        y={mcpPosition.y - 16} 
                        width="32" 
                        height="32"
                      >
                        <McpIcon 
                          size={32} 
                          className="text-white"
                        />
                      </foreignObject>
                      
                      {/* MCP Label */}
                      <text
                        x={mcpPosition.x}
                        y={mcpPosition.y + 60}
                        textAnchor="middle"
                        className="text-sm font-bold fill-white"
                      >
                        MCP Protocol
                      </text>
                    </motion.g>
                  )}
                </AnimatePresence>

                {/* AI Agents */}
                <g className="ai-agents">
                  {agentPositions.map((pos, index) => {
                    const style = getAgentStyle(currentPhase);
                    
                    return (
                      <g key={`agent-${index}`}>
                        <motion.circle
                          cx={pos.x}
                          cy={pos.y}
                          r="20"
                          fill="url(#apiGradient)"
                          stroke={style.fill}
                          strokeWidth="2"
                          filter={currentPhase === ANIMATION_CONFIG.phases.connected ? "url(#glow)" : undefined}
                          initial={{ scale: 0.9, opacity: 0.4 }}
                          animate={{ 
                            scale: style.scale,
                            opacity: style.opacity 
                          }}
                          transition={{ 
                            duration: shouldReduce ? 0.1 : ANIMATION_CONFIG.durations.element / 1000,
                            delay: 0.6 + index * 0.1 
                          }}
                          style={{ color: style.fill }}
                        />
                        
                        {/* Agent Icon */}
                        <motion.g
                          initial={{ opacity: 0.4 }}
                          animate={{ opacity: currentPhase === ANIMATION_CONFIG.phases.connected ? 1 : 0.4 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                        >
                          <foreignObject 
                            x={pos.x - 14} 
                            y={pos.y - 14} 
                            width="28" 
                            height="28"
                          >
                            <AgentIcon 
                              size={28} 
                              className="text-current"
                              style={{ color: style.fill }}
                            />
                          </foreignObject>
                        </motion.g>
                        
                        {/* Agent Label */}
                        <motion.text
                          x={pos.x}
                          y={pos.y + 35}
                          textAnchor="middle"
                          className="text-xs font-medium fill-current"
                          style={{ color: style.fill }}
                          initial={{ opacity: 0.4, y: 3 }}
                          animate={{ 
                            opacity: currentPhase === ANIMATION_CONFIG.phases.connected ? 0.9 : 0.4, 
                            y: 0 
                          }}
                          transition={{ delay: 0.8 + index * 0.1 }}
                        >
                          AI Agent {index + 1}
                        </motion.text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>

            {/* Phase Description */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhase}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: shouldReduce ? 0.1 : 0.4 }}
                className="text-center mt-8"
              >
                <h3 className="text-2xl font-bold text-white mb-3">
                  {phases[currentPhase].subtitle}
                </h3>
                <p className="text-white/80 text-lg max-w-2xl mx-auto">
                  {phases[currentPhase].description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Benefits Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduce ? 0.1 : 0.8, delay: shouldReduce ? 0 : 0.2 }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: '⚡',
                title: t('benefits.faster.title', { defaultValue: 'Faster Integration' }),
                description: t('benefits.faster.description', { defaultValue: 'Reduce integration time from weeks to minutes with standardized protocols' }),
                color: COLORS.warning,
              },
              {
                icon: '🔗',
                title: t('benefits.universal.title', { defaultValue: 'Universal Connection' }),
                description: t('benefits.universal.description', { defaultValue: 'One protocol to connect all APIs and services seamlessly' }),
                color: COLORS.primary,
              },
              {
                icon: '💎',
                title: t('benefits.roi.title', { defaultValue: 'Higher ROI' }),
                description: t('benefits.roi.description', { defaultValue: 'Maximize return on AI investments with better API accessibility' }),
                color: COLORS.success,
              },
            ].map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: shouldReduce ? 0.1 : 0.6, 
                  delay: shouldReduce ? 0 : 0.3 + index * 0.1 
                }}
                className="text-center group"
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: benefit.color + '20', border: `2px solid ${benefit.color}40` }}
                >
                  <span className="text-2xl" style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}>
                    {benefit.icon}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {benefit.title}
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Accessibility Styles */}
      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        @media print {
          section {
            background: white !important;
            color: black !important;
          }
          
          .text-white {
            color: black !important;
          }
          
          svg {
            display: none;
          }
        }
        
        @media (max-width: 768px) {
          svg {
            height: 20rem !important;
          }
        }
        
        @media (max-width: 480px) {
          svg {
            height: 16rem !important;
          }
          
          .container {
            padding-left: 1rem;
            padding-right: 1rem;
          }
        }
      `}</style>
    </section>
  );
}