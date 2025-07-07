import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/services/emailService';

export async function POST(request: NextRequest) {
  try {
    // Check if email service is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('Email service not configured - skipping email notification');
      // Return success even if email is not configured
      // This prevents breaking the user experience
      return NextResponse.json(
        { 
          success: true, 
          message: 'Request processed (email notifications disabled)',
          warning: 'Email service not configured'
        },
        { status: 200 }
      );
    }

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
  } catch (error: any) {
    console.error('Email API error:', error);

    // Check if it's a configuration error
    if (error.message?.includes('Email service unavailable') || 
        error.message?.includes('Email transporter not available')) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Request processed (email service temporarily unavailable)',
          warning: 'Email notifications are currently disabled'
        },
        { status: 200 }
      );
    }

    // For other errors, still return success but log the issue
    console.error('Unexpected email error:', error);
    return NextResponse.json(
      {
        success: true,
        message: 'Request processed (email notification failed)',
        warning: process.env.NODE_ENV === 'development' ? error.message : 'Email notification failed',
      },
      { status: 200 }
    );
  }
}
