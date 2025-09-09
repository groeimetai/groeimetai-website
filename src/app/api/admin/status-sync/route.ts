import { NextRequest, NextResponse } from 'next/server';
import { StatusSyncService } from '@/services/statusSync';

export async function POST(req: NextRequest) {
  try {
    const { leadId, newStatus, context } = await req.json();
    
    // Update status across all systems
    await StatusSyncService.updateLeadStatus(leadId, newStatus, context);
    
    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Status sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync status' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('leadId');
    
    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 });
    }
    
    // Get current status for lead
    const status = await getLeadStatus(leadId);
    
    return NextResponse.json({
      success: true,
      status,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Status fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch status' },
      { status: 500 }
    );
  }
}

async function getLeadStatus(leadId: string): Promise<any> {
  // Implementation would fetch from database
  return {
    leadId,
    customerStatus: 'assessment_complete',
    adminStatus: 'Qualified Lead',
    stage: 'assessment',
    priority: 'medium',
    lastUpdate: new Date()
  };
}