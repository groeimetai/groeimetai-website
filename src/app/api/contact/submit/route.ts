import { NextRequest, NextResponse } from 'next/server';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(req: NextRequest) {
  try {
    const contactData = await req.json();
    const { name, email, phone, company, message, preferredDate, preferredTime, conversationType } = contactData;

    // Validate required fields
    if (!name || !email || !company) {
      return NextResponse.json(
        { error: 'Naam, email en bedrijf zijn verplicht' },
        { status: 400 }
      );
    }

    // Store contact submission in Firestore
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
    
    // Format the email content for admin notification
    const adminEmailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; background-color: #f9fafb; font-family: system-ui, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #F87315, #FF8533); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">🆕 Nieuwe Contact Aanvraag</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px;">
      <!-- Conversation Type Badge -->
      <div style="margin-bottom: 20px;">
        <span style="display: inline-block; background: rgba(248,115,21,0.1); color: #F87315; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px;">
          ${conversationType === 'verkennen' ? '💬 Verkennend Gesprek' : 
            conversationType === 'debrief' ? '🎯 Assessment Debrief' : 
            conversationType === 'kickoff' ? '🚀 Project Kickoff' : 
            '📞 Algemeen Contact'}
        </span>
      </div>
      
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
            <td style="padding: 8px 0; color: #111827;">${new Date(preferredDate).toLocaleDateString('nl-NL', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</td>
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
        <a href="https://groeimetai.com/dashboard/admin" style="display: inline-block; background: white; color: #374151; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; border: 1px solid #d1d5db;">
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

    // Send notification email to admin via Firebase Email Extension
    await addDoc(collection(db, 'mail'), {
      to: process.env.CONTACT_EMAIL || 'info@groeimetai.com',
      replyTo: email,
      message: {
        subject: `🆕 Contact Aanvraag - ${company} (${conversationType === 'verkennen' ? 'Verkennend' : 
                  conversationType === 'debrief' ? 'Debrief' : 
                  conversationType === 'kickoff' ? 'Kickoff' : 'Algemeen'})`,
        html: adminEmailHtml
      }
    });

    // Send confirmation email to the user
    const confirmationHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; background-color: #080D14; font-family: system-ui, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; color: white; padding: 30px;">
    <!-- Header with logo/brand -->
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #F87315; font-size: 32px; margin: 0;">GroeimetAI</h1>
      <p style="color: rgba(255,255,255,0.7); margin-top: 5px;">Transformeer je bedrijf met AI Agents</p>
    </div>
    
    <!-- Main content -->
    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 30px; margin-bottom: 30px;">
      <h2 style="color: white; margin-top: 0;">Bedankt voor je aanvraag, ${name}! 🎯</h2>
      
      <p style="color: rgba(255,255,255,0.9); line-height: 1.6;">
        We hebben je contact aanvraag ontvangen en zijn enthousiast om met ${company} aan de slag te gaan.
      </p>
      
      <div style="background: rgba(248,115,21,0.1); border: 1px solid rgba(248,115,21,0.3); border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #F87315; margin-top: 0; font-size: 18px;">📋 Je aanvraag details:</h3>
        <ul style="color: rgba(255,255,255,0.9); line-height: 1.8; padding-left: 20px;">
          <li><strong>Type gesprek:</strong> ${
            conversationType === 'verkennen' ? 'Verkennend gesprek - Ontdek AI mogelijkheden' : 
            conversationType === 'debrief' ? 'Assessment Debrief - Bespreek je resultaten' : 
            conversationType === 'kickoff' ? 'Project Kickoff - Start implementatie' : 
            'Algemeen contact'
          }</li>
          ${preferredDate ? `<li><strong>Voorkeur datum:</strong> ${new Date(preferredDate).toLocaleDateString('nl-NL', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</li>` : ''}
          ${preferredTime ? `<li><strong>Voorkeur tijd:</strong> ${preferredTime === 'morning' ? 'Ochtend' : 'Middag'}</li>` : ''}
        </ul>
      </div>
      
      <div style="background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #22c55e; margin-top: 0; font-size: 18px;">✅ Wat gebeurt er nu?</h3>
        <ol style="color: rgba(255,255,255,0.9); line-height: 1.8; padding-left: 20px;">
          <li>Ons team bekijkt je aanvraag binnen <strong>24 uur</strong></li>
          <li>Je ontvangt een <strong>persoonlijke uitnodiging</strong> voor een gesprek</li>
          <li>We bereiden een <strong>op maat gemaakte agenda</strong> voor</li>
          <li>Je krijgt direct <strong>concrete AI inzichten</strong> voor ${company}</li>
        </ol>
      </div>
    </div>
    
    <!-- CTA Buttons -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://groeimetai.com/agent-readiness" 
         style="display: inline-block; background: #F87315; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-right: 15px;">
        🎯 Doe Agent Assessment
      </a>
      <a href="https://groeimetai.com/cases" 
         style="display: inline-block; background: transparent; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); font-weight: 600;">
        📚 Bekijk Cases
      </a>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.1);">
      <p style="color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.6;">
        Heb je dringende vragen? Bel ons direct op <a href="tel:+31612345678" style="color: #F87315; text-decoration: none;">+31 6 12345678</a><br>
        of stuur een email naar <a href="mailto:info@groeimetai.com" style="color: #F87315; text-decoration: none;">info@groeimetai.com</a>
      </p>
      
      <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin-top: 20px;">
        © 2024 GroeimetAI • Transformeer je bedrijf met AI
      </p>
    </div>
  </div>
</body>
</html>
    `;

    await addDoc(collection(db, 'mail'), {
      to: email,
      message: {
        subject: '✅ We hebben je aanvraag ontvangen - GroeimetAI',
        html: confirmationHtml
      }
    });

    // Log the submission
    console.log('Contact form submission:', {
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
    console.error('Contact submission error:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het verzenden van uw aanvraag' },
      { status: 500 }
    );
  }
}