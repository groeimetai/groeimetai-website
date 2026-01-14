'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import AssessmentViewer from '@/components/dashboard/AssessmentViewer';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import EngagementDashboard from '@/components/dashboard/EngagementDashboard';
import CustomerJourneyWidget from '@/components/dashboard/CustomerJourneyWidget';
import { useTranslations } from 'next-intl';
import { useDashboardOverview, useSystemMetrics, usePerformanceMetrics } from '@/hooks/useDashboardData';
import {
  BarChart3, Activity, FileText, User,
  TrendingUp, Clock, CheckCircle,
  Download, Database,
  Brain, Target, ArrowRight,
  AlertTriangle,
  Loader2,
  Shield, Settings, Users, Calculator, Zap, GitBranch
} from 'lucide-react';
import { DashboardStatsSkeleton, MetricCardSkeleton } from '@/components/ui/LoadingSkeleton';

// Type definitions for better type safety
interface AssessmentData {
  id: string;
  score: number | string;
  level: string;
  timestamp: string;
}

interface ExpertAssessmentData {
  assessmentStage: string;
  status: string;
  createdAt?: { seconds: number };
  paidAt?: boolean;
}

interface AgentReadinessAssessment {
  id: string;
  score?: number;
  level?: string;
  status: string;
  company?: string;
  role?: string;
  systems?: string[];
  reportId?: string;
  createdAt?: string;
}

