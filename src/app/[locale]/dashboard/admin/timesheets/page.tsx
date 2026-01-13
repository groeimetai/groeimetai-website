'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import {
  Clock,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp,
  Calendar,
  Loader2,
  FileSpreadsheet,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TimesheetApprovalCard } from '@/components/timesheets';
import { timesheetService } from '@/services/timesheetService';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import type { TimesheetWeek, TimeEntry } from '@/types';

interface UserInfo {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

export default function AdminTimesheetsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pendingTimesheets, setPendingTimesheets] = useState<TimesheetWeek[]>([]);
  const [allTimesheets, setAllTimesheets] = useState<TimesheetWeek[]>([]);
  const [users, setUsers] = useState<Record<string, UserInfo>>({});
  const [entries, setEntries] = useState<Record<string, TimeEntry[]>>({});
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', 'in', ['admin', 'consultant']));
        const snapshot = await getDocs(q);
        const usersMap: Record<string, UserInfo> = {};
        snapshot.docs.forEach((doc) => {
          usersMap[doc.id] = {
            id: doc.id,
            displayName: doc.data().displayName || doc.data().email || 'Unknown',
            email: doc.data().email,
            photoURL: doc.data().photoURL,
          };
        });
        setUsers(usersMap);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    loadUsers();
  }, []);

  // Subscribe to timesheets
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const q = query(
      collection(db, 'timesheetWeeks'),
      orderBy('year', 'desc'),
      orderBy('weekNumber', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const timesheets: TimesheetWeek[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId || '',
          weekNumber: data.weekNumber || 0,
          year: data.year || 0,
          startDate: data.startDate?.toDate?.() || new Date(),
          endDate: data.endDate?.toDate?.() || new Date(),
          totalHours: data.totalHours || 0,
          billableHours: data.billableHours || 0,
          status: data.status || 'draft',
          entries: data.entries || [],
          submittedAt: data.submittedAt?.toDate?.() || data.submittedAt,
          approvedAt: data.approvedAt?.toDate?.() || data.approvedAt,
          approvedBy: data.approvedBy,
          rejectedAt: data.rejectedAt?.toDate?.() || data.rejectedAt,
          rejectedBy: data.rejectedBy,
          rejectionReason: data.rejectionReason,
        };
      });

      setAllTimesheets(timesheets);
      setPendingTimesheets(timesheets.filter((t) => t.status === 'submitted'));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Handlers
  const handleApprove = async (timesheet: TimesheetWeek) => {
    if (!user) return;
    await timesheetService.approveTimesheet(
      timesheet.userId,
      timesheet.year,
      timesheet.weekNumber,
      user.uid
    );
  };

  const handleReject = async (timesheet: TimesheetWeek, reason: string) => {
    if (!user) return;
    await timesheetService.rejectTimesheet(
      timesheet.userId,
      timesheet.year,
      timesheet.weekNumber,
      user.uid,
      reason
    );
  };

  // Filter timesheets
  const filteredTimesheets = allTimesheets.filter((t) => {
    if (selectedUser !== 'all' && t.userId !== selectedUser) return false;
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    return true;
  });

  // Statistics
  const stats = {
    pending: pendingTimesheets.length,
    approved: allTimesheets.filter((t) => t.status === 'approved').length,
    rejected: allTimesheets.filter((t) => t.status === 'rejected').length,
    totalHours: allTimesheets
      .filter((t) => t.status === 'approved')
      .reduce((sum, t) => sum + t.totalHours, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#080D14' }}>
      <div className="container mx-auto px-4 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Urenregistratie</h1>
              <p className="text-white/60 mt-1">Beheer en keur urenstaten goed</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/[0.02] border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Ter goedkeuring</p>
                    <p className="text-2xl font-bold text-orange">{stats.pending}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-orange/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.02] border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Goedgekeurd</p>
                    <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.02] border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Afgekeurd</p>
                    <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.02] border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Goedgekeurde uren</p>
                    <p className="text-2xl font-bold text-white">{stats.totalHours.toFixed(0)}u</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="bg-white/5 mb-6">
              <TabsTrigger value="pending" className="relative">
                Ter goedkeuring
                {stats.pending > 0 && (
                  <Badge className="ml-2 bg-orange text-white">{stats.pending}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="all">Alle urenstaten</TabsTrigger>
            </TabsList>

            {/* Pending Tab */}
            <TabsContent value="pending">
              {pendingTimesheets.length === 0 ? (
                <Card className="bg-white/[0.02] border-white/10">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileSpreadsheet className="w-12 h-12 text-white/20 mb-4" />
                    <p className="text-white/60 text-lg">Geen urenstaten ter goedkeuring</p>
                    <p className="text-white/40 text-sm mt-1">
                      Wanneer medewerkers hun uren indienen verschijnen ze hier
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingTimesheets.map((timesheet) => (
                    <TimesheetApprovalCard
                      key={timesheet.id}
                      timesheet={timesheet}
                      userName={users[timesheet.userId]?.displayName || 'Unknown'}
                      userAvatar={users[timesheet.userId]?.photoURL}
                      entries={entries[timesheet.userId] || []}
                      onApprove={() => handleApprove(timesheet)}
                      onReject={(reason) => handleReject(timesheet, reason)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* All Timesheets Tab */}
            <TabsContent value="all">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                    <Users className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Alle medewerkers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle medewerkers</SelectItem>
                    {Object.values(users).map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Alle statussen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle statussen</SelectItem>
                    <SelectItem value="draft">Concept</SelectItem>
                    <SelectItem value="submitted">Ingediend</SelectItem>
                    <SelectItem value="approved">Goedgekeurd</SelectItem>
                    <SelectItem value="rejected">Afgekeurd</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Timesheets Table */}
              <Card className="bg-white/[0.02] border-white/10">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-4 text-white/60 font-medium">Medewerker</th>
                        <th className="text-left p-4 text-white/60 font-medium">Week</th>
                        <th className="text-left p-4 text-white/60 font-medium">Uren</th>
                        <th className="text-left p-4 text-white/60 font-medium">Factureerbaar</th>
                        <th className="text-left p-4 text-white/60 font-medium">Status</th>
                        <th className="text-left p-4 text-white/60 font-medium">Ingediend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTimesheets.map((timesheet) => (
                        <tr key={timesheet.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="p-4">
                            <span className="text-white">
                              {users[timesheet.userId]?.displayName || 'Unknown'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-white/80">
                              Week {timesheet.weekNumber}, {timesheet.year}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-white font-medium">
                              {timesheet.totalHours.toFixed(1)}u
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-green-400">
                              {timesheet.billableHours.toFixed(1)}u
                            </span>
                          </td>
                          <td className="p-4">
                            <Badge
                              className={
                                timesheet.status === 'approved'
                                  ? 'bg-green-500'
                                  : timesheet.status === 'rejected'
                                  ? 'bg-red-500'
                                  : timesheet.status === 'submitted'
                                  ? 'bg-blue-500'
                                  : 'bg-gray-500'
                              }
                            >
                              {timesheet.status === 'approved'
                                ? 'Goedgekeurd'
                                : timesheet.status === 'rejected'
                                ? 'Afgekeurd'
                                : timesheet.status === 'submitted'
                                ? 'Ingediend'
                                : 'Concept'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <span className="text-white/60 text-sm">
                              {timesheet.submittedAt
                                ? format(new Date(timesheet.submittedAt), 'dd MMM yyyy', { locale: nl })
                                : '-'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filteredTimesheets.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-white/40">
                            Geen urenstaten gevonden
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
