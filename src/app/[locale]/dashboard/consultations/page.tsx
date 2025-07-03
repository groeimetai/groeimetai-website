'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  ChevronLeft,
  Plus,
  User,
  CalendarDays,
  CheckCircle,
  AlertCircle,
  Coffee,
  Loader2,
  Edit2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';
import { db, serverTimestamp } from '@/lib/firebase/config';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
  getDocs,
} from 'firebase/firestore';
import { format, parseISO, isFuture, isPast, isToday, addMinutes } from 'date-fns';
import { toast } from 'react-hot-toast';
import { MeetingType, MeetingStatus, MeetingPlatform } from '@/types';

interface FirestoreMeeting {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  type: MeetingType;
  status: MeetingStatus;
  startTime: Timestamp;
  endTime: Timestamp;
  duration: number;
  location: {
    type: 'physical' | 'virtual';
    platform?: MeetingPlatform;
    link?: string;
    address?: string;
  };
  participantIds: string[];
  participants: Array<{
    userId: string;
    name: string;
    email: string;
    role: 'organizer' | 'required' | 'optional';
  }>;
  projectId?: string;
  projectName?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  meetingLink?: string;
  notes?: string;
}

export default function ConsultationsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [meetings, setMeetings] = useState<FirestoreMeeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rescheduleMode, setRescheduleMode] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'consultation' as MeetingType,
    date: '',
    time: '',
    duration: '60',
    platform: 'video' as MeetingPlatform,
    meetingLink: '',
    address: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch meetings from Firestore
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (!user) return;

    const meetingsRef = collection(db, 'meetings');
    const q = query(
      meetingsRef,
      where('participantIds', 'array-contains', user.uid),
      orderBy('startTime', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const meetingsData: FirestoreMeeting[] = [];
        snapshot.forEach((doc) => {
          meetingsData.push({
            id: doc.id,
            ...doc.data(),
          } as FirestoreMeeting);
        });
        setMeetings(meetingsData);
        setLoadingMeetings(false);
      },
      (error) => {
        console.error('Error fetching meetings:', error);
        toast.error('Failed to load meetings');
        setLoadingMeetings(false);
      }
    );

    return () => unsubscribe();
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange mx-auto" />
          <p className="mt-4 text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  // Filter meetings
  const now = new Date();
  const upcomingMeetings = meetings.filter((m) => {
    const startTime = m.startTime.toDate();
    return m.status === 'scheduled' && isFuture(startTime);
  });

  const pastMeetings = meetings.filter((m) => {
    const startTime = m.startTime.toDate();
    return m.status === 'completed' || (m.status === 'scheduled' && isPast(startTime));
  });

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.date) {
      errors.date = 'Date is required';
    } else {
      const selectedDate = parseISO(formData.date);
      if (isPast(selectedDate) && !isToday(selectedDate)) {
        errors.date = 'Please select a future date';
      }
    }

    if (!formData.time) {
      errors.time = 'Time is required';
    } else if (formData.date) {
      const selectedDateTime = parseISO(`${formData.date}T${formData.time}`);
      if (isPast(selectedDateTime)) {
        errors.time = 'Please select a future time';
      }
    }

    if (formData.platform === 'in_person' && !formData.address.trim()) {
      errors.address = 'Address is required for in-person meetings';
    }

    if (
      (formData.platform === 'zoom' ||
        formData.platform === 'teams' ||
        formData.platform === 'meet') &&
      !formData.meetingLink.trim()
    ) {
      errors.meetingLink = 'Meeting link is required for virtual meetings';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create meeting
  const handleCreateMeeting = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const startTime = parseISO(`${formData.date}T${formData.time}`);
      const endTime = addMinutes(startTime, parseInt(formData.duration));

      const meetingData: Omit<FirestoreMeeting, 'id'> = {
        userId: user.uid,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        status: 'scheduled',
        startTime: Timestamp.fromDate(startTime),
        endTime: Timestamp.fromDate(endTime),
        duration: parseInt(formData.duration),
        location: {
          type: formData.platform === 'in_person' ? 'physical' : 'virtual',
          platform: formData.platform,
          link: formData.meetingLink || undefined,
          address: formData.address || undefined,
        },
        participantIds: [user.uid],
        participants: [
          {
            userId: user.uid,
            name: user.displayName || user.email || 'Unknown',
            email: user.email || '',
            role: 'organizer',
          },
        ],
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
        createdBy: user.uid,
        meetingLink: formData.meetingLink || undefined,
      };

      await addDoc(collection(db, 'meetings'), meetingData);

      toast.success('Meeting scheduled successfully!');
      setShowScheduleForm(false);

      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'consultation',
        date: '',
        time: '',
        duration: '60',
        platform: 'video',
        meetingLink: '',
        address: '',
      });
      setFormErrors({});
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error('Failed to schedule meeting');
    } finally {
      setSubmitting(false);
    }
  };

  // Reschedule meeting
  const handleRescheduleMeeting = async (meetingId: string) => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const startTime = parseISO(`${formData.date}T${formData.time}`);
      const endTime = addMinutes(startTime, parseInt(formData.duration));

      await updateDoc(doc(db, 'meetings', meetingId), {
        startTime: Timestamp.fromDate(startTime),
        endTime: Timestamp.fromDate(endTime),
        status: 'rescheduled',
        updatedAt: serverTimestamp(),
      });

      toast.success('Meeting rescheduled successfully!');
      setRescheduleMode(null);
      setFormData({
        title: '',
        description: '',
        type: 'consultation',
        date: '',
        time: '',
        duration: '60',
        platform: 'video',
        meetingLink: '',
        address: '',
      });
      setFormErrors({});
    } catch (error) {
      console.error('Error rescheduling meeting:', error);
      toast.error('Failed to reschedule meeting');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: MeetingStatus) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      case 'rescheduled':
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getPlatformIcon = (platform?: MeetingPlatform) => {
    switch (platform) {
      case 'zoom':
      case 'teams':
      case 'meet':
        return <Video className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'in_person':
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  // Generate available time slots (only future times)
  const getAvailableTimeSlots = () => {
    const slots = [
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '14:00',
      '14:30',
      '15:00',
      '15:30',
      '16:00',
      '16:30',
      '17:00',
    ];

    if (!formData.date) return slots;

    const selectedDate = parseISO(formData.date);
    if (!isToday(selectedDate)) return slots;

    // Filter out past times for today
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    return slots.filter((slot) => {
      const [hours, minutes] = slot.split(':').map(Number);
      return hours > currentHours || (hours === currentHours && minutes > currentMinutes);
    });
  };

  // Start reschedule mode
  const startReschedule = (meeting: FirestoreMeeting) => {
    setRescheduleMode(meeting.id!);
    const startTime = meeting.startTime.toDate();
    setFormData({
      title: meeting.title,
      description: meeting.description || '',
      type: meeting.type,
      date: format(startTime, 'yyyy-MM-dd'),
      time: format(startTime, 'HH:mm'),
      duration: meeting.duration.toString(),
      platform: meeting.location.platform || 'video',
      meetingLink: meeting.meetingLink || '',
      address: meeting.location.address || '',
    });
    setShowScheduleForm(true);
  };

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-white/60 hover:text-white mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Consultations & Meetings</h1>
              <p className="text-white/60 mt-2">Schedule and manage your meetings with our team</p>
            </div>

            <Button
              className="bg-orange hover:bg-orange/90"
              onClick={() => setShowScheduleForm(!showScheduleForm)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
          </div>
        </div>

        {/* Schedule Form */}
        {showScheduleForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                {rescheduleMode ? 'Reschedule Meeting' : 'Schedule a New Meeting'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowScheduleForm(false);
                  setRescheduleMode(null);
                  setFormErrors({});
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="title" className="text-white">
                  Meeting Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Project Kickoff Meeting"
                  className={`mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/40 ${
                    formErrors.title ? 'border-red-500' : ''
                  }`}
                  disabled={!!rescheduleMode}
                />
                {formErrors.title && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.title}</p>
                )}
              </div>

              <div>
                <Label className="text-white">Meeting Type</Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, type: value as MeetingType }))
                  }
                  className="mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="consultation" id="consultation" />
                    <Label htmlFor="consultation" className="text-white/80 cursor-pointer">
                      Initial Consultation
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="project-update" id="project-update" />
                    <Label htmlFor="project-update" className="text-white/80 cursor-pointer">
                      Project Update
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="technical-review" id="technical-review" />
                    <Label htmlFor="technical-review" className="text-white/80 cursor-pointer">
                      Technical Review
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="training" id="training" />
                    <Label htmlFor="training" className="text-white/80 cursor-pointer">
                      Training Session
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-white">Meeting Platform</Label>
                <RadioGroup
                  value={formData.platform}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, platform: value as MeetingPlatform }))
                  }
                  className="mt-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="zoom" id="zoom" />
                    <Label htmlFor="zoom" className="text-white/80 cursor-pointer">
                      Zoom
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="teams" id="teams" />
                    <Label htmlFor="teams" className="text-white/80 cursor-pointer">
                      Microsoft Teams
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="meet" id="meet" />
                    <Label htmlFor="meet" className="text-white/80 cursor-pointer">
                      Google Meet
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone" id="phone" />
                    <Label htmlFor="phone" className="text-white/80 cursor-pointer">
                      Phone Call
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="in_person" id="in_person" />
                    <Label htmlFor="in_person" className="text-white/80 cursor-pointer">
                      In-Person
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="date" className="text-white">
                  Date *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, date: e.target.value }));
                    // Clear time if date changes to ensure valid time selection
                    if (e.target.value !== formData.date) {
                      setFormData((prev) => ({ ...prev, time: '' }));
                    }
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className={`mt-2 bg-white/5 border-white/20 text-white ${
                    formErrors.date ? 'border-red-500' : ''
                  }`}
                />
                {formErrors.date && <p className="text-red-400 text-sm mt-1">{formErrors.date}</p>}
              </div>

              <div>
                <Label className="text-white">Time *</Label>
                <select
                  value={formData.time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                  className={`mt-2 w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white ${
                    formErrors.time ? 'border-red-500' : 'border-white/20'
                  }`}
                  disabled={!formData.date}
                >
                  <option value="">Select a time</option>
                  {getAvailableTimeSlots().map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                {formErrors.time && <p className="text-red-400 text-sm mt-1">{formErrors.time}</p>}
                {!formData.date && (
                  <p className="text-white/40 text-sm mt-1">Please select a date first</p>
                )}
              </div>

              <div>
                <Label htmlFor="duration" className="text-white">
                  Duration (minutes)
                </Label>
                <select
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                  className="mt-2 w-full px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white"
                >
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>

              {(formData.platform === 'zoom' ||
                formData.platform === 'teams' ||
                formData.platform === 'meet') && (
                <div className="md:col-span-2">
                  <Label htmlFor="meetingLink" className="text-white">
                    Meeting Link *
                  </Label>
                  <Input
                    id="meetingLink"
                    value={formData.meetingLink}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, meetingLink: e.target.value }))
                    }
                    placeholder="https://zoom.us/j/..."
                    className={`mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/40 ${
                      formErrors.meetingLink ? 'border-red-500' : ''
                    }`}
                  />
                  {formErrors.meetingLink && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.meetingLink}</p>
                  )}
                </div>
              )}

              {formData.platform === 'in_person' && (
                <div className="md:col-span-2">
                  <Label htmlFor="address" className="text-white">
                    Meeting Address *
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Main St, Amsterdam"
                    className={`mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/40 ${
                      formErrors.address ? 'border-red-500' : ''
                    }`}
                  />
                  {formErrors.address && (
                    <p className="text-red-400 text-sm mt-1">{formErrors.address}</p>
                  )}
                </div>
              )}

              <div className="md:col-span-2">
                <Label htmlFor="description" className="text-white">
                  Meeting Agenda / Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Please describe what you'd like to discuss..."
                  className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  rows={4}
                  disabled={!!rescheduleMode}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowScheduleForm(false);
                  setRescheduleMode(null);
                  setFormErrors({});
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                className="bg-orange hover:bg-orange/90"
                onClick={() => {
                  if (rescheduleMode) {
                    handleRescheduleMeeting(rescheduleMode);
                  } else {
                    handleCreateMeeting();
                  }
                }}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {rescheduleMode ? 'Rescheduling...' : 'Scheduling...'}
                  </>
                ) : rescheduleMode ? (
                  'Reschedule Meeting'
                ) : (
                  'Schedule Meeting'
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Upcoming Meetings */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Upcoming Meetings</h2>

          {loadingMeetings ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange" />
            </div>
          ) : upcomingMeetings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingMeetings.map((meeting) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-white">{meeting.title}</h3>
                      {meeting.projectName && (
                        <p className="text-sm text-white/60 mt-1">{meeting.projectName}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-green-400 border-green-400/50">
                      {getStatusIcon(meeting.status)}
                      <span className="ml-1">{meeting.status}</span>
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-white/80">
                      <CalendarDays className="w-4 h-4 mr-2 text-white/60" />
                      {format(meeting.startTime.toDate(), 'EEEE, MMMM d, yyyy')}
                    </div>
                    <div className="flex items-center text-white/80">
                      <Clock className="w-4 h-4 mr-2 text-white/60" />
                      {format(meeting.startTime.toDate(), 'h:mm a')} ({meeting.duration} min)
                    </div>
                    <div className="flex items-center text-white/80">
                      {getPlatformIcon(meeting.location.platform)}
                      <span className="ml-2 capitalize">
                        {meeting.location.platform === 'in_person'
                          ? 'In-Person'
                          : meeting.location.platform}{' '}
                        Meeting
                      </span>
                    </div>
                    <div className="flex items-center text-white/80">
                      <User className="w-4 h-4 mr-2 text-white/60" />
                      {meeting.participants.map((p) => p.name).join(', ')}
                    </div>
                    {meeting.description && (
                      <p className="text-white/60 text-sm pt-2">{meeting.description}</p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => startReschedule(meeting)}
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Reschedule
                    </Button>
                    {meeting.meetingLink && (
                      <Button
                        size="sm"
                        className="flex-1 bg-orange hover:bg-orange/90"
                        onClick={() => window.open(meeting.meetingLink, '_blank')}
                      >
                        Join Meeting
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 rounded-lg border border-white/10 p-8 text-center"
            >
              <Calendar className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 mb-4">No upcoming meetings scheduled</p>
              <Button
                className="bg-orange hover:bg-orange/90"
                onClick={() => setShowScheduleForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Schedule Your First Meeting
              </Button>
            </motion.div>
          )}
        </div>

        {/* Past Meetings */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Past Meetings</h2>

          {loadingMeetings ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange" />
            </div>
          ) : pastMeetings.length > 0 ? (
            <div className="space-y-4">
              {pastMeetings.map((meeting) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/5 rounded-lg border border-white/10 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-white/10 rounded-lg">
                      {getPlatformIcon(meeting.location.platform)}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{meeting.title}</h4>
                      <p className="text-sm text-white/60">
                        {format(meeting.startTime.toDate(), 'MMM d, yyyy')} at{' '}
                        {format(meeting.startTime.toDate(), 'h:mm a')}
                      </p>
                      {meeting.status === 'completed' && (
                        <Badge
                          variant="outline"
                          className="text-green-400 border-green-400/50 mt-1"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {meeting.notes && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-orange hover:text-orange/80"
                      >
                        View Notes
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/60 hover:text-white"
                      onClick={() => {
                        // Create a new meeting based on this past meeting
                        setFormData({
                          title: `Follow-up: ${meeting.title}`,
                          description: '',
                          type: meeting.type,
                          date: '',
                          time: '',
                          duration: meeting.duration.toString(),
                          platform: meeting.location.platform || 'video',
                          meetingLink: '',
                          address: '',
                        });
                        setShowScheduleForm(true);
                      }}
                    >
                      Schedule Follow-up
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/5 rounded-lg border border-white/10 p-8 text-center"
            >
              <Coffee className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">No past meetings to display</p>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
