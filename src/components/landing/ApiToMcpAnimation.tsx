'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

// KLEUREN
const ORANGE = '#F87315';
const GREEN = '#10B981';

// -- Klein hookje om container-grootte te meten (voor SVG-lijnen) --
function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 800, height: 520 }); // Better initial size
  useEffect(() => {
    if (!ref.current) return;
    
    // Get initial size immediately
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

// Bereken n posities op een cirkel, mooi verdeeld (in %) - verschoven naar links
function radialPositions(count: number, radiusPct = 40, startDeg = -90) {
  return Array.from({ length: count }, (_, i) => {
    const angle = ((360 / count) * i + startDeg) * (Math.PI / 180);
    const cx = 45; // Verschoven van 50 naar 45 (naar links)
    const cy = 50;
    const left = cx + radiusPct * Math.cos(angle);
    const top = cy + radiusPct * Math.sin(angle);
    return { top, left };
  });
}

// Lerp tussen center (50,50) en een target positie (in %), fractie f [0..1]  
function betweenCenter(pos: { top: number; left: number }, f = 0.6) {
  const cx = 50; // Agent blijft in center, maar MCP volgt API shift
  const cy = 50;
  return {
    top: cy + (pos.top - cy) * f,
    left: cx + (pos.left - cx) * f,
  };
}

// Helper: % -> px met container size, accounting for centered elements
function pctToPx(
  pct: { top: number; left: number },
  size: { width: number; height: number }
) {
  // The CSS elements use transform: -translate-x-1/2 -translate-y-1/2
  // So the actual center of the element is at the percentage position
  // No additional offset needed - the percentage IS the center
  return {
    x: (pct.left / 100) * size.width,
    y: (pct.top / 100) * size.height,
  };
}

// Helper: Get exact center coordinates matching CSS positioned elements
function getBoxCenter(
  pct: { top: number; left: number },
  size: { width: number; height: number }
) {
  // CSS positioning: top: X%, left: Y%, transform: -translate-x-1/2 -translate-y-1/2
  // This means the CENTER of the element is at the percentage position
  // So SVG line should point to exactly that percentage position converted to pixels
  const centerX = (pct.left / 100) * size.width;
  const centerY = (pct.top / 100) * size.height;
  
  console.log(`Position ${pct.top}%/${pct.left}% → Pixel ${centerX},${centerY} (Container: ${size.width}×${size.height})`);
  
  return { x: centerX, y: centerY };
}

// Helper: Get connection point for API nodes (bottom for top node, center for others)
function getApiConnectionPoint(
  pct: { top: number; left: number },
  size: { width: number; height: number },
  index: number
) {
  const centerX = (pct.left / 100) * size.width;
  const centerY = (pct.top / 100) * size.height;
  
  // For the top node (index 0, which is at -90 degrees), start from bottom edge of box
  if (index === 0) {
    // API boxes are about 60px tall, so bottom is center + half height
    return { x: centerX, y: centerY + 40 }; // +40px to start from actual bottom of API box
  }
  
  // For all other nodes, use center
  return { x: centerX, y: centerY };
}

export default function ApiToMcpAnimation() {
  const t = useTranslations('mcpAnimation');
  
  const phases = [
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
  ];

  const [currentPhase, setCurrentPhase] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // APIs (titels) – volgorde bepaalt de cirkelpositie
  const apis = useMemo(
    () => ['CRM API', 'Support API', 'ERP API', 'Analytics API', 'Payment API'],
    []
  );

  // Posities in % (blijven identiek in alle fases)
  const apiPositions = useMemo(() => radialPositions(apis.length, 38, -90), [apis.length]);
  const mcpPositions = useMemo(() => {
    // MCP positions based on center (50,50) NOT shifted API positions
    const centerPositions = radialPositions(apis.length, 38, -90).map((p) => ({
      top: 50 + (p.top - 50) * 0.62, // Between center and original API position
      left: 50 + (p.left - 50) * 0.62
    }));
    return centerPositions;
  }, [apis.length]);

  // Grootte van het animatievlak t.b.v. SVG-lijnen
  const { ref: stageRef, size: stageSize } = useElementSize<HTMLDivElement>();

  // Auto-advance
  useEffect(() => {
    if (!autoPlay) return;
    const t = setInterval(() => {
      setCurrentPhase((p) => (p + 1) % phases.length);
    }, 4000);
    return () => clearInterval(t);
  }, [autoPlay]);

  const isPhase = (n: number) => currentPhase === n;

  // NODE VARIANTS (stijl verandert per fase, positie blijft)
  const apiVariant = (index: number) => {
    if (currentPhase === 0) {
      return {
        bg: 'rgba(107,114,128,0.2)', // gray-500/20
        border: '1px solid rgba(107,114,128,0.4)',
        title: 'text-white/70',
        sub: '🔒 Locked',
        subColor: 'text-gray-400',
      };
    }
    if (currentPhase === 1) {
      return {
        bg: 'rgba(255,255,255,0.08)',
        border: '1px solid rgba(255,255,255,0.2)',
        title: 'text-white/80',
        sub: 'REST',
        subColor: 'text-white/60',
      };
    }
    // phase 2
    return {
      bg: 'rgba(16,185,129,0.12)',
      border: '2px solid rgba(16,185,129,0.4)',
      title: 'text-green-400',
      sub: '🔗 MCP',
      subColor: 'text-green-300',
    };
  };

  // MCP zichtbaarheid (fase 0: verborgen, 1: zichtbaar als "install", 2: actief)
  const mcpVariant = (index: number) => {
    if (currentPhase === 1) {
      return {
        bg: 'linear-gradient(135deg, rgba(248,115,21,0.3), rgba(248,115,21,0.2))',
        border: `2px solid rgba(248,115,21,0.5)`,
        text: 'text-orange-400',
        icon: '🔄',
      };
    }
    // phase 2
    return {
      bg: 'rgba(248,115,21,0.6)',
      border: `2px solid rgba(248,115,21,0.8)`,
      text: 'text-orange-100',
      icon: '✅',
    };
  };

  // Status cloud kleur
  const statusColors = {
    red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
    orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
  } as const;

  // Lijnstijl per fase - toon volledige connectie in Phase 3
  const lineColorAPIMCP = GREEN; // Altijd groen voor final state
  const lineColorMCPAgent = GREEN; // Altijd groen voor final state  
  const showLinesAPIMCP = currentPhase === 2; // Toon API→MCP in Phase 3
  const showLinesMCPAgent = currentPhase === 2; // Toon MCP→Agent in Phase 3
  const showMCP = currentPhase >= 1;

  const handlePlay = () => setAutoPlay((v) => !v);
  const handleReset = () => {
    setCurrentPhase(0);
    setAutoPlay(false);
  };

  return (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: '#080D14' }}>
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
                className="text-white px-4 py-2 inline-block"
                style={{ background: 'linear-gradient(135deg, #F87315, #FF8533)' }}
              >
                {t('highlight')}
              </span>{' '}
              {t('titleEnd')}
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </motion.div>

          {/* Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 lg:p-10 mb-12">
            {/* Phase chips + controls */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              {phases.map((phase, idx) => (
                <button
                  key={phase.id}
                  onClick={() => {
                    setCurrentPhase(idx);
                    setAutoPlay(false);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    idx === currentPhase ? 'text-white' : 'text-white/60 hover:text-white/90'
                  }`}
                  style={{
                    backgroundColor: idx === currentPhase ? ORANGE : 'rgba(255,255,255,0.08)',
                  }}
                >
                  {idx + 1}. {phase.title}
                </button>
              ))}
              <div className="mx-3 h-6 w-px bg-white/10" />
              <button
                onClick={handlePlay}
                className="px-3 py-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
                aria-label={autoPlay ? 'Pauze' : 'Afspelen'}
                title={autoPlay ? 'Pauze' : 'Afspelen'}
              >
                {autoPlay ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
                aria-label="Reset"
                title="Reset"
              >
                <RotateCcw size={18} />
              </button>
            </div>

            {/* Animation Stage */}
            <div
              ref={stageRef}
              className="relative h-96 lg:h-[520px] mb-8 overflow-hidden rounded-xl border border-white/10"
              style={{ background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.04), rgba(255,255,255,0.02))' }}
            >
              {/* SVG lijnen: ACHTER ALLE wolkjes */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ zIndex: -1 }}
                viewBox={`0 0 ${stageSize.width} ${stageSize.height}`}
                preserveAspectRatio="none"
              >
                {/* API -> MCP - Fixed to connect box centers */}
                {showLinesAPIMCP &&
                  apis.map((_, i) => {
                    // Shift line start 5% right to compensate for API shift left
                    const lineStartPos = {
                      top: apiPositions[i].top,
                      left: apiPositions[i].left + 5 // 5% naar rechts voor symmetrie
                    };
                    const a = getApiConnectionPoint(lineStartPos, stageSize, i); // Use new function for API connection
                    // MCP end point - shifted right for symmetry
                    const mcpEndPos = {
                      top: mcpPositions[i].top,
                      left: mcpPositions[i].left + 3 // 3% naar rechts voor betere symmetrie
                    };
                    const m = getBoxCenter(mcpEndPos, stageSize); // MCP connection point
                    
                    // Determine stroke dash array based on phase
                    const dashArray = currentPhase === 1 ? '6 8' : undefined;
                    
                    return (
                      <motion.line
                        key={`a-m-${i}`}
                        x1={a.x}
                        y1={a.y}
                        x2={m.x}
                        y2={m.y}
                        stroke={lineColorAPIMCP}
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeDasharray={dashArray}
                        initial={{ pathLength: 0, opacity: 0.0 }}
                        animate={{ pathLength: 1, opacity: 0.4 }}
                        transition={{ delay: 0.6 + i * 0.15, duration: 0.8 }}
                      />
                    );
                  })}

                {/* MCP -> Agent (center 50/50) - Fixed to connect exact box centers */}
                {showLinesMCPAgent &&
                  mcpPositions.map((p, i) => {
                    // Shift MCP connection point right to match API→MCP end points
                    const mcpConnectionPos = {
                      top: p.top,
                      left: p.left + 3 // Same 3% shift as API→MCP end points
                    };
                    const m = getBoxCenter(mcpConnectionPos, stageSize); // MCP connection point
                    // Agent box center  
                    const c = getBoxCenter({ top: 55, left: 50 }, stageSize); // Agent connection point (higher for line)
                    return (
                      <motion.line
                        key={`m-c-${i}`}
                        x1={m.x}
                        y1={m.y}
                        x2={c.x}
                        y2={c.y}
                        stroke={lineColorMCPAgent}
                        strokeWidth={3}
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0.0 }}
                        animate={{ 
                          pathLength: 1, 
                          opacity: [0.4, 0.8, 0.4],
                          strokeDashoffset: [0, -16, 0]
                        }}
                        transition={{ 
                          delay: 0.9 + i * 0.12, 
                          duration: 0.8,
                          opacity: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
                          strokeDashoffset: { repeat: Infinity, duration: 2, ease: "linear" }
                        }}
                        style={{ strokeDasharray: '10 6' }}
                      />
                    );
                  })}
              </svg>

              {/* Agent (center - lower position) */}
              <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ top: '60%', left: '50%', zIndex: 35 }}>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {currentPhase === 0 && (
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.06, 1] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="bg-red-500/20 border-2 border-red-500/40 rounded-full p-8 text-center"
                    >
                      <div className="text-red-400 text-2xl font-bold">
                        <div className="inline-flex items-center space-x-1">
                          <div className="w-8 h-8 bg-current rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">AI</span>
                          </div>
                          <span>❓</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {currentPhase === 1 && (
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                      className="bg-orange-500/20 border-2 border-orange-500/50 rounded-full p-8 text-center"
                    >
                      <div className="text-orange-500 text-2xl font-bold">
                        <div className="inline-flex items-center space-x-1">
                          <div className="w-8 h-8 bg-current rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">AI</span>
                          </div>
                          <span>🔧</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {currentPhase === 2 && (
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          '0 0 0 rgba(16,185,129,0)',
                          '0 0 30px rgba(16,185,129,0.6)',
                          '0 0 0 rgba(16,185,129,0)',
                        ],
                      }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="bg-green-500/20 border-2 border-green-500/50 rounded-full p-8 text-center"
                    >
                      <div className="text-green-500 text-2xl font-bold">
                        <div className="inline-flex items-center space-x-1">
                          <div className="w-8 h-8 bg-current rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">AI</span>
                          </div>
                          <span>✅</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div className="text-center mt-3">
                    <div
                      className={
                        currentPhase === 0
                          ? 'text-red-400'
                          : currentPhase === 1
                          ? 'text-orange-500'
                          : 'text-green-500'
                      + ' text-sm font-medium'
                      }
                    >
                      Agent
                    </div>
                    <div
                      className={
                        currentPhase === 0
                          ? 'text-red-300'
                          : currentPhase === 1
                          ? 'text-orange-400'
                          : 'text-green-400'
                      + ' text-xs'
                      }
                    >
                      {currentPhase === 0 ? t('agent.cantConnect') : currentPhase === 1 ? t('agent.waitingForMcp') : t('agent.allConnected')}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* API wolkjes – ALTIJD zichtbaar, identieke plekken */}
              {apis.map((name, i) => {
                const pos = apiPositions[i];
                const v = apiVariant(i);
                return (
                  <motion.div
                    key={`api-${name}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ top: `${pos.top}%`, left: `${pos.left}%`, zIndex: 25 }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
                  >
                    <motion.div
                      animate={
                        currentPhase === 2
                          ? { borderColor: ['rgba(16,185,129,0.4)', 'rgba(16,185,129,0.8)', 'rgba(16,185,129,0.4)'] }
                          : {}
                      }
                      transition={currentPhase === 2 ? { repeat: Infinity, duration: 2, delay: i * 0.15 } : {}}
                      className="rounded-lg p-4 text-center min-w-[105px]"
                      style={{ background: v.bg, border: v.border }}
                    >
                      <div className={`text-xs font-medium whitespace-nowrap ${v.title}`}>{name}</div>
                      <div className={`text-xs mt-1 ${v.subColor}`}>{v.sub}</div>
                    </motion.div>
                  </motion.div>
                );
              })}

              {/* MCP wolkjes – verschijnen vanaf fase 1 */}
              <AnimatePresence>
                {showMCP &&
                  mcpPositions.map((pos, i) => {
                    const v = mcpVariant(i);
                    return (
                      <motion.div
                        key={`mcp-${i}`}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{ top: `${pos.top}%`, left: `${pos.left}%`, zIndex: 30 }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ delay: 0.4 + i * 0.1, duration: 0.3 }}
                      >
                        <div
                          className="rounded-lg p-3 text-center min-w-[64px]"
                          style={{ background: v.bg, border: v.border }}
                        >
                          <div className={`text-xs font-bold ${v.text}`}>MCP</div>
                          <div className="text-xs text-white">{v.icon}</div>
                        </div>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>

            </div>

            {/* Tekst onder de animatie */}
            <motion.div
              key={currentPhase}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="text-center"
            >
              <h3 className="text-2xl font-bold text-white mb-2">{phases[currentPhase].subtitle}</h3>
              <p className="text-white/70 text-lg">{phases[currentPhase].description}</p>
            </motion.div>
          </div>

          {/* Comparison Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="max-w-4xl mx-auto">
              <div className="grid lg:grid-cols-3 gap-6 items-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                {/* Traditional API */}
                <div className="text-center">
                  <h4 className="text-white/90 font-medium text-lg mb-2">{t('comparison.traditional.title')}</h4>
                  <p className="text-white/60 text-sm">{t('comparison.traditional.description')}</p>
                </div>
                
                {/* Technology Visual */}
                <div className="flex items-center justify-center h-32 bg-white/5 border border-white/10 rounded-xl">
                  <div className="text-white/60 font-mono text-sm">{t('comparison.arrow')}</div>
                </div>
                
                {/* MCP Protocol */}
                <div className="text-center">
                  <h4 className="text-white/90 font-medium text-lg mb-2">{t('comparison.mcp.title')}</h4>
                  <p className="text-white/60 text-sm">{t('comparison.mcp.description')}</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: ORANGE }}>
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('benefits.faster.title')}</h3>
              <p className="text-white/70">{t('benefits.faster.description')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: ORANGE }}>
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('benefits.universal.title')}</h3>
              <p className="text-white/70">{t('benefits.universal.description')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: ORANGE }}>
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('benefits.roi.title')}</h3>
              <p className="text-white/70">{t('benefits.roi.description')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
