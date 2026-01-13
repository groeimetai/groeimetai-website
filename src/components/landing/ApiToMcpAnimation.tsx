'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Link2,
  Wallet,
  Server,
  Database,
  BarChart3,
  CreditCard,
  HeadphonesIcon,
  Cpu,
  Loader2,
  AlertCircle,
  type LucideIcon
} from 'lucide-react';
import { useTranslations } from 'next-intl';

// =============================================================================
// CONSTANTEN
// =============================================================================

const ORANGE = '#F87315';
const GREEN = '#10B981';

// Vaste afmetingen voor alle elementen (in pixels)
const DIMENSIONS = {
  apiCard: { width: 110, height: 95 },
  mcpNode: { width: 56, height: 52 },
  agentHub: { width: 100, height: 100 },
};

// API configuratie
const API_CONFIG: Array<{ name: string; icon: LucideIcon; color: string }> = [
  { name: 'CRM', icon: Database, color: '#3B82F6' },
  { name: 'Support', icon: HeadphonesIcon, color: '#8B5CF6' },
  { name: 'ERP', icon: Server, color: '#EC4899' },
  { name: 'Analytics', icon: BarChart3, color: '#06B6D4' },
  { name: 'Payment', icon: CreditCard, color: '#F59E0B' },
];

// =============================================================================
// HELPER FUNCTIES
// =============================================================================

/**
 * Bereken posities in een cirkel rondom een centrumpunt
 * @returns Array van {x, y} coördinaten die de CENTRA van elementen aangeven
 */
function getCirclePositions(
  count: number,
  radius: number,
  centerX: number,
  centerY: number,
  startAngleDeg: number = -90
): Array<{ x: number; y: number }> {
  return Array.from({ length: count }, (_, i) => {
    const angleDeg = (360 / count) * i + startAngleDeg;
    const angleRad = angleDeg * (Math.PI / 180);
    return {
      x: centerX + radius * Math.cos(angleRad),
      y: centerY + radius * Math.sin(angleRad),
    };
  });
}

// =============================================================================
// CONNECTION LINE COMPONENT
// =============================================================================

/**
 * Tekent een lijn tussen twee punten met glow effect
 * BELANGRIJK: from en to zijn de EXACTE pixel coördinaten waar de lijn begint/eindigt
 */
function ConnectionLine({
  from,
  to,
  color,
  delay = 0,
  showPulse = false,
  dashed = false,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: string;
  delay?: number;
  showPulse?: boolean;
  dashed?: boolean;
}) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angleDeg = Math.atan2(dy, dx) * (180 / Math.PI);

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        // Positioneer de lijn EXACT op het startpunt
        left: from.x,
        top: from.y,
        width: length,
        height: 0,
        // Roteer vanuit het startpunt (links-midden van de div)
        transformOrigin: '0% 50%',
        transform: `rotate(${angleDeg}deg)`,
      }}
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
    >
      {/* Glow effect achter de lijn */}
      <div
        className="absolute blur-sm"
        style={{
          left: 0,
          top: -3,
          width: '100%',
          height: 6,
          background: color,
          opacity: 0.4,
        }}
      />

      {/* Hoofdlijn */}
      <div
        className="absolute"
        style={{
          left: 0,
          top: -1,
          width: '100%',
          height: 2,
          background: dashed
            ? `repeating-linear-gradient(90deg, ${color} 0px, ${color} 6px, transparent 6px, transparent 12px)`
            : color,
        }}
      />

      {/* Animated pulse dot */}
      {showPulse && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 6,
            height: 6,
            top: -3,
            background: color,
            boxShadow: `0 0 8px ${color}, 0 0 16px ${color}`,
          }}
          animate={{ left: [0, length - 6] }}
          transition={{
            delay: delay + 0.4,
            duration: 1.2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}
    </motion.div>
  );
}

// =============================================================================
// API CARD COMPONENT
// =============================================================================

/**
 * API kaart component
 * @param centerPosition - Het CENTRUM waar de kaart moet verschijnen
 */
