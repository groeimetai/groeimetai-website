// Simplified Firebase Functions approach - no complex deployment needed
// Single function that runs on schedule

const { onSchedule } = require('firebase-functions/v1/pubsub');
const admin = require('firebase-admin');

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Simple scheduled function - runs every 15 minutes
exports.emailAutomation = onSchedule('every 15 minutes', async (context) => {
  console.log('🔄 Email automation triggered at:', new Date().toISOString());
  
  try {
    const now = admin.firestore.Timestamp.now();
    
    // Get due emails
    const snapshot = await db.collection('scheduled_emails')
      .where('status', '==', 'scheduled')
      .where('scheduledFor', '<=', now.toDate())
      .get();
    
    if (snapshot.empty) {
      console.log('📭 No emails due');
      return null;
    }
    
    console.log(`📧 Processing ${snapshot.size} due emails`);
    
    const batch = db.batch();
    
    snapshot.forEach((doc) => {
      const emailData = doc.data();
      
      // Add to mail collection for Firebase Send Email Extension
      const mailRef = db.collection('mail').doc();
      batch.set(mailRef, {
        to: emailData.email,
        message: {
          subject: getSubject(emailData.type, emailData),
          html: getTemplate(emailData.type, emailData)
        }
      });
      
      // Mark as sent
      batch.update(doc.ref, {
        status: 'sent',
        sentAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    await batch.commit();
    console.log(`✅ Successfully processed ${snapshot.size} emails`);
    
    return null;
  } catch (error) {
    console.error('❌ Email automation error:', error);
    return null;
  }
});

function getSubject(type, data) {
  switch (type) {
    case 'expert_invite':
      return `Ready voor de volgende stap, ${data.name}?`;
    case 'value_reinforcement':
      return `📈 ${data.company}: Andere bedrijven zien 3-6 maanden ROI`;
    default:
      return 'Follow-up: Agent Assessment';
  }
}

function getTemplate(type, data) {
  // Simple HTML templates
  const baseStyle = 'style="max-width: 600px; margin: 0 auto; background: #080D14; color: white; padding: 30px; font-family: system-ui, sans-serif;"';
  
  switch (type) {
    case 'expert_invite':
      return `
        <div ${baseStyle}>
          <h1 style="color: #F87315;">Ready voor de volgende stap, ${data.name}?</h1>
          <p>Je score was ${data.score}/100 - ${data.level}</p>
          <p>Expert Assessment (€2.500) geeft concrete next steps voor ${data.company}</p>
          <a href="https://groeimetai.io/expert-assessment" 
             style="display:inline-block; background:#F87315; color:white; padding:15px 30px; text-decoration:none; border-radius:8px;">
            📅 Book Expert Assessment
          </a>
        </div>
      `;
      
    case 'value_reinforcement':
      return `
        <div ${baseStyle}>
          <h1 style="color: #F87315;">📈 Andere bedrijven zien 3-6 maanden ROI</h1>
          <p>Hoi ${data.name}, hoe gaat het met je agent journey?</p>
          <ul style="color: white;">
            <li>🚀 85% snellere responstijden</li>
            <li>💰 €2.8M jaarlijkse besparing</li>
            <li>⚡ 72% hogere oplossingsgraad</li>
          </ul>
          <a href="https://groeimetai.io/contact" 
             style="display:inline-block; background:#F87315; color:white; padding:15px 30px; text-decoration:none; border-radius:8px;">
            💬 Start Gesprek
          </a>
        </div>
      `;
      
    default:
      return `<div ${baseStyle}><h1 style="color:#F87315;">Follow-up</h1><p>Hoi ${data.name}!</p></div>`;
  }
}