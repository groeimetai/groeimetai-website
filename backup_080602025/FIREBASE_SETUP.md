# Firebase Setup Instructions

## Deploy Security Rules

### Prerequisites

1. Install Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Login to Firebase:

```bash
firebase login
```

3. Initialize Firebase in your project (if not already done):

```bash
firebase init
```

Select:

- Firestore
- Storage
- Your project: groeimetai-458417

### Deploy Rules

#### Option 1: Deploy via Firebase Console (Recommended for now)

1. **Firestore Rules:**
   - Go to [Firebase Console](https://console.firebase.google.com/project/groeimetai-458417/firestore/rules)
   - Copy the contents of `firestore.rules`
   - Paste in the rules editor
   - Click "Publish"

2. **Storage Rules:**
   - Go to [Firebase Console](https://console.firebase.google.com/project/groeimetai-458417/storage/rules)
   - Copy the contents of `storage.rules`
   - Paste in the rules editor
   - Click "Publish"

#### Option 2: Deploy via CLI

```bash
# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only Storage rules
firebase deploy --only storage:rules

# Deploy both
firebase deploy --only firestore:rules,storage:rules
```

## Enable Authentication Methods

1. Go to [Firebase Console Authentication](https://console.firebase.google.com/project/groeimetai-458417/authentication/providers)
2. Enable the following sign-in methods:
   - **Email/Password** - Required for basic authentication
   - **Google** (optional) - For social login
   - **Password reset** - Should be enabled by default with Email/Password

## Create Initial Admin User (Optional)

After deploying the rules, you may want to create an admin user:

1. Create a user through the app or Firebase Console
2. In Firestore, manually update the user document:
   ```json
   {
     "role": "admin",
     "permissions": ["all"]
   }
   ```

## Environment Variables Check

Ensure your `.env` file has all required Firebase configuration:

```env
# Client-side (all NEXT_PUBLIC_ prefixed)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

## Test the Setup

1. Try creating an account through the quote form
2. Check if the user document is created in Firestore
3. Try submitting a quote
4. Check if the quote document is created in Firestore

## Troubleshooting

### "Missing or insufficient permissions" error

- Make sure rules are published
- Check browser console for specific collection causing the error
- Verify the rules syntax in Firebase Console

### Authentication not working

- Check if Email/Password auth is enabled
- Verify API keys in .env file
- Check browser console for specific error messages

### User profile not creating

- Ensure Firestore rules allow user document creation
- Check if all required fields are being sent
- Look for errors in browser console

## Security Best Practices

1. **Never expose service account credentials** in client-side code
2. **Regularly review rules** to ensure they match your security requirements
3. **Monitor usage** in Firebase Console for unusual activity
4. **Set up Firebase App Check** for additional security (optional)
5. **Enable audit logs** for production environments
