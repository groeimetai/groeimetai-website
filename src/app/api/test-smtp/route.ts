import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { emailConfig } from '@/lib/email/config';

export async function GET(request: NextRequest) {
  console.log('Testing SMTP connection...');
  
  // Log the config being used
  const config = emailConfig.smtp;
  console.log('SMTP Config:', JSON.stringify({
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.auth.user,
    hasPassword: !!config.auth.pass,
    passwordLength: config.auth.pass?.length,
    hasTLS: !!config.tls,
    authMethod: config.authMethod,
  }, null, 2));

  // Test 1: Direct connection like in test script
  try {
    const directTransporter = nodemailer.createTransporter({
      host: 'mail.privateemail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'niels@groeimetai.io',
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2',
      },
    });

    await directTransporter.verify();
    console.log('Direct connection: SUCCESS');
  } catch (error: any) {
    console.error('Direct connection FAILED:', error.message);
  }

  // Test 2: Using emailConfig
  try {
    const configTransporter = nodemailer.createTransporter(config);
    await configTransporter.verify();
    console.log('Config connection: SUCCESS');
  } catch (error: any) {
    console.error('Config connection FAILED:', error.message);
    console.error('Error code:', error.code);
    console.error('Response:', error.response);
  }

  return NextResponse.json({
    directEnv: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      hasPassword: !!process.env.SMTP_PASS,
    },
    configObject: {
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.auth.user,
      hasPassword: !!config.auth.pass,
      passwordLength: config.auth.pass?.length,
      hasTLS: !!config.tls,
      authMethod: config.authMethod,
    }
  });
}