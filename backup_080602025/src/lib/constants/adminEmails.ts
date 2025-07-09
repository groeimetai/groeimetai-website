// Admin email addresses for GroeimetAI
export const ADMIN_EMAILS = [
  'info@groeimetai.io',
  'niels@groeimetai.io',
  'admin@groeimetai.io',
] as const;

// Helper function to check if an email is an admin email
export const isAdminEmail = (email: string): boolean => {
  return ADMIN_EMAILS.includes(email.toLowerCase() as any);
};

// For CommonJS compatibility in scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ADMIN_EMAILS, isAdminEmail };
}
