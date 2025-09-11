'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, Timestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, Phone, Building, Calendar, Clock, Send, User, 
  MessageCircle, Target, Rocket, Filter, Search, ChevronRight,
  CheckCircle, XCircle, AlertCircle, Eye, Edit, Archive,
  ArrowLeft, Home, Settings, Users
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import MeetingScheduler2x2 from '@/components/admin/MeetingScheduler2x2';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  preferredDate: string | null;
  preferredTime: string | null;
  conversationType: string;
  submittedAt: any;
  status: 'new' | 'contacted' | 'scheduled' | 'completed' | 'archived';
  notes?: string;
  meetingDate?: string;
  meetingTime?: string;
  meetingLink?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
}

const emailTemplates: EmailTemplate[] = [
  {
    id: 'meeting_invite',
    name: 'Meeting Uitnodiging',
    subject: '📅 Uitnodiging voor ons gesprek - GroeimetAI',
    content: `Beste {{name}},

Bedankt voor je interesse in GroeimetAI! Ik kijk ernaar uit om met je te spreken over hoe AI agents {{company}} kunnen transformeren.

Ik stel het volgende moment voor:
📅 Datum: {{meetingDate}}
⏰ Tijd: {{meetingTime}}
📍 Locatie: {{meetingLocation}}

In ons gesprek bespreken we:
• Jouw specifieke AI uitdagingen en kansen
• Hoe onze multi-agent oplossingen kunnen helpen
• Concrete next steps en tijdlijnen
• Budget en ROI verwachtingen

Bevestig alsjeblieft of dit moment je uitkomt, of stel een alternatief voor.

Met vriendelijke groet,
{{senderName}}
GroeimetAI Team`
  },
  {
    id: 'follow_up',
    name: 'Follow-up Na Gesprek',
    subject: '🚀 Vervolgstappen na ons inspirerende gesprek - {{company}}',
    content: `Beste {{name}},

Wat een inspirerend gesprek was het! Bedankt voor de openheid over de AI uitdagingen en kansen bij {{company}}.

Zoals besproken deel ik hieronder de concrete vervolgstappen:

🎯 DIRECT ACTIE:
1. {{actionStep1}}
2. {{actionStep2}} 
3. {{actionStep3}}

📋 PLANNING:
• Volgende meeting: {{nextMeetingDate}}
• Verwachte deadline eerste milestone: {{milestone1Date}}
• Budget indicatie besproken: {{budgetRange}}

📚 RESOURCES:
• Agent Readiness Assessment: https://groeimetai.io/agent-readiness
• Case study relevant voor {{company}}: {{relevantCase}}
• Technische documentatie: {{techDocs}}

💡 MIJN AANBEVELING:
{{personalRecommendation}}

Heb je nog vragen? Ik ben altijd bereikbaar op deze email of bel me direct: +31 6 12345678

Tot snel!

{{senderName}}
GroeimetAI - AI Infrastructure Specialists`
  },
  {
    id: 'proposal_ready',
    name: 'Voorstel Klaar',
    subject: '📄 Je AI implementatie voorstel is klaar - {{company}}',
    content: `Hoi {{name}},

Zoals beloofd heb ik een op maat gemaakt AI implementatie voorstel voor {{company}} voorbereid.

📊 HET VOORSTEL BEVAT:
• Specifieke AI use cases voor jouw bedrijf
• ROI berekening en business case
• Implementatie roadmap met tijdlijnen
• Team training en change management plan
• Budget overzicht met fases

🎯 HOOGTEPUNTEN:
• Verwachte ROI: {{expectedROI}}
• Implementatie tijd: {{implementationTime}}
• Eerste resultaten na: {{firstResultsTime}}

Het complete voorstel vind je hier: {{proposalLink}}

Wanneer kunnen we dit bespreken? Ik stel voor om binnen een week een review meeting in te plannen.

Beschikbare slots:
• {{availableSlot1}}
• {{availableSlot2}}
• {{availableSlot3}}

Met vriendelijke groet,

{{senderName}}
GroeimetAI`
  },
  {
    id: 'quick_check_in',
    name: 'Snelle Check-in',
    subject: '👋 Hoe staat het met je AI journey? - {{company}}',
    content: `Hoi {{name}},

Ik dacht aan ons gesprek over AI mogelijkheden voor {{company}} en wilde even checken hoe het ervoor staat.

🤔 WAAR STA JE NU?
• Heb je al stappen kunnen zetten?
• Zijn er nog vragen ontstaan?
• Kan ik ergens mee helpen?

💡 QUICK WIN IDEEËN:
Ik heb een paar concrete, snelle AI wins gezien die perfect bij {{company}} passen:
• {{quickWin1}}
• {{quickWin2}}
• {{quickWin3}}

Zin in een 15-minuten catch-up call deze week? Dan kan ik je deze quick wins even laten zien.

Groet,
{{senderName}}`
  }
];

