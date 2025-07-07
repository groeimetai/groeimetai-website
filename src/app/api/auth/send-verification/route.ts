import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { emailService } from '@/services/emailService';
import { customEmailTemplates } from '@/lib/email/custom-auth-templates';

export async function POST(request: NextRequest) {
  try {
    const { email, uid, lang = 'nl' } = await request.json();

    if (!email || !uid) {
      return NextResponse.json(
        { error: 'Email and UID are required' },
        { status: 400 }
      );
    }

    // Generate email verification link using Firebase Admin SDK
    const verificationLink = await adminAuth.generateEmailVerificationLink(email, {
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${lang}/dashboard`,
    });

    // Extract the oobCode from the Firebase link
    const url = new URL(verificationLink);
    const oobCode = url.searchParams.get('oobCode');

    // Create our custom verification link
    const customLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${lang}/auth/action?mode=verifyEmail&oobCode=${oobCode}&continueUrl=${encodeURIComponent(`/${lang}/dashboard`)}`;

    // Get the email template
    const template = customEmailTemplates.emailVerification({
      email,
      verifyLink: customLink,
      lang,
    });

    // Send the email
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
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    
    // If email service fails, don't break the user experience
    if (error.message?.includes('Email service unavailable')) {
      return NextResponse.json({ 
        success: true, 
        message: 'Account created (verification email pending)' 
      });
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to send verification email' },
      { status: 500 }
    );
  }
}