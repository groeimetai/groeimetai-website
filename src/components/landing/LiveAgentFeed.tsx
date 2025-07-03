'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Bot,
  Code,
  Search,
  Shield,
  GitBranch,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface AgentActivity {
  id: string;
  agent: string;
  action: string;
  status: 'working' | 'completed' | 'reviewing';
  timestamp: Date;
  icon: any;
  color: string;
}

const agentTypes = [
  { name: 'Researcher', icon: Search, color: 'text-blue-500' },
  { name: 'Developer', icon: Code, color: 'text-green-500' },
  { name: 'Validator', icon: Shield, color: 'text-purple-500' },
  { name: 'Orchestrator', icon: GitBranch, color: 'text-orange-500' },
  { name: 'Analyzer', icon: Bot, color: 'text-pink-500' },
];

const actions = [
  'Analyzing requirements',
  'Writing code modules',
  'Running security scans',
  'Optimizing performance',
  'Generating documentation',
  'Testing edge cases',
  'Reviewing architecture',
  'Implementing features',
  'Validating outputs',
  'Coordinating agents',
];

// Simple time formatting to avoid hydration issues
const formatTime = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

export default function LiveAgentFeed() {
  const [activities, setActivities] = useState<AgentActivity[]>([]);
  const [stats, setStats] = useState({
    tasksCompleted: 1247,
    activeAgents: 5,
    avgResponseTime: 89,
    successRate: 99.7,
  });

  // Generate random activities
  useEffect(() => {
    const generateActivity = (): AgentActivity => {
      const agent = agentTypes[Math.floor(Math.random() * agentTypes.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const statuses: AgentActivity['status'][] = ['working', 'completed', 'reviewing'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      return {
        id: Math.random().toString(36).substring(2, 11),
        agent: agent.name,
        action,
        status,
        timestamp: new Date(),
        icon: agent.icon,
        color: agent.color,
      };
    };

    // Initial activities
    const initial = Array.from({ length: 5 }, generateActivity);
    setActivities(initial);

    // Add new activities periodically
    const interval = setInterval(() => {
      setActivities((prev) => {
        const newActivity = generateActivity();
        const updated = [newActivity, ...prev].slice(0, 8);
        return updated;
      });

      // Update stats
      setStats((prev) => ({
        tasksCompleted: prev.tasksCompleted + Math.floor(Math.random() * 3),
        activeAgents: 3 + Math.floor(Math.random() * 5),
        avgResponseTime: 80 + Math.floor(Math.random() * 30),
        successRate: 99.5 + Math.random() * 0.4,
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: AgentActivity['status']) => {
    switch (status) {
      case 'working':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'reviewing':
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: AgentActivity['status']) => {
    switch (status) {
      case 'working':
        return 'text-yellow-500';
      case 'completed':
        return 'text-green-500';
      case 'reviewing':
        return 'text-blue-500';
    }
  };

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
          <h2 className="mb-4 text-white">
            AI Agents <span className="text-orange-500">Working</span> 24/7
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Watch our autonomous agents collaborate in real-time to deliver exceptional results
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live Feed */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="bg-black/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Live Agent Activity</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-white/60">Live</span>
                </div>
              </div>

              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {activities.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg bg-white/10 ${activity.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-white">{activity.agent} Agent</h4>
                              <div
                                className={`flex items-center gap-1 ${getStatusColor(activity.status)}`}
                              >
                                {getStatusIcon(activity.status)}
                                <span className="text-sm capitalize">{activity.status}</span>
                              </div>
                            </div>
                            <p className="text-sm text-white/60">{activity.action}</p>
                            <p className="text-xs text-white/40 mt-1">
                              {formatTime(new Date(activity.timestamp))}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <div className="bg-black/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Performance Metrics</h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-white/60">Tasks Completed</span>
                    <span className="text-2xl font-bold text-orange-500">
                      {stats.tasksCompleted}
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-white/60">Active Agents</span>
                    <span className="text-2xl font-bold text-green-500">{stats.activeAgents}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.activeAgents / 8) * 100}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-white/60">Avg Response Time</span>
                    <span className="text-2xl font-bold text-blue-500">
                      {stats.avgResponseTime}ms
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${100 - (stats.avgResponseTime / 200) * 100}%` }}
                      transition={{ duration: 1, delay: 0.4 }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-white/60">Success Rate</span>
                    <span className="text-2xl font-bold text-purple-500">
                      {stats.successRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.successRate}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Status */}
            <div className="bg-black/80 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Agent Network</h4>
              <div className="grid grid-cols-2 gap-3">
                {agentTypes.map((agent, index) => {
                  const Icon = agent.icon;
                  const isActive = index < stats.activeAgents;
                  return (
                    <div
                      key={agent.name}
                      className={`
                        flex items-center gap-2 p-3 rounded-lg border transition-all
                        ${
                          isActive
                            ? 'bg-white/10 border-white/20'
                            : 'bg-white/5 border-white/10 opacity-50'
                        }
                      `}
                    >
                      <Icon className={`w-4 h-4 ${agent.color}`} />
                      <span className="text-sm text-white/80">{agent.name}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
