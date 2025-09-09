import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { generateAssessmentFollowUpHTML } from '@/lib/email/templates';

export async function POST(req: NextRequest) {
  try {
    const { email, name, company, score, level, assessmentId } = await req.json();
    
    if (!email || !assessmentId) {
      return NextResponse.json(
        { error: 'Email and assessment ID required' },
        { status: 400 }
      );
    }

    console.log('📅 Scheduling follow-up sequence for:', email);

    // Use Firebase Send Email Extension - just add to 'mail' collection
    const emailTemplates = [
      {
        to: email,
        message: {
          subject: `🏆 Je Agent Readiness Score: ${score}/100 - ${level}`,
          html: generateAssessmentFollowUpHTML({ name, company, score, level, assessmentId })
        },
        template: {
          name: 'assessment_followup',
          data: { name, company, score, level, assessmentId }
        }
      }
    ];

    // Add immediate follow-up to mail collection (Firebase extension picks this up automatically)
    const scheduledEmails = [];
    for (const emailTemplate of emailTemplates) {
      const docRef = await addDoc(collection(db, 'mail'), emailTemplate);
      
      scheduledEmails.push({
        id: docRef.id,
        type: 'immediate_followup',
        scheduledFor: new Date()
      });
    }

    // Schedule delayed emails using a simpler approach
    const delayedEmails = [
      {
        scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        type: 'expert_invite'
      },
      {
        scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        type: 'value_reinforcement'
      }
    ];

    // Store delayed emails in scheduled_emails for processing later
    for (const delayedEmail of delayedEmails) {
      const docRef = await addDoc(collection(db, 'scheduled_emails'), {
        ...delayedEmail,
        email,
        name,
        company,
        score,
        level,
        assessmentId,
        status: 'scheduled',
        createdAt: new Date()
      });
      
      scheduledEmails.push({
        id: docRef.id,
        ...delayedEmail
      });
    }

    console.log('✅ Follow-up sequence scheduled:', scheduledEmails.length, 'emails');

    return NextResponse.json({
      success: true,
      scheduled: scheduledEmails.length,
      emails: scheduledEmails.map(e => ({
        id: e.id,
        type: e.type,
        scheduledFor: e.scheduledFor
      }))
    });

  } catch (error) {
    console.error('❌ Failed to schedule follow-ups:', error);
    return NextResponse.json(
      { error: 'Failed to schedule follow-ups' },
      { status: 500 }
    );
  }
}