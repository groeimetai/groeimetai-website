# Google OAuth "org_internal" Error Fix

## Problem Description

When users try to authenticate with Google OAuth, they receive an error stating that the OAuth app is restricted to organization users only (org_internal).

## Root Cause

The Google OAuth consent screen is configured with the "Internal" user type, which restricts access to users within your Google Workspace organization only.

## Solution

### Step 1: Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project from the dropdown
3. Navigate to "APIs & Services" > "OAuth consent screen"

### Step 2: Change User Type

1. Click "Edit App" on the OAuth consent screen page
2. Under "User type", you'll see it's currently set to "Internal"
3. You need to change this to "External" to allow all Google users to authenticate

### Step 3: Configure External Access

If you cannot change from Internal to External directly:

1. You may need to create a new OAuth consent screen
2. Select "External" as the user type
3. Fill in the required information:
   - App name: "Groeimet AI"
   - User support email: Your support email
   - App logo: Upload your logo
   - Application home page: https://groeimetai.com
   - Application privacy policy: https://groeimetai.com/privacy
   - Application terms of service: https://groeimetai.com/terms
   - Authorized domains: groeimetai.com
   - Developer contact information: Your contact email

### Step 4: Publishing Status

1. For testing, you can keep the app in "Testing" mode
2. Add test users who can access the app during testing
3. When ready for production, submit for verification

### Step 5: Update OAuth Credentials

1. Go to "Credentials" in the left sidebar
2. Click on your OAuth 2.0 Client ID
3. Ensure the authorized redirect URIs include:
   - https://groeimetai.com/api/auth/callback/google
   - http://localhost:3000/api/auth/callback/google (for development)

### Step 6: Verification Requirements

For production use with external users, Google may require verification if you request sensitive scopes. Basic authentication typically doesn't require verification.

## Alternative Solution: Google Workspace

If you want to keep it internal for your organization:

1. Ensure all users have Google Workspace accounts in your domain
2. Add their emails to the Google Workspace organization
3. Keep the OAuth app as "Internal"

## Environment Variables

Ensure your `.env` file has the correct OAuth credentials:

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Testing

After making changes:

1. Clear browser cookies for your domain
2. Try authenticating again
3. Monitor the browser console for any errors

## Common Issues

- **403 Error**: User not part of the organization (for Internal apps)
- **Invalid redirect URI**: Check that redirect URIs match exactly
- **Scope issues**: Ensure you're only requesting necessary scopes
