import { NextRequest, NextResponse } from 'next/server';
import { createMollieClient } from '@mollie/api-client';

const mollieClient = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { userId, userEmail, userName, userCompany } = await req.json();
    
    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'User info required' },
        { status: 400 }
      );
    }

    // Create Mollie payment
    const payment = await mollieClient.payments.create({
      amount: {
        currency: 'EUR',
        value: '2500.00'
      },
      description: `Expert Assessment - ${userCompany || userName}`,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/expert-assessment?success=true`,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`,
      metadata: {
        userId,
        userEmail,
        userName: userName || '',
        userCompany: userCompany || '',
        service: 'expert_assessment',
        createdAt: new Date().toISOString()
      }
    });

    console.log('💳 Expert Assessment payment created:', {
      paymentId: payment.id,
      amount: payment.amount,
      user: userEmail,
      company: userCompany
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      checkoutUrl: payment.getCheckoutUrl(),
      amount: payment.amount.value,
      description: payment.description
    });

  } catch (error: any) {
    console.error('❌ Mollie payment creation error:', error);
    return NextResponse.json(
      { error: 'Payment creation failed', details: error.message },
      { status: 500 }
    );
  }
}