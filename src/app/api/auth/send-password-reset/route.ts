import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { emailService } from '@/services/emailService';
import { customEmailTemplates } from '@/lib/email/custom-auth-templates';

export async function POST(request: NextRequest) {
  try {
    const { email, lang = 'nl' } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate password reset link using Firebase Admin SDK
    const resetLink = await adminAuth.generatePasswordResetLink(email, {
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${lang}/login`,
    });

    // Extract the oobCode from the Firebase link
    const url = new URL(resetLink);
    const oobCode = url.searchParams.get('oobCode');

    // Create our custom reset link
    const customLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${lang}/auth/action?mode=resetPassword&oobCode=${oobCode}&continueUrl=${encodeURIComponent(`/${lang}/login`)}`;

    // Get the email template
    const template = customEmailTemplates.passwordReset({
      email,
      resetLink: customLink,
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
      message: 'Password reset email sent' 
    });
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    
    // Check if user exists
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json(
        { error: 'No account found with this email address' },
        { status: 404 }
      );
    }
    
    // If email service fails, don't break the user experience
    if (error.message?.includes('Email service unavailable')) {
      return NextResponse.json({ 
        success: true, 
        message: 'Password reset email pending' 
      });
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to send password reset email' },
      { status: 500 }
    );
  }
}