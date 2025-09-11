'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  Calendar, Clock, Video, Phone, Building, Plus, X, Send,
  Users, MapPin, FileText, Settings, Mail
} from 'lucide-react';
import { toast } from 'sonner';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  conversationType: string;
  message?: string;
  preferredDate?: string;
  preferredTime?: string;
  submittedAt?: any;
}

interface AgendaItem {
  time: string;
  title: string;
  description: string;
  duration: number;
}

interface MeetingScheduler2x2Props {
  contact: ContactSubmission;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MeetingScheduler2x2({ contact, isOpen, onClose, onSuccess }: MeetingScheduler2x2Props) {
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
  
  // Email composer state
  const [emailForm, setEmailForm] = useState({
    subject: '',
    content: '',
    useTemplate: true
  });

  const meetingTypes = [
    { value: 'google_meet', label: 'Google Meet', icon: Video, description: 'Online video call' },
    { value: 'zoom', label: 'Zoom', icon: Video, description: 'Online video call' },
    { value: 'teams', label: 'Microsoft Teams', icon: Video, description: 'Online video call' },
    { value: 'phone', label: 'Telefoon', icon: Phone, description: 'Telefonisch gesprek' },
    { value: 'in_person', label: 'Kantoor', icon: Building, description: 'Face-to-face meeting' }
  ];

  // Auto-generate agenda text for email
  const generateAgendaText = () => {
    return agenda.map(item => `${item.time} - ${item.title} (${item.duration}min)\n${item.description}`).join('\n\n');
  };

  // Auto-load email template with agenda
  useEffect(() => {
    const agendaText = generateAgendaText();
    
    let subject = '';
    let content = '';
    
    if (contact.conversationType === 'debrief') {
      subject = `🎯 Assessment Debrief Voorbereiding - ${contact.company}`;
      content = `Hoi ${contact.name},

Je Assessment Debrief is ingepland! Ik ga je resultaten grondig bespreken en concrete vervolgstappen presenteren.

📅 MEETING AGENDA:
${agendaText}

📊 WAT WE GAAN BESPREKEN:
• Je Agent Readiness score en wat dit betekent
• Specifieke aanbevelingen voor ${contact.company}
• Quick wins die je direct kunt implementeren
• Expert Assessment mogelijkheden (€2.500 - vol aftrekbaar)

🎯 BEREID JE VOOR:
• Heb je assessment resultaten bij de hand
• Denk na over budget en tijdlijnen
• Bereid vragen voor over de aanbevelingen
• Overweeg wie er bij ${contact.company} betrokken moet worden

Tot snel!
Niels van der Werf`;

    } else if (contact.conversationType === 'kickoff') {
      subject = `🚀 Project Kickoff Voorbereiding - ${contact.company}`;
      content = `Hoi ${contact.name},

Tijd voor de project kickoff! Ik ben super enthousiast om te starten met de AI implementatie bij ${contact.company}.

📅 KICKOFF AGENDA:
${agendaText}

📋 VOOR DE KICKOFF HEB IK NODIG:
• Finale project requirements
• Overzicht van betrokken team members
• IT infrastructuur details
• Gewenste go-live datum
• Budget approval bevestiging

👥 WIE MOETEN ERBIJ ZIJN:
• Project stakeholders
• IT contact persoon  
• End users (optioneel)
• Budget owner

Na deze kickoff hebben we een crystal clear project plan!

Niels van der Werf
GroeimetAI`;

    } else {
      subject = `📅 Ons gesprek + voorbereidingstips - ${contact.company}`;
      content = `Hoi ${contact.name},

Ons gesprek is bevestigd! Ik kijk ernaar uit om met ${contact.company} de AI mogelijkheden te verkennen.

📅 MEETING AGENDA:
${agendaText}

🎯 TER VOORBEREIDING:
• Denk na over je grootste AI uitdagingen bij ${contact.company}
• Bereid 2-3 concrete vragen voor
• Heb je huidige IT infrastructuur informatie bij de hand

📋 WAT WE GAAN BESPREKEN:
• Jouw specifieke AI use cases
• ROI potentie voor ${contact.company}  
• Implementatie roadmap en tijdlijnen
• Budget en resource planning

Tot snel!
Niels van der Werf`;
    }

    setEmailForm({
      subject,
      content,
      useTemplate: true
    });
  }, [contact, agenda, scheduleForm.date, scheduleForm.time]);

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
          location: scheduleForm.location || (scheduleForm.type === 'google_meet' ? 'Google Meet' : ''),
          type: scheduleForm.type,
          agenda: agenda,
          notes: scheduleForm.notes,
          attendees: scheduleForm.attendees
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Send follow-up email with agenda
        const emailResponse = await fetch('/api/admin/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: contact.email,
            subject: emailForm.subject,
            content: emailForm.content,
            contactId: contact.id
          }),
        });

        const emailData = await emailResponse.json();
        if (emailData.success) {
          toast.success('Meeting ingepland én voorbereidingsemail met agenda verzonden!');
        } else {
          toast.success('Meeting ingepland, maar voorbereidingsemail gefaald');
        }
        
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-white/20 max-w-[95vw] max-h-[95vh] overflow-y-auto flex flex-col">
        <DialogHeader className="border-b border-white/10 pb-4">
          <DialogTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-orange" />
              <div>
                <h2 className="text-xl font-bold">Meeting Planning</h2>
                <p className="text-white/60 text-sm font-normal">{contact.name} • {contact.company}</p>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-2 gap-4 p-4">
          
          {/* Top Left: Contact Context */}
          <Card className="bg-blue-500/10 border-blue-500/30 shadow-lg h-[500px] flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-blue-300 text-base flex items-center gap-2 font-semibold">
                <Users className="h-5 w-5" />
                Contact Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 overflow-y-auto">
              <div>
                <p className="text-blue-300 text-sm font-medium mb-2">Conversation Type</p>
                <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${
                  contact.conversationType === 'kickoff' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  contact.conversationType === 'debrief' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                  'bg-green-500/20 text-green-400 border border-green-500/30'
                }`}>
                  {contact.conversationType === 'verkennen' ? '💬 Verkennend Gesprek' :
                   contact.conversationType === 'debrief' ? '🎯 Assessment Debrief' :
                   contact.conversationType === 'kickoff' ? '🚀 Project Kickoff' :
                   '📞 Algemeen Contact'}
                </span>
              </div>
              
              {contact.message && (
                <div>
                  <p className="text-blue-300 text-sm font-medium mb-2">User's Message</p>
                  <div className="bg-white/5 rounded-lg p-3 border border-blue-500/20">
                    <p className="text-white/80 text-sm leading-relaxed">{contact.message}</p>
                  </div>
                </div>
              )}
              
              {(contact.preferredDate || contact.preferredTime) && (
                <div>
                  <p className="text-blue-300 text-sm font-medium mb-2">User's Preferences</p>
                  <div className="space-y-2">
                    {contact.preferredDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        <p className="text-white/80 text-sm">{new Date(contact.preferredDate).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                      </div>
                    )}
                    {contact.preferredTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-400" />
                        <p className="text-white/80 text-sm">{contact.preferredTime === 'morning' ? 'Ochtend (9:00-12:00)' : 'Middag (13:00-17:00)'}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-blue-300 text-sm font-medium mb-2">Contact Details</p>
                <div className="space-y-1">
                  <p className="text-white/70 text-sm">📧 {contact.email}</p>
                  {contact.phone && <p className="text-white/70 text-sm">📞 {contact.phone}</p>}
                  {contact.submittedAt && (
                    <p className="text-white/50 text-sm">📝 {contact.submittedAt.toDate?.()?.toLocaleDateString('nl-NL') || 'Recent'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Right: Meeting Details & Agenda */}
          <Card className="bg-orange-500/10 border-orange-500/30 shadow-lg h-[500px] flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-orange-300 text-base flex items-center gap-2 font-semibold">
                <Calendar className="h-5 w-5" />
                Meeting Details & Agenda
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 overflow-y-auto">
              {/* Basic Meeting Info */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-white/80 text-sm">Datum</Label>
                  <Input
                    type="date"
                    value={scheduleForm.date}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                    className="bg-white/5 border-white/20 text-white text-sm"
                  />
                </div>
                <div>
                  <Label className="text-white/80 text-sm">Tijd</Label>
                  <Input
                    type="time"
                    value={scheduleForm.time}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                    className="bg-white/5 border-white/20 text-white text-sm"
                  />
                </div>
                <div>
                  <Label className="text-white/80 text-sm">Duur</Label>
                  <select
                    value={scheduleForm.duration}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, duration: Number(e.target.value) })}
                    className="w-full bg-white/5 border border-white/20 text-white rounded-md px-2 py-1 text-sm"
                  >
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                    <option value={90}>90 min</option>
                  </select>
                </div>
              </div>

              {/* Meeting Type */}
              <div>
                <Label className="text-white/80 text-sm mb-2 block">Meeting Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {meetingTypes.slice(0, 4).map((type) => {
                    const Icon = type.icon;
                    return (
                      <div
                        key={type.value}
                        onClick={() => setScheduleForm({ ...scheduleForm, type: type.value })}
                        className={`p-2 rounded border cursor-pointer transition-colors text-sm ${
                          scheduleForm.type === type.value
                            ? 'border-orange bg-orange/20 text-orange'
                            : 'border-white/20 bg-white/5 hover:bg-white/10 text-white/80'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="font-medium">{type.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Agenda Templates */}
              <div>
                <Label className="text-white/80 text-sm mb-2 block">Quick Agenda Templates</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => setAgenda([
                      { time: '00:00', title: 'Introductie', description: 'Kennismaking en verwachtingen', duration: 10 },
                      { time: '00:10', title: 'AI Verkenning', description: 'Ontdek mogelijkheden', duration: 35 },
                      { time: '00:45', title: 'Vervolgstappen', description: 'Planning en offerte', duration: 15 }
                    ])}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10 text-xs"
                  >
                    🔍 Verkennend
                  </Button>
                  
                  <Button
                    onClick={() => setAgenda([
                      { time: '00:00', title: 'Assessment Review', description: 'Resultaten bespreken', duration: 20 },
                      { time: '00:20', title: 'Aanbevelingen', description: 'Concrete stappen', duration: 25 },
                      { time: '00:45', title: 'Expert Assessment', description: 'Upsell & planning', duration: 15 }
                    ])}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10 text-xs"
                  >
                    🎯 Debrief
                  </Button>
                  
                  <Button
                    onClick={() => setAgenda([
                      { time: '00:00', title: 'Project Scope', description: 'Deliverables vastleggen', duration: 15 },
                      { time: '00:15', title: 'Team & Rollen', description: 'Wie doet wat', duration: 15 },
                      { time: '00:30', title: 'Planning', description: 'Timeline en milestones', duration: 30 }
                    ])}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10 text-xs"
                  >
                    🚀 Kickoff
                  </Button>
                </div>
              </div>

              {/* Compact Agenda Builder */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-white/80 text-sm">Meeting Agenda ({agenda.reduce((total, item) => total + item.duration, 0)} min)</Label>
                  <Button onClick={addAgendaItem} size="sm" className="bg-orange text-white h-6 px-2">
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-2 max-h-[280px] overflow-y-auto">
                  {agenda.map((item, index) => (
                    <div key={index} className="bg-white/5 rounded p-2 border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1">
                          <Badge className="bg-orange/20 text-orange border-orange/30 text-xs px-1 py-0">
                            {item.time}
                          </Badge>
                          <Badge variant="outline" className="border-white/20 text-white/60 text-xs px-1 py-0">
                            {item.duration}min
                          </Badge>
                        </div>
                        <Button
                          onClick={() => removeAgendaItem(index)}
                          size="sm"
                          variant="ghost"
                          className="text-white/60 hover:text-white h-4 w-4 p-0"
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </div>
                      
                      <Input
                        value={item.title}
                        onChange={(e) => updateAgendaItem(index, 'title', e.target.value)}
                        placeholder="Agenda punt..."
                        className="bg-white/5 border-white/20 text-white text-xs mb-1 h-7"
                      />
                      <Input
                        value={item.description}
                        onChange={(e) => updateAgendaItem(index, 'description', e.target.value)}
                        placeholder="Beschrijving..."
                        className="bg-white/5 border-white/20 text-white text-xs h-7"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bottom Left: Email Composer */}
          <Card className="bg-green-500/10 border-green-500/30 shadow-lg h-[500px] flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-green-300 text-base flex items-center gap-2 font-semibold">
                <Mail className="h-5 w-5" />
                Email Composer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 overflow-y-auto">
              <div>
                <Label className="text-white/80 text-sm">Email Onderwerp</Label>
                <Input
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  className="bg-white/5 border-white/20 text-white text-sm mt-1"
                />
              </div>
              
              <div className="flex-1 flex flex-col">
                <Label className="text-white/80 text-sm mb-2">Email Content (met agenda)</Label>
                <Textarea
                  value={emailForm.content}
                  onChange={(e) => setEmailForm({ ...emailForm, content: e.target.value })}
                  className="bg-white/5 border-white/20 text-white text-sm flex-1 min-h-[350px] resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Bottom Right: Email Preview */}
          <Card className="bg-purple-500/10 border-purple-500/30 shadow-lg h-[500px] flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="text-purple-300 text-base flex items-center gap-2 font-semibold">
                <Mail className="h-5 w-5" />
                Live Email Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="bg-white/5 rounded-lg border border-white/10 p-4 h-full flex flex-col">
                <div className="flex flex-col h-full space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm border-b border-white/10 pb-3">
                    <div>
                      <p className="text-white/50 mb-1">To:</p>
                      <p className="text-white/80">{contact.email}</p>
                    </div>
                    <div>
                      <p className="text-white/50 mb-1">From:</p>
                      <p className="text-white/80">niels@groeimetai.io</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-white/50 text-sm mb-1">Subject:</p>
                    <p className="text-white/90 font-medium">{emailForm.subject}</p>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <p className="text-white/50 text-sm mb-2">Content:</p>
                    <div className="bg-black/30 rounded border border-white/10 p-3 flex-1 overflow-y-auto">
                      <div className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">
                        {emailForm.content}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          </div>
        </div>

        {/* Fixed Footer */}
        <div className="border-t border-white/10 bg-black/50 p-4">
          <div className="flex items-center justify-between">
            <div className="text-white/60 text-sm">
              <span className="font-medium">Summary:</span> {
                scheduleForm.date && scheduleForm.time 
                  ? `${new Date(scheduleForm.date).toLocaleDateString('nl-NL', { month: 'long', day: 'numeric' })} om ${scheduleForm.time} (${scheduleForm.duration}min)`
                  : 'Meeting datum/tijd niet ingesteld'
              } • Email template met agenda included
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Annuleren
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !scheduleForm.date || !scheduleForm.time}
                className="bg-gradient-to-r from-orange to-orange-600 text-white shadow-lg hover:shadow-xl transition-all"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Bezig met plannen...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Plan Meeting & Verstuur Emails
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}