import { EmailTemplateData } from './index';

export function getEmailTemplate() {
  return {
    // Email template voor nieuwe project aanvragen (naar admin)
    newProjectRequest: (data: EmailTemplateData) => ({
      subject: `Nieuwe Project Aanvraag: ${data.projectName}`,
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
                <h1>Nieuwe Project Aanvraag</h1>
              </div>
              <div class="content">
                <p>Hallo,</p>
                <p>Er is een nieuwe project aanvraag ingediend via de GroeimetAI website.</p>
                
                <div class="field">
                  <span class="label">Project Naam:</span>
                  <span class="value">${data.projectName}</span>
                </div>
                
                <div class="field">
                  <span class="label">Bedrijf:</span>
                  <span class="value">${data.companyName}</span>
                </div>
                
                <div class="field">
                  <span class="label">Contact:</span>
                  <span class="value">${data.recipientName || 'N.v.t.'} (${data.recipientEmail})</span>
                </div>
                
                <div class="field">
                  <span class="label">Budget:</span>
                  <span class="value">${data.budget}</span>
                </div>
                
                <div class="field">
                  <span class="label">Tijdslijn:</span>
                  <span class="value">${data.timeline}</span>
                </div>
                
                <div class="field">
                  <span class="label">Gevraagde Diensten:</span>
                  <div class="services">
                    ${data.services?.map(service => `• ${service}`).join('<br>') || 'N.v.t.'}
                  </div>
                </div>
                
                <div class="field">
                  <span class="label">Project Omschrijving:</span>
                  <div class="services">
                    ${data.description}
                  </div>
                </div>
                
                <p style="margin-top: 20px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/quotes/${data.requestId}" class="button">
                    Bekijk Aanvraag in Dashboard
                  </a>
                </p>
              </div>
              <div class="footer">
                <p>Dit is een automatische notificatie van GroeimetAI.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Nieuwe Project Aanvraag

Er is een nieuwe project aanvraag ingediend via de GroeimetAI website.

Project Naam: ${data.projectName}
Bedrijf: ${data.companyName}
Contact: ${data.recipientName || 'N.v.t.'} (${data.recipientEmail})
Budget: ${data.budget}
Tijdslijn: ${data.timeline}

Gevraagde Diensten:
${data.services?.map(service => `• ${service}`).join('\n') || 'N.v.t.'}

Project Omschrijving:
${data.description}

Bekijk aanvraag: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/quotes/${data.requestId}

Dit is een automatische notificatie van GroeimetAI.
      `,
    }),

    // Email template voor quote status wijzigingen (naar klant)
    quoteStatusChange: (data: EmailTemplateData) => ({
      subject: `Update over uw Project Aanvraag: ${data.projectName}`,
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
                <p>Beste ${data.recipientName || 'klant'},</p>
                <p>We hebben een update betreffende uw project aanvraag.</p>
                
                <h2 style="color: #FF6600;">${data.projectName}</h2>
                
                <p>Status gewijzigd van: <span class="status ${data.oldStatus}">${getStatusInDutch(data.oldStatus)}</span></p>
                <p>Nieuwe status: <span class="status ${data.newStatus}">${getStatusInDutch(data.newStatus)}</span></p>
                
                ${data.message ? `
                  <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Bericht van ons team:</strong></p>
                    <p style="margin: 10px 0 0 0;">${data.message}</p>
                  </div>
                ` : ''}
                
                ${data.newStatus === 'approved' ? `
                  <p style="color: #4CAF50; font-weight: bold;">
                    🎉 Gefeliciteerd! Uw project is goedgekeurd.
                  </p>
                  <p>Ons team neemt binnenkort contact met u op om de volgende stappen te bespreken.</p>
                ` : ''}
                
                ${data.newStatus === 'rejected' ? `
                  <p>We waarderen uw interesse in onze diensten. Hoewel we op dit moment niet verder kunnen gaan met dit specifieke verzoek, moedigen we u aan om contact op te nemen om alternatieve oplossingen te bespreken.</p>
                ` : ''}
                
                ${data.newStatus === 'reviewed' ? `
                  <p>Ons team heeft uw project aanvraag beoordeeld. We nemen mogelijk contact met u op voor aanvullende informatie indien nodig.</p>
                ` : ''}
                
                <p style="margin-top: 20px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${data.quoteId}" class="button">
                    Bekijk Project Details
                  </a>
                </p>
                
                <p style="margin-top: 20px;">
                  Heeft u vragen? Aarzel niet om contact met ons op te nemen.
                </p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} GroeimetAI. Alle rechten voorbehouden.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Beste ${data.recipientName || 'klant'},

We hebben een update betreffende uw project aanvraag.

Project: ${data.projectName}

Status gewijzigd van: ${getStatusInDutch(data.oldStatus)}
Nieuwe status: ${getStatusInDutch(data.newStatus)}

${data.message ? `Bericht van ons team:\n${data.message}\n` : ''}

${data.newStatus === 'approved' ? '🎉 Gefeliciteerd! Uw project is goedgekeurd. Ons team neemt binnenkort contact met u op om de volgende stappen te bespreken.\n' : ''}

${data.newStatus === 'rejected' ? 'We waarderen uw interesse in onze diensten. Hoewel we op dit moment niet verder kunnen gaan met dit specifieke verzoek, moedigen we u aan om contact op te nemen om alternatieve oplossingen te bespreken.\n' : ''}

${data.newStatus === 'reviewed' ? 'Ons team heeft uw project aanvraag beoordeeld. We nemen mogelijk contact met u op voor aanvullende informatie indien nodig.\n' : ''}

Bekijk project details: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${data.quoteId}

Heeft u vragen? Aarzel niet om contact met ons op te nemen.

© ${new Date().getFullYear()} GroeimetAI. Alle rechten voorbehouden.
      `,
    }),

    // Email template voor nieuwe meeting aanvragen (naar admin)
    newMeetingRequest: (data: EmailTemplateData) => ({
      subject: `Nieuwe Meeting Aanvraag: ${data.topic}`,
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
                <h1>Nieuwe Meeting Aanvraag</h1>
              </div>
              <div class="content">
                <p>Hallo,</p>
                <p>Er is een nieuwe meeting aanvraag ingediend.</p>
                
                <div class="meeting-details">
                  <div class="field">
                    <span class="label">Aanvrager:</span>
                    <span class="value">${data.requesterName} (${data.requesterEmail})</span>
                  </div>
                  
                  ${data.company ? `
                    <div class="field">
                      <span class="label">Bedrijf:</span>
                      <span class="value">${data.company}</span>
                    </div>
                  ` : ''}
                  
                  <div class="field">
                    <span class="label">Meeting Onderwerp:</span>
                    <span class="value">${data.topic}</span>
                  </div>
                  
                  <div class="field">
                    <span class="label">Meeting Type:</span>
                    <span class="value">${data.meetingType}</span>
                  </div>
                  
                  <div class="field">
                    <span class="label">Voorkeursdatum:</span>
                    <span class="value">${data.date}</span>
                  </div>
                  
                  <div class="field">
                    <span class="label">Voorkeurstijd:</span>
                    <span class="value">${data.time}</span>
                  </div>
                  
                  ${data.description ? `
                    <div class="field">
                      <span class="label">Aanvullende Informatie:</span>
                      <div style="margin-left: 10px; margin-top: 5px;">
                        ${data.description}
                      </div>
                    </div>
                  ` : ''}
                </div>
                
                <p style="margin-top: 20px;">
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/consultations/${data.meetingId}" class="button">
                    Bekijk Meeting Aanvraag
                  </a>
                </p>
              </div>
              <div class="footer">
                <p>Dit is een automatische notificatie van GroeimetAI.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Nieuwe Meeting Aanvraag

Er is een nieuwe meeting aanvraag ingediend.

Aanvrager: ${data.requesterName} (${data.requesterEmail})
${data.company ? `Bedrijf: ${data.company}\n` : ''}
Meeting Onderwerp: ${data.topic}
Meeting Type: ${data.meetingType}
Voorkeursdatum: ${data.date}
Voorkeurstijd: ${data.time}
${data.description ? `\nAanvullende Informatie:\n${data.description}\n` : ''}

Bekijk meeting aanvraag: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/consultations/${data.meetingId}

Dit is een automatische notificatie van GroeimetAI.
      `,
    }),

    // Email template voor het versturen van facturen (naar klant)
    sendInvoice: (data: EmailTemplateData) => {
      // Helper to format date safely
      const formatDate = (dateValue: any): string => {
        if (!dateValue) return 'N/B';
        if (dateValue instanceof Date) return dateValue.toLocaleDateString('nl-NL');
        if (typeof dateValue === 'string') return new Date(dateValue).toLocaleDateString('nl-NL');
        if (dateValue.toDate) return dateValue.toDate().toLocaleDateString('nl-NL');
        return 'N/B';
      };

      // Get financial data safely
      const currency = data.invoice?.financial?.currency || 'EUR';
      const total = data.invoice?.financial?.total;
      const formattedTotal = typeof total === 'number' ? total.toFixed(2) : '0.00';

      return {
        subject: `Factuur #${data.invoice?.invoiceNumber} van GroeimetAI`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Factuur van GroeimetAI</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
                <tr>
                  <td style="padding: 40px 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: #141414; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">

                      <!-- Logo Section -->
                      <tr>
                        <td style="background-color: #0a0a0a; padding: 30px 40px; text-align: center; border-bottom: 1px solid #1f1f1f;">
                          <img src="https://groeimetai.io/GroeimetAi_logo_small.png" alt="GroeimetAI" width="160" height="auto" style="display: block; margin: 0 auto; max-width: 160px;" />
                        </td>
                      </tr>

                      <!-- Header Accent Bar -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #FF6600 0%, #cc5200 100%); padding: 20px 40px; text-align: center;">
                          <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.95); letter-spacing: 1.5px; text-transform: uppercase; font-weight: 500;">AI Automation Partner</p>
                        </td>
                      </tr>

                      <!-- Invoice Badge -->
                      <tr>
                        <td style="padding: 30px 40px 0 40px; text-align: center;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                            <tr>
                              <td style="background-color: rgba(255, 102, 0, 0.15); border: 1px solid rgba(255, 102, 0, 0.3); border-radius: 50px; padding: 10px 24px;">
                                <span style="color: #FF6600; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">Factuur</span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Greeting -->
                      <tr>
                        <td style="padding: 30px 40px 20px 40px;">
                          <p style="margin: 0; color: #ffffff; font-size: 18px; line-height: 1.6;">Beste ${data.recipientName || 'klant'},</p>
                          <p style="margin: 16px 0 0 0; color: #a3a3a3; font-size: 16px; line-height: 1.6;">Bedankt voor uw vertrouwen. Hieronder vindt u de details van uw factuur.</p>
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
                                    <td style="color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 6px;">Factuurnummer</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #ffffff; font-size: 18px; font-weight: 600;">${data.invoice?.invoiceNumber || 'N/B'}</td>
                                  </tr>
                                </table>

                                <!-- Dates Row -->
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                                  <tr>
                                    <td width="50%" style="vertical-align: top;">
                                      <p style="margin: 0; color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Factuurdatum</p>
                                      <p style="margin: 6px 0 0 0; color: #ffffff; font-size: 15px;">${formatDate(data.invoice?.createdAt)}</p>
                                    </td>
                                    <td width="50%" style="vertical-align: top;">
                                      <p style="margin: 0; color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Vervaldatum</p>
                                      <p style="margin: 6px 0 0 0; color: #ffffff; font-size: 15px;">${formatDate(data.invoice?.dueDate)}</p>
                                    </td>
                                  </tr>
                                </table>

                                <!-- Divider -->
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td style="border-top: 1px solid #2a2a2a; padding-top: 24px;">
                                      <p style="margin: 0; color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Te Betalen</p>
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
                                      <a href="${data.paymentUrl}" target="_blank" style="display: block; padding: 18px 40px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; letter-spacing: 0.3px;">Direct Betalen</a>
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
                                      <a href="${data.pdfUrl}" target="_blank" style="display: block; padding: 16px 40px; color: #ffffff; font-size: 15px; font-weight: 500; text-decoration: none;">Download Factuur PDF</a>
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
                                  Vragen over deze factuur? Neem contact met ons op via
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
                                  Fabriekstraat 20 · 7311GP Apeldoorn · Nederland
                                </p>
                                <p style="margin: 0; color: #404040; font-size: 12px;">
                                  © ${new Date().getFullYear()} GroeimetAI. Alle rechten voorbehouden.
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
GROEIMETAI - FACTUUR

Beste ${data.recipientName || 'klant'},

Bedankt voor uw vertrouwen. Hieronder vindt u de details van uw factuur.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FACTUURGEGEVENS

Factuurnummer: ${data.invoice?.invoiceNumber || 'N/B'}
Factuurdatum: ${formatDate(data.invoice?.createdAt)}
Vervaldatum: ${formatDate(data.invoice?.dueDate)}

TE BETALEN: ${currency} ${formattedTotal}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${data.paymentUrl ? `DIRECT BETALEN: ${data.paymentUrl}\n` : ''}
${data.pdfUrl ? `DOWNLOAD PDF: ${data.pdfUrl}\n` : ''}

Vragen? Neem contact met ons op via info@groeimetai.io

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GroeimetAI
Fabriekstraat 20 · 7311GP Apeldoorn · Nederland

© ${new Date().getFullYear()} GroeimetAI. Alle rechten voorbehouden.
        `,
      };
    },

    // Email template voor factuur herinneringen
    sendInvoiceReminder: (data: EmailTemplateData) => {
      const reminderMessages = {
        due_soon: {
          subject: `Herinnering: Factuur #${data.invoice?.invoiceNumber} vervalt binnenkort`,
          intro: 'Dit is een vriendelijke herinnering dat uw factuur binnenkort vervalt.',
          badgeColor: '#FF6600',
          badgeText: 'Betalingsherinnering',
        },
        overdue: {
          subject: `Betalingsherinnering: Factuur #${data.invoice?.invoiceNumber}`,
          intro: 'Dit is een herinnering dat uw factuur inmiddels is vervallen.',
          badgeColor: '#f59e0b',
          badgeText: 'Vervallen',
        },
        final_notice: {
          subject: `Laatste Herinnering: Factuur #${data.invoice?.invoiceNumber}`,
          intro: 'Dit is een laatste herinnering betreffende uw openstaande factuur.',
          badgeColor: '#ef4444',
          badgeText: 'Laatste Aanmaning',
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
              <title>Factuur Herinnering van GroeimetAI</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
                <tr>
                  <td style="padding: 40px 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: #141414; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">

                      <!-- Logo Section -->
                      <tr>
                        <td style="background-color: #0a0a0a; padding: 30px 40px; text-align: center; border-bottom: 1px solid #1f1f1f;">
                          <img src="https://groeimetai.io/GroeimetAi_logo_small.png" alt="GroeimetAI" width="160" height="auto" style="display: block; margin: 0 auto; max-width: 160px;" />
                        </td>
                      </tr>

                      <!-- Header Accent Bar -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #FF6600 0%, #cc5200 100%); padding: 20px 40px; text-align: center;">
                          <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.95); letter-spacing: 1.5px; text-transform: uppercase; font-weight: 500;">AI Automation Partner</p>
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
                          <p style="margin: 0; color: #ffffff; font-size: 18px; line-height: 1.6;">Beste ${data.recipientName || 'klant'},</p>
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
                                    <td style="color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 6px;">Factuurnummer</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #ffffff; font-size: 18px; font-weight: 600;">${data.invoice?.invoiceNumber}</td>
                                  </tr>
                                </table>

                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                                  <tr>
                                    <td width="50%" style="vertical-align: top;">
                                      <p style="margin: 0; color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Factuurdatum</p>
                                      <p style="margin: 6px 0 0 0; color: #ffffff; font-size: 15px;">${new Date(data.invoice?.createdAt || Date.now()).toLocaleDateString('nl-NL')}</p>
                                    </td>
                                    <td width="50%" style="vertical-align: top;">
                                      <p style="margin: 0; color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Vervaldatum</p>
                                      <p style="margin: 6px 0 0 0; color: ${amountColor}; font-size: 15px; font-weight: 600;">${new Date(data.invoice?.dueDate || Date.now()).toLocaleDateString('nl-NL')}</p>
                                    </td>
                                  </tr>
                                </table>

                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td style="border-top: 1px solid #2a2a2a; padding-top: 24px;">
                                      <p style="margin: 0; color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Te Betalen</p>
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
                                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invoices/${data.invoice?.id}" target="_blank" style="display: block; padding: 18px 40px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none;">Bekijk & Betaal Factuur</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- Message -->
                      <tr>
                        <td style="padding: 0 40px 40px 40px;">
                          <p style="margin: 0; color: #a3a3a3; font-size: 14px; line-height: 1.6;">Wij verzoeken u vriendelijk om de betaling zo spoedig mogelijk te voldoen om eventuele kosten of onderbreking van diensten te voorkomen.</p>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #0f0f0f; padding: 30px 40px; border-top: 1px solid #1f1f1f;">
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="text-align: center;">
                                <p style="margin: 0 0 8px 0; color: #FF6600; font-size: 16px; font-weight: 600;">GroeimetAI</p>
                                <p style="margin: 0 0 16px 0; color: #525252; font-size: 13px;">Fabriekstraat 20 · 7311GP Apeldoorn · Nederland</p>
                                <p style="margin: 0; color: #404040; font-size: 12px;">© ${new Date().getFullYear()} GroeimetAI. Alle rechten voorbehouden.</p>
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

Beste ${data.recipientName || 'klant'},

${reminder.intro}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Factuurnummer: ${data.invoice?.invoiceNumber}
Factuurdatum: ${new Date(data.invoice?.createdAt || Date.now()).toLocaleDateString('nl-NL')}
Vervaldatum: ${new Date(data.invoice?.dueDate || Date.now()).toLocaleDateString('nl-NL')}

TE BETALEN: ${data.invoice?.currency || 'EUR'} ${data.invoice?.totalAmount?.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEKIJK FACTUUR: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invoices/${data.invoice?.id}

Wij verzoeken u vriendelijk om de betaling zo spoedig mogelijk te voldoen.

© ${new Date().getFullYear()} GroeimetAI. Alle rechten voorbehouden.
        `,
      };
    },

    // Email template voor betalingsbevestiging
    sendPaymentConfirmation: (data: EmailTemplateData) => ({
      subject: `Betaling Ontvangen - Factuur #${data.invoice?.invoiceNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Betalingsbevestiging van GroeimetAI</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
              <tr>
                <td style="padding: 40px 20px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: #141414; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">

                    <!-- Logo Section -->
                    <tr>
                      <td style="background-color: #0a0a0a; padding: 30px 40px; text-align: center; border-bottom: 1px solid #1f1f1f;">
                        <img src="https://groeimetai.io/GroeimetAi_logo_small.png" alt="GroeimetAI" width="160" height="auto" style="display: block; margin: 0 auto; max-width: 160px;" />
                      </td>
                    </tr>

                    <!-- Header Accent Bar (Success) -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #125312 0%, #0f4a0f 100%); padding: 20px 40px; text-align: center;">
                        <p style="margin: 0; font-size: 13px; color: rgba(255,255,255,0.95); letter-spacing: 1.5px; text-transform: uppercase; font-weight: 500;">AI Automation Partner</p>
                      </td>
                    </tr>

                    <!-- Success Badge -->
                    <tr>
                      <td style="padding: 30px 40px 0 40px; text-align: center;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                          <tr>
                            <td style="background-color: rgba(18, 83, 18, 0.2); border: 1px solid rgba(18, 83, 18, 0.4); border-radius: 50px; padding: 10px 24px;">
                              <span style="color: #22c55e; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">✓ Betaling Ontvangen</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Greeting -->
                    <tr>
                      <td style="padding: 30px 40px 20px 40px;">
                        <p style="margin: 0; color: #ffffff; font-size: 18px; line-height: 1.6;">Beste ${data.recipientName || 'klant'},</p>
                        <p style="margin: 16px 0 0 0; color: #a3a3a3; font-size: 16px; line-height: 1.6;">Bedankt! We hebben uw betaling succesvol ontvangen.</p>
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
                                  <td style="color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 6px;">Factuurnummer</td>
                                </tr>
                                <tr>
                                  <td style="color: #ffffff; font-size: 18px; font-weight: 600;">${data.invoice?.invoiceNumber}</td>
                                </tr>
                              </table>

                              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
                                <tr>
                                  <td width="50%" style="vertical-align: top; padding-bottom: 16px;">
                                    <p style="margin: 0; color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Betalingsdatum</p>
                                    <p style="margin: 6px 0 0 0; color: #ffffff; font-size: 15px;">${new Date().toLocaleDateString('nl-NL')}</p>
                                  </td>
                                  <td width="50%" style="vertical-align: top; padding-bottom: 16px;">
                                    <p style="margin: 0; color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Betalingsmethode</p>
                                    <p style="margin: 6px 0 0 0; color: #ffffff; font-size: 15px;">${data.paymentMethod}</p>
                                  </td>
                                </tr>
                                <tr>
                                  <td colspan="2" style="vertical-align: top;">
                                    <p style="margin: 0; color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Transactie ID</p>
                                    <p style="margin: 6px 0 0 0; color: #ffffff; font-size: 14px; font-family: monospace;">${data.transactionId}</p>
                                  </td>
                                </tr>
                              </table>

                              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                  <td style="border-top: 1px solid #2a2a2a; padding-top: 24px;">
                                    <p style="margin: 0; color: #737373; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Betaald Bedrag</p>
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
                                Uw account is bijgewerkt en de factuur is gemarkeerd als betaald. Heeft u een kwitantie nodig of heeft u vragen? Neem contact met ons op via
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
                              <p style="margin: 0 0 16px 0; color: #525252; font-size: 13px;">Fabriekstraat 20 · 7311GP Apeldoorn · Nederland</p>
                              <p style="margin: 0; color: #404040; font-size: 12px;">© ${new Date().getFullYear()} GroeimetAI. Alle rechten voorbehouden.</p>
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
GROEIMETAI - BETALINGSBEVESTIGING

Beste ${data.recipientName || 'klant'},

Bedankt! We hebben uw betaling succesvol ontvangen.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BETALINGSGEGEVENS

Factuurnummer: ${data.invoice?.invoiceNumber}
Betalingsdatum: ${new Date().toLocaleDateString('nl-NL')}
Betalingsmethode: ${data.paymentMethod}
Transactie ID: ${data.transactionId}

BETAALD BEDRAG: ${data.invoice?.currency || 'EUR'} ${data.invoice?.totalAmount?.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Uw account is bijgewerkt en de factuur is gemarkeerd als betaald.

Vragen? Neem contact met ons op via info@groeimetai.io

© ${new Date().getFullYear()} GroeimetAI. Alle rechten voorbehouden.
      `,
    }),
  };
}

function getStatusInDutch(status?: string): string {
  switch (status) {
    case 'pending':
      return 'IN AFWACHTING';
    case 'reviewed':
      return 'BEOORDEELD';
    case 'approved':
      return 'GOEDGEKEURD';
    case 'rejected':
      return 'AFGEWEZEN';
    default:
      return status?.toUpperCase() || '';
  }
}