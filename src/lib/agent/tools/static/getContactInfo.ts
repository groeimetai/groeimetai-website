/**
 * Get Contact Info Tool
 * Returns static contact information for GroeimetAI
 */

import type { AgentContext, ToolResult, ContactInfo } from '../../types';

/**
 * Contact information
 */
const contactInfo: { nl: ContactInfo; en: ContactInfo } = {
  nl: {
    email: 'info@groeimetai.io',
    bookingUrl: 'https://groeimetai.io/contact',
    officeHours: 'Maandag - Vrijdag, 9:00 - 18:00',
    location: 'Nederland',
  },
  en: {
    email: 'info@groeimetai.io',
    bookingUrl: 'https://groeimetai.io/contact',
    officeHours: 'Monday - Friday, 9:00 AM - 6:00 PM CET',
    location: 'Netherlands',
  },
};

/**
 * Execute getContactInfo tool
 */
export async function executeGetContactInfo(
  _args: Record<string, unknown>,
  context: AgentContext
): Promise<ToolResult> {
  const locale = context.locale;

  try {
    const info = contactInfo[locale];

    return {
      success: true,
      data: {
        contact: info,
        message:
          locale === 'nl'
            ? `Je kunt ons bereiken via ${info.email} of een afspraak maken via onze website.`
            : `You can reach us at ${info.email} or schedule a meeting via our website.`,
        cta:
          locale === 'nl'
            ? 'Plan een vrijblijvend gesprek om te bespreken hoe we je kunnen helpen met AI implementatie.'
            : 'Schedule a free consultation to discuss how we can help you with AI implementation.',
      },
    };
  } catch (error) {
    console.error('getContactInfo error:', error);
    return {
      success: false,
      error:
        locale === 'nl'
          ? 'Er ging iets mis bij het ophalen van contactgegevens.'
          : 'Something went wrong while fetching contact information.',
    };
  }
}
