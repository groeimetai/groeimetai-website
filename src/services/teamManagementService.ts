import { db, collections } from '@/lib/firebase/config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { TeamMember, User, UserRole } from '@/types';

// Map internal roles to display roles
const ROLE_DISPLAY_MAP: Record<string, string> = {
  admin: 'Administrator',
  consultant: 'Consultant',
  project_manager: 'Project Manager',
  developer: 'Developer',
  designer: 'Designer',
  marketing: 'Marketing',
};

// Map display roles to internal roles
const DISPLAY_ROLE_MAP: Record<string, string> = {
  Administrator: 'admin',
  Consultant: 'consultant',
  'Project Manager': 'project_manager',
  Developer: 'developer',
  Designer: 'designer',
  Marketing: 'marketing',
};

// Permissions by role
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ['all'],
  consultant: ['projects', 'quotes', 'consultations', 'documents'],
  project_manager: ['projects', 'quotes', 'users', 'documents', 'invoices'],
  developer: ['projects', 'documents', 'consultations'],
  designer: ['projects', 'documents'],
  marketing: ['users', 'documents', 'quotes'],
};

// Helper to convert timestamps
function convertTimestamps(data: any): any {
  if (!data) return data;

  const result = { ...data };

  if (result.createdAt instanceof Timestamp) {
    result.createdAt = result.createdAt.toDate();
  }
  if (result.updatedAt instanceof Timestamp) {
    result.updatedAt = result.updatedAt.toDate();
  }
  if (result.lastLoginAt instanceof Timestamp) {
    result.lastLoginAt = result.lastLoginAt.toDate();
  }
  if (result.lastActivityAt instanceof Timestamp) {
    result.lastActivityAt = result.lastActivityAt.toDate();
  }
  if (result.invitedAt instanceof Timestamp) {
    result.invitedAt = result.invitedAt.toDate();
  }
  if (result.joinedAt instanceof Timestamp) {
    result.joinedAt = result.joinedAt.toDate();
  }

  return result;
}

class TeamManagementService {
  private usersRef = collection(db, collections.users);

  /**
   * Get all team members (users with admin or consultant roles)
   */
  async getTeamMembers(): Promise<TeamMember[]> {
    try {
      // Query for users who are admins or consultants
      const adminQuery = query(
        this.usersRef,
        where('role', 'in', ['admin', 'consultant']),
        orderBy('displayName', 'asc')
      );

      const snapshot = await getDocs(adminQuery);

      return snapshot.docs.map((doc) => {
        const data = convertTimestamps(doc.data());
        return this.userToTeamMember(doc.id, data);
      });
    } catch (error) {
      console.error('Error getting team members:', error);
      throw error;
    }
  }

  /**
   * Get a single team member by user ID
   */
  async getTeamMember(userId: string): Promise<TeamMember | null> {
    try {
      const docRef = doc(this.usersRef, userId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = convertTimestamps(docSnap.data());
      return this.userToTeamMember(docSnap.id, data);
    } catch (error) {
      console.error('Error getting team member:', error);
      throw error;
    }
  }

  /**
   * Update a team member's role
   */
  async updateMemberRole(
    userId: string,
    role: TeamMember['role'],
    permissions?: string[]
  ): Promise<void> {
    try {
      const docRef = doc(this.usersRef, userId);

      // Map team role to user role
      let userRole: UserRole;
      switch (role) {
        case 'admin':
          userRole = 'admin';
          break;
        case 'consultant':
        case 'project_manager':
        case 'developer':
        case 'designer':
        case 'marketing':
          userRole = 'consultant';
          break;
        default:
          userRole = 'client';
      }

      await updateDoc(docRef, {
        role: userRole,
        permissions: permissions || ROLE_PERMISSIONS[role] || [],
        // Store the detailed team role in a custom field
        teamRole: role,
      });
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  }

  /**
   * Update a team member's permissions
   */
  async updateMemberPermissions(
    userId: string,
    permissions: string[]
  ): Promise<void> {
    try {
      const docRef = doc(this.usersRef, userId);

      await updateDoc(docRef, {
        permissions,
      });
    } catch (error) {
      console.error('Error updating member permissions:', error);
      throw error;
    }
  }

  /**
   * Deactivate a team member
   */
  async deactivateMember(userId: string): Promise<void> {
    try {
      const docRef = doc(this.usersRef, userId);

      await updateDoc(docRef, {
        isActive: false,
      });
    } catch (error) {
      console.error('Error deactivating member:', error);
      throw error;
    }
  }

  /**
   * Reactivate a team member
   */
  async reactivateMember(userId: string): Promise<void> {
    try {
      const docRef = doc(this.usersRef, userId);

      await updateDoc(docRef, {
        isActive: true,
      });
    } catch (error) {
      console.error('Error reactivating member:', error);
      throw error;
    }
  }

  /**
   * Get default permissions for a role
   */
  getDefaultPermissions(role: TeamMember['role']): string[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Get display name for a role
   */
  getRoleDisplayName(role: string): string {
    return ROLE_DISPLAY_MAP[role] || role;
  }

  /**
   * Get internal role from display name
   */
  getInternalRole(displayName: string): string {
    return DISPLAY_ROLE_MAP[displayName] || displayName;
  }

  /**
   * Get all available roles
   */
  getAvailableRoles(): { value: string; label: string }[] {
    return Object.entries(ROLE_DISPLAY_MAP).map(([value, label]) => ({
      value,
      label,
    }));
  }

  /**
   * Convert User to TeamMember
   */
  private userToTeamMember(id: string, data: any): TeamMember {
    // Determine the team role from the stored teamRole field or derive from user role
    let teamRole: TeamMember['role'] = 'developer';

    if (data.teamRole) {
      teamRole = data.teamRole;
    } else if (data.role === 'admin') {
      teamRole = 'admin';
    } else if (data.role === 'consultant') {
      teamRole = 'consultant';
    }

    return {
      id,
      userId: id,
      name: data.displayName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unknown',
      email: data.email || '',
      role: teamRole,
      permissions: data.permissions || ROLE_PERMISSIONS[teamRole] || [],
      isActive: data.isActive !== false,
      invitedAt: data.invitedAt,
      invitedBy: data.invitedBy,
      joinedAt: data.createdAt,
    };
  }
}

// Export singleton instance
export const teamManagementService = new TeamManagementService();
