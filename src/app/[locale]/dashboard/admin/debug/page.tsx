'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, TestTube, Database, Clock, CheckCircle, XCircle, 
  AlertCircle, RefreshCw, Send, Eye, Bug
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface EmailStatus {
  id: string;
  to: string;
  subject: string;
  timestamp: string | null;
  delivery: any;
  status: string;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  company: string;
  status: string;
  conversationType: string;
  submittedAt: string | null;
}

export default function AdminDebugPage() {
  const [emailQueue, setEmailQueue] = useState<EmailStatus[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  const checkEmailQueue = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/email-test');
      const data = await response.json();

      if (data.success) {
        setEmailQueue(data.emailQueue.emails || []);
        setContactSubmissions(data.contactSubmissions.contacts || []);
        toast.success(`Email queue gecontroleerd - ${data.emailQueue.totalEmails} emails gevonden`);
      } else {
        toast.error(data.error || 'Fout bij controleren email queue');
      }
    } catch (error) {
      toast.error('Fout bij controleren email queue');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    setTestingEmail(true);
    try {
      const response = await fetch('/api/debug/email-test', {
        method: 'POST'
      });
      const data = await response.json();

      if (data.success) {
        toast.success(`Test email verzonden! ID: ${data.testEmailId}`);
        setEmailQueue(data.recentEmails || []);
      } else {
        toast.error(data.error || 'Fout bij verzenden test email');
      }
    } catch (error) {
      toast.error('Fout bij verzenden test email');
      console.error('Error:', error);
    } finally {
      setTestingEmail(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success': return CheckCircle;
      case 'error': return XCircle;
      case 'pending': return Clock;
      default: return AlertCircle;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Bug className="h-8 w-8 text-orange" />
          Email Debug Dashboard
        </h1>
        <p className="text-white/60">Debug email delivery en Firebase Email Extension</p>
      </div>

      {/* Actions */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TestTube className="h-5 w-5 text-orange" />
              Email Testen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/70 text-sm">
              Verstuur een test email om de Firebase Email Extension te controleren
            </p>
            <Button
              onClick={sendTestEmail}
              disabled={testingEmail}
              className="bg-orange text-white w-full"
            >
              {testingEmail ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Versturen...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Verstuur Test Email
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-orange" />
              Queue Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/70 text-sm">
              Controleer de status van emails in de Firestore queue
            </p>
            <Button
              onClick={checkEmailQueue}
              disabled={loading}
              variant="outline"
              className="border-white/20 text-white w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Laden...
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  Controleer Queue
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Email Queue */}
      <Card className="mb-8 bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Mail className="h-5 w-5 text-orange" />
            Email Queue ({emailQueue.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {emailQueue.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">Geen emails gevonden in queue</p>
              <p className="text-white/40 text-sm mt-2">Klik op "Controleer Queue" om te laden</p>
            </div>
          ) : (
            <div className="space-y-4">
              {emailQueue.map((email) => {
                const StatusIcon = getStatusIcon(email.status);
                return (
                  <div key={email.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusIcon className="h-4 w-4" />
                          <span className="text-white font-medium">{email.subject}</span>
                          <Badge className={`${getStatusColor(email.status)} text-white text-xs`}>
                            {email.status}
                          </Badge>
                        </div>
                        <p className="text-white/70 text-sm">Naar: {email.to}</p>
                        <p className="text-white/50 text-xs">
                          ID: {email.id} • {email.timestamp ? format(new Date(email.timestamp), 'dd-MM-yyyy HH:mm:ss') : 'Geen timestamp'}
                        </p>
                      </div>
                    </div>
                    
                    {email.delivery && (
                      <div className="mt-3 p-3 bg-white/5 rounded border-l-2 border-orange">
                        <p className="text-white/80 text-sm font-medium mb-1">Delivery Info:</p>
                        <p className="text-white/60 text-sm">State: {email.delivery.state}</p>
                        {email.delivery.error && (
                          <p className="text-red-400 text-sm mt-1">Error: {email.delivery.error}</p>
                        )}
                        {email.delivery.info && (
                          <p className="text-white/50 text-xs mt-1">Info: {email.delivery.info}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Submissions */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-orange" />
            Recent Contact Submissions ({contactSubmissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contactSubmissions.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">Geen contact submissions gevonden</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contactSubmissions.map((contact) => (
                <div key={contact.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium">{contact.name}</span>
                        <Badge className="bg-blue-500 text-white text-xs">
                          {contact.conversationType}
                        </Badge>
                        <Badge className="bg-gray-500 text-white text-xs">
                          {contact.status}
                        </Badge>
                      </div>
                      <p className="text-white/70 text-sm">{contact.company} • {contact.email}</p>
                      <p className="text-white/50 text-xs">
                        {contact.submittedAt ? format(new Date(contact.submittedAt), 'dd-MM-yyyy HH:mm:ss') : 'Geen datum'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card className="mt-8 bg-yellow-500/10 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-yellow-400 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Troubleshooting Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-200 text-sm space-y-2">
          <p><strong>Geen emails ontvangen?</strong></p>
          <ul className="list-disc list-inside space-y-1 text-yellow-200/80">
            <li>Check Firebase Console → Extensions → Send Email extension</li>
            <li>Controleer SMTP configuratie in extension settings</li>
            <li>Verify sender domain en email addresses</li>
            <li>Check spam folder van ontvangende email</li>
            <li>Kijk naar delivery.error in email queue voor specifieke fouten</li>
          </ul>
          <p className="mt-4"><strong>Status betekenis:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-yellow-200/80">
            <li><strong>Pending:</strong> Email staat in queue, nog niet verwerkt</li>
            <li><strong>Success:</strong> Email succesvol verzonden</li>
            <li><strong>Error:</strong> Email verzenden mislukt, check error details</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}