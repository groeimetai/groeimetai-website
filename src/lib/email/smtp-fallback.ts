import nodemailer from 'nodemailer';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export class SMTPFallback {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create SMTP transporter using environment variables
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'mail.privateemail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false // For development
      }
    });
  }

  async sendEmail(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Verify SMTP connection
      await this.transporter.verify();
      
      // Send email
      const info = await this.transporter.sendMail({
        from: `"GroeimetAI" <${process.env.SMTP_USER}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        replyTo: emailData.replyTo || process.env.SMTP_USER,
      });

      console.log('SMTP Email sent:', info.messageId);

      return {
        success: true,
        messageId: info.messageId
      };

    } catch (error) {
      console.error('SMTP Email error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown SMTP error'
      };
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.transporter.verify();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }
}