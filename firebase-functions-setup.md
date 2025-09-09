# Firebase Functions Setup voor Upsell Automation

## 1. Firebase Functions Initialiseren

```bash
# Installeer Firebase CLI (als je die nog niet hebt)
npm install -g firebase-tools

# Login naar Firebase
firebase login

# Initialiseer functions in je project directory
firebase init functions

# Kies:
# - Use existing project: [jouw-firebase-project]
# - Language: TypeScript
# - Install dependencies: Yes
```

## 2. Environment Variables Setup

```bash
# In functions directory
cd functions

# Set environment variables voor production
firebase functions:config:set \
  anthropic.api_key="jouw_claude_api_key" \
  email.service_key="jouw_email_service_key" \
  app.url="https://groeimetai.io"

# Voor local development
firebase functions:config:get > .runtimeconfig.json
```

## 3. Deploy Functions

```bash
# Deploy alle functions
firebase deploy --only functions

# Of specifieke functions
firebase deploy --only functions:handleAssessment,functions:generateDynamicReport
```

## 4. Firestore Security Rules Update

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Assessment documents
    match /assessments/{assessmentId} {
      allow read, write: if request.auth != null;
    }
    
    // Reports - user can only read their own
    match /reports/{reportId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if false; // Only functions can write reports
    }
    
    // Upsell campaigns - private to user
    match /upsell_campaigns/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Admin notifications - admin only
    match /admin_notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## 5. Email Service Integration (Interim Solution)

Voor nu kun je ook een eenvoudigere email integratie gebruiken:

```typescript
// src/services/email/simpleEmailService.ts
export class SimpleEmailService {
  static async sendFollowUpEmail(userEmail: string, reportData: any): Promise<void> {
    try {
      const response = await fetch('/api/email/send-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: userEmail,
          templateId: 'assessment_followup',
          data: {
            score: reportData.score,
            company: reportData.company,
            lockedSections: reportData.lockedSections
          }
        })
      });

      if (!response.ok) {
        throw new Error('Email send failed');
      }
    } catch (error) {
      console.error('Email error:', error);
    }
  }
}
```

## 6. Testing Environment

```bash
# Start Firebase emulators voor testing
firebase emulators:start --only functions,firestore

# Test functions locally
curl -X POST http://localhost:5001/[project]/us-central1/handleAssessment \
  -H "Content-Type: application/json" \
  -d '{"assessmentData": {...}}'
```

## 7. Environment Variables (.env.local)

```bash
# Claude API
ANTHROPIC_API_KEY=sk-ant-api03-...your_key

# Firebase
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_ADMIN_SDK_KEY=your-admin-sdk-key

# Email service (gebruik bijv. SendGrid of Mailgun)
EMAIL_SERVICE_API_KEY=your-email-service-key
EMAIL_FROM_ADDRESS=info@groeimetai.io

# Features toggles
ENABLE_DYNAMIC_REPORTS=true
ENABLE_UPSELL_AUTOMATION=true
ENABLE_ADMIN_NOTIFICATIONS=true
```