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
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Je Agent Readiness Score</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #F87315, #FF8533); color: white; padding: 30px; text-align: center; border-radius: 12px; margin-bottom: 30px;">
    <h1 style="margin: 0; font-size: 24px;">🚀 GroeimetAI</h1>
    <p style="margin: 10px 0 0 0; opacity: 0.9;">Agent Infrastructure Specialists</p>
  </div>
  
  <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
    <h2 style="margin: 0 0 15px 0;">Hoi ${name}!</h2>
    <p style="margin: 0 0 20px 0; color: #666;">Je Agent Readiness Assessment voor ${company} is klaar:</p>
    
    <div style="background: #F87315; color: white; width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; margin: 20px auto;">
      ${score}
    </div>
    
    <h3 style="margin: 20px 0 10px 0; color: #F87315;">${level}</h3>
    <p style="margin: 0; color: #666; font-size: 16px;">${levelEmoji} ${getTimeDescription(score)}</p>
  </div>
  
  <div style="background: white; padding: 25px; border: 1px solid #e9ecef; border-radius: 8px; margin-bottom: 20px;">
    <h3 style="margin: 0 0 15px 0; color: #F87315;">Wat betekent dit?</h3>
    <p style="margin: 0 0 15px 0;">
      ${getScoreExplanation(score)}
    </p>
    
    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <p style="margin: 0; font-size: 14px; color: #666;">
        <strong>Wil je weten HOE je naar Level 5 komt?</strong><br/>
        Expert Assessment (€2.500) geeft je concrete roadmap, gaps analyse en implementatie plan.
      </p>
    </div>
  </div>
  
  <div style="text-align: center; padding: 20px;">
    <a href="https://groeimetai.io/dashboard" style="background: #F87315; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
      Bekijk in Dashboard
    </a>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee;">
    <p>GroeimetAI - Agent Infrastructure Specialists<br/>
    Dit rapport is geldig tot ${new Date(Date.now() + 90*24*60*60*1000).toLocaleDateString('nl-NL')}</p>
  </div>
  
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