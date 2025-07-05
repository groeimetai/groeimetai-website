# GroeiMetAI - AI-Powered Growth Platform

A comprehensive platform for AI-powered business growth consultations, featuring intelligent chat, quote generation, project management, and automated invoicing with payment processing.

## Features

- **AI-Powered Chat**: Real-time consultations with AI assistant
- **Quote Management**: Generate and manage professional quotes
- **Project Management**: Track projects from quote to completion
- **Invoice System**: Automated invoice generation with Mollie payment integration
- **Multi-language Support**: Full internationalization (EN/NL)
- **Admin Dashboard**: Comprehensive admin tools and analytics

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- Mollie account (for payments)
- Resend account (for emails)

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd groeimetai_multiple_agent_orchestration
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Update the following critical environment variables:

```env
# Firebase (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Mollie Payments (Required for invoicing)
MOLLIE_API_KEY=test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MOLLIE_WEBHOOK_SECRET=your-webhook-secret

# Email Service (Required)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password and Google)
3. Enable Firestore Database
4. Enable Storage
5. Add your domain to authorized domains

### 5. Mollie Payment Setup

#### Getting Started with Mollie

1. **Create a Mollie Account**
   - Sign up at [Mollie.com](https://www.mollie.com)
   - Complete business verification
   - Enable payment methods (iDEAL, Credit Card, etc.)

2. **Get API Keys**
   - Dashboard → Developers → API keys
   - Use test API key for development: `test_xxx...`
   - Use live API key for production: `live_xxx...`

3. **Configure Webhooks**
   - Dashboard → Developers → Webhooks
   - Add webhook URL: `https://yourdomain.com/api/webhooks/mollie`
   - Copy the webhook secret for `MOLLIE_WEBHOOK_SECRET`

4. **Test Payment Methods**
   - In test mode, use [Mollie test credentials](https://docs.mollie.com/overview/testing)
   - Test iDEAL: Select any bank
   - Test cards: Use `4000 0566 5566 5556` (Visa)

### 6. Email Setup with Resend

1. Sign up at [Resend.com](https://resend.com)
2. Verify your domain
3. Create an API key
4. Add to `.env.local` as `RESEND_API_KEY`

### 7. Run the development server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Testing Payment Flow

### Test Mode Setup

1. Ensure `MOLLIE_API_KEY` starts with `test_`
2. Use Mollie test payment methods
3. Webhook testing with ngrok (optional):
   ```bash
   ngrok http 3000
   # Update NEXT_PUBLIC_APP_URL with ngrok URL
   # Update Mollie webhook to ngrok URL
   ```

### Payment Flow Testing

1. **Create a Quote**
   - Navigate to Dashboard → Create Quote
   - Fill in client details and line items
   - Send quote to client

2. **Convert to Invoice**
   - From project detail page, click "Create Invoice"
   - Invoice is automatically generated
   - Email sent to client with payment link

3. **Test Payment**
   - Click payment link in email
   - Select test payment method
   - Complete payment flow
   - Invoice marked as paid automatically

## Project Structure

```
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── lib/             # Utility libraries
│   ├── services/        # Business logic services
│   ├── types/           # TypeScript types
│   └── styles/          # Global styles
├── public/              # Static assets
├── docs/                # Documentation
└── tests/               # Test files
```

## Key Features Documentation

### Invoice System

Complete invoice generation and payment processing. See [Invoice System Documentation](./docs/INVOICE_SYSTEM.md) for detailed information.

### Admin Dashboard

- User management
- Activity logs
- Workflow automation
- Analytics and reporting

### Multi-language Support

- Dutch (NL) and English (EN)
- Automatic detection based on browser
- Manual language switching

## Development Commands

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Type checking
npm run typecheck

# Linting
npm run lint

# Testing
npm run test
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## Troubleshooting

### Common Issues

1. **Payment webhook not working**
   - Check webhook URL in Mollie dashboard
   - Verify webhook secret matches
   - Check server logs for webhook calls

2. **Emails not sending**
   - Verify Resend API key
   - Check domain verification in Resend
   - Review email logs in Resend dashboard

3. **Firebase connection issues**
   - Verify all Firebase environment variables
   - Check Firebase project settings
   - Ensure authentication is enabled

### Debug Mode

Enable debug logs:
```env
DEBUG=true
```

## Support

For issues and questions:
- Check [documentation](./docs/)
- Review [invoice system guide](./docs/INVOICE_SYSTEM.md)
- Contact support at support@groeimetai.io

## License

Proprietary - All rights reserved