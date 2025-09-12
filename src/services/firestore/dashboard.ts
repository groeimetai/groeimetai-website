import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface Project {
  id: string;
  name: string;
  client: string;
  status: 'assessment' | 'pilot' | 'implementation' | 'live' | 'completed';
  progress: number;
  phase: string;
  startDate: Date;
  endDate?: Date;
  milestones: Milestone[];
  nextMilestones?: NextMilestone[];
  budget: number;
  spent: number;
  assignedTo: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Milestone {
  name: string;
  status: 'completed' | 'current' | 'upcoming';
  completedDate?: Date;
}

export interface NextMilestone {
  name: string;
  when: string;
  description?: string;
}

export interface AgentActivity {
  id: string;
  timestamp: Date;
  action: string;
  agent: string;
  system: string;
  status: 'success' | 'error' | 'info';
  clientId: string;
  details?: any;
}

export interface SystemMetrics {
  clientId: string;
  agentReadiness: number;
  connectedSystems: { current: number; total: number };
  activeAgents: number;
  monthlySavings: number;
  uptime: number;
  lastUpdate: Date;
}

export interface MCPServer {
  id: string;
  name: string;
  clientId: string;
  status: 'online' | 'offline' | 'syncing' | 'error';
  version: string;
  latency: number;
  load: 'low' | 'normal' | 'high' | 'critical';
  lastCheck: Date;
}

export class DashboardService {
  // Get user's projects from Firestore
  static async getUserProjects(userId: string): Promise<Project[]> {
    try {
      const projectsRef = collection(db, 'projects');
      const q = query(
        projectsRef,
        where('userId', '==', userId),
        where('status', 'in', ['pilot', 'implementation', 'live']),
        orderBy('priority', 'desc'),
        orderBy('startDate', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Project));
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  // Real-time project updates
  static subscribeToProjects(
    userId: string, 
    callback: (projects: Project[]) => void
  ): () => void {
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('userId', '==', userId),
      orderBy('startDate', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Project));
      callback(projects);
    });
  }

  // Get system metrics for client
  static async getSystemMetrics(clientId: string): Promise<SystemMetrics | null> {
    try {
      const metricsRef = doc(db, 'systemMetrics', clientId);
      const snapshot = await getDoc(metricsRef);
      
      if (snapshot.exists()) {
        return {
          clientId,
          ...snapshot.data()
        } as SystemMetrics;
      }
      return null;
    } catch (error) {
      console.error('Error fetching metrics:', error);
      return null;
    }
  }

  // Real-time activity feed
  static subscribeToActivityFeed(
    clientId: string,
    callback: (activities: AgentActivity[]) => void
  ): () => void {
    const activitiesRef = collection(db, 'agentActivities');
    const q = query(
      activitiesRef,
      where('clientId', '==', clientId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      } as AgentActivity));
      callback(activities);
    });
  }

  // Get MCP servers for client
  static async getMCPServers(clientId: string): Promise<MCPServer[]> {
    try {
      const serversRef = collection(db, 'mcpServers');
      const q = query(
        serversRef,
        where('clientId', '==', clientId),
        orderBy('name')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastCheck: doc.data().lastCheck.toDate()
      } as MCPServer));
    } catch (error) {
      console.error('Error fetching MCP servers:', error);
      return [];
    }
  }

  // Update project milestone
  static async updateProjectMilestone(
    projectId: string, 
    milestoneIndex: number,
    status: 'completed' | 'current' | 'upcoming'
  ): Promise<void> {
    try {
      const projectRef = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectRef);
      
      if (projectSnap.exists()) {
        const project = projectSnap.data() as Project;
        project.milestones[milestoneIndex].status = status;
        
        if (status === 'completed') {
          project.milestones[milestoneIndex].completedDate = new Date();
        }

        await updateDoc(projectRef, {
          milestones: project.milestones,
          lastUpdate: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  }

  // Log agent activity
  static async logAgentActivity(activity: Omit<AgentActivity, 'id'>): Promise<void> {
    try {
      await addDoc(collection(db, 'agentActivities'), {
        ...activity,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  // Get client reports
  static async getClientReports(clientId: string): Promise<any[]> {
    try {
      const reportsRef = collection(db, 'reports');
      const q = query(
        reportsRef,
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      }));
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  }

  // Update system metrics
  static async updateSystemMetrics(
    clientId: string, 
    metrics: Partial<SystemMetrics>
  ): Promise<void> {
    try {
      const metricsRef = doc(db, 'systemMetrics', clientId);
      await updateDoc(metricsRef, {
        ...metrics,
        lastUpdate: new Date()
      });
    } catch (error) {
      console.error('Error updating metrics:', error);
    }
  }

  // Get user profile with last login
  static async getUserProfile(userId: string): Promise<any> {
    try {
      const userRef = doc(db, 'users', userId);
      const snapshot = await getDoc(userRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          id: userId,
          ...data,
          lastLogin: data.lastLogin,
          createdAt: data.createdAt
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Performance metrics
  static async getPerformanceMetrics(clientId: string): Promise<any[]> {
    try {
      const metricsRef = collection(db, 'performanceMetrics');
      const q = query(
        metricsRef,
        where('clientId', '==', clientId),
        orderBy('timestamp', 'desc'),
        limit(1)
      );

      const snapshot = await getDocs(q);
      if (snapshot.empty) return [];

      const latestMetrics = snapshot.docs[0].data();
      return [
        { 
          name: 'Response Time', 
          current: `${latestMetrics.responseTime}s`, 
          target: '<2s', 
          trend: latestMetrics.responseTimeTrend || 'stable',
          status: latestMetrics.responseTime < 2 ? 'good' : 'warning'
        },
        { 
          name: 'Success Rate', 
          current: `${latestMetrics.successRate}%`, 
          target: '>90%', 
          trend: latestMetrics.successRateTrend || 'stable',
          status: latestMetrics.successRate > 90 ? 'good' : 'warning'
        },
        { 
          name: 'Cost/Transaction', 
          current: `€${latestMetrics.costPerTransaction}`, 
          target: '<€0.05', 
          trend: latestMetrics.costTrend || 'stable',
          status: latestMetrics.costPerTransaction < 0.05 ? 'good' : 'warning'
        },
        { 
          name: 'Agent Errors', 
          current: `${latestMetrics.errorRate}%`, 
          target: '<5%', 
          trend: latestMetrics.errorTrend || 'stable',
          status: latestMetrics.errorRate < 5 ? 'good' : 'warning'
        }
      ];
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return [];
    }
  }
}