'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Calendar, Clock, Video, Phone, Building, Plus, X, Send,
  Users, MapPin, FileText, Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  conversationType: string;
}

interface AgendaItem {
  time: string;
  title: string;
  description: string;
  duration: number;
}

interface MeetingSchedulerProps {
  contact: ContactSubmission;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MeetingScheduler({ contact, isOpen, onClose, onSuccess }: MeetingSchedulerProps) {
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    time: '',
    duration: 60,
    type: 'google_meet' as 'google_meet' | 'zoom' | 'teams' | 'phone' | 'in_person',
    location: '',
    notes: '',
    attendees: [contact.email]
  });

  const [agenda, setAgenda] = useState<AgendaItem[]>([
    { time: '00:00', title: 'Introductie & Kennismaking', description: 'Korte introductie en verwachtingen afstemmen', duration: 10 },
    { time: '00:10', title: 'Huidige Situatie', description: 'Bespreken huidige AI/automation status', duration: 15 },
    { time: '00:25', title: 'AI Mogelijkheden', description: 'Concrete AI oplossingen voor jouw bedrijf', duration: 20 },
    { time: '00:45', title: 'Volgende Stappen', description: 'Planning en vervolgacties', duration: 15 }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const meetingTypes = [
    { value: 'google_meet', label: 'Google Meet', icon: Video, description: 'Online video call' },
    { value: 'zoom', label: 'Zoom', icon: Video, description: 'Online video call' },
    { value: 'teams', label: 'Microsoft Teams', icon: Video, description: 'Online video call' },
    { value: 'phone', label: 'Telefoon', icon: Phone, description: 'Telefonisch gesprek' },
    { value: 'in_person', label: 'Kantoor', icon: Building, description: 'Face-to-face meeting' }
  ];

  const addAgendaItem = () => {
    const lastItem = agenda[agenda.length - 1];
    const lastTime = lastItem ? lastItem.time : '00:00';
    const [hours, minutes] = lastTime.split(':').map(Number);
    const nextMinutes = minutes + (lastItem?.duration || 0);
    const nextTime = `${String(hours + Math.floor(nextMinutes / 60)).padStart(2, '0')}:${String(nextMinutes % 60).padStart(2, '0')}`;

    setAgenda([...agenda, {
      time: nextTime,
      title: '',
      description: '',
      duration: 10
    }]);
  };

  const removeAgendaItem = (index: number) => {
    setAgenda(agenda.filter((_, i) => i !== index));
  };

  const updateAgendaItem = (index: number, field: keyof AgendaItem, value: string | number) => {
    const newAgenda = [...agenda];
    newAgenda[index] = { ...newAgenda[index], [field]: value };
    setAgenda(newAgenda);
  };

  const handleSubmit = async () => {
    if (!scheduleForm.date || !scheduleForm.time) {
      toast.error('Datum en tijd zijn verplicht');
      return;
    }

    setIsSubmitting(true);

    try {
      // Auto-generate meeting link for video calls
      let meetingLocation = scheduleForm.location;
      if (scheduleForm.type === 'google_meet' && !meetingLocation) {
        meetingLocation = 'Google Meet (link wordt automatisch gegenereerd)';
      } else if (scheduleForm.type === 'in_person' && !meetingLocation) {
        meetingLocation = 'GroeimetAI Kantoor, Apeldoorn';
      }

      const response = await fetch('/api/admin/schedule-meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId: contact.id,
          date: scheduleForm.date,
          time: scheduleForm.time,
          duration: scheduleForm.duration,
          location: meetingLocation,
          type: scheduleForm.type,
          agenda: agenda,
          notes: scheduleForm.notes,
          attendees: scheduleForm.attendees
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Meeting ingepland en uitnodiging verzonden!');
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Fout bij plannen meeting');
      }
    } catch (error) {
      toast.error('Fout bij het plannen van meeting');
      console.error('Meeting scheduling error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedMeetingType = meetingTypes.find(type => type.value === scheduleForm.type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-white/20 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange" />
            Plan Meeting met {contact.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Left: Basic Details */}
          <div className="space-y-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-sm">Meeting Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/80">Datum</Label>
                    <Input
                      type="date"
                      value={scheduleForm.date}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white/80">Tijd</Label>
                    <Input
                      type="time"
                      value={scheduleForm.time}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-white/80">Duur (minuten)</Label>
                  <select
                    value={scheduleForm.duration}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, duration: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/20 text-white rounded-md px-3 py-2"
                  >
                    <option value={30}>30 minuten</option>
                    <option value={45}>45 minuten</option>
                    <option value={60}>60 minuten</option>
                    <option value={90}>90 minuten</option>
                  </select>
                </div>

                <div>
                  <Label className="text-white/80">Meeting Type</Label>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {meetingTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <div
                          key={type.value}
                          onClick={() => setScheduleForm({ ...scheduleForm, type: type.value })}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            scheduleForm.type === type.value
                              ? 'border-orange bg-orange/10'
                              : 'border-white/20 bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={`h-4 w-4 ${scheduleForm.type === type.value ? 'text-orange' : 'text-white'}`} />
                            <div>
                              <p className="text-white font-medium text-sm">{type.label}</p>
                              <p className="text-white/60 text-xs">{type.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {(scheduleForm.type === 'in_person' || scheduleForm.type === 'zoom') && (
                  <div>
                    <Label className="text-white/80">
                      {scheduleForm.type === 'in_person' ? 'Locatie' : 'Meeting Link'}
                    </Label>
                    <Input
                      value={scheduleForm.location}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                      placeholder={scheduleForm.type === 'in_person' ? 'GroeimetAI Kantoor, Apeldoorn' : 'https://zoom.us/j/...'}
                      className="bg-white/5 border-white/20 text-white"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-sm">Notities & Voorbereiding</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                  placeholder="Voorbereiding, context, speciale aandachtspunten..."
                  className="bg-white/5 border-white/20 text-white min-h-[120px]"
                  rows={5}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right: Agenda Builder */}
          <div className="space-y-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Meeting Agenda ({agenda.reduce((total, item) => total + item.duration, 0)} min)
                  </CardTitle>
                  <Button
                    onClick={addAgendaItem}
                    size="sm"
                    className="bg-orange text-white"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
                {agenda.map((item, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange/20 text-orange border-orange/30">
                          {item.time}
                        </Badge>
                        <Badge variant="outline" className="border-white/20 text-white/60">
                          {item.duration}min
                        </Badge>
                      </div>
                      <Button
                        onClick={() => removeAgendaItem(index)}
                        size="sm"
                        variant="ghost"
                        className="text-white/60 hover:text-white h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Input
                        value={item.title}
                        onChange={(e) => updateAgendaItem(index, 'title', e.target.value)}
                        placeholder="Agenda punt titel..."
                        className="bg-white/5 border-white/20 text-white text-sm"
                      />
                      <Textarea
                        value={item.description}
                        onChange={(e) => updateAgendaItem(index, 'description', e.target.value)}
                        placeholder="Beschrijving en doelen..."
                        className="bg-white/5 border-white/20 text-white text-sm"
                        rows={2}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="time"
                          value={item.time}
                          onChange={(e) => updateAgendaItem(index, 'time', e.target.value)}
                          className="bg-white/5 border-white/20 text-white text-sm"
                        />
                        <select
                          value={item.duration}
                          onChange={(e) => updateAgendaItem(index, 'duration', Number(e.target.value))}
                          className="bg-white/5 border border-white/20 text-white rounded-md px-2 py-1 text-sm"
                        >
                          <option value={5}>5 min</option>
                          <option value={10}>10 min</option>
                          <option value={15}>15 min</option>
                          <option value={20}>20 min</option>
                          <option value={30}>30 min</option>
                          <option value={45}>45 min</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Agenda Templates */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-sm">Quick Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => setAgenda([
                    { time: '00:00', title: 'Verkennend Gesprek', description: 'Ontdek AI mogelijkheden', duration: 15 },
                    { time: '00:15', title: 'Bedrijf Analyse', description: 'Huidige processen en uitdagingen', duration: 20 },
                    { time: '00:35', title: 'AI Oplossingen', description: 'Concrete AI implementaties', duration: 20 },
                    { time: '00:55', title: 'Volgende Stappen', description: 'Planning en offerte', duration: 5 }
                  ])}
                  variant="outline"
                  size="sm"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  🔍 Verkennend Gesprek
                </Button>
                
                <Button
                  onClick={() => setAgenda([
                    { time: '00:00', title: 'Assessment Review', description: 'Bespreken assessment resultaten', duration: 20 },
                    { time: '00:20', title: 'Aanbevelingen', description: 'Concrete implementatie stappen', duration: 25 },
                    { time: '00:45', title: 'Project Planning', description: 'Roadmap en tijdlijnen', duration: 15 }
                  ])}
                  variant="outline"
                  size="sm"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  🎯 Assessment Debrief
                </Button>
                
                <Button
                  onClick={() => setAgenda([
                    { time: '00:00', title: 'Project Kickoff', description: 'Project doelen en scope', duration: 15 },
                    { time: '00:15', title: 'Team Introductie', description: 'Rollen en verantwoordelijkheden', duration: 15 },
                    { time: '00:30', title: 'Werkwijze', description: 'Methodiek en communicatie', duration: 15 },
                    { time: '00:45', title: 'Planning', description: 'Eerste milestone en deadlines', duration: 15 }
                  ])}
                  variant="outline"
                  size="sm"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  🚀 Project Kickoff
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/20 text-white"
          >
            Annuleren
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-orange text-white"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Plannen...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Plan Meeting & Verstuur Uitnodiging
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}