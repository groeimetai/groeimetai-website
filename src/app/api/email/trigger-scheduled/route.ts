import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Manual trigger endpoint for scheduled emails
// Call this from a simple cron service like cron-job.org or UptimeRobot
export async function GET(req: NextRequest) {
  try {
    console.log('Checking for due emails at:', new Date().toISOString());

    const now = new Date();
    console.log('Looking for emails scheduled before:', now.toISOString());

    // Get scheduled emails that are due
    const snapshot = await adminDb
      .collection('scheduled_emails')
      .where('status', '==', 'scheduled')
      .where('scheduledFor', '<=', now)
      .get();

    console.log(`Query returned ${snapshot.size} documents`);

    if (snapshot.empty) {
      console.log('No emails due');
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No emails due'
      });
    }

    console.log(`Processing ${snapshot.size} due emails`);

    let processed = 0;
    let errors = 0;

    // Process each due email
    for (const emailDoc of snapshot.docs) {
      try {
        const emailData = emailDoc.data();

        // Create email in 'mail' collection for Firebase Send Email Extension
        await adminDb.collection('mail').add({
          to: emailData.email,
          message: {
            subject: getEmailSubject(emailData.type, emailData),
            html: getEmailTemplate(emailData.type, emailData)
          },
          template: {
            name: emailData.type,
            data: emailData
          }
        });

        // Mark as sent
        await adminDb.collection('scheduled_emails').doc(emailDoc.id).update({
          status: 'sent',
          sentAt: new Date()
        });

        processed++;
        console.log(`Processed ${emailData.type} for ${emailData.email}`);

      } catch (emailError) {
        console.error(`Failed to process email:`, emailError);

        // Mark as failed
        await adminDb.collection('scheduled_emails').doc(emailDoc.id).update({
          status: 'failed',
          error: emailError instanceof Error ? emailError.message : String(emailError),
          failedAt: new Date()
        });

        errors++;
      }
    }

    console.log(`Email processing complete: ${processed} sent, ${errors} failed`);

    return NextResponse.json({
      success: true,
      processed,
      errors,
      message: `Processed ${processed} emails successfully`
    });

  } catch (error) {
    console.error('Email trigger error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'UnknownError'
    });

    return NextResponse.json(
      {
        error: 'Failed to process scheduled emails',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

function getEmailSubject(type: string, data: any): string {
  switch (type) {
    case 'expert_invite':
      return `Ready voor de volgende stap, ${data.name}? Expert Assessment`;
    case 'value_reinforcement':
      return `${data.company}: Andere bedrijven zien 3-6 maanden ROI`;
    default:
      return `Follow-up: Je Agent Assessment`;
  }
}

function getEmailTemplate(type: string, data: any): string {
  switch (type) {
    case 'expert_invite':
      return generateExpertInviteHTML(data);
    case 'value_reinforcement':
      return generateValueReinforcementHTML(data);
    default:
      return `<p>Follow-up email voor ${data.name} (${data.company})</p>`;
  }
}

function generateExpertInviteHTML(data: any): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; background-color: #080D14; font-family: system-ui, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; color: white; padding: 30px;">
    <h1 style="color: #F87315; text-align: center;">Ready voor de volgende stap, ${data.name}?</h1>
    <p style="color: white;">Je assessment score was ${data.score}/100 - ${data.level}</p>

    <div style="background: rgba(248,115,21,0.1); border: 1px solid rgba(248,115,21,0.3); padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #F87315;">Expert Assessment (€2.500) geeft je:</h3>
      <ul style="color: white;">
        <li>Specifieke ROI berekening voor ${data.company}</li>
        <li>Custom roadmap met concrete tijdlijnen</li>
        <li>Business case voor budget approval</li>
        <li>Expert review call met agent architect</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="https://groeimetai.io/expert-assessment"
         style="display: inline-block; background: #F87315; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
        Book Expert Assessment
      </a>
    </div>

    <p style="color: rgba(255,255,255,0.6); text-align: center; font-size: 12px;">
      €2.500 - Aftrekbaar bij vervolgproject
    </p>
  </div>
</body>
</html>
  `;
}

function generateValueReinforcementHTML(data: any): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; background-color: #080D14; font-family: system-ui, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; color: white; padding: 30px;">
    <h1 style="color: #F87315; text-align: center;">Andere bedrijven zien 3-6 maanden ROI</h1>
    <p style="color: white;">Hoi ${data.name}, hoe staat het met je agent journey?</p>

    <div style="background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #22c55e;">Wat andere bedrijven bereikten:</h3>
      <ul style="color: white;">
        <li>85% snellere responstijden (klantenservice)</li>
        <li>€2.8M jaarlijkse besparing (enterprise)</li>
        <li>72% hogere oplossingsgraad (support)</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 25px 0;">
      <a href="https://groeimetai.io/dashboard"
         style="background: #F87315; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin-right: 10px;">
        Check Dashboard
      </a>
      <a href="https://groeimetai.io/contact"
         style="background: transparent; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);">
        Start Gesprek
      </a>
    </div>
  </div>
</body>
</html>
  `;
}
