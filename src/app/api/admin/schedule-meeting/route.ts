import { NextRequest, NextResponse } from 'next/server';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

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

    // Generate meeting link based on type
    let meetingLink = location;
    if (type === 'google_meet') {
      // In real implementation, use Google Calendar API to create meet link
      meetingLink = `https://meet.google.com/new`;
    } else if (type === 'zoom') {
      // In real implementation, use Zoom API 
      meetingLink = `https://zoom.us/j/meeting-id`;
    }

    // Create calendar event ICS file content
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + (duration * 60000));
    
    const icsContent = generateICSFile({
      title: `GroeimetAI Consultatie`,
      startTime: startDateTime,
      endTime: endDateTime,
      location: meetingLink,
      description: `Agenda:\n${agenda.map(item => `${item.time} - ${item.title}: ${item.description}`).join('\n')}\n\nNotities:\n${notes}`,
      attendees: [...attendees, 'niels@groeimetai.io']
    });

    // Update contact in Firestore
    await updateDoc(doc(db, 'contact_submissions', contactId), {
      status: 'scheduled',
      meetingDate: date,
      meetingTime: time,
      meetingDuration: duration,
      meetingLocation: meetingLink,
      meetingType: type,
      agenda: agenda,
      notes: notes,
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

    // Get contact details (in real app, fetch from Firestore)
    const agendaHtml = agenda.map(item => `
      <tr>
        <td style="padding: 8px; border: 1px solid #e5e7eb; background: #f9fafb; color: #374151; font-weight: 600; width: 80px;">${item.time}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb; color: #111827;"><strong>${item.title}</strong><br><span style="color: #6b7280; font-size: 14px;">${item.description}</span></td>
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
      <h1 style="color: white; margin: 0; font-size: 24px;">📅 Meeting Ingepland</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px;">
      <!-- Meeting Details -->
      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #111827; margin-top: 0; font-size: 16px; margin-bottom: 15px;">📋 Meeting Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 120px;">Datum:</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 500;">${new Date(date).toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Tijd:</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 500;">${time} (${duration} minuten)</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Type:</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 500;">
              ${type === 'google_meet' ? '📹 Google Meet' : 
                type === 'zoom' ? '📹 Zoom' : 
                type === 'teams' ? '📹 Microsoft Teams' : 
                type === 'phone' ? '📞 Telefoon' : '🏢 Kantoor'}
            </td>
          </tr>
          ${meetingLink ? `
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Link:</td>
            <td style="padding: 8px 0;">
              <a href="${meetingLink}" style="color: #F87315; text-decoration: none; font-weight: 500;">${meetingLink}</a>
            </td>
          </tr>
          ` : ''}
        </table>
      </div>
      
      ${agenda.length > 0 ? `
      <!-- Agenda -->
      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #111827; margin-top: 0; font-size: 16px; margin-bottom: 15px;">📋 Agenda</h3>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb;">
          ${agendaHtml}
        </table>
      </div>
      ` : ''}
      
      ${notes ? `
      <!-- Notes -->
      <div style="background: rgba(248,115,21,0.1); border: 1px solid rgba(248,115,21,0.3); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #F87315; margin-top: 0; font-size: 16px; margin-bottom: 10px;">📝 Voorbereiding & Notities</h3>
        <p style="color: #374151; line-height: 1.6; margin: 0; white-space: pre-wrap;">${notes}</p>
      </div>
      ` : ''}
      
      <!-- Join Button -->
      ${type !== 'phone' && type !== 'in_person' ? `
      <div style="text-align: center; padding: 20px 0;">
        <a href="${meetingLink}" style="display: inline-block; background: #F87315; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          🔗 Deelnemen aan Meeting
        </a>
      </div>
      ` : ''}
      
      <!-- Contact Info -->
      <div style="background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); border-radius: 8px; padding: 20px; margin-top: 20px;">
        <h3 style="color: #22c55e; margin-top: 0; font-size: 16px; margin-bottom: 10px;">📞 Contact</h3>
        <p style="color: #374151; line-height: 1.6; margin: 0;">
          Vragen? Bel me direct: <a href="tel:+31612345678" style="color: #22c55e; text-decoration: none;">+31 6 12345678</a><br>
          Of stuur een email: <a href="mailto:niels@groeimetai.io" style="color: #22c55e; text-decoration: none;">niels@groeimetai.io</a>
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        GroeimetAI • Meeting ingepland op ${new Date().toLocaleString('nl-NL')}
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
      meetingLink,
      messageId: emailResponse.messageId
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