function ApiCard({
  name,
  icon: Icon,
  color,
  phase,
  centerPosition,
}: {
  name: string;
  icon: LucideIcon;
  color: string;
  phase: number;
  centerPosition: { x: number; y: number };
}) {
  const isConnecting = phase === 1;
  const isConnected = phase === 2;

  // Bereken TOP-LEFT positie vanuit centrum (GEEN translate transform!)
  const topLeft = {
    x: centerPosition.x - DIMENSIONS.apiCard.width / 2,
    y: centerPosition.y - DIMENSIONS.apiCard.height / 2,
  };

  return (
    <motion.div
      className="absolute"
      style={{
        left: topLeft.x,
        top: topLeft.y,
        width: DIMENSIONS.apiCard.width,
        height: DIMENSIONS.apiCard.height,
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-full h-full rounded-xl backdrop-blur-md border p-3 flex flex-col items-center justify-center"
        style={{
          background: isConnected
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))'
            : isConnecting
              ? 'linear-gradient(135deg, rgba(248, 115, 21, 0.1), rgba(248, 115, 21, 0.05))'
              : 'rgba(255, 255, 255, 0.03)',
          borderColor: isConnected
            ? 'rgba(16, 185, 129, 0.4)'
            : isConnecting
              ? 'rgba(248, 115, 21, 0.3)'
              : 'rgba(255, 255, 255, 0.1)',
          boxShadow: isConnected
            ? '0 0 25px rgba(16, 185, 129, 0.3)'
            : isConnecting
              ? '0 0 15px rgba(248, 115, 21, 0.2)'
              : 'none',
        }}
        animate={
          isConnected
            ? { borderColor: ['rgba(16, 185, 129, 0.4)', 'rgba(16, 185, 129, 0.7)', 'rgba(16, 185, 129, 0.4)'] }
            : {}
        }
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {/* Icon */}
        <div
          className="p-2 rounded-lg mb-2"
          style={{
            background: `linear-gradient(135deg, ${color}25, ${color}10)`,
            border: `1px solid ${color}40`,
          }}
        >
          <Icon size={18} color={color} />
        </div>

        {/* Name */}
        <div className={`text-xs font-medium text-center ${
          isConnected ? 'text-green-300' : isConnecting ? 'text-orange-300' : 'text-white/70'
        }`}>
          {name} API
        </div>

        {/* Protocol badge */}
        <div className={`mt-1.5 text-[9px] font-mono px-2 py-0.5 rounded-full ${
          isConnected
            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
            : 'bg-white/5 text-white/40 border border-white/10'
        }`}>
          {isConnected ? 'MCP' : 'REST'}
        </div>
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// MCP NODE COMPONENT
// =============================================================================

/**
 * MCP node component
 * @param centerPosition - Het CENTRUM waar de node moet verschijnen
 */
function McpNode({
  centerPosition,
  phase,
  delay = 0,
}: {
  centerPosition: { x: number; y: number };
  phase: number;
  delay?: number;
}) {
  const isInstalling = phase === 1;
  const isActive = phase === 2;

  // Bereken TOP-LEFT positie vanuit centrum
  const topLeft = {
    x: centerPosition.x - DIMENSIONS.mcpNode.width / 2,
    y: centerPosition.y - DIMENSIONS.mcpNode.height / 2,
  };

  return (
    <motion.div
      className="absolute"
      style={{
        left: topLeft.x,
        top: topLeft.y,
        width: DIMENSIONS.mcpNode.width,
        height: DIMENSIONS.mcpNode.height,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ delay, duration: 0.4, type: 'spring' }}
    >
      <motion.div
        className="w-full h-full rounded-xl flex flex-col items-center justify-center"
        style={{
          background: isActive
            ? `linear-gradient(135deg, ${ORANGE}, rgba(248, 115, 21, 0.8))`
            : 'linear-gradient(135deg, rgba(248, 115, 21, 0.4), rgba(248, 115, 21, 0.2))',
          border: isActive ? '2px solid rgba(255, 255, 255, 0.3)' : '2px solid rgba(248, 115, 21, 0.5)',
          boxShadow: isActive
            ? '0 0 25px rgba(248, 115, 21, 0.5)'
            : '0 0 12px rgba(248, 115, 21, 0.2)',
        }}
        animate={
          isActive
            ? { boxShadow: ['0 0 15px rgba(248, 115, 21, 0.4)', '0 0 35px rgba(248, 115, 21, 0.6)', '0 0 15px rgba(248, 115, 21, 0.4)'] }
            : isInstalling
              ? { scale: [1, 1.05, 1] }
              : {}
        }
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className={`font-bold text-xs ${isActive ? 'text-white' : 'text-orange-200'}`}>
          MCP
        </div>
        {isActive && <Zap size={11} className="text-white mt-0.5" />}
        {isInstalling && (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
            <Loader2 size={11} className="text-orange-200 mt-0.5" />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// AGENT HUB COMPONENT
// =============================================================================

/**
 * Centrale AI Agent hub
 * @param centerPosition - Het CENTRUM waar de hub moet verschijnen
 */
function AgentHub({
  centerPosition,
  phase,
}: {
  centerPosition: { x: number; y: number };
  phase: number;
}) {
  const isBlind = phase === 0;
  const isConnecting = phase === 1;
  const isConnected = phase === 2;

  const hubColor = isConnected ? GREEN : isConnecting ? ORANGE : '#EF4444';

  // Bereken TOP-LEFT positie vanuit centrum
  const topLeft = {
    x: centerPosition.x - DIMENSIONS.agentHub.width / 2,
    y: centerPosition.y - DIMENSIONS.agentHub.height / 2,
  };

  return (
    <motion.div
      className="absolute"
      style={{
        left: topLeft.x,
        top: topLeft.y,
        width: DIMENSIONS.agentHub.width,
        height: DIMENSIONS.agentHub.height,
      }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="relative w-full h-full"
        animate={isConnected ? { scale: [1, 1.02, 1] } : isBlind ? { rotate: [0, 2, -2, 0] } : {}}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: `radial-gradient(circle, ${hubColor}40 0%, transparent 70%)` }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />

        {/* Main circle */}
        <div
          className="absolute inset-3 rounded-full flex items-center justify-center backdrop-blur-xl"
          style={{
            background: `linear-gradient(135deg, ${hubColor}30, ${hubColor}10)`,
            border: `2px solid ${hubColor}60`,
            boxShadow: `0 0 25px ${hubColor}40`,
          }}
        >
          <div className="p-2 rounded-xl" style={{ background: `${hubColor}40` }}>
            {isBlind && <AlertCircle size={20} className="text-red-300" />}
            {isConnecting && (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}>
                <Cpu size={20} className="text-orange-200" />
              </motion.div>
            )}
            {isConnected && <Cpu size={20} className="text-green-200" />}
          </div>
        </div>

        {/* Label onder de hub */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
          <div className={`text-sm font-bold ${isBlind ? 'text-red-400' : isConnecting ? 'text-orange-400' : 'text-green-400'}`}>
            AI Agent
          </div>
          <div className={`text-xs ${isBlind ? 'text-red-300/70' : isConnecting ? 'text-orange-300/70' : 'text-green-300/70'}`}>
            {isBlind ? 'Geen toegang' : isConnecting ? 'Verbinden...' : 'Volledig verbonden'}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ApiToMcpAnimation() {
  const t = useTranslations('mcpAnimation');
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 500 });
  const [isMobile, setIsMobile] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Meet de container grootte
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
      setIsMobile(window.innerWidth < 768);
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Fase configuratie
  const phases = useMemo(() => [
    { id: 0, title: t('phases.before.title'), subtitle: t('phases.before.subtitle'), description: t('phases.before.description') },
    { id: 1, title: t('phases.during.title'), subtitle: t('phases.during.subtitle'), description: t('phases.during.description') },
    { id: 2, title: t('phases.after.title'), subtitle: t('phases.after.subtitle'), description: t('phases.after.description') },
  ], [t]);

  // ==========================================================================
  // POSITIE BEREKENINGEN - Alle posities zijn CENTRUM coördinaten
  // ==========================================================================

  const containerCenterX = containerSize.width / 2;
  const containerCenterY = containerSize.height / 2;

  // Stralen voor de cirkels
  const apiRadius = isMobile ? 0 : Math.min(containerSize.width, containerSize.height) * 0.36;
  const mcpRadius = isMobile ? 0 : Math.min(containerSize.width, containerSize.height) * 0.20;

  // Agent Hub centrum positie
  const agentHubCenter = useMemo(() => ({
    x: containerCenterX,
    y: isMobile ? containerSize.height * 0.7 : containerCenterY,
  }), [containerCenterX, containerCenterY, containerSize.height, isMobile]);

  // API kaart centrum posities (in een cirkel rondom de agent)
  const apiCenters = useMemo(() => {
    if (isMobile) {
      return [{ x: containerCenterX, y: containerSize.height * 0.15 }];
    }
    return getCirclePositions(API_CONFIG.length, apiRadius, containerCenterX, containerCenterY - 10, -90);
  }, [containerSize, isMobile, apiRadius, containerCenterX, containerCenterY]);

  // MCP node centrum posities (in een kleinere cirkel tussen APIs en agent)
  const mcpCenters = useMemo(() => {
    if (isMobile) {
      return [{ x: containerCenterX, y: containerSize.height * 0.42 }];
    }
    return getCirclePositions(API_CONFIG.length, mcpRadius, containerCenterX, containerCenterY - 5, -90);
  }, [containerSize, isMobile, mcpRadius, containerCenterX, containerCenterY]);

  // Auto-advance door de fases
  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrentPhase((p) => (p + 1) % phases.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [autoPlay, phases.length]);

  // Bepaal wat er getoond moet worden per fase
  const showMcp = currentPhase >= 1;
  const showLines = currentPhase === 2;

  // Welke items renderen (minder op mobile)
  const itemsToRender = isMobile ? [0] : API_CONFIG.map((_, i) => i);

  return (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
      {/* Background decoraties */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
             style={{ background: `radial-gradient(circle, ${ORANGE}40, transparent)` }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
             style={{ background: `radial-gradient(circle, ${GREEN}40, transparent)` }} />
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
                className="inline-block px-4 py-2"
                style={{
                  background: 'linear-gradient(135deg, #F87315, #FF8533)',
                  boxShadow: '0 0 40px rgba(248, 115, 21, 0.4)'
                }}
              >
                {t('highlight')}
              </span>{' '}
              {t('titleEnd')}
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">{t('subtitle')}</p>
          </motion.div>

          {/* Main Animation Card */}
          <div
            className="relative rounded-2xl p-6 lg:p-10 mb-12 border"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
              borderColor: 'rgba(255,255,255,0.1)'
            }}
          >
            {/* Phase control buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              {phases.map((phase, idx) => (
                <button
                  key={phase.id}
                  onClick={() => { setCurrentPhase(idx); setAutoPlay(false); }}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    idx === currentPhase ? 'text-white' : 'text-white/60 hover:text-white/90'
                  }`}
                  style={{
                    background: idx === currentPhase ? `linear-gradient(135deg, ${ORANGE}, #FF8533)` : 'transparent',
                    border: idx === currentPhase ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: idx === currentPhase ? '0 4px 20px rgba(248, 115, 21, 0.4)' : 'none',
                  }}
                >
                  {idx + 1}. {phase.title}
                </button>
              ))}

              <div className="mx-3 h-8 w-px bg-white/10" />

              <button
                onClick={() => setAutoPlay((v) => !v)}
                className={`p-2.5 rounded-full transition-colors ${
                  autoPlay ? 'bg-orange-500/20 text-orange-400' : 'text-white/60 hover:bg-white/10'
                }`}
              >
                {autoPlay ? <Pause size={18} /> : <Play size={18} />}
              </button>

              <button
                onClick={() => { setCurrentPhase(0); setAutoPlay(false); }}
                className="p-2.5 rounded-full text-white/60 hover:bg-white/10 transition-colors"
              >
                <RotateCcw size={18} />
              </button>
            </div>

            {/* ================================================================
                ANIMATION STAGE - Hier worden alle elementen en lijnen gerenderd
                Alle posities zijn relatief aan deze container
                ================================================================ */}
            <div
              ref={containerRef}
              className="relative h-80 sm:h-96 lg:h-[520px] mb-8 rounded-xl overflow-hidden"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.02), transparent)',
                border: '1px solid rgba(255,255,255,0.05)'
              }}
            >
              {/*
                LAAG 1: Connection Lines (onderste laag)
                Lijnen worden getekend van API centrum → MCP centrum → Agent centrum
              */}
              {showLines && itemsToRender.map((i) => (
                <div key={`lines-${i}`}>
                  {/* Lijn van API centrum naar MCP centrum */}
                  <ConnectionLine
                    from={apiCenters[i]}
                    to={mcpCenters[i]}
                    color={GREEN}
                    delay={0.1 + i * 0.08}
                    showPulse
                  />
                  {/* Lijn van MCP centrum naar Agent centrum */}
                  <ConnectionLine
                    from={mcpCenters[i]}
                    to={agentHubCenter}
                    color={GREEN}
                    delay={0.25 + i * 0.08}
                    dashed
                    showPulse
                  />
                </div>
              ))}

              {/*
                LAAG 2: Agent Hub (midden)
              */}
              <AgentHub
                centerPosition={agentHubCenter}
                phase={currentPhase}
              />

              {/*
                LAAG 3: MCP Nodes (tussen API en Agent)
              */}
              <AnimatePresence>
                {showMcp && itemsToRender.map((i) => (
                  <McpNode
                    key={`mcp-${i}`}
                    centerPosition={mcpCenters[i]}
                    phase={currentPhase}
                    delay={0.15 + i * 0.08}
                  />
                ))}
              </AnimatePresence>

              {/*
                LAAG 4: API Cards (buitenste laag)
              */}
              {itemsToRender.map((i) => (
                <ApiCard
                  key={API_CONFIG[i].name}
                  name={API_CONFIG[i].name}
                  icon={API_CONFIG[i].icon}
                  color={API_CONFIG[i].color}
                  phase={currentPhase}
                  centerPosition={apiCenters[i]}
                />
              ))}
            </div>

            {/* Phase description */}
            <motion.div
              key={currentPhase}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h3 className="text-2xl font-bold text-white mb-3">{phases[currentPhase].subtitle}</h3>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">{phases[currentPhase].description}</p>
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
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${benefit.color}30, ${benefit.color}10)`,
                    border: `1px solid ${benefit.color}40`
                  }}
                >
                  <benefit.icon size={28} color={benefit.color} />
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
