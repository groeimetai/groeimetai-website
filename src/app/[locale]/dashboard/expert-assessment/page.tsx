'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, Clock, MessageCircle, Upload, Download,
  Calendar, User, FileText, Target, AlertCircle
} from 'lucide-react';

interface ExpertAssessment {
  id: string;
  status: string;
  assessmentStage: string;
  process: {
    intakeCall: { status: string; scheduledFor: string | null };
    documentCollection: { status: string; uploadedDocs: any[] };
    processMapping: { status: string; progress: number };
    apiAnalysis: { status: string; findings: any[] };
    roadmapDelivery: { status: string; deliveredAt: string | null };
    followUp: { status: string; scheduledFor: string | null };
  };
  createdAt: any;
  paidAt: any;
}

export default function ExpertAssessmentDashboard() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [assessment, setAssessment] = useState<ExpertAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check for payment success
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true);
      setActiveTab('overview');
    }
    
    // Load Expert Assessment data
    loadAssessmentData();
  }, [searchParams, user]);

  const loadAssessmentData = async () => {
    if (!user) return;
    
    try {
      // Load user's Expert Assessment project
      const response = await fetch(`/api/expert-assessment/get-project?userId=${user.uid}`);
      const data = await response.json();
      
      if (data.success && data.assessment) {
        setAssessment(data.assessment);
      }
    } catch (error) {
      console.error('Failed to load assessment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStageProgress = (stage: string): number => {
    const stages = ['intake_scheduled', 'documents_collected', 'process_mapping', 'api_analysis', 'roadmap_delivered', 'completed'];
    const currentIndex = stages.indexOf(stage);
    return currentIndex >= 0 ? Math.round(((currentIndex + 1) / stages.length) * 100) : 0;
  };

  const getStageDisplay = (stage: string): string => {
    const displays = {
      'intake_scheduled': 'Intake Call Gepland',
      'documents_collected': 'Documenten Verzameld', 
      'process_mapping': 'Process Mapping',
      'api_analysis': 'API Analyse',
      'roadmap_delivered': 'Roadmap Opgeleverd',
      'completed': 'Assessment Voltooid'
    };
    return displays[stage as keyof typeof displays] || stage;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white">Loading Expert Assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Expert Assessment Dashboard</h1>
              <p className="text-white/60">€2.500 Premium Service • Agent Infrastructure Consulting</p>
            </div>
            <div className="flex items-center space-x-4">
              {assessment && (
                <Badge 
                  className="bg-orange-500 text-white"
                  style={{ backgroundColor: '#F87315' }}
                >
                  {getStageDisplay(assessment.assessmentStage)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Success Message */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-green-500/10 border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <div>
                    <h3 className="text-lg font-bold text-white">Betaling Succesvol!</h3>
                    <p className="text-white/80">Je Expert Assessment is gestart. Niels neemt binnen 24 uur contact op.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {assessment ? (
          <div className="space-y-8">
            {/* Progress Overview */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-5 h-5 mr-2" style={{ color: '#F87315' }} />
                  Assessment Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/80">Overall Progress</span>
                    <span className="text-white font-bold">{getStageProgress(assessment.assessmentStage)}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        backgroundColor: '#F87315', 
                        width: `${getStageProgress(assessment.assessmentStage)}%` 
                      }}
                    ></div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: '#F87315' }}>
                        {assessment.process.processMapping.progress}%
                      </div>
                      <div className="text-white/60 text-sm">Process Mapping</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: '#F87315' }}>
                        {assessment.process.documentCollection.uploadedDocs.length}
                      </div>
                      <div className="text-white/60 text-sm">Docs Uploaded</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold" style={{ color: '#F87315' }}>
                        {assessment.process.apiAnalysis.findings.length}
                      </div>
                      <div className="text-white/60 text-sm">API Findings</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs for different aspects */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="communication">Chat</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Process Status */}
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">Process Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(assessment.process).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-white/80 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <Badge 
                            className={
                              value.status === 'completed' ? 'bg-green-500' :
                              value.status === 'in_progress' ? 'bg-orange-500' :
                              'bg-gray-500'
                            }
                          >
                            {value.status}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Next Actions */}
                  <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">Volgende Stappen</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {assessment.assessmentStage === 'intake_scheduled' && (
                          <div className="flex items-start space-x-3">
                            <Clock className="w-5 h-5 text-orange-500 mt-1" />
                            <div>
                              <p className="text-white font-medium">Intake Call Plannen</p>
                              <p className="text-white/60 text-sm">Niels neemt contact op voor planning</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-start space-x-3">
                          <MessageCircle className="w-5 h-5 text-orange-500 mt-1" />
                          <div>
                            <p className="text-white font-medium">Direct Contact</p>
                            <p className="text-white/60 text-sm">Chat real-time met Niels</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <Upload className="w-5 h-5 text-orange-500 mt-1" />
                          <div>
                            <p className="text-white font-medium">Document Upload</p>
                            <p className="text-white/60 text-sm">Business docs, API specs, process docs</p>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        onClick={() => setActiveTab('communication')}
                        className="w-full mt-4 text-white"
                        style={{ backgroundColor: '#F87315' }}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Start Chat met Niels
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Communication Tab */}
              <TabsContent value="communication">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Expert Assessment Chat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 bg-white/5 rounded-lg p-4 mb-4">
                      <p className="text-white/60 text-center">
                        Real-time chat implementation hier...
                        (Gebruik bestaand chat systeem)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Document Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/60">
                      Document upload/download systeem hier...
                      (Gebruik bestaand document management)
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Deliverables Tab */}
              <TabsContent value="deliverables">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Assessment Deliverables</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <h4 className="text-white font-medium">90-Dagen Roadmap</h4>
                          <p className="text-white/60 text-sm">Concrete implementatie planning</p>
                        </div>
                        <Badge className="bg-gray-500">Pending</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <h4 className="text-white font-medium">ROI Berekening</h4>
                          <p className="text-white/60 text-sm">Business case en cost/benefit analysis</p>
                        </div>
                        <Badge className="bg-gray-500">Pending</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div>
                          <h4 className="text-white font-medium">API Architecture Plan</h4>
                          <p className="text-white/60 text-sm">System integratie en agent connectivity</p>
                        </div>
                        <Badge className="bg-gray-500">Pending</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-orange-500" />
              <h2 className="text-2xl font-bold text-white mb-4">Geen Expert Assessment</h2>
              <p className="text-white/70 mb-8">
                Je hebt nog geen Expert Assessment. Start met een assessment voor €2.500.
              </p>
              <Button
                onClick={() => window.location.href = '/expert-assessment'}
                className="text-white"
                style={{ backgroundColor: '#F87315' }}
              >
                Boek Expert Assessment
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}