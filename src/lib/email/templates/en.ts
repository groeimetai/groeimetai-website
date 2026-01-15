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
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #FF6600; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                .content { background-color: #f4f4f4; padding: 20px; border-radius: 0 0 5px 5px; }
                .invoice-details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                .amount { font-size: 24px; font-weight: bold; color: #FF6600; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                .button { display: inline-block; padding: 12px 24px; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; font-weight: bold; }
                .button-pay { background-color: #28a745; font-size: 18px; padding: 15px 30px; }
                .button-pdf { background-color: #FF6600; }
                .button-container { text-align: center; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Invoice</h1>
                </div>
                <div class="content">
                  <p>Dear ${data.recipientName || 'Valued Client'},</p>
                  <p>Please find your invoice from GroeimetAI below.</p>

                  <div class="invoice-details">
                    <p><strong>Invoice Number:</strong> ${data.invoice?.invoiceNumber || 'N/A'}</p>
                    <p><strong>Date:</strong> ${formatDate(data.invoice?.createdAt)}</p>
                    <p><strong>Due Date:</strong> ${formatDate(data.invoice?.dueDate)}</p>
                    <p class="amount">Total: ${currency} ${formattedTotal}</p>
                  </div>

                  ${data.paymentUrl ? `
                    <div class="button-container">
                      <a href="${data.paymentUrl}" class="button button-pay">
                        💳 Pay Now
                      </a>
                    </div>
                  ` : ''}

                  ${data.pdfUrl ? `
                    <div class="button-container">
                      <a href="${data.pdfUrl}" class="button button-pdf">
                        📄 Download Invoice PDF
                      </a>
                    </div>
                  ` : ''}

                  <p style="margin-top: 20px;">
                    If you have any questions about this invoice, please don't hesitate to contact us at <a href="mailto:info@groeimetai.io">info@groeimetai.io</a>.
                  </p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} GroeimetAI. All rights reserved.</p>
                  <p>GroeimetAI | Fabriekstraat 20 | 7311GP Apeldoorn | Netherlands</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `
Dear ${data.recipientName || 'Valued Client'},

Please find your invoice from GroeimetAI below.

Invoice Number: ${data.invoice?.invoiceNumber || 'N/A'}
Date: ${formatDate(data.invoice?.createdAt)}
Due Date: ${formatDate(data.invoice?.dueDate)}
Total: ${currency} ${formattedTotal}

${data.paymentUrl ? `Pay now: ${data.paymentUrl}\n` : ''}
${data.pdfUrl ? `Download Invoice PDF: ${data.pdfUrl}\n` : ''}

If you have any questions about this invoice, please don't hesitate to contact us at info@groeimetai.io.

© ${new Date().getFullYear()} GroeimetAI. All rights reserved.
GroeimetAI | Fabriekstraat 20 | 7311GP Apeldoorn | Netherlands
        `,
      };
    },

    // Email template for invoice reminders
    sendInvoiceReminder: (data: EmailTemplateData) => {
      const reminderMessages = {
        due_soon: {
          subject: `Reminder: Invoice #${data.invoice?.invoiceNumber} due soon`,
          intro: 'This is a friendly reminder that your invoice will be due soon.',
        },
        overdue: {
          subject: `Overdue Notice: Invoice #${data.invoice?.invoiceNumber}`,
          intro: 'This is a reminder that your invoice is now overdue.',
        },
        final_notice: {
          subject: `Final Notice: Invoice #${data.invoice?.invoiceNumber}`,
          intro: 'This is a final notice regarding your overdue invoice.',
        },
      };

      const reminder = reminderMessages[data.reminderType || 'due_soon'];

      return {
        subject: reminder.subject,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #FF6600; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                .content { background-color: #f4f4f4; padding: 20px; border-radius: 0 0 5px 5px; }
                .invoice-details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
                .amount { font-size: 24px; font-weight: bold; color: ${data.reminderType === 'final_notice' ? '#f44336' : '#FF6600'}; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                .button { display: inline-block; padding: 10px 20px; background-color: #FF6600; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Invoice Reminder</h1>
                </div>
                <div class="content">
                  <p>Dear ${data.recipientName || 'Valued Client'},</p>
                  <p>${reminder.intro}</p>
                  
                  <div class="invoice-details">
                    <p><strong>Invoice Number:</strong> ${data.invoice?.invoiceNumber}</p>
                    <p><strong>Original Date:</strong> ${new Date(data.invoice?.createdAt || Date.now()).toLocaleDateString()}</p>
                    <p><strong>Due Date:</strong> ${new Date(data.invoice?.dueDate || Date.now()).toLocaleDateString()}</p>
                    <p class="amount">Amount Due: ${data.invoice?.currency || 'EUR'} ${data.invoice?.totalAmount?.toFixed(2)}</p>
                  </div>
                  
                  <p>Please arrange payment at your earliest convenience to avoid any late fees or service interruptions.</p>
                  
                  <p style="margin-top: 20px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invoices/${data.invoice?.id}" class="button">
                      View Invoice
                    </a>
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

${reminder.intro}

Invoice Number: ${data.invoice?.invoiceNumber}
Original Date: ${new Date(data.invoice?.createdAt || Date.now()).toLocaleDateString()}
Due Date: ${new Date(data.invoice?.dueDate || Date.now()).toLocaleDateString()}
Amount Due: ${data.invoice?.currency || 'EUR'} ${data.invoice?.totalAmount?.toFixed(2)}

Please arrange payment at your earliest convenience to avoid any late fees or service interruptions.

View Invoice: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invoices/${data.invoice?.id}

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
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
              .content { background-color: #f4f4f4; padding: 20px; border-radius: 0 0 5px 5px; }
              .payment-details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
              .amount { font-size: 24px; font-weight: bold; color: #4CAF50; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Payment Received</h1>
              </div>
              <div class="content">
                <p>Dear ${data.recipientName || 'Valued Client'},</p>
                <p>Thank you! We have received your payment.</p>
                
                <div class="payment-details">
                  <p><strong>Invoice Number:</strong> ${data.invoice?.invoiceNumber}</p>
                  <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
                  <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
                  <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
                  <p class="amount">Amount Paid: ${data.invoice?.currency || 'EUR'} ${data.invoice?.totalAmount?.toFixed(2)}</p>
                </div>
                
                <p>Your account has been updated and the invoice has been marked as paid.</p>
                
                <p style="margin-top: 20px;">
                  If you need a receipt or have any questions, please don't hesitate to contact us.
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

Thank you! We have received your payment.

Invoice Number: ${data.invoice?.invoiceNumber}
Payment Date: ${new Date().toLocaleDateString()}
Payment Method: ${data.paymentMethod}
Transaction ID: ${data.transactionId}
Amount Paid: ${data.invoice?.currency || 'EUR'} ${data.invoice?.totalAmount?.toFixed(2)}

Your account has been updated and the invoice has been marked as paid.

If you need a receipt or have any questions, please don't hesitate to contact us.

© ${new Date().getFullYear()} GroeimetAI. All rights reserved.
      `,
    }),
  };
}