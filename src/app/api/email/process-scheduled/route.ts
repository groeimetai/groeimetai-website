import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(req: NextRequest) {
  try {
    console.log('🔄 Processing scheduled emails...');

    // Get all scheduled emails that are due
    const now = new Date();
    const q = query(
      collection(db, 'scheduled_emails'),
      where('status', '==', 'scheduled'),
      where('scheduledFor', '<=', now)
    );

    const querySnapshot = await getDocs(q);
    let processed = 0;
    let errors = 0;

    for (const emailDoc of querySnapshot.docs) {
      try {
        const emailData = emailDoc.data();
        
        console.log('📧 Processing scheduled email:', emailData.type, 'for', emailData.email);

        // Send the follow-up email
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/email/send-followup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: emailData.email,
            templateId: emailData.templateId,
            data: {
              name: emailData.name,
              company: emailData.company,
              score: emailData.score,
              level: emailData.level,
              assessmentId: emailData.assessmentId
            }
          })
        });

        if (response.ok) {
          // Mark as sent
          await updateDoc(doc(db, 'scheduled_emails', emailDoc.id), {
            status: 'sent',
            sentAt: new Date(),
            attempts: (emailData.attempts || 0) + 1
          });
          
          processed++;
          console.log('✅ Sent scheduled email:', emailData.type);
        } else {
          // Mark as failed, retry later
          await updateDoc(doc(db, 'scheduled_emails', emailDoc.id), {
            status: 'failed', 
            lastError: `API error: ${response.status}`,
            attempts: (emailData.attempts || 0) + 1,
            nextRetry: new Date(Date.now() + 60 * 60 * 1000) // Retry in 1 hour
          });
          
          errors++;
          console.error('❌ Failed to send scheduled email:', response.status);
        }

      } catch (emailError) {
        console.error('❌ Error processing email:', emailError);
        errors++;
      }
    }

    console.log(`📊 Processed ${processed} emails, ${errors} errors`);

    return NextResponse.json({
      success: true,
      processed,
      errors,
      message: `Processed ${processed} scheduled emails`
    });

  } catch (error) {
    console.error('❌ Failed to process scheduled emails:', error);
    return NextResponse.json(
      { error: 'Failed to process scheduled emails' },
      { status: 500 }
    );
  }
}