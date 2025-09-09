'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, Edit, Check, X, RefreshCw, FileText, Mail, Calendar,
  AlertCircle, TrendingUp, Users, Building
} from 'lucide-react';

interface Report {
  id: string;
  company: string;
  contactName: string;
  email: string;
  score: number;
  status: 'draft' | 'approved' | 'rejected' | 'sent';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  systems: string[];
  timeline: string;
  reportContent: string;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/admin/reports');
      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (reportId: string) => {
    try {
      await fetch(`/api/admin/reports/${reportId}/approve`, {
        method: 'POST'
      });
      fetchReports();
    } catch (error) {
      console.error('Error approving report:', error);
    }
  };

  const handleReject = async (reportId: string, reason: string) => {
    try {
      await fetch(`/api/admin/reports/${reportId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      fetchReports();
    } catch (error) {
      console.error('Error rejecting report:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400';
      case 'medium': return 'bg-orange-500/20 text-orange-400';
      case 'low': return 'bg-green-500/20 text-green-400';
      default: return 'bg-white/20 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-yellow-500/20 text-yellow-400';
      case 'approved': return 'bg-green-500/20 text-green-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      case 'sent': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-white/20 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-32">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h1 className="text-4xl font-bold text-white mb-6">
              <span
                className="text-white px-4 py-2 inline-block"
                style={{ background: 'linear-gradient(135deg, #F87315, #FF8533)' }}
              >
                Agent Readiness
              </span>{' '}
              Reports Dashboard
            </h1>
            <p className="text-xl text-white/70">
              Review en beheer MCP Readiness Reports voor prospects
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Pending Review</p>
                    <p className="text-2xl font-bold text-white">
                      {reports.filter(r => r.status === 'draft').length}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Sent This Month</p>
                    <p className="text-2xl font-bold text-white">
                      {reports.filter(r => r.status === 'sent').length}
                    </p>
                  </div>
                  <Mail className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Avg Score</p>
                    <p className="text-2xl font-bold text-white">
                      {reports.length > 0 ? Math.round(reports.reduce((acc, r) => acc + r.score, 0) / reports.length) : 0}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8" style={{ color: '#F87315' }} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">High Priority</p>
                    <p className="text-2xl font-bold text-white">
                      {reports.filter(r => r.priority === 'high').length}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reports Table */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Pending Reports</span>
                <Button
                  onClick={fetchReports}
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-white/60" />
                  <p className="text-white/60">Loading reports...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-8 h-8 mx-auto mb-4 text-white/60" />
                  <p className="text-white/60">Geen rapporten gevonden</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="bg-white/5 border border-white/10 rounded-lg p-6 hover:border-white/20 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-lg font-bold text-white">{report.company}</h3>
                            <Badge className={getPriorityColor(report.priority)}>
                              {report.priority.toUpperCase()}
                            </Badge>
                            <Badge className={getStatusColor(report.status)}>
                              {report.status.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-3 gap-4 text-sm text-white/70 mb-4">
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2" />
                              {report.contactName} ({report.email})
                            </div>
                            <div className="flex items-center">
                              <TrendingUp className="w-4 h-4 mr-2" />
                              Score: {report.score}/100
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              {new Date(report.createdAt).toLocaleDateString('nl-NL')}
                            </div>
                          </div>

                          <div className="text-sm text-white/60">
                            <span>Systemen: </span>
                            {report.systems.slice(0, 3).join(', ')}
                            {report.systems.length > 3 && ` +${report.systems.length - 3} more`}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button
                            onClick={() => setSelectedReport(report)}
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Bekijk
                          </Button>
                          
                          {report.status === 'draft' && (
                            <>
                              <Button
                                onClick={() => handleApprove(report.id)}
                                size="sm"
                                className="text-white"
                                style={{ backgroundColor: '#F87315' }}
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Goedkeuren
                              </Button>
                              <Button
                                onClick={() => handleReject(report.id, 'Manual review needed')}
                                variant="outline"
                                size="sm"
                                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Afkeuren
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Report Preview Modal/Panel - implement as needed */}
          {selectedReport && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Report Preview - {selectedReport.company}
                  </h2>
                  <Button
                    onClick={() => setSelectedReport(null)}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="bg-white/5 rounded-lg p-6">
                  <pre className="text-white/80 text-sm whitespace-pre-wrap">
                    {selectedReport.reportContent}
                  </pre>
                </div>
                
                <div className="flex gap-4 mt-6">
                  <Button
                    onClick={() => handleApprove(selectedReport.id)}
                    className="text-white"
                    style={{ backgroundColor: '#F87315' }}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Goedkeuren & Versturen
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Bewerken
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}