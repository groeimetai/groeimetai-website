import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/services/emailService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    // Validate request
    if (!type || !data) {
      return NextResponse.json({ error: 'Invalid request: missing type or data' }, { status: 400 });
    }

    // Handle different email types
    switch (type) {
      case 'new-project-request':
        await emailService.sendNewProjectRequestNotification(data);
        break;

      case 'quote-status-change':
        await emailService.sendQuoteStatusChangeNotification(data);
        break;

      case 'new-meeting-request':
        await emailService.sendNewMeetingRequestNotification(data);
        break;

      default:
        return NextResponse.json({ error: `Unknown email type: ${type}` }, { status: 400 });
    }

    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email API error:', error);

    // Don't expose internal error details
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
