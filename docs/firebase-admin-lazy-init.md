# Firebase Admin Lazy Initialization Fix

## Problem
Firebase Admin SDK was attempting to initialize at module level during Docker build, causing errors when environment variables were not available.

## Solution
Implemented lazy initialization pattern for Firebase Admin SDK and updated all API routes to use dynamic imports for services that depend on server-side resources.

## Changes Made

### 1. Firebase Admin SDK (`/src/lib/firebase/admin.ts`)
- Converted from immediate initialization to lazy initialization
- Added build-time detection to skip initialization during builds
- Used JavaScript Proxy objects to intercept access and initialize on-demand
- Added proper error handling for missing environment variables

### 2. Email Configuration (`/src/lib/email/config.ts`)
- Changed SMTP configuration to use getter for lazy evaluation
- Added build-time checks in `createTransporter()`
- Updated `verifyEmailConnection()` to handle null transporter

### 3. API Routes
Updated all API routes to use dynamic imports for services with server dependencies:
- `/src/app/api/invoices/[id]/send/route.ts`
- `/src/app/api/invoices/create/route.ts`
- `/src/app/api/invoices/[id]/pdf/route.ts`
- `/src/app/api/payments/create/route.ts`

### 4. Email Service (`/src/services/emailService.ts`)
- Added null check for transporter before sending emails

## Benefits
1. Docker builds no longer fail due to missing environment variables
2. Services gracefully handle missing configuration during build time
3. Runtime behavior remains unchanged - services initialize when first accessed
4. Better error messages when services are not properly configured

## Testing
The build now completes successfully without Firebase Admin initialization errors. The warning about MOLLIE_API_KEY is expected and does not prevent the build from completing.

## Future Considerations
- Consider implementing similar lazy initialization for other services that depend on environment variables
- Add health check endpoints to verify service initialization status
- Consider using environment variable validation at startup rather than build time