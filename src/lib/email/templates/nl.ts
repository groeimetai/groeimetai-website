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
    sendInvoice: (data: EmailTemplateData) => ({
      subject: `Factuur #${data.invoice?.invoiceNumber} van GroeimetAI`,
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
              .button { display: inline-block; padding: 10px 20px; background-color: #FF6600; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Factuur</h1>
              </div>
              <div class="content">
                <p>Beste ${data.recipientName || 'klant'},</p>
                <p>Hierbij ontvangt u uw factuur van GroeimetAI.</p>
                
                <div class="invoice-details">
                  <p><strong>Factuurnummer:</strong> ${data.invoice?.invoiceNumber}</p>
                  <p><strong>Datum:</strong> ${new Date(data.invoice?.createdAt || Date.now()).toLocaleDateString('nl-NL')}</p>
                  <p><strong>Vervaldatum:</strong> ${new Date(data.invoice?.dueDate || Date.now()).toLocaleDateString('nl-NL')}</p>
                  <p class="amount">Totaal: ${data.invoice?.currency || 'EUR'} ${data.invoice?.totalAmount?.toFixed(2)}</p>
                </div>
                
                ${data.pdfUrl ? `
                  <p style="margin-top: 20px;">
                    <a href="${data.pdfUrl}" class="button">
                      Download Factuur PDF
                    </a>
                  </p>
                ` : ''}
                
                <p style="margin-top: 20px;">
                  Heeft u vragen over deze factuur? Aarzel niet om contact met ons op te nemen.
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

Hierbij ontvangt u uw factuur van GroeimetAI.

Factuurnummer: ${data.invoice?.invoiceNumber}
Datum: ${new Date(data.invoice?.createdAt || Date.now()).toLocaleDateString('nl-NL')}
Vervaldatum: ${new Date(data.invoice?.dueDate || Date.now()).toLocaleDateString('nl-NL')}
Totaal: ${data.invoice?.currency || 'EUR'} ${data.invoice?.totalAmount?.toFixed(2)}

${data.pdfUrl ? `Download Factuur PDF: ${data.pdfUrl}\n` : ''}

Heeft u vragen over deze factuur? Aarzel niet om contact met ons op te nemen.

© ${new Date().getFullYear()} GroeimetAI. Alle rechten voorbehouden.
      `,
    }),

    // Email template voor factuur herinneringen
    sendInvoiceReminder: (data: EmailTemplateData) => {
      const reminderMessages = {
        due_soon: {
          subject: `Herinnering: Factuur #${data.invoice?.invoiceNumber} vervalt binnenkort`,
          intro: 'Dit is een vriendelijke herinnering dat uw factuur binnenkort vervalt.',
        },
        overdue: {
          subject: `Betalingsherinnering: Factuur #${data.invoice?.invoiceNumber}`,
          intro: 'Dit is een herinnering dat uw factuur inmiddels is vervallen.',
        },
        final_notice: {
          subject: `Laatste Herinnering: Factuur #${data.invoice?.invoiceNumber}`,
          intro: 'Dit is een laatste herinnering betreffende uw openstaande factuur.',
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
                  <h1>Factuur Herinnering</h1>
                </div>
                <div class="content">
                  <p>Beste ${data.recipientName || 'klant'},</p>
                  <p>${reminder.intro}</p>
                  
                  <div class="invoice-details">
                    <p><strong>Factuurnummer:</strong> ${data.invoice?.invoiceNumber}</p>
                    <p><strong>Factuurdatum:</strong> ${new Date(data.invoice?.createdAt || Date.now()).toLocaleDateString('nl-NL')}</p>
                    <p><strong>Vervaldatum:</strong> ${new Date(data.invoice?.dueDate || Date.now()).toLocaleDateString('nl-NL')}</p>
                    <p class="amount">Openstaand bedrag: ${data.invoice?.currency || 'EUR'} ${data.invoice?.totalAmount?.toFixed(2)}</p>
                  </div>
                  
                  <p>Wij verzoeken u vriendelijk om de betaling zo spoedig mogelijk te voldoen om eventuele kosten of onderbreking van diensten te voorkomen.</p>
                  
                  <p style="margin-top: 20px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invoices/${data.invoice?.id}" class="button">
                      Bekijk Factuur
                    </a>
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

${reminder.intro}

Factuurnummer: ${data.invoice?.invoiceNumber}
Factuurdatum: ${new Date(data.invoice?.createdAt || Date.now()).toLocaleDateString('nl-NL')}
Vervaldatum: ${new Date(data.invoice?.dueDate || Date.now()).toLocaleDateString('nl-NL')}
Openstaand bedrag: ${data.invoice?.currency || 'EUR'} ${data.invoice?.totalAmount?.toFixed(2)}

Wij verzoeken u vriendelijk om de betaling zo spoedig mogelijk te voldoen om eventuele kosten of onderbreking van diensten te voorkomen.

Bekijk Factuur: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invoices/${data.invoice?.id}

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
                <h1>Betaling Ontvangen</h1>
              </div>
              <div class="content">
                <p>Beste ${data.recipientName || 'klant'},</p>
                <p>Bedankt! We hebben uw betaling ontvangen.</p>
                
                <div class="payment-details">
                  <p><strong>Factuurnummer:</strong> ${data.invoice?.invoiceNumber}</p>
                  <p><strong>Betalingsdatum:</strong> ${new Date().toLocaleDateString('nl-NL')}</p>
                  <p><strong>Betalingsmethode:</strong> ${data.paymentMethod}</p>
                  <p><strong>Transactie ID:</strong> ${data.transactionId}</p>
                  <p class="amount">Betaald bedrag: ${data.invoice?.currency || 'EUR'} ${data.invoice?.totalAmount?.toFixed(2)}</p>
                </div>
                
                <p>Uw account is bijgewerkt en de factuur is gemarkeerd als betaald.</p>
                
                <p style="margin-top: 20px;">
                  Als u een kwitantie nodig heeft of vragen heeft, aarzel dan niet om contact met ons op te nemen.
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

Bedankt! We hebben uw betaling ontvangen.

Factuurnummer: ${data.invoice?.invoiceNumber}
Betalingsdatum: ${new Date().toLocaleDateString('nl-NL')}
Betalingsmethode: ${data.paymentMethod}
Transactie ID: ${data.transactionId}
Betaald bedrag: ${data.invoice?.currency || 'EUR'} ${data.invoice?.totalAmount?.toFixed(2)}

Uw account is bijgewerkt en de factuur is gemarkeerd als betaald.

Als u een kwitantie nodig heeft of vragen heeft, aarzel dan niet om contact met ons op te nemen.

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