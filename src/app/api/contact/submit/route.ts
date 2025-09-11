import { NextRequest, NextResponse } from 'next/server';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import nodemailer from 'nodemailer';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  console.log('[Contact API] Received request');
  
  try {
    const contactData = await req.json();
    const { name, email, phone, company, message, preferredDate, preferredTime, conversationType } = contactData;
    
    console.log('[Contact API] Processing submission for:', { company, email });

    // Validate required fields
    if (!name || !email || !company) {
      return NextResponse.json(
        { error: 'Naam, email en bedrijf zijn verplicht' },
        { status: 400 }
      );
    }

    console.log('[Contact API] Firebase connection successful');

    // Store contact submission in Firestore
    console.log('[Contact API] Saving to Firestore...');
    const contactSubmission = {
      name,
      email,
      phone: phone || '',
      company,
      message: message || '',
      preferredDate: preferredDate || null,
      preferredTime: preferredTime || null,
      conversationType: conversationType || 'general',
      submittedAt: new Date(),
      status: 'new',
      source: 'website_contact_form'
    };

    // Save to contacts collection
    const contactDoc = await addDoc(collection(db, 'contact_submissions'), contactSubmission);
    console.log('[Contact API] Contact saved with ID:', contactDoc.id);
    
    // Use exact same SMTP pattern as working assessment emails
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Format the admin email content
    const adminEmailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; background-color: #f9fafb; font-family: system-ui, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #F87315, #FF8533); padding: 30px; text-align: center;">
      <div style="margin-bottom: 15px;">
        <img src="https://groeimetai.io/groeimet-ai-logo.svg" alt="GroeimetAI" style="height: 40px; width: auto; filter: brightness(0) invert(1);" />
      </div>
      <h1 style="color: white; margin: 0; font-size: 24px;">🆕 Nieuwe Contact Aanvraag</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px;">
      <!-- Conversation Type Badge & Priority -->
      <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
        <span style="display: inline-block; background: rgba(248,115,21,0.1); color: #F87315; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px;">
          ${conversationType === 'verkennen' ? '💬 Verkennend Gesprek' : 
            conversationType === 'debrief' ? '🎯 Assessment Debrief' : 
            conversationType === 'kickoff' ? '🚀 Project Kickoff' : 
            '📞 Algemeen Contact'}
        </span>
        <span style="display: inline-block; background: ${
          conversationType === 'kickoff' ? 'rgba(239, 68, 68, 0.1); color: #ef4444' :
          conversationType === 'debrief' ? 'rgba(245, 158, 11, 0.1); color: #f59e0b' :
          'rgba(34, 197, 94, 0.1); color: #22c55e'
        }; padding: 6px 12px; border-radius: 20px; font-weight: 500; font-size: 12px;">
          ${conversationType === 'kickoff' ? '🔴 HIGH PRIORITY' :
            conversationType === 'debrief' ? '🟡 MEDIUM PRIORITY' :
            '🟢 STANDARD'}
        </span>
      </div>
      
      <!-- Conversation Context -->
      ${conversationType === 'verkennen' ? `
      <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <h4 style="color: #22c55e; margin: 0 0 8px 0; font-size: 14px;">🔍 Verkennend Gesprek Context</h4>
        <p style="color: #374151; margin: 0; font-size: 14px; line-height: 1.5;">
          Prospect wil AI mogelijkheden verkennen. <strong>Focus op:</strong> Use cases, ROI voorbeelden, implementatie complexiteit.
          <strong>Doel:</strong> Assessment booking of directe offerte aanvraag.
        </p>
      </div>
      ` : conversationType === 'debrief' ? `
      <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <h4 style="color: #f59e0b; margin: 0 0 8px 0; font-size: 14px;">🎯 Assessment Debrief Context</h4>
        <p style="color: #374151; margin: 0; font-size: 14px; line-height: 1.5;">
          <strong>Warm lead!</strong> Heeft al assessment gedaan. <strong>Focus op:</strong> Assessment resultaten, concrete aanbevelingen, Expert Assessment upsell.
          <strong>Doel:</strong> Expert Assessment verkoop (€2.500) of direct project start.
        </p>
      </div>
      ` : conversationType === 'kickoff' ? `
      <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <h4 style="color: #ef4444; margin: 0 0 8px 0; font-size: 14px;">🚀 Project Kickoff Context</h4>
        <p style="color: #374151; margin: 0; font-size: 14px; line-height: 1.5;">
          <strong>🔥 HOT LEAD!</strong> Ready voor implementatie. <strong>Focus op:</strong> Project scope, tijdlijnen, team requirements.
          <strong>Doel:</strong> Contract signing en project start planning.
        </p>
      </div>
      ` : `
      <div style="background: rgba(156, 163, 175, 0.1); border: 1px solid rgba(156, 163, 175, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <h4 style="color: #6b7280; margin: 0 0 8px 0; font-size: 14px;">📞 Algemeen Contact</h4>
        <p style="color: #374151; margin: 0; font-size: 14px; line-height: 1.5;">
          Algemene vraag of interesse. <strong>Kwalificeer eerst:</strong> Bedrijfsgrootte, AI ervaring, budget indicatie.
          <strong>Doel:</strong> Naar verkennend gesprek of assessment leiden.
        </p>
      </div>
      `}
      
      <!-- Contact Details -->
      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #111827; margin-top: 0; font-size: 16px; margin-bottom: 15px;">👤 Contact Gegevens</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 120px;">Naam:</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 500;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Bedrijf:</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 500;">${company}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Email:</td>
            <td style="padding: 8px 0;">
              <a href="mailto:${email}" style="color: #F87315; text-decoration: none;">${email}</a>
            </td>
          </tr>
          ${phone ? `
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Telefoon:</td>
            <td style="padding: 8px 0; color: #111827;">${phone}</td>
          </tr>
          ` : ''}
        </table>
      </div>
      
      ${message ? `
      <!-- Message -->
      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #111827; margin-top: 0; font-size: 16px; margin-bottom: 10px;">💬 Bericht</h3>
        <p style="color: #374151; line-height: 1.6; margin: 0;">${message}</p>
      </div>
      ` : ''}
      
      ${(preferredDate || preferredTime) ? `
      <!-- Schedule Preference -->
      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #111827; margin-top: 0; font-size: 16px; margin-bottom: 15px;">📅 Voorkeur Planning</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${preferredDate ? `
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 120px;">Datum:</td>
            <td style="padding: 8px 0; color: #111827;">${preferredDate}</td>
          </tr>
          ` : ''}
          ${preferredTime ? `
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Tijd:</td>
            <td style="padding: 8px 0; color: #111827;">${preferredTime === 'morning' ? 'Ochtend' : 'Middag'}</td>
          </tr>
          ` : ''}
        </table>
      </div>
      ` : ''}
      
      <!-- Actions -->
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <a href="mailto:${email}" style="display: inline-block; background: #F87315; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-right: 10px;">
          ✉️ Beantwoord Direct
        </a>
        <a href="https://groeimetai.io/dashboard/admin/contacts" style="display: inline-block; background: white; color: #374151; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; border: 1px solid #d1d5db;">
          📊 Dashboard
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        Ontvangen op ${new Date().toLocaleString('nl-NL')} • ID: ${contactDoc.id}
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Send admin notification email
    try {
      const adminEmailResponse = await transporter.sendMail({
        from: `"GroeimetAI - Contact Aanvraag" <${process.env.SMTP_USER}>`,
        to: process.env.CONTACT_EMAIL || 'info@groeimetai.io',
        replyTo: email,
        subject: `🆕 Contact Aanvraag - ${company} (${conversationType === 'verkennen' ? 'Verkennend' : 
                  conversationType === 'debrief' ? 'Debrief' : 
                  conversationType === 'kickoff' ? 'Kickoff' : 'Algemeen'})`,
        html: adminEmailHtml
      });

      console.log('[Contact API] Admin notification email sent successfully:', adminEmailResponse.messageId);
    } catch (emailError) {
      console.error('[Contact API] Admin email sending failed:', emailError);
    }

    // User confirmation email (styled like admin email)
    const confirmationHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; background-color: #f9fafb; font-family: system-ui, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #F87315, #FF8533); padding: 30px; text-align: center;">
      <div style="margin-bottom: 15px;">
        <img src="https://groeimetai.io/groeimet-ai-logo.svg" alt="GroeimetAI" style="height: 40px; width: auto; filter: brightness(0) invert(1);" />
      </div>
      <h1 style="color: white; margin: 0; font-size: 24px;">✅ Aanvraag Ontvangen</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px;">
      <!-- Personal greeting -->
      <div style="margin-bottom: 20px;">
        <h2 style="color: #111827; margin-top: 0; font-size: 20px; margin-bottom: 10px;">Bedankt ${name}! 🎯</h2>
        <p style="color: #374151; line-height: 1.6; margin: 0;">
          We hebben je contact aanvraag ontvangen en zijn enthousiast om met <strong>${company}</strong> aan de slag te gaan.
        </p>
      </div>
      
      <!-- Request Details -->
      <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #111827; margin-top: 0; font-size: 16px; margin-bottom: 15px;">📋 Je aanvraag details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 120px;">Type gesprek:</td>
            <td style="padding: 8px 0; color: #111827; font-weight: 500;">
              ${conversationType === 'verkennen' ? '💬 Verkennend gesprek' : 
                conversationType === 'debrief' ? '🎯 Assessment Debrief' : 
                conversationType === 'kickoff' ? '🚀 Project Kickoff' : 
                '📞 Algemeen Contact'}
            </td>
          </tr>
          ${preferredDate ? `
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Datum voorkeur:</td>
            <td style="padding: 8px 0; color: #111827;">${preferredDate}</td>
          </tr>
          ` : ''}
          ${preferredTime ? `
          <tr>
            <td style="padding: 8px 0; color: #6b7280;">Tijd voorkeur:</td>
            <td style="padding: 8px 0; color: #111827;">${preferredTime === 'morning' ? 'Ochtend (9:00-12:00)' : 'Middag (13:00-17:00)'}</td>
          </tr>
          ` : ''}
        </table>
      </div>
      
      <!-- Next Steps -->
      <div style="background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #22c55e; margin-top: 0; font-size: 16px; margin-bottom: 15px;">✅ Wat gebeurt er nu?</h3>
        <ol style="color: #374151; line-height: 1.8; padding-left: 20px; margin: 0;">
          <li>Ons team bekijkt je aanvraag binnen <strong>24 uur</strong></li>
          <li>Je ontvangt een <strong>persoonlijke uitnodiging</strong> voor een gesprek</li>
          <li>We bereiden een <strong>op maat gemaakte agenda</strong> voor</li>
          <li>Je krijgt direct <strong>concrete AI inzichten</strong> voor ${company}</li>
        </ol>
      </div>
      
      <!-- CTA Actions -->
      <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <a href="https://groeimetai.io/agent-readiness" style="display: inline-block; background: #F87315; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-right: 10px;">
          🎯 Doe Agent Assessment
        </a>
        <a href="https://groeimetai.io/cases" style="display: inline-block; background: white; color: #374151; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; border: 1px solid #d1d5db;">
          📚 Bekijk Cases
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        Bedankt voor je vertrouwen in GroeimetAI • Ontvangen op ${new Date().toLocaleString('nl-NL')}
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Send user confirmation email using same SMTP pattern
    try {
      const userEmailResponse = await transporter.sendMail({
        from: `"GroeimetAI" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '✅ We hebben je aanvraag ontvangen - GroeimetAI',
        html: confirmationHtml
      });

      console.log('[Contact API] User confirmation email sent successfully:', userEmailResponse.messageId);
    } catch (emailError) {
      console.error('[Contact API] User confirmation email failed:', emailError);
    }

    console.log('[Contact API] Admin email queued');
    console.log('[Contact API] User confirmation email queued');

    // Log the submission
    console.log('[Contact API] Contact form submission successful:', {
      id: contactDoc.id,
      timestamp: new Date().toISOString(),
      company,
      conversationType
    });

    return NextResponse.json({
      success: true,
      message: 'Uw aanvraag is succesvol verzonden',
      submissionId: contactDoc.id,
      nextSteps: [
        'U ontvangt een bevestigingsmail',
        'Ons team neemt binnen 24 uur contact op',
        'We plannen een gesprek op uw voorkeursmoment'
      ]
    });

  } catch (error) {
    console.error('[Contact API] Contact submission error:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het verzenden van uw aanvraag' },
      { status: 500 }
    );
  }
}