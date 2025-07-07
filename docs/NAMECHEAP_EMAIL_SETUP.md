# Namecheap Email Configuration Guide

## 1. Namecheap SMTP Settings

Voor Namecheap Private Email gebruik je deze instellingen:

```env
# Namecheap Private Email SMTP Settings
SMTP_HOST=mail.privateemail.com
SMTP_PORT=587
SMTP_USER=info@groeimetai.io
SMTP_PASS=your-namecheap-email-password

# Alternative poorten als 587 niet werkt:
# SMTP_PORT=465 (SSL)
# SMTP_PORT=25 (niet aanbevolen)
```

### Namecheap Email Settings:
- **Incoming Server**: mail.privateemail.com
- **Outgoing Server**: mail.privateemail.com
- **SMTP Port**: 587 (STARTTLS) of 465 (SSL/TLS)
- **Authentication**: Required
- **Username**: Volledige email adres (info@groeimetai.io)

## 2. GitHub Actions Secrets

Voeg deze secrets toe in je GitHub repository:

1. Ga naar: Settings → Secrets and variables → Actions
2. Klik "New repository secret"
3. Voeg toe:
   - `SMTP_HOST`: mail.privateemail.com
   - `SMTP_PORT`: 587
   - `SMTP_USER`: info@groeimetai.io
   - `SMTP_PASS`: [je wachtwoord]

## 3. Update Production Environment

In je deployment configuratie (Vercel/Cloud Run):

```yaml
env:
  - name: SMTP_HOST
    value: mail.privateemail.com
  - name: SMTP_PORT
    value: "587"
  - name: SMTP_USER
    valueFrom:
      secretKeyRef:
        name: smtp-credentials
        key: username
  - name: SMTP_PASS
    valueFrom:
      secretKeyRef:
        name: smtp-credentials
        key: password
```

## 4. Test Email Configuration

```javascript
// test-namecheap-email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'mail.privateemail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'info@groeimetai.io',
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false // Voor development
  }
});

// Test connection
transporter.verify(function(error, success) {
  if (error) {
    console.log('❌ Error:', error);
  } else {
    console.log('✅ Server is ready to send emails');
  }
});

// Send test email
transporter.sendMail({
  from: '"GroeimetAI" <info@groeimetai.io>',
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<h1>Test from Namecheap</h1>'
}, (error, info) => {
  if (error) {
    console.log('❌ Send error:', error);
  } else {
    console.log('✅ Email sent:', info.messageId);
  }
});
```

## 5. SPF & DKIM Records

Voor betere deliverability, voeg deze DNS records toe:

### SPF Record:
```
Type: TXT
Name: @
Value: v=spf1 include:spf.privateemail.com ~all
```

### DKIM Record:
Namecheap genereert deze voor je in het control panel.

## 6. Troubleshooting

### Connection Refused
- Controleer of poort 587 open is
- Probeer poort 465 met secure: true
- Check firewall instellingen

### Authentication Failed
- Gebruik volledig email adres als username
- Controleer wachtwoord
- Enable "Less secure app access" indien nodig

### Emails komen niet aan
- Check SPF/DKIM records
- Controleer spam folder
- Test met mail-tester.com