import { db, collections } from '@/lib/firebase/config';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  AdminSettings,
  AdminEmailTemplate,
  AdminService,
  AdminNotificationSettings,
} from '@/types';

// Single document ID for admin settings (singleton pattern)
const SETTINGS_DOC_ID = 'groeimetai';

// Default email templates
const DEFAULT_EMAIL_TEMPLATES: AdminEmailTemplate[] = [
  {
    id: 'quote-approved',
    name: 'Quote Approved',
    slug: 'quote-approved',
    subject: 'Your quote has been approved - {{projectName}}',
    body: 'Dear {{clientName}},\n\nWe are pleased to inform you that your quote for {{projectName}} has been approved.\n\nTotal amount: {{totalAmount}}\n\nNext steps:\n1. Review the approved quote\n2. Sign the contract\n3. Make the initial payment\n\nBest regards,\n{{companyName}}',
    variables: ['clientName', 'projectName', 'totalAmount', 'companyName'],
    isActive: true,
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'new-user-welcome',
    name: 'New User Welcome',
    slug: 'new-user-welcome',
    subject: 'Welcome to GroeimetAI',
    body: "Welcome {{userName}}!\n\nThank you for joining GroeimetAI. We're excited to help you grow with AI.\n\nYour account has been created successfully. You can now:\n- Request quotes for AI services\n- Track your projects\n- Access your dashboard\n\nBest regards,\nThe GroeimetAI Team",
    variables: ['userName'],
    isActive: true,
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'project-status-update',
    name: 'Project Status Update',
    slug: 'project-status-update',
    subject: 'Project Update: {{projectName}}',
    body: 'Dear {{clientName}},\n\nWe have an update on your project "{{projectName}}".\n\nStatus: {{status}}\nProgress: {{progress}}%\n\n{{updateMessage}}\n\nBest regards,\n{{companyName}}',
    variables: ['clientName', 'projectName', 'status', 'progress', 'updateMessage', 'companyName'],
    isActive: true,
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'invoice-created',
    name: 'Invoice Created',
    slug: 'invoice-created',
    subject: 'New Invoice #{{invoiceNumber}} - {{companyName}}',
    body: 'Dear {{clientName}},\n\nA new invoice has been created for your account.\n\nInvoice Number: {{invoiceNumber}}\nAmount: {{amount}}\nDue Date: {{dueDate}}\n\nPlease find the invoice attached or view it in your dashboard.\n\nBest regards,\n{{companyName}}',
    variables: ['clientName', 'invoiceNumber', 'amount', 'dueDate', 'companyName'],
    isActive: true,
    isSystem: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Default services
const DEFAULT_SERVICES: AdminService[] = [
  {
    id: 'ai-consulting',
    name: 'AI Consulting',
    description: 'Strategic AI implementation consulting for your business',
    basePrice: 2500,
    priceType: 'fixed',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'chatbot-development',
    name: 'Chatbot Development',
    description: 'Custom chatbot development and integration',
    basePrice: 150,
    priceType: 'hourly',
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'process-automation',
    name: 'Process Automation',
    description: 'Business process automation with AI',
    basePrice: 0,
    priceType: 'custom',
    isActive: true,
    sortOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Default notification settings
const DEFAULT_NOTIFICATION_SETTINGS: AdminNotificationSettings = {
  emailNotifications: true,
  recipients: [],
  events: {
    newQuotes: true,
    projectUpdates: true,
    userRegistrations: true,
    systemAlerts: true,
    weeklyReport: false,
    invoicePayments: true,
  },
  updatedAt: new Date(),
  updatedBy: 'system',
};

// Helper to convert Firestore timestamps to dates
function convertTimestamps(data: any): any {
  if (!data) return data;

  const result = { ...data };

  // Convert top-level timestamps
  if (result.updatedAt instanceof Timestamp) {
    result.updatedAt = result.updatedAt.toDate();
  }
  if (result.createdAt instanceof Timestamp) {
    result.createdAt = result.createdAt.toDate();
  }

  // Convert timestamps in arrays
  if (Array.isArray(result.emailTemplates)) {
    result.emailTemplates = result.emailTemplates.map((t: any) => ({
      ...t,
      createdAt: t.createdAt instanceof Timestamp ? t.createdAt.toDate() : t.createdAt,
      updatedAt: t.updatedAt instanceof Timestamp ? t.updatedAt.toDate() : t.updatedAt,
    }));
  }

  if (Array.isArray(result.services)) {
    result.services = result.services.map((s: any) => ({
      ...s,
      createdAt: s.createdAt instanceof Timestamp ? s.createdAt.toDate() : s.createdAt,
      updatedAt: s.updatedAt instanceof Timestamp ? s.updatedAt.toDate() : s.updatedAt,
    }));
  }

  if (result.notificationSettings?.updatedAt instanceof Timestamp) {
    result.notificationSettings.updatedAt = result.notificationSettings.updatedAt.toDate();
  }

  return result;
}

class AdminSettingsService {
  /**
   * Get admin settings from Firestore
   * Returns default settings if none exist
   */
  async getAdminSettings(): Promise<AdminSettings> {
    try {
      const docRef = doc(db, collections.adminSettings, SETTINGS_DOC_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = convertTimestamps(docSnap.data());
        return {
          id: docSnap.id,
          ...data,
        } as AdminSettings;
      }

      // Return default settings if none exist
      return {
        id: SETTINGS_DOC_ID,
        emailTemplates: DEFAULT_EMAIL_TEMPLATES,
        services: DEFAULT_SERVICES,
        notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
        updatedAt: new Date(),
        updatedBy: 'system',
      };
    } catch (error) {
      console.error('Error getting admin settings:', error);
      // Return defaults on error
      return {
        id: SETTINGS_DOC_ID,
        emailTemplates: DEFAULT_EMAIL_TEMPLATES,
        services: DEFAULT_SERVICES,
        notificationSettings: DEFAULT_NOTIFICATION_SETTINGS,
        updatedAt: new Date(),
        updatedBy: 'system',
      };
    }
  }

  /**
   * Update admin settings in Firestore (partial merge)
   */
  async updateAdminSettings(
    settings: Partial<AdminSettings>,
    updatedBy: string
  ): Promise<void> {
    try {
      const docRef = doc(db, collections.adminSettings, SETTINGS_DOC_ID);

      await setDoc(
        docRef,
        {
          ...settings,
          id: SETTINGS_DOC_ID,
          updatedAt: serverTimestamp(),
          updatedBy,
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error updating admin settings:', error);
      throw error;
    }
  }

  /**
   * Initialize admin settings with defaults if they don't exist
   */
  async initializeDefaults(userId: string): Promise<AdminSettings> {
    try {
      const docRef = doc(db, collections.adminSettings, SETTINGS_DOC_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return convertTimestamps({
          id: docSnap.id,
          ...docSnap.data(),
        }) as AdminSettings;
      }

      // Create default settings
      const defaultSettings: AdminSettings = {
        id: SETTINGS_DOC_ID,
        emailTemplates: DEFAULT_EMAIL_TEMPLATES,
        services: DEFAULT_SERVICES,
        notificationSettings: {
          ...DEFAULT_NOTIFICATION_SETTINGS,
          updatedBy: userId,
        },
        updatedAt: new Date(),
        updatedBy: userId,
      };

      await setDoc(docRef, {
        ...defaultSettings,
        updatedAt: serverTimestamp(),
      });

      return defaultSettings;
    } catch (error) {
      console.error('Error initializing admin settings:', error);
      throw error;
    }
  }

  // ============ Email Templates ============

  /**
   * Get all email templates
   */
  async getEmailTemplates(): Promise<AdminEmailTemplate[]> {
    const settings = await this.getAdminSettings();
    return settings.emailTemplates;
  }

  /**
   * Add a new email template
   */
  async addEmailTemplate(
    template: Omit<AdminEmailTemplate, 'id' | 'createdAt' | 'updatedAt'>,
    updatedBy: string
  ): Promise<AdminEmailTemplate> {
    const settings = await this.getAdminSettings();

    const newTemplate: AdminEmailTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedTemplates = [...settings.emailTemplates, newTemplate];

    await this.updateAdminSettings({ emailTemplates: updatedTemplates }, updatedBy);

    return newTemplate;
  }

  /**
   * Update an existing email template
   */
  async updateEmailTemplate(
    templateId: string,
    updates: Partial<AdminEmailTemplate>,
    updatedBy: string
  ): Promise<void> {
    const settings = await this.getAdminSettings();

    const updatedTemplates = settings.emailTemplates.map((t) =>
      t.id === templateId
        ? { ...t, ...updates, updatedAt: new Date() }
        : t
    );

    await this.updateAdminSettings({ emailTemplates: updatedTemplates }, updatedBy);
  }

  /**
   * Delete an email template (non-system templates only)
   */
  async deleteEmailTemplate(templateId: string, updatedBy: string): Promise<void> {
    const settings = await this.getAdminSettings();

    const template = settings.emailTemplates.find((t) => t.id === templateId);
    if (template?.isSystem) {
      throw new Error('Cannot delete system templates');
    }

    const updatedTemplates = settings.emailTemplates.filter((t) => t.id !== templateId);

    await this.updateAdminSettings({ emailTemplates: updatedTemplates }, updatedBy);
  }

  // ============ Services ============

  /**
   * Get all services
   */
  async getServices(): Promise<AdminService[]> {
    const settings = await this.getAdminSettings();
    return settings.services.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * Add a new service
   */
  async addService(
    service: Omit<AdminService, 'id' | 'createdAt' | 'updatedAt'>,
    updatedBy: string
  ): Promise<AdminService> {
    const settings = await this.getAdminSettings();

    const maxSortOrder = Math.max(...settings.services.map((s) => s.sortOrder), 0);

    const newService: AdminService = {
      ...service,
      id: `service-${Date.now()}`,
      sortOrder: service.sortOrder || maxSortOrder + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedServices = [...settings.services, newService];

    await this.updateAdminSettings({ services: updatedServices }, updatedBy);

    return newService;
  }

  /**
   * Update an existing service
   */
  async updateService(
    serviceId: string,
    updates: Partial<AdminService>,
    updatedBy: string
  ): Promise<void> {
    const settings = await this.getAdminSettings();

    const updatedServices = settings.services.map((s) =>
      s.id === serviceId
        ? { ...s, ...updates, updatedAt: new Date() }
        : s
    );

    await this.updateAdminSettings({ services: updatedServices }, updatedBy);
  }

  /**
   * Delete a service
   */
  async deleteService(serviceId: string, updatedBy: string): Promise<void> {
    const settings = await this.getAdminSettings();

    const updatedServices = settings.services.filter((s) => s.id !== serviceId);

    await this.updateAdminSettings({ services: updatedServices }, updatedBy);
  }

  // ============ Notification Settings ============

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<AdminNotificationSettings> {
    const settings = await this.getAdminSettings();
    return settings.notificationSettings;
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(
    notificationSettings: Partial<AdminNotificationSettings>,
    updatedBy: string
  ): Promise<void> {
    const settings = await this.getAdminSettings();

    const updatedNotificationSettings: AdminNotificationSettings = {
      ...settings.notificationSettings,
      ...notificationSettings,
      updatedAt: new Date(),
      updatedBy,
    };

    await this.updateAdminSettings(
      { notificationSettings: updatedNotificationSettings },
      updatedBy
    );
  }
}

// Export singleton instance
export const adminSettingsService = new AdminSettingsService();
