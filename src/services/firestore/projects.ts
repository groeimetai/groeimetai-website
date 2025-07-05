import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  getDoc, 
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  limit as firestoreLimit
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Project, ProjectStatus, PaginatedResponse } from '@/types';
import { logResourceActivity, logErrorActivity } from '@/services/activityLogger';
import { auth } from '@/lib/firebase/config';

// Convert Firestore timestamp to Date
const timestampToDate = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp?.seconds) {
    return new Timestamp(timestamp.seconds, timestamp.nanoseconds || 0).toDate();
  }
  return new Date();
};

// Map Firestore document to Project type
const mapFirestoreToProject = (id: string, data: any): Project => {
  // Handle both new projects (from QuoteRequestForm) and full projects
  return {
    id,
    name: data.name || 'Untitled Project',
    description: data.description || '',
    type: data.type || 'consultation',
    status: data.status || 'active',
    priority: data.priority || 'medium',
    clientId: data.userId || data.clientId || '',
    organizationId: data.organizationId,
    consultantId: data.consultantId || '',
    teamIds: data.teamIds || data.team || [],
    startDate: timestampToDate(data.startDate || data.createdAt),
    endDate: data.endDate ? timestampToDate(data.endDate) : undefined,
    actualStartDate: data.actualStartDate ? timestampToDate(data.actualStartDate) : undefined,
    actualEndDate: data.actualEndDate ? timestampToDate(data.actualEndDate) : undefined,
    estimatedHours: data.estimatedHours || 0,
    actualHours: data.actualHours || 0,
    budget: data.budget || {
      amount: 0,
      currency: 'EUR',
      type: 'fixed'
    },
    milestones: data.milestones || [],
    tags: data.tags || [],
    categories: data.categories || [],
    technologies: data.technologies || data.services || [],
    documentIds: data.documentIds || [],
    conversationId: data.conversationId,
    meetingIds: data.meetingIds || [],
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt || data.createdAt),
    createdBy: data.createdBy || data.userId || '',
    completedAt: data.completedAt ? timestampToDate(data.completedAt) : undefined,
  };
};

