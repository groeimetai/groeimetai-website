# Email Configuration Guide

## Overview

GroeimetAI uses two email systems:

1. **Firebase Authentication Emails** - For verification emails, password resets, etc.
2. **SMTP/Custom Emails** - For project notifications, quotes, and custom emails

## 1. Firebase Authentication Email Configuration

### Problem

By default, Firebase sends emails from `noreply@[your-project-id].firebaseapp.com`. To use your custom domain:

### Solution - Configure Firebase Email Templates

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com
   - Select your project: `groeimetai-458417`

2. **Navigate to Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Go to "Templates" tab

3. **Configure Email Address**
   - Click "Email address" at the top
   - Change from: `noreply@groeimetai-458417.firebaseapp.com`
   - Change to: `noreply@groeimetai.io`
   - Add reply-to: `support@groeimetai.io`

4. **Verify Domain (Required)**
   - Firebase will ask you to verify domain ownership
   - Add the TXT record to your DNS settings
   - Wait for verification (can take up to 48 hours)

5. **Customize Email Templates**
   For each template type:
   - Email address verification
   - Password reset
   - Email address change

   Customize:
   - Subject line (add Dutch translations)
   - Email body (make it match your brand)
   - Add your logo URL
   - Update colors to match brand (#F97316 - orange)

### Example Template Customization

**Subject:**

```
[EN] Verify your email for GroeimetAI
[NL] Verifieer je e-mailadres voor GroeimetAI
```

**Body:**

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #000; padding: 20px; text-align: center;">
    <img src="https://groeimetai.io/logo.png" alt="GroeimetAI" style="height: 40px;" />
  </div>
  <div style="padding: 30px; background-color: #f9f9f9;">
    <h2 style="color: #333;">Welcome to GroeimetAI!</h2>
    <p>Please verify your email address by clicking the button below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a
        href="%LINK%"
        style="background-color: #F97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;"
        >Verify Email</a
      >
    </div>
    <p style="color: #666; font-size: 14px;">
      If you didn't create an account, you can safely ignore this email.
    </p>
  </div>
</div>
```

## 2. SMTP Email Configuration (Project Notifications)

### Setup Gmail SMTP

1. **Enable 2-Factor Authentication**
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Create App Password**
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" as the app
   - Copy the generated password

3. **Configure .env File**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=niels@groeimetai.io
   SMTP_PASS=your-app-password-here
   ```

### Alternative: Use SendGrid (Professional)

1. **Create SendGrid Account**
   - Visit: https://sendgrid.com
   - Sign up for free tier (100 emails/day)

2. **Verify Your Domain**
   - Add SendGrid DNS records
   - Verify sender authentication

3. **Update Email Service**
   Update `/src/services/emailService.ts` to use SendGrid instead of SMTP

## 3. Email Service Architecture

```
┌─────────────────────┐
│   User Action       │
│ (Quote Request)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  QuoteRequestForm   │
│  - Submits data     │
│  - Creates quote    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  /api/email/send    │
│  - Validates data   │
│  - Calls service    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   EmailService      │
│  - SMTP transport   │
│  - Email templates  │
└─────────────────────┘
```

## 4. Troubleshooting

### Email Not Sending

1. Check .env file has SMTP credentials
2. Verify app password is correct
3. Check console logs for errors
4. Test connection: `npm run test:email`

### Firebase Emails Wrong Address

1. Domain must be verified in Firebase
2. DNS records must be correct
3. May take 24-48 hours to propagate

### Port 3001 Error

The error shows the app is trying to send to port 3001 instead of 3000. Check:

- NEXT_PUBLIC_API_URL in .env
- API route configuration
- Proxy settings if using one

## 5. Testing Email Configuration

Create test script at `/scripts/test-email.js`:

```javascript
const { emailService } = require('../src/services/emailService');

async function testEmail() {
  try {
    await emailService.sendTestEmail({
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email from GroeimetAI',
    });
    console.log('✅ Email sent successfully!');
  } catch (error) {
    console.error('❌ Email failed:', error);
  }
}

testEmail();
```

Run: `node scripts/test-email.js`

## 6. Security Best Practices

1. **Never commit credentials**
   - Keep .env in .gitignore
   - Use environment variables in production

2. **Use App Passwords**
   - Never use your main Gmail password
   - Create separate app passwords

3. **Rate Limiting**
   - Implement rate limiting on /api/email/send
   - Prevent email bombing

4. **Validate Recipients**
   - Only send to verified emails
   - Implement email validation

## 7. Production Deployment

For Vercel/Production:

1. Add environment variables in Vercel dashboard
2. Use SendGrid for better deliverability
3. Set up SPF, DKIM, and DMARC records
4. Monitor email delivery rates

## Need Help?

- Firebase Email Templates: https://firebase.google.com/docs/auth/custom-email-handler
- Gmail SMTP: https://support.google.com/mail/answer/185833
- SendGrid Docs: https://docs.sendgrid.com
