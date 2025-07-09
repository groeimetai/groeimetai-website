'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  MessageSquare,
  Calendar,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const stats = [
  {
    title: 'Active Projects',
    value: '12',
    change: '+2',
    changeType: 'increase',
    icon: FileText,
    color: 'text-white',
    bgColor: 'bg-blue-500',
  },
  {
    title: 'Messages',
    value: '48',
    change: '+8',
    changeType: 'increase',
    icon: MessageSquare,
    color: 'text-white',
    bgColor: 'bg-purple-500',
  },
  {
    title: 'Consultations',
    value: '6',
    change: '-1',
    changeType: 'decrease',
    icon: Calendar,
    color: 'text-white',
    bgColor: 'bg-green-500',
  },
  {
    title: 'Team Members',
    value: '24',
    change: '+3',
    changeType: 'increase',
    icon: Users,
    color: 'text-white',
    bgColor: 'bg-orange-500',
  },
];

const recentProjects = [
  {
    id: 1,
    name: 'AI Chatbot Integration',
    client: 'TechCorp Solutions',
    status: 'in-progress',
    progress: 65,
    dueDate: '2024-02-15',
  },
  {
    id: 2,
    name: 'ServiceNow Migration',
    client: 'Global Finance Inc',
    status: 'completed',
    progress: 100,
    dueDate: '2024-01-30',
  },
  {
    id: 3,
    name: 'RAG Architecture Setup',
    client: 'Healthcare Plus',
    status: 'pending',
    progress: 25,
    dueDate: '2024-02-28',
  },
];

const upcomingConsultations = [
  {
    id: 1,
    title: 'AI Strategy Planning',
    client: 'Retail Dynamics',
    time: '10:00 AM',
    date: 'Today',
    type: 'video',
  },
  {
    id: 2,
    title: 'Technical Architecture Review',
    client: 'TechCorp Solutions',
    time: '2:00 PM',
    date: 'Tomorrow',
    type: 'in-person',
  },
  {
    id: 3,
    title: 'Performance Optimization',
    client: 'Global Finance Inc',
    time: '11:00 AM',
    date: 'Feb 5',
    type: 'video',
  },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold mb-2">Welcome back, John!</h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your projects and consultations.
        </p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="hover-lift">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {stat.changeType === 'increase' ? (
                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span
                    className={stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}
                  >
                    {stat.change}
                  </span>
                  <span className="ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Projects and Consultations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Your active and recent projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentProjects.map((project) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-sm text-muted-foreground">{project.client}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {project.status === 'completed' ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : project.status === 'in-progress' ? (
                        <Clock className="h-4 w-4 text-blue-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                      )}
                      <span className="text-sm text-muted-foreground">{project.dueDate}</span>
                    </div>
                  </div>
                  <Progress value={project.progress} className="h-2" />
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                View All Projects
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Consultations */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Upcoming Consultations</CardTitle>
              <CardDescription>Your scheduled meetings and consultations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingConsultations.map((consultation) => (
                <div
                  key={consultation.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{consultation.title}</p>
                    <p className="text-sm text-muted-foreground">{consultation.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{consultation.date}</p>
                    <p className="text-sm text-muted-foreground">{consultation.time}</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4">
                View Calendar
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="justify-start">
                <FileText className="mr-2 h-4 w-4" />
                New Project
              </Button>
              <Button variant="outline" className="justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Consultation
              </Button>
              <Button variant="outline" className="justify-start">
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Message
              </Button>
              <Button variant="outline" className="justify-start">
                <Users className="mr-2 h-4 w-4" />
                Invite Team Member
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
