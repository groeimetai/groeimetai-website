import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import DOMPurify from 'isomorphic-dompurify';

export const dynamic = 'force-dynamic';

/**
 * Sanitize user input for safe HTML rendering in emails
 * Allows basic text formatting but removes dangerous HTML
 */
function sanitizeForHtml(input: string | undefined | null): string {
  if (!input) return '';
  // Strip dangerous HTML tags, keep basic text
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
  try {
    const { to: rawTo, subject: rawSubject, content: rawContent, contactId } = await req.json();

    // Sanitize inputs to prevent XSS (even from admin)
    const to = sanitizeForHtml(rawTo);
    const subject = sanitizeForHtml(rawSubject);
    const content = sanitizeForHtml(rawContent);

    console.log('[Admin Email] Sending email to:', to);

    // Validate required fields
    if (!to || !subject || !content) {
      return NextResponse.json(
        { error: 'To, subject en content zijn verplicht' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(to)) {
      return NextResponse.json(
        { error: 'Ongeldig email adres' },
        { status: 400 }
      );
    }

    // Use exact same SMTP pattern as working contact form
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Create professional styled email
    const emailHtml = `
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
      <h1 style="color: white; margin: 0; font-size: 24px;">GroeimetAI</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 30px;">
      <div style="color: #374151; line-height: 1.8; white-space: pre-wrap;">
${content}
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #6b7280; font-size: 12px; margin: 0;">
        GroeimetAI • AI Infrastructure Specialists • ${new Date().toLocaleString('nl-NL')}
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Send email using SMTP
    const emailResponse = await transporter.sendMail({
      from: `"GroeimetAI" <${process.env.SMTP_USER}>`,
      to: to,
      subject: subject,
      html: emailHtml
    });

    console.log('[Admin Email] Email sent successfully:', emailResponse.messageId);

    return NextResponse.json({
      success: true,
      message: 'Email succesvol verzonden via SMTP',
      messageId: emailResponse.messageId
    });

  } catch (error) {
    console.error('[Admin Email] Error:', error);
    return NextResponse.json(
      { 
        error: 'Fout bij versturen email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}