function DashboardPageContent() {
  const t = useTranslations('dashboard');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('--:--:--');
  const { user, loading: authLoading } = useAuth();
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [expertAssessmentData, setExpertAssessmentData] = useState<ExpertAssessmentData | null>(null);
  const [agentReadinessAssessments, setAgentReadinessAssessments] = useState<AgentReadinessAssessment[]>([]);
  const searchParams = useSearchParams();

  // Use our new data hooks
  const { stats, projects, activities, loading: dashboardLoading, error: dashboardError } = useDashboardOverview();
  const { metrics: systemMetrics, loading: metricsLoading, error: metricsError } = useSystemMetrics();
  const { metrics: performanceMetrics, loading: perfLoading, error: perfError } = usePerformanceMetrics();

  // Unified loading state for better UX
  const isInitialLoading = authLoading || (dashboardLoading && metricsLoading && perfLoading);
  const hasAnyError = dashboardError || metricsError || perfError;

  // User profile state
  const [userProfile, setUserProfile] = useState({
    name: user?.displayName || user?.firstName || user?.email?.split('@')[0] || 'User',
    company: user?.company || 'Your Company',
    lastLogin: 'Recent'
  });

  // Memoized data fetching functions to prevent unnecessary re-renders
  const loadExpertAssessmentData = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const response = await fetch(`/api/expert-assessment/get-project?userId=${user.uid}`);
      const data = await response.json();

      if (data.success && data.assessment) {
        setExpertAssessmentData(data.assessment);
      }
    } catch (error) {
      console.error('Failed to load Expert Assessment data:', error);
    }
  }, [user?.uid]);

  const loadAgentReadinessAssessments = useCallback(async () => {
    if (!user?.uid || !user?.email) return;

    try {
      const response = await fetch(`/api/assessment/get-user-assessments?userId=${user.uid}&userEmail=${user.email}`);
      const data = await response.json();

      if (data.success && data.assessments) {
        setAgentReadinessAssessments(data.assessments);
      }
    } catch (error) {
      console.error('Failed to load Agent Readiness Assessments:', error);
    }
  }, [user?.uid, user?.email]);

  // Load assessment data when user is available
  useEffect(() => {
    if (user?.uid) {
      loadExpertAssessmentData();
      loadAgentReadinessAssessments();
    }
  }, [user?.uid, loadExpertAssessmentData, loadAgentReadinessAssessments]);

  // Handle URL parameters and user data
  useEffect(() => {
    // Check for assessment parameter
    const assessmentId = searchParams.get('assessment');
    const isFirstTime = searchParams.get('first') === 'true';
    const scoreParam = searchParams.get('score');
    
    if (assessmentId && isFirstTime) {
      // Show welcome message for new assessment
      setActiveTab('assessments');
      // Show assessment data with score if available
      setAssessmentData({
        id: assessmentId,
        score: scoreParam || 'Loading...',
        level: scoreParam ? getQuickLevel(parseInt(scoreParam)) : 'Analyzing...',
        timestamp: new Date().toISOString()
      } as any);
    }
  }, [searchParams]);
  
  const getQuickLevel = (score: number): string => {
    if (score >= 90) return 'Agent-Ready (Level 5)';
    if (score >= 70) return 'Integration-Ready (Level 4)';
    if (score >= 50) return 'Digitalization-Ready (Level 3)';
    if (score >= 30) return 'Foundation-Building (Level 2)';
    return 'Pre-Digital (Level 1)';
  };

  // Update user profile when user data changes
  useEffect(() => {
    if (user) {
      setUserProfile({
        name: user.displayName || user.firstName || user.email?.split('@')[0] || 'User',
        company: user.company || 'Your Company',
        lastLogin: user.lastLoginAt ? new Date((user.lastLoginAt as any).seconds * 1000).toLocaleDateString() : 'Recent'
      });
    }
  }, [user]);

  // Update last update timestamp
  useEffect(() => {
    const updateTimestamp = () => {
      setLastUpdate(new Date().toLocaleTimeString());
    };

    updateTimestamp();
    const interval = setInterval(updateTimestamp, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // User guard - show loading while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-white/60">{t('loadingDashboard')}</p>
        </div>
      </div>
    );
  }

  // User guard - redirect handled by layout, but show message as fallback
  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-24">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="text-white/60 text-sm">
            {t('breadcrumb.dashboard')} &gt; {t('breadcrumb.overview')}
          </div>
        </div>

        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {t('welcome', { name: userProfile.name })}
              </h2>
              <p className="text-white/60">
                {t('lastLogin', { date: userProfile.lastLogin })}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                <span className="text-white/60 text-sm">{isLiveMode ? 'Live' : 'Offline'}</span>
              </div>
              <p className="text-white/40 text-xs">Last updated: {lastUpdate}</p>
            </div>
          </div>
        </motion.div>

        {/* Assessment Viewer or Next Action */}
        {(() => {
          const assessmentId = searchParams.get('assessment');
          const isFirstTime = searchParams.get('first') === 'true';
          const scoreParam = searchParams.get('score');
          
          if (assessmentId) {
            return (
              <AssessmentViewer 
                assessmentId={assessmentId}
                isFirstTime={isFirstTime}
                initialScore={scoreParam ? parseInt(scoreParam) : undefined}
              />
            );
          }
          
          // Only show next action card if user has NO assessments yet
          if (agentReadinessAssessments.length === 0) {
            return (
            <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-500/30 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="w-5 h-5 mr-2" style={{ color: '#F87315' }} />
                {t('nextStep.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h4 className="text-xl font-bold text-white mb-3">
                  {t('nextStep.assessmentTitle')}
                </h4>
                <p className="text-white/80 leading-relaxed mb-4">
                  {t('nextStep.assessmentDescription')}
                </p>
              </div>

              <div className="flex gap-3">
                <Link href="/agent-readiness" className="flex-1">
                  <Button 
                    className="w-full text-white font-semibold"
                    style={{ backgroundColor: '#F87315' }}
                  >
                    {t('nextStep.startAssessment')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button 
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {t('nextStep.notNow')}
                </Button>
              </div>
            </CardContent>
          </Card>
            );
          }

          // User already has assessments, don't show the "next step" card
          return null;
        })()}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
            <TabsTrigger value="assessments">{t('tabs.assessments')}</TabsTrigger>
            <TabsTrigger value="monitoring">{t('tabs.monitoring')}</TabsTrigger>
            <TabsTrigger value="reports">{t('tabs.reports')}</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-8">
            {/* Error handling for dashboard data */}
            {(dashboardError || metricsError || perfError) && (
              <Card className="bg-red-500/10 border border-red-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-red-400">Data Loading Issues</h3>
                      <p className="text-red-300 text-sm mt-1">
                        Some dashboard data couldn't be loaded. Please refresh or contact support.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Expert Assessment Status */}
            {expertAssessmentData && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-6">Expert Assessment</h3>
                <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                          style={{ backgroundColor: '#F87315' }}
                        >
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">Expert Assessment (€2.500)</h4>
                          <p className="text-white/70 text-sm">
                            Status: {expertAssessmentData.assessmentStage === 'completed' ? 'Voltooid' : 'In Progress'}
                          </p>
                        </div>
                      </div>
                      <Badge 
                        className="bg-orange-500 text-white"
                        style={{ backgroundColor: '#F87315' }}
                      >
                        {expertAssessmentData.status}
                      </Badge>
                    </div>
                    
                    <p className="text-white/80 text-sm mb-4">
                      Diepgaande analyse van jouw systemen en concrete roadmap naar agent-ready infrastructuur.
                    </p>
                    
                    <Link href="/dashboard/expert-assessment">
                      <Button 
                        className="w-full text-white"
                        style={{ backgroundColor: '#F87315' }}
                      >
                        Bekijk Expert Assessment Dashboard
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Real-time Dashboard Overview */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-6">Dashboard Overview</h3>
              <DashboardOverview />
            </div>

            {/* System Metrics */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-6">System Status</h3>
              {metricsLoading ? (
                <div className="grid lg:grid-cols-3 gap-6">
                  <MetricCardSkeleton />
                  <MetricCardSkeleton />
                  <MetricCardSkeleton />
                </div>
              ) : systemMetrics ? (
                <div className="grid lg:grid-cols-3 gap-6">
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-white mb-2">
                        {systemMetrics.agentReadiness || 0}/100
                      </div>
                      <div className="text-white/60 text-sm">Agent Readiness</div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/60 text-sm">Connected</p>
                          <p className="text-2xl font-bold text-white">
                            {systemMetrics.connectedSystems?.current || 0}/{systemMetrics.connectedSystems?.total || 0}
                          </p>
                          <p className="text-white/60 text-xs">Systems</p>
                        </div>
                        <Database className="w-8 h-8" style={{ color: '#F87315' }} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/60 text-sm">Active</p>
                          <p className="text-2xl font-bold text-white">{systemMetrics.activeAgents || 0}</p>
                          <p className="text-white/60 text-xs">Agents</p>
                        </div>
                        <Brain className="w-8 h-8" style={{ color: '#F87315' }} />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <h4 className="text-white font-medium mb-2">No System Data</h4>
                  <p className="text-white/60 text-sm">
                    System metrics will appear when you have active projects
                  </p>
                </div>
              )}
            </div>

            {/* Journey Widget */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-6">Your Journey</h3>
              <CustomerJourneyWidget />
            </div>

            {/* Service Request Cards */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-6">{t('overview.readyForMore')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-6">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                      style={{ backgroundColor: '#F87315' }}
                    >
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-3">{t('overview.scheduleAssessment')}</h4>
                    <p className="text-white/70 text-sm leading-relaxed mb-6">
                      {t('overview.assessmentDescription')}
                    </p>
                    <Link href="/agent-readiness">
                      <Button 
                        className="w-full text-white"
                        style={{ backgroundColor: '#F87315' }}
                      >
                        {t('overview.startAssessment')}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-6">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                      style={{ backgroundColor: '#F87315' }}
                    >
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-3">Expert Assessment</h4>
                    <p className="text-white/70 text-sm leading-relaxed mb-6">
                      Deep-dive analysis with personalized roadmap
                    </p>
                    <Link href="/expert-assessment">
                      <Button 
                        className="w-full text-white"
                        style={{ backgroundColor: '#F87315' }}
                      >
                        Book Assessment
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-6">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                      style={{ backgroundColor: '#F87315' }}
                    >
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-3">AI Consultation</h4>
                    <p className="text-white/70 text-sm leading-relaxed mb-6">
                      Strategy session with AI transformation experts
                    </p>
                    <Link href="/contact">
                      <Button 
                        className="w-full text-white"
                        style={{ backgroundColor: '#F87315' }}
                      >
                        Schedule Call
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300">
                  <CardContent className="p-6">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                      style={{ backgroundColor: '#F87315' }}
                    >
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-3">Performance Monitoring</h4>
                    <p className="text-white/70 text-sm leading-relaxed mb-6">
                      Real-time system monitoring and optimization
                    </p>
                    <Button 
                      className="w-full text-white"
                      style={{ backgroundColor: '#F87315' }}
                      disabled={!stats || stats.activeProjects === 0}
                    >
                      Enable Monitoring
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ASSESSMENTS TAB */}
          <TabsContent value="assessments" className="space-y-6">
            <h3 className="text-2xl font-bold text-white">{t('assessments.title')}</h3>
            
            {/* Expert Assessment */}
            {expertAssessmentData && (
              <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border-orange-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center">
                      <Target className="w-5 h-5 mr-2" style={{ color: '#F87315' }} />
                      Expert Assessment (€2.500)
                    </span>
                    <Badge 
                      className="bg-orange-500 text-white"
                      style={{ backgroundColor: '#F87315' }}
                    >
                      {expertAssessmentData.assessmentStage === 'completed' ? 'Voltooid' : 'Actief'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-white/70 text-sm mb-2">Assessment Details</p>
                        <div className="bg-white/5 rounded-lg p-4">
                          <p className="text-white text-sm">
                            <strong>Status:</strong> {expertAssessmentData.status}<br/>
                            <strong>Stage:</strong> {expertAssessmentData.assessmentStage}<br/>
                            <strong>Gestart:</strong> {expertAssessmentData.createdAt ? new Date(expertAssessmentData.createdAt.seconds * 1000).toLocaleDateString() : 'Recent'}<br/>
                            <strong>Betaling:</strong> {expertAssessmentData.paidAt ? 'Voltooid' : 'In behandeling'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-white/70 text-sm mb-2">Opgeleverde Deliverables</p>
                        <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg p-4 border border-green-500/20">
                          <p className="text-white text-sm">
                            • 90-dagen roadmap naar agent-ready<br/>
                            • ROI berekening en business case<br/>
                            • API architectuur planning<br/>
                            • Concrete implementatie stappen
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pt-4 border-t border-white/10">
                      <Link href="/dashboard/expert-assessment" className="flex-1">
                        <Button 
                          className="w-full text-white font-semibold"
                          style={{ backgroundColor: '#F87315' }}
                        >
                          Open Expert Assessment Dashboard
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Agent Readiness Assessments */}
            {agentReadinessAssessments.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-white">Agent Readiness Assessments (Gratis)</h4>
                {agentReadinessAssessments.map((assessment, index) => (
                  <Card key={assessment.id} className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                            style={{ backgroundColor: '#10B981' }}
                          >
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h5 className="text-md font-bold text-white">Agent Readiness Assessment #{index + 1}</h5>
                            <p className="text-white/70 text-sm">
                              Score: {assessment.score || 'N/A'}/100 • {assessment.level || 'Calculating...'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-white/60">
                            {assessment.createdAt ? new Date(assessment.createdAt).toLocaleDateString() : 'Recent'}
                          </div>
                          <Badge className={`mt-1 ${
                            assessment.status === 'generating' ? 'bg-orange-500 text-white' :
                            assessment.status === 'ready' ? 'bg-green-500 text-white' :
                            assessment.status === 'assessment_submitted' ? 'bg-blue-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>
                            {assessment.status === 'assessment_submitted' ? 'Rapport wordt gegenereerd...' :
                             assessment.status === 'generating' ? 'Aan het genereren...' :
                             assessment.status === 'ready' ? 'Rapport klaar!' :
                             assessment.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-white/70 text-xs mb-1">Bedrijf & Rol</p>
                          <p className="text-white text-sm">{assessment.company} • {assessment.role}</p>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <p className="text-white/70 text-xs mb-1">Systemen</p>
                          <p className="text-white text-sm">{assessment.systems ? assessment.systems.join(', ') : 'N/A'}</p>
                        </div>
                      </div>
                      
                      {assessment.reportId && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                          <Button 
                            onClick={() => window.open(`/api/assessment/download-report?reportId=${assessment.reportId}`)}
                            variant="outline"
                            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                            size="sm"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Rapport
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {/* All Available Assessments */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white">Beschikbare Assessments</h4>
              <p className="text-white/60 text-sm mb-4">Kies een assessment om jouw AI-gereedheid te meten. Elk assessment genereert een gepersonaliseerd rapport met aanbevelingen.</p>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { id: 'agent-readiness', title: 'Agent Readiness', desc: 'Meet hoe klaar je bent voor AI agents', icon: Brain, href: '/agent-readiness', color: '#F87315' },
                  { id: 'data-readiness', title: 'Data Readiness', desc: 'Beoordeel jouw data-infrastructuur', icon: Database, href: '/assessments/data-readiness', color: '#3B82F6' },
                  { id: 'ai-security', title: 'AI Security Scan', desc: 'Controleer security & compliance', icon: Shield, href: '/assessments/ai-security', color: '#EF4444' },
                  { id: 'process-automation', title: 'Process Automation', desc: 'Identificeer automatiseringskansen', icon: Settings, href: '/assessments/process-automation', color: '#8B5CF6' },
                  { id: 'cx-ai', title: 'Customer Experience AI', desc: 'Verbeter klantervaring met AI', icon: Users, href: '/assessments/cx-ai', color: '#EC4899' },
                  { id: 'ai-maturity', title: 'AI Maturity Scan', desc: 'Bepaal je AI volwassenheidsniveau', icon: TrendingUp, href: '/assessments/ai-maturity', color: '#10B981' },
                  { id: 'integration-readiness', title: 'Integration Readiness', desc: 'Check je integratie mogelijkheden', icon: GitBranch, href: '/assessments/integration-readiness', color: '#06B6D4' },
                  { id: 'roi-calculator', title: 'AI ROI Calculator', desc: 'Bereken de ROI van AI implementatie', icon: Calculator, href: '/assessments/roi-calculator', color: '#F59E0B' },
                ].map((assessment) => (
                  <Link key={assessment.id} href={assessment.href}>
                    <Card className="bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300 cursor-pointer h-full">
                      <CardContent className="p-4">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                          style={{ backgroundColor: assessment.color }}
                        >
                          <assessment.icon className="w-5 h-5 text-white" />
                        </div>
                        <h5 className="text-sm font-bold text-white mb-1">{assessment.title}</h5>
                        <p className="text-white/60 text-xs">{assessment.desc}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {assessmentData ? (
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" style={{ color: '#10B981' }} />
                      {t('assessments.agentReadinessAssessment')}
                    </span>
                    {assessmentData.score !== 'Loading...' ? (
                      <Badge className="bg-green-500 text-white">Score: {assessmentData.score}</Badge>
                    ) : (
                      <Badge className="bg-orange-500 text-white">{t('assessments.processing')}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-white/70 text-sm mb-2">{t('assessments.details')}</p>
                        <div className="bg-white/5 rounded-lg p-4">
                          <p className="text-white text-sm">
                            <strong>{t('assessments.id')}:</strong> {assessmentData.id}<br/>
                            <strong>{t('assessments.date')}:</strong> {new Date().toLocaleString()}<br/>
                            <strong>{t('assessments.score')}:</strong> {assessmentData.score}/100<br/>
                            <strong>{t('assessments.level')}:</strong> {assessmentData.level}<br/>
                            <strong>{t('assessments.status')}:</strong> {assessmentData.score !== 'Loading...' ? t('assessments.emailSent') : t('assessments.generating')}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-white/70 text-sm mb-2">{t('assessments.expectedResults')}</p>
                        <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-lg p-4 border border-orange-500/20">
                          <p className="text-white text-sm">
                            {t('assessments.resultsDescription')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-white/10">
                      <Button
                        onClick={() => window.open('mailto:hello@groeimetai.io?subject=Assessment Status')}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        {t('assessments.contactSupport')}
                      </Button>
                      <Link href="/expert-assessment" className="flex-1">
                        <Button
                          className="w-full text-white font-semibold"
                          style={{ backgroundColor: '#F87315' }}
                        >
                          {t('assessments.upgradeExpert')}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>

          {/* MONITORING TAB */}
          <TabsContent value="monitoring" className="space-y-6">
            <h3 className="text-2xl font-bold text-white">{t('monitoring.title')}</h3>
            
            {/* Engagement Dashboard Integration */}
            <EngagementDashboard />
          </TabsContent>

          {/* REPORTS TAB */}
          <TabsContent value="reports" className="space-y-6">
            <h3 className="text-2xl font-bold text-white">{t('reports.title')}</h3>
            
            {/* Performance Metrics */}
            {perfLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                <MetricCardSkeleton />
                <MetricCardSkeleton />
              </div>
            ) : performanceMetrics && performanceMetrics.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {performanceMetrics.map((metric, index) => (
                  <Card key={index} className="bg-white/5 border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white">{metric.name}</h4>
                        <Badge className={
                          metric.status === 'good' ? 'bg-green-500/20 text-green-400' :
                          metric.status === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }>
                          {metric.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-white/60 text-sm">Current</span>
                          <span className="text-white font-medium">{metric.current}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/60 text-sm">Target</span>
                          <span className="text-white/60">{metric.target}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-white/60 text-sm">Trend</span>
                          <span className={
                            metric.trend === 'up' ? 'text-green-400' :
                            metric.trend === 'down' ? 'text-red-400' :
                            'text-white/60'
                          }>
                            {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'} {metric.trend}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-12 text-center">
                  <h4 className="text-xl font-bold text-white mb-4">{t('reports.noReports')}</h4>
                  <p className="text-white/70 mb-8">
                    {t('reports.description')}
                  </p>
                  <Link href="/agent-readiness">
                    <Button
                      className="text-white"
                      style={{ backgroundColor: '#F87315' }}
                    >
                      {t('reports.startJourney')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading Dashboard...</div>
      </div>
    }>
      <DashboardPageContent />
    </Suspense>
  );
}