'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { doc, setDoc, getDoc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Calendar,
  Settings,
  LogOut,
  User,
  Bell,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Paperclip,
  MoreVertical,
  Circle,
  ChevronRight,
  Briefcase,
  Target,
  Rocket,
  Flag,
  Shield,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from '@/i18n/routing';
import DashboardChat from '@/components/DashboardChat';

interface ProjectStage {
  id: number;
  name: string;
  icon: string;
  status: 'completed' | 'current' | 'upcoming';
  description: string;
  progress?: number;
  completedAt?: any;
  startedAt?: any;
  estimatedCompletion?: string;
}

interface TimelineData {
  stages: ProjectStage[];
  milestone: string;
  projectName: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout, isAdmin } = useAuth();
  const userProfile = user; // For now, treat user as userProfile
  const [message, setMessage] = useState('');
  const [profileCheckCount, setProfileCheckCount] = useState(0);
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(true);
  const [userQuoteId, setUserQuoteId] = useState<string | null>(null);
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'GroeimetAI Team',
      content:
        "Welcome to GroeimetAI! We're excited to work with you on your AI transformation journey.",
      timestamp: new Date().toISOString(),
      isGroeimetAI: true,
    },
    {
      id: '2',
      sender: userProfile?.firstName || 'You',
      content: 'Thanks! Looking forward to getting started.',
      timestamp: new Date().toISOString(),
      isGroeimetAI: false,
    },
  ]);

  const defaultProjectStages: ProjectStage[] = [
    {
      id: 1,
      name: 'Discovery',
      icon: 'briefcase',
      status: 'upcoming',
      description: 'Understanding your needs',
      progress: undefined,
    },
    {
      id: 2,
      name: 'Planning',
      icon: 'target',
      status: 'upcoming',
      description: 'Defining project scope',
      progress: undefined,
    },
    {
      id: 3,
      name: 'Development',
      icon: 'rocket',
      status: 'upcoming',
      description: 'Building your solution',
      progress: undefined,
    },
    {
      id: 4,
      name: 'Delivery',
      icon: 'flag',
      status: 'upcoming',
      description: 'Final implementation',
      progress: undefined,
    },
  ];

  const projectStages = timelineData?.stages || defaultProjectStages;

  const currentStage = projectStages.find((stage) => stage.status === 'current');
  const completedCount = projectStages.filter((stage) => stage.status === 'completed').length;
  // Calculate progress based on completed stages plus current stage progress
  const currentStageProgress = currentStage?.progress || 0;
  const totalProgress = (completedCount * 100 + currentStageProgress) / projectStages.length;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Debug profile loading - only check once
  useEffect(() => {
    if (user && !loading && profileCheckCount === 0) {
      console.log('User authenticated:', user.uid);
      setProfileCheckCount(1);
    }
  }, [user, loading, profileCheckCount]);

  // Fetch user's quote and timeline data
  useEffect(() => {
    if (!user) {
      setIsLoadingTimeline(false);
      return;
    }

    // First, find the user's most recent approved quote
    const quotesQuery = query(
      collection(db, 'quotes'),
      where('userId', '==', user.uid),
      where('status', '==', 'approved'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribeQuotes = onSnapshot(quotesQuery, async (snapshot) => {
      if (!snapshot.empty) {
        const quoteDoc = snapshot.docs[0];
        const quoteId = quoteDoc.id;
        setUserQuoteId(quoteId);
        
        // Now subscribe to the timeline for this quote
        const timelineRef = doc(db, 'projectTimelines', quoteId);
        const unsubscribeTimeline = onSnapshot(timelineRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data() as TimelineData;
            setTimelineData(data);
          }
          setIsLoadingTimeline(false);
        });

        return () => unsubscribeTimeline();
      } else {
        // No approved quote found, check for pending quotes
        const pendingQuotesQuery = query(
          collection(db, 'quotes'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(1)
        );

        onSnapshot(pendingQuotesQuery, (pendingSnapshot) => {
          if (!pendingSnapshot.empty) {
            const quoteDoc = pendingSnapshot.docs[0];
            const quoteId = quoteDoc.id;
            setUserQuoteId(quoteId);
            
            // Check if there's a timeline for pending quote
            const timelineRef = doc(db, 'projectTimelines', quoteId);
            onSnapshot(timelineRef, (doc) => {
              if (doc.exists()) {
                const data = doc.data() as TimelineData;
                setTimelineData(data);
              }
              setIsLoadingTimeline(false);
            });
          } else {
            setIsLoadingTimeline(false);
          }
        });
      }
    });

    return () => unsubscribeQuotes();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const createUserProfile = async () => {
    if (!user) return;

    try {
      const userProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        firstName: user.displayName?.split(' ')[0] || '',
        lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
        accountType: 'customer',
        emailVerified: user.isVerified,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      console.log('User profile created successfully');
      window.location.reload(); // Reload to fetch the new profile
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      sender: userProfile?.firstName || 'You',
      content: message,
      timestamp: new Date().toISOString(),
      isGroeimetAI: false,
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Simulate GroeimetAI response
    setTimeout(() => {
      const response = {
        id: (Date.now() + 1).toString(),
        sender: 'GroeimetAI Team',
        content: 'Thanks for your message! Our team will respond within 24 hours.',
        timestamp: new Date().toISOString(),
        isGroeimetAI: true,
      };
      setMessages((prev) => [...prev, response]);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange mx-auto"></div>
          <p className="mt-4 text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // If user exists but profile is still loading, show a message
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange mx-auto"></div>
          <p className="mt-4 text-white/60">Loading your profile...</p>
          <p className="mt-2 text-sm text-white/40">
            If this takes too long, try refreshing the page.
          </p>
          <div className="mt-4 space-y-2">
            <Button onClick={() => window.location.reload()} variant="outline" className="mr-2">
              Refresh Page
            </Button>
            <Button onClick={createUserProfile} className="bg-orange hover:bg-orange/90">
              Create Profile
            </Button>
          </div>
          {profileCheckCount > 0 && (
            <p className="mt-4 text-sm text-red-400">
              Your profile doesn&apos;t exist in our database. Click &quot;Create Profile&quot; to
              set it up.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome back, {userProfile.firstName || userProfile.displayName}!
          </h2>
          <p className="text-white/60">
            Track your project progress and communicate with our team.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Timeline Widget */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Project Timeline</h3>
              <Badge variant="outline" className="text-orange border-orange">
                {currentStage?.name || 'Planning'}
              </Badge>
            </div>

            {/* Overall Progress */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-white/60">Overall Progress</span>
                <span className="text-sm font-medium text-white">{Math.round(totalProgress)}%</span>
              </div>
              <Progress value={totalProgress} className="h-2" />
            </div>

            {/* Timeline */}
            <div className="space-y-6">
              {projectStages.map((stage, index) => {
                // Map icon strings to components
                const stageIcons = {
                  briefcase: Briefcase,
                  target: Target,
                  rocket: Rocket,
                  flag: Flag,
                };
                const StageIcon = stageIcons[stage.icon as keyof typeof stageIcons] || Briefcase;

                return (
                  <div key={stage.id} className="relative">
                    {index < projectStages.length - 1 && (
                      <div
                        className={`absolute left-5 top-10 bottom-0 w-0.5 ${
                          stage.status === 'completed' ? 'bg-green-500' : 'bg-white/20'
                        }`}
                      />
                    )}

                    <div className="flex items-start space-x-4">
                      <div
                        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                          stage.status === 'completed'
                            ? 'bg-green-500'
                            : stage.status === 'current'
                              ? 'bg-orange'
                              : 'bg-white/20'
                        }`}
                      >
                        {stage.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-white" />
                        ) : stage.status === 'current' ? (
                          <Circle className="w-5 h-5 text-white animate-pulse" />
                        ) : (
                          <StageIcon className="w-5 h-5 text-white/60" />
                        )}
                      </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`font-medium ${
                            stage.status === 'completed'
                              ? 'text-white'
                              : stage.status === 'current'
                                ? 'text-white'
                                : 'text-white/60'
                          }`}
                        >
                          {stage.name}
                        </h4>
                      </div>
                      <p className="text-sm text-white/60 mt-1">{stage.description}</p>

                      {stage.status === 'current' && stage.progress && (
                        <div className="mt-2">
                          <Progress value={stage.progress} className="h-1" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Next Milestone */}
            {(timelineData?.milestone || !isLoadingTimeline) && (
              <div className="mt-8 p-4 bg-orange/10 rounded-lg border border-orange/20">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-orange" />
                  <div>
                    <p className="text-sm font-medium text-white">Next Milestone</p>
                    <p className="text-xs text-white/60">
                      {timelineData?.milestone || 'Your project timeline will be updated once your request is approved'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Support Chat Widget */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 flex flex-col h-[600px]"
          >
            <DashboardChat />
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          <Link href="/dashboard/projects" className="block">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <LayoutDashboard className="w-5 h-5 text-orange" />
                  <span className="text-white">View All Projects</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/60" />
              </div>
            </div>
          </Link>

          <Link href="/dashboard/documents" className="block">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-orange" />
                  <span className="text-white">Documents</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/60" />
              </div>
            </div>
          </Link>

          <Link href="/dashboard/quotes" className="block">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ClipboardList className="w-5 h-5 text-orange" />
                  <span className="text-white">Project Requests</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/60" />
              </div>
            </div>
          </Link>

          <Link href="/dashboard/consultations" className="block">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-orange" />
                  <span className="text-white">Schedule Meeting</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/60" />
              </div>
            </div>
          </Link>

          <Link href="/dashboard/settings" className="block">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5 text-orange" />
                  <span className="text-white">Settings</span>
                </div>
                <ChevronRight className="w-4 h-4 text-white/60" />
              </div>
            </div>
          </Link>

          {isAdmin && (
            <Link href="/dashboard/admin" className="block">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-orange" />
                    <span className="text-white">Admin Panel</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/60" />
                </div>
              </div>
            </Link>
          )}
        </motion.div>
      </div>
    </main>
  );
}
