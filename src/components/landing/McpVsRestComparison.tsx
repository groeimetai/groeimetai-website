'use client';

import { motion } from 'framer-motion';
import { X, Check, ArrowRight } from 'lucide-react';

export default function McpVsRestComparison() {
  const comparisons = [
    {
      feature: 'Agent Discovery',
      rest: 'Agents kunnen niet discoveren',
      mcp: 'Auto-discovery voor agents',
      restIcon: X,
      mcpIcon: Check
    },
    {
      feature: 'Protocol',
      rest: 'Geen standaard protocol',
      mcp: 'Universeel MCP protocol',
      restIcon: X,
      mcpIcon: Check
    },
    {
      feature: 'Authentication',
      rest: 'Complex authentication',
      mcp: 'Built-in security',
      restIcon: X,
      mcpIcon: Check
    },
    {
      feature: 'Context Awareness',
      rest: 'Geen context awareness',
      mcp: 'Context-aware interactions',
      restIcon: X,
      mcpIcon: Check
    },
    {
      feature: 'Documentation',
      rest: 'Handmatige documentatie',
      mcp: 'Self-describing endpoints',
      restIcon: X,
      mcpIcon: Check
    },
    {
      feature: 'Agent Integration',
      rest: 'Custom per agent/API',
      mcp: 'Plug & play voor alle agents',
      restIcon: X,
      mcpIcon: Check
    }
  ];

  return (
    <section className="py-24 relative" style={{ backgroundColor: '#080D14' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Waarom MCP? <span style={{ color: '#F87315' }}>Het technische verhaal</span>
            </h2>
            <p className="text-xl text-white/70 max-w-4xl mx-auto leading-relaxed">
              REST APIs zijn gemaakt voor mensen. MCP servers zijn gemaakt voor agents. 
              Het verschil bepaalt of jouw systemen meedoen in de agent economie.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* REST APIs - Old Way */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-red-500/10 border border-red-500/30 rounded-xl p-8"
            >
              <div className="text-center mb-6">
                <X className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">REST APIs</h3>
                <p className="text-red-400 font-semibold">De oude manier</p>
              </div>

              <ul className="space-y-4">
                {comparisons.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-white/80 font-medium">{item.feature}: </span>
                      <span className="text-white/60">{item.rest}</span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-red-500/20">
                <p className="text-red-400 text-sm font-medium">
                  ❌ Resultaat: Agent-blind systemen
                </p>
              </div>
            </motion.div>

            {/* MCP Servers - New Way */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="border border-green-500/30 rounded-xl p-8"
              style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}
            >
              <div className="text-center mb-6">
                <Check className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">MCP Servers</h3>
                <p className="text-green-400 font-semibold">De agent-ready manier</p>
              </div>

              <ul className="space-y-4">
                {comparisons.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-white/80 font-medium">{item.feature}: </span>
                      <span className="text-white/60">{item.mcp}</span>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-green-500/20">
                <p className="text-green-400 text-sm font-medium">
                  ✅ Resultaat: Volledig agent-accessible
                </p>
              </div>
            </motion.div>
          </div>

          {/* Technical Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8"
          >
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-white mb-2">1x</div>
                <div className="text-white/60">MCP Server</div>
                <div className="text-sm text-white/40 mt-1">vs per-agent custom code</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">Universeel</div>
                <div className="text-white/60">Protocol</div>
                <div className="text-sm text-white/40 mt-1">vs agent-specifieke integraties</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-2">Plug & Play</div>
                <div className="text-white/60">Voor Alle Agents</div>
                <div className="text-sm text-white/40 mt-1">vs maanden custom development</div>
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-lg text-white/80 mb-4">
                <strong>Het verschil?</strong> Eén MCP server werkt met alle agents. 
                REST APIs vereisen per agent custom integratie code.
              </p>
              <div className="inline-flex items-center gap-2 text-sm" style={{ color: '#F87315' }}>
                <span>Bekijk Snow-flow: onze open source MCP server</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}