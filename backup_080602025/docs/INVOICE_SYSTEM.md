# Invoice System Documentation

## Overview

The GroeiMetAI invoice system provides a complete invoicing solution with automated payment processing through Mollie. This document covers the entire invoice lifecycle from creation to payment.

## Architecture

### Components

1. **Invoice Service** (`/src/services/firestore/invoices.ts`)
   - Invoice CRUD operations
   - PDF generation
   - Email sending
   - Payment link generation

2. **Mollie Integration** (`/src/lib/mollie.ts`)
   - Payment creation
   - Status tracking
   - Webhook handling

3. **Email Templates** (`/src/lib/email-templates.ts`)
   - Invoice notifications
   - Payment confirmations
   - Reminder emails

4. **API Endpoints**
   - `/api/invoices` - Invoice management
   - `/api/webhooks/mollie` - Payment webhooks
   - `/api/invoices/[id]/send` - Email sending
   - `/api/invoices/[id]/payment` - Payment processing

## Invoice Flow

### 1. Quote to Invoice Conversion

```typescript
// From project detail page
const invoice = await createInvoiceFromQuote(quoteId, {
  dueDate: addDays(new Date(), 30),
  notes: 'Payment terms: 30 days',
});
```

### 2. Invoice Creation

```typescript
interface Invoice {
  id: string;
  invoiceNumber: string;
  projectId: string;
  clientId: string;

  // Financial details
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;

  // Status
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'expired';

  // Dates
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;

  // Payment
  paymentId?: string;
  paymentUrl?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. Sending Invoice

The invoice sending process:

1. Generate PDF
2. Create payment link via Mollie
3. Send email with PDF attachment
4. Update invoice status to 'sent'

```typescript
// API: POST /api/invoices/[id]/send
const response = await fetch(`/api/invoices/${invoiceId}/send`, {
  method: 'POST',
});
```

### 4. Payment Processing

#### Payment Creation

```typescript
// Mollie payment creation
const payment = await mollieClient.payments.create({
  amount: {
    currency: 'EUR',
    value: invoice.total.toFixed(2),
  },
  description: `Invoice ${invoice.invoiceNumber}`,
  redirectUrl: `${APP_URL}/invoices/${invoice.id}/thank-you`,
  webhookUrl: `${APP_URL}/api/webhooks/mollie`,
  metadata: {
    invoiceId: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
  },
});
```

#### Webhook Processing

```typescript
// API: POST /api/webhooks/mollie
// Handles payment status updates
- Verify webhook signature
- Fetch payment status from Mollie
- Update invoice status
- Send confirmation emails
- Log activity
```

## PDF Generation

### Invoice PDF Structure

The PDF includes:

- Company branding and logo
- Invoice number and dates
- Client information
- Itemized list with descriptions
- Tax calculations
- Payment instructions
- Legal information

### Customization

```typescript
// PDF generation options
const pdfOptions = {
  format: 'A4',
  margin: {
    top: '1cm',
    right: '1cm',
    bottom: '1cm',
    left: '1cm',
  },
  displayHeaderFooter: true,
  headerTemplate: '<company-header>',
  footerTemplate: '<legal-footer>',
};
```

## Email Templates

### Invoice Email

```html
Subject: Invoice ${invoiceNumber} from GroeiMetAI Dear ${clientName}, Please find attached invoice
${invoiceNumber} for ${projectName}. Amount due: €${totalAmount} Due date: ${dueDate} Pay online:
${paymentUrl} Thank you for your business!
```

### Payment Confirmation

```html
Subject: Payment Received - Invoice ${invoiceNumber} Dear ${clientName}, We've received your payment
of €${amount} for invoice ${invoiceNumber}. Transaction ID: ${transactionId} Payment Date:
${paymentDate} Thank you for your prompt payment!
```

## Payment Methods

### Supported Methods (via Mollie)

1. **iDEAL** (Netherlands)
   - Most popular Dutch payment method
   - Instant bank transfers
   - Real-time confirmation

2. **Credit Cards**
   - Visa, Mastercard, American Express
   - 3D Secure authentication
   - International payments

3. **SEPA Bank Transfer**
   - European bank transfers
   - Longer processing time
   - Lower fees

4. **PayPal**
   - International coverage
   - Buyer protection
   - Quick checkout

### Test Credentials

For development/testing:

```
# Test iDEAL
- Select any bank in test mode
- Always succeeds

# Test Credit Cards
Visa: 4000 0566 5566 5556
Mastercard: 5555 5555 5555 4444
Amex: 3782 822463 10005

# Test failures
Failed: 4000 0000 0000 0002
Expired: 4000 0000 0000 0069
```

## Status Management

### Invoice Statuses

1. **Draft**: Initial creation, not sent
2. **Sent**: Emailed to client, awaiting payment
3. **Paid**: Payment received and confirmed
4. **Overdue**: Past due date, unpaid
5. **Cancelled**: Manually cancelled

### Automatic Status Updates

- **Draft → Sent**: When email is sent
- **Sent → Paid**: When payment webhook confirms
- **Sent → Overdue**: Automated check daily
- **Any → Cancelled**: Manual action only

## Configuration

### Environment Variables

```env
# Mollie Configuration
MOLLIE_API_KEY=test_xxxxxx          # Use test_ for development
MOLLIE_WEBHOOK_SECRET=secret_xxx    # From Mollie dashboard

# Email Configuration
RESEND_API_KEY=re_xxxxxx           # Resend API key

# Application URLs
NEXT_PUBLIC_APP_URL=https://app.groeimetai.io
```

### Webhook Setup

1. **Local Development**

   ```bash
   # Use ngrok for local webhook testing
   ngrok http 3000
   # Update Mollie webhook to ngrok URL
   ```

2. **Production**
   - Set webhook URL: `https://yourdomain.com/api/webhooks/mollie`
   - Copy webhook secret to env
   - Test with Mollie webhook tester

