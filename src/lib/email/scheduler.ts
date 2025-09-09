// Email Scheduler Service
// This runs the email processing every 15 minutes

class EmailScheduler {
  private static interval: NodeJS.Timeout | null = null;
  private static isRunning = false;

  static start() {
    if (this.isRunning) {
      console.log('📧 Email scheduler already running');
      return;
    }

    console.log('🚀 Starting email scheduler...');
    this.isRunning = true;

    // Process emails immediately on start
    this.processEmails();

    // Then process every 15 minutes
    this.interval = setInterval(() => {
      this.processEmails();
    }, 15 * 60 * 1000); // 15 minutes

    console.log('✅ Email scheduler started - processing every 15 minutes');
  }

  static stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.isRunning = false;
      console.log('🛑 Email scheduler stopped');
    }
  }

  private static async processEmails() {
    try {
      console.log('🔄 Processing scheduled emails...');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/email/process-scheduled`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Email processing completed: ${result.processed} sent, ${result.errors} errors`);
      } else {
        console.error('❌ Email processing failed:', response.status);
      }
    } catch (error) {
      console.error('❌ Email scheduler error:', error);
    }
  }

  // For development/testing
  static async runOnce() {
    console.log('🧪 Running email processor once (manual trigger)');
    await this.processEmails();
  }
}

export default EmailScheduler;

// Auto-start in production
if (process.env.NODE_ENV === 'production') {
  EmailScheduler.start();
}