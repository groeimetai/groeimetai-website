import { NextRequest, NextResponse } from 'next/server';
import { SMTPFallback } from '@/lib/email/smtp-fallback';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    console.log('🧪 SMTP Test endpoint called');

    const smtpFallback = new SMTPFallback();
    
    // Test connection first
    const connectionTest = await smtpFallback.testConnection();
    console.log('📡 SMTP Connection test:', connectionTest);

    if (!connectionTest.success) {
      return NextResponse.json({
        success: false,
        error: 'SMTP connection failed',
        details: connectionTest.error,
        config: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER ? 'configured' : 'missing',
          pass: process.env.SMTP_PASS ? 'configured' : 'missing'
        }
      });
    }

    // Send test email
    const testEmail = {
      to: process.env.CONTACT_EMAIL || 'info@groeimetai.com',
      subject: '🧪 SMTP Test - GroeimetAI',
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; background-color: #080D14; font-family: system-ui, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; color: white; padding: 30px;">
    <h1 style="color: #F87315;">🧪 SMTP Test Email</h1>
    <p>Dit is een test email verstuurd via SMTP fallback systeem.</p>
    <p><strong>Tijd:</strong> ${new Date().toLocaleString('nl-NL')}</p>
    <p><strong>Status:</strong> Direct verzonden via SMTP (geen Firebase)</p>
    <p><strong>From:</strong> ${process.env.SMTP_USER}</p>
  </div>
</body>
</html>
      `
    };

    const emailResult = await smtpFallback.sendEmail(testEmail);
    console.log('📧 SMTP Email result:', emailResult);

    return NextResponse.json({
      success: emailResult.success,
      message: emailResult.success ? 'Test email verzonden via SMTP!' : 'SMTP email failed',
      messageId: emailResult.messageId,
      error: emailResult.error,
      connectionTest,
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER ? 'configured' : 'missing',
        pass: process.env.SMTP_PASS ? 'configured' : 'missing'
      }
    });

  } catch (error) {
    console.error('❌ SMTP test error:', error);
    return NextResponse.json(
      { 
        error: 'SMTP test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}