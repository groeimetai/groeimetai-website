import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { to, name, company, score, level, timestamp } = await req.json();
    
    console.log('Email API called with:', { to, name, company, score, level });
    
    if (!to || !name || !score) {
      console.error('Missing required fields:', { to: !!to, name: !!name, score: !!score });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check SMTP config
    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER ? 'configured' : 'missing'
    });

    // Configure SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    // Create email content
    const emailHtml = createAssessmentEmail(name, company, score, level);
    
    // Send email via SMTP
    try {
      const emailResponse = await transporter.sendMail({
        from: `"GroeimetAI" <${process.env.SMTP_USER}>`,
        to: to,
        subject: `🚀 Je Agent Readiness Score: ${score}/100 (${level})`,
        html: emailHtml
      });

      console.log('Assessment email sent successfully:', emailResponse.messageId);
      
      return NextResponse.json({
        success: true,
        message: 'Assessment email sent successfully',
        messageId: emailResponse.messageId
      });
      
    } catch (emailError: any) {
      console.error('SMTP email error:', emailError);
      
      // Fallback: log email content for debugging
      console.log(`
=== EMAIL FALLBACK (SMTP failed, logging content) ===
Subject: 🚀 Je Agent Readiness Score: ${score}/100 (${level})
To: ${to}
Error: ${emailError.message}

EMAIL CONTENT:
${emailHtml}
=== END EMAIL ===
      `);
      
      return NextResponse.json({
        success: true,
        message: 'Email service temporarily unavailable - assessment saved to dashboard',
        fallback: true
      });
    }

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

function createAssessmentEmail(name: string, company: string, score: number, level: string): string {
  const levelEmoji = score >= 90 ? '🚀' : score >= 70 ? '🔄' : score >= 50 ? '🛠️' : score >= 30 ? '🏗️' : '📚';
  const scoreColor = score >= 90 ? '#10B981' : score >= 70 ? '#F87315' : score >= 50 ? '#F59E0B' : score >= 30 ? '#EF4444' : '#6B7280';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Je Agent Readiness Score</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5;">

  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header with Logo -->
    <tr>
      <td style="background: linear-gradient(135deg, #F87315, #FF8533); color: white; padding: 30px; text-align: center;">
        <img src="https://groeimetai.io/GroeimetAi_logo_small.png" alt="GroeimetAI" style="height: 50px; width: auto; margin-bottom: 15px;" />
        <p style="margin: 0; font-size: 16px; opacity: 0.9;">Agent Infrastructure Specialists</p>
      </td>
    </tr>

    <!-- Score Section -->
    <tr>
      <td style="background: #f8f9fa; padding: 40px 30px; text-align: center;">
        <h2 style="margin: 0 0 10px 0; font-size: 28px; color: #333;">Hoi ${name}!</h2>
        <p style="margin: 0 0 30px 0; color: #666; font-size: 16px;">Je Agent Readiness Assessment voor ${company} is klaar:</p>

        <!-- Score Circle using table -->
        <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
          <tr>
            <td style="width: 120px; height: 120px; background-color: ${scoreColor}; border-radius: 60px; text-align: center; vertical-align: middle;">
              <span style="color: white; font-size: 42px; font-weight: bold; line-height: 120px;">${score}</span>
            </td>
          </tr>
        </table>

        <h3 style="margin: 25px 0 10px 0; color: ${scoreColor}; font-size: 22px; font-weight: bold;">${level}</h3>
        <p style="margin: 0; color: #666; font-size: 16px;">${levelEmoji} ${getTimeDescription(score)}</p>
      </td>
    </tr>

    <!-- Explanation Section -->
    <tr>
      <td style="padding: 30px; border-left: 4px solid ${scoreColor}; margin: 20px;">
        <h3 style="margin: 0 0 15px 0; color: ${scoreColor}; font-size: 20px;">Wat betekent dit?</h3>
        <p style="margin: 0 0 20px 0; color: #333; font-size: 15px; line-height: 1.7;">
          ${getScoreExplanation(score)}
        </p>
      </td>
    </tr>

    <!-- Upsell Section -->
    <tr>
      <td style="padding: 0 30px 30px 30px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(248,115,21,0.1), rgba(255,133,51,0.1)); border: 1px solid rgba(248,115,21,0.3); border-radius: 8px;">
          <tr>
            <td style="padding: 20px;">
              <p style="margin: 0 0 10px 0; font-size: 16px; color: #333; font-weight: bold;">
                🎯 Wil je een concrete roadmap naar Level 5?
              </p>
              <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">
                Expert Assessment (€2.500) geeft je gaps analyse, implementatie plan en 90-dagen roadmap specifiek voor ${company}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- CTA Buttons -->
    <tr>
      <td style="padding: 0 30px 30px 30px; text-align: center;">
        <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
          <tr>
            <td style="padding: 0 10px;">
              <a href="https://groeimetai.io/dashboard" style="display: inline-block; background: #F87315; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px;">
                📊 Bekijk Dashboard
              </a>
            </td>
            <td style="padding: 0 10px;">
              <a href="https://groeimetai.io/expert-assessment" style="display: inline-block; background: white; color: #F87315; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; border: 2px solid #F87315;">
                🚀 Expert Assessment
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Footer with Logo -->
    <tr>
      <td style="background: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef;">
        <img src="https://groeimetai.io/GroeimetAi_logo_small.png" alt="GroeimetAI" style="height: 30px; width: auto; margin-bottom: 10px; opacity: 0.7;" />
        <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
          Agent Infrastructure Specialists
        </p>
        <p style="margin: 0; color: #999; font-size: 12px;">
          Dit rapport is geldig tot ${new Date(Date.now() + 90*24*60*60*1000).toLocaleDateString('nl-NL')}<br/>
          Apeldoorn, Nederland | KVK: 90102304
        </p>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

function getTimeDescription(score: number): string {
  if (score >= 90) return 'Je kunt binnen weken agents inzetten!';
  if (score >= 70) return '2-3 maanden voorbereiding en je bent er klaar voor';
  if (score >= 50) return '6-12 maanden modernisering werk nodig';
  if (score >= 30) return '1-2 jaar infrastructure ontwikkeling vereist';
  return 'Begin met digitalisering - agents zijn nog ver weg';
}

function getScoreExplanation(score: number): string {
  if (score >= 90) {
    return 'Fantastisch! Je hebt de infrastructure en processen om agents binnen weken productief in te zetten. Focus nu op de specifieke use cases en agent training.';
  } else if (score >= 70) {
    return 'Goede basis! Je systemen kunnen grotendeels met agents praten, maar er zijn nog enkele gaps in documentatie of integraties die eerst moeten worden opgelost.';
  } else if (score >= 50) {
    return 'Solide fundament, maar modernisering nodig. Je hebt systemen maar APIs en data toegang moeten worden opgezet voordat agents effectief kunnen werken.';
  } else if (score >= 30) {
    return 'Foundation building fase. Je hebt systemen maar deze moeten agent-ready worden gemaakt door API development en proces digitalisering.';
  } else {
    return 'Pre-digital fase. Start met basis digitalisering van processen en data capture voordat je aan agents denkt.';
  }
}