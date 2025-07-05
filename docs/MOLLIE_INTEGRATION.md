# Mollie Payment Integration

This document describes the Mollie payment integration implementation for invoice payments.

## Setup Instructions

### 1. Install Dependencies

The Mollie SDK has already been added to package.json:
```bash
npm install
```

### 2. Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Mollie API Key (get from https://www.mollie.com/dashboard/)
MOLLIE_API_KEY=test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Your application URL (used for redirects and webhooks)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, use your live Mollie API key and production URL:
```env
MOLLIE_API_KEY=live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. Webhook Configuration

Configure your Mollie webhook URL in the Mollie Dashboard:
- Webhook URL: `https://yourdomain.com/api/webhooks/mollie`
- The webhook will be called for all payment status changes

## Implementation Overview

### Services

1. **`/src/services/mollieService.ts`**
   - Main service for Mollie integration
   - Methods:
     - `createPayment(invoice)` - Creates a payment link
     - `getPayment(paymentId)` - Retrieves payment status
     - `handleWebhook(body)` - Processes webhook notifications

### API Routes

1. **`/api/webhooks/mollie`**
   - Handles Mollie webhook notifications
   - Updates invoice status based on payment status
   - Logs payment activities

2. **`/api/invoices/[invoiceId]/create-payment`**
   - Creates payment links for invoices
   - Checks for existing payments
   - Updates invoice with payment details

### Pages

1. **`/[locale]/payment/success`**
   - Payment success/failure page
   - Shows payment status to users
   - Provides navigation options

### Components

1. **`/components/invoice/PaymentButton.tsx`**
   - Reusable payment button component
   - Initiates payment flow
   - Shows payment status

## Usage Example

### Creating a Payment Link

```typescript
import { mollieService } from '@/services/mollieService';

// Create payment for an invoice
const payment = await mollieService.createPayment({
  id: 'invoice-123',
  customerId: 'customer-456',
  customerName: 'John Doe',
  amount: 100.00,
  currency: 'EUR',
  description: 'Invoice #123',
  items: [
    {
      description: 'Consulting services',
      quantity: 1,
      price: 100.00
    }
  ]
});

// Redirect user to payment page
window.location.href = payment.checkoutUrl;
```

### Using the Payment Button

```tsx
import { PaymentButton } from '@/components/invoice/PaymentButton';

<PaymentButton
  invoiceId={invoice.id}
  amount={invoice.totalAmount}
  currency={invoice.currency}
  status={invoice.status}
  onPaymentInitiated={() => {
    console.log('Payment initiated');
  }}
/>
```

## Payment Flow

1. **User clicks payment button**
   - Frontend calls `/api/invoices/[id]/create-payment`
   - API creates Mollie payment
   - User is redirected to Mollie checkout

2. **User completes payment**
   - Mollie redirects to `/payment/success?invoiceId=xxx`
   - Success page shows payment status

3. **Webhook notification**
   - Mollie calls `/api/webhooks/mollie`
   - Invoice status is updated
   - Activity is logged

## Testing

### Test Mode

Use Mollie test API keys for development:
- Test API keys start with `test_`
- Use test payment methods
- No real money is transferred

### Test Payment Methods

In test mode, you can use:
- **iDEAL**: Select any test bank
- **Credit Card**: Use test card numbers
  - Success: `4111 1111 1111 1111`
  - Failure: `4000 0000 0000 0002`

### Testing Webhooks

For local development, use ngrok or similar to expose your local webhook:
```bash
ngrok http 3000
```

Then update your Mollie webhook URL to the ngrok URL.

## Security Considerations

1. **API Key Security**
   - Keep API keys in environment variables
   - Never commit API keys to version control
   - Use different keys for test/production

2. **Webhook Validation**
   - Always verify payment status via API
   - Don't trust webhook data alone
   - Handle duplicate webhooks

3. **Amount Validation**
   - Verify payment amount matches invoice
   - Check currency matches expected

## Error Handling

The integration includes comprehensive error handling:
- Network errors
- Invalid payment states
- Missing configuration
- Webhook failures

All errors are logged for debugging and monitoring.

## Support

For Mollie-specific issues:
- Documentation: https://docs.mollie.com/
- Dashboard: https://www.mollie.com/dashboard/
- Support: https://www.mollie.com/contact