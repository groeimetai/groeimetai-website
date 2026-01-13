import { db, collections } from '@/lib/firebase/config';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { CompanySettings } from '@/types';

// Default company settings for GroeimetAI
const DEFAULT_COMPANY_SETTINGS: Omit<CompanySettings, 'id' | 'updatedAt' | 'updatedBy'> = {
  // Company Details
  name: 'GroeimetAI',
  legalName: 'GroeimetAI B.V.',
  email: 'info@groeimetai.io',
  phone: '+31 (0) 20 123 4567',
  website: 'www.groeimetai.io',
  // Dutch Registration
  kvkNumber: '',
  btwNumber: '',
  // Address
  street: '',
  postalCode: '',
  city: 'Amsterdam',
  country: 'Nederland',
  // Banking
  bankName: 'ABN AMRO',
  iban: '',
  bic: 'ABNANL2A',
  // Invoice Settings
  defaultPaymentTermsDays: 30,
  defaultTaxRate: 21,
  invoicePrefix: 'INV',
};

// Single document ID for company settings (singleton pattern)
const SETTINGS_DOC_ID = 'groeimetai';

class CompanySettingsService {
  /**
   * Get company settings from Firestore
   * Returns default settings if none exist
   */
  async getCompanySettings(): Promise<CompanySettings> {
    try {
      const docRef = doc(db, collections.companySettings, SETTINGS_DOC_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as CompanySettings;
      }

      // Return default settings if none exist
      return {
        id: SETTINGS_DOC_ID,
        ...DEFAULT_COMPANY_SETTINGS,
        updatedAt: new Date(),
        updatedBy: 'system',
      };
    } catch (error) {
      console.error('Error getting company settings:', error);
      // Return defaults on error
      return {
        id: SETTINGS_DOC_ID,
        ...DEFAULT_COMPANY_SETTINGS,
        updatedAt: new Date(),
        updatedBy: 'system',
      };
    }
  }

  /**
   * Update company settings in Firestore
   */
  async updateCompanySettings(
    settings: Partial<CompanySettings>,
    updatedBy: string
  ): Promise<void> {
    try {
      const docRef = doc(db, collections.companySettings, SETTINGS_DOC_ID);

      await setDoc(docRef, {
        ...settings,
        id: SETTINGS_DOC_ID,
        updatedAt: serverTimestamp(),
        updatedBy,
      }, { merge: true });
    } catch (error) {
      console.error('Error updating company settings:', error);
      throw error;
    }
  }

  /**
   * Initialize company settings with defaults if they don't exist
   */
  async initializeDefaultSettings(userId: string): Promise<CompanySettings> {
    try {
      const existing = await this.getCompanySettings();

      // If settings already exist with a real ID, return them
      const docRef = doc(db, collections.companySettings, SETTINGS_DOC_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return existing;
      }

      // Create default settings
      const defaultSettings: CompanySettings = {
        id: SETTINGS_DOC_ID,
        ...DEFAULT_COMPANY_SETTINGS,
        updatedAt: new Date(),
        updatedBy: userId,
      };

      await setDoc(docRef, {
        ...defaultSettings,
        updatedAt: serverTimestamp(),
      });

      return defaultSettings;
    } catch (error) {
      console.error('Error initializing company settings:', error);
      throw error;
    }
  }

  /**
   * Format Dutch date string (e.g., "1 januari 2025")
   */
  formatDateDutch(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const months = [
      'januari', 'februari', 'maart', 'april', 'mei', 'juni',
      'juli', 'augustus', 'september', 'oktober', 'november', 'december'
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  /**
   * Format Dutch currency string (e.g., "€ 1.234,56")
   */
  formatCurrencyDutch(amount: number): string {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}

// Export singleton instance
export const companySettingsService = new CompanySettingsService();
