'use client';

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Contract, ContractTemplate, ContractStatus, ContractType, ContractSignatory } from '@/types';

// Helper function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (timestamp?.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  return new Date(timestamp);
};

// Generate contract number
const generateContractNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CTR-${year}-${random}`;
};

export const contractService = {
  // Contract CRUD operations
  async getContracts(): Promise<Contract[]> {
    try {
      const q = query(
        collection(db, 'contracts'),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          contractNumber: data.contractNumber || '',
          title: data.title || '',
          type: data.type || 'service_agreement',
          status: data.status || 'draft',
          templateId: data.templateId,
          clientId: data.clientId || '',
          clientName: data.clientName || '',
          clientEmail: data.clientEmail || '',
          organizationId: data.organizationId,
          projectId: data.projectId,
          quoteId: data.quoteId,
          content: data.content || { body: '', variables: {}, sections: [] },
          financials: data.financials || { totalValue: 0, currency: 'EUR' },
          dates: {
            effectiveDate: data.dates?.effectiveDate ? convertTimestamp(data.dates.effectiveDate) : undefined,
            expirationDate: data.dates?.expirationDate ? convertTimestamp(data.dates.expirationDate) : undefined,
            signedDate: data.dates?.signedDate ? convertTimestamp(data.dates.signedDate) : undefined,
            sentDate: data.dates?.sentDate ? convertTimestamp(data.dates.sentDate) : undefined,
            renewalDate: data.dates?.renewalDate ? convertTimestamp(data.dates.renewalDate) : undefined,
            terminationDate: data.dates?.terminationDate ? convertTimestamp(data.dates.terminationDate) : undefined,
            noticePeriodDays: data.dates?.noticePeriodDays || 30,
          },
          signatories: data.signatories || [],
          attachments: data.attachments || [],
          history: data.history || [],
          reminders: data.reminders || [],
          metadata: data.metadata || {},
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          createdBy: data.createdBy || '',
        } as Contract;
      });
    } catch (error) {
      console.error('Error getting contracts:', error);
      return [];
    }
  },

  async getContract(contractId: string): Promise<Contract | null> {
    try {
      const docSnap = await getDoc(doc(db, 'contracts', contractId));
      if (!docSnap.exists()) return null;

      const data = docSnap.data();
      return {
        id: docSnap.id,
        contractNumber: data.contractNumber || '',
        title: data.title || '',
        type: data.type || 'service_agreement',
        status: data.status || 'draft',
        templateId: data.templateId,
        clientId: data.clientId || '',
        clientName: data.clientName || '',
        clientEmail: data.clientEmail || '',
        organizationId: data.organizationId,
        projectId: data.projectId,
        quoteId: data.quoteId,
        content: data.content || { body: '', variables: {}, sections: [] },
        financials: data.financials || { totalValue: 0, currency: 'EUR' },
        dates: {
          effectiveDate: data.dates?.effectiveDate ? convertTimestamp(data.dates.effectiveDate) : undefined,
          expirationDate: data.dates?.expirationDate ? convertTimestamp(data.dates.expirationDate) : undefined,
          signedDate: data.dates?.signedDate ? convertTimestamp(data.dates.signedDate) : undefined,
          sentDate: data.dates?.sentDate ? convertTimestamp(data.dates.sentDate) : undefined,
          renewalDate: data.dates?.renewalDate ? convertTimestamp(data.dates.renewalDate) : undefined,
          terminationDate: data.dates?.terminationDate ? convertTimestamp(data.dates.terminationDate) : undefined,
          noticePeriodDays: data.dates?.noticePeriodDays || 30,
        },
        signatories: data.signatories || [],
        attachments: data.attachments || [],
        history: data.history || [],
        reminders: data.reminders || [],
        metadata: data.metadata || {},
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        createdBy: data.createdBy || '',
      } as Contract;
    } catch (error) {
      console.error('Error getting contract:', error);
      return null;
    }
  },

  async createContract(contractData: Omit<Contract, 'id' | 'contractNumber' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'contracts'), {
        ...contractData,
        contractNumber: generateContractNumber(),
        status: 'draft' as ContractStatus,
        history: [{
          id: crypto.randomUUID(),
          action: 'created' as const,
          description: 'Contract aangemaakt',
          userId: contractData.createdBy,
          userName: '',
          timestamp: new Date(),
        }],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  },

  async updateContract(contractId: string, updates: Partial<Contract>, userId?: string): Promise<void> {
    try {
      const contract = await this.getContract(contractId);
      if (!contract) throw new Error('Contract not found');

      const history = [...(contract.history || [])];
      history.push({
        id: crypto.randomUUID(),
        action: 'updated' as const,
        description: 'Contract bijgewerkt',
        userId: userId || '',
        userName: '',
        timestamp: new Date(),
      });

      await updateDoc(doc(db, 'contracts', contractId), {
        ...updates,
        history,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating contract:', error);
      throw error;
    }
  },

  async deleteContract(contractId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'contracts', contractId));
    } catch (error) {
      console.error('Error deleting contract:', error);
      throw error;
    }
  },

  // Status transitions
  async sendContract(contractId: string, userId: string): Promise<void> {
    try {
      const contract = await this.getContract(contractId);
      if (!contract) throw new Error('Contract not found');

      const history = [...(contract.history || [])];
      history.push({
        id: crypto.randomUUID(),
        action: 'sent' as const,
        description: 'Contract verzonden naar klant',
        userId,
        userName: '',
        timestamp: new Date(),
      });

      await updateDoc(doc(db, 'contracts', contractId), {
        status: 'sent' as ContractStatus,
        history,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error sending contract:', error);
      throw error;
    }
  },

  async signContract(contractId: string, signatoryEmail: string): Promise<void> {
    try {
      const contract = await this.getContract(contractId);
      if (!contract) throw new Error('Contract not found');

      const signatories = [...(contract.signatories || [])];
      const signatoryIndex = signatories.findIndex((s) => s.email === signatoryEmail);
      if (signatoryIndex !== -1) {
        signatories[signatoryIndex] = {
          ...signatories[signatoryIndex],
          signedAt: new Date(),
        };
      }

      // Check if all signatories have signed
      const allSigned = signatories.every((s) => s.signedAt);

      const history = [...(contract.history || [])];
      history.push({
        id: crypto.randomUUID(),
        action: 'signed' as const,
        description: `Ondertekend door ${signatoryEmail}`,
        userId: signatoryEmail,
        userName: '',
        timestamp: new Date(),
      });

      await updateDoc(doc(db, 'contracts', contractId), {
        signatories,
        status: allSigned ? 'signed' as ContractStatus : contract.status,
        dates: {
          ...contract.dates,
          signed: allSigned ? new Date() : undefined,
        },
        history,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error signing contract:', error);
      throw error;
    }
  },

  async activateContract(contractId: string, userId: string): Promise<void> {
    try {
      const contract = await this.getContract(contractId);
      if (!contract) throw new Error('Contract not found');

      const history = [...(contract.history || [])];
      history.push({
        id: crypto.randomUUID(),
        action: 'activated' as const,
        description: 'Contract geactiveerd',
        userId,
        userName: '',
        timestamp: new Date(),
      });

      await updateDoc(doc(db, 'contracts', contractId), {
        status: 'active' as ContractStatus,
        history,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error activating contract:', error);
      throw error;
    }
  },

  // Template operations
  async getTemplates(): Promise<ContractTemplate[]> {
    try {
      const q = query(
        collection(db, 'contractTemplates'),
        where('isActive', '==', true),
        orderBy('name', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ContractTemplate[];
    } catch (error) {
      console.error('Error getting templates:', error);
      return [];
    }
  },

  async getTemplate(templateId: string): Promise<ContractTemplate | null> {
    try {
      const docSnap = await getDoc(doc(db, 'contractTemplates', templateId));
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() } as ContractTemplate;
    } catch (error) {
      console.error('Error getting template:', error);
      return null;
    }
  },

  async createTemplate(templateData: Omit<ContractTemplate, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'contractTemplates'), {
        ...templateData,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  async updateTemplate(templateId: string, updates: Partial<ContractTemplate>): Promise<void> {
    try {
      await updateDoc(doc(db, 'contractTemplates', templateId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  // Subscribe to contracts
  subscribeToContracts(callback: (contracts: Contract[]) => void): () => void {
    const q = query(
      collection(db, 'contracts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contracts = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          contractNumber: data.contractNumber || '',
          title: data.title || '',
          type: data.type || 'service_agreement',
          status: data.status || 'draft',
          templateId: data.templateId,
          clientId: data.clientId || '',
          clientName: data.clientName || '',
          clientEmail: data.clientEmail || '',
          organizationId: data.organizationId,
          projectId: data.projectId,
          quoteId: data.quoteId,
          content: data.content || { body: '', variables: {}, sections: [] },
          financials: data.financials || { totalValue: 0, currency: 'EUR' },
          dates: {
            effectiveDate: data.dates?.effectiveDate ? convertTimestamp(data.dates.effectiveDate) : undefined,
            expirationDate: data.dates?.expirationDate ? convertTimestamp(data.dates.expirationDate) : undefined,
            signedDate: data.dates?.signedDate ? convertTimestamp(data.dates.signedDate) : undefined,
            sentDate: data.dates?.sentDate ? convertTimestamp(data.dates.sentDate) : undefined,
            renewalDate: data.dates?.renewalDate ? convertTimestamp(data.dates.renewalDate) : undefined,
            terminationDate: data.dates?.terminationDate ? convertTimestamp(data.dates.terminationDate) : undefined,
            noticePeriodDays: data.dates?.noticePeriodDays || 30,
          },
          signatories: data.signatories || [],
          attachments: data.attachments || [],
          history: data.history || [],
          reminders: data.reminders || [],
          metadata: data.metadata || {},
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          createdBy: data.createdBy || '',
        } as Contract;
      });
      callback(contracts);
    });

    return unsubscribe;
  },

  // Create contract from template
  async createFromTemplate(
    templateId: string,
    variables: Record<string, string>,
    contractData: Partial<Contract>
  ): Promise<string> {
    try {
      const template = await this.getTemplate(templateId);
      if (!template) throw new Error('Template not found');

      // Replace variables in template content body
      let bodyContent = template.content.body;
      Object.entries(variables).forEach(([key, value]) => {
        bodyContent = bodyContent.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });

      // Build sections from template, replacing variables
      const sections = template.content.sections.map((section) => ({
        ...section,
        content: Object.entries(variables).reduce(
          (acc, [key, value]) => acc.replace(new RegExp(`{{${key}}}`, 'g'), value),
          section.content
        ),
      }));

      return await this.createContract({
        title: contractData.title || template.name,
        type: template.type,
        status: 'draft',
        clientId: contractData.clientId || '',
        clientName: contractData.clientName || '',
        clientEmail: contractData.clientEmail || '',
        projectId: contractData.projectId,
        content: {
          body: bodyContent,
          variables,
          sections,
        },
        financials: {
          totalValue: contractData.financials?.totalValue || template.defaultFinancials?.totalValue || 0,
          currency: contractData.financials?.currency || template.defaultFinancials?.currency || 'EUR',
          paymentTerms: contractData.financials?.paymentTerms || template.defaultFinancials?.paymentTerms || '',
          billingSchedule: contractData.financials?.billingSchedule || template.defaultFinancials?.billingSchedule,
        },
        dates: {
          effectiveDate: contractData.dates?.effectiveDate,
          expirationDate: contractData.dates?.expirationDate,
          signedDate: contractData.dates?.signedDate,
          sentDate: contractData.dates?.sentDate,
          renewalDate: contractData.dates?.renewalDate,
          terminationDate: contractData.dates?.terminationDate,
          noticePeriodDays: contractData.dates?.noticePeriodDays || template.defaultDates?.noticePeriodDays || 30,
        },
        signatories: contractData.signatories || [],
        attachments: [],
        history: [],
        reminders: [],
        metadata: {
          version: 1,
          tags: [],
          customFields: {
            templateId,
            templateVersion: '1.0',
          },
        },
        createdBy: contractData.createdBy || '',
      });
    } catch (error) {
      console.error('Error creating contract from template:', error);
      throw error;
    }
  },
};
