# Disable Firebase Default Email Templates

## Problem
Firebase Auth automatically sends emails for:
- Email verification
- Password reset
- Email address change

These emails use Firebase's default templates and are sent from `noreply@groeimetai-458417.firebaseapp.com`.

## Solution
To disable Firebase's default emails and use custom emails instead:

### 1. Firebase Console Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `groeimetai-458417`
3. Navigate to **Authentication** → **Templates**
4. For each email template (Password reset, Email verification, etc.):
   - You CANNOT completely disable these emails from the console
   - But we're now intercepting them in the code

### 2. Code Implementation

We've updated the application to:

1. **Comment out Firebase's email functions**:
   - `sendEmailVerification()` 
   - `sendPasswordResetEmail()`

2. **Use custom API endpoints instead**:
   - `/api/auth/send-verification` - Sends custom verification emails
   - `/api/auth/send-password-reset` - Sends custom password reset emails

3. **Custom email flow**:
   - Firebase Admin SDK generates secure action links
   - We extract the `oobCode` from these links
   - Create custom URLs pointing to our `/auth/action` page
   - Send emails using our SMTP server with custom templates

### 3. Email Templates

Custom email templates are defined in:
- `/src/lib/email/custom-auth-templates.ts`

These templates:
- Match the website's design (black background, orange accents)
- Support multiple languages (NL/EN)
- Include proper branding

### 4. Testing

To test the custom email flow:

1. **Email Verification**:
   - Create a new account
   - Check email for custom verification email
   - Click link to verify

2. **Password Reset**:
   - Go to login page
   - Click "Forgot Password"
   - Enter email
   - Check email for custom reset email
   - Click link to reset password

### 5. Important Notes

- Firebase will still show email templates in the console, but they won't be sent
- The custom emails are sent via Namecheap SMTP (niels@groeimetai.io)
- If email service fails, the app continues to work (graceful degradation)
- All action links are handled by our custom `/auth/action` page

### 6. Monitoring

Check server logs for:
- "Sending custom verification email"
- "Sending custom password reset email"
- Any email service errors

### 7. Future Improvements

Consider:
- Using a transactional email service (SendGrid, Mailgun) for better deliverability
- Adding email tracking/analytics
- Implementing email templates in multiple languages
- Adding retry logic for failed emails