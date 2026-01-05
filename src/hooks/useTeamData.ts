'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  getDocs,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User, UserRole } from '@/types';

interface TeamMember extends User {
  // Extended properties for team management
  projectAssignments?: string[];
  currentWorkload: number;
  averageRating?: number;
  completedProjects?: number;
}

interface UseTeamDataOptions {
  roles?: UserRole[];
  includeAvailability?: boolean;
  realTime?: boolean;
}

interface UseTeamDataReturn {
  teamMembers: TeamMember[];
  consultants: TeamMember[];
  admins: TeamMember[];
  isLoading: boolean;
  error: string | null;
  updateAvailability: (userId: string, availability: User['availability']) => Promise<void>;
  getAvailableConsultants: (skills?: string[]) => TeamMember[];
  searchTeamMembers: (query: string) => TeamMember[];
  refreshTeamData: () => Promise<void>;
}

export const useTeamData = (options: UseTeamDataOptions = {}): UseTeamDataReturn => {
  const {
    roles = ['admin', 'consultant'],
    includeAvailability = true,
    realTime = true,
  } = options;

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch team members data
  const fetchTeamData = async () => {
    try {
      setError(null);
      
      // Build query for team members
      const usersRef = collection(db, 'users');
      const teamQuery = query(
        usersRef,
        where('role', 'in', roles),
        where('isActive', '==', true),
        orderBy('displayName', 'asc')
      );

      if (realTime) {
        // Real-time listener
        const unsubscribe = onSnapshot(
          teamQuery,
          (snapshot) => {
            const members: TeamMember[] = [];
            
            snapshot.forEach((doc) => {
              const userData = doc.data() as User;
              
              // Sanitize user data before adding to members
              const sanitizedMember = sanitizeUserData(userData);
              members.push(sanitizedMember);
            });

            setTeamMembers(members);
            setIsLoading(false);
          },
          (error) => {
            console.error('Error fetching team data:', error);
            setError(error.message);
            setIsLoading(false);
          }
        );

        return unsubscribe;
      } else {
        // One-time fetch
        const snapshot = await getDocs(teamQuery);
        const members: TeamMember[] = [];
        
        snapshot.forEach((doc) => {
          const userData = doc.data() as User;
          
          // Sanitize user data before adding to members
          const sanitizedMember = sanitizeUserData(userData);
          members.push(sanitizedMember);
        });

        setTeamMembers(members);
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('Error fetching team data:', error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  // Calculate workload based on active projects
  const calculateWorkload = (projectCount: number): number => {
    // Simple calculation: each project = 25% workload, max 100%
    return Math.min(projectCount * 25, 100);
  };

  // Sanitize user data for security
  const sanitizeUserData = (userData: User): TeamMember => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { permissions: _, subscriptionId: __, organizationId: ___, ...rest } = userData as User & { permissions?: string[]; subscriptionId?: string; organizationId?: string };
    return {
      ...rest,
      currentWorkload: calculateWorkload(userData.stats?.projectsCount || 0),
      projectAssignments: [],
      permissions: [],
    } as TeamMember;
  };

  // Update user availability (with permission check)
  const updateAvailability = async (userId: string, availability: User['availability']) => {
    try {
      // Basic validation
      if (!userId || typeof userId !== 'string') {
        throw new Error('Invalid user ID');
      }

      const validStatuses = ['available', 'busy', 'away', 'offline'];
      if (availability?.status && !validStatuses.includes(availability.status)) {
        throw new Error('Invalid availability status');
      }

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        availability: {
          status: availability?.status || 'offline',
          lastSeen: new Date(),
          currentProject: availability?.currentProject || null,
          scheduledUntil: availability?.scheduledUntil || null,
          notes: availability?.notes?.slice(0, 200) || '', // Limit notes length
        },
        lastActivityAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (error: any) {
      console.error('Error updating availability:', error);
      throw error;
    }
  };

  // Get available consultants with optional skill matching
  const getAvailableConsultants = (requiredSkills?: string[]): TeamMember[] => {
    return teamMembers.filter((member) => {
      // Must be consultant role
      if (member.role !== 'consultant') return false;
      
      // Must be available
      if (!member.isAvailable || member.availability?.status !== 'available') return false;
      
      // Check workload (don't assign if over 80%)
      if (member.currentWorkload > 80) return false;
      
      // If skills are required, check for matches
      if (requiredSkills && requiredSkills.length > 0) {
        const memberSkills = [
          ...(member.skills || []),
          ...(member.specializations || []),
        ].map(skill => skill.toLowerCase());
        
        const hasRequiredSkills = requiredSkills.some(skill =>
          memberSkills.includes(skill.toLowerCase())
        );
        
        if (!hasRequiredSkills) return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Sort by workload (lowest first) and then by rating
      if (a.currentWorkload !== b.currentWorkload) {
        return a.currentWorkload - b.currentWorkload;
      }
      return (b.averageRating || 0) - (a.averageRating || 0);
    });
  };

  // Search team members with input sanitization
  const searchTeamMembers = (searchQuery: string): TeamMember[] => {
    if (!searchQuery || typeof searchQuery !== 'string') return teamMembers;
    
    // Sanitize search query: remove special characters, limit length
    const sanitizedQuery = searchQuery
      .trim()
      .toLowerCase()
      .slice(0, 100) // Limit search query length
      .replace(/[<>'"&]/g, ''); // Remove potentially dangerous characters
    
    if (!sanitizedQuery) return teamMembers;
    
    return teamMembers.filter((member) => {
      // Only search in safe, non-sensitive fields
      return (
        member.displayName?.toLowerCase().includes(sanitizedQuery) ||
        member.email?.toLowerCase().includes(sanitizedQuery) ||
        member.company?.toLowerCase().includes(sanitizedQuery) ||
        member.jobTitle?.toLowerCase().includes(sanitizedQuery) ||
        member.skills?.some(skill => skill.toLowerCase().includes(sanitizedQuery)) ||
        member.specializations?.some(spec => spec.toLowerCase().includes(sanitizedQuery))
      );
    });
  };

  // Refresh team data
  const refreshTeamData = async () => {
    setIsLoading(true);
    await fetchTeamData();
  };

  // Initialize data fetching
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeData = async () => {
      unsubscribe = await fetchTeamData();
    };

    initializeData();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [roles.join(','), realTime]);

  // Derived data
  const consultants = teamMembers.filter(member => member.role === 'consultant');
  const admins = teamMembers.filter(member => member.role === 'admin');

  return {
    teamMembers,
    consultants,
    admins,
    isLoading,
    error,
    updateAvailability,
    getAvailableConsultants,
    searchTeamMembers,
    refreshTeamData,
  };
};

export default useTeamData;