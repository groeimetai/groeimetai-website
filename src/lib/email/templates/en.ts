import { EmailTemplateData } from './index';

export function getEmailTemplate() {
  return {
    // Email template for new project requests (to admin)
    newProjectRequest: (data: EmailTemplateData) => ({
      subject: `New Project Request: ${data.projectName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #FF6600; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
              .content { background-color: #f4f4f4; padding: 20px; border-radius: 0 0 5px 5px; }
              .field { margin-bottom: 15px; }
              .label { font-weight: bold; color: #FF6600; }
              .value { margin-left: 10px; }
              .services { background-color: white; padding: 10px; border-radius: 5px; margin-top: 5px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              .button { display: inline-block; padding: 10px 20px; background-color: #FF6600; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Project Request</h1>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>A new project request has been submitted through the GroeimetAI website.</p>
                
                <div class="field">
                  <span class="label">Project Name:</span>
                  <span class="value">${data.projectName}</span>
                </div>
                
                <div class="field">
                  <span class="label">Company:</span>
                  <span class="value">${data.companyName}</span>
                </div>
                
                <div class="field">
                  <span class="label">Contact:</span>
                  <span class="value">${data.recipientName || 'N/A'} (${data.recipientEmail})</span>
                </div>
                
                <div class="field">
                  <span class="label">Budget:</span>
                  <span class="value">${data.budget}</span>
                </div>
                
                <div class="field">
                  <span class="label">Timeline:</span>
                  <span class="value">${data.timeline}</span>
                </div>
                
                <div class="field">
                  <span class="label">Services Requested:</span>
                  <div class="services">
                    ${data.services?.map(service => `• ${service}`).join('<br>') || 'N/A'}
                  </div>
                </div>
                
                <div class="field">
                  <span class="label">Project Description:</span>
                  <div class="services">
                    ${data.description}
                  </div>
                </div>
                
                <p style="margin-top: 20px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/quotes/${data.requestId}" class="button">
                    View Request in Dashboard
                  </a>
                </p>
              </div>
              <div class="footer">
                <p>This is an automated notification from GroeimetAI.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
New Project Request

A new project request has been submitted through the GroeimetAI website.

Project Name: ${data.projectName}
Company: ${data.companyName}
Contact: ${data.recipientName || 'N/A'} (${data.recipientEmail})
Budget: ${data.budget}
Timeline: ${data.timeline}

Services Requested:
${data.services?.map(service => `• ${service}`).join('\n') || 'N/A'}

Project Description:
${data.description}

View request: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/quotes/${data.requestId}

This is an automated notification from GroeimetAI.
      `,
    }),

    // Email template for quote status changes (to client)
    quoteStatusChange: (data: EmailTemplateData) => ({
      subject: `Update on Your Project Request: ${data.projectName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #FF6600; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
              .content { background-color: #f4f4f4; padding: 20px; border-radius: 0 0 5px 5px; }
              .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
              .status.approved { background-color: #4CAF50; color: white; }
              .status.rejected { background-color: #f44336; color: white; }
              .status.reviewed { background-color: #2196F3; color: white; }
              .status.pending { background-color: #FF9800; color: white; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              .button { display: inline-block; padding: 10px 20px; background-color: #FF6600; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Project Status Update</h1>
              </div>
              <div class="content">
                <p>Dear ${data.recipientName || 'Valued Client'},</p>
                <p>We have an update regarding your project request.</p>
                
                <h2 style="color: #FF6600;">${data.projectName}</h2>
                
                <p>Status changed from: <span class="status ${data.oldStatus}">${data.oldStatus?.toUpperCase()}</span></p>
                <p>New status: <span class="status ${data.newStatus}">${data.newStatus?.toUpperCase()}</span></p>
                
                ${data.message ? `
                  <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Message from our team:</strong></p>
                    <p style="margin: 10px 0 0 0;">${data.message}</p>
                  </div>
                ` : ''}
                
                ${data.newStatus === 'approved' ? `
                  <p style="color: #4CAF50; font-weight: bold;">
                    🎉 Congratulations! Your project has been approved.
                  </p>
                  <p>Our team will be in touch shortly to discuss the next steps.</p>
                ` : ''}
                
                ${data.newStatus === 'rejected' ? `
                  <p>We appreciate your interest in our services. While we're unable to proceed with this specific request at this time, we encourage you to reach out to discuss alternative solutions.</p>
                ` : ''}
                
                ${data.newStatus === 'reviewed' ? `
                  <p>Our team has reviewed your project request. We may contact you for additional information if needed.</p>
                ` : ''}
                
                <p style="margin-top: 20px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${data.quoteId}" class="button">
                    View Project Details
                  </a>
                </p>
                
                <p style="margin-top: 20px;">
                  If you have any questions, please don't hesitate to contact us.
                </p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} GroeimetAI. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Dear ${data.recipientName || 'Valued Client'},

We have an update regarding your project request.

Project: ${data.projectName}

Status changed from: ${data.oldStatus?.toUpperCase()}
New status: ${data.newStatus?.toUpperCase()}

${data.message ? `Message from our team:\n${data.message}\n` : ''}

${data.newStatus === 'approved' ? '🎉 Congratulations! Your project has been approved. Our team will be in touch shortly to discuss the next steps.\n' : ''}

${data.newStatus === 'rejected' ? 'We appreciate your interest in our services. While we\'re unable to proceed with this specific request at this time, we encourage you to reach out to discuss alternative solutions.\n' : ''}

${data.newStatus === 'reviewed' ? 'Our team has reviewed your project request. We may contact you for additional information if needed.\n' : ''}

View project details: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${data.quoteId}

If you have any questions, please don't hesitate to contact us.

© ${new Date().getFullYear()} GroeimetAI. All rights reserved.
      `,
    }),

    // Email template for new meeting requests (to admin)
    newMeetingRequest: (data: EmailTemplateData) => ({
      subject: `New Meeting Request: ${data.topic}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #FF6600; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
              .content { background-color: #f4f4f4; padding: 20px; border-radius: 0 0 5px 5px; }
              .field { margin-bottom: 15px; }
              .label { font-weight: bold; color: #FF6600; }
              .value { margin-left: 10px; }
              .meeting-details { background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              .button { display: inline-block; padding: 10px 20px; background-color: #FF6600; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Meeting Request</h1>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>A new meeting request has been submitted.</p>
                
                <div class="meeting-details">
                  <div class="field">
                    <span class="label">Requester:</span>
                    <span class="value">${data.requesterName} (${data.requesterEmail})</span>
                  </div>
                  
                  ${data.company ? `
                    <div class="field">
                      <span class="label">Company:</span>
                      <span class="value">${data.company}</span>
                    </div>
                  ` : ''}
                  
                  <div class="field">
                    <span class="label">Meeting Topic:</span>
                    <span class="value">${data.topic}</span>
                  </div>
                  
                  <div class="field">
                    <span class="label">Meeting Type:</span>
                    <span class="value">${data.meetingType}</span>
                  </div>
                  
                  <div class="field">
                    <span class="label">Preferred Date:</span>
                    <span class="value">${data.date}</span>
                  </div>
                  
                  <div class="field">
                    <span class="label">Preferred Time:</span>
                    <span class="value">${data.time}</span>
                  </div>
                  
                  ${data.description ? `
                    <div class="field">
                      <span class="label">Additional Information:</span>
                      <div style="margin-left: 10px; margin-top: 5px;">
                        ${data.description}
                      </div>
                    </div>
                  ` : ''}
                </div>
                
                <p style="margin-top: 20px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/consultations/${data.meetingId}" class="button">
                    View Meeting Request
                  </a>
                </p>
              </div>
              <div class="footer">
                <p>This is an automated notification from GroeimetAI.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
New Meeting Request

A new meeting request has been submitted.

Requester: ${data.requesterName} (${data.requesterEmail})
${data.company ? `Company: ${data.company}\n` : ''}
Meeting Topic: ${data.topic}
Meeting Type: ${data.meetingType}
Preferred Date: ${data.date}
Preferred Time: ${data.time}
${data.description ? `\nAdditional Information:\n${data.description}\n` : ''}

View meeting request: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/consultations/${data.meetingId}

This is an automated notification from GroeimetAI.
      `,
    }),

    // Email template for sending invoices (to customer)
    sendInvoice: (data: EmailTemplateData) => {
      // Helper to format date safely
      const formatDate = (dateValue: any): string => {
        if (!dateValue) return 'N/A';
        if (dateValue instanceof Date) return dateValue.toLocaleDateString('en-GB');
        if (typeof dateValue === 'string') return new Date(dateValue).toLocaleDateString('en-GB');
        if (dateValue.toDate) return dateValue.toDate().toLocaleDateString('en-GB');
        return 'N/A';
      };

      // Get financial data safely
      const currency = data.invoice?.financial?.currency || 'EUR';
      const total = data.invoice?.financial?.total;
      const formattedTotal = typeof total === 'number' ? total.toFixed(2) : '0.00';

      return {
        subject: `Invoice #${data.invoice?.invoiceNumber} from GroeimetAI`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Invoice from GroeimetAI</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
                <tr>
                  <td style="padding: 40px 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: #141414; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">

                      <!-- Header with Logo -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #FF6600 0%, #cc5200 100%); padding: 40px 40px; text-align: center;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="text-align: center;">
                                <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">GroeimetAI</h1>
                                <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.9); letter-spacing: 2px; text-transform: uppercase;">AI Automation Partner</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Invoice Badge -->
                      <tr>
                        <td style="padding: 30px 40px 0 40px; text-align: center;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                            <tr>
                              <td style="background-color: rgba(255, 102, 0, 0.15); border: 1px solid rgba(255, 102, 0, 0.3); border-radius: 50px; padding: 10px 24px;">
                                <span style="color: #FF6600; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">Invoice</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Greeting -->
                      <tr>
                        <td style="padding: 30px 40px 20px 40px;">
                          <p style="margin: 0; color: #ffffff; font-size: 18px; line-height: 1.6;">Dear ${data.recipientName || 'Valued Client'},</p>
                          <p style="margin: 16px 0 0 0; color: #a3a3a3; font-size: 16px; line-height: 1.6;">Thank you for your business. Please find your invoice details below.</p>
                        </td>
                      </tr>

                      <!-- Invoice Details Card -->
                      <tr>
                        <td style="padding: 0 40px 30px 40px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #1f1f1f; border-radius: 12px; border: 1px solid #2a2a2a;">
                            <tr>
                              <td style="padding: 30px;">
                                <!-- Invoice Number -->
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
                                  <tr>
                                    <td style="color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 6px;">Invoice Number</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #ffffff; font-size: 18px; font-weight: 600;">${data.invoice?.invoiceNumber || 'N/A'}</td>
                                  </tr>
                                </table>

                                <!-- Dates Row -->
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                                  <tr>
                                    <td width="50%" style="vertical-align: top;">
                                      <p style="margin: 0; color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Issue Date</p>
                                      <p style="margin: 6px 0 0 0; color: #ffffff; font-size: 15px;">${formatDate(data.invoice?.createdAt)}</p>
                                    </td>
                                    <td width="50%" style="vertical-align: top;">
                                      <p style="margin: 0; color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Due Date</p>
                                      <p style="margin: 6px 0 0 0; color: #ffffff; font-size: 15px;">${formatDate(data.invoice?.dueDate)}</p>
                                    </td>
                                  </tr>
                                </table>

                                <!-- Divider -->
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td style="border-top: 1px solid #2a2a2a; padding-top: 24px;">
                                      <p style="margin: 0; color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Amount Due</p>
                                      <p style="margin: 10px 0 0 0; color: #FF6600; font-size: 36px; font-weight: 700; letter-spacing: -1px;">${currency} ${formattedTotal}</p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Action Buttons -->
                      <tr>
                        <td style="padding: 0 40px 20px 40px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            ${data.paymentUrl ? `
                            <tr>
                              <td style="padding-bottom: 16px;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td style="background: linear-gradient(135deg, #125312 0%, #0f4a0f 100%); border-radius: 10px; text-align: center;">
                                      <a href="${data.paymentUrl}" target="_blank" style="display: block; padding: 18px 40px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; letter-spacing: 0.3px;">Pay Now Securely</a>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            ` : ''}
                            ${data.pdfUrl ? `
                            <tr>
                              <td>
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td style="border: 2px solid #2a2a2a; border-radius: 10px; text-align: center;">
                                      <a href="${data.pdfUrl}" target="_blank" style="display: block; padding: 16px 40px; color: #ffffff; font-size: 15px; font-weight: 500; text-decoration: none;">Download Invoice PDF</a>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            ` : ''}
                          </table>
                        </td>
                      </tr>

                      <!-- Support Message -->
                      <tr>
                        <td style="padding: 10px 40px 40px 40px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #1a1a1a; border-radius: 10px; border-left: 4px solid #FF6600;">
                            <tr>
                              <td style="padding: 20px 24px;">
                                <p style="margin: 0; color: #a3a3a3; font-size: 14px; line-height: 1.6;">
                                  Questions about this invoice? Contact us at
                                  <a href="mailto:info@groeimetai.io" style="color: #FF6600; text-decoration: none; font-weight: 500;">info@groeimetai.io</a>
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #0f0f0f; padding: 30px 40px; border-top: 1px solid #1f1f1f;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="text-align: center;">
                                <p style="margin: 0 0 8px 0; color: #FF6600; font-size: 16px; font-weight: 600;">GroeimetAI</p>
                                <p style="margin: 0 0 16px 0; color: #525252; font-size: 13px; line-height: 1.5;">
                                  Fabriekstraat 20 · 7311GP Apeldoorn · Netherlands
                                </p>
                                <p style="margin: 0; color: #404040; font-size: 12px;">
                                  © ${new Date().getFullYear()} GroeimetAI. All rights reserved.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
        text: `
GROEIMETAI - INVOICE

Dear ${data.recipientName || 'Valued Client'},

Thank you for your business. Please find your invoice details below.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INVOICE DETAILS

Invoice Number: ${data.invoice?.invoiceNumber || 'N/A'}
Issue Date: ${formatDate(data.invoice?.createdAt)}
Due Date: ${formatDate(data.invoice?.dueDate)}

AMOUNT DUE: ${currency} ${formattedTotal}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${data.paymentUrl ? `PAY NOW: ${data.paymentUrl}\n` : ''}
${data.pdfUrl ? `DOWNLOAD PDF: ${data.pdfUrl}\n` : ''}

Questions? Contact us at info@groeimetai.io

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GroeimetAI
Fabriekstraat 20 · 7311GP Apeldoorn · Netherlands

© ${new Date().getFullYear()} GroeimetAI. All rights reserved.
        `,
      };
    },

    // Email template for invoice reminders
    sendInvoiceReminder: (data: EmailTemplateData) => {
      const reminderMessages = {
        due_soon: {
          subject: `Reminder: Invoice #${data.invoice?.invoiceNumber} due soon`,
          intro: 'This is a friendly reminder that your invoice will be due soon.',
          badgeColor: '#FF6600',
          badgeText: 'Payment Reminder',
        },
        overdue: {
          subject: `Overdue Notice: Invoice #${data.invoice?.invoiceNumber}`,
          intro: 'This is a reminder that your invoice is now overdue.',
          badgeColor: '#f59e0b',
          badgeText: 'Overdue',
        },
        final_notice: {
          subject: `Final Notice: Invoice #${data.invoice?.invoiceNumber}`,
          intro: 'This is a final notice regarding your overdue invoice.',
          badgeColor: '#ef4444',
          badgeText: 'Final Notice',
        },
      };

      const reminder = reminderMessages[data.reminderType || 'due_soon'];
      const amountColor = data.reminderType === 'final_notice' ? '#ef4444' : '#FF6600';

      return {
        subject: reminder.subject,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Invoice Reminder from GroeimetAI</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
                <tr>
                  <td style="padding: 40px 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: #141414; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">

                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #FF6600 0%, #cc5200 100%); padding: 40px 40px; text-align: center;">
                          <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">GroeimetAI</h1>
                          <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.9); letter-spacing: 2px; text-transform: uppercase;">AI Automation Partner</p>
                        </td>
                      </tr>

                      <!-- Reminder Badge -->
                      <tr>
                        <td style="padding: 30px 40px 0 40px; text-align: center;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                            <tr>
                              <td style="background-color: ${reminder.badgeColor}20; border: 1px solid ${reminder.badgeColor}50; border-radius: 50px; padding: 10px 24px;">
                                <span style="color: ${reminder.badgeColor}; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">${reminder.badgeText}</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Greeting -->
                      <tr>
                        <td style="padding: 30px 40px 20px 40px;">
                          <p style="margin: 0; color: #ffffff; font-size: 18px; line-height: 1.6;">Dear ${data.recipientName || 'Valued Client'},</p>
                          <p style="margin: 16px 0 0 0; color: #a3a3a3; font-size: 16px; line-height: 1.6;">${reminder.intro}</p>
                        </td>
                      </tr>

                      <!-- Invoice Details Card -->
                      <tr>
                        <td style="padding: 0 40px 30px 40px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #1f1f1f; border-radius: 12px; border: 1px solid #2a2a2a;">
                            <tr>
                              <td style="padding: 30px;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
                                  <tr>
                                    <td style="color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 6px;">Invoice Number</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #ffffff; font-size: 18px; font-weight: 600;">${data.invoice?.invoiceNumber}</td>
                                  </tr>
                                </table>

                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                                  <tr>
                                    <td width="50%" style="vertical-align: top;">
                                      <p style="margin: 0; color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Issue Date</p>
                                      <p style="margin: 6px 0 0 0; color: #ffffff; font-size: 15px;">${new Date(data.invoice?.createdAt || Date.now()).toLocaleDateString('en-GB')}</p>
                                    </td>
                                    <td width="50%" style="vertical-align: top;">
                                      <p style="margin: 0; color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Due Date</p>
                                      <p style="margin: 6px 0 0 0; color: ${amountColor}; font-size: 15px; font-weight: 600;">${new Date(data.invoice?.dueDate || Date.now()).toLocaleDateString('en-GB')}</p>
                                    </td>
                                  </tr>
                                </table>

                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td style="border-top: 1px solid #2a2a2a; padding-top: 24px;">
                                      <p style="margin: 0; color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Amount Due</p>
                                      <p style="margin: 10px 0 0 0; color: ${amountColor}; font-size: 36px; font-weight: 700; letter-spacing: -1px;">${data.invoice?.currency || 'EUR'} ${data.invoice?.totalAmount?.toFixed(2)}</p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Action Button -->
                      <tr>
                        <td style="padding: 0 40px 30px 40px;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="background: linear-gradient(135deg, #125312 0%, #0f4a0f 100%); border-radius: 10px; text-align: center;">
                                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invoices/${data.invoice?.id}" target="_blank" style="display: block; padding: 18px 40px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none;">View & Pay Invoice</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Message -->
                      <tr>
                        <td style="padding: 0 40px 40px 40px;">
                          <p style="margin: 0; color: #a3a3a3; font-size: 14px; line-height: 1.6;">Please arrange payment at your earliest convenience to avoid any late fees or service interruptions.</p>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #0f0f0f; padding: 30px 40px; border-top: 1px solid #1f1f1f;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="text-align: center;">
                                <p style="margin: 0 0 8px 0; color: #FF6600; font-size: 16px; font-weight: 600;">GroeimetAI</p>
                                <p style="margin: 0 0 16px 0; color: #525252; font-size: 13px;">Fabriekstraat 20 · 7311GP Apeldoorn · Netherlands</p>
                                <p style="margin: 0; color: #404040; font-size: 12px;">© ${new Date().getFullYear()} GroeimetAI. All rights reserved.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
        text: `
GROEIMETAI - ${reminder.badgeText.toUpperCase()}

Dear ${data.recipientName || 'Valued Client'},

${reminder.intro}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Invoice Number: ${data.invoice?.invoiceNumber}
Issue Date: ${new Date(data.invoice?.createdAt || Date.now()).toLocaleDateString('en-GB')}
Due Date: ${new Date(data.invoice?.dueDate || Date.now()).toLocaleDateString('en-GB')}

AMOUNT DUE: ${data.invoice?.currency || 'EUR'} ${data.invoice?.totalAmount?.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VIEW INVOICE: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invoices/${data.invoice?.id}

Please arrange payment at your earliest convenience.

© ${new Date().getFullYear()} GroeimetAI. All rights reserved.
        `,
      };
    },

    // Email template for payment confirmation
    sendPaymentConfirmation: (data: EmailTemplateData) => ({
      subject: `Payment Received - Invoice #${data.invoice?.invoiceNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Payment Confirmation from GroeimetAI</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
              <tr>
                <td style="padding: 40px 20px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: #141414; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">

                    <!-- Header with Success Color -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #125312 0%, #0f4a0f 100%); padding: 40px 40px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">GroeimetAI</h1>
                        <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.9); letter-spacing: 2px; text-transform: uppercase;">AI Automation Partner</p>
                      </td>
                    </tr>

                    <!-- Success Badge -->
                    <tr>
                      <td style="padding: 30px 40px 0 40px; text-align: center;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                          <tr>
                            <td style="background-color: rgba(18, 83, 18, 0.2); border: 1px solid rgba(18, 83, 18, 0.4); border-radius: 50px; padding: 10px 24px;">
                              <span style="color: #22c55e; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">✓ Payment Received</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Greeting -->
                    <tr>
                      <td style="padding: 30px 40px 20px 40px;">
                        <p style="margin: 0; color: #ffffff; font-size: 18px; line-height: 1.6;">Dear ${data.recipientName || 'Valued Client'},</p>
                        <p style="margin: 16px 0 0 0; color: #a3a3a3; font-size: 16px; line-height: 1.6;">Thank you! We have successfully received your payment.</p>
                      </td>
                    </tr>

                    <!-- Payment Details Card -->
                    <tr>
                      <td style="padding: 0 40px 30px 40px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #1f1f1f; border-radius: 12px; border: 1px solid #2a2a2a;">
                          <tr>
                            <td style="padding: 30px;">
                              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
                                <tr>
                                  <td style="color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 6px;">Invoice Number</td>
                                </tr>
                                <tr>
                                  <td style="color: #ffffff; font-size: 18px; font-weight: 600;">${data.invoice?.invoiceNumber}</td>
                                </tr>
                              </table>

                              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                                <tr>
                                  <td width="50%" style="vertical-align: top; padding-bottom: 16px;">
                                    <p style="margin: 0; color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Payment Date</p>
                                    <p style="margin: 6px 0 0 0; color: #ffffff; font-size: 15px;">${new Date().toLocaleDateString('en-GB')}</p>
                                  </td>
                                  <td width="50%" style="vertical-align: top; padding-bottom: 16px;">
                                    <p style="margin: 0; color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Payment Method</p>
                                    <p style="margin: 6px 0 0 0; color: #ffffff; font-size: 15px;">${data.paymentMethod}</p>
                                  </td>
                                </tr>
                                <tr>
                                  <td colspan="2" style="vertical-align: top;">
                                    <p style="margin: 0; color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Transaction ID</p>
                                    <p style="margin: 6px 0 0 0; color: #ffffff; font-size: 14px; font-family: monospace;">${data.transactionId}</p>
                                  </td>
                                </tr>
                              </table>

                              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                  <td style="border-top: 1px solid #2a2a2a; padding-top: 24px;">
                                    <p style="margin: 0; color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Amount Paid</p>
                                    <p style="margin: 10px 0 0 0; color: #22c55e; font-size: 36px; font-weight: 700; letter-spacing: -1px;">${data.invoice?.currency || 'EUR'} ${data.invoice?.totalAmount?.toFixed(2)}</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Confirmation Message -->
                    <tr>
                      <td style="padding: 0 40px 40px 40px;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #1a1a1a; border-radius: 10px; border-left: 4px solid #22c55e;">
                          <tr>
                            <td style="padding: 20px 24px;">
                              <p style="margin: 0; color: #a3a3a3; font-size: 14px; line-height: 1.6;">
                                Your account has been updated and the invoice has been marked as paid. If you need a receipt or have any questions, contact us at
                                <a href="mailto:info@groeimetai.io" style="color: #FF6600; text-decoration: none; font-weight: 500;">info@groeimetai.io</a>
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #0f0f0f; padding: 30px 40px; border-top: 1px solid #1f1f1f;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                          <tr>
                            <td style="text-align: center;">
                              <p style="margin: 0 0 8px 0; color: #FF6600; font-size: 16px; font-weight: 600;">GroeimetAI</p>
                              <p style="margin: 0 0 16px 0; color: #525252; font-size: 13px;">Fabriekstraat 20 · 7311GP Apeldoorn · Netherlands</p>
                              <p style="margin: 0; color: #404040; font-size: 12px;">© ${new Date().getFullYear()} GroeimetAI. All rights reserved.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      text: `
GROEIMETAI - PAYMENT CONFIRMATION

Dear ${data.recipientName || 'Valued Client'},

Thank you! We have successfully received your payment.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PAYMENT DETAILS

Invoice Number: ${data.invoice?.invoiceNumber}
Payment Date: ${new Date().toLocaleDateString('en-GB')}
Payment Method: ${data.paymentMethod}
Transaction ID: ${data.transactionId}

AMOUNT PAID: ${data.invoice?.currency || 'EUR'} ${data.invoice?.totalAmount?.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your account has been updated and the invoice has been marked as paid.

Questions? Contact us at info@groeimetai.io

© ${new Date().getFullYear()} GroeimetAI. All rights reserved.
      `,
    }),
  };
}