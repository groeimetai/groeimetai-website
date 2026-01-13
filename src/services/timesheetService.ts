'use client';

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { TimeEntry, TimeEntryStatus, TimesheetWeek, TimesheetWeekStatus } from '@/types';

// Helper function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (timestamp?.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  return new Date(timestamp);
};

// Helper to get ISO week number
const getWeekNumber = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

// Helper to get week start (Monday)
const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

// Helper to get week end (Sunday)
const getWeekEnd = (date: Date): Date => {
  const start = getWeekStart(date);
  return new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
};

export const timesheetService = {
  // Time Entry CRUD operations
  async getTimeEntriesByUser(userId: string, startDate?: Date, endDate?: Date): Promise<TimeEntry[]> {
    try {
      let q = query(
        collection(db, 'timeEntries'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      let entries = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: convertTimestamp(doc.data().date),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt),
      })) as TimeEntry[];

      // Filter by date range if provided
      if (startDate) {
        entries = entries.filter((e) => e.date >= startDate);
      }
      if (endDate) {
        entries = entries.filter((e) => e.date <= endDate);
      }

      return entries;
    } catch (error) {
      console.error('Error getting time entries:', error);
      return [];
    }
  },

  async getTimeEntriesByProject(projectId: string): Promise<TimeEntry[]> {
    try {
      const q = query(
        collection(db, 'timeEntries'),
        where('projectId', '==', projectId),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: convertTimestamp(doc.data().date),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt),
      })) as TimeEntry[];
    } catch (error) {
      console.error('Error getting time entries by project:', error);
      return [];
    }
  },

  async createTimeEntry(entryData: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'timeEntries'), {
        ...entryData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating time entry:', error);
      throw error;
    }
  },

  async updateTimeEntry(entryId: string, updates: Partial<TimeEntry>): Promise<void> {
    try {
      const docRef = doc(db, 'timeEntries', entryId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating time entry:', error);
      throw error;
    }
  },

  async deleteTimeEntry(entryId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'timeEntries', entryId));
    } catch (error) {
      console.error('Error deleting time entry:', error);
      throw error;
    }
  },

  async getTimeEntry(entryId: string): Promise<TimeEntry | null> {
    try {
      const docSnap = await getDoc(doc(db, 'timeEntries', entryId));
      if (!docSnap.exists()) return null;
      return {
        id: docSnap.id,
        ...docSnap.data(),
        date: convertTimestamp(docSnap.data().date),
        createdAt: convertTimestamp(docSnap.data().createdAt),
        updatedAt: convertTimestamp(docSnap.data().updatedAt),
      } as TimeEntry;
    } catch (error) {
      console.error('Error getting time entry:', error);
      return null;
    }
  },

  // Timesheet week operations
  async getTimesheetWeek(userId: string, year: number, weekNumber: number): Promise<TimesheetWeek | null> {
    try {
      const weekId = `${userId}_${year}_${weekNumber}`;
      const docSnap = await getDoc(doc(db, 'timesheetWeeks', weekId));

      if (!docSnap.exists()) {
        // Return a default empty week if not found
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId,
        weekNumber: data.weekNumber,
        year: data.year,
        startDate: data.startDate ? convertTimestamp(data.startDate) : new Date(),
        endDate: data.endDate ? convertTimestamp(data.endDate) : new Date(),
        totalHours: data.totalHours || 0,
        billableHours: data.billableHours || 0,
        status: data.status || 'draft',
        entries: data.entries || [],
        submittedAt: data.submittedAt ? convertTimestamp(data.submittedAt) : undefined,
        approvedAt: data.approvedAt ? convertTimestamp(data.approvedAt) : undefined,
        approvedBy: data.approvedBy,
        rejectedAt: data.rejectedAt ? convertTimestamp(data.rejectedAt) : undefined,
        rejectedBy: data.rejectedBy,
        rejectionReason: data.rejectionReason,
      };
    } catch (error) {
      console.error('Error getting timesheet week:', error);
      return null;
    }
  },

  async createOrUpdateTimesheetWeek(weekData: Omit<TimesheetWeek, 'id'>): Promise<void> {
    try {
      const weekId = `${weekData.userId}_${weekData.year}_${weekData.weekNumber}`;
      const docRef = doc(db, 'timesheetWeeks', weekId);

      await updateDoc(docRef, {
        ...weekData,
        updatedAt: serverTimestamp(),
      }).catch(() => {
        // If document doesn't exist, create it
        return addDoc(collection(db, 'timesheetWeeks'), {
          ...weekData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
    } catch (error) {
      console.error('Error updating timesheet week:', error);
      throw error;
    }
  },

  // Submit timesheet for approval
  async submitTimesheet(userId: string, year: number, weekNumber: number): Promise<void> {
    try {
      // Get all entries for this week
      const weekStart = getWeekStart(new Date(year, 0, 1 + (weekNumber - 1) * 7));
      const weekEnd = getWeekEnd(weekStart);

      const entries = await this.getTimeEntriesByUser(userId, weekStart, weekEnd);

      // Calculate totals
      const totalHours = entries.reduce((sum, e) => sum + e.hours + (e.minutes / 60), 0);
      const billableHours = entries.filter(e => e.billable).reduce((sum, e) => sum + e.hours + (e.minutes / 60), 0);

      // Update week status
      const weekId = `${userId}_${year}_${weekNumber}`;
      const docRef = doc(db, 'timesheetWeeks', weekId);

      const weekData = {
        userId,
        year,
        weekNumber,
        totalHours,
        billableHours,
        status: 'submitted' as TimesheetWeekStatus,
        submittedAt: serverTimestamp(),
      };

      await updateDoc(docRef, weekData).catch(async () => {
        // If document doesn't exist, create it
        await addDoc(collection(db, 'timesheetWeeks'), {
          ...weekData,
          createdAt: serverTimestamp(),
        });
      });

      // Update all entries status
      const batch = writeBatch(db);
      entries.forEach((entry) => {
        const entryRef = doc(db, 'timeEntries', entry.id);
        batch.update(entryRef, { status: 'submitted', updatedAt: serverTimestamp() });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error submitting timesheet:', error);
      throw error;
    }
  },

  // Approve timesheet (admin only)
  async approveTimesheet(
    userId: string,
    year: number,
    weekNumber: number,
    approvedBy: string
  ): Promise<void> {
    try {
      const weekId = `${userId}_${year}_${weekNumber}`;
      const docRef = doc(db, 'timesheetWeeks', weekId);

      await updateDoc(docRef, {
        status: 'approved' as TimesheetWeekStatus,
        approvedBy,
        approvedAt: serverTimestamp(),
      });

      // Update all entries for this week
      const weekStart = getWeekStart(new Date(year, 0, 1 + (weekNumber - 1) * 7));
      const weekEnd = getWeekEnd(weekStart);
      const entries = await this.getTimeEntriesByUser(userId, weekStart, weekEnd);

      const batch = writeBatch(db);
      entries.forEach((entry) => {
        const entryRef = doc(db, 'timeEntries', entry.id);
        batch.update(entryRef, {
          status: 'approved' as TimeEntryStatus,
          approvedBy,
          updatedAt: serverTimestamp()
        });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error approving timesheet:', error);
      throw error;
    }
  },

  // Reject timesheet (admin only)
  async rejectTimesheet(
    userId: string,
    year: number,
    weekNumber: number,
    rejectedBy: string,
    reason: string
  ): Promise<void> {
    try {
      const weekId = `${userId}_${year}_${weekNumber}`;
      const docRef = doc(db, 'timesheetWeeks', weekId);

      await updateDoc(docRef, {
        status: 'rejected' as TimesheetWeekStatus,
        rejectedBy,
        rejectionReason: reason,
        rejectedAt: serverTimestamp(),
      });

      // Update all entries for this week
      const weekStart = getWeekStart(new Date(year, 0, 1 + (weekNumber - 1) * 7));
      const weekEnd = getWeekEnd(weekStart);
      const entries = await this.getTimeEntriesByUser(userId, weekStart, weekEnd);

      const batch = writeBatch(db);
      entries.forEach((entry) => {
        const entryRef = doc(db, 'timeEntries', entry.id);
        batch.update(entryRef, {
          status: 'rejected' as TimeEntryStatus,
          updatedAt: serverTimestamp()
        });
      });
      await batch.commit();
    } catch (error) {
      console.error('Error rejecting timesheet:', error);
      throw error;
    }
  },

  // Get pending timesheets for approval (admin)
  async getPendingTimesheets(): Promise<TimesheetWeek[]> {
    try {
      const q = query(
        collection(db, 'timesheetWeeks'),
        where('status', '==', 'submitted'),
        orderBy('submittedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        submittedAt: doc.data().submittedAt ? convertTimestamp(doc.data().submittedAt) : undefined,
      })) as TimesheetWeek[];
    } catch (error) {
      console.error('Error getting pending timesheets:', error);
      return [];
    }
  },

  // Subscribe to time entries for a user
  subscribeToUserTimeEntries(
    userId: string,
    year: number,
    weekNumber: number,
    callback: (entries: TimeEntry[]) => void
  ): () => void {
    const weekStart = getWeekStart(new Date(year, 0, 1 + (weekNumber - 1) * 7));
    const weekEnd = getWeekEnd(weekStart);

    const q = query(
      collection(db, 'timeEntries'),
      where('userId', '==', userId),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: convertTimestamp(doc.data().date),
          createdAt: convertTimestamp(doc.data().createdAt),
          updatedAt: convertTimestamp(doc.data().updatedAt),
        }))
        .filter((entry: any) => {
          const entryDate = entry.date;
          return entryDate >= weekStart && entryDate <= weekEnd;
        }) as TimeEntry[];

      callback(entries);
    });

    return unsubscribe;
  },

  // Get user's timesheet summary for a date range
  async getTimesheetSummary(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalHours: number;
    billableHours: number;
    byProject: Record<string, number>;
    byStatus: Record<TimeEntryStatus, number>;
  }> {
    try {
      const entries = await this.getTimeEntriesByUser(userId, startDate, endDate);

      const summary = {
        totalHours: 0,
        billableHours: 0,
        byProject: {} as Record<string, number>,
        byStatus: {
          draft: 0,
          submitted: 0,
          approved: 0,
          rejected: 0,
          invoiced: 0,
        } as Record<TimeEntryStatus, number>,
      };

      entries.forEach((entry) => {
        const hours = entry.hours + (entry.minutes / 60);
        summary.totalHours += hours;

        if (entry.billable) {
          summary.billableHours += hours;
        }

        if (!summary.byProject[entry.projectId]) {
          summary.byProject[entry.projectId] = 0;
        }
        summary.byProject[entry.projectId] += hours;

        summary.byStatus[entry.status] += hours;
      });

      return summary;
    } catch (error) {
      console.error('Error getting timesheet summary:', error);
      return {
        totalHours: 0,
        billableHours: 0,
        byProject: {},
        byStatus: { draft: 0, submitted: 0, approved: 0, rejected: 0, invoiced: 0 },
      };
    }
  },

  // Helper functions
  getWeekNumber,
  getWeekStart,
  getWeekEnd,
};
