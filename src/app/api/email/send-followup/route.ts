import { NextRequest, NextResponse } from 'next/server';

// Simple email service voor follow-up emails (interim solution)
export async function POST(req: NextRequest) {
  try {
    const { to, templateId, data } = await req.json();
    
    if (!to || !templateId) {
      return NextResponse.json(
        { error: 'Email address and template required' },
        { status: 400 }
      );
    }

    // Email templates
    const templates = {
      assessment_followup: {
        subject: `Jouw Agent Readiness Score: ${data.score}/100`,
        html: generateFollowUpEmailHTML(data),
        text: generateFollowUpEmailText(data)
      },
      expert_assessment_invite: {
        subject: 'Unlock je Complete Agent Readiness Roadmap',
        html: generateExpertInviteHTML(data),
        text: generateExpertInviteText(data)
      }
    };

    const template = templates[templateId as keyof typeof templates];
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    // Send via email service (implement met jouw provider)
    const emailResult = await sendEmail({
      to,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    return NextResponse.json({
      success: true,
      messageId: emailResult.messageId,
      message: 'Follow-up email sent successfully'
    });

  } catch (error) {
    console.error('Follow-up email error:', error);
    return NextResponse.json(
      { error: 'Failed to send follow-up email' },
      { status: 500 }
    );
  }
}

async function sendEmail(emailData: any): Promise<any> {
  try {
    // Use the same Nodemailer setup as other email services
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log('📧 Sending follow-up email to:', emailData.to);

    const emailResponse = await transporter.sendMail({
      from: `"GroeimetAI - Follow-up" <${process.env.SMTP_USER}>`,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text
    });

    console.log('✅ Follow-up email sent successfully:', emailResponse.messageId);

    return {
      messageId: emailResponse.messageId,
      status: 'sent'
    };
  } catch (error) {
    console.error('❌ Failed to send follow-up email:', error);
    throw error;
  }
}

function generateFollowUpEmailHTML(data: any): string {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #080D14; color: white; padding: 30px; border-radius: 12px;">
      <h1 style="color: #F87315; margin-bottom: 20px;">Jouw Agent Readiness Rapport</h1>
      
      <div style="background: rgba(248, 115, 21, 0.1); border: 1px solid rgba(248, 115, 21, 0.3); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #F87315; margin-bottom: 10px;">Jouw Score: ${data.score}/100</h2>
        <p style="color: white; margin-bottom: 15px;">Je assessment is compleet! Hier zijn je resultaten:</p>
        
        <ul style="color: white; margin: 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;">✅ Basis roadmap beschikbaar in dashboard</li>
          <li style="margin-bottom: 8px;">✅ Industry benchmarks</li>
          <li style="margin-bottom: 8px;">✅ Quick wins identificatie</li>
        </ul>
      </div>

      <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: white; margin-bottom: 15px;">🔒 Wil je meer diepgang?</h3>
        <p style="color: rgba(255,255,255,0.8); margin-bottom: 15px;">
          Expert Assessment (€2.500) geeft je:
        </p>
        <ul style="color: rgba(255,255,255,0.8); margin: 0; padding-left: 20px;">
          <li>• Specifieke ROI berekening</li>
          <li>• Custom implementatie roadmap</li>
          <li>• 90-dagen actieplan</li>
          <li>• Expert review call</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://groeimetai.io/dashboard" 
           style="display: inline-block; background: #F87315; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-right: 15px;">
          📊 View Dashboard
        </a>
        <a href="https://groeimetai.io/expert-assessment" 
           style="display: inline-block; background: transparent; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); font-weight: 600;">
          🔓 Unlock Expert Insights
        </a>
      </div>

      <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; margin-top: 30px;">
        <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 14px; text-align: center;">
          Met vriendelijke groet,<br/>
          <strong style="color: #F87315;">GroeimetAI Team</strong><br/>
          Agent Infrastructure Specialists
        </p>
      </div>
    </div>
  `;
}

function generateFollowUpEmailText(data: any): string {
  return `
Jouw Agent Readiness Rapport - Score: ${data.score}/100

Je assessment is compleet! Hier zijn je resultaten:

✅ Basis roadmap beschikbaar in dashboard
✅ Industry benchmarks  
✅ Quick wins identificatie

🔒 Wil je meer diepgang?

Expert Assessment (€2.500) geeft je:
• Specifieke ROI berekening
• Custom implementatie roadmap  
• 90-dagen actieplan
• Expert review call

Dashboard: https://groeimetai.io/dashboard
Expert Assessment: https://groeimetai.io/expert-assessment

Met vriendelijke groet,
GroeimetAI Team
Agent Infrastructure Specialists
  `;
}

function generateExpertInviteHTML(data: any): string {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #080D14; color: white; padding: 30px; border-radius: 12px;">
      <h1 style="color: #F87315; margin-bottom: 20px;">Ready voor de Volgende Stap?</h1>
      
      <p style="color: white; margin-bottom: 20px;">
        Je hebt je gratis assessment gedaan (score: ${data.score}/100). 
        Veel bedrijven vragen nu: "Wat zijn de concrete next steps?"
      </p>

      <div style="background: rgba(248, 115, 21, 0.1); border: 1px solid rgba(248, 115, 21, 0.3); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #F87315; margin-bottom: 15px;">Expert Assessment Voordelen:</h2>
        <ul style="color: white; margin: 0; padding-left: 20px;">
          <li style="margin-bottom: 8px;">📊 Specifieke ROI berekening voor jouw situatie</li>
          <li style="margin-bottom: 8px;">🎯 Custom roadmap met concrete tijdlijnen</li>
          <li style="margin-bottom: 8px;">💰 Business case voor budget approval</li>
          <li style="margin-bottom: 8px;">📞 Expert review call met agent architect</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://groeimetai.io/contact" 
           style="display: inline-block; background: #F87315; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600;">
          📅 Book Expert Assessment
        </a>
      </div>

      <p style="color: rgba(255,255,255,0.7); text-align: center; font-size: 14px;">
        €2.500 - Aftrekbaar bij vervolgproject
      </p>
    </div>
  `;
}

function generateExpertInviteText(data: any): string {
  return `
Ready voor de Volgende Stap?

Je hebt je gratis assessment gedaan (score: ${data.score}/100).
Veel bedrijven vragen nu: "Wat zijn de concrete next steps?"

Expert Assessment Voordelen:
📊 Specifieke ROI berekening voor jouw situatie
🎯 Custom roadmap met concrete tijdlijnen  
💰 Business case voor budget approval
📞 Expert review call met agent architect

Book Expert Assessment: https://groeimetai.io/contact

€2.500 - Aftrekbaar bij vervolgproject

GroeimetAI Team
  `;
}