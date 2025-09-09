# 🚀 Simple Email Automation Setup

## Probleem met Cloud Functions 
Firebase Functions deployment kan complex zijn. Hier is een **eenvoudigere oplossing** die direct werkt!

## ⚡ Instant Solution: External Cron Service

Gebruik een externe cron service om je endpoint aan te roepen. Veel eenvoudiger dan Cloud Functions!

### Option 1: Cron-job.org (FREE)
1. Ga naar https://cron-job.org/en/
2. Maak gratis account
3. Create nieuwe cron job:
   - **URL**: `https://groeimetai.io/api/email/trigger-scheduled`
   - **Schedule**: Every 15 minutes (`*/15 * * * *`)
   - **Method**: GET
   - **Title**: "GroeimetAI Follow-up Emails"

### Option 2: UptimeRobot (FREE)
1. Ga naar https://uptimerobot.com/
2. Add Monitor → HTTP(s)
3. **URL**: `https://groeimetai.io/api/email/trigger-scheduled`
4. **Monitoring interval**: 15 minutes
5. **Monitor type**: Keyword (verwacht "success")

### Option 3: EasyCron (FREE tier)
1. Ga naar https://www.easycron.com/
2. Create cron job:
   - **URL**: `https://groeimetai.io/api/email/trigger-scheduled`
   - **Schedule**: `*/15 * * * *` (every 15 minutes)

## 🔄 How It Works

### Email Flow:
```
1. User completes Agent Assessment
   ↓
2. Immediate email → 'mail' collection → Firebase Extension sends
   ↓
3. Delayed emails → 'scheduled_emails' collection (future dates)
   ↓
4. External cron service calls /api/email/trigger-scheduled every 15 min
   ↓
5. API checks 'scheduled_emails' for due emails
   ↓
6. Due emails moved to 'mail' collection
   ↓
7. Firebase Extension sends automatically!
```

### Email Schedule:
- **Direct**: Assessment results + dashboard link
- **3 dagen later**: Expert Assessment invite  
- **1 week later**: Value reinforcement

## 🛠️ Setup Steps

### Step 1: Deploy Security Rules
```bash
firebase login --reauth
firebase deploy --only firestore:rules
```

### Step 2: Install Firebase Send Email Extension
1. Firebase Console → Extensions 
2. Install "Trigger Email from Firestore"
3. Configure met je SMTP credentials

### Step 3: Setup External Cron
1. Choose één van de services hierboven
2. Set URL: `https://groeimetai.io/api/email/trigger-scheduled`
3. Set interval: every 15 minutes

### Step 4: Test
```bash
# Add test scheduled email to Firestore:
{
  email: 'test@example.com',
  name: 'Test User', 
  company: 'Test Co',
  score: 75,
  level: 'Integration-Ready',
  type: 'expert_invite',
  scheduledFor: new Date(Date.now() + 60000), // 1 minute from now
  status: 'scheduled'
}

# Wait 15 minutes → Cron service triggers → Email sent!
```

## ✅ Benefits

- 🚀 **Much simpler** than Cloud Functions
- 💰 **Free** external cron services available  
- ⚡ **Instant setup** - no complex deployment
- 🛡️ **Reliable** - external services have 99.9% uptime
- 🔄 **Self-healing** - if one service fails, switch to another

## 🧪 Testing

### Manual Test:
Visit: `https://groeimetai.io/api/email/trigger-scheduled`

Should return:
```json
{
  "success": true,
  "processed": 2,
  "message": "Processed 2 emails successfully"
}
```

### Production Monitoring:
- Check cron service logs
- Monitor Firestore `mail` collection  
- Check `scheduled_emails` collection status updates

## 🎯 Why This is Better

Instead of complex Cloud Functions, you get:
- ✅ **Zero deployment complexity**
- ✅ **External reliability** 
- ✅ **Easy troubleshooting**
- ✅ **Quick setup** (5 minutes vs hours)

Choose this approach - it's production-ready and much simpler! 🚀