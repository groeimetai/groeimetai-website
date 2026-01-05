// Conditional import to prevent errors if googleapis isn't available
let google: any = null;
try {
  const googleapis = require('googleapis');
  google = googleapis.google;
} catch (error) {
  console.log('📅 googleapis package not available, using fallback mode');
}

export class GoogleCalendarService {
  private calendar;
  private auth;

  constructor() {
    // Check if google is available
    if (!google) {
      console.log('⚠️ Google APIs not available, service will use fallback mode');
      return;
    }

    try {
      // Use service account for server-side Google API access
      this.auth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
      },
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ],
    });

      this.calendar = google.calendar({ version: 'v3', auth: this.auth });
    } catch (error) {
      console.log('⚠️ Google Calendar service initialization failed:', error);
      this.calendar = null;
      this.auth = null;
    }
  }

  async createMeeting(meetingData: {
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    attendeeEmails: string[];
    agenda?: Array<{
      time: string;
      title: string;
      description: string;
      duration: number;
    }>;
  }) {
    // Return fallback if Google Calendar is not available
    if (!google || !this.calendar) {
      console.log('📅 Google Calendar not available, using fallback');
      return {
        success: false,
        error: 'Google Calendar service not available',
        fallback: {
          meetLink: 'https://meet.google.com/new',
          eventId: null
        }
      };
    }

    try {
      // Format agenda for description
      let fullDescription = meetingData.description;
      if (meetingData.agenda && meetingData.agenda.length > 0) {
        fullDescription += '\n\n📋 AGENDA:\n';
        fullDescription += meetingData.agenda.map(item => 
          `${item.time} - ${item.title} (${item.duration}min)\n${item.description}`
        ).join('\n\n');
      }
      fullDescription += '\n\n🤖 Meeting gepland via GroeimetAI Admin Dashboard';

      // Create Google Calendar event with Meet
      const event = {
        summary: meetingData.title,
        description: fullDescription,
        start: {
          dateTime: meetingData.startTime.toISOString(),
          timeZone: 'Europe/Amsterdam',
        },
        end: {
          dateTime: meetingData.endTime.toISOString(),
          timeZone: 'Europe/Amsterdam',
        },
        attendees: meetingData.attendeeEmails.map(email => ({ email })),
        conferenceData: {
          createRequest: {
            requestId: `groeimetai-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 15 },      // 15 min before
          ],
        },
        guestsCanModify: false,
        guestsCanInviteOthers: false,
        guestsCanSeeOtherGuests: true,
      };

      console.log('📅 Creating Google Calendar event...');
      
      const response = await this.calendar.events.insert({
        calendarId: 'primary', // Use service account's calendar or specific calendar
        resource: event,
        conferenceDataVersion: 1, // Required for Meet link generation
        sendUpdates: 'all', // Send invitations to all attendees
      });

      console.log('✅ Google Calendar event created:', response.data.id);

      const meetLink = response.data.conferenceData?.entryPoints?.find(
        (entry: { entryPointType?: string; uri?: string }) => entry.entryPointType === 'video'
      )?.uri || 'https://meet.google.com/';

      return {
        success: true,
        eventId: response.data.id,
        meetLink: meetLink,
        htmlLink: response.data.htmlLink,
        eventDetails: {
          title: response.data.summary,
          start: response.data.start?.dateTime,
          end: response.data.end?.dateTime,
          meetLink: meetLink
        }
      };

    } catch (error) {
      console.error('❌ Google Calendar error:', error);
      
      // Return fallback meeting data
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google Calendar API failed',
        fallback: {
          meetLink: 'https://meet.google.com/new', // Fallback Meet link
          eventId: null
        }
      };
    }
  }

  async updateMeeting(eventId: string, updates: any) {
    try {
      const response = await this.calendar.events.patch({
        calendarId: 'primary',
        eventId: eventId,
        resource: updates,
        sendUpdates: 'all'
      });

      return {
        success: true,
        eventId: response.data.id,
        htmlLink: response.data.htmlLink
      };
    } catch (error) {
      console.error('❌ Google Calendar update error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Update failed'
      };
    }
  }

  async deleteMeeting(eventId: string) {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all'
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Google Calendar delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      };
    }
  }

  async listUpcomingMeetings(maxResults: number = 10) {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return {
        success: true,
        events: response.data.items || []
      };
    } catch (error) {
      console.error('❌ Google Calendar list error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'List failed',
        events: []
      };
    }
  }
}