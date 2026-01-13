'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Link2,
  Wallet,
  Lock,
  Unlock,
  Server,
  Database,
  BarChart3,
  CreditCard,
  HeadphonesIcon,
  Cpu,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
  type LucideIcon
} from 'lucide-react';
import { useTranslations } from 'next-intl';

// KLEUREN
const ORANGE = '#F87315';
const ORANGE_GLOW = 'rgba(248, 115, 21, 0.6)';
const GREEN = '#10B981';
const GREEN_GLOW = 'rgba(16, 185, 129, 0.6)';
const RED = '#EF4444';
const RED_GLOW = 'rgba(239, 68, 68, 0.4)';

// API configuratie met icons
const API_CONFIG: Array<{ name: string; icon: LucideIcon; color: string }> = [
  { name: 'CRM', icon: Database, color: '#3B82F6' },
  { name: 'Support', icon: HeadphonesIcon, color: '#8B5CF6' },
  { name: 'ERP', icon: Server, color: '#EC4899' },
  { name: 'Analytics', icon: BarChart3, color: '#06B6D4' },
  { name: 'Payment', icon: CreditCard, color: '#F59E0B' },
];

// Hook voor container grootte
function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 800, height: 520 });

  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });

    const obs = new ResizeObserver(([entry]) => {
      const cr = entry.contentRect;
      setSize({ width: cr.width, height: cr.height });
    });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return { ref, size };
}

// Radiale posities berekenen
function radialPositions(count: number, radiusPct = 40, startDeg = -90, isMobile = false) {
  if (isMobile) {
    return [{ top: 12, left: 50 }];
  }
  return Array.from({ length: count }, (_, i) => {
    const angle = ((360 / count) * i + startDeg) * (Math.PI / 180);
    const cx = 50;
    const cy = 45;
    const left = cx + radiusPct * Math.cos(angle);
    const top = cy + radiusPct * Math.sin(angle);
    return { top, left };
  });
}

// MCP posities tussen centrum en APIs
function betweenCenter(pos: { top: number; left: number }, f = 0.55, isMobile = false) {
  if (isMobile) {
    return { top: 42, left: 50 };
  }
  const cx = 50;
  const cy = 50;
  return {
    top: cy + (pos.top - cy) * f,
    left: cx + (pos.left - cx) * f,
  };
}

// Curved path generator voor vloeiende lijnen (percentage-based)
function generateCurvedPath(
  start: { top: number; left: number },
  end: { top: number; left: number },
  curvature = 0.3
) {
  const startX = start.left;
  const startY = start.top;
  const endX = end.left;
  const endY = end.top;

  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  const dx = endX - startX;
  const dy = endY - startY;

  // Control point perpendicular to the line
  const controlX = midX - dy * curvature;
  const controlY = midY + dx * curvature;

  return `M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`;
}

// Animated data packet component
function DataPacket({
  path,
  delay = 0,
  duration = 2,
  color = ORANGE,
}: {
  path: string;
  delay?: number;
  duration?: number;
  color?: string;
}) {
  return (
    <motion.circle
      r={4}
      fill={color}
      filter="url(#packetGlow)"
      initial={{ offsetDistance: '0%' }}
      animate={{ offsetDistance: '100%' }}
      transition={{
        delay,
        duration,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{
        offsetPath: `path('${path}')`,
      }}
    />
  );
}

// Glowing line component
function GlowingPath({
  d,
  color,
  delay = 0,
  animate = true,
  dashed = false,
}: {
  d: string;
  color: string;
  delay?: number;
  animate?: boolean;
  dashed?: boolean;
}) {
  return (
    <g>
      {/* Glow layer */}
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeLinecap="round"
        strokeOpacity={0.15}
        filter="url(#lineGlow)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: animate ? 1 : 0 }}
        transition={{ delay, duration: 0.8, ease: 'easeOut' }}
      />
      {/* Main line */}
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={dashed ? '8 6' : undefined}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: animate ? 1 : 0, opacity: animate ? 1 : 0 }}
        transition={{ delay, duration: 0.8, ease: 'easeOut' }}
      />
    </g>
  );
}

