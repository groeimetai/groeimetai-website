'use client';

import { useState, useEffect } from 'react';
import { format, addDays, setHours, setMinutes, startOfDay, isBefore, isAfter, isSameDay, addMinutes } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { CustomRadioGroup, CustomRadioGroupItem } from '@/components/ui/custom-radio';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { Calendar as CalendarIcon, Clock, Loader2, Check, Video, Phone, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';

interface MeetingSchedulerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function MeetingSchedulerModal({ open, onOpenChange }: MeetingSchedulerModalProps) {
  const t = useTranslations('meetingScheduler');
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [meetingType, setMeetingType] = useState<'video' | 'phone' | 'in-person'>('video');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    topic: '',
    description: '',
  });

  // Generate time slots for the selected date
  useEffect(() => {
    if (selectedDate) {
      const slots: TimeSlot[] = [];
      const startHour = 9; // 9 AM
      const endHour = 17; // 5 PM
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotTime = format(setMinutes(setHours(selectedDate, hour), minute), 'HH:mm');
          // For now, all slots are available. In production, check against existing meetings
          slots.push({
            time: slotTime,
            available: true,
          });
        }
      }
      
      setTimeSlots(slots);
    }
  }, [selectedDate]);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user && open) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || '',
        email: user.email || '',
      }));
      
      // Fetch additional user data
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFormData(prev => ({
              ...prev,
              company: userData.company || '',
              phone: userData.phoneNumber || '',
            }));
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      
      fetchUserData();
    }
  }, [user, open]);

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) return;
    
    setLoading(true);
    try {
      const meetingDateTime = setMinutes(
        setHours(selectedDate, parseInt(selectedTime.split(':')[0])),
        parseInt(selectedTime.split(':')[1])
      );
      
      // Create meeting request
      const meetingData = {
        userId: user?.uid || null,
        type: 'consultation',
        status: 'pending',
        title: formData.topic || 'Meeting Request',
        description: formData.description,
        startTime: meetingDateTime,
        endTime: addMinutes(meetingDateTime, 30),
        duration: 30,
        location: {
          type: meetingType === 'in-person' ? 'physical' : 'virtual',
          platform: meetingType === 'video' ? 'video' : meetingType === 'phone' ? 'phone' : undefined,
          address: meetingType === 'in-person' ? 'Apeldoorn, Nederland' : undefined,
        },
        participantIds: [user?.uid || 'guest'],
        participants: [
          {
            userId: user?.uid || 'guest',
            name: formData.name,
            email: formData.email,
            role: 'required',
          },
        ],
        requestedBy: {
          name: formData.name,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user?.uid || 'guest',
      };
      
      const meetingRef = await addDoc(collection(db, 'meetings'), meetingData);
      
      // Create notification for admin
      await addDoc(collection(db, 'notifications'), {
        userId: 'admin', // This should be the actual admin user ID
        type: 'meeting_request',
        title: 'New Meeting Request',
        message: `${formData.name} has requested a meeting on ${format(meetingDateTime, 'PPP')} at ${format(meetingDateTime, 'p')}`,
        data: {
          meetingId: meetingRef.id,
          requesterName: formData.name,
          requesterEmail: formData.email,
          meetingDate: meetingDateTime,
        },
        read: false,
        createdAt: serverTimestamp(),
      });
      
      toast.success(t('success'));
      onOpenChange(false);
      
      // Reset form
      setStep(1);
      setSelectedDate(undefined);
      setSelectedTime('');
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        topic: '',
        description: '',
      });
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    // Disable past dates and weekends
    const today = startOfDay(new Date());
    const day = date.getDay();
    return isBefore(date, today) || day === 0 || day === 6;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="mt-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`flex items-center ${stepNum < 3 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step >= stepNum
                      ? 'bg-orange text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > stepNum ? <Check className="w-5 h-5" /> : stepNum}
                </div>
                {stepNum < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > stepNum ? 'bg-orange' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Contact Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">{t('steps.contact.title')}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{t('fields.name')} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">{t('fields.email')} *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">{t('fields.company')}</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">{t('fields.phone')}</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="topic">{t('fields.topic')} *</Label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder={t('fields.topicPlaceholder')}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">{t('fields.description')}</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('fields.descriptionPlaceholder')}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!formData.name || !formData.email || !formData.topic}
                >
                  {t('next')}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time Selection */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">{t('steps.datetime.title')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="mb-2 block">{t('fields.selectDate')}</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={isDateDisabled}
                    className="rounded-md border"
                  />
                </div>
                
                <div>
                  <Label className="mb-2 block">{t('fields.selectTime')}</Label>
                  <div className="h-[300px] overflow-y-auto border rounded-md p-2">
                    {selectedDate ? (
                      <div className="space-y-1">
                        {timeSlots.map((slot) => (
                          <Button
                            key={slot.time}
                            variant={selectedTime === slot.time ? 'default' : 'outline'}
                            className={`w-full justify-start ${
                              !slot.available ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={!slot.available}
                            onClick={() => setSelectedTime(slot.time)}
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        {t('selectDateFirst')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Label className="mb-2 block">{t('fields.meetingType')}</Label>
                <CustomRadioGroup
                  value={meetingType}
                  onValueChange={(value: any) => setMeetingType(value)}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <CustomRadioGroupItem value="video" id="video" />
                    <Label htmlFor="video" className="flex items-center cursor-pointer">
                      <Video className="w-4 h-4 mr-2" />
                      {t('meetingTypes.video')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <CustomRadioGroupItem value="phone" id="phone-type" />
                    <Label htmlFor="phone-type" className="flex items-center cursor-pointer">
                      <Phone className="w-4 h-4 mr-2" />
                      {t('meetingTypes.phone')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-3">
                    <CustomRadioGroupItem value="in-person" id="in-person" />
                    <Label htmlFor="in-person" className="flex items-center cursor-pointer">
                      <MapPin className="w-4 h-4 mr-2" />
                      {t('meetingTypes.inPerson')}
                    </Label>
                  </div>
                </CustomRadioGroup>
              </div>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  {t('back')}
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!selectedDate || !selectedTime}
                >
                  {t('next')}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && selectedDate && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">{t('steps.confirm.title')}</h3>
              
              <Alert>
                <AlertDescription>
                  <div className="space-y-2">
                    <p><strong>{t('fields.name')}:</strong> {formData.name}</p>
                    <p><strong>{t('fields.email')}:</strong> {formData.email}</p>
                    {formData.company && <p><strong>{t('fields.company')}:</strong> {formData.company}</p>}
                    <p><strong>{t('fields.topic')}:</strong> {formData.topic}</p>
                    <p><strong>{t('fields.date')}:</strong> {format(selectedDate, 'PPP')}</p>
                    <p><strong>{t('fields.time')}:</strong> {selectedTime}</p>
                    <p><strong>{t('fields.meetingType')}:</strong> {t(`meetingTypes.${meetingType}`)}</p>
                  </div>
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  {t('back')}
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('scheduling')}
                    </>
                  ) : (
                    t('confirmSchedule')
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}