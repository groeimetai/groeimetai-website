import { NextRequest, NextResponse } from 'next/server';
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import nodemailer from 'nodemailer';
import { GoogleCalendarService } from '@/lib/google/calendar-service';
import DOMPurify from 'isomorphic-dompurify';

export const dynamic = 'force-dynamic';

/**
 * Sanitize user input for safe HTML rendering in emails
 */
function sanitizeForHtml(input: string | undefined | null): string {
  if (!input) return '';
  const stripped = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
  return stripped
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Validate URL to prevent javascript: protocol attacks
 */
function sanitizeUrl(url: string | undefined | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  // Only allow http, https, and valid meeting URLs
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return '';
}

/**
 * Validate date format (YYYY-MM-DD)
 */
function isValidDate(dateStr: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Validate time format (HH:MM)
 */
function isValidTime(timeStr: string): boolean {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  return timeRegex.test(timeStr);
}

interface MeetingData {
  contactId: string;
  date: string;
  time: string;
  duration: number; // in minutes
  location: string;
  type: 'google_meet' | 'zoom' | 'teams' | 'phone' | 'in_person';
  agenda: AgendaItem[];
  notes: string;
  attendees: string[];
}

interface AgendaItem {
  time: string;
  title: string;
  description: string;
  duration: number;
}

export async function POST(req: NextRequest) {
  try {
    const meetingData: MeetingData = await req.json();
    console.log('[Meeting API] Scheduling meeting for contact:', meetingData.contactId);

    const { contactId, date, time, duration, location, type, agenda, notes, attendees } = meetingData;

    // Validate required fields
    if (!contactId || !date || !time) {
      return NextResponse.json(
        { error: 'Contact ID, datum en tijd zijn verplicht' },
        { status: 400 }
      );
    }

    // Validate date and time formats
    if (!isValidDate(date)) {
      return NextResponse.json(
        { error: 'Ongeldige datum formaat. Gebruik YYYY-MM-DD' },
        { status: 400 }
      );
    }

    if (!isValidTime(time)) {
      return NextResponse.json(
        { error: 'Ongeldige tijd formaat. Gebruik HH:MM' },
        { status: 400 }
      );
    }

    // Validate duration bounds (15 minutes to 8 hours)
    if (typeof duration !== 'number' || duration < 15 || duration > 480) {
      return NextResponse.json(
        { error: 'Duur moet tussen 15 en 480 minuten zijn' },
        { status: 400 }
      );
    }

    // Validate meeting type
    const validTypes = ['google_meet', 'zoom', 'teams', 'phone', 'in_person'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Ongeldig meeting type' },
        { status: 400 }
      );
    }

    // Sanitize text inputs for HTML rendering
    const sanitizedNotes = sanitizeForHtml(notes);
    const sanitizedLocation = sanitizeUrl(location);

    // Sanitize agenda items
    const sanitizedAgenda = (agenda || []).map(item => ({
      time: sanitizeForHtml(item.time),
      title: sanitizeForHtml(item.title),
      description: sanitizeForHtml(item.description),
      duration: typeof item.duration === 'number' ? item.duration : 0
    }));

    // Get contact details from Firestore
    const contactDoc = await getDoc(doc(db, 'contact_submissions', contactId));
    if (!contactDoc.exists()) {
      return NextResponse.json({ error: 'Contact niet gevonden' }, { status: 404 });
    }
    const contactData = contactDoc.data();

    let meetingLink = location;
    let googleEventId = null;
    let realMeetLink = null;

    // Create actual Google Calendar event with Meet link (with fallback)
    if (type === 'google_meet') {
      try {
        console.log('📅 Attempting Google Calendar integration...');
        
        const calendarService = new GoogleCalendarService();
        const startDateTime = new Date(`${date}T${time}`);
        const endDateTime = new Date(startDateTime.getTime() + (duration * 60000));

        const googleResult = await calendarService.createMeeting({
          title: `GroeimetAI Consultatie - ${contactData.company}`,
          description: `Meeting met ${contactData.name} van ${contactData.company}\n\nType: ${
            contactData.conversationType === 'verkennen' ? 'Verkennend gesprek' :
            contactData.conversationType === 'debrief' ? 'Assessment Debrief' :
            contactData.conversationType === 'kickoff' ? 'Project Kickoff' :
            'Consultatie'
          }`,
          startTime: startDateTime,
          endTime: endDateTime,
          attendeeEmails: [contactData.email, 'niels@groeimetai.io'],
          agenda: agenda
        });

        if (googleResult.success) {
          googleEventId = googleResult.eventId;
          realMeetLink = googleResult.meetLink;
          meetingLink = realMeetLink;
          console.log('✅ Google Calendar event created with Meet link:', realMeetLink);
        } else {
          console.log('⚠️ Google Calendar failed, using fallback Meet link');
          meetingLink = 'https://meet.google.com/new';
        }
      } catch (googleError) {
        console.log('❌ Google Calendar error, using fallback:', googleError);
        meetingLink = 'https://meet.google.com/new';
      }
    } else if (type === 'zoom') {
      meetingLink = location || 'https://zoom.us/j/placeholder';
    } else if (type === 'teams') {
      meetingLink = location || 'https://teams.microsoft.com/';
    } else if (type === 'phone') {
      meetingLink = `tel:${contactData.phone || '+31612345678'}`;
    } else {
      meetingLink = location || 'GroeimetAI Kantoor, Apeldoorn';
    }

    // Create calendar event ICS file content
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + (duration * 60000));
    
    const icsContent = generateICSFile({
      title: `GroeimetAI Consultatie`,
      startTime: startDateTime,
      endTime: endDateTime,
      location: meetingLink,
      description: `Agenda:\n${sanitizedAgenda.map(item => `${item.time} - ${item.title}: ${item.description}`).join('\n')}\n\nNotities:\n${sanitizedNotes}`,
      attendees: [...attendees, 'niels@groeimetai.io']
    });

    // Update contact in Firestore with Google Calendar data
    await updateDoc(doc(db, 'contact_submissions', contactId), {
      status: 'scheduled',
      meetingDate: date,
      meetingTime: time,
      meetingDuration: duration,
      meetingLocation: meetingLink,
      meetingType: type,
      agenda: agenda,
      notes: notes,
      googleEventId: googleEventId, // Store for future updates/cancellations
      realMeetLink: realMeetLink,   // Store actual Meet link
      updatedAt: new Date()
    });

    // Send meeting invitation email with ICS attachment
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Create professional agenda HTML table (using sanitized agenda)
    const agendaHtml = sanitizedAgenda.map(item => `
      <tr>
        <td style="padding: 12px 8px; border: 1px solid #e5e7eb; background: rgba(248,115,21,0.05); color: #F87315; font-weight: 600; width: 80px; text-align: center;">${item.time}</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; color: #111827;">
          <strong style="color: #111827; font-size: 15px;">${item.title}</strong><br>
          <span style="color: #6b7280; font-size: 14px; line-height: 1.4;">${item.description}</span>
        </td>
      </tr>
    `).join('');

    const meetingEmailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; background-color: #f9fafb; font-family: system-ui, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #F87315, #FF8533); padding: 30px; text-align: center;">
      <div style="margin-bottom: 15px;">
        <img src="https://groeimetai.io/groeimet-ai-logo.svg" alt="GroeimetAI" style="height: 40px; width: auto; filter: brightness(0) invert(1);" />
      </div>
      <h1 style="color: white; margin: 0; font-size: 24px;">📅 Meeting Bevestigd</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px;">
      <!-- Personal Greeting -->
      <div style="margin-bottom: 20px;">
        <h2 style="color: #111827; margin-top: 0; font-size: 20px; margin-bottom: 10px;">Hoi ${contactData.name}! 🎯</h2>
        <p style="color: #374151; line-height: 1.6; margin: 0;">
          Ons gesprek over AI mogelijkheden voor <strong>${contactData.company}</strong> is bevestigd. Ik kijk ernaar uit!
        </p>
      </div>
      
      <!-- Meeting Details Card -->
      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #111827; margin-top: 0; font-size: 16px; margin-bottom: 15px;">📋 Meeting Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 120px;">Datum:</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 500;">${new Date(date).toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Tijd:</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 500;">${time} - ${new Date(new Date(`${date}T${time}`).getTime() + duration * 60000).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })} (${duration} minuten)</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Type gesprek:</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 500;">
              ${contactData.conversationType === 'verkennen' ? '💬 Verkennend gesprek' :
                contactData.conversationType === 'debrief' ? '🎯 Assessment Debrief' :
                contactData.conversationType === 'kickoff' ? '🚀 Project Kickoff' :
                '📞 Consultatie'}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Platform:</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 500;">
              ${type === 'google_meet' ? '📹 Google Meet (automatische link)' : 
                type === 'zoom' ? '📹 Zoom' : 
                type === 'teams' ? '📹 Microsoft Teams' : 
                type === 'phone' ? '📞 Telefoon' : '🏢 Kantoor bezoek'}
            </td>
          </tr>
          ${meetingLink ? `
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Meeting Link:</td>
            <td style="padding: 8px 0;">
              <a href="${meetingLink}" style="color: #F87315; text-decoration: none; font-weight: 500; word-break: break-all;">${meetingLink}</a>
            </td>
          </tr>
          ` : ''}
        </table>
      </div>
      
      ${sanitizedAgenda.length > 0 ? `
      <!-- Detailed Agenda -->
      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #111827; margin-top: 0; font-size: 16px; margin-bottom: 15px;">📋 Gedetailleerde Agenda</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
          <thead>
            <tr style="background: rgba(248,115,21,0.1);">
              <th style="padding: 12px 8px; color: #F87315; font-weight: 600; text-align: left; width: 80px;">Tijd</th>
              <th style="padding: 12px; color: #F87315; font-weight: 600; text-align: left;">Onderwerp & Doel</th>
            </tr>
          </thead>
          <tbody>
            ${agendaHtml}
          </tbody>
        </table>
      </div>
      ` : ''}
      
      ${sanitizedNotes ? `
      <!-- Preparation Notes -->
      <div style="background: rgba(248,115,21,0.1); border: 1px solid rgba(248,115,21,0.3); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #F87315; margin-top: 0; font-size: 16px; margin-bottom: 10px;">📝 Voorbereiding & Agenda Notities</h3>
        <div style="color: #374151; line-height: 1.6; margin: 0; white-space: pre-wrap; background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #F87315;">${sanitizedNotes}</div>
      </div>
      ` : ''}
      
      <!-- Primary CTA -->
      <div style="text-align: center; padding: 25px 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; margin: 20px 0;">
        ${type !== 'phone' && type !== 'in_person' && meetingLink ? `
        <a href="${meetingLink}" style="display: inline-block; background: #F87315; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(248, 115, 21, 0.3);">
          🎥 Deelnemen aan Meeting
        </a>
        <p style="color: #6b7280; margin: 10px 0 0 0; font-size: 12px;">Je kunt 15 minuten voor de meeting al deelnemen</p>
        ` : type === 'phone' ? `
        <div style="background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); border-radius: 8px; padding: 20px;">
          <h3 style="color: #22c55e; margin: 0 0 10px 0;">📞 Telefonisch Gesprek</h3>
          <p style="color: #374151; margin: 0;">Ik bel je op <strong>${contactData.phone || contactData.email}</strong> om ${time}</p>
        </div>
        ` : `
        <div style="background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); border-radius: 8px; padding: 20px;">
          <h3 style="color: #22c55e; margin: 0 0 10px 0;">🏢 Kantoorbezoek</h3>
          <p style="color: #374151; margin: 0;">Locatie: <strong>${meetingLink || 'GroeimetAI Kantoor, Apeldoorn'}</strong></p>
        </div>
        `}
      </div>
      
      <!-- What to Expect -->
      <div style="background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #22c55e; margin-top: 0; font-size: 16px; margin-bottom: 15px;">✨ Wat kun je verwachten?</h3>
        <ul style="color: #374151; line-height: 1.8; padding-left: 20px; margin: 0;">
          <li><strong>Persoonlijke benadering</strong> - Geen standaard sales pitch</li>
          <li><strong>Concrete inzichten</strong> - Direct bruikbare AI adviezen</li>
          <li><strong>Praktische examples</strong> - Echte cases uit jouw sector</li>
          <li><strong>Clear next steps</strong> - Heldere vervolgstappen na het gesprek</li>
        </ul>
      </div>
      
      <!-- Emergency Contact -->
      <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; padding: 20px;">
        <h3 style="color: #3b82f6; margin-top: 0; font-size: 16px; margin-bottom: 10px;">📞 Contact & Noodgevallen</h3>
        <p style="color: #374151; line-height: 1.6; margin: 0;">
          <strong>Direct contact:</strong> <a href="mailto:niels@groeimetai.io" style="color: #3b82f6; text-decoration: none;">niels@groeimetai.io</a><br>
          <strong>Telefonisch:</strong> <a href="tel:+31612345678" style="color: #3b82f6; text-decoration: none;">+31 6 12345678</a><br>
          <strong>Laatste moment wijzigingen?</strong> Bel direct of stuur WhatsApp!
        </p>
      </div>
    </div>
    
    <!-- Professional Footer -->
    <div style="background: #f9fafb; padding: 25px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.5;">
        GroeimetAI • AI Infrastructure Specialists<br>
        Meeting ingepland op ${new Date().toLocaleString('nl-NL')}
        ${googleEventId ? ' • Geïntegreerd met Google Calendar' : ''}
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Send meeting invitation with calendar attachment
    const emailResponse = await transporter.sendMail({
      from: `"GroeimetAI - Meeting Uitnodiging" <${process.env.SMTP_USER}>`,
      to: attendees,
      subject: `📅 Meeting Bevestiging: ${new Date(date).toLocaleDateString('nl-NL', { month: 'long', day: 'numeric' })} om ${time}`,
      html: meetingEmailHtml,
      attachments: [
        {
          filename: 'meeting-invite.ics',
          content: icsContent,
          contentType: 'text/calendar'
        }
      ]
    });

    console.log('[Meeting API] Meeting invitation sent:', emailResponse.messageId);

    return NextResponse.json({
      success: true,
      message: 'Meeting ingepland en uitnodiging verzonden',
      meetingId: contactId,
      meetingLink: realMeetLink || meetingLink,
      googleEventId: googleEventId,
      isGoogleIntegrated: !!googleEventId,
      messageId: emailResponse.messageId,
      attendees: attendees
    });

  } catch (error) {
    console.error('[Meeting API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Fout bij plannen meeting',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateICSFile(event: {
  title: string;
  startTime: Date;
  endTime: Date;
  location: string;
  description: string;
  attendees: string[];
}): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//GroeimetAI//Meeting Scheduler//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${Date.now()}-${Math.random().toString(36).substr(2, 9)}@groeimetai.io
DTSTART:${formatDate(event.startTime)}
DTEND:${formatDate(event.endTime)}
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
LOCATION:${event.location}
ORGANIZER;CN=GroeimetAI:mailto:niels@groeimetai.io
${event.attendees.map(email => `ATTENDEE;CN=${email};RSVP=TRUE:mailto:${email}`).join('\n')}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
DESCRIPTION:Reminder: Meeting in 15 minutes
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;

  return icsContent;
}