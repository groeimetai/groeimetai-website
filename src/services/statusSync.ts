// Status Synchronization System
// Keeps customer and admin dashboards in sync

export interface LeadStatus {
  id: string;
  customerStatus: string;
  adminStatus: string;
  stage: 'lead' | 'assessment' | 'pilot' | 'implementation' | 'live';
  priority: 'high' | 'medium' | 'low';
  lastUpdate: Date;
}

export const statusMappings = {
  // Customer Dashboard Status ←→ Admin Dashboard Status
  'pending_assessment': 'Lead - Awaiting Report',
  'assessment_complete': 'Qualified Lead',
  'pilot_in_progress': 'Active Project - Pilot',
  'implementation': 'Active Project - Build',
  'live': 'Active Client - Monitoring',
  'issue_reported': 'Support Ticket Open',
  'pilot_completed': 'Conversion Opportunity',
  'contract_expiring': 'Renewal Required'
};

export class StatusSyncService {
  static async updateLeadStatus(
    leadId: string, 
    newStatus: string, 
    context?: any
  ): Promise<void> {
    try {
      // Update in database
      await this.updateDatabase(leadId, newStatus, context);
      
      // Notify relevant parties
      await this.triggerNotifications(leadId, newStatus, context);
      
      // Update real-time dashboards
      await this.pushRealtimeUpdate(leadId, newStatus);
      
      // Trigger automation rules
      await this.checkAutomationRules(leadId, newStatus, context);
      
    } catch (error) {
      console.error('Status sync error:', error);
    }
  }

  static async triggerNotifications(
    leadId: string, 
    status: string, 
    context?: any
  ): Promise<void> {
    const notifications = [];

    switch (status) {
      case 'assessment_submitted':
        notifications.push({
          type: 'admin_alert',
          message: 'New assessment requires review',
          urgency: 'medium'
        });
        break;

      case 'pilot_requested':
        notifications.push({
          type: 'admin_alert', 
          message: 'Pilot request - conversion opportunity',
          urgency: 'high'
        });
        break;

      case 'issue_reported':
        notifications.push({
          type: 'admin_alert',
          message: 'Customer reported issue',
          urgency: 'critical'
        });
        break;

      case 'contract_expiring':
        notifications.push({
          type: 'admin_alert',
          message: 'Contract renewal needed',
          urgency: 'high'
        });
        break;
    }

    // Send notifications
    for (const notification of notifications) {
      await this.sendNotification(notification);
    }
  }

  static async checkAutomationRules(
    leadId: string,
    status: string, 
    context?: any
  ): Promise<void> {
    // Auto-approval rules
    if (status === 'assessment_generated' && context?.score > 80) {
      await this.autoApproveReport(leadId);
      await this.sendReportToCustomer(leadId);
    }

    // Health monitoring
    if (status === 'live' && context?.health < 70) {
      await this.createAlert('Client at risk', leadId);
      await this.scheduleHealthCall(leadId);
    }

    // Usage spike detection
    if (context?.usageSpike > 200) {
      await this.notifyClient('Unusual activity detected', leadId);
      await this.notifyAdmin('Check for issues', leadId);
    }

    // Contract expiry
    if (context?.contractDaysLeft < 30) {
      await this.startRenewalFlow(leadId);
      await this.notifyAccountManager(leadId);
    }
  }

  private static async updateDatabase(
    leadId: string, 
    status: string, 
    context?: any
  ): Promise<void> {
    // Database update implementation
    console.log(`Updating lead ${leadId} to status: ${status}`);
  }

  private static async pushRealtimeUpdate(
    leadId: string, 
    status: string
  ): Promise<void> {
    // WebSocket/SSE push to dashboards
    console.log(`Real-time update: Lead ${leadId} status: ${status}`);
  }

  private static async sendNotification(notification: any): Promise<void> {
    // Notification service implementation
    console.log('Sending notification:', notification);
  }

  private static async autoApproveReport(leadId: string): Promise<void> {
    await this.updateLeadStatus(leadId, 'report_approved');
  }

  private static async sendReportToCustomer(leadId: string): Promise<void> {
    // Email service implementation
    console.log(`Sending report to customer for lead ${leadId}`);
  }

  private static async createAlert(message: string, leadId: string): Promise<void> {
    console.log(`Creating alert: ${message} for lead ${leadId}`);
  }

  private static async scheduleHealthCall(leadId: string): Promise<void> {
    console.log(`Scheduling health call for lead ${leadId}`);
  }

  private static async notifyClient(message: string, leadId: string): Promise<void> {
    console.log(`Notifying client: ${message} for lead ${leadId}`);
  }

  private static async notifyAdmin(message: string, leadId: string): Promise<void> {
    console.log(`Notifying admin: ${message} for lead ${leadId}`);
  }

  private static async startRenewalFlow(leadId: string): Promise<void> {
    console.log(`Starting renewal flow for lead ${leadId}`);
  }

  private static async notifyAccountManager(leadId: string): Promise<void> {
    console.log(`Notifying account manager for lead ${leadId}`);
  }
}