# Email Automation Setup Guide

## 🎯 Complete Follow-up Email System

We now have a **hybrid approach** using Firebase Send Email Extension + Cloud Functions for reliable, automated email delivery.

## 📧 How It Works

### 1. Immediate Emails (Firebase Send Email Extension)
- ✅ **Direct na assessment** → Email sent via `mail` collection
- ✅ **Betrouwbare delivery** → Firebase managed service
- ✅ **Automatic retry** → Extension handles failures

### 2. Delayed Emails (Cloud Functions + Scheduler) 
- ✅ **3 dagen later** → Expert Assessment invite
- ✅ **1 week later** → Value reinforcement  
- ✅ **Automatic processing** → Cron job every 15 minutes

## 🛠️ Setup Steps

### Step 1: Install Firebase Send Email Extension
```bash
# Go to Firebase Console → Extensions
# Install "Trigger Email from Firestore"
# Configure with your SMTP credentials (Namecheap, Gmail, etc.)
```

### Step 2: Deploy Cloud Functions
```bash
# Install functions dependencies
cd functions
npm install

# Deploy the scheduled email processor
firebase deploy --only functions

# This creates a Cloud Scheduler job that runs every 15 minutes
```

### Step 3: Deploy Security Rules
```bash
firebase deploy --only firestore:rules
```

## 🔄 Email Flow

### When User Completes Agent Assessment:

**1. Immediate Follow-up:**
```javascript
// Added to 'mail' collection → Firebase Extension sends immediately
{
  to: "user@company.com",
  message: {
    subject: "🏆 Je Agent Readiness Score: 85/100",
    html: professionalTemplate
  }
}
```

**2. Delayed Follow-ups:**
```javascript
// Added to 'scheduled_emails' collection → Cloud Function processes later
[
  {
    scheduledFor: Date.now() + 3 days,
    type: 'expert_invite',
    email: 'user@company.com',
    // ... data
  },
  {
    scheduledFor: Date.now() + 7 days, 
    type: 'value_reinforcement',
    email: 'user@company.com',
    // ... data
  }
]
```

**3. Automated Processing:**
```javascript
// Cloud Function runs every 15 minutes (cron: "*/15 * * * *")
// Checks scheduled_emails for due emails
// Moves them to 'mail' collection 
// Firebase Extension sends automatically
```

## 📊 Email Templates

### Immediate Follow-up
- 🎯 Assessment results with score/level
- 📊 Dashboard link  
- 🔓 Expert Assessment CTA

### Expert Invite (3 days later)
- 💭 "Ready voor volgende stap?" 
- 📊 ROI benefits for their company
- 📅 Expert Assessment booking link

### Value Reinforcement (1 week later)
- 📈 "Andere bedrijven zien 3-6 maanden ROI"
- 🚀 Success stories and metrics
- 💬 Conversation starter

## 🧪 Testing

### Manual Test (Development):
```javascript
// Add test scheduled email
db.collection('scheduled_emails').add({
  scheduledFor: new Date(Date.now() + 60000), // 1 minute from now
  type: 'expert_invite',
  email: 'test@example.com',
  name: 'Test User',
  company: 'Test Company',
  score: 75,
  level: 'Integration-Ready (Level 4)'
});

// Wait 1 minute → Check 'mail' collection → Email should be sent!
```

### Production Monitoring:
- Firebase Console → Functions → processScheduledEmails logs
- Firestore → `mail` collection (delivery status)
- Firestore → `scheduled_emails` collection (processing status)

## 💰 Cost

- **Firebase Send Email Extension**: Free (uses your SMTP)
- **Cloud Functions**: ~$0.10/month per scheduled function
- **Cloud Scheduler**: First 3 jobs free

## 🔧 Troubleshooting

### If emails don't send:
1. Check Firebase Extension configuration (SMTP settings)
2. Check Cloud Functions logs: `firebase functions:log`
3. Check Firestore security rules are deployed
4. Verify `mail` collection documents are being created

### If delayed emails don't trigger:
1. Check Cloud Functions deployment: `firebase functions:list`
2. Check Cloud Scheduler job: Google Cloud Console → Cloud Scheduler
3. Check `scheduled_emails` collection for due emails
4. Manual trigger: Call the function directly in Firebase Console

## ✅ Benefits

- 🔄 **Fully automated** - no manual intervention needed
- 🛡️ **Reliable** - Firebase managed services
- 📊 **Trackable** - full audit trail in Firestore  
- 💸 **Cost effective** - minimal cloud function usage
- 🚀 **Scalable** - handles high volume automatically

Now your follow-up emails will be sent reliably and automatically! 🎯