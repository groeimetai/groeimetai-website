# Deploy Firebase Rules Update

## Changes Made

I've updated the Firebase security rules to fix the permission errors you were experiencing:

### New Collections Added:

1. **projectChats** - For project-specific chat conversations
2. **chats** - For general chat functionality
3. **activityLogs** - For user activity logging
4. **invoices** - For invoice management (already existed but now properly defined)

### Security Improvements:

- Added a catch-all deny rule at the end to block access to undefined collections
- Fixed permissions for all collections to ensure users can access their own data
- Added proper admin access controls

### Performance Monitoring Fix:

- Disabled automatic Firebase Performance instrumentation to prevent CSS class attribute errors
- Created a performance monitoring wrapper with attribute sanitization

## Deploy the Rules

To deploy these Firebase rules to your project:

```bash
# Deploy only the Firestore rules
firebase deploy --only firestore:rules

# Or deploy everything
firebase deploy
```

## Test the Changes

After deploying:

1. Refresh your dashboard page
2. Check if the widget preferences load without permission errors
3. Verify that activity logs are being created
4. Check that chat functionality works properly

## Important Notes

- The rules are now more restrictive with a catch-all deny rule
- Users can only access their own data (except admins who can access everything)
- Activity logs cannot be updated once created (audit trail integrity)
- Make sure to test all functionality after deploying the new rules

## If Issues Persist

If you still see permission errors after deploying:

1. Check the Firebase Console > Firestore > Rules to verify they were deployed
2. Make sure your user account has the correct role in the users collection
3. Check browser console for specific collection names that are failing
4. Verify that the user is properly authenticated

The performance monitoring errors should disappear immediately without needing deployment since that's a client-side change.
