# Email Troubleshooting Guide

## 🔍 Probleem: Geen emails ontvangen ondanks succesvolle API calls

### Mogelijke oorzaken:

1. **Firebase Send Email Extension niet correct geconfigureerd**
2. **Email extension parameters niet juist ingesteld**
3. **SMTP configuratie ontbreekt of incorrect**
4. **Emails staan vast in de queue**
5. **Extension heeft geen permissions**

## ✅ Stap-voor-stap debugging:

### 1. Check Firebase Console

**Ga naar Firebase Console → Extensions → Send Email**

Controleer:
- [ ] Extension is actief (enabled)
- [ ] SMTP configuratie is correct
- [ ] Sender email is geverifieerd
- [ ] Extension heeft de juiste permissions

### 2. Bekijk Mail Collection in Firestore

**Firebase Console → Firestore → Collections → `mail`**

Let op:
- [ ] Er staan documents in de `mail` collection
- [ ] Documents hebben `delivery` field
- [ ] `delivery.state` is "SUCCESS" of "ERROR"
- [ ] Check `delivery.error` voor error messages

### 3. Check Extension Logs

**Firebase Console → Extensions → Send Email → View in Logs Explorer**

Zoek naar:
- Errors tijdens email verwerking
- SMTP authenticatie problemen
- Rate limiting issues

### 4. Test Email Configuratie

```bash
# Test of emails in queue staan
npx tsx scripts/check-email-queue.ts

# Trigger manual email processing (als nodig)
curl -X GET "https://your-domain.com/api/email/trigger-scheduled"
```

### 5. Veelvoorkomende oplossingen:

#### A. SMTP Configuratie controleren
Extension parameters:
```env
SMTP_CONNECTION_URI=smtps://username:password@smtp.gmail.com:465
SMTP_PASSWORD=your-app-password
DEFAULT_FROM=noreply@groeimetai.com
DEFAULT_REPLY_TO=info@groeimetai.com
```

#### B. Gmail App Password
Voor Gmail SMTP:
1. Enable 2FA op Gmail account
2. Generate App Password (niet je gewone wachtwoord!)
3. Gebruik App Password in SMTP_PASSWORD

#### C. Domain verificatie
- Sender domain moet geverifieerd zijn
- SPF/DKIM records correct ingesteld
- DMARC policy niet te restrictief

#### D. Extension opnieuw configureren
1. Firebase Console → Extensions → Send Email
2. Reconfigure extension
3. Update alle parameters
4. Test met simple email

### 6. Manual Test Email

Test vanuit de admin dashboard:
1. Ga naar `/dashboard/admin/contacts`
2. Maak test contact aan
3. Stuur test email
4. Check Firestore `mail` collection
5. Bekijk delivery status

### 7. Debug Email Template

Test of email templates correct zijn:

```javascript
// Test in browser console op contact form
await fetch('/api/contact/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@example.com',
    company: 'Test Company',
    message: 'Test message',
    conversationType: 'verkennen'
  })
});
```

## 🚨 Quick Fix Checklist

1. **Check Firebase Extensions in console**
   - Send Email extension enabled?
   - SMTP settings correct?

2. **Verify email in Firestore**
   - Go to `mail` collection
   - Check latest documents
   - Look for `delivery` field

3. **Test SMTP credentials**
   - Try sending test email manually
   - Verify app password (for Gmail)

4. **Check extension logs**
   - Look for authentication errors
   - Check for rate limiting

5. **Domain verification**
   - Sender domain verified?
   - DNS records correct?

## 📞 Als alles faalt:

1. Schakel over naar Resend API (tijdelijk)
2. Check GitHub Actions logs voor specifieke errors
3. Test met andere email provider (Mailgun, SendGrid)
4. Contact Firebase support voor extension issues

## 🔧 Alternative: Resend Integration

Als Firebase email blijft falen, voeg Resend toe:

```bash
npm install resend
```

Update contact API:
```javascript
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
```

Environment variable:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
```

Dit geeft een fallback optie terwijl Firebase email wordt gefixed.