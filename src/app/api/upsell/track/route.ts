import { NextRequest, NextResponse } from 'next/server';
import { adminDb, serverTimestamp } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const { action, component, userId, assessmentId, variant } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Log interaction for conversion analytics
    await adminDb.collection('upsell_analytics').add({
      userId,
      action, // 'view', 'click', 'dismiss', 'convert'
      component, // 'locked_section', 'email_cta', 'dashboard_banner'
      assessmentId: assessmentId || null,
      variant: variant || null,
      timestamp: serverTimestamp(),
      sessionData: {
        userAgent: req.headers.get('user-agent'),
        referer: req.headers.get('referer'),
        ip: req.ip || 'unknown'
      }
    });

    // Handle conversion events
    if (action === 'convert') {
      await handleConversion(userId, assessmentId);
    }

    // Hot lead notifications
    if (action === 'view' && component.includes('locked_') && variant === 'hot') {
      await notifyAdminHotLeadEngagement(userId, component);
    }

    return NextResponse.json({
      success: true,
      message: 'Interaction tracked successfully'
    });

  } catch (error) {
    console.error('Upsell tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track interaction' },
      { status: 500 }
    );
  }
}

async function handleConversion(userId: string, assessmentId: string): Promise<void> {
  // Update campaign status
  await adminDb.collection('upsell_campaigns').doc(userId).update({
    status: 'converted',
    convertedAt: serverTimestamp(),
    conversionSource: 'dashboard_locked_content'
  });

  // Create expert assessment request
  await adminDb.collection('expert_assessment_requests').add({
    userId,
    assessmentId,
    requestedAt: serverTimestamp(),
    status: 'pending_contact',
    priority: 'high',
    source: 'upsell_conversion'
  });

  // Notify sales team immediately
  await adminDb.collection('admin_notifications').add({
    type: 'expert_assessment_conversion',
    priority: 'critical',
    title: 'Expert Assessment Conversion!',
    message: 'User converted from dashboard locked content',
    data: {
      userId,
      assessmentId,
      conversionTime: new Date().toISOString()
    },
    createdAt: serverTimestamp(),
    read: false
  });
}

async function notifyAdminHotLeadEngagement(userId: string, component: string): Promise<void> {
  await adminDb.collection('admin_notifications').add({
    type: 'hot_lead_engagement',
    priority: 'high',
    title: 'Hot Lead Engaging with Locked Content',
    message: `High-value prospect viewing ${component}`,
    data: {
      userId,
      component,
      timestamp: new Date().toISOString(),
      action: 'Follow up within 2 hours'
    },
    createdAt: serverTimestamp(),
    read: false
  });
}
