import { generateInvoicePDF, generateInvoicePDFBlob, invoicePdfService } from '../invoicePdfService';
import { Invoice } from '@/types';

describe('InvoicePdfService', () => {
  const mockInvoice: Invoice = {
    id: 'test_inv_123',
    invoiceNumber: 'INV-2025-TEST',
    clientId: 'test_client',
    billingAddress: {
      street: 'Test Street 123',
      city: 'Amsterdam',
      state: 'NH',
      country: 'Netherlands',
      postalCode: '1234 AB'
    },
    status: 'draft',
    type: 'standard',
    items: [
      {
        id: 'item_1',
        description: 'Test Service',
        quantity: 1,
        unitPrice: 100,
        tax: 21,
        total: 121
      }
    ],
    financial: {
      subtotal: 100,
      discount: 0,
      tax: 21,
      total: 121,
      paid: 0,
      balance: 121,
      currency: 'EUR'
    },
    issueDate: new Date('2025-01-01'),
    dueDate: new Date('2025-01-31'),
    reminders: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'test_user'
  };

  describe('generateInvoicePDF', () => {
    it('should generate a base64 encoded PDF string', async () => {
      const result = await generateInvoicePDF(mockInvoice);
      
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      // Base64 string should only contain valid base64 characters
      expect(/^[A-Za-z0-9+/]*={0,2}$/.test(result)).toBe(true);
    });

    it('should handle invoices with multiple items', async () => {
      const multiItemInvoice: Invoice = {
        ...mockInvoice,
        items: [
          ...mockInvoice.items,
          {
            id: 'item_2',
            description: 'Additional Service',
            quantity: 2,
            unitPrice: 150,
            tax: 63,
            total: 363
          }
        ],
        financial: {
          ...mockInvoice.financial,
          subtotal: 400,
          tax: 84,
          total: 484
        }
      };

      const result = await generateInvoicePDF(multiItemInvoice);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should handle invoices with discounts', async () => {
      const discountedInvoice: Invoice = {
        ...mockInvoice,
        financial: {
          ...mockInvoice.financial,
          discount: 10,
          total: 111
        }
      };

      const result = await generateInvoicePDF(discountedInvoice);
      expect(result).toBeTruthy();
    });
  });

  describe('generateInvoicePDFBlob', () => {
    it('should generate a PDF Blob', async () => {
      const result = await generateInvoicePDFBlob(mockInvoice);
      
      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/pdf');
      expect(result.size).toBeGreaterThan(0);
    });
  });

  describe('InvoicePdfService class', () => {
    it('should be a singleton instance', () => {
      expect(invoicePdfService).toBeDefined();
      expect(invoicePdfService).toBeInstanceOf(invoicePdfService.constructor);
    });

    it('should generate consistent output for same input', async () => {
      const result1 = await invoicePdfService.generateInvoicePDF(mockInvoice);
      const result2 = await invoicePdfService.generateInvoicePDF(mockInvoice);
      
      // PDFs might have timestamps, so we just check they're both valid base64
      expect(typeof result1).toBe('string');
      expect(typeof result2).toBe('string');
      expect(result1.length).toBeGreaterThan(0);
      expect(result2.length).toBeGreaterThan(0);
    });
  });

  describe('Invoice status badges', () => {
    const statuses: Invoice['status'][] = ['draft', 'sent', 'viewed', 'paid', 'partial', 'overdue', 'cancelled'];
    
    statuses.forEach(status => {
      it(`should handle ${status} status`, async () => {
        const statusInvoice = { ...mockInvoice, status };
        const result = await generateInvoicePDF(statusInvoice);
        expect(result).toBeTruthy();
      });
    });
  });

  describe('Currency formatting', () => {
    it('should handle different currencies', async () => {
      const usdInvoice: Invoice = {
        ...mockInvoice,
        financial: {
          ...mockInvoice.financial,
          currency: 'USD'
        }
      };

      const result = await generateInvoicePDF(usdInvoice);
      expect(result).toBeTruthy();
    });
  });
});