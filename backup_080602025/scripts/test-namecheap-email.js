/**
 * Test script voor Namecheap email configuratie
 *
 * Gebruik:
 * 1. Voeg je credentials toe aan .env
 * 2. Run: node scripts/test-namecheap-email.js
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

// Kleur codes voor console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

console.log(colors.blue + '\n🔧 Testing Namecheap Email Configuration...\n' + colors.reset);

// Check environment variables
const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(colors.red + '❌ Missing environment variables:' + colors.reset);
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.log('\nAdd these to your .env file:');
  console.log('SMTP_HOST=mail.privateemail.com');
  console.log('SMTP_PORT=587');
  console.log('SMTP_USER=info@groeimetai.io');
  console.log('SMTP_PASS=your-password\n');
  process.exit(1);
}

// Display configuration
console.log('📧 Email Configuration:');
console.log(`   Host: ${process.env.SMTP_HOST}`);
console.log(`   Port: ${process.env.SMTP_PORT}`);
console.log(`   User: ${process.env.SMTP_USER}`);
console.log(`   Pass: ${colors.yellow}[hidden]${colors.reset}\n`);

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Voor Namecheap
    minVersion: 'TLSv1.2',
  },
});

// Test connection
console.log('🔌 Testing connection...');
transporter.verify(async (error, success) => {
  if (error) {
    console.error(colors.red + '\n❌ Connection failed!' + colors.reset);
    console.error('Error:', error.message);

    if (error.message.includes('auth')) {
      console.log('\n💡 Tips:');
      console.log('- Gebruik je volledige email adres als username');
      console.log('- Controleer je wachtwoord');
      console.log('- Probeer port 465 met secure: true');
    }

    process.exit(1);
  } else {
    console.log(colors.green + '✅ Connection successful!' + colors.reset);
    console.log('📮 Server is ready to send emails\n');

    // Ask to send test email
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question('📧 Send test email to (email address): ', async (testEmail) => {
      if (!testEmail) {
        console.log('Skipping test email.');
        readline.close();
        process.exit(0);
      }

      console.log(`\n📤 Sending test email to ${testEmail}...`);

      try {
        const info = await transporter.sendMail({
          from: `"GroeimetAI" <${process.env.SMTP_USER}>`,
          to: testEmail,
          subject: 'Test Email - GroeimetAI Email Configuration ✅',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #000; padding: 20px; text-align: center;">
                <h1 style="color: #F97316; margin: 0;">GroeimetAI</h1>
              </div>
              <div style="padding: 30px; background: #f9f9f9;">
                <h2 style="color: #333;">Email Configuration Successful! 🎉</h2>
                <p style="color: #666; line-height: 1.6;">
                  Your Namecheap email configuration is working correctly.
                  You can now send emails from your GroeimetAI application.
                </p>
                <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0;">
                  <strong style="color: #2e7d32;">Configuration Details:</strong>
                  <ul style="color: #555; margin: 10px 0;">
                    <li>SMTP Host: ${process.env.SMTP_HOST}</li>
                    <li>SMTP Port: ${process.env.SMTP_PORT}</li>
                    <li>From: ${process.env.SMTP_USER}</li>
                  </ul>
                </div>
                <p style="color: #999; font-size: 14px; margin-top: 30px;">
                  This is a test email from your GroeimetAI email configuration script.
                </p>
              </div>
              <div style="background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px;">
                © ${new Date().getFullYear()} GroeimetAI. All rights reserved.
              </div>
            </div>
          `,
          text: `Email Configuration Successful!\n\nYour Namecheap email configuration is working correctly.\n\nConfiguration Details:\n- SMTP Host: ${process.env.SMTP_HOST}\n- SMTP Port: ${process.env.SMTP_PORT}\n- From: ${process.env.SMTP_USER}\n\n© ${new Date().getFullYear()} GroeimetAI`,
        });

        console.log(colors.green + '\n✅ Test email sent successfully!' + colors.reset);
        console.log(`Message ID: ${info.messageId}`);
        console.log(`\n🎉 Email configuration is working perfectly!\n`);
      } catch (error) {
        console.error(colors.red + '\n❌ Failed to send test email!' + colors.reset);
        console.error('Error:', error.message);
      }

      readline.close();
      process.exit(0);
    });
  }
});
