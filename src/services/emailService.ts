import { createTransporter, emailConfig, verifyEmailConnection } from '@/lib/email/config';
import { getEmailTemplate } from '@/lib/email/templates/index';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

class EmailService {
  private async getUserLanguage(email: string): Promise<string> {
    try {
      // Query users collection by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        return userData?.preferences?.language || 'en';
      }
      
      // Default to English if user not found
      return 'en';
    } catch (error) {
      console.error('Error getting user language:', error);
      return 'en';
    }
  }

  async sendEmail(options: EmailOptions) {
    // Skip email in development if not configured
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_PASS) {
      console.log('Skipping email in development - SMTP not configured');
      return { success: true, messageId: 'dev-skip' };
    }
    
    // Verify email configuration
    const isConnected = await verifyEmailConnection();
    if (!isConnected) {
      console.error('Email service is not properly configured');
      // In development, don't throw error
      if (process.env.NODE_ENV === 'development') {
        console.log('Email skipped in development due to configuration error');
        return { success: true, messageId: 'dev-error-skip' };
      }
      throw new Error('Email service unavailable');
    }

    const transporter = createTransporter();
    if (!transporter) {
      throw new Error('Email transporter not available');
    }

    try {
      const info = await transporter.sendMail({
        from: `"${emailConfig.from.name}" <${emailConfig.from.address}>`,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
      });

      console.log('Message sent: %s', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Send notification to admin for new project request
  async sendNewProjectRequestNotification(data: {
    projectName: string;
    companyName: string;
    recipientName?: string;
    recipientEmail: string;
    services: string[];
    budget: string;
    timeline: string;
    description: string;
    requestId: string;
  }) {
    // For admin emails, we'll use the language of the user who submitted the request
    const userLanguage = await this.getUserLanguage(data.recipientEmail);
    const emailTemplates = getEmailTemplate(userLanguage);
    const template = emailTemplates.newProjectRequest(data);

    // Send to all admin emails
    await this.sendEmail({
      to: emailConfig.adminEmails,
      subject: template.subject,
      html: template.html,
      text: template.text,
      replyTo: data.recipientEmail,
    });
  }

  // Send notification to client when quote status changes
  async sendQuoteStatusChangeNotification(data: {
    recipientName?: string;
    recipientEmail: string;
    projectName: string;
    oldStatus: string;
    newStatus: string;
    message?: string;
    quoteId: string;
  }) {
    // Get user's preferred language
    const userLanguage = await this.getUserLanguage(data.recipientEmail);
    const emailTemplates = getEmailTemplate(userLanguage);
    const template = emailTemplates.quoteStatusChange(data);

    await this.sendEmail({
      to: data.recipientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Send notification to admin for new meeting request
  async sendNewMeetingRequestNotification(data: {
    requesterName: string;
    requesterEmail: string;
    company?: string;
    topic: string;
    date: string;
    time: string;
    meetingType: string;
    description?: string;
    meetingId: string;
  }) {
    // For admin emails, we'll use the language of the user who submitted the request
    const userLanguage = await this.getUserLanguage(data.requesterEmail);
    const emailTemplates = getEmailTemplate(userLanguage);
    const template = emailTemplates.newMeetingRequest({
      ...data,
      recipientName: 'Admin',
      recipientEmail: emailConfig.adminEmails[0],
    });

    // Send to all admin emails
    await this.sendEmail({
      to: emailConfig.adminEmails,
      subject: template.subject,
      html: template.html,
      text: template.text,
      replyTo: data.requesterEmail,
    });
  }

  // Send generic email (for future use)
  async sendGenericEmail(options: EmailOptions) {
    await this.sendEmail(options);
  }

  // Send invoice email to customer
  async sendInvoiceEmail(data: {
    recipientName?: string;
    recipientEmail: string;
    invoice: any;
    pdfUrl?: string;
  }) {
    // Get user's preferred language
    const userLanguage = await this.getUserLanguage(data.recipientEmail);
    const emailTemplates = getEmailTemplate(userLanguage);
    const template = emailTemplates.sendInvoice(data);

    await this.sendEmail({
      to: data.recipientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Send invoice reminder email
  async sendInvoiceReminderEmail(data: {
    recipientName?: string;
    recipientEmail: string;
    invoice: any;
    reminderType: 'due_soon' | 'overdue' | 'final_notice';
  }) {
    // Get user's preferred language
    const userLanguage = await this.getUserLanguage(data.recipientEmail);
    const emailTemplates = getEmailTemplate(userLanguage);
    const template = emailTemplates.sendInvoiceReminder(data);

    await this.sendEmail({
      to: data.recipientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Send payment confirmation email
  async sendPaymentConfirmationEmail(data: {
    recipientName?: string;
    recipientEmail: string;
    invoice: any;
    paymentMethod: string;
    transactionId: string;
  }) {
    // Get user's preferred language
    const userLanguage = await this.getUserLanguage(data.recipientEmail);
    const emailTemplates = getEmailTemplate(userLanguage);
    const template = emailTemplates.sendPaymentConfirmation(data);

    await this.sendEmail({
      to: data.recipientEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
