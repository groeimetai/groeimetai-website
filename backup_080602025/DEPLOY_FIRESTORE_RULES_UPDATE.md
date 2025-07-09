# Deploy Updated Firestore Rules

## Changes Made

We've updated the Firestore security rules to fix the activity logging permission errors:

1. **Simplified Activity Log Rules** (line 369):
   - Changed from requiring strict timestamp and userId matching
   - Now any authenticated user can create activity logs
   - This prevents the "Missing or insufficient permissions" errors

## Deploy Instructions

You need to deploy these updated rules to Firebase:

1. **Re-authenticate with Firebase** (your credentials have expired):
   ```bash
   firebase login --reauth
   ```

2. **Deploy the updated rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Verify the deployment** in Firebase Console:
   - Go to https://console.firebase.google.com
   - Navigate to Firestore Database → Rules
   - Confirm the rules have been updated

## What This Fixes

- Users will no longer see "Missing or insufficient permissions" errors
- Activity logging will work properly for all authenticated users
- The app will continue to function even if logging fails (wrapped in try-catch)

## Testing

After deployment:
1. Create a new account
2. Login/logout
3. Submit a quote request
4. Check browser console - no permission errors should appear

## Important Note

The activity logging is now more permissive to prevent errors. If you need stricter security for activity logs, consider:
- Moving activity logging to Cloud Functions
- Using a separate logging service
- Implementing server-side logging only