interface BaseEmailData {
  recipientName?: string;
  recipientEmail: string;
}

interface ProjectRequestEmailData extends BaseEmailData {
  projectName: string;
  companyName: string;
  services: string[];
  budget: string;
  timeline: string;
  description: string;
  requestId: string;
}

interface QuoteStatusEmailData extends BaseEmailData {
  projectName: string;
  oldStatus: string;
  newStatus: string;
  message?: string;
  quoteId: string;
}

interface MeetingRequestEmailData extends BaseEmailData {
  requesterName: string;
  requesterEmail: string;
  company?: string;
  topic: string;
  date: string;
  time: string;
  meetingType: string;
  description?: string;
  meetingId: string;
}

export const emailTemplates = {
  // Email template for new project requests (to admin)
  newProjectRequest: (data: ProjectRequestEmailData) => ({
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
                  ${data.services.map(service => `• ${service}`).join('<br>')}
                </div>
              </div>
              
              <div class="field">
                <span class="label">Project Description:</span>
                <div class="services">
                  ${data.description}
                </div>
              </div>
              
              <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin" class="button">
                  View in Admin Dashboard
                </a>
              </p>
            </div>
            <div class="footer">
              <p>This is an automated notification from GroeimetAI</p>
              <p>Apeldoorn, Nederland | KVK: 90102304</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
New Project Request: ${data.projectName}

A new project request has been submitted through the GroeimetAI website.

Project Name: ${data.projectName}
Company: ${data.companyName}
Contact: ${data.recipientName || 'N/A'} (${data.recipientEmail})
Budget: ${data.budget}
Timeline: ${data.timeline}

Services Requested:
${data.services.map(service => `• ${service}`).join('\n')}

Project Description:
${data.description}

View in Admin Dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin

This is an automated notification from GroeimetAI
Apeldoorn, Nederland | KVK: 90102304
    `,
  }),

  // Email template for quote status changes (to client)
  quoteStatusChange: (data: QuoteStatusEmailData) => ({
    subject: `Your Project Request Update: ${data.projectName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FF6600; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f4f4f4; padding: 20px; border-radius: 0 0 5px 5px; }
            .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
            .status-pending { background-color: #ffc107; color: #000; }
            .status-reviewed { background-color: #17a2b8; color: #fff; }
            .status-approved { background-color: #28a745; color: #fff; }
            .status-rejected { background-color: #dc3545; color: #fff; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background-color: #FF6600; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Project Request Update</h1>
            </div>
            <div class="content">
              <p>Dear ${data.recipientName || 'Valued Client'},</p>
              
              <p>We have an update regarding your project request: <strong>${data.projectName}</strong></p>
              
              <p>Status changed from <span class="status status-${data.oldStatus}">${data.oldStatus}</span> to <span class="status status-${data.newStatus}">${data.newStatus}</span></p>
              
              ${data.message ? `
              <p><strong>Message from our team:</strong></p>
              <p style="background-color: white; padding: 15px; border-radius: 5px; border-left: 4px solid #FF6600;">
                ${data.message}
              </p>
              ` : ''}
              
              ${data.newStatus === 'approved' ? `
              <p>Great news! Your project has been approved. Our team will contact you shortly to discuss the next steps.</p>
              ` : data.newStatus === 'reviewed' ? `
              <p>Your project request is currently being reviewed by our team. We'll update you soon with our decision.</p>
              ` : ''}
              
              <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">
                  View in Dashboard
                </a>
              </p>
            </div>
            <div class="footer">
              <p>Thank you for choosing GroeimetAI</p>
              <p>Apeldoorn, Nederland | KVK: 90102304</p>
              <p>info@groeimetai.io | groeimetai.io</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Dear ${data.recipientName || 'Valued Client'},

We have an update regarding your project request: ${data.projectName}

Status changed from ${data.oldStatus} to ${data.newStatus}

${data.message ? `Message from our team:\n${data.message}\n` : ''}

${data.newStatus === 'approved' ? 'Great news! Your project has been approved. Our team will contact you shortly to discuss the next steps.' : data.newStatus === 'reviewed' ? 'Your project request is currently being reviewed by our team. We\'ll update you soon with our decision.' : ''}

View in Dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

Thank you for choosing GroeimetAI
Apeldoorn, Nederland | KVK: 90102304
info@groeimetai.io | groeimetai.io
    `,
  }),

  // Email template for new meeting requests (to admin)
  newMeetingRequest: (data: MeetingRequestEmailData) => ({
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
            .meeting-details { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
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
              <p>A new meeting has been requested through the GroeimetAI website.</p>
              
              <div class="meeting-details">
                <div class="field">
                  <span class="label">Topic:</span>
                  <span class="value">${data.topic}</span>
                </div>
                
                <div class="field">
                  <span class="label">Date & Time:</span>
                  <span class="value">${data.date} at ${data.time}</span>
                </div>
                
                <div class="field">
                  <span class="label">Meeting Type:</span>
                  <span class="value">${data.meetingType}</span>
                </div>
                
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
                
                ${data.description ? `
                <div class="field">
                  <span class="label">Description:</span>
                  <div style="margin-top: 5px;">${data.description}</div>
                </div>
                ` : ''}
              </div>
              
              <p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin" class="button">
                  View in Admin Dashboard
                </a>
              </p>
              
              <p style="margin-top: 20px; font-size: 14px; color: #666;">
                Please confirm or reschedule this meeting as soon as possible.
              </p>
            </div>
            <div class="footer">
              <p>This is an automated notification from GroeimetAI</p>
              <p>Apeldoorn, Nederland | KVK: 90102304</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
New Meeting Request

A new meeting has been requested through the GroeimetAI website.

Topic: ${data.topic}
Date & Time: ${data.date} at ${data.time}
Meeting Type: ${data.meetingType}
Requester: ${data.requesterName} (${data.requesterEmail})
${data.company ? `Company: ${data.company}` : ''}
${data.description ? `Description: ${data.description}` : ''}

View in Admin Dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin

Please confirm or reschedule this meeting as soon as possible.

This is an automated notification from GroeimetAI
Apeldoorn, Nederland | KVK: 90102304
    `,
  }),
};