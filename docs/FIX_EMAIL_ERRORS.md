# Email Error Fix Guide

## Problem 1: 500 Error on Email Send

### Symptoms
- Error: `POST http://localhost:3001/api/email/send 500 (Internal Server Error)`
- Email notifications fail when submitting quote requests

### Solutions

#### 1. Port 3001 Issue
The error shows the app is trying to connect to port 3001 instead of 3000. This can be caused by:

**A. Browser Cache**
1. Clear browser cache and cookies
2. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
3. Open in incognito/private window

**B. Service Worker**
1. Open DevTools → Application → Service Workers
2. Unregister all service workers
3. Clear storage

**C. Running Backend Service**
Check if you have a backend service running on port 3001:
```bash
lsof -i :3001
# If something is running, kill it:
kill -9 <PID>
```

**D. Environment Variable**
Make sure no environment variable is overriding the API URL:
```bash
# Check all env vars
env | grep 3001
```

#### 2. Configure Email Service

Add these to your `.env` file:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=niels@groeimetai.io
SMTP_PASS=your-app-password-here
```

**To get Gmail App Password:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to https://myaccount.google.com/apppasswords
4. Create an app password for "Mail"
5. Copy the 16-character password

### Temporary Fix
The email API has been updated to handle missing configuration gracefully:
- Requests will succeed even if email is not configured
- Quote submissions will work without email notifications
- A warning is logged but users won't see errors

## Problem 2: Firebase Verification Email Wrong Address

### Symptoms
- Verification emails come from `noreply@groeimetai-458417.firebaseapp.com`
- Should come from `noreply@groeimetai.io`

### Solution

1. **Go to Firebase Console**
   https://console.firebase.google.com/project/groeimetai-458417/authentication/emails

2. **Update Email Templates**
   - Click "Email address" at the top
   - Change to: `noreply@groeimetai.io`
   - Add reply-to: `support@groeimetai.io`

3. **Verify Your Domain**
   - Firebase will provide a TXT record
   - Add to your DNS settings:
     ```
     Type: TXT
     Name: firebase1._domainkey
     Value: [provided by Firebase]
     ```

4. **Wait for Verification**
   - Can take 24-48 hours
   - Check status in Firebase Console

5. **Customize Templates**
   For each template (verification, password reset):
   - Update subject line
   - Customize HTML/text
   - Add your branding

## Verification Checklist

- [ ] Gmail App Password created and added to .env
- [ ] Browser cache cleared
- [ ] No service running on port 3001
- [ ] Firebase domain verification initiated
- [ ] Email templates customized

## Testing

1. **Test Email Service**
   ```bash
   # Create test file
   cat > test-email.js << 'EOF'
   const nodemailer = require('nodemailer');
   
   const transporter = nodemailer.createTransport({
     host: 'smtp.gmail.com',
     port: 587,
     secure: false,
     auth: {
       user: process.env.SMTP_USER,
       pass: process.env.SMTP_PASS,
     },
   });
   
   transporter.verify((error, success) => {
     if (error) {
       console.error('❌ Email configuration error:', error);
     } else {
       console.log('✅ Email server is ready');
     }
   });
   EOF
   
   # Run test
   node test-email.js
   ```

2. **Test Quote Submission**
   - Submit a quote request
   - Check browser console for errors
   - Verify quote appears in Firebase

## Support

If issues persist:
1. Check server logs: `npm run dev`
2. Check browser console for errors
3. Verify all environment variables are set
4. Contact support with error details