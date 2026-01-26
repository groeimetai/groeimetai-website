import { NextRequest, NextResponse } from 'next/server';
import { createTransporter, emailConfig, verifyEmailConnection } from '@/lib/email/config';

// Variable replacement helper
function replaceVariables(
  text: string,
  variables: Record<string, string>
): string {
  let result = text;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

// POST - Send test email with template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, body: emailBody, variables } = body;

    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      );
    }

    // Check if email service is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email service not configured',
          message: 'SMTP credentials are not set in environment variables',
        },
        { status: 503 }
      );
    }

    // Verify email connection
    const isConnected = await verifyEmailConnection();
    if (!isConnected) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email service unavailable',
          message: 'Could not connect to email server',
        },
        { status: 503 }
      );
    }

    // Create transporter
    const transporter = createTransporter();
    if (!transporter) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email transporter not available',
        },
        { status: 503 }
      );
    }

    // Default sample variables for testing
    const defaultVariables: Record<string, string> = {
      clientName: 'Test Client',
      projectName: 'Test Project',
      companyName: 'GroeimetAI',
      totalAmount: '€2.500,00',
      status: 'In Progress',
      progress: '50',
      updateMessage: 'This is a test update message.',
      invoiceNumber: 'INV-2024-001',
      amount: '€1.000,00',
      dueDate: new Date().toLocaleDateString('nl-NL'),
      userName: 'Test User',
    };

    // Merge provided variables with defaults
    const allVariables = { ...defaultVariables, ...variables };

    // Replace variables in subject and body
    const processedSubject = replaceVariables(subject, allVariables);
    const processedBody = replaceVariables(emailBody, allVariables);

    // Convert plain text to HTML (basic formatting)
    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%);
              color: white;
              padding: 20px;
              border-radius: 8px 8px 0 0;
              margin-bottom: 20px;
            }
            .content {
              background: #f9f9f9;
              padding: 20px;
              border-radius: 0 0 8px 8px;
              white-space: pre-wrap;
            }
            .footer {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
            .test-badge {
              background: #ffeb3b;
              color: #333;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <span class="test-badge">TEST EMAIL</span>
            <h1 style="margin: 10px 0 0 0; font-size: 24px;">${processedSubject}</h1>
          </div>
          <div class="content">
            ${processedBody.replace(/\n/g, '<br>')}
          </div>
          <div class="footer">
            This is a test email from GroeimetAI Admin Settings.<br>
            Sent to: ${to}
          </div>
        </body>
      </html>
    `;

    // Send the email
    const info = await transporter.sendMail({
      from: `"${emailConfig.from.name}" <${emailConfig.from.address}>`,
      to,
      subject: `[TEST] ${processedSubject}`,
      html: htmlBody,
      text: `[TEST EMAIL]\n\n${processedBody}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: info.messageId,
      to,
    });
  } catch (error: any) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send test email',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
