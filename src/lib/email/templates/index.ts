import { getEmailTemplate as getEnTemplate } from './en';
import { getEmailTemplate as getNlTemplate } from './nl';

export function getEmailTemplate(locale: string = 'en') {
  switch (locale) {
    case 'nl':
      return getNlTemplate();
    case 'en':
    default:
      return getEnTemplate();
  }
}

export interface EmailTemplateData {
  recipientName?: string;
  recipientEmail: string;
  projectName?: string;
  companyName?: string;
  services?: string[];
  budget?: string;
  timeline?: string;
  description?: string;
  requestId?: string;
  oldStatus?: string;
  newStatus?: string;
  message?: string;
  quoteId?: string;
  requesterName?: string;
  requesterEmail?: string;
  company?: string;
  topic?: string;
  date?: string;
  time?: string;
  meetingType?: string;
  meetingId?: string;
  invoice?: any;
  pdfUrl?: string;
  paymentUrl?: string;
  reminderType?: 'due_soon' | 'overdue' | 'final_notice';
  paymentMethod?: string;
  transactionId?: string;
}

export type EmailType = 
  | 'newProjectRequest'
  | 'quoteStatusChange'
  | 'newMeetingRequest'
  | 'invoice'
  | 'invoiceReminder'
  | 'paymentConfirmation';