// Firestore-based project service
export const firestoreProjectService = {
  // List projects with pagination and filters
  async list(params?: {
    status?: string;
    type?: string;
    consultantId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    userId?: string;
  }): Promise<PaginatedResponse<Project>> {
    try {
      const constraints: QueryConstraint[] = [];
      
      // Filter by user
      if (params?.userId) {
        constraints.push(where('userId', '==', params.userId));
      }
      
      // Filter by status
      if (params?.status && params.status !== 'all') {
        constraints.push(where('status', '==', params.status));
      }
      
      // Filter by type
      if (params?.type) {
        constraints.push(where('type', '==', params.type));
      }
      
      // Filter by consultant
      if (params?.consultantId) {
        constraints.push(where('consultantId', '==', params.consultantId));
      }
      
      // Sort
      const sortField = params?.sort || 'createdAt';
      const sortOrder = params?.order || 'desc';
      constraints.push(orderBy(sortField, sortOrder));
      
      // Limit
      const limitValue = params?.limit || 20;
      constraints.push(firestoreLimit(limitValue));
      
      // Create query
      const projectsQuery = query(collection(db, 'projects'), ...constraints);
      
      // Execute query
      const snapshot = await getDocs(projectsQuery);
      
      // Map documents to projects
      const projects: Project[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // Simple search filter (client-side for now)
        if (params?.search) {
          const searchLower = params.search.toLowerCase();
          const nameMatch = data.name?.toLowerCase().includes(searchLower);
          const descMatch = data.description?.toLowerCase().includes(searchLower);
          if (!nameMatch && !descMatch) {
            return;
          }
        }
        
        projects.push(mapFirestoreToProject(doc.id, data));
      });
      
      // Return paginated response
      return {
        items: projects,
        pagination: {
          page: params?.page || 1,
          limit: limitValue,
          total: projects.length,
          pages: Math.ceil(projects.length / limitValue),
          hasNext: false, // Simple implementation for now
          hasPrev: false,
        }
      };
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw new Error('Failed to fetch projects');
    }
  },

  // Get single project by ID
  async get(id: string): Promise<Project> {
    try {
      const docRef = doc(db, 'projects', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Project not found');
      }
      
      return mapFirestoreToProject(docSnap.id, docSnap.data());
    } catch (error) {
      console.error('Error fetching project:', error);
      throw new Error('Failed to fetch project');
    }
  },

  // Create new project
  async create(data: any): Promise<Project> {
    try {
      const projectData = {
        ...data,
        status: data.status || 'active',
        progress: data.progress || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      const docRef = await addDoc(collection(db, 'projects'), projectData);
      
      // Fetch the created project
      const project = await this.get(docRef.id);
      
      // Log activity
      const currentUser = auth.currentUser;
      if (currentUser) {
        await logResourceActivity(
          'project.create',
          'project',
          docRef.id,
          project.name,
          {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || undefined,
          },
          {
            projectType: project.type,
            budget: project.budget.amount,
            currency: project.budget.currency,
          }
        );
      }
      
      return project;
    } catch (error: any) {
      console.error('Error creating project:', error);
      
      // Log error
      const currentUser = auth.currentUser;
      if (currentUser) {
        await logErrorActivity(
          'project.create',
          error,
          {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || undefined,
          },
          {
            projectData: data,
          }
        );
      }
      
      throw new Error('Failed to create project');
    }
  },

  // Update project
  async update(id: string, data: Partial<Project>): Promise<Project> {
    try {
      const docRef = doc(db, 'projects', id);
      
      // Get the project name for logging
      const existingProject = await this.get(id);
      
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
      
      // Fetch the updated project
      const updatedProject = await this.get(id);
      
      // Log activity
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Check if status changed
        if (data.status && data.status !== existingProject.status) {
          await logResourceActivity(
            'project.status_change',
            'project',
            id,
            updatedProject.name,
            {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || undefined,
            },
            {
              oldStatus: existingProject.status,
              newStatus: data.status,
            }
          );
        } else {
          await logResourceActivity(
            'project.update',
            'project',
            id,
            updatedProject.name,
            {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || undefined,
            },
            {
              updatedFields: Object.keys(data),
            }
          );
        }
      }
      
      return updatedProject;
    } catch (error: any) {
      console.error('Error updating project:', error);
      
      // Log error
      const currentUser = auth.currentUser;
      if (currentUser) {
        await logErrorActivity(
          'project.update',
          error,
          {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || undefined,
          },
          {
            projectId: id,
            updateData: data,
          }
        );
      }
      
      throw new Error('Failed to update project');
    }
  },

  // Delete project
  async delete(id: string): Promise<void> {
    try {
      // Get project info before deleting
      const project = await this.get(id);
      
      const docRef = doc(db, 'projects', id);
      await deleteDoc(docRef);
      
      // Log activity
      const currentUser = auth.currentUser;
      if (currentUser) {
        await logResourceActivity(
          'project.delete',
          'project',
          id,
          project.name,
          {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || undefined,
          },
          {
            projectType: project.type,
            projectStatus: project.status,
          }
        );
      }
    } catch (error: any) {
      console.error('Error deleting project:', error);
      
      // Log error
      const currentUser = auth.currentUser;
      if (currentUser) {
        await logErrorActivity(
          'project.delete',
          error,
          {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || undefined,
          },
          {
            projectId: id,
          }
        );
      }
      
      throw new Error('Failed to delete project');
    }
  },

  // Archive project
  async archive(id: string): Promise<void> {
    try {
      await this.update(id, { status: 'cancelled' as ProjectStatus });
    } catch (error) {
      console.error('Error archiving project:', error);
      throw new Error('Failed to archive project');
    }
  },

  // Get project templates (placeholder)
  async getTemplates(): Promise<any[]> {
    // For now, return empty array
    return [];
  },
};

// Export as default for easy replacement
export default firestoreProjectService;