import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/services/emailService';
import { customEmailTemplates } from '@/lib/email/custom-auth-templates';

export async function POST(request: NextRequest) {
  try {
    const { mode, oobCode, continueUrl, lang = 'nl', email } = await request.json();

    // For custom email handling, we trust the email provided by Firebase
    // The oobCode verification happens on the client side when the user clicks the link
    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    switch (mode) {
      case 'resetPassword':
        // Handle password reset
        return handlePasswordReset(email, oobCode, continueUrl, lang);

      case 'verifyEmail':
        // Handle email verification
        return handleEmailVerification(email, oobCode, continueUrl, lang);

      case 'recoverEmail':
        // Handle email recovery
        return handleEmailRecovery(email, oobCode, continueUrl, lang);

      default:
        return NextResponse.json(
          { error: 'Invalid mode' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Custom email handler error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handlePasswordReset(
  email: string,
  oobCode: string,
  continueUrl: string | undefined,
  lang: string
) {
  // Generate custom password reset link
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/auth/reset-password?oobCode=${oobCode}&continueUrl=${continueUrl || ''}`;

  // Send custom styled email
  const template = customEmailTemplates.passwordReset({
    email,
    resetLink,
    lang,
  });

  await emailService.sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });

  return NextResponse.json({ 
    success: true, 
    message: 'Password reset email sent' 
  });
}

async function handleEmailVerification(
  email: string,
  oobCode: string,
  continueUrl: string | undefined,
  lang: string
) {
  // Generate custom verification link
  const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/auth/verify-email?oobCode=${oobCode}&continueUrl=${continueUrl || ''}`;

  // Send custom styled email
  const template = customEmailTemplates.emailVerification({
    email,
    verifyLink,
    lang,
  });

  await emailService.sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });

  return NextResponse.json({ 
    success: true, 
    message: 'Verification email sent' 
  });
}

async function handleEmailRecovery(
  email: string,
  oobCode: string,
  continueUrl: string | undefined,
  lang: string
) {
  // Generate custom recovery link
  const recoveryLink = `${process.env.NEXT_PUBLIC_APP_URL}/${lang}/auth/recover-email?oobCode=${oobCode}&continueUrl=${continueUrl || ''}`;

  // Send custom styled email
  const template = customEmailTemplates.emailRecovery({
    email,
    recoveryLink,
    lang,
  });

  await emailService.sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });

  return NextResponse.json({ 
    success: true, 
    message: 'Recovery email sent' 
  });
}