// Premium API Card component
function ApiCard({
  name,
  icon: Icon,
  color,
  phase,
  index,
  position,
  isMobile,
}: {
  name: string;
  icon: LucideIcon;
  color: string;
  phase: number;
  index: number;
  position: { top: number; left: number };
  isMobile: boolean;
}) {
  const isLocked = phase === 0;
  const isConnecting = phase === 1;
  const isConnected = phase === 2;

  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ top: `${position.top}%`, left: `${position.left}%`, zIndex: 25 }}
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.5, ease: 'easeOut' }}
    >
      <motion.div
        className={`relative rounded-xl backdrop-blur-md border transition-all duration-500 ${
          isMobile ? 'p-3 min-w-[100px]' : 'p-4 min-w-[120px]'
        }`}
        style={{
          background: isConnected
            ? `linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))`
            : isConnecting
              ? `linear-gradient(135deg, rgba(248, 115, 21, 0.1), rgba(248, 115, 21, 0.05))`
              : 'rgba(255, 255, 255, 0.03)',
          borderColor: isConnected
            ? 'rgba(16, 185, 129, 0.4)'
            : isConnecting
              ? 'rgba(248, 115, 21, 0.3)'
              : 'rgba(255, 255, 255, 0.1)',
          boxShadow: isConnected
            ? `0 0 30px ${GREEN_GLOW}, inset 0 1px 0 rgba(255,255,255,0.1)`
            : isConnecting
              ? `0 0 20px ${ORANGE_GLOW}`
              : 'inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
        animate={
          isConnected
            ? {
                borderColor: ['rgba(16, 185, 129, 0.4)', 'rgba(16, 185, 129, 0.7)', 'rgba(16, 185, 129, 0.4)'],
              }
            : {}
        }
        transition={{ repeat: Infinity, duration: 2, delay: index * 0.2 }}
      >
        {/* Status indicator */}
        <div className="absolute -top-1 -right-1">
          {isLocked && (
            <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
              <Lock size={10} className="text-red-400" />
            </div>
          )}
          {isConnecting && (
            <motion.div
              className="w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            >
              <Loader2 size={10} className="text-orange-400" />
            </motion.div>
          )}
          {isConnected && (
            <motion.div
              className="w-5 h-5 rounded-full bg-green-500/30 border border-green-500/50 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <CheckCircle2 size={10} className="text-green-400" />
            </motion.div>
          )}
        </div>

        {/* Icon */}
        <div className="flex items-center gap-2 mb-2">
          <div
            className="p-1.5 rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${color}20, ${color}10)`,
              border: `1px solid ${color}30`,
            }}
          >
            <Icon size={isMobile ? 14 : 16} color={color} />
          </div>
        </div>

        {/* Name */}
        <div className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'} ${
          isConnected ? 'text-green-300' : isConnecting ? 'text-orange-300' : 'text-white/70'
        }`}>
          {name} API
        </div>

        {/* Protocol badge */}
        <div className={`mt-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full inline-block ${
          isConnected
            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
            : isConnecting
              ? 'bg-orange-500/10 text-orange-300/70 border border-orange-500/20'
              : 'bg-white/5 text-white/40 border border-white/10'
        }`}>
          {isConnected ? 'MCP' : 'REST'}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Premium MCP Node component
function McpNode({
  index,
  position,
  phase,
  isMobile,
}: {
  index: number;
  position: { top: number; left: number };
  phase: number;
  isMobile: boolean;
}) {
  const isInstalling = phase === 1;
  const isActive = phase === 2;

  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ top: `${position.top}%`, left: `${position.left}%`, zIndex: 30 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ delay: 0.3 + index * 0.1, duration: 0.4, type: 'spring' }}
    >
      <motion.div
        className={`relative rounded-xl backdrop-blur-lg border ${
          isMobile ? 'p-2.5 min-w-[56px]' : 'p-3 min-w-[64px]'
        }`}
        style={{
          background: isActive
            ? `linear-gradient(135deg, ${ORANGE}, rgba(248, 115, 21, 0.8))`
            : `linear-gradient(135deg, rgba(248, 115, 21, 0.3), rgba(248, 115, 21, 0.15))`,
          borderColor: isActive
            ? 'rgba(255, 255, 255, 0.3)'
            : 'rgba(248, 115, 21, 0.5)',
          boxShadow: isActive
            ? `0 0 40px ${ORANGE_GLOW}, 0 8px 32px rgba(0,0,0,0.3)`
            : `0 0 20px rgba(248, 115, 21, 0.2)`,
        }}
        animate={
          isActive
            ? {
                boxShadow: [
                  `0 0 30px ${ORANGE_GLOW}`,
                  `0 0 50px ${ORANGE_GLOW}`,
                  `0 0 30px ${ORANGE_GLOW}`,
                ],
              }
            : isInstalling
              ? { scale: [1, 1.05, 1] }
              : {}
        }
        transition={{ repeat: Infinity, duration: 2, delay: index * 0.15 }}
      >
        {/* Rotating ring for installing state */}
        {isInstalling && (
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-transparent"
            style={{
              borderTopColor: ORANGE,
              borderRightColor: 'transparent',
            }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          />
        )}

        <div className="flex flex-col items-center">
          <div className={`font-bold ${isMobile ? 'text-xs' : 'text-sm'} ${
            isActive ? 'text-white' : 'text-orange-200'
          }`}>
            MCP
          </div>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Zap size={12} className="text-white mt-0.5" />
            </motion.div>
          )}
          {isInstalling && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            >
              <Loader2 size={12} className="text-orange-200 mt-0.5" />
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Premium Agent Hub component
function AgentHub({ phase, isMobile }: { phase: number; isMobile: boolean }) {
  const isBlind = phase === 0;
  const isConnecting = phase === 1;
  const isConnected = phase === 2;

  const hubColor = isConnected ? GREEN : isConnecting ? ORANGE : RED;
  const glowColor = isConnected ? GREEN_GLOW : isConnecting ? ORANGE_GLOW : RED_GLOW;

  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ top: isMobile ? '75%' : '50%', left: '50%', zIndex: 35 }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={`relative ${isMobile ? 'w-24 h-24' : 'w-32 h-32'}`}
        animate={
          isConnected
            ? {
                scale: [1, 1.02, 1],
              }
            : isBlind
              ? {
                  rotate: [0, 5, -5, 0],
                }
              : {}
        }
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
      >
        {/* Outer glow rings */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />

        {/* Rotating orbital ring */}
        {isConnected && (
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-dashed"
            style={{ borderColor: `${GREEN}40` }}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
          />
        )}

        {/* Main hub circle */}
        <motion.div
          className="absolute inset-4 rounded-full backdrop-blur-xl border-2 flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${hubColor}30, ${hubColor}10)`,
            borderColor: `${hubColor}60`,
            boxShadow: `0 0 40px ${glowColor}, inset 0 0 30px ${glowColor}`,
          }}
          animate={
            isConnecting
              ? {
                  borderColor: [`${ORANGE}40`, `${ORANGE}80`, `${ORANGE}40`],
                }
              : {}
          }
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          {/* Inner content */}
          <div className="flex flex-col items-center">
            <motion.div
              className="p-2 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${hubColor}50, ${hubColor}30)`,
              }}
              animate={
                isConnecting ? { rotate: [0, 360] } : {}
              }
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
            >
              {isBlind && <AlertCircle size={isMobile ? 20 : 28} className="text-red-300" />}
              {isConnecting && <Cpu size={isMobile ? 20 : 28} className="text-orange-200" />}
              {isConnected && <Cpu size={isMobile ? 20 : 28} className="text-green-200" />}
            </motion.div>
          </div>
        </motion.div>

        {/* Status label */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
          <div className={`text-sm font-bold ${
            isBlind ? 'text-red-400' : isConnecting ? 'text-orange-400' : 'text-green-400'
          }`}>
            AI Agent
          </div>
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-xs mt-0.5 ${
              isBlind ? 'text-red-300/70' : isConnecting ? 'text-orange-300/70' : 'text-green-300/70'
            }`}
          >
            {isBlind ? 'Geen toegang' : isConnecting ? 'Verbinden...' : 'Volledig verbonden'}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ApiToMcpAnimation() {
  const t = useTranslations('mcpAnimation');
  const [isMobile, setIsMobile] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const phases = useMemo(() => [
    {
      id: 0,
      title: t('phases.before.title'),
      subtitle: t('phases.before.subtitle'),
      description: t('phases.before.description'),
    },
    {
      id: 1,
      title: t('phases.during.title'),
      subtitle: t('phases.during.subtitle'),
      description: t('phases.during.description'),
    },
    {
      id: 2,
      title: t('phases.after.title'),
      subtitle: t('phases.after.subtitle'),
      description: t('phases.after.description'),
    },
  ], [t]);

  const apiPositions = useMemo(() => radialPositions(API_CONFIG.length, 38, -90, isMobile), [isMobile]);
  const mcpPositions = useMemo(() => apiPositions.map((pos) => betweenCenter(pos, 0.55, isMobile)), [apiPositions, isMobile]);

  const { ref: stageRef } = useElementSize<HTMLDivElement>();

  // Auto-advance
  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrentPhase((p) => (p + 1) % phases.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [autoPlay, phases.length]);

  // Generate paths for connections (using percentage coordinates)
  const connectionPaths = useMemo(() => {
    const agentCenter = { top: isMobile ? 75 : 50, left: 50 };

    return (isMobile ? API_CONFIG.slice(0, 1) : API_CONFIG).map((_, i) => {
      const apiPos = apiPositions[i];
      const mcpPos = mcpPositions[i];

      return {
        apiToMcp: generateCurvedPath(apiPos, mcpPos, 0.15),
        mcpToAgent: generateCurvedPath(mcpPos, agentCenter, 0.1),
      };
    });
  }, [apiPositions, mcpPositions, isMobile]);

  const showMcp = currentPhase >= 1;
  const showLines = currentPhase === 2;

  return (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: `radial-gradient(circle, ${ORANGE}40, transparent)` }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: `radial-gradient(circle, ${GREEN}40, transparent)` }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('title')}{' '}
              <span
                className="relative inline-block px-4 py-2"
                style={{
                  background: 'linear-gradient(135deg, #F87315, #FF8533)',
                  boxShadow: `0 0 40px ${ORANGE_GLOW}`,
                }}
              >
                <span className="relative z-10">{t('highlight')}</span>
              </span>{' '}
              {t('titleEnd')}
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </motion.div>

          {/* Main Card */}
          <div
            className="relative rounded-2xl p-6 lg:p-10 mb-12 border"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
              borderColor: 'rgba(255,255,255,0.1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Phase controls */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              {phases.map((phase, idx) => (
                <button
                  key={phase.id}
                  onClick={() => {
                    setCurrentPhase(idx);
                    setAutoPlay(false);
                  }}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    idx === currentPhase
                      ? 'text-white shadow-lg'
                      : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                  }`}
                  style={{
                    background: idx === currentPhase
                      ? `linear-gradient(135deg, ${ORANGE}, #FF8533)`
                      : 'transparent',
                    border: idx === currentPhase
                      ? 'none'
                      : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: idx === currentPhase
                      ? `0 4px 20px ${ORANGE_GLOW}`
                      : 'none',
                  }}
                >
                  <span className="opacity-60 mr-2">{idx + 1}.</span>
                  {phase.title}
                </button>
              ))}

              <div className="mx-3 h-8 w-px bg-white/10" />

              <button
                onClick={() => setAutoPlay((v) => !v)}
                className={`p-2.5 rounded-full transition-all duration-300 ${
                  autoPlay
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
                }`}
                aria-label={autoPlay ? 'Pauzeer' : 'Afspelen'}
              >
                {autoPlay ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button
                onClick={() => {
                  setCurrentPhase(0);
                  setAutoPlay(false);
                }}
                className="p-2.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 border border-white/10 transition-all duration-300"
                aria-label="Reset"
              >
                <RotateCcw size={18} />
              </button>
            </div>

            {/* Animation Stage */}
            <div
              ref={stageRef}
              className="relative h-80 sm:h-96 lg:h-[520px] mb-8 rounded-xl overflow-hidden"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.02), transparent)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {/* SVG voor lijnen en effecten - using viewBox 0-100 for percentage coordinates */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <defs>
                  {/* Glow filters */}
                  <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="packetGlow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Connection lines */}
                {showLines && connectionPaths.map((paths, i) => (
                  <g key={`connections-${i}`}>
                    <GlowingPath
                      d={paths.apiToMcp}
                      color={GREEN}
                      delay={0.3 + i * 0.1}
                    />
                    <GlowingPath
                      d={paths.mcpToAgent}
                      color={GREEN}
                      delay={0.5 + i * 0.1}
                      dashed
                    />

                    {/* Animated data packets */}
                    <DataPacket
                      path={paths.apiToMcp}
                      delay={1 + i * 0.3}
                      duration={1.5}
                      color={GREEN}
                    />
                    <DataPacket
                      path={paths.mcpToAgent}
                      delay={1.5 + i * 0.3}
                      duration={1.5}
                      color={ORANGE}
                    />
                  </g>
                ))}
              </svg>

              {/* Agent Hub */}
              <AgentHub phase={currentPhase} isMobile={isMobile} />

              {/* API Cards */}
              {(isMobile ? API_CONFIG.slice(0, 1) : API_CONFIG).map((api, i) => (
                <ApiCard
                  key={api.name}
                  name={api.name}
                  icon={api.icon}
                  color={api.color}
                  phase={currentPhase}
                  index={i}
                  position={apiPositions[i]}
                  isMobile={isMobile}
                />
              ))}

              {/* MCP Nodes */}
              <AnimatePresence>
                {showMcp && (isMobile ? mcpPositions.slice(0, 1) : mcpPositions).map((pos, i) => (
                  <McpNode
                    key={`mcp-${i}`}
                    index={i}
                    position={pos}
                    phase={currentPhase}
                    isMobile={isMobile}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Phase description */}
            <motion.div
              key={currentPhase}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <h3 className="text-2xl font-bold text-white mb-3">
                {phases[currentPhase].subtitle}
              </h3>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                {phases[currentPhase].description}
              </p>
            </motion.div>
          </div>

          {/* Benefits section */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: t('benefits.faster.title'), description: t('benefits.faster.description'), color: '#F59E0B' },
              { icon: Link2, title: t('benefits.universal.title'), description: t('benefits.universal.description'), color: '#3B82F6' },
              { icon: Wallet, title: t('benefits.roi.title'), description: t('benefits.roi.description'), color: '#10B981' },
            ].map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center group"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${benefit.color}30, ${benefit.color}10)`,
                    border: `1px solid ${benefit.color}40`,
                    boxShadow: `0 0 30px ${benefit.color}20`,
                  }}
                >
                  <benefit.icon size={28} style={{ color: benefit.color }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-white/60">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
