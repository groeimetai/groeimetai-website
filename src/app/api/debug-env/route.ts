import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS_EXISTS: !!process.env.SMTP_PASS,
    SMTP_PASS_LENGTH: process.env.SMTP_PASS?.length || 0,
    SMTP_PASS_FIRST_3: process.env.SMTP_PASS?.substring(0, 3) || 'N/A',
    SMTP_PASS_LAST_3: process.env.SMTP_PASS ? '...' + process.env.SMTP_PASS.substring(process.env.SMTP_PASS.length - 3) : 'N/A',
  });
}