// Quick SMTP test script
// Run with: SMTP_PASS="your-password" node test-smtp.js

const nodemailer = require('nodemailer');

const password = process.env.SMTP_PASS || 'YOUR_PASSWORD_HERE';

// Escape password for Cloud Run environment variables
function escapeForCloudRun(str) {
  return str
    .replace(/\\/g, '\\\\')  // Escape backslashes first
    .replace(/\$/g, '$$')    // Escape dollar signs
    .replace(/"/g, '\\"');   // Escape double quotes
}

console.log('\n========================================');
console.log('SMTP PASSWORD ESCAPE HELPER');
console.log('========================================\n');
console.log('Original password length:', password.length);
console.log('Original password:', password);
console.log('\n--- FOR CLOUD RUN ---');
console.log('Escaped password:', escapeForCloudRun(password));
console.log('\n--- GCLOUD CLI COMMAND ---');
console.log(`gcloud run services update groeimetai-website \\
  --region=europe-west1 \\
  --update-env-vars="SMTP_PASS=${escapeForCloudRun(password)}"`);
console.log('\n========================================\n');

const config = {
  host: 'mail.privateemail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'niels@groeimetai.io',
    pass: password,
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2',
  },
};

console.log('Testing SMTP connection...');
console.log('Host:', config.host);
console.log('Port:', config.port);
console.log('User:', config.auth.user);

const transporter = nodemailer.createTransport(config);

transporter.verify()
  .then(() => {
    console.log('✅ SMTP connection successful!');
    console.log('\nCopy the gcloud command above to update Cloud Run.');
  })
  .catch((error) => {
    console.error('❌ SMTP connection failed:', error.message);

    if (error.message.includes('authentication failed')) {
      console.log('\nPossible causes:');
      console.log('1. Wrong password');
      console.log('2. 2FA enabled - need App Password');
      console.log('3. Special characters in password not escaped');
      console.log('4. Account locked or security block');
    }
  });
