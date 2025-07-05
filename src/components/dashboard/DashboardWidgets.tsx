'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Calendar,
  TrendingUp,
  FileText,
  MessageSquare,
  DollarSign,
  Clock,
  Target,
  Activity,
  BarChart3,
  Users,
  Settings,
  Plus,
  X,
  GripVertical,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { formatDistanceToNow } from 'date-fns';
import { Link } from '@/i18n/routing';

interface Widget {
  id: string;
  type: 'stats' | 'recentActivity' | 'projectProgress' | 'upcomingMeetings' | 'quickActions' | 'revenue' | 'tasks';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  isExpanded?: boolean;
}

interface WidgetData {
  [key: string]: any;
}

const DEFAULT_WIDGETS: Widget[] = [
  { id: '1', type: 'stats', title: 'Quick Stats', size: 'medium', position: { x: 0, y: 0 } },
  { id: '2', type: 'projectProgress', title: 'Project Progress', size: 'medium', position: { x: 1, y: 0 } },
  { id: '3', type: 'recentActivity', title: 'Recent Activity', size: 'large', position: { x: 0, y: 1 } },
  { id: '4', type: 'quickActions', title: 'Quick Actions', size: 'small', position: { x: 2, y: 0 } },
];

const WIDGET_TYPES = [
  { type: 'stats', title: 'Quick Stats', icon: BarChart3, description: 'Overview of your key metrics' },
  { type: 'recentActivity', title: 'Recent Activity', icon: Activity, description: 'Your latest updates' },
  { type: 'projectProgress', title: 'Project Progress', icon: Target, description: 'Track project completion' },
  { type: 'upcomingMeetings', title: 'Upcoming Meetings', icon: Calendar, description: 'Your scheduled meetings' },
  { type: 'quickActions', title: 'Quick Actions', icon: Plus, description: 'Common actions shortcuts' },
  { type: 'tasks', title: 'Tasks & To-Do', icon: FileText, description: 'Your pending tasks' },
];

