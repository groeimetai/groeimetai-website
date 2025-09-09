const { onSchedule } = require('firebase-functions/v2/scheduler');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();

// Scheduled function that runs every 15 minutes to check for due emails
exports.processScheduledEmails = onSchedule("*/15 * * * *", async (event) => {
  console.log('🔄 Processing scheduled emails...');
  
  try {
    // Get current time
    const now = new Date();
    
    // Query scheduled emails that are due
    const scheduledEmailsSnapshot = await db.collection('scheduled_emails')
      .where('status', '==', 'scheduled')
      .where('scheduledFor', '<=', now)
      .get();
    
    if (scheduledEmailsSnapshot.empty) {
      console.log('📭 No scheduled emails due');
      return;
    }
    
    console.log(`📧 Found ${scheduledEmailsSnapshot.size} emails to process`);
    
    // Process each email
    const batch = db.batch();
    const emailPromises = [];
    
    scheduledEmailsSnapshot.forEach((doc) => {
      const emailData = doc.data();
      console.log(`📤 Processing email: ${emailData.type} for ${emailData.email}`);
      
      // Create email document in 'mail' collection (Firebase Send Email Extension picks this up)
      const mailDocRef = db.collection('mail').doc();
      
      let subject, html;
      
      switch (emailData.type) {
        case 'expert_invite':
          subject = `Ready voor de volgende stap? Expert Assessment`;
          html = generateExpertInviteHTML(emailData);
          break;
          
        case 'value_reinforcement':
          subject = `Andere bedrijven zien 3-6 maanden ROI 📈`;
          html = generateValueReinforcementHTML(emailData);
          break;
          
        default:
          subject = `Follow-up: Je Agent Readiness Assessment`;
          html = generateDefaultFollowUpHTML(emailData);
      }
      
      // Add email to mail collection
      batch.set(mailDocRef, {
        to: emailData.email,
        message: {
          subject: subject,
          html: html
        },
        template: {
          name: emailData.type,
          data: {
            name: emailData.name,
            company: emailData.company,
            score: emailData.score,
            level: emailData.level,
            assessmentId: emailData.assessmentId
          }
        }
      });
      
      // Mark scheduled email as processed
      const scheduledDocRef = db.collection('scheduled_emails').doc(doc.id);
      batch.update(scheduledDocRef, {
        status: 'sent',
        sentAt: new Date(),
        mailDocId: mailDocRef.id
      });
    });
    
    // Execute batch
    await batch.commit();
    console.log(`✅ Successfully processed ${scheduledEmailsSnapshot.size} scheduled emails`);
    
  } catch (error) {
    console.error('❌ Error processing scheduled emails:', error);
  }
});

function generateExpertInviteHTML(data) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Expert Assessment Invitation</title></head>
<body style="margin: 0; padding: 0; background-color: #080D14; font-family: system-ui, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #080D14; color: white; padding: 30px;">
    
    <div style="text-align: center; margin-bottom: 25px;">
      <h1 style="color: #F87315; margin: 0 0 10px 0; font-size: 24px;">
        Ready voor de volgende stap, ${data.name}?
      </h1>
      <p style="color: rgba(255,255,255,0.8); margin: 0;">
        Je assessment score was ${data.score}/100 - ${data.level}
      </p>
    </div>

    <div style="background: rgba(248,115,21,0.1); border: 1px solid rgba(248,115,21,0.3); padding: 20px; border-radius: 8px; margin-bottom: 25px;">
      <h3 style="color: #F87315; margin: 0 0 15px 0;">
        Veel bedrijven vragen nu: "Wat zijn de concrete next steps?"
      </h3>
      <p style="color: white; margin: 0 0 15px 0; line-height: 1.5;">
        Expert Assessment (€2.500) geeft je:
      </p>
      <ul style="color: white; margin: 0; padding-left: 20px; line-height: 1.6;">
        <li>📊 Specifieke ROI berekening voor ${data.company}</li>
        <li>🎯 Custom roadmap met concrete tijdlijnen</li>
        <li>💰 Business case voor budget approval</li>
        <li>📞 Expert review call met agent architect</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 25px 0;">
      <a href="https://groeimetai.io/expert-assessment" 
         style="display: inline-block; background: #F87315; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
        📅 Book Expert Assessment
      </a>
    </div>

    <p style="color: rgba(255,255,255,0.6); text-align: center; font-size: 12px; margin: 20px 0 0 0;">
      €2.500 - Aftrekbaar bij vervolgproject
    </p>
  </div>
</body>
</html>
  `;
}

function generateValueReinforcementHTML(data) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Value Reinforcement</title></head>
<body style="margin: 0; padding: 0; background-color: #080D14; font-family: system-ui, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #080D14; color: white; padding: 30px;">
    
    <div style="text-align: center; margin-bottom: 25px;">
      <h1 style="color: #F87315; margin: 0 0 15px 0; font-size: 24px;">
        📈 Andere bedrijven zien 3-6 maanden ROI
      </h1>
      <p style="color: rgba(255,255,255,0.8); margin: 0;">
        Hoi ${data.name}, hoe staat het met je agent journey?
      </p>
    </div>

    <div style="background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); padding: 20px; border-radius: 8px; margin-bottom: 25px;">
      <h3 style="color: #22c55e; margin: 0 0 15px 0;">
        Wat andere bedrijven bereikten:
      </h3>
      <ul style="color: white; margin: 0; padding-left: 20px; line-height: 1.6;">
        <li>🚀 85% snellere responstijden (klantenservice)</li>
        <li>💰 €2.8M jaarlijkse besparing (enterprise)</li>
        <li>⚡ 72% hogere oplossingsgraad (support)</li>
        <li>🎯 3-6 maanden return on investment</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 25px 0;">
      <a href="https://groeimetai.io/dashboard" 
         style="display: inline-block; background: #F87315; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-right: 10px;">
        📊 Check je Dashboard
      </a>
      <a href="https://groeimetai.io/contact" 
         style="display: inline-block; background: transparent; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); font-weight: 600;">
        💬 Start Gesprek
      </a>
    </div>
    
  </div>
</body>
</html>
  `;
}

function generateDefaultFollowUpHTML(data) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Follow-up</title></head>
<body style="margin: 0; padding: 0; background-color: #080D14; font-family: system-ui, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #080D14; color: white; padding: 30px;">
    <h1 style="color: #F87315;">Follow-up: ${data.company}</h1>
    <p>Hoi ${data.name}, hoe gaat het met je agent readiness journey?</p>
    <p>Score: ${data.score}/100 - ${data.level}</p>
  </div>
</body>
</html>
  `;
}