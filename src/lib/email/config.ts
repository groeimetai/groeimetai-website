import nodemailer from 'nodemailer';

// Email configuration
export const emailConfig = {
  // Use info@groeimetai.io as the "from" address
  // But authenticate with niels@groeimetai.io (since info@ is an alias)
  from: {
    name: 'GroeimetAI',
    address: 'info@groeimetai.io',
  },
  
  // Admin emails that should receive notifications
  adminEmails: ['niels@groeimetai.io'],
  
  // SMTP configuration (to be set via environment variables)
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || '', // niels@groeimetai.io
      pass: process.env.SMTP_PASS || '', // App password
    },
  },
};

// Create reusable transporter object using the default SMTP transport
export const createTransporter = () => {
  return nodemailer.createTransport({
    host: emailConfig.smtp.host,
    port: emailConfig.smtp.port,
    secure: emailConfig.smtp.secure,
    auth: {
      user: emailConfig.smtp.auth.user,
      pass: emailConfig.smtp.auth.pass,
    },
  });
};

// Verify SMTP connection configuration
export const verifyEmailConnection = async () => {
  const transporter = createTransporter();
  try {
    await transporter.verify();
    console.log('Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('Email server connection failed:', error);
    return false;
  }
};