export default function DashboardWidgets() {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<Widget[]>(DEFAULT_WIDGETS);
  const [widgetData, setWidgetData] = useState<WidgetData>({});
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [draggedWidget, setDraggedWidget] = useState<Widget | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Load user's widget preferences
  useEffect(() => {
    if (!user) return;

    const loadWidgetPreferences = async () => {
      try {
        const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          if (userData.dashboardWidgets) {
            setWidgets(userData.dashboardWidgets);
          }
        }
      } catch (error) {
        console.error('Error loading widget preferences:', error);
      }
    };

    loadWidgetPreferences();
  }, [user]);

  // Save widget preferences
  const saveWidgetPreferences = async (updatedWidgets?: Widget[]) => {
    if (!user) return;

    try {
      const userQuery = query(collection(db, 'users'), where('uid', '==', user.uid));
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        await updateDoc(userSnapshot.docs[0].ref, {
          dashboardWidgets: updatedWidgets || widgets,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error saving widget preferences:', error);
    }
  };

  // Fetch widget data
  useEffect(() => {
    if (!user) return;

    const fetchWidgetData = async () => {
      const data: WidgetData = {};

      // Fetch stats
      try {
        const projectsQuery = query(
          collection(db, 'projects'),
          where('clientId', '==', user.uid)
        );
        const projectsSnapshot = await getDocs(projectsQuery);
        
        const quotesQuery = query(
          collection(db, 'quotes'),
          where('userId', '==', user.uid)
        );
        const quotesSnapshot = await getDocs(quotesQuery);

        data.stats = {
          projects: projectsSnapshot.size,
          activeProjects: projectsSnapshot.docs.filter(doc => doc.data().status === 'active').length,
          quotes: quotesSnapshot.size,
          pendingQuotes: quotesSnapshot.docs.filter(doc => doc.data().status === 'pending').length,
        };

        // Fetch recent activity
        const activities: Array<{
          id: string;
          type: string;
          title: string;
          time: Date;
        }> = [];
        projectsSnapshot.docs.slice(0, 5).forEach(doc => {
          const project = doc.data();
          activities.push({
            id: doc.id,
            type: 'project',
            title: `Project ${project.name} updated`,
            time: project.updatedAt?.toDate() || new Date(),
          });
        });

        data.recentActivity = activities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);

        // Fetch project progress
        data.projectProgress = projectsSnapshot.docs.slice(0, 3).map(doc => {
          const project = doc.data();
          const progress = project.milestones
            ? (project.milestones.filter((m: any) => m.status === 'completed').length / project.milestones.length) * 100
            : 0;
          return {
            id: doc.id,
            name: project.name,
            progress: Math.round(progress),
            status: project.status,
          };
        });

        setWidgetData(data);
      } catch (error) {
        console.error('Error fetching widget data:', error);
      }
    };

    fetchWidgetData();
  }, [user, widgets]);

  const addWidget = (type: string) => {
    const widgetType = WIDGET_TYPES.find(w => w.type === type);
    if (!widgetType) return;

    const newWidget: Widget = {
      id: Date.now().toString(),
      type: type as Widget['type'],
      title: widgetType.title,
      size: 'medium',
      position: { x: widgets.length % 3, y: Math.floor(widgets.length / 3) },
    };

    setWidgets([...widgets, newWidget]);
    setShowAddWidget(false);
  };

  const removeWidget = (widgetId: string) => {
    const updatedWidgets = widgets.filter(w => w.id !== widgetId);
    setWidgets(updatedWidgets);
    saveWidgetPreferences(updatedWidgets);
  };

  const toggleWidgetSize = (widgetId: string) => {
    const updatedWidgets = widgets.map(w => 
      w.id === widgetId 
        ? { ...w, isExpanded: !w.isExpanded }
        : w
    );
    setWidgets(updatedWidgets);
    saveWidgetPreferences(updatedWidgets);
  };

  const handleReorder = (newOrder: Widget[]) => {
    const updatedWidgets = newOrder.map((w, index) => ({
      ...w,
      position: { x: index % 3, y: Math.floor(index / 3) }
    }));
    setWidgets(updatedWidgets);
    saveWidgetPreferences(updatedWidgets);
  };

  const renderWidget = (widget: Widget) => {
    const WidgetContent = () => {
      switch (widget.type) {
        case 'stats':
          return (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/60 text-sm">Total Projects</p>
                <p className="text-2xl font-bold text-white">{widgetData.stats?.projects || 0}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/60 text-sm">Active</p>
                <p className="text-2xl font-bold text-green-500">{widgetData.stats?.activeProjects || 0}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/60 text-sm">Quotes</p>
                <p className="text-2xl font-bold text-white">{widgetData.stats?.quotes || 0}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <p className="text-white/60 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-500">{widgetData.stats?.pendingQuotes || 0}</p>
              </div>
            </div>
          );

        case 'recentActivity':
          return (
            <div className="space-y-3">
              {widgetData.recentActivity?.length > 0 ? (
                widgetData.recentActivity.map((activity: any) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-white text-sm">{activity.title}</p>
                      <p className="text-white/40 text-xs">
                        {formatDistanceToNow(activity.time, { addSuffix: true })}
                      </p>
                    </div>
                    <Activity className="w-4 h-4 text-white/60" />
                  </div>
                ))
              ) : (
                <p className="text-white/60 text-center py-4">No recent activity</p>
              )}
            </div>
          );

        case 'projectProgress':
          return (
            <div className="space-y-3">
              {widgetData.projectProgress?.length > 0 ? (
                widgetData.projectProgress.map((project: any) => (
                  <div key={project.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-white text-sm font-medium">{project.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {project.status}
                      </Badge>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                    <p className="text-white/60 text-xs text-right">{project.progress}%</p>
                  </div>
                ))
              ) : (
                <p className="text-white/60 text-center py-4">No projects yet</p>
              )}
            </div>
          );

        case 'quickActions':
          return (
            <div className="space-y-2">
              <Link href="/contact?type=project">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </Link>
              <Link href="/dashboard/consultations">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
              </Link>
              <Link href="/dashboard/documents">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  View Documents
                </Button>
              </Link>
              <Link href="/dashboard/messages">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Messages
                </Button>
              </Link>
            </div>
          );

        case 'upcomingMeetings':
          return (
            <div className="space-y-3">
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white text-sm font-medium">Strategy Session</h4>
                  <Badge variant="outline" className="text-xs">Tomorrow</Badge>
                </div>
                <p className="text-white/60 text-xs">10:00 AM - 11:00 AM</p>
              </div>
              <Link href="/dashboard/consultations">
                <Button variant="outline" className="w-full" size="sm">
                  View All Meetings
                </Button>
              </Link>
            </div>
          );


        case 'tasks':
          return (
            <div className="space-y-2">
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-white text-sm">Review project proposal</span>
                </div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-white text-sm">Approve timeline changes</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
          );

        default:
          return null;
      }
    };

    const widgetSizeClass = widget.isExpanded 
      ? 'col-span-full'
      : widget.size === 'small' 
        ? 'col-span-1' 
        : widget.size === 'large' 
          ? 'col-span-2 row-span-2' 
          : 'col-span-1';

    return (
      <div
        key={widget.id}
        className={`${widgetSizeClass}`}
      >
        <Card className={`bg-white/5 border-white/10 h-full ${isDragging === widget.id ? 'opacity-50 cursor-grabbing' : isEditMode ? 'cursor-grab' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">{widget.title}</CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => toggleWidgetSize(widget.id)}
              >
                {widget.isExpanded ? (
                  <Minimize2 className="h-3 w-3" />
                ) : (
                  <Maximize2 className="h-3 w-3" />
                )}
              </Button>
              {isEditMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeWidget(widget.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <WidgetContent />
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Widget Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Your Dashboard</h2>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsEditMode(!isEditMode)}
            className={isEditMode ? 'bg-orange/20 border-orange' : ''}
            data-help="customize-dashboard"
          >
            <Settings className="w-4 h-4 mr-2" />
            {isEditMode ? 'Done Editing' : 'Customize'}
          </Button>
          {isEditMode && (
            <Dialog open={showAddWidget} onOpenChange={setShowAddWidget}>
              <DialogTrigger asChild>
                <Button className="bg-orange hover:bg-orange/90" data-help="add-widget">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Widget
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black/95 border-white/20">
                <DialogHeader>
                  <DialogTitle className="text-white">Add Widget</DialogTitle>
                  <DialogDescription className="text-white/60">
                    Choose a widget to add to your dashboard
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-3 mt-4">
                  {WIDGET_TYPES.map((widgetType) => {
                    const Icon = widgetType.icon;
                    const isAdded = widgets.some(w => w.type === widgetType.type);
                    return (
                      <Button
                        key={widgetType.type}
                        variant="outline"
                        className="justify-start h-auto p-4"
                        onClick={() => !isAdded && addWidget(widgetType.type)}
                        disabled={isAdded}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        <div className="text-left">
                          <p className="font-medium">{widgetType.title}</p>
                          <p className="text-xs text-white/60">{widgetType.description}</p>
                        </div>
                        {isAdded && (
                          <Badge variant="outline" className="ml-auto">Added</Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Widgets Grid */}
      {isEditMode ? (
        <Reorder.Group
          axis="y"
          values={widgets}
          onReorder={handleReorder}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          data-help="dashboard-widgets"
        >
          {widgets.map(widget => (
            <Reorder.Item
              key={widget.id}
              value={widget}
              dragListener={true}
              dragControls={undefined}
              whileDrag={{ scale: 1.05, opacity: 0.8 }}
              onDragStart={() => setIsDragging(widget.id)}
              onDragEnd={() => setIsDragging(null)}
            >
              {renderWidget(widget)}
            </Reorder.Item>
          ))}
        </Reorder.Group>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-help="dashboard-widgets">
          <AnimatePresence>
            {widgets.map(widget => (
              <motion.div
                key={widget.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                {renderWidget(widget)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Empty State */}
      {widgets.length === 0 && (
        <div className="text-center py-12">
          <Settings className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No widgets added</h3>
          <p className="text-white/60 mb-6">Add widgets to customize your dashboard</p>
          <Button
            className="bg-orange hover:bg-orange/90"
            onClick={() => setShowAddWidget(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Widget
          </Button>
        </div>
      )}
    </div>
  );
}