import { NextRequest, NextResponse } from 'next/server';

// Simple GET endpoint to prevent build errors
// Actual assessment logic is in /api/assessment/submit
export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Assessment API is available. Use /api/assessment/submit for submissions.',
    endpoints: {
      submit: '/api/assessment/submit',
      generateDynamic: '/api/assessment/generate-dynamic',
      getUserAssessments: '/api/assessment/get-user-assessments'
    }
  });
}

export async function POST(req: NextRequest) {
  // Redirect to submit endpoint
  return NextResponse.redirect(new URL('/api/assessment/submit', req.url));
}