import { NextRequest, NextResponse } from 'next/server';
import { GoogleCalendarService } from '@/lib/google/calendar-service';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    console.log('📅 Fetching Google Calendar events...');
    
    const calendarService = new GoogleCalendarService();
    const result = await calendarService.listUpcomingMeetings(20);

    if (result.success) {
      console.log(`✅ Loaded ${result.events.length} calendar events`);
      
      return NextResponse.json({
        success: true,
        events: result.events,
        count: result.events.length
      });
    } else {
      console.error('❌ Google Calendar API failed:', result.error);
      
      return NextResponse.json({
        success: false,
        error: result.error,
        events: []
      });
    }

  } catch (error) {
    console.error('❌ Calendar events API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load calendar events',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}