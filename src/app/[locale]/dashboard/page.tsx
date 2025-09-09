'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import NotificationCenter from '@/components/NotificationCenter';
import { useTranslations } from 'next-intl';
import { 
  BarChart3, Activity, FileText, Settings, User,
  TrendingUp, Clock, CheckCircle, AlertTriangle,
  Pause, Play, Filter, Download, Eye, Calendar, Database,
  Brain, Monitor, RefreshCw, Target, ArrowRight
} from 'lucide-react';

function DashboardPageContent() {
  const t = useTranslations('dashboard');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [lastUpdate, setLastUpdate] = useState('--:--:--');
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [assessmentData, setAssessmentData] = useState(null);
  const [expertAssessmentData, setExpertAssessmentData] = useState(null);
  const [agentReadinessAssessments, setAgentReadinessAssessments] = useState([]);
  const searchParams = useSearchParams();

  // User profile state
  const [userProfile, setUserProfile] = useState({
    name: user?.displayName || user?.firstName || user?.email?.split('@')[0] || 'User',
    company: user?.company || 'Your Company',
    lastLogin: 'Recent'
  });

  // Sample data - replace with Firestore calls
  const projects = [];
  const activities = [];
  const systemMetrics = {
    agentReadiness: 0,
    connectedSystems: { current: 0, total: 0 },
    activeAgents: 0,
    monthlySavings: 0,
    uptime: 0
  };

  // Load Expert Assessment data
  useEffect(() => {
    if (user) {
      loadExpertAssessmentData();
      loadAgentReadinessAssessments();
    }
  }, [user]);

  const loadExpertAssessmentData = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/expert-assessment/get-project?userId=${user.uid}`);
      const data = await response.json();
      
      if (data.success && data.assessment) {
        setExpertAssessmentData(data.assessment);
      }
    } catch (error) {
      console.error('Failed to load Expert Assessment data:', error);
    }
  };

  const loadAgentReadinessAssessments = async () => {
    if (!user) return;
    
    try {
      // Try both userId and email to catch assessments
      const response = await fetch(`/api/assessment/get-user-assessments?userId=${user.uid}&userEmail=${user.email}`);
      const data = await response.json();
      
      if (data.success && data.assessments) {
        setAgentReadinessAssessments(data.assessments);
      }
    } catch (error) {
      console.error('Failed to load Agent Readiness Assessments:', error);
    }
  };

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
      });
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
        lastLogin: user.lastLoginAt ? new Date(user.lastLoginAt.seconds * 1000).toLocaleDateString() : 'Recent'
      });
    }
  }, [user]);

  const handleSettings = () => {
    window.location.href = '/settings';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">{t('loadingDashboard')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header Navigation */}
      <header className="bg-white/5 border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-4">
                <Image
                  src="/groeimet-ai-logo.svg"
                  alt="GroeimetAI"
                  width={120}
                  height={32}
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold text-white">{t('title')}</span>
              </div>
              
              {/* Quick Actions Bar */}
              <nav className="hidden lg:flex space-x-6">
                <Link href="/agent-readiness" className="text-white/70 hover:text-white transition-colors text-sm">
                  {t('navigation.newAssessment')}
                </Link>
                <Link href="/pilot-intake" className="text-white/70 hover:text-white transition-colors text-sm">
                  {t('navigation.requestPilot')}
                </Link>
                <Link href="/implementation-proposal" className="text-white/70 hover:text-white transition-colors text-sm">
                  {t('navigation.addSystem')}
                </Link>
                <Link href="/contact" className="text-white/70 hover:text-white transition-colors text-sm">
                  {t('navigation.getHelp')}
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationCenter />
              <div className="flex items-center space-x-2 text-white">
                <User className="w-5 h-5" />
                <span>{userProfile.name}</span>
              </div>
              <button 
                onClick={handleSettings}
                className="p-2 text-white/70 hover:text-white transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

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
          <h2 className="text-3xl font-bold text-white mb-2">
            {t('welcome', { name: userProfile.name })}
          </h2>
          <p className="text-white/60">
            {t('lastLogin', { date: userProfile.lastLogin })}
          </p>
        </motion.div>

        {/* Assessment Results or Next Action */}
        {assessmentData ? (
          <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-500/30 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" style={{ color: '#10B981' }} />
{t('assessmentResults.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h4 className="text-2xl font-bold text-white mb-3">
                  {t('assessmentResults.calculating')}
                </h4>
                <p className="text-white/80 leading-relaxed mb-4">
                  {t('assessmentResults.processing')}
                </p>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/70 text-sm">
                    <strong>{t('assessmentResults.assessmentId')}:</strong> {assessmentData.id}<br/>
                    <strong>{t('assessmentResults.submitted')}:</strong> {new Date().toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Link href="/expert-assessment" className="flex-1">
                  <Button 
                    className="w-full text-white font-semibold"
                    style={{ backgroundColor: '#F87315' }}
                  >
                    {t('assessmentResults.expertAssessmentInterest')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button 
                  onClick={() => setAssessmentData(null)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
{t('assessmentResults.close')}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
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
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
            <TabsTrigger value="assessments">{t('tabs.assessments')}</TabsTrigger>
            <TabsTrigger value="monitoring">{t('tabs.monitoring')}</TabsTrigger>
            <TabsTrigger value="reports">{t('tabs.reports')}</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-8">
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
              </div>
            </div>

            {/* System Status */}
            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-white mb-2">
                    {systemMetrics.agentReadiness}/100
                  </div>
                  <div className="text-white/60 text-sm">{t('overview.agentReadiness')}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">{t('overview.connected')}</p>
                      <p className="text-2xl font-bold text-white">
                        {systemMetrics.connectedSystems.current}/{systemMetrics.connectedSystems.total}
                      </p>
                      <p className="text-white/60 text-xs">{t('overview.systems')}</p>
                    </div>
                    <Database className="w-8 h-8" style={{ color: '#F87315' }} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">{t('overview.active')}</p>
                      <p className="text-2xl font-bold text-white">{systemMetrics.activeAgents}</p>
                      <p className="text-white/60 text-xs">{t('overview.agents')}</p>
                    </div>
                    <Brain className="w-8 h-8" style={{ color: '#F87315' }} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PROJECTS TAB */}
          <TabsContent value="projects" className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">{t('projects.title')}</h3>
            
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="w-8 h-8 text-white/60" />
                </div>
                <h4 className="text-xl font-bold text-white mb-4">{t('projects.noActiveProjects')}</h4>
                <p className="text-white/70 mb-8">
                  {t('projects.readyToStart')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/agent-readiness">
                    <Button
                      className="text-white"
                      style={{ backgroundColor: '#F87315' }}
                    >
{t('projects.startWithAssessment')}
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
{t('projects.bookConsult')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* MONITORING TAB */}
          <TabsContent value="monitoring" className="space-y-6">
            <h3 className="text-2xl font-bold text-white">{t('monitoring.title')}</h3>
            
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
                  <Activity className="w-8 h-8 text-white/60" />
                </div>
                <h4 className="text-xl font-bold text-white mb-4">{t('monitoring.notActive')}</h4>
                <p className="text-white/70 mb-8">
                  {t('monitoring.description')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/services">
                    <Button
                      className="text-white"
                      style={{ backgroundColor: '#F87315' }}
                    >
{t('monitoring.enable')}
                    </Button>
                  </Link>
                  <Link href="/demo-request">
                    <Button
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
{t('monitoring.seeDemo')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
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
                          <Badge className="bg-green-500 text-white mt-1">
                            {assessment.status === 'assessment_submitted' ? 'Voltooid' : assessment.status}
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
            ) : (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-12 text-center">
                  <h4 className="text-xl font-bold text-white mb-4">{t('assessments.noAssessments')}</h4>
                  <p className="text-white/70 mb-8">
                    {t('assessments.startFirst')}
                  </p>
                  <Link href="/agent-readiness">
                    <Button
                      className="text-white"
                      style={{ backgroundColor: '#F87315' }}
                    >
{t('assessments.startAssessment')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* REPORTS TAB */}
          <TabsContent value="reports" className="space-y-6">
            <h3 className="text-2xl font-bold text-white">{t('reports.title')}</h3>
            
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