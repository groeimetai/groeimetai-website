import { NextRequest, NextResponse } from 'next/server';
import { createMollieClient } from '@mollie/api-client';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const { id: paymentId } = JSON.parse(body);

    // Verify payment with Mollie
    const payment = await mollieClient.payments.get(paymentId);
    
    console.log('🔔 Payment webhook received:', {
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount,
      metadata: payment.metadata
    });

    if (payment.status === 'paid') {
      await handleSuccessfulPayment(payment);
    } else if (payment.status === 'failed' || payment.status === 'expired') {
      await handleFailedPayment(payment);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Payment webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(payment: any): Promise<void> {
  const metadata = payment.metadata;
  
  try {
    // Create Expert Assessment Project
    const projectId = `expert_${Date.now()}`;
    
    await setDoc(doc(db, 'expert_assessments', projectId), {
      id: projectId,
      userId: metadata.userId,
      userEmail: metadata.userEmail,
      userName: metadata.userName,
      userCompany: metadata.userCompany,
      paymentId: payment.id,
      amount: payment.amount.value,
      currency: payment.amount.currency,
      status: 'paid',
      assessmentStage: 'intake_scheduled',
      createdAt: new Date(),
      paidAt: new Date(),
      
      // Assessment process tracking
      process: {
        intakeCall: { status: 'pending', scheduledFor: null },
        documentCollection: { status: 'pending', uploadedDocs: [] },
        processMapping: { status: 'pending', progress: 0 },
        apiAnalysis: { status: 'pending', findings: [] },
        roadmapDelivery: { status: 'pending', deliveredAt: null },
        followUp: { status: 'pending', scheduledFor: null }
      },
      
      // Communication
      chatEnabled: true,
      notificationsEnabled: true
    });

    // Update user account with Expert Assessment access
    await updateDoc(doc(db, 'users', metadata.userId), {
      expertAssessments: [projectId],
      premiumServices: ['expert_assessment'],
      lastPaymentAt: new Date()
    });

    // Create welcome message in chat
    await createWelcomeMessage(projectId, metadata);
    
    // Notify admin of new Expert Assessment
    await notifyAdminNewAssessment(projectId, metadata);

    console.log('✅ Expert Assessment project created:', projectId);

  } catch (error) {
    console.error('❌ Error creating Expert Assessment project:', error);
  }
}

async function handleFailedPayment(payment: any): Promise<void> {
  console.log('❌ Payment failed:', {
    paymentId: payment.id,
    status: payment.status,
    user: payment.metadata.userEmail
  });
  
  // Could log failed payment for follow-up
}

async function createWelcomeMessage(projectId: string, metadata: any): Promise<void> {
  await setDoc(doc(db, 'expert_assessments', projectId, 'messages', 'welcome'), {
    id: 'welcome',
    senderId: 'system',
    senderName: 'GroeimetAI Expert Team',
    content: `🎉 Welkom ${metadata.userName}! Je Expert Assessment is gestart.

📋 **Volgende stappen:**
1. Intake call plannen (30 min)
2. Business documenten uploaden  
3. Process mapping sessie (2-3 uur)
4. API analyse en roadmap ontwikkeling
5. Deliverable oplevering (roadmap + ROI + plan)

💬 **Communicatie:** Via deze chat kunnen we real-time overleggen tijdens het hele proces.

⏰ **Timeline:** 2-3 weken voor volledige assessment en roadmap.

Laten we beginnen! Wanneer past een intake call het beste?`,
    timestamp: new Date(),
    type: 'system_message',
    read: false
  });
}

async function notifyAdminNewAssessment(projectId: string, metadata: any): Promise<void> {
  console.log('🔔 New Expert Assessment - Admin notification needed', {
    projectId,
    company: metadata.userCompany,
    email: metadata.userEmail
  });
  
  // Could create admin notification in existing system
}