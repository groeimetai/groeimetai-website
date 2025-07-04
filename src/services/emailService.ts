import { createTransporter, emailConfig, verifyEmailConnection } from '@/lib/email/config';
import { emailTemplates } from '@/lib/email/templates';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

class EmailService {
  private async sendEmail(options: EmailOptions) {
    // Verify email configuration
    const isConnected = await verifyEmailConnection();
    if (!isConnected) {
      console.error('Email service is not properly configured');
      throw new Error('Email service unavailable');
    }

    const transporter = createTransporter();
    
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
}

// Export singleton instance
export const emailService = new EmailService();