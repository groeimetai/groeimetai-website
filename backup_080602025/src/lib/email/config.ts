import nodemailer from 'nodemailer';

// Email configuration with lazy evaluation
export const emailConfig = {
  // Use niels@groeimetai.io as the "from" address
  // (must match the authentication email for Namecheap)
  from: {
    name: 'GroeimetAI',
    address: process.env.SMTP_USER || 'niels@groeimetai.io',
  },

  // Admin emails that should receive notifications
  adminEmails: ['niels@groeimetai.io'],

  // SMTP configuration getter to evaluate environment variables at runtime
  get smtp() {
    const port = parseInt(process.env.SMTP_PORT || '587');
    const isNamecheap = process.env.SMTP_HOST?.includes('privateemail.com');

    const config: any = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '', // Full email address for Namecheap
        pass: process.env.SMTP_PASS || '', // Email password or app password
      },
    };
    
    // Add Namecheap specific settings that match the working test script
    if (isNamecheap) {
      config.tls = {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2',
      };
    }
    
    return config;
  },
};

// Create reusable transporter object using the default SMTP transport
export const createTransporter = () => {
  // Check if we're in a build environment
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('Skipping email transporter creation during build');
    return null;
  }
  return nodemailer.createTransport(emailConfig.smtp);
};

// Verify SMTP connection configuration
export const verifyEmailConnection = async () => {
  // Skip verification if no password is set
  if (!process.env.SMTP_PASS) {
    console.log('Email service not configured - missing SMTP_PASS');
    return false;
  }
  
  const transporter = createTransporter();
  if (!transporter) {
    console.log('Email transporter not available (build time)');
    return false;
  }
  
  try {
    await transporter.verify();
    console.log('Email server is ready to send messages');
    return true;
  } catch (error: any) {
    console.error('Email server connection failed:', error.message);
    console.error('SMTP Config:', {
      host: emailConfig.smtp.host,
      port: emailConfig.smtp.port,
      user: emailConfig.smtp.auth.user,
      hasPassword: !!emailConfig.smtp.auth.pass,
    });
    return false;
  }
};
