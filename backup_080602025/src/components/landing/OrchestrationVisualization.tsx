'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Agent {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  type: string;
  color: string;
  activity: number;
  tasks: number;
}

interface Connection {
  from: string;
  to: string;
  strength: number;
  dataFlow: number;
}

const agentTypes = [
  { type: 'Researcher', color: '#3B82F6', description: 'Gathers and analyzes information' },
  { type: 'Analyst', color: '#8B5CF6', description: 'Processes data and identifies patterns' },
  { type: 'Developer', color: '#10B981', description: 'Implements solutions and writes code' },
  { type: 'Orchestrator', color: '#FF6600', description: 'Coordinates agent collaboration' },
  { type: 'Validator', color: '#EF4444', description: 'Ensures quality and accuracy' },
];

export default function OrchestrationVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const agentsRef = useRef<Agent[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const hoveredAgentRef = useRef<string | null>(null);
  const selectedAgentRef = useRef<string | null>(null);
  const [, forceUpdate] = useState({});
  const [stats, setStats] = useState({ totalTasks: 0, activeConnections: 0, throughput: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = 500;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize agents
    const initAgents = () => {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.min(canvas.width, canvas.height) * 0.3;

      // Central orchestrator
      agentsRef.current = [
        {
          id: 'orchestrator',
          x: centerX,
          y: centerY,
          targetX: centerX,
          targetY: centerY,
          type: 'Orchestrator',
          color: '#FF6600',
          activity: 1,
          tasks: 0,
        },
      ];

      // Surrounding agents
      agentTypes
        .filter((t) => t.type !== 'Orchestrator')
        .forEach((agentType, index) => {
          const angle = (index / 4) * Math.PI * 2;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          agentsRef.current.push({
            id: `agent-${index}`,
            x,
            y,
            targetX: x,
            targetY: y,
            type: agentType.type,
            color: agentType.color,
            activity: 0.5 + Math.random() * 0.5,
            tasks: Math.floor(Math.random() * 10),
          });
        });
    };

    // Initialize connections
    const initConnections = () => {
      connectionsRef.current = [];

      // Connect all agents to orchestrator
      for (let i = 1; i < agentsRef.current.length; i++) {
        connectionsRef.current.push({
          from: 'orchestrator',
          to: agentsRef.current[i].id,
          strength: 0.5 + Math.random() * 0.5,
          dataFlow: Math.random(),
        });
      }

      // Some inter-agent connections
      connectionsRef.current.push(
        { from: 'agent-0', to: 'agent-1', strength: Math.random() * 0.5, dataFlow: Math.random() },
        { from: 'agent-1', to: 'agent-2', strength: Math.random() * 0.5, dataFlow: Math.random() },
        { from: 'agent-2', to: 'agent-3', strength: Math.random() * 0.5, dataFlow: Math.random() },
        { from: 'agent-3', to: 'agent-0', strength: Math.random() * 0.5, dataFlow: Math.random() }
      );
    };

    initAgents();
    initConnections();

    // Handle mouse interactions with throttling
    let lastMouseMove = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMouseMove < 50) return; // Throttle to 20fps
      lastMouseMove = now;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      let foundAgent = null;
      agentsRef.current.forEach((agent) => {
        const distance = Math.sqrt((agent.x - x) ** 2 + (agent.y - y) ** 2);
        if (distance < 30) {
          foundAgent = agent.id;
        }
      });

      canvas.style.cursor = foundAgent ? 'pointer' : 'default';

      if (foundAgent !== hoveredAgentRef.current) {
        hoveredAgentRef.current = foundAgent;
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (hoveredAgentRef.current) {
        selectedAgentRef.current =
          hoveredAgentRef.current === selectedAgentRef.current ? null : hoveredAgentRef.current;
        forceUpdate({});
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Skip background grid for performance

      // Update agent positions and activity
      const time = Date.now() * 0.001;
      agentsRef.current = agentsRef.current.map((agent, index) => {
        let newX = agent.x;
        let newY = agent.y;

        if (agent.id === 'orchestrator') {
          // Orchestrator slight movement
          newX = canvas.width / 2 + Math.sin(time * 0.5) * 5;
          newY = canvas.height / 2 + Math.cos(time * 0.3) * 5;
        } else {
          // Other agents orbit
          const baseAngle = (index - 1) * ((Math.PI * 2) / 4);
          const radius = Math.min(canvas.width, canvas.height) * 0.3;
          const orbitSpeed = 0.1;
          newX = canvas.width / 2 + Math.cos(baseAngle + time * orbitSpeed) * radius;
          newY = canvas.height / 2 + Math.sin(baseAngle + time * orbitSpeed) * radius;
        }

        // Update activity
        const targetActivity =
          hoveredAgentRef.current === agent.id
            ? 1
            : selectedAgentRef.current === agent.id
              ? 0.9
              : 0.5;
        const activity = agent.activity + (targetActivity - agent.activity) * 0.1;

        // Update tasks less frequently
        if (Math.random() < 0.01) {
          agent.tasks = Math.max(0, Math.min(20, agent.tasks + (Math.random() > 0.5 ? 1 : -1)));
        }

        return {
          ...agent,
          x: agent.x + (newX - agent.x) * 0.1,
          y: agent.y + (newY - agent.y) * 0.1,
          activity,
        };
      });

      // Update connections
      connectionsRef.current = connectionsRef.current.map((conn) => {
        const isHighlighted =
          selectedAgentRef.current === conn.from || selectedAgentRef.current === conn.to;
        const targetStrength = isHighlighted ? 1 : 0.5;
        return {
          ...conn,
          strength: conn.strength + (targetStrength - conn.strength) * 0.1,
          dataFlow: (conn.dataFlow + 0.005) % 1,
        };
      });

      // Draw connections
      connectionsRef.current.forEach((conn) => {
        const fromAgent = agentsRef.current.find((a) => a.id === conn.from);
        const toAgent = agentsRef.current.find((a) => a.id === conn.to);

        if (fromAgent && toAgent) {
          // Connection line
          ctx.beginPath();
          ctx.moveTo(fromAgent.x, fromAgent.y);

          // Curved path
          const midX = (fromAgent.x + toAgent.x) / 2;
          const midY = (fromAgent.y + toAgent.y) / 2;
          const curve = 30;

          ctx.quadraticCurveTo(
            midX + Math.sin(time) * curve * 0.3,
            midY + Math.cos(time) * curve * 0.3,
            toAgent.x,
            toAgent.y
          );

          const isHighlighted =
            selectedAgentRef.current === conn.from || selectedAgentRef.current === conn.to;
          ctx.strokeStyle = isHighlighted
            ? `rgba(255, 102, 0, ${conn.strength * 0.8})`
            : `rgba(59, 130, 246, ${conn.strength * 0.3})`;
          ctx.lineWidth = conn.strength * 4;
          ctx.stroke();

          // Data particles
          const particleCount = isHighlighted ? 3 : 1;
          for (let i = 0; i < particleCount; i++) {
            const t = (conn.dataFlow + i / particleCount) % 1;
            const px = fromAgent.x * (1 - t) + toAgent.x * t;
            const py = fromAgent.y * (1 - t) + toAgent.y * t;

            ctx.beginPath();
            ctx.arc(px, py, 3, 0, Math.PI * 2);
            ctx.fillStyle = isHighlighted
              ? `rgba(255, 102, 0, ${1 - t})`
              : `rgba(59, 130, 246, ${1 - t})`;
            ctx.fill();
          }
        }
      });

      // Draw shared memory pool
      const pulseScale = 1 + Math.sin(time * 2) * 0.1;
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        60 * pulseScale
      );
      gradient.addColorStop(0, 'rgba(255, 102, 0, 0.4)');
      gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.2)');
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 60 * pulseScale, 0, Math.PI * 2);
      ctx.fill();

      // Memory pool text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SHARED', canvas.width / 2, canvas.height / 2 - 10);
      ctx.fillText('MEMORY', canvas.width / 2, canvas.height / 2 + 10);

      // Draw agents
      agentsRef.current.forEach((agent) => {
        const isHovered = hoveredAgentRef.current === agent.id;
        const isSelected = selectedAgentRef.current === agent.id;

        // Agent glow
        const glowSize = (isHovered ? 50 : 40) * agent.activity;
        const glowGradient = ctx.createRadialGradient(
          agent.x,
          agent.y,
          0,
          agent.x,
          agent.y,
          glowSize
        );
        glowGradient.addColorStop(0, isSelected ? `${agent.color}80` : `${agent.color}40`);
        glowGradient.addColorStop(1, `${agent.color}00`);

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(agent.x, agent.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Agent core
        const coreSize = isHovered ? 22 : 18;
        ctx.fillStyle = agent.color;
        ctx.beginPath();
        ctx.arc(agent.x, agent.y, coreSize, 0, Math.PI * 2);
        ctx.fill();

        // Inner circle
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(agent.x, agent.y, coreSize - 4, 0, Math.PI * 2);
        ctx.fill();

        // Task indicator
        if (agent.tasks > 0) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(agent.tasks.toString(), agent.x, agent.y);
        }

        // Agent label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = isHovered ? 'bold 14px sans-serif' : '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(agent.type, agent.x, agent.y + coreSize + 8);

        // Activity percentage for selected
        if (isSelected) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.font = '11px sans-serif';
          ctx.fillText(
            `${Math.round(agent.activity * 100)}% Active`,
            agent.x,
            agent.y + coreSize + 25
          );
          ctx.fillText(`${agent.tasks} Tasks`, agent.x, agent.y + coreSize + 40);
        }
      });

      // Update stats
      const totalTasks = agentsRef.current.reduce((sum, agent) => sum + agent.tasks, 0);
      const activeConnections = connectionsRef.current.filter((c) => c.strength > 0.7).length;
      const throughput = Math.round(totalTasks * 2.5);
      setStats({ totalTasks, activeConnections, throughput });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <section className="py-20 bg-black relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="mb-4 text-white">Multi-Agent Orchestration in Action</h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Experience our AI agents collaborating in real-time. Click on any agent to explore their
            connections and watch as they share knowledge through our unified memory pool to solve
            complex problems.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="relative bg-black/50 backdrop-blur-sm rounded-2xl border border-white/10 p-8 shadow-2xl">
            <canvas ref={canvasRef} className="w-full" style={{ maxWidth: '100%' }} />

            {/* Instructions */}
            <div className="absolute top-4 right-4 text-sm text-white/60 bg-black/80 backdrop-blur-sm rounded-lg p-3">
              <p className="flex items-center gap-2">
                <span className="text-orange-500">👆</span>
                Click agents to explore
              </p>
            </div>

            {/* Live Stats */}
            <div className="absolute bottom-4 left-4 text-sm text-white/80 bg-black/80 backdrop-blur-sm rounded-lg p-3 space-y-1">
              <p>
                Active Tasks: <span className="text-orange-500 font-bold">{stats.totalTasks}</span>
              </p>
              <p>
                Connections:{' '}
                <span className="text-blue-500 font-bold">{stats.activeConnections}</span>
              </p>
              <p>
                Throughput: <span className="text-green-500 font-bold">{stats.throughput}/s</span>
              </p>
            </div>

            {/* Legend */}
            <div className="mt-8 flex flex-wrap justify-center gap-6">
              {agentTypes.map((type) => (
                <div key={type.type} className="group relative">
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: type.color }} />
                    <span className="text-sm text-white/70">{type.type}</span>
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-black/90 text-white/80 text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {type.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center"
        >
          <div>
            <h3 className="text-4xl font-bold text-orange-500 mb-2">5+</h3>
            <p className="text-white/70">Specialized AI Agents</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-orange-500 mb-2">100ms</h3>
            <p className="text-white/70">Average Response Time</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-orange-500 mb-2">24/7</h3>
            <p className="text-white/70">Continuous Operation</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
