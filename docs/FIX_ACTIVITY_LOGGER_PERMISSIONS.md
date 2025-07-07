# Fix Activity Logger Permission Errors

## Problem
Users are getting "Missing or insufficient permissions" errors when the activity logger tries to write to Firestore.

## Solution

### 1. Update Firestore Security Rules

Add these rules to your `firestore.rules` file:

```javascript
// Activity logs - write-only for authenticated users
match /activityLogs/{document=**} {
  allow read: if request.auth != null && request.auth.token.role == 'admin';
  allow write: if request.auth != null;
}

// User activity logs - users can write their own
match /userActivityLogs/{userId}/{document=**} {
  allow read: if request.auth != null && 
    (request.auth.uid == userId || request.auth.token.role == 'admin');
  allow write: if request.auth != null && request.auth.uid == userId;
}
```

### 2. Code Updates Applied

We've wrapped all activity logging calls in try-catch blocks to prevent permission errors from breaking the user experience:

```javascript
try {
  await logAuthActivity('auth.login', uid, email, data);
} catch (logError) {
  console.error('Failed to log activity:', logError);
}
```

### 3. Alternative Approach

If you don't want to store activity logs in Firestore, you can:

1. **Disable activity logging** by commenting out the imports and calls
2. **Use server-side logging** by sending logs to your API endpoints
3. **Use a third-party service** like LogRocket, Sentry, or Mixpanel

### 4. Deploy Security Rules

To deploy the updated security rules:

```bash
firebase deploy --only firestore:rules
```

### 5. Testing

After updating the rules:
1. Test user registration
2. Test user login
3. Check Firebase Console for activity logs
4. Verify no permission errors in browser console

### 6. Best Practices

- Always wrap external service calls in try-catch blocks
- Don't let logging failures break core functionality
- Consider using Cloud Functions for sensitive logging
- Implement rate limiting for activity logs to prevent abuse