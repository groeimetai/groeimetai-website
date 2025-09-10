'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, Video, Clock, Users, ExternalLink, 
  RefreshCw, Trash2, Edit, MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';
import { nl } from 'date-fns/locale';

interface GoogleEvent {
  id: string;
  summary: string;
  description: string;
  start: { dateTime: string };
  end: { dateTime: string };
  attendees?: Array<{ email: string; responseStatus: string }>;
  conferenceData?: {
    entryPoints: Array<{ uri: string; entryPointType: string }>;
  };
  htmlLink: string;
}

export default function GoogleCalendarPage() {
  const [events, setEvents] = useState<GoogleEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadCalendarEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/calendar/events');
      const data = await response.json();

      if (data.success) {
        setEvents(data.events || []);
        setLastRefresh(new Date());
        toast.success(`${data.events?.length || 0} meetings geladen`);
      } else {
        toast.error(data.error || 'Fout bij laden calendar events');
      }
    } catch (error) {
      toast.error('Fout bij laden calendar');
      console.error('Calendar load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMeeting = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Meeting "${eventTitle}" verwijderen?`)) return;

    try {
      const response = await fetch('/api/admin/calendar/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId })
      });

      const data = await response.json();

      if (data.success) {
        setEvents(events.filter(e => e.id !== eventId));
        toast.success('Meeting verwijderd');
      } else {
        toast.error('Fout bij verwijderen meeting');
      }
    } catch (error) {
      toast.error('Fout bij verwijderen meeting');
    }
  };

  useEffect(() => {
    loadCalendarEvents();
  }, []);

  const upcomingEvents = events.filter(event => 
    new Date(event.start.dateTime) > new Date()
  );

  const todayEvents = events.filter(event => {
    const eventDate = new Date(event.start.dateTime);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  });

  const getMeetingLink = (event: GoogleEvent) => {
    return event.conferenceData?.entryPoints?.find(
      entry => entry.entryPointType === 'video'
    )?.uri;
  };

  const getAttendeeCount = (event: GoogleEvent) => {
    return event.attendees?.length || 0;
  };

  const getResponseStatus = (event: GoogleEvent) => {
    const accepted = event.attendees?.filter(a => a.responseStatus === 'accepted').length || 0;
    const declined = event.attendees?.filter(a => a.responseStatus === 'declined').length || 0;
    const pending = event.attendees?.filter(a => a.responseStatus === 'needsAction').length || 0;
    
    return { accepted, declined, pending, total: (event.attendees?.length || 0) };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Calendar className="h-8 w-8 text-orange" />
          Google Calendar Management
        </h1>
        <p className="text-white/60">Beheer GroeimetAI meetings en Google Meet calls</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Vandaag</p>
                <p className="text-2xl font-bold text-white">{todayEvents.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Komende Week</p>
                <p className="text-2xl font-bold text-white">{upcomingEvents.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Google Geïntegreerd</p>
                <p className="text-2xl font-bold text-white">
                  {events.filter(e => getMeetingLink(e)).length}
                </p>
              </div>
              <Video className="h-8 w-8 text-orange" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card className="mb-6 bg-white/5 border-white/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium mb-2">Calendar Sync</h3>
              <p className="text-white/60 text-sm">
                {lastRefresh 
                  ? `Laatste sync: ${format(lastRefresh, 'HH:mm:ss', { locale: nl })}`
                  : 'Nog niet gesynchroniseerd'
                }
              </p>
            </div>
            <Button
              onClick={loadCalendarEvents}
              disabled={loading}
              className="bg-orange text-white"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Laden...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Calendar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Meetings */}
      {todayEvents.length > 0 && (
        <Card className="mb-6 bg-green-500/10 border-green-500/30">
          <CardHeader>
            <CardTitle className="text-green-400">🗓️ Meetings Vandaag</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayEvents.map((event) => {
              const meetLink = getMeetingLink(event);
              const responses = getResponseStatus(event);
              
              return (
                <div key={event.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium">{event.summary}</h4>
                    <div className="flex gap-2">
                      {meetLink && (
                        <Button asChild size="sm" className="bg-green-600 text-white">
                          <a href={meetLink} target="_blank" rel="noopener noreferrer">
                            <Video className="h-4 w-4 mr-1" />
                            Join
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-white/70 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(event.start.dateTime), 'HH:mm')} - {format(new Date(event.end.dateTime), 'HH:mm')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {responses.accepted}/{responses.total} geaccepteerd
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* All Upcoming Meetings */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Komende Meetings ({upcomingEvents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">Geen komende meetings gevonden</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => {
                const meetLink = getMeetingLink(event);
                const responses = getResponseStatus(event);
                const isToday = new Date(event.start.dateTime).toDateString() === new Date().toDateString();
                
                return (
                  <div key={event.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-medium">{event.summary}</h4>
                          {isToday && (
                            <Badge className="bg-green-500 text-white text-xs">Vandaag</Badge>
                          )}
                          {meetLink && (
                            <Badge className="bg-blue-500 text-white text-xs">Google Meet</Badge>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-2 mb-3 text-sm text-white/70">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(event.start.dateTime), 'EEEE d MMMM', { locale: nl })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(event.start.dateTime), 'HH:mm')} - {format(new Date(event.end.dateTime), 'HH:mm')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {responses.accepted}/{responses.total} geaccepteerd
                          </span>
                        </div>

                        {event.description && (
                          <p className="text-white/60 text-sm line-clamp-2 mb-3">
                            {event.description.split('\n')[0]}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        {meetLink && (
                          <Button asChild size="sm" className="bg-blue-600 text-white">
                            <a href={meetLink} target="_blank" rel="noopener noreferrer">
                              <Video className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button 
                          asChild
                          variant="outline" 
                          size="sm" 
                          className="border-white/20 text-white"
                        >
                          <a href={event.htmlLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          onClick={() => deleteMeeting(event.id, event.summary)}
                          variant="outline"
                          size="sm"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Attendee Status */}
                    {event.attendees && event.attendees.length > 0 && (
                      <div className="flex gap-2 pt-3 border-t border-white/10">
                        {event.attendees.map((attendee, idx) => (
                          <Badge
                            key={idx}
                            className={
                              attendee.responseStatus === 'accepted' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                              attendee.responseStatus === 'declined' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                              'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            }
                          >
                            {attendee.email.split('@')[0]} - {
                              attendee.responseStatus === 'accepted' ? '✅' :
                              attendee.responseStatus === 'declined' ? '❌' : '⏳'
                            }
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-blue-400">Google Calendar Integratie</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-200 text-sm space-y-2">
          <p><strong>Automatische Features:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-blue-200/80">
            <li>Echte Google Meet links worden automatisch gegenereerd</li>
            <li>Calendar events verschijnen in je Google Calendar</li>
            <li>Attendees krijgen automatische uitnodigingen</li>
            <li>15-minuten reminders worden ingesteld</li>
            <li>Meeting agenda wordt toegevoegd aan event beschrijving</li>
          </ul>
          <p className="mt-4"><strong>Setup vereisten:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-blue-200/80">
            <li>Google Calendar API enabled in Google Cloud Console</li>
            <li>Service account met Calendar en Meet permissions</li>
            <li>GOOGLE_PRIVATE_KEY_ID en GOOGLE_CLIENT_ID environment variables</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}