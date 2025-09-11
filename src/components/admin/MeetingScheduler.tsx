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
  const [sendFollowUpEmail, setSendFollowUpEmail] = useState(true);
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState('');
  const [emailPreview, setEmailPreview] = useState('');
  
  // Email composer state
  const [emailForm, setEmailForm] = useState({
    subject: '',
    content: '',
    useTemplate: true
  });

  // Auto-select email template based on conversation type and load into form
  useEffect(() => {
    let templateId = '';
    if (contact.conversationType === 'debrief') {
      templateId = 'assessment_debrief_prep';
    } else if (contact.conversationType === 'kickoff') {
      templateId = 'project_kickoff_prep';
    } else {
      templateId = 'meeting_with_prep';
    }
    
    setSelectedEmailTemplate(templateId);
    
    // Load template content into email form
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setEmailForm({
        subject: template.subject,
        content: template.content,
        useTemplate: true
      });
    }
  }, [contact.conversationType]);

  // Email templates for different meeting contexts
  const emailTemplates = [
    {
      id: 'meeting_invite_only',
      name: 'Alleen Meeting Uitnodiging',
      subject: '📅 Meeting bevestiging',
      content: 'Meeting details worden automatisch verzonden via calendar uitnodiging.'
    },
    {
      id: 'meeting_with_prep',
      name: 'Meeting + Voorbereiding Info',
      subject: '📅 Ons gesprek + voorbereidingstips',
      content: `Hoi {{name}},

Ons gesprek is bevestigd voor {{meetingDate}} om {{meetingTime}}!

🎯 TER VOORBEREIDING:
• Denk na over je grootste AI uitdagingen bij {{company}}
• Bereid 2-3 concrete vragen voor
• Heb je huidige IT infrastructuur informatie bij de hand

📋 WAT WE GAAN BESPREKEN:
• Jouw specifieke AI use cases
• ROI potentie voor {{company}}  
• Implementatie roadmap en tijdlijnen
• Budget en resource planning

Tot {{meetingDate}}!

{{senderName}}`
    },
    {
      id: 'assessment_debrief_prep',
      name: 'Assessment Debrief + Preparation',
      subject: '🎯 Assessment Debrief Voorbereiding - {{company}}',
      content: `Hoi {{name}},

Je Assessment Debrief is ingepland! Ik ga je resultaten grondig bespreken en concrete vervolgstappen presenteren.

📊 WAT WE GAAN BESPREKEN:
• Je Agent Readiness score en wat dit betekent
• Specifieke aanbevelingen voor {{company}}
• Quick wins die je direct kunt implementeren
• Expert Assessment mogelijkheden (€2.500 - vol aftrekbaar)

🎯 BEREID JE VOOR:
• Heb je assessment resultaten bij de hand
• Denk na over budget en tijdlijnen
• Bereid vragen voor over de aanbevelingen
• Overweeg wie er bij {{company}} betrokken moet worden

📈 DOEL VAN DIT GESPREK:
Je hebt al de basis assessment gedaan - nu gaan we echt diep op jouw situatie. Het doel is een concrete implementatie roadmap maken die past bij {{company}}.

Zie je ernaar uit!

{{senderName}}`
    },
    {
      id: 'project_kickoff_prep',
      name: 'Project Kickoff + Team Prep',
      subject: '🚀 Project Kickoff Voorbereiding - {{company}}',
      content: `Hoi {{name}},

Tijd voor de project kickoff! Ik ben super enthousiast om te starten met de AI implementatie bij {{company}}.

🚀 KICKOFF AGENDA:
• Project scope en deliverables definitief maken
• Team rollen en verantwoordelijkheden
• Communicatie en werkwijze afspraken
• Eerste milestone planning en deadlines

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

Na deze kickoff hebben we een crystal clear project plan en kunnen we direct aan de slag!

{{senderName}}
GroeimetAI - Je AI Implementation Partner`
    }
  ];

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
        // If follow-up email is enabled, send it too
        if (sendFollowUpEmail && selectedEmailTemplate && selectedEmailTemplate !== 'meeting_invite_only') {
          try {
            const selectedTemplate = emailTemplates.find(t => t.id === selectedEmailTemplate);
            if (selectedTemplate) {
              console.log('📧 Sending follow-up email with template:', selectedEmailTemplate);
              
              // Send additional context email via admin email API
              const emailResponse = await fetch('/api/admin/send-email', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  to: contact.email,
                  subject: emailForm.subject.replace('{{company}}', contact.company),
                  content: emailForm.content,
                  contactId: contact.id
                }),
              });

              const emailData = await emailResponse.json();
              if (emailData.success) {
                toast.success('Meeting ingepland én voorbereidingsemail verzonden!');
              } else {
                toast.success('Meeting ingepland, maar voorbereidingsemail gefaald');
              }
            }
          } catch (emailError) {
            console.error('Follow-up email error:', emailError);
            toast.success('Meeting ingepland, maar voorbereidingsemail gefaald');
          }
        } else {
          toast.success('Meeting ingepland en uitnodiging verzonden!');
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

  const selectedMeetingType = meetingTypes.find(type => type.value === scheduleForm.type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black border-white/20 max-w-[95vw] xl:max-w-7xl max-h-[95vh] overflow-hidden">
        <DialogHeader className="border-b border-white/10 pb-4">
          <DialogTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-orange" />
              <div>
                <h2 className="text-xl font-bold">Meeting Planning</h2>
                <p className="text-white/60 text-sm font-normal">{contact.name} • {contact.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                contact.conversationType === 'kickoff' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                contact.conversationType === 'debrief' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}>
                {contact.conversationType === 'verkennen' ? '💬 Verkennend' :
                 contact.conversationType === 'debrief' ? '🎯 Assessment Debrief' :
                 contact.conversationType === 'kickoff' ? '🚀 Project Kickoff' :
                 '📞 Algemeen'}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-6 p-6">
          
          {/* Top Left: Contact Context */}
          <Card className="bg-blue-500/10 border-blue-500/30 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-300 text-base flex items-center gap-2 font-semibold">
                <Users className="h-5 w-5" />
                Contact Context
              </CardTitle>
            </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-blue-300 text-xs font-medium mb-1">Conversation Type</p>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    contact.conversationType === 'kickoff' ? 'bg-red-500/20 text-red-400' :
                    contact.conversationType === 'debrief' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {contact.conversationType === 'verkennen' ? '💬 Verkennend' :
                     contact.conversationType === 'debrief' ? '🎯 Assessment Debrief' :
                     contact.conversationType === 'kickoff' ? '🚀 Project Kickoff' :
                     '📞 Algemeen'}
                  </span>
                </div>
                
                {contact.message && (
                  <div>
                    <p className="text-blue-300 text-xs font-medium mb-1">User's Message</p>
                    <div className="bg-white/5 rounded p-3 border border-blue-500/20">
                      <p className="text-white/80 text-sm">{contact.message}</p>
                    </div>
                  </div>
                )}
                
                {(contact.preferredDate || contact.preferredTime) && (
                  <div>
                    <p className="text-blue-300 text-xs font-medium mb-1">User's Preference</p>
                    <div className="space-y-1">
                      {contact.preferredDate && (
                        <p className="text-white/70 text-sm">📅 Datum: {new Date(contact.preferredDate).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                      )}
                      {contact.preferredTime && (
                        <p className="text-white/70 text-sm">⏰ Tijd: {contact.preferredTime === 'morning' ? 'Ochtend (9:00-12:00)' : 'Middag (13:00-17:00)'}</p>
                      )}
                    </div>
                  </div>
                )}
                
                <div>
                  <p className="text-blue-300 text-xs font-medium mb-1">Contact Info</p>
                  <div className="space-y-1 text-xs">
                    <p className="text-white/70">📧 {contact.email}</p>
                    {contact.phone && <p className="text-white/70">📞 {contact.phone}</p>}
                    {contact.submittedAt && (
                      <p className="text-white/50">📝 {contact.submittedAt.toDate?.()?.toLocaleDateString('nl-NL') || 'Recent'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
          </Card>

          {/* Top Right: Meeting Details */}
            <Card className="bg-white/5 border-white/10 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base flex items-center gap-2 font-semibold">
                  <Calendar className="h-5 w-5 text-orange" />
                  Meeting Details
                </CardTitle>
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

          {/* Right: Email Composer */}
          <div className="space-y-4">
            <Card className="bg-green-500/10 border-green-500/30 shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-300 text-base flex items-center gap-2 font-semibold">
                  <Mail className="h-5 w-5" />
                  Email Composer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-white/80 text-sm">Verstuur voorbereidingsemail</Label>
                  <input
                    type="checkbox"
                    checked={sendFollowUpEmail}
                    onChange={(e) => setSendFollowUpEmail(e.target.checked)}
                    className="w-4 h-4 text-orange focus:ring-orange rounded"
                  />
                </div>
                
                {sendFollowUpEmail && (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="radio"
                        id="useTemplate"
                        checked={emailForm.useTemplate}
                        onChange={() => {
                          setEmailForm({ ...emailForm, useTemplate: true });
                          const template = emailTemplates.find(t => t.id === selectedEmailTemplate);
                          if (template) {
                            setEmailForm({
                              ...emailForm,
                              useTemplate: true,
                              subject: template.subject,
                              content: template.content
                            });
                          }
                        }}
                        className="w-3 h-3 text-orange"
                      />
                      <Label htmlFor="useTemplate" className="text-white/80 text-xs">Use Template</Label>
                      
                      <input
                        type="radio"
                        id="customEmail"
                        checked={!emailForm.useTemplate}
                        onChange={() => setEmailForm({ ...emailForm, useTemplate: false })}
                        className="w-3 h-3 text-orange ml-4"
                      />
                      <Label htmlFor="customEmail" className="text-white/80 text-xs">Custom Email</Label>
                    </div>

                    {emailForm.useTemplate ? (
                      <div>
                        <Label className="text-white/80 text-sm">Email Template</Label>
                        <select
                          value={selectedEmailTemplate}
                          onChange={(e) => {
                            setSelectedEmailTemplate(e.target.value);
                            const template = emailTemplates.find(t => t.id === e.target.value);
                            if (template) {
                              setEmailForm({
                                ...emailForm,
                                subject: template.subject,
                                content: template.content
                              });
                            }
                          }}
                          className="w-full bg-white/5 border border-white/20 text-white rounded-md px-3 py-2 text-sm mt-1"
                        >
                          {emailTemplates.map((template) => (
                            <option key={template.id} value={template.id}>
                              {template.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <>
                        <div>
                          <Label className="text-white/80 text-sm">Email Onderwerp</Label>
                          <Input
                            value={emailForm.subject}
                            onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                            placeholder="Meeting bevestiging..."
                            className="bg-white/5 border-white/20 text-white text-sm mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-white/80 text-sm">Email Content</Label>
                          <Textarea
                            value={emailForm.content}
                            onChange={(e) => setEmailForm({ ...emailForm, content: e.target.value })}
                            placeholder="Beste [name], ons gesprek is bevestigd..."
                            className="bg-white/5 border-white/20 text-white text-sm min-h-[200px] mt-1"
                            rows={8}
                          />
                        </div>
                      </>
                    )}
                    
                    {(selectedEmailTemplate || !emailForm.useTemplate) && (
                      <div className="bg-white/5 rounded-lg border border-white/10">
                        <div className="p-3 border-b border-white/10">
                          <h4 className="text-white text-sm font-medium flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            Email Preview
                          </h4>
                        </div>
                        <div className="p-3 space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-white/50 mb-1">Naar:</p>
                              <p className="text-white/80">{contact.email}</p>
                            </div>
                            <div>
                              <p className="text-white/50 mb-1">Van:</p>
                              <p className="text-white/80">niels@groeimetai.io</p>
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-white/50 text-xs mb-1">Onderwerp:</p>
                            <p className="text-white/80 text-sm font-medium">
                              {emailForm.subject
                                .replace('{{company}}', contact.company)
                                .replace('{{name}}', contact.name)
                              }
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-white/50 text-xs mb-2">Email Content:</p>
                            <div className="bg-black/30 rounded border border-white/10 p-3 max-h-[300px] overflow-y-auto">
                              <div className="text-white/70 text-xs leading-relaxed whitespace-pre-wrap">
                                {emailForm.content
                                  .replace(/{{name}}/g, contact.name)
                                  .replace(/{{company}}/g, contact.company)
                                  .replace(/{{meetingDate}}/g, scheduleForm.date ? new Date(scheduleForm.date).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' }) : '[MEETING DATUM]')
                                  .replace(/{{meetingTime}}/g, scheduleForm.time || '[MEETING TIJD]')
                                  .replace(/{{senderName}}/g, 'Niels van der Werf')
                                  .replace(/{{actionStep1}}/g, '[Eerste actie - vul aan]')
                                  .replace(/{{actionStep2}}/g, '[Tweede actie - vul aan]')
                                  .replace(/{{actionStep3}}/g, '[Derde actie - vul aan]')
                                  .replace(/{{nextMeetingDate}}/g, '[Volgende meeting datum]')
                                  .replace(/{{budgetRange}}/g, '[Budget indicatie]')
                                  .replace(/{{relevantCase}}/g, 'https://groeimetai.io/cases')
                                  .replace(/{{personalRecommendation}}/g, '[Persoonlijke aanbeveling - vul aan]')
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

          </div>
        </div>

        {/* Fixed Footer */}
        <div className="border-t border-white/10 bg-black/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-white/60 text-sm">
                <span className="font-medium">Meeting:</span> {
                  scheduleForm.date && scheduleForm.time 
                    ? `${new Date(scheduleForm.date).toLocaleDateString('nl-NL', { month: 'short', day: 'numeric' })} om ${scheduleForm.time}`
                    : 'Niet ingesteld'
                }
              </div>
              {sendFollowUpEmail && (
                <div className="text-white/60 text-sm">
                  <span className="font-medium">Email:</span> {
                    emailForm.useTemplate 
                      ? emailTemplates.find(t => t.id === selectedEmailTemplate)?.name || 'Template'
                      : 'Custom email'
                  }
                </div>
              )}
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
                    {sendFollowUpEmail && emailForm.content
                      ? 'Plan Meeting & Verstuur Emails'
                      : 'Plan Meeting & Verstuur Uitnodiging'}
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