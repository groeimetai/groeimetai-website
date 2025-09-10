import { NextRequest, NextResponse } from 'next/server';
import { GoogleCalendarService } from '@/lib/google/calendar-service';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is verplicht' },
        { status: 400 }
      );
    }

    console.log('🗑️ Deleting Google Calendar event:', eventId);
    
    const calendarService = new GoogleCalendarService();
    const result = await calendarService.deleteMeeting(eventId);

    if (result.success) {
      console.log('✅ Google Calendar event deleted:', eventId);
      
      return NextResponse.json({
        success: true,
        message: 'Meeting verwijderd uit Google Calendar'
      });
    } else {
      console.error('❌ Google Calendar delete failed:', result.error);
      
      return NextResponse.json({
        success: false,
        error: result.error
      });
    }

  } catch (error) {
    console.error('❌ Calendar delete API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete calendar event',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}