export default function ContactsAdminPage() {
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactSubmission[]>([]);
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Schedule form
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    time: '',
    location: 'Google Meet',
    notes: ''
  });
  
  // Email form
  const [emailForm, setEmailForm] = useState({
    subject: '',
    content: '',
    template: 'custom'
  });

  // Load contacts from Firestore
  useEffect(() => {
    const q = query(
      collection(db, 'contact_submissions'),
      orderBy('submittedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contactsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ContactSubmission));
      
      setContacts(contactsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter contacts
  useEffect(() => {
    let filtered = contacts;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredContacts(filtered);
  }, [contacts, statusFilter, searchQuery]);

  // Update contact status
  const updateContactStatus = async (contactId: string, status: ContactSubmission['status']) => {
    try {
      await updateDoc(doc(db, 'contact_submissions', contactId), {
        status,
        updatedAt: new Date()
      });
      toast.success(`Status bijgewerkt naar ${status}`);
    } catch (error) {
      toast.error('Fout bij het bijwerken van status');
    }
  };

  // Schedule meeting
  const handleScheduleMeeting = async () => {
    if (!selectedContact) return;

    try {
      // Update contact with meeting details
      await updateDoc(doc(db, 'contact_submissions', selectedContact.id), {
        status: 'scheduled',
        meetingDate: scheduleForm.date,
        meetingTime: scheduleForm.time,
        meetingLocation: scheduleForm.location,
        notes: scheduleForm.notes,
        updatedAt: new Date()
      });

      // Send meeting invitation email
      const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; background-color: #080D14; font-family: system-ui, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; color: white; padding: 30px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="margin-bottom: 15px;">
        <img src="https://groeimetai.io/groeimet-ai-logo.svg" alt="GroeimetAI" style="height: 50px; width: auto; filter: brightness(0) invert(1);" />
      </div>
      <h1 style="color: #F87315; font-size: 32px; margin: 0;">GroeimetAI</h1>
    </div>
    
    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 30px;">
      <h2 style="color: white; margin-top: 0;">📅 Ons gesprek is ingepland!</h2>
      
      <p style="color: rgba(255,255,255,0.9); line-height: 1.6;">
        Beste ${selectedContact.name},<br><br>
        Ons gesprek over AI mogelijkheden voor ${selectedContact.company} is bevestigd!
      </p>
      
      <div style="background: rgba(248,115,21,0.1); border: 1px solid rgba(248,115,21,0.3); border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #F87315; margin-top: 0;">📋 Meeting Details:</h3>
        <ul style="color: rgba(255,255,255,0.9); line-height: 1.8;">
          <li><strong>Datum:</strong> ${format(new Date(scheduleForm.date), 'EEEE d MMMM yyyy', { locale: nl })}</li>
          <li><strong>Tijd:</strong> ${scheduleForm.time}</li>
          <li><strong>Locatie:</strong> ${scheduleForm.location}</li>
          <li><strong>Type:</strong> ${
            selectedContact.conversationType === 'verkennen' ? 'Verkennend gesprek' :
            selectedContact.conversationType === 'debrief' ? 'Assessment Debrief' :
            selectedContact.conversationType === 'kickoff' ? 'Project Kickoff' :
            'Consultatie'
          }</li>
        </ul>
      </div>
      
      ${scheduleForm.location.includes('Meet') || scheduleForm.location.includes('Zoom') ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${scheduleForm.location}" style="display: inline-block; background: #F87315; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
          🔗 Join Meeting
        </a>
      </div>
      ` : ''}
      
      ${scheduleForm.notes ? `
      <div style="background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #22c55e; margin-top: 0;">📝 Opmerkingen:</h3>
        <p style="color: rgba(255,255,255,0.9);">${scheduleForm.notes}</p>
      </div>
      ` : ''}
      
      <p style="color: rgba(255,255,255,0.7); font-size: 14px; text-align: center; margin-top: 30px;">
        Tot snel!<br>
        Het GroeimetAI Team
      </p>
    </div>
  </div>
</body>
</html>
      `;

      await addDoc(collection(db, 'mail'), {
        to: selectedContact.email,
        message: {
          subject: `📅 Bevestiging: Ons gesprek op ${format(new Date(scheduleForm.date), 'd MMMM', { locale: nl })}`,
          html: emailHtml
        }
      });

      toast.success('Meeting ingepland en bevestiging verstuurd!');
      setShowScheduleModal(false);
      setScheduleForm({ date: '', time: '', location: 'Google Meet', notes: '' });
    } catch (error) {
      toast.error('Fout bij het plannen van meeting');
    }
  };

  // Send custom email
  const handleSendEmail = async () => {
    if (!selectedContact) return;

    try {
      let emailContent = emailForm.content;
      let emailSubject = emailForm.subject;

      // Replace template variables (expanded for new templates)
      const replacements = {
        '{{name}}': selectedContact.name,
        '{{company}}': selectedContact.company,
        '{{meetingDate}}': selectedContact.meetingDate || '[DATUM]',
        '{{meetingTime}}': selectedContact.meetingTime || '[TIJD]',
        '{{meetingLocation}}': 'Google Meet',
        '{{senderName}}': 'Niels van der Werf',
        '{{actionStep1}}': '[Actie 1 - vul aan]',
        '{{actionStep2}}': '[Actie 2 - vul aan]',
        '{{actionStep3}}': '[Actie 3 - vul aan]',
        '{{nextMeetingDate}}': '[Volgende meeting]',
        '{{budgetRange}}': '[Budget indicatie]',
        '{{relevantCase}}': 'https://groeimetai.io/cases',
        '{{personalRecommendation}}': '[Persoonlijke aanbeveling]',
        '{{expectedROI}}': '[ROI percentage]',
        '{{implementationTime}}': '[Tijdlijn]',
        '{{proposalLink}}': '[Voorstel link]',
        '{{availableSlot1}}': '[Slot 1]',
        '{{availableSlot2}}': '[Slot 2]',
        '{{availableSlot3}}': '[Slot 3]',
        '{{quickWin1}}': '[Quick win 1]',
        '{{quickWin2}}': '[Quick win 2]',
        '{{quickWin3}}': '[Quick win 3]'
      };

      Object.entries(replacements).forEach(([key, value]) => {
        emailContent = emailContent.replace(new RegExp(key, 'g'), value);
        emailSubject = emailSubject.replace(new RegExp(key, 'g'), value);
      });

      // Create styled HTML email
      const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; background-color: #080D14; font-family: system-ui, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; color: white; padding: 30px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="margin-bottom: 15px;">
        <img src="https://groeimetai.io/groeimet-ai-logo.svg" alt="GroeimetAI" style="height: 50px; width: auto; filter: brightness(0) invert(1);" />
      </div>
      <h1 style="color: #F87315; font-size: 32px; margin: 0;">GroeimetAI</h1>
      <p style="color: rgba(255,255,255,0.7); margin-top: 5px;">Transformeer je bedrijf met AI Agents</p>
    </div>
    
    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 30px;">
      <div style="color: rgba(255,255,255,0.9); line-height: 1.8; white-space: pre-wrap;">
${emailContent}
      </div>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="https://groeimetai.com" style="display: inline-block; background: #F87315; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
        Bezoek Website
      </a>
    </div>
    
    <div style="text-align: center; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 30px;">
      <p style="color: rgba(255,255,255,0.5); font-size: 14px;">
        GroeimetAI • Transformeer je bedrijf met AI<br>
        <a href="mailto:info@groeimetai.io" style="color: #F87315; text-decoration: none;">info@groeimetai.io</a>
      </p>
    </div>
  </div>
</body>
</html>
      `;

      // Send via SMTP API instead of Firebase Extension (to avoid SSL errors)
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedContact.email,
          subject: emailSubject,
          content: emailContent,
          contactId: selectedContact.id
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Email API failed');
      }

      // Update contact status
      await updateDoc(doc(db, 'contact_submissions', selectedContact.id), {
        status: 'contacted',
        lastContactedAt: new Date()
      });

      toast.success('Email verzonden!');
      setShowEmailModal(false);
      setEmailForm({ subject: '', content: '', template: 'custom' });
    } catch (error) {
      toast.error('Fout bij het verzenden van email');
    }
  };

  // Load email template
  const loadEmailTemplate = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template) {
      setEmailForm({
        ...emailForm,
        subject: template.subject,
        content: template.content,
        template: templateId
      });
    }
  };

  const getStatusColor = (status: ContactSubmission['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'contacted': return 'bg-yellow-500';
      case 'scheduled': return 'bg-purple-500';
      case 'completed': return 'bg-green-500';
      case 'archived': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getConversationTypeIcon = (type: string) => {
    switch (type) {
      case 'verkennen': return MessageCircle;
      case 'debrief': return Target;
      case 'kickoff': return Rocket;
      default: return MessageCircle;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/dashboard/admin" className="hover:text-white transition-colors flex items-center gap-1">
              <Settings className="h-4 w-4" />
              Admin
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-orange font-medium">Contact Aanvragen</span>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/dashboard/admin">
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Terug naar Admin
              </Button>
            </Link>
            <Link href="/dashboard/admin/calendar">
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Mail className="h-8 w-8 text-orange" />
              Contact Aanvragen
            </h1>
            <p className="text-white/60">Beheer en reageer op contact aanvragen</p>
          </div>
          <div className="text-white/60 text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {contacts.filter(c => c.status === 'new').length} Nieuw
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                {contacts.filter(c => c.status === 'contacted').length} Contacted
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                {contacts.filter(c => c.status === 'scheduled').length} Scheduled
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 bg-white/5 border-white/10">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Zoek op naam, bedrijf of email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'new', 'contacted', 'scheduled', 'completed'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(status)}
                  className={statusFilter === status ? 'bg-orange text-white' : 'border-white/20 text-white'}
                >
                  {status === 'all' ? 'Alle' : status.charAt(0).toUpperCase() + status.slice(1)}
                  {status !== 'all' && (
                    <span className="ml-2 text-xs">
                      ({contacts.filter(c => c.status === status).length})
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts List */}
      <div className="grid gap-4">
        {loading ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-2 border-orange border-t-transparent rounded-full mx-auto"></div>
              <p className="text-white/60 mt-4">Laden...</p>
            </CardContent>
          </Card>
        ) : filteredContacts.length === 0 ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-8 text-center">
              <p className="text-white/60">Geen contact aanvragen gevonden</p>
            </CardContent>
          </Card>
        ) : (
          filteredContacts.map((contact) => {
            const Icon = getConversationTypeIcon(contact.conversationType);
            return (
              <Card key={contact.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="h-5 w-5 text-orange" />
                        <h3 className="text-lg font-semibold text-white">{contact.name}</h3>
                        <Badge className={`${getStatusColor(contact.status)} text-white`}>
                          {contact.status}
                        </Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-2 mb-4">
                        <div className="flex items-center gap-2 text-white/70">
                          <Building className="h-4 w-4" />
                          <span>{contact.company}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/70">
                          <Mail className="h-4 w-4" />
                          <a href={`mailto:${contact.email}`} className="hover:text-orange">
                            {contact.email}
                          </a>
                        </div>
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-white/70">
                            <Phone className="h-4 w-4" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-white/70">
                          <Calendar className="h-4 w-4" />
                          <span>{format(contact.submittedAt?.toDate() || new Date(), 'dd MMM yyyy HH:mm', { locale: nl })}</span>
                        </div>
                      </div>

                      {contact.message && (
                        <p className="text-white/60 mb-4 line-clamp-2">{contact.message}</p>
                      )}

                      {(contact.preferredDate || contact.preferredTime) && (
                        <div className="bg-orange/10 border border-orange/30 rounded-lg p-3 mb-4">
                          <p className="text-sm text-orange font-medium mb-1">Voorkeur planning:</p>
                          <p className="text-white/80 text-sm">
                            {contact.preferredDate && format(new Date(contact.preferredDate), 'dd MMMM yyyy', { locale: nl })}
                            {contact.preferredTime && ` - ${contact.preferredTime === 'morning' ? 'Ochtend' : 'Middag'}`}
                          </p>
                        </div>
                      )}

                      {contact.meetingDate && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-4">
                          <p className="text-sm text-green-400 font-medium mb-1">Meeting gepland:</p>
                          <p className="text-white/80 text-sm">
                            {format(new Date(contact.meetingDate), 'dd MMMM yyyy', { locale: nl })} om {contact.meetingTime}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedContact(contact);
                          setShowScheduleModal(true);
                        }}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedContact(contact);
                          setShowEmailModal(true);
                        }}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateContactStatus(contact.id, 'archived')}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Enhanced 2x2 Meeting Scheduler */}
      {selectedContact && (
        <MeetingScheduler2x2
          contact={selectedContact}
          isOpen={showScheduleModal}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedContact(null);
          }}
          onSuccess={() => {
            // Refresh contacts or update state as needed
            toast.success('Meeting succesvol ingepland!');
          }}
        />
      )}

      {/* Email Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="bg-black border-white/20 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white">Email naar {selectedContact?.name}</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="compose" className="mt-4">
            <TabsList className="bg-white/5">
              <TabsTrigger value="compose" className="data-[state=active]:bg-orange">Opstellen</TabsTrigger>
              <TabsTrigger value="templates" className="data-[state=active]:bg-orange">Templates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="compose" className="space-y-4">
              <div>
                <Label className="text-white/80">Onderwerp</Label>
                <Input
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  placeholder="Email onderwerp..."
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div>
                <Label className="text-white/80">Bericht</Label>
                <Textarea
                  value={emailForm.content}
                  onChange={(e) => setEmailForm({ ...emailForm, content: e.target.value })}
                  placeholder="Typ je bericht..."
                  className="bg-white/5 border-white/20 text-white min-h-[300px]"
                  rows={12}
                />
                <p className="text-xs text-white/40 mt-2">
                  Variabelen: {'{{name}}'}, {'{{company}}'}, {'{{meetingDate}}'}, {'{{meetingTime}}'}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="templates" className="space-y-4">
              {emailTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="bg-white/5 border-white/10 cursor-pointer hover:bg-white/10"
                  onClick={() => loadEmailTemplate(template.id)}
                >
                  <CardContent className="p-4">
                    <h4 className="text-white font-medium mb-2">{template.name}</h4>
                    <p className="text-white/60 text-sm">{template.subject}</p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
          
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setShowEmailModal(false)}
              className="border-white/20 text-white"
            >
              Annuleren
            </Button>
            <Button
              onClick={handleSendEmail}
              className="bg-orange text-white"
            >
              <Send className="mr-2 h-4 w-4" />
              Verstuur Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}