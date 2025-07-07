# Quick Setup Guide - Email Configuration

## Stap 1: Namecheap Email Configuratie

### A. Voeg deze regels toe aan je `.env` file:

```env
# Namecheap Private Email
SMTP_HOST=mail.privateemail.com
SMTP_PORT=587
SMTP_USER=info@groeimetai.io
SMTP_PASS=jouw-namecheap-email-wachtwoord
```

### B. GitHub Actions Secrets:

1. Ga naar: https://github.com/groeimetai/groeimetai-website/settings/secrets/actions
2. Voeg toe:
   - `SMTP_HOST` = mail.privateemail.com
   - `SMTP_PORT` = 587
   - `SMTP_USER` = info@groeimetai.io
   - `SMTP_PASS` = [je wachtwoord]

## Stap 2: Firebase Auth Emails met Custom Styling

### Optie A: Quick Fix (Firebase Console)

1. Ga naar: https://console.firebase.google.com/project/groeimetai-458417/authentication/emails
2. Klik "Email address" → Verander naar: `noreply@groeimetai.io`
3. Voor elke template, plak de HTML uit `/docs/CUSTOM_AUTH_EMAILS.md`

### Optie B: Full Custom Emails (Aanbevolen)

1. In Firebase Console → Authentication → Templates
2. Klik "Customize action URL" onderaan
3. Voer in: `https://groeimetai.io/auth/action`
4. Deploy de code (wordt automatisch meegenomen)

## Stap 3: DNS Records (Voor betere deliverability)

Voeg in Namecheap DNS:

### SPF Record:

```
Type: TXT
Host: @
Value: v=spf1 include:spf.privateemail.com ~all
```

### DMARC Record:

```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:admin@groeimetai.io
```

## Stap 4: Test Alles

### Test SMTP Verbinding:

```javascript
// Maak test-email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'mail.privateemail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'info@groeimetai.io',
    pass: 'jouw-wachtwoord',
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Error:', error);
  } else {
    console.log('✅ Email server ready!');
  }
});
```

Run: `node test-email.js`

### Test Auth Emails:

1. Maak test account: Check verificatie email
2. Reset wachtwoord: Check reset email
3. Beide emails moeten je custom styling hebben!

## Troubleshooting

### Port 3001 Error:

```bash
# Clear alles
rm -rf .next
npm run dev
```

### Emails komen niet aan:

1. Check spam folder
2. Test met https://www.mail-tester.com
3. Controleer wachtwoord

### Firebase emails verkeerd adres:

- Wacht 24-48 uur na domain verificatie
- Of gebruik Custom Email Handler (Optie B)

## Deployment Checklist

- [ ] `.env` file bijgewerkt met SMTP settings
- [ ] GitHub Secrets toegevoegd
- [ ] Firebase email adres aangepast
- [ ] DNS records toegevoegd
- [ ] Test emails verstuurd
- [ ] Custom action URL geconfigureerd (optioneel)

## Support

Voor hulp met Namecheap:

- Login: https://www.namecheap.com
- Email settings: Hosting → Email → Manage
- Support: https://www.namecheap.com/support/

Voor Firebase:

- Console: https://console.firebase.google.com
- Auth docs: https://firebase.google.com/docs/auth/custom-email-handler
