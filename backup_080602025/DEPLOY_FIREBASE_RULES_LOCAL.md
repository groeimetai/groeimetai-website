# Deploy Firebase Rules Locally

Since we can't deploy directly from this environment, you have two options:

## Option 1: Manual Deployment via Firebase Console (Quickest)

1. Go to [Firebase Console - Firestore Rules](https://console.firebase.google.com/project/groeimetai-458417/firestore/rules)
2. Copy the entire content of `firestore.rules`
3. Paste it into the rules editor
4. Click "Publish"

## Option 2: Local Terminal Deployment

If you have Firebase CLI installed locally:

```bash
# First, login to Firebase
firebase login

# Then deploy the rules
firebase deploy --only firestore:rules --project groeimetai-458417
```

## Option 3: Automatic Deployment (Already Set Up)

The Firebase rules will now be automatically deployed whenever you push to the main branch, as part of the GitHub Actions workflow.

## Current Rules Status

The rules have been updated to allow users to:

- Read their own projects (created via QuoteRequestForm with userId field)
- Create projects when they're the owner
- Update their own projects

This fixes the "Missing or insufficient permissions" error.
