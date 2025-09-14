'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  BarChart3, FileText,
  TrendingUp, CheckCircle, AlertCircle,
  Target, Activity, Shield,
  Search, ArrowRight
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentTime, setCurrentTime] = useState('Dinsdag 14 maart, 09:15');
  const [mounted, setMounted] = useState(false);

  // Admin data placeholders
  const adminProfile = {
    name: 'Admin',
    role: 'Agent Infrastructure Architect'
  };

  const actionItems = [
    {
      type: 'report',
      priority: 'high',
      title: 'Assessment Report',
      subtitle: '[Company Name] - Draft ready',
      details: 'Score: [X]/100',
      time: 'Recent',
      action: 'Review & Approve',
      color: 'red'
    },
    {
      type: 'meeting',
      priority: 'medium',
      title: 'Pilot Kickoff', 
      subtitle: '[Client] - Scheduled today',
      details: 'Prep: Credentials needed',
      time: 'Today',
      action: 'View Details',
      color: 'orange'
    },
    {
      type: 'contract',
      priority: 'medium',
      title: 'Contract Renewal',
      subtitle: '[Client] - Expires soon',
      details: 'Value: [Amount]/month',
      time: 'Upcoming',
      action: 'Prepare Renewal',
      color: 'orange'
    }
  ];

  const businessMetrics = {
    revenue: { current: 125000, change: 12, target: 200000, percentage: 62 },
    leads: { current: 45, change: 8, target: 60, percentage: 75 },
    conversion: { current: 18, change: 3, target: 25, percentage: 72 },
    projects: { current: 12, change: 2, target: 15, percentage: 80 }
  };

  const pipelineData = {
    leads: 23,
    assessments: 8,
    pilots: 5,
    implementations: 3,
    live: 12,
    totalValue: 850000,
    weightedValue: 425000
  };

  const reportQueue = [
    { 
      company: '[Company A]', 
      type: 'Assessment', 
      score: '[X]/100', 
      generated: 'Recent', 
      status: 'review', 
      assigned: 'Admin' 
    },
    { 
      company: '[Company B]', 
      type: 'Assessment', 
      score: '[Y]/100', 
      generated: 'Hours ago', 
      status: 'editing', 
      assigned: 'Admin' 
    },
    { 
      company: '[Company C]', 
      type: 'Assessment', 
      score: '[Z]/100', 
      generated: 'Yesterday', 
      status: 'ready', 
      assigned: '-' 
    },
    { 
      company: '[Company D]', 
      type: 'Monthly', 
      score: 'N/A', 
      generated: 'Days ago', 
      status: 'sent', 
      assigned: 'Auto' 
    }
  ];

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const interval = setInterval(() => {
        setCurrentTime(new Date().toLocaleString('nl-NL', { 
          weekday: 'long',
          day: 'numeric', 
          month: 'long',
          hour: '2-digit',
          minute: '2-digit'
        }));
      }, 60000);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-24">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-8">
            {/* Welcome */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold text-white mb-2">
                Good morning, <span style={{ color: '#F87315' }}>{adminProfile.name}</span>
              </h2>
              <p className="text-white/60">
                {currentTime} | 3 items need attention
              </p>
            </motion.div>

            {/* Action Required */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
                  Action Required (3)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid lg:grid-cols-3 gap-6">
                  {actionItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`p-6 rounded-lg border ${
                        item.color === 'red' ? 'bg-red-500/10 border-red-500/30' :
                        item.color === 'orange' ? 'bg-orange-500/10 border-orange-500/30' :
                        'bg-blue-500/10 border-blue-500/30'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full mb-4 ${
                        item.color === 'red' ? 'bg-red-400' :
                        item.color === 'orange' ? 'bg-orange-400' : 'bg-blue-400'
                      }`}></div>
                      
                      <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                      <p className="text-white/80 text-sm mb-1">{item.subtitle}</p>
                      <p className="text-white/60 text-xs mb-3">{item.details}</p>
                      <p className="text-white/50 text-xs mb-4">{item.time}</p>
                      
                      <Button
                        size="sm"
                        className="w-full text-white"
                        style={{ backgroundColor: '#F87315' }}
                      >
                        {item.action}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Business Metrics */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Business Metrics (March)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-white/60 text-sm mb-2">Revenue</p>
                    <p className="text-3xl font-bold text-white mb-1">€{businessMetrics.revenue.current.toLocaleString()}</p>
                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <span className="text-green-400">↑ {businessMetrics.revenue.change}%</span>
                      <span className="text-white/60">{businessMetrics.revenue.percentage}% of €{(businessMetrics.revenue.target/1000)}k</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-white/60 text-sm mb-2">New Leads</p>
                    <p className="text-3xl font-bold text-white mb-1">{businessMetrics.leads.current}</p>
                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <span className="text-green-400">↑ {businessMetrics.leads.change} leads</span>
                      <span className="text-white/60">{businessMetrics.leads.percentage}%</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-white/60 text-sm mb-2">Conversion</p>
                    <p className="text-3xl font-bold text-white mb-1">{businessMetrics.conversion.current}%</p>
                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <span className="text-green-400">↑ {businessMetrics.conversion.change}%</span>
                      <span className="text-white/60">Target: {businessMetrics.conversion.target}%</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-white/60 text-sm mb-2">Active Projects</p>
                    <p className="text-3xl font-bold text-white mb-1">{businessMetrics.projects.current}</p>
                    <div className="flex items-center justify-center space-x-2 text-sm">
                      <span className="text-green-400">+{businessMetrics.projects.change}</span>
                      <span className="text-white/60">On track</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Detailed Analytics
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pipeline Overview */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Pipeline Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{pipelineData.leads}</div>
                        <div className="text-white/60 text-xs">Leads</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/40" />
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{pipelineData.assessments}</div>
                        <div className="text-white/60 text-xs">Assessment</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/40" />
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{pipelineData.pilots}</div>
                        <div className="text-white/60 text-xs">Pilot</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/40" />
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{pipelineData.implementations}</div>
                        <div className="text-white/60 text-xs">Implementation</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/40" />
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{pipelineData.live}</div>
                        <div className="text-white/60 text-xs">Live</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-white font-semibold mb-3">Conversion Rates:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Lead→Assessment:</span>
                        <span className="text-white">52%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Assessment→Pilot:</span>
                        <span className="text-white">42%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Pilot→Implementation:</span>
                        <span className="text-white">60%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Implementation→Live:</span>
                        <span className="text-green-400">100%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-3">Pipeline Value:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Total Value:</span>
                        <span className="text-white font-bold">€{pipelineData.totalValue.toLocaleString('nl-NL')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Weighted Value:</span>
                        <span style={{ color: '#F87315' }} className="font-bold">€{pipelineData.weightedValue.toLocaleString('nl-NL')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REPORTS TAB */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Assessment Reports Queue</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-white/60" />
                  <Input
                    placeholder="Search..."
                    className="bg-white/5 border-white/20 text-white w-48"
                  />
                </div>
                <Button className="text-white" style={{ backgroundColor: '#F87315' }}>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate New Report
                </Button>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                All
              </Button>
              <Button variant="outline" size="sm" className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10">
                Pending
              </Button>
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                Approved
              </Button>
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                Sent
              </Button>
            </div>

            {/* Reports Table */}
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr className="text-white/60 text-sm">
                        <th className="text-left p-4">Company</th>
                        <th className="text-left p-4">Type</th>
                        <th className="text-left p-4">Score</th>
                        <th className="text-left p-4">Generated</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Assigned</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportQueue.map((report, index) => (
                        <tr key={index} className="border-t border-white/10 hover:bg-white/5">
                          <td className="p-4 text-white font-medium">{report.company}</td>
                          <td className="p-4 text-white/80">{report.type}</td>
                          <td className="p-4 text-white">{report.score}</td>
                          <td className="p-4 text-white/70">{report.generated}</td>
                          <td className="p-4">
                            <Badge className={
                              report.status === 'review' ? 'bg-red-500/20 text-red-400' :
                              report.status === 'editing' ? 'bg-orange-500/20 text-orange-400' :
                              report.status === 'ready' ? 'bg-green-500/20 text-green-400' :
                              'bg-blue-500/20 text-blue-400'
                            }>
                              {report.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="p-4 text-white/70">{report.assigned}</td>
                          <td className="p-4">
                            <Button
                              size="sm"
                              className="text-white"
                              style={{ backgroundColor: '#F87315' }}
                            >
                              {report.status === 'review' ? 'Open' :
                               report.status === 'editing' ? 'Continue' :
                               report.status === 'ready' ? 'Send' : 'View'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics" className="space-y-6">
            <h3 className="text-2xl font-bold text-white">Revenue Analytics</h3>
            
            {/* MRR Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-white mb-2">€32,500</div>
                  <div className="text-white/60 text-sm mb-2">Current MRR</div>
                  <div className="text-green-400 text-sm">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    +23% growth
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-white mb-2">€7,500</div>
                  <div className="text-white/60 text-sm mb-2">New MRR this month</div>
                  <div className="text-green-400 text-sm">No churn</div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-white mb-2">€0</div>
                  <div className="text-white/60 text-sm mb-2">Churn</div>
                  <div className="text-green-400 text-sm">Perfect retention</div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Breakdown */}
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">By Service Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Assessment</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white">€[Amount]</span>
                        <span className="text-white/60 text-sm">([%]%)</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Pilot</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white">€[Amount]</span>
                        <span className="text-white/60 text-sm">([%]%)</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Implementation</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white">€[Amount]</span>
                        <span className="text-white/60 text-sm">([%]%)</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="text-white font-medium">Monitoring (recurring)</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-bold">€[Amount]/m</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">By Client Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Enterprise ([N])</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white">€[Amount]</span>
                        <span className="text-white/60 text-sm">([%]%)</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Mid-market ([N])</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white">€[Amount]</span>
                        <span className="text-white/60 text-sm">([%]%)</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">SMB ([N])</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white">€[Amount]</span>
                        <span className="text-white/60 text-sm">([%]%)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Operational Metrics */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Operational Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">[X]</div>
                    <div className="text-white/60 text-sm">days</div>
                    <div className="text-white/70 text-xs">Avg Assessment → Pilot</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">[Y]</div>
                    <div className="text-white/60 text-sm">days</div>
                    <div className="text-white/70 text-xs">Avg Pilot → Implementation</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">[Z]</div>
                    <div className="text-white/60 text-sm">days</div>
                    <div className="text-white/70 text-xs">Avg Implementation time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-1">[H]</div>
                    <div className="text-white/60 text-sm">hours</div>
                    <div className="text-white/70 text-xs">Support ticket resolution</div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <h4 className="text-white font-semibold mb-4">Team Utilization:</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Niels:</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-white/10 rounded-full h-2">
                          <div className="w-20 bg-orange-500 h-2 rounded-full"></div>
                        </div>
                        <span className="text-white">78%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Team avg:</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-white/10 rounded-full h-2">
                          <div className="w-18 bg-green-500 h-2 rounded-full"></div>
                        </div>
                        <span className="text-white">72%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SYSTEM TAB */}
          <TabsContent value="system" className="space-y-6">
            <h3 className="text-2xl font-bold text-white">Infrastructure Status</h3>

            {/* System Status Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">API Gateway</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Status:</span>
                      <span className="text-green-400">✅ Operational</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Requests:</span>
                      <span className="text-white">24,847/hour</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Latency:</span>
                      <span className="text-green-400">45ms avg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Errors:</span>
                      <span className="text-green-400">0.02%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">MCP Servers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Active:</span>
                      <span className="text-green-400">12 servers</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/70">Snow-flow: v2.1.0</span>
                        <span className="text-green-400">✅</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/70">CRM-connector: v1.8.2</span>
                        <span className="text-green-400">✅</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/70">Planning-MCP: v1.2.0</span>
                        <span className="text-green-400">✅</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                      View All
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Client Portals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Active sessions:</span>
                      <span className="text-white">23</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Disk usage:</span>
                      <span className="text-white">34.2GB / 100GB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Bandwidth today:</span>
                      <span className="text-white">12.3GB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Security & Compliance */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Security & Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-white font-semibold mb-4">Security Status</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Last security scan:</span>
                        <span className="text-green-400">2 days ago ✅</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Vulnerabilities:</span>
                        <span className="text-white">0 critical, 2 low</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">SSL Certificates:</span>
                        <span className="text-green-400">Valid (287 days)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-4">Compliance</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Backups:</span>
                        <span className="text-green-400">Completed 03:00 ✅</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">GDPR Compliance:</span>
                        <span className="text-green-400">✅ Passed audit</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Shield className="w-4 h-4 mr-2" />
                    Run Security Scan
                  </Button>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    View Certificates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}