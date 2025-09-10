import { NextRequest, NextResponse } from 'next/server';
import { addDoc, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(req: NextRequest) {
  try {
    console.log('🧪 Email test endpoint called');

    // Create a simple test email with exact same format as working emails
    const testEmail = {
      to: process.env.CONTACT_EMAIL || 'info@groeimetai.com',
      message: {
        subject: '🧪 Test Email from GroeimetAI',
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; background-color: #080D14; font-family: system-ui, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; color: white; padding: 30px;">
    <h1 style="color: #F87315;">🧪 Email Test</h1>
    <p>Dit is een test email om te controleren of de Firebase Email Extension werkt.</p>
    <p><strong>Tijd:</strong> ${new Date().toLocaleString('nl-NL')}</p>
    <p><strong>Status:</strong> Email succesvol toegevoegd aan Firestore mail collection</p>
    <p><strong>Extension configuratie:</strong> Send Email Extension zou dit automatisch moeten verwerken</p>
  </div>
</body>
</html>
        `
      },
      template: {
        name: 'debug_test',
        data: { timestamp: new Date().toISOString() }
      }
    };

    // Add to mail collection
    const docRef = await addDoc(collection(db, 'mail'), testEmail);
    console.log('📧 Test email added to mail collection:', docRef.id);

    // Check recent emails in mail collection
    const mailQuery = query(
      collection(db, 'mail'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const mailSnapshot = await getDocs(mailQuery);
    const recentEmails = mailSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || null
    }));

    return NextResponse.json({
      success: true,
      message: 'Test email added to Firestore mail collection',
      testEmailId: docRef.id,
      recentEmails: recentEmails,
      debugInfo: {
        mailCollectionSize: mailSnapshot.size,
        timestampNow: new Date().toISOString(),
        contactEmail: process.env.CONTACT_EMAIL || 'info@groeimetai.com'
      }
    });

  } catch (error) {
    console.error('❌ Email test error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('📊 Checking email queue status');

    // Get recent emails from mail collection
    const mailQuery = query(
      collection(db, 'mail'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const mailSnapshot = await getDocs(mailQuery);
    const emails = mailSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        to: data.to,
        subject: data.message?.subject || 'No subject',
        timestamp: data.timestamp?.toDate?.()?.toISOString() || null,
        delivery: data.delivery || null,
        status: data.delivery?.state || 'pending'
      };
    });

    // Get recent contact submissions
    const contactsQuery = query(
      collection(db, 'contact_submissions'),
      orderBy('submittedAt', 'desc'),
      limit(5)
    );

    const contactsSnapshot = await getDocs(contactsQuery);
    const contacts = contactsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        email: data.email,
        company: data.company,
        status: data.status,
        conversationType: data.conversationType,
        submittedAt: data.submittedAt?.toDate?.()?.toISOString() || null
      };
    });

    return NextResponse.json({
      success: true,
      emailQueue: {
        totalEmails: emails.length,
        emails: emails
      },
      contactSubmissions: {
        totalContacts: contacts.length,
        contacts: contacts
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Email queue check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check email queue',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}