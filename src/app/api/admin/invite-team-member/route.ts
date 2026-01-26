import { NextRequest, NextResponse } from 'next/server';
import { createTransporter, emailConfig, verifyEmailConnection } from '@/lib/email/config';
import { db, collections } from '@/lib/firebase/config';
import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

// Generate invite token
function generateInviteToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint32Array(32);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < 32; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

// POST - Send team member invitation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role, invitedBy, invitedByName } = body;

    if (!email || !role || !invitedBy) {
      return NextResponse.json(
        { error: 'Missing required fields: email, role, invitedBy' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const usersRef = collection(db, collections.users);
    const existingUserQuery = query(usersRef, where('email', '==', email));
    const existingUsers = await getDocs(existingUserQuery);

    if (!existingUsers.empty) {
      return NextResponse.json(
        {
          success: false,
          error: 'User already exists',
          message: 'A user with this email already has an account',
        },
        { status: 409 }
      );
    }

    // Generate invite token
    const inviteToken = generateInviteToken();
    const inviteId = `invite-${Date.now()}`;

    // Store pending invite
    const invitesRef = collection(db, 'teamInvites');
    await setDoc(doc(invitesRef, inviteId), {
      id: inviteId,
      email,
      role,
      token: inviteToken,
      invitedBy,
      invitedByName: invitedByName || 'Admin',
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: serverTimestamp(),
    });

    // Check if email service is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({
        success: true,
        message: 'Invite created but email not sent (email service not configured)',
        inviteId,
        inviteToken,
        warning: 'Share this invite link manually',
      });
    }

    // Verify email connection
    const isConnected = await verifyEmailConnection();
    if (!isConnected) {
      return NextResponse.json({
        success: true,
        message: 'Invite created but email not sent (email service unavailable)',
        inviteId,
        inviteToken,
        warning: 'Share this invite link manually',
      });
    }

    // Create transporter
    const transporter = createTransporter();
    if (!transporter) {
      return NextResponse.json({
        success: true,
        message: 'Invite created but email not sent (transporter unavailable)',
        inviteId,
        inviteToken,
        warning: 'Share this invite link manually',
      });
    }

    // Build invite URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://groeimetai.io';
    const inviteUrl = `${baseUrl}/invite?token=${inviteToken}`;

    // Role display names
    const roleDisplayNames: Record<string, string> = {
      admin: 'Administrator',
      consultant: 'Consultant',
      project_manager: 'Project Manager',
      developer: 'Developer',
      designer: 'Designer',
      marketing: 'Marketing',
    };

    const roleDisplayName = roleDisplayNames[role] || role;

    // Create email HTML
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
              background: #f5f5f5;
            }
            .container {
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 30px;
            }
            .role-badge {
              display: inline-block;
              background: #FF6B00;
              color: white;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: bold;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%);
              color: white;
              padding: 14px 28px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: bold;
              font-size: 16px;
              margin: 20px 0;
            }
            .cta-button:hover {
              background: linear-gradient(135deg, #FF8C00 0%, #FFA500 100%);
            }
            .footer {
              padding: 20px 30px;
              background: #f9f9f9;
              font-size: 12px;
              color: #666;
              text-align: center;
              border-top: 1px solid #eee;
            }
            .expiry-note {
              background: #fff3cd;
              color: #856404;
              padding: 10px 15px;
              border-radius: 6px;
              margin-top: 20px;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Je bent uitgenodigd!</h1>
            </div>
            <div class="content">
              <p>Hallo,</p>
              <p>
                <strong>${invitedByName || 'Een beheerder'}</strong> heeft je uitgenodigd om deel te nemen aan het GroeimetAI team als:
              </p>
              <p style="text-align: center; margin: 20px 0;">
                <span class="role-badge">${roleDisplayName}</span>
              </p>
              <p>
                Met deze rol kun je helpen bij het ontwikkelen en ondersteunen van AI-oplossingen voor onze klanten.
              </p>
              <p style="text-align: center;">
                <a href="${inviteUrl}" class="cta-button">
                  Accepteer Uitnodiging
                </a>
              </p>
              <div class="expiry-note">
                ⏰ Deze uitnodiging verloopt over 7 dagen. Accepteer de uitnodiging voor die tijd.
              </div>
            </div>
            <div class="footer">
              <p>GroeimetAI - Groei met AI</p>
              <p>Als je deze uitnodiging niet verwachtte, kun je deze email negeren.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textBody = `
Je bent uitgenodigd om deel te nemen aan het GroeimetAI team!

${invitedByName || 'Een beheerder'} heeft je uitgenodigd als ${roleDisplayName}.

Klik op de volgende link om je uitnodiging te accepteren:
${inviteUrl}

Deze uitnodiging verloopt over 7 dagen.

Met vriendelijke groet,
Het GroeimetAI Team
    `.trim();

    // Send the email
    const info = await transporter.sendMail({
      from: `"${emailConfig.from.name}" <${emailConfig.from.address}>`,
      to: email,
      subject: `Uitnodiging om deel te nemen aan het GroeimetAI team als ${roleDisplayName}`,
      html: htmlBody,
      text: textBody,
    });

    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      messageId: info.messageId,
      inviteId,
      email,
      role,
    });
  } catch (error: any) {
    console.error('Error sending team invite:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send invitation',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// GET - List pending invites
export async function GET() {
  try {
    const invitesRef = collection(db, 'teamInvites');
    const q = query(invitesRef, where('status', '==', 'pending'));
    const snapshot = await getDocs(q);

    const invites = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        role: data.role,
        invitedBy: data.invitedBy,
        invitedByName: data.invitedByName,
        status: data.status,
        expiresAt: data.expiresAt?.toDate?.() || null,
        createdAt: data.createdAt?.toDate?.() || null,
      };
    });

    return NextResponse.json({
      success: true,
      data: invites,
    });
  } catch (error: any) {
    console.error('Error listing invites:', error);
    return NextResponse.json(
      { error: 'Failed to list invites', message: error.message },
      { status: 500 }
    );
  }
}
