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
    // Use endsWith for proper domain validation (prevents bypass via subdomain/path injection)
    const host = (process.env.SMTP_HOST || '').trim().toLowerCase();
    const isNamecheap = host.endsWith('.privateemail.com') || host === 'privateemail.com';

    // Trim whitespace from credentials (Cloud Run can add trailing chars)
    const user = (process.env.SMTP_USER || '').trim();
    const pass = (process.env.SMTP_PASS || '').trim();

    // Debug logging for production troubleshooting
    console.log('SMTP Config loading:', {
      host: host || 'smtp.gmail.com',
      port,
      user,
      passLength: pass.length,
      isNamecheap,
    });

    const config: any = {
      host: host || 'smtp.gmail.com',
      port: port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user: user, // Full email address for Namecheap
        pass: pass, // Email password or app password
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
