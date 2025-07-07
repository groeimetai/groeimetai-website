interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface BaseEmailData {
  email: string;
  lang: string;
}

interface PasswordResetData extends BaseEmailData {
  resetLink: string;
}

interface EmailVerificationData extends BaseEmailData {
  verifyLink: string;
}

interface EmailRecoveryData extends BaseEmailData {
  recoveryLink: string;
}

const translations = {
  nl: {
    passwordReset: {
      subject: 'Reset je wachtwoord - GroeimetAI',
      title: 'Wachtwoord resetten',
      greeting: 'Hallo,',
      message:
        'Je hebt een verzoek ingediend om je wachtwoord te resetten voor je GroeimetAI account.',
      instruction: 'Klik op de onderstaande knop om een nieuw wachtwoord in te stellen:',
      button: 'Reset Wachtwoord',
      expires: 'Deze link is 1 uur geldig.',
      ignore: 'Als je dit verzoek niet hebt gedaan, kun je deze email veilig negeren.',
      needHelp: 'Hulp nodig?',
      contact: 'Neem contact op met ons support team',
    },
    emailVerification: {
      subject: 'Verifieer je email - GroeimetAI',
      title: 'Email Verificatie',
      greeting: 'Welkom bij GroeimetAI!',
      message:
        'Bedankt voor je registratie. Verifieer je email adres om toegang te krijgen tot alle functionaliteiten.',
      instruction: 'Klik op de onderstaande knop om je email te verifiëren:',
      button: 'Verifieer Email',
      expires: 'Deze link is 24 uur geldig.',
      ignore: 'Als je geen account hebt aangemaakt, kun je deze email veilig negeren.',
      needHelp: 'Hulp nodig?',
      contact: 'Neem contact op met ons support team',
    },
    emailRecovery: {
      subject: 'Email adres herstellen - GroeimetAI',
      title: 'Email Herstel',
      greeting: 'Hallo,',
      message:
        'We hebben een verzoek ontvangen om je email adres te wijzigen voor je GroeimetAI account.',
      instruction: 'Klik op de onderstaande knop om deze wijziging te bevestigen:',
      button: 'Bevestig Email Wijziging',
      warning: 'Let op: dit zal je login email adres permanent wijzigen.',
      expires: 'Deze link is 1 uur geldig.',
      ignore: 'Als je dit verzoek niet hebt gedaan, neem dan onmiddellijk contact met ons op.',
      needHelp: 'Hulp nodig?',
      contact: 'Neem contact op met ons support team',
    },
  },
  en: {
    passwordReset: {
      subject: 'Reset your password - GroeimetAI',
      title: 'Password Reset',
      greeting: 'Hello,',
      message: 'You requested to reset your password for your GroeimetAI account.',
      instruction: 'Click the button below to set a new password:',
      button: 'Reset Password',
      expires: 'This link expires in 1 hour.',
      ignore: "If you didn't request this, you can safely ignore this email.",
      needHelp: 'Need help?',
      contact: 'Contact our support team',
    },
    emailVerification: {
      subject: 'Verify your email - GroeimetAI',
      title: 'Email Verification',
      greeting: 'Welcome to GroeimetAI!',
      message: 'Thank you for signing up. Please verify your email address to access all features.',
      instruction: 'Click the button below to verify your email:',
      button: 'Verify Email',
      expires: 'This link expires in 24 hours.',
      ignore: "If you didn't create an account, you can safely ignore this email.",
      needHelp: 'Need help?',
      contact: 'Contact our support team',
    },
    emailRecovery: {
      subject: 'Recover your email - GroeimetAI',
      title: 'Email Recovery',
      greeting: 'Hello,',
      message: 'We received a request to change the email address for your GroeimetAI account.',
      instruction: 'Click the button below to confirm this change:',
      button: 'Confirm Email Change',
      warning: 'Warning: this will permanently change your login email address.',
      expires: 'This link expires in 1 hour.',
      ignore: "If you didn't request this, please contact us immediately.",
      needHelp: 'Need help?',
      contact: 'Contact our support team',
    },
  },
};

