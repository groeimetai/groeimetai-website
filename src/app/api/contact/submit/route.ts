import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import nodemailer from 'nodemailer';
import DOMPurify from 'isomorphic-dompurify';

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Sanitize user input for safe HTML rendering in emails
 * Removes all HTML tags and encodes special characters
 */
function sanitizeForHtml(input: string | undefined | null): string {
  if (!input) return '';
  // First strip any HTML tags, then encode remaining special characters
  const stripped = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
  return stripped
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(req: NextRequest) {
  console.log('[Contact API] Received request');

  try {
    const contactData = await req.json();
    const {
      name: rawName,
      email: rawEmail,
      phone: rawPhone,
      company: rawCompany,
      message: rawMessage,
      preferredDate: rawPreferredDate,
      preferredTime: rawPreferredTime,
      conversationType: rawConversationType
    } = contactData;

    // Sanitize all user inputs to prevent XSS
    const name = sanitizeForHtml(rawName);
    const email = sanitizeForHtml(rawEmail);
    const phone = sanitizeForHtml(rawPhone);
    const company = sanitizeForHtml(rawCompany);
    const message = sanitizeForHtml(rawMessage);
    const preferredDate = sanitizeForHtml(rawPreferredDate);
    const preferredTime = sanitizeForHtml(rawPreferredTime);
    // conversationType is used in conditionals, sanitize but keep original for logic
    const conversationType = ['verkennen', 'debrief', 'kickoff', 'general'].includes(rawConversationType)
      ? rawConversationType
      : 'general';
    
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

    // Save to contacts collection using Admin SDK
    const contactDoc = await adminDb.collection('contact_submissions').add(contactSubmission);
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
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: #141414; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">

          <!-- Logo Section -->
          <tr>
            <td style="background-color: #ffffff; padding: 32px 40px; text-align: center;">
              <img src="https://groeimetai.io/GroeimetAi_logo_text_black.png" alt="GroeimetAI" width="200" height="auto" style="display: block; margin: 0 auto; max-width: 200px;" />
            </td>
          </tr>

          <!-- Header Accent Bar -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF6600 0%, #cc5200 100%); padding: 16px 40px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.95); letter-spacing: 2px; text-transform: uppercase; font-weight: 500;">You have API's, but agent can't talk to them.</p>
            </td>
          </tr>

          <!-- Title Badge -->
          <tr>
            <td style="padding: 30px 40px 20px 40px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: rgba(255, 102, 0, 0.15); border: 1px solid rgba(255, 102, 0, 0.3); border-radius: 50px; padding: 10px 24px;">
                    <span style="color: #FF6600; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">🆕 Nieuwe Contact Aanvraag</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Conversation Type & Priority -->
          <tr>
            <td style="padding: 0 40px 20px 40px; text-align: center;">
              <span style="display: inline-block; background: rgba(248,115,21,0.2); color: #FF6600; padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; margin-right: 8px;">
                ${conversationType === 'verkennen' ? '💬 Verkennend Gesprek' :
                  conversationType === 'debrief' ? '🎯 Assessment Debrief' :
                  conversationType === 'kickoff' ? '🚀 Project Kickoff' :
                  '📞 Algemeen Contact'}
              </span>
              <span style="display: inline-block; background: ${
                conversationType === 'kickoff' ? 'rgba(239, 68, 68, 0.2); color: #ef4444' :
                conversationType === 'debrief' ? 'rgba(245, 158, 11, 0.2); color: #f59e0b' :
                'rgba(34, 197, 94, 0.2); color: #22c55e'
              }; padding: 6px 12px; border-radius: 20px; font-weight: 500; font-size: 12px;">
                ${conversationType === 'kickoff' ? '🔴 HIGH PRIORITY' :
                  conversationType === 'debrief' ? '🟡 MEDIUM PRIORITY' :
                  '🟢 STANDARD'}
              </span>
            </td>
          </tr>

          <!-- Conversation Context -->
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              ${conversationType === 'verkennen' ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="color: #22c55e; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">🔍 Verkennend Gesprek Context</p>
                    <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px; line-height: 1.5;">
                      Prospect wil AI mogelijkheden verkennen. <strong style="color: white;">Focus op:</strong> Use cases, ROI voorbeelden, implementatie complexiteit.
                      <strong style="color: white;">Doel:</strong> Assessment booking of directe offerte aanvraag.
                    </p>
                  </td>
                </tr>
              </table>
              ` : conversationType === 'debrief' ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="color: #f59e0b; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">🎯 Assessment Debrief Context</p>
                    <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px; line-height: 1.5;">
                      <strong style="color: white;">Warm lead!</strong> Heeft al assessment gedaan. <strong style="color: white;">Focus op:</strong> Assessment resultaten, concrete aanbevelingen, Expert Assessment upsell.
                      <strong style="color: white;">Doel:</strong> Expert Assessment verkoop (€2.500) of direct project start.
                    </p>
                  </td>
                </tr>
              </table>
              ` : conversationType === 'kickoff' ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="color: #ef4444; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">🚀 Project Kickoff Context</p>
                    <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px; line-height: 1.5;">
                      <strong style="color: white;">🔥 HOT LEAD!</strong> Ready voor implementatie. <strong style="color: white;">Focus op:</strong> Project scope, tijdlijnen, team requirements.
                      <strong style="color: white;">Doel:</strong> Contract signing en project start planning.
                    </p>
                  </td>
                </tr>
              </table>
              ` : `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: rgba(156, 163, 175, 0.1); border: 1px solid rgba(156, 163, 175, 0.3); border-radius: 8px;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="color: #9ca3af; margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">📞 Algemeen Contact</p>
                    <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px; line-height: 1.5;">
                      Algemene vraag of interesse. <strong style="color: white;">Kwalificeer eerst:</strong> Bedrijfsgrootte, AI ervaring, budget indicatie.
                      <strong style="color: white;">Doel:</strong> Naar verkennend gesprek of assessment leiden.
                    </p>
                  </td>
                </tr>
              </table>
              `}
            </td>
          </tr>

          <!-- Contact Details -->
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: rgba(255,255,255,0.05); border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: white; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">👤 Contact Gegevens</p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6); width: 120px;">Naam:</td>
                        <td style="padding: 8px 0; color: white; font-weight: 500;">${name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6);">Bedrijf:</td>
                        <td style="padding: 8px 0; color: white; font-weight: 500;">${company}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6);">Email:</td>
                        <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #FF6600; text-decoration: none;">${email}</a></td>
                      </tr>
                      ${phone ? `
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6);">Telefoon:</td>
                        <td style="padding: 8px 0; color: white;">${phone}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${message ? `
          <!-- Message -->
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: rgba(255,255,255,0.05); border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: white; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">💬 Bericht</p>
                    <p style="color: rgba(255,255,255,0.8); line-height: 1.6; margin: 0;">${message}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          ${(preferredDate || preferredTime) ? `
          <!-- Schedule Preference -->
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: rgba(255,255,255,0.05); border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: white; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">📅 Voorkeur Planning</p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      ${preferredDate ? `
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6); width: 120px;">Datum:</td>
                        <td style="padding: 8px 0; color: white;">${preferredDate}</td>
                      </tr>
                      ` : ''}
                      ${preferredTime ? `
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6);">Tijd:</td>
                        <td style="padding: 8px 0; color: white;">${preferredTime === 'morning' ? 'Ochtend' : 'Middag'}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Action Buttons -->
          <tr>
            <td style="padding: 0 40px 30px 40px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="padding-right: 10px;">
                    <a href="mailto:${email}" style="display: inline-block; background: linear-gradient(135deg, #FF6600 0%, #cc5200 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">✉️ Beantwoord Direct</a>
                  </td>
                  <td>
                    <a href="https://groeimetai.io/dashboard/admin/contacts" style="display: inline-block; background: rgba(255,255,255,0.1); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; border: 1px solid rgba(255,255,255,0.2);">📊 Dashboard</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: rgba(255,255,255,0.03); padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.1);">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.5);">
                      Ontvangen op ${new Date().toLocaleString('nl-NL')} • ID: ${contactDoc.id}
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
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0a0a0a;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto; background-color: #141414; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">

          <!-- Logo Section -->
          <tr>
            <td style="background-color: #ffffff; padding: 32px 40px; text-align: center;">
              <img src="https://groeimetai.io/GroeimetAi_logo_text_black.png" alt="GroeimetAI" width="200" height="auto" style="display: block; margin: 0 auto; max-width: 200px;" />
            </td>
          </tr>

          <!-- Header Accent Bar -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF6600 0%, #cc5200 100%); padding: 16px 40px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.95); letter-spacing: 2px; text-transform: uppercase; font-weight: 500;">You have API's, but agent can't talk to them.</p>
            </td>
          </tr>

          <!-- Title Badge -->
          <tr>
            <td style="padding: 30px 40px 20px 40px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 50px; padding: 10px 24px;">
                    <span style="color: #22c55e; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">✅ Aanvraag Ontvangen</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Personal Greeting -->
          <tr>
            <td style="padding: 0 40px 20px 40px; text-align: center;">
              <h2 style="color: white; margin: 0 0 10px 0; font-size: 24px; font-weight: 600;">Bedankt ${name}! 🎯</h2>
              <p style="color: rgba(255,255,255,0.8); line-height: 1.6; margin: 0; font-size: 16px;">
                We hebben je contact aanvraag ontvangen en zijn enthousiast om met <strong style="color: white;">${company}</strong> aan de slag te gaan.
              </p>
            </td>
          </tr>

          <!-- Request Details -->
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: rgba(255,255,255,0.05); border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: white; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">📋 Je aanvraag details</p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6); width: 130px;">Type gesprek:</td>
                        <td style="padding: 8px 0; color: white; font-weight: 500;">
                          ${conversationType === 'verkennen' ? '💬 Verkennend gesprek' :
                            conversationType === 'debrief' ? '🎯 Assessment Debrief' :
                            conversationType === 'kickoff' ? '🚀 Project Kickoff' :
                            '📞 Algemeen Contact'}
                        </td>
                      </tr>
                      ${preferredDate ? `
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6);">Datum voorkeur:</td>
                        <td style="padding: 8px 0; color: white;">${preferredDate}</td>
                      </tr>
                      ` : ''}
                      ${preferredTime ? `
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6);">Tijd voorkeur:</td>
                        <td style="padding: 8px 0; color: white;">${preferredTime === 'morning' ? 'Ochtend (9:00-12:00)' : 'Middag (13:00-17:00)'}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Next Steps -->
          <tr>
            <td style="padding: 0 40px 20px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #22c55e; margin: 0 0 15px 0; font-size: 16px; font-weight: 600;">✅ Wat gebeurt er nu?</p>
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td style="padding: 6px 0; color: rgba(255,255,255,0.8); font-size: 14px;">
                          <span style="color: #22c55e; margin-right: 8px;">1.</span> Ons team bekijkt je aanvraag binnen <strong style="color: white;">24 uur</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: rgba(255,255,255,0.8); font-size: 14px;">
                          <span style="color: #22c55e; margin-right: 8px;">2.</span> Je ontvangt een <strong style="color: white;">persoonlijke uitnodiging</strong> voor een gesprek
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: rgba(255,255,255,0.8); font-size: 14px;">
                          <span style="color: #22c55e; margin-right: 8px;">3.</span> We bereiden een <strong style="color: white;">op maat gemaakte agenda</strong> voor
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: rgba(255,255,255,0.8); font-size: 14px;">
                          <span style="color: #22c55e; margin-right: 8px;">4.</span> Je krijgt direct <strong style="color: white;">concrete AI inzichten</strong> voor ${company}
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
            <td style="padding: 0 40px 30px 40px; text-align: center;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="padding-right: 10px;">
                    <a href="https://groeimetai.io/agent-readiness" style="display: inline-block; background: linear-gradient(135deg, #FF6600 0%, #cc5200 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">🎯 Doe Agent Assessment</a>
                  </td>
                  <td>
                    <a href="https://groeimetai.io/cases" style="display: inline-block; background: rgba(255,255,255,0.1); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; border: 1px solid rgba(255,255,255,0.2);">📚 Bekijk Cases</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: rgba(255,255,255,0.03); padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.1);">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: rgba(255,255,255,0.5);">
                      Bedankt voor je vertrouwen in GroeimetAI • Ontvangen op ${new Date().toLocaleString('nl-NL')}
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