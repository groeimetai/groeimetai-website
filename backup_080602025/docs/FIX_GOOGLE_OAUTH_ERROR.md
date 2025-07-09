# Fix Google OAuth Error 403: org_internal

## Problem
Error: "Toegang geblokkeerd: GroeimetAI kan alleen worden gebruikt binnen de organisatie"

This happens because the Google OAuth app is set to "Internal" instead of "External".

## Solution

### 1. Change OAuth Consent Screen to External

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project: `groeimetai-458417`
3. Navigate to **APIs & Services** → **OAuth consent screen**
4. Click **EDIT APP**
5. Change **User Type** from "Internal" to "External"
6. Click **SAVE AND CONTINUE**

### 2. Update Authorized Redirect URIs

1. Go to **APIs & Services** → **Credentials**
2. Click on your OAuth 2.0 Client ID
3. Under **Authorized redirect URIs**, add:
   - `https://groeimetai.io/__/auth/handler`
   - `https://groeimetai-458417.firebaseapp.com/__/auth/handler` (keep this for backward compatibility)
4. Remove any localhost URLs for production
5. Click **SAVE**

### 3. Configure OAuth Consent Screen

While in the OAuth consent screen, ensure you have:

1. **App information**:
   - App name: GroeimetAI
   - User support email: support@groeimetai.io
   - App logo: Upload your logo

2. **App domain**:
   - Application home page: https://groeimetai.io
   - Privacy policy: https://groeimetai.io/privacy
   - Terms of service: https://groeimetai.io/terms

3. **Authorized domains**:
   - groeimetai.io
   - groeimetai-458417.firebaseapp.com

4. **Scopes**: Keep the default scopes:
   - openid
   - email
   - profile

### 4. Verification (if needed)

If Google requires verification for External apps:
1. You'll need to verify domain ownership
2. May need to submit for Google review
3. During development, you can use "Test users" to bypass verification

### 5. Update Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** → **Sign-in method**
4. Click on **Google** provider
5. Ensure the **Web SDK configuration** has the correct Client ID

### 6. Test the Fix

1. Clear browser cache/cookies
2. Try logging in with Google again
3. Should now work for all Google accounts, not just organization accounts

## Quick Fix (Temporary)

If you need a quick fix while waiting for verification:
1. In OAuth consent screen, add test users:
   - Add specific email addresses that need access
   - These users can login even while app is in testing mode

## Important Notes

- **External** means any Google user can authenticate (still secure)
- **Internal** restricts to G Suite/Workspace organization only
- Changes may take a few minutes to propagate
- Keep both redirect URIs (groeimetai.io and firebaseapp.com) for compatibility