const baseEmailTemplate = (content: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GroeimetAI</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9f9f9;">
  <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9f9f9; padding: 20px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #000000; padding: 30px; text-align: center;">
              <div style="font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 28px; font-weight: 900; font-style: italic; color: #ffffff; text-shadow: 2px 2px 0px #F97316, -2px -2px 0px #F97316, 2px -2px 0px #F97316, -2px 2px 0px #F97316; letter-spacing: -1px;">
                GroeimetAI
              </div>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">
                GroeimetAI - Groei met de kracht van AI
              </p>
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 12px;">
                Kweekweg 23, 7315 AP Apeldoorn, Nederland
              </p>
              <div style="margin-top: 20px;">
                <a href="https://linkedin.com/company/groeimetai" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#0077B5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
                  </svg>
                </a>
                <a href="https://github.com/groeimetai" style="display: inline-block; margin: 0 10px; text-decoration: none;">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#333333" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.607.069-.607 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.252-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                </a>
              </div>
              <p style="margin: 20px 0 0 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} GroeimetAI. Alle rechten voorbehouden.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export const customEmailTemplates = {
  passwordReset: (data: PasswordResetData): EmailTemplate => {
    const t =
      translations[data.lang as keyof typeof translations]?.passwordReset ||
      translations.nl.passwordReset;

    const content = `
      <h1 style="margin: 0 0 20px 0; color: #000000; font-size: 28px; font-weight: 600;">${t.title}</h1>
      <p style="margin: 0 0 10px 0; color: #333333; font-size: 16px; line-height: 1.5;">${t.greeting}</p>
      <p style="margin: 0 0 30px 0; color: #333333; font-size: 16px; line-height: 1.5;">${t.message}</p>
      <p style="margin: 0 0 30px 0; color: #333333; font-size: 16px; line-height: 1.5;">${t.instruction}</p>
      
      <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
        <tr>
          <td style="background-color: #F97316; padding: 12px 30px; border-radius: 6px;">
            <a href="${data.resetLink}" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
              ${t.button}
            </a>
          </td>
        </tr>
      </table>
      
      <p style="margin: 30px 0 20px 0; color: #666666; font-size: 14px; line-height: 1.5;">${t.expires}</p>
      <p style="margin: 0 0 30px 0; color: #666666; font-size: 14px; line-height: 1.5;">${t.ignore}</p>
      
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
      
      <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">${t.needHelp}</p>
      <p style="margin: 0; color: #666666; font-size: 14px;">
        <a href="mailto:support@groeimetai.io" style="color: #F97316; text-decoration: none;">
          ${t.contact}
        </a>
      </p>
    `;

    return {
      subject: t.subject,
      html: baseEmailTemplate(content),
      text: `${t.title}\n\n${t.greeting}\n\n${t.message}\n\n${t.instruction}\n\n${t.button}: ${data.resetLink}\n\n${t.expires}\n\n${t.ignore}\n\n${t.needHelp} ${t.contact}: support@groeimetai.io`,
    };
  },

  emailVerification: (data: EmailVerificationData): EmailTemplate => {
    const t =
      translations[data.lang as keyof typeof translations]?.emailVerification ||
      translations.nl.emailVerification;

    const content = `
      <h1 style="margin: 0 0 20px 0; color: #000000; font-size: 28px; font-weight: 600;">${t.title}</h1>
      <p style="margin: 0 0 10px 0; color: #333333; font-size: 16px; line-height: 1.5;">${t.greeting}</p>
      <p style="margin: 0 0 30px 0; color: #333333; font-size: 16px; line-height: 1.5;">${t.message}</p>
      <p style="margin: 0 0 30px 0; color: #333333; font-size: 16px; line-height: 1.5;">${t.instruction}</p>
      
      <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
        <tr>
          <td style="background-color: #F97316; padding: 12px 30px; border-radius: 6px;">
            <a href="${data.verifyLink}" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
              ${t.button}
            </a>
          </td>
        </tr>
      </table>
      
      <p style="margin: 30px 0 20px 0; color: #666666; font-size: 14px; line-height: 1.5;">${t.expires}</p>
      <p style="margin: 0 0 30px 0; color: #666666; font-size: 14px; line-height: 1.5;">${t.ignore}</p>
      
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
      
      <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">${t.needHelp}</p>
      <p style="margin: 0; color: #666666; font-size: 14px;">
        <a href="mailto:support@groeimetai.io" style="color: #F97316; text-decoration: none;">
          ${t.contact}
        </a>
      </p>
    `;

    return {
      subject: t.subject,
      html: baseEmailTemplate(content),
      text: `${t.title}\n\n${t.greeting}\n\n${t.message}\n\n${t.instruction}\n\n${t.button}: ${data.verifyLink}\n\n${t.expires}\n\n${t.ignore}\n\n${t.needHelp} ${t.contact}: support@groeimetai.io`,
    };
  },

  emailRecovery: (data: EmailRecoveryData): EmailTemplate => {
    const t =
      translations[data.lang as keyof typeof translations]?.emailRecovery ||
      translations.nl.emailRecovery;

    const content = `
      <h1 style="margin: 0 0 20px 0; color: #000000; font-size: 28px; font-weight: 600;">${t.title}</h1>
      <p style="margin: 0 0 10px 0; color: #333333; font-size: 16px; line-height: 1.5;">${t.greeting}</p>
      <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.5;">${t.message}</p>
      
      <div style="background-color: #FEF3C7; border: 1px solid #F59E0B; border-radius: 6px; padding: 15px; margin: 0 0 30px 0;">
        <p style="margin: 0; color: #92400E; font-size: 14px; font-weight: 600;">
          ⚠️ ${t.warning}
        </p>
      </div>
      
      <p style="margin: 0 0 30px 0; color: #333333; font-size: 16px; line-height: 1.5;">${t.instruction}</p>
      
      <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
        <tr>
          <td style="background-color: #F97316; padding: 12px 30px; border-radius: 6px;">
            <a href="${data.recoveryLink}" style="color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600;">
              ${t.button}
            </a>
          </td>
        </tr>
      </table>
      
      <p style="margin: 30px 0 20px 0; color: #666666; font-size: 14px; line-height: 1.5;">${t.expires}</p>
      <p style="margin: 0 0 30px 0; color: #DC2626; font-size: 14px; line-height: 1.5; font-weight: 600;">${t.ignore}</p>
      
      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />
      
      <p style="margin: 0 0 10px 0; color: #666666; font-size: 14px;">${t.needHelp}</p>
      <p style="margin: 0; color: #666666; font-size: 14px;">
        <a href="mailto:support@groeimetai.io" style="color: #F97316; text-decoration: none;">
          ${t.contact}
        </a>
      </p>
    `;

    return {
      subject: t.subject,
      html: baseEmailTemplate(content),
      text: `${t.title}\n\n${t.greeting}\n\n${t.message}\n\n⚠️ ${t.warning}\n\n${t.instruction}\n\n${t.button}: ${data.recoveryLink}\n\n${t.expires}\n\n${t.ignore}\n\n${t.needHelp} ${t.contact}: support@groeimetai.io`,
    };
  },
};