## Security Considerations

### Payment Security

1. **Webhook Verification**
   - Verify webhook signatures
   - Validate payment IDs
   - Check amounts match

2. **Data Protection**
   - No credit card storage
   - PCI compliance via Mollie
   - Encrypted communications

3. **Access Control**
   - Admin-only invoice creation
   - Client-specific invoice access
   - Audit logging

### Best Practices

1. Always verify webhook signatures
2. Use idempotent webhook processing
3. Log all payment events
4. Implement retry logic
5. Handle edge cases (double payments, refunds)

## Troubleshooting

### Common Issues

#### 1. Webhook Not Received

**Symptoms**: Payment made but invoice not updated

**Solutions**:

- Check webhook URL configuration
- Verify firewall/security rules
- Review Mollie webhook logs
- Test with Mollie webhook tester

#### 2. PDF Generation Fails

**Symptoms**: Email sent without attachment

**Solutions**:

- Check Puppeteer installation
- Verify memory limits
- Review PDF template syntax
- Check file permissions

#### 3. Email Delivery Issues

**Symptoms**: Emails not arriving

**Solutions**:

- Verify Resend API key
- Check spam folders
- Review domain SPF/DKIM
- Monitor Resend dashboard

#### 4. Payment Status Mismatch

**Symptoms**: Mollie shows paid, invoice shows unpaid

**Solutions**:

- Manual webhook retry
- Check webhook processing logs
- Verify payment metadata
- Force status sync

### Debug Logging

Enable detailed logging:

```typescript
// In webhook handler
console.log('Webhook received:', {
  paymentId: payment.id,
  status: payment.status,
  amount: payment.amount,
  metadata: payment.metadata,
});

// In invoice service
console.log('Invoice updated:', {
  invoiceId: invoice.id,
  oldStatus: invoice.status,
  newStatus: newStatus,
});
```

## API Reference

### Create Invoice

```typescript
POST /api/invoices
Content-Type: application/json

{
  "projectId": "proj_123",
  "clientId": "client_456",
  "items": [
    {
      "description": "Consulting services",
      "quantity": 10,
      "rate": 150,
      "amount": 1500
    }
  ],
  "dueDate": "2024-02-01",
  "notes": "Payment terms: Net 30"
}
```

### Send Invoice

```typescript
POST /api/invoices/{id}/send

Response:
{
  "success": true,
  "paymentUrl": "https://www.mollie.com/checkout/...",
  "emailSent": true
}
```

### Get Invoice Status

```typescript
GET /api/invoices/{id}

Response:
{
  "id": "inv_123",
  "invoiceNumber": "INV-2024-001",
  "status": "sent",
  "paymentStatus": "pending",
  "total": 1815.00,
  "paymentUrl": "https://..."
}
```

### Webhook Handler

```typescript
POST /api/webhooks/mollie
Content-Type: application/json
X-Mollie-Signature: {signature}

{
  "id": "tr_123456"
}
```

## Testing Checklist

### Manual Testing

1. **Invoice Creation**
   - [ ] Create invoice from quote
   - [ ] Verify calculations
   - [ ] Check invoice number sequence

2. **Email Sending**
   - [ ] Send invoice email
   - [ ] Verify PDF attachment
   - [ ] Check payment link

3. **Payment Flow**
   - [ ] Click payment link
   - [ ] Complete test payment
   - [ ] Verify webhook processing
   - [ ] Check status updates

4. **Edge Cases**
   - [ ] Cancel payment mid-flow
   - [ ] Expired payment links
   - [ ] Multiple payment attempts
   - [ ] Webhook failures

### Automated Testing

```typescript
describe('Invoice System', () => {
  test('creates invoice from quote', async () => {
    const invoice = await createInvoiceFromQuote(quoteId);
    expect(invoice.status).toBe('draft');
    expect(invoice.total).toBe(quote.total);
  });

  test('processes payment webhook', async () => {
    const result = await processWebhook(mockPaymentId);
    expect(result.invoice.status).toBe('paid');
    expect(result.emailSent).toBe(true);
  });
});
```

## Maintenance

### Regular Tasks

1. **Daily**
   - Check for overdue invoices
   - Process failed webhooks
   - Monitor payment success rate

2. **Weekly**
   - Review unpaid invoices
   - Send payment reminders
   - Audit payment logs

3. **Monthly**
   - Reconcile payments
   - Generate reports
   - Archive old invoices

### Database Cleanup

```typescript
// Archive old paid invoices
const archiveOldInvoices = async () => {
  const sixMonthsAgo = subMonths(new Date(), 6);
  const invoices = await getInvoices({
    status: 'paid',
    paidDate: { $lt: sixMonthsAgo },
  });

  for (const invoice of invoices) {
    await archiveInvoice(invoice.id);
  }
};
```

## Future Enhancements

### Planned Features

1. **Recurring Invoices**
   - Subscription billing
   - Automatic generation
   - Payment retry logic

2. **Multi-currency Support**
   - Currency conversion
   - Localized payment methods
   - Exchange rate management

3. **Advanced Reporting**
   - Revenue analytics
   - Payment method analysis
   - Client payment history

4. **Integrations**
   - Accounting software sync
   - Tax calculation services
   - CRM integration

### API Improvements

1. Bulk invoice operations
2. Invoice templates
3. Custom payment terms
4. Partial payments
5. Credit notes and refunds

## Support

For technical support:

- Review error logs in Firebase Console
- Check Mollie dashboard for payment issues
- Monitor Resend for email delivery
- Contact: support@groeimetai.io
